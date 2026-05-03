import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coffee, Utensils, Music, Wifi, MapPin, Clock, ArrowLeft, Heart, ExternalLink, Star, ChevronDown, Instagram, ArrowRight, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { cn } from '@/lib/utils';

const GOOGLE_BUSINESS_LINK = "https://maps.app.goo.gl/cLi9ZTs1uWphwyJCA?g_st=ic";

const MENU_CATEGORIES = [
  {
    id: "breakfast",
    title: "Mountain Breakfast",
    items: [
      { name: "Himalayan Power Bowl", price: "₹280", desc: "Local oats, sea buckthorn, wild honey & fresh yak cheese." },
      { name: "Sourdough Toast with Wild Herbs", price: "₹220", desc: "Freshly baked with local thyme-infused butter." }
    ]
  },
  {
    id: "mains",
    title: "Artisan Mains",
    items: [
      { name: "Parvati Wild Mushroom Risotto", price: "₹450", desc: "Locally foraged mushrooms and aged mountain rice." },
      { name: "Tosh Village Thali", price: "₹350", desc: "Traditional slow-cooked lentils, red rice & local greens." }
    ]
  },
  {
    id: "drinks",
    title: "Signature Brews",
    items: [
      { name: "Organic Single-Origin Coffee", price: "₹180", desc: "Ethically sourced from high-altitude estates." },
      { name: "Pink Himalayan Salt Tea", price: "₹120", desc: "Traditional buttery tea with a modern soul twist." }
    ]
  }
];

const GALLERY = [
  "https://i.postimg.cc/ZqYdmHND/IMG-8122.jpg",
  "https://images.unsplash.com/photo-1559925393-8be0ec41b50d?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1521017432531-fbd92d744264?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2000&auto=format&fit=crop"
];

export default function SoulCafe() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("breakfast");
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#faf9f6] selection:bg-terracotta selection:text-white font-montserrat">
      <SEO 
        title="The Soul Cafe | A Sanctuary for Dreamers in Tosh" 
        description="Experience the finest organic Himalayan cuisine and artisan coffee at The Soul Cafe, Tosh. A curated sanctuary for explorers in the Parvati Valley." 
        image="https://i.postimg.cc/ZqYdmHND/IMG-8122.jpg"
        type="cafe"
      />

      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden flex flex-col justify-center items-center">
        <motion.div 
          style={{ y: scrollY * 0.5 }}
          className="absolute inset-0 z-0"
        >
          <img 
            src={GALLERY[0]} 
            alt="The Soul Cafe Interior"
            className="w-full h-full object-cover brightness-75 scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[#faf9f6]" />
        </motion.div>

        {/* Global Nav-like Bar in Hero */}
        <nav className="absolute top-0 left-0 right-0 z-50 p-8 flex justify-center items-center bg-transparent">
          <div className="flex items-center gap-8 backdrop-blur-md bg-white/5 px-8 py-3 rounded-full border border-white/10">
            <a href="#menu" className="text-white text-[10px] font-black uppercase tracking-widest hover:text-terracotta transition-colors">Menu</a>
            <a href="#about" className="text-white text-[10px] font-black uppercase tracking-widest hover:text-terracotta transition-colors">Atmosphere</a>
            <a href={GOOGLE_BUSINESS_LINK} target="_blank" rel="noreferrer" className="text-white text-[10px] font-black uppercase tracking-widest hover:text-terracotta transition-colors">Reviews</a>
          </div>
        </nav>

        <div className="relative z-10 text-center px-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-terracotta font-black uppercase tracking-[0.8em] text-[10px] md:text-sm mb-6 block bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 w-fit mx-auto">
              Est. 2024 • Tosh Village
            </span>
            <h1 className="text-7xl md:text-[10rem] font-heading font-black text-white italic leading-none tracking-tighter uppercase drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]">
              The Soul <br />
              <span className="text-terracotta">Cafe</span>
            </h1>
            <p className="text-white/80 mt-12 text-sm md:text-xl font-medium tracking-widest uppercase max-w-2xl mx-auto leading-loose italic">
              A curated culinary sanctuary <span className="text-terracotta mx-2">/</span> where time slows and souls breathe.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 2 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-white/40 text-[9px] uppercase tracking-[0.4em] font-black">Explore More</span>
            <ChevronDown className="text-white/40 animate-bounce" />
          </motion.div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="about" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-10 lg:pl-10">
            <div className="space-y-8">
              <span className="text-terracotta font-black uppercase tracking-[0.4em] text-[10px] bg-forest/5 px-4 py-2 rounded-full">Organic • Local • Sustainable</span>
              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-heading font-black text-terracotta italic leading-none uppercase tracking-tighter inline-flex items-center gap-4 flex-wrap"
              >
                Find love with Soul.
                <div className="h-px flex-1 bg-terracotta/20 hidden md:block" />
              </motion.h2>
            </div>
            <p className="text-forest/60 text-lg leading-relaxed font-medium max-w-xl">
              We transcend the traditional cafe experience. Every ingredient is sourced from local farmers in Tosh and the surrounding valley, celebrating the wild harvest of the Himalayas. 
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Wifi, title: "High-Speed", desc: "Satellite connect" },
                { icon: Music, title: "Acoustic", desc: "Soulful rhythms" },
                { icon: Coffee, title: "Artisan", desc: "Fresh mountain brew" },
                { icon: Utensils, title: "Organic", desc: "Farm to table" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-forest/5 shadow-sm">
                  <div className="h-10 w-10 bg-forest/5 rounded-full flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-terracotta" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-forest">{item.title}</h4>
                    <p className="text-[9px] text-forest/40 uppercase tracking-widest">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Community & Info */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-[4rem] p-12 md:p-24 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Share2 className="w-64 h-64 text-forest" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div className="space-y-10">
              <h3 className="text-5xl font-heading font-black text-forest italic uppercase tracking-tighter">Practical <br /> <span className="text-terracotta">Details.</span></h3>
              <div className="space-y-8">
                {[
                  { icon: MapPin, value: "Upper Tosh, Parvati Valley, Himachal" },
                  { icon: Clock, value: "Daily: 8:30 AM — 11:30 PM" },
                  { icon: Heart, value: "Digital Nomad Friendly Space" }
                ].map((i, idx) => (
                  <div key={idx} className="flex items-center gap-6">
                    <div className="h-12 w-12 bg-forest rounded-2xl flex items-center justify-center text-white">
                      <i.icon className="h-6 w-6" />
                    </div>
                    <span className="text-forest/60 font-black uppercase tracking-widest text-xs">{i.value}</span>
                  </div>
                ))}
              </div>
              <div className="pt-10 flex flex-col sm:flex-row gap-4">
                 <a href={GOOGLE_BUSINESS_LINK} target="_blank" rel="noreferrer" className="flex-1">
                    <Button className="w-full h-16 bg-forest text-white hover:bg-terracotta rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-forest/20">
                       Review The Soul Cafe
                    </Button>
                 </a>
              </div>
            </div>
            
            <div className="bg-[#faf9f6] p-12 rounded-[3rem] border border-forest/5 flex flex-col justify-center text-center">
              <Instagram className="h-12 w-12 text-terracotta mx-auto mb-6" />
              <h4 className="text-2xl font-heading font-black text-forest uppercase mb-4 italic">Follow the Journey</h4>
              <p className="text-forest/60 mb-8 text-sm px-6 italic">Join our community of Himalayan dreamers for daily views and culinary inspiration.</p>
              <a href="https://www.instagram.com/thesoulhimalaya" target="_blank" rel="noreferrer" className="w-full">
                <Button variant="outline" className="w-full border-forest/20 text-forest hover:bg-forest hover:text-white rounded-xl h-14 px-6 font-black uppercase tracking-widest text-[10px] transition-all">
                  @thesoulhimalaya
                </Button>
              </a>
            </div>
          </div>

          {/* Map Integration */}
          <div className="mt-20 rounded-[3rem] overflow-hidden shadow-xl border border-forest/10 h-[400px]">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d845.7250648774778!2d77.45500010954535!3d32.017815354476205!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzLCsDAxJzA0LjEiTiA3N8KwMjcnMTkuNyJF!5e0!3m2!1sen!2sin!4v1777805669755!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true}
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="py-20 text-center">
        <div className="flex items-center justify-center gap-4 mb-8">
           <div className="h-px w-12 bg-forest/10" />
           <p className="text-forest/40 text-[9px] font-black uppercase tracking-[0.4em]">Part of The Soul Himalaya Collective</p>
           <div className="h-px w-12 bg-forest/10" />
        </div>
        <motion.h2 
          className="text-forest/10 text-8xl md:text-[15rem] font-heading font-black uppercase tracking-tighter"
          whileHover={{ opacity: 0.2 }}
        >
          Soul Cafe
        </motion.h2>
      </footer>
    </div>
  );
}
