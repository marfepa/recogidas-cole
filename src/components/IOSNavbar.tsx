import React from 'react';
import { Settings, Share2, Moon, Sun, Backpack } from 'lucide-react';
import { triggerHaptic } from '../utils/dateUtils';
import { getSupabaseClient } from '../services/storage';

interface IOSNavbarProps {
  onOpenSettings: () => void;
  onOpenShare: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const IOSNavbar: React.FC<IOSNavbarProps> = ({
  onOpenSettings,
  onOpenShare,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const isSupabaseConnected = Boolean(getSupabaseClient());

  return (
    <header className="sticky top-0 z-40 ios-blur-nav border-b border-black/5 dark:border-white/10 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-3 pb-2.5">
        <div className="flex items-center justify-between">
          {/* App Brand / Identity */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-ios-blue to-cyan-400 text-white flex items-center justify-center shadow-md shadow-ios-blue/20">
              <Backpack className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
                Recogidas
              </h1>
              <p className="text-[11px] font-medium text-ios-secondaryText dark:text-ios-darkSecondaryText leading-none">
                Calendario escolar compartido
              </p>
            </div>
          </div>

          {/* Action Icons (Apple HIG Top Right Bar Items) */}
          <div className="flex items-center gap-1.5">
            {/* Share Button */}
            <button
              onClick={() => {
                triggerHaptic('light');
                onOpenShare();
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-black/10 dark:hover:bg-white/20 transition-colors ios-pressable"
              title="Compartir enlace"
              aria-label="Compartir"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={() => {
                triggerHaptic('light');
                onToggleDarkMode();
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-black/10 dark:hover:bg-white/20 transition-colors ios-pressable"
              title="Cambiar tema"
              aria-label="Cambiar tema"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
            </button>

            {/* Settings Button */}
            <button
              onClick={() => {
                triggerHaptic('light');
                onOpenSettings();
              }}
              className="relative w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-black/10 dark:hover:bg-white/20 transition-colors ios-pressable"
              title="Ajustes de franjas y sincronización"
              aria-label="Ajustes"
            >
              <Settings className="w-4 h-4" />
              {isSupabaseConnected && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#1C1C1E]" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
