import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { 
  LayoutDashboard, 
  Film, 
  Scissors, 
  CalendarClock, 
  Sliders, 
  Sparkles,
  Upload,
  LogOut,
  ChevronLeft,
  X,
  AlertCircle,
  HardDrive,
  Unlink,
  Cpu
} from 'lucide-react';
import { YoutubeIcon as Youtube } from '../common/YoutubeIcon';

export const LeftSidebar = ({ 
  isOpen, 
  onClose, 
  currentTab, 
  onNavigate, 
  onOpenUpload, 
  metrics 
}) => {
  const { user, connectedChannels, logout, refreshUserData, workerActive, toggleWorker } = useAuth();
  const toast = useToast();
  const [disconnecting, setDisconnecting] = useState(false);
  const [isTogglingWorker, setIsTogglingWorker] = useState(false);
  const primaryChannel = connectedChannels.length > 0 ? connectedChannels[0] : null;

  const handleToggleWorker = async () => {
    setIsTogglingWorker(true);
    try {
      const res = await toggleWorker(!workerActive);
      const next = !workerActive;
      toast.success(
        next 
          ? `Worker started! ${res.data?.backfilledCount > 0 ? `${res.data.backfilledCount} clips scheduled day-by-day.` : 'Day-by-Day auto-scheduler active.'}`
          : 'Worker paused. Clips will save in drafts.'
      );
    } catch (err) {
      toast.error('Failed to update worker status: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsTogglingWorker(false);
    }
  };

  const handleDisconnectChannel = async (channelId) => {
    if (!window.confirm('Disconnect this YouTube Channel and revoke access permissions?')) return;
    setDisconnecting(true);
    try {
      await api.delete(`/youtube/channels/${channelId}`);
      toast.success('YouTube channel disconnected successfully!');
      await refreshUserData();
    } catch (err) {
      toast.error('Failed to disconnect channel: ' + (err.response?.data?.message || err.message));
    } finally {
      setDisconnecting(false);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'videos', label: 'Source Videos', icon: Film, badge: metrics?.totalSourceVideos },
    { id: 'clips', label: 'Shorts Studio', icon: Scissors, badge: metrics?.totalShortClips },
    { id: 'schedule', label: 'Auto-Scheduler', icon: CalendarClock, badge: metrics?.scheduledClips },
    { id: 'channels', label: 'Connected Channels', icon: Youtube, badge: metrics?.connectedChannelsCount },
    { id: 'settings', label: 'AI & Config', icon: Sliders },
  ];

  return (
    <aside 
      className={`fixed top-0 left-0 bottom-0 z-50 w-72 sm:w-80 max-w-[85vw] h-screen bg-[#070b13]/95 backdrop-blur-2xl border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out select-none shadow-2xl ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Top Header & Brand */}
      <div className="p-4 sm:p-5 border-b border-slate-800/60 flex items-center justify-between">
        <div 
          onClick={() => onNavigate('dashboard')} 
          className="flex items-center gap-3 cursor-pointer group min-w-0"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-red-600 shadow-glow text-white font-bold group-hover:scale-105 transition-transform shrink-0">
            <Youtube className="w-5 h-5 text-white" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping opacity-75"></div>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full"></div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-white group-hover:text-rose-300 transition-colors truncate">
                ShortsCraft
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium truncate">Long-to-Shorts Automation</p>
          </div>
        </div>

        {/* Hide / Remove Sidebar Button */}
        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all hover:scale-105 active:scale-95 shrink-0 ml-2"
          title="Close Navigation"
          aria-label="Close Navigation"
        >
          <ChevronLeft className="w-4 h-4 hidden lg:block" />
          <X className="w-4 h-4 lg:hidden" />
        </button>
      </div>

      {/* Middle Scrollable Section: Upload Action + Nav List + Status Cards */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        
        {/* Upload Video Primary Button */}
        <button
          onClick={onOpenUpload}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-glow hover:shadow-lg transition-all active:scale-[0.98] group"
        >
          <Upload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
          <span>Upload Video</span>
        </button>

        {/* Navigation list */}
        <div className="space-y-1">
          <p className="px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">Navigation</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-glow'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-850/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-rose-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Connected YouTube Channel Card */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 pb-1">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Channel Link</span>
            {primaryChannel && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDisconnectChannel(primaryChannel.channelId || primaryChannel._id);
                }}
                disabled={disconnecting}
                className="text-[10px] text-rose-400 hover:text-rose-300 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                title="Disconnect YouTube Channel"
              >
                <Unlink className="w-3 h-3" />
                <span>{disconnecting ? '...' : 'Disconnect'}</span>
              </button>
            )}
          </div>
          <div 
            onClick={() => onNavigate('channels')}
            className={`cursor-pointer p-3 rounded-2xl border text-xs transition-all ${
              primaryChannel 
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300 hover:border-emerald-500/60' 
                : 'bg-amber-950/20 border-amber-500/30 text-amber-300 hover:border-amber-500/60'
            }`}
          >
            {primaryChannel ? (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></div>
                  <Youtube className="w-4 h-4 text-red-500 shrink-0" />
                  <div className="truncate">
                    <p className="font-semibold text-white truncate">{primaryChannel.channelTitle}</p>
                    <p className="text-[10px] text-emerald-400">Connected & Verified</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDisconnectChannel(primaryChannel.channelId || primaryChannel._id);
                  }}
                  disabled={disconnecting}
                  className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 border border-rose-500/20 text-[10px] font-bold transition-all hover:scale-105 shrink-0"
                  title="Disconnect Channel"
                >
                  {disconnecting ? '...' : 'Disconnect'}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-[11px] font-medium">Connect YouTube Channel</span>
              </div>
            )}
          </div>
        </div>

        {/* Worker & Day-by-Day Auto-Scheduler Switch Card */}
        <div className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
          workerActive 
            ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-[#06140e] border-emerald-500/40 shadow-glow' 
            : 'bg-slate-950/70 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`relative flex items-center justify-center w-7 h-7 rounded-xl ${
                workerActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
              }`}>
                <Cpu className="w-4 h-4" />
                {workerActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">Auto-Worker</p>
                <p className="text-[10px] text-slate-400">Day-by-Day Schedule</p>
              </div>
            </div>

            {/* Interactive Switch */}
            <button
              type="button"
              onClick={handleToggleWorker}
              disabled={isTogglingWorker}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                workerActive ? 'bg-emerald-500' : 'bg-slate-800'
              }`}
              title={workerActive ? 'Pause Worker (Stop auto-scheduling)' : 'Start Worker (Enable day-by-day auto-scheduling)'}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                  workerActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800/60">
            <span className={workerActive ? 'text-emerald-300 font-semibold flex items-center gap-1.5' : 'text-slate-400 flex items-center gap-1.5'}>
              <span className={`w-1.5 h-1.5 rounded-full ${workerActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></span>
              <span>{workerActive ? 'Active (Auto-Uploads ON)' : 'Standby (Paused)'}</span>
            </span>
            <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-[9px] ${
              workerActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
            }`}>
              {workerActive ? 'ON' : 'OFF'}
            </span>
          </div>
          
          <p className="text-[10px] text-slate-400 leading-tight">
            {workerActive ? 'Every cut clip is queued across consecutive future days.' : 'Turn ON to auto-schedule clips directly onto YouTube.'}
          </p>
        </div>

        {/* AI Engine & System Status Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/30 via-purple-950/15 to-slate-900 border border-indigo-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span className="text-[11px] font-bold text-indigo-200">Dual AI Active</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">Ensemble</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Gemini 1.5 & OpenAI multi-key failover engines active.
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
            <span className="flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-cyan-400" />
              <span>Cloud Storage</span>
            </span>
            <span className="text-cyan-300 font-semibold">Cloudinary CDN</span>
          </div>
        </div>
      </div>

      {/* Pinned Bottom User Profile & Logout */}
      <div className="p-4 border-t border-slate-800/80 bg-[#060910]">
        <div className="flex items-center justify-between gap-3">
          <div 
            onClick={() => onNavigate('settings')}
            className="flex items-center gap-2.5 cursor-pointer truncate flex-1 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-rose-600 flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-md">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Creator'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || 'user@shorts.ai'}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 transition-all shrink-0"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
