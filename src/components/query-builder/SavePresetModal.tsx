"use client";

import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { usePresetsStore } from "@/store/presets-store";
import { QueryGroup } from "@/lib/types";

interface SavePresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  schemaId: string;
  query: QueryGroup;
  onSaveSuccess?: (title: string) => void;
}

export default function SavePresetModal({
  isOpen,
  onClose,
  schemaId,
  query,
  onSaveSuccess,
}: SavePresetModalProps) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const savePreset = usePresetsStore((state) => state.savePreset);
  const hasPresetTitle = usePresetsStore((state) => state.hasPresetTitle);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setError(null);
    }
  }, [isOpen]);

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();

    if (!cleanTitle) {
      setError("Preset title cannot be empty.");
      return;
    }

    if (hasPresetTitle(cleanTitle)) {
      setError("A preset with this title already exists. Please choose a unique title.");
      return;
    }

    const success = savePreset(cleanTitle, schemaId, query);
    if (success) {
      if (onSaveSuccess) {
        onSaveSuccess(cleanTitle);
      }
      onClose();
    } else {
      setError("Failed to save preset due to duplicate title.");
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-bg-surface border border-border-default rounded-xl shadow-2xl flex flex-col animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-preset-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
          <div className="flex items-center gap-2">
            <Save className="w-5 h-5 text-accent-primary" />
            <h2 id="save-preset-modal-title" className="text-base font-bold text-text-primary">
              Save Query Preset
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-bg-elevated text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave}>
          <div className="p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label 
                htmlFor="preset-title-input" 
                className="text-xs font-bold text-text-secondary uppercase tracking-wider"
              >
                Preset Title
              </label>
              <Input
                id="preset-title-input"
                type="text"
                placeholder="e.g. Active Users In Europe"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError(null);
                }}
                className="w-full"
                autoFocus
              />
              <p className="text-[0.6875rem] text-text-tertiary">
                Enter a unique descriptive name for your query configuration.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-lg border border-accent-danger/20 bg-accent-danger/10 px-4 py-3 text-xs text-accent-danger animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold block">Duplicate Title Error</span>
                  <p className="mt-0.5 leading-relaxed">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border-default bg-bg-inset/20 flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Configuration
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
