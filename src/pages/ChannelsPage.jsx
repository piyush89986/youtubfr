import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Trash2, 
  ShieldCheck, 
  RefreshCw,
  Plus,
  KeyRound
} from 'lucide-react';
import { YoutubeIcon as Youtube } from '../components/common/YoutubeIcon';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const ChannelsPage = () => {
  const { connectedChannels, refreshUserData } = useAuth();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchChannels = async () => {
    try {
      const res = await api.get('/youtube/channels');
      if (res.data?.data) {
        setChannels(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load channels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const handleConnectChannel = async () => {
    try {
      const res = await api.get('/youtube/auth-url');
      if (res.data?.data?.url) {
        // Redirect to Google OAuth consent screen
        window.location.href = res.data.data.url;
      }
    } catch (err) {
      toast.error('Google OAuth credentials not configured yet in .env');
    }
  };

  const handleDisconnect = async (channelId) => {
    if (!window.confirm('Disconnect this YouTube Channel and revoke access tokens? Scheduled auto-publishing will be paused.')) return;
    try {
      await api.delete(`/youtube/channels/${channelId}`);
      toast.success('Channel disconnected successfully.');
      await fetchChannels();
      await refreshUserData();
    } catch (err) {
      toast.error('Failed to disconnect channel: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleTestUpload = async (channelId) => {
    try {
      toast.info('Sending test payload to YouTube upload endpoint...');
      const res = await api.post(`/youtube/test-upload`, { channelId });
      toast.success(res.data?.message || 'Test upload verification passed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Test upload failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">YouTube Channels</h1>
          <p className="text-xs text-slate-400 mt-1">
            Connect via Google OAuth 2.0. Refresh tokens are AES-256-GCM encrypted at rest.
          </p>
        </div>
        <button
          onClick={handleConnectChannel}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 shadow-glow transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Connect Channel (OAuth 2.0)</span>
        </button>
      </div>

      {/* Security and Permissions Transparency Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Least-Privilege Security Policy</h4>
            <p className="text-[11px] text-slate-400">
              We request only <code>youtube.upload</code> and <code>youtube.readonly</code>. Secrets are never exposed to the browser.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          <span>AES-256-GCM Encrypted at Rest</span>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center">
          <RefreshCw className="w-8 h-8 text-rose-500 animate-spin mb-3" />
          <p className="text-xs text-slate-400">Checking connected YouTube channels...</p>
        </div>
      ) : channels.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-3xl bg-slate-950/20">
          <div className="w-14 h-14 rounded-2xl bg-red-600/10 text-red-500 flex items-center justify-center mb-3">
            <Youtube className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white">No YouTube channel connected</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1 mb-5">
            Connect your YouTube channel to authorize automated daily Shorts publishing.
          </p>
          <button
            onClick={handleConnectChannel}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-500 transition-colors shadow-glow"
          >
            Connect with Google
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {channels.map((ch) => (
            <div
              key={ch._id}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl hover:border-slate-700 transition-all space-y-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                    {ch.thumbnailUrl ? (
                      <img src={ch.thumbnailUrl} alt={ch.channelTitle} className="w-full h-full object-cover" />
                    ) : (
                      <Youtube className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{ch.channelTitle}</h3>
                    <p className="text-[11px] text-slate-400 truncate">
                      {ch.customUrl || `Channel ID: ${ch.channelId}`}
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                  Connected
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
                <div>
                  <span className="text-slate-400 block text-[10px]">Subscribers</span>
                  <span className="font-mono text-slate-200 font-bold">
                    {(ch.subscriberCount || 0).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Videos</span>
                  <span className="font-mono text-slate-200 font-bold">
                    {(ch.videoCount || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => handleTestUpload(ch.channelId)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Verify Upload Auth</span>
                </button>

                <button
                  onClick={() => handleDisconnect(ch.channelId || ch._id)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 hover:border-rose-500/40 transition-all hover:scale-105 active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Disconnect Channel</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
