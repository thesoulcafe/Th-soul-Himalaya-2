import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, Users, Zap, Star, CheckCircle2, Compass, Sparkles, 
  Minus, Plus, ShoppingCart, ChevronDown, Calendar, Share2, 
  X, MapPin, Activity, ShieldCheck, ArrowRight, Sunrise, Mountain
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
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-forest/80 backdrop-blur-sm p-4 sm:p-6 lg:p-8"
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="bg-cream w-full max-w-[1000px] max-h-[95vh] sm:max-h-[90vh] rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row relative border border-white/20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button - Desktop (Absolute) & Mobile */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-50 bg-white/50 backdrop-blur-md hover:bg-white text-forest p-3 rounded-full shadow-sm border border-forest/10 hover:border-terracotta/30 hover:text-terracotta transition-all"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Left Side: Image Gallery */}
          <div className="w-full md:w-[45%] h-[35vh] md:h-auto shrink-0 relative bg-forest overflow-hidden">
            <ImageSlider 
              images={images} 
              alt={title}
              className="h-full w-full object-cover opacity-90 transition-opacity duration-700"
              autoSwipe={true}
              interval={4000}
              showThumbnails={false}
            />
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-forest/20 to-transparent pointer-events-none" />
            
            {pkg.isAvailable === false && (
              <div className="absolute inset-0 bg-forest/40 flex items-center justify-center z-10 backdrop-blur-sm">
                <Badge className="bg-white/90 text-forest border-none px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                  Currently Unavailable
                </Badge>
              </div>
            )}
            
            {/* Optional Top Tags */}
            <div className="absolute top-6 left-6 flex gap-2 z-10">
              <Badge className="bg-forest/60 backdrop-blur-md text-white border border-white/20 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-sm">
                {typeLabel}
              </Badge>
            </div>
            
            {/* Bottom Tag Overlay */}
            <div className="absolute bottom-6 left-6 z-10">
               <div className="flex items-center gap-2 text-white/90 mb-1">
                 <Star className="h-4 w-4 text-terracotta fill-current" />
                 <span className="text-xs font-bold tracking-widest uppercase">{rating} / 5.0</span>
               </div>
               <div className="font-fluid text-2xl text-terracotta drop-shadow-md">The Soul Himalaya</div>
            </div>
          </div>

          {/* Right Side: Content Container */}
          <div 
            className="w-full md:w-[55%] flex-1 flex flex-col min-h-0 bg-[#FAF9F6] relative overflow-y-auto custom-scrollbar overscroll-contain"
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <div className="p-8 md:p-12 lg:p-14 flex-grow">
              
              {/* Header Info */}
              <div className="mb-10">
                <div className="flex items-center flex-wrap gap-3 text-terracotta text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                  <span className="flex items-center gap-1.5"><Compass className="h-3 w-3" /> {focus}</span>
                  <div className="w-1 h-1 rounded-full bg-forest/20" />
                  <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {duration}</span>
                </div>
                <h2 className="text-3xl md:text-[2.75rem] font-playfair italic font-black text-forest tracking-tight leading-[1.1] mb-6">
                  {title}
                </h2>
                <p className="text-forest/70 font-sans leading-[1.8] text-sm md:text-[15px] font-medium">
                  {description}
                </p>
              </div>

              {/* Stats / Quick Info Card */}
              <div className="bg-white border border-forest/[0.04] rounded-3xl p-6 mb-12 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-wrap gap-y-8 gap-x-10">
                <div className="flex items-start gap-4">
                  <div className="bg-cream p-3 rounded-2xl text-terracotta"><Clock className="h-5 w-5" /></div>
                  <div>
                    <div className="text-[9px] text-forest/40 font-black uppercase tracking-[0.2em] mb-1">Duration</div>
                    <div className="text-sm font-bold text-forest">{duration}</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-cream p-3 rounded-2xl text-terracotta"><Mountain className="h-5 w-5" /></div>
                  <div>
                    <div className="text-[9px] text-forest/40 font-black uppercase tracking-[0.2em] mb-1">Pace</div>
                    <div className="text-sm font-bold text-forest">Soulful</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-cream p-3 rounded-2xl text-terracotta"><Users className="h-5 w-5" /></div>
                  <div>
                    <div className="text-[9px] text-forest/40 font-black uppercase tracking-[0.2em] mb-1">Group Size</div>
                    <div className="text-sm font-bold text-forest">Intimate</div>
                  </div>
                </div>
              </div>

              {/* Journey Highlights */}
              {highlights?.length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-px flex-grow bg-forest/10" />
                    <h3 className="text-[10px] font-black text-forest uppercase tracking-[0.2em]">Journey Details</h3>
                    <div className="h-px flex-grow bg-forest/10" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {highlights.map((h: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-forest/[0.04] shadow-sm hover:border-terracotta/20 transition-colors">
                        <CheckCircle2 className="h-4 w-4 text-terracotta shrink-0 mt-0.5" />
                        <span className="text-xs font-semibold text-forest/80 leading-snug">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* The Experience */}
              {theExperience && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="font-playfair text-2xl font-black italic text-forest">The Experience</h3>
                    <Sunrise className="h-6 w-6 text-terracotta" />
                  </div>
                  <div className="space-y-8 relative before:absolute before:inset-y-2 before:left-[11px] before:w-px before:bg-forest/10 bg-forest/[0.02] p-8 -mx-8 sm:rounded-3xl border border-forest/[0.03]">
                    {theExperience.split('\n').map((line: string, i: number) => {
                      if (!line.trim()) return null;
                      const isDay = line.toLowerCase().startsWith('day') || line.toLowerCase().startsWith('step');
                      return (
                        <div key={i} className={cn("relative pl-10", isDay ? "mt-10 first:mt-0" : "mt-2")}>
                          {isDay && (
                            <div className="absolute left-[7px] top-1.5 w-2.5 h-2.5 rounded-full bg-terracotta shadow-[0_0_0_4px_#F8F5F1]" />
                          )}
                          <div className={cn(isDay ? "text-[10px] font-black text-terracotta uppercase tracking-[0.2em] mb-2" : "text-[13px] font-medium text-forest/70 leading-[1.8]")}>
                            {line.trim()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Fixed Footer / Booking Section */}
            <div className="bg-white border-t border-forest/5 p-6 md:px-10 md:py-8 shrink-0 shadow-[0_-20px_40px_rgba(45,62,53,0.04)] z-10 relative">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center md:items-start md:flex-col gap-4 md:gap-1 justify-between">
                  <div className="text-[10px] text-forest/50 font-black uppercase tracking-[0.2em] order-2 md:order-1 flex items-center gap-2">
                    Investment
                    <button onClick={handleShare} className="md:hidden text-terracotta"><Share2 className="h-4 w-4" /></button>
                  </div>
                  <div className="text-3xl lg:text-4xl font-playfair italic font-black text-forest flex items-baseline gap-2 order-1 md:order-2">
                    {price} <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-forest/30 not-italic">/ Person</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  {quantity > 0 ? (
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="flex items-center bg-forest/[0.03] rounded-full border border-forest/10 p-1">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-12 w-12 rounded-full text-forest hover:bg-white hover:text-terracotta transition-all hover:shadow-sm"
                          onClick={() => updateQuantity(currentItemId, quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-black text-forest text-sm px-4 min-w-[2.5rem] text-center">{quantity}</span>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-12 w-12 rounded-full text-forest hover:bg-white hover:text-terracotta transition-all hover:shadow-sm"
                          onClick={() => updateQuantity(currentItemId, quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Link to="/cart" className="w-full sm:w-auto">
                        <Button className="w-full h-14 px-8 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-terracotta text-white hover:bg-terracotta/90 transition-all flex items-center justify-center gap-3 shadow-lg shadow-terracotta/20 hover:scale-[1.02]">
                          <ShoppingCart className="h-4 w-4" /> Go to Cart <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <>
                      {pkg.slots && pkg.slots.length > 0 ? (
                        <div className="relative w-full sm:w-auto group">
                           <select 
                            value={selectedSlotIndex}
                            onChange={(e) => setSelectedSlotIndex(e.target.value)}
                            className="w-full sm:min-w-[200px] h-14 rounded-full border border-forest/10 bg-forest/[0.02] px-6 appearance-none focus:outline-none focus:ring-2 focus:ring-forest/10 text-forest font-bold text-[10px] tracking-[0.1em] uppercase cursor-pointer outline-none transition-all group-hover:bg-forest/[0.05]"
                          >
                            <option value="">Pick Journey Date</option>
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
                          <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-forest/40 pointer-events-none group-hover:text-forest transition-colors" />
                        </div>
                      ) : (
                        <div className="relative w-full sm:w-auto group">
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-terracotta z-10">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <input
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full sm:min-w-[200px] h-14 rounded-full border border-forest/10 bg-forest/[0.02] pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-forest/10 text-forest font-bold text-[10px] tracking-[0.1em] uppercase cursor-pointer outline-none transition-all group-hover:bg-forest/[0.05]"
                          />
                        </div>
                      )}

                      <Button 
                        onClick={handleBooking}
                        disabled={!canBook}
                        className="w-full sm:w-auto h-14 px-10 bg-forest hover:bg-forest/90 text-white rounded-full font-black tracking-[0.2em] text-[10px] uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-forest/20 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Book Journey
                      </Button>
                      
                      <button 
                        onClick={handleShare}
                        className="hidden md:flex bg-forest/5 p-4 rounded-full text-forest hover:bg-terracotta hover:text-white transition-all ml-1 shrink-0"
                      >
                        <Share2 className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
