"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export function DeleteCategoryButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.message ?? "श्रेणी हटाई नहीं जा सकी।");
        setLoading(false);
        return;
      }

      setOpen(false);
      router.refresh();
    } catch {
      setError("सर्वर से संपर्क नहीं हो सका। कृपया पुनः प्रयास करें।");
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
        हटाएं
      </button>

      <ConfirmDialog
        open={open}
        title="श्रेणी हटाएं"
        message={error ? error : `क्या आप "${name}" श्रेणी को हटाना चाहते हैं?`}
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
