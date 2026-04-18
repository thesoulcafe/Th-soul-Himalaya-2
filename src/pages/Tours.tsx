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
  X
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

import { DEFAULT_TOURS } from '@/constants';

import { useAuth } from '@/lib/AuthContext';

export default function Tours() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tours, setTours] = useState<any[]>(DEFAULT_TOURS);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedDate, setSelectedDate] = useState('2026-06-10');
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
    const q = query(collection(db, 'content'), where('type', '==', 'tour'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const dbTours = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data().data
        })).sort((a, b) => {
          const aAvail = a.isAvailable !== false;
          const bAvail = b.isAvailable !== false;
          if (aAvail && !bAvail) return -1;
          if (!aAvail && bAvail) return 1;
          return 0;
        });
        setTours(dbTours);
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

  const categories = ['All', 'Romantic', 'Wellness', 'Corporate', 'Backpacker', 'Adventure', 'Mix-up'];

  const parsePrice = (priceStr: string) => {
    return parseInt(priceStr.replace(/[₹,]/g, '')) || 0;
  };

  const parseDuration = (durationStr: string) => {
    const match = durationStr.match(/(\d+)/);
    return match ? parseInt(match[0]) : 0;
  };

  const filteredTours = useMemo(() => {
    return tours.filter(tour => {
      const matchesCategory = activeCategory === 'All' || tour.category === activeCategory;
      const matchesSearch = tour.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tour.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = parsePrice(tour.price) <= maxPrice;
      const matchesDuration = parseDuration(tour.duration) <= maxDuration;
      
      return matchesCategory && matchesSearch && matchesPrice && matchesDuration;
    });
  }, [tours, activeCategory, searchQuery, maxPrice, maxDuration]);

  return (
    <div className="pt-24">
      {/* Tagline */}
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-forest mb-2">Tour Packages</h1>
        <p className="text-terracotta font-medium tracking-widest uppercase text-xs">Handpicked Mountain Journeys</p>
      </div>

      {/* Categories & Search */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex-grow overflow-x-auto custom-scrollbar w-full md:w-auto">
            <div className="flex gap-2 min-w-max pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "px-6 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all duration-300 border",
                    activeCategory === category
                      ? "bg-forest text-white border-forest shadow-lg shadow-forest/20"
                      : "bg-white text-forest/60 border-forest/10 hover:border-forest/40"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative group flex-grow md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-forest/30 group-focus-within:text-terracotta transition-colors" />
              <input 
                type="text"
                placeholder="Search journeys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-forest/5 rounded-2xl text-[11px] font-bold text-forest placeholder:text-forest/30 focus:outline-none focus:ring-4 focus:ring-forest/5 focus:border-terracotta/30 transition-all uppercase tracking-widest"
              />
            </div>
            <Button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              variant="outline"
              className={cn(
                "rounded-2xl border-forest/5 h-12 px-6 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all",
                isFilterOpen ? "bg-forest text-white border-forest" : "bg-white text-forest hover:bg-forest/5"
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {isFilterOpen ? 'Hide Filters' : 'Filters'}
            </Button>
          </div>
        </div>

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
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
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
                  <Card className="overflow-hidden border border-forest/5 shadow-lg hover:shadow-xl transition-all duration-500 rounded-[2rem] bg-white group h-full flex flex-col p-0">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <ImageSlider 
                        images={[tour.image, ...(tour.images || [])].filter(Boolean)} 
                        alt={tour.title}
                        className="h-full w-full transition-transform duration-1000 group-hover:scale-110"
                      />
                      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                        <Badge className="bg-white/90 backdrop-blur-md text-forest border-none px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                          Best Seller
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
                          to={tour.id ? `/admin?tab=content&type=tour&edit=${tour.id}` : `/admin?tab=content&type=tour`}
                          className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors group/edit z-10"
                          title={tour.id ? "Edit Tour" : "Sync defaults to edit"}
                        >
                          <Edit2 className="h-4 w-4 text-forest group-hover/edit:text-terracotta transition-colors" />
                        </Link>
                      )}

                      {/* Floating Price Tag */}
                      <div className="absolute bottom-4 right-4 bg-forest text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-xl z-10">
                        {tour.price}
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow bg-white relative">
                      <div className="flex-grow">
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
                              onClick={() => setActiveSlotTour(tour)}
                              className="w-full bg-forest/[0.03] border border-forest/5 rounded-xl p-3 text-[10px] text-forest font-bold flex items-center justify-between hover:bg-white hover:border-terracotta/30 transition-all group"
                            >
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5 text-terracotta" />
                                {selectedSlots[tour.id] !== undefined ? (
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
                          onClick={() => setSelectedTour(tour)}
                        >
                          Details
                        </Button>

                        <div className="flex flex-col gap-3">
                          {(() => {
                            const slotIndex = selectedSlots[tour.id];
                            const currentItemId = `tour-${tour.id}${slotIndex !== undefined ? `-slot-${slotIndex}` : ''}`;
                            const quantity = getItemQuantity(currentItemId);
                            
                            const handleBookAction = () => {
                              if (!user) {
                                // Store pending item and open auth modal
                                setPendingCartItem({
                                  id: currentItemId,
                                  name: tour.title,
                                  price: tour.price,
                                  type: 'Tour',
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
                                type: 'Tour',
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
                                      onClick={handleBookAction}
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
                                    <Link to="/checkout" className="flex-grow">
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
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1" id="customize-trip">
            <div className="sticky top-32">
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
      {selectedTour && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-forest/60 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row border border-white/20"
          >
            {/* Left Side: Immersive Image */}
            <div className="relative w-full md:w-1/2 h-64 md:h-auto shrink-0 bg-forest overflow-hidden">
              <img src={selectedTour.image} alt={selectedTour.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-forest/10 md:to-forest/20" />
              
              <button 
                onClick={() => setSelectedTour(null)}
                className="absolute top-6 left-6 bg-white/20 backdrop-blur-xl p-2.5 rounded-full shadow-2xl hover:bg-white transition-all text-white hover:text-forest md:hidden z-50 border border-white/40"
              >
                <Plus className="h-5 w-5 rotate-45" />
              </button>

              <div className="absolute bottom-6 left-6 right-6 md:bottom-12 md:left-12 text-white">
                <Badge className="bg-forest text-white border-white/20 mb-4 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg">
                  Curated Himalayan Journey
                </Badge>
                <h2 className="text-3xl md:text-5xl font-heading font-bold leading-tight mb-2 drop-shadow-2xl">{selectedTour.title}</h2>
                <p className="text-white/80 text-sm font-medium tracking-wide flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-terracotta" /> Discovering Hidden Gems
                </p>
              </div>
            </div>

            {/* Right Side: Details */}
            <div className="flex-grow p-8 md:p-12 overflow-y-auto bg-white relative">
              <button 
                onClick={() => setSelectedTour(null)}
                className="absolute top-6 right-6 bg-forest/5 p-3 rounded-full text-forest hover:bg-terracotta hover:text-white transition-all hidden md:flex active:scale-90"
              >
                <Plus className="h-6 w-6 rotate-45" />
              </button>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-6 mb-10 pb-8 border-b border-forest/5">
                <div className="text-center md:text-left">
                  <div className="text-[9px] uppercase tracking-widest text-forest/40 font-bold mb-2">Package Duration</div>
                  <div className="flex items-center justify-center md:justify-start gap-1.5 font-bold text-forest text-sm italic">
                    <Clock className="h-4 w-4 text-terracotta" /> {selectedTour.duration}
                  </div>
                </div>
                <div className="text-center md:text-left border-l border-forest/10 pl-6">
                  <div className="text-[9px] uppercase tracking-widest text-forest/40 font-bold mb-2">Guest Rating</div>
                  <div className="flex items-center justify-center md:justify-start gap-1.5 font-bold text-forest text-sm italic">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> {selectedTour.rating} ({selectedTour.reviews} Reviews)
                  </div>
                </div>
              </div>

              <div className="space-y-10">
                {/* Highlights */}
                <div>
                  <h4 className="font-heading font-bold text-forest mb-4 text-sm uppercase tracking-widest">Journey Highlights</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedTour.highlights.map((h: string) => (
                      <div key={h} className="flex items-center text-xs font-bold text-forest/70 bg-cream/30 p-4 rounded-2xl border border-forest/5">
                        <CheckCircle2 className="h-4 w-4 text-terracotta mr-3 shrink-0" />
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
                      {selectedTour.description || "Experience the magic of the Himalayas with our curated expedition. This journey takes you through ancient villages, lush forests, and breathtaking mountain passes. Includes professional guides, comfortable stays, and authentic local meals."}
                    </p>
                  </div>

                  {selectedTour.theExperience && (
                    <div className="bg-cream/20 p-6 md:p-8 rounded-[2rem] border border-forest/5">
                      <h4 className="font-heading font-bold text-forest mb-6 text-sm uppercase tracking-widest flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-terracotta" /> Day-by-Day Experience
                      </h4>
                      <div className="space-y-4">
                        {selectedTour.theExperience.split('\n').map((line: string, i: number) => {
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
                      <div className="text-xs font-bold text-forest/40 uppercase tracking-widest mb-1">Starting From</div>
                      <div className="text-4xl font-black text-forest">
                        {selectedTour.price}
                        <span className="text-xs font-bold text-forest/30 ml-1">/ person</span>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto flex flex-col gap-4">
                      {selectedTour.slots && selectedTour.slots.length > 0 && (
                        <select 
                          value={selectedSlots[selectedTour.id] || ''}
                          onChange={(e) => setSelectedSlots({ ...selectedSlots, [selectedTour.id]: e.target.value })}
                          className="w-full sm:min-w-[200px] rounded-full border-forest/10 p-3 bg-cream/50 focus:outline-none focus:ring-2 focus:ring-terracotta/20 text-forest font-bold text-xs"
                        >
                          <option value="">Select departure</option>
                          {selectedTour.slots.map((slot: any, i: number) => (
                            <option key={i} value={i}>
                              {new Date(slot.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(slot.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </option>
                          ))}
                        </select>
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
                        }}
                        disabled={selectedTour.slots && selectedTour.slots.length > 0 && selectedSlots[selectedTour.id] === undefined}
                        className="w-full sm:min-w-[200px] bg-forest hover:bg-forest/90 text-white py-8 rounded-full text-base font-black shadow-2xl shadow-forest/20 uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 translate-y-0 hover:-translate-y-1"
                      >
                        Book Journey
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
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
