import { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, X, ArrowRight, ShoppingBag, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { useCart } from '@/lib/CartContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface CartDrawerProps {
  variant?: 'floating' | 'header';
}

export default function CartDrawer({ variant = 'floating' }: CartDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { cart, removeFromCart, updateQuantity, totalItems, totalPrice, lastAddedTime } = useCart();
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    if (lastAddedTime > 0 && !isOpen && cart.length > 0) {
      setIsBlinking(true);
    } else {
      setIsBlinking(false);
    }
  }, [lastAddedTime, isOpen, cart.length]);

  useEffect(() => {
    if (isOpen) {
      setIsBlinking(false);
    }
  }, [isOpen]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger 
        nativeButton={true}
        render={
          <button
            className={cn(
              "z-50 rounded-full transition-all duration-300 flex items-center justify-center group relative overflow-visible",
              variant === 'floating' 
                ? "fixed bottom-8 right-8 w-16 h-16 text-white shadow-2xl hover:scale-110" 
                : "w-10 h-10 bg-white/10 text-white hover:bg-white/20"
            )}
            style={variant === 'floating' && !isBlinking ? { backgroundColor: "#C15A3E" } : {}}
          >
            <motion.div
              animate={isBlinking ? {
                scale: [1, 1.1, 1],
                backgroundColor: variant === 'floating' 
                  ? ["#C15A3E", "#2D3E35", "#C15A3E"] // Terracotta to Forest
                  : ["rgba(255,255,255,0.1)", "#C15A3E", "rgba(255,255,255,0.1)"] // Transparent to Terracotta
              } : {}}
              transition={isBlinking ? { 
                duration: 1, 
                repeat: Infinity,
                ease: "easeInOut"
              } : { duration: 0.3 }}
              className="w-full h-full rounded-full flex items-center justify-center"
            >
              <ShoppingCart className={cn(variant === 'floating' ? "h-7 w-7" : "h-5 w-5")} />
              {totalItems > 0 && (
                <Badge className={cn(
                  "absolute bg-forest text-white border-2 border-white flex items-center justify-center rounded-full p-0 text-xs font-bold animate-in zoom-in duration-300",
                  variant === 'floating' ? "-top-2 -right-2 w-7 h-7" : "-top-1 -right-1 w-5 h-5 text-[10px]"
                )}>
                  {totalItems}
                </Badge>
              )}
              {variant === 'floating' && (
                <span className="absolute right-full mr-4 px-4 py-2 bg-white text-terracotta rounded-lg shadow-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none border border-terracotta/10">
                  View Cart
                </span>
              )}
            </motion.div>
          </button>
        }
      />
      <SheetContent className="w-full sm:max-w-md bg-cream border-forest/10 p-0 flex flex-col shadow-2xl">
        <SheetHeader className="p-10 bg-forest text-white relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-terracotta/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <SheetTitle className="text-4xl font-montserrat font-extrabold text-white flex items-center gap-5 relative z-10 uppercase tracking-tighter">
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="p-4 bg-white/10 rounded-2xl shadow-inner border border-white/10 backdrop-blur-md"
            >
              <ShoppingBag className="h-8 w-8 text-terracotta" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-white leading-none">Soul</span>
              <span className="text-terracotta italic leading-none ml-4 transition-all duration-500 hover:ml-6">Cart</span>
            </div>
          </SheetTitle>
        </SheetHeader>
        <div className="flex-grow overflow-hidden flex flex-col">
          {cart.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center p-12 text-center space-y-6">
              <div className="w-24 h-24 bg-forest/5 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-12 w-12 text-forest/20" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-forest mb-2">Your cart is empty</h3>
                <p className="text-forest/50 text-sm">Looks like you haven't added any soulful experiences yet.</p>
              </div>
              <Button 
                nativeButton={false}
                render={<Link to="/services" onClick={() => setIsOpen(false)} />} 
                className="bg-forest hover:bg-forest/90 text-white rounded-full px-8"
              >
                Explore Services
              </Button>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-grow p-5">
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {cart.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        whileHover={{ scale: 1.01, x: 2 }}
                        className="bg-white p-2.5 rounded-2xl shadow-sm border border-forest/5 flex gap-3 group hover:border-terracotta/40 hover:shadow-md transition-all duration-300 relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-terracotta/0 group-hover:bg-terracotta/100 transition-all duration-300" />
                        <Link 
                          to={`/${item.type.toLowerCase().split(' ')[0]}`} 
                          onClick={() => setIsOpen(false)}
                          className="h-14 w-14 rounded-xl overflow-hidden bg-cream shrink-0 cursor-pointer shadow-inner relative"
                        >
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-forest/20">
                              <ShoppingBag className="h-5 w-5" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <div className="flex-grow flex flex-col justify-between py-0.5">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <Link to={`/${item.type.toLowerCase().split(' ')[0]}`} onClick={() => setIsOpen(false)} className="flex-grow">
                                <h4 className="font-bold text-forest text-[11px] leading-tight line-clamp-2 hover:text-terracotta transition-colors">{item.name}</h4>
                              </Link>
                              <button 
                                onClick={() => removeFromCart(item.id)}
                                className="text-forest/10 hover:text-destructive transition-colors shrink-0 p-1 hover:bg-destructive/5 rounded-full"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-[8px] uppercase tracking-[0.15em] font-bold text-terracotta opacity-80">{item.type}</p>
                              <Link 
                                to={item.type === 'Tour' ? '/tours' : item.type === 'Trek' ? '/treks' : item.type === 'WFH Stay' ? '/wfh' : item.type === 'Yoga Retreat' ? '/yoga' : item.type === 'Meditation Retreat' ? '/meditation' : '/shop'}
                                className="text-[8px] text-forest/40 hover:text-forest underline underline-offset-2 transition-colors"
                                onClick={() => setIsOpen(false)}
                              >
                                View Details
                              </Link>
                            </div>
                            {item.dateRange && (
                              <p className="text-[9px] text-forest/60 mt-1 font-medium flex items-center gap-1">
                                <Calendar className="h-2.5 w-2.5 text-terracotta" />
                                {item.dateRange}
                              </p>
                            )}
                          </div>
                          <div className="flex justify-between items-center mt-1.5">
                            <div className="flex items-center bg-cream/30 rounded-full p-0.5 border border-forest/5 shadow-sm">
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="h-4.5 w-4.5 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all text-forest/60 hover:text-forest"
                              >
                                <Minus className="h-2 w-2" />
                              </button>
                              <span className="w-5 text-center text-[9px] font-black text-forest">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="h-4.5 w-4.5 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all text-forest/60 hover:text-forest"
                              >
                                <Plus className="h-2 w-2" />
                              </button>
                            </div>
                            <span className="font-black text-forest text-[10px] tracking-tight">{item.price}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>

              <div className="p-8 bg-white border-t border-forest/5 space-y-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-forest/40 uppercase tracking-widest font-bold">
                    <span>Subtotal</span>
                    <span>₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-forest/40 uppercase tracking-widest font-bold">
                    <span>Service Tax (5%)</span>
                    <span>₹{Math.round(totalPrice * 0.05).toLocaleString()}</span>
                  </div>
                  <Separator className="my-4 bg-forest/5" />
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pt-12 gap-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-terracotta mb-1">Total Payable</p>
                      <span className="text-3xl font-heading font-bold text-forest">₹{Math.round(totalPrice * 1.05).toLocaleString()}</span>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      animate={{ 
                        boxShadow: ["0px 0px 0px rgba(196, 98, 45, 0)", "0px 0px 25px rgba(196, 98, 45, 0.4)", "0px 0px 0px rgba(196, 98, 45, 0)"]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="mt-6 w-full sm:w-auto"
                    >
                      <Button 
                        nativeButton={false}
                        render={<Link to="/checkout" onClick={() => setIsOpen(false)} state={{ cartItems: cart, total: Math.round(totalPrice * 1.05) }} className="w-full flex items-center justify-center" />} 
                        className="w-full bg-terracotta hover:bg-terracotta/90 text-white px-6 py-5 rounded-full text-base font-bold shadow-lg shadow-terracotta/20 transition-all duration-300 hover:shadow-terracotta/40"
                      >
                        Checkout
                      </Button>
                    </motion.div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-4 pt-2">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" className="h-4 opacity-30 grayscale" />
                  <div className="h-4 w-px bg-forest/10" />
                  <p className="text-[10px] text-forest/30 uppercase tracking-widest font-bold">Secure Checkout</p>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
