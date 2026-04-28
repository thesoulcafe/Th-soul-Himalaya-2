import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, Flower2, Sun, Moon, Wind, Heart, Sparkles, CheckCircle2, Home as HomeIcon, Edit2, Clock, Star, Zap, Calendar, ChevronDown, ShoppingCart, ArrowRight, Share2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import AuthModal from '@/components/AuthModal';
import { Card, CardContent } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/lib/CartContext';
import ImageSlider from '@/components/ImageSlider';
import SlotSelectionPopup from '@/components/SlotSelectionPopup';
import CustomizeTripCard from '@/components/CustomizeTripCard';
import { toast } from 'sonner';

import { SEO } from '@/components/SEO';
import { useSearchParams } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useState, useEffect, useMemo } from 'react';
import { DEFAULT_YOGA } from '@/constants';

export default function Yoga() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [packageList, setPackageList] = useState<any[]>([]);
  const [seo, setSeo] = useState<any>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>({});
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [activeSlotPackage, setActiveSlotPackage] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { cart: globalCart, addToCart: globalAddToCart, updateQuantity: globalUpdateQuantity, setPendingCartItem } = useCart();

  // Scroll lock and reset when modal/tour detail is open
  useEffect(() => {
    if (selectedPackage || activeSlotPackage) {
      document.body.style.overflow = 'hidden';
      window.scrollTo(0, 0); // Reset to top when opening details
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedPackage, activeSlotPackage]);

  const handleShare = async (pkg: any) => {
    const shareData = {
      title: `The Soul Himalaya - ${pkg.title}`,
      text: pkg.description || `Heal your soul with this retreat: ${pkg.title}`,
      url: `${window.location.origin}${window.location.pathname}?id=${pkg.id}&v=${Date.now()}`
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
    const q = query(collection(db, 'content'), where('type', '==', 'yoga'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbPackages = snapshot.empty ? [] : snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data().data,
        originalType: 'yoga'
      }));

      const sortedPackages = dbPackages.sort((a, b) => {
        const aAvail = a.isAvailable !== false;
        const bAvail = b.isAvailable !== false;
        if (aAvail && !bAvail) return -1;
        if (!aAvail && bAvail) return 1;

        const aOrder = (a.order !== undefined && a.order !== null) ? Number(a.order) : 999;
        const bOrder = (b.order !== undefined && b.order !== null) ? Number(b.order) : 999;
        return aOrder - bOrder;
      });

      setPackageList(sortedPackages);
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
    const id = searchParams.get('id');
    if (id && packageList.length > 0) {
      const pkg = packageList.find(p => p.id === id);
      if (pkg) {
        setSelectedPackage(pkg);
        const itinerarySummary = pkg.theExperience 
          ? pkg.theExperience.split('\n')
              .filter((line: string) => line.toLowerCase().startsWith('day') || line.toLowerCase().startsWith('step'))
              .slice(0, 3)
              .join(' | ')
          : '';
        const fullDescription = itinerarySummary 
          ? `${pkg.description} Plan: ${itinerarySummary}...`
          : pkg.description;
        setSeo({
          title: pkg.title,
          description: fullDescription,
          image: pkg.image,
          path: `${window.location.origin}/yoga?id=${id}`
        });
      }
    }
  }, [searchParams, packageList]);

  const filteredPackages = useMemo(() => {
    return packageList.filter(pkg => {
      if (profile?.role !== 'admin' && pkg.isAvailable === false) return false;
      return true;
    });
  }, [packageList, profile?.role]);

  return (
    <div className="pt-24">
      {seo && <SEO 
        title={seo.title || "Yoga Retreats"} 
        description={seo.description || "Heal your soul."} 
        image={seo.image}
      />}
      {/* Tagline */}
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-forest mb-2">Yoga Retreats</h1>
        <p className="text-terracotta font-medium tracking-widest uppercase text-xs">Heal Your Soul</p>
      </div>

      {/* Philosophy */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="space-y-4">
            <div className="bg-cream p-6 rounded-full w-fit mx-auto">
              <Sun className="h-8 w-8 text-terracotta" />
            </div>
            <h3 className="text-2xl font-heading font-bold text-forest">Awaken</h3>
            <p className="text-forest/60 text-sm">Start your day with the first light, aligning your body with the rhythm of nature.</p>
          </div>
          <div className="space-y-4">
            <div className="bg-cream p-6 rounded-full w-fit mx-auto">
              <Wind className="h-8 w-8 text-terracotta" />
            </div>
            <h3 className="text-2xl font-heading font-bold text-forest">Breathe</h3>
            <p className="text-forest/60 text-sm">Master the art of Pranayama, using the pure Himalayan air to cleanse your spirit.</p>
          </div>
          <div className="space-y-4">
            <div className="bg-cream p-6 rounded-full w-fit mx-auto">
              <Moon className="h-8 w-8 text-terracotta" />
            </div>
            <h3 className="text-2xl font-heading font-bold text-forest">Reflect</h3>
            <p className="text-forest/60 text-sm">End your day in deep meditation, finding peace in the silence of the peaks.</p>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-24 px-6 bg-cream">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-forest mb-4">Retreat Packages</h2>
            <p className="text-forest/60">Curated experiences for every stage of your spiritual journey.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {!hasLoaded ? (
              [1, 2, 3].map((i) => (
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
              filteredPackages.map((pkg, i) => (
                <motion.div
                  key={pkg.id || pkg.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card 
                  className="overflow-hidden border-none shadow-xl rounded-[2.5rem] bg-white h-full flex flex-col group relative"
                >
                  <div 
                    className="relative h-64 overflow-hidden cursor-pointer"
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    <ImageSlider 
                      images={((pkg.title || '').toLowerCase().includes('valley of shadows') 
                        ? ["https://i.postimg.cc/3RsgZk5r/20260405-134046.jpg"] 
                        : [pkg.image, ...(pkg.images || [])]).filter(Boolean)} 
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
                        to={pkg.id ? `/admin?tab=content&type=yoga&edit=${pkg.id}` : `/admin?tab=content&type=yoga`}
                        className="absolute top-6 right-6 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors group/edit"
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
                        profile?.role === 'admin' ? "right-16" : "right-6"
                      )}
                      title="Share Retreat"
                    >
                      <Share2 className="h-4 w-4 text-forest group-hover/share:text-terracotta transition-colors" />
                    </button>
                    <div className="absolute bottom-6 left-6" onClick={(e) => e.stopPropagation()}>
                      <span className="bg-white/90 text-forest px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                        {pkg.focus}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-8 flex-grow flex flex-col">
                    <div className="cursor-pointer" onClick={() => setSelectedPackage(pkg)}>
                      <div className="space-y-1 mb-4">
                        <div className="flex items-center text-yellow-500 text-xs font-bold">
                          <Star className="h-3 w-3 fill-current mr-1" />
                          {pkg.rating || '4.9'} ({pkg.reviews || '150'} reviews)
                        </div>
                        <div className="text-terracotta font-bold text-2xl">{pkg.price}</div>
                        <h3 className="text-2xl font-heading font-bold text-forest leading-tight group-hover:text-terracotta transition-colors">{pkg.title}</h3>
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

                      <div className="mt-auto">
                        <Button 
                          variant="ghost" 
                          className="w-full h-11 rounded-full border border-forest/10 text-forest hover:bg-forest hover:text-white font-bold text-[10px] uppercase tracking-widest transition-all duration-300 group/btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPackage(pkg);
                          }}
                        >
                          Explore <ArrowRight className="h-3 w-3 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
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

      {/* Quote Section */}
      <section className="py-32 bg-forest text-cream text-center px-6">
        <div className="max-w-3xl mx-auto">
          <Heart className="h-12 w-12 text-terracotta mx-auto mb-8" />
          <blockquote className="text-3xl md:text-5xl font-heading italic mb-8 leading-tight">
            "The mountains are the beginning and the end of all natural scenery."
          </blockquote>
          <cite className="text-terracotta font-bold uppercase tracking-widest not-italic">— John Ruskin</cite>
        </div>
      </section>      {/* Customize Section */}
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

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Yoga Package Detail Modal */}
      <AnimatePresence>
        {selectedPackage && (
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

              {/* Immersive Img */}
              <div className="relative w-full h-[400px] md:h-[600px] shrink-0 overflow-hidden bg-forest">
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
                <div className="absolute inset-0 bg-gradient-to-t from-forest/60 via-transparent to-transparent" />
                
                <div className="absolute bottom-10 left-10 right-10 text-white z-10">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="font-fluid text-2xl md:text-3xl text-terracotta drop-shadow-md mb-2 block text-center md:text-left">Divine Healing</span>
                    <h2 className="text-3xl xs:text-4xl md:text-7xl font-playfair font-black italic leading-[0.9] tracking-tighter mb-4 uppercase text-center md:text-left">
                      {selectedPackage.title.split(' ').map((word: string, i: number) => (
                        <span key={i} className={i % 2 !== 0 ? 'text-white/40' : ''}>{word} </span>
                      ))}
                    </h2>
                  </motion.div>
                  
                  <div className="flex items-center justify-center md:justify-start gap-4 text-white/70 text-xs font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-terracotta fill-current" />
                      <span>{selectedPackage.rating || '4.9'} / 5.0 ({selectedPackage.reviews || '150'} reviews)</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-terracotta" />
                    <span>{selectedPackage.focus || 'Wellness'}</span>
                  </div>
                </div>

                {/* Close & Share */}
                <div className="absolute top-6 right-6 flex gap-3 z-50">
                  <button 
                    onClick={() => handleShare(selectedPackage)}
                    className="bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20 text-white hover:bg-terracotta transition-all"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => setSelectedPackage(null)} 
                    className="bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20 text-white hover:bg-white hover:text-forest transition-all"
                  >
                    <Plus className="h-5 w-5 rotate-45" />
                  </button>
                </div>
              </div>

              {/* Details */}
              <div className="flex-grow bg-[#FAF9F6] relative">
                <div className="p-8 md:p-16">
                  <div className="max-w-3xl mx-auto space-y-16">
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { icon: Clock, label: 'Duration', value: selectedPackage.duration, sub: 'Healing Time' },
                        { icon: Sun, label: 'Sessions', value: 'Sunrise/Sunset', sub: 'Guided Flow' },
                        { icon: Heart, label: 'Level', value: 'All Levels', sub: 'Everyone Welcome' },
                        { icon: Flower2, label: 'Atmosphere', value: 'Mountain Zen', sub: 'Sacred Vibe' }
                      ].map((stat, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + (i * 0.1) }}
                          className="bg-white p-6 rounded-[2rem] border border-forest/5 shadow-sm text-center group hover:border-terracotta/20 transition-all font-sans"
                        >
                          <div className="bg-terracotta/5 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            {stat.icon && <stat.icon className="h-5 w-5 text-terracotta" />}
                          </div>
                          <div className="text-[10px] font-black text-forest/30 uppercase tracking-widest mb-1">{stat.label}</div>
                          <div className="text-sm font-bold text-forest mb-1">{stat.value}</div>
                          <div className="text-[8px] font-bold text-forest/20 uppercase">{stat.sub}</div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(selectedPackage.features || []).map((f: string, i: number) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center text-xs font-bold text-forest/70 bg-white p-5 rounded-[1.5rem] border border-forest/5 group hover:border-terracotta/20 transition-all"
                        >
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-4 shrink-0" />
                          {f}
                        </motion.div>
                      ))}
                    </div>

                    {/* Description */}
                    <section>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="h-px flex-grow bg-forest/5" />
                        <span className="font-fluid text-2xl text-terracotta">Soul Healing</span>
                        <div className="h-px flex-grow bg-forest/5" />
                      </div>
                      <p className="text-forest/70 text-base leading-[1.8] font-medium italic mb-8">
                         "{selectedPackage.description || "A transformative yoga experience set against the serene backdrop of the Himalayas. Reconnect with your true self through ancient practices and modern wisdom."}"
                      </p>

                      {/* Experience Path Header */}
                      <div className="bg-forest/5 rounded-2xl p-6 border border-forest/10 mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-terracotta/20 p-3 rounded-full">
                            <Flower2 className="h-6 w-6 text-terracotta" />
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-forest uppercase tracking-tight">The Practice</h4>
                            <p className="text-[10px] text-forest/50 font-medium font-sans">A daily flow of movement and stillnes.</p>
                          </div>
                        </div>
                        <Sparkles className="h-6 w-6 text-terracotta" />
                      </div>
                    </section>

                    {/* Experience Detail */}
                    {selectedPackage.theExperience && (
                      <section className="bg-forest/[0.02] p-10 rounded-[3rem] border border-forest/5 relative overflow-hidden">
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-terracotta/[0.03] rounded-full blur-3xl pointer-events-none" />
                        <div className="flex items-center justify-between mb-10">
                          <h4 className="font-playfair text-3xl font-black italic text-forest">The Retreat Path</h4>
                          <Sparkles className="h-8 w-8 text-terracotta animate-pulse" />
                        </div>
                        
                        <div className="space-y-8 relative">
                          <div className="absolute left-4 top-2 bottom-2 w-px bg-forest/10" />
                          
                          {selectedPackage.theExperience.split('\n').map((line: string, i: number) => {
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

                    {/* Booking Footer */}
                    <div className="border-t border-forest/5 bg-white shadow-[0_-15px_40px_rgba(0,0,0,0.03)] -mx-8 sm:-mx-10 md:-mx-16 p-6 sm:p-8 md:p-10">
                      <div className="max-w-4xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
                        <div className="text-center lg:text-left flex flex-col sm:flex-row lg:flex-col items-center lg:items-start gap-1 sm:gap-4 lg:gap-0">
                          <div className="font-fluid text-lg xs:text-xl text-terracotta -mb-1">Energy Exchange</div>
                          <div className="text-3xl xs:text-4xl font-playfair font-black italic text-forest leading-none">
                            {selectedPackage.price}
                            <span className="text-[10px] font-bold uppercase tracking-widest text-forest/20 ml-2 italic">/ Person</span>
                          </div>
                        </div>                        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full lg:w-auto">
                          {(() => {
                            const slotIndex = selectedSlots[selectedPackage.id];
                            const baseId = `yoga-${selectedPackage.id}`;
                            const currentItemId = `${baseId}${slotIndex !== undefined ? `-slot-${slotIndex}` : ''}`;
                            const quantity = getItemQuantity(currentItemId);

                            if (quantity > 0) {
                              return (
                                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                                  <div className="flex items-center gap-4 bg-forest/5 p-2 rounded-full border border-forest/10">
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-10 w-10 rounded-full text-forest hover:bg-white bg-white/50 shadow-sm transition-all"
                                      onClick={() => globalUpdateQuantity(currentItemId, quantity - 1)}
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="font-black text-forest text-lg px-2 min-w-[1.5rem] text-center">{quantity}</span>
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-10 w-10 rounded-full text-forest hover:bg-white bg-white/50 shadow-sm transition-all"
                                      onClick={() => globalUpdateQuantity(currentItemId, quantity + 1)}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <Link to="/cart" className="w-full sm:w-auto">
                                    <Button className="w-full h-14 px-8 rounded-full text-[10px] font-black uppercase tracking-widest bg-terracotta hover:bg-terracotta/90 text-white shadow-xl shadow-terracotta/20 flex items-center justify-center gap-3 group">
                                      <ShoppingCart className="h-4 w-4" /> Go to Cart <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                  </Link>
                                </div>
                              );
                            }

                            return (
                              <>
                                {selectedPackage.slots && selectedPackage.slots.length > 0 ? (
                                  <div className="relative group w-full sm:w-auto">
                                    <select 
                                      value={selectedSlots[selectedPackage.id] || ''}
                                      onChange={(e) => setSelectedSlots({ ...selectedSlots, [selectedPackage.id]: e.target.value })}
                                      className="w-full sm:min-w-[200px] h-14 rounded-full border border-forest/10 bg-forest/[0.03] px-6 appearance-none focus:outline-none focus:ring-4 focus:ring-forest/5 text-forest font-bold text-[10px] uppercase tracking-widest cursor-pointer group-hover:bg-forest/5 transition-all outline-none"
                                    >
                                      <option value="">Pick Retreat Slot</option>
                                      {selectedPackage.slots.map((slot: any, i: number) => {
                                        const start = new Date(slot.startDate);
                                        let endStr = '';
                                        if (slot.endDate) {
                                          endStr = ` - ${new Date(slot.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
                                        } else if (selectedPackage.duration) {
                                          const daysMatch = selectedPackage.duration.match(/(\d+)/);
                                          const days = daysMatch ? parseInt(daysMatch[1]) : 1;
                                          const end = new Date(start);
                                          end.setDate(start.getDate() + days - 1);
                                          endStr = ` - ${end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
                                        }
                                        return (
                                          <option key={i} value={i}>
                                            {start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}{endStr}
                                          </option>
                                        );
                                      })}
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
                                      className="w-full sm:min-w-[200px] h-14 rounded-full border border-forest/10 bg-forest/[0.03] pl-14 pr-6 focus:outline-none focus:ring-4 focus:ring-forest/5 text-forest font-bold text-[10px] uppercase tracking-widest cursor-pointer group-hover:bg-forest/5 transition-all outline-none"
                                    />
                                  </div>
                                )}

                                <Button 
                                  onClick={() => {
                                    const slotIndex = selectedSlots[selectedPackage.id];
                                    const slot = slotIndex !== undefined ? selectedPackage.slots?.[parseInt(slotIndex)] : undefined;
                                    
                                    const cartItem = {
                                      id: currentItemId,
                                      name: selectedPackage.title,
                                      price: selectedPackage.price,
                                      type: 'Yoga Retreat',
                                      image: selectedPackage.image,
                                      dateRange: formatDateRange(selectedDate, selectedPackage.duration, slot)
                                    };

                                    if (!user) {
                                      setPendingCartItem(cartItem);
                                      setShowAuthModal(true);
                                      return;
                                    }

                                    globalAddToCart(cartItem);
                                    navigate('/cart');
                                  }}
                                  disabled={
                                    selectedPackage.isAvailable === false || 
                                    (selectedPackage.slots && selectedPackage.slots.length > 0 
                                      ? !selectedSlots[selectedPackage.id] 
                                      : !selectedDate)
                                  }
                                  className="w-full sm:min-w-[220px] h-14 bg-forest hover:bg-forest/90 text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-forest/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                                >
                                  <Sparkles className="h-4 w-4" />
                                  Secure Retreat
                                </Button>
                              </>
                            );
                          })()}
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
