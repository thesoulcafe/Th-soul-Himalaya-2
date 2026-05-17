import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, Users, Star, CheckCircle2, Compass, 
  Minus, Plus, ShoppingCart, ChevronDown, Calendar, Share2, 
  X, ArrowRight, Sunrise, Mountain
} from 'lucide-react';
import ImageSlider from '@/components/ImageSlider';
import { useAuth } from '@/lib/AuthContext';
import { useCart } from '@/lib/CartContext';

interface PackageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg: any; // The selected package
  onRequireAuth: () => void;
}

export default function PackageDetailModal({ isOpen, onClose, pkg, onRequireAuth }: PackageDetailModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, addToCart, updateQuantity, setPendingCartItem } = useCart();
  
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setSelectedSlotIndex('');
      setSelectedDate('');
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || !pkg) return null;

  const handleShare = async () => {
    try {
      await navigator.share({
        title: pkg.title || pkg.name,
        text: pkg.description,
        url: window.location.href,
      });
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

  const formatDateRange = (startDateStr: string, durationStr: string, slot?: any) => {
    if (slot && slot.startDate && slot.endDate) {
      try {
        const start = new Date(slot.startDate);
        const end = new Date(slot.endDate);
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
        return `${start.toLocaleDateString('en-IN', options)} - ${end.toLocaleDateString('en-IN', options)}`;
      } catch (e) {
        return startDateStr;
      }
    }
    if (!startDateStr) return '';
    try {
      const start = new Date(startDateStr);
      const daysMatch = durationStr?.match(/(\d+)/);
      const days = daysMatch ? parseInt(daysMatch[1]) : 1;
      const end = new Date(start);
      end.setDate(start.getDate() + days - 1);
      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
      return `${start.toLocaleDateString('en-IN', options)} - ${end.toLocaleDateString('en-IN', options)}`;
    } catch (e) {
      return startDateStr;
    }
  };

  const title = pkg.title || pkg.name;
  const description = pkg.description;
  const price = pkg.price;
  const duration = pkg.duration || "Custom duration";
  const theExperience = pkg.theExperience;
  const highlights = pkg.highlights || pkg.features || [];
  const typeLabel = pkg.category || pkg.type || 'Experience';
  const originalType = pkg.originalType || 'package';
  const rating = pkg.rating || '4.9';
  const focus = pkg.focus || typeLabel || 'Wellness';
  
  const images = (title?.toLowerCase().includes('valley of shadows') 
    ? ["https://i.postimg.cc/TYqctVvr/IMG-8144.jpg"] 
    : [pkg.image, ...(pkg.images || [])]).filter(Boolean);

  const baseId = `${originalType}-${pkg.id}`;
  const currentItemId = `${baseId}${selectedSlotIndex ? `-slot-${selectedSlotIndex}` : ''}`;
  const quantity = cart.find(i => i.id === currentItemId)?.quantity || 0;

  const handleBooking = () => {
    const slot = selectedSlotIndex ? pkg.slots?.[parseInt(selectedSlotIndex)] : undefined;
    const cartItem = {
      id: currentItemId,
      name: title,
      price: price,
      type: originalType === 'yoga' ? 'Yoga Retreat' : (originalType === 'meditation' ? 'Meditation Retreat' : 'Experience'),
      image: pkg.image || images[0],
      dateRange: formatDateRange(selectedDate, duration, slot)
    };

    if (!user) {
      setPendingCartItem(cartItem);
      onRequireAuth();
      return;
    }

    addToCart(cartItem);
    navigate('/cart');
  };

  const canBook = pkg.isAvailable !== false && (pkg.slots?.length > 0 ? selectedSlotIndex !== '' : selectedDate !== '');

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-forest/80 backdrop-blur-sm overflow-y-auto custom-scrollbar"
        onClick={onClose}
        data-lenis-prevent="true"
      >
        <div className="min-h-full py-8 px-4 sm:py-12 sm:px-6 flex flex-col">
          <motion.div 
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#FAF9F6] w-full max-w-5xl rounded-[2rem] overflow-hidden shadow-2xl relative flex flex-col mx-auto mt-4 mb-4 sm:mt-10 sm:mb-10"
            onClick={(e) => e.stopPropagation()}
          >
          {/* Navigation / Close Button */}
          <div className="absolute top-4 sm:top-6 right-4 sm:right-6 lg:right-8 z-50 flex items-center gap-3">
             <button 
               onClick={handleShare}
               className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center bg-white/70 backdrop-blur-md text-forest hover:bg-white hover:text-terracotta rounded-full shadow-sm border border-forest/5 transition-all"
             >
               <Share2 className="h-4 w-4 lg:h-5 lg:w-5" />
             </button>
             <button 
               onClick={onClose}
               className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center bg-white/70 backdrop-blur-md text-forest hover:bg-white hover:text-terracotta rounded-full shadow-sm border border-forest/5 transition-all"
             >
               <X className="h-5 w-5 lg:h-6 lg:w-6" />
             </button>
          </div>

          {/* Hero / Gallery */}
          <div className="w-full h-[45dvh] lg:h-[55dvh] relative shrink-0">
            <ImageSlider 
              images={images} 
              alt={title}
              className="w-full h-full object-cover"
              autoSwipe={true}
              interval={5000}
              showThumbnails={false}
            />
            {/* Subtle Gradient for top tags readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-forest/40 to-transparent h-32 pointer-events-none" />
            
            {pkg.isAvailable === false && (
              <div className="absolute inset-0 bg-forest/40 flex items-center justify-center z-10 backdrop-blur-sm">
                <Badge className="bg-white/90 text-forest border-none px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-lg">
                  Currently Unavailable
                </Badge>
              </div>
            )}
            
            {/* Top Tags */}
            <div className="absolute top-6 left-6 lg:top-8 lg:left-8 z-10">
              <Badge className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-5 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-sm">
                {typeLabel}
              </Badge>
            </div>
          </div>

          {/* Body Content */}
          <div className="w-full px-6 py-10 sm:px-12 sm:py-14 lg:px-20 lg:py-16">
            <div className="max-w-3xl mx-auto w-full">
              
              {/* Header: Title & Rating Below Image */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-1.5 bg-terracotta/10 px-3 py-1.5 rounded-full text-terracotta">
                    <Star className="h-4 w-4 fill-terracotta" />
                    <span className="text-sm font-bold tracking-widest uppercase">{rating}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-forest/20" />
                  <span className="flex items-center gap-1.5 text-xs text-forest/60 font-black uppercase tracking-[0.2em]">
                    <Compass className="h-4 w-4 shrink-0" /> {focus}
                  </span>
                </div>
                
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-playfair italic font-black text-forest tracking-tight leading-[1.1] mb-8 break-words drop-shadow-sm">
                  {title}
                </h2>
                
                <p className="text-forest/80 font-sans leading-relaxed text-lg sm:text-xl font-medium max-w-2xl">
                  {description}
                </p>
              </div>

              {/* Stats Card */}
              <div className="bg-white border border-forest/[0.04] rounded-[2rem] p-6 sm:p-10 mb-14 shadow-[0_8px_30px_rgb(0,0,0,0.03)] grid grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-full">
                <div className="flex flex-col gap-4">
                  <div className="bg-cream/50 w-12 h-12 flex items-center justify-center rounded-2xl text-terracotta shrink-0">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-[10px] text-forest/40 font-black uppercase tracking-[0.2em] mb-1.5">Duration</div>
                    <div className="text-base sm:text-lg font-bold text-forest">{duration}</div>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="bg-cream/50 w-12 h-12 flex items-center justify-center rounded-2xl text-terracotta shrink-0">
                    <Mountain className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-[10px] text-forest/40 font-black uppercase tracking-[0.2em] mb-1.5">Intensity</div>
                    <div className="text-base sm:text-lg font-bold text-forest">Soulful</div>
                  </div>
                </div>
                <div className="flex flex-col gap-4 col-span-2 md:col-span-1">
                  <div className="bg-cream/50 w-12 h-12 flex items-center justify-center rounded-2xl text-terracotta shrink-0">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-[10px] text-forest/40 font-black uppercase tracking-[0.2em] mb-1.5">Group</div>
                    <div className="text-base sm:text-lg font-bold text-forest">Intimate</div>
                  </div>
                </div>
              </div>

              {/* Highlights */}
              {highlights?.length > 0 && (
                <div className="mb-14 w-full max-w-full">
                  <h3 className="font-playfair text-2xl sm:text-3xl font-black italic text-forest mb-8">What to Expect</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {highlights.map((h: string, i: number) => (
                      <div key={i} className="flex items-start gap-4 bg-white p-5 sm:p-6 rounded-[1.5rem] border border-forest/[0.04] shadow-sm hover:border-terracotta/20 hover:shadow-md transition-all duration-300 w-full group">
                        <CheckCircle2 className="h-5 w-5 text-terracotta shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                        <span className="text-base font-medium text-forest/80 leading-relaxed text-balance">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Itinerary / Experience */}
              {theExperience && (
                <div className="mb-14 w-full max-w-full">
                  <h3 className="font-playfair text-2xl sm:text-3xl font-black italic text-forest mb-10 flex items-center gap-4">
                    <Sunrise className="h-8 w-8 text-terracotta shrink-0" />
                    The Journey
                  </h3>
                  
                  <div className="space-y-10 relative before:absolute before:inset-y-4 before:left-[19px] before:w-px before:bg-forest/10 p-2 w-full">
                    {theExperience.split('\n').map((line: string, i: number) => {
                      if (!line.trim()) return null;
                      const isDay = line.toLowerCase().startsWith('day') || line.toLowerCase().startsWith('step');
                      return (
                        <div key={i} className={cn("relative pl-12 sm:pl-16 w-full max-w-full", isDay ? "mt-12 first:mt-2" : "mt-3")}>
                          {isDay && (
                            <div className="absolute left-[14px] top-1.5 w-3 h-3 rounded-full bg-terracotta shadow-[0_0_0_6px_#FAF9F6] ring-1 ring-terracotta/20" />
                          )}
                          <div className={cn(
                            isDay 
                              ? "text-xs font-black text-terracotta uppercase tracking-[0.2em] mb-3" 
                              : "text-base sm:text-[17px] font-medium text-forest/70 leading-[1.8] break-words"
                          )}>
                            {line.trim()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Booking Section */}
              <div className="bg-white border border-forest/10 rounded-[2rem] p-6 sm:p-10 shadow-xl shadow-forest/5 flex flex-col xl:flex-row xl:items-center justify-between gap-8 mt-16">
                <div>
                  <div className="text-[10px] text-forest/50 font-black uppercase tracking-[0.2em] mb-2">
                    Investment
                  </div>
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-playfair italic font-black text-forest flex items-baseline gap-2">
                    {price} <span className="text-xs uppercase tracking-widest font-sans font-bold text-forest/40 not-italic whitespace-nowrap">/ Person</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  {quantity > 0 ? (
                     <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                       <div className="flex items-center justify-between bg-forest/[0.03] rounded-full border border-forest/10 p-1.5 w-full sm:w-auto shrink-0 shadow-inner">
                         <Button 
                           size="icon" 
                           variant="ghost" 
                           className="h-12 w-12 rounded-full text-forest hover:bg-white hover:text-terracotta transition-all"
                           onClick={() => updateQuantity(currentItemId, quantity - 1)}
                         >
                           <Minus className="h-4 w-4" />
                         </Button>
                         <span className="font-black text-forest text-lg px-6 min-w-[3.5rem] text-center">{quantity}</span>
                         <Button 
                           size="icon" 
                           variant="ghost" 
                           className="h-12 w-12 rounded-full text-forest hover:bg-white hover:text-terracotta transition-all"
                           onClick={() => updateQuantity(currentItemId, quantity + 1)}
                         >
                           <Plus className="h-4 w-4" />
                         </Button>
                       </div>
                       <Link to="/cart" className="w-full sm:w-auto">
                         <Button className="w-full h-14 px-10 rounded-full text-xs font-black uppercase tracking-[0.2em] bg-terracotta text-white hover:bg-terracotta/90 transition-all flex items-center justify-center gap-3 shadow-xl shadow-terracotta/20 shrink-0 hover:scale-[1.02]">
                           <ShoppingCart className="h-5 w-5 shrink-0" /> Checkout <ArrowRight className="h-5 w-5 shrink-0" />
                         </Button>
                       </Link>
                     </div>
                  ) : (
                    <>
                      {pkg.slots && pkg.slots.length > 0 ? (
                        <div className="relative w-full sm:w-[240px] lg:w-[280px] group shrink-0">
                           <select 
                            value={selectedSlotIndex}
                            onChange={(e) => setSelectedSlotIndex(e.target.value)}
                            className="w-full h-14 rounded-full border border-forest/10 bg-forest/[0.02] pl-6 pr-12 appearance-none focus:outline-none focus:ring-2 focus:ring-forest/10 text-forest font-bold text-xs tracking-[0.1em] uppercase cursor-pointer outline-none transition-all group-hover:bg-white truncate"
                          >
                            <option value="">Select Date</option>
                            {pkg.slots.map((slot: any, i: number) => {
                              const start = new Date(slot.startDate);
                              let endStr = '';
                              if (slot.endDate) {
                                endStr = ` - ${new Date(slot.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
                              } else if (duration) {
                                const daysMatch = duration.match(/(\d+)/);
                                const days = daysMatch ? parseInt(daysMatch[1]) : 1;
                                const end = new Date(start);
                                end.setDate(start.getDate() + days - 1);
                                endStr = ` - ${end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
                              }
                              return (
                                <option key={i} value={i}>
                                  {start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}{endStr}
                                </option>
                              );
                            })}
                          </select>
                          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-forest/40 pointer-events-none group-hover:text-forest transition-colors" />
                        </div>
                      ) : (
                        <div className="relative w-full sm:w-[240px] lg:w-[280px] group shrink-0">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-terracotta z-10 pointer-events-none">
                            <Calendar className="h-5 w-5" />
                          </div>
                          <input
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full h-14 rounded-full border border-forest/10 bg-forest/[0.02] pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-forest/10 text-forest font-bold text-xs tracking-[0.1em] uppercase cursor-pointer outline-none transition-all group-hover:bg-white text-clip"
                          />
                        </div>
                      )}

                      <Button 
                        onClick={handleBooking}
                        disabled={!canBook}
                        className="w-full sm:w-auto h-14 px-10 bg-forest hover:bg-forest/90 text-white rounded-full font-black tracking-[0.2em] text-xs uppercase transition-all flex items-center justify-center gap-3 shadow-xl shadow-forest/20 shrink-0 hover:scale-[1.02]"
                      >
                        Reserve Spot <ArrowRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
            </div>
          </div>
        </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

