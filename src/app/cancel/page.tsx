'use client';

import Link from 'next/link';

export default function CancelPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200 transition">
      <h1 className="text-4xl font-bold mb-4">⚠️ Payment Cancelled</h1>
      <p className="text-lg mb-8">Your transaction was cancelled. You can try again anytime.</p>
      <Link href="/dashboard">
        <button className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 transition">
          Return to Dashboard
        </button>
      </Link>
    </div>
  );
}
