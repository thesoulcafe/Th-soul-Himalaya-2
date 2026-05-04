import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { 
  Coffee, 
  MapPin, 
  Clock, 
  ArrowLeft, 
  Heart, 
  ChevronDown, 
  Instagram, 
  Calendar,
  Users,
  Compass,
  Leaf
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { cn } from '@/lib/utils';

const GOOGLE_BUSINESS_LINK = "https://share.google/yoPjK9TNhDpvBlB4X";

export default function SoulCafe() {
  const navigate = useNavigate();
  const [reservationSuccess, setReservationSuccess] = useState(false);
  
  const { scrollYProgress } = useScroll();

  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);

  const handleReservation = (e: React.FormEvent) => {
    e.preventDefault();
    setReservationSuccess(true);
    setTimeout(() => setReservationSuccess(false), 5000);
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] selection:bg-terracotta selection:text-white font-sans overflow-x-hidden">
      <SEO 
        title="The Soul Cafe | A Sanctuary for Dreamers in Tosh" 
        description="Experience the finest organic Himalayan cuisine and artisan coffee at The Soul Cafe, Tosh. A curated sanctuary for explorers in the Parvati Valley." 
        image="https://i.postimg.cc/ZqYdmHND/IMG-8122.jpg"
        type="cafe"
      />

      {/* Floating Particles Animation Overlay */}
      <div className="fixed inset-0 pointer-events-none z-20">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%",
              opacity: 0 
            }}
            animate={{ 
              y: ["0%", "100%"],
              x: i % 2 === 0 ? ["0%", "5%"] : ["0%", "-5%"],
              opacity: [0, 0.2, 0]
            }}
            transition={{ 
              duration: 10 + Math.random() * 20, 
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * i
            }}
            className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"
          />
        ))}
      </div>

      {/* Sticky Glass Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-4 py-4 md:px-8 md:py-6 flex justify-between items-center bg-white/5 backdrop-blur-lg border-b border-white/10 transition-all duration-300">
        <div className="flex items-center gap-2 md:gap-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-white hover:bg-white/10 rounded-full h-10 w-10 md:w-auto md:px-4 font-black uppercase tracking-widest text-[10px]"
          >
            <ArrowLeft className="h-4 w-4 md:mr-2" /> 
            <span className="hidden md:inline">Back</span>
          </Button>
          <div className="hidden sm:flex items-center gap-4 md:gap-8">
            <a href="#about" className="text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:text-terracotta transition-colors">Story</a>
            <a href="#reserve" className="text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:text-terracotta transition-colors">Reserve</a>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
           <a href={GOOGLE_BUSINESS_LINK} target="_blank" rel="noreferrer">
              <Button className="bg-terracotta hover:bg-white hover:text-terracotta text-white rounded-full h-9 md:h-10 px-4 md:px-6 font-black uppercase tracking-widest text-[8px] md:text-[9px] transition-all shadow-lg shadow-terracotta/20">
                Reviews
              </Button>
           </a>
        </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="relative h-screen flex flex-col justify-center items-center overflow-hidden">
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="https://i.postimg.cc/ZqYdmHND/IMG-8122.jpg" 
            alt="The Soul Cafe Atmospheric"
            className="w-full h-full object-cover brightness-[0.7]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#faf9f6]" />
        </motion.div>

        <div className="relative z-10 text-center px-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-terracotta font-black uppercase tracking-[1em] text-[10px] md:text-xs mb-8 block">
              The Soul Himalaya presents
            </span>
            <h1 className="text-7xl md:text-[8rem] font-playfair font-black text-white italic leading-[1] tracking-tighter uppercase mb-6">
              The Soul <br />
              <span className="text-terracotta">Cafe</span>
            </h1>
            <p className="text-white/80 mt-8 text-sm md:text-xl font-sans font-light tracking-[0.2em] uppercase max-w-2xl mx-auto leading-loose italic">
              Where the mountains meet your morning cup
            </p>
            
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button 
                onClick={() => document.getElementById('reserve')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-forest hover:bg-terracotta hover:text-white rounded-full px-10 py-8 font-black uppercase tracking-widest text-[11px] min-w-[200px] shadow-2xl transition-all"
              >
                Reserve a Table
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <ChevronDown className="text-white/40 animate-bounce w-8 h-8" />
          </motion.div>
        </div>
      </section>

      {/* 2. CAFÉ STORY / ABOUT */}
      <section id="about" className="py-20 md:py-32 px-6 max-w-5xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-8 md:space-y-12"
        >
          <div className="space-y-6 md:space-y-8">
            <span className="text-terracotta font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-[9px] md:text-[11px] block">
              Culinary Intelligence from the Heart of Parvati
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-playfair font-black text-forest italic leading-none uppercase tracking-tighter">
              Find love with <span className="text-terracotta">Soul.</span>
            </h2>
          </div>
          <p className="text-forest/70 text-base md:text-xl leading-relaxed font-medium max-w-2xl mx-auto italic">
            Perched on the edge of Tosh village, Soul Café is more than a culinary stop. It's a curated experience where every ingredient tells a story of the soil, the seasons, and the spirit of the Parvati Valley.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 pt-10">
            {[
              { icon: Coffee, val: "20+", label: "Specialty Brews" },
              { icon: Leaf, val: "100%", label: "Farm-to-Table" },
              { icon: Compass, val: "8,000", label: "Altitude (Ft)" }
            ].map((stat, idx) => (
              <div key={idx} className="p-6 md:p-8 bg-white rounded-[2rem] md:rounded-[2.5rem] border border-forest/5 text-center group hover:border-terracotta/30 transition-all shadow-sm">
                <stat.icon className="h-5 w-5 md:h-6 md:w-6 text-terracotta mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform" />
                <div className="text-2xl md:text-3xl font-black text-forest mb-1">{stat.val}</div>
                <div className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-forest/40">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 7. TABLE RESERVATION WIDGET */}
      <section id="reserve" className="py-20 md:py-32 bg-[#faf9f6] relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-forest/10" />
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
          <div className="space-y-8 md:space-y-10">
             <div className="space-y-4">
                <span className="text-terracotta font-black uppercase tracking-widest text-[10px] md:text-[11px]">Planning your visit?</span>
                <h2 className="text-5xl md:text-6xl font-playfair font-black text-forest italic uppercase tracking-tighter leading-none">Book Your <br /> <span className="text-terracotta">Sanctuary.</span></h2>
             </div>
             <p className="text-forest/60 text-base md:text-lg leading-relaxed">
               While we always welcome walk-ins, reserving your table ensures you have the best seat for the sunrise or the crackle of the evening fire.
             </p>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 bg-white rounded-3xl border border-forest/5 flex items-center gap-4">
                   <div className="h-10 w-10 bg-forest/5 rounded-full flex items-center justify-center shrink-0"><Calendar className="text-terracotta w-5 h-5" /></div>
                   <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest">Available</h4>
                      <p className="text-[9px] text-forest/40 uppercase tracking-widest mt-1">Daily Reservations</p>
                   </div>
                </div>
                <div className="p-6 bg-white rounded-3xl border border-forest/5 flex items-center gap-4">
                   <div className="h-10 w-10 bg-forest/5 rounded-full flex items-center justify-center shrink-0"><Users className="text-terracotta w-5 h-5" /></div>
                   <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest">Capacity</h4>
                      <p className="text-[9px] text-forest/40 uppercase tracking-widest mt-1">Up to 12 Guests</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="relative">
             <div className="bg-white p-8 sm:p-12 md:p-16 rounded-[3rem] md:rounded-[4rem] shadow-3xl border border-forest/5 relative z-10 mx-auto max-w-md lg:max-w-none">
                <AnimatePresence mode="wait">
                  {!reservationSuccess ? (
                    <motion.form 
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleReservation}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest px-2">Date</label>
                           <input type="date" required className="w-full bg-[#faf9f6] border border-forest/10 rounded-2xl p-4 focus:ring-1 focus:ring-terracotta outline-none text-sm" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest px-2">Time</label>
                           <input type="time" required className="w-full bg-[#faf9f6] border border-forest/10 rounded-2xl p-4 focus:ring-1 focus:ring-terracotta outline-none text-sm" />
                        </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest px-2">Party Size</label>
                         <select className="w-full bg-[#faf9f6] border border-forest/10 rounded-2xl p-4 focus:ring-1 focus:ring-terracotta outline-none text-sm appearance-none">
                            <option>1 Person</option>
                            <option>2 People</option>
                            <option>4 People</option>
                            <option>Group (6+)</option>
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest px-2">Special Requests</label>
                         <textarea className="w-full bg-[#faf9f6] border border-forest/10 rounded-2xl p-4 h-32 resize-none focus:ring-1 focus:ring-terracotta outline-none text-sm" placeholder="Any dietary restrictions?"></textarea>
                      </div>
                      <Button type="submit" className="w-full bg-forest text-white hover:bg-terracotta py-8 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl transition-all">
                        Confirm Availability
                      </Button>
                    </motion.form>
                  ) : (
                    <motion.div 
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-20"
                    >
                      <div className="h-20 w-20 bg-forest rounded-full flex items-center justify-center mx-auto mb-6">
                         <Heart className="text-white fill-white w-10 h-10 animate-pulse" />
                      </div>
                      <h3 className="text-3xl font-playfair italic mb-4">Request Received</h3>
                      <p className="text-forest/60 text-sm max-w-xs mx-auto italic uppercase tracking-widest leading-loose">
                        We have received your reservation request. Our team will contact you to confirm within 2 hours.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
             <div className="absolute -top-12 -right-12 h-64 w-64 bg-terracotta/5 rounded-full blur-3xl -z-0" />
          </div>
        </div>
      </section>

      {/* 8. LOCATION & HOURS */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="bg-forest rounded-[5rem] overflow-hidden relative shadow-3xl">
           <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-12 md:p-24 space-y-12">
                 <div className="space-y-4">
                    <span className="text-terracotta font-black uppercase tracking-widest text-[11px]">Finding Us</span>
                    <h2 className="text-5xl font-playfair font-black text-white italic uppercase tracking-tighter">Locate Your <br /> Soul.</h2>
                 </div>
                 
                 <div className="space-y-8">
                    <div className="flex gap-6">
                       <MapPin className="text-terracotta w-6 h-6 flex-shrink-0" />
                       <div className="space-y-2">
                          <h4 className="text-white font-black uppercase tracking-widest text-xs">The Soul Cafe</h4>
                          <p className="text-white/40 text-xs italic leading-loose">Upper Tosh Village, Parvati Valley,<br /> Himachal Pradesh 175105</p>
                       </div>
                    </div>
                    <div className="flex gap-6">
                       <Clock className="text-terracotta w-6 h-6 flex-shrink-0" />
                       <div className="space-y-2">
                          <h4 className="text-white font-black uppercase tracking-widest text-xs">Opening Hours</h4>
                          <div className="grid grid-cols-1 gap-1 text-[10px] text-white/40 font-medium uppercase tracking-[0.2em]">
                             <div className="flex justify-between py-1 border-b border-white/5"><span className="text-terracotta">Monday - Friday</span> <span>08:30 - 22:30</span></div>
                             <div className="flex justify-between py-1 border-b border-white/5"><span>Saturday - Sunday</span> <span>08:30 - 00:00</span></div>
                          </div>
                       </div>
                    </div>
                 </div>

                 <a href={GOOGLE_BUSINESS_LINK} target="_blank" rel="noreferrer" className="block">
                    <Button className="w-full h-16 bg-white text-forest hover:bg-terracotta hover:text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl transition-all">
                      Review The Soul Cafe
                    </Button>
                 </a>
              </div>
              
              <div className="h-[500px] lg:h-auto min-h-[400px]">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d845.7250648774778!2d77.45500010954535!3d32.017815354476205!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzLCsDAxJzA0LjEiTiA3N8KwMjcnMTkuNyJF!5e0!3m2!1sen!2sin!4v1777805669755!5m2!1sen!2sin" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0, filter: 'grayscale(0.5) invert(0.9) contrast(1.2)' }} 
                  allowFullScreen={true}
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
           </div>
        </div>
      </section>

      {/* Footer / Join the Journey */}
      <footer className="py-20 md:py-32 px-6 text-center bg-white overflow-hidden relative">
        <div className="max-w-4xl mx-auto space-y-12 relative z-10">
           <div className="flex items-center justify-center gap-4">
              <div className="h-px flex-1 bg-forest/10" />
              <Heart className="text-terracotta w-5 h-5 md:w-6 md:h-6 animate-pulse" />
              <div className="h-px flex-1 bg-forest/10" />
           </div>
           <h2 className="text-5xl sm:text-7xl md:text-9xl font-playfair font-black text-forest italic uppercase tracking-tighter opacity-[0.03] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none w-full whitespace-nowrap">
             The Soul Himalaya
           </h2>
           <div className="space-y-6 md:space-y-8 relative z-10">
              <h3 className="text-3xl md:text-5xl font-playfair font-bold italic tracking-tight text-forest">Join the Soul Community</h3>
              <p className="text-forest/60 text-[10px] md:text-sm uppercase tracking-[0.3em] font-medium max-w-sm mx-auto leading-relaxed italic">
                Daily mountain inspiration and curated Himalayan recipes.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-6 pt-6">
                <a href="https://www.instagram.com/thesoulhimalaya" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-16 h-14 sm:h-16 border-forest/10 text-forest hover:bg-forest hover:text-white rounded-full p-0 group overflow-hidden transition-all duration-500">
                    <Instagram className="h-5 w-5 md:h-6 md:w-6 animate-in zoom-in group-hover:scale-125 transition-transform" />
                    <span className="sm:hidden ml-2 font-black uppercase tracking-widest text-[10px]">Instagram</span>
                  </Button>
                </a>
                <a href="/" className="w-full sm:flex-1 sm:max-w-[200px]">
                  <Button className="w-full h-14 sm:h-16 bg-forest text-white hover:bg-terracotta rounded-full font-black uppercase tracking-widest text-[10px] transition-all duration-500 shadow-xl shadow-forest/10">
                    Back to Home
                  </Button>
                </a>
              </div>
           </div>
           <p className="text-forest/30 text-[8px] md:text-[9px] font-black uppercase tracking-[0.5em] pt-16 md:pt-24 italic">
             Part of The Soul Himalaya Collective • Tosh Village
           </p>
        </div>
      </footer>
    </div>
  );
}
