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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
            {/* Option 1: Gemini */}
            <div
              onClick={() => setAiProvider('gemini')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                aiProvider === 'gemini'
                  ? 'bg-purple-950/50 border-purple-500 shadow-glow-purple text-white ring-1 ring-purple-500'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-purple-300">Google Gemini</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    10 Keys Pool
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  All work processed via Google Gemini 1.5 Flash with automatic multi-key rotation and zero downtime.
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-purple-400">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                {aiProvider === 'gemini' ? 'Currently Selected' : 'Click to select'}
              </div>
            </div>

            {/* Option 2: OpenAI */}
            <div
              onClick={() => setAiProvider('openai')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                aiProvider === 'openai'
                  ? 'bg-emerald-950/50 border-emerald-500 shadow-glow-emerald text-white ring-1 ring-emerald-500'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-emerald-300">OpenAI Stack</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    3 Keys Pool
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  All work processed via OpenAI Whisper (speech transcription) + GPT-4o (hook detection and titles).
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                {aiProvider === 'openai' ? 'Currently Selected' : 'Click to select'}
              </div>
            </div>

            {/* Option 3: Both (Dual AI Mode) */}
            <div
              onClick={() => setAiProvider('both')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                aiProvider === 'both'
                  ? 'bg-gradient-to-br from-purple-950/60 via-slate-900 to-emerald-950/60 border-cyan-500 shadow-glow-cyan text-white ring-1 ring-cyan-500'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-cyan-300 flex items-center gap-1">
                    ⚡ Both (Dual AI)
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Ensemble
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Runs BOTH Gemini 1.5 and OpenAI simultaneously. Merges and ranks the most viral moments from both models!
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                {aiProvider === 'both' ? 'Active: Gemini + OpenAI' : 'Click to activate both'}
              </div>
            </div>
          </div>

          {/* Active Key Pools Diagnostics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Gemini Multi-Key Failover Status */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse"></div>
                  <span className="text-xs font-bold text-white">Google Gemini Pool</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30">
                  10 Keys • Auto-Failover
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Automatic round-robin failover when any Gemini key hits free-tier rate limits.
              </p>
              <div className="grid grid-cols-5 gap-1.5 pt-1 font-mono text-[9px]">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`p-1 rounded border text-center ${
                      idx === 0
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-200 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>#{idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* OpenAI Multi-Key Failover Status */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-xs font-bold text-white">OpenAI Failover Pool</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  3 Keys • Auto-Failover
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Whisper speech & GPT-4o failover across OPENAI_API_KEY, KEY1, and KEY3.
              </p>
              <div className="grid grid-cols-3 gap-1.5 pt-1 font-mono text-[9px]">
                {['KEY (Primary)', 'KEY1', 'KEY3'].map((label, idx) => (
                  <div
                    key={idx}
                    className={`p-1 rounded border text-center ${
                      idx === 0
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>{label}</span>
                  </div>
                ))}
              </div>
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
