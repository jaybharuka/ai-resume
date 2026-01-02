import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ResumeData } from '@/types/resume';

interface ResumeStore {
  resumeData: ResumeData | null;
  originalData: ResumeData | null;
  generatedLatex: string | null;
  fromCreatePage: boolean;
  setResumeData: (data: ResumeData) => void;
  setOriginalData: (data: ResumeData) => void;
  setGeneratedLatex: (latex: string) => void;
  setFromCreatePage: (value: boolean) => void;
  updateResumeData: (updates: Partial<ResumeData>) => void;
  resetResumeData: () => void;
  revertToOriginal: () => void;
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set, get) => ({
      resumeData: null,
      originalData: null,
      generatedLatex: null,
      fromCreatePage: false,
      setResumeData: (data: ResumeData) => set({ resumeData: data }),
      setOriginalData: (data: ResumeData) => set({ originalData: data }),
      setGeneratedLatex: (latex: string) => set({ generatedLatex: latex }),
      setFromCreatePage: (value: boolean) => set({ fromCreatePage: value }),
      updateResumeData: (updates: Partial<ResumeData>) => {
        const current = get().resumeData;
        if (current) {
          set({ resumeData: { ...current, ...updates } });
        }
      },
      resetResumeData: () => set({ resumeData: null, originalData: null, generatedLatex: null, fromCreatePage: false }),
      revertToOriginal: () => {
        const original = get().originalData;
        if (original) {
          set({ resumeData: original });
        }
      }
    }),
    {
      name: 'resume-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);