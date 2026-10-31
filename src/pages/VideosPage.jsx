import React, { useState, useEffect } from 'react';
import {
  Film,
  Upload,
  Scissors,
  Clock,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Cpu,
  Captions,
  X,
  Play,
  Layers,
  Zap,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export const VideosPage = ({ onOpenUpload, onNavigate }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Extraction Modal State
  const [extractModalOpen, setExtractModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [extractMode, setExtractMode] = useState('ai_smart'); // 'ai_smart' | 'full_parts' | 'fixed'
  const [maxClips, setMaxClips] = useState(3); // 1, 2, 3, 5, 10, 'all'
  const [targetDuration, setTargetDuration] = useState(60); // 30, 45, 60, 90, 180s
  const [aiProvider, setAiProvider] = useState('gemini'); // 'gemini' | 'openai' | 'both'
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [submittingExtract, setSubmittingExtract] = useState(false);

  const fetchVideos = async () => {
    try {
      const res = await api.get('/videos');
      if (res.data?.data) {
        setVideos(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch videos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleDelete = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this source video and its clips?')) return;
    try {
      await api.delete(`/videos/${videoId}`);
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
      toast.success('Video deleted successfully');
    } catch (err) {
      toast.error('Failed to delete video');
    }
  };

  const openExtractModal = (vid) => {
    setSelectedVideo(vid);
    setExtractMode('ai_smart');
    setMaxClips(3);
    setTargetDuration(60);
    setAiProvider('gemini');
    setSubtitlesEnabled(true);
    setExtractModalOpen(true);
  };

  const handleExecuteExtraction = async () => {
    if (!selectedVideo) return;
    setSubmittingExtract(true);

    try {
      const res = await api.post('/clips/generate', {
        sourceVideoId: selectedVideo._id,
        clippingMode: extractMode,
        targetDuration,
        maxClips: maxClips === 'all' ? 'all' : Number(maxClips),
        subtitlesEnabled,
        aiProvider,
      });

      toast.success(
        extractMode === 'full_parts'
          ? '🎬 Full Video Multi-Part Series dispatched to Render Worker!'
          : `⚡ Extracting ${maxClips === 'all' ? 'all' : maxClips} AI Shorts! Dispatched to Render Worker.`
      );

      setExtractModalOpen(false);
      setSelectedVideo(null);
      fetchVideos();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to dispatch extraction job');
    } finally {
      setSubmittingExtract(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Source Videos</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your long source files (30m - 1h+). Storage references stored in MongoDB.
          </p>
        </div>
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-glow transition-all active:scale-95"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Video</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center">
          <RefreshCw className="w-8 h-8 text-rose-500 animate-spin mb-3" />
          <p className="text-xs text-slate-400">Loading source video library...</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-3xl bg-slate-950/20">
          <Film className="w-12 h-12 text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-white">No source videos yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1 mb-5">
            Upload your podcast, conference session, or gameplay video to start generating shorts.
          </p>
          <button
            onClick={onOpenUpload}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-500 transition-colors shadow-glow"
          >
            Upload First Video
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {videos.map((vid) => (
            <div
              key={vid._id}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-xl hover:border-slate-700 transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                  <Film className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-white truncate" title={vid.title}>
                    {vid.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {vid.originalFilename}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(vid._id)}
                  className="text-slate-500 hover:text-rose-400 p-1.5 transition-colors"
                  title="Delete Video"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
                <div>
                  <span className="text-slate-400 block">Duration</span>
                  <span className="font-mono text-slate-200">
                    {vid.duration ? `${Math.floor(vid.duration / 60)}m ${Math.floor(vid.duration % 60)}s` : 'Processing...'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">File Size</span>
                  <span className="font-mono text-slate-200">
                    {(vid.fileSize / (1024 * 1024)).toFixed(1)} MB
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Clips Generated</span>
                  <span className="font-mono text-rose-400 font-bold">
                    {vid.clipsCount || 0} Shorts
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Status</span>
                  <span className="capitalize font-semibold text-emerald-400">
                    {vid.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => openExtractModal(vid)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-98"
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span>Extract AI Shorts / Parts</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Shorts Extraction Configuration Modal */}
      {extractModalOpen && selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl rounded-3xl bg-slate-950 border border-slate-800/90 shadow-2xl p-6 max-h-[90vh] overflow-y-auto space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    Shorts Engine
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {selectedVideo.duration ? `${Math.floor(selectedVideo.duration / 60)}m ${Math.floor(selectedVideo.duration % 60)}s` : ''}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1.5 truncate max-w-md">
                  {selectedVideo.title}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure clipping strategy, parts count, and duration for Render Worker.
                </p>
              </div>
              <button
                onClick={() => setExtractModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Clipping Strategy Selection (3 options including Full Video Multi-Part Series) */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                1. Select Clipping Strategy
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setExtractMode('ai_smart');
                    if (maxClips === 'all') setMaxClips(3);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    extractMode === 'ai_smart'
                      ? 'bg-rose-500/10 border-rose-500/40 text-white ring-1 ring-rose-500/30'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold mb-1 text-rose-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Smart Hooks</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Finds top viral moments with high-retention openings.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setExtractMode('full_parts');
                    setMaxClips('all');
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    extractMode === 'full_parts'
                      ? 'bg-amber-500/10 border-amber-500/40 text-white ring-1 ring-amber-500/30'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold mb-1 text-amber-300">
                    <Film className="w-3.5 h-3.5" />
                    <span>Full Video Parts</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Converts entire video sequentially into Part 1, 2, 3...
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setExtractMode('fixed')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    extractMode === 'fixed'
                      ? 'bg-indigo-500/10 border-indigo-500/40 text-white ring-1 ring-indigo-500/30'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold mb-1 text-indigo-300">
                    <Scissors className="w-3.5 h-3.5" />
                    <span>Fixed Chunks</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Splits video into uniform {targetDuration}s segments.
                  </p>
                </button>
              </div>
            </div>

            {/* Number of Shorts to Extract Selector (Kitne Shorts Nikalne Hai) */}
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-rose-400" />
                  <span>2. Number of Shorts to Extract (Kitne Shorts Nikalne Hai)</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {maxClips === 'all' ? 'All Video Parts' : `${maxClips} Short${maxClips > 1 ? 's' : ''}`}
                </span>
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {[1, 2, 3, 5, 10, 'all'].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setMaxClips(count)}
                    className={`py-2 px-1 rounded-xl text-xs font-mono font-bold transition-all text-center ${
                      maxClips === count
                        ? count === 'all'
                          ? 'bg-amber-600 text-white shadow-glow'
                          : 'bg-rose-600 text-white shadow-glow'
                        : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {count === 'all' ? 'All' : count}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 leading-tight pt-0.5">
                {extractMode === 'full_parts'
                  ? maxClips === 'all'
                    ? '🎬 Converts 100% of video from beginning to end into sequential continuous parts.'
                    : `🎬 Converts video sequentially up to the first ${maxClips} continuous parts.`
                  : extractMode === 'ai_smart'
                  ? `⚡ AI will analyze the video and extract the top ${maxClips === 'all' ? 'available' : maxClips} highest-virality moments.`
                  : `⏱️ Extracts ${maxClips === 'all' ? 'all' : maxClips} fixed chunks of ${targetDuration}s each.`}
              </p>
            </div>

            {/* Target Duration Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                3. Target Short Length ({targetDuration}s)
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[30, 45, 60, 90, 180].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setTargetDuration(dur)}
                    className={`py-2 rounded-xl text-xs font-mono font-bold transition-all text-center ${
                      targetDuration === dur
                        ? 'bg-rose-600 text-white shadow-glow'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {dur}s
                  </button>
                ))}
              </div>
            </div>

            {/* AI Engine Model Selection */}
            {extractMode !== 'fixed' && (
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-purple-400" />
                    <span>4. AI Engine Provider</span>
                  </label>
                  <span className="text-[9px] text-slate-500">Failover pool active</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAiProvider('gemini')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      aiProvider === 'gemini'
                        ? 'bg-purple-950/60 border-purple-500 text-purple-200 ring-1 ring-purple-500 font-bold'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs">Google Gemini</div>
                    <div className="text-[9px] text-purple-400 mt-0.5">10-Key Pool</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiProvider('openai')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      aiProvider === 'openai'
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500 font-bold'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs">OpenAI GPT-4o</div>
                    <div className="text-[9px] text-emerald-400 mt-0.5">3-Key Pool</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiProvider('both')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      aiProvider === 'both'
                        ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500 font-bold'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs">⚡ Dual AI</div>
                    <div className="text-[9px] text-cyan-400 mt-0.5">Combined Results</div>
                  </button>
                </div>
              </div>
            )}

            {/* Subtitles & Captions Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <Captions className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Generate Subtitles & Transcripts</p>
                  <p className="text-[11px] text-slate-400">Burn AI speech captions onto generated 9:16 Shorts</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={subtitlesEnabled}
                  onChange={(e) => setSubtitlesEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                <span className={`ml-2 text-xs font-mono font-bold ${subtitlesEnabled ? 'text-rose-400' : 'text-slate-500'}`}>
                  {subtitlesEnabled ? 'ON' : 'OFF'}
                </span>
              </label>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setExtractModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingExtract}
                onClick={handleExecuteExtraction}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-glow transition-all disabled:opacity-50 active:scale-95"
              >
                {submittingExtract ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dispatching to Render Worker...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>
                      {extractMode === 'full_parts'
                        ? 'Convert Video into Parts'
                        : `Generate ${maxClips === 'all' ? 'All' : maxClips} Shorts Now`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
