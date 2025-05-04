'use server';

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// DELETE sourcing need by ID
export async function DELETE(req: NextRequest, { params }: { params: { needId: string } }) {
  const supabase = createRouteHandlerClient({ cookies });

  const { error } = await supabase
    .from('sourcing_needs')
    .delete()
    .eq('id', params.needId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
