import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PickupAssignment, TimeSlot, Caregiver } from '../types';
import { DEFAULT_SLOTS, DEFAULT_CAREGIVERS } from '../utils/defaults';

const STORAGE_KEYS = {
  ASSIGNMENTS_PREFIX: 'recogidas_assignments_',
  SLOTS: 'recogidas_slots_v1',
  CAREGIVERS: 'recogidas_caregivers_v1',
  SUPABASE_CONFIG: 'recogidas_supabase_config_v1',
  SAVED_USER_NAME: 'recogidas_saved_user_name_v1',
};

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSupabaseConfig(): SupabaseConfig {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey };
  }

  // Check saved localStorage config
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SUPABASE_CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) return parsed;
    }
  } catch (e) {
    console.error('Error reading saved Supabase config:', e);
  }

  return { url: '', anonKey: '' };
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  localStorage.setItem(STORAGE_KEYS.SUPABASE_CONFIG, JSON.stringify(config));
  // Reload window or reset client
  window.location.reload();
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;
  const config = getSupabaseConfig();
  if (config.url && config.anonKey) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey);
      return supabaseInstance;
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
    }
  }
  return null;
}

export const StorageService = {
  // Slots
  getSlots(): TimeSlot[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SLOTS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error reading slots:', e);
    }
    return DEFAULT_SLOTS;
  },

  saveSlots(slots: TimeSlot[]): void {
    localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(slots));
  },

  // Caregivers
  getCaregivers(): Caregiver[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CAREGIVERS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error reading caregivers:', e);
    }
    return DEFAULT_CAREGIVERS;
  },

  saveCaregivers(caregivers: Caregiver[]): void {
    localStorage.setItem(STORAGE_KEYS.CAREGIVERS, JSON.stringify(caregivers));
  },

  // Remembered user name
  getSavedUserName(): string {
    return localStorage.getItem(STORAGE_KEYS.SAVED_USER_NAME) || '';
  },

  saveUserName(name: string): void {
    if (name.trim()) {
      localStorage.setItem(STORAGE_KEYS.SAVED_USER_NAME, name.trim());
    }
  },

  // Assignments
  async getAssignmentsForWeek(weekKey: string): Promise<PickupAssignment[]> {
    const supabase = getSupabaseClient();
    
    // Try Supabase first if configured
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('recogidas')
          .select('*')
          .eq('week_key', weekKey);

        if (!error && data) {
          const mapped: PickupAssignment[] = data.map((item: any) => ({
            id: item.id,
            weekKey: item.week_key,
            day: item.day,
            slotId: item.slot_id,
            assigneeName: item.assignee_name,
            assigneeColor: item.assignee_color,
            assigneeAvatar: item.assignee_avatar,
            note: item.note,
            assignedAt: item.assigned_at,
          }));
          // Cache in local storage as well for fast reload
          localStorage.setItem(`${STORAGE_KEYS.ASSIGNMENTS_PREFIX}${weekKey}`, JSON.stringify(mapped));
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local storage:', err);
      }
    }

    // LocalStorage fallback
    try {
      const stored = localStorage.getItem(`${STORAGE_KEYS.ASSIGNMENTS_PREFIX}${weekKey}`);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error reading assignments:', e);
    }
    return [];
  },

  async saveAssignment(assignment: PickupAssignment): Promise<void> {
    const supabase = getSupabaseClient();
    
    // Save to local storage first (optimistic UI)
    const weekKey = assignment.weekKey;
    const currentList = await this.getAssignmentsForWeek(weekKey);
    const filtered = currentList.filter(a => a.id !== assignment.id);
    const updated = [...filtered, assignment];
    localStorage.setItem(`${STORAGE_KEYS.ASSIGNMENTS_PREFIX}${weekKey}`, JSON.stringify(updated));

    // Sync to Supabase if connected
    if (supabase) {
      try {
        const dbRecord = {
          id: assignment.id,
          week_key: assignment.weekKey,
          day: assignment.day,
          slot_id: assignment.slotId,
          assignee_name: assignment.assigneeName,
          assignee_color: assignment.assigneeColor || null,
          assignee_avatar: assignment.assigneeAvatar || null,
          note: assignment.note || null,
          assigned_at: assignment.assignedAt,
        };

        const { error } = await supabase
          .from('recogidas')
          .upsert(dbRecord, { onConflict: 'id' });

        if (error) {
          console.error('Error saving to Supabase:', error);
        }
      } catch (err) {
        console.error('Supabase save error:', err);
      }
    }
  },

  async deleteAssignment(assignmentId: string, weekKey: string): Promise<void> {
    const supabase = getSupabaseClient();

    // Remove from local storage
    const currentList = await this.getAssignmentsForWeek(weekKey);
    const updated = currentList.filter(a => a.id !== assignmentId);
    localStorage.setItem(`${STORAGE_KEYS.ASSIGNMENTS_PREFIX}${weekKey}`, JSON.stringify(updated));

    // Remove from Supabase
    if (supabase) {
      try {
        const { error } = await supabase
          .from('recogidas')
          .delete()
          .eq('id', assignmentId);

        if (error) {
          console.error('Error deleting from Supabase:', error);
        }
      } catch (err) {
        console.error('Supabase delete error:', err);
      }
    }
  },

  /**
   * Subscribe to real-time changes
   */
  subscribeToChanges(onUpdate: () => void): () => void {
    const supabase = getSupabaseClient();
    if (!supabase) return () => {};

    const channel = supabase
      .channel('recogidas_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'recogidas' },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
