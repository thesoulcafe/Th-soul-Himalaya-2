import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Compass, 
  Leaf, 
  PenTool, 
  ShieldCheck, 
  CreditCard,
  X,
  CheckCircle2,
  Calendar,
  Users,
  Sparkles,
  Zap,
  Mountain,
  MapPin,
  Home as HomeIcon,
  Info,
  Map
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AuthModal from '@/components/AuthModal';
import { toast } from 'sonner';

type CheckoutStep = 'cart' | 'details';

export default function SoulCart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const { user, profile } = useAuth();
  
  const [step, setStep] = useState<CheckoutStep>('details');
  const [paymentMethod] = useState<'online' | 'reserve'>('reserve');
  const [note, setNote] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: profile?.displayName || user?.displayName || '',
    email: profile?.email || user?.email || '',
    phone: profile?.phone || '',
    city: profile?.city || '',
    pincode: profile?.pincode || ''
  });

  // Effect to sync profile data when it loads
  React.useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || profile.displayName || user?.displayName || '',
        email: prev.email || profile.email || user?.email || '',
        phone: prev.phone || profile.phone || '',
        city: prev.city || profile.city || '',
        pincode: prev.pincode || profile.pincode || ''
      }));
    }
  }, [profile, user]);

  const subtotal = totalPrice;
  const taxes = Math.round(subtotal * 0.05);
  const finalTotal = subtotal + taxes;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Pincode validation: only numbers allowed
    if (name === 'pincode' && value !== '' && !/^\d+$/.test(value)) {
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (step === 'cart') setStep('details');
    else if (step === 'details') {
      const { fullName, email, phone, city, pincode } = formData;
      if (!fullName || !email || !phone || !city || !pincode) {
        toast.error("Vessel Incomplete", {
          description: (
            <div className="flex flex-col gap-2">
              <p className="font-bold text-forest">The path remains hidden.</p>
              <p className="text-xs text-forest/60">Please manifest your details: Name, Email, Phone, City, and Pincode to continue.</p>
            </div>
          ),
          icon: <Info className="h-6 w-6 text-terracotta" />,
          duration: 6000,
          className: "rounded-3xl border-terracotta/20 bg-white shadow-2xl",
        });
        return;
      }
      handleOrder();
    }
  };

  const prevStep = () => {
    if (step === 'details') navigate(-1);
    else setStep('details');
  };

  const handleOrder = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("[Checkout] Processing 'Reserve Spot' booking...");
      await addDoc(collection(db, 'bookings'), {
        userId: user.uid,
        userName: formData.fullName || user.displayName || 'Guest Explorer',
        userEmail: formData.email || user.email,
        phone: formData.phone,
        city: formData.city,
        pincode: formData.pincode,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          type: item.type,
          dateRange: item.dateRange || ''
        })),
        totalPrice: finalTotal,
        note: note || '',
        status: 'reserved', // Mark as reserved
        paymentMethod: 'reserve',
        createdAt: serverTimestamp(),
      });
      setIsSuccess(true);
      clearCart();
    } catch (err: any) {
      console.error('Reservation Error:', err);
      toast.error("Spirit Guide Blocked", {
        description: `Reservation Failed: ${err.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl w-full bg-white rounded-[3.5rem] p-12 text-center shadow-[0_40px_100px_-20px_rgba(30,58,47,0.1)] border border-emerald-50 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
          
          <div className="h-28 w-28 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-10 border border-emerald-100 shadow-inner">
            <CheckCircle2 className="h-14 w-14 text-emerald-600 animate-pulse" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-playfair font-black italic text-forest mb-6 tracking-tight">
            Your Reservation Request Sent Successfully
          </h1>
          
          <div className="space-y-4 mb-12">
            <p className="text-slate-600 text-lg font-medium">
              Our expert they will contact you as soon possible
            </p>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
              Thanks For Your patience
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="flex-1 h-16 rounded-full font-black uppercase tracking-widest border-forest/10 text-forest hover:bg-forest/5"
            >
              Back to Home
            </Button>
            <Button 
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-forest text-white h-16 rounded-full font-black uppercase tracking-widest hover:bg-forest/90 shadow-xl shadow-forest/20 transition-all hover:scale-[1.02]"
            >
              View My Requests
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 px-6 bg-[#F9FAFB] min-h-screen font-sans selection:bg-terracotta/10">
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      
      <div className="max-w-7xl mx-auto">
        {/* Progress Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-10">
          <div className="flex items-center gap-6">
            <button 
              onClick={prevStep}
              className="group p-4 rounded-full bg-white border border-forest/10 text-forest shadow-lg shadow-forest/5 hover:bg-forest hover:text-white transition-all transform hover:-rotate-12 active:scale-90"
            >
              <X className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Leaf className="h-4 w-4 text-emerald-500 animate-bounce" />
                <span className="text-[10px] font-black text-terracotta uppercase tracking-[0.4em]">Eco-Expedition</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-playfair font-black italic text-forest leading-none tracking-tighter uppercase whitespace-nowrap">Your Soul Cart</h1>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-3 rounded-full flex items-center gap-2 shadow-xl shadow-forest/5">
            {[
              { id: 'cart', label: 'Cart' },
              { id: 'details', label: 'Identity' }
            ].map((s, i) => (
              <React.Fragment key={s.id}>
                <div className="flex items-center gap-3 px-4">
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center text-xs font-black transition-all duration-700",
                    step === s.id ? "bg-forest text-white shadow-xl shadow-forest/20 scale-110 rotate-[360deg]" : 
                    (s.id === 'cart' && step === 'details') ? "bg-emerald-500 text-white" :
                    "bg-forest/5 text-forest/20"
                  )}>
                    {(s.id === 'cart' && step === 'details') ? <CheckCircle2 className="h-5 w-5" /> : `0${i + 1}`}
                  </div>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em] hidden sm:block",
                    step === s.id ? "text-forest" : "text-forest/20"
                  )}>
                    {s.label}
                  </span>
                </div>
                {i < 1 && <div className="w-12 h-px bg-forest/5" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Main Context Area */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {step === 'cart' && (
                <motion.div
                  key="cart"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {cart.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-20 text-center border border-slate-100 shadow-xl">
                      <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="h-10 w-10 text-slate-200" />
                      </div>
                      <h2 className="text-2xl font-heading font-bold text-slate-900 mb-2">Cart is empty</h2>
                      <p className="text-slate-400 mb-8 max-w-xs mx-auto text-sm">Looks like you haven't added any soulful experiences yet.</p>
                      <Button 
                        onClick={() => navigate('/services')}
                        className="bg-forest text-white hover:bg-forest/90 px-8 h-14 rounded-full font-bold"
                      >
                        Browse Collections
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <motion.div
                          layout
                          key={item.id}
                          className="group relative bg-white/60 backdrop-blur-md rounded-[2rem] p-4 border border-white/40 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-forest/5 transition-all flex flex-col sm:flex-row items-center gap-4"
                        >
                          <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl overflow-hidden shadow-lg shrink-0 border border-white/50">
                            <img src={(item.name || "").toLowerCase().includes("valley of shadows") ? "https://i.postimg.cc/3RsgZk5r/20260405-134046.jpg" : item.image} alt={item.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                          </div>
                          <div className="flex-1 text-center sm:text-left">
                            <div className="text-[9px] font-black text-terracotta uppercase tracking-[0.2em] mb-0.5">{item.type}</div>
                            <h3 className="text-sm font-heading font-bold text-slate-900 leading-tight">{item.name}</h3>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1.5">
                              {item.dateRange && (
                                <div className="flex items-center gap-1 text-[8px] font-bold text-slate-400 bg-slate-50/50 px-2 py-1 rounded-full border border-slate-100">
                                  <Calendar className="h-2.5 w-2.5" /> {item.dateRange}
                                </div>
                              )}
                              {item.details?.guests && (
                                <div className="flex items-center gap-1 text-[8px] font-bold text-slate-400 bg-slate-50/50 px-2 py-1 rounded-full border border-slate-100">
                                  <Users className="h-2.5 w-2.5" /> {item.details.guests} Travelers
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 bg-white/80 p-1.5 rounded-xl border border-slate-100/50">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-8 w-8 text-slate-400 hover:bg-forest hover:text-white rounded-lg transition-all"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center font-black text-slate-900 font-mono text-base">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-8 w-8 text-slate-400 hover:bg-forest hover:text-white rounded-lg transition-all"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-right sm:min-w-[90px]">
                            <div className="text-lg font-mono font-black text-forest">₹{item.price.toLocaleString()}</div>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="text-[8px] font-black uppercase tracking-widest text-slate-300 hover:text-rose-500 mt-1 transition-colors flex items-center gap-1 mx-auto sm:ml-auto"
                            >
                              <Trash2 className="h-3 w-3" /> Remove
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Soulful Touch Section */}
                  <div className="bg-forest/5 rounded-[2.5rem] p-8 border border-forest/10 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-forest/10 flex items-center justify-center text-forest shadow-inner">
                        <PenTool className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-slate-900">Soulful Touch</h3>
                        <p className="text-xs text-slate-500 font-medium">Add a personal vibe to your journey</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      <div className={cn(
                        "p-6 rounded-3xl border-2 bg-white border-white hover:border-forest/20 group hover:shadow-xl transition-all"
                      )}>
                        <div className="flex items-center gap-2 mb-4 text-forest">
                          <PenTool className="h-5 w-5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Digital Note</span>
                        </div>
                        <textarea 
                          placeholder="Special requests or soul notes..."
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          className="w-full bg-slate-50/50 rounded-2xl p-4 text-xs font-medium text-slate-900 placeholder:text-slate-300 border-none ring-0 focus:ring-2 focus:ring-forest/10 min-h-[80px] no-scrollbar"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 'details' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-white rounded-[1.5rem] border border-slate-100 shadow-[0_8px_30px_-12px_rgba(30,58,47,0.06)] overflow-hidden"
                >
                  <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-black text-terracotta uppercase tracking-[0.3em] block mb-1">Secure Booking</span>
                        <h2 className="text-2xl font-heading font-bold text-forest leading-tight uppercase tracking-tight">Expedition Details</h2>
                      </div>
                      
                      <div className="flex items-center gap-3 py-1.5 px-3 bg-emerald-50 rounded-xl border border-emerald-100/50">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        <div>
                          <div className="text-[9px] font-bold text-emerald-700 uppercase leading-none">Guard Active</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                      {/* Name Field */}
                      <div className="space-y-1.5 group">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">Full Identity</label>
                        <div className="relative">
                          <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300 group-focus-within:text-forest transition-colors" />
                          <Input 
                            name="fullName" 
                            placeholder="Name as per Govt. ID"
                            value={formData.fullName} 
                            onChange={handleInputChange} 
                            className="h-12 rounded-xl border-slate-100 bg-slate-50/50 pl-10 pr-4 text-xs text-forest font-semibold transition-all focus:bg-white focus:ring-4 focus:ring-forest/5 focus:border-forest/20 placeholder:text-slate-300 font-sans" 
                          />
                        </div>
                      </div>

                      {/* Phone Field */}
                      <div className="space-y-1.5 group">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">Contact Number</label>
                        <div className="relative">
                          <Zap className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300 group-focus-within:text-forest transition-colors" />
                          <Input 
                            type="tel" 
                            name="phone" 
                            placeholder="+91 ---- ----"
                            value={formData.phone} 
                            onChange={handleInputChange} 
                            className="h-12 rounded-xl border-slate-100 bg-slate-50/50 pl-10 pr-4 text-xs text-forest font-semibold transition-all focus:bg-white focus:ring-4 focus:ring-forest/5 focus:border-forest/20 placeholder:text-slate-300 font-sans" 
                          />
                        </div>
                      </div>

                      {/* Email Field */}
                      <div className="space-y-1.5 group md:col-span-2">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">Email Archive</label>
                        <div className="relative">
                          <Map className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300 group-focus-within:text-forest transition-colors" />
                          <Input 
                            type="email" 
                            name="email" 
                            placeholder="email@example.com"
                            value={formData.email} 
                            onChange={handleInputChange} 
                            className="h-12 rounded-xl border-slate-100 bg-slate-50/50 pl-10 pr-4 text-xs text-forest font-semibold transition-all focus:bg-white focus:ring-4 focus:ring-forest/5 focus:border-forest/20 placeholder:text-slate-300 font-sans" 
                          />
                        </div>
                      </div>

                      {/* City Field */}
                      <div className="space-y-1.5 group">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">Base (City)</label>
                        <div className="relative">
                          <Mountain className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300 group-focus-within:text-forest transition-colors" />
                          <Input 
                            name="city" 
                            placeholder="E.g. Manali"
                            value={formData.city} 
                            onChange={handleInputChange} 
                            className="h-12 rounded-xl border-slate-100 bg-slate-50/50 pl-10 pr-4 text-xs text-forest font-semibold transition-all focus:bg-white focus:ring-4 focus:ring-forest/5 focus:border-forest/20 placeholder:text-slate-300 font-sans" 
                          />
                        </div>
                      </div>

                      {/* Pincode Field */}
                      <div className="space-y-1.5 group">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">Postal Code</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300 group-focus-within:text-forest transition-colors" />
                          <Input 
                            name="pincode" 
                            placeholder="6-digit PIN"
                            value={formData.pincode} 
                            onChange={handleInputChange} 
                            className="h-12 rounded-xl border-slate-100 bg-slate-50/50 pl-10 pr-4 text-xs text-forest font-semibold transition-all focus:bg-white focus:ring-4 focus:ring-forest/5 focus:border-forest/20 placeholder:text-slate-300 font-sans" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Summary Sidebar */}
          <div className="space-y-8 lg:top-28">
            <Card className="border-none shadow-[0_30px_60px_-15px_rgba(30,58,47,0.1)] rounded-[3rem] bg-white overflow-hidden group transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(30,58,47,0.15)]">
              <div className="bg-forest p-10 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 pointer-events-none grayscale invert" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/topography.png")' }} />
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Compass className="h-32 w-32 animate-spin-slow" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-terracotta" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Journey Totals</span>
                  </div>
                  <h3 className="text-4xl font-playfair font-black italic mb-1">Soul Summary</h3>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-terracotta animate-pulse" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">{totalItems} Experiences Secured</p>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-10 space-y-8 bg-gradient-to-b from-white to-forest/[0.02]">
                <div className="space-y-5">
                  <div className="flex justify-between items-center group/row">
                    <span className="text-[10px] font-black text-forest/30 uppercase tracking-widest group-hover/row:text-forest transition-colors">Base Energy Exchange</span>
                    <span className="font-mono font-black text-forest">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center group/row">
                    <span className="text-[10px] font-black text-forest/30 uppercase tracking-widest group-hover/row:text-forest transition-colors">Abundance Tax (5%)</span>
                    <span className="font-mono font-black text-forest">₹{taxes.toLocaleString()}</span>
                  </div>
                  
                  <div className="h-px bg-forest/5 relative">
                    <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[8px] font-black text-forest/10 uppercase tracking-[0.5em]">The Balance</div>
                  </div>

                  <div className="flex justify-between items-end pt-4">
                    <div className="space-y-1">
                      <span className="text-sm font-fluid text-terracotta">Total</span>
                      <h4 className="text-xl font-playfair font-black italic text-forest leading-none">Investment</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-mono font-black text-forest tracking-tighter leading-none">₹{finalTotal.toLocaleString()}</div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-forest/20 mt-2 italic">Divine Balance Secured</div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={nextStep}
                  disabled={cart.length === 0 || isSubmitting}
                  className="w-full h-20 bg-forest hover:bg-forest/95 text-white rounded-full text-sm font-black uppercase tracking-[0.3em] shadow-2xl shadow-forest/20 transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-4 group"
                >
                  {isSubmitting ? (
                    <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {step === 'cart' ? 'Next Soul Stage' : 'Claim Your Spot'}
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                    </>
                  ) }
                </Button>

                <div className="flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2 group/tip cursor-help">
                    <ShieldCheck className="h-4 w-4 text-emerald-500 group-hover/tip:scale-125 transition-transform" />
                    <span className="text-[9px] font-black text-forest/20 uppercase tracking-widest group-hover/tip:text-forest transition-colors">Sanctified</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-forest/5" />
                  <div className="flex items-center gap-2 group/tip cursor-help">
                    <Leaf className="h-4 w-4 text-emerald-500 group-hover/tip:scale-125 transition-transform" />
                    <span className="text-[9px] font-black text-forest/20 uppercase tracking-widest group-hover/tip:text-forest transition-colors">Conscious</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Tooltip Card */}
            <Card className="border-none shadow-2xl rounded-[3rem] bg-slate-900 p-10 text-white relative overflow-hidden group">
               <div className="absolute inset-0 opacity-[0.05] pointer-events-none grayscale invert" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/topography.png")' }} />
               <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-4">
                   <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center">
                     <Compass className="h-5 w-5 text-terracotta" />
                   </div>
                   <h4 className="font-playfair text-xl font-black italic">Seeking Path?</h4>
                 </div>
                 <p className="text-xs text-white/50 mb-8 font-medium leading-relaxed italic">"Our Soul Guides roam these digital peaks 24/7. Connect for personalized wisdom."</p>
                 <Button 
                   variant="outline" 
                   className="w-full h-14 rounded-full border-white/10 text-white hover:bg-white hover:text-slate-900 font-black text-[10px] uppercase tracking-widest transition-all shadow-xl"
                   onClick={() => {
                     const cartItemsText = cart.map(item => `${item.name} (${item.quantity})`).join(', ');
                     const whatsappMessage = encodeURIComponent(`Namaste Soul Guide! I need wisdom for these paths in my cart: ${cartItemsText}.`);
                     window.open(`https://wa.me/917878200632?text=${whatsappMessage}`, '_blank');
                   }}
                 >
                   Summon a Guide
                 </Button>
               </div>
               <div className="absolute -bottom-12 -right-12 opacity-5 group-hover:scale-150 transition-transform duration-[3000ms]">
                 <Mountain className="h-48 w-48" />
               </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
