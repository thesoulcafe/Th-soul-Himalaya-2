import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { Mountain, LogIn, ArrowRight, Map, Home as HomeIcon, Wind, Compass, Flower2, ShoppingBag, ChevronRight, ChevronLeft, Edit2, Zap, Star, Briefcase, Heart, Instagram } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/lib/AuthContext';
import { useCart } from '@/lib/CartContext';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { DEFAULT_SERVICES } from '@/constants';
import Leaderboard from '@/components/Leaderboard';
import { SEO } from '@/components/SEO';

const HorizontalServiceRow = ({ services, hasLoadedServices }: { services: any[], hasLoadedServices: boolean }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { profile } = useAuth();

  const getIcon = (title: string) => {
    const t = (title || '').toLowerCase();
    if (t.includes('tour')) return Map;
    if (t.includes('wfh')) return HomeIcon;
    if (t.includes('yoga')) return Flower2;
    if (t.includes('meditation')) return Flower2;
    if (t.includes('trekk')) return Compass;
    if (t.includes('shop')) return ShoppingBag;
    if (t.includes('adventure')) return Wind;
    return Compass;
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-12 bg-cream overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-xl md:text-2xl font-heading font-bold text-forest mb-1">Our Himalayan Experiences</h2>
          <p className="text-terracotta font-medium tracking-[0.2em] uppercase text-[9px]">Curated for your Soul</p>
        </motion.div>
      </div>

      <div className="relative group/scroll">
        <button 
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-lg text-forest opacity-0 group-hover/scroll:opacity-100 transition-all hover:bg-white active:scale-90 hidden md:block"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button 
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-lg text-forest opacity-0 group-hover/scroll:opacity-100 transition-all hover:bg-white active:scale-90 hidden md:block"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <div 
          ref={scrollContainerRef}
          className="grid grid-cols-1 sm:grid-cols-2 md:flex md:overflow-x-auto pb-8 gap-4 px-6 lg:px-[calc((100vw-80rem)/2+1.5rem)] no-scrollbar snap-x snap-mandatory scroll-smooth"
        >
          {!hasLoadedServices ? (
            [1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-full md:min-w-[130px] h-[120px] md:h-[140px] bg-forest/5 rounded-[1.5rem] animate-pulse shrink-0" />
            ))
          ) : (
            services.map((service, index) => (
              <motion.div
                key={service.id || service.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.02 }}
              className="w-full md:min-w-[130px] snap-center"
            >
              {service.link?.startsWith('http') ? (
                <a href={service.link}>
                  <Card className={cn(
                    "relative overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 rounded-[1.5rem] h-[120px] md:h-[140px] border-0 p-0 group/card",
                    index % 4 === 0 ? "bg-forest text-cream" : 
                    index % 4 === 1 ? "bg-terracotta text-white" : 
                    index % 4 === 2 ? "bg-cream text-forest border border-forest/10" : 
                    "bg-black text-white"
                  )}>
                    <div className={cn(
                      "absolute inset-0 opacity-5 group-hover/card:opacity-15 transition-opacity duration-500",
                      index % 4 === 0 ? "bg-gradient-to-br from-white to-transparent" : 
                      index % 4 === 1 ? "bg-gradient-to-br from-white to-transparent" : 
                      index % 4 === 2 ? "bg-gradient-to-br from-terracotta to-transparent" : 
                      "bg-gradient-to-br from-gold to-transparent"
                    )} />
                    
                    <CardContent className="p-3 flex flex-col items-center justify-center text-center h-full relative z-10 transition-transform duration-500 group-hover/card:scale-105">
                      {profile?.role === 'admin' && (
                        <div className="absolute top-2 right-2 z-20">
                          <Link 
                            to={service.id ? `/admin?tab=content&type=service&edit=${service.id}` : `/admin?tab=content&type=service`}
                            className="bg-white/95 backdrop-blur shadow-lg p-1.5 rounded-full border border-forest/10 hover:bg-forest hover:text-white transition-all duration-300 group/edit"
                            title="Edit Service"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Edit2 className="h-2.5 w-2.5" />
                          </Link>
                        </div>
                      )}
                      <div className={cn(
                        "mb-2 p-2.5 rounded-xl transition-all duration-500",
                        index % 4 === 2 ? "bg-forest/5" : "bg-white/10"
                      )}>
                        {React.createElement(getIcon(service.title), { className: "h-4 w-4 md:h-5 md:w-5" })}
                      </div>
                      
                      <h3 className="text-[10px] md:text-[11px] leading-tight font-heading font-bold tracking-tight line-clamp-2">
                        {service.title}
                      </h3>
                    </CardContent>
                  </Card>
                </a>
              ) : (
                <Link to={service.link || '#'}>
                  <Card className={cn(
                    "relative overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 rounded-[1.5rem] h-[120px] md:h-[140px] border-0 p-0 group/card",
                    index % 4 === 0 ? "bg-forest text-cream" : 
                    index % 4 === 1 ? "bg-terracotta text-white" : 
                    index % 4 === 2 ? "bg-cream text-forest border border-forest/10" : 
                    "bg-black text-white"
                  )}>
                    <div className={cn(
                      "absolute inset-0 opacity-5 group-hover/card:opacity-15 transition-opacity duration-500",
                      index % 4 === 0 ? "bg-gradient-to-br from-white to-transparent" : 
                      index % 4 === 1 ? "bg-gradient-to-br from-white to-transparent" : 
                      index % 4 === 2 ? "bg-gradient-to-br from-terracotta to-transparent" : 
                      "bg-gradient-to-br from-gold to-transparent"
                    )} />
                    
                    <CardContent className="p-3 flex flex-col items-center justify-center text-center h-full relative z-10 transition-transform duration-500 group-hover/card:scale-105">
                      {profile?.role === 'admin' && (
                        <div className="absolute top-2 right-2 z-20">
                          <Link 
                            to={service.id ? `/admin?tab=content&type=service&edit=${service.id}` : `/admin?tab=content&type=service`}
                            className="bg-white/95 backdrop-blur shadow-lg p-1.5 rounded-full border border-forest/10 hover:bg-forest hover:text-white transition-all duration-300 group/edit"
                            title="Edit Service"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Edit2 className="h-2.5 w-2.5" />
                          </Link>
                        </div>
                      )}
                      <div className={cn(
                        "mb-2 p-2.5 rounded-xl transition-all duration-500",
                        index % 4 === 2 ? "bg-forest/5" : "bg-white/10"
                      )}>
                        {React.createElement(getIcon(service.title), { className: "h-4 w-4 md:h-5 md:w-5" })}
                      </div>
                      
                      <h3 className="text-[10px] md:text-[11px] leading-tight font-heading font-bold tracking-tight line-clamp-2">
                        {service.title}
                      </h3>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </motion.div>
          ))
        )}
        <div className="min-w-[1px] md:min-w-[1rem]" />
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [seo, setSeo] = useState<any>(null);
  const [posts, setPosts] = useState([
    { url: 'https://www.instagram.com/p/DBititYyy66/', img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80' },
    { url: 'https://www.instagram.com/p/C-iY0yiy8XQ/', img: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=600&q=80' },
    { url: 'https://www.instagram.com/thesoulhimalaya', img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80' },
    { url: 'https://www.instagram.com/thesoulhimalaya', img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80' }
  ]);
  const { user } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [hasLoadedServices, setHasLoadedServices] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    const q = query(collection(db, 'seo_settings'), where('path', '==', '/'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) setSeo(snapshot.docs[0].data());
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'content'), where('type', '==', 'service'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const dbServices = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data().data
          }))
          .filter(service => {
            const title = (service.title || '').toLowerCase();
            return !title.includes('cafe') && !title.includes('food');
          })
          .sort((a, b) => {
            // Force Macramé Shop to the end
            const aTitle = (a.title || '').toLowerCase();
            const bTitle = (b.title || '').toLowerCase();
            if (aTitle.includes('macramé') || aTitle.includes('macrame')) return 1;
            if (bTitle.includes('macramé') || bTitle.includes('macrame')) return -1;

            const aOrder = (a.order !== undefined && a.order !== null) ? Number(a.order) : 999;
            const bOrder = (b.order !== undefined && b.order !== null) ? Number(b.order) : 999;
            return aOrder - bOrder;
          });
        setServices(dbServices);
        setHasLoadedServices(true);
      } else {
        setServices(DEFAULT_SERVICES);
        setHasLoadedServices(true);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="w-full overflow-hidden">
      {seo && <SEO title={seo.title || "The Soul Himalaya"} description={seo.description || "Discover curated retreats, adventures, and artisan crafts in the Himalayas."} keywords={seo.keyword} />}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen min-h-[600px] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.div 
            style={{ y }}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "easeOut" }}
            className="w-full h-full"
          >
            <img
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80"
              alt="Himalayan Mountains"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          </motion.div>
          {/* Advanced Layered Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-forest/40 via-transparent to-forest/90" />
          <div className="absolute inset-0 bg-black/30 mix-blend-multiply" />
          <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-forest to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-7xl px-4 sm:px-6 md:px-8 lg:px-10 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.p 
              initial={{ opacity: 0, letterSpacing: "0.5em" }}
              animate={{ opacity: 1, letterSpacing: "0.2em" }}
              transition={{ delay: 0.2, duration: 1 }}
              className="text-terracotta font-montserrat font-bold uppercase text-[10px] md:text-xs mt-0 mb-4 tracking-[0.2em] drop-shadow-sm"
            >
              Parvati Valley & Beyond
            </motion.p>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-montserrat font-extrabold text-white mb-4 leading-[0.95] tracking-tighter drop-shadow-2xl flex flex-col items-center gap-1 md:gap-2 italic">
              <span className="opacity-90 uppercase tracking-tight pr-4">FIND YOUR</span>
              <span className="text-terracotta font-playfair italic normal-case tracking-normal drop-shadow-[0_10px_10px_rgba(193,90,62,0.3)] pl-1">SOUL</span>
            </h1>

            <p className="text-sm md:text-base text-cream/80 mb-8 font-medium max-w-xl mx-auto leading-relaxed drop-shadow-md backdrop-blur-[2px]">
              A multi-experience travel and lifestyle brand based in the mystical heart of the Himalayas. Discover curated retreats, adventures, and artisan crafts.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-0">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <Link 
                  to="/services"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "group relative px-8 sm:px-10 py-6 sm:py-8 bg-white text-forest hover:text-white overflow-hidden rounded-full transition-all duration-500 shadow-2xl w-full sm:w-auto"
                  )}
                >
                  <span className="relative z-10 font-bold text-base sm:text-lg">Start Your Journey</span>
                  <div className="absolute inset-0 bg-terracotta translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <Link 
                  to="/about"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "px-8 sm:px-10 py-6 sm:py-8 text-white border-white/20 hover:border-white hover:bg-white/10 rounded-full backdrop-blur-md transition-all duration-500 font-bold text-base sm:text-lg w-full sm:w-auto"
                  )}
                >
                  Our Philosophy
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30"
        >
          <span className="text-[10px] text-white font-bold uppercase tracking-widest hidden sm:block">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white to-transparent" />
        </motion.div>
      </section>

      {/* Mini Services Scroll (Above Final CTA) */}
      <HorizontalServiceRow services={services} hasLoadedServices={hasLoadedServices} />

      {/* Special Packages Section */}
      <section className="py-32 px-6 bg-[#FDFCFB] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-forest/10 to-transparent" />
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20 px-4"
          >
            <div className="max-w-4xl mx-auto">
              <p className="text-terracotta font-bold uppercase text-[10px] md:text-xs tracking-[0.4em] mb-4">Curated Journeys</p>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-montserrat font-extrabold text-forest leading-[1.1] tracking-tight">Signature Collections</h2>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Corporate Package */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="group relative h-[500px] md:h-[600px] rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] cursor-pointer"
            >
              <Link to="/tailor-made" className="absolute inset-0 z-30" />
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-forest via-forest/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
              <img 
                src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80" 
                alt="Corporate Retreat"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 z-20 p-10 md:p-16 flex flex-col justify-end">
                <div className="mb-6 flex items-center gap-4">
                  <div className="bg-white/10 backdrop-blur-xl w-14 h-14 rounded-2xl flex items-center justify-center border border-white/20">
                    <Briefcase className="text-white h-6 w-6" />
                  </div>
                  <span className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Professional Retreats</span>
                </div>
                <h3 className="text-4xl md:text-5xl font-montserrat font-extrabold text-white mb-4 leading-tight">Corporate <br />Tour Package</h3>
                <p className="text-white/70 text-sm md:text-base mb-8 max-w-sm leading-relaxed">
                  Elevate your team's spirit in the lap of the Himalayas. Tailor-made retreats for visionary companies looking to reset and reconnect.
                </p>
                <div className="group/btn flex items-center gap-3 text-white font-bold uppercase text-[11px] tracking-widest">
                  <span className="w-12 h-[1px] bg-white/30 group-hover/btn:w-20 transition-all duration-500" />
                  Customize Your Trip
                </div>
              </div>
            </motion.div>

            {/* Couple Package */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              transition={{ delay: 0.1 }}
              className="group relative h-[500px] md:h-[600px] rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] cursor-pointer"
            >
              <Link to="/tours?category=Romantic" className="absolute inset-0 z-30" />
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-terracotta via-terracotta/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
              <img 
                src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80" 
                alt="Romantic Escape"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 z-20 p-10 md:p-16 flex flex-col justify-end">
                <div className="mb-6 flex items-center gap-4">
                  <div className="bg-white/10 backdrop-blur-xl w-14 h-14 rounded-2xl flex items-center justify-center border border-white/20">
                    <Heart className="text-white h-6 w-6" />
                  </div>
                  <span className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Soulful Connections</span>
                </div>
                <h3 className="text-4xl md:text-5xl font-montserrat font-extrabold text-white mb-4 leading-tight">Couple <br />Packages</h3>
                <p className="text-white/70 text-sm md:text-base mb-8 max-w-sm leading-relaxed">
                  Romantic getaways amidst pristine valleys and starlit skies. Curated experiences for timeless bonds in nature's most intimate settings.
                </p>
                <div className="group/btn flex items-center gap-3 text-white font-bold uppercase text-[11px] tracking-widest">
                  <span className="w-12 h-[1px] bg-white/30 group-hover/btn:w-20 transition-all duration-500" />
                  Explore Romantic Packages
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto bg-forest rounded-[3.5rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-[0_40px_80px_rgba(45,62,53,0.3)]">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            <Mountain className="h-96 w-96" />
          </div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-terracotta/20 rounded-full blur-3xl opacity-50" />
          
          <div className="relative z-10">
            <p className="text-terracotta font-bold uppercase text-[10px] md:text-xs tracking-[0.5em] mb-8">Your Journey Begins Here</p>
            <h2 className="text-4xl md:text-7xl lg:text-8xl font-montserrat font-extrabold mb-10 leading-[1.05] tracking-tight">
              Ready to <br />Start Your <br /><span className="text-terracotta italic font-playfair">Himalayan Story?</span>
            </h2>
            <p className="text-white/60 text-base md:text-lg mb-14 max-w-2xl mx-auto font-medium leading-relaxed">
              Book your soulful experience today and let the eternal mountains guide you home to your true self.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }} 
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Link 
                  to="/services"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "w-full sm:w-auto bg-white text-forest hover:bg-cream px-12 py-8 text-xl font-extrabold rounded-full flex items-center justify-center shadow-2xl transition-all duration-500"
                  )}
                >
                  Book Now
                </Link>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }} 
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <a 
                  href="https://wa.me/917878200632"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "w-full sm:w-auto bg-[#25D366] text-white hover:bg-[#25D366]/90 px-12 py-8 text-xl font-extrabold rounded-full flex items-center justify-center gap-4 shadow-xl transition-all duration-500"
                  )}
                >
                  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Section */}
      <section id="follow-our-journey" className="py-24 bg-cream overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-4xl font-heading font-bold text-forest mb-2">Follow Our Journey</h2>
                <p className="text-forest/60">Join our community on Instagram <a href="https://www.instagram.com/thesoulhimalaya" target="_blank" rel="noopener noreferrer" className="text-terracotta font-bold hover:underline">@thesoulhimalaya</a></p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 text-forest hover:bg-forest/5"
                onClick={() => {
                  setPosts(prev => [...prev.slice(1), prev[0]]);
                }}
              >
                <Zap className="h-5 w-5" />
              </Button>
            </div>
            <a 
              href="https://www.instagram.com/thesoulhimalaya" 

              target="_blank" 
              rel="noopener noreferrer" 
              className={cn(
                buttonVariants({ variant: "outline" }),
                "border-forest text-forest hover:bg-forest hover:text-white rounded-full group/insta flex items-center gap-2"
              )}
            >
              <Instagram className="h-4 w-4" />
              Follow Us
            </a>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {posts.map((post, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8 }}
                className="group/item relative aspect-square rounded-[2rem] overflow-hidden shadow-xl"
              >
                <a href={post.url} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                  <div className="absolute inset-0 bg-black/20 group-hover/item:bg-black/0 transition-colors duration-500 z-10" />
                  <img src={post.img} alt="Outdoor Adventure" className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 z-20">
                    <div className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/30">
                      <Instagram className="text-white h-6 w-6" />
                    </div>
                  </div>
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
