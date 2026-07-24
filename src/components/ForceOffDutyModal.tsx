import React, { useState } from 'react';
import { useMDT } from '../context/MDTContext';
import { ShiftLog } from '../types';
import { AlertTriangle, Lock, ShieldAlert } from 'lucide-react';

interface ForceOffDutyModalProps {
  shift: ShiftLog | null;
  onClose: () => void;
}

export const ForceOffDutyModal: React.FC<ForceOffDutyModalProps> = ({ shift, onClose }) => {
  const { forceOffDuty, verifySupervisorPin, currentUser } = useMDT();
  const [reason, setReason] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!shift) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Alasan Force Off Duty harus diisi untuk kebutuhan Log Supervisor!');
      return;
    }

    if (!verifySupervisorPin(pin)) {
      setError('PIN Keamanan Supervisor Salah! (Default: 7788)');
      return;
    }

    forceOffDuty(shift.id, reason);
    setReason('');
    setPin('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#121214] border border-rose-500/40 rounded-2xl shadow-2xl overflow-hidden text-[#E4E4E7]">
        
        {/* Header */}
        <div className="bg-rose-950/30 border-b border-rose-900/50 px-6 py-4 flex items-center gap-3">
          <div className="p-2 bg-rose-500/20 border border-rose-500/40 rounded-lg text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-rose-100">Force Off Duty Protocol</h3>
            <p className="text-xs text-rose-300/80">Tindakan Supervisor &amp; Audit Log Keamanan</p>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 bg-[#18181B] border border-[#27272A] rounded-xl space-y-1 text-xs">
            <div className="text-[#A1A1AA]">Target Staff Duty:</div>
            <div className="text-sm font-semibold text-white flex items-center justify-between">
              <span>{shift.userName}</span>
              <span className="text-amber-400 font-mono text-xs">{shift.station}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#E4E4E7] mb-1">
              Alasan Force Off Duty <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              placeholder="Contoh: AFK / Tidak merespon radio selama 30 menit / Lupa turn off duty"
              className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl p-3 text-sm text-white placeholder-[#71717A] focus:outline-none focus:border-rose-500 text-xs"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#E4E4E7] mb-1 flex items-center justify-between">
              <span>PIN Verifikasi Supervisor</span>
              <span className="text-[10px] text-amber-400 font-mono">PIN: 7788</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#71717A] absolute left-3 top-3" />
              <input
                type="password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError('');
                }}
                placeholder="Masukkan PIN Supervisor"
                className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-rose-500 font-mono"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-[#18181B] hover:bg-[#27272A] text-[#E4E4E7] transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors flex items-center gap-2 shadow-lg shadow-rose-950/50 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" /> Force Off Duty Sekarang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
