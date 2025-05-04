// File: D:\cogtechai-mvp\frontend\src\app\api\admin\invite\route.ts

'use server';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { nanoid } from 'nanoid';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
const FROM_EMAIL = process.env.NOTIFICATION_FROM!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!; // e.g., https://app.yourdomain.com

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  // 1. Check for existing pending invite
  const now = new Date().toISOString();
  const { data: existing, error: selectErr } = await supabase
    .from('invites')
    .select('*')
    .eq('email', email)
    .eq('status', 'pending')
    .gte('expires_at', now)
    .single();

  if (selectErr && selectErr.code !== 'PGRST116') {
    console.error('Error checking existing invite:', selectErr);
    return NextResponse.json({ error: selectErr.message }, { status: 500 });
  }

  let token: string;
  let inviteId: string;

  if (existing) {
    // Reuse existing invite
    token = existing.token;
    inviteId = existing.id;
  } else {
    // Create new invite
    token = nanoid();
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    const { data, error } = await supabase
      .from('invites')
      .insert({
        email,
        token,
        status: 'pending',
        expires_at: expires.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Invite insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    inviteId = data.id;
  }

  // 2. Send (or re-send) email invite
  const link = `${APP_URL}/invite?token=${token}`;
  try {
    await sgMail.send({
      to: email,
      from: FROM_EMAIL,
      subject: 'Invitation to join CogTechAI',
      text: `You have been invited to join CogTechAI. Click here to accept your invitation: ${link}`,
      html: `<p>You have been invited to join CogTechAI.</p><p><a href="${link}">Accept Invitation</a></p>`,
    });
  } catch (mailErr) {
    console.error('Invite email failed:', mailErr);
    // Proceed even if email fails
  }

  return NextResponse.json({ success: true, inviteId });
}
