import React from 'react';
import { createPortal } from 'react-dom';
import { X, Check } from 'lucide-react';

export const BottomSheetSelector = ({ isOpen, onClose, title, options, selectedValue, onSelect }) => {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      <div 
        className={`fixed inset-0 bg-black/40 z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-3xl z-[101] overflow-hidden shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => { onSelect(option.value); onClose(); }}
              className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <span className={`text-base ${selectedValue === option.value ? 'font-bold text-blue-600' : 'text-gray-700'}`}>
                {option.label}
              </span>
              {selectedValue === option.value && <Check className="text-blue-600" size={20} />}
            </button>
          ))}
        </div>
      </div>
    </>,
    document.body
  );
};
