'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

export default function QuotesInboxPage() {
  const session = useSession();
  const supabase = createClientComponentClient();

  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotes = async () => {
      if (!session) return;

      const { data, error } = await supabase
        .from('quotes')
        .select(`*, sourcing_requests(title)`)
        .in(
          'request_id',
          (
            await supabase
              .from('sourcing_requests')
              .select('id')
              .eq('email', session.user.email)
          ).data?.map((r) => r.id) || []
        );

      if (data) setQuotes(data);
      setLoading(false);
    };

    fetchQuotes();
  }, [session]);

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-indigo-700 mb-4">📥 My Quote Inbox</h1>

      {quotes.length === 0 ? (
        <p className="text-gray-600">No quotes received yet.</p>
      ) : (
        <ul className="space-y-4">
          {quotes.map((quote) => (
            <li key={quote.id} className="border p-4 rounded shadow-sm">
              <p><strong>Request:</strong> {quote.sourcing_requests.title}</p>
              <p><strong>From:</strong> {quote.supplier_email}</p>
              <p><strong>Price:</strong> {quote.price}</p>
              <p><strong>Delivery:</strong> {quote.delivery_timeline}</p>
              <p><strong>Notes:</strong> {quote.notes}</p>
              <p className="text-sm text-gray-500">
                Submitted on {new Date(quote.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}

      <Link href="/dashboard">
        <button className="mt-6 px-4 py-2 bg-green-600 text-white rounded">← Back to Dashboard</button>
      </Link>
    </div>
  );
}
