import React, { useState, useEffect } from 'react';
import { useMDT } from '../context/MDTContext';
import { isSupervisorOrHigher } from '../lib/utils';
import { ShieldCheck, Radio, LogOut } from 'lucide-react';
import sundayGarageLogo from '../assets/images/sunday_garage_logo_1784860455988.jpg';

export const Header: React.FC = () => {
  const { currentUser, logout } = useMDT();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' WIB'
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isSupervisor = isSupervisorOrHigher(currentUser.role);

  return (
    <header className="bg-[#121214] border-b border-[#27272A] px-6 py-3 flex items-center justify-between text-[#E4E4E7] sticky top-0 z-40 select-none">
      
      {/* Left Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-mono text-[#A1A1AA] bg-[#0A0A0B] px-3 py-1.5 rounded-lg border border-[#27272A]">
          <Radio className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span>MDT SERVER TIME:</span>
          <span className="font-bold text-amber-400">{time || '00:00:00'}</span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-[#A1A1AA] border-l border-[#27272A] pl-4">
          <span className="text-[#71717A]">MDT Target:</span>
          <div className="flex items-center gap-1.5 font-semibold text-[#E4E4E7]">
            <img src={sundayGarageLogo} alt="Sunday Garage Logo" className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
            <span>Sunday Garage MSRP</span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        
        {/* Supervisor Clearance Badge */}
        {isSupervisor ? (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Supervisor Clearance Active</span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-[#18181B] border border-[#27272A] text-[#A1A1AA] rounded-lg text-xs font-medium">
            <span>Mechanic Access</span>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={logout}
          title="Logout Halaman Login MDT"
          className="px-3.5 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 hover:text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
