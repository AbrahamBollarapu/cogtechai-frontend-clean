import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// ✅ Correct new config
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  const body = await req.json();
  const { data, type } = body;

  if (!data) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const { error } = await supabase
    .from('webhook_events')
    .insert([{ type, data }]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
