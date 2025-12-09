import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY;

if (!stripeSecret) {
  console.warn('STRIPE_SECRET_KEY is not set. Stripe features will be disabled.');
}

export const stripe = stripeSecret
  ? new Stripe(stripeSecret, {
      apiVersion: '2023-10-16',
      typescript: true
    })
  : null;
