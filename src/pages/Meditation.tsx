import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, Flower2, Sun, Moon, Wind, Heart, Sparkles, CheckCircle2, Edit2, Clock, Zap, Calendar, ChevronDown, Star, ShoppingCart, ArrowRight, Share2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AuthModal from '@/components/AuthModal';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/lib/CartContext';
import ImageSlider from '@/components/ImageSlider';
import SlotSelectionPopup from '@/components/SlotSelectionPopup';
import CustomizeTripCard from '@/components/CustomizeTripCard';

import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { DEFAULT_MEDITATION } from '@/constants';

export default function Meditation() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [packageList, setPackageList] = useState<any[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedDate, setSelectedDate] = useState('2026-06-10');
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>({});
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [activeSlotPackage, setActiveSlotPackage] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { cart: globalCart, addToCart: globalAddToCart, updateQuantity: globalUpdateQuantity, setPendingCartItem } = useCart();

  const handleShare = async (pkg: any) => {
    const shareData = {
      title: `The Soul Himalaya - ${pkg.title}`,
      text: pkg.description || `Find your inner peace with this retreat: ${pkg.title}`,
      url: `${window.location.origin}${window.location.pathname}?id=${pkg.id}`
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
    const q = query(collection(db, 'content'), where('type', '==', 'meditation'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const dbPackages = snapshot.docs.map(doc => ({
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
        setPackageList(dbPackages);
      } else {
        // Fallback to defaults
        setPackageList([...DEFAULT_MEDITATION].sort((a, b) => {
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

  return (
    <div className="pt-24">
      {/* Tagline */}
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-forest mb-2">Meditation Retreats</h1>
        <p className="text-terracotta font-medium tracking-widest uppercase text-xs">Find Inner Peace</p>
      </div>

      {/* Philosophy */}
      <section className="py-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="space-y-4">
            <div className="bg-cream p-6 rounded-full w-fit mx-auto">
              <Sun className="h-8 w-8 text-terracotta" />
            </div>
            <h3 className="text-2xl font-heading font-bold text-forest">Silence</h3>
            <p className="text-forest/60 text-sm">Embrace the power of silence in the heart of the Himalayas.</p>
          </div>
          <div className="space-y-4">
            <div className="bg-cream p-6 rounded-full w-fit mx-auto">
              <Wind className="h-8 w-8 text-terracotta" />
            </div>
            <h3 className="text-2xl font-heading font-bold text-forest">Clarity</h3>
            <p className="text-forest/60 text-sm">Clear your mind and find focus through guided sessions.</p>
          </div>
          <div className="space-y-4">
            <div className="bg-cream p-6 rounded-full w-fit mx-auto">
              <Moon className="h-8 w-8 text-terracotta" />
            </div>
            <h3 className="text-2xl font-heading font-bold text-forest">Soul</h3>
            <p className="text-forest/60 text-sm">Connect with your true self amidst the ancient peaks.</p>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-24 px-6 bg-cream">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {!hasLoaded ? (
              [1, 2].map((i) => (
                <div key={i} className="bg-white rounded-[2.5rem] h-[500px] animate-pulse border-none shadow-xl p-0 overflow-hidden flex flex-col">
                  <div className="h-64 bg-forest/5" />
                  <div className="p-8 space-y-6">
                    <div className="h-4 bg-forest/5 rounded w-1/4" />
                    <div className="h-8 bg-forest/5 rounded w-3/4" />
                    <div className="h-20 bg-forest/5 rounded w-full" />
                  </div>
                </div>
              ))
            ) : (
              packageList.map((pkg, i) => (
                <motion.div
                  key={pkg.id || pkg.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="overflow-hidden border-none shadow-xl rounded-[2.5rem] bg-white h-full flex flex-col group">
                  <div className="relative h-64 overflow-hidden">
                    <ImageSlider 
                      images={[pkg.image, ...(pkg.images || [])].filter(Boolean)} 
                      alt={pkg.title}
                      className="h-full w-full"
                    />
                    <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                    {pkg.isAvailable === false && (
                      <div className="absolute inset-0 bg-forest/40 flex items-center justify-center z-10">
                        <Badge className="bg-rose-500 text-white border-none px-6 py-2 text-sm font-bold shadow-xl">
                          Currently Unavailable
                        </Badge>
                      </div>
                    )}
                    {profile?.role === 'admin' && (
                      <Link 
                        to={pkg.id ? `/admin?tab=content&type=meditation&edit=${pkg.id}` : `/admin?tab=content&type=meditation`}
                        className="absolute top-6 right-6 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors group/edit"
                        title={pkg.id ? "Edit Package" : "Sync defaults to edit"}
                      >
                        <Edit2 className="h-4 w-4 text-forest group-hover/edit:text-terracotta transition-colors" />
                      </Link>
                    )}

                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleShare(pkg);
                      }}
                      className={cn(
                        "absolute top-6 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors group/share z-10",
                        profile?.role === 'admin' ? "right-16" : "right-6"
                      )}
                      title="Share Retreat"
                    >
                      <Share2 className="h-4 w-4 text-forest group-hover/share:text-terracotta transition-colors" />
                    </button>
                    <div className="absolute bottom-6 left-6">
                      <span className="bg-white/90 text-forest px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                        {pkg.focus}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-8 flex-grow flex flex-col">
                    <div>
                      <div className="space-y-1 mb-4">
                        <div className="flex items-center text-yellow-500 text-xs font-bold">
                          <Star className="h-3 w-3 fill-current mr-1" />
                          4.8 (92 reviews)
                        </div>
                        <div className="text-terracotta font-bold text-2xl">{pkg.price}</div>
                        <h3 className="text-2xl font-heading font-bold text-forest leading-tight">{pkg.title}</h3>
                      </div>

                      <div className="flex items-center gap-2 text-sm font-bold text-forest/40 mb-6 uppercase tracking-wider">
                        <Clock className="h-4 w-4" />
                        {pkg.duration}
                      </div>

                      <div className="space-y-2 mb-8">
                        {pkg.features.map((feature) => (
                          <div key={feature} className="flex items-center text-sm text-forest/70 font-medium">
                            <div className="h-1.5 w-1.5 rounded-full bg-terracotta mr-3" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Slot Selection */}
                    {pkg.slots && pkg.slots.length > 0 && (
                      <div className="mb-6 p-4 rounded-2xl bg-forest/[0.03] border border-forest/5">
                        <label className="text-[10px] font-bold text-forest/40 uppercase tracking-widest mb-2 block">Available Slots</label>
                        <button 
                          onClick={() => setActiveSlotPackage(pkg)}
                          className="w-full bg-white border border-forest/10 rounded-xl p-3 text-xs text-forest font-medium flex items-center justify-between hover:border-terracotta/30 transition-all group"
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-terracotta" />
                            {selectedSlots[pkg.id] !== undefined ? (
                              <span>
                                {new Date(pkg.slots[parseInt(selectedSlots[pkg.id])].startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(pkg.slots[parseInt(selectedSlots[pkg.id])].endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            ) : (
                              <span className="text-forest/40">Select a slot</span>
                            )}
                          </div>
                          <ChevronDown className="h-4 w-4 text-forest/20 group-hover:text-terracotta transition-colors" />
                        </button>
                      </div>
                    )}

                    <div className="mb-6">
                      <Button 
                        variant="link" 
                        className="text-forest hover:text-terracotta p-0 font-bold"
                        onClick={() => setSelectedPackage(pkg)}
                      >
                        View Details
                      </Button>
                    </div>
                    <div className="flex flex-col gap-3">
                      {(() => {
                        const slotIndex = selectedSlots[pkg.id];
                        const baseId = `meditation-${pkg.title.toLowerCase().replace(/\s+/g, '-')}`;
                        const currentItemId = `${baseId}${slotIndex !== undefined ? `-slot-${slotIndex}` : ''}`;
                        const quantity = getItemQuantity(currentItemId);
                        
                        const handleBookAction = () => {
                          if (!user) {
                            setPendingCartItem({
                              id: currentItemId,
                              name: pkg.title,
                              price: pkg.price,
                              type: 'Meditation Retreat',
                              image: pkg.image,
                              dateRange: formatDateRange(selectedDate, pkg.duration, slotIndex !== undefined ? pkg.slots?.[parseInt(slotIndex)] : undefined)
                            });
                            setShowAuthModal(true);
                            return;
                          }

                          if (pkg.slots && pkg.slots.length > 0 && slotIndex === undefined) {
                            setActiveSlotPackage(pkg);
                            return;
                          }

                          const slot = slotIndex !== undefined ? pkg.slots?.[parseInt(slotIndex)] : undefined;
                          globalAddToCart({
                            id: currentItemId,
                            name: pkg.title,
                            price: pkg.price,
                            type: 'Meditation Retreat',
                            image: pkg.image,
                            dateRange: formatDateRange(selectedDate, pkg.duration, slot)
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
                                  disabled={pkg.isAvailable === false}
                                  className={cn(
                                    "h-10 px-8 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 flex-grow",
                                    pkg.isAvailable === false 
                                      ? "bg-forest/10 text-forest/30 cursor-not-allowed border-none" 
                                      : "bg-forest hover:bg-forest/90 text-white shadow-lg shadow-forest/20"
                                  )}
                                >
                                  {pkg.isAvailable === false ? 'Unavailable' : 'Book Now'}
                                </Button>
                              ) : (
                                <Link to="/checkout" className="flex-grow">
                                  <Button className="w-full h-10 px-6 rounded-full text-[10px] font-bold uppercase tracking-widest bg-terracotta hover:bg-terracotta/90 text-white shadow-lg shadow-terracotta/20 flex items-center justify-center gap-2">
                                    <ShoppingCart className="h-3 w-3" /> Go to Cart <ArrowRight className="h-3 w-3" />
                                  </Button>
                                </Link>
                              )}
                            </div>
                            {quantity > 0 && (
                              <p className="text-[9px] text-center text-forest/40 font-bold uppercase tracking-tighter">
                                Journey planned
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-32 bg-forest text-cream text-center px-6">
        <div className="max-w-3xl mx-auto">
          <Heart className="h-12 w-12 text-terracotta mx-auto mb-8" />
          <blockquote className="text-3xl md:text-5xl font-heading italic mb-8 leading-tight">
            "Quiet the mind, and the soul will speak."
          </blockquote>
          <cite className="text-terracotta font-bold uppercase tracking-widest not-italic">— Buddha</cite>
        </div>
      </section>

      {/* Meditation Detail Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-forest/60 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row border border-white/20"
          >
            {/* Left Side: Immersive Image */}
            <div className="relative w-full md:w-1/2 h-64 md:h-auto shrink-0 bg-forest overflow-hidden">
              <img src={selectedPackage.image} alt={selectedPackage.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-forest/10 md:to-forest/20" />
              
              <button 
                onClick={() => setSelectedPackage(null)}
                className="absolute top-6 left-6 bg-white/20 backdrop-blur-xl p-2.5 rounded-full shadow-2xl hover:bg-white transition-all text-white hover:text-forest md:hidden z-50 border border-white/40"
              >
                <Plus className="h-5 w-5 rotate-45" />
              </button>

              <button 
                onClick={() => handleShare(selectedPackage)}
                className="absolute top-6 left-20 bg-white/20 backdrop-blur-xl p-2.5 rounded-full shadow-2xl hover:bg-white transition-all text-white hover:text-forest md:hidden z-50 border border-white/40"
                title="Share"
              >
                <Share2 className="h-5 w-5" />
              </button>

              <div className="absolute bottom-6 left-6 right-6 md:bottom-12 md:left-12 text-white">
                <Badge className="bg-forest text-white border-white/20 mb-4 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg">
                  Silent Inner Journey
                </Badge>
                <h2 className="text-3xl md:text-5xl font-heading font-bold leading-tight mb-2 drop-shadow-2xl">{selectedPackage.title}</h2>
                <p className="text-white/80 text-sm font-medium tracking-wide flex items-center gap-2 italic">
                  <Flower2 className="h-4 w-4 text-terracotta" /> {selectedPackage.focus}
                </p>
              </div>
            </div>

            {/* Right Side: Details */}
            <div className="flex-grow p-8 md:p-12 overflow-y-auto bg-white relative">
              <div className="absolute top-6 right-6 flex items-center gap-3">
                <button 
                  onClick={() => handleShare(selectedPackage)}
                  className="bg-forest/5 p-3 rounded-full text-forest hover:bg-terracotta hover:text-white transition-all hidden md:flex active:scale-90"
                  title="Share Retreat"
                >
                  <Share2 className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => setSelectedPackage(null)}
                  className="bg-forest/5 p-3 rounded-full text-forest hover:bg-terracotta hover:text-white transition-all hidden md:flex active:scale-90"
                >
                  <Plus className="h-6 w-6 rotate-45" />
                </button>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-6 mb-10 pb-8 border-b border-forest/5">
                <div className="text-center md:text-left">
                  <div className="text-[9px] uppercase tracking-widest text-forest/40 font-bold mb-2">Retreat Duration</div>
                  <div className="flex items-center justify-center md:justify-start gap-1.5 font-bold text-forest text-sm italic">
                    <Clock className="h-4 w-4 text-terracotta" /> {selectedPackage.duration}
                  </div>
                </div>
                <div className="text-center md:text-left border-l border-forest/10 pl-6">
                  <div className="text-[9px] uppercase tracking-widest text-forest/40 font-bold mb-2">Practice Type</div>
                  <div className="flex items-center justify-center md:justify-start gap-1.5 font-bold text-forest text-sm italic">
                    <Sparkles className="h-4 w-4 text-terracotta" /> Meditative Silence
                  </div>
                </div>
              </div>

              <div className="space-y-10">
                {/* Highlights/Features */}
                <div>
                  <h4 className="font-heading font-bold text-forest mb-4 text-sm uppercase tracking-widest">Retreat Inclusions</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedPackage.features.map((f: string) => (
                      <div key={f} className="flex items-center text-xs font-bold text-forest/70 bg-cream/30 p-4 rounded-2xl border border-forest/5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-3 shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description & Itinerary */}
                <div className="space-y-8">
                  <div>
                    <h4 className="font-heading font-bold text-forest mb-4 text-sm uppercase tracking-widest">The Soul Journey</h4>
                    <p className="text-forest/70 text-sm leading-relaxed font-medium">
                      {selectedPackage.description || "Find your inner stillness amidst the majestic Himalayas. Our meditation retreats offer a sanctuary for self-reflection and spiritual growth, guided by experienced practitioners."}
                    </p>
                  </div>

                  {selectedPackage.theExperience && (
                    <div className="bg-cream/20 p-6 md:p-8 rounded-[2rem] border border-forest/5">
                      <h4 className="font-heading font-bold text-forest mb-6 text-sm uppercase tracking-widest flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-terracotta" /> Day-by-Day Experience
                      </h4>
                      <div className="space-y-4">
                        {selectedPackage.theExperience.split('\n').map((line: string, i: number) => {
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

                {/* Booking Footer */}
                <div className="pt-8 border-t border-forest/5">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
                    <div className="text-center sm:text-left">
                      <div className="text-xs font-bold text-forest/40 uppercase tracking-widest mb-1">Retreat Investment</div>
                      <div className="text-4xl font-black text-forest">
                        {selectedPackage.price}
                        <span className="text-xs font-bold text-forest/30 ml-1">/ person</span>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto flex flex-col gap-4">
                      {selectedPackage.slots && selectedPackage.slots.length > 0 && (
                        <select 
                          value={selectedSlots[selectedPackage.id] || ''}
                          onChange={(e) => setSelectedSlots({ ...selectedSlots, [selectedPackage.id]: e.target.value })}
                          className="w-full sm:min-w-[200px] rounded-full border-forest/10 p-3 bg-cream/50 focus:outline-none focus:ring-2 focus:ring-terracotta/20 text-forest font-bold text-xs"
                        >
                          <option value="">Select departure</option>
                          {selectedPackage.slots.map((slot: any, i: number) => (
                            <option key={i} value={i}>
                              {new Date(slot.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(slot.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </option>
                          ))}
                        </select>
                      )}

                      <Button 
                        onClick={() => {
                          const slotIndex = selectedSlots[selectedPackage.id];
                          const slot = slotIndex !== undefined ? selectedPackage.slots?.[parseInt(slotIndex)] : undefined;
                          globalAddToCart({
                            id: `meditation-${selectedPackage.title.toLowerCase().replace(/\s+/g, '-')}`,
                            name: selectedPackage.title,
                            price: selectedPackage.price,
                            type: 'Meditation Retreat',
                            image: selectedPackage.image,
                            dateRange: formatDateRange(selectedDate, selectedPackage.duration, slot)
                          });
                          setSelectedPackage(null);
                        }}
                        disabled={selectedPackage.slots && selectedPackage.slots.length > 0 && selectedSlots[selectedPackage.id] === undefined}
                        className="w-full sm:min-w-[200px] bg-forest hover:bg-forest/90 text-white py-8 rounded-full text-base font-black shadow-2xl shadow-forest/20 uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 translate-y-0 hover:-translate-y-1"
                      >
                        Enroll Now
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
      {activeSlotPackage && (
        <SlotSelectionPopup 
          isOpen={!!activeSlotPackage}
          onClose={() => setActiveSlotPackage(null)}
          slots={activeSlotPackage.slots}
          selectedSlotIndex={selectedSlots[activeSlotPackage.id]}
          onSelectSlot={(index) => {
            setSelectedSlots({ ...selectedSlots, [activeSlotPackage.id]: index });
            // Auto add after selection
            const slot = activeSlotPackage.slots[index];
            const baseId = `meditation-${activeSlotPackage.title.toLowerCase().replace(/\s+/g, '-')}`;
            globalAddToCart({
              id: `${baseId}-slot-${index}`,
              name: activeSlotPackage.title,
              price: activeSlotPackage.price,
              type: 'Meditation Retreat',
              image: activeSlotPackage.image,
              dateRange: formatDateRange(selectedDate, activeSlotPackage.duration, slot)
            });
            setActiveSlotPackage(null);
          }}
          onCustomize={() => navigate('/contact')}
          title={activeSlotPackage.title}
        />
      )}

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
