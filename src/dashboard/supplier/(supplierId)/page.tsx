'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SupplierProfilePage() {
  const { supplierId } = useParams() as { supplierId: string }; // ✅ Explicit type
  const supabase = createClientComponentClient();

  const [supplier, setSupplier] = useState<{
    email: string;
    full_name: string;
    esg_verified: boolean;
  } | null>(null);

  const [quotes, setQuotes] = useState<
    {
      price: number;
      timeline: string;
      comment?: string;
      created_at: string;
      status: string;
    }[]
  >([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSupplierProfile() {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email, full_name, esg_verified')
        .eq('id', supplierId)
        .single();

      const { data: quoteData, error: quoteError } = await supabase
        .from('quotes')
        .select('price, timeline, comment, created_at, status')
        .eq('user_id', supplierId)
        .order('created_at', { ascending: false });

      if (userError) console.error('User fetch error:', userError);
      if (quoteError) console.error('Quote fetch error:', quoteError);

      setSupplier(userData || null);
      setQuotes(quoteData || []);
      setLoading(false);
    }

    if (supplierId) fetchSupplierProfile();
  }, [supplierId]);

  if (loading) return <div className="p-6">Loading...</div>;

  if (!supplier) {
    return <div className="p-6 text-red-600">❌ Supplier not found</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">🧑‍💼 Supplier Profile</h1>
      <p><strong>Name:</strong> {supplier.full_name || 'N/A'}</p>
      <p><strong>Email:</strong> {supplier.email}</p>
      <p>
        <strong>ESG Status:</strong>{' '}
        {supplier.esg_verified ? (
          <span className="text-green-600 font-medium">Verified ✅</span>
        ) : (
          <span className="text-gray-600">Not Verified</span>
        )}
      </p>

      <h2 className="mt-6 text-xl font-semibold">📋 Quotes Submitted</h2>
      {quotes.length === 0 ? (
        <p className="text-gray-600">No quotes submitted yet.</p>
      ) : (
        <ul className="mt-2 space-y-4">
          {quotes.map((quote, idx) => (
            <li
              key={idx}
              className="border p-4 rounded shadow bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
            >
              <p><strong>💵 Price:</strong> ${quote.price}</p>
              <p><strong>⏳ Timeline:</strong> {quote.timeline}</p>
              {quote.comment && <p><strong>💬 Comment:</strong> {quote.comment}</p>}
              <p className="text-sm text-gray-500 dark:text-gray-400">Submitted on: {new Date(quote.created_at).toLocaleString()}</p>
              <p><strong>Status:</strong> {quote.status || 'pending'}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        <h3 className="text-lg font-semibold">📨 Contact Supplier</h3>
        <p className="text-sm text-gray-600 mb-2">(This is a placeholder — contact logic can be added later.)</p>
        <input
          type="text"
          placeholder="Your message..."
          className="border px-4 py-2 w-full rounded mb-2"
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Send</button>
      </div>
    </div>
  );
}
