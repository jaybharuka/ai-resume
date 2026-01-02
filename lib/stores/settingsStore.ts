import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type AIStrictness = 'conservative' | 'balanced' | 'aggressive';
export type ResumeLength = 'single-page' | 'multi-page';
export type DefaultEditor = 'visual' | 'code';
export type ExportFormat = 'pdf' | 'latex';

interface SettingsStore {
  // AI Preferences
  defaultAIStrictness: AIStrictness;
  setDefaultAIStrictness: (strictness: AIStrictness) => void;
  
  // Resume Layout
  resumeLength: ResumeLength;
  setResumeLength: (length: ResumeLength) => void;
  
  // Editor Preferences
  defaultEditor: DefaultEditor;
  setDefaultEditor: (editor: DefaultEditor) => void;
  
  // Export Preferences
  defaultExportFormat: ExportFormat;
  setDefaultExportFormat: (format: ExportFormat) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      // AI Preferences - default to conservative
      defaultAIStrictness: 'conservative',
      setDefaultAIStrictness: (strictness) => set({ defaultAIStrictness: strictness }),
      
      // Resume Layout - default to single-page
      resumeLength: 'single-page',
      setResumeLength: (length) => set({ resumeLength: length }),
      
      // Editor Preferences - default to visual
      defaultEditor: 'visual',
      setDefaultEditor: (editor) => set({ defaultEditor: editor }),
      
      // Export Preferences - default to PDF
      defaultExportFormat: 'pdf',
      setDefaultExportFormat: (format) => set({ defaultExportFormat: format }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
