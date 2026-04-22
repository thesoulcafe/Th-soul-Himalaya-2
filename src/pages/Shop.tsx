import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, ArrowRight, Hammer, Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Shop() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center pt-24 pb-12 px-6 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.05, 0.1, 0.05]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-terracotta/20 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, -45, 0],
            opacity: [0.05, 0.08, 0.05]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-forest/20 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-4xl w-full text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="inline-block p-6 rounded-3xl bg-white shadow-2xl mb-12 relative"
        >
          <div className="absolute -top-4 -right-4 bg-terracotta text-white p-2 rounded-full shadow-lg animate-bounce">
            <Sparkles className="h-6 w-6" />
          </div>
          <ShoppingBag className="h-20 w-20 text-forest" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, tracking: "0.2em" }}
          animate={{ opacity: 1, tracking: "0.4em" }}
          transition={{ delay: 0.1 }}
          className="text-terracotta font-bold uppercase text-xs mb-6"
        >
          Artisan Craftsmanship
        </motion.p>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-8xl font-heading font-extrabold text-forest mb-8 tracking-tight leading-[0.95]"
        >
          Something <br />
          <span className="text-terracotta italic font-playfair normal-case">Beautiful</span> <br />
          <span className="uppercase text-4xl md:text-6xl text-forest/40">Coming Soon</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-base md:text-lg text-forest/60 mb-12 max-w-2xl mx-auto font-medium leading-relaxed"
        >
          Our artisans in Tosh are busy weaving the spirit of the Himalayas into every knot. 
          The Macramé collection featuring wall hangings, plant holders, and more will be available soon.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Button 
            className="bg-forest hover:bg-forest/90 text-white px-10 py-7 rounded-full text-base font-bold shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3 h-auto min-w-[200px]"
          >
            Notify Me
            <ArrowRight className="h-5 w-5" />
          </Button>
          <Link 
            to="/services"
            className="text-forest font-bold hover:text-terracotta transition-colors flex items-center gap-2 group px-6 py-3"
          >
            Explore Other Experiences
            <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Feature Highlights */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { icon: Hammer, label: "Handcrafted", detail: "100% Traditional" },
            { icon: Heart, label: "Soulful", detail: "Made in Tosh Village" },
            { icon: ShoppingBag, label: "Sustainable", detail: "Eco-Friendly Materials" }
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + (i * 0.1) }}
              className="p-8 rounded-[2rem] bg-white/40 backdrop-blur-sm border border-white transition-all duration-300 hover:bg-white hover:shadow-xl group cursor-default"
            >
              <div className="mb-4 flex justify-center">
                <item.icon className="h-8 w-8 text-terracotta transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />
              </div>
              <h3 className="font-bold text-forest mb-1 uppercase tracking-widest text-[10px]">{item.label}</h3>
              <p className="text-forest/50 text-xs font-semibold">{item.detail}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Decorative Brand Text */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 1 }}
        className="mt-24"
      >
        <span className="text-[10px] font-montserrat font-black uppercase tracking-[0.6em] text-forest">THE SOUL HIMALAYA</span>
      </motion.div>
    </div>
  );
}
