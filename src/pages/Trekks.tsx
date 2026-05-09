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

  useEffect(() => {
    const q = query(collection(db, 'seo_settings'), where('path', '==', '/trekks'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) setSeo(snapshot.docs[0].data());
    }, (error) => {
      console.error("SEO settings snapshot failed:", error);
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
      <SEO 
        title={seo?.title || "Mountain Trekks"} 
        description={seo?.description || "Discover wild paths."} 
        image={seo?.image}
        type="adventure"
        trekData={selectedTrekk || (seo ? { title: seo.title, description: seo.description } : undefined)}
        seoData={seo?.seoData}
      />
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
              data-lenis-prevent
            >
            {/* Background Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none grayscale invert" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")' }} />

            {/* Immersive Img */}
            <div className="relative w-full h-[400px] md:h-[600px] shrink-0 overflow-hidden bg-forest">
              <ImageSlider 
                images={((selectedTrekk.title || '').toLowerCase().includes('valley of shadows') 
                  ? ["https://i.postimg.cc/3RsgZk5r/20260405-134046.jpg"] 
                  : [selectedTrekk.image, ...(selectedTrekk.images || [])]).filter(Boolean)} 
                alt={selectedTrekk.title}
                className="h-full w-full"
                autoSwipe={true}
                interval={4000}
              />
              
              {/* Close & Share */}
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
                  <Plus className="h-5 w-5 rotate-45" />
                </button>
              </div>
            </div>

              <div className="px-6 py-4 flex items-center justify-between text-forest/50 bg-forest/5 backdrop-blur-sm rounded-full border border-forest/10 shadow-sm mx-8 -mt-6 relative z-20">
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Gallery of the Journey</span>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-forest/30" />
                  <div className="h-1.5 w-1.5 rounded-full bg-forest/30" />
                  <div className="h-1.5 w-1.5 rounded-full bg-forest/30" />
                </div>
              </div>

              {/* Header Details Below Gallery Bar */}
              <div className="px-8 md:px-16 pt-10 text-center md:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="font-fluid text-2xl md:text-3xl text-terracotta drop-shadow-sm mb-2 block">Wild Spirit</span>
                  <h2 className="text-3xl xs:text-4xl md:text-7xl font-playfair font-black italic leading-[0.9] tracking-tighter mb-6 uppercase text-forest">
                    {selectedTrekk.title.split(' ').map((word: string, i: number) => (
                      <span key={i} className={i % 2 !== 0 ? 'text-forest/30' : ''}>{word} </span>
                    ))}
                  </h2>
                </motion.div>
                
                <div className="flex items-center justify-center md:justify-start gap-4 text-forest/40 text-[10px] md:text-xs font-black uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-terracotta" />
                    <span className="text-forest/80">Safety First</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-terracotta/20" />
                  <span className="text-forest/80 font-bold">Certified Path</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-terracotta/20" />
                  <span className="text-terracotta font-black">Adventure</span>
                </div>
              </div>

              {/* Details */}
              <div className="flex-grow bg-[#FAF9F6] relative pt-10">
                <div className="p-8 md:p-16">
                <div className="max-w-3xl mx-auto space-y-16">
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { icon: Clock, label: 'Residency', value: selectedTrekk.duration, sub: 'Mindful Pace' },
                      { icon: Mountain, label: 'Altitude', value: selectedTrekk.altitude, sub: 'Elevation' },
                      { icon: Zap, label: 'Difficulty', value: selectedTrekk.difficulty, sub: 'Effort Level' },
                      { icon: Users, label: 'Group Size', value: '4-8 People', sub: 'Shared Spirit' }
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
                    {(selectedTrekk.highlights || []).map((h: string, i: number) => (
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
                      <span className="font-fluid text-2xl text-terracotta">Soul Path</span>
                      <div className="h-px flex-grow bg-forest/5" />
                    </div>
                    <p className="text-forest/70 text-base leading-[1.8] font-medium italic mb-8">
                       "{selectedTrekk.description || "Prepare yourself for an unforgettable journey into the heart of the Himalayas. Led by experts who ensure your safety while providing a soulful connection to the mountains."}"
                    </p>

                    {/* Day-by-Day Experience Header */}
                    <div className="bg-forest/5 rounded-2xl p-6 border border-forest/10 mb-8">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="bg-terracotta/20 p-3 rounded-full">
                          <Compass className="h-6 w-6 text-terracotta" />
                        </div>
                        <h4 className="text-xl font-bold text-forest uppercase tracking-tight">The Journey Itinerary</h4>
                      </div>
                      <p className="text-xs text-forest/50 font-medium">A mindful progression through sacred landscapes.</p>
                    </div>
                  </section>

                  {/* Experience */}
                  {selectedTrekk.theExperience && (
                    <section className="bg-forest/[0.02] p-10 rounded-[3rem] border border-forest/5 relative overflow-hidden">
                      <div className="absolute -right-20 -top-20 w-64 h-64 bg-terracotta/[0.03] rounded-full blur-3xl pointer-events-none" />
                      
                      <div className="flex items-center justify-between mb-10">
                        <h4 className="font-playfair text-3xl font-black italic text-forest">The Experience</h4>
                        <Sparkles className="h-8 w-8 text-terracotta animate-pulse" />
                      </div>
                      
                      <div className="space-y-8 relative">
                        <div className="absolute left-4 top-2 bottom-2 w-px bg-forest/10" />
                        
                        {selectedTrekk.theExperience.split('\n').map((line: string, i: number) => {
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
                          {selectedTrekk.price}
                          <span className="text-[10px] font-bold uppercase tracking-widest text-forest/20 ml-2 italic">/ Person</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full lg:w-auto">
                        {(() => {
                          const slotIndex = selectedSlots[selectedTrekk.id];
                          const baseId = `trekk-${selectedTrekk.id}`;
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
                              {selectedTrekk.slots && selectedTrekk.slots.length > 0 ? (
                                <div className="relative group w-full sm:w-auto">
                                  <select 
                                    value={selectedSlots[selectedTrekk.id] || ''}
                                    onChange={(e) => setSelectedSlots({ ...selectedSlots, [selectedTrekk.id]: e.target.value })}
                                    className="w-full sm:min-w-[200px] h-14 rounded-full border border-forest/10 bg-forest/[0.03] px-6 appearance-none focus:outline-none focus:ring-4 focus:ring-forest/5 text-forest font-bold text-[10px] uppercase tracking-widest cursor-pointer group-hover:bg-forest/5 transition-all"
                                  >
                                    <option value="">Pick Date Slot</option>
                                    {selectedTrekk.slots.map((slot: any, i: number) => {
                                      const start = new Date(slot.startDate);
                                      let endStr = '';
                                      if (slot.endDate) {
                                        endStr = ` - ${new Date(slot.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
                                      } else if (selectedTrekk.duration) {
                                        const daysMatch = selectedTrekk.duration.match(/(\d+)/);
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
                                    className="w-full sm:min-w-[200px] h-14 rounded-full border border-forest/10 bg-forest/[0.03] pl-14 pr-6 focus:outline-none focus:ring-4 focus:ring-forest/5 text-forest font-bold text-[10px] uppercase tracking-widest cursor-pointer group-hover:bg-forest/5 transition-all"
                                  />
                                </div>
                              )}

                              <Button 
                                onClick={() => {
                                  const slotIndex = selectedSlots[selectedTrekk.id];
                                  const slot = slotIndex !== undefined ? selectedTrekk.slots?.[parseInt(slotIndex)] : undefined;
                                  
                                  const cartItem = {
                                    id: currentItemId,
                                    name: selectedTrekk.title,
                                    price: selectedTrekk.price,
                                    type: 'Trekk',
                                    image: selectedTrekk.image,
                                    dateRange: formatDateRange(selectedDate, selectedTrekk.duration, slot)
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
                                  selectedTrekk.isAvailable === false || 
                                  (selectedTrekk.slots && selectedTrekk.slots.length > 0 
                                    ? !selectedSlots[selectedTrekk.id] 
                                    : !selectedDate)
                                }
                                className="w-full sm:min-w-[220px] h-14 bg-terracotta hover:bg-terracotta/90 text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-terracotta/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                              >
                                <Sparkles className="h-4 w-4" />
                                Reserve Spot
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
