'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import DarkModeToggle from '@/components/DarkModeToggle'; // 🌙 Dark Mode Toggle

export default function DashboardPage() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [esgVerified, setEsgVerified] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [esgUploadExists, setEsgUploadExists] = useState(false);
  const [paying, setPaying] = useState(false);

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

  const handleCheckout = async (endpoint: string) => {
    setPaying(true);
    try {
      const res = await fetch(endpoint, { method: 'POST' });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to create Stripe session.');
      }
    } catch (error) {
      console.error('Checkout Error:', error);
      alert('Checkout error!');
    } finally {
      setPaying(false);
    }
  };

  if (!isSignedIn || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white transition">
        <DarkModeToggle />
        <div className="text-center text-lg">⏳ Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white transition relative">
      {/* 🌙 Dark Mode Toggle */}
      <DarkModeToggle />

      <div className="p-6 max-w-4xl w-full mt-10">
        <h1 className="text-3xl font-bold text-green-700 dark:text-green-400 mb-2">✅ Welcome to CogTechAI</h1>
        <p className="mb-6 text-gray-700 dark:text-gray-300">
          Logged in as: <span className="font-semibold">{user?.primaryEmailAddress?.emailAddress}</span>
        </p>

        {/* ESG & Subscription Status */}
        {esgVerified ? (
          <p className="text-green-600 dark:text-green-400 text-lg mb-2">🌿 You are ESG Verified</p>
        ) : (
          <div className="flex flex-col gap-2 mb-4">
            <Link href="/dashboard/esg/upload">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                Upload ESG Document
              </button>
            </Link>
            {!esgUploadExists && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                📄 No ESG document uploaded yet.
              </p>
            )}
          </div>
        )}

        {subscriptionActive ? (
          <p className="text-green-600 dark:text-green-400 text-lg mb-4">📦 Subscription Active</p>
        ) : (
          <p className="text-red-500 dark:text-red-400 mb-4">❌ No Active Subscription</p>
        )}

        {/* 💳 Payment Options Section */}
        <div className="flex flex-col gap-4 mt-8">
          {/* 🥈 Silver ESG Verification */}
          <button
            onClick={() => handleCheckout('/api/create-esg-verification-session')}
            disabled={paying}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            🥈 Silver ESG Verification - Pay $75
          </button>

          {/* 🥇 Gold Monthly Subscription */}
          <button
            onClick={() => handleCheckout('/api/create-gold-subscription-session')}
            disabled={paying}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
          >
            🥇 Gold Subscription - $300/Month
          </button>

          {/* 🏆 Platinum Enterprise Subscription */}
          <button
            onClick={() => handleCheckout('/api/create-platinum-subscription-session')}
            disabled={paying}
            className="px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700 disabled:opacity-50"
          >
            🏆 Platinum Subscription - $15,000/Year
          </button>
        </div>

        {/* 📦 Actions */}
        <div className="flex flex-wrap gap-3 mt-10">
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

        {/* 🚪 Logout */}
        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            🚪 Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
