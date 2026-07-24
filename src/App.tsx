import React, { useState } from 'react';
import { MDTProvider, useMDT } from './context/MDTContext';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { DutyHistoryView } from './components/DutyHistoryView';
import { SupervisorLogsView } from './components/SupervisorLogsView';
import { StaffDirectoryView } from './components/StaffDirectoryView';
import { SettingsView } from './components/SettingsView';
import { LoginPage } from './components/LoginPage';

function MDTApp() {
  const { currentUser, isAuthenticated } = useMDT();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  const canAccessSupervisorLogs = currentUser?.role === 'MANAGER' || currentUser?.role === 'MODERATOR';

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#E4E4E7] flex font-sans antialiased selection:bg-amber-500 selection:text-black">
      
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Top Header */}
        <Header />

        {/* View Router */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'duty-history' && <DutyHistoryView />}
          {activeTab === 'supervisor-logs' && (
            canAccessSupervisorLogs ? (
              <SupervisorLogsView />
            ) : (
              <DashboardView />
            )
          )}
          {activeTab === 'staff-directory' && <StaffDirectoryView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>

        {/* Footer info */}
        <footer className="border-t border-slate-800/60 px-6 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Sunday Garage MSRP Mobile Data Terminal (MDT) • Strictly Confidential &amp; Protected
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <MDTProvider>
      <MDTApp />
    </MDTProvider>
  );
}
