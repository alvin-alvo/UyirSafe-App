import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export const PWAInstallPrompt = () => {
  const [isStandalone, setIsStandalone] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Detect if running in standalone mode (installed)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    setIsStandalone(standalone);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!standalone) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-[999] bg-white rounded-2xl p-4 shadow-xl border border-gray-100 flex items-center gap-4 animate-in slide-in-from-top-4">
      <div className="bg-blue-100 p-2 rounded-xl">
        <Download className="text-blue-600" size={24} />
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-gray-900">Add to Home Screen</h4>
        <p className="text-xs text-gray-500">Install UyirSafe for a better experience.</p>
      </div>
      <button 
        onClick={handleInstallClick} 
        className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition"
      >
        Install
      </button>
      <button 
        onClick={() => setShowPrompt(false)} 
        className="text-gray-400 p-1 hover:bg-gray-100 rounded-full transition"
      >
        <X size={16} />
      </button>
    </div>
  );
};
