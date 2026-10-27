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
      
      {/* Mobile Top Header Bar (Only visible on screens < 1024px) */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#070b13]/95 backdrop-blur-xl border-b border-slate-800/80 z-30 px-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => toggleSidebar(true)}
            className="p-2 rounded-xl bg-slate-900/90 text-slate-300 hover:text-white border border-slate-800 active:scale-95 transition-all"
            aria-label="Open Navigation Drawer"
          >
            <Menu className="w-5 h-5 text-rose-500" />
          </button>
          
          <div 
            onClick={() => onNavigate('dashboard')} 
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white shadow-glow">
              <span className="font-black text-xs">▶</span>
            </div>
            <span className="text-sm font-extrabold tracking-tight text-white">ShortsCraft</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-red-600 shadow-glow active:scale-95 transition-all"
          >
            <span>+ Upload</span>
          </button>
        </div>
      </header>

      {/* Desktop Floating Toggle Button (Visible when sidebar is closed on desktop) */}
      {!sidebarOpen && (
        <button
          onClick={() => toggleSidebar(true)}
          className="hidden lg:flex fixed top-4 left-4 z-30 p-2.5 rounded-2xl bg-[#090d16]/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800/80 shadow-2xl backdrop-blur-xl transition-all hover:scale-105 active:scale-95 items-center gap-2"
          title="Open Left Sidebar Navigation"
          aria-label="Open Navigation"
        >
          <PanelLeftOpen className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold text-slate-200 pr-1">Menu</span>
        </button>
      )}

      {/* Fixed Left Sidebar (Drawer on mobile, fixed side navigation on laptop/desktop) */}
      <LeftSidebar
        isOpen={sidebarOpen}
        onClose={() => toggleSidebar(false)}
        currentTab={currentTab}
        onNavigate={(tab) => {
          onNavigate(tab);
          // On mobile, automatically close sidebar after choosing a tab
          if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            toggleSidebar(false);
          }
        }}
        onOpenUpload={onOpenUpload}
        metrics={metrics}
      />

      {/* Dark Backdrop overlay for mobile screens when drawer is open */}
      {sidebarOpen && (
        <div 
          onClick={() => toggleSidebar(false)}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
        />
      )}

      {/* Main Content Area (Responsive padding for mobile header and desktop sidebar) */}
      <main 
        className={`flex-1 transition-all duration-300 min-h-screen overflow-y-auto px-3.5 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-8 pb-12 w-full ${
          sidebarOpen ? 'lg:pl-80' : 'lg:pl-20'
        }`}
      >
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};
