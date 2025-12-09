import { calculateEligibility } from '@/lib/eligibility';

describe('calculateEligibility', () => {
  it('marks high delays as eligible with higher payout', () => {
    const result = calculateEligibility({ delayMinutes: 260, isTechnicalIssue: true, isWeather: false });
    expect(result.eligible).toBe(true);
    expect(result.compensationAmount).toBe(600);
    expect(result.confidence).toBeGreaterThan(50);
  });

  it('rejects weather delays', () => {
    const result = calculateEligibility({ delayMinutes: 300, isTechnicalIssue: false, isWeather: true });
    expect(result.eligible).toBe(false);
    expect(result.compensationAmount).toBe(0);
  });

  it('rejects small delays', () => {
    const result = calculateEligibility({ delayMinutes: 90, isTechnicalIssue: false, isWeather: false });
    expect(result.eligible).toBe(false);
    expect(result.compensationAmount).toBe(0);
  });
});
