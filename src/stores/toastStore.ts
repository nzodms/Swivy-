import { create } from 'zustand';

export type ToastKind = 'success' | 'info' | 'error';

export interface ToastPayload {
  id: number;
  message: string;
  kind: ToastKind;
}

interface ToastState {
  toast: ToastPayload | null;
  show: (message: string, kind?: ToastKind) => void;
  dismiss: () => void;
}

let nextId = 1;

export const useToastStore = create<ToastState>((set) => ({
  toast: null,
  show: (message, kind = 'info') => set({ toast: { id: nextId++, message, kind } }),
  dismiss: () => set({ toast: null }),
}));
