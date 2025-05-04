'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('⚠️ Global error caught:', error);
  }, [error]);

  return (
    <html>
      <body className="h-screen flex flex-col justify-center items-center bg-gray-50 text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-2">500 - Something went wrong</h1>
        <p className="text-gray-600 mb-4">We encountered an unexpected error. Please try again.</p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          🔁 Try Again
        </button>
      </body>
    </html>
  );
}
