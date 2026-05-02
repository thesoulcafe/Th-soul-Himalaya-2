import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Coffee, Utensils, Music, Wifi, MapPin, Clock, ArrowLeft, Star, Heart, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import HeroSection from '@/components/HeroSection';
import { SEO } from '@/components/SEO';

const GALLERY = [
  "https://images.unsplash.com/photo-1559925393-8be0ec41b50d?q=80&w=2000&auto=format&fit=crop"
];

export default function SoulCafe() {
  const navigate = useNavigate();
  const [seo, setSeo] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'seo_settings'), where('path', '==', '/soul-cafe'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) setSeo(snapshot.docs[0].data());
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-[#faf9f6] selection:bg-terracotta selection:text-white">
      {seo && <SEO title={seo.title} description={seo.description} keywords={seo.keyword} />}
      
      {/* Dynamic Hero Section */}
      <HeroSection
        backgroundImage={seo?.heroImage || "https://i.postimg.cc/ZqYdmHND/IMG-8122.jpg"}
        height="h-[85vh]"
        subtitle="Authentic Himalayan Retreat"
        title={
          <div className="flex flex-col items-center">
            <span className="opacity-90">THE SOUL</span>
            <span className="text-terracotta">CAFE</span>
          </div>
        }
        description="Est. 2024 • Tosh, Parvati Valley"
        overlayClassName="bg-gradient-to-b from-black/40 via-transparent to-[#faf9f6]"
      >
        <nav className="absolute top-0 left-0 right-0 z-50 p-8 flex justify-between items-center pointer-events-none">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="pointer-events-auto text-white hover:bg-white/20 rounded-full h-12 px-6 backdrop-blur-md border border-white/20 font-black uppercase tracking-widest text-[10px]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back home
          </Button>
        </nav>
      </HeroSection>

      {/* Info Section */}
      <section className="py-32 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <div className="h-px w-20 bg-terracotta" />
            <h2 className="text-5xl font-heading font-black text-forest italic leading-none uppercase tracking-tighter">
              Where time slows <br /> <span className="text-terracotta">and souls breathe.</span>
            </h2>
            <p className="text-forest/60 text-lg leading-relaxed">
              Located in the mystical heights of Tosh, The Soul Cafe is more than just a culinary stop—it is a sanctuary for dreamers, trekkers, and digital nomads alike. We pride ourselves on creating an atmosphere of silence and resonance, serving local organic ingredients alongside world-class coffee.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-8">
               <div className="space-y-3 p-8 rounded-3xl bg-forest/5">
                  <Wifi className="h-8 w-8 text-terracotta" />
                  <h4 className="font-bold text-forest uppercase tracking-widest text-xs">Satellite Internet</h4>
                  <p className="text-forest/60 text-xs">Uninterrupted connectivity for your remote work sessions.</p>
               </div>
               <div className="space-y-3 p-8 rounded-3xl bg-forest/5">
                  <Music className="h-8 w-8 text-terracotta" />
                  <h4 className="font-bold text-forest uppercase tracking-widest text-xs">Acoustic Soul</h4>
                  <p className="text-forest/60 text-xs">Curated ambient lists and local live sessions.</p>
               </div>
            </div>
          </div>
          
          <div className="space-y-10">
            <div className="bg-forest p-12 rounded-[4rem] text-white space-y-8 shadow-2xl shadow-forest/20">
              <h3 className="text-3xl font-heading font-bold italic uppercase tracking-tight">Practical Info</h3>
              <div className="space-y-6">
                 <div className="flex items-center gap-4">
                    <MapPin className="text-terracotta h-6 w-6" />
                    <span className="text-white/80 font-medium">Upper Tosh, Parvati Valley, Himachal</span>
                 </div>
                 <div className="flex items-center gap-4">
                    <Clock className="text-terracotta h-6 w-6" />
                    <span className="text-white/80 font-medium">Daily: 8:30 AM — 11:30 PM</span>
                 </div>
                 <div className="flex items-center gap-4">
                    <Heart className="text-terracotta h-6 w-6" />
                    <span className="text-white/80 font-medium">Organic & Sustainable Practices</span>
                 </div>
              </div>
              <Button 
                className="w-full h-16 bg-white text-forest hover:bg-terracotta hover:text-white rounded-2xl font-black uppercase tracking-widest text-[11px]"
                onClick={() => navigate('/gallery')}
              >
                View Full Photo Archive
              </Button>
            </div>
          </div>
      </section>

      {/* CTA */}
      <section className="py-40 text-center px-6 bg-forest mt-20">
        <motion.div
           initial={{ scale: 0.9, opacity: 0 }}
           whileInView={{ scale: 1, opacity: 1 }}
           className="max-w-4xl mx-auto space-y-12"
        >
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              className="h-auto py-8 px-10 bg-white text-forest rounded-[2rem] font-bold uppercase tracking-widest text-sm shadow-2xl hover:scale-105 transition-all flex flex-col items-center gap-2 border-2 border-transparent hover:border-terracotta/30"
              onClick={() => navigate('/trekks?id=trekk-1&v=1777542180740')}
            >
               <span className="text-terracotta text-[10px] font-black tracking-widest">Adventure Ready</span>
               Trek Glacier Point
            </Button>
            <Button 
              className="h-20 px-20 bg-terracotta text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-2xl shadow-terracotta/40 hover:scale-105 transition-all"
              onClick={() => navigate('/#follow-our-journey-anchor')}
            >
               Follow Journey
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
