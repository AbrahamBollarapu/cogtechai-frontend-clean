'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

export default function QuotesForRequestPage() {
  const { requestId } = useParams() as { requestId: string };
  const supabase = createClientComponentClient();

  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);

  const fetchQuotes = async () => {
    const { data, error } = await supabase
      .from('quotes')
      .select(`
        id,
        price,
        notes,
        timeline,
        created_at,
        status,
        user_id,
        users (
          full_name,
          email,
          esg_verified
        )
      `)
      .eq('request_id', requestId)
      .order('price', { ascending: true });

    if (!error) {
      setQuotes(data || []);
    }
    setLoading(false);
  };

  const handleAccept = async (quoteId: string) => {
    setAccepting(quoteId);
    const { error } = await supabase
      .from('quotes')
      .update({ status: 'accepted' })
      .eq('id', quoteId);

    setAccepting(null);

    if (!error) {
      alert('✅ Quote accepted!');
      fetchQuotes(); // Refresh the list
    }
  };

  useEffect(() => {
    if (requestId) fetchQuotes();
  }, [requestId]);

  if (loading) {
    return <div className="p-6">⏳ Loading quotes...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📋 Quotes Received</h1>

      {quotes.length === 0 ? (
        <p>No quotes submitted for this request yet.</p>
      ) : (
        <div className="space-y-4">
          {quotes.map((quote) => (
            <div
              key={quote.id}
              className="border p-4 rounded shadow bg-white text-gray-800"
            >
              <p><strong>💰 Price:</strong> ${quote.price}</p>
              {quote.timeline && <p><strong>📆 Timeline:</strong> {quote.timeline}</p>}
              {quote.notes && <p><strong>📝 Notes:</strong> {quote.notes}</p>}

              <p className="text-sm text-gray-500 mt-2">
                Submitted: {new Date(quote.created_at).toLocaleString()}
              </p>

              {quote.users && (
                <p className="mt-1">
                  👤 <Link
                    href={`/supplier/${quote.user_id}`}
                    className="text-blue-600 underline"
                  >
                    {quote.users.full_name || quote.users.email}
                  </Link>
                  {quote.users.esg_verified && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                      ESG Verified ✅
                    </span>
                  )}
                </p>
              )}

              <p className="mt-2">
                <strong>Status:</strong>{' '}
                <span className={`font-semibold ${quote.status === 'accepted' ? 'text-green-600' : 'text-gray-700'}`}>
                  {quote.status || 'pending'}
                </span>
              </p>

              <div className="flex gap-3 mt-4">
                {quote.status !== 'accepted' && (
                  <button
                    onClick={() => handleAccept(quote.id)}
                    disabled={accepting === quote.id}
                    className={`px-4 py-2 text-white rounded ${
                      accepting === quote.id
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {accepting === quote.id ? 'Processing...' : '✅ Accept This Quote'}
                  </button>
                )}

                <Link href={`/dashboard/sourcing/quotes/${quote.id}/messages`}>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
                    💬 View Messages
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
