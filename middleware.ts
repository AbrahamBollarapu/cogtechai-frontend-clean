// /middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === '/api/stripe/webhook') {
    return new Response(null, { status: 200 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/stripe/webhook'],
};
