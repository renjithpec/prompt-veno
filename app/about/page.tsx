import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Prompt Veno helps creators copy better AI prompts faster."
};

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-black">About Prompt Veno</h1>
      <p className="mt-4 text-lg leading-8 text-zinc-300">Prompt Veno is a premium mobile-first AI prompt marketplace for Instagram creators, AI creators, students, prompt engineers, and teams that need high-quality content prompts without rebuilding their workflow every day.</p>
    </section>
  );
}
