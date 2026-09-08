import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export const HazardBottomSheet = ({ isOpen, onClose, children }) => {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      {/* Backdrop overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Bottom Sheet Drawer */}
      <div 
        className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-3xl z-[101] p-6 shadow-2xl transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6" />
        
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
        >
          <X size={20} className="text-gray-600" />
        </button>

        {children}
      </div>
    </>,
    document.body
  );
};
