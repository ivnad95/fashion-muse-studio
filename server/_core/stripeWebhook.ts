/**
 * Stripe Webhook Handler
 * Processes payment events from Stripe
 */

import { Request, Response } from 'express';
import { verifyWebhookSignature, handlePaymentSuccess } from './stripe';
import { addCredits } from '../db';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function handleStripeWebhook(req: Request, res: Response) {
  const signature = req.headers['stripe-signature'];

  if (!signature) {
    console.error('[Stripe Webhook] Missing signature');
    return res.status(400).send('Missing signature');
  }

  if (!webhookSecret) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured');
    return res.status(500).send('Webhook secret not configured');
  }

  try {
    // Verify webhook signature
    const event = verifyWebhookSignature(
      req.body,
      Array.isArray(signature) ? signature[0] : signature,
      webhookSecret
    );

    console.log(`[Stripe Webhook] Received event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const paymentData = await handlePaymentSuccess(session);

        if (paymentData) {
          // Add credits to user account
          await addCredits(
            paymentData.userId,
            paymentData.credits,
            'purchase',
            `Purchased ${paymentData.credits} credits via Stripe`
          );

          console.log(`[Stripe Webhook] Added ${paymentData.credits} credits to user ${paymentData.userId}`);
        }
        break;
      }

      case 'payment_intent.succeeded':
        console.log('[Stripe Webhook] Payment intent succeeded');
        break;

      case 'payment_intent.payment_failed':
        console.log('[Stripe Webhook] Payment intent failed');
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Error:', error);
    res.status(400).send(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

