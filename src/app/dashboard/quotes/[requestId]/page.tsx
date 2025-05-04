'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from '@supabase/auth-helpers-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function QuoteListByRequest() {
  const { requestId } = useParams() as { requestId: string };
  const session = useSession();
  const supabase = createClientComponentClient();

  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotes = async () => {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('request_id', requestId);

    if (error) {
      console.error('Error loading quotes:', error.message);
    } else {
      setQuotes(data || []);
    }

    setLoading(false);
  };

  const handleAccept = async (quoteId: string) => {
    const { error } = await supabase
      .from('quotes')
      .update({ status: 'accepted' })
      .eq('id', quoteId);

    if (!error) {
      alert('✅ Quote accepted!');
      fetchQuotes(); // reload updated status
    }
  };

  useEffect(() => {
    if (session) fetchQuotes();
  }, [session]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📋 Quotes for Request ID: {requestId}</h1>

      {loading ? (
        <p>Loading...</p>
      ) : quotes.length === 0 ? (
        <p>No quotes found for this request.</p>
      ) : (
        <ul className="space-y-4">
          {quotes.map((quote) => (
            <li key={quote.id} className="border p-4 rounded shadow">
              <p><strong>Price:</strong> ${quote.price}</p>
              <p><strong>Notes:</strong> {quote.notes}</p>
              <p><strong>Status:</strong> {quote.status || 'pending'}</p>

              {quote.status !== 'accepted' && (
                <button
                  onClick={() => handleAccept(quote.id)}
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
                >
                  ✅ Accept Quote
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
