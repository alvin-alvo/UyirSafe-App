import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, FileText, PlusCircle, User, Award } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from './PageTransition';
import { PWAInstallPrompt } from './PWAInstallPrompt';

export const Layout = () => {
  const location = useLocation();

  const navItems = [
    { to: '/user', icon: Home, label: 'Home' },
    { to: '/user/previous-reports', icon: FileText, label: 'My Reports' },
    { to: '/user/new-report', icon: PlusCircle, label: 'Report' },
    { to: '/user/redeem', icon: Award, label: 'Rewards' },
    { to: '/user/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 pb-16 md:pb-0 overflow-hidden">
      <PWAInstallPrompt />
      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-md mx-auto bg-white shadow-sm overflow-y-auto relative">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-200 z-50 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        <div className="flex justify-between items-center px-2 pb-3 pt-2 max-w-md mx-auto relative">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isReportBtn = to === '/user/new-report';
            return (
              <NavLink
                key={to}
                to={to}
                end={to === '/user'}
                className={({ isActive }) => {
                  if (isReportBtn) {
                    return `relative -mt-10 flex flex-col items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform active:scale-95 flex-shrink-0 z-50 ${
                      isActive ? 'bg-red-700 scale-105' : 'bg-red-600 hover:bg-red-700'
                    } text-white mx-1`;
                  }
                  return `flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ease-out flex-1 ${
                    isActive 
                      ? 'text-blue-600 bg-blue-50/50 scale-105' 
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
                  }`;
                }}
              >
                {({ isActive }) => (
                  <>
                    <Icon 
                      size={isReportBtn ? 28 : 24} 
                      strokeWidth={isReportBtn ? 2.5 : (isActive ? 2.5 : 2)} 
                    />
                    {!isReportBtn && (
                      <span className="text-[10px] font-medium tracking-wide mt-0.5">{label}</span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
