'use client';

interface Quote {
  price: number;
  notes: string;
  email: string;
}

export default function QuoteList({
  quotes,
  loading,
}: {
  quotes: Quote[];
  loading: boolean;
}) {
  if (loading) return <p className="text-sm text-gray-500">Loading quotes...</p>;

  if (quotes.length === 0) return <p className="text-sm text-gray-500">No quotes yet.</p>;

  return (
    <div className="space-y-2">
      {quotes.map((q, i) => (
        <div key={i} className="p-2 border rounded bg-gray-50 dark:bg-gray-700">
          <p>
            💵 <strong>${q.price}</strong> — {q.notes || 'No notes'}
          </p>
          <p className="text-xs text-gray-500">From: {q.email}</p>
        </div>
      ))}
    </div>
  );
}
