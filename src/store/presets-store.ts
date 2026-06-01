import { create } from "zustand";
import { QueryGroup } from "@/lib/types";
import { generateId } from "@/lib/utils";

export interface Preset {
  id: string;
  title: string;
  schemaId: string;
  query: QueryGroup;
  createdAt: number;
}

interface PresetsStore {
  presets: Preset[];
  loadPresets: () => void;
  savePreset: (title: string, schemaId: string, query: QueryGroup) => boolean;
  deletePreset: (id: string) => void;
  hasPresetTitle: (title: string) => boolean;
}

const getStoredPresets = (): Preset[] => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("querycraft-presets");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
  return [];
};

export const usePresetsStore = create<PresetsStore>((set, get) => {
  return {
    presets: getStoredPresets(),

    loadPresets: () => {
      set({ presets: getStoredPresets() });
    },

    savePreset: (title, schemaId, query) => {
      const { presets } = get();
      const normalizedTitle = title.trim().toLowerCase();
      
      const titleExists = presets.some(
        (p) => p.title.trim().toLowerCase() === normalizedTitle
      );

      if (titleExists) {
        return false;
      }

      const newPreset: Preset = {
        id: generateId(),
        title: title.trim(),
        schemaId,
        query: JSON.parse(JSON.stringify(query)),
        createdAt: Date.now(),
      };

      const updated = [newPreset, ...presets];
      set({ presets: updated });
      
      if (typeof window !== "undefined") {
        localStorage.setItem("querycraft-presets", JSON.stringify(updated));
      }
      return true;
    },

    deletePreset: (id) => {
      const { presets } = get();
      const updated = presets.filter((p) => p.id !== id);
      set({ presets: updated });
      if (typeof window !== "undefined") {
        localStorage.setItem("querycraft-presets", JSON.stringify(updated));
      }
    },

    hasPresetTitle: (title) => {
      const { presets } = get();
      const normalizedTitle = title.trim().toLowerCase();
      return presets.some((p) => p.title.trim().toLowerCase() === normalizedTitle);
    },
  };
});
