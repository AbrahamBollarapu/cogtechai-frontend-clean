import React, { useState } from 'react';
import { submitQuote } from '../utils/api'; // Adjust the import as per your folder structure

const QuoteForm = ({ needId }) => {
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newQuote = {
        need_id: needId,
        price,
        notes,
        email,
      };
      await submitQuote(newQuote); // Make API call to submit quote
      alert('Quote submitted successfully');
    } catch (error) {
      alert('Error submitting quote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <textarea
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Quote'}
      </button>
    </form>
  );
};

export default QuoteForm;
