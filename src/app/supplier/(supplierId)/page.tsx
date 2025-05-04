'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from '@supabase/auth-helpers-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SupplierProfilePage() {
  const { supplierId } = useParams() as { supplierId: string }; // ✅ FIXED
  const supabase = createClientComponentClient();
  const session = useSession();

  const [supplier, setSupplier] = useState<any>(null);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      const { data, error } = await supabase
        .from('users')
        .select('email, full_name, esg_verified')
        .eq('id', supplierId)
        .single();

      if (!error) setSupplier(data);

      const { data: quoteData } = await supabase
        .from('quotes')
        .select('price, notes, created_at, status')
        .eq('user_id', supplierId)
        .order('created_at', { ascending: false });

      setQuotes(quoteData || []);
      setLoading(false);
    }

    if (supplierId) fetchProfile();
  }, [supplierId]);

  const handleSendMessage = async () => {
    if (!message.trim() || !session) return;

    const { error } = await supabase.from('messages').insert({
      sender_id: session.user.id,
      recipient_id: supplierId,
      content: message,
    });

    if (!error) {
      alert('✅ Message sent!');
      setMessage('');
    } else {
      alert('❌ Failed to send message.');
    }
  };

  if (loading) return <div className="p-6">Loading supplier profile...</div>;

  if (!supplier) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold text-red-600">❌ Supplier not found</h1>
      </div>
    );
  }

  const acceptedQuotes = quotes.filter((q) => q.status === 'accepted').length;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">👤 Supplier Profile</h1>
      <p><strong>Name:</strong> {supplier.full_name || 'N/A'}</p>
      <p><strong>Email:</strong> {supplier.email}</p>
      <p>
        <strong>ESG Verified:</strong>{' '}
        {supplier.esg_verified ? (
          <span
            title="This supplier's sustainability practices are verified"
            className="text-green-600 font-semibold"
          >
            ✅ Yes
          </span>
        ) : (
          <span className="text-gray-600">❌ Not Verified</span>
        )}
      </p>
      <p className="mt-1">
        <strong>Accepted Quotes:</strong>{' '}
        <span className="text-blue-700 font-medium">{acceptedQuotes}</span>
      </p>

      <h2 className="text-2xl mt-6 font-semibold mb-2">📦 Quotes Submitted</h2>
      {quotes.length === 0 ? (
        <p className="text-gray-600">No quotes submitted by this supplier yet.</p>
      ) : (
        <ul className="space-y-4">
          {quotes.map((quote, idx) => (
            <li key={idx} className="border p-4 rounded shadow bg-white">
              <p><strong>💵 Price:</strong> ${quote.price}</p>
              <p>
                <strong>Status:</strong>{' '}
                <span
                  className={`font-semibold ${
                    quote.status === 'accepted'
                      ? 'text-green-600'
                      : 'text-yellow-600'
                  }`}
                >
                  {quote.status}
                </span>
              </p>
              {quote.notes && <p><strong>Notes:</strong> {quote.notes}</p>}
              <p className="text-sm text-gray-500">
                Submitted on: {new Date(quote.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}

      {session?.user.id !== supplierId && (
        <div className="mt-10 border-t pt-6">
          <h2 className="text-xl font-bold mb-2">✉️ Contact Supplier</h2>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message..."
            className="w-full p-2 border rounded mb-2"
            rows={4}
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Send Message
          </button>
        </div>
      )}
    </div>
  );
}
