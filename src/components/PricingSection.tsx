'use client';

import Link from 'next/link';
import { useState } from 'react';
import WhyCogTechAISection from '@/components/WhyCogTechAISection';
import FinalCTASection from '@/components/FinalCTASection';

export default function PricingSection() {
  const [loading, setLoading] = useState(false);

  async function handleCheckout(endpoint: string) {
    try {
      setLoading(true);
      const res = await fetch(endpoint, { method: 'POST' });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to create Stripe session.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout error occurred.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="py-20 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white transition">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-6">Choose Your Plan</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          Whether you're starting your ESG journey or scaling globally, CogTechAI has a plan tailored for you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 🥈 Silver Plan */}
          <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition transform hover:-translate-y-2">
            <h3 className="text-2xl font-bold mb-4 text-indigo-600">🥈 Silver Verification</h3>
            <p className="text-4xl font-extrabold mb-4">$75</p>
            <p className="mb-6 text-gray-600 dark:text-gray-400">One-time ESG Verification Fee</p>
            <ul className="mb-6 space-y-2 text-left">
              <li>✅ Single ESG Document Review</li>
              <li>✅ ESG Badge Awarded</li>
              <li>✅ Lifetime Access to Verification</li>
            </ul>
            <button
              onClick={() => handleCheckout('/api/create-esg-verification-session')}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Get Silver Verified'}
            </button>
          </div>

          {/* 🥇 Gold Plan */}
          <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-4 border-yellow-500 transform scale-105 hover:scale-110 transition">
            <h3 className="text-2xl font-bold mb-4 text-yellow-500">🥇 Gold Subscription</h3>
            <p className="text-4xl font-extrabold mb-4">$300<span className="text-xl font-normal">/mo</span></p>
            <p className="mb-6 text-gray-600 dark:text-gray-400">Ideal for Growing Businesses</p>
            <ul className="mb-6 space-y-2 text-left">
              <li>✅ Priority ESG Verifications</li>
              <li>✅ Unlimited Sourcing Posts</li>
              <li>✅ Dedicated Support</li>
            </ul>
            <button
              onClick={() => handleCheckout('/api/create-gold-subscription-session')}
              className="w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Subscribe to Gold'}
            </button>
          </div>

          {/* 🏆 Platinum Plan */}
          <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition transform hover:-translate-y-2">
            <h3 className="text-2xl font-bold mb-4 text-rose-600">🏆 Platinum Enterprise</h3>
            <p className="text-4xl font-extrabold mb-4">$15,000<span className="text-xl font-normal">/yr</span></p>
            <p className="mb-6 text-gray-600 dark:text-gray-400">For Global Corporations</p>
            <ul className="mb-6 space-y-2 text-left">
              <li>✅ Full ESG Compliance Support</li>
              <li>✅ Priority Platform Listing</li>
              <li>✅ Executive Concierge Service</li>
            </ul>
            <button
              onClick={() => handleCheckout('/api/create-platinum-subscription-session')}
              className="w-full px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Upgrade to Platinum'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
