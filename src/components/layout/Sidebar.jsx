import React from 'react';
import { 
  LayoutDashboard, 
  Film, 
  Scissors, 
  CalendarClock, 
  Sliders, 
  Sparkles,
  HardDrive,
  Activity,
  Layers
} from 'lucide-react';
import { YoutubeIcon as Youtube } from '../common/YoutubeIcon';

export const Sidebar = ({ currentTab, onNavigate, metrics }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'videos', label: 'Source Videos', icon: Film, badge: metrics?.totalSourceVideos },
    { id: 'clips', label: 'Shorts Studio', icon: Scissors, badge: metrics?.totalShortClips },
    { id: 'schedule', label: 'Auto-Scheduler', icon: CalendarClock, badge: metrics?.scheduledClips },
    { id: 'channels', label: 'Connected Channels', icon: Youtube, badge: metrics?.connectedChannelsCount },
    { id: 'settings', label: 'AI & Config', icon: Sliders },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-[#070a10]/95 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] p-4 select-none">
      <div className="space-y-6">
        {/* Navigation list */}
        <div className="space-y-1.5">
          <p className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">Menu</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-glow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-rose-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* AI Engine Status Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-slate-900 border border-indigo-500/20">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="text-xs font-bold text-indigo-200">AI Engine Ready</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Gemini 1.5 & OpenAI speech transcription & viral hook detection enabled.
          </p>
        </div>
      </div>

      {/* Quota & System Usage Info */}
      <div className="space-y-3 pt-4 border-t border-slate-800/60">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Youtube className="w-3.5 h-3.5 text-red-400" />
              <span>YouTube API Quota</span>
            </span>
            <span className="font-mono text-slate-300">1,600 / 10,000</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="w-[16%] h-full bg-gradient-to-r from-red-500 to-rose-400 rounded-full"></div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            <span>Storage: Cloudinary</span>
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">Free Tier</span>
        </div>
      </div>
    </aside>
  );
};
