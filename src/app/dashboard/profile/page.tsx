'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';

type UserProfile = {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  tier?: string;
  is_admin?: boolean;
  subscription_active?: boolean;
};

export default function ProfilePage() {
  const supabase = createClientComponentClient();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, email, full_name, role, tier, is_admin, subscription_active')
        .single();

      if (error) {
        setError('Failed to load profile');
        console.error(error);
      } else {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [supabase]);

  const handleUpdate = async () => {
    if (!profile) return;

    setSaving(true);
    const { error } = await supabase
      .from('user_profiles')
      .update({
        full_name: profile.full_name,
        role: profile.role,
        tier: profile.tier,
      })
      .eq('id', profile.id);

    if (error) {
      setError('Failed to update profile');
      setMessage(null);
      console.error(error);
    } else {
      setError(null);
      setMessage('Profile updated successfully');
    }
    setSaving(false);
  };

  const handleChange = (field: keyof UserProfile, value: string) => {
    if (profile) {
      setProfile({ ...profile, [field]: value });
    }
  };

  const handleTierUpdate = async (tier: string) => {
    if (!profile || !profile.subscription_active) return;
    const { error } = await supabase
      .from('user_profiles')
      .update({ tier })
      .eq('id', profile.id);

    if (!error) {
      setProfile((prev) => prev ? { ...prev, tier } : prev);
      setMessage(`Tier updated to ${tier}`);
    } else {
      setMessage('Tier update failed');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">
        My Profile {profile?.is_admin && <span className="text-sm text-yellow-500 ml-2">(⭐ Admin)</span>}
      </h1>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-green-600">{message}</p>}

      {profile && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 space-y-4">
          <p><strong>Email:</strong> {profile.email}</p>

          <div>
            <label className="block mb-1 font-medium">Full Name</label>
            <input
              type="text"
              value={profile.full_name || ''}
              onChange={(e) => handleChange('full_name', e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Role</label>
            {profile.is_admin ? (
              <select
                value={profile.role || ''}
                onChange={(e) => handleChange('role', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-700"
              >
                <option value="">Select role</option>
                <option value="freelancer">Freelancer</option>
                <option value="client">Client</option>
                <option value="manufacturer">Manufacturer</option>
                <option value="admin">Admin</option>
              </select>
            ) : (
              <p className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-md">{profile.role || 'Not assigned'}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium">Tier</label>
            <p className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-md">
              {profile.tier} {profile.tier === 'Platinum' ? '💎' : profile.tier === 'Gold' ? '🥇' : profile.tier === 'Silver' ? '🥈' : ''}
            </p>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" onClick={() => handleTierUpdate('Silver')} disabled={!profile.subscription_active}>🥈 Silver</Button>
              <Button variant="outline" onClick={() => handleTierUpdate('Gold')} disabled={!profile.subscription_active}>🥇 Gold</Button>
              <Button variant="outline" onClick={() => handleTierUpdate('Platinum')} disabled={!profile.subscription_active}>💎 Platinum</Button>
            </div>
            {!profile.subscription_active && (
              <p className="text-sm text-red-500 mt-1">⚠️ Subscribe to unlock tier upgrades</p>
            )}
          </div>

          <button
            onClick={handleUpdate}
            disabled={saving}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}
