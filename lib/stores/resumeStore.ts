import { create } from 'zustand';
import { ResumeData } from '@/types/resume';

interface ResumeStore {
  resumeData: ResumeData | null;
  setResumeData: (data: ResumeData) => void;
  updateResumeData: (updates: Partial<ResumeData>) => void;
  resetResumeData: () => void;
}

export const useResumeStore = create<ResumeStore>((set, get) => ({
  resumeData: null,
  setResumeData: (data: ResumeData) => set({ resumeData: data }),
  updateResumeData: (updates: Partial<ResumeData>) => {
    const current = get().resumeData;
    if (current) {
      set({ resumeData: { ...current, ...updates } });
    }
  },
  resetResumeData: () => set({ resumeData: null }),
}));