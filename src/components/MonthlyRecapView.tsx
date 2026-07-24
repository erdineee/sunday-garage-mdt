import React, { useState } from 'react';
import { useMDT } from '../context/MDTContext';
import { formatHoursDecimal, formatDuration, getRoleBadgeClass, isManagerOrHigher } from '../lib/utils';
import { UserAvatar } from './UserAvatar';
import { 
  Calendar, 
  Copy, 
  Check, 
  Download, 
  Award, 
  Clock, 
  Users, 
  CheckCircle2, 
  Search,
  FileSpreadsheet,
  TrendingUp,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const MonthlyRecapView: React.FC = () => {
  const { users, shifts, currentUser } = useMDT();

  if (!isManagerOrHigher(currentUser.role)) {
    return (
      <div className="p-8 bg-[#121214] border border-[#27272A] rounded-2xl text-center space-y-3">
        <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-white">Akses Ditolak</h3>
        <p className="text-xs text-[#A1A1AA]">
          Halaman Rekap Bulanan Manager hanya dapat diakses oleh akun Manager dan Moderator.
        </p>
      </div>
    );
  }

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  // Filter shifts by selected month & year
  const monthShifts = shifts.filter((s) => {
    if (!s.startTime) return false;
    const date = new Date(s.startTime);
    return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
  });

  // Aggregate user duty statistics
  const userStatsMap = new Map<string, {
    user: typeof users[0];
    totalSeconds: number;
    shiftCount: number;
    completedCount: number;
    lastShiftTime?: string;
  }>();

  // Initialize all users in userStatsMap so everyone appears in summary
  users.forEach((u) => {
    userStatsMap.set(u.id, {
      user: u,
      totalSeconds: 0,
      shiftCount: 0,
      completedCount: 0,
    });
  });

  // Populate shift data
  monthShifts.forEach((s) => {
    const stat = userStatsMap.get(s.userId);
    if (stat) {
      stat.totalSeconds += s.durationSeconds || 0;
      stat.shiftCount += 1;
      if (s.status === 'COMPLETED') stat.completedCount += 1;
      if (!stat.lastShiftTime || new Date(s.startTime) > new Date(stat.lastShiftTime)) {
        stat.lastShiftTime = s.startTime;
      }
    } else {
      // User might have been deleted or created later
      const dummyUser = {
        id: s.userId,
        name: s.userName || 'Unknown Mechanic',
        role: s.userRole || 'MECHANIC',
        department: 'MDT Personnel',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        pin: '1234',
        joinedDate: '',
        callsign: s.callsign
      };
      userStatsMap.set(s.userId, {
        user: dummyUser,
        totalSeconds: s.durationSeconds || 0,
        shiftCount: 1,
        completedCount: s.status === 'COMPLETED' ? 1 : 0,
        lastShiftTime: s.startTime
      });
    }
  });

  // Convert map to array and sort by total duration descending
  const userStatsList = Array.from(userStatsMap.values()).sort((a, b) => b.totalSeconds - a.totalSeconds);

  // Search filter
  const filteredUserStats = userStatsList.filter(stat => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (stat.user.name || '').toLowerCase().includes(term) ||
      (stat.user.role || '').toLowerCase().includes(term) ||
      (stat.user.callsign || '').toLowerCase().includes(term) ||
      (stat.user.department || '').toLowerCase().includes(term)
    );
  });

  // Calculate totals
  const monthTotalSeconds = monthShifts.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
  const activeStaffCount = userStatsList.filter(s => s.shiftCount > 0).length;
  const topMechanic = userStatsList[0]?.totalSeconds > 0 ? userStatsList[0] : null;

  // Discord Copy Report Generator
  const handleCopyReport = () => {
    const monthLabel = `${MONTH_NAMES[selectedMonth].toUpperCase()} ${selectedYear}`;
    
    let reportText = `=========================================\n`;
    reportText += `📋 REKAP TOTAL DUTY SUNDAY GARAGE MSRP\n`;
    reportText += `📅 PERIODE: ${monthLabel}\n`;
    reportText += `=========================================\n\n`;

    const activeMechanics = userStatsList.filter(s => s.shiftCount > 0);

    if (activeMechanics.length === 0) {
      reportText += `(Belum ada data shift terdaftar untuk bulan ini)\n\n`;
    } else {
      activeMechanics.forEach((stat, index) => {
        const hours = formatHoursDecimal(stat.totalSeconds);
        const formattedDur = formatDuration(stat.totalSeconds);
        reportText += `${index + 1}. ${stat.user.name} [${stat.user.role}]\n`;
        if (stat.user.callsign) reportText += `   • Callsign: ${stat.user.callsign}\n`;
        reportText += `   • Total Shift: ${stat.shiftCount}\n`;
        reportText += `   • Total Jam Duty: ${hours} Jam (${formattedDur})\n\n`;
      });
    }

    reportText += `-----------------------------------------\n`;
    reportText += `👥 TOTAL MEKANIK BERDINAS: ${activeMechanics.length} Orang\n`;
    reportText += `⏱️ TOTAL JAM DUTY KESELURUHAN: ${formatHoursDecimal(monthTotalSeconds)} Jam\n`;
    reportText += `=========================================\n`;
    reportText += `Sunday Garage MSRP MDT System • Generated: ${new Date().toLocaleDateString('id-ID')}\n`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Export CSV Report
  const handleExportCSV = () => {
    const monthLabel = `${MONTH_NAMES[selectedMonth]}_${selectedYear}`;
    const headers = ['Peringkat', 'Nama Karyawan', 'Callsign', 'Role', 'Department', 'Jumlah Shift', 'Shift Selesai', 'Total Jam (Decimal)', 'Total Format'];
    
    const rows = userStatsList.map((stat, idx) => [
      idx + 1,
      `"${stat.user.name}"`,
      `"${stat.user.callsign || '-'}"`,
      stat.user.role,
      `"${stat.user.department || '-'}"`,
      stat.shiftCount,
      stat.completedCount,
      formatHoursDecimal(stat.totalSeconds),
      `"${formatDuration(stat.totalSeconds)}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Duty_Bulanan_${monthLabel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Filter Controls & Action Bar */}
      <div className="bg-[#121214] p-5 rounded-2xl border border-[#27272A] flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Month / Year Pickers */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#18181B] px-3 py-2 rounded-xl border border-[#27272A]">
            <Calendar className="w-4 h-4 text-amber-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-1"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={idx} value={idx} className="bg-[#18181B] text-white">
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-[#18181B] px-3 py-2 rounded-xl border border-[#27272A]">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              {[2026, 2025, 2024].map((year) => (
                <option key={year} value={year} className="bg-[#18181B] text-white">
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-[#A1A1AA] font-medium hidden sm:block">
            Periode: <strong className="text-white">{MONTH_NAMES[selectedMonth]} {selectedYear}</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyReport}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
              copied
                ? 'bg-emerald-600 text-white shadow-emerald-950/40'
                : 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/10 active:scale-[0.98]'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Teks Rekap Disalin!' : 'Salin Format Discord / Report'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#E4E4E7] text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            title="Download Spreadsheet CSV Rekap Bulanan"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Jam Duty */}
        <div className="bg-[#121214] border border-[#27272A] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-[#A1A1AA] font-semibold">Total Jam Duty Bulanan</div>
            <div className="text-2xl font-extrabold text-white mt-1 font-mono tracking-tight">
              {formatHoursDecimal(monthTotalSeconds)} <span className="text-sm font-sans text-amber-400 font-bold">Jam</span>
            </div>
            <div className="text-[10px] text-[#71717A] mt-1 font-mono">
              {formatDuration(monthTotalSeconds)} total
            </div>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Total Shift Selesai */}
        <div className="bg-[#121214] border border-[#27272A] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-[#A1A1AA] font-semibold">Total Shift Terdaftar</div>
            <div className="text-2xl font-extrabold text-white mt-1 font-mono tracking-tight">
              {monthShifts.length} <span className="text-sm font-sans text-emerald-400 font-bold">Shift</span>
            </div>
            <div className="text-[10px] text-[#71717A] mt-1">
              {MONTH_NAMES[selectedMonth]} {selectedYear}
            </div>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Active Staff Count */}
        <div className="bg-[#121214] border border-[#27272A] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-[#A1A1AA] font-semibold">Mekanik Berdinas</div>
            <div className="text-2xl font-extrabold text-white mt-1 font-mono tracking-tight">
              {activeStaffCount} / {users.length} <span className="text-sm font-sans text-purple-400 font-bold">Personil</span>
            </div>
            <div className="text-[10px] text-[#71717A] mt-1">
              Aktif bulan ini
            </div>
          </div>
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Top Performer */}
        <div className="bg-[#121214] border border-[#27272A] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-[#A1A1AA] font-semibold">Top Duty Month</div>
            {topMechanic ? (
              <>
                <div className="text-sm font-bold text-amber-400 truncate max-w-[140px] mt-1">
                  {topMechanic.user.name}
                </div>
                <div className="text-[10px] text-[#A1A1AA] font-mono mt-0.5">
                  {formatHoursDecimal(topMechanic.totalSeconds)} Jam ({topMechanic.shiftCount} shift)
                </div>
              </>
            ) : (
              <div className="text-xs text-[#71717A] mt-2 italic">Belum ada data</div>
            )}
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <Award className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Staff Monthly Breakdown Table */}
      <div className="bg-[#121214] border border-[#27272A] rounded-2xl overflow-hidden shadow-xl">
        
        {/* Table Header Controls */}
        <div className="p-4 border-b border-[#27272A] bg-[#18181B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-sm">
              Rekap Rincian Jam Duty Karyawan ({MONTH_NAMES[selectedMonth]} {selectedYear})
            </h3>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama / callsign..."
              className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0A0A0B] text-[10px] font-mono uppercase text-[#A1A1AA] border-b border-[#27272A]">
                <th className="py-3 px-4 font-semibold text-center w-12">#</th>
                <th className="py-3 px-4 font-semibold">Karyawan / Personil</th>
                <th className="py-3 px-4 font-semibold">Role Access</th>
                <th className="py-3 px-4 font-semibold text-center">Jumlah Shift</th>
                <th className="py-3 px-4 font-semibold text-right">Total Jam Duty</th>
                <th className="py-3 px-4 font-semibold text-right">Format Waktu</th>
                <th className="py-3 px-4 font-semibold text-center">Status Keaktifan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]/60 text-xs">
              {filteredUserStats.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#71717A]">
                    Tidak ada data karyawan ditemukan.
                  </td>
                </tr>
              ) : (
                filteredUserStats.map((stat, index) => {
                  const hoursDecimal = formatHoursDecimal(stat.totalSeconds);
                  const isTopRank = index === 0 && stat.totalSeconds > 0;

                  return (
                    <tr 
                      key={stat.user.id}
                      className="hover:bg-[#18181B]/80 transition-colors group"
                    >
                      {/* Rank Index */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-[#71717A]">
                        {isTopRank ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs">
                            🥇
                          </span>
                        ) : (
                          `#${index + 1}`
                        )}
                      </td>

                      {/* User Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar src={stat.user.avatar} name={stat.user.name} sizeClass="w-9 h-9 text-xs" />
                          <div>
                            <div className="font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-2">
                              <span>{stat.user.name}</span>
                              {isTopRank && (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                  Top Performer
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#A1A1AA] font-mono">
                              {stat.user.callsign ? `Callsign: ${stat.user.callsign}` : stat.user.department}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-lg border text-[10px] font-bold ${getRoleBadgeClass(stat.user.role)}`}>
                          {stat.user.role}
                        </span>
                      </td>

                      {/* Shift Count */}
                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className="px-2 py-1 rounded bg-[#18181B] border border-[#27272A] text-white font-bold">
                          {stat.shiftCount} Shift
                        </span>
                      </td>

                      {/* Total Jam Decimal */}
                      <td className="py-3.5 px-4 text-right font-mono font-extrabold text-white text-sm">
                        {hoursDecimal} <span className="text-xs font-normal text-amber-400">Jam</span>
                      </td>

                      {/* Format Duration */}
                      <td className="py-3.5 px-4 text-right font-mono text-[#A1A1AA]">
                        {formatDuration(stat.totalSeconds)}
                      </td>

                      {/* Active Status */}
                      <td className="py-3.5 px-4 text-center">
                        {stat.shiftCount > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Aktif Berdinas
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#18181B] border border-[#27272A] text-[#71717A] text-[10px] font-semibold">
                            Tidak Ada Shift
                          </span>
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
    </div>
  );
};
