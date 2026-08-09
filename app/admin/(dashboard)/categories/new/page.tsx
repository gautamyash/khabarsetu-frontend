import type { Metadata } from "next";
import { CategoryForm } from "@/components/admin/CategoryForm";

export const metadata: Metadata = {
  title: "नई श्रेणी",
};

export default function NewCategoryPage() {
  return (
    <div>
      <h1 className="font-serif-hi text-2xl font-bold text-ink-900">नई श्रेणी</h1>
      <div className="mt-6">
        <CategoryForm />
      </div>
    </div>
  );
}
