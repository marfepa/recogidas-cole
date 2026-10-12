import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, Sparkles } from 'lucide-react';
import { formatWeekRange, triggerHaptic } from '../utils/dateUtils';

interface WeekNavigatorProps {
  monday: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onCurrentWeek: () => void;
  isCurrentWeek: boolean;
}

export const WeekNavigator: React.FC<WeekNavigatorProps> = ({
  monday,
  onPrevWeek,
  onNextWeek,
  onCurrentWeek,
  isCurrentWeek,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#1C1C1E] p-3 sm:p-4 rounded-2xl shadow-ios-sm border border-black/5 dark:border-white/5">
      {/* Week Title & Range */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-ios-blue/10 dark:bg-ios-blue/20 text-ios-blue flex items-center justify-center font-semibold">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-ios-secondaryText dark:text-ios-darkSecondaryText">
              Semana
            </span>
            {isCurrentWeek && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" /> Esta semana
              </span>
            )}
          </div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white capitalize">
            {formatWeekRange(monday)}
          </h2>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-1.5 self-end sm:self-center">
        {!isCurrentWeek && (
          <button
            onClick={() => {
              triggerHaptic('light');
              onCurrentWeek();
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-full bg-ios-blue/10 text-ios-blue hover:bg-ios-blue/20 transition-colors ios-pressable mr-1"
          >
            Ir a hoy
          </button>
        )}

        <button
          onClick={() => {
            triggerHaptic('light');
            onPrevWeek();
          }}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 dark:bg-[#2C2C2E] text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#3A3A3C] transition-colors ios-pressable"
          title="Semana anterior"
          aria-label="Semana anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            triggerHaptic('light');
            onNextWeek();
          }}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 dark:bg-[#2C2C2E] text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#3A3A3C] transition-colors ios-pressable"
          title="Semana siguiente"
          aria-label="Semana siguiente"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
