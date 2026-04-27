import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, MessageCircle, Instagram, Twitter, ArrowRight, User, ShieldCheck, ChevronLeft, Home as HomeIcon } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/lib/AuthContext';
import CartDrawer from './CartDrawer';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { Badge } from '@/components/ui/badge';

const navLinks = [
  { name: 'TOUR PACKAGES', href: '/tours' },
  { name: 'MOUNTAIN TREKKS', href: '/trekks' },
  { name: 'GUIDE', href: '/guide' },
  { name: 'YOGA', href: '/yoga' },
  { name: 'MEDITATION', href: '/meditation' },
  { name: 'ADVENTURE', href: '/adventure' },
  { name: 'SHOP', href: '/shop' },
];

const CartCountBadge = () => {
  const { totalItems } = useCart();
  if (totalItems === 0) return null;
  return (
    <Badge className="absolute -top-1 -right-1 bg-terracotta text-white border-2 border-forest flex items-center justify-center rounded-full p-0 text-[10px] w-5 h-5 font-bold">
      {totalItems}
    </Badge>
  );
};

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { user, login, profile } = useAuth();

  // Close sidebar when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-forest text-cream border-b border-white/10 shadow-lg py-3 px-4 sm:px-6"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
          >
            <Link to="/" className="flex items-center group gap-2 xs:gap-3">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-inner border border-white/20 group-hover:border-terracotta/50 transition-colors shrink-0">
                <img 
                  src="https://i.postimg.cc/LXFYQ7WK/Untitled-design-(1).png" 
                  alt="The Soul Himalaya Logo" 
                  className="h-8 md:h-10 w-auto object-contain brightness-110 contrast-125 group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="flex items-baseline gap-1 xs:gap-1.5 leading-none transition-all duration-500 group-hover:gap-2 pt-1">
                <span className="text-[12px] xs:text-[14px] sm:text-[18px] md:text-[22px] font-playfair italic font-medium text-white/90">
                  The
                </span>
                <span className="text-[18px] xs:text-[22px] sm:text-[26px] md:text-[34px] font-fluid text-terracotta drop-shadow-sm px-0.5 sm:px-1">
                  Soul
                </span>
                <span className="text-[12px] xs:text-[14px] sm:text-[18px] md:text-[22px] font-playfair italic font-medium text-white/90">
                  Himalaya
                </span>
              </span>
            </Link>
          </motion.div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center space-x-6 xl:space-x-10">
          {navLinks.map((link) => (
            <motion.div
              key={link.name}
              whileHover={{ y: -1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {link.href.startsWith('http') ? (
                <a
                  href={link.href}
                  className={cn(
                    'text-[12px] xl:text-[13px] font-montserrat font-bold uppercase tracking-[0.1em] xl:tracking-[0.15em] transition-all duration-300 hover:text-terracotta text-white/70 relative group pb-1',
                    location.pathname === link.href && 'text-white border-b-2 border-terracotta'
                  )}
                >
                  {link.name}
                  <span className={cn(
                    "absolute bottom-0 left-0 w-0 h-0.5 bg-terracotta transition-all duration-300 group-hover:w-full",
                    location.pathname === link.href && "hidden"
                  )} />
                </a>
              ) : (
                <Link
                  to={link.href}
                  className={cn(
                    'text-[12px] xl:text-[13px] font-montserrat font-bold uppercase tracking-[0.1em] xl:tracking-[0.15em] transition-all duration-300 hover:text-terracotta text-white/70 relative group pb-1',
                    location.pathname === link.href && 'text-white border-b-2 border-terracotta'
                  )}
                >
                  {link.name}
                  <span className={cn(
                    "absolute bottom-0 left-0 w-0 h-0.5 bg-terracotta transition-all duration-300 group-hover:w-full",
                    location.pathname === link.href && "hidden"
                  )} />
                </Link>
              )}
            </motion.div>
          ))}
          {user && (
            <div className="flex items-center gap-4 xl:gap-6 border-l border-white/10 pl-4 xl:pl-6">
              <Link
                to="/dashboard"
                className={cn(
                  'text-[10px] xl:text-[11px] font-bold uppercase tracking-widest transition-colors hover:text-terracotta text-white/70 flex items-center gap-1.5 xl:gap-2',
                  location.pathname === '/dashboard' && 'text-white'
                )}
              >
                <User className="h-3 w-3 xl:h-3.5 xl:w-3.5" />
                Auth
              </Link>
              {profile?.role === 'admin' && (
                <Link
                  to="/admin"
                  className={cn(
                    'text-[10px] xl:text-[11px] font-bold uppercase tracking-widest transition-colors hover:text-terracotta text-white/70 flex items-center gap-1.5 xl:gap-2',
                    location.pathname === '/admin' && 'text-white'
                  )}
                >
                  <ShieldCheck className="h-3 w-3 xl:h-3.5 xl:w-3.5" />
                  Admin
                </Link>
              )}
            </div>
          )}
          <CartDrawer variant="header" />
        </div>

        {/* Mobile/Tablet Nav */}
        <div className="lg:hidden flex items-center -mr-2 sm:-mr-4 gap-1 sm:gap-2">
          {/* Mobile Cart Link - Direct Page */}
          <Link to="/cart" className="relative h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center bg-white/10 rounded-full text-white">
            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
            <CartCountBadge />
          </Link>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger
              render={
                <button className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "text-white hover:bg-white/10 h-9 w-9 sm:h-10 sm:w-10 p-0")}>
                  <motion.div whileTap={{ scale: 0.9 }} className="flex items-center justify-center">
                    <Menu className="h-7 w-7 sm:h-8 sm:w-8" />
                  </motion.div>
                </button>
              }
            />
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-forest border-white/10 text-cream p-0">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="p-6 pt-20 h-full flex flex-col">
                <div className="flex flex-col space-y-1.5">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileTap={{ scale: 0.95 }}
                    className="mb-2"
                  >
                    <Link
                      to="/"
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'flex items-center w-full px-6 py-4 rounded-2xl transition-all duration-200 group border border-white/5 bg-white/5 text-cream',
                        location.pathname === '/' && 'text-terracotta font-bold border-terracotta/20 bg-white/10'
                      )}
                    >
                      <HomeIcon className="h-5 w-5 mr-4 text-terracotta/40" />
                      <span className="text-sm font-black tracking-widest uppercase">Home</span>
                    </Link>
                  </motion.div>
                  {user && (
                    <div className="flex flex-col gap-3 mb-3">
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link
                          to="/dashboard"
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            'flex items-center w-full px-6 py-4 rounded-2xl transition-all duration-200 group border border-terracotta/30 bg-terracotta text-white shadow-xl shadow-terracotta/20',
                            location.pathname === '/dashboard' && 'ring-2 ring-white/50'
                          )}
                        >
                          <User className="h-5 w-5 mr-4" />
                          <span className="text-sm font-black tracking-widest uppercase">Dashboard</span>
                        </Link>
                      </motion.div>
                      {profile?.role === 'admin' && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Link
                            to="/admin"
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              'flex items-center w-full px-6 py-4 rounded-2xl transition-all duration-200 group border border-white/10 bg-forest text-white shadow-lg',
                              location.pathname === '/admin' && 'ring-2 ring-white/50'
                            )}
                          >
                            <ShieldCheck className="h-5 w-5 mr-4 text-terracotta" />
                            <span className="text-sm font-black tracking-widest uppercase">Admin Panel</span>
                          </Link>
                        </motion.div>
                      )}
                    </div>
                  )}
                  {!user && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6"
                    >
                      <Button 
                        onClick={() => {
                          login();
                          setIsOpen(false);
                        }}
                        className="w-full bg-terracotta hover:bg-terracotta/90 text-white rounded-2xl h-14 font-black uppercase tracking-widest shadow-lg shadow-terracotta/20 flex items-center justify-center gap-2 group"
                      >
                        <User className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        Customer Login
                      </Button>
                    </motion.div>
                  )}
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {link.href.startsWith('http') ? (
                        <a
                          href={link.href}
                          className={cn(
                            'flex items-center w-full px-6 py-4 rounded-xl transition-all duration-200 group border border-white/5 text-cream/70 hover:text-white hover:bg-white/5'
                          )}
                        >
                          <ArrowRight className="h-4 w-4 mr-4 text-terracotta opacity-0 group-hover:opacity-100 transition-opacity" />
                          <span className="text-sm font-bold tracking-widest uppercase">{link.name}</span>
                        </a>
                      ) : (
                        <Link
                          to={link.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            'flex items-center w-full px-6 py-4 rounded-xl transition-all duration-200 group border border-white/5',
                            location.pathname === link.href 
                              ? 'text-terracotta font-bold border-terracotta/20 bg-white/5' 
                              : 'text-cream/70 hover:text-white hover:bg-white/5'
                          )}
                        >
                          <ArrowRight className={cn(
                            "h-4 w-4 mr-4 text-terracotta transition-opacity",
                            location.pathname === link.href ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                          )} />
                          <span className="text-sm font-bold tracking-widest uppercase">{link.name}</span>
                        </Link>
                      )}
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-auto pt-8 border-t border-white/10">
                  <p className="text-xs text-cream/40 uppercase tracking-widest mb-4">Connect with us</p>
                  <div className="flex gap-4">
                    <a href="https://www.instagram.com/thesoulhimalaya" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="icon" className="rounded-full border-white/20 text-white hover:bg-terracotta hover:border-terracotta">
                        <Instagram className="h-4 w-4" />
                      </Button>
                    </a>
                    <a href="https://x.com/TheSoulhimalaya" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="icon" className="rounded-full border-white/20 text-white hover:bg-terracotta hover:border-terracotta">
                        <Twitter className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
