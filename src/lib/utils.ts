import { Role } from '../types';

export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0s';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);

  return parts.join(' ');
}

export function formatDurationHMS(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00:00';
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export function formatHoursDecimal(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '0.0';
  return (seconds / 3600).toFixed(1);
}

export function formatDateTime(isoString: string): string {
  if (!isoString) return '-';
  const date = new Date(isoString);
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function formatDateShort(isoString: string): string {
  if (!isoString) return '-';
  const date = new Date(isoString);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTimeOnly(isoString: string): string {
  if (!isoString) return '-';
  const date = new Date(isoString);
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function isSupervisorOrHigher(role: Role): boolean {
  return role === 'TORQUE_MASTER' || role === 'MANAGER' || role === 'MODERATOR';
}

export function isManagerOrHigher(role: Role): boolean {
  return role === 'MANAGER' || role === 'MODERATOR';
}

export function getRoleLabel(role: Role): string {
  switch (role) {
    case 'MODERATOR':
      return 'Moderator (Full Access)';
    case 'MANAGER':
      return 'Manager';
    case 'TORQUE_MASTER':
      return 'Torque Master';
    case 'MECHANIC':
      return 'Mechanic';
    case 'TRAINEE':
      return 'Trainee';
    default:
      return role;
  }
}

export function getRoleBadgeClass(role: Role): string {
  switch (role) {
    case 'MODERATOR':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    case 'MANAGER':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    case 'TORQUE_MASTER':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'MECHANIC':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    case 'TRAINEE':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  }
}
