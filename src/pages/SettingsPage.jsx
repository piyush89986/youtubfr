import React, { useState } from 'react';
import { Sliders, Sparkles, Clock, Globe, Shield, Save, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';

export const SettingsPage = () => {
  const { user, refreshUserData } = useAuth();
  const toast = useToast();

  const [aiProvider, setAiProvider] = useState(
    user?.settings?.preferredAIProvider || 'gemini'
  );
  const [defaultTimezone, setDefaultTimezone] = useState(
    user?.settings?.defaultTimezone || 'UTC'
  );
  const [defaultPublishingHour, setDefaultPublishingHour] = useState(
    user?.settings?.defaultPublishingHour || 18
  );
  const [autoApprove, setAutoApprove] = useState(
    user?.settings?.autoApproveClips || false
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authService.updateProfile({
        settings: {
          preferredAIProvider: aiProvider,
          defaultTimezone,
          defaultPublishingHour: Number(defaultPublishingHour),
          autoApproveClips: autoApprove,
        },
      });
      await refreshUserData();
      setSaved(true);
      toast.success('Workspace settings updated successfully');
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">AI & Workspace Configuration</h1>
        <p className="text-xs text-slate-400 mt-1">
          Customize your AI clipping models, default publishing schedule cadence, and queue preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* AI Provider Section */}
        <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">AI Engine Provider</h3>
              <p className="text-xs text-slate-400">Choose the model for speech-to-text and viral hook analysis</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div
              onClick={() => setAiProvider('gemini')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                aiProvider === 'gemini'
                  ? 'bg-purple-950/40 border-purple-500/50 shadow-glow-purple text-white'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-purple-300">Google Gemini 1.5</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Extremely large context window. Outstanding audio comprehension and viral hook boundary detection.
              </p>
            </div>

            <div
              onClick={() => setAiProvider('openai')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                aiProvider === 'openai'
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-white'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-emerald-300">OpenAI Whisper + GPT-4o</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Supported
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Whisper speech transcription combined with GPT-4o for title suggestions and YouTube SEO.
              </p>
            </div>
          </div>

          {/* Gemini Multi-Key Failover Status */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-xs font-bold text-white">Gemini Multi-Key Failover Pool</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                10 Keys Active • Auto-Rotation ON
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              When a Gemini key reaches its free-tier rate limit or returns an error, the backend automatically fails over to the next healthy key in your pool.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 font-mono text-[10px]">
              {Array.from({ length: 10 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`p-1.5 rounded-lg border text-center ${
                    idx === 0
                      ? 'bg-rose-500/10 border-rose-500/40 text-rose-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <span>Key #{idx + 1}</span>
                  {idx === 0 && <span className="block text-[8px] text-rose-400 font-sans">Active</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Schedule Defaults */}
        <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Daily Publishing Cadence</h3>
              <p className="text-xs text-slate-400">Configure your default time slot for automatic publishing</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Default Timezone
              </label>
              <select
                value={defaultTimezone}
                onChange={(e) => setDefaultTimezone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              >
                <option value="UTC">UTC (Universal Time)</option>
                <option value="America/New_York">America/New_York (EST / EDT)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST / PDT)</option>
                <option value="Europe/London">Europe/London (GMT / BST)</option>
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Default Daily Hour (0-23)
              </label>
              <input
                type="number"
                min={0}
                max={23}
                value={defaultPublishingHour}
                onChange={(e) => setDefaultPublishingHour(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                18 = 6:00 PM (optimal evening viewing window)
              </span>
            </div>
          </div>
        </div>

        {/* Free Tier & Deployment Constraints Notice */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs text-slate-400 space-y-1">
          <span className="font-semibold text-slate-300 block">Hosting & Quota Safeguards:</span>
          <p>
            1. Cloudinary free tier provides 25GB storage and 25 monthly transformations.
          </p>
          <p>
            2. YouTube Data API v3 enforces a default daily quota of 10,000 units (video uploads cost 1,600 units).
          </p>
          <p>
            3. Scheduled jobs use persistent MongoDB state & BullMQ queue to safely survive server restarts.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-glow transition-all active:scale-95 disabled:opacity-50"
          >
            {saved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'Saved' : saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
