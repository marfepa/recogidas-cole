import React from 'react';
import { DayInfo, TimeSlot, PickupAssignment } from '../types';
import { SlotCard } from './SlotCard';

interface WeeklyGridProps {
  days: { dayInfo: DayInfo; date: Date; formattedDay: string; isToday: boolean }[];
  slots: TimeSlot[];
  assignments: PickupAssignment[];
  onSelectSlot: (day: DayInfo, dateStr: string, slot: TimeSlot, assignment?: PickupAssignment) => void;
}

export const WeeklyGrid: React.FC<WeeklyGridProps> = ({
  days,
  slots,
  assignments,
  onSelectSlot,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      {days.map(({ dayInfo, formattedDay, isToday }) => {
        return (
          <div
            key={dayInfo.key}
            className={`flex flex-col rounded-2xl p-3 sm:p-3.5 transition-all ${
              isToday
                ? 'bg-blue-50/60 dark:bg-blue-950/20 ring-2 ring-ios-blue/40 shadow-sm'
                : 'bg-white dark:bg-[#1C1C1E] shadow-ios-sm border border-black/5 dark:border-white/5'
            }`}
          >
            {/* Day Column Header */}
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-gray-100 dark:border-white/10">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs uppercase font-extrabold tracking-wider text-gray-500 dark:text-gray-400">
                    {dayInfo.name}
                  </span>
                  {isToday && (
                    <span className="inline-block w-2 h-2 rounded-full bg-ios-blue animate-pulse" />
                  )}
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {formattedDay}
                </span>
              </div>

              {isToday && (
                <span className="text-[11px] font-bold text-ios-blue bg-ios-blue/10 dark:bg-ios-blue/20 px-2 py-0.5 rounded-full">
                  Hoy
                </span>
              )}
            </div>

            {/* Slots for this day */}
            <div className="space-y-2.5 flex-1 flex flex-col justify-start">
              {slots.map((slot) => {
                const assignment = assignments.find(
                  (a) => a.day === dayInfo.key && a.slotId === slot.id
                );

                return (
                  <SlotCard
                    key={`${dayInfo.key}-${slot.id}`}
                    slot={slot}
                    assignment={assignment}
                    onClick={() => onSelectSlot(dayInfo, formattedDay, slot, assignment)}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
