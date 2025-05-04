'use client';

import { useState, useEffect } from 'react';
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion'; // ✅ Import motion

import DarkModeToggle from '@/components/DarkModeToggle';
import WelcomeSection from '@/components/WelcomeSection';
import IntroSection from '@/components/IntroSection';
import PricingSection from '@/components/PricingSection';
import WhyCogTechAISection from '@/components/WhyCogTechAISection';
import FinalCTASection from '@/components/FinalCTASection';
import ScrollDownIcon from '@/components/ScrollDownIcon';
import Footer from '@/components/Footer';
import BackToTopButton from '@/components/BackToTopButton';
import LoadingOverlay from '@/components/LoadingOverlay';
import Toast from '@/components/Toast'; // ✅ Toast import

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const correctPassword = 'cogtech@2025'; // 🔒 Your password

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === correctPassword) {
      setIsAuthenticated(true);
      setToastMessage('✅ Access Granted');
    } else {
      setToastMessage('❌ Incorrect password. Please try again.');
    }
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white transition relative">
        {/* Dark Mode Toggle */}
        <DarkModeToggle />

        {/* 🪄 Password Card with Entrance Animation */}
        <motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
  className="p-8 max-w-sm w-full rounded-lg shadow-lg bg-white/30 dark:bg-gray-800/30 backdrop-blur-md backdrop-saturate-150 border border-gray-300 dark:border-gray-700"
>
          <h2 className="text-2xl font-bold text-center mb-6">🔒 Enter Password to Access</h2>
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="Enter Password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="px-4 py-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Unlock
            </button>
          </form>
        </motion.div>

        {/* Toast for feedback */}
        {toastMessage && (
          <Toast
            message={toastMessage}
            type={toastMessage.includes('Granted') ? 'success' : 'error'}
            onClose={() => setToastMessage(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white transition relative px-4 sm:px-6">      <DarkModeToggle />
      <WelcomeSection />
      <IntroSection />
      <ScrollDownIcon />
      <PricingSection />
      <WhyCogTechAISection />
      <FinalCTASection />

      {/* Sign In Box */}
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded shadow mt-16 mx-4">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.jpg"
            alt="CogTechAI Logo"
            width={160}
            height={60}
            priority
            className="rounded"
          />
        </div>

        <h2 className="text-2xl font-bold text-center mb-4">Your Gateway to Ethical Sourcing</h2>
        <p className="text-sm text-center mb-6 text-gray-500 dark:text-gray-400">
          Join the ESG revolution today.
        </p>

        <SignedOut>
          <SignInButton mode="modal">
            <button
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              Sign In with Magic Link
            </button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <div className="flex flex-col items-center space-y-4">
            <UserButton afterSignOutUrl="/" />
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-6 w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Go to Dashboard
            </button>
          </div>
        </SignedIn>
      </div>

      <Footer />
      <BackToTopButton />
    </div>
  );
}
