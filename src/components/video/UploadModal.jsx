import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  UploadCloud, 
  FileVideo, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck,
  Film,
  Terminal,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Captions,
  Cpu
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const UploadModal = ({ isOpen, onClose, onUploadComplete }) => {
  if (!isOpen) return null;

  const { user } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [clippingMode, setClippingMode] = useState('ai_smart'); // 'ai_smart' | 'fixed'
  const [selectedAiEngine, setSelectedAiEngine] = useState(
    user?.settings?.preferredAIProvider || 'gemini'
  ); // 'gemini' | 'openai' | 'both'
  const [clipDuration, setClipDuration] = useState(60); // 30, 45, 60, 90, 180s
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState, setUploadState] = useState('idle'); // 'idle' | 'signing' | 'uploading' | 'confirming' | 'completed' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  
  // Real-time diagnostics logging state
  const [diagnosticLogs, setDiagnosticLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [logsCopied, setLogsCopied] = useState(false);

  const fileInputRef = useRef(null);
  const logsEndRef = useRef(null);

  const addLog = (type, message, details = null) => {
    const time = new Date().toLocaleTimeString();
    const logItem = { id: Date.now() + Math.random(), time, type, message, details };
    
    // Rich styled console output
    const styleMap = {
      info: 'color: #38bdf8; font-weight: bold;',
      success: 'color: #4ade80; font-weight: bold;',
      warn: 'color: #facc15; font-weight: bold;',
      error: 'color: #f43f5e; font-weight: bold;',
    };
    console.log(`%c[SHORTS_UPLOAD ${type.toUpperCase()}] [${time}] ${message}`, styleMap[type] || '', details || '');

    setDiagnosticLogs((prev) => [...prev, logItem]);
  };

  useEffect(() => {
    if (showLogs && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [diagnosticLogs, showLogs]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (selectedFile) => {
    addLog('info', `Selected file: "${selectedFile.name}" (${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB, type: ${selectedFile.type || 'unknown'})`);

    // Validate video MIME types and extensions
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/mkv'];
    const isExtensionValid = Boolean(selectedFile.name.match(/\.(mp4|mov|avi|webm|mkv)$/i));
    
    if (!validTypes.includes(selectedFile.type) && !isExtensionValid) {
      const err = 'Please select a valid video file (.mp4, .mov, .avi, .webm, .mkv)';
      addLog('warn', `Validation rejected: Unsupported format "${selectedFile.type || 'empty'}"`);
      setErrorMessage(err);
      return;
    }

    // Limit check (500MB)
    const maxBytes = 500 * 1024 * 1024;
    if (selectedFile.size > maxBytes) {
      const err = `File size (${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 500MB limit.`;
      addLog('error', `Validation rejected: ${err}`);
      setErrorMessage(err);
      return;
    }

    setErrorMessage('');
    setFile(selectedFile);
    if (!videoTitle) {
      setVideoTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
    }
    addLog('success', `File "${selectedFile.name}" passed all client validations and is ready.`);
  };

  const copyDiagnosticLogs = () => {
    const text = diagnosticLogs
      .map((l) => `[${l.time}] [${l.type.toUpperCase()}] ${l.message} ${l.details ? JSON.stringify(l.details) : ''}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setLogsCopied(true);
    setTimeout(() => setLogsCopied(false), 2000);
  };

  const startUpload = async () => {
    if (!file) return;

    setErrorMessage('');
    setShowLogs(true);
    addLog('info', `=== Commencing Upload Pipeline for "${file.name}" ===`);

    try {
      setUploadState('signing');
      setUploadProgress(5);

      // Step 1: Request signed upload signature from backend
      addLog('info', 'Step 1/3: Requesting signed upload signature from backend (/api/videos/upload-signature)...', {
        filename: file.name,
        fileSize: file.size,
        contentType: file.type || 'video/mp4',
      });

      const signRes = await api.post('/videos/upload-signature', {
        filename: file.name,
        fileSize: file.size,
        contentType: file.type || 'video/mp4',
      });

      if (!signRes.data?.data) {
        throw new Error('Backend returned empty signature response payload');
      }

      const { uploadUrl, uploadFields, uploadMode, storageKey } = signRes.data.data;
      addLog('success', `Step 1/3 OK: Signature generated. Mode: "${uploadMode}", Key: "${storageKey}"`, {
        uploadMode,
        uploadUrl,
        storageKey,
      });

      // Step 2: Upload directly to storage (Cloudinary or Direct Signed URL)
      setUploadState('uploading');
      setUploadProgress(15);

      let finalUrl = '';
      let finalKey = storageKey;
      let uploadSucceeded = false;

      // Primary Attempt: Cloudinary (if configured)
      if (uploadMode === 'cloudinary') {
        try {
          addLog('info', `Step 2/3: Uploading direct to Cloudinary API (${uploadUrl})...`);
          
          const formData = new FormData();
          Object.keys(uploadFields || {}).forEach((k) => {
            formData.append(k, uploadFields[k]);
          });
          formData.append('file', file);

          setUploadProgress(30);
          const cloudRes = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
          });

          if (!cloudRes.ok) {
            let errorBody = '';
            try {
              const errJson = await cloudRes.json();
              errorBody = errJson?.error?.message || JSON.stringify(errJson);
            } catch {
              errorBody = await cloudRes.text().catch(() => 'Unknown network failure');
            }
            throw new Error(`Cloudinary rejected upload (${cloudRes.status}): ${errorBody}`);
          }

          const cloudData = await cloudRes.json();
          finalUrl = cloudData.secure_url || cloudData.url;
          finalKey = cloudData.public_id || storageKey;
          uploadSucceeded = true;
          addLog('success', `Step 2/3 OK: Cloudinary upload complete! URL: ${finalUrl}`);
        } catch (cloudErr) {
          addLog('warn', `Cloudinary upload failed: ${cloudErr.message}`);
          addLog('info', 'Automatically falling back to Direct Local Server upload (/api/videos/upload-direct)...');
        }
      }

      // Fallback Attempt: Direct Multipart Upload to Local Backend
      if (!uploadSucceeded) {
        addLog('info', 'Step 2/3: Uploading video directly to backend server (/api/videos/upload-direct)...');
        
        const localFormData = new FormData();
        localFormData.append('video', file);
        localFormData.append('storageKey', storageKey);

        const localRes = await api.post('/videos/upload-direct', localFormData, {
          headers: {
            'Content-Type': undefined, // Allow browser to calculate multipart/form-data with unique boundary
          },
          onUploadProgress: (progressEvent) => {
            const total = progressEvent.total || file.size;
            const percent = Math.min(90, Math.round((progressEvent.loaded * 90) / total));
            setUploadProgress(percent);
            if (percent === 30 || percent === 60 || percent === 90) {
              addLog('info', `Direct server upload progress: ${percent}% (${(progressEvent.loaded / (1024 * 1024)).toFixed(1)}MB / ${(total / (1024 * 1024)).toFixed(1)}MB)`);
            }
          },
        });

        if (!localRes.data?.data) {
          throw new Error('Local server did not return stored file metadata');
        }

        finalUrl = localRes.data.data.url;
        finalKey = localRes.data.data.key;
        uploadSucceeded = true;
        addLog('success', `Step 2/3 OK: Direct server storage stored file at "${finalUrl}" (key: ${finalKey})`);
      }

      setUploadProgress(92);
      setUploadState('confirming');

      // Step 3: Confirm video creation and trigger worker pipeline
      addLog('info', 'Step 3/3: Confirming video registration in MongoDB and launching AI pipeline (/api/videos/confirm)...', {
        title: videoTitle || file.name,
        originalFilename: file.name,
        fileSize: file.size,
        storageKey: finalKey,
        storageUrl: finalUrl,
        clippingMode,
        targetDuration: clipDuration,
        subtitlesEnabled,
        aiProvider: selectedAiEngine,
      });

      const confirmRes = await api.post('/videos/confirm', {
        title: videoTitle || file.name,
        originalFilename: file.name,
        fileSize: file.size,
        storageKey: finalKey,
        storageUrl: finalUrl,
        clippingMode,
        targetDuration: clipDuration,
        subtitlesEnabled,
        aiProvider: selectedAiEngine,
      });

      const responseData = confirmRes.data?.data;
      addLog('success', `Step 3/3 OK: Video registered with ID: ${responseData?.video?._id}. AI Processing Job queued with ID: ${responseData?.jobId}`);

      setUploadProgress(100);
      setUploadState('completed');
      addLog('success', '=== Video Upload Pipeline Finished Successfully! ===');

      setTimeout(() => {
        if (onUploadComplete) onUploadComplete(responseData);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('[SHORTS_UPLOAD CRITICAL ERROR]', err);
      const serverMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to complete video upload';
      const statusCode = err.response?.status;
      
      const fullError = statusCode ? `[HTTP ${statusCode}] ${serverMsg}` : serverMsg;
      addLog('error', `UPLOAD FAILED: ${fullError}`, {
        status: statusCode,
        response: err.response?.data,
        config: err.config ? { url: err.config.url, method: err.config.method } : null,
      });

      setUploadState('error');
      setErrorMessage(fullError);
      setShowLogs(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0c101a] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 max-h-[92vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={uploadState === 'uploading' || uploadState === 'signing'}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors disabled:opacity-30"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 shrink-0">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Upload Long Source Video</h3>
            <p className="text-xs text-slate-400">Direct signed cloud & local server upload with real-time logging</p>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1">
          {/* Dropzone */}
          {!file ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                dragActive
                  ? 'border-rose-500 bg-rose-500/10 scale-[1.01]'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-900/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-3">
                <Film className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-white">
                Drag & drop your video here, or <span className="text-rose-400">browse</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">MP4, MOV, WEBM, MKV up to 500MB</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected File Card */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-rose-600/20 text-rose-400">
                    <FileVideo className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate max-w-xs">{file.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB • {file.type || 'video'}
                    </p>
                  </div>
                </div>
                {uploadState === 'idle' && (
                  <button
                    onClick={() => {
                      setFile(null);
                      setDiagnosticLogs([]);
                    }}
                    className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    Change
                  </button>
                )}
              </div>

              {/* Video Title Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Video Title</label>
                <input
                  type="text"
                  value={videoTitle}
                  disabled={uploadState !== 'idle'}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Clipping Mode Selector */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setClippingMode('ai_smart')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    clippingMode === 'ai_smart'
                      ? 'bg-rose-500/10 border-rose-500/40 text-white'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold mb-1 text-rose-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Smart Clipping</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Transcribes audio & identifies viral moments with speech hooks.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setClippingMode('fixed')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    clippingMode === 'fixed'
                      ? 'bg-indigo-500/10 border-indigo-500/40 text-white'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold mb-1 text-indigo-300">
                    <Film className="w-3.5 h-3.5" />
                    <span>Fixed-Length Segments</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Splits video into uniform {clipDuration}s clips automatically.
                  </p>
                </button>
              </div>

              {/* AI Engine Model Selection (When AI Smart Clipping is active) */}
              {clippingMode === 'ai_smart' && (
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-purple-400" />
                      <span>AI Engine Model</span>
                    </label>
                    <span className="text-[9px] text-slate-500">Pick provider or run both together</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      disabled={uploadState !== 'idle'}
                      onClick={() => setSelectedAiEngine('gemini')}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        selectedAiEngine === 'gemini'
                          ? 'bg-purple-950/60 border-purple-500 text-purple-200 ring-1 ring-purple-500 font-bold'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs">Google Gemini</div>
                      <div className="text-[9px] text-purple-400 mt-0.5">10-Key Pool</div>
                    </button>

                    <button
                      type="button"
                      disabled={uploadState !== 'idle'}
                      onClick={() => setSelectedAiEngine('openai')}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        selectedAiEngine === 'openai'
                          ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500 font-bold'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs">OpenAI GPT-4o</div>
                      <div className="text-[9px] text-emerald-400 mt-0.5">3-Key Pool</div>
                    </button>

                    <button
                      type="button"
                      disabled={uploadState !== 'idle'}
                      onClick={() => setSelectedAiEngine('both')}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        selectedAiEngine === 'both'
                          ? 'bg-gradient-to-r from-purple-900/60 to-emerald-900/60 border-cyan-400 text-cyan-200 ring-1 ring-cyan-400 font-bold'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs flex items-center justify-center gap-1">⚡ Both (Dual AI)</div>
                      <div className="text-[9px] text-cyan-400 mt-0.5">Combined Results</div>
                    </button>
                  </div>
                </div>
              )}

              {/* Target Duration Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Short Duration ({clipDuration}s)
                </label>
                <div className="flex items-center gap-2">
                  {[30, 45, 60, 90, 180].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setClipDuration(dur)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
                        clipDuration === dur
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {dur}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Transcript & Subtitles Toggle Option */}
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
                    disabled={uploadState !== 'idle'}
                    onChange={(e) => setSubtitlesEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                  <span className={`ml-2 text-xs font-mono font-bold transition-colors ${subtitlesEnabled ? 'text-rose-400' : 'text-slate-500'}`}>
                    {subtitlesEnabled ? 'ON' : 'OFF'}
                  </span>
                </label>
              </div>

              {/* Direct Signed Storage Safeguard */}
              <div className="flex items-center gap-2 text-[11px] text-slate-400 px-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Multi-Tier Storage: Signed Cloudinary with automatic local server fallback.</span>
              </div>

              {/* Upload Progress Bar if active */}
              {uploadState !== 'idle' && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-300 capitalize">
                      {uploadState === 'signing' && '1/3: Requesting signed upload signature...'}
                      {uploadState === 'uploading' && '2/3: Uploading video binary stream...'}
                      {uploadState === 'confirming' && '3/3: Registering video & queueing AI worker...'}
                      {uploadState === 'completed' && 'Upload completed successfully!'}
                      {uploadState === 'error' && 'Upload failed - inspect logs below'}
                    </span>
                    <span className="text-rose-400 font-mono">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 via-indigo-500 to-cyan-400 transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Message Box */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="space-y-1">
                <p className="font-semibold text-rose-200">Upload Process Encountered an Error</p>
                <p className="text-rose-300/90 font-mono text-[11px] break-all">{errorMessage}</p>
                <p className="text-[11px] text-slate-400">Check the Live Diagnostic Logs below or your browser DevTools (F12) for exact details.</p>
              </div>
            </div>
          )}

          {/* Collapsible Live Diagnostics Log Terminal */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-[#070a10]">
            <button
              type="button"
              onClick={() => setShowLogs(!showLogs)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-900/50 hover:bg-slate-900 text-slate-300 text-xs font-semibold transition-colors"
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-rose-400" />
                <span>Live Upload Diagnostics</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-400 font-mono">
                  {diagnosticLogs.length} events
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                {showLogs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showLogs && (
              <div className="p-3 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-slate-800/40">
                  <span>Real-time console stream:</span>
                  <button
                    type="button"
                    onClick={copyDiagnosticLogs}
                    className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    {logsCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{logsCopied ? 'Copied!' : 'Copy Logs'}</span>
                  </button>
                </div>

                <div className="max-h-44 overflow-y-auto space-y-1 font-mono text-[11px] pr-1">
                  {diagnosticLogs.length === 0 ? (
                    <p className="text-slate-600 italic">No events recorded yet. Select a file or click upload.</p>
                  ) : (
                    diagnosticLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-2 leading-tight">
                        <span className="text-slate-500 shrink-0 select-none">[{log.time}]</span>
                        <span
                          className={`uppercase text-[9px] font-bold px-1 rounded shrink-0 select-none ${
                            log.type === 'success'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : log.type === 'error'
                              ? 'bg-rose-500/20 text-rose-400'
                              : log.type === 'warn'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-cyan-500/20 text-cyan-400'
                          }`}
                        >
                          {log.type}
                        </span>
                        <span
                          className={`break-all ${
                            log.type === 'error'
                              ? 'text-rose-300'
                              : log.type === 'warn'
                              ? 'text-amber-300'
                              : log.type === 'success'
                              ? 'text-emerald-300'
                              : 'text-slate-300'
                          }`}
                        >
                          {log.message}
                        </span>
                      </div>
                    ))
                  )}
                  <div ref={logsEndRef} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-800/80 shrink-0">
          <div className="text-[11px] text-slate-500">
            {uploadState === 'uploading' && 'Stream active... Do not close window'}
            {uploadState === 'completed' && <span className="text-emerald-400">All checks passed!</span>}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={uploadState === 'uploading' || uploadState === 'signing'}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-30"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!file || uploadState === 'signing' || uploadState === 'uploading' || uploadState === 'confirming'}
              onClick={startUpload}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-glow disabled:opacity-50 transition-all active:scale-95"
            >
              {uploadState === 'idle' && 'Start AI Clipping'}
              {uploadState === 'signing' && 'Authorizing...'}
              {uploadState === 'uploading' && 'Uploading...'}
              {uploadState === 'confirming' && 'Registering...'}
              {uploadState === 'completed' && 'Done!'}
              {uploadState === 'error' && 'Retry Upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
