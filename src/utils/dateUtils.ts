import { DayInfo } from '../types';

export const DAYS_OF_WEEK: DayInfo[] = [
  { key: 'monday', name: 'Lunes', shortName: 'Lun' },
  { key: 'tuesday', name: 'Martes', shortName: 'Mar' },
  { key: 'wednesday', name: 'Miércoles', shortName: 'Mié' },
  { key: 'thursday', name: 'Jueves', shortName: 'Jue' },
  { key: 'friday', name: 'Viernes', shortName: 'Vie' },
];

/**
 * Gets the ISO week number and year string, e.g. "2026-W42"
 */
export function getWeekKey(date: Date = new Date()): string {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  const year = date.getFullYear();
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

/**
 * Returns the Monday date of the week corresponding to a given date or week offset
 */
export function getMondayOfWeek(date: Date = new Date(), weekOffset = 0): Date {
  const d = new Date(date);
  const day = d.getDay();
  // In JS: Sunday is 0, Monday is 1, etc.
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) + (weekOffset * 7);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Returns an array of dates from Monday to Friday for the week given by a Monday date
 */
export function getWeekDays(monday: Date): { dayInfo: DayInfo; date: Date; formattedDay: string; isToday: boolean }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return DAYS_OF_WEEK.map((dayInfo, index) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + index);
    const isToday = d.getTime() === today.getTime();
    const formattedDay = `${d.getDate()} ${d.toLocaleDateString('es-ES', { month: 'short' })}`;
    return {
      dayInfo,
      date: d,
      formattedDay,
      isToday
    };
  });
}

/**
 * Formats a week range, e.g. "12 – 16 de Octubre, 2026"
 */
export function formatWeekRange(monday: Date): string {
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  const startDay = monday.getDate();
  const endDay = friday.getDate();
  const startMonth = monday.toLocaleDateString('es-ES', { month: 'long' });
  const endMonth = friday.toLocaleDateString('es-ES', { month: 'long' });
  const year = friday.getFullYear();

  if (startMonth === endMonth) {
    return `${startDay} al ${endDay} de ${startMonth}, ${year}`;
  }
  return `${startDay} de ${startMonth} al ${endDay} de ${endMonth}, ${year}`;
}

/**
 * Haptic feedback trigger for iOS web feel
 */
export function triggerHaptic(type: 'light' | 'medium' | 'success' | 'warning' = 'light') {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      if (type === 'light') navigator.vibrate(10);
      else if (type === 'medium') navigator.vibrate(20);
      else if (type === 'success') navigator.vibrate([15, 40, 15]);
      else if (type === 'warning') navigator.vibrate([30, 50, 30]);
    } catch {
      // Ignore vibration errors on unsupported devices
    }
  }
}
