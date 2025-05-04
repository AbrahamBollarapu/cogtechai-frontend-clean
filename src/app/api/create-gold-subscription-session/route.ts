import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2022-11-15',
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email!,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Gold Monthly Subscription' },
            recurring: { interval: 'month' },
            unit_amount: 30000, // $300.00
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=gold_success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=gold_cancel`,
      metadata: {
        userId,
        purpose: 'gold_subscription',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error in Gold Subscription:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
