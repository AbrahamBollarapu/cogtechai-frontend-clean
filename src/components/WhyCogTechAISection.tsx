'use client';

import { motion } from 'framer-motion';

export default function WhyCogTechAISection() {
  return (
    <section className="py-20 bg-white dark:bg-gray-950 text-gray-800 dark:text-white transition">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-12">
          Why Choose <span className="text-green-600">CogTechAI?</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="p-6 rounded-lg shadow bg-gray-50 dark:bg-gray-800 hover:shadow-lg transition"
          >
            <h3 className="text-xl font-bold mb-4">✅ ESG Verification Made Simple</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get verified quickly with AI-assisted document review and expert validation.
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="p-6 rounded-lg shadow bg-gray-50 dark:bg-gray-800 hover:shadow-lg transition"
          >
            <h3 className="text-xl font-bold mb-4">📈 Boost Business Credibility</h3>
            <p className="text-gray-600 dark:text-gray-400">
              ESG badges improve client trust and open doors to global sourcing opportunities.
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="p-6 rounded-lg shadow bg-gray-50 dark:bg-gray-800 hover:shadow-lg transition"
          >
            <h3 className="text-xl font-bold mb-4">🤝 Ethical Sourcing Hub</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Connect with responsible manufacturers, suppliers, and freelancers verified for ESG.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
