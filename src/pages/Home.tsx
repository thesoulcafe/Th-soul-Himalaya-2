import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mountain, LogIn, ArrowRight, Map, Home as HomeIcon, Wind, Compass, Flower2, ShoppingBag, ChevronRight, ChevronLeft, Edit2, Zap, Star, Briefcase, Heart } from 'lucide-react';
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

const HorizontalServiceRow = ({ services }: { services: any[] }) => {
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
          className="flex overflow-x-auto pb-8 gap-3 px-6 lg:px-[calc((100vw-80rem)/2+1.5rem)] no-scrollbar snap-x snap-mandatory scroll-smooth"
        >
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.02 }}
              className="min-w-[110px] md:min-w-[130px] snap-center"
            >
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
                      <Link 
                        to={service.id ? `/admin?tab=content&type=service&edit=${service.id}` : `/admin?tab=content&type=service`}
                        className="absolute top-2 right-2 bg-white/95 backdrop-blur shadow-lg p-1.5 rounded-full border border-forest/10 hover:bg-forest hover:text-white transition-all duration-300 z-20 group/edit"
                        title="Edit Service"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Edit2 className="h-2.5 w-2.5" />
                      </Link>
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
            </motion.div>
          ))}
          <div className="min-w-[1px] md:min-w-[1rem]" />
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user } = useAuth();
  const [services, setServices] = useState<any[]>(DEFAULT_SERVICES);

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
          .sort((a, b) => (a.order || 999) - (b.order || 999));
        setServices(dbServices);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="w-full">
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80"
            alt="Himalayan Mountains"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {/* Interactive Colored Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-forest/80 via-forest/40 to-terracotta/40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-2xl translate-y-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-2xl md:text-4xl font-heading font-bold text-white mb-4 leading-tight tracking-tight drop-shadow-lg">
              Find Your Soul in <br />
              <span className="text-terracotta italic">The Himalaya</span>
            </h1>
            <p className="text-xs md:text-sm text-white/90 mb-8 font-medium max-w-md mx-auto leading-relaxed drop-shadow-md">
              A multi-experience travel and lifestyle brand <br /> based in the mystical Parvati Valley.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 mt-12">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/services"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "w-48 bg-white text-forest hover:bg-white/90 py-6 text-base rounded-full shadow-[0_10px_30px_rgba(255,255,255,0.2)] border-2 border-transparent hover:border-white/50 transition-all duration-500"
                    )}
                  >
                    Explore more
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/about"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "w-48 text-white border-2 border-white/30 hover:border-white hover:bg-white/10 py-6 text-base rounded-full backdrop-blur-sm transition-all duration-500"
                    )}
                  >
                    Our History
                  </Link>
                </motion.div>
              </div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
              >
                {!user ? (
                  <Button 
                    onClick={() => setIsAuthModalOpen(true)}
                    className="w-48 bg-terracotta/20 hover:bg-terracotta/40 text-white border-2 border-terracotta/50 py-6 rounded-full flex items-center justify-center gap-2 transition-all duration-500 backdrop-blur-md shadow-[0_10px_40px_rgba(214,93,72,0.3)]"
                  >
                    <LogIn className="h-5 w-5" />
                    Login Now
                  </Button>
                ) : (
                  <Link 
                    to="/dashboard"
                    className="w-48 bg-terracotta/30 hover:bg-terracotta/50 text-white border-2 border-terracotta/60 py-6 rounded-full flex items-center justify-center gap-2 transition-all duration-500 backdrop-blur-md shadow-[0_10px_40px_rgba(214,93,72,0.4)]"
                  >
                    <LogIn className="h-5 w-5" />
                    Login Now
                  </Link>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mini Services Scroll (Above Final CTA) */}
      <HorizontalServiceRow services={services} />

      {/* Special Packages Section */}
      <section className="py-20 px-6 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-cream to-transparent" />
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-forest mb-4">Signature Collections</h2>
            <p className="text-forest/60 max-w-2xl mx-auto">Discover our specially crafted experiences designed for shared memories and professional breakthroughs.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Corporate Package */}
            <motion.div
              whileHover={{ y: -10 }}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="group relative h-[400px] rounded-[3rem] overflow-hidden shadow-2xl cursor-pointer"
            >
              <Link to="/tours#customize-trip" className="absolute inset-0 z-20" />
              <img 
                src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80" 
                alt="Corporate Retreat"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/20 to-transparent p-10 flex flex-col justify-end">
                <div className="bg-white/20 backdrop-blur-md w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border border-white/30 transform group-hover:rotate-12 transition-transform">
                  <Briefcase className="text-white h-6 w-6" />
                </div>
                <h3 className="text-4xl font-heading font-bold text-white mb-3">Corporate Package</h3>
                <p className="text-white/80 text-sm mb-6 max-w-sm">Elevate your team's spirit in the lap of the Himalayas. Tailor-made retreats for visionary companies.</p>
                <div className="flex items-center gap-2 text-terracotta font-black uppercase text-[10px] tracking-widest bg-white/90 w-fit px-4 py-2 rounded-full shadow-lg">
                  Customize Your Trip <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </motion.div>

            {/* Couple Package */}
            <motion.div
              whileHover={{ y: -10 }}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="group relative h-[400px] rounded-[3rem] overflow-hidden shadow-2xl cursor-pointer"
            >
              <Link to="/tours?category=Romantic" className="absolute inset-0 z-20" />
              <img 
                src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80" 
                alt="Romantic Escape"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-terracotta via-terracotta/20 to-transparent p-10 flex flex-col justify-end">
                <div className="bg-white/20 backdrop-blur-md w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border border-white/30 transform group-hover:-rotate-12 transition-transform">
                  <Heart className="text-white h-6 w-6" />
                </div>
                <h3 className="text-4xl font-heading font-bold text-white mb-3">Couple's Paradise</h3>
                <p className="text-white/80 text-sm mb-6 max-w-sm">Romantic getaways amidst pristine valleys and starlit skies. Curated for timeless bond.</p>
                <div className="flex items-center gap-2 text-forest font-black uppercase text-[10px] tracking-widest bg-white/90 w-fit px-4 py-2 rounded-full shadow-lg">
                  Romantic Packages <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-terracotta rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <Mountain className="h-64 w-64" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6"> Ready to Start Your Himalayan Story</h2>
            <p className="text-white/80 text-base mb-10 max-w-2xl mx-auto">
              Book your soulful experience today and let the mountains guide you home.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 2 }} 
                whileTap={{ scale: 0.9 }}
                className="w-full sm:w-auto"
              >
                <Link 
                  to="/services"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "w-full sm:w-auto bg-white text-terracotta hover:bg-white/90 px-10 py-7 text-xl font-black rounded-full flex items-center justify-center shadow-[0_15px_30px_rgba(255,255,255,0.2)] hover:shadow-white/40 transition-all duration-300 border-2 border-transparent hover:border-white/50"
                  )}
                >
                  Book Now
                </Link>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.1, rotate: -2 }} 
                whileTap={{ scale: 0.9 }}
                className="w-full sm:w-auto"
              >
                <Link 
                  to="/contact"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "w-full sm:w-auto text-white border-2 border-white hover:bg-white/10 px-10 py-7 text-xl font-bold rounded-full backdrop-blur-md transition-all duration-300 shadow-xl hover:shadow-white/10"
                  )}
                >
                  Contact Us
                </Link>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.1, y: -5 }} 
                whileTap={{ scale: 0.9 }}
                className="w-full sm:w-auto"
              >
                <a 
                  href="https://wa.me/917023207620"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "w-full sm:w-auto bg-[#25D366] text-white hover:bg-[#25D366]/90 px-10 py-7 text-xl font-black rounded-full flex items-center justify-center gap-4 shadow-[0_15px_30px_rgba(37,211,102,0.3)] hover:shadow-[#25D366]/50 transition-all duration-300 border-2 border-transparent hover:border-[#25D366]/50"
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

      {/* Instagram Section (Mock) */}
      <section className="py-24 bg-cream overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-4xl font-heading font-bold text-forest mb-2">Follow Our Journey</h2>
              <p className="text-forest/60">Join our community on Instagram @thesoulhimalaya</p>
            </div>
            <Button variant="outline" className="border-forest text-forest hover:bg-forest hover:text-white rounded-full">
              Follow Us
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80',
              'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=400&q=80',
              'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=80',
              'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=400&q=80'
            ].map((img, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 0.98 }}
                className="aspect-square rounded-2xl overflow-hidden shadow-md"
              >
                <img src={img} alt="Instagram Post" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
