'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

// ✅ Add type for route params
type Params = {
  requestId: string;
};

export default function QuotesForRequestPage() {
  const { requestId } = useParams() as Params; // ✅ Fix type issue
  const supabase = createClientComponentClient();

  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuotes() {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          id,
          price,
          timeline,
          comment,
          created_at,
          status,
          user_id,
          users ( email, full_name, esg_verified )
        `)
        .eq('request_id', requestId)
        .order('price', { ascending: true });

      if (data) setQuotes(data);
      setLoading(false);
    }

    if (requestId) fetchQuotes();
  }, [requestId]);

  const handleAccept = async (quoteId: string) => {
    setAccepting(quoteId);
    const { error } = await supabase
      .from('quotes')
      .update({ status: 'accepted' })
      .eq('id', quoteId);
    setAccepting(null);

    if (!error) {
      alert('✅ Quote accepted!');
      window.location.reload();
    }
  };

  if (loading) {
    return <div className="p-6">Loading quotes...</div>;
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
              className={`border p-4 rounded shadow bg-white text-gray-800 ${
                quote.status === 'accepted' ? 'border-green-500 bg-green-50' : ''
              }`}
            >
              <p><strong>💵 Price:</strong> ${quote.price}</p>
              <p><strong>⏳ Timeline:</strong> {quote.timeline}</p>
              {quote.comment && <p><strong>💬 Comment:</strong> {quote.comment}</p>}

              {quote.users && (
                <p className="mt-2 text-sm text-gray-600">
                  Submitted by:{' '}
                  <Link
                    href={`/supplier/${quote.user_id}`}
                    className="font-medium text-blue-600 underline"
                  >
                    {quote.users.full_name || quote.users.email || 'Unnamed User'}
                  </Link>
                  {quote.users.esg_verified && (
                    <span className="ml-2 inline-block px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                      ESG Verified ✅
                    </span>
                  )}
                </p>
              )}

              <p className="text-sm text-gray-500">
                Submitted: {new Date(quote.created_at).toLocaleString()}
              </p>
              <p><strong>📌 Status:</strong> {quote.status || 'pending'}</p>

              {quote.status !== 'accepted' ? (
                <button
                  onClick={() => handleAccept(quote.id)}
                  disabled={accepting === quote.id}
                  className={`mt-2 px-4 py-2 text-white rounded ${
                    accepting === quote.id
                      ? 'bg-gray-400 cursor-wait'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {accepting === quote.id ? 'Processing...' : '✅ Accept This Quote'}
                </button>
              ) : (
                <p className="mt-2 text-sm font-semibold text-green-700">✅ Accepted</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
