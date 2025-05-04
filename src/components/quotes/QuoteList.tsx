'use client';

import React from 'react';

interface Quote {
  price: number;
  notes?: string;
  email: string;
}

interface Props {
  quotes: Quote[];
  loading: boolean;
}

export default function QuoteList({ quotes, loading }: Props) {
  if (loading) {
    return <p className="text-sm text-gray-500">Loading quotes...</p>;
  }

  if (quotes.length === 0) {
    return <p className="text-sm text-gray-500">No quotes yet.</p>;
  }

  return (
    <div className="space-y-2 mt-2 text-sm text-gray-800 dark:text-gray-100">
      {quotes.map((q, index) => (
        <div
          key={index}
          className="p-3 rounded border bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
        >
          💵 <strong>${q.price}</strong> – {q.notes || 'No notes'}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            From: {q.email}
          </div>
        </div>
      ))}
    </div>
  );
}
