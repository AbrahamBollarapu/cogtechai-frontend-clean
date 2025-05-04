'use client';

import { motion } from 'framer-motion';

export default function IntroSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="text-center mt-10 px-6 md:px-8"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-green-700 dark:text-green-400 mb-4">
        Transforming Sourcing with ESG and AI
      </h2>
      <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
        CogTechAI empowers companies to hire ethically, source responsibly, and achieve ESG compliance
        through AI-driven verification, insights, and a trusted marketplace.
      </p>
    </motion.div>
  );
}
