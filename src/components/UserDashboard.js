import React, { useState, useEffect } from 'react';
import { fetchQuotesByNeed } from '../utils/api'; // Adjust the import path if needed

const UserDashboard = ({ needId }) => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuotes = async () => {
      try {
        const data = await fetchQuotesByNeed(needId);
        setQuotes(data);
      } catch (error) {
        console.error('Error fetching quotes', error);
      } finally {
        setLoading(false);
      }
    };

    loadQuotes();
  }, [needId]);

  if (loading) return <p>Loading quotes...</p>;

  return (
    <div>
      <h1>Quotes for Need ID: {needId}</h1>
      <ul>
        {quotes.map((quote) => (
          <li key={quote.id}>
            <strong>Price:</strong> {quote.price} - <strong>Notes:</strong> {quote.notes} - <strong>Email:</strong> {quote.email}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserDashboard;
