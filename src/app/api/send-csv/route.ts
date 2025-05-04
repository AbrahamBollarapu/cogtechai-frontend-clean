// File: /src/app/api/send-csv/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { Parser } from 'json2csv';

// Initialize Resend instance properly with API Key
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  const { users, email } = await req.json();

  if (!users || !email) {
    return NextResponse.json({ success: false, error: 'Missing users or email' }, { status: 400 });
  }

  try {
    // Convert JSON to CSV
    const parser = new Parser();
    const csv = parser.parse(users);

    // Send CSV via email using Resend
    const response = await resend.sendEmail({   // ✅ Corrected here
      from: process.env.NOTIFICATION_FROM!,     // Use your verified sender
      to: email,
      subject: 'CSV Export - CogTechAI Users',
      text: csv,                                // Attach CSV content as plain text
    });

    return NextResponse.json({ success: true, response });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
