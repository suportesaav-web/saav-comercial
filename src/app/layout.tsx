import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Saavedra - Inteligência Comercial",
  description: "Dashboards analíticos de produtividade",
};

import { TopNav } from "@/components/TopNav";
import { LeftFilters } from "@/components/LeftFilters";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-gray-50 text-slate-800 antialiased font-sans h-screen flex flex-col overflow-hidden">
        
        {/* Menu Superior de Navegação */}
        <TopNav />
        
        {/* Área de Conteúdo Inferior (Filtros + Páginas) */}
        <div className="flex flex-1 min-h-0">
          
          {/* Barra Lateral de Filtros */}
          <div className="hidden md:block w-72 shrink-0">
             <LeftFilters />
          </div>

          {/* Área Principal de Gráficos (com Scroll Próprio) */}
          <main className="flex-1 overflow-auto bg-gray-50 relative">
            {children}
          </main>
          
        </div>
      </body>
    </html>
  );
}
