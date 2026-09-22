'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function TopNav() {
  const pathname = usePathname();

  const links = [
    { label: 'Visão Geral', href: '/', icon: '📊' },
    { label: 'Vendedores', href: '/vendedores', icon: '👥' },
    { label: 'Clientes', href: '/clientes', icon: '🏥' },
    { label: 'Temporal', href: '/temporal', icon: '⏳' },
    { label: 'Operacional', href: '/operacional', icon: '⚙️' },
    { label: 'Sincronização', href: '/sincronizacao', icon: '🔄' },
    { label: 'Guia', href: '/guia', icon: '📖' },
  ];

  return (
    <header className="w-full bg-slate-900 text-white border-b border-slate-800 shadow-md z-50 sticky top-0 flex flex-col md:flex-row items-center justify-between px-6 py-3">
      {/* Logo */}
      <div className="flex items-center space-x-3 mb-4 md:mb-0 shrink-0">
        <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center">
          <span className="text-white font-black text-sm">S</span>
        </div>
        <h1 className="text-lg font-black tracking-tight text-white">Comercial Saavedra</h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex space-x-1 overflow-x-auto hide-scrollbar w-full md:w-auto">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
