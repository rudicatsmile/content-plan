import { create } from 'zustand'

interface CalendarFilterState {
  selectedLembagaId: string | 'all'
  selectedPlatformId: string | 'all'
  setLembaga: (id: string | 'all') => void
  setPlatform: (id: string | 'all') => void
}

export const useCalendarFilterStore = create<CalendarFilterState>((set) => ({
  selectedLembagaId: 'all',
  selectedPlatformId: 'all',
  setLembaga: (id) => set({ selectedLembagaId: id }),
  setPlatform: (id) => set({ selectedPlatformId: id }),
}))
