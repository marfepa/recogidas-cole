import React from 'react';
import { CheckCircle2, AlertTriangle, Users, MessageCircle } from 'lucide-react';
import { DayInfo, TimeSlot, PickupAssignment } from '../types';
import { triggerHaptic } from '../utils/dateUtils';

interface StatsViewProps {
  days: { dayInfo: DayInfo; date: Date; formattedDay: string; isToday: boolean }[];
  slots: TimeSlot[];
  assignments: PickupAssignment[];
  weekRangeText: string;
  onSelectSlot: (day: DayInfo, dateStr: string, slot: TimeSlot, assignment?: PickupAssignment) => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  days,
  slots,
  assignments,
  weekRangeText,
  onSelectSlot,
}) => {
  const totalPossible = days.length * slots.length;
  const totalAssigned = assignments.length;
  const percentage = totalPossible > 0 ? Math.round((totalAssigned / totalPossible) * 100) : 0;

  // Breakdown by person
  const caregiverCounts: Record<string, { count: number; color?: string; avatar?: string }> = {};
  assignments.forEach((a) => {
    if (!caregiverCounts[a.assigneeName]) {
      caregiverCounts[a.assigneeName] = {
        count: 0,
        color: a.assigneeColor,
        avatar: a.assigneeAvatar,
      };
    }
    caregiverCounts[a.assigneeName].count += 1;
  });

  // Pending slots list
  const pendingSlots: { dayInfo: DayInfo; formattedDay: string; slot: TimeSlot }[] = [];
  days.forEach(({ dayInfo, formattedDay }) => {
    slots.forEach((slot) => {
      const exists = assignments.some((a) => a.day === dayInfo.key && a.slotId === slot.id);
      if (!exists) {
        pendingSlots.push({ dayInfo, formattedDay, slot });
      }
    });
  });

  // Generate WhatsApp message
  const handleShareWhatsApp = () => {
    triggerHaptic('medium');
    let message = `🎒 *Recogidas Escolares - Semana ${weekRangeText}*\n\n`;
    message += `📊 *Estado:* ${totalAssigned}/${totalPossible} turnos cubiertos (${percentage}%)\n\n`;

    days.forEach(({ dayInfo, formattedDay }) => {
      message += `📅 *${dayInfo.name} (${formattedDay})*:\n`;
      slots.forEach((slot) => {
        const a = assignments.find((asg) => asg.day === dayInfo.key && asg.slotId === slot.id);
        if (a) {
          message += `  • ${slot.label} (${slot.time}): ✅ ${a.assigneeName}${a.note ? ` ("${a.note}")` : ''}\n`;
        } else {
          message += `  • ${slot.label} (${slot.time}): ⚠️ *[LIBRE - ¿Quién se apunta?]*\n`;
        }
      });
      message += '\n';
    });

    const currentUrl = window.location.href;
    message += `👉 *Apúntate en el calendario aquí:* ${currentUrl}`;

    const encoded = encodeURI(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Summary Card with Progress */}
      <div className="p-5 bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-ios-sm border border-black/5 dark:border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-ios-secondaryText dark:text-ios-darkSecondaryText">
              Cobertura de la semana
            </span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
              {percentage}% cubierto
            </h3>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-ios-blue">
              {totalAssigned} de {totalPossible}
            </span>
            <p className="text-xs text-ios-secondaryText">turnos asignados</p>
          </div>
        </div>

        {/* Apple style Progress bar */}
        <div className="w-full bg-gray-100 dark:bg-[#2C2C2E] h-3 rounded-full overflow-hidden">
          <div
            className="h-full bg-ios-blue transition-all duration-500 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Share on WhatsApp Button */}
        <button
          onClick={handleShareWhatsApp}
          className="w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm ios-pressable transition-all"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Compartir resumen en WhatsApp</span>
        </button>
      </div>

      {/* Pending Slots Alert Section */}
      {pendingSlots.length > 0 ? (
        <div className="p-4 bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-ios-sm border border-black/5 dark:border-white/5 space-y-3">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Turnos pendientes de cubrir ({pendingSlots.length})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {pendingSlots.map(({ dayInfo, formattedDay, slot }) => (
              <button
                key={`pending-${dayInfo.key}-${slot.id}`}
                onClick={() => {
                  triggerHaptic('light');
                  onSelectSlot(dayInfo, formattedDay, slot);
                }}
                className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 text-left hover:bg-amber-100/50 transition-colors ios-pressable"
              >
                <div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {dayInfo.name} ({formattedDay})
                  </span>
                  <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                    {slot.label} • {slot.time}
                  </div>
                </div>
                <span className="text-xs font-bold text-ios-blue bg-white dark:bg-[#2C2C2E] px-2 py-1 rounded-lg shadow-2xs">
                  + Asignarme
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/30 rounded-2xl flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
              ¡Todos los turnos de la semana están cubiertos!
            </h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              Los niños tienen transporte y acompañamiento garantizado para toda la semana.
            </p>
          </div>
        </div>
      )}

      {/* Caregiver Breakdown */}
      {Object.keys(caregiverCounts).length > 0 && (
        <div className="p-4 bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-ios-sm border border-black/5 dark:border-white/5 space-y-3">
          <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold text-sm">
            <Users className="w-4 h-4 text-ios-blue" />
            <span>Reparto de colaboraciones</span>
          </div>

          <div className="space-y-2">
            {Object.entries(caregiverCounts)
              .sort(([, a], [, b]) => b.count - a.count)
              .map(([name, data]) => (
                <div
                  key={name}
                  className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-[#2C2C2E]"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-2xs"
                      style={{ backgroundColor: data.color || '#007AFF' }}
                    >
                      {data.avatar || name.charAt(0)}
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {name}
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-200 dark:bg-[#3A3A3C] text-gray-700 dark:text-gray-300">
                    {data.count} {data.count === 1 ? 'recogida' : 'recogidas'}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
