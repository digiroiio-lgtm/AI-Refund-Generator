import Link from 'next/link';

export default function CancelPage() {
  return (
    <div className="card space-y-6 text-center">
      <h1 className="text-3xl font-semibold">Payment cancelled</h1>
      <p className="text-gray-500">
        No worries—you can go back to your eligibility results and try again whenever
        you’re ready.
      </p>
      <div className="flex flex-col gap-3 md:flex-row">
        <Link className="button-primary" href="/result">
          Back to result
        </Link>
        <Link className="button-primary" href="/">
          Run a new search
        </Link>
      </div>
    </div>
  );
}
