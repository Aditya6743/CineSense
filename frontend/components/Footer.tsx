"use client";

import { motion } from "framer-motion";

export default function Footer() {
  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="relative overflow-hidden border-t border-white/10 bg-black pt-32 pb-16"
      id="how-it-works"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/4 h-[1px] bg-white shadow-[0_0_20px_rgba(255,255,255,1)]" />

      <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
        <div className="md:col-span-2">
          <h2 className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-6">
            CineSense.
          </h2>
          <p className="text-gray-400 max-w-sm leading-relaxed">
            The next generation of movie discovery. Powered by Machine Learning, designed for humans.
          </p>
        </div>

        <div>
          <h4 className="font-bold mb-6 text-white tracking-widest uppercase text-sm">Navigate</h4>
          <ul className="space-y-4 text-gray-400">
            {[
              { name: 'Home', href: '/' },
              { name: 'Trending', href: '#trending' },
              { name: 'How it Works', href: '/#features' },
            ].map((link) => (
              <li key={link.name}>
                <a href={link.href} data-magnetic="true" className="hover:text-emerald-400 transition-colors inline-block cursor-none">
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6 text-white tracking-widest uppercase text-sm">More</h4>
          <ul className="space-y-4 text-gray-400">
            {[
              { name: 'FAQ', href: '#faq' },
              { name: 'Explore', href: '/explore' },
              { name: 'License', href: '/license.txt' },
            ].map((link) => (
              <li key={link.name}>
                <a href={link.href} data-magnetic="true" className="hover:text-emerald-400 transition-colors inline-block cursor-none">
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-32 text-center relative z-10 flex flex-col items-center justify-center gap-2">
        <p className="text-gray-600 font-mono text-sm">
          &copy; {new Date().getFullYear()} CineSense. All rights reserved.
        </p>
        <p className="text-gray-500 font-mono text-sm">
          Developed by{" "}
          <a
            href="https://instagram.com/aditya._tripathi._"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-cyan-400 transition-colors underline decoration-emerald-400/30 underline-offset-4 cursor-none"
            data-magnetic="true"
          >
            Aditya
          </a>
        </p>
      </div>

      {/* Massive Background Text */}
      <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 text-[15vw] font-black text-white/[0.02] pointer-events-none select-none whitespace-nowrap">
        CINESENSE
      </div>
    </motion.footer>
  );
}