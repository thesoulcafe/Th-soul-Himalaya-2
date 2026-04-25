import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, Wind, Waves, MapPin, Shield, Zap, ArrowRight, Home as HomeIcon, Star, Edit2, Calendar, Compass, ChevronDown, Clock, Sparkles, CheckCircle2, ShoppingCart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthModal from '@/components/AuthModal';
import { Card, CardContent } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import ImageSlider from '@/components/ImageSlider';
import SlotSelectionPopup from '@/components/SlotSelectionPopup';
import CustomizeTripCard from '@/components/CustomizeTripCard';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { DEFAULT_ADVENTURE } from '@/constants';

export default function Adventure() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<any[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { cart: globalCart, addToCart: globalAddToCart, updateQuantity: globalUpdateQuantity, setPendingCartItem } = useCart();

  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>({});
  const [activeSlotActivity, setActiveSlotActivity] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  
  // Scroll lock when modal is open
  useEffect(() => {
    if (activeSlotActivity) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeSlotActivity]);
  const [selectedDate, setSelectedDate] = useState('');

  const handleShare = async (activity: any) => {
    const shareData = {
      title: `The Soul Himalaya - ${activity.title}`,
      text: activity.description || `Feel the adrenaline with this: ${activity.title}`,
      url: `${window.location.origin}${window.location.pathname}?id=${activity.id}`
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Thrill Shared", {
          description: "Link copied to clipboard!",
        });
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error("Sharing failed:", err);
      }
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'content'), where('type', '==', 'adventure'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const dbItems = snapshot.docs.map(doc => ({
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
        setActivities(dbItems);
      } else {
        // Fallback to defaults
        setActivities([...DEFAULT_ADVENTURE].sort((a, b) => {
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

  const getIcon = (title: string) => {
    if (title.toLowerCase().includes('para')) return Wind;
    if (title.toLowerCase().includes('raft')) return Waves;
    return Zap;
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

  return (
    <div className="pt-24">
      {/* Tagline */}
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-forest mb-2">Adventure Sports</h1>
        <p className="text-terracotta font-medium tracking-widest uppercase text-xs">Feel The Adrenaline</p>
      </div>

      {/* Activities Grid */}
      <section className="py-24 px-6 bg-cream">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {!hasLoaded ? (
              [1, 2].map((i) => (
                <div key={i} className="bg-white rounded-[2.5rem] h-[600px] animate-pulse border-none shadow-2xl p-0 overflow-hidden flex flex-col">
                  <div className="h-80 bg-forest/5" />
                  <div className="p-10 space-y-6">
                    <div className="h-4 bg-forest/5 rounded w-1/4" />
                    <div className="h-10 bg-forest/5 rounded w-3/4" />
                    <div className="h-32 bg-forest/5 rounded w-full" />
                  </div>
                </div>
              ))
            ) : (
              activities.map((activity, i) => (
                <motion.div
                  key={activity.id || activity.title}
                initial={{ opacity: 0, x: i === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card 
                  onClick={() => setActiveSlotActivity(activity)}
                  className="overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white h-full flex flex-col group cursor-pointer"
                >
                    <div className="relative h-80 overflow-hidden">
                      <ImageSlider 
                        images={((activity.title || '').toLowerCase().includes('valley of shadows') 
                          ? ["https://i.postimg.cc/3RsgZk5r/20260405-134046.jpg"] 
                          : [activity.image, ...(activity.images || [])]).filter(Boolean)} 
                        alt={activity.title}
                        className="h-full w-full"
                      />
                      <div 
                        className="absolute top-6 left-6 bg-white/90 p-3 rounded-2xl shadow-lg flex items-center gap-3 z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {React.createElement(getIcon(activity.title), { className: "h-6 w-6 text-terracotta" })}
                        {activity.isAvailable === false && (
                          <Badge className="bg-rose-500 text-white border-none px-3 py-1 text-[10px] font-bold rounded-full">
                            Unavailable
                          </Badge>
                        )}
                      </div>
                      {activity.isAvailable === false && (
                        <div className="absolute inset-0 bg-forest/40 flex items-center justify-center z-10">
                          <Badge className="bg-rose-500 text-white border-none px-6 py-2 text-sm font-bold shadow-xl">
                            Currently Unavailable
                          </Badge>
                        </div>
                      )}
                      {profile?.role === 'admin' && (
                        <Link 
                          to={activity.id ? `/admin?tab=content&type=adventure&edit=${activity.id}` : `/admin?tab=content&type=adventure`}
                          className="absolute top-6 right-6 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors group/edit z-10"
                          title={activity.id ? "Edit Activity" : "Sync defaults to edit"}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Edit2 className="h-4 w-4 text-forest group-hover/edit:text-terracotta transition-colors" />
                        </Link>
                      )}

                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleShare(activity);
                        }}
                        className={cn(
                          "absolute top-6 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors group/share z-10",
                          profile?.role === 'admin' ? "right-16" : "right-6"
                        )}
                        title="Share Adventure"
                      >
                        <Share2 className="h-4 w-4 text-forest group-hover/share:text-terracotta transition-colors" />
                      </button>
                    </div>
                  <CardContent className="p-8 flex-grow flex flex-col">
                    <div>
                      <div className="space-y-1 mb-4">
                        <div className="flex items-center text-yellow-500 text-xs font-bold">
                          <Star className="h-3 w-3 fill-current mr-1" />
                          4.7 (85 reviews)
                        </div>
                        <div className="text-terracotta font-bold text-2xl">{activity.price}</div>
                        <h3 className="text-2xl font-heading font-bold text-forest leading-tight group-hover:text-terracotta transition-colors">{activity.title}</h3>
                      </div>

                      <div className="flex items-center gap-2 text-sm font-bold text-forest/40 mb-6 uppercase tracking-wider">
                        <Clock className="h-4 w-4" />
                        {activity.duration}
                      </div>

                      <div className="space-y-2 mb-8">
                        {activity.highlights.map((h) => (
                          <div key={h} className="flex items-center text-sm text-forest/70 font-medium">
                            <div className="h-1.5 w-1.5 rounded-full bg-terracotta mr-3" />
                            {h}
                          </div>
                        ))}
                      </div>
                    </div>

                    {activity.slots && activity.slots.length > 0 && (
                      <div className="mb-8 space-y-3" onClick={(e) => e.stopPropagation()}>
                        <label className="text-[10px] font-bold text-forest/40 uppercase tracking-widest ml-1">Select Available Slot</label>
                        <button 
                          onClick={() => setActiveSlotActivity(activity)}
                          className="w-full h-12 rounded-xl bg-forest/[0.03] border border-forest/5 flex items-center justify-between px-4 hover:border-terracotta/30 transition-all group"
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-terracotta" />
                            {selectedSlots[activity.id] !== undefined ? (
                              <span className="text-sm font-medium text-forest">
                                {formatDateRange('', '', activity.slots[parseInt(selectedSlots[activity.id])])}
                              </span>
                            ) : (
                              <span className="text-sm font-medium text-forest/40">Choose a date range...</span>
                            )}
                          </div>
                          <ChevronDown className="h-4 w-4 text-forest/20 group-hover:text-terracotta transition-colors" />
                        </button>
                      </div>
                    )}

                    <div className="space-y-3 mb-10 flex-grow">
                      {activity.highlights.map((h) => (
                        <div key={h} className="flex items-center text-sm text-forest/80">
                          <Zap className="h-4 w-4 text-terracotta mr-3" />
                          {h}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-6 border-t border-forest/5">
                      <div className="flex flex-col">
                        <div className="text-xs uppercase tracking-widest font-bold text-forest/40">
                          Duration: {activity.duration}
                        </div>
                        <Button 
                          variant="link" 
                          className="text-forest/60 hover:text-terracotta p-0 font-bold h-auto w-fit text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveSlotActivity(activity);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                      <div className="flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
                        {(() => {
                          const slotIndex = selectedSlots[activity.id];
                          const baseId = `adventure-${activity.title.toLowerCase().replace(/\s+/g, '-')}`;
                          const currentItemId = `${baseId}${slotIndex !== undefined ? `-slot-${slotIndex}` : ''}`;
                          const quantity = getItemQuantity(currentItemId);
                          
                          const handleBookAction = () => {
                            if (!user) {
                              setPendingCartItem({
                                id: currentItemId,
                                name: activity.title,
                                price: activity.price,
                                type: 'Adventure Activity',
                                image: activity.image,
                                dateRange: formatDateRange(selectedDate, activity.duration, slotIndex !== undefined ? activity.slots?.[parseInt(slotIndex)] : undefined)
                              });
                              setShowAuthModal(true);
                              return;
                            }

                            if (activity.slots && activity.slots.length > 0 && slotIndex === undefined) {
                              setActiveSlotActivity(activity);
                              return;
                            }

                            const slot = slotIndex !== undefined ? activity.slots?.[parseInt(slotIndex)] : undefined;
                            globalAddToCart({
                              id: currentItemId,
                              name: activity.title,
                              price: activity.price,
                              type: 'Adventure Activity',
                              image: activity.image,
                              dateRange: formatDateRange(selectedDate, activity.duration, slot)
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
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleBookAction();
                                    }}
                                    disabled={activity.isAvailable === false}
                                    className={cn(
                                      "h-10 px-8 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 flex-grow",
                                      activity.isAvailable === false 
                                        ? "bg-forest/10 text-forest/30 cursor-not-allowed border-none" 
                                        : "bg-terracotta hover:bg-terracotta/90 text-white shadow-lg shadow-terracotta/20"
                                    )}
                                  >
                                    {activity.isAvailable === false ? 'Unavailable' : 'Add to Cart'}
                                  </Button>
                                ) : (
                                  <Link to="/checkout" className="flex-grow" onClick={(e) => e.stopPropagation()}>
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

      {/* Safety Section */}
      <section className="py-24 bg-forest text-cream">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <Shield className="h-16 w-16 text-terracotta mb-8" />
            <h2 className="text-4xl font-heading font-bold mb-6">Your Safety is Our Priority</h2>
            <p className="text-cream/70 text-lg leading-relaxed mb-8">
              We work only with certified pilots and experienced rafters who have years of experience in the Himalayan terrain. 
              All equipment is regularly inspected and meets international safety standards.
            </p>
            <ul className="space-y-4">
              {[
                'Certified Professional Guides',
                'Top-of-the-line Safety Gear',
                'Comprehensive Pre-flight/Pre-raft Briefing',
                'Emergency Response Team on Standby'
              ].map((item) => (
                <li key={item} className="flex items-center space-x-3">
                  <div className="h-1.5 w-1.5 bg-terracotta rounded-full" />
                  <span className="text-cream/90">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1530866495547-08497ff13ee2?auto=format&fit=crop&w=1000&q=80"
                alt="Safety Gear"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>
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

      {/* Adventure Detail Modal */}
      <AnimatePresence>
        {activeSlotActivity && (
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
              data-lenis-prevent
            >
            {/* Background Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none grayscale invert" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")' }} />

            {/* Immersive Img - Now part of scroll flow */}
            <div className="relative w-full h-[400px] md:h-[600px] shrink-0 overflow-hidden bg-forest">
              <ImageSlider 
                images={((activeSlotActivity.title || '').toLowerCase().includes('valley of shadows') 
                  ? ["https://i.postimg.cc/3RsgZk5r/20260405-134046.jpg"] 
                  : [activeSlotActivity.image, ...(activeSlotActivity.images || [])]).filter(Boolean)} 
                alt={activeSlotActivity.title}
                className="h-full w-full"
                autoSwipe={true}
                interval={4000}
              />
              
              {/* Decorative Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-forest/60 via-transparent to-transparent" />
              
              <div className="absolute bottom-10 left-10 right-10 text-white z-10">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="font-fluid text-2xl md:text-3xl text-terracotta drop-shadow-md mb-2 block text-center md:text-left">Wild Spirit</span>
                  <h2 className="text-3xl xs:text-4xl md:text-7xl font-playfair font-black italic leading-[0.9] tracking-tighter mb-4 uppercase text-center md:text-left">
                    {activeSlotActivity.title.split(' ').map((word: string, i: number) => (
                      <span key={i} className={i % 2 !== 0 ? 'text-white/40' : ''}>{word} </span>
                    ))}
                  </h2>
                </motion.div>
                
                <div className="flex items-center justify-center md:justify-start gap-4 text-white/70 text-xs font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-terracotta" />
                    <span>Safety First</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-terracotta" />
                  <span>Certified Journey</span>
                </div>
              </div>

              {/* Close & Share */}
              <div className="absolute top-6 right-6 flex gap-3 z-50">
                <button 
                  onClick={() => handleShare(activeSlotActivity)}
                  className="bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20 text-white hover:bg-terracotta transition-all"
                >
                  <Share2 className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => setActiveSlotActivity(null)} 
                  className="bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20 text-white hover:bg-white hover:text-forest transition-all"
                >
                  <Plus className="h-5 w-5 rotate-45" />
                </button>
              </div>
            </div>

            {/* Details - Scroll continues here */}
            <div className="flex-grow bg-[#FAF9F6] relative">
              <div className="p-8 md:p-16">
                <div className="max-w-3xl mx-auto space-y-16">
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: Clock, label: 'Rush Time', value: activeSlotActivity.duration, sub: 'Pure Action' },
                      { icon: Zap, label: 'Energy', value: 'Level 10', sub: 'High Altitude' }
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

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeSlotActivity.highlights.map((h: string, i: number) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center text-xs font-bold text-forest/70 bg-white p-5 rounded-[1.5rem] border border-forest/5 group hover:border-terracotta/20 transition-all"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-4 shrink-0" />
                        {h}
                      </motion.div>
                    ))}
                  </div>

                  {/* Description */}
                  <section>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-px flex-grow bg-forest/5" />
                      <span className="font-fluid text-2xl text-terracotta">Force of Nature</span>
                      <div className="h-px flex-grow bg-forest/5" />
                    </div>
                    <p className="text-forest/70 text-base leading-[1.8] font-medium italic mb-8">
                       "{activeSlotActivity.description || "Prepare yourself for an unforgettable journey into the heart of the Himalayas. Led by experts who ensure your safety while providing the ultimate rush."}"
                    </p>

                    {/* Day-by-Day Experience Header */}
                    <div className="bg-forest/5 rounded-2xl p-6 border border-forest/10 mb-8">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="bg-terracotta/20 p-3 rounded-full">
                          <Zap className="h-6 w-6 text-terracotta" />
                        </div>
                        <h4 className="text-xl font-bold text-forest uppercase tracking-tight">The Adrenaline Timeline</h4>
                      </div>
                      <p className="text-xs text-forest/50 font-medium">Every moment is meticulously planned for maximum thrill and absolute safety.</p>
                    </div>
                  </section>

                  {/* Experience */}
                  {activeSlotActivity.theExperience && (
                    <section className="bg-forest/[0.02] p-10 rounded-[3rem] border border-forest/5 relative overflow-hidden">
                      <div className="absolute -right-20 -top-20 w-64 h-64 bg-terracotta/[0.03] rounded-full blur-3xl pointer-events-none" />
                      
                      <div className="flex items-center justify-between mb-10">
                        <h4 className="font-playfair text-3xl font-black italic text-forest">The Experience</h4>
                        <Zap className="h-8 w-8 text-terracotta animate-bounce" />
                      </div>
                      
                      <div className="space-y-8 relative">
                        <div className="absolute left-4 top-2 bottom-2 w-px bg-forest/10" />
                        
                        {activeSlotActivity.theExperience.split('\n').map((line: string, i: number) => {
                          if (!line.trim()) return null;
                          const isDay = line.toLowerCase().startsWith('day') || line.toLowerCase().startsWith('step');
                          return (
                            <div key={i} className={cn("relative", isDay ? "pl-12 mt-10 first:mt-0" : "pl-12 mt-2")}>
                              {isDay && <div className="absolute left-3 top-1.5 w-2 h-2 rounded-full bg-terracotta z-10" />}
                              <div className={cn("text-xs leading-relaxed", isDay ? "text-[10px] font-black text-terracotta uppercase tracking-[0.2em] mb-1" : "text-forest/60 font-medium")}>
                                {line.trim()}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}
                  {/* Booking Footer - Creative Style */}
                  <div className="border-t border-forest/5 bg-white shadow-[0_-15px_40px_rgba(0,0,0,0.03)] -mx-8 sm:-mx-10 md:-mx-16 p-6 sm:p-8 md:p-10">
                    <div className="max-w-4xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
                      <div className="text-center lg:text-left flex flex-col sm:flex-row lg:flex-col items-center lg:items-start gap-1 sm:gap-4 lg:gap-0">
                        <div className="font-fluid text-lg xs:text-xl text-terracotta -mb-1">Adrenaline Pack</div>
                        <div className="text-3xl xs:text-4xl font-playfair font-black italic text-forest leading-none">
                          {activeSlotActivity.price}
                          <span className="text-[10px] font-bold uppercase tracking-widest text-forest/20 ml-2 italic">/ Person</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full lg:w-auto">
                        {activeSlotActivity.slots && activeSlotActivity.slots.length > 0 ? (
                          <div className="relative group w-full sm:w-auto">
                            <select 
                              value={selectedSlots[activeSlotActivity.id] || ''}
                              onChange={(e) => setSelectedSlots({ ...selectedSlots, [activeSlotActivity.id]: e.target.value })}
                              className="w-full sm:min-w-[200px] h-14 rounded-full border border-forest/10 bg-forest/[0.03] px-6 appearance-none focus:outline-none focus:ring-4 focus:ring-forest/5 text-forest font-bold text-[10px] uppercase tracking-widest cursor-pointer group-hover:bg-forest/5 transition-all"
                            >
                              <option value="">Pick Date Slot</option>
                              {activeSlotActivity.slots.map((slot: any, i: number) => (
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
                              value={selectedDate}
                              onChange={(e) => setSelectedDate(e.target.value)}
                              className="w-full sm:min-w-[200px] h-14 rounded-full border border-forest/10 bg-forest/[0.03] pl-14 pr-6 focus:outline-none focus:ring-4 focus:ring-forest/5 text-forest font-bold text-[10px] uppercase tracking-widest cursor-pointer group-hover:bg-forest/5 transition-all"
                            />
                          </div>
                        )}

                        <Button 
                          onClick={() => {
                            const slotIndex = selectedSlots[activeSlotActivity.id];
                            const slot = slotIndex !== undefined ? activeSlotActivity.slots?.[parseInt(slotIndex)] : undefined;
                            
                            globalAddToCart({
                              id: `adventure-${activeSlotActivity.id}`,
                              name: activeSlotActivity.title,
                              price: activeSlotActivity.price,
                              type: 'Adventure Activity',
                              image: activeSlotActivity.image,
                              dateRange: formatDateRange(selectedDate, activeSlotActivity.duration, slot)
                            });
                            setActiveSlotActivity(null);
                            navigate('/checkout');
                          }}
                          disabled={
                            activeSlotActivity.isAvailable === false || 
                            (activeSlotActivity.slots && activeSlotActivity.slots.length > 0 
                              ? !selectedSlots[activeSlotActivity.id] 
                              : !selectedDate)
                          }
                          className="w-full sm:min-w-[220px] h-14 bg-terracotta hover:bg-terracotta/90 text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-terracotta/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
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
    </div>
  );
}
