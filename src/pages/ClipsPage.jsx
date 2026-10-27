import React, { useState, useEffect } from 'react';
import { Scissors, Play, Sparkles, CalendarPlus, Filter, RefreshCw, Trash2, UploadCloud, ExternalLink, Loader2 } from 'lucide-react';
import { YoutubeIcon as Youtube } from '../components/common/YoutubeIcon';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { getMediaUrl } from '../utils/mediaUtils';

export const ClipsPage = ({ onPreviewClip, onScheduleClip }) => {
  const [clips, setClips] = useState([]);
  const [filter, setFilter] = useState('all'); // all, draft, scheduled, published
  const [loading, setLoading] = useState(true);
  const [publishingClipId, setPublishingClipId] = useState(null);
  const toast = useToast();

  const fetchClips = async () => {
    try {
      const res = await api.get('/clips');
      if (res.data?.data) {
        setClips(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch clips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClips();
  }, []);

  const handleDelete = async (clipId) => {
    if (!window.confirm('Delete this generated Short?')) return;
    try {
      await api.delete(`/clips/${clipId}`);
      setClips((prev) => prev.filter((c) => c._id !== clipId));
      toast.success('Clip deleted');
    } catch (err) {
      toast.error('Failed to delete clip');
    }
  };

  const handleDirectUpload = async (clip) => {
    setPublishingClipId(clip._id);
    try {
      const res = await api.post('/youtube/publish-now', {
        clipId: clip._id,
      });
      const data = res.data?.data;
      toast.success(`Published Short directly to YouTube channel "${data.channelTitle}"!`);
      setClips((prev) =>
        prev.map((c) =>
          c._id === clip._id
            ? {
                ...c,
                publishingStatus: 'published',
                youtubeUrl: data.youtubeUrl,
                youtubeVideoId: data.youtubeVideoId,
              }
            : c
        )
      );
    } catch (err) {
      toast.error(`Direct YouTube upload failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setPublishingClipId(null);
    }
  };

  const filteredClips = clips.filter((c) => {
    if (filter === 'all') return true;
    return c.publishingStatus === filter;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">AI Shorts Studio</h1>
          <p className="text-xs text-slate-400 mt-1">
            9:16 vertical clips with burned-in subtitles, hook scoring, and auto-generated metadata.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto max-w-full">
          {[
            { id: 'all', label: 'All Shorts' },
            { id: 'draft', label: 'Drafts' },
            { id: 'scheduled', label: 'Scheduled' },
            { id: 'published', label: 'Published' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${filter === tab.id
                ? 'bg-rose-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center">
          <RefreshCw className="w-8 h-8 text-rose-500 animate-spin mb-3" />
          <p className="text-xs text-slate-400">Loading generated Shorts...</p>
        </div>
      ) : filteredClips.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-3xl bg-slate-950/20">
          <Scissors className="w-12 h-12 text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-white">No Shorts found</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            {filter === 'all'
              ? 'Upload a video to let the AI create your first batch of viral Shorts.'
              : `No Shorts currently marked as "${filter}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredClips.map((clip) => (
            <div
              key={clip._id}
              className="group rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden hover:border-rose-500/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                {/* 9:16 Video Thumbnail Container */}
                <div
                  onClick={() => onPreviewClip && onPreviewClip(clip)}
                  className="relative aspect-[9/16] max-h-64 w-full bg-slate-900 overflow-hidden cursor-pointer flex items-center justify-center"
                >
                  {clip.storageUrl ? (
                    <video
                      src={`${getMediaUrl(clip.storageUrl)}?t=${clip.updatedAt ? new Date(clip.updatedAt).getTime() : '1'}`}
                      className="w-full h-full object-cover"
                      preload="metadata"
                      muted
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-b from-indigo-950 to-slate-950 flex flex-col items-center justify-center">
                      <Play className="w-8 h-8 text-rose-400 mb-1" />
                      <span className="text-[10px] text-slate-400">Preview 9:16</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="p-3 rounded-full bg-rose-600 text-white shadow-glow">
                      <Play className="w-5 h-5 fill-white" />
                    </div>
                  </div>

                  {/* Hook score badge */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-amber-500/30 flex items-center gap-1 text-[10px] font-bold text-amber-300">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>{clip.hookScore || 88}% Viral</span>
                  </div>

                  {/* Duration badge */}
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 font-mono text-[10px] text-white">
                    {Math.floor((clip.duration || 45) / 60)}:
                    {String(Math.floor((clip.duration || 45) % 60)).padStart(2, '0')}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-rose-300 transition-colors">
                    {clip.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {clip.description || 'No description added yet.'}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3.5 sm:p-4 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${clip.publishingStatus === 'published'
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                    : clip.publishingStatus === 'scheduled'
                      ? 'bg-rose-950/60 text-rose-300 border-rose-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                >
                  {clip.publishingStatus || 'draft'}
                </span>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => handleDelete(clip._id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete Clip"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {clip.publishingStatus === 'published' ? (
                    <a
                      href={clip.youtubeUrl || `https://www.youtube.com/shorts/${clip.youtubeVideoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                      title="Watch live on YouTube"
                    >
                      <Youtube className="w-3.5 h-3.5 text-red-500" />
                      <span>YouTube</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <>
                      <button
                        onClick={() => handleDirectUpload(clip)}
                        disabled={publishingClipId === clip._id}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600/20 text-red-300 border border-red-500/30 hover:bg-red-600 hover:text-white transition-all shadow-sm disabled:opacity-50"
                        title="Upload directly to YouTube immediately (Skip schedule)"
                      >
                        {publishingClipId === clip._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Youtube className="w-3.5 h-3.5 text-red-400" />
                        )}
                        <span>{publishingClipId === clip._id ? 'Uploading...' : 'Upload Now'}</span>
                      </button>

                      <button
                        onClick={() => onScheduleClip && onScheduleClip(clip)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                        title="Schedule publication for a future date/time"
                      >
                        <CalendarPlus className="w-3.5 h-3.5" />
                        <span>Schedule</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
