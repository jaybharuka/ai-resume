import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Tab = 'dashboard' | 'editor' | 'templates' | 'settings';
type TourStep = 1 | 2 | 3 | null;

interface UIStore {
  activeTab: Tab;
  isSidebarCollapsed: boolean;
  tourStep: TourStep;
  setActiveTab: (tab: Tab) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTourStep: (step: TourStep) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      activeTab: 'editor',
      isSidebarCollapsed: false,
      tourStep: null,
      setActiveTab: (tab) => set({ activeTab: tab }),
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
      setTourStep: (step) => set({ tourStep: step }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ 
        activeTab: state.activeTab, 
        isSidebarCollapsed: state.isSidebarCollapsed 
      }),
    }
  )
);
