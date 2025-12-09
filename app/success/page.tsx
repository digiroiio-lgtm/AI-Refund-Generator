'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CopyButton } from '@/components/CopyButton';
import { LetterViewer } from '@/components/LetterViewer';
import type { GenerateLetterResponse, PurchaseDetailResponse } from '@/lib/types';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return (
      <div className="card space-y-4">
        <h1 className="text-2xl font-semibold">Missing Stripe session.</h1>
        <p>Please return to your results and start checkout again.</p>
      </div>
    );
  }

  return <SuccessClient sessionId={sessionId} />;
}

function SuccessClient({ sessionId }: { sessionId: string }) {
  const [data, setData] = useState<PurchaseDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [letter, setLetter] = useState<string | null>(null);
  const [passengerName, setPassengerName] = useState('Valued Passenger');
  const [passengerEmail, setPassengerEmail] = useState('passenger@example.com');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/purchase?session_id=${sessionId}`);
        if (!res.ok) {
          throw new Error('Unable to load purchase.');
        }
        const result = (await res.json()) as PurchaseDetailResponse;
        setData(result);
        setLetter(result.claimLetter ?? null);
        if (result.customerEmail) {
          setPassengerEmail(result.customerEmail);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unexpected error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionId]);

  const shouldAutoGenerate = useMemo(() => Boolean(data && !letter), [data, letter]);

  const triggerLetterGeneration = useCallback(
    async (isAuto = false) => {
      if (!data) return;
      if (generating) return;
      try {
        setGenerating(true);
        const response = await fetch('/api/generate-letter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scanId: data.scan.id,
            passengerEmail,
            passengerName
          })
        });
        if (!response.ok) {
          throw new Error('Unable to generate your letter.');
        }
        const payload = (await response.json()) as GenerateLetterResponse;
        setLetter(payload.claimLetter);
      } catch (err) {
        if (!isAuto) {
          setError(err instanceof Error ? err.message : 'Generation failed');
        }
      } finally {
        setGenerating(false);
      }
    },
    [data, passengerEmail, passengerName, generating]
  );

  useEffect(() => {
    if (shouldAutoGenerate) {
      triggerLetterGeneration(true);
    }
  }, [shouldAutoGenerate, triggerLetterGeneration]);

  const handleDownload = () => {
    if (!data || !letter) return;
    const url = `/api/letter-pdf?scanId=${data.scan.id}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="card">
        <p>Loading your purchase details…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card space-y-4">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="text-gray-500">{error}</p>
        <button className="button-primary" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="card space-y-4">
        <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Payment confirmed</p>
        <h1 className="text-3xl font-semibold">Your claim letter is ready.</h1>
        <dl className="grid gap-4 md:grid-cols-3">
          <div>
            <dt className="text-sm text-gray-500">Passenger</dt>
            <dd className="text-xl font-medium">{passengerName}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Flight</dt>
            <dd className="text-xl font-medium">
              {data.scan.flightNumber} · {new Date(data.scan.flightDate).toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Regulation</dt>
            <dd className="text-xl font-medium">{data.scan.regulation}</dd>
          </div>
        </dl>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm text-gray-500">
            Passenger name
            <input
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-base"
              value={passengerName}
              onChange={(event) => setPassengerName(event.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm text-gray-500">
            Email address
            <input
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-base"
              value={passengerEmail}
              onChange={(event) => setPassengerEmail(event.target.value)}
            />
          </label>
        </div>
        <div className="flex flex-col gap-3 md:flex-row">
          <button className="button-primary" disabled={generating} onClick={() => triggerLetterGeneration(false)}>
            {generating ? 'Creating letter…' : 'Regenerate letter with these details'}
          </button>
          <button className="button-primary" disabled={!letter} onClick={handleDownload} type="button">
            {letter ? 'Download PDF' : 'Preparing PDF…'}
          </button>
          {letter && <CopyButton label="Copy email text" text={letter} />}
        </div>
      </div>

      {letter ? (
        <LetterViewer content={letter} />
      ) : (
        <div className="card">
          <p className="text-gray-500">Generating your letter…</p>
        </div>
      )}
    </div>
  );
}
