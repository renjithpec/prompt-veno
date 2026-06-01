import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Prompt Veno privacy policy."
};

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-black">Privacy Policy</h1>
      <p className="mt-4 leading-7 text-zinc-300">Prompt Veno stores account data, favorites, prompt views, prompt copies, and admin-managed content in Supabase. Authentication is handled through Supabase Auth. The application does not sell personal data.</p>
    </section>
  );
}
