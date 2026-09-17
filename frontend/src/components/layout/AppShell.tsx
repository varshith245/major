import React from 'react';
import { useLocation } from 'react-router-dom';
import { AccessibilityBar } from './AccessibilityBar';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { MobileBottomNav } from './MobileBottomNav';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isAdminPage = location.pathname.startsWith('/admin');

  if (isAdminPage) {
    return <div className="min-h-screen bg-slate-900 text-slate-100">{children}</div>;
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors ${isAuthPage ? 'bg-slate-950 text-white overflow-x-hidden' : 'bg-slate-50 text-slate-900'}`}>
      {!isAuthPage && <AccessibilityBar />}
      <Navbar />
      <main id="main-content" className={`flex-1 ${isAuthPage ? '' : 'pb-16 lg:pb-0'}`}>
        {children}
      </main>
      {!isAuthPage && <Footer />}
      {!isAuthPage && <MobileBottomNav />}
    </div>
  );
};
