'use server';

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  const { need_id, price, notes, user_email } = await req.json();

  // 1) Insert the quote
  const { data, error } = await supabase
    .from('quotes')
    .insert({ need_id, price, notes, user_email })
    .select()
    .single();

  if (error) {
    console.error('Supabase insert error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 2) Send notification email
  try {
    await sgMail.send({
      to: process.env.ADMIN_EMAIL!,          // your admin email
      from: process.env.NOTIFICATION_FROM!,  // your notification sender
      subject: `New Quote for Need ${need_id}`,
      text: `
A new quote has been submitted:

• Need ID: ${need_id}
• User: ${user_email}
• Price: ${price}
• Notes: ${notes}
      `.trim(),
    });
  } catch (e) {
    console.error('SendGrid error:', e);
    // Do not fail if email fails
  }

  return NextResponse.json(data);
}
