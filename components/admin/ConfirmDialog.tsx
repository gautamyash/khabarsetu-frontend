"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";

/**
 * Reusable Hindi confirmation modal — used wherever a destructive action
 * (delete) needs an explicit "क्या आप सुनिश्चित हैं?" style prompt with
 * labeled buttons, rather than the browser's native (English) confirm().
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "हटाएं",
  cancelLabel = "रद्द करें",
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !loading) onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 px-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-sm rounded-md border border-ink-200 bg-white p-5 shadow-lg"
      >
        <h2 id="confirm-dialog-title" className="font-serif-hi text-lg font-bold text-ink-900">
          {title}
        </h2>
        <p className="mt-2 text-sm text-ink-600">{message}</p>

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-sm border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 rounded-sm bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
