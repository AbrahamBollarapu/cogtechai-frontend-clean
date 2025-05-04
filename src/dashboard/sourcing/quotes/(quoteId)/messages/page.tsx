'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from '@supabase/auth-helpers-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface QuoteMessage {
  id?: string;
  quote_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export default function QuoteMessagesPage() {
  const { quoteId } = useParams() as { quoteId: string };
  const supabase = createClientComponentClient();
  const session = useSession();

  const [messages, setMessages] = useState<QuoteMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('quote_messages')
        .select('*')
        .eq('quote_id', quoteId)
        .order('created_at', { ascending: true });

      if (data) setMessages(data as QuoteMessage[]);
      setLoading(false);
    };

    if (quoteId) fetchMessages();
  }, [quoteId]);

  const handleSend = async () => {
    if (!newMessage.trim() || !session?.user?.id) return;

    const { error } = await supabase.from('quote_messages').insert({
      quote_id: quoteId,
      sender_id: session.user.id,
      content: newMessage,
    });

    if (!error) {
      setMessages((prev) => [
        ...prev,
        {
          quote_id: quoteId,
          sender_id: session.user.id,
          content: newMessage,
          created_at: new Date().toISOString(),
        },
      ]);
      setNewMessage('');
    }
  };

  if (loading) return <div className="p-6">Loading messages...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">💬 Quote Messages</h1>

      <div className="space-y-3 mb-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded border bg-white dark:bg-gray-800 ${
              msg.sender_id === session?.user?.id
                ? 'border-blue-500'
                : 'border-gray-300'
            }`}
          >
            <p className="text-sm text-gray-600">{msg.content}</p>
            <p className="text-xs text-right text-gray-400">
              {new Date(msg.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}
