import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Calendar, Heart, ChevronLeft } from 'lucide-react';
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
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 bg-white rounded-[2.5rem] shadow-sm border border-forest/5">
            <div className="w-24 h-24 bg-forest/5 rounded-full flex items-center justify-center">
              <ShoppingCart className="h-12 w-12 text-forest/20" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-forest mb-2">Your cart is empty</h3>
              <p className="text-forest/50 text-sm">Looks like you haven't added any soulful experiences yet.</p>
            </div>
            <Button 
              nativeButton={false}
              render={<Link to="/services">Explore Services</Link>}
              className="bg-forest hover:bg-forest/90 text-white rounded-full px-8"
            />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white p-4 rounded-3xl shadow-sm border border-forest/5 flex gap-4 group"
                  >
                    <div className="h-20 w-20 rounded-2xl overflow-hidden bg-cream shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-forest/20">
                          <ShoppingBag className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-forest text-sm line-clamp-1">{item.name}</h4>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-forest/20 hover:text-destructive transition-colors p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-terracotta mb-1">{item.type}</p>
                        {item.dateRange && (
                          <p className="text-[10px] text-forest/60 font-medium flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-terracotta" />
                            {item.dateRange}
                          </p>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center bg-cream/30 rounded-full p-1 border border-forest/5">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-black text-forest">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="font-black text-forest text-sm">{item.price}</span>
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
                  <Button 
                    nativeButton={false}
                    render={
                      <Link to="/checkout" state={{ cartItems: cart, total: Math.round(totalPrice * 1.05) }} className="w-full sm:w-auto">
                        Proceed to Checkout
                      </Link>
                    }
                    className="w-full sm:w-auto bg-terracotta hover:bg-terracotta/90 text-white px-8 py-6 rounded-full text-lg font-bold shadow-lg shadow-terracotta/20 flex items-center justify-center"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
