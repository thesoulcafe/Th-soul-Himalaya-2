import { cn } from '@/lib/utils';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, Wifi, Coffee, Laptop, Mountain, CheckCircle2, ShieldCheck, Zap, Edit2, Clock, Calendar, ChevronDown, Star, Stars, Share2, ShoppingCart, ArrowRight, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import AuthModal from '@/components/AuthModal';
import { toast } from 'sonner';
import ImageSlider from '@/components/ImageSlider';
import CustomizeTripCard from '@/components/CustomizeTripCard';
import { SEO } from '@/components/SEO';
import PackageDetailModal from '@/components/PackageDetailModal';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { DEFAULT_WFH } from '@/constants';

export default function WFH() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState<any[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>({});
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { cart: globalCart, addToCart: globalAddToCart, updateQuantity: globalUpdateQuantity, setPendingCartItem } = useCart();

  // Scroll lock and reset when modal is open
  useEffect(() => {
    if (selectedPackage) {
      document.body.style.overflow = 'hidden';
      window.scrollTo(0, 0); // Reset to top when opening details
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedPackage]);

  const [packageList, setPackageList] = useState<any[]>([]); // Using packages state but adding search params
  const [searchParams] = useSearchParams();
  const [seo, setSeo] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'seo_settings'), where('path', '==', '/wfh'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) setSeo(snapshot.docs[0].data());
    }, (error) => {
      console.error("WFH SEO snapshot failed:", error);
    });
    return () => unsubscribe();
  }, []);

  const handleShare = async (pkg: any) => {
    const shareData = {
      title: `The Soul Himalaya - ${pkg.title}`,
      text: pkg.description || `Elevate your productivity with this: ${pkg.title}`,
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
    const q = query(collection(db, 'content'), where('type', '==', 'wfh'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbItems = snapshot.empty ? [] : snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data().data,
        originalType: 'wfh'
      }));

      const sortedPackages = dbItems.sort((a, b) => {
        const aAvail = a.isAvailable !== false;
        const bAvail = b.isAvailable !== false;
        if (aAvail && !bAvail) return -1;
        if (!aAvail && bAvail) return 1;

        const aOrder = (a.order !== undefined && a.order !== null) ? Number(a.order) : 999;
        const bOrder = (b.order !== undefined && b.order !== null) ? Number(b.order) : 999;
        return aOrder - bOrder;
      });

      setPackages(sortedPackages);
      setHasLoaded(true);
    }, (error) => {
      console.error("WFH packages snapshot failed:", error);
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
      console.error("WFH config snapshot failed:", error);
    });
    return () => unsubscribe();
  }, []);

  const getItemQuantity = (id: string) => {
    return globalCart.find(i => i.id === id)?.quantity || 0;
  };

  useEffect(() => {
    const id = searchParams.get('id');
    if (id && packages.length > 0) {
      const pkg = packages.find(p => p.id === id);
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
          title: pkg.title || pkg.name,
          description: fullDescription,
          image: pkg.image || pkg.images?.[0],
          path: `${window.location.origin}/wfh?id=${id}`,
          seoData: pkg.seoData
        });
      }
    }
  }, [searchParams, packages]);

  const filteredPackages = useMemo(() => {
    return packages.filter(pkg => {
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
  }, [packages, profile?.role, searchQuery]);

  return (
    <div className="pt-24">
      {seo && <SEO 
        title={seo.title || "Work from Himalaya"} 
        description={seo.description || "Mountain offices for the soulful worker."} 
        image={seo.image}
        seoData={seo.seoData}
      />}
      {/* Tagline */}
      <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-forest mb-2">Work From Himalaya</h1>
        <p className="text-terracotta font-medium tracking-widest uppercase text-xs mb-8">Elevate Your Productivity</p>
        
        {/* Search input */}
        <div className="relative group md:max-w-md mx-auto transition-all duration-300 z-50">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-forest/20 group-focus-within:text-terracotta transition-colors" />
          <input 
            type="text"
            placeholder="FIND YOUR DESK..."
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

      {/* Features Grid */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Wifi, title: 'Free Internet', desc: 'Reliable connection for your video calls.' },
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
              filteredPackages.map((pkg, i) => (
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
                        <div className="flex items-center gap-3">
                          <Link 
                            to="/gallery" 
                            onClick={(e) => e.stopPropagation()}
                            className="text-[9px] font-black text-terracotta hover:text-forest transition-colors uppercase tracking-[0.2em] underline underline-offset-4 decoration-terracotta/30"
                          >
                            Review
                          </Link>
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

                      <div className="mt-auto">
                        <Button 
                          variant="ghost" 
                          className={cn(
                            "w-full h-11 rounded-full border font-bold text-[10px] uppercase tracking-widest transition-all duration-300 group/btn",
                            pkg.popular ? "border-white/20 text-white hover:bg-white hover:text-forest" : "border-forest/10 text-forest hover:bg-forest hover:text-white"
                          )}
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
      <PackageDetailModal
        isOpen={!!selectedPackage}
        onClose={() => setSelectedPackage(null)}
        pkg={selectedPackage}
        onRequireAuth={() => setShowAuthModal(true)}
      />

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
