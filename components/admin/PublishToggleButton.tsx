"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { ArticleStatus } from "@/types/article";

type StatusActionKind = "publish" | "unpublish" | "archive" | "restore";

interface StatusActionConfig {
  /** Route Handler segment this action PATCHes — "restore" reuses the same
   * "unpublish" endpoint (it already returns an article to draft). */
  endpoint: "publish" | "unpublish" | "archive";
  label: string;
  dialogTitle: string;
  question: string;
}

const STATUS_ACTIONS: Record<StatusActionKind, StatusActionConfig> = {
  publish: {
    endpoint: "publish",
    label: "प्रकाशित करें",
    dialogTitle: "खबर प्रकाशित करें",
    question: "क्या आप इस खबर को प्रकाशित करना चाहते हैं?",
  },
  unpublish: {
    endpoint: "unpublish",
    label: "ड्राफ्ट में वापस लाएं",
    dialogTitle: "ड्राफ्ट में वापस लाएं",
    question: "क्या आप इस खबर को ड्राफ्ट में वापस लाना चाहते हैं?",
  },
  archive: {
    endpoint: "archive",
    label: "संग्रहित करें",
    dialogTitle: "खबर संग्रहित करें",
    question: "क्या आप इस खबर को संग्रहित करना चाहते हैं?",
  },
  restore: {
    endpoint: "unpublish",
    label: "पुनः सक्रिय करें",
    dialogTitle: "खबर पुनः सक्रिय करें",
    question: "क्या आप इस खबर को पुनः सक्रिय करना चाहते हैं? यह ड्राफ्ट में वापस चली जाएगी।",
  },
};

/** Which actions are offered for each current status. draft/published get
 * their primary toggle plus a secondary archive action; archived only gets
 * restore (archiving an already-archived article makes no sense). */
const ACTIONS_BY_STATUS: Record<ArticleStatus, StatusActionKind[]> = {
  draft: ["publish", "archive"],
  published: ["unpublish", "archive"],
  archived: ["restore"],
};

export function PublishToggleButton({ id, status }: { id: string; status: ArticleStatus }) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<StatusActionKind | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = pendingAction ? STATUS_ACTIONS[pendingAction] : null;

  function openDialog(action: StatusActionKind) {
    setError(null);
    setPendingAction(action);
  }

  function closeDialog() {
    setPendingAction(null);
  }

  async function handleConfirm() {
    if (!config) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/articles/${id}/${config.endpoint}`, { method: "PATCH" });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.message ?? "कार्रवाई पूरी नहीं हो सकी।");
        setLoading(false);
        return;
      }

      setPendingAction(null);
      setLoading(false);
      router.refresh();
    } catch {
      setError("सर्वर से संपर्क नहीं हो सका। कृपया पुनः प्रयास करें।");
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-1">
      {ACTIONS_BY_STATUS[status].map((action) => (
        <button
          key={action}
          type="button"
          onClick={() => openDialog(action)}
          disabled={pendingAction !== null}
          className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {STATUS_ACTIONS[action].label}
        </button>
      ))}

      <ConfirmDialog
        open={pendingAction !== null}
        title={config?.dialogTitle ?? ""}
        message={error ?? config?.question ?? ""}
        confirmLabel="पुष्टि करें"
        cancelLabel="रद्द करें"
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={closeDialog}
      />
    </div>
  );
}
