import Link from 'next/link';
import { ResultSummary } from '@/components/ResultSummary';

type ResultSearchParams = Record<string, string | string[] | undefined>;

export default function ResultPage({
  searchParams
}: {
  searchParams?: ResultSearchParams;
}) {
  if (!searchParams) {
    return (
      <div className="card space-y-4">
        <p className="text-xl font-semibold">Missing flight data.</p>
        <Link className="button-primary" href="/">
          Start again
        </Link>
      </div>
    );
  }

  const scanId = String(searchParams.scanId ?? '');
  const eligible = String(searchParams.eligible ?? 'false') === 'true';
  const compensationAmount = Number(searchParams.compensationAmount ?? 0);
  const regulation = String(searchParams.regulation ?? 'EU261 (demo)');
  const confidence = Number(searchParams.confidence ?? 0);
  const flightNumber = String(searchParams.flightNumber ?? '');
  const flightDate = String(searchParams.flightDate ?? '');

  if (!scanId || !flightNumber || !flightDate) {
    return (
      <div className="card space-y-4">
        <p className="text-xl font-semibold">This result link is incomplete.</p>
        <Link className="button-primary" href="/">
          Run a new search
        </Link>
      </div>
    );
  }

  return (
    <ResultSummary
      compensationAmount={compensationAmount}
      confidence={confidence}
      eligible={eligible}
      flightDate={flightDate}
      flightNumber={flightNumber}
      regulation={regulation}
      scanId={scanId}
    />
  );
}
