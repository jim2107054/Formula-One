"use client";

import Link from "next/link";
import { motion } from "motion/react";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-4xl"
      >
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          Formula One
        </h1>
        <p className="text-xl text-neutral-400 mb-12">
          AI-Powered Supplementary Learning Platform for University Courses
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link href="/cms" className="group">
            <div className="p-8 rounded-2xl bg-neutral-800 border border-neutral-700 hover:border-blue-500 transition-colors h-full flex flex-col items-center">
              <div className="text-4xl mb-4">👨‍🏫</div>
              <h2 className="text-2xl font-bold mb-2 group-hover:text-blue-400">
                Instructor Portal
              </h2>
              <p className="text-neutral-500">
                Manage course materials, uploads, and content validation.
              </p>
            </div>
          </Link>

          <Link href="/chat" className="group">
            <div className="p-8 rounded-2xl bg-neutral-800 border border-neutral-700 hover:border-purple-500 transition-colors h-full flex flex-col items-center">
              <div className="text-4xl mb-4">👨‍🎓</div>
              <h2 className="text-2xl font-bold mb-2 group-hover:text-purple-400">
                Student Hub
              </h2>
              <p className="text-neutral-500">
                AI-assisted learning, chat, and resource search.
              </p>
            </div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
