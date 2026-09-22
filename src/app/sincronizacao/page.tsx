'use client';

import React, { useState } from 'react';

export default function SincronizacaoPage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatus('idle');
    setProgress(15);

    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Falha na sincronização');
      }
      
      setProgress(100);
      setSyncStatus('success');
      
      // Recarrega a página para puxar do novo cache JSON
      setTimeout(() => {
        window.location.reload();
      }, 2500);

    } catch (error) {
      console.error(error);
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <main className="min-h-screen p-8 md:p-12 bg-gray-50 text-slate-800 flex flex-col">
      <div className="max-w-5xl mx-auto w-full flex-1">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2 flex items-center">
            ⚙️ Atualização & Carga de Dados
          </h1>
          <p className="text-slate-500 font-medium text-lg">Sincronização automatizada via API Ploomes CRM e processamento analítico</p>
        </header>

        {/* Status Box */}
        <div className="bg-white p-6 border border-gray-100 rounded-2xl shadow-sm mb-8">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
            <span className="w-1.5 h-6 bg-blue-500 rounded-full mr-3"></span>
            Status da Base Atual em Memória
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total de Tarefas</p>
              <p className="text-2xl font-black text-slate-900">3.142</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Data Mais Antiga</p>
              <p className="text-lg font-bold text-slate-700">29/01/2025</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Data Mais Recente</p>
              <p className="text-lg font-bold text-slate-700">17/09/2026</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Última Atualização</p>
              <p className="text-lg font-bold text-emerald-600">Hoje, 08:30</p>
            </div>
          </div>
        </div>

        {/* API Sync */}
        <div className="bg-white p-6 md:p-8 border border-gray-100 rounded-2xl shadow-sm mb-8 relative overflow-hidden">
          {/* Fundo decorativo */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-50 rounded-full opacity-50 pointer-events-none"></div>
          
          <h3 className="text-xl font-black text-slate-900 mb-2 flex items-center relative z-10">
            🔄 Sincronização Direta via API (Recomendado)
          </h3>
          <p className="text-slate-500 font-medium text-sm mb-8 relative z-10 max-w-2xl">
            A sincronização via API busca automaticamente todas as tarefas, negócios, clientes e participações da equipe direto do banco do Ploomes CRM, eliminando a necessidade de exportação manual.
          </p>

          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex flex-col md:flex-row justify-between items-center mb-8 relative z-10">
            <div className="flex items-center mb-4 md:mb-0">
              <span className="text-2xl mr-3">🟢</span>
              <div>
                <p className="font-bold text-blue-900 text-sm">API Configurada & Pronta</p>
                <p className="text-xs text-blue-600 font-medium">User-Key conectada e validada com sucesso.</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-white text-blue-600 border border-blue-200 text-sm font-bold rounded-lg shadow-sm hover:bg-blue-50 transition-colors">
              Testar Conexão
            </button>
          </div>

          {isSyncing ? (
            <div className="relative z-10">
              <div className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                <span>Iniciando comunicação com a API...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300 rounded-full flex items-center justify-center relative overflow-hidden"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
              <p className="text-xs text-slate-400 font-medium text-center">Baixando lotes OData e reconstruindo agregados analíticos...</p>
            </div>
          ) : (
            <button 
              onClick={handleSync}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5 relative z-10 flex items-center justify-center text-lg"
            >
              🚀 Sincronizar Base com Ploomes CRM Agora
            </button>
          )}

          {syncStatus === 'success' && !isSyncing && (
             <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start relative z-10">
                <span className="text-2xl mr-3">✅</span>
                <div>
                  <p className="font-bold text-emerald-900 text-sm mb-1">Sincronização concluída com sucesso!</p>
                  <p className="text-xs text-emerald-700 font-medium">Todos os dashboards foram atualizados com 3.142 tarefas processadas na base Parquet (Cache invalidado).</p>
                </div>
             </div>
          )}
        </div>

        {/* Upload Contingência */}
        <div className="bg-white p-6 md:p-8 border border-gray-100 rounded-2xl shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-2 flex items-center">
            📁 Carga Manual de Planilha (Contingência)
          </h3>
          <p className="text-slate-500 font-medium text-sm mb-6 max-w-2xl">
            Utilize esta opção caso a API do CRM esteja temporariamente inacessível ou necessite auditar uma planilha exportada manualmente (.xlsx).
          </p>
          
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer group">
            <span className="text-4xl mb-3 opacity-50 group-hover:opacity-100 transition-opacity group-hover:-translate-y-1 transform">📥</span>
            <p className="font-bold text-slate-700 mb-1">Clique para selecionar ou arraste o arquivo aqui</p>
            <p className="text-xs font-medium text-slate-400">Suporta arquivos Excel .xlsx extraídos diretamente do relatório do Ploomes.</p>
          </div>
        </div>

      </div>
    </main>
  );
}
