import React, { useState } from 'react';
import { useMDT } from '../context/MDTContext';
import { LocationStation } from '../types';
import { Calendar, Clock, PlusCircle } from 'lucide-react';

interface ManualShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManualShiftModal: React.FC<ManualShiftModalProps> = ({ isOpen, onClose }) => {
  const { users, addManualShiftLog } = useMDT();
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id || '');
  const [station, setStation] = useState<LocationStation>('Sandy Shores Garage');
  
  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

  const [startTime, setStartTime] = useState(twoHoursAgo.toISOString().slice(0, 16));
  const [endTime, setEndTime] = useState(now.toISOString().slice(0, 16));
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    addManualShiftLog(
      selectedUserId,
      station,
      new Date(startTime).toISOString(),
      new Date(endTime).toISOString(),
      notes
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#121214] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden text-[#E4E4E7]">
        
        <div className="bg-[#18181B] px-6 py-4 border-b border-[#27272A] flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <PlusCircle className="w-5 h-5" />
            <span>Input Jam History Manual (Supervisor)</span>
          </div>
          <button onClick={onClose} className="text-[#A1A1AA] hover:text-white text-sm cursor-pointer">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#E4E4E7] mb-1">Pilih Staff Mechanic</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} - {u.role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#E4E4E7] mb-1">Lokasi Station / Garage</label>
            <select
              value={station}
              onChange={(e) => setStation(e.target.value as LocationStation)}
              className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="Sandy Shores Garage">Sandy Shores Garage</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#E4E4E7] mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Waktu Mulai Shift
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#E4E4E7] mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Waktu Selesai Shift
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#E4E4E7] mb-1">Catatan Shift (Opsional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Input manual karena masalah koneksi radio"
              className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-[#18181B] hover:bg-[#27272A] text-[#E4E4E7] cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-black font-medium cursor-pointer"
            >
              Simpan Input Shift
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
