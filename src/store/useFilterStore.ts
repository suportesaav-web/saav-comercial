import { create } from 'zustand';

export interface Option {
  value: string;
  label: string;
}

interface FilterState {
  startDate: Date | null;
  endDate: Date | null;
  vendedores: Option[];
  clientes: Option[];
  tiposTarefa: Option[];
  status: Option[];
  funis: Option[];
  hideInternalTasks: boolean;
  
  // Actions
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
  setVendedores: (opts: Option[]) => void;
  setClientes: (opts: Option[]) => void;
  setTiposTarefa: (opts: Option[]) => void;
  setStatus: (opts: Option[]) => void;
  setFunis: (opts: Option[]) => void;
  setHideInternalTasks: (hide: boolean) => void;
  clearFilters: () => void;
  resetFilters: () => void;
}

const today = new Date();
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

export const useFilterStore = create<FilterState>((set) => ({
  startDate: firstDayOfMonth,
  endDate: today,
  vendedores: [],
  clientes: [],
  tiposTarefa: [],
  status: [],
  funis: [],
  hideInternalTasks: true,

  setStartDate: (date) => set({ startDate: date }),
  setEndDate: (date) => set({ endDate: date }),
  setVendedores: (opts) => set({ vendedores: opts }),
  setClientes: (opts) => set({ clientes: opts }),
  setTiposTarefa: (opts) => set({ tiposTarefa: opts }),
  setStatus: (opts) => set({ status: opts }),
  setFunis: (opts) => set({ funis: opts }),
  setHideInternalTasks: (hide) => set({ hideInternalTasks: hide }),
  clearFilters: () => set({ 
    startDate: firstDayOfMonth, 
    endDate: today, 
    vendedores: [], 
    clientes: [], 
    tiposTarefa: [], 
    status: [], 
    funis: [],
    hideInternalTasks: true 
  }),
  resetFilters: () => set({ 
    startDate: firstDayOfMonth, 
    endDate: today, 
    vendedores: [], 
    clientes: [], 
    tiposTarefa: [], 
    status: [], 
    funis: [],
    hideInternalTasks: true 
  }),
}));
