import { cn } from '@/lib/utils';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Minus, 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  Star, 
  Stars,
  Compass,
  CheckCircle2, 
  Home as HomeIcon, 
  Edit2, 
  Zap, 
  ChevronDown, 
  Sparkles, 
  ShoppingCart, 
  ArrowRight,
  Search,
  SlidersHorizontal,
  X,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthModal from '@/components/AuthModal';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useCart } from '@/lib/CartContext';
import ImageSlider from '@/components/ImageSlider';
import SlotSelectionPopup from '@/components/SlotSelectionPopup';
import CustomizeTripCard from '@/components/CustomizeTripCard';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';

import { 
  DEFAULT_TOURS, 
  DEFAULT_YOGA, 
  DEFAULT_MEDITATION 
} from '@/constants';

import { useAuth } from '@/lib/AuthContext';

export default function Tours() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tours, setTours] = useState<any[]>([]); // Initialize empty to avoid default flash
  const [hasLoaded, setHasLoaded] = useState(false); // Track initial load
  const [activeCategory, setActiveCategory] = useState('All');
  const [seo, setSeo] = useState<any>(null); // Added SEO state
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>({});
  const [selectedTour, setSelectedTour] = useState<any>(null);
  const [activeSlotTour, setActiveSlotTour] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState(50000);
  const [maxDuration, setMaxDuration] = useState(30);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { cart: globalCart, addToCart: globalAddToCart, updateQuantity: globalUpdateQuantity, setPendingCartItem } = useCart();

  // Scroll lock and reset when modal/tour detail is open
  useEffect(() => {
    if (selectedTour || activeSlotTour) {
      document.body.style.overflow = 'hidden';
      window.scrollTo(0, 0); // Reset to top when opening details
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedTour, activeSlotTour]);

  useEffect(() => {
    const q = query(collection(db, 'seo_settings'), where('path', '==', '/tours'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) setSeo(snapshot.docs[0].data());
    }, (error) => {
      console.error("SEO settings snapshot failed:", error);
    });
    return () => unsubscribe();
  }, []);

  const handleShare = async (tour: any) => {
    const shareData = {
      title: `The Soul Himalaya - ${tour.title}`,
      text: tour.description || `Check out this amazing journey: ${tour.title}`,
      url: `${window.location.origin}${window.location.pathname}?id=${tour.id}&v=${Date.now()}`
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Connection Shared", {
          description: "Link copied to clipboard!",
        });
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error("Sharing failed:", err);
      }
    }
  };

  const getItemQuantity = (id: string) => {
    return globalCart.find(i => i.id === id)?.quantity || 0;
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
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const q = query(collection(db, 'content'), where('type', 'in', ['tour', 'yoga', 'meditation']));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbItems = snapshot.empty ? [] : snapshot.docs.map(doc => {
        const type = doc.data().type;
        const data = doc.data().data;
        return {
          id: doc.id,
          ...data,
          originalType: type,
          category: (type === 'yoga' || type === 'meditation') ? 'Wellness' : (data.category || 'All'),
          highlights: data.highlights || data.features || []
        };
      }).filter(item => {
        const title = (item.title || item.name || '').toLowerCase();
        return !title.includes('photography & cafe narrative');
      });

      const sortedItems = dbItems.sort((a, b) => {
        const aAvail = a.isAvailable !== false;
        const bAvail = b.isAvailable !== false;
        if (aAvail && !bAvail) return -1;
        if (!aAvail && bAvail) return 1;

        const aOrder = (a.order !== undefined && a.order !== null) ? Number(a.order) : 999;
        const bOrder = (b.order !== undefined && b.order !== null) ? Number(b.order) : 999;
        return aOrder - bOrder;
      });

      setTours(sortedItems);
      setHasLoaded(true);
    }, (error) => {
      console.error("Content snapshot failed:", error);
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

  const categories = useMemo(() => {
    const list = config?.tourCategories || ['Romantic', 'Wellness', 'Corporate', 'Backpacker', 'Adventure', 'Mix-up'];
    return ['All', ...list];
  }, [config]);

  const parsePrice = (priceStr: string) => {
    return parseInt(priceStr.replace(/[₹,]/g, '')) || 0;
  };

  const parseDuration = (durationStr: string) => {
    const match = durationStr.match(/(\d+)/);
    return match ? parseInt(match[0]) : 0;
  };

  const filteredTours = useMemo(() => {
    return tours.filter(tour => {
      // Hide unavailable tours for non-admins
      if (profile?.role !== 'admin' && tour.isAvailable === false) return false;

      const title = String(tour.title || tour.name || '').toLowerCase();
      const description = String(tour.description || '').toLowerCase();
      
      const itineraryText = Array.isArray(tour.itinerary) 
        ? tour.itinerary.map((day: any) => `${day.title || ''} ${day.activities || ''} ${day.description || ''}`).join(' ').toLowerCase()
        : '';
        
      const highlightsText = Array.isArray(tour.highlights) || Array.isArray(tour.features)
        ? [...(tour.highlights || []), ...(tour.features || [])].join(' ').toLowerCase()
        : '';

      const searchContent = `${title} ${description} ${itineraryText} ${highlightsText}`;
      const query = searchQuery.toLowerCase();

      const matchesCategory = activeCategory === 'All' || tour.category === activeCategory;
      const matchesSearch = searchContent.includes(query);
      
      const priceVal = parsePrice(tour.price || '0');
      const matchesPrice = priceVal <= maxPrice;
      
      const durationVal = parseDuration(tour.duration || '0');
      const matchesDuration = durationVal <= maxDuration;
      
      return matchesCategory && matchesSearch && matchesPrice && matchesDuration;
    });
  }, [tours, activeCategory, searchQuery, maxPrice, maxDuration, profile?.role]);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id && tours.length > 0) {
      const tour = tours.find(t => t.id === id);
      if (tour) {
        setSelectedTour(tour); // Auto-open modal
        
        // Detailed description for OG tags including day-by-day
        let detailedDesc = tour.description || "";
        if (tour.theExperience) {
          const itineraryBrief = tour.theExperience.split('\n')
            .filter((l: string) => l.toLowerCase().startsWith('day') || l.toLowerCase().startsWith('step'))
            .slice(0, 5)
            .join(' | ');
          if (itineraryBrief) {
            detailedDesc = `${detailedDesc}\n\nExperience: ${itineraryBrief}`;
          }
        }

        setSeo({
          title: tour.title || tour.name,
          description: detailedDesc,
          image: tour.image || tour.images?.[0],
          path: `${window.location.origin}/tours?id=${id}`,
          seoData: tour.seoData
        });
      }
    }
  }, [searchParams, tours]);

  return (
    <div className="pt-20 px-4 sm:px-6">
      {seo && <SEO 
        title={seo.title || "Tour Packages"} 
        description={seo.description || "Handpicked mountain journeys."} 
        keywords={seo.keyword} 
        image={seo.image}
        seoData={seo.seoData}
      />}
      
      {/* Search & Filter Header (Sticky) */}
      <div className="sticky top-20 z-40 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 md:py-3 bg-cream/95 backdrop-blur-xl border-b border-forest/5 shadow-sm transition-all duration-500">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6">
            {/* Page Identity - Elegant & Compact */}
            <div className="flex flex-col items-center md:items-start shrink-0">
              <h1 className="text-sm md:text-base font-heading font-black text-forest leading-none tracking-tight uppercase">Tour Packages</h1>
              <p className="hidden md:block text-[8px] text-terracotta font-black tracking-[0.3em] uppercase mt-1">Handpicked Journeys</p>
            </div>

            {/* Middle Section: Integrated Search & Categories */}
            <div className="flex items-center gap-2 md:gap-4 flex-grow w-full md:w-auto">
              {/* Search input - Sleek */}
              <div className="relative group flex-grow md:max-w-xs transition-all duration-300 z-50">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-forest/20 group-focus-within:text-terracotta transition-colors" />
                <input 
                  type="text"
                  placeholder="FIND YOUR PATH..."
                  value={searchQuery || ''}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-8 py-2 bg-white/50 border border-forest/5 rounded-full text-[9px] font-black text-forest placeholder:text-forest/20 focus:outline-none focus:ring-4 focus:ring-forest/5 focus:border-terracotta/30 transition-all tracking-widest uppercase"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-forest/20 hover:text-terracotta transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
                
                {/* Search Suggestions Dropdown */}
                {searchQuery && filteredTours.length > 0 && (
                  <div className="absolute top-full mt-2 w-[calc(100vw-2rem)] right-[-1rem] md:right-auto md:w-[400px] bg-white rounded-2xl shadow-xl border border-forest/10 overflow-hidden max-h-[60vh] overflow-y-auto">
                    {filteredTours.slice(0, 5).map(tour => (
                      <div 
                        key={tour.id}
                        className="flex items-start gap-4 p-4 hover:bg-forest/5 cursor-pointer border-b border-forest/5 last:border-0 transition-colors"
                        onClick={() => {
                          setSelectedTour(tour);
                          setSearchQuery('');
                        }}
                      >
                        <img 
                          src={tour.image || tour.images?.[0] || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b'} 
                          alt={tour.title || tour.name} 
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="text-xs font-black text-forest">{tour.title || tour.name}</h4>
                          <p className="text-[10px] text-forest/60 line-clamp-2 mt-1">{tour.description}</p>
                          <div className="flex gap-2 mt-2">
                             {(tour.category || tour.type) && (
                               <span className="text-[8px] uppercase tracking-widest font-black text-terracotta bg-terracotta/10 px-2 py-0.5 rounded-sm">
                                 {tour.category || tour.type}
                               </span>
                             )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredTours.length > 5 && (
                      <div className="p-3 text-center text-[10px] uppercase tracking-widest font-black text-forest/40 bg-forest/5">
                        +{filteredTours.length - 5} more results
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Categories - Minimal Pill Scroller */}
              <div className="flex-grow overflow-x-auto scrollbar-none pb-0.5 md:pb-0">
                <div className="flex items-center gap-1.5 min-w-max px-1">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={cn(
                        "px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all duration-500 border-2 whitespace-nowrap",
                        activeCategory === category
                          ? "bg-forest text-white border-forest shadow-lg shadow-forest/10 scale-105"
                          : "bg-white/40 text-forest/40 border-forest/5 hover:border-forest/20 hover:text-forest"
                      )}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Action */}
              <Button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                variant="outline"
                className={cn(
                  "rounded-full border-forest/5 h-8 md:h-10 px-3 md:px-4 flex items-center gap-2 font-black text-[8px] md:text-[9px] uppercase tracking-widest transition-all shrink-0",
                  isFilterOpen ? "bg-forest text-white border-forest" : "bg-white/80 text-forest hover:bg-forest/5"
                )}
              >
                <SlidersHorizontal className="h-3 md:h-3.5 w-3 md:w-3.5" />
                <span className="hidden sm:inline">{isFilterOpen ? 'HIDE' : 'FILTERS'}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mb-12 px-4 sm:px-6">
        {/* Search Status */}
        {searchQuery && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center gap-2"
          >
            <span className="text-[10px] font-black text-forest/30 uppercase tracking-widest">Searching for:</span>
            <Badge variant="secondary" className="bg-terracotta/10 text-terracotta border-none px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
              {searchQuery}
            </Badge>
            <span className="text-[10px] font-black text-forest/30 uppercase tracking-widest ml-auto">
              Found {filteredTours.length} spiritual {filteredTours.length === 1 ? 'path' : 'paths'}
            </span>
          </motion.div>
        )}

        {/* Expanded Filters */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-12"
            >
              <Card className="border-none bg-white shadow-xl shadow-forest/[0.03] rounded-[2.5rem] p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-forest uppercase tracking-[0.2em]">Max Price Range</h4>
                      <span className="text-[10px] font-black text-terracotta bg-terracotta/5 px-2 py-1 rounded-full uppercase">Up to ₹{maxPrice.toLocaleString()}</span>
                    </div>
                    <input 
                      type="range"
                      min="3000"
                      max="50000"
                      step="1000"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                      className="w-full accent-terracotta h-1.5 bg-gray-100 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-forest/30 uppercase">
                      <span>₹3,000</span>
                      <span>₹50,000+</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-forest uppercase tracking-[0.2em]">Maximum Duration</h4>
                      <span className="text-[10px] font-black text-terracotta bg-terracotta/5 px-2 py-1 rounded-full uppercase">{maxDuration} Days</span>
                    </div>
                    <input 
                      type="range"
                      min="1"
                      max="30"
                      value={maxDuration}
                      onChange={(e) => setMaxDuration(parseInt(e.target.value))}
                      className="w-full accent-terracotta h-1.5 bg-gray-100 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-forest/30 uppercase">
                      <span>1 Day</span>
                      <span>30 Days</span>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-forest/5 flex justify-end gap-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setMaxPrice(50000);
                      setMaxDuration(30);
                      setSearchQuery('');
                      setActiveCategory('All');
                    }}
                    className="text-forest/40 hover:text-terracotta text-[10px] font-black uppercase tracking-widest"
                  >
                    Reset All
                  </Button>
                  <Button 
                    onClick={() => setIsFilterOpen(false)}
                    className="bg-forest text-white rounded-full px-8 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-forest/20"
                  >
                    Discover Matches
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tour List */}
      <section className="py-20 px-6 bg-cream">
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-12">
          <div className="xl:col-span-2">
            {!hasLoaded ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-[2rem] h-[500px] animate-pulse border border-forest/5 shadow-sm p-0 overflow-hidden">
                    <div className="h-2/3 bg-forest/5" />
                    <div className="p-6 space-y-4">
                      <div className="h-4 bg-forest/5 rounded w-1/4" />
                      <div className="h-8 bg-forest/5 rounded w-3/4" />
                      <div className="h-4 bg-forest/5 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredTours.map((tour, index) => (
                  <motion.div
                    key={tour.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                  <Card 
                    className="overflow-hidden border border-forest/5 shadow-lg hover:shadow-xl transition-all duration-500 rounded-[2rem] bg-white group h-full flex flex-col p-0 relative"
                  >
                    <div 
                      className="relative aspect-[4/3] overflow-hidden cursor-pointer"
                      onClick={() => setSelectedTour(tour)}
                    >
                      <ImageSlider 
                        images={((tour.title || '').toLowerCase().includes('valley of shadows') 
                          ? ["https://i.postimg.cc/TYqctVvr/IMG-8144.jpg"] 
                          : [tour.image, ...(tour.images || [])]).filter(Boolean)} 
                        alt={tour.title}
                        className="h-full w-full transition-transform duration-1000 group-hover:scale-110"
                        showThumbnails={true}
                        thumbnailClassName="absolute bottom-2 left-0 right-0 z-20 pointer-events-auto"
                      />
                      <div 
                        className="absolute top-4 left-4 flex flex-col gap-2 z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Badge className="bg-white/90 backdrop-blur-md text-forest border-none px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                          {tour.focus || 'Best Seller'}
                        </Badge>
                      </div>
                      
                      {tour.isAvailable === false && (
                        <div className="absolute inset-0 bg-forest/40 flex items-center justify-center z-10">
                          <Badge className="bg-rose-500 text-white border-none px-4 py-1.5 rounded-full text-[10px] font-bold shadow-xl uppercase tracking-widest">
                            Unavailable
                          </Badge>
                        </div>
                      )}

                      {profile?.role === 'admin' && (
                          <Link 
                            to={tour.id ? `/admin?tab=content&type=${tour.originalType || 'tour'}&edit=${tour.id}` : `/admin?tab=content&type=${tour.originalType || 'tour'}`}
                            className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors group/edit z-10"
                            title={tour.id ? `Edit ${tour.originalType || 'Tour'}` : "Sync defaults to edit"}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Edit2 className="h-4 w-4 text-forest group-hover/edit:text-terracotta transition-colors" />
                          </Link>
                      )}

                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleShare(tour);
                        }}
                        className={cn(
                          "absolute top-4 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors group/share z-10",
                          profile?.role === 'admin' ? "right-14" : "right-4"
                        )}
                        title="Share Journey"
                      >
                        <Share2 className="h-4 w-4 text-forest group-hover/share:text-terracotta transition-colors" />
                      </button>
                    </div>

                    <div className="p-6 flex flex-col flex-grow bg-white relative">
                      <div className="flex-grow cursor-pointer" onClick={() => setSelectedTour(tour)}>
                        <div className="flex items-center justify-between mb-3">
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
                            {tour.duration}
                          </div>
                        </div>

                        <h3 className="text-xl font-heading font-bold text-forest leading-tight mb-4 group-hover:text-terracotta transition-colors line-clamp-2">
                          {tour.title}
                        </h3>

                        <div className="flex items-start justify-between gap-4 mb-6">
                          <div className="space-y-2 flex-grow">
                            {tour.highlights.slice(0, 3).map((h) => (
                              <div key={h} className="flex items-center text-[11px] text-forest/60 font-medium line-clamp-1">
                                <CheckCircle2 className="h-3 w-3 text-emerald-500 mr-2 shrink-0" />
                                {h}
                              </div>
                            ))}
                          </div>
                          <div className="shrink-0 bg-forest/5 px-3 py-2 rounded-2xl border border-forest/5 flex flex-col items-center justify-center">
                            <span className="text-[8px] font-black text-forest/30 uppercase tracking-tighter mb-1">Price</span>
                            <span className="text-sm font-bold text-terracotta">{tour.price}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto pt-5 border-t border-forest/5">
                        <Button 
                          variant="ghost" 
                          className="w-full h-11 rounded-full border border-forest/10 text-forest hover:bg-forest hover:text-white font-bold text-[10px] uppercase tracking-widest transition-all duration-300 group/btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTour(tour);
                          }}
                        >
                          Explore <ArrowRight className="h-3 w-3 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

          {/* Booking Sidebar */}
          <div className="xl:col-span-1" id="customize-trip">
            <div className="">
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
        </div>
      </section>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Tour Detail Modal */}
      <AnimatePresence>
        {selectedTour && (
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
                  images={((selectedTour.title || '').toLowerCase().includes('valley of shadows') 
                    ? ["https://i.postimg.cc/TYqctVvr/IMG-8144.jpg"] 
                    : [selectedTour.image, ...(selectedTour.images || [])]).filter(Boolean)} 
                  alt={selectedTour.title}
                  className="h-full w-full"
                  autoSwipe={true}
                  interval={4000}
                  showThumbnails={true}
                  thumbnailClassName="mt-4"
                />
                
                {/* Close & Share */}
                <div className="absolute top-6 right-6 flex gap-3 z-50">
                  <button 
                    onClick={() => handleShare(selectedTour)}
                    className="bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20 text-white hover:bg-terracotta transition-all"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => setSelectedTour(null)} 
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
                  <span className="font-fluid text-2xl md:text-3xl text-terracotta drop-shadow-sm mb-2 block">Soul Journey</span>
                  <h2 className="text-3xl xs:text-4xl md:text-7xl font-playfair font-black italic leading-[0.9] tracking-tighter mb-6 uppercase text-forest">
                    {selectedTour.title.split(' ').map((word: string, i: number) => (
                      <span key={i} className={i % 2 !== 0 ? 'text-forest/30' : ''}>{word} </span>
                    ))}
                  </h2>
                </motion.div>
                
                <div className="flex items-center justify-center md:justify-start gap-4 text-forest/40 text-[10px] md:text-xs font-black uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-terracotta fill-current" />
                    <span className="text-forest/80">{selectedTour.rating} / 5.0</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-terracotta/20" />
                  <span className="text-forest/80 font-bold">{selectedTour.category || 'Curated'}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-terracotta/20" />
                  <span className="text-terracotta font-black">Wellness</span>
                </div>
              </div>

              {/* Details */}
              <div className="flex-grow bg-[#FAF9F6] relative pt-10">
                <div className="p-8 md:p-16">
                  <div className="max-w-3xl mx-auto space-y-16">
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { icon: Clock, label: 'Duration', value: selectedTour.duration, sub: 'Immersive Time' },
                        { icon: Users, label: 'Group Size', value: '4-10 People', sub: 'Collective Energy' },
                        { icon: Zap, label: 'Activity', value: 'Moderate', sub: 'Effort Required' },
                        { icon: Stars, label: 'Focus', value: selectedTour.focus || 'Experience', sub: 'Core Value' }
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

                    {/* Highlights Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(selectedTour.highlights || []).map((h: string, i: number) => (
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
                        <span className="font-fluid text-2xl text-terracotta">Soul Narrative</span>
                        <div className="h-px flex-grow bg-forest/5" />
                      </div>
                      <p className="text-forest/70 text-base leading-[1.8] font-medium italic mb-8">
                         "{selectedTour.description || "A meticulously crafted journey through the sacred mists of the Himalayas. We don't just show you places; we help you feel their heartbeat."}"
                      </p>

                      {/* Itinerary Header */}
                      <div className="bg-forest/5 rounded-2xl p-6 border border-forest/10 mb-8">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="bg-terracotta/20 p-3 rounded-full">
                            <Compass className="h-6 w-6 text-terracotta" />
                          </div>
                          <h4 className="text-xl font-bold text-forest uppercase tracking-tight">The Itinerary</h4>
                        </div>
                        <p className="text-xs text-forest/50 font-medium">A mindful progression through sacred landscapes.</p>
                      </div>
                    </section>

                    {/* Experience Detail */}
                    {selectedTour.theExperience && (
                      <section className="bg-forest/[0.02] p-10 rounded-[3rem] border border-forest/5 relative overflow-hidden">
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-terracotta/[0.03] rounded-full blur-3xl pointer-events-none" />
                        <div className="flex items-center justify-between mb-10">
                          <h4 className="font-playfair text-3xl font-black italic text-forest uppercase">Experience Path</h4>
                          <Sparkles className="h-8 w-8 text-terracotta animate-pulse" />
                        </div>
                        
                        <div className="space-y-8 relative">
                          <div className="absolute left-4 top-2 bottom-2 w-px bg-forest/10" />
                          
                          {selectedTour.theExperience.split('\n').map((line: string, i: number) => {
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
                            {selectedTour.price}
                            <span className="text-[10px] font-bold uppercase tracking-widest text-forest/20 ml-2 italic">/ Person</span>
                          </div>
                                                  <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full lg:w-auto">
                            {(() => {
                              const slotIndex = selectedSlots[selectedTour.id];
                              const baseId = `${selectedTour.originalType || 'tour'}-${selectedTour.id}`;
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
                                  {selectedTour.slots && selectedTour.slots.length > 0 ? (
                                    <div className="relative group w-full sm:w-auto">
                                      <select 
                                        value={selectedSlots[selectedTour.id] || ''}
                                        onChange={(e) => setSelectedSlots({ ...selectedSlots, [selectedTour.id]: e.target.value })}
                                        className="w-full sm:min-w-[200px] h-14 rounded-full border border-forest/10 bg-forest/[0.03] px-6 appearance-none focus:outline-none focus:ring-4 focus:ring-forest/5 text-forest font-bold text-[10px] uppercase tracking-widest cursor-pointer group-hover:bg-forest/5 transition-all outline-none"
                                      >
                                        <option value="">Pick Date Slot</option>
                                        {selectedTour.slots.map((slot: any, i: number) => {
                                          const start = new Date(slot.startDate);
                                          let endStr = '';
                                          if (slot.endDate) {
                                            endStr = ` - ${new Date(slot.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
                                          } else if (selectedTour.duration) {
                                            const daysMatch = selectedTour.duration.match(/(\d+)/);
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
                                      const slotIndex = selectedSlots[selectedTour.id];
                                      const slot = slotIndex !== undefined ? selectedTour.slots?.[parseInt(slotIndex)] : undefined;
                                      
                                      const cartItem = {
                                        id: currentItemId,
                                        name: selectedTour.title || selectedTour.name,
                                        price: selectedTour.price,
                                        type: selectedTour.originalType === 'yoga' ? 'Yoga Retreat' : (selectedTour.originalType === 'meditation' ? 'Meditation Retreat' : 'Tour'),
                                        image: selectedTour.image,
                                        dateRange: formatDateRange(selectedDate, selectedTour.duration, slot)
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
                                      selectedTour.isAvailable === false || 
                                      (selectedTour.slots && selectedTour.slots.length > 0 
                                        ? !selectedSlots[selectedTour.id] 
                                        : !selectedDate)
                                    }
                                    className="w-full sm:min-w-[220px] h-14 bg-forest hover:bg-forest/90 text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-forest/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
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
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
