export type CommandType = 
  | 'motor_a_forward'
  | 'motor_a_backward'
  | 'motor_a_stop'
  | 'motor_b_forward'
  | 'motor_b_backward'
  | 'motor_b_stop'
  | 'set_motor_speed'
  | 'set_servo_angle'
  | 'forward' 
  | 'reverse' 
  | 'left' 
  | 'right' 
  | 'stop' 
  | 'set_speed' 
  | 'emergency_stop'
  | 'turn_on' 
  | 'turn_off' 
  | 'toggle' 
  | 'set_led';

export interface MotorCommand {
  command: CommandType;
  motor?: 'a' | 'b' | 'all';
  speed?: number;
  angle?: number;
  state?: boolean;
}

export interface MotorStatus {
  type: 'status';
  device: string;
  connected: boolean;
  direction?: string;
  speed?: number;
  emergency_stop: boolean;
  last_heartbeat?: string | null;
  connected_dashboards?: number;
  simulation_mode?: boolean;
  led_state?: string;
  led_on?: boolean;
  
  // Independent Motor Status
  motor_a_dir?: string;
  motor_a_speed?: number;
  motor_b_dir?: string;
  motor_b_speed?: number;
  motor_a?: string;
  motor_b?: string;

  // Servo Motor Status
  servo_angle?: number;
}

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'sent' | 'received' | 'system' | 'error';
  message: string;
}
