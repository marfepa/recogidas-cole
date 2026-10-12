import React, { useState } from 'react';
import { X, Clock, Database, Plus, Trash2, Check, Copy, Share2 } from 'lucide-react';
import { TimeSlot, Caregiver } from '../types';
import { triggerHaptic } from '../utils/dateUtils';
import { APPLE_COLORS } from '../utils/defaults';
import { getSupabaseConfig, saveSupabaseConfig, getSupabaseClient } from '../services/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  slots: TimeSlot[];
  onUpdateSlots: (slots: TimeSlot[]) => void;
  caregivers: Caregiver[];
  onUpdateCaregivers: (caregivers: Caregiver[]) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  slots,
  onUpdateSlots,
  caregivers,
  onUpdateCaregivers,
}) => {
  const [activeTab, setActiveTab] = useState<'slots' | 'caregivers' | 'supabase' | 'share'>('slots');
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // New slot form state
  const [newSlotLabel, setNewSlotLabel] = useState('');
  const [newSlotTime, setNewSlotTime] = useState('');
  const [newSlotIcon, setNewSlotIcon] = useState<'sun' | 'sunset' | 'moon'>('sun');

  // New caregiver form state
  const [newCgName, setNewCgName] = useState('');
  const [newCgAvatar, setNewCgAvatar] = useState('🚗');
  const [newCgColor, setNewCgColor] = useState(APPLE_COLORS[0].hex);

  // Supabase config state
  const [supabaseConfig, setSupabaseForm] = useState(getSupabaseConfig());
  const isSupabaseConnected = Boolean(getSupabaseClient());

  if (!isOpen) return null;

  const sqlSchema = `-- Ejecuta esto en el SQL Editor de tu proyecto en Supabase (supabase.com):
create table if not exists recogidas (
  id text primary key,
  week_key text not null,
  day text not null,
  slot_id text not null,
  assignee_name text not null,
  assignee_color text,
  assignee_avatar text,
  note text,
  assigned_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar permisos públicos para que la familia pueda ver y apuntarse
alter table recogidas enable row level security;
create policy "Acceso publico lectura y escritura" on recogidas for all using (true) with check (true);

-- Habilitar sincronización en tiempo real
alter publication supabase_realtime add table recogidas;
`;

  const handleCopySql = () => {
    triggerHaptic('success');
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleCopyLink = () => {
    triggerHaptic('success');
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotLabel.trim() || !newSlotTime.trim()) return;

    triggerHaptic('success');
    const newSlot: TimeSlot = {
      id: `slot_${Date.now()}`,
      label: newSlotLabel.trim(),
      time: newSlotTime.trim(),
      icon: newSlotIcon,
      color: '#007AFF',
    };

    onUpdateSlots([...slots, newSlot]);
    setNewSlotLabel('');
    setNewSlotTime('');
  };

  const handleDeleteSlot = (id: string) => {
    triggerHaptic('warning');
    if (slots.length <= 1) {
      alert('Debe haber al menos un hueco de recogida configurado.');
      return;
    }
    onUpdateSlots(slots.filter((s) => s.id !== id));
  };

  const handleAddCaregiver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCgName.trim()) return;

    triggerHaptic('success');
    const newCg: Caregiver = {
      id: `cg_${Date.now()}`,
      name: newCgName.trim(),
      avatar: newCgAvatar,
      color: newCgColor,
      role: 'Familia',
    };

    onUpdateCaregivers([...caregivers, newCg]);
    setNewCgName('');
  };

  const handleDeleteCaregiver = (id: string) => {
    triggerHaptic('warning');
    onUpdateCaregivers(caregivers.filter((c) => c.id !== id));
  };

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('success');
    saveSupabaseConfig(supabaseConfig);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => {
          triggerHaptic('light');
          onClose();
        }}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white dark:bg-[#1C1C1E] rounded-t-[28px] sm:rounded-[24px] shadow-ios-sheet sm:shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-200">
        {/* Grabber Handle */}
        <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Ajustes de la Aplicación
            </h3>
            <p className="text-xs text-ios-secondaryText dark:text-ios-darkSecondaryText">
              Configura horarios, miembros y sincronización
            </p>
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

        {/* Navigation Tabs (iOS segmented) */}
        <div className="px-5 pt-3">
          <div className="flex p-1 bg-gray-100 dark:bg-[#2C2C2E] rounded-xl gap-1">
            <button
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('slots');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'slots'
                  ? 'bg-white dark:bg-[#3A3A3C] text-black dark:text-white shadow-2xs'
                  : 'text-gray-500 hover:text-black dark:hover:text-white'
              }`}
            >
              Horarios
            </button>
            <button
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('caregivers');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'caregivers'
                  ? 'bg-white dark:bg-[#3A3A3C] text-black dark:text-white shadow-2xs'
                  : 'text-gray-500 hover:text-black dark:hover:text-white'
              }`}
            >
              Familiares
            </button>
            <button
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('supabase');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeTab === 'supabase'
                  ? 'bg-white dark:bg-[#3A3A3C] text-black dark:text-white shadow-2xs'
                  : 'text-gray-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <span>Nube Realtime</span>
              {isSupabaseConnected && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </button>
            <button
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('share');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'share'
                  ? 'bg-white dark:bg-[#3A3A3C] text-black dark:text-white shadow-2xs'
                  : 'text-gray-500 hover:text-black dark:hover:text-white'
              }`}
            >
              Compartir
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-5 py-4 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: SLOTS */}
          {activeTab === 'slots' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-ios-secondaryText">
                  Huecos semanales activos ({slots.length})
                </span>
                <div className="space-y-2">
                  {slots.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#2C2C2E] border border-gray-100 dark:border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-ios-blue/10 text-ios-blue flex items-center justify-center font-bold text-xs">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 dark:text-white">
                            {s.label}
                          </div>
                          <div className="text-xs text-ios-secondaryText">
                            Hora: {s.time}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteSlot(s.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-ios-red hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Eliminar este hueco"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Slot */}
              <form onSubmit={handleAddSlot} className="p-3.5 bg-gray-50 dark:bg-[#2C2C2E] rounded-2xl space-y-3">
                <span className="text-xs font-bold text-gray-900 dark:text-white block">
                  + Añadir nuevo hueco / franja horaria
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Nombre (ej. Extraescolares)"
                    value={newSlotLabel}
                    onChange={(e) => setNewSlotLabel(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Hora (ej. 17:30)"
                    value={newSlotTime}
                    onChange={(e) => setNewSlotTime(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500 text-[11px]">Icono:</span>
                  {(['sun', 'sunset', 'moon'] as const).map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setNewSlotIcon(ic)}
                      className={`px-2 py-1 rounded-lg text-xs capitalize ${
                        newSlotIcon === ic
                          ? 'bg-ios-blue text-white font-bold'
                          : 'bg-white dark:bg-[#1C1C1E] text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {ic === 'sun' ? '☀️ Mañana' : ic === 'sunset' ? '🌅 Tarde' : '🌙 Noche'}
                    </button>
                  ))}
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-ios-blue hover:bg-blue-600 text-white font-bold text-xs rounded-xl ios-pressable transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Guardar nuevo hueco</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: CAREGIVERS */}
          {activeTab === 'caregivers' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-ios-secondaryText">
                  Cuidadores frecuentes
                </span>
                <div className="space-y-2">
                  {caregivers.map((cg) => (
                    <div
                      key={cg.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-[#2C2C2E]"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: cg.color }}
                        >
                          {cg.avatar}
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {cg.name}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteCaregiver(cg.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-ios-red transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Caregiver */}
              <form onSubmit={handleAddCaregiver} className="p-3.5 bg-gray-50 dark:bg-[#2C2C2E] rounded-2xl space-y-3">
                <span className="text-xs font-bold text-gray-900 dark:text-white block">
                  + Añadir familiar / cuidador rápido
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Nombre (ej. Abuelo Pedro)"
                    value={newCgName}
                    onChange={(e) => setNewCgName(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium"
                  />
                  <input
                    type="text"
                    maxLength={2}
                    value={newCgAvatar}
                    onChange={(e) => setNewCgAvatar(e.target.value)}
                    className="w-12 text-center py-2 bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-xl text-sm"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  {APPLE_COLORS.slice(0, 6).map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setNewCgColor(c.hex)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        newCgColor === c.hex ? 'scale-125 ring-2 ring-ios-blue' : 'opacity-70'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-ios-blue hover:bg-blue-600 text-white font-bold text-xs rounded-xl ios-pressable transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Guardar familiar</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: SUPABASE REALTIME */}
          {activeTab === 'supabase' && (
            <div className="space-y-4">
              {/* Status Banner */}
              <div
                className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
                  isSupabaseConnected
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 text-emerald-900 dark:text-emerald-300'
                    : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 text-amber-900 dark:text-amber-300'
                }`}
              >
                <Database className="w-5 h-5 flex-shrink-0" />
                <div className="text-xs">
                  <div className="font-bold">
                    {isSupabaseConnected
                      ? 'Conectado a Supabase en tiempo real'
                      : 'Modo Local / Demo activo'}
                  </div>
                  <p className="mt-0.5 opacity-90">
                    {isSupabaseConnected
                      ? 'Todos los cambios se sincronizan en vivo entre los móviles de los padres.'
                      : 'Puedes probar la app ya mismo con almacenamiento local. Conecta tu proyecto de Supabase para sincronizar entre varios dispositivos.'}
                  </p>
                </div>
              </div>

              {/* Supabase Config Form */}
              <form onSubmit={handleSaveSupabase} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-ios-secondaryText uppercase tracking-wider mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://xxxxxx.supabase.co"
                    value={supabaseConfig.url}
                    onChange={(e) => setSupabaseForm({ ...supabaseConfig, url: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#2C2C2E] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ios-secondaryText uppercase tracking-wider mb-1">
                    Supabase Anon Public Key
                  </label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseConfig.anonKey}
                    onChange={(e) => setSupabaseForm({ ...supabaseConfig, anonKey: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#2C2C2E] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-ios-blue hover:bg-blue-600 text-white font-bold text-xs rounded-xl ios-pressable transition-all"
                >
                  Guardar y conectar con Supabase
                </button>
              </form>

              {/* SQL Script Box */}
              <div className="pt-2 border-t border-gray-100 dark:border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    Script SQL para tu base de datos Supabase
                  </span>
                  <button
                    onClick={handleCopySql}
                    className="flex items-center gap-1 text-[11px] font-semibold text-ios-blue hover:underline"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? '¡Copiado!' : 'Copiar SQL'}</span>
                  </button>
                </div>
                <div className="relative">
                  <pre className="p-3 bg-gray-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-36">
                    {sqlSchema}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SHARE */}
          {activeTab === 'share' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-ios-blue/20 text-center space-y-2">
                <div className="w-12 h-12 bg-ios-blue text-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                  <Share2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white">
                  Comparte el enlace con la familia
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Cualquier persona con el enlace podrá abrir la app en su iPhone, Android u ordenador y apuntarse a los huecos libres.
                </p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-[#2C2C2E] rounded-xl flex items-center justify-between gap-2">
                <span className="text-xs font-mono text-gray-700 dark:text-gray-300 truncate">
                  {window.location.href}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-ios-blue text-white text-xs font-bold rounded-lg flex items-center gap-1.5 flex-shrink-0 ios-pressable"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copiado' : 'Copiar enlace'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
