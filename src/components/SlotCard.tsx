import React from 'react';
import { Sun, Sunset, Moon, Plus, Check, Clock, MessageSquare } from 'lucide-react';
import { TimeSlot, PickupAssignment } from '../types';
import { triggerHaptic } from '../utils/dateUtils';

interface SlotCardProps {
  slot: TimeSlot;
  assignment?: PickupAssignment;
  onClick: () => void;
  compact?: boolean;
}

export const SlotCard: React.FC<SlotCardProps> = ({
  slot,
  assignment,
  onClick,
  compact = false,
}) => {
  const isAssigned = Boolean(assignment);

  const getSlotIcon = (iconName: string) => {
    switch (iconName) {
      case 'sunset':
        return <Sunset className="w-4 h-4 text-ios-orange" />;
      case 'moon':
        return <Moon className="w-4 h-4 text-ios-indigo" />;
      case 'sun':
      default:
        return <Sun className="w-4 h-4 text-amber-500" />;
    }
  };

  const handleClick = () => {
    triggerHaptic('light');
    onClick();
  };

  if (compact) {
    // Ultra compact rendering for overview table if needed
    return (
      <button
        onClick={handleClick}
        className={`w-full text-left p-2.5 rounded-xl transition-all duration-150 ios-pressable flex flex-col justify-between min-h-[76px] ${
          isAssigned
            ? 'bg-blue-50/90 dark:bg-blue-950/30 border border-ios-blue/30 text-gray-900 dark:text-white'
            : 'bg-white dark:bg-[#2C2C2E] border border-dashed border-gray-300 dark:border-gray-700 hover:border-ios-blue/60 text-gray-500'
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
            {getSlotIcon(slot.icon)}
            <span>{slot.time}</span>
          </div>
          {isAssigned && (
            <span className="w-4 h-4 rounded-full bg-ios-blue text-white flex items-center justify-center text-[10px]">
              <Check className="w-2.5 h-2.5" />
            </span>
          )}
        </div>

        {isAssigned ? (
          <div className="mt-1">
            <div className="text-xs font-bold truncate text-ios-blue dark:text-blue-400">
              {assignment?.assigneeName}
            </div>
            {assignment?.note && (
              <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                {assignment.note}
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[11px] font-medium text-ios-blue">
            <Plus className="w-3 h-3" />
            <span>Libre</span>
          </div>
        )}
      </button>
    );
  }

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className={`group relative p-3.5 rounded-2xl transition-all duration-200 cursor-pointer ios-pressable flex flex-col justify-between ${
        isAssigned
          ? 'bg-white dark:bg-[#242426] border-2 border-ios-blue/30 dark:border-ios-blue/40 shadow-ios-sm'
          : 'bg-white/80 dark:bg-[#1E1E20] border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-ios-blue/50 hover:bg-white dark:hover:bg-[#242426]'
      }`}
    >
      {/* Header with Slot label & Time */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="p-1 rounded-md bg-gray-100 dark:bg-[#2C2C2E]">
            {getSlotIcon(slot.icon)}
          </span>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            {slot.label}
          </span>
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#2C2C2E] text-[11px] font-medium text-gray-600 dark:text-gray-400">
          <Clock className="w-3 h-3" />
          <span>{slot.time}</span>
        </div>
      </div>

      {/* Main Body */}
      {isAssigned ? (
        <div className="mt-1">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0"
              style={{
                backgroundColor: assignment?.assigneeColor || '#007AFF',
              }}
            >
              {assignment?.assigneeAvatar || assignment?.assigneeName?.charAt(0).toUpperCase() || '✓'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {assignment?.assigneeName}
                </span>
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                  <Check className="w-2.5 h-2.5" />
                </span>
              </div>
              <p className="text-[11px] text-ios-secondaryText dark:text-ios-darkSecondaryText">
                Asignado
              </p>
            </div>
          </div>

          {/* Optional Note */}
          {assignment?.note && (
            <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-white/5 flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-50/80 dark:bg-black/20 p-1.5 rounded-lg">
              <MessageSquare className="w-3.5 h-3.5 mt-0.5 text-ios-secondaryText flex-shrink-0" />
              <span className="italic line-clamp-2 leading-tight">
                {assignment.note}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="py-2.5 flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 rounded-full bg-ios-blue/10 dark:bg-ios-blue/20 text-ios-blue flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-ios-blue">
            Disponible
          </span>
          <span className="text-[10px] text-ios-secondaryText dark:text-ios-darkSecondaryText">
            Toca para asignarte
          </span>
        </div>
      )}
    </div>
  );
};
