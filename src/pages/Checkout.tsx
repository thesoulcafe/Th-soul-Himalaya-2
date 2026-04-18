import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShieldCheck, CreditCard, ArrowLeft, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import AuthModal from '@/components/AuthModal';
import { useCart } from '@/lib/CartContext';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { cartItems, total, item, price, type } = location.state || {};

  const items = cartItems || (item ? [{ name: item, price, type, quantity: 1 }] : []);
  const displayTotal = total ? `₹${total.toLocaleString()}` : (price || '₹0');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    pincode: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Check if Razorpay is configured
  const isRazorpayConfigured = !!import.meta.env.VITE_RAZORPAY_KEY_ID;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!auth.currentUser) {
      setShowAuthModal(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const priceNum = typeof displayTotal === 'string' 
        ? parseInt(displayTotal.replace(/[^0-9]/g, '')) 
        : displayTotal;

      // 1. Create an order on the server
      const response = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: priceNum,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`
        })
      });

      const order = await response.json();

      if (!order.id) {
        throw new Error('Failed to create Razorpay order');
      }

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Use Razorpay Key ID from env
        amount: order.amount,
        currency: order.currency,
        name: "The Soul Himalaya",
        description: items.length > 1 ? `${items[0].name} + others` : (items[0]?.name || "Soul Package"),
        image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=200&q=200",
        order_id: order.id,
        handler: async (response: any) => {
          // 3. Verify Payment
          const verifyResponse = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.status === 'success') {
            // 4. Save to Firestore
            await addDoc(collection(db, 'bookings'), {
              userId: auth.currentUser?.uid,
              userName: formData.fullName,
              userEmail: formData.email,
              phone: formData.phone,
              city: formData.city,
              pincode: formData.pincode,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              items: items.map((i: any) => ({
                name: i.name,
                type: i.type,
                price: i.price,
                quantity: i.quantity
              })),
              serviceName: items.length > 1 ? `${items[0].name} + ${items.length - 1} more` : items[0]?.name || 'Custom Booking',
              serviceType: items[0]?.type || 'service',
              date: new Date().toISOString().split('T')[0],
              guests: items.reduce((acc: number, curr: any) => acc + (curr.quantity || 1), 0),
              totalPrice: priceNum,
              status: 'confirmed',
              paymentStatus: 'paid',
              createdAt: serverTimestamp()
            });

            setIsSuccess(true);
            clearCart();
            setTimeout(() => {
              navigate('/dashboard');
            }, 3000);
          } else {
            alert('Payment verification failed. If your money was deducted, please contact support.');
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone
        },
        notes: {
          address: formData.city + ", " + formData.pincode
        },
        theme: {
          color: "#2D4A3E" // Forest green theme
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Error during payment flow:', error);
      alert('Failed to process payment. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white rounded-[2.5rem] p-12 text-center shadow-2xl"
        >
          <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-forest mb-4">Payment Successful!</h1>
          <p className="text-forest/60 mb-8">Your soulful journey has been booked. Redirecting you to your dashboard...</p>
          <div className="h-1 w-full bg-forest/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 3 }}
              className="h-full bg-terracotta"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-6 bg-cream min-h-screen">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-8 text-forest hover:text-terracotta flex items-center gap-2 group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back
          </Button>
        </motion.div>

        {!isRazorpayConfigured && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-12 p-8 bg-terracotta/5 border border-terracotta/20 rounded-[2rem] text-forest relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ShieldCheck className="h-16 w-16 text-terracotta" />
            </div>
            <h2 className="text-xl font-heading font-bold text-terracotta mb-2">Payment Setup Required</h2>
            <p className="text-sm text-forest/70 mb-4 max-w-lg">
              To enable checkout, you need to add your Razorpay keys to the **Secrets** or **Environment Variables** panel in the application settings.
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-mono bg-white/50 p-4 rounded-xl border border-terracotta/10">
              <div>
                <span className="font-bold">VITE_RAZORPAY_KEY_ID</span>
                <p className="text-forest/40">Required for Frontend</p>
              </div>
              <div className="w-px bg-terracotta/10 self-stretch" />
              <div>
                <span className="font-bold">RAZORPAY_KEY_SECRET</span>
                <p className="text-forest/40">Required for Backend</p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Billing Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl font-heading font-bold text-forest mb-8">Billing Details</h1>
            <form id="checkout-form" onSubmit={handlePayment} className="space-y-8">
              <div className="space-y-6">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-2 group"
                >
                  <label className="text-xs font-bold text-forest/40 uppercase tracking-widest ml-1 group-focus-within:text-terracotta transition-colors">Full Name</label>
                  <Input 
                    required 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe" 
                    className="h-14 rounded-2xl border-forest/5 bg-white shadow-sm focus:border-terracotta/50 focus:ring-4 focus:ring-terracotta/5 transition-all placeholder:text-forest/10" 
                  />
                </motion.div>
              </div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2 group"
              >
                <label className="text-xs font-bold text-forest/40 uppercase tracking-widest ml-1 group-focus-within:text-terracotta transition-colors">Email Address</label>
                <Input 
                  required 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com" 
                  className="h-14 rounded-2xl border-forest/5 bg-white shadow-sm focus:border-terracotta/50 focus:ring-4 focus:ring-terracotta/5 transition-all placeholder:text-forest/10" 
                />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2 group"
              >
                <label className="text-xs font-bold text-forest/40 uppercase tracking-widest ml-1 group-focus-within:text-terracotta transition-colors">Phone Number</label>
                <Input 
                  required 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 98765 43210" 
                  className="h-14 rounded-2xl border-forest/5 bg-white shadow-sm focus:border-terracotta/50 focus:ring-4 focus:ring-terracotta/5 transition-all placeholder:text-forest/10" 
                />
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-2 group"
                >
                  <label className="text-xs font-bold text-forest/40 uppercase tracking-widest ml-1 group-focus-within:text-terracotta transition-colors">City</label>
                  <Input 
                    required 
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City" 
                    className="h-14 rounded-2xl border-forest/5 bg-white shadow-sm focus:border-terracotta/50 focus:ring-4 focus:ring-terracotta/5 transition-all placeholder:text-forest/10" 
                  />
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="space-y-2 group"
                >
                  <label className="text-xs font-bold text-forest/40 uppercase tracking-widest ml-1 group-focus-within:text-terracotta transition-colors">Pincode</label>
                  <Input 
                    required 
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="123456" 
                    className="h-14 rounded-2xl border-forest/5 bg-white shadow-sm focus:border-terracotta/50 focus:ring-4 focus:ring-terracotta/5 transition-all placeholder:text-forest/10" 
                  />
                </motion.div>
              </div>
            </form>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden sticky top-32 group">
              <div className="bg-forest p-8 text-white relative overflow-hidden">
                <motion.div 
                  className="absolute -right-4 -top-4 opacity-10"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <ShieldCheck className="h-32 w-32" />
                </motion.div>
                <h3 className="text-2xl font-heading font-bold relative z-10">Order Summary</h3>
                <p className="text-white/60 text-sm relative z-10">Review your soulful selection</p>
              </div>
              <CardContent className="p-8">
                <div className="space-y-4 mb-8">
                  {items.map((item: any, i: number) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + (i * 0.1) }}
                      className="flex justify-between items-start group"
                    >
                      <div className="flex gap-3">
                        <div className="h-10 w-10 rounded-lg bg-cream flex items-center justify-center shrink-0 border border-forest/5 shadow-inner">
                          <ShoppingBag className="h-5 w-5 text-forest/20" />
                        </div>
                        <div>
                          <div className="text-[8px] uppercase tracking-widest font-bold text-terracotta mb-0.5">{item.type}</div>
                          <h4 className="text-xs font-bold text-forest leading-tight">{item.name}</h4>
                          {item.dateRange && (
                            <div className="text-[9px] text-forest/40 font-medium mt-0.5">{item.dateRange}</div>
                          )}
                          <div className="text-[10px] text-forest/40 font-medium mt-0.5">Qty: {item.quantity}</div>
                        </div>
                      </div>
                      <div className="font-bold text-forest text-sm">{item.price}</div>
                    </motion.div>
                  ))}
                </div>
                
                <Separator className="my-6 bg-forest/5" />
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm text-forest/60">
                    <span>Subtotal</span>
                    <span>{displayTotal}</span>
                  </div>
                  <div className="flex justify-between text-sm text-forest/60">
                    <span>Processing Fee</span>
                    <span>₹0</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-forest pt-2 border-t border-forest/5">
                    <span>Total Amount</span>
                    <motion.span 
                      key={displayTotal}
                      initial={{ scale: 1.1, color: '#C4622D' }}
                      animate={{ scale: 1, color: '#2D4A3E' }}
                    >
                      {displayTotal}
                    </motion.span>
                  </div>
                </div>

                <div className="bg-cream p-6 rounded-2xl space-y-4 mb-8">
                  <motion.div whileHover={{ x: 5 }} className="flex items-center gap-3 text-forest/70 text-sm">
                    <ShieldCheck className="h-5 w-5 text-terracotta" />
                    <span>Secure SSL Encryption</span>
                  </motion.div>
                  <motion.div whileHover={{ x: 5 }} className="flex items-center gap-3 text-forest/70 text-sm">
                    <CreditCard className="h-5 w-5 text-terracotta" />
                    <span>Multiple Payment Options</span>
                  </motion.div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    form="checkout-form"
                    type="submit" 
                    disabled={isSubmitting || !isRazorpayConfigured}
                    className="w-full bg-terracotta hover:bg-terracotta/90 text-white py-8 rounded-full text-xl font-bold shadow-xl shadow-terracotta/20 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : !isRazorpayConfigured ? (
                      <>
                        <ShieldCheck className="h-6 w-6" /> Setup Required
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-6 w-6" /> Pay Now
                      </>
                    )}
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
