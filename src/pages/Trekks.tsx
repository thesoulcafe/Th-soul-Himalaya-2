import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, Mountain, Compass, Map, Info, AlertTriangle, CheckCircle2, Home as HomeIcon, Edit2, Clock, Star, Zap, Calendar, ChevronDown, Sparkles, ShoppingCart, ArrowRight, Share2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import AuthModal from '@/components/AuthModal';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/lib/CartContext';
import ImageSlider from '@/components/ImageSlider';
import SlotSelectionPopup from '@/components/SlotSelectionPopup';
import CustomizeTripCard from '@/components/CustomizeTripCard';

import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { DEFAULT_TREKKS } from '@/constants';

export default function Trekks() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [trekkList, setTrekkList] = useState<any[]>(DEFAULT_TREKKS);
  const [selectedDate, setSelectedDate] = useState('2026-06-10');
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>({});
  const [selectedTrekk, setSelectedTrekk] = useState<any>(null);
  const [activeSlotTrekk, setActiveSlotTrekk] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { cart: globalCart, addToCart: globalAddToCart, updateQuantity: globalUpdateQuantity, setPendingCartItem } = useCart();

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
        alert("Link copied to clipboard!");
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
          const aOrder = (a.order !== undefined && a.order !== null) ? Number(a.order) : 999;
          const bOrder = (b.order !== undefined && b.order !== null) ? Number(b.order) : 999;
          if (aOrder !== bOrder) return aOrder - bOrder;

          const aAvail = a.isAvailable !== false;
          const bAvail = b.isAvailable !== false;
          if (aAvail && !bAvail) return -1;
          if (!aAvail && bAvail) return 1;
          return 0;
        });
        setTrekkList(dbTrekks);
      }
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

  return (
    <div className="pt-24">
      {/* Tagline */}
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-forest mb-2">Trekks & Trails</h1>
        <p className="text-terracotta font-medium tracking-widest uppercase text-xs">Discover Wild Paths</p>
      </div>

      {/* Trekk Grid */}
      <section className="py-24 px-6 bg-cream">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {trekkList.map((trekk, index) => (
              <motion.div
                key={trekk.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden border border-forest/5 shadow-lg group h-full flex flex-col p-0 rounded-[2rem] bg-white transition-all duration-500 hover:shadow-2xl">
                  <div className="relative aspect-[4/3] overflow-hidden">
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

                  <CardContent className="p-6 flex-grow flex flex-col">
                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center text-yellow-500 text-[10px] font-bold bg-yellow-500/5 px-2 py-1 rounded-full">
                          <Star className="h-3 w-3 fill-current mr-1" />
                          4.8 (120)
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-forest/40 uppercase tracking-widest">
                          <Clock className="h-3 w-3 text-terracotta" />
                          {trekk.duration}
                        </div>
                      </div>

                      <h3 className="text-xl font-heading font-bold text-forest leading-tight mb-4 group-hover:text-terracotta transition-colors line-clamp-2">
                        {trekk.title}
                      </h3>

                      <div className="space-y-2 mb-6">
                        <div className="flex items-center text-[11px] text-forest/60 font-medium italic">
                          <Mountain className="h-3 w-3 text-terracotta mr-2 shrink-0" />
                          Altitude: {trekk.altitude}
                        </div>
                        <div className="flex items-center text-[11px] text-forest/60 font-medium">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 mr-2 shrink-0" />
                          Guided Professional Trekk
                        </div>
                      </div>

                      {/* Slot Selection */}
                      {trekk.slots && trekk.slots.length > 0 && (
                        <div className="mb-4">
                          <button 
                            onClick={() => setActiveSlotTrekk(trekk)}
                            className="w-full bg-forest/[0.03] border border-forest/5 rounded-xl p-3 text-[10px] text-forest font-bold flex items-center justify-between hover:bg-white hover:border-terracotta/30 transition-all group"
                          >
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 text-terracotta" />
                              {selectedSlots[trekk.id] !== undefined ? (
                                <span>
                                  {new Date(trekk.slots[parseInt(selectedSlots[trekk.id])].startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                </span>
                              ) : (
                                <span className="text-forest/30">Pick Date</span>
                              )}
                            </div>
                            <ChevronDown className="h-3 w-3 text-forest/20 group-hover:text-terracotta transition-colors" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-auto pt-4 border-t border-forest/5 flex items-center justify-between gap-3">
                      <Button 
                        variant="ghost" 
                        className="text-forest hover:text-terracotta p-0 font-bold text-xs"
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
            ))}
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
      {selectedTrekk && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-forest/60 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row border border-white/20"
          >
            {/* Left Side: Immersive Image/Gallery */}
            <div className="relative w-full md:w-1/2 h-64 md:h-auto shrink-0 bg-forest overflow-hidden">
              <img src={selectedTrekk.image} alt={selectedTrekk.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-forest/10 md:to-forest/20" />
              
              <button 
                onClick={() => setSelectedTrekk(null)}
                className="absolute top-6 left-6 bg-white/20 backdrop-blur-xl p-2.5 rounded-full shadow-2xl hover:bg-white transition-all text-white hover:text-forest md:hidden z-50 border border-white/40"
              >
                <Plus className="h-5 w-5 rotate-45" />
              </button>

              <button 
                onClick={() => handleShare(selectedTrekk)}
                className="absolute top-6 left-20 bg-white/20 backdrop-blur-xl p-2.5 rounded-full shadow-2xl hover:bg-white transition-all text-white hover:text-forest md:hidden z-50 border border-white/40"
                title="Share"
              >
                <Share2 className="h-5 w-5" />
              </button>

              <div className="absolute bottom-6 left-6 right-6 md:bottom-12 md:left-12 text-white">
                <Badge className="bg-terracotta text-white border-none mb-4 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg">
                  Wild Himalayan Expedition
                </Badge>
                <h2 className="text-3xl md:text-5xl font-heading font-bold leading-tight mb-2 drop-shadow-2xl">{selectedTrekk.title}</h2>
                <p className="text-white/80 text-sm font-medium tracking-wide flex items-center gap-2">
                  <Map className="h-4 w-4 text-terracotta" /> Parvati Valley Peaks
                </p>
              </div>
            </div>

            {/* Right Side: Details & Booking */}
            <div className="flex-grow p-8 md:p-12 overflow-y-auto bg-white relative">
              <div className="absolute top-6 right-6 flex items-center gap-3">
                <button 
                  onClick={() => handleShare(selectedTrekk)}
                  className="bg-forest/5 p-3 rounded-full text-forest hover:bg-terracotta hover:text-white transition-all hidden md:flex active:scale-90"
                  title="Share Expedition"
                >
                  <Share2 className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => setSelectedTrekk(null)}
                  className="bg-forest/5 p-3 rounded-full text-forest hover:bg-terracotta hover:text-white transition-all hidden md:flex active:scale-90"
                >
                  <Plus className="h-6 w-6 rotate-45" />
                </button>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-3 gap-6 mb-10 pb-8 border-b border-forest/5">
                <div className="text-center md:text-left">
                  <div className="text-[9px] uppercase tracking-widest text-forest/40 font-bold mb-2">Duration</div>
                  <div className="flex items-center justify-center md:justify-start gap-1.5 font-bold text-forest text-sm italic">
                    <Clock className="h-4 w-4 text-terracotta" /> {selectedTrekk.duration}
                  </div>
                </div>
                <div className="text-center md:text-left border-x border-forest/10 px-6">
                  <div className="text-[9px] uppercase tracking-widest text-forest/40 font-bold mb-2">Altitude</div>
                  <div className="flex items-center justify-center md:justify-start gap-1.5 font-bold text-forest text-sm italic">
                    <Mountain className="h-4 w-4 text-terracotta" /> {selectedTrekk.altitude}
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-[9px] uppercase tracking-widest text-forest/40 font-bold mb-2">Difficulty</div>
                  <div className="flex items-center justify-center md:justify-start gap-1.5 font-bold text-forest text-sm italic">
                    <Star className="h-4 w-4 text-terracotta fill-terracotta" /> {selectedTrekk.difficulty}
                  </div>
                </div>
              </div>

              <div className="space-y-10">
                {/* Description & Itinerary */}
                <div className="space-y-8">
                  <div>
                    <h4 className="font-heading font-bold text-forest mb-4 text-sm uppercase tracking-widest">The Soul Journey</h4>
                    <p className="text-forest/70 text-sm leading-relaxed font-medium">
                      {selectedTrekk.description}
                    </p>
                  </div>

                  {selectedTrekk.theExperience && (
                    <div className="bg-cream/20 p-6 md:p-8 rounded-[2rem] border border-forest/5">
                      <h4 className="font-heading font-bold text-forest mb-6 text-sm uppercase tracking-widest flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-terracotta" /> Day-by-Day Experience
                      </h4>
                      <div className="space-y-4">
                        {selectedTrekk.theExperience.split('\n').map((line: string, i: number) => {
                          if (!line.trim()) return null;
                          const isDay = line.toLowerCase().startsWith('day');
                          return (
                            <div key={i} className={cn("text-xs leading-relaxed", isDay ? "font-black text-forest mt-4 first:mt-0" : "text-forest/60 font-medium pl-4 border-l border-forest/10 ml-2")}>
                              {line.trim()}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Highlights/Includes */}
                <div className="bg-cream/30 p-8 rounded-[2rem] border border-forest/5">
                  <h4 className="font-heading font-bold text-forest mb-6 text-sm uppercase tracking-widest">Expedition Inclusions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { icon: CheckCircle2, label: 'Professional Soul Guides' },
                      { icon: Map, label: 'Traditional Route Planning' },
                      { icon: Mountain, label: 'Premium Camping Gear' },
                      { icon: Zap, label: 'Authentic Local Meals' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs font-bold text-forest/80">
                        <item.icon className="h-4 w-4 text-terracotta shrink-0" />
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Booking Footer */}
                <div className="pt-8 border-t border-forest/5">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
                    <div className="text-center sm:text-left">
                      <div className="text-xs font-bold text-forest/40 uppercase tracking-widest mb-1">Total Expedition Fee</div>
                      <div className="text-4xl font-black text-forest">
                        {selectedTrekk.price}
                        <span className="text-xs font-bold text-forest/30 ml-1">/ person</span>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto flex flex-col gap-4">
                      {selectedTrekk.slots && selectedTrekk.slots.length > 0 && (
                        <select 
                          value={selectedSlots[selectedTrekk.id] || ''}
                          onChange={(e) => setSelectedSlots({ ...selectedSlots, [selectedTrekk.id]: e.target.value })}
                          className="w-full sm:min-w-[200px] rounded-full border-forest/10 p-3 bg-cream/50 focus:outline-none focus:ring-2 focus:ring-terracotta/20 text-forest font-bold text-xs"
                        >
                          <option value="">Select departure</option>
                          {selectedTrekk.slots.map((slot: any, i: number) => (
                            <option key={i} value={i}>
                              {new Date(slot.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(slot.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </option>
                          ))}
                        </select>
                      )}

                      <Button 
                        onClick={() => {
                          const slotIndex = selectedSlots[selectedTrekk.id];
                          const slot = slotIndex !== undefined ? selectedTrekk.slots?.[parseInt(slotIndex)] : undefined;
                          globalAddToCart({
                            id: `trekk-${selectedTrekk.title.toLowerCase().replace(/\s+/g, '-')}`,
                            name: selectedTrekk.title,
                            price: selectedTrekk.price,
                            type: 'Trekk',
                            image: selectedTrekk.image,
                            dateRange: formatDateRange(selectedDate, selectedTrekk.duration, slot)
                          });
                          setSelectedTrekk(null);
                        }}
                        disabled={selectedTrekk.slots && selectedTrekk.slots.length > 0 && selectedSlots[selectedTrekk.id] === undefined}
                        className="w-full sm:min-w-[200px] bg-terracotta hover:bg-terracotta/90 text-white py-8 rounded-full text-base font-black shadow-2xl shadow-terracotta/20 uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 translate-y-0 hover:-translate-y-1"
                      >
                        Book Expedition
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
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
