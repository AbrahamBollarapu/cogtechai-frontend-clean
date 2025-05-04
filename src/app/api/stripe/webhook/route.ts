'use server';

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Initialize Stripe
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2022-11-15',
  });

  // 2. Initialize Supabase Admin Client
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 3. Read raw request body
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  if (!signature || !webhookSecret) {
    console.error('❌ Missing Stripe signature or webhook secret.');
    return new NextResponse('Missing Stripe signature or webhook secret.', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error('❌ Stripe webhook verification failed:', err);
    return new NextResponse(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }

  // 4. Handle specific Stripe event types
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const email = session.customer_email;
        const metadata = session.metadata;

        console.log('✅ Checkout session completed for:', email);

        if (email && metadata?.purpose === 'esg_verification') {
          console.log('🌿 Marking user as ESG Verified');

          const { error } = await supabaseAdmin
            .from('users')
            .update({ esg_verified: true })
            .eq('email', email);

          if (error) {
            console.error('❌ Error updating ESG verification:', error.message);
            return new NextResponse('Error updating ESG verification.', { status: 500 });
          }
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer;

        if (typeof customerId === 'string') {
          const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
          const email = customer.email;

          if (email) {
            console.log('✅ Subscription payment received for:', email);

            const { error } = await supabaseAdmin
              .from('users')
              .update({ subscription_active: true })
              .eq('email', email);

            if (error) {
              console.error('❌ Error activating subscription:', error.message);
              return new NextResponse('Error activating subscription.', { status: 500 });
            }
          }
        }
        break;
      }

      case 'invoice.payment_failed':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer;

        if (typeof customerId === 'string') {
          const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
          const email = customer.email;

          if (email) {
            console.log('⚠️ Subscription payment failed or subscription cancelled for:', email);

            const { error } = await supabaseAdmin
              .from('users')
              .update({ subscription_active: false })
              .eq('email', email);

            if (error) {
              console.error('❌ Error deactivating subscription:', error.message);
              return new NextResponse('Error deactivating subscription.', { status: 500 });
            }
          }
        }
        break;
      }

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error('❌ Webhook handler error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }

  return new NextResponse('✅ Webhook received successfully', { status: 200 });
}
