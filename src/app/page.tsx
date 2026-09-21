'use client'

import { useEffect, useState } from 'react';

export default function Home() {
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Conecta na sua API Python
    fetch('http://localhost:8000/api/tarefas')
      .then(res => res.json())
      .then(data => {
        setTarefas(data.slice(0, 5)); // Pega as 5 primeiras para teste
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-gray-950 text-white p-10 font-sans selection:bg-blue-500">
      
      {/* Header Premium */}
      <header className="mb-12">
        <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Painel de Vendas
        </h1>
        <p className="text-gray-400 mt-3 text-lg">Comercial Saavedra - Dados em Tempo Real</p>
      </header>

      {/* Grid de Cards (Glassmorphism) */}
      {loading ? (
        <div className="flex animate-pulse space-x-4">
          <div className="h-32 bg-gray-800 rounded-xl w-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tarefas.map((t: any, index: number) => (
            <div 
              key={index} 
              className="p-6 bg-gray-900/50 backdrop-blur-md border border-gray-800 rounded-2xl hover:border-gray-600 transition-all duration-300 shadow-xl hover:-translate-y-1"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2 block">
                {t.tipo_tarefa || 'Atendimento'}
              </span>
              <h2 className="text-xl font-bold mb-3">{t.titulo || 'Sem Título'}</h2>
              <p className="text-gray-400 text-sm">{t.nome_cliente}</p>
              
              <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${t.finalizada ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                  {t.status_operacional}
                </span>
                <span className="text-gray-500 text-xs">{t.data_evento_str}</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </main>
  );
}
