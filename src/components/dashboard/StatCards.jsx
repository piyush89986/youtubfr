import React from 'react';
import { Film, Scissors, CalendarCheck, CheckCircle2, AlertOctagon, ArrowUpRight } from 'lucide-react';

export const StatCards = ({ metrics, onNavigate }) => {
  const cards = [
    {
      title: 'Source Videos',
      value: metrics?.totalSourceVideos || 0,
      subtext: '30m - 1h+ videos uploaded',
      icon: Film,
      color: 'from-blue-600/20 to-cyan-600/20',
      border: 'border-blue-500/30',
      iconColor: 'text-cyan-400',
      tab: 'videos',
    },
    {
      title: 'Generated Shorts',
      value: metrics?.totalShortClips || 0,
      subtext: '9:16 Vertical with subtitles',
      icon: Scissors,
      color: 'from-rose-600/20 to-red-600/20',
      border: 'border-rose-500/30',
      iconColor: 'text-rose-400',
      tab: 'clips',
    },
    {
      title: 'Scheduled Queue',
      value: metrics?.scheduledClips || 0,
      subtext: 'Ready for auto-publishing',
      icon: CalendarCheck,
      color: 'from-amber-600/20 to-orange-600/20',
      border: 'border-amber-500/30',
      iconColor: 'text-amber-400',
      tab: 'schedule',
    },
    {
      title: 'Published to YouTube',
      value: metrics?.publishedClips || 0,
      subtext: 'Verified by YouTube API',
      icon: CheckCircle2,
      color: 'from-emerald-600/20 to-teal-600/20',
      border: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
      tab: 'clips',
    },
    {
      title: 'Processing Issues',
      value: metrics?.failedJobs || 0,
      subtext: 'Auto-retry backoff active',
      icon: AlertOctagon,
      color: 'from-slate-700/20 to-slate-800/20',
      border: metrics?.failedJobs > 0 ? 'border-rose-500/50' : 'border-slate-700/30',
      iconColor: metrics?.failedJobs > 0 ? 'text-rose-400' : 'text-slate-400',
      tab: 'schedule',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            onClick={() => onNavigate && onNavigate(card.tab)}
            className={`relative p-4 rounded-2xl bg-gradient-to-br ${card.color} border ${card.border} backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">{card.title}</span>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
                <Icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white tracking-tight">{card.value}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
            </div>
            <p className="mt-1 text-[11px] text-slate-400 truncate">{card.subtext}</p>
          </div>
        );
      })}
    </div>
  );
};
