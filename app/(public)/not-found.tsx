import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { UI_TEXT } from "@/lib/constants";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center justify-center py-24 text-center">
      <p className="font-serif-hi text-6xl font-bold text-outline-variant">404</p>
      <h1 className="mt-4 text-2xl font-bold text-on-surface">यह पृष्ठ नहीं मिला</h1>
      <p className="mt-2 max-w-md text-on-surface-variant">
        जिस पृष्ठ को आप खोज रहे हैं वह हटाया जा चुका है या मौजूद नहीं है।
      </p>
      <Link
        href="/"
        className="mt-6 bg-primary px-6 py-3 text-sm font-bold text-on-primary hover:opacity-90"
      >
        {UI_TEXT.home} पर जाएं
      </Link>
    </Container>
  );
}
