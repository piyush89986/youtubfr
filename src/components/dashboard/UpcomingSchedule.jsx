import React from 'react';
import { CalendarClock, Clock, ExternalLink, Play, MoreVertical } from 'lucide-react';
import { YoutubeIcon as Youtube } from '../common/YoutubeIcon';
import { getMediaUrl } from '../../utils/mediaUtils';

export const UpcomingSchedule = ({ upcoming = [], onPreviewClip, onNavigate }) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <CalendarClock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Upcoming Publications</h3>
            <p className="text-xs text-slate-400">Automated queue published directly to YouTube</p>
          </div>
        </div>
        <button
          onClick={() => onNavigate && onNavigate('schedule')}
          className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
        >
          View Calendar &rarr;
        </button>
      </div>

      {upcoming.length === 0 ? (
        <div className="py-8 text-center flex flex-col items-center justify-center border border-dashed border-slate-800/80 rounded-xl bg-slate-950/20">
          <Clock className="w-8 h-8 text-slate-600 mb-2" />
          <p className="text-xs font-medium text-slate-300">No Shorts scheduled</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Set up daily auto-publishing in the Schedule tab
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {upcoming.map((item) => {
            const clip = item.clip || {};
            const channel = item.youtubeAccount || {};
            return (
              <div
                key={item._id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-800/80 bg-slate-950/50 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => onPreviewClip && onPreviewClip(clip)}
                    className="relative w-12 h-16 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center cursor-pointer group shrink-0"
                  >
                    {clip.storageUrl ? (
                      <video
                        src={getMediaUrl(clip.storageUrl)}
                        className="w-full h-full object-cover"
                        preload="metadata"
                      />
                    ) : (
                      <Play className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition-colors" />
                    )}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors"></div>
                    <span className="absolute bottom-0.5 right-0.5 text-[9px] bg-black/80 px-1 rounded text-white font-mono">
                      9:16
                    </span>
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate max-w-[220px] sm:max-w-xs">
                      {clip.title || 'Untitled Short'}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 text-red-400">
                        <Youtube className="w-3 h-3" />
                        <span className="truncate max-w-[100px]">
                          {channel.channelTitle || 'Connected Channel'}
                        </span>
                      </span>
                      <span>•</span>
                      <span className="font-mono text-slate-300">
                        {new Date(item.scheduledTime).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        {new Date(item.scheduledTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    {item.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
