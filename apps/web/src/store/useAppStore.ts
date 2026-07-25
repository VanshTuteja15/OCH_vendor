import { create } from 'zustand';

interface AppState {
  toast: { message: string; kind: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, kind?: 'success' | 'error' | 'info') => void;
  clearToast: () => void;
}

export const useAppStore = create<AppState>()((set) => ({
  toast: null,
  showToast: (message, kind = 'success') => set({ toast: { message, kind } }),
  clearToast: () => set({ toast: null }),
}));
