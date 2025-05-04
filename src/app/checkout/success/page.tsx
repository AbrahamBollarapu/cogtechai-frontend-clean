// src/app/checkout/success/page.tsx
'use client';

import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold text-green-600">✅ Payment Successful!</h1>
      <p className="mt-4 text-lg">Thank you for your purchase. Your subscription or verification is now active.</p>

      <Link href="/dashboard">
        <button className="mt-6 px-6 py-2 bg-emerald-600 text-white rounded">
          Go to Dashboard
        </button>
      </Link>
    </div>
  );
}
