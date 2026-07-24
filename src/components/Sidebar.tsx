import React from 'react';
import { useMDT } from '../context/MDTContext';
import { getRoleBadgeClass, isSupervisorOrHigher } from '../lib/utils';
import { UserAvatar } from './UserAvatar';
import { 
  LayoutDashboard, 
  Clock, 
  ShieldCheck, 
  Users, 
  UserCheck, 
  ShieldAlert,
  LogOut,
  Settings
} from 'lucide-react';
import sundayGarageLogo from '../assets/images/sunday_garage_logo_1784860455988.jpg';

export type ActiveTab = 'dashboard' | 'duty-history' | 'supervisor-logs' | 'staff-directory' | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const { currentUser, activeShift, goOffDuty, logout } = useMDT();
  const isSupervisor = isSupervisorOrHigher(currentUser.role);

  const canAccessSupervisorLogs = currentUser.role === 'MANAGER' || currentUser.role === 'MODERATOR';

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      sublabel: 'Duty Management',
      icon: LayoutDashboard,
      restricted: false,
    },
    {
      id: 'duty-history' as ActiveTab,
      label: 'Duty History',
      sublabel: 'Otomatis Jam Shift',
      icon: Clock,
      restricted: false,
    },
    ...(canAccessSupervisorLogs ? [{
      id: 'supervisor-logs' as ActiveTab,
      label: 'Supervisor Logs',
      sublabel: 'Sistem Log Keamanan',
      icon: ShieldCheck,
      restricted: true,
      badge: 'Protected',
    }] : []),
    {
      id: 'staff-directory' as ActiveTab,
      label: 'Staff Directory',
      sublabel: 'MDT Personnel',
      icon: Users,
      restricted: false,
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Pengaturan & PIN',
      sublabel: 'Keamanan Akun',
      icon: Settings,
      restricted: false,
    },
  ];

  return (
    <aside className="w-64 bg-[#0F0F11] border-r border-[#27272A] flex flex-col justify-between shrink-0 h-screen sticky top-0 text-[#E4E4E7] select-none">
      
      {/* Brand Header */}
      <div>
        <div className="p-4 border-b border-[#27272A] bg-[#121214]">
          <div className="flex items-center gap-3">
            <img
              src={sundayGarageLogo}
              alt="Sunday Garage Logo"
              className="w-12 h-12 object-contain shrink-0 filter drop-shadow-md"
              referrerPolicy="no-referrer"
            />
            <div>
              <h1 className="font-extrabold text-sm text-white tracking-wide leading-tight">
                SUNDAY GARAGE
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  MSRP MDT
                </span>
                <span className="text-[10px] text-[#71717A] font-mono">v2.4</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isLocked = item.restricted && !isSupervisor;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full px-3.5 py-3 rounded-xl text-left flex items-center justify-between transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-black font-semibold shadow-md shadow-amber-500/10'
                    : 'text-[#A1A1AA] hover:text-[#E4E4E7] hover:bg-[#18181B]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-black' : 'text-[#A1A1AA] group-hover:text-amber-400'}`} />
                  <div>
                    <div className="text-xs font-semibold leading-tight">{item.label}</div>
                    <div className={`text-[10px] ${isActive ? 'text-black/80 font-medium' : 'text-[#71717A]'}`}>
                      {item.sublabel}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    isActive
                      ? 'bg-black/20 text-black'
                      : isLocked
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}>
                    {isLocked ? <ShieldAlert className="w-3 h-3 inline" /> : item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Status */}
      <div className="p-3 border-t border-[#27272A] bg-[#121214]">
        
        {/* Active Duty Status Pill */}
        <div className={`p-3 rounded-xl border mb-3 flex items-center justify-between transition-colors ${
          activeShift
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-[#0A0A0B] border-[#27272A] text-[#A1A1AA]'
        }`}>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {activeShift ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </>
              ) : (
                <span className="inline-flex rounded-full h-2.5 w-2.5 bg-[#71717A]"></span>
              )}
            </span>
            <div>
              <div className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider">Status Duty</div>
              <div className="text-xs font-bold text-white">
                {activeShift ? 'ON DUTY' : 'OFF DUTY'}
              </div>
            </div>
          </div>

          {activeShift && (
            <button
              onClick={() => goOffDuty()}
              title="Quick Off Duty"
              className="p-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 rounded-lg text-rose-300 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* User Card */}
        <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <UserAvatar src={currentUser.avatar} name={currentUser.name} sizeClass="w-9 h-9 text-xs" />
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold border ${getRoleBadgeClass(currentUser.role)}`}>
                  {currentUser.role}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={logout}
              title="Logout MDT Terminal"
              className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/30 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
