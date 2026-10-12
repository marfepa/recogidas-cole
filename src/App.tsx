import { useState, useEffect, useCallback } from 'react';
import { IOSNavbar } from './components/IOSNavbar';
import { IOSSegmentedControl } from './components/IOSSegmentedControl';
import { WeekNavigator } from './components/WeekNavigator';
import { WeeklyGrid } from './components/WeeklyGrid';
import { DailyView } from './components/DailyView';
import { StatsView } from './components/StatsView';
import { SlotModal } from './components/SlotModal';
import { SettingsModal } from './components/SettingsModal';
import { TimeSlot, DayInfo, PickupAssignment, Caregiver } from './types';
import { getMondayOfWeek, getWeekKey, getWeekDays, formatWeekRange, triggerHaptic } from './utils/dateUtils';
import { StorageService, getSupabaseClient } from './services/storage';
import { Calendar, List, BarChart3, CloudOff } from 'lucide-react';

export function App() {
  // Week navigation state
  const [weekOffset, setWeekOffset] = useState(0);
  const monday = getMondayOfWeek(new Date(), weekOffset);
  const weekKey = getWeekKey(monday);
  const weekDays = getWeekDays(monday);
  const weekRangeText = formatWeekRange(monday);
  const isCurrentWeek = weekOffset === 0;

  // Active view
  const [activeView, setActiveView] = useState<'weekly' | 'daily' | 'stats'>('weekly');

  // App data state
  const [slots, setSlots] = useState<TimeSlot[]>(StorageService.getSlots());
  const [caregivers, setCaregivers] = useState<Caregiver[]>(StorageService.getCaregivers());
  const [assignments, setAssignments] = useState<PickupAssignment[]>([]);

  // Selected slot for modal
  const [modalSlot, setModalSlot] = useState<{
    day: DayInfo;
    dateStr: string;
    slot: TimeSlot;
    assignment?: PickupAssignment;
  } | null>(null);

  // Settings modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('recogidas_theme') === 'dark' ||
        (!('recogidas_theme' in localStorage) &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
      );
    }
    return false;
  });

  // Apply dark mode class to root HTML
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('recogidas_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('recogidas_theme', 'light');
    }
  }, [isDarkMode]);

  // Load assignments for current week
  const loadWeekAssignments = useCallback(async () => {
    try {
      const data = await StorageService.getAssignmentsForWeek(weekKey);
      setAssignments(data);
    } catch (e) {
      console.error('Error loading assignments:', e);
    }
  }, [weekKey]);

  useEffect(() => {
    loadWeekAssignments();
  }, [loadWeekAssignments]);

  // Subscribe to real-time changes
  useEffect(() => {
    const unsubscribe = StorageService.subscribeToChanges(() => {
      loadWeekAssignments();
    });
    return () => {
      unsubscribe();
    };
  }, [loadWeekAssignments]);

  // Slot modal handlers
  const handleOpenSlot = (day: DayInfo, dateStr: string, slot: TimeSlot, assignment?: PickupAssignment) => {
    setModalSlot({ day, dateStr, slot, assignment });
  };

  const handleSaveAssignment = async (data: {
    assigneeName: string;
    assigneeColor?: string;
    assigneeAvatar?: string;
    note?: string;
  }) => {
    if (!modalSlot) return;

    const newAssignment: PickupAssignment = {
      id: `${weekKey}_${modalSlot.day.key}_${modalSlot.slot.id}`,
      weekKey,
      day: modalSlot.day.key,
      slotId: modalSlot.slot.id,
      assigneeName: data.assigneeName,
      assigneeColor: data.assigneeColor,
      assigneeAvatar: data.assigneeAvatar,
      note: data.note,
      assignedAt: new Date().toISOString(),
    };

    await StorageService.saveAssignment(newAssignment);
    await loadWeekAssignments();
  };

  const handleDeleteAssignment = async () => {
    if (!modalSlot || !modalSlot.assignment) return;
    await StorageService.deleteAssignment(modalSlot.assignment.id, weekKey);
    await loadWeekAssignments();
  };

  // Slot config updates
  const handleUpdateSlots = (newSlots: TimeSlot[]) => {
    setSlots(newSlots);
    StorageService.saveSlots(newSlots);
  };

  const handleUpdateCaregivers = (newCaregivers: Caregiver[]) => {
    setCaregivers(newCaregivers);
    StorageService.saveCaregivers(newCaregivers);
  };

  const isSupabaseConnected = Boolean(getSupabaseClient());

  return (
    <div className="min-h-full flex flex-col bg-ios-bg dark:bg-ios-darkBg text-ios-text dark:text-ios-darkText transition-colors">
      {/* iOS Top Navbar */}
      <IOSNavbar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenShare={() => setIsSettingsOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => {
          triggerHaptic('light');
          setIsDarkMode((prev) => !prev);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3.5 sm:px-6 py-4 space-y-4">
        {/* Supabase status notice if running offline */}
        {!isSupabaseConnected && (
          <div className="px-3.5 py-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/40 rounded-2xl flex items-center justify-between text-xs text-amber-900 dark:text-amber-300">
            <div className="flex items-center gap-2">
              <CloudOff className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                <strong>Modo Demo Local:</strong> Los datos se guardan en tu navegador. Conecta Supabase en Ajustes para sincronizar en vivo con los demás.
              </span>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="font-bold underline text-amber-800 dark:text-amber-200 ml-2 whitespace-nowrap ios-pressable"
            >
              Conectar
            </button>
          </div>
        )}

        {/* Week Navigator */}
        <WeekNavigator
          monday={monday}
          onPrevWeek={() => setWeekOffset((prev) => prev - 1)}
          onNextWeek={() => setWeekOffset((prev) => prev + 1)}
          onCurrentWeek={() => setWeekOffset(0)}
          isCurrentWeek={isCurrentWeek}
        />

        {/* View Switcher: iOS Segmented Control */}
        <div className="flex justify-center">
          <IOSSegmentedControl
            options={[
              { id: 'weekly', label: 'Semana', icon: <Calendar className="w-3.5 h-3.5" /> },
              { id: 'daily', label: 'Día a Día', icon: <List className="w-3.5 h-3.5" /> },
              { id: 'stats', label: 'Resumen', icon: <BarChart3 className="w-3.5 h-3.5" /> },
            ]}
            selectedId={activeView}
            onChange={(id) => setActiveView(id as 'weekly' | 'daily' | 'stats')}
            className="w-full sm:w-80 max-w-md"
          />
        </div>

        {/* Active View Container */}
        <div className="transition-opacity duration-200">
          {activeView === 'weekly' && (
            <WeeklyGrid
              days={weekDays}
              slots={slots}
              assignments={assignments}
              onSelectSlot={handleOpenSlot}
            />
          )}

          {activeView === 'daily' && (
            <DailyView
              days={weekDays}
              slots={slots}
              assignments={assignments}
              onSelectSlot={handleOpenSlot}
            />
          )}

          {activeView === 'stats' && (
            <StatsView
              days={weekDays}
              slots={slots}
              assignments={assignments}
              weekRangeText={weekRangeText}
              onSelectSlot={handleOpenSlot}
            />
          )}
        </div>
      </main>

      {/* iOS Footer / Safe Area Spacing */}
      <footer className="py-6 px-4 text-center text-xs text-ios-secondaryText dark:text-ios-darkSecondaryText pb-safe">
        <p className="flex items-center justify-center gap-1.5">
          <span>Diseñado con Apple Human Interface Guidelines</span>
          <span>•</span>
          <span className="font-semibold text-gray-600 dark:text-gray-400">Recogidas Cole</span>
        </p>
      </footer>

      {/* Slot Modal (Bottom Sheet) */}
      {modalSlot && (
        <SlotModal
          isOpen={Boolean(modalSlot)}
          onClose={() => setModalSlot(null)}
          day={modalSlot.day}
          dateStr={modalSlot.dateStr}
          slot={modalSlot.slot}
          assignment={modalSlot.assignment}
          caregivers={caregivers}
          onSave={handleSaveAssignment}
          onDelete={handleDeleteAssignment}
        />
      )}

      {/* Settings & Configuration Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        slots={slots}
        onUpdateSlots={handleUpdateSlots}
        caregivers={caregivers}
        onUpdateCaregivers={handleUpdateCaregivers}
      />
    </div>
  );
}

export default App;
