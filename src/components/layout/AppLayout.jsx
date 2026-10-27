import React, { useState, useEffect } from 'react';
import { LeftSidebar } from './LeftSidebar';
import { Menu, PanelLeftOpen } from 'lucide-react';

export const AppLayout = ({ 
  children, 
  currentTab, 
  onNavigate, 
  onOpenUpload, 
  metrics 
}) => {
  // Remember sidebar open/close preference across reloads
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('shortscraft_sidebar_open');
    if (saved !== null) {
      return saved === 'true';
    }
    // Default open on desktop (window width >= 1024), closed on mobile
    return typeof window !== 'undefined' ? window.innerWidth >= 1024 : true;
  });

  const toggleSidebar = (state) => {
    const nextState = state !== undefined ? state : !sidebarOpen;
    setSidebarOpen(nextState);
    localStorage.setItem('shortscraft_sidebar_open', String(nextState));
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex font-sans relative overflow-x-hidden">
      
      {/* Floating Toggle Button (Visible when sidebar is closed/removed) */}
      {!sidebarOpen && (
        <button
          onClick={() => toggleSidebar(true)}
          className="fixed top-4 left-4 z-30 p-2.5 rounded-2xl bg-[#090d16]/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800/80 shadow-2xl backdrop-blur-xl transition-all hover:scale-105 active:scale-95 group flex items-center gap-2"
          title="Open Left Sidebar Navigation"
          aria-label="Open Navigation"
        >
          <PanelLeftOpen className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline text-xs font-semibold text-slate-200 pr-1">Menu</span>
        </button>
      )}

      {/* Fixed Left Sidebar (Contains all navigation, upload, channel status, profile, and logout) */}
      <LeftSidebar
        isOpen={sidebarOpen}
        onClose={() => toggleSidebar(false)}
        currentTab={currentTab}
        onNavigate={(tab) => {
          onNavigate(tab);
          // On mobile, automatically close sidebar after choosing a tab
          if (window.innerWidth < 1024) {
            toggleSidebar(false);
          }
        }}
        onOpenUpload={onOpenUpload}
        metrics={metrics}
      />

      {/* Backdrop overlay for mobile screens when sidebar is open */}
      {sidebarOpen && (
        <div 
          onClick={() => toggleSidebar(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
        />
      )}

      {/* Main Content Area (Expands to full screen width when sidebar is closed) */}
      <main 
        className={`flex-1 transition-all duration-300 min-h-screen overflow-y-auto px-4 sm:px-8 py-8 w-full ${
          sidebarOpen ? 'lg:pl-80' : 'pl-4 sm:pl-16'
        }`}
      >
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};
