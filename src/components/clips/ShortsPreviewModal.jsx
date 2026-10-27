import React, { useState, useRef } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ThumbsUp, 
  MessageCircle, 
  Share2, 
  Disc, 
  CalendarPlus,
  Save,
  Check,
  Captions,
  UploadCloud,
  ExternalLink,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { YoutubeIcon as Youtube } from '../common/YoutubeIcon';
import { getMediaUrl } from '../../utils/mediaUtils';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const ShortsPreviewModal = ({ clip, isOpen, onClose, onSaveMetadata, onSchedule }) => {
  if (!isOpen || !clip) return null;

  const { connectedChannels } = useAuth();
  const toast = useToast();

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [title, setTitle] = useState(clip.title || '');
  const [description, setDescription] = useState(clip.description || '');
  const [tags, setTags] = useState((clip.tags || []).join(', '));
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(
    clip.subtitlesEnabled !== undefined ? clip.subtitlesEnabled : true
  );
  const [subtitleStyle, setSubtitleStyle] = useState(clip.subtitleStyle || {
    fontSize: 24,
    fontColor: '#FFFFFF',
    highlightColor: '#FACC15',
    position: 'bottom',
  });
  const [isSaved, setIsSaved] = useState(false);
  const [isRerendering, setIsRerendering] = useState(false);
  const [videoCacheKey, setVideoCacheKey] = useState(
    clip.updatedAt ? new Date(clip.updatedAt).getTime() : Date.now()
  );

  // Direct YouTube upload state
  const [isDirectUploading, setIsDirectUploading] = useState(false);
  const [directPanelOpen, setDirectPanelOpen] = useState(false);
  const [selectedChannelId, setSelectedChannelId] = useState(
    connectedChannels.length > 0 ? connectedChannels[0]._id : ''
  );
  const [privacyStatus, setPrivacyStatus] = useState('public');
  const [youtubeUrl, setYoutubeUrl] = useState(clip.youtubeUrl || null);
  const [publishingStatus, setPublishingStatus] = useState(clip.publishingStatus || 'draft');

  const videoRef = useRef(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Re-render video with FFmpeg (with or without burned-in subtitles)
  const handleRerenderVideo = async (targetSubtitlesState) => {
    const target = targetSubtitlesState !== undefined ? Boolean(targetSubtitlesState) : Boolean(subtitlesEnabled);
    setIsRerendering(true);
    try {
      const res = await api.post(`/clips/${clip._id}/rerender`, {
        subtitlesEnabled: target,
      });
      const updated = res.data?.data;
      if (updated) {
        clip.subtitlesEnabled = target;
        clip.updatedAt = updated.updatedAt || new Date().toISOString();
        setSubtitlesEnabled(target);
        setVideoCacheKey(Date.now());
        toast.success(target ? 'Video re-rendered WITH subtitles!' : 'Transcript subtitles removed! Clean video is ready.');
        if (onSaveMetadata) {
          onSaveMetadata(clip._id, { subtitlesEnabled: target });
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Re-rendering failed';
      toast.error(`Re-rendering failed: ${msg}`);
    } finally {
      setIsRerendering(false);
    }
  };

  const handleSave = () => {
    const formattedTags = tags
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    if (onSaveMetadata) {
      onSaveMetadata(clip._id, {
        title,
        description,
        tags: formattedTags,
        subtitleStyle,
        subtitlesEnabled,
      });
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Immediate direct upload to YouTube without scheduling
  const handleExecuteDirectUpload = async () => {
    if (connectedChannels.length === 0) {
      toast.error('No connected YouTube channel found. Connect one in the Channels tab first.');
      return;
    }

    setIsDirectUploading(true);
    try {
      const channelId = selectedChannelId || (connectedChannels.length > 0 ? connectedChannels[0]._id : null);
      const res = await api.post('/youtube/publish-now', {
        clipId: clip._id,
        channelId,
        privacyStatus,
      });

      const data = res.data?.data;
      if (data) {
        setYoutubeUrl(data.youtubeUrl);
        setPublishingStatus('published');
        clip.publishingStatus = 'published';
        clip.youtubeUrl = data.youtubeUrl;
        clip.youtubeVideoId = data.youtubeVideoId;
        setDirectPanelOpen(false);
        toast.success(`Short successfully published to YouTube channel "${data.channelTitle}"!`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Direct upload to YouTube failed';
      toast.error(`Direct YouTube upload failed: ${msg}`);
    } finally {
      setIsDirectUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#0b0f19] border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row max-h-[94vh] sm:max-h-[92vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 p-2 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-95 shadow-lg border border-slate-700/50"
          title="Close Preview"
          aria-label="Close Preview"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: 9:16 Vertical Video Phone Frame Simulator */}
        <div className="w-full lg:w-[340px] bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-slate-800 shrink-0">
          <div className="relative w-[180px] h-[340px] sm:w-[220px] sm:h-[420px] lg:w-[240px] lg:h-[480px] rounded-[28px] sm:rounded-[36px] border-4 border-slate-700/80 bg-black overflow-hidden shadow-2xl flex flex-col justify-between mx-auto">
            
            {/* Top Phone Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-800 rounded-full z-20"></div>

            {/* Video Player */}
            <div className="relative w-full h-full cursor-pointer bg-slate-900" onClick={togglePlay}>
              <video
                ref={videoRef}
                key={videoCacheKey}
                src={`${getMediaUrl(clip.storageUrl) || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}?t=${videoCacheKey}`}
                className="w-full h-full object-cover"
                autoPlay
                loop
                playsInline
                muted={isMuted}
                onError={(e) => {
                  console.warn('Video load error on clip source, falling back to CDN video stream');
                  const fallbackCdn = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
                  if (e.target.src !== fallbackCdn) {
                    e.target.src = fallbackCdn;
                    e.target.play().catch(() => {});
                  }
                }}
              />

              {/* Tap to Unmute Overlay Prompt */}
              {isMuted && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                  className="absolute top-8 left-1/2 -translate-x-1/2 z-30 px-3 py-1 bg-black/80 hover:bg-black/95 backdrop-blur-md rounded-full text-[11px] font-semibold text-white border border-white/20 flex items-center gap-1.5 shadow-xl transition-all hover:scale-105"
                >
                  <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tap for Sound</span>
                </button>
              )}

              {/* Re-rendering Loader Overlay */}
              {isRerendering && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-4 text-center animate-fade-in">
                  <Loader2 className="w-8 h-8 text-rose-500 animate-spin mb-2" />
                  <p className="text-xs font-bold text-white">Re-rendering with FFmpeg</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {subtitlesEnabled ? 'Burning subtitles into video...' : 'Removing transcript subtitles...'}
                  </p>
                </div>
              )}

              {/* Subtitle / Transcript Burn-In Simulator Overlay (Controlled by subtitlesEnabled) */}
              {subtitlesEnabled && (
                <div
                  className={`absolute left-0 right-0 px-4 text-center pointer-events-none transition-all duration-300 animate-fade-in ${
                    subtitleStyle.position === 'top'
                      ? 'top-12'
                      : subtitleStyle.position === 'middle'
                      ? 'top-1/2 -translate-y-1/2'
                      : 'bottom-20'
                  }`}
                >
                  <div className="inline-block bg-black/75 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 shadow-lg">
                    <span
                      className="font-black tracking-wide uppercase drop-shadow-md text-xs sm:text-sm block"
                      style={{ color: subtitleStyle.fontColor }}
                    >
                      AI Hook:{' '}
                      <span style={{ color: subtitleStyle.highlightColor }}>
                        {clip.title?.substring(0, 30) || 'This clip will blow your mind'}...
                      </span>
                    </span>
                  </div>
                </div>
              )}

              {/* Simulated YouTube Shorts Right Action Bar */}
              <div className="absolute right-2 bottom-16 flex flex-col items-center gap-3 text-white text-[10px] drop-shadow-md pointer-events-none">
                <div className="flex flex-col items-center">
                  <div className="p-2 rounded-full bg-black/40 backdrop-blur-sm">
                    <ThumbsUp className="w-4 h-4" />
                  </div>
                  <span>14.2K</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="p-2 rounded-full bg-black/40 backdrop-blur-sm">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <span>482</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="p-2 rounded-full bg-black/40 backdrop-blur-sm">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <span>Share</span>
                </div>
                <div className="p-2 rounded-full bg-black/60 animate-spin">
                  <Disc className="w-4 h-4 text-rose-400" />
                </div>
              </div>

              {/* Bottom Video Controls Overlay */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  className="p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                  className="p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Metadata & Subtitle Studio Editor */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-4 sm:space-y-5 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">Shorts Studio & Metadata</h3>
                  <p className="text-xs text-slate-400">Review AI-optimized title, hashtags, and subtitles</p>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{clip.hookScore || 90}% Viral Score</span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  YouTube Title ({title.length}/100)
                </label>
                <input
                  type="text"
                  value={title}
                  maxLength={100}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Description & Timestamps
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Hashtags (comma separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="shorts, viral, podcast, motivation"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-rose-300 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors font-mono"
                />
              </div>

              {/* Transcript & Subtitle Styling Customizer with ON/OFF Option */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3.5 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <Captions className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Transcript & Subtitles</h4>
                      <p className="text-[11px] text-slate-400">Display transcript captions & speech hook overlay</p>
                    </div>
                  </div>

                  {/* ON / OFF Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={subtitlesEnabled}
                      onChange={(e) => setSubtitlesEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                    <span className={`ml-2 text-xs font-mono font-bold transition-colors ${subtitlesEnabled ? 'text-rose-400' : 'text-slate-500'}`}>
                      {subtitlesEnabled ? 'ON' : 'OFF'}
                    </span>
                  </label>
                </div>

                {/* Subtitle controls active only when subtitlesEnabled is ON */}
                {subtitlesEnabled ? (
                  <div className="pt-2 border-t border-slate-800/60 space-y-3 animate-fade-in">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1 font-semibold">Highlight Color</label>
                        <div className="flex items-center gap-2 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-800">
                          <input
                            type="color"
                            value={subtitleStyle.highlightColor}
                            onChange={(e) =>
                              setSubtitleStyle({ ...subtitleStyle, highlightColor: e.target.value })
                            }
                            className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0 shrink-0"
                          />
                          <span className="font-mono text-xs text-slate-200 uppercase">{subtitleStyle.highlightColor}</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1 font-semibold">Position</label>
                        <select
                          value={subtitleStyle.position}
                          onChange={(e) =>
                            setSubtitleStyle({ ...subtitleStyle, position: e.target.value })
                          }
                          className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-rose-500"
                        >
                          <option value="bottom">Bottom (Standard)</option>
                          <option value="middle">Center (Dynamic)</option>
                          <option value="top">Top</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isRerendering}
                      onClick={() => handleRerenderVideo(true)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-slate-800 hover:border-slate-700 disabled:opacity-50"
                    >
                      {isRerendering ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                          <span>Re-rendering with subtitles...</span>
                        </>
                      ) : (
                        <>
                          <Captions className="w-3.5 h-3.5 text-rose-400" />
                          <span>Re-render Video with Subtitles</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-slate-800/60 space-y-3 animate-fade-in">
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                      <span>Transcript subtitles are turned OFF. Video will be saved and published clean.</span>
                    </div>

                    <button
                      type="button"
                      disabled={isRerendering}
                      onClick={() => handleRerenderVideo(false)}
                      className="w-full py-2 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all border border-rose-500/40 hover:border-rose-500 shadow-sm disabled:opacity-50"
                    >
                      {isRerendering ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                          <span>Re-rendering clean video without subtitles...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                          <span>Re-render Clean Video (Remove Burned Subtitles)</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Direct Upload Options Panel (When triggered) */}
              {directPanelOpen && (
                <div className="p-4 rounded-2xl bg-gradient-to-b from-red-950/40 to-slate-950 border border-red-500/40 space-y-3.5 animate-fade-in shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-red-600/20 text-red-400">
                        <Youtube className="w-4 h-4 text-red-500" />
                      </div>
                      <span className="text-xs font-bold text-white">Direct Upload to YouTube</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDirectPanelOpen(false)}
                      className="text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      Close
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1 font-semibold">Destination Channel</label>
                      <select
                        value={selectedChannelId}
                        onChange={(e) => setSelectedChannelId(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-red-500"
                      >
                        {connectedChannels.map((ch) => (
                          <option key={ch._id} value={ch._id}>
                            {ch.channelTitle}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1 font-semibold">Privacy Status</label>
                      <select
                        value={privacyStatus}
                        onChange={(e) => setPrivacyStatus(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-red-500"
                      >
                        <option value="public">Public (Instant Reach)</option>
                        <option value="unlisted">Unlisted (Review First)</option>
                        <option value="private">Private (Restricted)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isDirectUploading || connectedChannels.length === 0}
                    onClick={handleExecuteDirectUpload}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 transition-all flex items-center justify-center gap-2 shadow-glow disabled:opacity-50"
                  >
                    {isDirectUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Uploading Directly to YouTube...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        <span>Confirm Direct Upload Now (Skip Scheduling)</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-800/80 mt-4">
            <button
              onClick={handleSave}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            >
              {isSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
              <span>{isSaved ? 'Changes Saved' : 'Save Metadata'}</span>
            </button>

            <div className="flex items-center gap-2.5">
              {publishingStatus === 'published' || youtubeUrl ? (
                <a
                  href={youtubeUrl || `https://www.youtube.com/shorts/${clip.youtubeVideoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-500 shadow-glow transition-all active:scale-95"
                >
                  <Youtube className="w-4 h-4" />
                  <span>Watch on YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onSchedule) onSchedule(clip);
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-200 transition-colors"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    <span>Schedule</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (connectedChannels.length === 0) {
                        toast.error('No connected YouTube channel found. Connect one in the Channels tab first.');
                        return;
                      }
                      if (!directPanelOpen) {
                        setDirectPanelOpen(true);
                      } else {
                        handleExecuteDirectUpload();
                      }
                    }}
                    disabled={isDirectUploading}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white shadow-glow transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isDirectUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <Youtube className="w-4 h-4 text-white" />
                        <span>Direct Upload</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
