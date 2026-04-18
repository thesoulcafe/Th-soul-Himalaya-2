import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, Wifi, Coffee, Laptop, Mountain, CheckCircle2, ShieldCheck, Zap, Home as HomeIcon, Edit2, Clock, Calendar, ChevronDown, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import ImageSlider from '@/components/ImageSlider';
import SlotSelectionPopup from '@/components/SlotSelectionPopup';
import CustomizeTripCard from '@/components/CustomizeTripCard';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { DEFAULT_WFH } from '@/constants';

export default function WFH() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState<any[]>(DEFAULT_WFH);
  const [selectedDate, setSelectedDate] = useState('2026-06-10');
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>({});
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [activeSlotPackage, setActiveSlotPackage] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const { cart: globalCart, addToCart: globalAddToCart, updateQuantity: globalUpdateQuantity } = useCart();

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
    const q = query(collection(db, 'content'), where('type', '==', 'wfh'));
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
          return 0;
        });
        setPackages(dbItems);
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
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-forest mb-2">Work From Himalaya</h1>
        <p className="text-terracotta font-medium tracking-widest uppercase text-xs">Elevate Your Productivity</p>
      </div>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Wifi, title: 'Starlink Internet', desc: 'Reliable 100+ Mbps connection for your video calls.' },
              { icon: Zap, title: 'Power Backup', desc: 'Uninterrupted power supply with solar and generator backup.' },
              { icon: Laptop, title: 'Pro Workspaces', desc: 'Ergonomic chairs and desks in every room.' },
              { icon: Mountain, title: 'Inspiring Views', desc: 'Every workstation faces the majestic snow peaks.' }
            ].map((feature, i) => (
              <div key={i} className="text-center space-y-4">
                <div className="bg-cream p-6 rounded-3xl w-fit mx-auto">
                  <feature.icon className="h-8 w-8 text-terracotta" />
                </div>
                <h3 className="text-xl font-bold text-forest">{feature.title}</h3>
                <p className="text-forest/60 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Packages */}
      <section className="py-24 px-6 bg-cream">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-forest mb-4">Our Stay Packages</h2>
            <p className="text-forest/60">Choose the duration that fits your soul's pace.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, i) => (
              <motion.div
                key={pkg.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`relative h-full border-none shadow-xl rounded-[2.5rem] overflow-hidden ${pkg.popular ? 'bg-forest text-white ring-4 ring-terracotta/20' : 'bg-white text-forest'}`}>
                  {pkg.popular && (
                    <div className="absolute top-6 right-6">
                      <Badge className="bg-terracotta text-white border-none px-4 py-1">Most Popular</Badge>
                    </div>
                  )}
                  {pkg.isAvailable === false && (
                    <div className="absolute inset-0 bg-forest/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                      <Badge className="bg-rose-500 text-white border-none px-6 py-2 text-sm font-bold shadow-xl">
                        Currently Unavailable
                      </Badge>
                    </div>
                  )}
                  {profile?.role === 'admin' && (
                    <Link 
                      to={pkg.id ? `/admin?tab=content&type=wfh&edit=${pkg.id}` : `/admin?tab=content&type=wfh`}
                      className="absolute top-6 left-6 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors group/edit z-10"
                      title={pkg.id ? "Edit Package" : "Sync defaults to edit"}
                    >
                      <Edit2 className="h-4 w-4 text-forest group-hover/edit:text-terracotta transition-colors" />
                    </Link>
                  )}
                  <div className="relative h-48 overflow-hidden">
                    <ImageSlider 
                      images={[pkg.image, ...(pkg.images || [])].filter(Boolean)} 
                      alt={pkg.title}
                      className="h-full w-full"
                    />
                  </div>
                  <CardContent className="p-8 flex-grow flex flex-col">
                    <div>
                      <div className="space-y-1 mb-4">
                        <div className="flex items-center text-yellow-500 text-xs font-bold">
                          <Star className="h-3 w-3 fill-current mr-1" />
                          4.9 (45 reviews)
                        </div>
                        <div className="text-terracotta font-bold text-2xl">{pkg.price}</div>
                        <h3 className="text-2xl font-heading font-bold leading-tight">{pkg.title}</h3>
                      </div>

                      <div className="flex items-center gap-2 text-sm font-bold opacity-40 mb-6 uppercase tracking-wider">
                        <Clock className="h-4 w-4" />
                        {pkg.duration}
                      </div>

                      <div className="space-y-2 mb-8">
                        {pkg.features.map((feature) => (
                          <div key={feature} className="flex items-center text-sm font-medium opacity-70">
                            <div className="h-1.5 w-1.5 rounded-full bg-terracotta mr-3" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Slot Selection */}
                    {pkg.slots && pkg.slots.length > 0 && (
                      <div className={`mb-6 p-4 rounded-2xl border ${pkg.popular ? 'bg-white/5 border-white/10' : 'bg-forest/[0.03] border-forest/5'}`}>
                        <label className={`text-[10px] font-bold uppercase tracking-widest mb-2 block ${pkg.popular ? 'text-white/40' : 'text-forest/40'}`}>Available Slots</label>
                        <button 
                          onClick={() => setActiveSlotPackage(pkg)}
                          className={cn(
                            "w-full rounded-xl p-3 text-xs font-medium flex items-center justify-between transition-all group",
                            pkg.popular ? "bg-white/10 border border-white/10 text-white hover:bg-white/20" : "bg-white border border-forest/10 text-forest hover:border-terracotta/30"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className={cn("h-3.5 w-3.5", pkg.popular ? "text-terracotta" : "text-terracotta")} />
                            {selectedSlots[pkg.id] !== undefined ? (
                              <span>
                                {new Date(pkg.slots[parseInt(selectedSlots[pkg.id])].startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(pkg.slots[parseInt(selectedSlots[pkg.id])].endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            ) : (
                              <span className={pkg.popular ? "text-white/40" : "text-forest/40"}>Select a slot</span>
                            )}
                          </div>
                          <ChevronDown className={cn("h-4 w-4 transition-colors", pkg.popular ? "text-white/20 group-hover:text-white" : "text-forest/20 group-hover:text-terracotta")} />
                        </button>
                      </div>
                    )}

                    <div className="mb-6">
                      <Button 
                        variant="link" 
                        className={`${pkg.popular ? 'text-white/80 hover:text-white' : 'text-forest/60 hover:text-terracotta'} p-0 font-bold`}
                        onClick={() => setSelectedPackage(pkg)}
                      >
                        View Details
                      </Button>
                    </div>
                    <div className="flex items-center gap-3">
                      {(() => {
                        const slotIndex = selectedSlots[pkg.id];
                        const baseId = `wfh-${pkg.title.toLowerCase().replace(/\s+/g, '-')}`;
                        const currentItemId = `${baseId}${slotIndex !== undefined ? `-slot-${slotIndex}` : ''}`;
                        const quantity = getItemQuantity(currentItemId);
                        
                        return (
                          <>
                            {quantity > 0 && pkg.isAvailable !== false && (
                              <>
                                <Button 
                                  size="icon" 
                                  variant="outline" 
                                  className={`h-10 w-10 rounded-full ${pkg.popular ? 'border-white/20 text-white hover:bg-white/10' : 'border-forest/10 text-forest'}`}
                                  onClick={() => globalUpdateQuantity(currentItemId, quantity - 1)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className={`font-bold text-lg ${pkg.popular ? 'text-white' : 'text-forest'}`}>{quantity}</span>
                              </>
                            )}
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={cn(
                                "rounded-full h-12 transition-all duration-300 flex items-center justify-center overflow-hidden",
                                quantity > 0 ? "w-12 p-0 flex-grow-0" : "flex-grow",
                                pkg.isAvailable === false 
                                  ? "bg-forest/10 text-forest/30 cursor-not-allowed" 
                                  : pkg.popular ? 'bg-terracotta hover:bg-terracotta/90 text-white shadow-lg shadow-terracotta/20' : 'bg-forest hover:bg-forest/90 text-white shadow-lg hover:shadow-forest/20'
                              )}
                            >
                              <Button 
                                onClick={() => {
                                  const slot = slotIndex !== undefined ? pkg.slots?.[parseInt(slotIndex)] : undefined;
                                  globalAddToCart({
                                    id: currentItemId,
                                    name: pkg.title,
                                    price: pkg.price,
                                    type: 'WFH Stay',
                                    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=400&q=80',
                                    dateRange: formatDateRange(selectedDate, pkg.duration, slot)
                                  });
                                }}
                                disabled={pkg.isAvailable === false || (pkg.slots && pkg.slots.length > 0 && selectedSlots[pkg.id] === undefined)}
                                className="w-full h-full bg-transparent hover:bg-transparent text-inherit border-none shadow-none"
                              >
                                <AnimatePresence mode="wait">
                                  <motion.div
                                    key={quantity > 0 ? 'plus' : 'add'}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center justify-center gap-2"
                                  >
                                    {pkg.isAvailable === false ? 'Unavailable' : (quantity > 0 ? <Plus className="h-5 w-5" /> : 'Add to Cart')}
                                  </motion.div>
                                </AnimatePresence>
                              </Button>
                            </motion.div>
                          </>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex justify-center space-x-4 mb-8">
            <ShieldCheck className="h-12 w-12 text-terracotta" />
          </div>
          <h2 className="text-3xl font-heading font-bold text-forest mb-6">Safe, Secure & Soulful</h2>
          <p className="text-forest/70 text-lg leading-relaxed mb-10">
            We understand the needs of digital nomads. From high-speed internet to 24/7 security and home-cooked organic meals, 
            we ensure your stay is productive and peaceful.
          </p>
          <div className="flex flex-wrap justify-center gap-8 opacity-40 grayscale">
            {/* Mock logos */}
            <div className="font-bold text-2xl">NOMADLIST</div>
            <div className="font-bold text-2xl">WORKATION</div>
            <div className="font-bold text-2xl">HIMALAYAS</div>
          </div>
        </div>
      </section>

      {/* WFH Detail Modal */}
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

              <div className="absolute bottom-6 left-6 right-6 md:bottom-12 md:left-12 text-white">
                <Badge className="bg-terracotta text-white border-none mb-4 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg">
                  Work from the Peaks
                </Badge>
                <h2 className="text-3xl md:text-5xl font-heading font-bold leading-tight mb-2 drop-shadow-2xl">{selectedPackage.title}</h2>
                <p className="text-white/80 text-sm font-medium tracking-wide flex items-center gap-2 italic">
                  <Wifi className="h-4 w-4 text-terracotta" /> Starlink Internet Grounded
                </p>
              </div>
            </div>

            {/* Right Side: Details */}
            <div className="flex-grow p-8 md:p-12 overflow-y-auto bg-white relative">
              <button 
                onClick={() => setSelectedPackage(null)}
                className="absolute top-6 right-6 bg-forest/5 p-3 rounded-full text-forest hover:bg-terracotta hover:text-white transition-all hidden md:flex active:scale-90"
              >
                <Plus className="h-6 w-6 rotate-45" />
              </button>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-6 mb-10 pb-8 border-b border-forest/5">
                <div className="text-center md:text-left">
                  <div className="text-[9px] uppercase tracking-widest text-forest/40 font-bold mb-2">Stay Duration</div>
                  <div className="flex items-center justify-center md:justify-start gap-1.5 font-bold text-forest text-sm italic">
                    <Clock className="h-4 w-4 text-terracotta" /> {selectedPackage.duration}
                  </div>
                </div>
                <div className="text-center md:text-left border-l border-forest/10 pl-6">
                  <div className="text-[9px] uppercase tracking-widest text-forest/40 font-bold mb-2">Network Speed</div>
                  <div className="flex items-center justify-center md:justify-start gap-1.5 font-bold text-forest text-sm italic">
                    <Zap className="h-4 w-4 text-terracotta" /> 100+ Mbps Reliable
                  </div>
                </div>
              </div>

              <div className="space-y-10">
                {/* Amenities */}
                <div>
                  <h4 className="font-heading font-bold text-forest mb-4 text-sm uppercase tracking-widest">Included Amenities</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedPackage.features.map((f: string) => (
                      <div key={f} className="flex items-center text-xs font-bold text-forest/70 bg-cream/30 p-4 rounded-2xl border border-forest/5">
                        <CheckCircle2 className="h-4 w-4 text-terracotta mr-3 shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description & Itinerary */}
                <div className="space-y-8">
                  <div>
                    <h4 className="font-heading font-bold text-forest mb-4 text-sm uppercase tracking-widest">Your Private Sanctuary</h4>
                    <p className="text-forest/70 text-sm leading-relaxed font-medium">
                      {selectedPackage.description || "Experience the perfect blend of work and wellness in the heart of the Himalayas. Our WFH packages are designed to provide you with a productive environment and a peaceful retreat."}
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
                      <div className="text-xs font-bold text-forest/40 uppercase tracking-widest mb-1">Stay Investment</div>
                      <div className="text-4xl font-black text-forest">
                        {selectedPackage.price}
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
                          const baseId = `wfh-${selectedPackage.title.toLowerCase().replace(/\s+/g, '-')}`;
                          const currentItemId = `${baseId}${slotIndex !== undefined ? `-slot-${slotIndex}` : ''}`;
                          globalAddToCart({
                            id: currentItemId,
                            name: selectedPackage.title,
                            price: selectedPackage.price,
                            type: 'WFH Stay',
                            image: selectedPackage.image,
                            dateRange: formatDateRange(selectedDate, selectedPackage.duration, slot)
                          });
                          setSelectedPackage(null);
                        }}
                        disabled={selectedPackage.isAvailable === false || (selectedPackage.slots && selectedPackage.slots.length > 0 && selectedSlots[selectedPackage.id] === undefined)}
                        className="w-full sm:min-w-[200px] bg-forest hover:bg-forest/90 text-white py-8 rounded-full text-base font-black shadow-2xl shadow-forest/20 uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 translate-y-0 hover:-translate-y-1"
                      >
                        Reserve Now
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
          onSelectSlot={(index) => setSelectedSlots({ ...selectedSlots, [activeSlotPackage.id]: index })}
          onCustomize={() => navigate('/contact')}
          title={activeSlotPackage.title}
        />
      )}
    </div>
  );
}
