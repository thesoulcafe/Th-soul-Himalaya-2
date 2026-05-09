import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, Wind, Waves, MapPin, Shield, Zap, ArrowRight, Home as HomeIcon, Star, Stars, Edit2, Calendar, Compass, ChevronDown, Clock, Sparkles, CheckCircle2, ShoppingCart, Share2, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthModal from '@/components/AuthModal';
import { Card, CardContent } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import ImageSlider from '@/components/ImageSlider';
import SlotSelectionPopup from '@/components/SlotSelectionPopup';
import CustomizeTripCard from '@/components/CustomizeTripCard';
import { SEO } from '@/components/SEO';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { DEFAULT_ADVENTURE } from '@/constants';

export default function Adventure() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<any[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { cart: globalCart, addToCart: globalAddToCart, updateQuantity: globalUpdateQuantity, setPendingCartItem } = useCart();

  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>({});
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [activeSlotActivity, setActiveSlotActivity] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Scroll lock and reset when modal is open
  useEffect(() => {
    if (activeSlotActivity || selectedActivity) {
      document.body.style.overflow = 'hidden';
      window.scrollTo(0, 0); // Reset to top when opening details
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeSlotActivity, selectedActivity]);
  const [selectedDate, setSelectedDate] = useState('');
  const [seo, setSeo] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'seo_settings'), where('path', '==', '/adventure'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) setSeo(snapshot.docs[0].data());
    }, (error) => {
      console.error("SEO settings snapshot failed:", error);
    });
    return () => unsubscribe();
  }, []);

  const handleShare = async (activity: any) => {
    const shareData = {
      title: `The Soul Himalaya - ${activity.title}`,
      text: activity.description || `Feel the adrenaline with this: ${activity.title}`,
      url: `${window.location.origin}${window.location.pathname}?id=${activity.id}&v=${Date.now()}`
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Thrill Shared", {
          description: "Link copied to clipboard!",
        });
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error("Sharing failed:", err);
      }
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'content'), where('type', '==', 'adventure'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbItems = snapshot.empty ? [] : snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data().data,
        originalType: 'adventure'
      }));

      const sortedActivities = dbItems.sort((a, b) => {
        const aAvail = a.isAvailable !== false;
        const bAvail = b.isAvailable !== false;
        if (aAvail && !bAvail) return -1;
        if (!aAvail && bAvail) return 1;

        const aOrder = (a.order !== undefined && a.order !== null) ? Number(a.order) : 999;
        const bOrder = (b.order !== undefined && b.order !== null) ? Number(b.order) : 999;
        return aOrder - bOrder;
      });

      setActivities(sortedActivities);
      setHasLoaded(true);
    }, (error) => {
      console.error("Adventure content snapshot failed:", error);
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

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get('id');
    if (id && activities.length > 0) {
      const activity = activities.find(a => a.id === id);
      if (activity) {
        setSelectedActivity(activity);
        const itinerarySummary = activity.theExperience 
          ? activity.theExperience.split('\n')
              .filter((line: string) => line.toLowerCase().startsWith('day') || line.toLowerCase().startsWith('step'))
              .slice(0, 3)
              .join(' | ')
          : '';
        const fullDescription = itinerarySummary 
          ? `${activity.description} Plan: ${itinerarySummary}...`
          : activity.description;
        setSeo({
          title: activity.title || activity.name,
          description: fullDescription,
          image: activity.image || activity.images?.[0],
          path: `${window.location.origin}/adventure?id=${id}`,
          seoData: activity.seoData
        });
      }
    }
  }, [activities]);

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      if (profile?.role !== 'admin' && activity.isAvailable === false) return false;
      const title = String(activity.title || activity.name || '').toLowerCase();
      const description = String(activity.description || '').toLowerCase();
      
      const itineraryText = Array.isArray(activity.itinerary) 
        ? activity.itinerary.map((day: any) => `${day.title || ''} ${day.activities || ''} ${day.description || ''}`).join(' ').toLowerCase()
        : (typeof activity.theExperience === 'string' ? activity.theExperience.toLowerCase() : '');
        
      const highlightsText = Array.isArray(activity.highlights) || Array.isArray(activity.features)
        ? [...(activity.highlights || []), ...(activity.features || [])].join(' ').toLowerCase()
        : '';

      const searchContent = `${title} ${description} ${itineraryText} ${highlightsText}`;
      const query = searchQuery.toLowerCase();

      return searchContent.includes(query);
    });
  }, [activities, profile?.role, searchQuery]);

  return (
    <div className="pt-24">
      {seo && <SEO 
        title={seo.title || "Adventure Sports"} 
        description={seo.description || "Feel the adrenaline in the Himalayas."} 
        image={seo.image}
        seoData={seo.seoData}
      />}
      {/* Tagline */}
      <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-forest mb-2">Adventure Sports</h1>
        <p className="text-terracotta font-medium tracking-widest uppercase text-xs mb-8">Feel The Adrenaline</p>
        
        {/* Search input */}
        <div className="relative group md:max-w-md mx-auto transition-all duration-300 z-50">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-forest/20 group-focus-within:text-terracotta transition-colors" />
          <input 
            type="text"
            placeholder="FIND YOUR ADVENTURE..."
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
          {searchQuery && filteredActivities.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-forest/10 overflow-hidden max-h-[60vh] overflow-y-auto text-left">
              {filteredActivities.slice(0, 5).map(activity => (
                <div 
                  key={activity.id}
                  className="flex items-start gap-4 p-4 hover:bg-forest/5 cursor-pointer border-b border-forest/5 last:border-0 transition-colors"
                  onClick={() => {
                    setSelectedActivity(activity);
                    setSearchQuery('');
                  }}
                >
                  <img 
                    src={activity.image || activity.images?.[0] || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b'} 
                    alt={activity.title || activity.name} 
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="text-xs font-black text-forest">{activity.title || activity.name}</h4>
                    <p className="text-[10px] text-forest/60 line-clamp-2 mt-1">{activity.description}</p>
                  </div>
                </div>
              ))}
              {filteredActivities.length > 5 && (
                <div className="p-3 text-center text-[10px] uppercase tracking-widest font-black text-forest/40 bg-forest/5">
                  +{filteredActivities.length - 5} more results
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Activities Grid */}
      <section className="py-24 px-6 bg-cream">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {!hasLoaded ? (
              [1, 2].map((i) => (
                <div key={i} className="bg-white rounded-[2.5rem] h-[600px] animate-pulse border-none shadow-2xl p-0 overflow-hidden flex flex-col">
                  <div className="h-80 bg-forest/5" />
                  <div className="p-10 space-y-6">
                    <div className="h-4 bg-forest/5 rounded w-1/4" />
                    <div className="h-10 bg-forest/5 rounded w-3/4" />
                    <div className="h-32 bg-forest/5 rounded w-full" />
                  </div>
                </div>
              ))
            ) : (
              filteredActivities.map((activity, i) => (
                <motion.div
                  key={activity.id || activity.title}
                initial={{ opacity: 0, x: i === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card 
                  onClick={() => setSelectedActivity(activity)}
                  className="overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white h-full flex flex-col group cursor-pointer"
                >
                    <div className="relative h-80 overflow-hidden">
                      <ImageSlider 
                        images={((activity.title || '').toLowerCase().includes('valley of shadows') 
                          ? ["https://images.unsplash.com/photo-1544333323-167bb3098522?auto=format&fit=crop&w=1200&h=630&q=80"] 
                          : [activity.image, ...(activity.images || [])]).filter(Boolean)} 
                        alt={activity.title}
                        className="h-full w-full"
                        showThumbnails={true}
                        thumbnailClassName="absolute bottom-2 left-0 right-0 z-20 pointer-events-auto"
                      />
                      <div 
                        className="absolute top-6 left-6 bg-white/90 p-3 rounded-2xl shadow-lg flex items-center gap-3 z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
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
                          onClick={(e) => e.stopPropagation()}
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
                        <div className="flex items-center gap-3">
                          <Link 
                            to="/gallery" 
                            onClick={(e) => e.stopPropagation()}
                            className="text-[9px] font-black text-terracotta hover:text-forest transition-colors uppercase tracking-[0.2em] underline underline-offset-4 decoration-terracotta/30"
                          >
                            Review
                          </Link>
                        </div>
                        
                        <h3 className="text-2xl font-heading font-bold text-forest leading-tight group-hover:text-terracotta transition-colors">{activity.title}</h3>
                      </div>

                      <div className="flex items-center gap-2 text-sm font-bold text-forest/40 mb-6 uppercase tracking-wider">
                        <Clock className="h-4 w-4" />
                        {activity.duration}
                      </div>

                      <div className="flex items-start justify-between gap-4 mb-10">
                        <div className="space-y-3 flex-grow">
                          {activity.highlights.slice(0, 3).map((h) => (
                            <div key={h} className="flex items-center text-sm text-forest/80">
                              <Zap className="h-4 w-4 text-terracotta mr-3" />
                              {h}
                            </div>
                          ))}
                        </div>
                        <div className="shrink-0 bg-terracotta/5 px-4 py-2 rounded-2xl border border-terracotta/5 flex flex-col items-center justify-center">
                          <span className="text-[8px] font-black text-terracotta/40 uppercase tracking-tighter mb-1">Exchange</span>
                          <span className="text-lg font-black text-terracotta">{activity.price}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto">
                      <Button 
                        variant="ghost" 
                        className="w-full h-11 rounded-full border border-forest/10 text-forest hover:bg-forest hover:text-white font-bold text-[10px] uppercase tracking-widest transition-all duration-300 group/btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedActivity(activity);
                        }}
                      >
                        Explore <ArrowRight className="h-3 w-3 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
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

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Adventure Detail Modal */}
      <AnimatePresence>
        {selectedActivity && (
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
                  images={((selectedActivity.title || '').toLowerCase().includes('valley of shadows') 
                    ? ["https://images.unsplash.com/photo-1544333323-167bb3098522?auto=format&fit=crop&w=1200&h=630&q=80"] 
                    : [selectedActivity.image, ...(selectedActivity.images || [])]).filter(Boolean)} 
                  alt={selectedActivity.title}
                  className="h-full w-full"
                  autoSwipe={true}
                  interval={4000}
                  showThumbnails={true}
                  thumbnailClassName="mt-4"
                />
                
                {/* Close & Share */}
                <div className="absolute top-6 right-6 flex gap-3 z-50">
                  <button 
                    onClick={() => handleShare(selectedActivity)}
                    className="bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20 text-white hover:bg-terracotta transition-all"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => setSelectedActivity(null)} 
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
                  <span className="font-fluid text-2xl md:text-3xl text-terracotta drop-shadow-sm mb-2 block">Peak Adrenaline</span>
                  <h2 className="text-3xl xs:text-4xl md:text-7xl font-playfair font-black italic leading-[0.9] tracking-tighter mb-6 uppercase text-forest">
                    {selectedActivity.title.split(' ').map((word: string, i: number) => (
                      <span key={i} className={i % 2 !== 0 ? 'text-forest/30' : ''}>{word} </span>
                    ))}
                  </h2>
                </motion.div>
                
                <div className="flex items-center justify-center md:justify-start gap-4 text-forest/40 text-[10px] md:text-xs font-black uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-terracotta fill-current" />
                    <span className="text-forest/80">{selectedActivity.rating || '4.7'} / 5.0</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-terracotta/20" />
                  <span className="text-forest/80 font-bold">Extreme Support</span>
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
                        { icon: Clock, label: 'Duration', value: selectedActivity.duration, sub: 'Total Time' },
                        { icon: Shield, label: 'Safety', value: 'International', sub: 'High Standards' },
                        { icon: Zap, label: 'Intensity', value: 'High Adrenaline', sub: 'For Thrill Seekers' },
                        { icon: Compass, label: 'Terrain', value: 'Himalayan', sub: 'Rugged Beauty' }
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
                      {(selectedActivity.highlights || []).map((h: string, i: number) => (
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
                        <span className="font-fluid text-2xl text-terracotta">Thrill Narrative</span>
                        <div className="h-px flex-grow bg-forest/5" />
                      </div>
                      <p className="text-forest/70 text-base leading-[1.8] font-medium italic mb-8 text-center md:text-left">
                         "{selectedActivity.description || "Unleash your inner adventurer with our high-octane Himalayan experiences. We combine raw nature with strict safety protocols to give you the thrill of a lifetime."}"
                      </p>

                      {/* Safety First Header */}
                      <div className="bg-forest/5 rounded-2xl p-6 border border-forest/10 mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-emerald-500/20 p-3 rounded-full">
                            <Shield className="h-6 w-6 text-emerald-500" />
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-forest uppercase tracking-tight">Technical Safety</h4>
                            <p className="text-[10px] text-forest/50 font-medium font-sans">Certified equipment & expert supervision.</p>
                          </div>
                        </div>
                        <Sparkles className="h-6 w-6 text-terracotta" />
                      </div>
                    </section>

                    {/* Experience Detail */}
                    {selectedActivity.theExperience && (
                      <section className="bg-forest/[0.02] p-10 rounded-[3rem] border border-forest/5 relative overflow-hidden">
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-terracotta/[0.03] rounded-full blur-3xl pointer-events-none" />
                        <div className="flex items-center justify-between mb-10">
                          <h4 className="font-playfair text-3xl font-black italic text-forest">The Adventure Path</h4>
                          <Zap className="h-8 w-8 text-terracotta animate-pulse" />
                        </div>
                        
                        <div className="space-y-8 relative">
                          <div className="absolute left-4 top-2 bottom-2 w-px bg-forest/10" />
                          
                          {selectedActivity.theExperience.split('\n').map((line: string, i: number) => {
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
                          <div className="font-fluid text-lg xs:text-xl text-terracotta -mb-1">Investment in Thrill</div>
                          <div className="text-3xl xs:text-4xl font-playfair font-black italic text-forest leading-none">
                            {selectedActivity.price}
                            <span className="text-[10px] font-bold uppercase tracking-widest text-forest/20 ml-2 italic">/ Session</span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full lg:w-auto">
                          {(() => {
                            const slotIndex = selectedSlots[selectedActivity.id];
                            const baseId = `adventure-${selectedActivity.id}`;
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
                                {selectedActivity.slots && selectedActivity.slots.length > 0 ? (
                                  <div className="relative group w-full sm:w-auto">
                                    <select 
                                      value={selectedSlots[selectedActivity.id] || ''}
                                      onChange={(e) => setSelectedSlots({ ...selectedSlots, [selectedActivity.id]: e.target.value })}
                                      className="w-full sm:min-w-[200px] h-14 rounded-full border border-forest/10 bg-forest/[0.03] px-6 appearance-none focus:outline-none focus:ring-4 focus:ring-forest/5 text-forest font-bold text-[10px] uppercase tracking-widest cursor-pointer group-hover:bg-forest/5 transition-all outline-none"
                                    >
                                      <option value="">Pick Adventure Slot</option>
                                      {selectedActivity.slots.map((slot: any, i: number) => {
                                        const start = new Date(slot.startDate);
                                        let endStr = '';
                                        if (slot.endDate) {
                                          endStr = ` - ${new Date(slot.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
                                        } else if (selectedActivity.duration) {
                                          const daysMatch = selectedActivity.duration.match(/(\d+)/);
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
                                    const slotIndex = selectedSlots[selectedActivity.id];
                                    const slot = slotIndex !== undefined ? selectedActivity.slots?.[parseInt(slotIndex)] : undefined;
                                    
                                    const cartItem = {
                                      id: currentItemId,
                                      name: selectedActivity.title || selectedActivity.name,
                                      price: selectedActivity.price,
                                      type: 'Adventure Activity',
                                      image: selectedActivity.image,
                                      dateRange: formatDateRange(selectedDate, selectedActivity.duration, slot)
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
                                    selectedActivity.isAvailable === false || 
                                    (selectedActivity.slots && selectedActivity.slots.length > 0 
                                      ? !selectedSlots[selectedActivity.id] 
                                      : !selectedDate)
                                  }
                                  className="w-full sm:min-w-[220px] h-14 bg-terracotta hover:bg-terracotta/90 text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-terracotta/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                                >
                                  <Zap className="h-4 w-4" />
                                  Book Adventure
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
