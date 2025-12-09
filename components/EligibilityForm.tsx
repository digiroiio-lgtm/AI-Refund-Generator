'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CheckFlightResponse } from '@/lib/types';

const initialState = {
  flightNumber: '',
  flightDate: ''
};

export function EligibilityForm() {
  const router = useRouter();
  const [formState, setFormState] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/check-flight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState)
      });

      if (!response.ok) {
        throw new Error('We could not analyze that flight. Please try again.');
      }

      const data = (await response.json()) as CheckFlightResponse;
      const query = new URLSearchParams({
        scanId: data.scanId,
        flightNumber: data.flightNumber,
        flightDate: data.flightDate,
        eligible: String(data.eligible),
        compensationAmount: String(data.compensationAmount),
        regulation: data.regulation,
        confidence: String(data.confidence)
      });

      router.push(`/result?${query.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card space-y-6" onSubmit={handleSubmit}>
      <div>
        <label className="text-sm text-gray-500" htmlFor="flightNumber">
          Flight number
        </label>
        <input
          required
          className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base focus:border-black focus:outline-none"
          id="flightNumber"
          name="flightNumber"
          placeholder="e.g. LH1234"
          value={formState.flightNumber}
          onChange={handleChange}
        />
      </div>
      <div>
        <label className="text-sm text-gray-500" htmlFor="flightDate">
          Flight date
        </label>
        <input
          required
          className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base focus:border-black focus:outline-none"
          id="flightDate"
          name="flightDate"
          type="date"
          value={formState.flightDate}
          onChange={handleChange}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button className="button-primary" disabled={loading} type="submit">
        {loading ? 'Analyzing…' : 'Check Refund Eligibility'}
      </button>
    </form>
  );
}
