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
      where: { scanId: payload.scanId }
    });

    if (!purchase) {
      return NextResponse.json(
        { message: 'A purchase is required before generating a letter.' },
        { status: 403 }
      );
    }

    if (process.env.STRIPE_SECRET_KEY && purchase.status !== 'paid') {
      return NextResponse.json(
        { message: 'Payment not confirmed yet. Please wait a moment and refresh.' },
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
  const prompt = buildPrompt({ passengerName, passengerEmail, scan });
  const fallback = buildFallback({ passengerName, passengerEmail, scan });

  if (!openai) {
    return fallback;
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
          content: prompt
        }
      ]
    });

    const content = completion.choices[0].message?.content;
    if (typeof content !== 'string') {
      return fallback;
    }

    const cleaned = content.trim();
    return cleaned.length > 0 ? cleaned : fallback;
  } catch (error) {
    console.error('openai error', error);
    return fallback;
  }
}

function buildPrompt({
  passengerName,
  passengerEmail,
  scan
}: {
  passengerName: string;
  passengerEmail: string;
  scan: { flightNumber: string; flightDate: string; compensationAmount: number; regulation: string; delayMinutes: number };
}) {
  return `Compose a formal and polite compensation claim letter that references ${scan.regulation}. Details to include:
- Passenger name: ${passengerName}
- Passenger email: ${passengerEmail}
- Flight: ${scan.flightNumber} on ${scan.flightDate} from Frankfurt (FRA) to New York (JFK)
- Delay: ${scan.delayMinutes} minutes, non-weather related
- Requested amount: €${scan.compensationAmount}
- Request a response within 14 days`;
}

function buildFallback({
  passengerName,
  passengerEmail,
  scan
}: {
  passengerName: string;
  passengerEmail: string;
  scan: { flightNumber: string; flightDate: string; compensationAmount: number; regulation: string; delayMinutes: number };
}) {
  return `To Whom It May Concern,

My name is ${passengerName}, booking reference ${scan.flightNumber}. I was scheduled to travel from Frankfurt (FRA) to New York (JFK) on ${scan.flightDate}. The flight was delayed by approximately ${scan.delayMinutes} minutes for non-weather reasons.

Under ${scan.regulation}, I am requesting compensation of €${scan.compensationAmount}. Please confirm receipt of this claim and provide a written response within 14 days. You can reach me at ${passengerEmail} for any additional information you may require.

Thank you for your prompt attention to this matter.

Sincerely,
${passengerName}`;
}
