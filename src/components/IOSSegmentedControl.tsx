import React from 'react';
import { triggerHaptic } from '../utils/dateUtils';

interface SegmentOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface IOSSegmentedControlProps {
  options: SegmentOption[];
  selectedId: string;
  onChange: (id: string) => void;
  className?: string;
}

export const IOSSegmentedControl: React.FC<IOSSegmentedControlProps> = ({
  options,
  selectedId,
  onChange,
  className = '',
}) => {
  return (
    <div
      className={`relative flex items-center p-1 bg-[#767680]/15 dark:bg-[#767680]/30 rounded-full backdrop-blur-md ${className}`}
      role="tablist"
    >
      {options.map((option) => {
        const isSelected = selectedId === option.id;
        return (
          <button
            key={option.id}
            role="tab"
            aria-selected={isSelected}
            onClick={() => {
              triggerHaptic('light');
              onChange(option.id);
            }}
            className={`relative flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs sm:text-sm font-medium transition-all duration-200 rounded-full ios-pressable ${
              isSelected
                ? 'bg-white dark:bg-[#636366] text-black dark:text-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] font-semibold'
                : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white'
            }`}
          >
            {option.icon && <span className="text-sm">{option.icon}</span>}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};
