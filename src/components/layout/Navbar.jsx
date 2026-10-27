import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Upload, 
  User as UserIcon, 
  LogOut, 
  Settings, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { YoutubeIcon as Youtube } from '../common/YoutubeIcon';

export const Navbar = ({ onOpenUpload, onNavigate, currentTab }) => {
  const { user, connectedChannels, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const primaryChannel = connectedChannels.length > 0 ? connectedChannels[0] : null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#090d16]/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => onNavigate('dashboard')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 shadow-glow text-white font-bold">
              <Youtube className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping opacity-75"></div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full"></div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-extrabold tracking-tight text-white">ShortsCraft</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500/20 to-purple-500/20 text-rose-400 border border-rose-500/30">
                  AI v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Long-to-Shorts Automation SaaS</p>
            </div>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Channel Connection Status Pill */}
          <div 
            onClick={() => onNavigate('channels')}
            className={`cursor-pointer hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              primaryChannel 
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:border-emerald-500/60' 
                : 'bg-amber-950/40 border-amber-500/30 text-amber-300 hover:border-amber-500/60'
            }`}
          >
            {primaryChannel ? (
              <>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <Youtube className="w-3.5 h-3.5 text-red-500" />
                <span className="truncate max-w-[140px] font-semibold">{primaryChannel.channelTitle}</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Connect YouTube Channel</span>
              </>
            )}
          </div>

          {/* Quick Upload Button */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-glow hover:shadow-lg transition-all active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden xs:inline">Upload Video</span>
          </button>

          {/* User Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-bold text-xs text-white">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="hidden md:inline text-xs font-medium text-slate-200 truncate max-w-[100px]">
                {user?.name || 'Creator'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-800 bg-[#0c111c] shadow-2xl py-2 z-50 backdrop-blur-2xl animate-fade-in"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <div className="px-4 py-2 border-b border-slate-800/60">
                  <p className="text-xs font-semibold text-white">{user?.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onNavigate('settings');
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Workspace Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onNavigate('channels');
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                  >
                    <Youtube className="w-4 h-4 text-red-400" />
                    <span>YouTube Channels</span>
                  </button>
                </div>

                <div className="border-t border-slate-800/60 pt-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
