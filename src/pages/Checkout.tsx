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
    else if (step === 'details') setStep('payment');
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
    try {
      // Mock payment delay or real integration
      await addDoc(collection(db, 'bookings'), {
        userId: user.uid,
        userName: formData.fullName || user.displayName,
        userEmail: formData.email || user.email,
        items: cart,
        totalPrice: finalTotal,
        note,
        ecoDonation: plantTree,
        status: 'confirmed',
        createdAt: serverTimestamp(),
      });

      setIsSuccess(true);
      clearCart();
    } catch (err) {
      console.error(err);
      alert('Failed to place order.');
    } finally {
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
              { id: 'details', label: 'Details' },
              { id: 'payment', label: 'Payment' }
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
                          className="group relative bg-white/60 backdrop-blur-md rounded-[2.5rem] p-6 border border-white/40 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-forest/5 transition-all flex flex-col sm:flex-row items-center gap-6"
                        >
                          <div className="h-24 w-24 rounded-3xl overflow-hidden shadow-lg shrink-0 border border-white/50">
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                          </div>
                          <div className="flex-1 text-center sm:text-left">
                            <div className="text-[10px] font-black text-terracotta uppercase tracking-[0.2em] mb-1">{item.type}</div>
                            <h3 className="text-lg font-heading font-bold text-slate-900">{item.name}</h3>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2">
                              {item.dateRange && (
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                                  <Calendar className="h-3 w-3" /> {item.dateRange}
                                </div>
                              )}
                              {item.details?.guests && (
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                                  <Users className="h-3 w-3" /> {item.details.guests} Travelers
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 bg-slate-50/50 p-2 rounded-2xl border border-slate-100/50">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-10 w-10 text-slate-400 hover:bg-forest hover:text-white rounded-xl transition-all"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-10 text-center font-black text-slate-900 font-mono text-lg">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-10 w-10 text-slate-400 hover:bg-forest hover:text-white rounded-xl transition-all"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-right sm:min-w-[100px]">
                            <div className="text-xl font-mono font-black text-forest">{item.price}</div>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-red-500 mt-1 transition-colors flex items-center gap-1 mx-auto sm:ml-auto"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Remove
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
                  className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl space-y-8"
                >
                  <div>
                    <h2 className="text-3xl font-heading font-bold text-slate-900 mb-2">Expedition Details</h2>
                    <p className="text-slate-400 text-sm">Required for guide allocation and insurance.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                      <Input name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="As per ID proof" className="h-14 rounded-2xl border-slate-100 focus:ring-forest/10 focus:border-forest/30" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                      <Input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 00000 00000" className="h-14 rounded-2xl border-slate-100 focus:ring-forest/10 focus:border-forest/30" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                       <Input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="trekker@soulhimalaya.com" className="h-14 rounded-2xl border-slate-100 focus:ring-forest/10 focus:border-forest/30" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Base City</label>
                      <Input name="city" value={formData.city} onChange={handleInputChange} placeholder="Delhi, Mumbai..." className="h-14 rounded-2xl border-slate-100 focus:ring-forest/10 focus:border-forest/30" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pincode</label>
                      <Input name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="000 000" className="h-14 rounded-2xl border-slate-100 focus:ring-forest/10 focus:border-forest/30" />
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

                  <div className="p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
                    <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto">
                      By proceeding, you agree to our spiritual contract and travel insurance policies.
                    </p>
                  </div>
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
                      {step === 'payment' ? 'Complete Booking' : 'Next Soul Step'}
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
