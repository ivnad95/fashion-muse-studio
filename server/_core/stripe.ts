/**
 * Stripe Payment Integration
 * Handles credit purchases and subscription management
 */

import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn('[Stripe] STRIPE_SECRET_KEY not configured');
}

export const stripe = stripeSecretKey 
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-09-30.clover',
    })
  : null;

/**
 * Credit packages available for purchase
 */
export const CREDIT_PACKAGES = [
  {
    id: 'credits_10',
    name: '10 Credits',
    credits: 10,
    price: 3.99, // £3.99
    priceId: 'price_credits_10', // You'll need to create these in Stripe Dashboard
  },
  {
    id: 'credits_50',
    name: '50 Credits',
    credits: 50,
    price: 15.99, // £15.99
    priceId: 'price_credits_50',
    popular: true,
  },
  {
    id: 'credits_100',
    name: '100 Credits',
    credits: 100,
    price: 27.99, // £27.99
    priceId: 'price_credits_100',
  },
  {
    id: 'credits_500',
    name: '500 Credits',
    credits: 500,
    price: 119.99, // £119.99
    priceId: 'price_credits_500',
    bestValue: true,
  },
];

/**
 * Create a Stripe checkout session for credit purchase
 */
export async function createCheckoutSession(params: {
  userId: string;
  userEmail: string;
  packageId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ sessionId: string; url: string }> {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const package_ = CREDIT_PACKAGES.find(p => p.id === params.packageId);
  if (!package_) {
    throw new Error('Invalid package ID');
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'gbp',
          product_data: {
            name: package_.name,
            description: `Purchase ${package_.credits} credits for Fashion Muse Studio`,
          },
          unit_amount: Math.round(package_.price * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    client_reference_id: params.userId,
    customer_email: params.userEmail,
    metadata: {
      userId: params.userId,
      packageId: params.packageId,
      credits: package_.credits.toString(),
    },
  });

  if (!session.url) {
    throw new Error('Failed to create checkout session');
  }

  return {
    sessionId: session.id,
    url: session.url,
  };
}

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  return stripe.webhooks.constructEvent(payload, signature, secret);
}

/**
 * Handle successful payment
 */
export async function handlePaymentSuccess(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const credits = parseInt(session.metadata?.credits || '0');

  if (!userId || !credits) {
    console.error('[Stripe] Missing metadata in payment session:', session.id);
    return;
  }

  console.log(`[Stripe] Payment successful: ${credits} credits for user ${userId}`);
  
  return {
    userId,
    credits,
    sessionId: session.id,
    amount: session.amount_total ? session.amount_total / 100 : 0,
  };
}

