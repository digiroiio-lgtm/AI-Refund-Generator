'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/format';
import type { CheckoutSessionResponse } from '@/lib/types';

interface Props {
  scanId: string;
  eligible: boolean;
  compensationAmount: number;
  regulation: string;
  confidence: number;
  flightNumber: string;
  flightDate: string;
}

export function ResultSummary({
  scanId,
  eligible,
  compensationAmount,
  regulation,
  confidence,
  flightDate,
  flightNumber
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanId })
      });

      if (!response.ok) {
        throw new Error('Unable to start checkout. Please try again.');
      }

      const data = (await response.json()) as CheckoutSessionResponse;
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error.');
    } finally {
      setLoading(false);
    }
  };

  if (!scanId) {
    return (
      <div className="card">
        <p className="text-lg font-semibold text-gray-900">Missing scan reference.</p>
        <button className="button-primary mt-6" onClick={() => router.push('/')}>Start over</button>
      </div>
    );
  }

  return (
    <div className="card space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-wide text-gray-500">
          {flightNumber} · {new Date(flightDate).toLocaleDateString()}
        </p>
        <h1 className="text-3xl font-semibold">
          {eligible ? 'Likely eligible for compensation' : 'Compensation unlikely'}
        </h1>
        <p className="text-gray-500">
          {eligible
            ? 'Based on EU261 demo rules, you appear entitled to a compensation payout.'
            : 'This flight does not meet our simple criteria. You can try another flight.'}
        </p>
      </div>

      <dl className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl bg-gray-50 p-4">
          <dt className="text-sm text-gray-500">Estimated compensation</dt>
          <dd className="text-2xl font-semibold">{formatCurrency(compensationAmount)}</dd>
        </div>
        <div className="rounded-2xl bg-gray-50 p-4">
          <dt className="text-sm text-gray-500">Regulation</dt>
          <dd className="text-lg font-medium">{regulation}</dd>
        </div>
        <div className="rounded-2xl bg-gray-50 p-4">
          <dt className="text-sm text-gray-500">Confidence</dt>
          <dd className="text-2xl font-semibold">{confidence}%</dd>
        </div>
      </dl>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {eligible ? (
        <button className="button-primary" disabled={loading} onClick={handleCheckout}>
          {loading ? 'Contacting Stripe…' : 'Generate Official Claim Letter – $9'}
        </button>
      ) : (
        <button className="button-primary" onClick={() => router.push('/')}>New search</button>
      )}
    </div>
  );
}
