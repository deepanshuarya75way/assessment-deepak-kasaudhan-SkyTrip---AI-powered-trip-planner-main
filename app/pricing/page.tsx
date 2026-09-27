"use client";

import { PricingTable } from '@clerk/nextjs';
import { Check, Globe, Sparkles, Star, Users } from "lucide-react";
import { motion } from "motion/react";
import React from 'react';

export default function PricingPage() {
  return (
    <div className="min-h-screen w-full bg-white dark:bg-neutral-950 relative overflow-hidden flex flex-col items-center">
      
      {/* Premium Hero Banner Section */}
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-white py-20 md:py-28 px-6 text-center">
        <div className="absolute inset-0 opacity-15"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?w=1600&q=80")', backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70" />
        <div className="relative max-w-4xl mx-auto z-10 flex flex-col items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium mb-6 text-white/90">
              <Sparkles className="w-4 h-4 text-teal-400 fill-teal-400/20" /> Simple, transparent plans
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Premium Plans
              </span>
            </h1>
            <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
              Choose the perfect plan for your travel adventures. Unlock unlimited AI-guided itinerary generations, premium offline companions, and custom features.
            </p>
          </motion.div>
        </div>
      </section>

      
      {/* Content Container */}
      <div className="w-full max-w-7xl mx-auto px-4 py-16 md:px-8 relative z-10">

        {/* Pricing Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative w-full max-w-4xl mx-auto flex justify-center mb-16 px-2 md:px-6"
        >
          {/* Glow effect behind the table */}
          <div className="absolute inset-0 bg-teal-500/10 dark:bg-teal-500/5 blur-[100px] rounded-full pointer-events-none animate-pulse" />
          <div className="relative z-10 w-full overflow-x-auto pb-4 flex justify-start md:justify-center">
            <div className="min-w-[320px] w-full flex justify-center">
              <PricingTable />
            </div>
          </div>
        </motion.div>

        {/* Features / Extra Elements */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-5xl mx-auto">
          <FeatureCard
            icon={<Globe className="w-6 h-6 text-teal-600 dark:text-teal-400" />}
            title="Global Access"
            description="Plan trips to any destination worldwide with our extensive database."
            delay={0.3}
          />
          <FeatureCard
            icon={<Sparkles className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />}
            title="AI Powered"
            description="Get personalized itineraries tailored to your preferences using advanced AI."
            delay={0.4}
          />
          <FeatureCard
            icon={<Check className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
            title="Smart Savings"
            description="Find the best deals on hotels, flights, and activities automatically."
            delay={0.5}
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="bg-white/80 dark:bg-neutral-900/60 backdrop-blur-sm border border-neutral-150 dark:border-neutral-800 rounded-2xl p-6 hover:border-teal-500/30 hover:shadow-lg dark:hover:shadow-neutral-950/50 transition-all duration-300 flex flex-col gap-4"
    >
      <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/20 flex items-center justify-center border border-teal-100/30 dark:border-teal-900/30">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mb-1.5">{title}</h3>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}