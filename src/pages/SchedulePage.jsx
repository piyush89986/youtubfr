import React, { useState, useEffect } from 'react';
import { 
  CalendarClock, 
  Play, 
  Pause, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { YoutubeIcon as Youtube } from '../components/common/YoutubeIcon';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { getMediaUrl } from '../utils/mediaUtils';

export const SchedulePage = ({ onPreviewClip, onNavigate }) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchSchedules = async () => {
    try {
      const res = await api.get('/schedules');
      if (res.data?.data) {
        setSchedules(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handlePause = async (scheduleId) => {
    try {
      await api.patch(`/schedules/${scheduleId}/pause`);
      toast.info('Publishing paused');
      fetchSchedules();
    } catch (err) {
      toast.error('Failed to pause schedule');
    }
  };

  const handleResume = async (scheduleId) => {
    try {
      await api.patch(`/schedules/${scheduleId}/resume`);
      toast.success('Publishing resumed');
      fetchSchedules();
    } catch (err) {
      toast.error('Failed to resume schedule');
    }
  };

  const handleCancel = async (scheduleId) => {
    if (!window.confirm('Cancel this scheduled publication?')) return;
    try {
      await api.delete(`/schedules/${scheduleId}`);
      toast.success('Schedule cancelled');
      fetchSchedules();
    } catch (err) {
      toast.error('Failed to cancel schedule');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Auto-Scheduler</h1>
          <p className="text-xs text-slate-400 mt-1">
            Persistent queue powered by BullMQ & Redis. Idempotency guarantees prevent duplicate uploads.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center">
          <RefreshCw className="w-8 h-8 text-rose-500 animate-spin mb-3" />
          <p className="text-xs text-slate-400">Loading publication schedule...</p>
        </div>
      ) : schedules.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-3xl bg-slate-950/20">
          <CalendarClock className="w-12 h-12 text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-white">No scheduled publications</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1 mb-5">
            Select any generated Short from the Studio to set up an automated daily publishing schedule.
          </p>
          <button
            onClick={() => onNavigate('clips')}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-500 transition-colors shadow-glow"
          >
            Go to Shorts Studio
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map((item) => {
            const clip = item.clip || {};
            const channel = item.youtubeAccount || {};

            return (
              <div
                key={item._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    onClick={() => onPreviewClip && onPreviewClip(clip)}
                    className="w-12 h-16 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center cursor-pointer shrink-0"
                  >
                    {clip.storageUrl ? (
                      <video
                        src={getMediaUrl(clip.storageUrl)}
                        className="w-full h-full object-cover"
                        preload="metadata"
                      />
                    ) : (
                      <Play className="w-4 h-4 text-slate-400" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate max-w-md">
                      {clip.title || 'Untitled Short'}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-red-400">
                        <Youtube className="w-3.5 h-3.5" />
                        <span>{channel.channelTitle || 'YouTube Channel'}</span>
                      </span>
                      <span>•</span>
                      <span className="font-mono text-slate-200">
                        {new Date(item.scheduledTime).toLocaleDateString()}{' '}
                        {new Date(item.scheduledTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span>•</span>
                      <span className="text-[11px] font-mono text-slate-400">
                        TZ: {item.timezone || 'UTC'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-between sm:justify-end w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/60">
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border ${
                      item.status === 'completed'
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                        : item.status === 'paused'
                        ? 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                        : item.status === 'failed'
                        ? 'bg-rose-950/60 text-rose-300 border-rose-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {item.status}
                  </span>

                  {item.status === 'pending' && (
                    <button
                      onClick={() => handlePause(item._id)}
                      className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
                      title="Pause Publication"
                    >
                      <Pause className="w-4 h-4" />
                    </button>
                  )}

                  {item.status === 'paused' && (
                    <button
                      onClick={() => handleResume(item._id)}
                      className="p-2 rounded-xl bg-slate-800 text-emerald-400 hover:text-white transition-colors"
                      title="Resume Publication"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleCancel(item._id)}
                    className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Cancel Schedule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
