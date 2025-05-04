'use client';

import { motion } from 'framer-motion';

export default function ScrollDownIcon() {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: [0, 10, 0] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="flex justify-center mt-6"
    >
      <div className="text-3xl text-gray-500 dark:text-gray-400 animate-bounce">
        👇
      </div>
    </motion.div>
  );
}
