import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

const schema = z.object({
  scanId: z.string().min(5)
});

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json(
      { message: 'Stripe is not configured. Please add STRIPE_SECRET_KEY.' },
      { status: 500 }
    );
  }

  try {
    const { scanId } = schema.parse(await request.json());
    const scan = await prisma.scan.findUnique({ where: { id: scanId } });

    if (!scan) {
      return NextResponse.json({ message: 'Scan not found' }, { status: 404 });
    }

    if (!scan.eligible) {
      return NextResponse.json(
        { message: 'Only eligible scans can purchase claim letters.' },
        { status: 400 }
      );
    }

    const origin = headers().get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: 900,
            product_data: {
              name: 'AI Refund Claim Letter',
              description: 'Personalized claim draft referencing EU261 demo rules'
            }
          }
        }
      ],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
      metadata: {
        scanId
      }
    });

    await prisma.purchase.upsert({
      where: { stripeSessionId: session.id },
      update: { scanId },
      create: {
        scanId,
        stripeSessionId: session.id
      }
    });

    if (!session.url) {
      throw new Error('Stripe session URL missing');
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid scan identifier' }, { status: 400 });
    }
    console.error('create-checkout-session error', error);
    return NextResponse.json({ message: 'Unable to start checkout' }, { status: 500 });
  }
}
