'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 5000); // Auto-redirect to dashboard after 5 seconds
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200 transition">
      <h1 className="text-4xl font-bold mb-4">🎉 Payment Successful!</h1>
      <p className="text-lg mb-8">Thank you for your purchase. Redirecting to your dashboard...</p>
      <Link href="/dashboard">
        <button className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition">
          Go to Dashboard Now
        </button>
      </Link>
    </div>
  );
}
