import React, { useState } from 'react';
import { useMDT } from '../context/MDTContext';
import { Role, User } from '../types';
import { getRoleBadgeClass, getRoleLabel, isSupervisorOrHigher, isManagerOrHigher, formatHoursDecimal } from '../lib/utils';
import { Users, Search, UserPlus, Trash2, ShieldAlert, AlertTriangle } from 'lucide-react';
import { AddEmployeeModal } from './AddEmployeeModal';
import { UserAvatar } from './UserAvatar';

export const StaffDirectoryView: React.FC = () => {
  const { users, currentUser, shifts, updateUserRole, deleteUser } = useMDT();
  const isSupervisor = isSupervisorOrHigher(currentUser.role);
  const canChangeRoleOrDelete = isManagerOrHigher(currentUser.role);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const filteredUsers = users.filter((u) => {
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return (
        (u.name || '').toLowerCase().includes(term) ||
        (u.role || '').toLowerCase().includes(term) ||
        (u.department || '').toLowerCase().includes(term) ||
        (u.citizenId || '').toLowerCase().includes(term) ||
        (u.callsign || '').toLowerCase().includes(term)
      );
    }
    return true;
  });

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    const res = deleteUser(userToDelete.id);
    if (!res.success) {
      setDeleteError(res.message || 'Gagal menghapus karyawan.');
    } else {
      setUserToDelete(null);
      setDeleteError('');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272A] pb-5">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            <span>Staff Personnel Directory</span>
          </h2>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Daftar Mechanic &amp; Supervisor Sunday Garage MSRP dengan Hak Akses MDT
          </p>
        </div>

        {/* Action Controls: Search & Add Employee */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          {/* Add Employee Button for Supervisors/Managers */}
          {isSupervisor && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>Tambah Karyawan Baru</span>
            </button>
          )}

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama staff..."
              className="w-full bg-[#121214] border border-[#27272A] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredUsers.map((user) => {
          // Calculate total duty hours for user
          const userShifts = shifts.filter(s => s.userId === user.id);
          const totalSeconds = userShifts.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
          const activeShift = userShifts.find(s => s.status === 'ACTIVE');

          return (
            <div
              key={user.id}
              className="bg-[#121214] border border-[#27272A] rounded-2xl p-5 flex flex-col justify-between hover:border-[#3F3F46] transition-colors shadow-lg"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <UserAvatar src={user.avatar} name={user.name} sizeClass="w-12 h-12 text-sm" />
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                    activeShift
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 animate-pulse'
                      : 'bg-[#18181B] text-[#A1A1AA] border-[#27272A]'
                  }`}>
                    {activeShift ? '● ON DUTY' : '○ OFF DUTY'}
                  </span>
                </div>

                {/* Details */}
                <div className="mt-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-white">{user.name}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-[#18181B] text-amber-400 border border-amber-500/20 rounded-md">
                      {user.citizenId || user.id}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#A1A1AA]">{user.department}</div>
                </div>

                {/* Role badge */}
                <div className="mt-3">
                  <span className={`inline-block text-xs px-2.5 py-1 rounded-lg border font-semibold ${getRoleBadgeClass(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </div>

                {/* Stats */}
                <div className="mt-4 pt-3 border-t border-[#27272A] flex items-center justify-between text-xs text-[#A1A1AA]">
                  <span>Total Jam Duty:</span>
                  <span className="font-mono font-bold text-amber-400">
                    {formatHoursDecimal(totalSeconds)} jam
                  </span>
                </div>
              </div>

              {/* Role Management & Deletion for Manager/Moderator */}
              {canChangeRoleOrDelete && currentUser.id !== user.id && (
                <div className="mt-4 pt-3 border-t border-[#27272A] space-y-2">
                  <div>
                    <label className="block text-[10px] text-[#A1A1AA] mb-1 font-mono uppercase">
                      Ubah Role Access:
                    </label>
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value as Role)}
                      className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="TRAINEE">Trainee</option>
                      <option value="MECHANIC">Mechanic</option>
                      <option value="TORQUE_MASTER">Torque Master</option>
                      <option value="MANAGER">Manager</option>
                      <option value="MODERATOR">Moderator (Full Access)</option>
                    </select>
                  </div>

                  {/* Manager / Moderator Delete Employee Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setUserToDelete(user);
                      setDeleteError('');
                    }}
                    className="w-full py-1.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Karyawan</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Employee Modal for Moderator */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Delete Employee Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#121214] border border-rose-500/40 rounded-2xl shadow-2xl overflow-hidden text-[#E4E4E7]">
            <div className="bg-[#18181B] px-6 py-4 border-b border-[#27272A] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Hapus Karyawan</h3>
                  <p className="text-xs text-[#A1A1AA]">Akses Manager / Moderator MDT</p>
                </div>
              </div>
              <button
                onClick={() => setUserToDelete(null)}
                className="text-[#A1A1AA] hover:text-white p-1 rounded-lg hover:bg-[#27272A] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {deleteError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}

              <div className="p-4 bg-[#18181B] border border-[#27272A] rounded-xl flex items-center gap-3">
                <img
                  src={userToDelete.avatar}
                  alt={userToDelete.name}
                  className="w-12 h-12 rounded-xl object-cover border border-[#27272A]"
                />
                <div>
                  <div className="font-bold text-white text-sm">{userToDelete.name}</div>
                  <div className="text-xs text-[#A1A1AA]">{userToDelete.department}</div>
                  <div className="text-[10px] text-amber-400 font-mono mt-0.5">Role: {userToDelete.role}</div>
                </div>
              </div>

              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Apakah Anda yakin ingin menghapus akun karyawan <strong className="text-white">{userToDelete.name}</strong> dari sistem MDT Sunday Garage MSRP? Tindakan ini akan dicatat dalam Audit Log Supervisor.
              </p>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-[#18181B] hover:bg-[#27272A] text-[#E4E4E7] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors flex items-center gap-2 shadow-md shadow-rose-950/50 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Ya, Hapus Karyawan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
