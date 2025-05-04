'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from '@supabase/auth-helpers-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function QuoteMessagesPage() {
  const params = useParams() as { quoteId: string };
  const quoteId = params.quoteId;
  const session = useSession();
  const supabase = createClientComponentClient();

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // ✅ Fetch messages for the quote
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('id, sender_id, recipient_id, content, created_at')
      .eq('quote_id', quoteId)
      .order('created_at', { ascending: true });

    if (data) setMessages(data);
    setLoading(false);
  };

  useEffect(() => {
    if (quoteId && session?.user?.id) {
      fetchMessages();
    }
  }, [quoteId, session]);

  // ✅ Send new message
  const handleSend = async () => {
    if (!newMessage.trim() || !session?.user) return;

    const senderId = session.user.id;

    // Optionally, fetch quote to determine recipient_id
    const { data: quote } = await supabase
      .from('quotes')
      .select('user_id')
      .eq('id', quoteId)
      .single();

    const recipientId = quote?.user_id === senderId ? null : quote?.user_id; // Adjust as needed

    const { error } = await supabase.from('messages').insert({
      quote_id: quoteId,
      sender_id: senderId,
      recipient_id: recipientId,
      content: newMessage,
    });

    if (!error) {
      setNewMessage('');
      fetchMessages();
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">💬 Messages for Quote</h1>

      {loading ? (
        <p>Loading messages...</p>
      ) : messages.length === 0 ? (
        <p>No messages yet.</p>
      ) : (
        <ul className="space-y-4 mb-6">
          {messages.map((msg) => (
            <li key={msg.id} className={`p-4 rounded shadow ${msg.sender_id === session?.user?.id ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <p className="mb-1">{msg.content}</p>
              <p className="text-sm text-gray-500">{new Date(msg.created_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}

      {/* Message Input */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border p-2 rounded"
        />
        <button
          onClick={handleSend}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}
