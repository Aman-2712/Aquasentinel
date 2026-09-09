import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export interface BroadcastItem {
  id: string;
  sender: string;
  area: string;
  risk: 'low' | 'medium' | 'high';
  message: string;
  timestamp: string;
  active: boolean;
  createdAt: number;
}

// Global in-memory store across requests for cross-browser, cross-tab, cross-device sync
declare global {
  // eslint-disable-next-line no-var
  var __aquaSentinelBroadcasts: BroadcastItem[] | undefined;
}

if (!globalThis.__aquaSentinelBroadcasts) {
  globalThis.__aquaSentinelBroadcasts = [
    {
      id: 'b-init-1',
      sender: 'AP State Disaster Management Authority (APSDMA)',
      area: 'Anandapuram & Pendurthi Agricultural Catchments',
      risk: 'high',
      message: 'CRITICAL INUNDATION WARNING: Cloudburst precipitation exceeding 48mm/h detected. Raise hydraulic sluice gates to prevent crop root logging.',
      timestamp: '5 mins ago',
      active: true,
      createdAt: Date.now() - 300000,
    },
    {
      id: 'b-init-2',
      sender: 'Visakhapatnam Agricultural Hydrology Board',
      area: 'North Face Paddy Basins & Sugarcane Fields',
      risk: 'high',
      message: 'SOIL SATURATION ALERT: Soil moisture at 94% threshold. Automated spillway gates calibrated to 90cm elevation for controlled water runoff.',
      timestamp: '12 mins ago',
      active: true,
      createdAt: Date.now() - 720000,
    },
    {
      id: 'b-init-3',
      sender: 'Greater Visakhapatnam Municipal Corporation (GVMC)',
      area: 'Gopalapatnam & Steel Plant Agricultural Outflow',
      risk: 'medium',
      message: 'MUNICIPAL DRAINAGE ADVISORY: High-tide coastal surge expected at 19:30 IST. Secondary drainage barriers energized.',
      timestamp: '25 mins ago',
      active: true,
      createdAt: Date.now() - 1500000,
    },
  ];
}

const getStore = () => globalThis.__aquaSentinelBroadcasts!;

export async function GET() {
  try {
    const store = getStore();

    // If Supabase is configured, attempt to fetch latest from DB as well
    if (isSupabaseConfigured) {
      try {
        const { data } = await supabase
          .from('broadcasts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (data && data.length > 0) {
          data.forEach(dbRow => {
            if (!store.some(b => b.id === dbRow.id)) {
              store.unshift({
                id: dbRow.id,
                sender: dbRow.sender || 'Visakhapatnam Disaster Management Authority',
                area: dbRow.area || 'All Sectors',
                risk: dbRow.risk || 'high',
                message: dbRow.message || '',
                timestamp: 'Just now',
                active: dbRow.active ?? true,
                createdAt: dbRow.created_at ? new Date(dbRow.created_at).getTime() : Date.now(),
              });
            }
          });
        }
      } catch (e) {
        // Fallback to in-memory store
      }
    }

    return NextResponse.json({
      success: true,
      broadcasts: store.slice(0, 15),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { area, risk, message, sender } = body;
    const store = getStore();

    const newBroadcast: BroadcastItem = {
      id: `broadcast-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      sender: sender || 'Visakhapatnam Disaster Management Authority (VDMA)',
      area: area || 'Visakhapatnam District & Agricultural Basins',
      risk: risk || 'high',
      message: message || '🚨 EMERGENCY SIREN ACTIVATED',
      timestamp: 'Just now',
      active: true,
      createdAt: Date.now(),
    };

    // Insert at front of global in-memory store
    store.unshift(newBroadcast);
    if (store.length > 30) {
      store.pop();
    }

    // Persist to Supabase if available
    if (isSupabaseConfigured) {
      try {
        await supabase.from('broadcasts').insert({
          id: newBroadcast.id,
          sender: newBroadcast.sender,
          area: newBroadcast.area,
          risk: newBroadcast.risk,
          message: newBroadcast.message,
          active: true,
        });
      } catch (err) {
        console.warn('Supabase broadcast insert error:', err);
      }
    }

    return NextResponse.json({
      success: true,
      broadcast: newBroadcast,
      broadcasts: store.slice(0, 15),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
