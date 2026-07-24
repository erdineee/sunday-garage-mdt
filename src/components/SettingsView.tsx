import React, { useState } from 'react';
import { useMDT } from '../context/MDTContext';
import { isSupervisorOrHigher, isManagerOrHigher, getRoleBadgeClass } from '../lib/utils';
import { UserAvatar } from './UserAvatar';
import { 
  Key, 
  Lock, 
  ShieldCheck, 
  UserCheck, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  ShieldAlert, 
  Sparkles,
  Camera,
  Trash2,
  Image as ImageIcon,
  Link as LinkIcon,
  Zap
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { currentUser, users, changeCurrentUserPin, adminUpdateUserPin, updateUserAvatar, resetAllData, clearProductionData } = useMDT();
  const isSupervisor = isSupervisorOrHigher(currentUser.role);
  const isManagerOrMod = isManagerOrHigher(currentUser.role);
  const isModerator = currentUser.role === 'MODERATOR';

  // Personal Avatar state
  const [avatarUrlInput, setAvatarUrlInput] = useState(currentUser.avatar || '');
  const [avatarMsg, setAvatarMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Personal PIN change state
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [personalMsg, setPersonalMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Admin PIN & Avatar state
  const [targetUserId, setTargetUserId] = useState<string>(users[0]?.id || '');
  const [adminNewPin, setAdminNewPin] = useState('');
  const [adminMsg, setAdminMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [adminAvatarTargetId, setAdminAvatarTargetId] = useState<string>(users[0]?.id || '');
  const [adminAvatarUrlInput, setAdminAvatarUrlInput] = useState<string>('');
  const [adminAvatarMsg, setAdminAvatarMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Reset System confirmation modal
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Handle Save Personal Avatar
  const handleSavePersonalAvatar = (newUrl: string) => {
    updateUserAvatar(currentUser.id, newUrl);
    setAvatarUrlInput(newUrl);
    setAvatarMsg({ 
      type: 'success', 
      text: newUrl ? 'Foto profil berhasil diperbarui!' : 'Foto profil berhasil dihilangkan! Menggunakan mode inisial ringan.' 
    });
    setTimeout(() => setAvatarMsg(null), 3000);
  };

  // Handle Admin Staff Avatar Update
  const handleSaveAdminAvatar = (newUrl: string) => {
    const target = users.find(u => u.id === adminAvatarTargetId);
    if (!target) return;

    updateUserAvatar(target.id, newUrl);
    setAdminAvatarUrlInput(newUrl);
    setAdminAvatarMsg({
      type: 'success',
      text: newUrl ? `Foto profil ${target.name} berhasil diperbarui!` : `Foto profil ${target.name} dihilangkan (Mode Inisial Ringan).`
    });
    setTimeout(() => setAdminAvatarMsg(null), 3000);
  };

  const handlePersonalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPersonalMsg(null);

    if (newPin !== confirmPin) {
      setPersonalMsg({ type: 'error', text: 'Konfirmasi PIN / Password baru tidak cocok.' });
      return;
    }

    const result = changeCurrentUserPin(oldPin, newPin);
    if (result.success) {
      setPersonalMsg({ type: 'success', text: result.message || 'PIN / Password Anda berhasil diubah.' });
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
    } else {
      setPersonalMsg({ type: 'error', text: result.message || 'Gagal mengubah PIN / Password.' });
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminMsg(null);

    if (!targetUserId) {
      setAdminMsg({ type: 'error', text: 'Pilih karyawan yang ingin diubah PIN-nya.' });
      return;
    }

    const result = adminUpdateUserPin(targetUserId, adminNewPin);
    if (result.success) {
      setAdminMsg({ type: 'success', text: result.message || 'PIN Karyawan berhasil diubah.' });
      setAdminNewPin('');
    } else {
      setAdminMsg({ type: 'error', text: result.message || 'Gagal memperbarui PIN Karyawan.' });
    }
  };

  const handleConfirmResetDefault = () => {
    resetAllData();
    setShowResetConfirm(false);
  };

  const handleConfirmResetProduction = () => {
    clearProductionData();
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121214] p-5 rounded-2xl border border-[#27272A]">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Key className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Pengaturan Keamanan & PIN</h1>
          </div>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Atur PIN / Password akses MDT Terminal Anda, serta kelola otorisasi akun karyawan Sunday Garage.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${getRoleBadgeClass(currentUser.role)}`}>
            Role: {currentUser.role}
          </span>
          {isModerator && (
            <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              Full System Moderator
            </span>
          )}
        </div>
      </div>

      {/* Avatar / Profile Photo Customization Section */}
      <div className="bg-[#121214] border border-[#27272A] rounded-2xl p-6 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">Pengaturan Foto Profil / Avatar</h2>
              <p className="text-xs text-[#A1A1AA]">
                Ganti URL gambar avatar Anda atau hilangkan foto untuk mode inisial paling ringan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#A1A1AA] bg-[#18181B] px-3 py-1 rounded-lg border border-[#27272A]">
              Status Foto: <strong className={currentUser.avatar ? "text-emerald-400" : "text-amber-400"}>
                {currentUser.avatar ? 'Foto Aktif' : 'Tanpa Foto (Mode Ringan)'}
              </strong>
            </span>
          </div>
        </div>

        {avatarMsg && (
          <div className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2.5 ${
            avatarMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{avatarMsg.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* Avatar Live Preview */}
          <div className="flex flex-col items-center justify-center p-4 bg-[#18181B] border border-[#27272A] rounded-2xl space-y-3">
            <div className="relative">
              <UserAvatar src={avatarUrlInput} name={currentUser.name} sizeClass="w-20 h-20 text-xl" />
              {!avatarUrlInput && (
                <span className="absolute -bottom-1 -right-1 p-1 bg-amber-500 text-black rounded-full border-2 border-[#18181B]" title="Mode Inisial Ringan">
                  <Zap className="w-3.5 h-3.5 fill-black" />
                </span>
              )}
            </div>
            <div className="text-center">
              <div className="text-xs font-bold text-white">{currentUser.name}</div>
              <div className="text-[10px] text-[#A1A1AA] font-mono mt-0.5">
                {avatarUrlInput ? 'Foto Profil Kustom' : 'Inisial Nama (Sangat Ringan)'}
              </div>
            </div>
          </div>

          {/* Form & Actions */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#E4E4E7] mb-1.5 flex items-center justify-between">
                <span>URL Gambar Avatar / Foto Profil</span>
                <span className="text-[10px] text-[#A1A1AA] font-normal">Format: PNG, JPG, WebP</span>
              </label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={avatarUrlInput}
                  onChange={(e) => setAvatarUrlInput(e.target.value)}
                  placeholder="https://i.imgur.com/... atau https://images.unsplash.com/..."
                  className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            {/* Quick Presets & Clear Button */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleSavePersonalAvatar(avatarUrlInput)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl shadow-md shadow-amber-500/10 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Simpan Foto Baru</span>
              </button>

              <button
                type="button"
                onClick={() => handleSavePersonalAvatar('')}
                className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                title="Hapus foto agar sistem memuat cepat dan tidak berat"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Hapus Foto (Gunakan Inisial / Mode Ringan)</span>
              </button>
            </div>

            <p className="text-[10px] text-[#71717A]">
              💡 Tips: Menghilangkan foto avatar akan mempercepat loading MDT Terminal dan menghemat kuota data koneksi.
            </p>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Ubah PIN / Password Personal */}
        <div className="bg-[#121214] border border-[#27272A] rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-[#27272A]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-white text-base">Ubah PIN / Password Akun Saya</h2>
                <p className="text-xs text-[#A1A1AA]">{currentUser.name} ({currentUser.department})</p>
              </div>
            </div>
          </div>

          {personalMsg && (
            <div className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2.5 ${
              personalMsg.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              {personalMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{personalMsg.text}</span>
            </div>
          )}

          <form onSubmit={handlePersonalSubmit} className="space-y-4">
            {!isModerator && (
              <div>
                <label className="block text-xs font-semibold text-[#E4E4E7] mb-1">
                  PIN / Password Saat Ini <span className="text-amber-400">*</span>
                </label>
                <input
                  type="password"
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value)}
                  placeholder="Masukkan PIN lama (cth: 1234)"
                  className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-amber-500 font-mono"
                  required={!isModerator}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#E4E4E7] mb-1">
                PIN / Password Baru <span className="text-amber-400">*</span>
              </label>
              <input
                type="password"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="Masukkan PIN / Password baru (min. 4 angka)"
                className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-amber-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#E4E4E7] mb-1">
                Konfirmasi PIN / Password Baru <span className="text-amber-400">*</span>
              </label>
              <input
                type="password"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="Ketik ulang PIN / Password baru"
                className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-amber-500 font-mono"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl shadow-md shadow-amber-500/10 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Simpan Perubahan PIN Saya</span>
            </button>
          </form>
        </div>

        {/* Card 2: Kelola Access PIN Karyawan (Manager / Moderator) */}
        {isSupervisor ? (
          <div className="bg-[#121214] border border-[#27272A] rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#27272A]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-white text-base">Reset PIN Access Karyawan</h2>
                  <p className="text-xs text-[#A1A1AA]">Otorisasi {currentUser.role} Sunday Garage</p>
                </div>
              </div>
            </div>

            {adminMsg && (
              <div className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2.5 ${
                adminMsg.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}>
                {adminMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                )}
                <span>{adminMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#E4E4E7] mb-1">
                  Pilih Karyawan
                </label>
                <select
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.role} ({u.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#E4E4E7] mb-1">
                  PIN / Password Baru untuk Karyawan
                </label>
                <input
                  type="password"
                  value={adminNewPin}
                  onChange={(e) => setAdminNewPin(e.target.value)}
                  placeholder="Masukkan PIN baru (cth: 5566)"
                  className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-900/20 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Key className="w-4 h-4" />
                <span>Setel Ulang PIN Karyawan</span>
              </button>
            </form>

            {/* System Clear Logs Option for Moderator / Manager */}
            {isManagerOrMod && (
              <div className="pt-4 border-t border-[#27272A]">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear System Logs &amp; Reset State (Manager / Moderator)</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#121214] border border-[#27272A] rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3">
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-white text-sm">Otorisasi Manajemen Terbatas</h3>
            <p className="text-xs text-[#A1A1AA] max-w-xs">
              Fitur pengelolaan PIN seluruh karyawan hanya dapat diakses oleh akun berpangkat <span className="text-amber-400 font-bold">Torque Master</span>, <span className="text-purple-400 font-bold">Manager</span>, atau <span className="text-rose-400 font-bold">Moderator</span>.
            </p>
          </div>
        )}
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#121214] border border-rose-500/40 rounded-2xl shadow-2xl p-6 space-y-4 text-[#E4E4E7]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Reset Seluruh Data MDT?</h3>
                <p className="text-xs text-[#A1A1AA]">Akses Supervisor & Moderator</p>
              </div>
            </div>

            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Pilih opsi pembersihan data MDT Terminal:
            </p>

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handleConfirmResetProduction}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer shadow-lg shadow-amber-500/10"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 fill-black" />
                  <span>1. Bersihkan Semua untuk Production (Siap Publish)</span>
                </div>
                <span className="text-[10px] font-normal text-black/80">
                  Menghapus semua log shift &amp; menghapus semua akun demo (Ramon, Shandy, Eko)
                </span>
              </button>

              <button
                type="button"
                onClick={handleConfirmResetDefault}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-rose-400" />
                <span>2. Reset Ulang ke Sample Data Demo Awal</span>
              </button>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-[#18181B] hover:bg-[#27272A] text-[#E4E4E7] transition-colors cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
