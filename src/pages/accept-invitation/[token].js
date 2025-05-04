import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function AcceptInvitation() {
  const router = useRouter();
  const { token } = router.query;
  
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleAccept = async (e) => {
    e.preventDefault();
    const response = await fetch(`/accept-invitation/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    const data = await response.json();

    if (data.message === 'Invitation accepted, account created') {
      setMessage('Your account has been created successfully');
      // Redirect to login page
      router.push('/login');
    } else {
      setMessage('Error accepting invitation');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold">Accept Invitation</h2>
      <form onSubmit={handleAccept} className="space-y-4">
        <div>
          <label className="block font-medium">Set Your Password</label>
          <input
            type="password"
            className="w-full p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Accept Invitation
        </button>
      </form>

      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  );
}
