import React, { useState } from 'react';
import { useMDT } from '../context/MDTContext';
import { Shield, AlertCircle } from 'lucide-react';
import sundayGarageLogo from '../assets/images/sunday_garage_logo_1784860455988.jpg';

export const LoginPage: React.FC = () => {
  const { login } = useMDT();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() && !password.trim()) {
      setError('Harap masukkan Username / Callsign dan Password MDT.');
      return;
    }

    const result = login(username, password);
    if (!result.success) {
      setError(result.message || 'Login gagal. Periksa username dan PIN password.');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#0A0A0B] overflow-hidden font-sans select-none">
      
      {/* Background Image with FiveM / GTA RP Squad Style Wallpaper */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 filter blur-[2px] transition-transform duration-1000"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1920&q=80')`,
        }}
      />
      
      {/* Dark Overlay with subtle vignette & grid texture */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/75 to-black/85 backdrop-blur-[1px]" />

      {/* Main Login Card - Designed matching reference screenshot */}
      <div className="relative z-10 w-full max-w-md mx-4 my-8">
        
        {/* White Modal Box */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 p-8 text-slate-800">
          
          {/* Logo Badge Header */}
          <div className="flex flex-col items-center text-center">
            <div className="w-28 h-20 mb-2 flex items-center justify-center">
              <img
                src={sundayGarageLogo}
                alt="Sunday Garage Logo"
                className="w-full h-full object-contain filter drop-shadow-md"
                referrerPolicy="no-referrer"
              />
            </div>

            <h1 className="text-xl font-bold text-slate-900 tracking-tight font-sans">Login Staff MDT</h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Masukkan ID Karyawan / Nama dan PIN untuk masuk MDT
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mt-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            
            {/* Username / ID Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>ID Karyawan / Nama</span>
                <span className="text-[10px] text-slate-400 font-normal">Cth: SG-001 / Geraldo</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  placeholder="ID Karyawan (SG-001) atau Nama..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 font-medium transition-all"
                  autoFocus
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                PIN Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono tracking-widest transition-all"
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full mt-2 py-2.5 bg-[#C81E1E] hover:bg-red-700 text-white font-bold text-sm rounded-lg shadow-md shadow-red-900/20 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Login MDT Terminal</span>
            </button>
          </form>

          {/* Footer Note */}
          <div className="mt-6 text-center text-[11px] text-slate-400 font-medium">
            Sunday Garage MSRP • Mobile Data Terminal (MDT) v2.4
          </div>
        </div>

        {/* Outer Brand Badge below modal */}
        <div className="mt-4 text-center text-xs text-slate-400 font-mono tracking-wider flex items-center justify-center gap-1.5 opacity-80">
          <Shield className="w-3.5 h-3.5 text-amber-500" />
          <span>SUNDAY GARAGE MSRP SECURE NETWORK</span>
        </div>
      </div>
    </div>
  );
};
