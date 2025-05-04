import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function AcceptInvitation() {
  const router = useRouter();
  const { token } = router.query; // Get the token from the URL
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleAccept = async () => {
    try {
      await axios.post(`/api/accept-invitation/${token}`, { password });
      setMessage('Invitation accepted! Your account is created.');
    } catch (error) {
      setMessage('Error accepting invitation.');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Accept Invitation</h2>
      <input
        type="password"
        placeholder="Set your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-2 border rounded"
      />
      <button onClick={handleAccept} className="bg-blue-600 text-white px-4 py-2 rounded mt-4">Accept Invitation</button>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
