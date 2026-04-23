import React, { useState, useEffect } from 'react';
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
  const [services, setServices] = useState<any[]>(DEFAULT_SERVICES);

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
      }
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

  return (
    <div className="pt-24 pb-24 px-6 bg-cream min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Tagline */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-forest mb-2">Our Experiences</h1>
          <p className="text-terracotta font-medium tracking-widest uppercase text-xs">Soulful Himalayan Journeys</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ delay: index * 0.03, type: 'spring', stiffness: 300 }}
              className="group"
            >
              <Link to={service.link || '#'}>
                <Card className={cn(
                  "relative overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 rounded-2xl h-full border-0 p-0",
                  index % 4 === 0 ? "bg-forest text-cream" : 
                  index % 4 === 1 ? "bg-terracotta text-white" : 
                  index % 4 === 2 ? "bg-cream text-forest border border-forest/10" : 
                  "bg-black text-white"
                )}>
                  {/* Vibrant Gradient Overlay */}
                  <div className={cn(
                    "absolute inset-0 opacity-10 group-hover:opacity-30 transition-opacity duration-500",
                    index % 4 === 0 ? "bg-gradient-to-br from-white to-transparent" : 
                    index % 4 === 1 ? "bg-gradient-to-br from-white to-transparent" : 
                    index % 4 === 2 ? "bg-gradient-to-br from-terracotta to-transparent" : 
                    "bg-gradient-to-br from-gold to-transparent"
                  )} />
                  
                  <CardContent className="p-5 flex flex-col items-center text-center h-full relative z-10">
                    {service.isAvailable === false && (
                      <div className="absolute inset-0 bg-forest/40 backdrop-blur-[1px] flex items-center justify-center z-20">
                        <Badge className="bg-rose-500 text-white border-none px-3 py-1 text-[9px] font-bold shadow-xl">
                          Unavailable
                        </Badge>
                      </div>
                    )}
                    {profile?.role === 'admin' && (
                      <Link 
                        to={service.id ? `/admin?tab=content&type=service&edit=${service.id}` : `/admin?tab=content&type=service`}
                        className="absolute top-4 right-4 bg-white/95 backdrop-blur shadow-xl px-2.5 py-1.5 rounded-full flex items-center gap-1.5 border border-forest/10 hover:bg-forest hover:text-white transition-all duration-300 z-20 group/edit"
                        title={service.id ? "Edit Service" : "Sync defaults to edit"}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Edit2 className="h-3 w-3" />
                        <span className="text-[8px] font-bold uppercase tracking-widest leading-none">Edit</span>
                      </Link>
                    )}
                    <div className={cn(
                      "mb-3 p-2.5 rounded-xl transition-all duration-500 shadow-sm",
                      index % 4 === 2 ? "bg-forest/5" : "bg-white/10 group-hover:bg-white/20"
                    )}>
                      {React.createElement(getIcon(service.title), { className: "h-5 w-5" })}
                    </div>
                    
                    <h3 className="text-sm font-heading font-bold mb-1 tracking-tight">
                      {service.title}
                    </h3>
                    
                    <p className="text-[10px] leading-tight opacity-60 mb-4 line-clamp-2">
                      {service.description}
                    </p>
                    
                    <div className="mt-auto flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <span>Explore</span>
                      <ArrowRight className="h-2 w-2" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
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
