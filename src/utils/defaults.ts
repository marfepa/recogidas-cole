import { TimeSlot, Caregiver } from '../types';

export const DEFAULT_SLOTS: TimeSlot[] = [
  {
    id: 'mediodia',
    label: 'Mediodía',
    time: '14:00',
    icon: 'sun',
    color: '#FF9500', // Apple Orange
    description: 'Salida de comedor / fin de mañana',
  },
  {
    id: 'tarde',
    label: 'Tarde',
    time: '16:30',
    icon: 'sunset',
    color: '#007AFF', // Apple Blue
    description: 'Salida habitual de la tarde / extraescolares',
  },
];

export const APPLE_COLORS = [
  { name: 'Azul', hex: '#007AFF', bgClass: 'bg-blue-500', textClass: 'text-blue-500' },
  { name: 'Naranja', hex: '#FF9500', bgClass: 'bg-amber-500', textClass: 'text-amber-500' },
  { name: 'Verde', hex: '#34C759', bgClass: 'bg-emerald-500', textClass: 'text-emerald-500' },
  { name: 'Morado', hex: '#AF52DE', bgClass: 'bg-purple-500', textClass: 'text-purple-500' },
  { name: 'Rosa', hex: '#FF2D55', bgClass: 'bg-pink-500', textClass: 'text-pink-500' },
  { name: 'Añil', hex: '#5856D6', bgClass: 'bg-indigo-500', textClass: 'text-indigo-500' },
  { name: 'Cian', hex: '#32ADE6', bgClass: 'bg-sky-500', textClass: 'text-sky-500' },
  { name: 'Menta', hex: '#00C7BE', bgClass: 'bg-teal-500', textClass: 'text-teal-500' },
];

export const DEFAULT_CAREGIVERS: Caregiver[] = [
  { id: '1', name: 'Mamá', color: '#007AFF', avatar: '👩', role: 'Familia' },
  { id: '2', name: 'Papá', color: '#34C759', avatar: '👨', role: 'Familia' },
  { id: '3', name: 'Abuelos', color: '#FF9500', avatar: '👵', role: 'Abuelos' },
  { id: '4', name: 'Tíos', color: '#AF52DE', avatar: '🧑', role: 'Familia' },
];
