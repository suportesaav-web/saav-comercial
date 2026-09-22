'use client';

import React from 'react';

export function InfoPopover({ content }: { content: string }) {
  return (
    <div className="relative flex items-center group ml-2">
      {/* Ícone */}
      <div className="w-[18px] h-[18px] rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:border-blue-200 transition-all duration-300 font-bold text-[10px] cursor-help shadow-sm">
        ?
      </div>
      
      {/* Tooltip Content (Hover) */}
      <div className="absolute z-[999] top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 w-56 pointer-events-none origin-top scale-95 group-hover:scale-100">
        <div className="bg-white text-slate-600 text-[11px] font-medium p-3 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 leading-relaxed text-center relative">
          {/* Seta */}
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-gray-100 rotate-45 rounded-sm"></div>
          {content}
        </div>
      </div>
    </div>
  );
}
