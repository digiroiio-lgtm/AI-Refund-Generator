import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { openai } from '@/lib/openai';
import type { GenerateLetterResponse } from '@/lib/types';

const schema = z.object({
  scanId: z.string().min(5),
  passengerName: z.string().min(2),
  passengerEmail: z.string().email()
});

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());
    const scan = await prisma.scan.findUnique({ where: { id: payload.scanId } });

    if (!scan) {
      return NextResponse.json({ message: 'Scan not found' }, { status: 404 });
    }

    const purchase = await prisma.purchase.findFirst({
      where: { scanId: payload.scanId, status: 'paid' }
    });

    if (!purchase) {
      return NextResponse.json(
        { message: 'A paid purchase is required before generating a letter.' },
        { status: 403 }
      );
    }

    const letterContent = await createLetter({
      passengerName: payload.passengerName,
      passengerEmail: payload.passengerEmail,
      scan
    });

    const saved = await prisma.claimLetter.upsert({
      where: { scanId: payload.scanId },
      update: { content: letterContent },
      create: { scanId: payload.scanId, content: letterContent }
    });

    const response: GenerateLetterResponse = { claimLetter: saved.content };
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
    }
    console.error('generate-letter error', error);
    return NextResponse.json({ message: 'Unable to generate letter' }, { status: 500 });
  }
}

async function createLetter({
  passengerName,
  passengerEmail,
  scan
}: {
  passengerName: string;
  passengerEmail: string;
  scan: { flightNumber: string; flightDate: string; compensationAmount: number; regulation: string; delayMinutes: number };
}) {
  const baseTemplate = buildTemplate({ passengerName, passengerEmail, scan });

  if (!openai) {
    return baseTemplate;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: 'You are an assistant that drafts concise and professional airline refund claim letters.'
        },
        {
          role: 'user',
          content: baseTemplate
        }
      ]
    });

    const content = completion.choices[0].message?.content;
    if (!content) {
      return baseTemplate;
    }

    if (typeof content === 'string') {
      return content.trim();
    }

    return content.map((chunk) => chunk.text ?? '').join('').trim() || baseTemplate;
  } catch (error) {
    console.error('openai error', error);
    return baseTemplate;
  }
}

function buildTemplate({
  passengerName,
  passengerEmail,
  scan
}: {
  passengerName: string;
  passengerEmail: string;
  scan: { flightNumber: string; flightDate: string; compensationAmount: number; regulation: string; delayMinutes: number };
}) {
  return `Please draft a formal email from ${passengerName} (${passengerEmail}) to the airline requesting compensation under ${scan.regulation}.
  Include: flight ${scan.flightNumber} on ${scan.flightDate}, assumed route FRA to JFK, delayed by ${scan.delayMinutes} minutes, asking for €${scan.compensationAmount}. Keep the tone polite, concise, and include a request for response within 14 days.`;
}
