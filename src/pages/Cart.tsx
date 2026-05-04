import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Calendar, Heart, ChevronLeft, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/CartContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

  return (
    <div className="pt-24 min-h-screen bg-cream px-6 pb-20">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="rounded-full bg-forest/5 text-forest"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-heading font-bold text-forest">Soul Cart</h1>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-8 bg-white rounded-[3rem] shadow-xl border border-forest/5">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-32 h-32 bg-forest/5 rounded-full flex items-center justify-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-terracotta/10 to-transparent animate-pulse" />
              <ShoppingCart className="h-14 w-14 text-forest/20 relative z-10" />
            </motion.div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-forest uppercase tracking-tight">Your Journey Awaits</h3>
              <p className="text-forest/50 text-sm max-w-xs mx-auto">Your soulful adventure hasn't started yet. Let's find an experience that speaks to you.</p>
            </div>
            <Button 
              nativeButton={false}
              render={<Link to="/services">Explore Experiences</Link>}
              className="bg-forest hover:bg-forest/90 text-white rounded-full px-10 py-7 text-lg shadow-xl shadow-forest/10"
            />
          </div>
        ) : (
          <div className="space-y-12">
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-[1.5rem] shadow-md border border-forest/5 overflow-hidden group flex flex-row h-28 hover:shadow-xl transition-all duration-500"
                  >
                    <div className="w-1/3 relative overflow-hidden shrink-0">
                      {item.image ? (
                        <img 
                          src={(item.name || "").toLowerCase().includes("valley of shadows") ? "https://i.postimg.cc/TYqctVvr/IMG-8144.jpg" : item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        />
                      ) : (
                        <div className="w-full h-full bg-forest/5 flex items-center justify-center">
                          <ShoppingBag className="h-5 w-5 text-forest/10" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 z-20">
                        <span className="bg-terracotta/90 backdrop-blur-sm text-white text-[8px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full shadow-lg">
                          {item.type}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 flex-grow flex flex-col justify-between overflow-hidden">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-forest text-sm leading-tight group-hover:text-terracotta transition-colors line-clamp-1">{item.name}</h4>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-forest/20 hover:text-destructive transition-colors shrink-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        {item.dateRange && (
                          <div className="flex items-center gap-1 text-forest/40">
                            <Calendar className="h-2.5 w-2.5 text-terracotta" />
                            <span className="text-[9px] font-bold tracking-tight">{item.dateRange}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-end">
                        <div className="flex items-center bg-cream/30 rounded-full p-0.5 border border-forest/5 shadow-inner">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-5 w-5 flex items-center justify-center rounded-full hover:bg-white hover:text-terracotta transition-all text-forest/40"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-[10px] font-black text-forest">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-5 w-5 flex items-center justify-center rounded-full hover:bg-white hover:text-terracotta transition-all text-forest/40"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] text-forest/30 uppercase tracking-[0.1em] font-black leading-none mb-0.5">Price</p>
                          <span className="font-black text-forest text-sm tracking-tighter leading-none">{item.price}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-forest/5 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-xs text-forest/40 uppercase tracking-widest font-bold">
                  <span>Subtotal</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-forest/40 uppercase tracking-widest font-bold">
                  <span>Service Tax (5%)</span>
                  <span>₹{Math.round(totalPrice * 0.05).toLocaleString()}</span>
                </div>
                <Separator className="bg-forest/5" />
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-terracotta mb-1">Total Payable</p>
                    <span className="text-3xl font-heading font-bold text-forest">₹{Math.round(totalPrice * 1.05).toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col gap-3 w-full sm:w-auto">
                    <Button 
                      nativeButton={false}
                      render={
                        <Link to="/checkout" state={{ cartItems: cart, total: Math.round(totalPrice * 1.05) }} className="w-full sm:w-auto">
                          Proceed to Checkout
                        </Link>
                      }
                      className="w-full bg-terracotta hover:bg-terracotta/90 text-white px-8 py-6 rounded-full text-lg font-bold shadow-lg shadow-terracotta/20 flex items-center justify-center"
                    />
                    <Link to="/services" className="w-full">
                      <Button 
                        variant="outline" 
                        className="w-full h-11 rounded-full border-forest/10 text-forest hover:bg-forest hover:text-white font-bold text-[10px] uppercase tracking-widest transition-all duration-300"
                      >
                        Explore More
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Soul Touch Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-white rounded-[3rem] p-8 shadow-xl border border-forest/5 space-y-8 relative overflow-hidden group hover:shadow-2xl transition-all duration-500"
            >
              {/* Decorative Background Elements */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-terracotta/5 rounded-full blur-3xl group-hover:bg-terracotta/10 transition-colors duration-500" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-forest/5 rounded-full blur-3xl group-hover:bg-forest/10 transition-colors duration-500" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-5">
                  <motion.div 
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    className="p-4 bg-gradient-to-br from-terracotta to-terracotta/80 rounded-3xl shadow-lg shadow-terracotta/20"
                  >
                    <FileText className="h-7 w-7 text-white" />
                  </motion.div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-forest tracking-tight flex items-center gap-2">
                      Soul Touch
                      <motion.span
                        animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Sparkles className="h-4 w-4 text-terracotta" />
                      </motion.span>
                    </h3>
                    <p className="text-[10px] text-terracotta font-black uppercase tracking-[0.2em]">Add Your Digital Soul Notes</p>
                  </div>
                </div>
                
                <div className="bg-forest/5 px-4 py-2 rounded-full border border-forest/5 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse" />
                  <span className="text-[10px] font-bold text-forest/40 uppercase tracking-widest">Personalizing your journey</span>
                </div>
              </div>

              <div className="relative z-10 mt-2">
                <textarea 
                  placeholder="Share any special requests, dietary needs, or simply a message from your soul for this journey..."
                  className="w-full h-40 bg-cream/20 border border-forest/10 rounded-[2rem] p-6 text-forest text-sm font-medium focus:ring-4 focus:ring-terracotta/5 focus:border-terracotta/30 transition-all outline-none resize-none placeholder:text-forest/20 shadow-inner group-hover:bg-white transition-all duration-500"
                />
                <div className="absolute bottom-4 right-6 flex items-center gap-2 text-[10px] font-bold text-forest/20 uppercase tracking-widest pointer-events-none">
                  <ArrowRight className="h-3 w-3" />
                  Written by you
                </div>
              </div>
              
              <div className="flex items-center gap-3 relative z-10 pt-2">
                <Heart className="h-4 w-4 text-terracotta fill-terracotta/20" />
                <p className="text-[11px] text-forest/40 font-medium italic">We'll handle every detail with love and intention.</p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
