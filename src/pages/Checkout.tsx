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

type CheckoutStep = 'cart' | 'details' | 'payment';

export default function SoulCart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const { user } = useAuth();
  
  const [step, setStep] = useState<CheckoutStep>('details');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'reserve'>('online');
  const [plantTree, setPlantTree] = useState(false);
  const [note, setNote] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    pincode: ''
  });

  const subtotal = totalPrice;
  const ecoFee = plantTree ? 100 : 0;
  const taxes = Math.round(subtotal * 0.05);
  const finalTotal = subtotal + taxes + ecoFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (step === 'cart') setStep('details');
    else if (step === 'details') {
      if (!formData.fullName || !formData.email || !formData.phone) {
        alert("Please fill in your Full Name, Email, and Phone number.");
        return;
      }
      setStep('payment');
    }
    else if (step === 'payment') handleOrder();
  };

  const prevStep = () => {
    if (step === 'payment') setStep('details');
    else navigate(-1);
  };

  const handleOrder = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsSubmitting(true);

    // If Reserve Spot, save as pending/reserved without Razorpay
    if (paymentMethod === 'reserve') {
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
          ecoDonation: plantTree,
          status: 'reserved', // Mark as reserved
          paymentMethod: 'reserve',
          createdAt: serverTimestamp(),
        });
        setIsSuccess(true);
        clearCart();
      } catch (err: any) {
        console.error('Reservation Error:', err);
        alert(`Reservation Failed: ${err.message}`);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    try {
      // Safety check for Razorpay script and Key ID
      if (!(window as any).Razorpay) {
        throw new Error("Razorpay SDK not loaded. Please refresh the page or check your internet connection.");
      }
      
      const key_id = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!key_id) {
        throw new Error("Razorpay Key ID is missing. Please configure VITE_RAZORPAY_KEY_ID in your environment.");
      }

      console.log("[Razorpay] Initializing order creation...");
      
      // 1. Create Razorpay Order via Server API
      const response = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalTotal,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create payment order. Please try again.');
      }

      const rzpOrder = result;
      console.log(`[Razorpay] Order received from server: ${rzpOrder.id}`);

      // 2. Open Razorpay Checktout
      const options = {
        key: key_id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: 'The Soul Himalaya',
        description: `Booking for ${totalItems} items`,
        image: 'https://i.postimg.cc/LXFYQ7WK/Untitled-design-(1).png',
        order_id: rzpOrder.id,
        handler: async (response: any) => {
          console.log("[Razorpay] Payment captured, verifying...");
          try {
            // 3. Verify Payment on Server
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyData = await verifyRes.json();

            if (verifyData.status === 'success') {
              console.log("[Razorpay] Payment verified! Saving booking...");
              // 4. Save Confirmed Booking to Firestore
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
                ecoDonation: plantTree,
                status: 'paid', // Mark as paid
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                createdAt: serverTimestamp(),
              });

              setIsSuccess(true);
              clearCart();
            } else {
              throw new Error(verifyData.message || 'Payment verification failed.');
            }
          } catch (err: any) {
            console.error('[Razorpay] Verification error:', err);
            alert(`Payment Verification Error: ${err.message || 'An error occurred while verifying the payment.'}`);
          } finally {
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#C15A3E' // Terracotta theme color
        },
        modal: {
          ondismiss: () => {
            console.log("[Razorpay] Payment modal dismissed");
            setIsSubmitting(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        console.error("[Razorpay] Payment failed:", response.error);
        alert(`Payment Failed: ${response.error.description}`);
        setIsSubmitting(false);
      });
      rzp.open();

    } catch (err: any) {
      console.error('Razorpay Error:', err);
      alert(`Payment Initialization Failed: ${err.message || 'Check your internet connection'}`);
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl border border-emerald-50"
        >
          <div className="h-24 w-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-100">
            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-slate-900 mb-4 tracking-tight">Booking Confirmed!</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">Your soulful journey is officially scheduled. We've sent the details to your email.</p>
          <Button 
            onClick={() => navigate('/dashboard')}
            className="w-full bg-forest text-white h-14 rounded-full font-bold hover:bg-forest/90 transition-all hover:scale-[1.02]"
          >
            Explore Dashboard
          </Button>
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
              { id: 'details', label: 'Identity' },
              { id: 'payment', label: 'Energy' }
            ].map((s, i) => (
              <React.Fragment key={s.id}>
                <div className="flex items-center gap-3 px-4">
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center text-xs font-black transition-all duration-700",
                    step === s.id ? "bg-forest text-white shadow-xl shadow-forest/20 scale-110 rotate-[360deg]" : 
                    i < ['details', 'payment'].indexOf(step) ? "bg-emerald-500 text-white" :
                    "bg-forest/5 text-forest/20"
                  )}>
                    {i < ['details', 'payment'].indexOf(step) ? <CheckCircle2 className="h-5 w-5" /> : `0${i + 1}`}
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
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
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
                        <Leaf className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-slate-900">Soulful Touch</h3>
                        <p className="text-xs text-slate-500 font-medium">Add a personal vibe to your journey</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className={cn(
                        "p-6 rounded-3xl border-2 transition-all cursor-pointer group hover:shadow-xl",
                        plantTree ? "bg-forest border-forest shadow-forest/20" : "bg-white border-white hover:border-forest/20"
                      )}
                      onClick={() => setPlantTree(!plantTree)}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <Leaf className={cn("h-8 w-8", plantTree ? "text-emerald-300" : "text-emerald-500 group-hover:scale-110 transition-transform")} />
                          <div className={cn("h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all", plantTree ? "border-emerald-300 bg-white" : "border-slate-100")}>
                            {plantTree && <div className="h-3 w-3 rounded-full bg-forest" />}
                          </div>
                        </div>
                        <h4 className={cn("text-lg font-bold mb-1", plantTree ? "text-white" : "text-slate-900")}>Plant a Cedar</h4>
                        <p className={cn("text-xs", plantTree ? "text-white/70" : "text-slate-500")}>Add ₹100 to plant a Himalayan Cedar tree in your name.</p>
                      </div>

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
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -10 }}
                  className="relative bg-white/40 backdrop-blur-3xl rounded-[3rem] border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden"
                >
                  {/* Thematic Background Elements */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none grayscale invert" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/topography.png")' }} />
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-forest/5 rounded-full blur-[100px] pointer-events-none" />
                  <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-terracotta/5 rounded-full blur-[120px] pointer-events-none" />

                  <div className="p-8 md:p-14 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-2xl bg-forest flex items-center justify-center text-white shadow-lg shadow-forest/20">
                            <Compass className="h-6 w-6 animate-pulse" />
                          </div>
                          <span className="font-fluid text-2xl text-terracotta">Manifest your</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-playfair font-black italic text-forest leading-none tracking-tighter uppercase">Expedition Details</h2>
                      </div>
                      
                      <div className="bg-white/60 backdrop-blur-md border border-white/80 p-4 rounded-3xl flex items-center gap-5 shadow-sm">
                        <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                          <ShieldCheck className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <div className="text-[9px] font-black text-forest/40 uppercase tracking-widest mb-1">Safety Protocols</div>
                          <div className="text-[10px] font-bold text-forest uppercase">Guide Allocation & Insurance Active</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12">
                      {/* Name Field */}
                      <div className="space-y-4 group">
                        <div className="flex items-center justify-between px-1">
                          <label className="text-[10px] font-black text-forest/40 uppercase tracking-[0.2em] group-focus-within:text-terracotta transition-colors">Explorer's Identity</label>
                          <Leaf className="h-3 w-3 text-forest/10" />
                        </div>
                        <div className="relative">
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-forest/20 group-focus-within:text-terracotta transition-colors">
                            <Users className="h-full w-full" />
                          </div>
                          <Input 
                            name="fullName" 
                            placeholder="Full name as per ID"
                            value={formData.fullName} 
                            onChange={handleInputChange} 
                            className="h-16 rounded-2xl border-white/60 bg-white/50 backdrop-blur-md pl-14 pr-6 text-forest font-bold transition-all focus:bg-white focus:shadow-2xl focus:shadow-forest/5 focus:border-terracotta/30 placeholder:text-forest/10 placeholder:italic" 
                          />
                        </div>
                      </div>

                      {/* Phone Field */}
                      <div className="space-y-4 group">
                        <div className="flex items-center justify-between px-1">
                          <label className="text-[10px] font-black text-forest/40 uppercase tracking-[0.2em] group-focus-within:text-terracotta transition-colors">Soul Link (Phone)</label>
                          <Zap className="h-3 w-3 text-forest/10" />
                        </div>
                        <div className="relative">
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-forest/20 group-focus-within:text-terracotta transition-colors">
                            <CreditCard className="h-full w-full rotate-12" />
                          </div>
                          <Input 
                            type="tel" 
                            name="phone" 
                            placeholder="+91 ---- ----"
                            value={formData.phone} 
                            onChange={handleInputChange} 
                            className="h-16 rounded-2xl border-white/60 bg-white/50 backdrop-blur-md pl-14 pr-6 text-forest font-bold transition-all focus:bg-white focus:shadow-2xl focus:shadow-forest/5 focus:border-terracotta/30 placeholder:text-forest/10" 
                          />
                        </div>
                      </div>

                      {/* Email Field */}
                      <div className="space-y-4 group md:col-span-2">
                        <div className="flex items-center justify-between px-1">
                          <label className="text-[10px] font-black text-forest/40 uppercase tracking-[0.2em] group-focus-within:text-terracotta transition-colors">Digital Gateway (Email Address)</label>
                          <Sparkles className="h-3 w-3 text-forest/10" />
                        </div>
                        <div className="relative">
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-forest/20 group-focus-within:text-terracotta transition-colors">
                            <Map className="h-full w-full" />
                          </div>
                          <Input 
                            type="email" 
                            name="email" 
                            placeholder="where should we send your itinerary?"
                            value={formData.email} 
                            onChange={handleInputChange} 
                            className="h-16 rounded-2xl border-white/60 bg-white/50 backdrop-blur-md pl-14 pr-6 text-forest font-bold transition-all focus:bg-white focus:shadow-2xl focus:shadow-forest/5 focus:border-terracotta/30 placeholder:text-forest/10" 
                          />
                        </div>
                      </div>

                      {/* City Field */}
                      <div className="space-y-4 group">
                        <div className="flex items-center justify-between px-1">
                          <label className="text-[10px] font-black text-forest/40 uppercase tracking-[0.2em] group-focus-within:text-terracotta transition-colors">Ascension Base (City)</label>
                          <HomeIcon className="h-3 w-3 text-forest/10" />
                        </div>
                        <div className="relative">
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-forest/20 group-focus-within:text-terracotta transition-colors">
                            <Mountain className="h-full w-full" />
                          </div>
                          <Input 
                            name="city" 
                            placeholder="Your current base camp"
                            value={formData.city} 
                            onChange={handleInputChange} 
                            className="h-16 rounded-2xl border-white/60 bg-white/50 backdrop-blur-md pl-14 pr-6 text-forest font-bold transition-all focus:bg-white focus:shadow-2xl focus:shadow-forest/5 focus:border-terracotta/30 placeholder:text-forest/10" 
                          />
                        </div>
                      </div>

                      {/* Pincode Field */}
                      <div className="space-y-4 group">
                        <div className="flex items-center justify-between px-1">
                          <label className="text-[10px] font-black text-forest/40 uppercase tracking-[0.2em] group-focus-within:text-terracotta transition-colors">Sacred Code (Pincode)</label>
                          <Info className="h-3 w-3 text-forest/10" />
                        </div>
                        <div className="relative">
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-forest/20 group-focus-within:text-terracotta transition-colors">
                            <MapPin className="h-full w-full" />
                          </div>
                          <Input 
                            name="pincode" 
                            placeholder="Postal delivery zone"
                            value={formData.pincode} 
                            onChange={handleInputChange} 
                            className="h-16 rounded-2xl border-white/60 bg-white/50 backdrop-blur-md pl-14 pr-6 text-forest font-bold transition-all focus:bg-white focus:shadow-2xl focus:shadow-forest/5 focus:border-terracotta/30 placeholder:text-forest/10" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl space-y-10"
                >
                  <div className="text-center">
                    <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <ShieldCheck className="h-10 w-10 text-emerald-600" />
                    </div>
                    <h2 className="text-3xl font-heading font-bold text-slate-900 mb-2">Secure Payment</h2>
                    <p className="text-slate-400 text-sm">Your data is soulfully protected with SSL encryption.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                      onClick={() => setPaymentMethod('online')}
                      className={cn(
                        "p-6 rounded-3xl border-2 transition-all cursor-pointer",
                        paymentMethod === 'online' ? "border-forest bg-forest/[0.03]" : "border-slate-50 bg-slate-50/50 grayscale hover:grayscale-0 hover:border-forest/20"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <CreditCard className={cn("h-6 w-6", paymentMethod === 'online' ? "text-forest" : "text-slate-400")} />
                          <div>
                            <div className={cn("text-xl md:text-2xl font-fluid", paymentMethod === 'online' ? "text-forest" : "text-slate-400")}>Online Payment</div>
                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest -mt-1">UPI, Cards, Netbanking</div>
                          </div>
                        </div>
                        {paymentMethod === 'online' && <CheckCircle2 className="h-5 w-5 text-forest" />}
                      </div>
                    </div>

                    <div 
                      onClick={() => setPaymentMethod('reserve')}
                      className={cn(
                        "p-6 rounded-3xl border-2 transition-all cursor-pointer",
                        paymentMethod === 'reserve' ? "border-terracotta bg-terracotta/[0.03]" : "border-slate-50 bg-slate-50/50 grayscale hover:grayscale-0 hover:border-terracotta/20"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Compass className={cn("h-6 w-6", paymentMethod === 'reserve' ? "text-terracotta" : "text-slate-400")} />
                          <div>
                            <div className={cn("text-xl md:text-2xl font-fluid", paymentMethod === 'reserve' ? "text-terracotta" : "text-slate-400")}>Reserve Spot</div>
                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest -mt-1">Pay Later / Token</div>
                          </div>
                        </div>
                        {paymentMethod === 'reserve' && <CheckCircle2 className="h-5 w-5 text-terracotta" />}
                      </div>
                    </div>
                  </div>

                  {/* This step is now bypassed; logic handled by directly calling handleOrder from details */}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Summary Sidebar */}
          <div className="space-y-8 lg:sticky lg:top-28">
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
                  {plantTree && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex justify-between items-center p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10"
                    >
                      <span className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                        <Leaf className="h-4 w-4" /> Cedar Contribution
                      </span>
                      <span className="font-mono font-black text-emerald-600">₹100</span>
                    </motion.div>
                  )}
                  
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
                  onClick={step === 'payment' ? handleOrder : nextStep}
                  disabled={cart.length === 0 || isSubmitting}
                  className="w-full h-20 bg-forest hover:bg-forest/95 text-white rounded-full text-sm font-black uppercase tracking-[0.3em] shadow-2xl shadow-forest/20 transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-4 group"
                >
                  {isSubmitting ? (
                    <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {step === 'details' ? 'Next Soul Stage' : paymentMethod === 'online' ? 'Initiate Payment' : 'Claim Your Spot'}
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                    </>
                  )}
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
