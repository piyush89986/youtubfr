import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { VideosPage } from './pages/VideosPage';
import { ClipsPage } from './pages/ClipsPage';
import { SchedulePage } from './pages/SchedulePage';
import { ChannelsPage } from './pages/ChannelsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { UploadModal } from './components/video/UploadModal';
import { ShortsPreviewModal } from './components/clips/ShortsPreviewModal';
import { ScheduleModal } from './components/schedule/ScheduleModal';
import { RefreshCw } from 'lucide-react';
import api from './services/api';

const MainApplication = () => {
  const { isAuthenticated, loading } = useAuth();
  const toast = useToast();

  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [currentTab, setCurrentTab] = useState('dashboard');
  
  // Modals state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [previewClip, setPreviewClip] = useState(null);
  const [scheduleClip, setScheduleClip] = useState(null);

  // Handle OAuth callback redirect parameters on mount
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    const connectedParam = params.get('connected');
    const oauthError = params.get('oauth_error');

    if (tabParam) {
      setCurrentTab(tabParam);
    }
    if (connectedParam === 'true') {
      toast.success('YouTube Channel connected successfully!');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (oauthError) {
      toast.error(`YouTube connection failed: ${decodeURIComponent(oauthError)}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080b11] flex flex-col items-center justify-center text-slate-400 gap-3">
        <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
        <span className="text-xs font-semibold tracking-wide">Initializing ShortsCraft AI...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authView === 'register') {
      return <RegisterPage onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onSwitchToRegister={() => setAuthView('register')} />;
  }

  const handleUploadComplete = (videoData) => {
    toast.success(`Video "${videoData.title}" queued for processing!`);
    setCurrentTab('videos');
  };

  const handleSaveClipMetadata = async (clipId, metadata) => {
    try {
      await api.put(`/clips/${clipId}`, metadata);
      toast.success('Short metadata and subtitle styling saved!');
    } catch (err) {
      toast.error('Failed to update metadata');
    }
  };

  const handleConfirmSchedule = async (scheduleData) => {
    try {
      await api.post('/schedules', scheduleData);
      toast.success('Short successfully scheduled for YouTube publication!');
      setCurrentTab('schedule');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule short');
    }
  };

  return (
    <AppLayout
      currentTab={currentTab}
      onNavigate={setCurrentTab}
      onOpenUpload={() => setUploadModalOpen(true)}
    >
      {currentTab === 'dashboard' && (
        <DashboardPage
          onOpenUpload={() => setUploadModalOpen(true)}
          onPreviewClip={(clip) => setPreviewClip(clip)}
          onScheduleClip={(clip) => setScheduleClip(clip)}
          onNavigate={setCurrentTab}
        />
      )}

      {currentTab === 'videos' && (
        <VideosPage
          onOpenUpload={() => setUploadModalOpen(true)}
          onNavigate={setCurrentTab}
        />
      )}

      {currentTab === 'clips' && (
        <ClipsPage
          onPreviewClip={(clip) => setPreviewClip(clip)}
          onScheduleClip={(clip) => setScheduleClip(clip)}
        />
      )}

      {currentTab === 'schedule' && (
        <SchedulePage
          onPreviewClip={(clip) => setPreviewClip(clip)}
          onNavigate={setCurrentTab}
        />
      )}

      {currentTab === 'channels' && <ChannelsPage />}

      {currentTab === 'settings' && <SettingsPage />}

      {/* Upload Long Video Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadComplete={handleUploadComplete}
      />

      {/* 9:16 Shorts Preview & Metadata Studio Modal */}
      <ShortsPreviewModal
        clip={previewClip}
        isOpen={!!previewClip}
        onClose={() => setPreviewClip(null)}
        onSaveMetadata={handleSaveClipMetadata}
        onSchedule={(clip) => setScheduleClip(clip)}
      />

      {/* Auto-Publisher Scheduling Modal */}
      <ScheduleModal
        clip={scheduleClip}
        isOpen={!!scheduleClip}
        onClose={() => setScheduleClip(null)}
        onConfirmSchedule={handleConfirmSchedule}
      />
    </AppLayout>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApplication />
      </AuthProvider>
    </ToastProvider>
  );
}
