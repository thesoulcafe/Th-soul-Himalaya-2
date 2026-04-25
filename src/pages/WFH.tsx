import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, Wifi, Coffee, Laptop, Mountain, CheckCircle2, ShieldCheck, Zap, Home as HomeIcon, Edit2, Clock, Calendar, ChevronDown, Star, Sparkles, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import ImageSlider from '@/components/ImageSlider';
import SlotSelectionPopup from '@/components/SlotSelectionPopup';
import CustomizeTripCard from '@/components/CustomizeTripCard';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { DEFAULT_WFH } from '@/constants';

export default function WFH() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState<any[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>({});
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [activeSlotPackage, setActiveSlotPackage] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const { cart: globalCart, addToCart: globalAddToCart, updateQuantity: globalUpdateQuantity } = useCart();

  const handleShare = async (pkg: any) => {
    const shareData = {
      title: `The Soul Himalaya - ${pkg.title}`,
      text: pkg.description || `Elevate your productivity with this: ${pkg.title}`,
      url: `${window.location.origin}${window.location.pathname}?id=${pkg.id}`
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

          const aOrder = (a.order !== undefined && a.order !== null) ? Number(a.order) : 999;
          const bOrder = (b.order !== undefined && b.order !== null) ? Number(b.order) : 999;
          return aOrder - bOrder;
        });
        setPackages(dbItems);
      } else {
        // Fallback to defaults
        setPackages([...DEFAULT_WFH].sort((a, b) => {
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
            {!hasLoaded ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-[2.5rem] h-[400px] animate-pulse border-none shadow-xl p-0 overflow-hidden flex flex-col">
                  <div className="p-8 space-y-6">
                    <div className="h-4 bg-forest/5 rounded w-1/4" />
                    <div className="h-10 bg-forest/5 rounded w-1/2" />
                    <div className="h-24 bg-forest/5 rounded w-full" />
                  </div>
                </div>
              ))
            ) : (
              packages.map((pkg, i) => (
                <motion.div
                  key={pkg.id || pkg.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card 
                  onClick={() => setSelectedPackage(pkg)}
                  className={`relative h-full border-none shadow-xl rounded-[2.5rem] overflow-hidden cursor-pointer group ${pkg.popular ? 'bg-forest text-white ring-4 ring-terracotta/20' : 'bg-white text-forest'}`}
                >
                  {pkg.popular && (
                    <div className="absolute top-6 right-6 z-10">
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
                      onClick={(e) => e.stopPropagation()}
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
                      profile?.role === 'admin' ? "left-16" : "left-6"
                    )}
                    title="Share Package"
                  >
                    <Share2 className="h-4 w-4 text-forest group-hover/share:text-terracotta transition-colors" />
                  </button>
                  <div className="relative h-48 overflow-hidden">
                    <ImageSlider 
                      images={((pkg.title || '').toLowerCase().includes('valley of shadows') 
                        ? ["https://i.postimg.cc/3RsgZk5r/20260405-134046.jpg"] 
                        : [pkg.image, ...(pkg.images || [])]).filter(Boolean)} 
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
                        <h3 className="text-2xl font-heading font-bold leading-tight group-hover:text-terracotta transition-colors">{pkg.title}</h3>
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
                      <div 
                        className={`mb-6 p-4 rounded-2xl border ${pkg.popular ? 'bg-white/5 border-white/10' : 'bg-forest/[0.03] border-forest/5'}`}
                        onClick={(e) => e.stopPropagation()}
                      >
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
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPackage(pkg);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    ...

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
            ))
          )}
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
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-8 bg-forest/80 backdrop-blur-xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-[#FAF9F6] rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.3)] max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col lg:flex-row border border-white/20 relative"
          >
            {/* Background Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none grayscale invert" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")' }} />

            {/* Left Side: Immersive Img */}
            <div className="relative w-full lg:w-[45%] h-72 lg:h-auto shrink-0 overflow-hidden bg-forest">
              <ImageSlider 
                images={((selectedPackage.title || '').toLowerCase().includes('valley of shadows') 
                  ? ["https://i.postimg.cc/3RsgZk5r/20260405-134046.jpg"] 
                  : [selectedPackage.image, ...(selectedPackage.images || [])]).filter(Boolean)} 
                alt={selectedPackage.title}
                className="h-full w-full"
                autoSwipe={true}
                interval={4000}
              />
              
              {/* Decorative Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/20 to-transparent" />
              
              <div className="absolute bottom-10 left-10 right-10 text-white z-10 text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="font-fluid text-3xl md:text-4xl text-terracotta drop-shadow-md mb-2 block">Nomad Haven</span>
                  <h2 className="text-3xl xs:text-4xl md:text-6xl font-playfair font-black italic leading-[0.9] tracking-tighter mb-4 uppercase">
                    {selectedPackage.title.split(' ').map((word: string, i: number) => (
                      <span key={i} className={i % 2 !== 0 ? 'text-white/40' : ''}>{word} </span>
                    ))}
                  </h2>
                </motion.div>
                
                <div className="flex items-center justify-center lg:justify-start gap-4 text-white/70 text-xs font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4 text-terracotta" />
                    <span>Starlink Net</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-terracotta" />
                  <span>Productive Soul</span>
                </div>
              </div>

              {/* Close for Mobile */}
              <div className="absolute top-6 left-6 flex gap-3 lg:hidden z-50">
                <button onClick={() => setSelectedPackage(null)} className="bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20 text-white hover:bg-white hover:text-forest transition-all shadow-xl">
                  <Plus className="h-5 w-5 rotate-45" />
                </button>
              </div>
            </div>

            {/* Right Side: Details */}
            <div className="flex-grow flex flex-col h-full bg-[#FAF9F6] relative">
              {/* Desktop Close/Share */}
              <div className="absolute top-8 right-8 hidden lg:flex items-center gap-4 z-20">
                <button 
                  onClick={() => handleShare(selectedPackage)}
                  className="bg-forest/5 p-4 rounded-full text-forest hover:bg-terracotta hover:text-white transition-all transform hover:rotate-12 shadow-sm"
                >
                  <Share2 className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => setSelectedPackage(null)}
                  className="bg-forest/5 p-4 rounded-full text-forest hover:bg-forest hover:text-white transition-all transform hover:-rotate-12 shadow-sm"
                >
                  <Plus className="h-6 w-6 rotate-45" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto custom-scrollbar p-8 md:p-14" data-lenis-prevent>
                <div className="max-w-3xl mx-auto space-y-16">
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: Clock, label: 'Residency', value: selectedPackage.duration, sub: 'Soulful Stay' },
                      { icon: Zap, label: 'Vibe', value: 'Creative', sub: 'High Elevation' }
                    ].map((stat, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + (i * 0.1) }}
                        className="bg-white p-6 rounded-[2rem] border border-forest/5 shadow-sm text-center group hover:border-terracotta/20 transition-all cursor-default"
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

                  {/* Amenities Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedPackage.features.map((f: string, i: number) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center text-xs font-bold text-forest/70 bg-white p-5 rounded-[1.5rem] border border-forest/5 group hover:border-emerald-500/20 transition-all"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-4 shrink-0 transition-transform group-hover:scale-125" />
                        {f}
                      </motion.div>
                    ))}
                  </div>

                  {/* Description */}
                  <section className="relative">
                    <div className="absolute -left-6 top-0 bottom-0 w-1 bg-terracotta/20 rounded-full" />
                    <div className="flex items-center gap-4 mb-6">
                      <span className="font-fluid text-2xl text-terracotta">Himalayan Office</span>
                      <div className="h-px flex-grow bg-forest/5" />
                    </div>
                    <p className="text-forest/70 text-base leading-[1.8] font-medium italic">
                       "{selectedPackage.description || "Experience the perfect blend of work and wellness. Designed to provide a productive environment and a peaceful retreat."}"
                    </p>
                  </section>

                  {/* Experience Rhythm */}
                  {selectedPackage.theExperience && (
                    <section className="bg-forest/[0.02] p-10 rounded-[3rem] border border-forest/5 relative overflow-hidden">
                      <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/[0.03] rounded-full blur-3xl pointer-events-none" />
                      
                      <div className="flex items-center justify-between mb-10">
                        <h4 className="font-playfair text-3xl font-black italic text-forest">The Weekly Flow</h4>
                        <Laptop className="h-8 w-8 text-emerald-600/40 animate-pulse" />
                      </div>
                      
                      <div className="space-y-8 relative">
                        <div className="absolute left-4 top-2 bottom-2 w-px bg-forest/10" />
                        
                        {selectedPackage.theExperience.split('\n').map((line: string, i: number) => {
                          if (!line.trim()) return null;
                          const isDay = line.toLowerCase().startsWith('day') || line.toLowerCase().startsWith('week');
                          return (
                            <div key={i} className={cn("relative transition-all hover:translate-x-1", isDay ? "pl-12 mt-10 first:mt-0" : "pl-12 mt-2")}>
                              {isDay && <div className="absolute left-3 top-1.5 w-2 h-2 rounded-full bg-emerald-500 z-10 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />}
                              <div className={cn("text-xs leading-relaxed", isDay ? "text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em] mb-1" : "text-forest/60 font-medium")}>
                                {line.trim()}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}
                </div>
              </div>

              {/* Booking Footer - Creative Style */}
              <div className="p-6 sm:p-8 md:p-10 border-t border-forest/5 bg-white shadow-[0_-15px_40px_rgba(0,0,0,0.03)]">
                <div className="max-w-4xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
                  <div className="text-center lg:text-left flex flex-col sm:flex-row lg:flex-col items-center lg:items-start gap-1 sm:gap-4 lg:gap-0">
                    <div className="font-fluid text-lg xs:text-xl text-terracotta -mb-1">Productivity Gift</div>
                    <div className="text-3xl xs:text-4xl font-playfair font-black italic text-forest leading-none">
                      {selectedPackage.price}
                      <span className="text-[10px] font-bold uppercase tracking-widest text-forest/20 ml-2 italic">/ Package</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full lg:w-auto">
                    {selectedPackage.slots && selectedPackage.slots.length > 0 ? (
                      <div className="relative group w-full sm:w-auto">
                        <select 
                          value={selectedSlots[selectedPackage.id] || ''}
                          onChange={(e) => setSelectedSlots({ ...selectedSlots, [selectedPackage.id]: e.target.value })}
                          className="w-full sm:min-w-[200px] h-14 rounded-full border border-forest/10 bg-forest/[0.03] px-6 appearance-none focus:outline-none focus:ring-4 focus:ring-forest/5 text-forest font-bold text-[10px] uppercase tracking-widest cursor-pointer group-hover:bg-forest/5 transition-all"
                        >
                          <option value="">Select Season</option>
                          {selectedPackage.slots.map((slot: any, i: number) => (
                            <option key={i} value={i}>
                              {new Date(slot.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
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
                        navigate('/checkout');
                      }}
                      disabled={
                        selectedPackage.isAvailable === false || 
                        (selectedPackage.slots && selectedPackage.slots.length > 0 
                          ? !selectedSlots[selectedPackage.id] 
                          : !selectedDate)
                      }
                      className="w-full sm:min-w-[220px] h-14 bg-forest hover:bg-[#1a2f26] text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-forest/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 group"
                    >
                      <Coffee className="h-4 w-4 transition-transform group-hover:rotate-12" />
                      Reserve Space
                    </Button>
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
