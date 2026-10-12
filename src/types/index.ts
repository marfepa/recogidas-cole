export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

export interface DayInfo {
  key: DayOfWeek;
  name: string;
  shortName: string;
}

export interface TimeSlot {
  id: string;
  label: string; // e.g. "Mediodía", "Tarde", "Extraescolar"
  time: string;  // e.g. "14:00", "16:30"
  icon: 'sun' | 'sunset' | 'moon' | 'star' | 'bus';
  color: string; // Apple tint color class / hex
  description?: string;
}

export interface PickupAssignment {
  id: string; // Composite key: ${weekKey}_${day}_${slotId}
  weekKey: string; // e.g. "2026-W42"
  day: DayOfWeek;
  slotId: string;
  assigneeName: string;
  assigneeColor?: string;
  assigneeAvatar?: string;
  note?: string;
  assignedAt: string; // ISO date string
}

export interface Caregiver {
  id: string;
  name: string;
  color: string;
  avatar: string;
  role: string; // "Papá", "Mamá", "Abuelo/a", "Tío/a", "Amigo/a"
}

export interface WeekStats {
  totalSlots: number;
  assignedSlots: number;
  freeSlots: number;
  percentage: number;
}
