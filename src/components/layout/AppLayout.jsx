import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const AppLayout = ({ 
  children, 
  currentTab, 
  onNavigate, 
  onOpenUpload, 
  metrics 
}) => {
  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col font-sans">
      <Navbar 
        currentTab={currentTab} 
        onNavigate={onNavigate} 
        onOpenUpload={onOpenUpload} 
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          currentTab={currentTab} 
          onNavigate={onNavigate} 
          metrics={metrics} 
        />
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
