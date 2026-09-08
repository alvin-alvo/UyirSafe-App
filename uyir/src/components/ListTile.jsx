import React from 'react';
import { ChevronRight } from 'lucide-react';

export const ListTile = ({ icon: Icon, title, subtitle, onClick, rightElement, isDestructive }) => {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-4 p-4 bg-white border-b border-gray-100 last:border-0 ${onClick ? 'cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors' : ''}`}
    >
      <div className={`p-2 rounded-xl ${isDestructive ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-500'}`}>
        <Icon size={22} />
      </div>
      <div className="flex-1">
        <h4 className={`text-base font-medium ${isDestructive ? 'text-red-600' : 'text-gray-900'}`}>{title}</h4>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      {rightElement ? rightElement : onClick ? <ChevronRight size={20} className="text-gray-300" /> : null}
    </div>
  );
};
