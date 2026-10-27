import React, { useState } from 'react';
import { X, CalendarClock, Globe, ShieldCheck, AlertCircle } from 'lucide-react';
import { YoutubeIcon as Youtube } from '../common/YoutubeIcon';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const ScheduleModal = ({ clip, isOpen, onClose, onConfirmSchedule }) => {
  const { connectedChannels } = useAuth();
  
  if (!isOpen || !clip) return null;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(18, 0, 0, 0); // Default to 6:00 PM tomorrow

  const [channelId, setChannelId] = useState(
    connectedChannels.length > 0 ? connectedChannels[0]._id : ''
  );
  const [scheduledDate, setScheduledDate] = useState(
    tomorrow.toISOString().split('T')[0]
  );
  const [scheduledTime, setScheduledTime] = useState('18:00');
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  );
  const [privacyStatus, setPrivacyStatus] = useState('public');
  const [frequency, setFrequency] = useState('once');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirectPublishing, setIsDirectPublishing] = useState(false);

  const handleDirectPublishNow = async () => {
    if (!channelId) {
      alert('Please select or connect a YouTube channel first.');
      return;
    }

    setIsDirectPublishing(true);
    try {
      const res = await api.post('/youtube/publish-now', {
        clipId: clip._id,
        channelId,
        privacyStatus,
      });

      if (clip) {
        clip.publishingStatus = 'published';
        clip.youtubeUrl = res.data?.data?.youtubeUrl;
        clip.youtubeVideoId = res.data?.data?.youtubeVideoId;
      }
      alert(`Short successfully published directly to YouTube channel "${res.data?.data?.channelTitle}"!`);
      onClose();
    } catch (err) {
      alert(`Direct upload failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsDirectPublishing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!channelId) {
      alert('Please select or connect a YouTube channel first.');
      return;
    }

    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`);

    setIsSubmitting(true);
    try {
      if (onConfirmSchedule) {
        await onConfirmSchedule({
          clipId: clip._id,
          youtubeAccountId: channelId,
          scheduledTime: scheduledDateTime,
          timezone,
          privacyStatus,
          frequency,
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0c101a] border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-y-auto p-4 sm:p-6 md:p-8 max-h-[94vh] sm:max-h-[92vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-95 z-20"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
            <CalendarClock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Schedule YouTube Short</h3>
            <p className="text-xs text-slate-400">Automatic publication directly to your channel</p>
          </div>
        </div>

        {/* Clip Summary Preview */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 mb-6 flex items-center gap-3">
          <div className="w-10 h-14 bg-black rounded-lg border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
            <span className="text-[10px] font-mono text-slate-400">9:16</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{clip.title}</p>
            <p className="text-[11px] text-slate-400">Duration: {clip.duration || 45}s • Vertical Full HD</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Target Channel */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Youtube className="w-3.5 h-3.5 text-red-500" />
              <span>Target YouTube Channel</span>
            </label>
            {connectedChannels.length === 0 ? (
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>No connected channel found. Please connect your YouTube account in the Channels tab.</span>
              </div>
            ) : (
              <select
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-rose-500"
              >
                {connectedChannels.map((ch) => (
                  <option key={ch._id} value={ch._id}>
                    {ch.channelTitle} ({ch.subscriberCount || 0} subscribers)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Publish Date</label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Publish Time</label>
              <input
                type="time"
                required
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Timezone & Privacy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200"
              >
                <option value={timezone}>{timezone}</option>
                <option value="UTC">UTC (Universal)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Privacy Status</label>
              <select
                value={privacyStatus}
                onChange={(e) => setPrivacyStatus(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200"
              >
                <option value="public">Public (Instant Reach)</option>
                <option value="unlisted">Unlisted (Review First)</option>
                <option value="private">Private (Restricted)</option>
              </select>
            </div>
          </div>

          {/* Idempotency / Duplicate upload safeguard badge */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 text-[11px]">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Idempotency lock enabled. Duplicate uploads are strictly prevented.</span>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
            <button
              type="button"
              disabled={isDirectPublishing || connectedChannels.length === 0}
              onClick={handleDirectPublishNow}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600/90 hover:bg-red-600 border border-red-500/30 flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-40"
            >
              <Youtube className="w-3.5 h-3.5" />
              <span>{isDirectPublishing ? 'Uploading directly...' : 'Direct Upload Now (Skip Schedule)'}</span>
            </button>

            <div className="flex items-center justify-end gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isDirectPublishing || connectedChannels.length === 0}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-glow disabled:opacity-50 transition-all active:scale-95 text-center"
              >
                {isSubmitting ? 'Scheduling...' : 'Confirm Schedule'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
