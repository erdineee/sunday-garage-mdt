import React, { useState } from 'react';
import { useMDT } from '../context/MDTContext';
import { LocationStation, ShiftLog } from '../types';
import { 
  formatDurationHMS, 
  formatHoursDecimal, 
  isSupervisorOrHigher 
} from '../lib/utils';
import { ForceOffDutyModal } from './ForceOffDutyModal';
import { UserAvatar } from './UserAvatar';
import { 
  Clock, 
  Play, 
  Square, 
  MapPin, 
  Users, 
  CheckCircle2, 
  ShieldAlert, 
  CalendarDays,
  Wrench,
  Radio,
  Timer
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    currentUser, 
    users,
    shifts, 
    activeShift, 
    liveTimerSeconds, 
    goOnDuty, 
    goOffDuty 
  } = useMDT();

  const [selectedStation, setSelectedStation] = useState<LocationStation>('Sandy Shores Garage');
  const [forceShiftTarget, setForceShiftTarget] = useState<ShiftLog | null>(null);
  const [shiftNotes, setShiftNotes] = useState('');

  const isSupervisor = isSupervisorOrHigher(currentUser.role);

  // Calculate Metrics
  const activeShiftsList = shifts.filter(s => s.status === 'ACTIVE');
  
  // Today's total duty seconds for logged in user
  const todayISO = new Date().toISOString().slice(0, 10);
  const userTodayShifts = shifts.filter(
    s => s.userId === currentUser.id && s.startTime.startsWith(todayISO)
  );
  
  const userTodaySeconds = userTodayShifts.reduce((acc, s) => {
    if (s.status === 'ACTIVE') return acc + liveTimerSeconds;
    return acc + (s.durationSeconds || 0);
  }, 0);

  // Month total duty seconds for logged in user
  const currentMonthISO = new Date().toISOString().slice(0, 7);
  const userMonthShifts = shifts.filter(
    s => s.userId === currentUser.id && s.startTime.startsWith(currentMonthISO)
  );

  const userMonthSeconds = userMonthShifts.reduce((acc, s) => {
    if (s.status === 'ACTIVE') return acc + liveTimerSeconds;
    return acc + (s.durationSeconds || 0);
  }, 0);

  const totalShiftsCount = userMonthShifts.length;

  const stationOptions: LocationStation[] = [
    'Sandy Shores Garage',
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Title Header matching reference screenshot style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272A] pb-5">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Dashboard</h2>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Duty Management - On Duty / Off Duty System Sunday Garage MSRP
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#A1A1AA]">Status Anda:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
            activeShift
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 animate-pulse'
              : 'bg-[#18181B] text-[#A1A1AA] border border-[#27272A]'
          }`}>
            {activeShift ? `● ON DUTY (${activeShift.station})` : '○ OFF DUTY'}
          </span>
        </div>
      </div>

      {/* Metric Cards Grid - Matching screenshot layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Duty Today */}
        <div className="bg-[#121214] border border-[#27272A] rounded-2xl p-4 shadow-lg hover:border-[#3F3F46] transition-colors">
          <div className="flex items-center justify-between text-[#A1A1AA] mb-2">
            <span className="text-xs font-medium text-[#A1A1AA]">Total Duty Today</span>
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              {formatHoursDecimal(userTodaySeconds)}
            </span>
            <span className="text-xs font-semibold text-[#A1A1AA]">jam</span>
          </div>
          <div className="text-[11px] text-[#71717A] mt-2 flex items-center justify-between">
            <span>Hari ini ({new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })})</span>
            <span className="text-blue-400 font-mono font-medium">Auto-logged</span>
          </div>
        </div>

        {/* Metric 2: Total Duty Month */}
        <div className="bg-[#121214] border border-[#27272A] rounded-2xl p-4 shadow-lg hover:border-[#3F3F46] transition-colors">
          <div className="flex items-center justify-between text-[#A1A1AA] mb-2">
            <span className="text-xs font-medium text-[#A1A1AA]">Total Duty Month</span>
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              {formatHoursDecimal(userMonthSeconds)}
            </span>
            <span className="text-xs font-semibold text-[#A1A1AA]">jam</span>
          </div>
          <div className="text-[11px] text-[#71717A] mt-2 flex items-center justify-between">
            <span>Bulan Ini ({new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })})</span>
            <span className="text-amber-400 font-mono font-medium">{totalShiftsCount} Shift</span>
          </div>
        </div>

        {/* Metric 3: Active On Duty Staff */}
        <div className="bg-[#121214] border border-[#27272A] rounded-2xl p-4 shadow-lg hover:border-[#3F3F46] transition-colors">
          <div className="flex items-center justify-between text-[#A1A1AA] mb-2">
            <span className="text-xs font-medium text-[#A1A1AA]">Active Staff On Duty</span>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {activeShiftsList.length}
            </span>
            <span className="text-xs font-semibold text-[#A1A1AA]">personil aktif</span>
          </div>
          <div className="text-[11px] text-[#71717A] mt-2 flex items-center justify-between">
            <span>Realtime Garage Monitoring</span>
            <span className="text-emerald-400 font-mono">Online</span>
          </div>
        </div>

        {/* Metric 4: MDT System Status */}
        <div className="bg-[#121214] border border-[#27272A] rounded-2xl p-4 shadow-lg hover:border-[#3F3F46] transition-colors">
          <div className="flex items-center justify-between text-[#A1A1AA] mb-2">
            <span className="text-xs font-medium text-[#A1A1AA]">Log System Security</span>
            <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-white flex items-center gap-1.5 mt-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>MSRP Security OK</span>
          </div>
          <div className="text-[11px] text-[#71717A] mt-3 flex items-center justify-between">
            <span>Supervisor Audit Log</span>
            <span className="text-purple-400 font-mono">Protected</span>
          </div>
        </div>
      </div>

      {/* Main Duty Control Box */}
      <div className={`p-6 rounded-2xl border transition-all shadow-xl ${
        activeShift
          ? 'bg-gradient-to-br from-[#0F1E17] to-[#121214] border-emerald-500/40'
          : 'bg-[#121214] border-[#27272A]'
      }`}>
        
        {/* Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272A] pb-4">
          <div>
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#A1A1AA] mb-1 flex items-center gap-2">
              <Radio className={`w-3.5 h-3.5 ${activeShift ? 'text-emerald-400 animate-pulse' : 'text-[#71717A]'}`} />
              <span>Duty Control Console</span>
            </div>
            <h3 className="text-lg font-bold text-white">
              {activeShift ? (
                <span className="text-emerald-400 flex items-center gap-2">
                  You are currently ON DUTY
                </span>
              ) : (
                <span className="text-[#E4E4E7]">You are currently OFF DUTY</span>
              )}
            </h3>
            <p className="text-xs text-[#A1A1AA] mt-1">
              {activeShift
                ? `Terhubung di station: ${activeShift.station}. Durasi shift berjalan otomatis dicatat.`
                : 'Pilih lokasi station di bawah ini dan klik tombol untuk memulai On Duty.'}
            </p>
          </div>

          {/* Running Timer Display */}
          {activeShift && (
            <div className="p-4 bg-[#0A0A0B] rounded-xl border border-emerald-500/30 text-center min-w-[200px] shadow-inner">
              <div className="text-[10px] font-mono font-semibold text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1">
                <Timer className="w-3.5 h-3.5 animate-spin" /> Live Shift Ticker
              </div>
              <div className="text-3xl font-black font-mono text-emerald-300 mt-1 tracking-wider">
                {formatDurationHMS(liveTimerSeconds)}
              </div>
              <div className="text-[10px] text-[#A1A1AA] mt-1">
                Mulai: {new Date(activeShift.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          )}
        </div>

        {/* On Duty Station Selector & Toggle Buttons */}
        <div className="mt-5 space-y-4">
          {!activeShift ? (
            <div>
              <div className="text-xs font-semibold text-[#E4E4E7] mb-3 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>Pilih Lokasi Duty Garage:</span>
              </div>

              {/* Station Selection Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {stationOptions.map((st) => {
                  const isSel = selectedStation === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSelectedStation(st)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSel
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-semibold shadow-md'
                          : 'bg-[#18181B] border-[#27272A] text-[#A1A1AA] hover:border-[#3F3F46] hover:text-[#E4E4E7]'
                      }`}
                    >
                      <div className="text-xs font-bold flex items-center justify-between">
                        <span>{st}</span>
                        {isSel && <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />}
                      </div>
                      <div className="text-[10px] text-[#71717A] mt-1">
                        Station Sunday Garage
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Notes Input Optional */}
              <div className="mt-4">
                <input
                  type="text"
                  value={shiftNotes}
                  onChange={(e) => setShiftNotes(e.target.value)}
                  placeholder="Catatan shift awal (Opsional: cth: Rebuild mesin, Towing patrol, dll)"
                  className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Action Buttons styled like reference image */}
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => goOnDuty(selectedStation, shiftNotes)}
                  className="px-6 py-3 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-black flex items-center gap-2 shadow-lg shadow-amber-500/10 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>On Duty - {selectedStation}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Currently On Duty Controls */
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0A0A0B] p-4 rounded-xl border border-[#27272A]">
              <div>
                <div className="text-xs text-[#E4E4E7] font-semibold">
                  Shift aktif oleh <span className="text-amber-400 font-bold">{currentUser.name}</span>
                </div>
                <div className="text-xs text-[#A1A1AA] mt-1">
                  Durasi shift akan dicatat otomatis ke dalam <strong className="text-[#E4E4E7]">Jam History</strong> saat Anda mematikan duty.
                </div>
              </div>

              <button
                onClick={() => goOffDuty()}
                className="px-6 py-3 rounded-xl font-bold text-sm bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-2 shadow-lg shadow-rose-950/50 transition-all shrink-0 cursor-pointer"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Go OFF DUTY Sekarang</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Duty Personnel Sections by Station (Matching screenshot display) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            <span>Personil Aktif On Duty Saat Ini ({activeShiftsList.length})</span>
          </h3>
          <span className="text-xs text-[#A1A1AA]">Live MDT Updates</span>
        </div>

        {stationOptions.map((st) => {
          const stationShifts = activeShiftsList.filter(s => s.station === st);

          return (
            <div key={st} className="bg-[#121214] border border-[#27272A] rounded-2xl overflow-hidden">
              
              {/* Station Header */}
              <div className="bg-[#18181B] px-5 py-3 border-b border-[#27272A] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-sm text-white">{st}</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    Active Duty ({stationShifts.length})
                  </span>
                </div>
                <span className="text-xs text-[#71717A]">MSRP Garage Branch</span>
              </div>

              {/* Personnel Cards */}
              <div className="p-4">
                {stationShifts.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[#71717A] italic">
                    Tidak ada personil yang sedang on duty di {st}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {stationShifts.map((s) => {
                      const elapsedSecs = s.userId === currentUser.id
                        ? liveTimerSeconds
                        : Math.max(0, Math.floor((Date.now() - new Date(s.startTime).getTime()) / 1000));

                      const shiftUser = users.find(u => u.id === s.userId);

                      return (
                        <div
                          key={s.id}
                          className="p-3.5 bg-[#18181B] border border-[#27272A] rounded-xl flex items-center justify-between hover:border-[#3F3F46] transition-colors gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <UserAvatar src={shiftUser?.avatar} name={s.userName} sizeClass="w-9 h-9 text-xs" />
                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-white truncate">{s.userName}</span>
                              </div>
                              <div className="text-[10px] text-[#A1A1AA] flex items-center gap-2">
                                <span>Role: {s.userRole}</span>
                                <span>•</span>
                                <span className="font-mono text-emerald-400 font-semibold">
                                  {formatDurationHMS(elapsedSecs)}
                                </span>
                              </div>
                              {s.notes && (
                                <div className="text-[10px] text-[#71717A] italic truncate max-w-[180px]">
                                  "{s.notes}"
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Supervisor Force Off Duty action */}
                          {isSupervisor && s.userId !== currentUser.id && (
                            <button
                              onClick={() => setForceShiftTarget(s)}
                              title="Force Off Duty (Supervisor Only)"
                              className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" /> Force Off
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Force Off Duty Modal */}
      <ForceOffDutyModal
        shift={forceShiftTarget}
        onClose={() => setForceShiftTarget(null)}
      />
    </div>
  );
};
