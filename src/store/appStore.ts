'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type Printer = { id: string; name: string } | null;

type ViewPreferences = {
  tableSearch: string;
  visibleColumns: string[];
};

type AppState = {
  selectedVehicleId: number | null;
  setSelectedVehicleId: (id: number | null) => void;
  selectedPrinter: Printer;
  setSelectedPrinter: (printer: Printer) => void;
  viewPreferences: ViewPreferences;
  setViewPreferences: (partial: Partial<ViewPreferences>) => void;
  reset: () => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedVehicleId: null,
      setSelectedVehicleId: (id) => set({ selectedVehicleId: id }),
      selectedPrinter: null,
      setSelectedPrinter: (printer) => set({ selectedPrinter: printer }),
      viewPreferences: {
        tableSearch: '',
        visibleColumns: ['id', 'plateNumber'],
      },
      setViewPreferences: (partial) =>
        set((state) => ({ viewPreferences: { ...state.viewPreferences, ...partial } })),
      reset: () =>
        set({
          selectedVehicleId: null,
          selectedPrinter: null,
          viewPreferences: { tableSearch: '', visibleColumns: ['id', 'plateNumber'] },
        }),
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedVehicleId: state.selectedVehicleId,
        selectedPrinter: state.selectedPrinter,
        viewPreferences: state.viewPreferences,
      }),
    },
  ),
);
