"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import MagneticButton from "./MagneticButton";
import Tilt from "react-parallax-tilt";

const tiers = [
  {
    name: "Basic",
    price: "Free",
    description: "Perfect for casual movie watchers.",
    features: ["Personalized AI Recommendations", "Up to 50 searches per month", "Standard response time", "Community access"],
    featured: false,
  },
  {
    name: "Pro",
    price: "$9.99",
    description: "For true cinephiles who want the best.",
    features: ["Unlimited AI searches", "Instant 0ms latency", "Early access to new models", "Priority support", "Custom watchlists"],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "API access for your own applications.",
    features: ["Full API access", "Dedicated account manager", "99.9% Uptime SLA", "Custom AI model tuning"],
    featured: false,
  }
];

export default function Pricing() {
  return (
    <section className="relative w-full py-32 px-6">
      <div className="mx-auto max-w-7xl">
        
        <div className="mb-20 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl font-black tracking-tight"
          >
            Simple, Transparent <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Pricing</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-gray-400"
          >
            Upgrade your discovery engine. No hidden fees.
          </motion.p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Tilt
                tiltMaxAngleX={5}
                tiltMaxAngleY={5}
                glareEnable={true}
                glareMaxOpacity={0.15}
                glareColor="#10b981"
                glarePosition="all"
                transitionSpeed={1500}
                className="h-full"
              >
                <div className={`relative h-full rounded-[2.5rem] p-8 flex flex-col backdrop-blur-2xl transition-all duration-300 ${tier.featured ? 'bg-emerald-950/20 border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.15)] animated-border' : 'bg-white/5 border border-white/10'}`}>
                  
                  {tier.featured && (
                    <div className="absolute -top-4 left-0 right-0 flex justify-center">
                      <span className="rounded-full bg-emerald-500 px-4 py-1 text-xs font-bold uppercase tracking-widest text-black shadow-lg shadow-emerald-500/50">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <h3 className="text-2xl font-bold text-white">{tier.name}</h3>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-5xl font-black">{tier.price}</span>
                    {tier.price !== "Free" && tier.price !== "Custom" && <span className="text-gray-400">/mo</span>}
                  </div>
                  <p className="mt-4 text-sm text-gray-400">{tier.description}</p>
                  
                  <div className="my-8 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  
                  <ul className="flex-1 space-y-4">
                    {tier.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-3 text-sm text-gray-300">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <MagneticButton className={`mt-8 w-full rounded-2xl py-4 font-bold transition-all ${tier.featured ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                    Get Started
                  </MagneticButton>
                </div>
              </Tilt>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
