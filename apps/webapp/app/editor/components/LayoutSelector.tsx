 "use client";

import { useState, useEffect } from "react";
import { FiSave, FiFolder, FiTrash2, FiPlus } from "react-icons/fi";

// Loosely typed icon components to avoid react-icons vs local React type incompatibilities
const SaveIcon = FiSave as React.ComponentType<{ className?: string }>;
const TrashIcon = FiTrash2 as React.ComponentType<{ className?: string }>;
import { useAuth } from "../../lib/auth-context";
import { getUserLayouts, saveLayout, deleteLayout, type SavedLayout } from "../../lib/firestore";
import type { GridConfig, GridCell } from "../../lib/layout-types";
import { useI18n } from "../../lib/i18n";

type LayoutSelectorProps = {
  currentConfig: GridConfig;
  currentCells: Record<string, GridCell>;
  onLoadLayout: (layout: SavedLayout) => void;
};

export function LayoutSelector({
  currentConfig,
  currentCells,
  onLoadLayout,
}: LayoutSelectorProps) {
  const { user } = useAuth();
  const { t } = useI18n();
  const [layouts, setLayouts] = useState<SavedLayout[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [layoutName, setLayoutName] = useState("");
  const [selectedLayoutId, setSelectedLayoutId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadLayouts();
    }
  }, [user]);

  const loadLayouts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userLayouts = await getUserLayouts(user.uid);
      setLayouts(userLayouts);
    } catch (error) {
      console.error("Failed to load layouts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !layoutName.trim()) return;
    setSaving(true);
    try {
      await saveLayout(
        user.uid,
        selectedLayoutId,
        layoutName.trim(),
        currentConfig,
        currentCells,
      );
      setShowSaveDialog(false);
      setLayoutName("");
      setSelectedLayoutId(null);
      await loadLayouts();
    } catch (error) {
      console.error("Failed to save layout:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (layoutId: string) => {
    if (!confirm(t("editor", "deleteLayoutConfirm"))) return;
    try {
      await deleteLayout(layoutId);
      await loadLayouts();
      if (selectedLayoutId === layoutId) {
        setSelectedLayoutId(null);
      }
    } catch (error) {
      console.error("Failed to delete layout:", error);
    }
  };

  const handleLoad = (layout: SavedLayout) => {
    setSelectedLayoutId(layout.id);
    onLoadLayout(layout);
  };

  if (!user) return null;

  return (
    <div className="glass-surface rounded-2xl border border-white/30 p-4 shadow-md dark:border-white/10">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-custom-color-800 dark:text-custom-color-100">
          {t("editor", "savedLayoutsTitle")}
        </h3>
        <button
          type="button"
          onClick={() => {
            setShowSaveDialog(true);
            setLayoutName("");
            setSelectedLayoutId(null);
          }}
          className="inline-flex items-center gap-1.5 rounded-full bg-custom-color-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-custom-color-400 dark:bg-custom-color-400 dark:hover:bg-custom-color-300"
        >
          <SaveIcon className="h-3.5 w-3.5" />
          {t("editor", "saveButtonLabel")}
        </button>
      </div>

      {showSaveDialog && (
        <div className="mb-4 rounded-xl border border-white/20 bg-white/50 p-3 dark:bg-custom-color-800/50">
          <input
            type="text"
            value={layoutName}
            onChange={(e) => setLayoutName(e.target.value)}
            placeholder={t("editor", "saveDialogPlaceholder")}
            className="mb-2 w-full rounded-lg border border-white/20 bg-white/70 px-3 py-2 text-sm text-custom-color-900 placeholder-custom-color-500/60 focus:border-custom-color-400 focus:outline-none dark:bg-custom-color-700/50 dark:text-white"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !layoutName.trim()}
              className="flex-1 rounded-lg bg-custom-color-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-custom-color-400 disabled:opacity-50 dark:bg-custom-color-400"
            >
              {saving ? t("editor", "saveDialogSaving") : t("editor", "saveDialogSave")}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowSaveDialog(false);
                setLayoutName("");
              }}
              className="rounded-lg border border-white/20 bg-white/50 px-3 py-1.5 text-xs font-semibold text-custom-color-700 transition hover:bg-white/70 dark:bg-custom-color-700/50 dark:text-custom-color-100"
            >
              {t("editor", "saveDialogCancel")}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-xs text-custom-color-700/70 dark:text-custom-color-100/70">
          {t("editor", "loadingLayouts")}
        </p>
      ) : layouts.length === 0 ? (
        <p className="text-xs text-custom-color-700/70 dark:text-custom-color-100/70">
          {t("editor", "noLayouts")}
        </p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
          {layouts.map((layout) => (
            <div
              key={layout.id}
              className={`group flex items-center justify-between rounded-lg border p-2.5 transition ${
                selectedLayoutId === layout.id
                  ? "border-custom-color-400 bg-custom-color-400/10 dark:border-custom-color-300"
                  : "border-white/15 bg-white/50 hover:border-white/30 dark:bg-custom-color-800/50"
              }`}
            >
              <button
                type="button"
                onClick={() => handleLoad(layout)}
                className="flex-1 text-left"
              >
                <p className="text-xs font-semibold text-custom-color-900 dark:text-white">
                  {layout.name}
                </p>
                <p className="text-[10px] text-custom-color-700/70 dark:text-custom-color-100/70">
                  {new Date(layout.updatedAt).toLocaleDateString()}
                </p>
              </button>
              <button
                type="button"
                onClick={() => handleDelete(layout.id)}
                className="ml-2 rounded p-1 text-custom-color-600 opacity-0 transition hover:bg-rose-500/20 hover:text-rose-600 group-hover:opacity-100 dark:text-custom-color-300 dark:hover:text-rose-400"
              >
                <TrashIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

