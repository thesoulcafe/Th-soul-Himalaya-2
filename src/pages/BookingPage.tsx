import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Calendar, CheckCircle2, ArrowRight, ArrowLeft, 
  MapPin, Clock, Shield, Star, Sparkles, User, Info,
  Compass, Zap, Heart, Wind, Edit2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { 
  DEFAULT_TOURS, 
  DEFAULT_TREKKS, 
  DEFAULT_YOGA, 
  DEFAULT_MEDITATION,
  DEFAULT_ADVENTURE,
  DEFAULT_WFH
} from '@/constants';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import AuthModal from '@/components/AuthModal';

export default function BookingPage() {
  const { category, id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, setPendingCartItem } = useCart();
  
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "content", id!);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setItem({ id: docSnap.id, ...docSnap.data().data });
        } else {
          toast.error("Package not found", {
            description: "The experience you are looking for is not currently available."
          });
        }
      } catch (error) {
        console.error("Error fetching booking item:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchItem();
  }, [id]);

  const handleBooking = () => {
    const hasSlots = item?.slots && item.slots.length > 0;
    
    if (hasSlots && selectedSlotIndex === null) {
      toast.error("Selection Required", { description: "Please pick a date for your journey." });
      return;
    }

    if (!hasSlots && !selectedDate) {
      toast.error("Date Required", { description: "Please select a starting date for your experience." });
      return;
    }

    const slot = selectedSlotIndex !== null ? item.slots[selectedSlotIndex] : null;
    
    let dateRange = 'Available Slots';
    if (slot) {
      dateRange = `${new Date(slot.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })} to ${new Date(slot.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    } else if (selectedDate) {
      const start = new Date(selectedDate);
      const daysMatch = item.duration?.match(/(\d+)\s*Days/);
      const days = daysMatch ? parseInt(daysMatch[1]) : 1;
      const end = new Date(start);
      end.setDate(start.getDate() + days - 1);
      dateRange = `${start.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })} to ${end.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    }

    const cartItem = {
      id: `${item.id}${selectedSlotIndex !== null ? `-slot-${selectedSlotIndex}` : (selectedDate ? `-${selectedDate}` : '')}`,
      name: item.title || item.name,
      price: item.price,
      type: item.originalType || category || 'Experience',
      image: item.image,
      dateRange: dateRange
    };

    if (!user) {
      setPendingCartItem(cartItem);
      setShowAuthModal(true);
      return;
    }

    addToCart(cartItem);
    toast.success("Added to Soul Cart", {
      description: `${item.title || item.name} has been added to your journey.`,
      action: {
        label: "View Cart",
        onClick: () => navigate('/cart')
      }
    });
    navigate('/cart');
  };

  const handleBack = () => {
    // If we have history and the previous page wasn't some external site
    if (window.history.length > 1 && document.referrer.includes(window.location.host)) {
      navigate(-1);
    } else {
      // Fallback to the category list
      navigate(`/${category || 'tours'}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="h-12 w-12 border-4 border-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="pt-24 min-h-screen bg-cream relative overflow-hidden">
      <SEO 
        title={`Book ${item.title || item.name} | The Soul Himalaya`} 
        description={`Secure your spot for ${item.title || item.name} with The Soul Himalaya.`}
      />
      
      {/* Decorative Orbs */}
      <div className="absolute -top-[10%] -right-[10%] w-[600px] h-[600px] bg-terracotta/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-[10%] -left-[10%] w-[600px] h-[600px] bg-forest/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 relative z-10 pb-20">
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 text-forest/40 hover:text-forest transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Return to {category || 'Journey'}</span>
        </button>

        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-forest/5"
            >
              <Calendar className="h-4 w-4 text-terracotta" />
              <span className="text-[10px] font-black uppercase tracking-widest text-forest">Pick your departing moment</span>
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-playfair font-black italic tracking-tighter text-forest uppercase">
              Schedule your Path
            </h1>
            <p className="text-forest/50 text-[10px] font-bold uppercase tracking-[0.3em] max-w-md mx-auto leading-relaxed text-center">
              Selective departures for souls seeking the extraordinary.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Slot Selection Column */}
            <div className="md:col-span-2 space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {item.slots?.length > 0 ? (
                  item.slots.map((slot: any, i: number) => {
                    const isSelected = selectedSlotIndex === i;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => setSelectedSlotIndex(i)}
                        className={`w-full p-6 rounded-[2.5rem] border-2 transition-all duration-500 flex items-center justify-between group relative overflow-hidden cursor-pointer ${
                          isSelected 
                            ? "border-terracotta bg-white shadow-2xl scale-[1.02]" 
                            : "border-forest/5 bg-white/50 hover:border-terracotta/30 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-6 relative z-10">
                          <div className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                            isSelected ? "bg-terracotta text-white shadow-lg rotate-6" : "bg-forest/5 text-forest/20 group-hover:bg-terracotta/10 group-hover:text-terracotta"
                          }`}>
                            <Calendar className="h-7 w-7" />
                          </div>
                          <div className="text-left">
                            <div className="text-lg font-black text-forest tracking-tight">
                              {new Date(slot.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
                            </div>
                            <div className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ${
                              isSelected ? "text-terracotta" : "text-forest/30"
                            }`}>
                              {slot.available !== false ? 'Available Seat' : 'Last few spots'}
                            </div>
                          </div>
                        </div>
                        {isSelected ? (
                          <div className="bg-terracotta p-2 rounded-full text-white shadow-lg">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                        ) : (
                          <div className="bg-forest/5 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                            <ArrowRight className="h-5 w-5 text-terracotta" />
                          </div>
                        )}
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="p-12 text-center bg-white/50 rounded-[3rem] border border-dashed border-forest/20">
                    <Wind className="h-12 w-12 text-forest/10 mx-auto mb-4" />
                    <p className="text-xs font-bold text-forest/40 uppercase tracking-widest">No scheduled departures found.</p>
                    <Link to="/tailor-made" className="text-terracotta text-[10px] font-black uppercase tracking-widest underline underline-offset-4 mt-2 inline-block">Request custom dates</Link>
                  </div>
                )}
              </div>

              {/* Navigation Actions */}
              <div className="flex flex-col gap-4">
                {/* Customize your Trip redirect */}
                <div className="bg-forest rounded-[2.5rem] p-8 flex items-center justify-between group cursor-pointer hover:bg-forest/90 transition-all border border-white/10 shadow-lg" onClick={() => navigate('/tailor-made')}>
                  <div className="flex items-center gap-5">
                    <div className="bg-terracotta/20 h-14 w-14 rounded-full flex items-center justify-center">
                      <Edit2 className="h-6 w-6 text-terracotta" />
                    </div>
                    <div className="text-left">
                      <div className="text-lg font-black text-white uppercase tracking-tight">Customize your Trip</div>
                      <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Found better dates or location? Talk to us.</div>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-full border border-white/5 flex items-center justify-center group-hover:border-terracotta/30 group-hover:bg-terracotta/10 transition-all">
                    <ArrowRight className="h-5 w-5 text-white/20 group-hover:text-terracotta group-hover:translate-x-1 transition-all" />
                  </div>
                </div>

                <Button 
                  variant="ghost"
                  onClick={handleBack}
                  className="h-16 rounded-[2rem] border-2 border-forest/5 text-forest/40 hover:text-forest hover:bg-white font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  <ArrowLeft className="mr-3 h-4 w-4" /> Go Back to List
                </Button>
              </div>
            </div>

            {/* Summary Column */}
            <div className="space-y-6">
              <Card className="p-8 rounded-[3rem] border-forest/10 bg-white shadow-xl sticky top-28">
                <div className="aspect-video rounded-3xl overflow-hidden mb-6">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
                
                <h3 className="text-xl font-heading font-black text-forest mb-2 line-clamp-1">{item.title || item.name}</h3>
                <div className="flex items-center gap-2 mb-6">
                  <Badge variant="outline" className="text-[8px] border-forest/10 font-black tracking-widest uppercase">
                    {category}
                  </Badge>
                  <div className="flex items-center text-xs font-bold text-forest">
                    <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                    {item.rating || 4.9}
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-forest/5">
                  <div className="flex justify-between text-forest/40 text-[10px] font-black uppercase tracking-widest">
                    <span>Base Fare</span>
                    <span className="text-forest">{item.price}</span>
                  </div>
                  <div className="flex justify-between text-forest/40 text-[10px] font-black uppercase tracking-widest">
                    <span>Date Selection</span>
                    <span className={selectedSlotIndex !== null ? 'text-terracotta' : 'text-forest/20'}>
                      {selectedSlotIndex !== null ? 'Confirmed' : 'Pending'}
                    </span>
                  </div>
                  <div className="pt-4 flex justify-between items-end">
                    <span className="text-forest font-black tracking-tighter text-3xl">{item.price}</span>
                    <span className="text-[10px] font-bold text-forest/30 uppercase tracking-widest mb-1">Final Energy</span>
                  </div>
                </div>

                <div className="space-y-3 mt-8">
                  <Button 
                    onClick={handleBooking}
                    disabled={selectedSlotIndex === null && item.slots?.length > 0}
                    className="w-full h-16 rounded-full bg-forest hover:bg-forest/90 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl transition-all active:scale-95 disabled:bg-forest/10 disabled:text-forest/30"
                  >
                    Confirm & Flow <ArrowRight className="ml-3 h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={handleBack}
                    className="w-full h-12 rounded-full text-forest/40 hover:text-forest font-bold text-[10px] uppercase tracking-widest transition-all"
                  >
                    Go Back to List
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
