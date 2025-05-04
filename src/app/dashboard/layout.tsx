'use client';

import { useUser } from '@clerk/nextjs';  // ✅ Clerk session
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [esgVerified, setEsgVerified] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [esgUploadExists, setEsgUploadExists] = useState(false);

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/');
      return;
    }

    const fetchUserDetails = async () => {
      try {
        const res = await fetch('/api/user/details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user?.primaryEmailAddress?.emailAddress }),
        });

        const data = await res.json();
        setEsgVerified(data.esg_verified || false);
        setSubscriptionActive(data.subscription_active || false);
        setEsgUploadExists(data.esg_upload_exists || false);
      } catch (error) {
        console.error('Failed to fetch user details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.primaryEmailAddress?.emailAddress) {
      fetchUserDetails();
    }
  }, [isSignedIn, user, router]);

  const handleLogout = () => {
    router.push('/sign-out');
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        ⏳ Loading dashboard...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-green-700 mb-2">✅ Welcome to CogTechAI</h1>
      <p className="mb-4 text-gray-700">
        Logged in as: <span className="font-semibold">{user?.primaryEmailAddress?.emailAddress}</span>
      </p>

      {/* ESG & Subscription Status */}
      {esgVerified ? (
        <p className="text-green-600 text-lg mb-2">🌿 You are ESG Verified</p>
      ) : (
        <p className="text-red-600 mb-4">🌱 Not ESG Verified yet</p>
      )}

      {subscriptionActive ? (
        <p className="text-green-600 text-lg mb-4">📦 Gold Subscription Active</p>
      ) : (
        <p className="text-yellow-600 mb-4">📦 No Active Subscription</p>
      )}

      {/* ESG Upload Options */}
      {esgUploadExists ? (
        <Link href="/dashboard/esg/documents">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            View ESG Documents
          </button>
        </Link>
      ) : (
        <Link href="/dashboard/esg/upload">
          <button className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800">
            Upload ESG Document
          </button>
        </Link>
      )}

      {/* Other Actions */}
      <div className="flex flex-wrap gap-3 mt-6">
        <Link href="/dashboard/sourcing">
          <button className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">
            Post Commodity Needs
          </button>
        </Link>
        <Link href="/sourcing">
          <button className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700">
            View Public Sourcing
          </button>
        </Link>
      </div>

      {/* Logout Button */}
      <div className="mt-8">
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          🚪 Log Out
        </button>
      </div>
    </div>
  );
}
