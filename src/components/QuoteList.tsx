// File: /src/components/QuoteList.tsx
'use client';

interface Quote {
  price: number;
  notes: string;
  email: string;
}

interface Props {
  quotes: Quote[];
  loading: boolean;
}

export default function QuoteList({ quotes, loading }: Props) {
  if (loading) {
    return <p>⏳ Loading quotes...</p>;
  }

  if (quotes.length === 0) {
    return <p className="text-sm text-gray-600">No quotes yet.</p>;
  }

  return (
    <div className="space-y-2 text-sm text-gray-800">
      {quotes.map((q, index) => (
        <div key={index} className="p-3 border rounded bg-gray-50 dark:bg-gray-700 dark:text-white">
          💵 <strong>${q.price}</strong> – {q.notes || 'No notes'}
          <div className="text-gray-500 text-xs">From: {q.email}</div>
        </div>
      ))}
    </div>
  );
}
