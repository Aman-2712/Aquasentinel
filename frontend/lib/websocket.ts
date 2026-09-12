import { MotorCommand, MotorStatus, ConnectionState } from './types';

export class DashboardWebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectInterval: number = 2000;
  private maxReconnectInterval: number = 10000;
  private shouldReconnect: boolean = true;
  private pendingQueue: string[] = [];

  public onStatusUpdate?: (status: MotorStatus) => void;
  public onConnectionChange?: (state: ConnectionState) => void;
  public onError?: (error: string) => void;
  public onRawMessage?: (direction: 'sent' | 'received', data: string) => void;

  constructor(url?: string) {
    const defaultWsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
    this.url = (url || defaultWsUrl) + '/ws/dashboard';
  }

  public connect() {
    if (typeof window === 'undefined') return;
    this.shouldReconnect = true;

    try {
      this.onConnectionChange?.('connecting');
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.reconnectInterval = 2000;
        this.onConnectionChange?.('connected');
        // Flush queue
        while (this.pendingQueue.length > 0) {
          const msg = this.pendingQueue.shift();
          if (msg) {
            this.ws?.send(msg);
            this.onRawMessage?.('sent', msg);
          }
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const raw = event.data;
          this.onRawMessage?.('received', raw);
          const parsed = JSON.parse(raw);
          if (parsed.type === 'status') {
            this.onStatusUpdate?.(parsed as MotorStatus);
          } else if (parsed.type === 'error') {
            this.onError?.(parsed.message || 'Server error');
          }
        } catch (e) {
          console.error('Failed to parse WebSocket packet:', e);
        }
      };

      this.ws.onerror = (e) => {
        console.warn('WebSocket encountered error:', e);
        this.onConnectionChange?.('error');
      };

      this.ws.onclose = () => {
        this.onConnectionChange?.('disconnected');
        this.ws = null;
        if (this.shouldReconnect) {
          this.scheduleReconnect();
        }
      };
    } catch (err) {
      console.error('Error creating WebSocket connection:', err);
      this.onConnectionChange?.('error');
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectInterval = Math.min(this.reconnectInterval * 1.5, this.maxReconnectInterval);
      this.connect();
    }, this.reconnectInterval);
  }

  public sendCommand(cmd: MotorCommand): boolean {
    const payload = JSON.stringify(cmd);
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(payload);
      this.onRawMessage?.('sent', payload);
      return true;
    } else {
      this.pendingQueue.push(payload);
      if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
        this.connect();
      }
      return false;
    }
  }

  public disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
