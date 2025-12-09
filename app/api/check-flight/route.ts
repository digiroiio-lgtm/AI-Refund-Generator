import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { calculateEligibility, generateMockFlightStatus } from '@/lib/eligibility';
import type { CheckFlightResponse } from '@/lib/types';

const requestSchema = z.object({
  flightNumber: z.string().trim().min(3),
  flightDate: z.string().trim().min(4)
});

export async function POST(request: Request) {
  try {
    const payload = requestSchema.parse(await request.json());
    const status = generateMockFlightStatus(payload);
    const eligibility = calculateEligibility(status);

    const scan = await prisma.scan.create({
      data: {
        flightNumber: payload.flightNumber.toUpperCase(),
        flightDate: payload.flightDate,
        eligible: eligibility.eligible,
        compensationAmount: eligibility.compensationAmount,
        regulation: eligibility.regulation,
        confidence: eligibility.confidence,
        delayMinutes: eligibility.delayMinutes
      }
    });

    const response: CheckFlightResponse = {
      scanId: scan.id,
      flightNumber: scan.flightNumber,
      flightDate: scan.flightDate,
      eligible: scan.eligible,
      compensationAmount: scan.compensationAmount,
      regulation: scan.regulation as CheckFlightResponse['regulation'],
      confidence: scan.confidence,
      delayMinutes: scan.delayMinutes
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid request payload' }, { status: 400 });
    }
    console.error('check-flight error', error);
    return NextResponse.json({ message: 'Unable to evaluate flight' }, { status: 500 });
  }
}
