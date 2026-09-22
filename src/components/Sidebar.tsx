'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { label: 'Visão Geral', href: '/', icon: '📊' },
    { label: 'Vendedores', href: '/vendedores', icon: '👥' },
    { label: 'Clientes', href: '/clientes', icon: '🏢' },
    { label: 'Temporal', href: '/temporal', icon: '📈' },
    { label: 'Operacional', href: '/operacional', icon: '⚙️' },
    { label: 'Sincronização', href: '/sincronizacao', icon: '🔄' },
    { label: 'Guia', href: '/guia', icon: '📖' },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 p-4 sticky top-0 z-50">
        <span className="font-bold text-slate-800 flex items-center">
          <span className="w-2 h-2 bg-brand-orange rounded-full mr-2"></span>
          Saavedra
        </span>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="text-slate-600 font-semibold text-sm">
          {isMobileOpen ? 'Fechar' : 'Menu'}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`${isMobileOpen ? 'block' : 'hidden'} md:flex flex-col w-64 bg-white border-r border-gray-100 min-h-screen fixed md:sticky top-0 z-40`}>
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 border-b border-gray-50">
          <span className="text-2xl font-black text-slate-800 flex items-center">
            <span className="w-2.5 h-6 bg-brand-orange rounded-md mr-3 shadow-sm"></span>
            Saavedra
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4 px-2">
            Dashboards
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-gray-50 hover:text-slate-900'
                }`}
              >
                <span className="mr-3 opacity-80">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User / Settings (Bottom) */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs mr-3">
              JD
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Diretoria</p>
              <p className="text-xs text-slate-500">Gestão Comercial</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
