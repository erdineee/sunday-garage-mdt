import React, { useState } from 'react';
import { useMDT } from '../context/MDTContext';
import { isSupervisorOrHigher, formatDateTime } from '../lib/utils';
import { 
  ShieldAlert, 
  Lock, 
  Key, 
  ShieldCheck, 
  FileText, 
  Search, 
  Filter, 
  Download, 
  AlertTriangle,
  CheckCircle,
  Terminal,
  UserX,
  History
} from 'lucide-react';

export const SupervisorLogsView: React.FC = () => {
  const { currentUser, supervisorLogs, verifySupervisorPin, switchUser, users } = useMDT();
  const isSupervisor = isSupervisorOrHigher(currentUser.role);

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'AUDIT' | 'FORCE_LOGS'>('AUDIT');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Handle PIN unlock attempt directly from Access Denied page
  const handleUnlockWithPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifySupervisorPin(pinInput)) {
      // Find a supervisor user and switch
      const supUser = users.find(u => isSupervisorOrHigher(u.role)) || users[0];
      switchUser(supUser.id);
      setPinInput('');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  // If user is NOT a supervisor, render SECURE ACCESS DENIED SCREEN
  if (!isSupervisor) {
    return (
      <div className="max-w-2xl mx-auto my-8 p-8 bg-[#121214] border-2 border-rose-500/40 rounded-3xl shadow-2xl text-[#E4E4E7] text-center space-y-6">
        
        {/* Shield graphic */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-500/10 border-2 border-rose-500/40 flex items-center justify-center text-rose-400 shadow-xl shadow-rose-950/50">
          <ShieldAlert className="w-10 h-10 animate-pulse" />
        </div>

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold uppercase tracking-widest mb-3">
            <Lock className="w-3.5 h-3.5" /> 403 Restricted Area
          </div>
          <h2 className="text-2xl font-black text-white">AKSES LOG SUPERVISOR DITOLAK</h2>
          <p className="text-xs text-[#A1A1AA] mt-2 max-w-md mx-auto leading-relaxed">
            Halaman ini merupakan sistem keamanan tertutup untuk Supervisor &amp; Manager Sunday Garage MSRP. Akun Anda saat ini (<strong className="text-amber-400">{currentUser.name} - {currentUser.role}</strong>) tidak memiliki hak akses clearance.
          </p>
        </div>

        {/* PIN Unlock / Account Switch Box */}
        <div className="bg-[#18181B] border border-[#27272A] p-6 rounded-2xl max-w-md mx-auto text-left space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#E4E4E7]">
            <Key className="w-4 h-4 text-amber-500" />
            <span>Masukkan PIN Keamanan Supervisor untuk Buka Akses:</span>
          </div>

          <form onSubmit={handleUnlockWithPin} className="space-y-3">
            <div className="relative">
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="PIN Keamanan (Default: 7788)"
                className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#71717A] focus:outline-none focus:border-amber-500 font-mono tracking-widest"
              />
            </div>

            {pinError && (
              <p className="text-xs text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> PIN Salah! Gunakan PIN Supervisor 7788.
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-black transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" /> Buka Akses Log Supervisor
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filter logs
  const filteredLogs = supervisorLogs.filter((log) => {
    if (activeSubTab === 'FORCE_LOGS' && log.action !== 'FORCE_OFF_DUTY') {
      return false;
    }

    if (filterSeverity !== 'ALL' && log.severity !== filterSeverity) {
      return false;
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchActor = (log.actorName || '').toLowerCase().includes(term);
      const matchTarget = (log.targetName || '').toLowerCase().includes(term);
      const matchDetails = (log.details || '').toLowerCase().includes(term);
      if (!matchActor && !matchTarget && !matchDetails) return false;
    }

    return true;
  });

  const exportLogsToCSV = () => {
    const headers = ['Log ID', 'Waktu Timestamp', 'Action', 'Severity', 'Actor', 'Target Staff', 'Details Log', 'Terminal IP'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.timestamp,
      l.action,
      l.severity,
      `"${l.actorName}"`,
      `"${l.targetName || '-'}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      l.ipStub
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Supervisor_Audit_Log_SundayGarage_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272A] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Sistem Log Keamanan Supervisor</h2>
              <p className="text-xs text-[#A1A1AA] mt-0.5">
                Audit Trail Terenkripsi Sunday Garage MSRP (Supervisor &amp; Manager Only)
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={exportLogsToCSV}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-amber-500/10 transition-all self-start md:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Log</span>
        </button>
      </div>

      {/* Sub-tab Navigation matching reference screenshot "Force Off Duty Log" */}
      <div className="flex items-center gap-3 border-b border-[#27272A] pb-3">
        <button
          onClick={() => setActiveSubTab('AUDIT')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'AUDIT'
              ? 'bg-amber-500 text-black shadow-md'
              : 'bg-[#121214] text-[#A1A1AA] hover:text-white border border-[#27272A]'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Semua Log Audit Systems</span>
        </button>

        <button
          onClick={() => setActiveSubTab('FORCE_LOGS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'FORCE_LOGS'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-[#121214] text-[#A1A1AA] hover:text-white border border-[#27272A]'
          }`}
        >
          <UserX className="w-4 h-4" />
          <span>Force Off Duty Log</span>
          <span className="px-1.5 py-0.2 rounded bg-black/40 text-[10px] font-mono">
            {supervisorLogs.filter(l => l.action === 'FORCE_OFF_DUTY').length}
          </span>
        </button>
      </div>

      {/* Controls */}
      <div className="bg-[#121214] border border-[#27272A] rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari actor, target, detail log..."
            className="w-full bg-[#18181B] border border-[#27272A] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-[#A1A1AA] shrink-0" />
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Semua Tingkat Severity</option>
            <option value="INFO">Info</option>
            <option value="WARNING">Warning</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#121214] border border-[#27272A] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#18181B] border-b border-[#27272A] text-[#A1A1AA] font-mono uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Timestamp MDT</th>
                <th className="px-4 py-3.5">Action Event</th>
                <th className="px-4 py-3.5">Actor (Supervisor)</th>
                <th className="px-4 py-3.5">Target Staff</th>
                <th className="px-5 py-3.5">Detail &amp; Alasan Log</th>
                <th className="px-4 py-3.5 text-right">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A] text-[#E4E4E7]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#71717A] italic">
                    Belum ada log Supervisor yang tercatat untuk kriteria ini.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  return (
                    <tr key={log.id} className="hover:bg-[#18181B]/60 transition-colors">
                      
                      {/* Timestamp */}
                      <td className="px-5 py-4 font-mono text-[#E4E4E7] whitespace-nowrap">
                        {formatDateTime(log.timestamp)}
                        <div className="text-[10px] text-[#71717A]">{log.ipStub}</div>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-[10px]">
                          {log.action}
                        </span>
                      </td>

                      {/* Actor */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-bold text-white">{log.actorName}</div>
                        <div className="text-[10px] text-[#A1A1AA] font-mono">{log.actorRole}</div>
                      </td>

                      {/* Target */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {log.targetName ? (
                          <span className="font-medium text-[#E4E4E7]">{log.targetName}</span>
                        ) : (
                          <span className="text-[#71717A] font-mono">-</span>
                        )}
                      </td>

                      {/* Details */}
                      <td className="px-5 py-4">
                        <div className="text-[#E4E4E7] leading-relaxed">{log.details}</div>
                      </td>

                      {/* Severity */}
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        {log.severity === 'CRITICAL' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            CRITICAL
                          </span>
                        )}
                        {log.severity === 'WARNING' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            WARNING
                          </span>
                        )}
                        {log.severity === 'INFO' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                            INFO
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
