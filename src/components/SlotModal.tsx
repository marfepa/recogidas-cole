import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, User, MessageSquare, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DayInfo, TimeSlot, PickupAssignment, Caregiver } from '../types';
import { triggerHaptic } from '../utils/dateUtils';
import { APPLE_COLORS } from '../utils/defaults';
import { StorageService } from '../services/storage';

interface SlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: DayInfo;
  dateStr: string;
  slot: TimeSlot;
  assignment?: PickupAssignment;
  caregivers: Caregiver[];
  onSave: (data: { assigneeName: string; assigneeColor?: string; assigneeAvatar?: string; note?: string }) => void;
  onDelete: () => void;
}

export const SlotModal: React.FC<SlotModalProps> = ({
  isOpen,
  onClose,
  day,
  dateStr,
  slot,
  assignment,
  caregivers,
  onSave,
  onDelete,
}) => {
  const [selectedName, setSelectedName] = useState('');
  const [selectedColor, setSelectedColor] = useState(APPLE_COLORS[0].hex);
  const [selectedAvatar, setSelectedAvatar] = useState('🚗');
  const [note, setNote] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Quick preset avatars for school pick-ups
  const AVATARS = ['🚗', '🎒', '🚶‍♂️', '🚲', '👨‍👩‍👧', '👵', '👨', '👩'];

  useEffect(() => {
    if (isOpen) {
      setIsConfirmingDelete(false);
      if (assignment) {
        setSelectedName(assignment.assigneeName);
        setSelectedColor(assignment.assigneeColor || APPLE_COLORS[0].hex);
        setSelectedAvatar(assignment.assigneeAvatar || '🚗');
        setNote(assignment.note || '');
      } else {
        // Pre-fill with previously saved user name or default
        const savedName = StorageService.getSavedUserName();
        setSelectedName(savedName || '');
        setSelectedColor(APPLE_COLORS[0].hex);
        setSelectedAvatar('🚗');
        setNote('');
      }
    }
  }, [isOpen, assignment]);

  if (!isOpen) return null;

  const handleSelectCaregiver = (cg: Caregiver) => {
    triggerHaptic('light');
    setSelectedName(cg.name);
    setSelectedColor(cg.color);
    setSelectedAvatar(cg.avatar);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedName.trim()) return;

    triggerHaptic('success');
    StorageService.saveUserName(selectedName.trim());

    // Celebration confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // Ignore if confetti fails
    }

    onSave({
      assigneeName: selectedName.trim(),
      assigneeColor: selectedColor,
      assigneeAvatar: selectedAvatar,
      note: note.trim() || undefined,
    });
    onClose();
  };

  const handleDelete = () => {
    triggerHaptic('warning');
    onDelete();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* iOS Backdrop with Blur */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => {
          triggerHaptic('light');
          onClose();
        }}
      />

      {/* iOS Bottom Sheet Container */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1C1C1E] rounded-t-[28px] sm:rounded-[24px] shadow-ios-sheet sm:shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-200">
        {/* iOS Grabber Handle */}
        <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-ios-blue">
                {slot.label} • {slot.time}
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {day.name}, {dateStr}
            </h3>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#2C2C2E] text-gray-500 dark:text-gray-400 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#3A3A3C] transition-colors ios-pressable"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="px-5 py-4 overflow-y-auto space-y-5 flex-1">
          {assignment && !isConfirmingDelete ? (
            /* Current assignment info */
            <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-ios-blue/20">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-sm"
                  style={{ backgroundColor: assignment.assigneeColor || '#007AFF' }}
                >
                  {assignment.assigneeAvatar || assignment.assigneeName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-gray-900 dark:text-white">
                      {assignment.assigneeName}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                      Asignado
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Registrado el {new Date(assignment.assignedAt).toLocaleDateString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {assignment.note && (
                <div className="mt-3 pt-3 border-t border-ios-blue/15 text-xs text-gray-700 dark:text-gray-300 flex items-start gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 mt-0.5 text-ios-blue flex-shrink-0" />
                  <span>Nota: {assignment.note}</span>
                </div>
              )}
            </div>
          ) : null}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quick Caregivers Selection */}
            {caregivers.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-ios-secondaryText dark:text-ios-darkSecondaryText uppercase tracking-wider mb-2">
                  Atajo rápido de cuidadores
                </label>
                <div className="flex flex-wrap gap-2">
                  {caregivers.map((cg) => {
                    const isSelected = selectedName.toLowerCase() === cg.name.toLowerCase();
                    return (
                      <button
                        key={cg.id}
                        type="button"
                        onClick={() => handleSelectCaregiver(cg)}
                        className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold transition-all ios-pressable ${
                          isSelected
                            ? 'bg-ios-blue text-white shadow-sm ring-2 ring-ios-blue ring-offset-2 dark:ring-offset-[#1C1C1E]'
                            : 'bg-gray-100 dark:bg-[#2C2C2E] text-gray-800 dark:text-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        <span>{cg.avatar}</span>
                        <span>{cg.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Name Input */}
            <div>
              <label className="block text-xs font-semibold text-ios-secondaryText dark:text-ios-darkSecondaryText uppercase tracking-wider mb-1.5">
                Nombre de quien recoge <span className="text-ios-red">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Ej: Mario, Abuela Carmen, Papá..."
                  value={selectedName}
                  onChange={(e) => setSelectedName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#2C2C2E] border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ios-blue focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Avatar & Color Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-ios-secondaryText dark:text-ios-darkSecondaryText uppercase tracking-wider mb-1.5">
                  Icono identificador
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setSelectedAvatar(av);
                      }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ios-pressable ${
                        selectedAvatar === av
                          ? 'bg-ios-blue/15 ring-2 ring-ios-blue scale-105'
                          : 'bg-gray-100 dark:bg-[#2C2C2E] hover:bg-gray-200'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ios-secondaryText dark:text-ios-darkSecondaryText uppercase tracking-wider mb-1.5">
                  Color distintivo
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {APPLE_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setSelectedColor(c.hex);
                      }}
                      className={`w-6 h-6 rounded-full transition-transform ios-pressable relative flex items-center justify-center ${
                        selectedColor === c.hex ? 'scale-125 ring-2 ring-white dark:ring-black shadow-md' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {selectedColor === c.hex && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Note Input */}
            <div>
              <label className="block text-xs font-semibold text-ios-secondaryText dark:text-ios-darkSecondaryText uppercase tracking-wider mb-1.5">
                Nota opcional (coche, quién va, etc.)
              </label>
              <input
                type="text"
                placeholder="Ej: Llevo también a Lucas • Voy en coche • Esperadme 5 min"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#2C2C2E] border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ios-blue focus:border-transparent transition-all"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={!selectedName.trim()}
                className="w-full py-3 px-4 bg-ios-blue hover:bg-blue-600 disabled:opacity-40 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-ios-sm ios-pressable transition-all"
              >
                <Check className="w-4 h-4" />
                <span>{assignment ? 'Actualizar asignación' : 'Confirmar recogida'}</span>
              </button>

              {assignment && !isConfirmingDelete && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setIsConfirmingDelete(true);
                  }}
                  className="w-full py-2.5 px-4 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 text-ios-red font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all ios-pressable"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Liberar este turno (dejar libre)</span>
                </button>
              )}

              {isConfirmingDelete && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 text-xs font-semibold text-ios-red">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>¿Seguro que quieres borrar a {assignment?.assigneeName}?</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="flex-1 py-2 bg-ios-red hover:bg-red-600 text-white font-bold text-xs rounded-lg ios-pressable"
                    >
                      Sí, liberar turno
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsConfirmingDelete(false)}
                      className="flex-1 py-2 bg-gray-200 dark:bg-[#3A3A3C] text-gray-800 dark:text-gray-200 font-semibold text-xs rounded-lg ios-pressable"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
