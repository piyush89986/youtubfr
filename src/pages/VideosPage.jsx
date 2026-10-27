import React, { useState, useEffect } from 'react';
import { Film, Upload, Scissors, Clock, Trash2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export const VideosPage = ({ onOpenUpload, onNavigate }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

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

  const handleGenerateClips = async (videoId) => {
    try {
      await api.post(`/clips/generate`, {
        sourceVideoId: videoId,
        clippingMode: 'ai_smart',
      });
      toast.success('AI clipping pipeline queued! Check background jobs.');
      fetchVideos();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to trigger clipping');
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
                  onClick={() => handleGenerateClips(vid._id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span>Extract AI Shorts</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
