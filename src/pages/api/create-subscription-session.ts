// pages/api/create-subscription-session.ts 
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

// ✅ Initialize Stripe instance
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { priceId, user_email } = req.body;

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        metadata: {
          user_email,
        },
        success_url: `${req.headers.origin}/checkout/success`,
        cancel_url: `${req.headers.origin}/checkout/cancel`,
      });

      res.status(200).json({ url: session.url });
    } catch (err: any) {
      console.error('❌ Stripe Error:', err.message);
      res.status(500).json({ error: err.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
