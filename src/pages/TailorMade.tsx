import React from 'react';
import CustomizeTripCard from '@/components/CustomizeTripCard';
import { motion } from 'motion/react';

export default function TailorMade() {
  return (
    <div className="pt-32 pb-24 px-6 bg-cream min-h-screen">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-forest mb-4">Tailor-Made Journey</h1>
            <p className="text-terracotta font-medium tracking-widest uppercase text-sm">Design Your Perfect Himalayan Story</p>
          </div>
          
          <CustomizeTripCard 
            title="Tell Us Your Dream"
            description="Our local experts will craft a personalized itinerary based on your interests, pace, and preferences."
          />
        </motion.div>
      </div>
    </div>
  );
}
