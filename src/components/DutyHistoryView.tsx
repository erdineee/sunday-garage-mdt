import React, { useState } from 'react';
import { useMDT } from '../context/MDTContext';
import { ShiftLog } from '../types';
import { 
  formatDateTime, 
  formatDuration, 
  formatHoursDecimal, 
  isSupervisorOrHigher,
  isManagerOrHigher
} from '../lib/utils';
import { ManualShiftModal } from './ManualShiftModal';
import { MonthlyRecapView } from './MonthlyRecapView';
import { 
  Clock, 
  Search, 
  Filter, 
  Download, 
  PlusCircle, 
  Trash2, 
  ShieldAlert, 
  User, 
  CheckCircle2, 
  MapPin, 
  FileSpreadsheet,
  FileText,
  BarChart3
} from 'lucide-react';

export const DutyHistoryView: React.FC = () => {
  const { currentUser, shifts, deleteShiftLog } = useMDT();
  const isSupervisor = isSupervisorOrHigher(currentUser.role);
  const canDelete = isManagerOrHigher(currentUser.role);
  const canViewAllDutyHistory = isManagerOrHigher(currentUser.role);

  const [activeDutyTab, setActiveDutyTab] = useState<'LOGS' | 'RECAP'>('LOGS');
  const [searchTerm, setSearchTerm] = useState('');
  const [stationFilter, setStationFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewScope, setViewScope] = useState<'MY' | 'ALL'>(canViewAllDutyHistory ? 'ALL' : 'MY');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Filter logic based on Role & Scope
  const filteredShifts = shifts.filter((s) => {
    // Role restriction check: Trainee, Mechanic, and Torque Master can only see their own shifts
    if (!canViewAllDutyHistory || viewScope === 'MY') {
      if (s.userId !== currentUser.id) return false;
    }

    // Search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = (s.userName || '').toLowerCase().includes(term);
      const matchStation = (s.station || '').toLowerCase().includes(term);
      const matchNotes = (s.notes || '').toLowerCase().includes(term);
      if (!matchName && !matchStation && !matchNotes) return false;
    }

    // Station filter
    if (stationFilter !== 'ALL' && s.station !== stationFilter) return false;

    // Status filter
    if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;

    return true;
  });

  // Calculate stats for current filter
  const totalDurationSeconds = filteredShifts.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
  const totalCompletedCount = filteredShifts.filter(s => s.status === 'COMPLETED').length;
  const totalForcedCount = filteredShifts.filter(s => s.status === 'FORCED_OFF_DUTY').length;

  // Export CSV Report function
  const exportToCSV = () => {
    const headers = ['Shift ID', 'Nama Staff', 'Callsign', 'Role', 'Station', 'Waktu Mulai', 'Waktu Selesai', 'Durasi (Detik)', 'Durasi Jam', 'Status', 'Catatan'];
    const rows = filteredShifts.map(s => [
      s.id,
      `"${s.userName}"`,
      `"${s.callsign}"`,
      s.userRole,
      `"${s.station}"`,
      s.startTime,
      s.endTime || 'Masih On Duty',
      s.durationSeconds || 0,
      formatHoursDecimal(s.durationSeconds || 0),
      s.status,
      `"${(s.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Duty_History_SundayGarage_MSRP_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272A] pb-5">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-500" />
            <span>Jam History Shift Duty</span>
          </h2>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Pencatatan Otomatis Durasi Shift Mechanic &amp; Staff Sunday Garage MSRP
          </p>
        </div>

        {/* Sub-Tab Navigation */}
        <div className="bg-[#121214] p-1.5 rounded-2xl border border-[#27272A] flex items-center gap-1">
          <button
            onClick={() => setActiveDutyTab('LOGS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeDutyTab === 'LOGS'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/10'
                : 'text-[#A1A1AA] hover:text-white hover:bg-[#18181B]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Log Shift Detail</span>
          </button>

          {canDelete && (
            <button
              onClick={() => setActiveDutyTab('RECAP')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeDutyTab === 'RECAP'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/10'
                  : 'text-[#A1A1AA] hover:text-white hover:bg-[#18181B]'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Rekap Bulanan Manager</span>
            </button>
          )}
        </div>
      </div>

      {activeDutyTab === 'RECAP' && canDelete ? (
        <MonthlyRecapView />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* View Scope Toggle */}
              {canViewAllDutyHistory ? (
                <div className="bg-[#121214] p-1 rounded-xl border border-[#27272A] flex items-center gap-1">
                  <button
                    onClick={() => setViewScope('MY')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      viewScope === 'MY'
                        ? 'bg-amber-500 text-black shadow'
                        : 'text-[#A1A1AA] hover:text-white'
                    }`}
                  >
                    History Saya
                  </button>
                  <button
                    onClick={() => setViewScope('ALL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                      viewScope === 'ALL'
                        ? 'bg-amber-500 text-black shadow'
                        : 'text-[#A1A1AA] hover:text-white'
                    }`}
                  >
                    <span>Semua Staff</span>
                  </button>
                </div>
              ) : (
                <div className="px-3.5 py-2 bg-[#121214] border border-[#27272A] text-amber-400 rounded-xl text-xs font-bold flex items-center gap-2">
                  <User className="w-3.5 h-3.5" />
                  <span>History Shift Saya</span>
                </div>
              )}

              {/* Supervisor Manual Add */}
              {isSupervisor && (
                <button
                  onClick={() => setIsManualModalOpen(true)}
                  className="px-3.5 py-2 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-amber-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Input Manual</span>
                </button>
              )}

              {/* Export Report Button */}
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-amber-500/10 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#121214] border border-[#27272A] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-[#A1A1AA] font-medium">Total Akumulasi Durasi Shift</div>
            <div className="text-2xl font-black text-amber-400 font-mono mt-1">
              {formatHoursDecimal(totalDurationSeconds)} <span className="text-xs font-normal text-[#A1A1AA]">jam</span>
            </div>
            <div className="text-[10px] text-[#71717A] mt-0.5">({formatDuration(totalDurationSeconds)})</div>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#121214] border border-[#27272A] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-[#A1A1AA] font-medium">Shift Selesai Normal</div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
              {totalCompletedCount} <span className="text-xs font-normal text-[#A1A1AA]">rekaman</span>
            </div>
            <div className="text-[10px] text-[#71717A] mt-0.5">Status: Completed</div>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#121214] border border-[#27272A] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-[#A1A1AA] font-medium">Force Off Duty Logs</div>
            <div className="text-2xl font-black text-rose-400 font-mono mt-1">
              {totalForcedCount} <span className="text-xs font-normal text-[#A1A1AA]">tindakan</span>
            </div>
            <div className="text-[10px] text-[#71717A] mt-0.5">Tindakan oleh Supervisor</div>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400 border border-rose-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-[#121214] border border-[#27272A] rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama, callsign, station..."
            className="w-full bg-[#18181B] border border-[#27272A] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#A1A1AA] shrink-0" />
            <select
              value={stationFilter}
              onChange={(e) => setStationFilter(e.target.value)}
              className="bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Semua Station</option>
              <option value="Sandy Shores Garage">Sandy Shores Garage</option>
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="COMPLETED">Completed</option>
            <option value="ACTIVE">Active On Duty</option>
            <option value="FORCED_OFF_DUTY">Forced Off Duty</option>
          </select>
        </div>
      </div>

      {/* Duty History Table */}
      <div className="bg-[#121214] border border-[#27272A] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#18181B] border-b border-[#27272A] text-[#A1A1AA] font-mono uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Staff Mechanic</th>
                <th className="px-4 py-3.5">Station / Location</th>
                <th className="px-4 py-3.5">Waktu Mulai</th>
                <th className="px-4 py-3.5">Waktu Selesai</th>
                <th className="px-4 py-3.5">Durasi Shift</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi / Supervisor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A] text-[#E4E4E7]">
              {filteredShifts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#71717A] italic">
                    Tidak ada rekaman history shift duty yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredShifts.map((s) => {
                  return (
                    <tr key={s.id} className="hover:bg-[#18181B]/60 transition-colors">
                      
                      {/* Staff */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#18181B] border border-[#27272A] flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
                            {s.userName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white">{s.userName}</div>
                            <div className="text-[10px] text-[#A1A1AA] font-mono">
                              Role: {s.userRole}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Station */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 font-medium text-[#E4E4E7]">
                          <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{s.station}</span>
                        </div>
                      </td>

                      {/* Start Time */}
                      <td className="px-4 py-4 font-mono text-[#E4E4E7]">
                        {formatDateTime(s.startTime)}
                      </td>

                      {/* End Time */}
                      <td className="px-4 py-4 font-mono text-[#E4E4E7]">
                        {s.endTime ? (
                          formatDateTime(s.endTime)
                        ) : (
                          <span className="text-emerald-400 font-bold animate-pulse">
                            ● MASIH ON DUTY
                          </span>
                        )}
                      </td>

                      {/* Duration */}
                      <td className="px-4 py-4">
                        <div className="font-mono font-bold text-amber-400 text-sm">
                          {formatDuration(s.durationSeconds)}
                        </div>
                        <div className="text-[10px] text-[#A1A1AA]">
                          ({formatHoursDecimal(s.durationSeconds)} jam)
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-4">
                        {s.status === 'COMPLETED' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            Completed
                          </span>
                        )}
                        {s.status === 'ACTIVE' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse">
                            ● Active Duty
                          </span>
                        )}
                        {s.status === 'FORCED_OFF_DUTY' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            Forced Off
                          </span>
                        )}
                        
                        {s.notes && (
                          <div className="text-[10px] text-[#A1A1AA] italic mt-1 max-w-[180px] truncate" title={s.notes}>
                            "{s.notes}"
                          </div>
                        )}
                        {s.forceReason && (
                          <div className="text-[10px] text-rose-300/80 mt-1" title={s.forceReason}>
                            Alasan: {s.forceReason}
                          </div>
                        )}
                      </td>

                      {/* Actions (Manager / Moderator only can delete) */}
                      <td className="px-5 py-4 text-right">
                        {canDelete ? (
                          <button
                            onClick={() => {
                              if (confirm(`Hapus rekaman shift #${s.id} untuk ${s.userName}?`)) {
                                deleteShiftLog(s.id);
                              }
                            }}
                            title="Hapus Rekaman Shift (Manager / Moderator)"
                            className="p-1.5 bg-[#18181B] hover:bg-rose-500/20 text-[#A1A1AA] hover:text-rose-400 rounded-lg border border-[#27272A] transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-[#71717A] font-mono">Logged</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}

      {/* Manual Shift Modal */}
      <ManualShiftModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
      />
    </div>
  );
};
