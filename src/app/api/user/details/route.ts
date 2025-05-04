export const dynamic = 'force-dynamic';

import { auth, currentUser } from '@clerk/nextjs/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',  // 🛠 FIXED
});

export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Fetch ESG verification status
    const { data: esgData, error: esgError } = await supabase
      .from('user_esg_verifications')
      .select('verified')
      .eq('user_id', user.id)
      .single();

    if (esgError && esgError.code !== 'PGRST116') {
      console.error('Supabase ESG fetch error:', esgError);
      throw new Error('Failed to fetch ESG data');
    }

    const esgVerified = esgData?.verified || false;

    // Check if ESG uploads exist
    const { data: uploadData, error: uploadError } = await supabase
      .from('user_esg_uploads')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (uploadError && uploadError.code !== 'PGRST116') {
      console.error('Supabase ESG uploads fetch error:', uploadError);
      throw new Error('Failed to fetch ESG uploads');
    }

    const esgUploadExists = !!uploadData;

    // Fetch Stripe subscription status
    const customerId = user.privateMetadata?.stripeCustomerId as string | undefined;

    let subscriptionActive = false;
    if (customerId) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'all',
        limit: 1,
      });

      const activeSub = subscriptions.data.find(
        (sub) => sub.status === 'active' || sub.status === 'trialing'
      );

      subscriptionActive = !!activeSub;
    }

    return NextResponse.json(
      {
        esgVerified,
        subscriptionActive,
        esgUploadExists,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
