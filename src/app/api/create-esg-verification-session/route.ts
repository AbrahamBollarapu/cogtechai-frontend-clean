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
      mode: 'payment',
      customer_email: email!,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Silver ESG Verification' },
            unit_amount: 7500, // $75.00
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=silver_success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=silver_cancel`,
      metadata: {
        userId,
        purpose: 'silver_esg_verification',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error in Silver ESG Verification:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
