import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PhaseId } from '../types/grimoire';

export type ThemeMode = 'dark' | 'light';
export type FontScale = 'normal' | 'large' | 'xlarge';

export interface PlayerProgressState {
  theme: ThemeMode;
  language: 'pt-BR' | 'en';
  fontScale: FontScale;
  ambientParticles: boolean;
  secondScreenMode: boolean;

  // Player character snapshot
  selectedRace: 'breton' | 'altmer' | 'dunmer';
  characterLevel: number;
  skills: {
    Conjuration: number;
    Illusion: number;
    Sneak: number;
    Archery: number;
    Enchanting: number;
  };

  // Progression tracking
  activePhase: PhaseId;
  completedGuidedSteps: string[];
  completedPhaseChecklists: string[];
  completedQuests: string[];
  questStepProgress: Record<string, number[]>;
  purchasedPerks: Record<string, number>; // perkId -> ranks bought (0 if none)
  collectedLootIds: string[];
  visitedLocationIds: string[];
  completedFinalChecklistIds: string[];
  completedLevelTasks: string[]; // ids like "12-0" (level-eventIndex)

  // Actions
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setLanguage: (lang: 'pt-BR' | 'en') => void;
  setFontScale: (scale: FontScale) => void;
  setAmbientParticles: (enabled: boolean) => void;
  setSecondScreenMode: (enabled: boolean) => void;
  setSelectedRace: (race: 'breton' | 'altmer' | 'dunmer') => void;
  setCharacterLevel: (level: number) => void;
  setSkillLevel: (skill: keyof PlayerProgressState['skills'], value: number) => void;
  setActivePhase: (phase: PhaseId) => void;

  toggleGuidedStep: (stepId: string) => void;
  togglePhaseChecklist: (itemId: string) => void;
  toggleQuestCompleted: (questId: string) => void;
  toggleQuestStep: (questId: string, stepIndex: number) => void;
  setPerkRank: (perkId: string, rank: number) => void;
  toggleLootCollected: (lootId: string) => void;
  toggleLocationVisited: (locationId: string) => void;
  toggleFinalChecklist: (itemId: string) => void;
  toggleLevelTask: (taskId: string) => void;

  exportProgress: () => string;
  importProgress: (rawJson: string) => { ok: boolean; error?: string };
  resetProgress: () => void;
}

const DEFAULT_PROGRESS = {
  theme: 'dark' as ThemeMode,
  language: 'pt-BR' as 'pt-BR' | 'en',
  fontScale: 'normal' as FontScale,
  ambientParticles: false,
  secondScreenMode: false,
  selectedRace: 'breton' as 'breton' | 'altmer' | 'dunmer',
  characterLevel: 1,
  skills: {
    Conjuration: 15,
    Illusion: 15,
    Sneak: 15,
    Archery: 15,
    Enchanting: 15,
  },
  activePhase: 'early' as PhaseId,
  completedGuidedSteps: [] as string[],
  completedPhaseChecklists: [] as string[],
  completedQuests: [] as string[],
  questStepProgress: {} as Record<string, number[]>,
  purchasedPerks: {} as Record<string, number>,
  collectedLootIds: [] as string[],
  visitedLocationIds: [] as string[],
  completedFinalChecklistIds: [] as string[],
  completedLevelTasks: [] as string[],
};

function toggleArrayItem(arr: string[], item: string): string[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

export const useGrimoireStore = create<PlayerProgressState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_PROGRESS,

      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setLanguage: (language) => set({ language }),
      setFontScale: (fontScale) => set({ fontScale }),
      setAmbientParticles: (ambientParticles) => set({ ambientParticles }),
      setSecondScreenMode: (secondScreenMode) => set({ secondScreenMode }),
      setSelectedRace: (selectedRace) => set({ selectedRace }),
      setCharacterLevel: (level) => set({ characterLevel: Math.max(1, Math.min(252, level)) }),
      setSkillLevel: (skill, value) =>
        set((s) => ({
          skills: { ...s.skills, [skill]: Math.max(15, Math.min(100, value)) },
        })),
      setActivePhase: (activePhase) => set({ activePhase }),

      toggleGuidedStep: (stepId) =>
        set((s) => ({ completedGuidedSteps: toggleArrayItem(s.completedGuidedSteps, stepId) })),

      togglePhaseChecklist: (itemId) =>
        set((s) => ({ completedPhaseChecklists: toggleArrayItem(s.completedPhaseChecklists, itemId) })),

      toggleQuestCompleted: (questId) =>
        set((s) => ({ completedQuests: toggleArrayItem(s.completedQuests, questId) })),

      toggleQuestStep: (questId, stepIndex) =>
        set((s) => {
          const current = s.questStepProgress[questId] ?? [];
          const next = current.includes(stepIndex)
            ? current.filter((idx) => idx !== stepIndex)
            : [...current, stepIndex];
          return { questStepProgress: { ...s.questStepProgress, [questId]: next } };
        }),

      setPerkRank: (perkId, rank) =>
        set((s) => {
          const next = { ...s.purchasedPerks };
          if (rank <= 0) {
            delete next[perkId];
          } else {
            next[perkId] = rank;
          }
          return { purchasedPerks: next };
        }),

      toggleLootCollected: (lootId) =>
        set((s) => ({ collectedLootIds: toggleArrayItem(s.collectedLootIds, lootId) })),

      toggleLocationVisited: (locationId) =>
        set((s) => ({ visitedLocationIds: toggleArrayItem(s.visitedLocationIds, locationId) })),

      toggleFinalChecklist: (itemId) =>
        set((s) => ({
          completedFinalChecklistIds: toggleArrayItem(s.completedFinalChecklistIds, itemId),
        })),

      toggleLevelTask: (taskId) =>
        set((s) => ({ completedLevelTasks: toggleArrayItem(s.completedLevelTasks, taskId) })),

      exportProgress: () => {
        const s = get();
        const payload = {
          version: 1,
          exportedAt: new Date().toISOString(),
          data: {
            selectedRace: s.selectedRace,
            characterLevel: s.characterLevel,
            skills: s.skills,
            activePhase: s.activePhase,
            completedGuidedSteps: s.completedGuidedSteps,
            completedPhaseChecklists: s.completedPhaseChecklists,
            completedQuests: s.completedQuests,
            questStepProgress: s.questStepProgress,
            purchasedPerks: s.purchasedPerks,
            collectedLootIds: s.collectedLootIds,
            visitedLocationIds: s.visitedLocationIds,
            completedFinalChecklistIds: s.completedFinalChecklistIds,
            completedLevelTasks: s.completedLevelTasks,
          },
        };
        return JSON.stringify(payload, null, 2);
      },

      importProgress: (rawJson) => {
        try {
          const parsed = JSON.parse(rawJson) as { version?: number; data?: Partial<typeof DEFAULT_PROGRESS> };
          if (!parsed || typeof parsed !== 'object' || !parsed.data) {
            return { ok: false, error: 'Formato JSON inválido: objeto "data" ausente.' };
          }
          const d = parsed.data;
          set({
            selectedRace: d.selectedRace ?? 'breton',
            characterLevel: typeof d.characterLevel === 'number' ? d.characterLevel : 1,
            skills: d.skills ?? DEFAULT_PROGRESS.skills,
            activePhase: d.activePhase ?? 'early',
            completedGuidedSteps: Array.isArray(d.completedGuidedSteps) ? d.completedGuidedSteps : [],
            completedPhaseChecklists: Array.isArray(d.completedPhaseChecklists)
              ? d.completedPhaseChecklists
              : [],
            completedQuests: Array.isArray(d.completedQuests) ? d.completedQuests : [],
            questStepProgress: d.questStepProgress ?? {},
            purchasedPerks: d.purchasedPerks ?? {},
            collectedLootIds: Array.isArray(d.collectedLootIds) ? d.collectedLootIds : [],
            visitedLocationIds: Array.isArray(d.visitedLocationIds) ? d.visitedLocationIds : [],
            completedFinalChecklistIds: Array.isArray(d.completedFinalChecklistIds)
              ? d.completedFinalChecklistIds
              : [],
            completedLevelTasks: Array.isArray(d.completedLevelTasks) ? d.completedLevelTasks : [],
          });
          return { ok: true };
        } catch (err) {
          return {
            ok: false,
            error: err instanceof Error ? err.message : 'Erro ao ler o arquivo JSON.',
          };
        }
      },

      resetProgress: () => set({ ...DEFAULT_PROGRESS }),
    }),
    {
      name: 'grimorio-necromante-state-v1',
    }
  )
);
