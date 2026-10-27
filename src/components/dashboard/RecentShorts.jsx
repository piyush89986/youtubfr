import React from 'react';
import { Play, Sparkles, CalendarPlus, Clock, ExternalLink } from 'lucide-react';
import { YoutubeIcon as Youtube } from '../common/YoutubeIcon';
import { getMediaUrl } from '../../utils/mediaUtils';

export const RecentShorts = ({ clips = [], onPreviewClip, onScheduleClip, onNavigate }) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Generated YouTube Shorts</h3>
            <p className="text-xs text-slate-400">AI-clipped vertical moments with burned-in subtitles</p>
          </div>
        </div>
        <button
          onClick={() => onNavigate && onNavigate('clips')}
          className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
        >
          View All Shorts &rarr;
        </button>
      </div>

      {clips.length === 0 ? (
        <div className="py-12 text-center flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
          <div className="w-12 h-16 rounded-lg border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-600 mb-3 font-mono text-xs">
            9:16
          </div>
          <p className="text-sm font-medium text-slate-300">No Shorts generated yet</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Upload your first video to auto-extract engaging clips with smart topic boundary detection
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clips.map((clip) => (
            <div
              key={clip._id}
              className="group relative rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden hover:border-rose-500/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Thumbnail / 9:16 Preview Box */}
              <div
                onClick={() => onPreviewClip && onPreviewClip(clip)}
                className="relative aspect-[9/16] max-h-56 w-full bg-slate-900 overflow-hidden cursor-pointer flex items-center justify-center"
              >
                {clip.storageUrl ? (
                  <video
                    src={`${getMediaUrl(clip.storageUrl)}?t=${clip.updatedAt ? new Date(clip.updatedAt).getTime() : '1'}`}
                    className="w-full h-full object-cover"
                    preload="metadata"
                    muted
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-2">
                      <Play className="w-5 h-5 fill-rose-500" />
                    </div>
                    <span className="text-[11px] text-slate-400">Preview Short</span>
                  </div>
                )}

                {/* Overlay hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="p-3 rounded-full bg-rose-600 text-white shadow-glow">
                    <Play className="w-5 h-5 fill-white" />
                  </div>
                </div>

                {/* Viral Hook Score Badge */}
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-amber-500/30 flex items-center gap-1 text-[11px] font-bold text-amber-300">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{clip.hookScore || 90}% Viral</span>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 font-mono text-[10px] text-white">
                  {Math.floor((clip.duration || 45) / 60)}:
                  {String(Math.floor((clip.duration || 45) % 60)).padStart(2, '0')}
                </div>
              </div>

              {/* Clip Metadata & Actions */}
              <div className="p-4 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-rose-300 transition-colors">
                    {clip.title}
                  </h4>
                  {clip.tags && clip.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {clip.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-[10px] text-rose-400/80 font-medium">
                          #{tag.replace(/^#/, '')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      clip.publishingStatus === 'published'
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                        : clip.publishingStatus === 'scheduled'
                        ? 'bg-rose-950/60 text-rose-300 border-rose-500/30'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {clip.publishingStatus || 'draft'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {clip.youtubeUrl ? (
                      <a
                        href={clip.youtubeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
                        title="View on YouTube"
                      >
                        <Youtube className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <button
                        onClick={() => onScheduleClip && onScheduleClip(clip)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600 hover:text-white transition-all"
                      >
                        <CalendarPlus className="w-3.5 h-3.5" />
                        <span>Schedule</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
