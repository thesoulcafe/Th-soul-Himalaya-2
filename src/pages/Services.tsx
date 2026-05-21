import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Map, Coffee, Home as HomeIcon, Wind, Compass, Flower2, ShoppingBag, Star, Edit2, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { DEFAULT_SERVICES } from '@/constants';

export default function Services() {
  const { profile } = useAuth();
  const [services, setServices] = useState<any[]>([]);

  const getIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('tour')) return Map;
    if (t.includes('wfh') || t.includes('workation')) return HomeIcon;
    if (t.includes('meditation')) return Sparkles;
    if (t.includes('yoga')) return Flower2;
    if (t.includes('trekk')) return Compass;
    if (t.includes('shop')) return ShoppingBag;
    if (t.includes('adventure')) return Wind;
    return Compass;
  };

  useEffect(() => {
    const q = query(collection(db, 'content'), where('type', '==', 'service'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbServices = snapshot.empty ? [] : snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data().data
        }))
        .filter(service => {
          const title = (service.title || '').toLowerCase();
          return !title.includes('food') && !title.includes('photography & cafe narrative');
        })
        .sort((a, b) => {
          // Force Macramé Shop to the end
          const aTitle = (a.title || '').toLowerCase();
          const bTitle = (b.title || '').toLowerCase();
          const aIsMacrame = aTitle.includes('macramé') || aTitle.includes('macrame');
          const bIsMacrame = bTitle.includes('macramé') || bTitle.includes('macrame');
          if (aIsMacrame && !bIsMacrame) return 1;
          if (!aIsMacrame && bIsMacrame) return -1;

          const aAvail = a.isAvailable !== false;
          const bAvail = b.isAvailable !== false;
          if (aAvail && !bAvail) return -1;
          if (!aAvail && bAvail) return 1;

          const aOrder = (a.order !== undefined && a.order !== null) ? Number(a.order) : 999;
          const bOrder = (b.order !== undefined && b.order !== null) ? Number(b.order) : 999;
          return aOrder - bOrder;
        });
      setServices(dbServices);
    }, (error) => {
      console.error("Services snapshot failed:", error);
    });

    return () => unsubscribe();
  }, []);

  const getCardStyle = (theme: string) => {
    switch (theme) {
      case 'forest':
        return 'bg-forest text-cream border-none';
      case 'terracotta':
        return 'bg-terracotta text-white border-none';
      case 'cream':
        return 'bg-cream text-forest border-forest/10';
      case 'luxury':
        return 'bg-black text-white border-gold/20 border-2';
      default:
        return 'bg-white text-forest border-none';
    }
  };

  const getTextColor = (theme: string) => {
    if (['forest', 'terracotta', 'luxury'].includes(theme)) return 'text-white/80';
    return 'text-forest/70';
  };

  const finalServices = useMemo(() => {
    // Robust deduplication
    const seen = new Set();
    const result = [];
    
    // Add manual entry if not in database
    const hasDbCafe = services.some(s => s.title?.trim().toLowerCase() === 'the soul cafe');
    if (!hasDbCafe) {
      result.push({ title: 'The Soul Cafe', link: '/soul-cafe', description: 'A culinary sanctuary in the heart of Tosh.', isAvailable: true });
      seen.add('the soul cafe');
    }

    services.forEach(s => {
      const normalizedTitle = s.title?.trim().toLowerCase();
      if (normalizedTitle && !seen.has(normalizedTitle)) {
        result.push(s);
        seen.add(normalizedTitle);
      }
    });

    return result;
  }, [services]);

  return (
    <div className="pt-24 pb-24 px-6 bg-cream min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Tagline */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-forest mb-2">Our Experiences</h1>
          <p className="text-terracotta font-medium tracking-widest uppercase text-xs">Soulful Himalayan Journeys</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {finalServices.map((service, index) => (
            <motion.div
              key={`${service.title}-${index}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative h-[400px] md:h-[450px] rounded-[2rem] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.08)] cursor-pointer"
            >
              <Link to={service.link || `/services/${service.id}`} className="absolute inset-0 z-30" />
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-forest/90 via-forest/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
              <img 
                src={service.image || service.coverImage || 'https://images.unsplash.com/photo-1621425444159-5f17426db33e?q=80&w=800'} 
                alt={service.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              
              {service.isAvailable === false && (
                <div className="absolute top-4 left-4 z-20">
                  <Badge className="bg-rose-500 text-white border-none px-3 py-1 text-[9px] font-bold shadow-xl uppercase tracking-widest">
                    Unavailable
                  </Badge>
                </div>
              )}
              {profile?.role === 'admin' && (
                <Link 
                  to={service.id ? `/admin?tab=content&type=service&edit=${service.id}` : `/admin?tab=content&type=service`}
                  className="absolute top-4 right-4 bg-white/95 backdrop-blur shadow-xl px-2 p-1.5 rounded-full flex items-center justify-center border border-forest/10 hover:bg-forest hover:text-white transition-all duration-300 z-40 group/edit"
                  title={service.id ? "Edit Service" : "Sync defaults to edit"}
                  onClick={(e) => { e.stopPropagation(); }}
                >
                  <Edit2 className="h-4 w-4" />
                </Link>
              )}

              <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end">
                <div className="mb-4 flex items-center gap-3">
                  <div className="bg-white/10 backdrop-blur-xl w-10 h-10 rounded-xl flex items-center justify-center border border-white/20">
                    <Star className="text-terracotta h-5 w-5" />
                  </div>
                  <span className="text-white/80 font-bold uppercase tracking-widest text-[9px] bg-forest/40 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">{service.type || 'Service'}</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-heading font-extrabold text-white mb-3 line-clamp-2 leading-tight tracking-tight">
                  {service.title}
                </h3>
                <p className="text-white/70 text-xs md:text-sm mb-6 line-clamp-2 leading-relaxed font-medium">
                  {service.description || 'Experience our unique Himalayan service.'}
                </p>
                <div className="group/btn flex items-center gap-3 text-white font-bold uppercase text-[10px] tracking-widest">
                  <span className="w-8 h-[1px] bg-terracotta group-hover/btn:w-16 transition-all duration-500" />
                  Explore Details
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Customize Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <Card className="bg-forest border-none overflow-hidden rounded-[2.5rem] relative group shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-forest via-forest/80 to-terracotta/40 mix-blend-multiply opacity-60" />
            <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              <div className="text-center md:text-left">
                <h2 className="text-2xl md:text-4xl font-heading font-bold text-cream mb-4">Also Customize Your trip</h2>
                <p className="text-cream/70 text-xs md:text-sm max-w-xl font-medium">
                  Don't see exactly what you're looking for? Let us create a unique itinerary tailored specifically to your soul's journey in the Himalayas. From private trekks to exclusive wellness retreats.
                </p>
              </div>
              <Link 
                to="/tailor-made" 
                className={cn(
                  buttonVariants({ className: "bg-terracotta hover:bg-terracotta/90 text-white px-8 py-7 rounded-full text-base font-bold shadow-xl transition-all hover:scale-105 active:scale-95 shrink-0 h-auto" })
                )}
              >
                Get Tailor-Made
              </Link>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}
