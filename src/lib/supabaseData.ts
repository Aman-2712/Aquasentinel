import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

// ========================================
// SQL SCHEMA — Run in Supabase SQL Editor
// ========================================
export const SCHEMA_SQL = `
-- Incidents table (with optional photo as base64 text)
CREATE TABLE IF NOT EXISTS incidents (
  id TEXT PRIMARY KEY,
  area TEXT NOT NULL,
  type TEXT NOT NULL,
  severity TEXT NOT NULL,
  description TEXT NOT NULL,
  photo TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id TEXT PRIMARY KEY,
  author TEXT NOT NULL,
  role TEXT NOT NULL,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Broadcasts table
CREATE TABLE IF NOT EXISTS broadcasts (
  id TEXT PRIMARY KEY,
  sender TEXT NOT NULL DEFAULT 'Visakhapatnam Disaster Management Authority (VDMA)',
  area TEXT NOT NULL,
  risk TEXT NOT NULL,
  message TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Field shield state table
CREATE TABLE IF NOT EXISTS field_shields (
  id TEXT PRIMARY KEY,
  shield_status TEXT NOT NULL DEFAULT 'idle',
  last_action TEXT,
  water_level INTEGER
);

-- Enable RLS (optional, set policies as needed)
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_shields ENABLE ROW LEVEL SECURITY;

-- Allow anon full access (for demo; tighten in production)
CREATE POLICY "anon_all" ON incidents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON complaints FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON broadcasts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON field_shields FOR ALL USING (true) WITH CHECK (true);
`;

// ========================================
// INCIDENTS
// ========================================
export async function fetchIncidents() {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data?.map(row => ({
      id: row.id,
      area: row.area,
      type: row.type,
      severity: row.severity,
      desc: row.description,
      time: timeAgo(row.created_at),
      status: row.status,
      photo: row.photo || undefined,
    })) || null;
  } catch {
    return null;
  }
}

export async function insertIncident(incident: {
  id: string; area: string; type: string; severity: string;
  desc: string; status: string; photo?: string;
}) {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('incidents').insert({
      id: incident.id,
      area: incident.area,
      type: incident.type,
      severity: incident.severity,
      description: incident.desc,
      photo: incident.photo || null,
      status: incident.status,
    });
  } catch { /* silent */ }
}

// ========================================
// COMPLAINTS
// ========================================
export async function fetchComplaints() {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data?.map(row => ({
      id: row.id,
      author: row.author,
      role: row.role,
      location: row.location,
      category: row.category,
      description: row.description,
      timestamp: timeAgo(row.created_at),
      status: row.status,
    })) || null;
  } catch {
    return null;
  }
}

export async function updateComplaintStatus(id: string, status: string) {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('complaints').update({ status }).eq('id', id);
  } catch { /* silent */ }
}

// ========================================
// BROADCASTS
// ========================================
export async function fetchBroadcasts() {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('broadcasts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    return data?.map(row => ({
      id: row.id,
      sender: row.sender,
      area: row.area,
      risk: row.risk,
      message: row.message,
      timestamp: timeAgo(row.created_at),
      active: row.active,
    })) || null;
  } catch {
    return null;
  }
}

export async function insertBroadcast(broadcast: {
  id: string; area: string; risk: string; message: string;
}) {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('broadcasts').insert({
      id: broadcast.id,
      area: broadcast.area,
      risk: broadcast.risk,
      message: broadcast.message,
      active: true,
    });
  } catch { /* silent */ }
}

export async function deleteBroadcast(id: string) {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('broadcasts').delete().eq('id', id);
  } catch { /* silent */ }
}

// ========================================
// FIELD SHIELDS
// ========================================
export async function updateFieldShieldState(id: string, shieldStatus: string, lastAction: string, waterLevel: number) {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('field_shields').upsert({
      id, shield_status: shieldStatus, last_action: lastAction, water_level: waterLevel,
    });
  } catch { /* silent */ }
}

// ========================================
// HELPERS
// ========================================
function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}
