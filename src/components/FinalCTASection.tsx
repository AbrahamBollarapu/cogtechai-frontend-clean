'use client';

import Link from 'next/link';

export default function FinalCTASection() {
  return (
    <section className="py-16 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Lead the Future of Ethical Sourcing?
        </h2>
        <p className="text-lg mb-8">
          Get ESG Verified. Source Smarter. Grow Faster.
        </p>
        <Link href="/sign-up">
          <button className="px-8 py-4 bg-white text-green-700 font-bold rounded hover:bg-gray-100 transition">
            Get Started Now
          </button>
        </Link>
      </div>
    </section>
  );
}
