import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import type { PurchaseDetailResponse } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ message: 'session_id is required' }, { status: 400 });
    }

    const purchase = await prisma.purchase.findUnique({
      where: { stripeSessionId: sessionId },
      include: {
        scan: true
      }
    });

    if (!purchase) {
      return NextResponse.json({ message: 'Purchase not found' }, { status: 404 });
    }

    let updated = purchase;

    if (stripe) {
      const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
      const paid = checkoutSession.payment_status === 'paid';
      const email = checkoutSession.customer_details?.email ?? purchase.stripeCustomerEmail;

      if ((paid && purchase.status !== 'paid') || email !== purchase.stripeCustomerEmail) {
        updated = await prisma.purchase.update({
          where: { id: purchase.id },
          data: {
            status: paid ? 'paid' : purchase.status,
            stripeCustomerEmail: email ?? purchase.stripeCustomerEmail
          }
        });
      }
    }

    const claimLetter = await prisma.claimLetter.findUnique({
      where: { scanId: purchase.scanId }
    });

    const payload: PurchaseDetailResponse = {
      purchaseId: updated.id,
      status: updated.status,
      stripeSessionId: updated.stripeSessionId,
      customerEmail: updated.stripeCustomerEmail ?? undefined,
      scan: {
        id: purchase.scan.id,
        flightNumber: purchase.scan.flightNumber,
        flightDate: purchase.scan.flightDate,
        eligible: purchase.scan.eligible,
        compensationAmount: purchase.scan.compensationAmount,
        regulation: purchase.scan.regulation,
        confidence: purchase.scan.confidence
      },
      claimLetter: claimLetter?.content
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error('purchase lookup error', error);
    return NextResponse.json({ message: 'Unable to load purchase' }, { status: 500 });
  }
}
