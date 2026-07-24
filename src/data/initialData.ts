import { User, ShiftLog, SupervisorLog } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_00',
    citizenId: 'SG-000',
    name: 'Moderator MDT',
    role: 'MODERATOR',
    department: 'MDT System Security & Administration',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    pin: '9999',
    joinedDate: '2023-12-01',
  },
  {
    id: 'usr_01',
    citizenId: 'SG-001',
    name: 'Geraldo Vance',
    role: 'MANAGER',
    department: 'Executive Management',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    pin: '1234',
    joinedDate: '2024-01-15',
  },
  {
    id: 'usr_02',
    citizenId: 'SG-002',
    name: 'Ramon Diaz',
    role: 'TORQUE_MASTER',
    department: 'Garage Workshop & Field Operations',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    pin: '7788',
    joinedDate: '2024-03-01',
  },
  {
    id: 'usr_03',
    citizenId: 'SG-003',
    name: 'Shandy Aulia',
    role: 'MECHANIC',
    department: 'Custom Tuning & Diagnostics',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    pin: '1111',
    joinedDate: '2024-06-10',
  },
  {
    id: 'usr_04',
    citizenId: 'SG-004',
    name: 'Eko Prasetyo',
    role: 'TRAINEE',
    department: 'Repairs & Towing',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    pin: '0000',
    joinedDate: '2025-02-18',
  }
];

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

export const INITIAL_SHIFTS: ShiftLog[] = [
  {
    id: 'shift_101',
    userId: 'usr_03',
    userName: 'Shandy Aulia',
    userRole: 'MECHANIC',
    station: 'Sandy Shores Garage',
    startTime: new Date(today.valueOf() - 1000 * 60 * 180).toISOString(), // Started 3 hrs ago
    durationSeconds: 10800,
    status: 'ACTIVE',
    notes: 'Engine rebuild for Sultan RS',
  },
  {
    id: 'shift_100',
    userId: 'usr_04',
    userName: 'Eko Prasetyo',
    userRole: 'TRAINEE',
    station: 'Sandy Shores Garage',
    startTime: new Date(yesterday.setHours(10, 0, 0)).toISOString(),
    endTime: new Date(yesterday.setHours(14, 30, 0)).toISOString(),
    durationSeconds: 16200, // 4.5 hours
    status: 'COMPLETED',
    notes: 'Standard vehicle maintenance & oil changes',
  },
  {
    id: 'shift_099',
    userId: 'usr_02',
    userName: 'Ramon Diaz',
    userRole: 'TORQUE_MASTER',
    station: 'Sandy Shores Garage',
    startTime: new Date(yesterday.setHours(15, 0, 0)).toISOString(),
    endTime: new Date(yesterday.setHours(20, 15, 0)).toISOString(),
    durationSeconds: 18900, // 5.25 hours
    status: 'COMPLETED',
    notes: 'Supervised evening shift & bodywork repairs',
  },
  {
    id: 'shift_098',
    userId: 'usr_04',
    userName: 'Eko Prasetyo',
    userRole: 'TRAINEE',
    station: 'Sandy Shores Garage',
    startTime: new Date(twoDaysAgo.setHours(13, 0, 0)).toISOString(),
    endTime: new Date(twoDaysAgo.setHours(16, 0, 0)).toISOString(),
    durationSeconds: 10800, // 3.0 hours
    status: 'FORCED_OFF_DUTY',
    forcedBy: 'Ramon Diaz (Torque Master)',
    forceReason: 'AFK / Unresponsive on radio during duty hours',
    notes: 'Mobile repair dispatched to Paleto Bay',
  },
  {
    id: 'shift_097',
    userId: 'usr_01',
    userName: 'Geraldo Vance',
    userRole: 'MANAGER',
    station: 'Sandy Shores Garage',
    startTime: new Date(twoDaysAgo.setHours(9, 0, 0)).toISOString(),
    endTime: new Date(twoDaysAgo.setHours(17, 0, 0)).toISOString(),
    durationSeconds: 28800, // 8.0 hours
    status: 'COMPLETED',
    notes: 'Inventory management & VIP client modifications',
  },
];

export const INITIAL_SUPERVISOR_LOGS: SupervisorLog[] = [
  {
    id: 'log_201',
    timestamp: new Date(twoDaysAgo.setHours(16, 0, 0)).toISOString(),
    action: 'FORCE_OFF_DUTY',
    actorId: 'usr_02',
    actorName: 'Ramon Diaz',
    actorRole: 'TORQUE_MASTER',
    targetId: 'usr_04',
    targetName: 'Eko Prasetyo',
    details: 'Forced Eko Prasetyo off duty after 3 hours. Reason: AFK / Unresponsive on radio during duty hours.',
    severity: 'WARNING',
    ipStub: '192.168.1.104 (MDT Term 02)',
  },
  {
    id: 'log_200',
    timestamp: new Date(twoDaysAgo.setHours(9, 0, 0)).toISOString(),
    action: 'ROLE_CHANGE',
    actorId: 'usr_01',
    actorName: 'Geraldo Vance',
    actorRole: 'MANAGER',
    targetId: 'usr_03',
    targetName: 'Shandy Aulia',
    details: 'Promoted Shandy Aulia from Trainee to Mechanic.',
    severity: 'INFO',
    ipStub: '192.168.1.101 (MDT Master)',
  },
  {
    id: 'log_199',
    timestamp: new Date(yesterday.setHours(8, 30, 0)).toISOString(),
    action: 'SYSTEM_AUDIT',
    actorId: 'usr_01',
    actorName: 'Geraldo Vance',
    actorRole: 'MANAGER',
    details: 'Performed weekly duty log integrity audit. All shifts verified.',
    severity: 'INFO',
    ipStub: '192.168.1.101 (MDT Master)',
  },
];
