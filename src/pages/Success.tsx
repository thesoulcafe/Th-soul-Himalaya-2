import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ArrowRight, Compass, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { SEO } from '@/components/SEO';

export default function Success() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-forest flex items-center justify-center p-6 relative overflow-hidden">
      <SEO 
        title="Enquiry Sent | The Soul Himalaya" 
        description="Your tailor-made mountain journey has begun."
      />

      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-terracotta/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 max-w-2xl w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-12 md:p-20 text-center shadow-2xl"
      >
        <motion.div
           initial={{ scale: 0, rotate: -15 }}
           animate={{ scale: 1, rotate: 0 }}
           transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.2 }}
           className="w-24 h-24 bg-terracotta rounded-full flex items-center justify-center mx-auto mb-10 shadow-xl shadow-terracotta/20"
        >
          <CheckCircle2 className="h-12 w-12 text-white" />
        </motion.div>

        <h1 className="text-4xl md:text-6xl font-playfair font-black text-white italic leading-tight mb-6">
          Your Soul Journey <br />
          <span className="text-terracotta">Has Begun.</span>
        </h1>
        
        <p className="text-white/60 text-lg md:text-xl leading-relaxed mb-12 max-w-md mx-auto italic">
          Namaste! Your enquiry has been received. Our digital sherpas are already mapping out your custom trail based on your soul's desires.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Button 
            onClick={() => navigate('/services')}
            className="bg-white text-forest hover:bg-terracotta hover:text-white rounded-full px-10 py-8 font-black uppercase tracking-widest text-[11px] shadow-2xl transition-all group"
          >
            <Compass className="h-4 w-4 mr-2 group-hover:rotate-45 transition-transform" />
            Explore Experiences
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/')}
            className="border-white/20 text-white hover:bg-white/10 rounded-full px-10 py-8 font-black uppercase tracking-widest text-[11px] backdrop-blur-md transition-all"
          >
            Back to Home
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        <div className="mt-16 flex items-center justify-center gap-4 text-white/20">
          <Sparkles className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Expect a signal within 24 hours</span>
          <Sparkles className="h-4 w-4" />
        </div>
      </motion.div>
    </div>
  );
}
