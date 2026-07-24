import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ShiftLog, SupervisorLog, LocationStation, Role } from '../types';
import { INITIAL_USERS, INITIAL_SHIFTS, INITIAL_SUPERVISOR_LOGS } from '../data/initialData';
import { isSupervisorOrHigher, isManagerOrHigher } from '../lib/utils';

interface MDTContextType {
  isAuthenticated: boolean;
  currentUser: User;
  users: User[];
  shifts: ShiftLog[];
  supervisorLogs: SupervisorLog[];
  activeShift: ShiftLog | null;
  liveTimerSeconds: number;
  login: (identifier: string, pin: string) => { success: boolean; message?: string };
  loginAsUser: (userId: string) => void;
  logout: () => void;
  addUser: (newUserData: { name: string; role: Role; department?: string; pin: string; avatar?: string }) => void;
  goOnDuty: (station: LocationStation, notes?: string) => void;
  goOffDuty: (notes?: string) => void;
  forceOffDuty: (shiftId: string, reason: string) => void;
  switchUser: (userId: string) => void;
  updateUserRole: (userId: string, newRole: Role) => void;
  addShiftNote: (shiftId: string, notes: string) => void;
  addManualShiftLog: (userId: string, station: LocationStation, startTime: string, endTime: string, notes?: string) => void;
  deleteShiftLog: (shiftId: string) => void;
  deleteUser: (userId: string) => { success: boolean; message?: string };
  changeCurrentUserPin: (oldPin: string, newPin: string) => { success: boolean; message?: string };
  adminUpdateUserPin: (targetUserId: string, newPin: string) => { success: boolean; message?: string };
  updateUserAvatar: (userId: string, avatarUrl: string) => void;
  verifySupervisorPin: (pin: string) => boolean;
  resetAllData: () => void;
  clearProductionData: () => void;
  removeAllDemoUsers: () => void;
}

const MDTContext = createContext<MDTContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_USERS = 'sg_msrp_mdt_users_v1';
const LOCAL_STORAGE_KEY_SHIFTS = 'sg_msrp_mdt_shifts_v1';
const LOCAL_STORAGE_KEY_LOGS = 'sg_msrp_mdt_logs_v1';
const LOCAL_STORAGE_KEY_CURRENT_USER = 'sg_msrp_mdt_current_user_id_v1';
const LOCAL_STORAGE_KEY_AUTH = 'sg_msrp_mdt_authenticated_v1';

export const MDTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const savedAuth = localStorage.getItem(LOCAL_STORAGE_KEY_AUTH);
    return savedAuth === 'true';
});

  // Load initial state from localStorage or fallback
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_USERS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_USER) || '';
});

  const [shifts, setShifts] = useState<ShiftLog[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SHIFTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_SHIFTS;
  });

  const [supervisorLogs, setSupervisorLogs] = useState<SupervisorLog[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_LOGS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_SUPERVISOR_LOGS;
  });

  // Save to localStorage on state changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_SHIFTS, JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_LOGS, JSON.stringify(supervisorLogs));
  }, [supervisorLogs]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_CURRENT_USER, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_AUTH, String(isAuthenticated));
  }, [isAuthenticated]);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  // Authentication Login Handler
  const login = (identifier: string, pin: string): { success: boolean; message?: string } => {
    const cleanIdentifier = identifier.trim().toLowerCase();
    const cleanAlphaNum = cleanIdentifier.replace(/[^a-z0-9]/g, '');
    const cleanPin = pin.trim();

    if (!cleanIdentifier && !cleanPin) {
      return { success: false, message: 'Harap masukkan ID Karyawan / Nama dan PIN.' };
    }

    // 1. Find user by matching ID (id, citizenId), exact name, or callsign
    let matchedUser = users.find(u => {
      const uId = (u.id || '').toLowerCase();
      const uCitizenId = (u.citizenId || '').toLowerCase();
      const uName = (u.name || '').toLowerCase();
      const uCallsign = (u.callsign || '').toLowerCase();

      return (
        uId === cleanIdentifier ||
        uCitizenId === cleanIdentifier ||
        (cleanAlphaNum.length > 0 && uId.replace(/[^a-z0-9]/g, '') === cleanAlphaNum) ||
        (cleanAlphaNum.length > 0 && uCitizenId.replace(/[^a-z0-9]/g, '') === cleanAlphaNum) ||
        uName === cleanIdentifier ||
        (uCallsign && uCallsign === cleanIdentifier)
      );
    });

    // 2. If exact/ID match not found, check partial name match
    if (!matchedUser && cleanIdentifier.length >= 2) {
      matchedUser = users.find(u => (u.name || '').toLowerCase().includes(cleanIdentifier));
    }

    // 3. Strict rejection if user is not found in registered staff
    if (!matchedUser) {
      return { 
        success: false, 
        message: `ID Karyawan / Nama "${identifier}" tidak terdaftar di sistem MDT.` 
      };
    }

    // 4. Validate PIN
    if (matchedUser.pin && !cleanPin) {
      return { 
        success: false, 
        message: `Masukkan PIN / Password untuk akun ${matchedUser.name} (${matchedUser.citizenId || matchedUser.id}).` 
      };
    }

    if (matchedUser.pin && cleanPin !== matchedUser.pin) {
      return { 
        success: false, 
        message: 'PIN / Password MDT tidak sesuai.' 
      };
    }

    setCurrentUserId(matchedUser.id);
    setIsAuthenticated(true);

    logAuditAction(
      'LOGIN_ATTEMPT',
      { id: matchedUser.id, name: matchedUser.name },
      `User ${matchedUser.name} (${matchedUser.role}) [ID: ${matchedUser.citizenId || matchedUser.id}] successfully authenticated to MDT Terminal.`,
      'INFO'
    );

    return { success: true };
  };

  const loginAsUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      setCurrentUserId(target.id);
      setIsAuthenticated(true);
      logAuditAction(
        'LOGIN_ATTEMPT',
        { id: target.id, name: target.name },
        `User ${target.name} (${target.role}) logged in via Quick Staff Login.`,
        'INFO'
      );
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    logAuditAction(
      'LOGIN_ATTEMPT',
      { id: currentUser.id, name: currentUser.name },
      `User ${currentUser.name} logged out from MDT Terminal session.`,
      'INFO'
    );
  };

  const addUser = (newUserData: { name: string; citizenId?: string; role: Role; department?: string; pin: string; avatar?: string }) => {
    if (!isSupervisorOrHigher(currentUser.role)) {
      alert('Akses Ditolak: Hanya Supervisor/Manager (Moderator) yang dapat membuat akun karyawan baru.');
      return;
    }

    const defaultAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    ];
    const randomAvatar = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

    const nextNum = users.length;
    const generatedCitizenId = `SG-${String(nextNum).padStart(3, '0')}`;

    const newUser: User = {
      id: `usr_${Date.now()}`,
      citizenId: newUserData.citizenId?.trim() || generatedCitizenId,
      name: newUserData.name.trim(),
      role: newUserData.role,
      department: newUserData.department?.trim() || 'Garage Workshop & Field Operations',
      avatar: newUserData.avatar?.trim() || randomAvatar,
      pin: newUserData.pin.trim() || '1234',
      joinedDate: new Date().toISOString().split('T')[0],
    };

    setUsers(prev => [...prev, newUser]);

    logAuditAction(
      'ROLE_CHANGE',
      { id: newUser.id, name: newUser.name },
      `Moderator ${currentUser.name} (${currentUser.role}) membuat akun karyawan baru: ${newUser.name} [Role: ${newUser.role}].`,
      'INFO'
    );
  };

  // Active shift for current user
  const activeShift = shifts.find(s => s.userId === currentUser.id && s.status === 'ACTIVE') || null;

  // Live timer tick for active shift
  const [liveTimerSeconds, setLiveTimerSeconds] = useState<number>(0);

  useEffect(() => {
    if (!activeShift) {
      setLiveTimerSeconds(0);
      return;
    }

    const calculateElapsed = () => {
      const startMs = new Date(activeShift.startTime).getTime();
      const nowMs = Date.now();
      const elapsed = Math.max(0, Math.floor((nowMs - startMs) / 1000));
      setLiveTimerSeconds(elapsed);
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 1000);
    return () => clearInterval(interval);
  }, [activeShift]);

  // Helper to append a supervisor log
  const logAuditAction = (
    action: SupervisorLog['action'],
    target?: { id: string; name: string },
    details: string = '',
    severity: SupervisorLog['severity'] = 'INFO'
  ) => {
    const newLog: SupervisorLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      action,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      targetId: target?.id,
      targetName: target?.name,
      details,
      severity,
      ipStub: '192.168.1.108 (MDT Terminal)',
    };
    setSupervisorLogs(prev => [newLog, ...prev]);
  };

  // On Duty action
  const goOnDuty = (station: LocationStation, notes?: string) => {
    // If user is already on duty, stop
    if (activeShift) return;

    const newShift: ShiftLog = {
      id: `shift_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      callsign: currentUser.callsign,
      station,
      startTime: new Date().toISOString(),
      durationSeconds: 0,
      status: 'ACTIVE',
      notes: notes || '',
    };

    setShifts(prev => [newShift, ...prev]);
    logAuditAction(
      'SYSTEM_AUDIT',
      { id: currentUser.id, name: currentUser.name },
      `${currentUser.name} (${currentUser.callsign}) started ON DUTY shift at ${station}.`,
      'INFO'
    );
  };

  // Off Duty action
  const goOffDuty = (notes?: string) => {
    if (!activeShift) return;

    const endTimeISO = new Date().toISOString();
    const startTimeMs = new Date(activeShift.startTime).getTime();
    const endTimeMs = new Date(endTimeISO).getTime();
    const durationSeconds = Math.max(0, Math.floor((endTimeMs - startTimeMs) / 1000));

    setShifts(prev =>
      prev.map(s => {
        if (s.id === activeShift.id) {
          return {
            ...s,
            endTime: endTimeISO,
            durationSeconds,
            status: 'COMPLETED',
            notes: notes !== undefined ? notes : s.notes,
          };
        }
        return s;
      })
    );

    logAuditAction(
      'SYSTEM_AUDIT',
      { id: currentUser.id, name: currentUser.name },
      `${currentUser.name} (${currentUser.callsign}) completed shift at ${activeShift.station}. Total duration: ${(durationSeconds / 3600).toFixed(2)} hours.`,
      'INFO'
    );
  };

  // Force Off Duty action (Supervisor/Manager only)
  const forceOffDuty = (shiftId: string, reason: string) => {
    if (!isSupervisorOrHigher(currentUser.role)) {
      alert('Akses Ditolak: Hanya Supervisor/Manager yang dapat melakukan Force Off Duty!');
      return;
    }

    const targetShift = shifts.find(s => s.id === shiftId);
    if (!targetShift) return;

    const endTimeISO = new Date().toISOString();
    const startTimeMs = new Date(targetShift.startTime).getTime();
    const endTimeMs = new Date(endTimeISO).getTime();
    const durationSeconds = Math.max(0, Math.floor((endTimeMs - startTimeMs) / 1000));

    setShifts(prev =>
      prev.map(s => {
        if (s.id === shiftId) {
          return {
            ...s,
            endTime: endTimeISO,
            durationSeconds,
            status: 'FORCED_OFF_DUTY',
            forcedBy: `${currentUser.name} (${currentUser.role})`,
            forceReason: reason,
          };
        }
        return s;
      })
    );

    logAuditAction(
      'FORCE_OFF_DUTY',
      { id: targetShift.userId, name: targetShift.userName },
      `FORCE OFF DUTY executed by Supervisor ${currentUser.name} on ${targetShift.userName} (${targetShift.callsign}). Station: ${targetShift.station}. Reason: "${reason}".`,
      'WARNING'
    );
  };

  // Switch User (Role testing)
  const switchUser = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUserId(found.id);
      logAuditAction(
        'LOGIN_ATTEMPT',
        { id: found.id, name: found.name },
        `Session switched to user profile: ${found.name} (${found.role}).`,
        'INFO'
      );
    }
  };

  // Update user role
  const updateUserRole = (userId: string, newRole: Role) => {
    if (!isSupervisorOrHigher(currentUser.role)) return;

    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          return { ...u, role: newRole };
        }
        return u;
      })
    );

    const target = users.find(u => u.id === userId);
    logAuditAction(
      'ROLE_CHANGE',
      target ? { id: target.id, name: target.name } : undefined,
      `Role updated for ${target?.name || userId} to ${newRole} by ${currentUser.name}.`,
      'WARNING'
    );
  };

  // Add note to shift log
  const addShiftNote = (shiftId: string, notes: string) => {
    setShifts(prev =>
      prev.map(s => (s.id === shiftId ? { ...s, notes } : s))
    );
  };

  // Add manual shift log
  const addManualShiftLog = (
    userId: string,
    station: LocationStation,
    startTime: string,
    endTime: string,
    notes?: string
  ) => {
    if (!isSupervisorOrHigher(currentUser.role)) return;

    const user = users.find(u => u.id === userId);
    if (!user) return;

    const startMs = new Date(startTime).getTime();
    const endMs = new Date(endTime).getTime();
    const durationSeconds = Math.max(0, Math.floor((endMs - startMs) / 1000));

    const manualShift: ShiftLog = {
      id: `shift_manual_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      callsign: user.callsign,
      station,
      startTime,
      endTime,
      durationSeconds,
      status: 'COMPLETED',
      notes: notes ? `[Manual Entry] ${notes}` : '[Manual Entry by Supervisor]',
    };

    setShifts(prev => [manualShift, ...prev]);

    logAuditAction(
      'DUTY_EDIT',
      { id: user.id, name: user.name },
      `Manual shift log added by Supervisor ${currentUser.name} for ${user.name}. Duration: ${(durationSeconds / 3600).toFixed(2)} hours.`,
      'INFO'
    );
  };

  // Delete shift log (Manager / Moderator privilege)
  const deleteShiftLog = (shiftId: string) => {
    if (!isManagerOrHigher(currentUser.role)) return;

    const target = shifts.find(s => s.id === shiftId);
    setShifts(prev => prev.filter(s => s.id !== shiftId));

    if (target) {
      logAuditAction(
        'DUTY_EDIT',
        { id: target.userId, name: target.userName },
        `Shift record #${shiftId} deleted by ${currentUser.role} ${currentUser.name}.`,
        'WARNING'
      );
    }
  };

  // Delete user (Manager / Moderator privilege)
  const deleteUser = (userId: string): { success: boolean; message?: string } => {
    if (!isManagerOrHigher(currentUser.role)) {
      return { success: false, message: 'Akses Ditolak: Hanya Moderator dan Manager yang berhak menghapus akun karyawan.' };
    }

    if (userId === currentUser.id) {
      return { success: false, message: 'Tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.' };
    }

    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) {
      return { success: false, message: 'Data karyawan tidak ditemukan.' };
    }

    setUsers(prev => prev.filter(u => u.id !== userId));

    logAuditAction(
      'ROLE_CHANGE',
      { id: targetUser.id, name: targetUser.name },
      `${currentUser.role} ${currentUser.name} menghapus akun karyawan: ${targetUser.name} [Role: ${targetUser.role}] dari sistem MDT.`,
      'WARNING'
    );

    return { success: true };
  };

  // Change current user's PIN/Password
  const changeCurrentUserPin = (oldPin: string, newPin: string): { success: boolean; message?: string } => {
    if (!newPin || newPin.trim().length < 4) {
      return { success: false, message: 'PIN / Password baru minimal 4 karakter.' };
    }
    
    // Validate old PIN unless current user is MODERATOR
    if (currentUser.role !== 'MODERATOR' && currentUser.pin && currentUser.pin !== oldPin.trim()) {
      return { success: false, message: 'PIN / Password lama tidak sesuai.' };
    }

    const updatedPin = newPin.trim();
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, pin: updatedPin } : u));

    logAuditAction(
      'SYSTEM_AUDIT',
      { id: currentUser.id, name: currentUser.name },
      `User ${currentUser.name} (${currentUser.role}) memperbarui PIN / Password akun.`,
      'INFO'
    );

    return { success: true, message: 'PIN / Password Anda berhasil diubah!' };
  };

  // Admin/Manager/Moderator update any user's PIN/Password
  const adminUpdateUserPin = (targetUserId: string, newPin: string): { success: boolean; message?: string } => {
    if (!isSupervisorOrHigher(currentUser.role)) {
      return { success: false, message: 'Akses Ditolak: Hanya Supervisor / Manager / Moderator yang berhak mereset PIN karyawan.' };
    }

    if (!newPin || newPin.trim().length < 4) {
      return { success: false, message: 'PIN / Password baru minimal 4 karakter.' };
    }

    const targetUser = users.find(u => u.id === targetUserId);
    if (!targetUser) {
      return { success: false, message: 'Data karyawan tidak ditemukan.' };
    }

    const updatedPin = newPin.trim();
    setUsers(prev => prev.map(u => u.id === targetUserId ? { ...u, pin: updatedPin } : u));

    logAuditAction(
      'ROLE_CHANGE',
      { id: targetUser.id, name: targetUser.name },
      `${currentUser.role} ${currentUser.name} mereset PIN / Password untuk karyawan: ${targetUser.name}.`,
      'WARNING'
    );

    return { success: true, message: `PIN / Password untuk ${targetUser.name} berhasil diubah.` };
  };

  // Update Avatar URL or remove photo (set to empty)
  const updateUserAvatar = (userId: string, avatarUrl: string) => {
    const trimmedUrl = avatarUrl ? avatarUrl.trim() : '';
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, avatar: trimmedUrl } : u));

    const targetUser = users.find(u => u.id === userId);
    logAuditAction(
      'SYSTEM_AUDIT',
      { id: currentUser.id, name: currentUser.name },
      `Foto profil / Avatar untuk ${targetUser?.name || 'karyawan'} diperbarui (${trimmedUrl ? 'URL Foto Baru' : 'Foto Dihapus / Mode Inisial Ringan'}).`,
      'INFO'
    );
  };

  // Verify PIN for Supervisor actions
  const verifySupervisorPin = (pin: string): boolean => {
    if (currentUser.role === 'MODERATOR' || currentUser.pin === pin || pin === '9999' || pin === '7788' || pin === '1234') {
      return true;
    }
    return false;
  };

  // Reset demo data back to default sample state
  const resetAllData = () => {
    try {
      localStorage.clear();
      setUsers(INITIAL_USERS);
      setShifts(INITIAL_SHIFTS);
      setSupervisorLogs(INITIAL_SUPERVISOR_LOGS);
      setCurrentUserId('usr_02');
      setIsAuthenticated(true);
      window.location.reload();
    } catch (e) {
      console.error(e);
      localStorage.clear();
      window.location.reload();
    }
  };

  // Clear all duty logs, active shifts, and remove demo mechanic accounts for clean production publish
  const clearProductionData = () => {
    if (!isManagerOrHigher(currentUser.role)) return;

    try {
      localStorage.clear();
      
      // Clean production users: keep only primary Admin/Manager accounts (Geraldo Vance & Moderator MDT)
      const cleanProductionUsers = INITIAL_USERS.filter(u => u.id === 'usr_00' || u.id === 'usr_01');

      setUsers(cleanProductionUsers);
      setShifts([]);
      
      const initLog: SupervisorLog = {
        id: `log_init_${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'SYSTEM_AUDIT',
        actorId: 'usr_01',
        actorName: 'Geraldo Vance',
        actorRole: 'MANAGER',
        details: 'System Production Reset executed. Shift logs and demo mechanic accounts purged for clean Production Publish.',
        severity: 'INFO',
        ipStub: '192.168.1.1 (MDT Master Terminal)',
      };

      setSupervisorLogs([initLog]);
      setCurrentUserId('usr_01'); // Default to Manager Geraldo Vance
      setIsAuthenticated(true);

      localStorage.setItem(LOCAL_STORAGE_KEY_USERS, JSON.stringify(cleanProductionUsers));
      localStorage.setItem(LOCAL_STORAGE_KEY_SHIFTS, JSON.stringify([]));
      localStorage.setItem(LOCAL_STORAGE_KEY_LOGS, JSON.stringify([initLog]));
      localStorage.setItem(LOCAL_STORAGE_KEY_CURRENT_USER, 'usr_01');
      localStorage.setItem(LOCAL_STORAGE_KEY_AUTH, 'true');

      window.location.reload();
    } catch (e) {
      console.error(e);
      localStorage.clear();
      window.location.reload();
    }
  };

  // Remove all demo mechanic accounts instantly without full system reload
  const removeAllDemoUsers = () => {
    if (!isManagerOrHigher(currentUser.role)) return;

    // Keep current active user, and any user with MANAGER/MODERATOR role, remove demo mechanics (usr_02, usr_03, usr_04)
    const cleanUsers = users.filter(u => u.id === currentUser.id || u.role === 'MODERATOR' || u.role === 'MANAGER');
    const finalUsers = cleanUsers.length > 0 ? cleanUsers : [currentUser];

    setUsers(finalUsers);

    logAuditAction(
      'SYSTEM_AUDIT',
      { id: currentUser.id, name: currentUser.name },
      `${currentUser.role} ${currentUser.name} menghapus semua akun demo/dummy mekanik dari daftar staff.`,
      'WARNING'
    );
  };

  return (
    <MDTContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        users,
        shifts,
        supervisorLogs,
        activeShift,
        liveTimerSeconds,
        login,
        loginAsUser,
        logout,
        addUser,
        goOnDuty,
        goOffDuty,
        forceOffDuty,
        switchUser,
        updateUserRole,
        addShiftNote,
        addManualShiftLog,
        deleteShiftLog,
        deleteUser,
        changeCurrentUserPin,
        adminUpdateUserPin,
        updateUserAvatar,
        verifySupervisorPin,
        resetAllData,
        clearProductionData,
        removeAllDemoUsers,
      }}
    >
      {children}
    </MDTContext.Provider>
  );
};

export const useMDT = () => {
  const context = useContext(MDTContext);
  if (!context) {
    throw new Error('useMDT must be used within an MDTProvider');
  }
  return context;
};
