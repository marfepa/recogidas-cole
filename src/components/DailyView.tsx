import React, { useState, useEffect } from 'react';
import { DayInfo, TimeSlot, PickupAssignment } from '../types';
import { SlotCard } from './SlotCard';
import { triggerHaptic } from '../utils/dateUtils';

interface DailyViewProps {
  days: { dayInfo: DayInfo; date: Date; formattedDay: string; isToday: boolean }[];
  slots: TimeSlot[];
  assignments: PickupAssignment[];
  onSelectSlot: (day: DayInfo, dateStr: string, slot: TimeSlot, assignment?: PickupAssignment) => void;
}

export const DailyView: React.FC<DailyViewProps> = ({
  days,
  slots,
  assignments,
  onSelectSlot,
}) => {
  // Find index of today or default to 0 (Monday)
  const todayIndex = days.findIndex((d) => d.isToday);
  const [selectedDayIndex, setSelectedDayIndex] = useState(todayIndex !== -1 ? todayIndex : 0);

  useEffect(() => {
    const idx = days.findIndex((d) => d.isToday);
    if (idx !== -1) setSelectedDayIndex(idx);
  }, [days]);

  const activeDay = days[selectedDayIndex] || days[0];

  return (
    <div className="space-y-4">
      {/* Day Selector Pills (iOS Horizontal Segmented Day Bar) */}
      <div className="grid grid-cols-5 gap-1.5 p-1.5 bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-ios-sm border border-black/5 dark:border-white/5">
        {days.map((item, index) => {
          const isSelected = selectedDayIndex === index;
          const dayAssignments = assignments.filter((a) => a.day === item.dayInfo.key);
          const allCovered = dayAssignments.length === slots.length && slots.length > 0;

          return (
            <button
              key={item.dayInfo.key}
              onClick={() => {
                triggerHaptic('light');
                setSelectedDayIndex(index);
              }}
              className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all ios-pressable relative ${
                isSelected
                  ? 'bg-ios-blue text-white shadow-sm'
                  : 'hover:bg-gray-100 dark:hover:bg-[#2C2C2E] text-gray-700 dark:text-gray-300'
              }`}
            >
              <span className={`text-[11px] font-bold uppercase ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                {item.dayInfo.shortName}
              </span>
              <span className="text-base font-extrabold mt-0.5">
                {item.date.getDate()}
              </span>

              {/* Status Dot */}
              <div className="mt-1 flex items-center gap-0.5">
                {allCovered ? (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                ) : dayAssignments.length > 0 ? (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/70' : 'bg-amber-500'}`} />
                ) : (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/40' : 'bg-gray-300 dark:bg-gray-600'}`} />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Agenda Cards */}
      <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl shadow-ios-sm border border-black/5 dark:border-white/5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/10">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {activeDay.dayInfo.name}, {activeDay.formattedDay}
            </h3>
            <p className="text-xs text-ios-secondaryText dark:text-ios-darkSecondaryText">
              {slots.length} turnos configurados para este día
            </p>
          </div>
          {activeDay.isToday && (
            <span className="px-2.5 py-1 text-xs font-bold text-ios-blue bg-ios-blue/10 rounded-full">
              Hoy
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {slots.map((slot) => {
            const assignment = assignments.find(
              (a) => a.day === activeDay.dayInfo.key && a.slotId === slot.id
            );

            return (
              <SlotCard
                key={`daily-${activeDay.dayInfo.key}-${slot.id}`}
                slot={slot}
                assignment={assignment}
                onClick={() => onSelectSlot(activeDay.dayInfo, activeDay.formattedDay, slot, assignment)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
