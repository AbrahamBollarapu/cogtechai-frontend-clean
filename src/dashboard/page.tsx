'use client';

import { useUser } from '@clerk/nextjs';
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
      router.push('/sign-in');
      return;
    }

    const fetchUserDetails = async () => {
      try {
        const res = await fetch('/api/user/details');
        const data = await res.json();

        if (data) {
          setEsgVerified(data.esgVerified);
          setSubscriptionActive(data.subscriptionActive);
          setEsgUploadExists(data.esgUploadExists);
        }
      } catch (error) {
        console.error('Error fetching user details', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [isSignedIn, router]);

  const handleLogout = async () => {
    router.push('/sign-out');
  };

  if (!isSignedIn || loading) {
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

      {esgVerified ? (
        <p className="text-green-600 text-lg mb-2">🌿 You are ESG Verified</p>
      ) : (
        <>
          <Link href="/dashboard/esg/upload">
            <button className="mt-2 mb-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
              Upload ESG Document
            </button>
          </Link>
        </>
      )}

      {subscriptionActive ? (
        <p className="text-green-600 text-lg mb-4">📦 Subscription Active</p>
      ) : (
        <p className="text-red-500 mb-4">No Active Subscription</p>
      )}

      <div className="flex flex-wrap gap-3 mt-6">
        <Link href="/dashboard/sourcing">
          <button className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">
            Post Commodity Needs
          </button>
        </Link>
        <Link href="/dashboard/sourcing/list">
          <button className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700">
            View My Needs
          </button>
        </Link>
        <Link href="/sourcing">
          <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
            View Public Sourcing
          </button>
        </Link>
      </div>

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
