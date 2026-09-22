'use client';

import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Interacao } from '@/types/interacao';
import { Tarefa } from '@/types/tarefa';

// Fix for default Leaflet icon missing in webpack/nextjs
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapComponentProps {
  interacoes: Interacao[];
  tarefas?: Tarefa[];
}

export default function MapComponent({ interacoes, tarefas = [] }: MapComponentProps) {
  // Cria um dicionário de tarefas para busca rápida (O(1))
  const tarefasMap = useMemo(() => {
    const map = new Map<number, Tarefa>();
    tarefas.forEach(t => {
      if (t.id) map.set(t.id, t);
    });
    return map;
  }, [tarefas]);

  // Filtra apenas interações que tenham coordenadas de checkin e as enriquece com dados da tarefa
  const markers = useMemo(() => {
    return interacoes.filter(i => i.checkin_lat && i.checkin_lng).map(i => {
      const tarefa = i.task_id ? tarefasMap.get(i.task_id) : undefined;
      
      return {
        id: i.id,
        task_id: i.task_id,
        lat: parseFloat(i.checkin_lat!),
        lng: parseFloat(i.checkin_lng!),
        vendedor: i.nome_vendedor || 'Desconhecido',
        data: i.data_criacao_str,
        cliente: tarefa?.nome_cliente || 'Sem Cliente Vinculado',
        titulo_tarefa: tarefa?.titulo || 'Sem Título',
        content: i.content || 'Sem comentário',
        duracao: i.duracao_segundos ? Math.round(i.duracao_segundos / 60) : 0
      };
    });
  }, [interacoes, tarefasMap]);

  // Centro padrão do Brasil
  const center: [number, number] = markers.length > 0 ? [markers[0].lat, markers[0].lng] : [-14.2350, -51.9253];
  const zoom = markers.length > 0 ? 10 : 4;

  return (
    <div className="h-[600px] w-full rounded-2xl overflow-hidden shadow-sm border border-gray-200 relative z-0">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((marker, idx) => (
          <Marker key={`${marker.id}-${idx}`} position={[marker.lat, marker.lng]} icon={icon}>
            <Popup className="custom-popup">
              <div className="p-1 min-w-[240px]">
                {/* Header: Vendedor e Data */}
                <div className="flex justify-between items-start mb-2 border-b border-gray-100 pb-2">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm leading-tight">{marker.vendedor}</h3>
                    <p className="text-[10px] text-slate-500">{marker.data}</p>
                  </div>
                  {marker.duracao > 0 && (
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full flex items-center whitespace-nowrap">
                      ⏱ {marker.duracao} min
                    </span>
                  )}
                </div>
                
                {/* Contexto da Tarefa */}
                <div className="mb-3">
                  <p className="text-xs font-bold text-brand-orange uppercase tracking-wider mb-0.5">{marker.cliente}</p>
                  <p className="text-[11px] font-medium text-slate-600 truncate" title={marker.titulo_tarefa}>{marker.titulo_tarefa}</p>
                </div>

                {/* Conteúdo da Interação */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-gray-200 mb-3 relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-slate-300 before:rounded-r">
                  <p className="text-xs text-slate-700 italic line-clamp-3 leading-relaxed">"{marker.content}"</p>
                </div>
                
                {/* Ações (Link Ploomes) */}
                {marker.task_id && (
                  <div className="mt-2 text-right">
                    <a 
                      href={`https://app10.ploomes.com/Tasks/calendar/task/${marker.task_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold rounded-md transition-colors"
                    >
                      Abrir Tarefa no Ploomes ↗
                    </a>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
