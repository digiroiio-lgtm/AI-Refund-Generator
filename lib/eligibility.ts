import type { CheckFlightRequest, CheckFlightResponse } from '@/lib/types';

export interface MockFlightStatus {
  delayMinutes: number;
  isTechnicalIssue: boolean;
  isWeather: boolean;
}

const REGULATION: CheckFlightResponse['regulation'] = 'EU261 (demo)';

export function generateMockFlightStatus(
  params: CheckFlightRequest
): MockFlightStatus {
  const seed = hashString(`${params.flightNumber}-${params.flightDate}`);
  const randomDelay = 60 + Math.floor((seed % 300) * 0.9);
  const isWeather = seed % 5 === 0;
  const isTechnicalIssue = !isWeather && seed % 3 === 0;

  return {
    delayMinutes: randomDelay,
    isTechnicalIssue,
    isWeather
  };
}

export function calculateEligibility(status: MockFlightStatus) {
  const eligible = status.delayMinutes >= 180 && !status.isWeather;
  let compensationAmount = 0;

  if (eligible) {
    if (status.delayMinutes >= 240) {
      compensationAmount = 600;
    } else if (status.delayMinutes >= 180) {
      compensationAmount = 400;
    } else if (status.delayMinutes >= 120) {
      compensationAmount = 250;
    }
  }

  const confidenceBase = Math.min(100, Math.round(status.delayMinutes / 3));
  const confidence = Math.max(
    40,
    Math.min(97, confidenceBase - (status.isWeather ? 25 : 0) + (status.isTechnicalIssue ? 10 : 0))
  );

  return {
    eligible,
    compensationAmount,
    regulation: REGULATION,
    confidence,
    delayMinutes: status.delayMinutes
  } as const;
}

function hashString(value: string) {
  let hash = 0;
  if (value.length === 0) return hash;
  for (let i = 0; i < value.length; i += 1) {
    const chr = value.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return Math.abs(hash);
}
