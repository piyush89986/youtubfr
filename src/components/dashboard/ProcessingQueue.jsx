import React from 'react';
import { Activity, Clock, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const ProcessingQueue = ({ activeJobs = [] }) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Active Background Jobs</h3>
            <p className="text-xs text-slate-400">FFmpeg clipping, AI transcription & publishing</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          {activeJobs.length} Running
        </span>
      </div>

      {activeJobs.length === 0 ? (
        <div className="py-8 text-center flex flex-col items-center justify-center border border-dashed border-slate-800/80 rounded-xl bg-slate-950/20">
          <CheckCircle2 className="w-8 h-8 text-emerald-400/60 mb-2" />
          <p className="text-xs font-medium text-slate-300">All queues are clear</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Upload a video to start the AI clipping pipeline</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeJobs.map((job) => (
            <div
              key={job._id || job.id}
              className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-slate-200 capitalize">
                  {job.jobType ? job.jobType.replace(/_/g, ' ') : 'Video Processing'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {job.progress || 0}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 via-indigo-500 to-cyan-400 transition-all duration-500 rounded-full"
                  style={{ width: `${job.progress || 10}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" />
                  <span>{job.stage || 'Processing segments...'}</span>
                </span>
                <span>{new Date(job.updatedAt || Date.now()).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
