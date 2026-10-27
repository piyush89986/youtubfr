import React, { useState, useEffect } from 'react';
import { StatCards } from '../components/dashboard/StatCards';
import { ProcessingQueue } from '../components/dashboard/ProcessingQueue';
import { UpcomingSchedule } from '../components/dashboard/UpcomingSchedule';
import { RecentShorts } from '../components/dashboard/RecentShorts';
import { dashboardService } from '../services/dashboardService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Upload, Sparkles, RefreshCw, Calendar, ArrowRight, Cpu } from 'lucide-react';
import { YoutubeIcon as Youtube } from '../components/common/YoutubeIcon';

export const DashboardPage = ({ 
  onOpenUpload, 
  onPreviewClip, 
  onScheduleClip, 
  onNavigate 
}) => {
  const { user, connectedChannels, workerActive, toggleWorker } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isTogglingWorker, setIsTogglingWorker] = useState(false);

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

  const fetchStats = async () => {
    try {
      const data = await dashboardService.getStats();
      if (data && data.data) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh metrics every 15s
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const hasConnectedChannel = connectedChannels.length > 0;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-rose-950/40 via-purple-950/20 to-slate-900 border border-rose-500/20 overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                AI Automation Active
              </span>
              <span className="text-xs text-slate-400">Welcome back, {user?.name || 'Creator'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Turn 1-Hour Videos into <span className="gradient-text-fire">Viral YouTube Shorts</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Upload long podcasts, webinars, or streams. Our AI extracts speech boundaries, renders 9:16 vertical video with subtitles, and schedules daily uploads automatically.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Auto-Worker Engine ON/OFF Button */}
            <button
              onClick={handleToggleWorker}
              disabled={isTogglingWorker}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95 cursor-pointer ${
                workerActive 
                  ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300 shadow-glow' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title={workerActive ? 'Worker is ON. Click to pause auto-scheduling.' : 'Worker is OFF. Click to start day-by-day auto-scheduling.'}
            >
              <div className="relative flex items-center justify-center">
                <Cpu className={`w-4 h-4 ${workerActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                {workerActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                )}
              </div>
              <span>Worker: {workerActive ? 'ON (Auto-Schedule)' : 'OFF (Paused)'}</span>
            </button>

            {!hasConnectedChannel && (
              <button
                onClick={() => onNavigate('channels')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 transition-colors shadow-glow"
              >
                <Youtube className="w-4 h-4" />
                <span>Connect YouTube Channel</span>
              </button>
            )}
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-glow transition-all active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Video</span>
            </button>
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Refresh Stats"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-rose-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Primary Metrics Grid */}
      <StatCards metrics={stats?.metrics} onNavigate={onNavigate} />

      {/* Grid: Background Processing Queue & Upcoming Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProcessingQueue activeJobs={stats?.activeJobs || []} />
        <UpcomingSchedule 
          upcoming={stats?.upcomingSchedules || []} 
          onPreviewClip={onPreviewClip}
          onNavigate={onNavigate}
        />
      </div>

      {/* Recent Shorts Grid */}
      <RecentShorts
        clips={stats?.recentClips || []}
        onPreviewClip={onPreviewClip}
        onScheduleClip={onScheduleClip}
        onNavigate={onNavigate}
      />
    </div>
  );
};
