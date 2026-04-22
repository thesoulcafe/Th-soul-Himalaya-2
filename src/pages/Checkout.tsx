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
  Users
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
    else if (step === 'details') handleOrder();
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

    // Basic validation
    if (!formData.fullName || !formData.email || !formData.phone) {
      alert("Please fill in your Full Name, Email, and Phone number to complete the booking.");
      setStep('details');
      return;
    }

    setIsSubmitting(true);
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
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={prevStep}
              className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-forest hover:border-forest/20 transition-all shadow-sm group"
            >
              <X className="h-5 w-5 group-hover:rotate-90 transition-transform" />
            </button>
            <div>
              <h1 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">Your Soul Cart</h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Adventure Awaits</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {[
              { id: 'details', label: 'Details' }
            ].map((s, i) => (
              <React.Fragment key={s.id}>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-500",
                    step === s.id ? "bg-forest text-white shadow-lg shadow-forest/20 scale-110" : 
                    i < ['details', 'payment'].indexOf(step) ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                    "bg-slate-100 text-slate-400"
                  )}>
                    {i < ['details', 'payment'].indexOf(step) ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest hidden sm:block",
                    step === s.id ? "text-forest" : "text-slate-300"
                  )}>
                    {s.label}
                  </span>
                </div>
                {i < 1 && <div className="w-8 h-px bg-slate-100" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
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
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="relative bg-white/70 backdrop-blur-xl rounded-[3rem] p-10 border border-white/40 shadow-2xl space-y-10 overflow-hidden"
                >
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-forest/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-terracotta/5 rounded-full blur-3xl pointer-events-none" />

                  <div className="flex items-center gap-5 relative z-10">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-forest to-forest/80 flex items-center justify-center text-white shadow-lg shadow-forest/20">
                      <Users className="h-7 w-7" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-heading font-bold text-slate-900 leading-none">Expedition Details</h2>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                        Guide Allocation & Insurance
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 relative z-10">
                    <div className="space-y-3 group">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-forest transition-colors">Explorer's Name</label>
                      <div className="relative">
                        <Input 
                          name="fullName" 
                          value={formData.fullName} 
                          onChange={handleInputChange} 
                          className="h-14 rounded-2xl border-white/60 bg-white/40 backdrop-blur-md px-6 text-slate-900 font-medium transition-all focus:bg-white focus:shadow-xl focus:shadow-forest/10 focus:border-forest/40" 
                        />
                        <AnimatePresence>
                          {!formData.fullName && (
                            <motion.span 
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 5 }}
                              className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none text-sm italic font-medium tracking-tight blur-[8px] opacity-30 select-none transition-all duration-700"
                            >
                              As per ID proof
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="space-y-3 group">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-forest transition-colors">Soul Connection (Phone)</label>
                      <div className="relative">
                        <Input 
                          type="tel" 
                          name="phone" 
                          value={formData.phone} 
                          onChange={handleInputChange} 
                          className="h-14 rounded-2xl border-white/60 bg-white/40 backdrop-blur-md px-6 text-slate-900 font-medium transition-all focus:bg-white focus:shadow-xl focus:shadow-forest/10 focus:border-forest/40" 
                        />
                        <AnimatePresence>
                          {!formData.phone && (
                            <motion.span 
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 5 }}
                              className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none text-sm font-medium tracking-[0.1em] blur-[8px] opacity-30 select-none transition-all duration-700"
                            >
                              +91 --- --- ----
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="space-y-3 group md:col-span-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-forest transition-colors">Digital Gateway (Email)</label>
                       <div className="relative">
                        <Input 
                          type="email" 
                          name="email" 
                          value={formData.email} 
                          onChange={handleInputChange} 
                          className="h-14 rounded-2xl border-white/60 bg-white/40 backdrop-blur-md px-6 text-slate-900 font-medium transition-all focus:bg-white focus:shadow-xl focus:shadow-forest/10 focus:border-forest/40" 
                        />
                        <AnimatePresence>
                          {!formData.email && (
                            <motion.span 
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 5 }}
                              className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none text-sm font-medium blur-[1px] opacity-40"
                            >
                              trekker@soulhimalaya.com
                            </motion.span>
                          )}
                        </AnimatePresence>
                       </div>
                    </div>

                    <div className="space-y-3 group">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-forest transition-colors">Ascension Base (City)</label>
                      <div className="relative">
                        <Input 
                          name="city" 
                          value={formData.city} 
                          onChange={handleInputChange} 
                          className="h-14 rounded-2xl border-white/60 bg-white/40 backdrop-blur-md px-6 text-slate-900 font-medium transition-all focus:bg-white focus:shadow-xl focus:shadow-forest/10 focus:border-forest/40" 
                        />
                        <AnimatePresence>
                          {!formData.city && (
                            <motion.span 
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 5 }}
                              className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none text-sm font-medium blur-[1px] opacity-40"
                            >
                              Delhi, Mumbai, etc.
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="space-y-3 group">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-forest transition-colors">Sacred Code (Pincode)</label>
                      <div className="relative">
                        <Input 
                          name="pincode" 
                          value={formData.pincode} 
                          onChange={handleInputChange} 
                          className="h-14 rounded-2xl border-white/60 bg-white/40 backdrop-blur-md px-6 text-slate-900 font-medium transition-all focus:bg-white focus:shadow-xl focus:shadow-forest/10 focus:border-forest/40" 
                        />
                        <AnimatePresence>
                          {!formData.pincode && (
                            <motion.span 
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 5 }}
                              className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none text-sm font-medium blur-[1px] opacity-40"
                            >
                              Postal Code
                            </motion.span>
                          )}
                        </AnimatePresence>
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
                    <div className="p-6 rounded-3xl border-2 border-forest bg-forest/[0.03] flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <CreditCard className="h-6 w-6 text-forest" />
                        <div>
                          <div className="font-bold text-slate-900">Online Payment</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">UPI, Cards, Netbanking</div>
                        </div>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-forest" />
                    </div>
                    <div className="p-6 rounded-3xl border-2 border-slate-50 bg-slate-50/50 flex items-center justify-between opacity-50 cursor-not-allowed">
                       <div className="flex items-center gap-4">
                        <Compass className="h-6 w-6 text-slate-300" />
                        <div>
                          <div className="font-bold text-slate-300">Reserve Spot</div>
                          <div className="text-[10px] text-slate-200 font-bold uppercase tracking-wider">Coming Soon</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* This step is now bypassed; logic handled by directly calling handleOrder from details */}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Summary Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-28">
            <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden group">
              <div className="bg-forest p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Compass className="h-32 w-32 animate-spin-slow" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-heading font-bold mb-1">Soul Summary</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">{totalItems} Experiences</p>
                </div>
              </div>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-bold text-slate-500">
                    <span>Base Fare</span>
                    <span className="font-mono text-slate-900">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-500">
                    <span>GST (5%)</span>
                    <span className="font-mono text-slate-900">₹{taxes.toLocaleString()}</span>
                  </div>
                  {plantTree && (
                    <div className="flex justify-between text-sm font-bold text-emerald-600">
                      <span className="flex items-center gap-2 italic"><Leaf className="h-3.5 w-3.5" /> Eco-Soul Addon</span>
                      <span className="font-mono">₹100</span>
                    </div>
                  )}
                  <Separator className="bg-slate-100" />
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-heading font-bold text-slate-900">Soul Total</span>
                    <div className="text-right">
                      <div className="text-3xl font-mono font-black text-forest tracking-tighter">₹{finalTotal.toLocaleString()}</div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-slate-300 mt-1">Inclusive of Taxes</div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={step === 'payment' ? handleOrder : nextStep}
                  disabled={cart.length === 0 || isSubmitting}
                  className="w-full h-16 bg-terracotta hover:bg-terracotta/90 text-white rounded-full text-lg font-black shadow-xl shadow-terracotta/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {step === 'details' ? 'Proceed to Payment' : 'Next Soul Step'}
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                    <ShieldCheck className="h-3 w-3 text-emerald-500" /> Secure
                  </div>
                  <Separator orientation="vertical" className="h-3 bg-slate-100" />
                  <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                    <Leaf className="h-3 w-3 text-emerald-500" /> Ethical
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Tooltip Card */}
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 p-8 text-white relative overflow-hidden group">
               <div className="relative z-10">
                 <h4 className="font-heading font-bold text-lg mb-2">Need Guidance?</h4>
                 <p className="text-xs text-white/50 mb-6 font-medium leading-relaxed">Our Soul Guides are active 24/7 to help you refine your journey.</p>
                 <Button 
                   variant="outline" 
                   size="sm" 
                   className="w-full h-12 rounded-full border-white/20 text-white hover:bg-white hover:text-slate-900 font-bold transition-all"
                   onClick={() => {
                     const cartItemsText = cart.map(item => `${item.name} (${item.quantity})`).join(', ');
                     const whatsappMessage = encodeURIComponent(`Hi! I need guidance for these experiences in my Soul Cart: ${cartItemsText}. Can you help me?`);
                     window.open(`https://wa.me/917878200632?text=${whatsappMessage}`, '_blank');
                   }}
                 >
                   Talk to a Guide
                 </Button>
               </div>
               <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                 <Compass className="h-32 w-32" />
               </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
