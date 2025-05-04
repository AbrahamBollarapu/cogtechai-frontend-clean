'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useSession } from '@supabase/auth-helpers-react';

export default function InviteUser() {
  const supabase = createClientComponentClient();
  const session = useSession();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState('freelancer');
  const [tier, setTier] = useState('Silver');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Handle the invitation process
  const handleInvite = async () => {
    if (!email) {
      setMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setMessage('');

    // Create new user entry with is_invited flag
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([{ email, role, tier, is_invited: true }]);

    if (error) {
      setMessage('Error sending invite. Please try again.');
      setLoading(false);
      return;
    }

    // Send invitation email logic (use Supabase Functions or third-party email service like SendGrid)
    // Note: The email sending service should be set up separately.

    setMessage('Invitation sent successfully!');
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Invite New User</h2>

      {message && <p className="text-sm text-green-600">{message}</p>}

      <div className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address"
          className="p-2 w-full border rounded-md"
        />

        <div>
          <label className="font-medium">Role:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="p-2 w-full border rounded-md"
          >
            <option value="freelancer">Freelancer</option>
            <option value="client">Client</option>
            <option value="manufacturer">Manufacturer</option>
          </select>
        </div>

        <div>
          <label className="font-medium">Tier:</label>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            className="p-2 w-full border rounded-md"
          >
            <option value="Silver">Silver</option>
            <option value="Gold">Gold</option>
            <option value="Platinum">Platinum</option>
          </select>
        </div>

        <button
          onClick={handleInvite}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
          disabled={loading}
        >
          {loading ? 'Sending invite...' : 'Send Invitation'}
        </button>
      </div>
    </div>
  );
}
