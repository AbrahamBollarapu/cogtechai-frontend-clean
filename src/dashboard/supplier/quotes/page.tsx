'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

export default function SupplierQuotesPage() {
  const session = useSession();
  const supabase = createClientComponentClient();

  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotes = async () => {
      if (!session) return;

      const { data, error } = await supabase
        .from('quotes')
        .select(`
          id, price, notes, created_at,
          sourcing_requests (title),
          buyers:profiles (email)
        `)
        .eq('supplier_email', session.user.email)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching quotes:', error.message);
      } else {
        setQuotes(data || []);
      }

      setLoading(false);
    };

    fetchQuotes();
  }, [session]);

  if (!session) {
    return <p className="p-6 text-red-600">⚠️ You must be logged in to view this page.</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-indigo-700">📨 Quotes You’ve Received</h1>
      {loading ? (
        <p>Loading...</p>
      ) : quotes.length === 0 ? (
        <p>No quotes found.</p>
      ) : (
        <ul className="space-y-4">
          {quotes.map((quote) => (
            <li key={quote.id} className="border p-4 rounded shadow">
              <p><strong>Request:</strong> {quote.sourcing_requests?.title || 'N/A'}</p>
              <p><strong>Offered Price:</strong> ${quote.price}</p>
              <p><strong>Buyer:</strong> {quote.buyers?.email || 'N/A'}</p>
              <p><strong>Notes:</strong> {quote.notes}</p>
              <p className="text-sm text-gray-500">Submitted on: {new Date(quote.created_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
