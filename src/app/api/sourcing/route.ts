// src/app/api/sourcing/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ✅ Public client is fine for GET, use service role (optional) for write ops
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ✅ GET all sourcing needs
export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('needs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Fetch needs failed:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

// ✅ POST a new sourcing need
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, quantity, email } = body;

    if (!title || !description || !quantity || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase.from('needs').insert([{ title, description, quantity, email }]);

    if (error) {
      console.error('❌ Insert failed:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Need submitted successfully', data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to submit need' }, { status: 500 });
  }
}
