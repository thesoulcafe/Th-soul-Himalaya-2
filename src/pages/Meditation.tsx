import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, Flower2, Sun, Moon, Wind, Heart, Sparkles, CheckCircle2, Edit2, Clock, Zap, Calendar, ChevronDown, Star, Stars, ShoppingCart, ArrowRight, Share2, Search, X } from 'lucide-react';
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
import { toast } from 'sonner';

import { SEO } from '@/components/SEO';
import PackageDetailModal from '@/components/PackageDetailModal';
import { useSearchParams } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useState, useEffect, useMemo } from 'react';
import { DEFAULT_MEDITATION } from '@/constants';

export default function Meditation() {
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
  const [searchQuery, setSearchQuery] = useState('');
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
      text: pkg.description || `Find your inner peace with this retreat: ${pkg.title}`,
      url: `${window.location.origin}${window.location.pathname}?id=${pkg.id}&v=${Date.now()}`
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Zen Shared", {
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
    const q = query(collection(db, 'content'), where('type', '==', 'meditation'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbPackages = snapshot.empty ? [] : snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data().data,
        originalType: 'meditation'
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
    }, (error) => {
      console.error("Meditation packages snapshot failed:", error);
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
    }, (error) => {
      console.error("Meditation config snapshot failed:", error);
    });
    return () => unsubscribe();
  }, []);

  const filteredPackages = useMemo(() => {
    return packageList.filter(pkg => {
      if (profile?.role !== 'admin' && pkg.isAvailable === false) return false;
      const title = String(pkg.title || pkg.name || '').toLowerCase();
      const description = String(pkg.description || '').toLowerCase();
      
      const itineraryText = Array.isArray(pkg.itinerary) 
        ? pkg.itinerary.map((day: any) => `${day.title || ''} ${day.activities || ''} ${day.description || ''}`).join(' ').toLowerCase()
        : (typeof pkg.theExperience === 'string' ? pkg.theExperience.toLowerCase() : '');
        
      const highlightsText = Array.isArray(pkg.highlights) || Array.isArray(pkg.features)
        ? [...(pkg.highlights || []), ...(pkg.features || [])].join(' ').toLowerCase()
        : '';

      const searchContent = `${title} ${description} ${itineraryText} ${highlightsText}`;
      const query = searchQuery.toLowerCase();

      return searchContent.includes(query);
    });
  }, [packageList, profile?.role, searchQuery]);

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
          path: `${window.location.origin}/meditation?id=${id}`,
          seoData: pkg.seoData
        });
      }
    }
  }, [searchParams, packageList]);

  return (
    <div className="pt-24">
      {seo && <SEO 
        title={seo.title || "Meditation Retreats"} 
        description={seo.description || "Find inner peace."} 
        image={seo.image}
        seoData={seo.seoData}
      />}
      {/* Tagline */}
      <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-forest mb-2">Meditation Retreats</h1>
        <p className="text-terracotta font-medium tracking-widest uppercase text-xs mb-8">Find Inner Peace</p>
        
        {/* Search input */}
        <div className="relative group md:max-w-md mx-auto transition-all duration-300 z-50">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-forest/20 group-focus-within:text-terracotta transition-colors" />
          <input 
            type="text"
            placeholder="FIND YOUR RETREAT..."
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3 bg-white border border-forest/10 rounded-full text-xs font-black text-forest placeholder:text-forest/20 focus:outline-none focus:ring-4 focus:ring-forest/5 focus:border-terracotta/30 transition-all tracking-widest uppercase shadow-sm"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-forest/20 hover:text-terracotta transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          {/* Search Suggestions Dropdown */}
          {searchQuery && filteredPackages.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-forest/10 overflow-hidden max-h-[60vh] overflow-y-auto text-left">
              {filteredPackages.slice(0, 5).map(pkg => (
                <div 
                  key={pkg.id}
                  className="flex items-start gap-4 p-4 hover:bg-forest/5 cursor-pointer border-b border-forest/5 last:border-0 transition-colors"
                  onClick={() => {
                    setSelectedPackage(pkg);
                    setSearchQuery('');
                  }}
                >
                  <img 
                    src={pkg.image || pkg.images?.[0] || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b'} 
                    alt={pkg.title || pkg.name} 
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="text-xs font-black text-forest">{pkg.title || pkg.name}</h4>
                    <p className="text-[10px] text-forest/60 line-clamp-2 mt-1">{pkg.description}</p>
                  </div>
                </div>
              ))}
              {filteredPackages.length > 5 && (
                <div className="p-3 text-center text-[10px] uppercase tracking-widest font-black text-forest/40 bg-forest/5">
                  +{filteredPackages.length - 5} more results
                </div>
              )}
            </div>
          )}
        </div>
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
                        ? ["https://i.postimg.cc/TYqctVvr/IMG-8144.jpg"] 
                        : [pkg.image, ...(pkg.images || [])]).filter(Boolean)} 
                      alt={pkg.title}
                      className="h-full w-full"
                      showThumbnails={true}
                      thumbnailClassName="absolute bottom-2 left-0 right-0 z-20 pointer-events-auto"
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
                        <div className="flex items-center gap-3">
                          <Link 
                            to="/gallery" 
                            onClick={(e) => e.stopPropagation()}
                            className="text-[9px] font-black text-terracotta hover:text-forest transition-colors uppercase tracking-[0.2em] underline underline-offset-4 decoration-terracotta/30"
                          >
                            Review
                          </Link>
                        </div>
                        <h3 className="text-2xl font-heading font-bold text-forest leading-tight group-hover:text-terracotta transition-colors">{pkg.title}</h3>
                      </div>

                      <div className="flex items-center gap-2 text-sm font-bold text-forest/40 mb-6 uppercase tracking-wider">
                        <Clock className="h-4 w-4" />
                        {pkg.duration}
                      </div>

                      <div className="flex items-start justify-between gap-4 mb-8">
                        <div className="space-y-2 flex-grow">
                          {pkg.features.slice(0, 3).map((feature) => (
                            <div key={feature} className="flex items-center text-sm text-forest/70 font-medium">
                              <div className="h-1.5 w-1.5 rounded-full bg-terracotta mr-3" />
                              {feature}
                            </div>
                          ))}
                        </div>
                        <div className="shrink-0 bg-terracotta/5 px-4 py-2 rounded-2xl border border-terracotta/5 flex flex-col items-center justify-center">
                          <span className="text-[8px] font-black text-terracotta/40 uppercase tracking-tighter mb-1">Exchange</span>
                          <span className="text-lg font-black text-terracotta">{pkg.price}</span>
                        </div>
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
            "Quiet the mind, and the soul will speak."
          </blockquote>
          <cite className="text-terracotta font-bold uppercase tracking-widest not-italic">— Buddha</cite>
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

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <PackageDetailModal
        isOpen={!!selectedPackage}
        onClose={() => setSelectedPackage(null)}
        pkg={selectedPackage}
        onRequireAuth={() => setShowAuthModal(true)}
      />
    </div>
  );
}
