"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface NotFoundClientProps {
  title: string;
  description: string;
  backHome: string;
}

export function NotFoundClient({ title, description, backHome }: NotFoundClientProps) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center text-center max-w-md"
      >
        {/* Wordmark */}
        <Link href="/" className="mb-10 font-bold text-2xl tracking-tight" style={{ color: "#FF6B35" }}>
          Viopage
        </Link>

        {/* Large 404 */}
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          className="text-[120px] font-extrabold leading-none select-none"
          style={{ color: "#1E1E2E", opacity: 0.08 }}
          aria-hidden="true"
        >
          404
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
          className="mt-4 text-2xl font-bold tracking-tight text-[#1E1E2E]"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
          className="mt-3 text-base text-[#1E1E2E]/60 leading-relaxed"
        >
          {description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.4 }}
          className="mt-8"
        >
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ backgroundColor: "#FF6B35" }}
          >
            {backHome}
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}
