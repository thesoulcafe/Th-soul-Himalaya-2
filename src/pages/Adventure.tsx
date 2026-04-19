import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, Wind, Waves, MapPin, Shield, Zap, ArrowRight, Home as HomeIcon, Star, Edit2, Calendar, ChevronDown, Clock, Sparkles, CheckCircle2, ShoppingCart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthModal from '@/components/AuthModal';
import { Card, CardContent } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import ImageSlider from '@/components/ImageSlider';
import SlotSelectionPopup from '@/components/SlotSelectionPopup';
import CustomizeTripCard from '@/components/CustomizeTripCard';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { DEFAULT_ADVENTURE } from '@/constants';

export default function Adventure() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<any[]>(DEFAULT_ADVENTURE);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { cart: globalCart, addToCart: globalAddToCart, updateQuantity: globalUpdateQuantity, setPendingCartItem } = useCart();

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
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error("Sharing failed:", err);
      }
    }
  };
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>({});
  const [activeSlotActivity, setActiveSlotActivity] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const selectedDate = new Date().toISOString();

  useEffect(() => {
    const q = query(collection(db, 'content'), where('type', '==', 'adventure'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const dbItems = snapshot.docs.map(doc => ({
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
        setActivities(dbItems);
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
            {activities.map((activity, i) => (
              <motion.div
                key={activity.title}
                initial={{ opacity: 0, x: i === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card className="overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white h-full flex flex-col group">
                    <div className="relative h-80 overflow-hidden">
                      <ImageSlider 
                        images={[activity.image, ...(activity.images || [])].filter(Boolean)} 
                        alt={activity.title}
                        className="h-full w-full"
                      />
                      <div className="absolute top-6 left-6 bg-white/90 p-3 rounded-2xl shadow-lg flex items-center gap-3 z-10">
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
                        <h3 className="text-2xl font-heading font-bold text-forest leading-tight">{activity.title}</h3>
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
                      <div className="mb-8 space-y-3">
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
                          onClick={() => setActiveSlotActivity(activity)}
                        >
                          View Details
                        </Button>
                      </div>
                      <div className="flex flex-col gap-3">
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
                                    onClick={handleBookAction}
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

      {/* Adventure Detail Modal (Reuse Slot Popup but with more detail) */}
      {activeSlotActivity && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-forest/60 backdrop-blur-md">
           <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row border border-white/20"
          >
            {/* Left Side: Immersive Image */}
            <div className="relative w-full md:w-1/2 h-64 md:h-auto shrink-0 bg-forest overflow-hidden">
              <img src={activeSlotActivity.image} alt={activeSlotActivity.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-forest/10 md:to-forest/20" />
              
              <button 
                onClick={() => setActiveSlotActivity(null)}
                className="absolute top-6 left-6 bg-white/20 backdrop-blur-xl p-2.5 rounded-full shadow-2xl hover:bg-white transition-all text-white hover:text-forest md:hidden z-50 border border-white/40"
              >
                <Plus className="h-5 w-5 rotate-45" />
              </button>

              <button 
                onClick={() => handleShare(activeSlotActivity)}
                className="absolute top-6 left-20 bg-white/20 backdrop-blur-xl p-2.5 rounded-full shadow-2xl hover:bg-white transition-all text-white hover:text-forest md:hidden z-50 border border-white/40"
                title="Share"
              >
                <Share2 className="h-5 w-5" />
              </button>

              <div className="absolute bottom-6 left-6 right-6 md:bottom-12 md:left-12 text-white">
                <Badge className="bg-terracotta text-white border-none mb-4 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg">
                  High Adrenaline Adventure
                </Badge>
                <h2 className="text-3xl md:text-5xl font-heading font-bold leading-tight mb-2 drop-shadow-2xl">{activeSlotActivity.title}</h2>
                <p className="text-white/80 text-sm font-medium tracking-wide flex items-center gap-2 italic">
                  <Shield className="h-4 w-4 text-terracotta" /> Certified Safety Standards
                </p>
              </div>
            </div>

            {/* Right Side: Details */}
            <div className="flex-grow p-8 md:p-12 overflow-y-auto bg-white relative">
              <div className="absolute top-6 right-6 flex items-center gap-3">
                <button 
                  onClick={() => handleShare(activeSlotActivity)}
                  className="bg-forest/5 p-3 rounded-full text-forest hover:bg-terracotta hover:text-white transition-all hidden md:flex active:scale-90"
                  title="Share Adventure"
                >
                  <Share2 className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => setActiveSlotActivity(null)}
                  className="bg-forest/5 p-3 rounded-full text-forest hover:bg-terracotta hover:text-white transition-all hidden md:flex active:scale-90"
                >
                  <Plus className="h-6 w-6 rotate-45" />
                </button>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-6 mb-10 pb-8 border-b border-forest/5">
                <div className="text-center md:text-left">
                  <div className="text-[9px] uppercase tracking-widest text-forest/40 font-bold mb-2">Activity Duration</div>
                  <div className="flex items-center justify-center md:justify-start gap-1.5 font-bold text-forest text-sm italic">
                    <Clock className="h-4 w-4 text-terracotta" /> {activeSlotActivity.duration}
                  </div>
                </div>
                <div className="text-center md:text-left border-l border-forest/10 pl-6">
                  <div className="text-[9px] uppercase tracking-widest text-forest/40 font-bold mb-2">Experience Level</div>
                  <div className="flex items-center justify-center md:justify-start gap-1.5 font-bold text-forest text-sm italic">
                    <Sparkles className="h-4 w-4 text-terracotta" /> No Prior Exp. Needed
                  </div>
                </div>
              </div>

              <div className="space-y-10">
                {/* Highlights */}
                <div>
                  <h4 className="font-heading font-bold text-forest mb-4 text-sm uppercase tracking-widest">Adventure Highlights</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeSlotActivity.highlights.map((h: string) => (
                      <div key={h} className="flex items-center text-xs font-bold text-forest/70 bg-cream/30 p-4 rounded-2xl border border-forest/5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-3 shrink-0" />
                        {h}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description & Itinerary */}
                <div className="space-y-8">
                  <div>
                    <h4 className="font-heading font-bold text-forest mb-4 text-sm uppercase tracking-widest">The Soul Journey</h4>
                    <p className="text-forest/70 text-sm leading-relaxed font-medium">
                      {activeSlotActivity.description || "Prepare yourself for an unforgettable journey into the heart of the Himalayas. Our adventure activities are led by certified professionals who ensure your safety while providing the ultimate adrenaline rush."}
                    </p>
                  </div>

                  {activeSlotActivity.theExperience && (
                    <div className="bg-cream/20 p-6 md:p-8 rounded-[2rem] border border-forest/5">
                      <h4 className="font-heading font-bold text-forest mb-6 text-sm uppercase tracking-widest flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-terracotta" /> Day-by-Day Experience
                      </h4>
                      <div className="space-y-4">
                        {activeSlotActivity.theExperience.split('\n').map((line: string, i: number) => {
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
                      <div className="text-xs font-bold text-forest/40 uppercase tracking-widest mb-1">Per Person Rate</div>
                      <div className="text-4xl font-black text-forest">
                        {activeSlotActivity.price}
                      </div>
                    </div>

                    <div className="w-full sm:w-auto flex flex-col gap-4">
                      {activeSlotActivity.slots && activeSlotActivity.slots.length > 0 && (
                        <select 
                          value={selectedSlots[activeSlotActivity.id] || ''}
                          onChange={(e) => setSelectedSlots({ ...selectedSlots, [activeSlotActivity.id]: e.target.value })}
                          className="w-full sm:min-w-[200px] rounded-full border-forest/10 p-3 bg-cream/50 focus:outline-none focus:ring-2 focus:ring-terracotta/20 text-forest font-bold text-xs"
                        >
                          <option value="">Select departure</option>
                          {activeSlotActivity.slots.map((slot: any, i: number) => (
                            <option key={i} value={i}>
                              {new Date(slot.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(slot.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </option>
                          ))}
                        </select>
                      )}

                      <Button 
                        onClick={() => {
                          const slotIndex = selectedSlots[activeSlotActivity.id];
                          const slot = slotIndex !== undefined ? activeSlotActivity.slots?.[parseInt(slotIndex)] : undefined;
                          const baseId = `adventure-${activeSlotActivity.title.toLowerCase().replace(/\s+/g, '-')}`;
                          const currentItemId = `${baseId}${slotIndex !== undefined ? `-slot-${slotIndex}` : ''}`;
                          globalAddToCart({
                            id: currentItemId,
                            name: activeSlotActivity.title,
                            price: activeSlotActivity.price,
                            type: 'Adventure Activity',
                            image: activeSlotActivity.image,
                            dateRange: formatDateRange(selectedDate, activeSlotActivity.duration, slot)
                          });
                          setActiveSlotActivity(null);
                        }}
                        disabled={activeSlotActivity.isAvailable === false || (activeSlotActivity.slots && activeSlotActivity.slots.length > 0 && selectedSlots[activeSlotActivity.id] === undefined)}
                        className="w-full sm:min-w-[200px] bg-terracotta hover:bg-terracotta/90 text-white py-8 rounded-full text-base font-black shadow-2xl shadow-terracotta/20 uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 translate-y-0 hover:-translate-y-1"
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
