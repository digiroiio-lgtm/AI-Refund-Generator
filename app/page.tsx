import { EligibilityForm } from '@/components/EligibilityForm';

export default function LandingPage() {
  return (
    <div className="space-y-10 py-6">
      <section className="space-y-6 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-gray-400">AI REFUND GENERATOR</p>
        <h1 className="text-4xl font-semibold text-gray-900 md:text-5xl">
          Claim the compensation you are owed.
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-500">
          Instantly check if your delayed or cancelled flight is likely covered by EU261 and
          unlock a polished claim letter crafted with AI.
        </p>
      </section>
      <EligibilityForm />
    </div>
  );
}
