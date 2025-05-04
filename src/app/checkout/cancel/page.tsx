// src/app/checkout/cancel/page.tsx
'use client';

import Link from 'next/link';

export default function CancelPage() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold text-red-600">❌ Payment Canceled</h1>
      <p className="mt-4 text-lg">Your payment was not completed. You can try again anytime.</p>

      <Link href="/dashboard">
        <button className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded">
          Back to Dashboard
        </button>
      </Link>
    </div>
  );
}
