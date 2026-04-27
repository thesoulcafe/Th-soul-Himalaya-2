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

  // Scroll lock when modal is open
  useEffect(() => {
    if (selectedTour || activeSlotTour) {
      document.body.style.overflow = 'hidden';
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
    });
    return () => unsubscribe();
  }, []);

  const handleShare = async (tour: any) => {
    const shareData = {
      title: `The Soul Himalaya - ${tour.title}`,
      text: tour.description || `Check out this amazing journey: ${tour.title}`,
      url: `${window.location.origin}${window.location.pathname}?id=${tour.id}`
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
      let combinedItems: any[] = [];
      
      if (!snapshot.empty) {
        combinedItems = snapshot.docs.map(doc => {
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
      }

      // If DB items are missing some types or totally empty, fill with defaults
      const hasTours = combinedItems.some(i => i.originalType === 'tour');
      const hasYoga = combinedItems.some(i => i.originalType === 'yoga');
      const hasMeditation = combinedItems.some(i => i.originalType === 'meditation');

      if (!hasTours) {
        combinedItems = [...combinedItems, ...DEFAULT_TOURS.map(t => ({ ...t, originalType: 'tour' }))];
      }
      if (!hasYoga) {
        combinedItems = [...combinedItems, ...DEFAULT_YOGA.map(y => ({ ...y, originalType: 'yoga', category: 'Wellness', highlights: y.features || [] }))];
      }
      if (!hasMeditation) {
        combinedItems = [...combinedItems, ...DEFAULT_MEDITATION.map(m => ({ ...m, originalType: 'meditation', category: 'Wellness', highlights: m.features || [] }))];
      }

      const sortedItems = combinedItems.sort((a, b) => {
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
      const title = String(tour.title || tour.name || '').toLowerCase();
      const description = String(tour.description || '').toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchesCategory = activeCategory === 'All' || tour.category === activeCategory;
      const matchesSearch = title.includes(query) || description.includes(query);
      
      const priceVal = parsePrice(tour.price || '0');
      const matchesPrice = priceVal <= maxPrice;
      
      const durationVal = parseDuration(tour.duration || '0');
      const matchesDuration = durationVal <= maxDuration;
      
      return matchesCategory && matchesSearch && matchesPrice && matchesDuration;
    });
  }, [tours, activeCategory, searchQuery, maxPrice, maxDuration]);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id && tours.length > 0) {
      const tour = tours.find(t => t.id === id);
      if (tour) {
        setSeo({
          title: tour.title || tour.name,
          description: tour.description,
          image: tour.image || tour.images?.[0],
          path: `/tours?id=${id}`
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
              <div className="relative group flex-grow md:max-w-xs transition-all duration-300">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                          ? ["https://i.postimg.cc/3RsgZk5r/20260405-134046.jpg"] 
                          : [tour.image, ...(tour.images || [])]).filter(Boolean)} 
                        alt={tour.title}
                        className="h-full w-full transition-transform duration-1000 group-hover:scale-110"
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

                      {/* Floating Price Tag */}
                      <div className="absolute bottom-4 right-4 bg-forest text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-xl z-10">
                        {tour.price}
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow bg-white relative">
                      <div className="flex-grow cursor-pointer" onClick={() => setSelectedTour(tour)}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center text-yellow-500 text-[10px] font-bold bg-yellow-500/5 px-2 py-1 rounded-full">
                            <Star className="h-3 w-3 fill-current mr-1" />
                            {tour.rating} ({tour.reviews})
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-forest/40 uppercase tracking-widest">
                            <Clock className="h-3 w-3 text-terracotta" />
                            {tour.duration}
                          </div>
                        </div>

                        <h3 className="text-xl font-heading font-bold text-forest leading-tight mb-4 group-hover:text-terracotta transition-colors line-clamp-2">
                          {tour.title}
                        </h3>

                        <div className="space-y-2 mb-6">
                          {tour.highlights.slice(0, 3).map((h) => (
                            <div key={h} className="flex items-center text-[11px] text-forest/60 font-medium line-clamp-1">
                              <CheckCircle2 className="h-3 w-3 text-emerald-500 mr-2 shrink-0" />
                              {h}
                            </div>
                          ))}
                        </div>

                        {/* Slot Selection (Conditional) */}
                        {tour.slots && tour.slots.length > 0 && (
                          <div className="mb-4">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveSlotTour(tour);
                              }}
                              className="w-full bg-forest/[0.03] border border-forest/5 rounded-xl p-3 text-[10px] text-forest font-bold flex items-center justify-between hover:bg-white hover:border-terracotta/30 transition-all group"
                            >
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5 text-terracotta" />
                                  {selectedSlots[tour.id] !== undefined && tour.slots && tour.slots[parseInt(selectedSlots[tour.id])] ? (
                                    <span>
                                      {new Date(tour.slots[parseInt(selectedSlots[tour.id])].startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                    </span>
                                  ) : (
                                  <span className="text-forest/30">Pick Date</span>
                                )}
                              </div>
                              <ChevronDown className="h-3 w-3 text-forest/20 group-hover:text-terracotta transition-colors" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="mt-auto pt-4 border-t border-forest/5 flex items-center justify-between gap-3">
                        <Button 
                          variant="ghost" 
                          className="text-forest hover:text-terracotta p-0 font-bold text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTour(tour);
                          }}
                        >
                          Details
                        </Button>

                        <div className="flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
                          {(() => {
                            const slotIndex = selectedSlots[tour.id];
                            const baseId = tour.originalType && tour.originalType !== 'tour' 
                              ? `${tour.originalType}-${tour.title.toLowerCase().replace(/\s+/g, '-')}`
                              : `tour-${tour.id}`;
                            const currentItemId = `${baseId}${slotIndex !== undefined ? `-slot-${slotIndex}` : ''}`;
                            const quantity = getItemQuantity(currentItemId);
                            
                            const handleBookAction = () => {
                              if (!user) {
                                // Store pending item and open auth modal
                                setPendingCartItem({
                                  id: currentItemId,
                                  name: tour.title,
                                  price: tour.price,
                                  type: tour.originalType === 'yoga' ? 'Yoga Retreat' : (tour.originalType === 'meditation' ? 'Meditation Retreat' : 'Tour'),
                                  image: tour.image,
                                  dateRange: formatDateRange(selectedDate, tour.duration, slotIndex !== undefined ? tour.slots?.[parseInt(slotIndex)] : undefined)
                                });
                                setShowAuthModal(true);
                                return;
                              }

                              if (tour.slots && tour.slots.length > 0 && slotIndex === undefined) {
                                // If slots exist but none selected, show the popup
                                setActiveSlotTour(tour);
                                return;
                              }

                              const slot = slotIndex !== undefined ? tour.slots?.[parseInt(slotIndex)] : undefined;
                              globalAddToCart({
                                id: currentItemId,
                                name: tour.title,
                                price: tour.price,
                                type: tour.originalType === 'yoga' ? 'Yoga Retreat' : (tour.originalType === 'meditation' ? 'Meditation Retreat' : 'Tour'),
                                image: tour.image,
                                dateRange: formatDateRange(selectedDate, tour.duration, slot)
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
                                      disabled={tour.isAvailable === false}
                                      className={cn(
                                        "h-10 px-8 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 flex-grow",
                                        tour.isAvailable === false 
                                          ? "bg-forest/10 text-forest/30 cursor-not-allowed border-none" 
                                          : "bg-forest hover:bg-forest/90 text-white shadow-lg shadow-forest/20"
                                      )}
                                    >
                                      {tour.isAvailable === false ? 'Unavailable' : 'Book Now'}
                                    </Button>
                                  ) : (
                                    <Link to="/checkout" className="flex-grow" onClick={(e) => e.stopPropagation()}>
                                      <Button className="w-full h-10 px-6 rounded-full text-[10px] font-bold uppercase tracking-widest bg-terracotta hover:bg-terracotta/90 text-white shadow-lg shadow-terracotta/20 flex items-center justify-center gap-2">
                                        <ShoppingCart className="h-3 w-3" /> Go to Cart <ArrowRight className="h-3 w-3" />
                                      </Button>
                                    </Link>
                                  )}
                                </div>
                                {quantity > 0 && (
                                  <p className="text-[9px] text-center text-forest/40 font-bold uppercase tracking-tighter">
                                    Added to journey
                                  </p>
                                )}
                              </div>
                            );
                          })()}
                        </div>
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
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none grayscale invert" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/topography.png")' }} />

            {/* Immersive Visuals - Now part of the scroll flow */}
            <div className="relative w-full h-[400px] md:h-[600px] shrink-0 overflow-hidden bg-forest">
              <ImageSlider 
                images={((selectedTour.title || '').toLowerCase().includes('valley of shadows') 
                  ? ["https://i.postimg.cc/3RsgZk5r/20260405-134046.jpg"] 
                  : [selectedTour.image, ...(selectedTour.images || [])]).filter(Boolean)} 
                alt={selectedTour.title}
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
                  <span className="font-fluid text-2xl md:text-3xl text-terracotta drop-shadow-md mb-2 block text-center md:text-left">The Curated</span>
                  <h2 className="text-3xl xs:text-4xl md:text-7xl font-playfair font-black italic leading-[0.9] tracking-tighter mb-4 uppercase text-center md:text-left">
                    {selectedTour.title.split(' ').map((word: string, i: number) => (
                      <span key={i} className={i === 1 ? 'text-white/40' : ''}>{word} </span>
                    ))}
                  </h2>
                </motion.div>
                
                <div className="flex items-center justify-center md:justify-start gap-4 text-white/70 text-xs font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-terracotta" />
                    <span>Sacred Paths</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-terracotta" />
                  <span>Cultural Wonders</span>
                </div>
              </div>

              {/* Close & Share - Now absolute within the scroll flow */}
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
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Soulful Details - Scroll continues here */}
            <div className="flex-grow bg-[#FAF9F6] relative">
              <div className="p-8 md:p-16">
                <div className="max-w-3xl mx-auto space-y-16">
                  
                  {/* Stats Grid - Fluid Style */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: Clock, label: 'Duration', value: selectedTour.duration, sub: 'Days & Nights' },
                      { icon: Star, label: 'Rating', value: `${selectedTour.rating} Stars`, sub: `${selectedTour.reviews} Soulful Reviews` }
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
                    {selectedTour.highlights.map((h: string, i: number) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center text-xs font-bold text-forest/70 bg-white p-5 rounded-[1.5rem] border border-forest/5 group hover:border-terracotta/20 transition-all"
                      >
                        <CheckCircle2 className="h-4 w-4 text-terracotta mr-4 shrink-0" />
                        {h}
                      </motion.div>
                    ))}
                  </div>

                  {/* Soulful Description */}
                  <section>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-px flex-grow bg-forest/5" />
                      <span className="font-fluid text-2xl text-terracotta">The Experience</span>
                      <div className="h-px flex-grow bg-forest/5" />
                    </div>
                    <p className="text-forest/70 text-base leading-[1.8] font-medium italic mb-8">
                      "{selectedTour.description}"
                    </p>
                    
                    {/* Day-by-Day Experience Header */}
                    <div className="bg-forest/5 rounded-2xl p-6 border border-forest/10 mb-8">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="bg-terracotta/20 p-3 rounded-full">
                          <Compass className="h-6 w-6 text-terracotta" />
                        </div>
                        <h4 className="text-xl font-bold text-forest uppercase tracking-tight">Day-by-Day Journey</h4>
                      </div>
                      <p className="text-xs text-forest/50 font-medium">Follow the path designed for your spiritual evolution. Each day is a step closer to the divine.</p>
                    </div>
                  </section>

                  {/* Detailed Itinerary */}
                  {(selectedTour.itinerary || selectedTour.theExperience) && (
                    <section className="bg-forest/[0.02] p-10 rounded-[3rem] border border-forest/5 relative overflow-hidden">
                      <div className="absolute -right-20 -top-20 w-64 h-64 bg-terracotta/[0.03] rounded-full blur-3xl pointer-events-none" />
                      
                      <div className="flex items-center justify-between mb-10">
                        <h4 className="font-playfair text-3xl font-black italic text-forest">Chronicle of Wonder</h4>
                        <Sparkles className="h-8 w-8 text-terracotta animate-pulse" />
                      </div>
                      
                      <div className="space-y-8 relative">
                        <div className="absolute left-4 top-2 bottom-2 w-px bg-forest/10" />
                        
                        {Array.isArray(selectedTour.itinerary) ? (
                          selectedTour.itinerary.map((item: any, i: number) => (
                            <div key={i} className="relative pl-12 group">
                              <div className="absolute left-3 top-1.5 w-2 h-2 rounded-full bg-terracotta border-4 border-[#FAF9F6] ring-1 ring-terracotta/20 z-10 group-hover:scale-150 transition-transform" />
                              <div className="text-[10px] font-black text-terracotta uppercase tracking-[0.2em] mb-1">Day {item.day || i + 1}</div>
                              <h5 className="text-lg font-bold text-forest mb-2">Morning Discovery</h5>
                              <p className="text-xs text-forest/50 font-medium leading-relaxed">
                                {item.description}
                              </p>
                            </div>
                          ))
                        ) : (
                          selectedTour.theExperience.split('\n').map((line: string, i: number) => {
                            if (!line.trim()) return null;
                            const isDay = line.toLowerCase().startsWith('day');
                            return (
                              <div key={i} className={cn("relative", isDay ? "pl-12 mt-10 first:mt-0" : "pl-12 mt-2")}>
                                {isDay && <div className="absolute left-3 top-1.5 w-2 h-2 rounded-full bg-terracotta z-10" />}
                                <div className={cn("text-xs leading-relaxed", isDay ? "text-[10px] font-black text-terracotta uppercase tracking-[0.2em] mb-1" : "text-forest/60 font-medium")}>
                                  {line.trim()}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </section>
                  )}

                  {/* Booking Footer - Creative Style */}
                  <div className="border-t border-forest/5 bg-white shadow-[0_-15px_40px_rgba(0,0,0,0.03)] -mx-8 sm:-mx-10 md:-mx-16 p-6 sm:p-8 md:p-10">
                <div className="max-w-4xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
                  <div className="text-center lg:text-left flex flex-col sm:flex-row lg:flex-col items-center lg:items-start gap-1 sm:gap-4 lg:gap-0">
                    <div className="font-fluid text-lg xs:text-xl text-terracotta -mb-1">Energy Exchange</div>
                    <div className="text-3xl xs:text-4xl font-playfair font-black italic text-forest leading-none">
                      {selectedTour.price}
                      <span className="text-[10px] font-bold uppercase tracking-widest text-forest/20 ml-2 italic">/ Traveler</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full lg:w-auto">
                    {selectedTour.slots && selectedTour.slots.length > 0 ? (
                      <div className="relative group w-full sm:w-auto">
                        <select 
                          value={selectedSlots[selectedTour.id] || ''}
                          onChange={(e) => setSelectedSlots({ ...selectedSlots, [selectedTour.id]: e.target.value })}
                          className="w-full sm:min-w-[200px] h-14 rounded-full border border-forest/10 bg-forest/[0.03] px-6 appearance-none focus:outline-none focus:ring-4 focus:ring-forest/5 text-forest font-bold text-[10px] uppercase tracking-widest cursor-pointer group-hover:bg-forest/5 transition-all"
                        >
                          <option value="">Pick Date Slot</option>
                          {selectedTour.slots.map((slot: any, i: number) => (
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
                        const slotIndex = selectedSlots[selectedTour.id];
                        const slot = slotIndex !== undefined ? selectedTour.slots?.[parseInt(slotIndex)] : undefined;
                        globalAddToCart({
                          id: `tour-${selectedTour.id}`,
                          name: selectedTour.title,
                          price: selectedTour.price,
                          type: 'Tour',
                          image: selectedTour.image,
                          dateRange: formatDateRange(selectedDate, selectedTour.duration, slot)
                        });
                        setSelectedTour(null);
                        navigate('/checkout');
                      }}
                      disabled={
                        selectedTour.isAvailable === false || 
                        (selectedTour.slots && selectedTour.slots.length > 0 
                          ? !selectedSlots[selectedTour.id] 
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
      {/* Slot Selection Popup */}
      {activeSlotTour && (
        <SlotSelectionPopup 
          isOpen={!!activeSlotTour}
          onClose={() => setActiveSlotTour(null)}
          slots={activeSlotTour.slots}
          selectedSlotIndex={selectedSlots[activeSlotTour.id]}
          onSelectSlot={(index) => {
            setSelectedSlots({ ...selectedSlots, [activeSlotTour.id]: index });
            // Auto add after selection
            const slot = activeSlotTour.slots[index];
            globalAddToCart({
              id: `tour-${activeSlotTour.id}-slot-${index}`,
              name: activeSlotTour.title,
              price: activeSlotTour.price,
              type: 'Tour',
              image: activeSlotTour.image,
              dateRange: formatDateRange(selectedDate, activeSlotTour.duration, slot)
            });
            setActiveSlotTour(null);
            navigate('/checkout');
          }}
          onCustomize={() => document.getElementById('customize-trip')?.scrollIntoView({ behavior: 'smooth' })}
          title={activeSlotTour.title}
        />
      )}

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
