import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, Mountain, Compass, Map, Info, AlertTriangle, CheckCircle2, Home as HomeIcon, Edit2, Clock, Star, Zap, Calendar, ChevronDown, Sparkles, ShoppingCart, ArrowRight, Share2, X, Users, Shield, Search } from 'lucide-react';
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
import { toast } from 'sonner';

import { SEO } from '@/components/SEO';
import PackageDetailModal from '@/components/PackageDetailModal';
import { useSearchParams } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useState, useEffect, useMemo } from 'react';
import { DEFAULT_TREKKS } from '@/constants';

export default function Trekks() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [trekkList, setTrekkList] = useState<any[]>([]);
  const [seo, setSeo] = useState<any>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>({});
  const [selectedTrekk, setSelectedTrekk] = useState<any>(null);
  const [activeSlotTrekk, setActiveSlotTrekk] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { cart: globalCart, addToCart: globalAddToCart, updateQuantity: globalUpdateQuantity, setPendingCartItem } = useCart();

  // Scroll lock and reset when modal/tour detail is open
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
      url: `${window.location.origin}${window.location.pathname}?id=${trekk.id}&v=${Date.now()}`
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
    const q = query(collection(db, 'content'), where('type', 'in', ['trekk', 'trek']));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbTrekks = snapshot.empty ? [] : snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data().data,
        originalType: doc.data().type
      }));

      const sortedTrekks = dbTrekks.sort((a, b) => {
        const aAvail = a.isAvailable !== false;
        const bAvail = b.isAvailable !== false;
        if (aAvail && !bAvail) return -1;
        if (!aAvail && bAvail) return 1;

        const aOrder = (a.order !== undefined && a.order !== null) ? Number(a.order) : 999;
        const bOrder = (b.order !== undefined && b.order !== null) ? Number(b.order) : 999;
        return aOrder - bOrder;
      });

      setTrekkList(sortedTrekks);
      setHasLoaded(true);
    }, (error) => {
      console.error("Trekks content snapshot failed:", error);
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
      console.error("Config snapshot failed:", error);
    });
    return () => unsubscribe();
  }, []);

  const getItemQuantity = (id: string) => {
    return globalCart.find(i => i.id === id)?.quantity || 0;
  };

  useEffect(() => {
    const id = searchParams.get('id');
    if (id && trekkList.length > 0) {
      const trekk = trekkList.find(t => t.id === id);
      if (trekk) {
        setSelectedTrekk(trekk); // Auto-open modal

        // Detailed description for OG tags including day-by-day
        let detailedDesc = trekk.description || "";
        if (trekk.theExperience) {
          const itineraryBrief = trekk.theExperience.split('\n')
            .filter((l: string) => l.toLowerCase().startsWith('day') || l.toLowerCase().startsWith('step'))
            .slice(0, 5)
            .join(' | ');
          if (itineraryBrief) {
            detailedDesc = `${detailedDesc}\n\nExperience: ${itineraryBrief}`;
          }
        }

        setSeo({
          title: trekk.title,
          description: detailedDesc,
          image: trekk.image,
          path: `${window.location.origin}/trekks?id=${id}`,
          seoData: trekk.seoData
        });
      }
    }
  }, [searchParams, trekkList]);

  const filteredTrekks = useMemo(() => {
    return trekkList.filter(trekk => {
      if (profile?.role !== 'admin' && trekk.isAvailable === false) return false;
      const title = String(trekk.title || trekk.name || '').toLowerCase();
      const description = String(trekk.description || '').toLowerCase();
      
      const itineraryText = Array.isArray(trekk.itinerary) 
        ? trekk.itinerary.map((day: any) => `${day.title || ''} ${day.activities || ''} ${day.description || ''}`).join(' ').toLowerCase()
        : (typeof trekk.theExperience === 'string' ? trekk.theExperience.toLowerCase() : '');
        
      const highlightsText = Array.isArray(trekk.highlights) || Array.isArray(trekk.features)
        ? [...(trekk.highlights || []), ...(trekk.features || [])].join(' ').toLowerCase()
        : '';

      const searchContent = `${title} ${description} ${itineraryText} ${highlightsText}`;
      const query = searchQuery.toLowerCase();

      return searchContent.includes(query);
    });
  }, [trekkList, profile?.role, searchQuery]);

  return (
    <div className="pt-24">
      {seo && <SEO 
        title={seo.title || "Mountain Trekks"} 
        description={seo.description || "Discover wild paths."} 
        image={seo.image}
        type="adventure"
        trekData={selectedTrekk || { title: seo.title, description: seo.description }}
        seoData={seo.seoData}
      />}
      {/* Tagline */}
      <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-forest mb-2">Mountain Trekks</h1>
        <p className="text-terracotta font-medium tracking-widest uppercase text-xs mb-8">Discover Wild Paths</p>
        
        {/* Search input */}
        <div className="relative group md:max-w-md mx-auto transition-all duration-300 z-50">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-forest/20 group-focus-within:text-terracotta transition-colors" />
          <input 
            type="text"
            placeholder="FIND YOUR TREKK..."
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
          {searchQuery && filteredTrekks.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-forest/10 overflow-hidden max-h-[60vh] overflow-y-auto text-left">
              {filteredTrekks.slice(0, 5).map(trekk => (
                <div 
                  key={trekk.id}
                  className="flex items-start gap-4 p-4 hover:bg-forest/5 cursor-pointer border-b border-forest/5 last:border-0 transition-colors"
                  onClick={() => {
                    setSelectedTrekk(trekk);
                    setSearchQuery('');
                  }}
                >
                  <img 
                    src={trekk.image || trekk.images?.[0] || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b'} 
                    alt={trekk.title || trekk.name} 
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="text-xs font-black text-forest">{trekk.title || trekk.name}</h4>
                    <p className="text-[10px] text-forest/60 line-clamp-2 mt-1">{trekk.description}</p>
                  </div>
                </div>
              ))}
              {filteredTrekks.length > 5 && (
                <div className="p-3 text-center text-[10px] uppercase tracking-widest font-black text-forest/40 bg-forest/5">
                  +{filteredTrekks.length - 5} more results
                </div>
              )}
            </div>
          )}
        </div>
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
              filteredTrekks.map((trekk, index) => (
                <motion.div
                  key={trekk.id || trekk.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="overflow-hidden border border-forest/5 shadow-lg group h-full flex flex-col md:flex-row p-0 rounded-[2rem] bg-white transition-all duration-500 hover:shadow-2xl relative"
                >
                  {/* Left Side: Image */}
                  <div 
                    className="relative w-full md:w-1/2 aspect-[4/3] md:aspect-auto overflow-hidden cursor-pointer"
                    onClick={() => setSelectedTrekk(trekk)}
                  >
                    <ImageSlider 
                      images={((trekk.title || '').toLowerCase().includes('valley of shadows') 
                        ? ["https://i.postimg.cc/3RsgZk5r/20260405-134046.jpg"] 
                        : [trekk.image, ...(trekk.images || [])]).filter(Boolean)} 
                      alt={trekk.title}
                      className="h-full w-full transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div 
                      className="absolute top-4 left-4 flex flex-col gap-2 z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
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
                        onClick={(e) => e.stopPropagation()}
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
                  </div>

                  {/* Right Side: Details */}
                  <CardContent className="p-8 md:p-12 w-full md:w-1/2 flex flex-col">
                    <div className="flex-grow cursor-pointer" onClick={() => setSelectedTrekk(trekk)}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Link 
                            to="/gallery" 
                            onClick={(e) => e.stopPropagation()}
                            className="text-[9px] font-black text-terracotta hover:text-forest transition-colors uppercase tracking-[0.2em] underline underline-offset-4 decoration-terracotta/30"
                          >
                            Review
                          </Link>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-forest/40 uppercase tracking-widest">
                          <Clock className="h-3 w-3 text-terracotta" />
                          {trekk.duration}
                        </div>
                      </div>

                      <h3 className="text-2xl md:text-3xl font-heading font-bold text-forest leading-tight mb-6 group-hover:text-terracotta transition-colors">
                        {trekk.title}
                      </h3>

                      <div className="flex items-start justify-between gap-4 mb-8">
                        <div className="flex flex-wrap gap-6 flex-grow">
                          <div className="flex items-center text-xs font-bold text-forest">
                            <Mountain className="h-4 w-4 text-terracotta mr-3 shrink-0" />
                            {trekk.altitude}
                          </div>
                          <div className="flex items-center text-xs font-bold text-forest">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-3 shrink-0" />
                            Expert Guides
                          </div>
                        </div>
                        <div className="shrink-0 bg-terracotta/5 px-4 py-2 rounded-2xl border border-terracotta/5 flex flex-col items-center justify-center">
                          <span className="text-[8px] font-black text-terracotta/40 uppercase tracking-tighter mb-1">Exchange</span>
                          <span className="text-lg font-black text-terracotta">{trekk.price}</span>
                        </div>
                      </div>

                      <p className="text-forest/60 text-sm leading-relaxed mb-8 line-clamp-3">
                        {trekk.description}
                      </p>

                      <div className="mt-auto">
                        <Button 
                          variant="ghost" 
                          className="w-full h-11 rounded-full border border-forest/10 text-forest hover:bg-forest hover:text-white font-bold text-[10px] uppercase tracking-widest transition-all duration-300 group/btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTrekk(trekk);
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
        isOpen={!!selectedTrekk}
        onClose={() => setSelectedTrekk(null)}
        pkg={selectedTrekk}
        onRequireAuth={() => setShowAuthModal(true)}
      />
    </div>
  );
}
