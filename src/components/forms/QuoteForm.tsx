'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

interface QuoteFormProps {
  needId: string;
  userEmail: string;
  onSubmitted: () => void;
}

export default function QuoteForm({ needId, userEmail, onSubmitted }: QuoteFormProps) {
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!price) return toast.error('Please enter a valid price');
    setSubmitting(true);

    const res = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        need_id: needId,
        price: Number(price),
        notes,
        email: userEmail,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      toast.success('Quote submitted!');
      setPrice('');
      setNotes('');
      onSubmitted();
    } else {
      toast.error(data.error || 'Submission failed');
    }

    setSubmitting(false);
  };

  return (
    <div className="space-y-2 mt-4 border-t pt-4">
      <h3 className="font-bold text-sm">Submit a Quote</h3>
      <input
        type="number"
        placeholder="Price"
        className="w-full p-2 border rounded"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <textarea
        placeholder="Notes (optional)"
        className="w-full p-2 border rounded"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white px-3 py-2 rounded w-full"
        disabled={submitting}
      >
        {submitting ? 'Submitting...' : 'Submit Quote'}
      </button>
    </div>
  );
}
