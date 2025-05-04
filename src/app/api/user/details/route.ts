import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// (Optional) import Supabase if you want to pull ESG info from DB later
// import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ Basic mockup values for now
    // Later you can fetch real data from Supabase or your database
    const esgVerified = false; // Replace with real lookup
    const subscriptionActive = false; // Replace with real Stripe subscription check
    const esgUploadExists = false; // Replace with real ESG uploads check

    return NextResponse.json({
      esgVerified,
      subscriptionActive,
      esgUploadExists,
    });
  } catch (error) {
    console.error('Error in /api/user/details:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
