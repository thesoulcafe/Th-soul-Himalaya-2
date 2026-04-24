import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, Mountain, Compass, Map, Info, AlertTriangle, CheckCircle2, Home as HomeIcon, Edit2, Clock, Star, Zap, Calendar, ChevronDown, Sparkles, ShoppingCart, ArrowRight, Share2, X, Users } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import AuthModal from '@/components/AuthModal';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '@/lib/CartContext';
import ImageSlider from '@/components/ImageSlider';
import SlotSelectionPopup from '@/components/SlotSelectionPopup';
import CustomizeTripCard from '@/components/CustomizeTripCard';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';
import { useMemo } from 'react';

import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { DEFAULT_TREKKS } from '@/constants';

export default function Trekks() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [trekkList, setTrekkList] = useState<any[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedDate, setSelectedDate] = useState('2026-06-10');
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>({});
  const [selectedTrekk, setSelectedTrekk] = useState<any>(null);
  const [activeSlotTrekk, setActiveSlotTrekk] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { cart: globalCart, addToCart: globalAddToCart, updateQuantity: globalUpdateQuantity, setPendingCartItem } = useCart();

  // Scroll lock when modal is open
  useEffect(() => {
    if (selectedTrekk || activeSlotTrekk) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedTrekk, activeSlotTrekk]);

  const handleShare = async (trekk: any) => {
    const shareData = {
      title: `The Soul Himalaya - ${trekk.title}`,
      text: trekk.description || `Discover this wild path: ${trekk.title}`,
      url: `${window.location.origin}${window.location.pathname}?id=${trekk.id}`
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Spirit Shared", {
          description: "Link copied to clipboard!",
        });
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error("Sharing failed:", err);
      }
    }
  };

  const formatDateRange = (startDateStr: string, durationStr: string, slot?: any) => {
    if (slot && slot.startDate && slot.endDate) {
      try {
        const start = new Date(slot.startDate);
        const end = new Date(slot.endDate);
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
        return `${start.toLocaleDateString('en-IN', options)} to ${end.toLocaleDateString('en-IN', { ...options, year: 'numeric' })}`;
      } catch (e) {
        return "10 June to 15 June 2026";
      }
    }
    try {
      const startDate = new Date(startDateStr);
      // Trekk usually have hours, but for cart we'll assume a 1-day range if it's a day trekk
      // or parse days if it's multi-day.
      const daysMatch = durationStr.match(/(\d+)\s*Days/);
      const days = daysMatch ? parseInt(daysMatch[1]) : 1;
      
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + days - 1);
      
      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
      const startFormatted = startDate.toLocaleDateString('en-IN', options);
      const endFormatted = endDate.toLocaleDateString('en-IN', { ...options, year: 'numeric' });
      
      return `${startFormatted} to ${endFormatted}`;
    } catch (e) {
      return "10 June to 15 June 2026";
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'content'), where('type', '==', 'trekk'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const dbTrekks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data().data
        })).sort((a, b) => {
          const aAvail = a.isAvailable !== false;
          const bAvail = b.isAvailable !== false;
          if (aAvail && !bAvail) return -1;
          if (!aAvail && bAvail) return 1;

          const aOrder = (a.order !== undefined && a.order !== null) ? Number(a.order) : 999;
          const bOrder = (b.order !== undefined && b.order !== null) ? Number(b.order) : 999;
          return aOrder - bOrder;
        });
        setTrekkList(dbTrekks);
      } else {
        // Fallback to defaults
        setTrekkList([...DEFAULT_TREKKS].sort((a, b) => {
          const aOrder = ((a as any).order !== undefined && (a as any).order !== null) ? Number((a as any).order) : 999;
          const bOrder = ((b as any).order !== undefined && (b as any).order !== null) ? Number((b as any).order) : 999;
          return aOrder - bOrder;
        }));
      }
      setHasLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'content'), where('type', '==', 'config'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setConfig(snapshot.docs[0].data().data);
      }
    });
    return () => unsubscribe();
  }, []);

  const getItemQuantity = (id: string) => {
    return globalCart.find(i => i.id === id)?.quantity || 0;
  };

  useEffect(() => {
    const trekkId = searchParams.get('id');
    if (trekkId && trekkList.length > 0) {
      const trekk = trekkList.find(t => t.id === trekkId);
      if (trekk) setSelectedTrekk(trekk);
    }
  }, [searchParams, trekkList]);

  const currentSEO = useMemo(() => {
    if (selectedTrekk) {
      return {
        title: selectedTrekk.title,
        description: selectedTrekk.description || `Discover the wild with ${selectedTrekk.title}.`,
        image: selectedTrekk.image,
      };
    }
    return {
      title: "Himalayan Trekking",
      description: "High-altitude journeys and wild paths curated for the soulful adventurer."
    };
  }, [selectedTrekk]);

  return (
    <div className="pt-24">
      <SEO 
        title={currentSEO.title} 
        description={currentSEO.description} 
        image={currentSEO.image}
        canonicalUrl={window.location.href}
      />
      {/* Tagline */}
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-forest mb-2">Mountain Trekks</h1>
        <p className="text-terracotta font-medium tracking-widest uppercase text-xs">Discover Wild Paths</p>
      </div>

      {/* Trekk Grid */}
      <section className="py-24 px-6 bg-cream">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 gap-12">
            {!hasLoaded ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-[2rem] h-[400px] animate-pulse border border-forest/5 shadow-sm p-0 overflow-hidden flex flex-col md:flex-row">
                  <div className="w-full md:w-1/2 bg-forest/5" />
                  <div className="p-12 w-full md:w-1/2 space-y-6">
                    <div className="h-4 bg-forest/5 rounded w-1/4" />
                    <div className="h-10 bg-forest/5 rounded w-3/4" />
                    <div className="h-20 bg-forest/5 rounded w-full" />
                  </div>
                </div>
              ))
            ) : (
              trekkList.map((trekk, index) => (
                <motion.div
                  key={trekk.id || trekk.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden border border-forest/5 shadow-lg group h-full flex flex-col md:flex-row p-0 rounded-[2rem] bg-white transition-all duration-500 hover:shadow-2xl">
                  {/* Left Side: Image */}
                  <div className="relative w-full md:w-1/2 aspect-[4/3] md:aspect-auto overflow-hidden">
                    <ImageSlider 
                      images={[trekk.image, ...(trekk.images || [])].filter(Boolean)} 
                      alt={trekk.title}
                      className="h-full w-full transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                      <Badge className={`${trekk.color} border-none px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest`}>
                        {trekk.difficulty}
                      </Badge>
                    </div>
                    
                    {trekk.isAvailable === false && (
                      <div className="absolute inset-0 bg-forest/40 flex items-center justify-center z-10">
                        <Badge className="bg-rose-500 text-white border-none px-4 py-1.5 rounded-full text-[10px] font-bold shadow-xl uppercase tracking-widest">
                          Unavailable
                        </Badge>
                      </div>
                    )}

                    {profile?.role === 'admin' && (
                      <Link 
                        to={trekk.id ? `/admin?tab=content&type=trekk&edit=${trekk.id}` : `/admin?tab=content&type=trekk`}
                        className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors group/edit z-10"
                        title={trekk.id ? "Edit Trekk" : "Sync defaults to edit"}
                      >
                        <Edit2 className="h-4 w-4 text-forest group-hover/edit:text-terracotta transition-colors" />
                      </Link>
                    )}

                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleShare(trekk);
                      }}
                      className={cn(
                        "absolute top-4 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors group/share z-10",
                        profile?.role === 'admin' ? "right-14" : "right-4"
                      )}
                      title="Share Trekk"
                    >
                      <Share2 className="h-4 w-4 text-forest group-hover/share:text-terracotta transition-colors" />
                    </button>

                    {/* Floating Price Tag */}
                    <div className="absolute bottom-4 right-4 bg-terracotta text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-xl z-10">
                      {trekk.price}
                    </div>
                  </div>

                  {/* Right Side: Details */}
                  <CardContent className="p-8 md:p-12 w-full md:w-1/2 flex flex-col">
                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-yellow-500 text-[10px] font-bold bg-yellow-500/5 px-2 py-1 rounded-full">
                          <Star className="h-3 w-3 fill-current mr-1" />
                          4.8 (120 reviews)
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-forest/40 uppercase tracking-widest">
                          <Clock className="h-3 w-3 text-terracotta" />
                          {trekk.duration}
                        </div>
                      </div>

                      <h3 className="text-2xl md:text-3xl font-heading font-bold text-forest leading-tight mb-6 group-hover:text-terracotta transition-colors">
                        {trekk.title}
                      </h3>

                      <p className="text-forest/60 text-sm leading-relaxed mb-8 line-clamp-3">
                        {trekk.description}
                      </p>

                      <div className="flex flex-wrap gap-6 mb-8 pb-8 border-b border-forest/5">
                        <div className="flex items-center text-xs font-bold text-forest">
                          <Mountain className="h-4 w-4 text-terracotta mr-3 shrink-0" />
                          {trekk.altitude}
                        </div>
                        <div className="flex items-center text-xs font-bold text-forest">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-3 shrink-0" />
                          Expert Guides
                        </div>
                      </div>

                      {/* Slot Selection */}
                      {trekk.slots && trekk.slots.length > 0 && (
                        <div className="mb-8">
                          <button 
                            onClick={() => setActiveSlotTrekk(trekk)}
                            className="w-full bg-forest/[0.03] border border-forest/5 rounded-2xl p-4 text-xs text-forest font-bold flex items-center justify-between hover:bg-white hover:border-terracotta/30 transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <Calendar className="h-4 w-4 text-terracotta" />
                              {selectedSlots[trekk.id] !== undefined ? (
                                <span>
                                  Departure: {new Date(trekk.slots[parseInt(selectedSlots[trekk.id])].startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
                                </span>
                              ) : (
                                <span className="text-forest/30">Select Date</span>
                              )}
                            </div>
                            <ChevronDown className="h-4 w-4 text-forest/20 group-hover:text-terracotta transition-colors" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-auto pt-6 flex items-center justify-between gap-6">
                      <Button 
                        variant="ghost" 
                        className="text-forest hover:text-terracotta p-0 font-bold text-sm uppercase tracking-widest"
                        onClick={() => setSelectedTrekk(trekk)}
                      >
                        Details
                      </Button>

                      <div className="flex flex-col gap-3">
                        {(() => {
                          const slotIndex = selectedSlots[trekk.id];
                          const baseId = `trekk-${trekk.title.toLowerCase().replace(/\s+/g, '-')}`;
                          const currentItemId = `${baseId}${slotIndex !== undefined ? `-slot-${slotIndex}` : ''}`;
                          const quantity = getItemQuantity(currentItemId);
                          
                          const handleBookAction = () => {
                            if (!user) {
                              setPendingCartItem({
                                id: currentItemId,
                                name: trekk.title,
                                price: trekk.price,
                                type: 'Trekk',
                                image: trekk.image,
                                dateRange: formatDateRange(selectedDate, trekk.duration, slotIndex !== undefined ? trekk.slots?.[parseInt(slotIndex)] : undefined)
                              });
                              setShowAuthModal(true);
                              return;
                            }

                            if (trekk.slots && trekk.slots.length > 0 && slotIndex === undefined) {
                              setActiveSlotTrekk(trekk);
                              return;
                            }

                            const slot = slotIndex !== undefined ? trekk.slots?.[parseInt(slotIndex)] : undefined;
                            globalAddToCart({
                              id: currentItemId,
                              name: trekk.title,
                              price: trekk.price,
                              type: 'Trekk',
                              image: trekk.image,
                              dateRange: formatDateRange(selectedDate, trekk.duration, slot)
                            });
                          };

                          return (
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                {quantity > 0 && (
                                  <div className="flex items-center gap-2 bg-forest/5 p-1 rounded-full">
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-8 w-8 rounded-full text-forest hover:bg-white bg-white/50 shadow-sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        globalUpdateQuantity(currentItemId, quantity - 1);
                                      }}
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="font-bold text-forest text-sm px-2">{quantity}</span>
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-8 w-8 rounded-full text-forest hover:bg-white bg-white/50 shadow-sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleBookAction();
                                      }}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}

                                {quantity === 0 ? (
                                  <Button 
                                    onClick={handleBookAction}
                                    disabled={trekk.isAvailable === false}
                                    className={cn(
                                      "h-10 px-8 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 flex-grow",
                                      trekk.isAvailable === false 
                                        ? "bg-forest/10 text-forest/30 cursor-not-allowed border-none" 
                                        : "bg-terracotta hover:bg-terracotta/90 text-white shadow-lg shadow-terracotta/20"
                                    )}
                                  >
                                    {trekk.isAvailable === false ? 'Season Ended' : 'Join Trekk'}
                                  </Button>
                                ) : (
                                  <Link to="/checkout" className="flex-grow">
                                    <Button className="w-full h-10 px-6 rounded-full text-[10px] font-bold uppercase tracking-widest bg-forest hover:bg-forest/90 text-white shadow-lg shadow-forest/20 flex items-center justify-center gap-2">
                                      <ShoppingCart className="h-3 w-3" /> Go to Cart <ArrowRight className="h-3 w-3" />
                                    </Button>
                                  </Link>
                                )}
                              </div>
                              {quantity > 0 && (
                                <p className="text-[9px] text-center text-forest/40 font-bold uppercase tracking-tighter">
                                  In journey
                                </p>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
          </div>
        </div>
      </section>

      {/* Trekking Info */}
      <section className="py-24 bg-forest text-cream">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="space-y-6">
            <div className="bg-white/10 p-4 rounded-2xl w-fit">
              <Info className="h-8 w-8 text-terracotta" />
            </div>
            <h3 className="text-2xl font-heading font-bold">Preparation</h3>
            <p className="text-cream/70 text-sm leading-relaxed">
              Trekking in the Himalayas requires physical fitness and mental preparation. 
              We recommend starting a cardio routine at least 4 weeks before your trekk.
            </p>
          </div>
          <div className="space-y-6">
            <div className="bg-white/10 p-4 rounded-2xl w-fit">
              <AlertTriangle className="h-8 w-8 text-terracotta" />
            </div>
            <h3 className="text-2xl font-heading font-bold">Safety First</h3>
            <p className="text-cream/70 text-sm leading-relaxed">
              Our guides are certified in wilderness first aid. We carry oxygen cylinders 
              and medical kits on all high-altitude trekks.
            </p>
          </div>
          <div className="space-y-6">
            <div className="bg-white/10 p-4 rounded-2xl w-fit">
              <CheckCircle2 className="h-8 w-8 text-terracotta" />
            </div>
            <h3 className="text-2xl font-heading font-bold">What's Included</h3>
            <p className="text-cream/70 text-sm leading-relaxed">
              Professional guides, camping gear, all meals during the trekk, 
              permits, and transport from the base camp.
            </p>
          </div>
        </div>
      </section>

      {/* Trekk Detail Modal */}
      <AnimatePresence>
        {selectedTrekk && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8 bg-forest/90 backdrop-blur-2xl"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              className="bg-[#FAF9F6] rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] max-w-6xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col border border-white/20 relative"
            >
            {/* Background Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none grayscale invert" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/topography.png")' }} />

            {/* Immersive Visuals - Now part of the scroll flow */}
            <div className="relative w-full h-[400px] md:h-[600px] shrink-0 overflow-hidden bg-forest">
              <img src={selectedTrekk.image} alt={selectedTrekk.title} className="w-full h-full object-cover scale-100" />
              
              {/* Decorative Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-forest/60 via-transparent to-transparent" />
              
              <div className="absolute bottom-10 left-10 right-10 text-white z-10">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="font-fluid text-2xl md:text-3xl text-terracotta drop-shadow-md mb-2 block text-center md:text-left">The Sacred</span>
                  <h2 className="text-4xl md:text-7xl font-playfair font-black italic leading-[0.9] tracking-tighter mb-4 uppercase text-center md:text-left">
                    {selectedTrekk.title.split(' ').map((word: string, i: number) => (
                      <span key={i} className={i === 1 ? 'text-white/40' : ''}>{word} </span>
                    ))}
                  </h2>
                </motion.div>
                
                <div className="flex items-center justify-center md:justify-start gap-4 text-white/70 text-xs font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <Map className="h-4 w-4 text-terracotta" />
                    <span>Wild Frontier</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-terracotta" />
                  <span>Hidden Valleys</span>
                </div>
              </div>

              {/* Close & Share - Now absolute within the scroll flow */}
              <div className="absolute top-6 right-6 flex gap-3 z-50">
                <button 
                  onClick={() => handleShare(selectedTrekk)}
                  className="bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20 text-white hover:bg-terracotta transition-all"
                >
                  <Share2 className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => setSelectedTrekk(null)} 
                  className="bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20 text-white hover:bg-white hover:text-forest transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Soulful Details - Scroll continues here */}
            <div className="flex-grow bg-[#FAF9F6] relative">
              <div className="p-8 md:p-16">
                <div className="max-w-3xl mx-auto space-y-16">
                  
                  {/* Stats Grid - Fluid Style */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { icon: Clock, label: 'Duration', value: selectedTrekk.duration, sub: 'Days & Nights' },
                      { icon: Mountain, label: 'Altitude', value: selectedTrekk.altitude, sub: 'Above Sea Level' },
                      { icon: Zap, label: 'Challenge', value: selectedTrekk.difficulty, sub: 'Expedition Tier' }
                    ].map((stat, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + (i * 0.1) }}
                        className="bg-white p-6 rounded-[2rem] border border-forest/5 shadow-sm text-center group hover:border-terracotta/20 transition-all"
                      >
                        <div className="bg-terracotta/5 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                          <stat.icon className="h-5 w-5 text-terracotta" />
                        </div>
                        <div className="text-[10px] font-black text-forest/30 uppercase tracking-widest mb-1">{stat.label}</div>
                        <div className="text-sm font-bold text-forest mb-1">{stat.value}</div>
                        <div className="text-[8px] font-bold text-forest/20 uppercase">{stat.sub}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Soulful Description */}
                  <section>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-px flex-grow bg-forest/5" />
                      <span className="font-fluid text-2xl text-terracotta">The Expedition Experience</span>
                      <div className="h-px flex-grow bg-forest/5" />
                    </div>
                    <p className="text-forest/70 text-base leading-[1.8] font-medium italic mb-8">
                      "{selectedTrekk.description}"
                    </p>

                    {/* Day-by-Day Experience Header */}
                    <div className="bg-forest/5 rounded-2xl p-6 border border-forest/10 mb-8">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="bg-terracotta/20 p-3 rounded-full">
                          <Compass className="h-6 w-6 text-terracotta" />
                        </div>
                        <h4 className="text-xl font-bold text-forest uppercase tracking-tight">Day-by-Day Journey</h4>
                      </div>
                      <p className="text-xs text-forest/50 font-medium">Follow the trail through the heart of the mountains. A daily flow of discovery and resilience.</p>
                    </div>
                  </section>

                  {/* Experience Split */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h4 className="text-xs font-black text-forest uppercase tracking-[0.2em] flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-terracotta" /> Core Experience
                      </h4>
                      <div className="space-y-4">
                        {[
                          'Ancient Forest Trails',
                          'Glacial Stream Crossing',
                          'Traditional Village Stays',
                          'Starlit Alpine Camps'
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-4 text-sm font-bold text-forest/60 group">
                            <div className="w-1.5 h-1.5 rounded-full bg-terracotta group-hover:scale-150 transition-transform" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white/50 border border-forest/5 p-8 rounded-[2.5rem]">
                      <h4 className="text-xs font-black text-forest uppercase tracking-[0.2em] mb-4">Inclusions</h4>
                      <div className="grid grid-cols-1 gap-4">
                        {[
                          { icon: Users, label: 'Boutique Group Size' },
                          { icon: Star, label: 'Premium Gear' },
                          { icon: Mountain, label: 'Safety Backed' }
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-3 text-xs font-bold text-forest/40">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            {item.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Itinerary */}
                  {(selectedTrekk.itinerary || selectedTrekk.theExperience) && (
                    <section className="bg-forest/[0.02] p-10 rounded-[3rem] border border-forest/5">
                      <div className="flex items-center justify-between mb-10">
                        <h4 className="font-playfair text-3xl font-black italic text-forest">The Day-to-Day Flow</h4>
                        <Compass className="h-8 w-8 text-terracotta animate-pulse" />
                      </div>
                      
                      <div className="space-y-8 relative">
                        <div className="absolute left-4 top-2 bottom-2 w-px bg-forest/10" />
                        
                        {Array.isArray(selectedTrekk.itinerary) ? (
                          selectedTrekk.itinerary.map((item: any, i: number) => (
                            <div key={i} className="relative pl-12 group">
                              <div className="absolute left-3 top-1.5 w-2 h-2 rounded-full bg-terracotta border-4 border-[#FAF9F6] ring-1 ring-terracotta/20 z-10 group-hover:scale-150 transition-transform" />
                              <div className="text-[10px] font-black text-terracotta uppercase tracking-[0.2em] mb-1">Day {item.day || i + 1}</div>
                              <h5 className="text-lg font-bold text-forest mb-2">Mountain Awakening</h5>
                              <p className="text-xs text-forest/50 font-medium leading-relaxed">
                                {item.description}
                              </p>
                            </div>
                          ))
                        ) : (
                          selectedTrekk.theExperience.split('\n').map((line: string, i: number) => {
                            if (!line.trim()) return null;
                            const isDay = line.toLowerCase().startsWith('day');
                            return (
                              <div key={i} className={cn("relative", isDay ? "pl-12 mt-10 first:mt-0" : "pl-12 mt-2")}>
                                {isDay && <div className="absolute left-3 top-1.5 w-2 h-2 rounded-full bg-terracotta z-10" />}
                                <div className={cn("text-xs leading-relaxed", isDay ? "text-[10px] font-black text-terracotta uppercase tracking-[0.2em] mb-1" : "text-forest/60 font-medium")}>
                                  {line.trim()}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </section>
                  )}
                  {/* Booking Footer - Creative Style */}
                  <div className="border-t border-forest/5 bg-white shadow-[0_-20px_50px_rgba(0,0,0,0.02)] -mx-8 md:-mx-14 p-6 md:p-12">
                    <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
                      <div className="text-center md:text-left">
                        <div className="font-fluid text-2xl text-terracotta -mb-2">Energy Exchange</div>
                        <div className="text-5xl font-playfair font-black italic text-forest leading-none">
                          {selectedTrekk.price}
                          <span className="text-xs font-bold uppercase tracking-widest text-forest/20 ml-2 italic">/ Wanderer</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                        {selectedTrekk.slots && selectedTrekk.slots.length > 0 ? (
                          <div className="relative group w-full sm:w-auto">
                            <select 
                              value={selectedSlots[selectedTrekk.id] || ''}
                              onChange={(e) => setSelectedSlots({ ...selectedSlots, [selectedTrekk.id]: e.target.value })}
                              className="w-full sm:min-w-[220px] h-16 rounded-full border-forest/10 bg-forest/[0.03] px-8 appearance-none focus:outline-none focus:ring-4 focus:ring-forest/5 text-forest font-bold text-xs uppercase tracking-widest cursor-pointer group-hover:bg-forest/5 transition-all"
                            >
                              <option value="">Pick Date Slot</option>
                              {selectedTrekk.slots.map((slot: any, i: number) => (
                                <option key={i} value={i}>
                                  {new Date(slot.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-forest/20 pointer-events-none group-hover:text-forest transition-colors" />
                          </div>
                        ) : (
                          <div className="relative group w-full sm:w-auto">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-terracotta z-10">
                              <Calendar className="h-4 w-4" />
                            </div>
                            <input
                              type="date"
                              min={new Date().toISOString().split('T')[0]}
                              onChange={(e) => setSelectedDate(new Date(e.target.value))}
                              className="w-full sm:min-w-[220px] h-16 rounded-full border-forest/10 bg-forest/[0.03] pl-14 pr-8 focus:outline-none focus:ring-4 focus:ring-forest/5 text-forest font-bold text-xs uppercase tracking-widest cursor-pointer group-hover:bg-forest/5 transition-all"
                            />
                          </div>
                        )}

                        <Button 
                          onClick={() => {
                            const slotIndex = selectedSlots[selectedTrekk.id];
                            const slot = slotIndex !== undefined ? selectedTrekk.slots?.[parseInt(slotIndex)] : undefined;
                            globalAddToCart({
                              id: `trekk-${selectedTrekk.id}`,
                              name: selectedTrekk.title,
                              price: selectedTrekk.price,
                              type: 'Trekk',
                              image: selectedTrekk.image,
                              dateRange: formatDateRange(selectedDate, selectedTrekk.duration, slot)
                            });
                            setSelectedTrekk(null);
                            toast.success("Added to Cart", {
                               description: `${selectedTrekk.title} has been added to your soul cart.`
                            });
                          }}
                          disabled={selectedTrekk.slots && selectedTrekk.slots.length > 0 && selectedSlots[selectedTrekk.id] === undefined}
                          className="w-full sm:min-w-[240px] h-16 bg-terracotta hover:bg-terracotta/90 text-white rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-terracotta/20 transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-4"
                        >
                          <Sparkles className="h-4 w-4" />
                          Book Now
                        </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
      {/* Customize Section */}
      <section className="py-24 bg-cream/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <CustomizeTripCard 
              places={config?.places}
              treks={config?.trekks}
              yoga={config?.yoga}
              meditation={config?.meditation}
              title={config?.title}
              description={config?.description}
            />
          </div>
        </div>
      </section>

      {/* Slot Selection Popup */}
      {activeSlotTrekk && (
        <SlotSelectionPopup 
          isOpen={!!activeSlotTrekk}
          onClose={() => setActiveSlotTrekk(null)}
          slots={activeSlotTrekk.slots}
          selectedSlotIndex={selectedSlots[activeSlotTrekk.id]}
          onSelectSlot={(index) => {
            setSelectedSlots({ ...selectedSlots, [activeSlotTrekk.id]: index });
            // Auto add after selection
            const slot = activeSlotTrekk.slots[index];
            const baseId = `trekk-${activeSlotTrekk.title.toLowerCase().replace(/\s+/g, '-')}`;
            globalAddToCart({
              id: `${baseId}-slot-${index}`,
              name: activeSlotTrekk.title,
              price: activeSlotTrekk.price,
              type: 'Trekk',
              image: activeSlotTrekk.image,
              dateRange: formatDateRange(selectedDate, activeSlotTrekk.duration, slot)
            });
            setActiveSlotTrekk(null);
          }}
          onCustomize={() => navigate('/contact')}
          title={activeSlotTrekk.title}
        />
      )}

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
