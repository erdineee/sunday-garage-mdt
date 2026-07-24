export type Role = 'TRAINEE' | 'MECHANIC' | 'TORQUE_MASTER' | 'MANAGER' | 'MODERATOR';

export type LocationStation = 'Sandy Shores Garage';

export interface User {
  id: string;
  name: string;
  citizenId?: string;
  callsign?: string;
  role: Role;
  department: string;
  avatar: string;
  pin: string;
  password?: string;
  joinedDate: string;
}

export interface ShiftLog {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  callsign?: string;
  station: LocationStation;
  startTime: string; // ISO String
  endTime?: string; // ISO String
  durationSeconds: number;
  status: 'ACTIVE' | 'COMPLETED' | 'FORCED_OFF_DUTY';
  forcedBy?: string;
  forceReason?: string;
  notes?: string;
}

export interface SupervisorLog {
  id: string;
  timestamp: string; // ISO String
  action: 'FORCE_OFF_DUTY' | 'ROLE_CHANGE' | 'LOGIN_ATTEMPT' | 'DUTY_EDIT' | 'SYSTEM_AUDIT';
  actorId: string;
  actorName: string;
  actorRole: Role;
  targetId?: string;
  targetName?: string;
  details: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  ipStub: string;
}
