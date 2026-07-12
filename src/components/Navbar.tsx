import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, MessageCircle, Instagram, Twitter, ArrowRight, User, ShieldCheck, ChevronLeft, Home as HomeIcon, Compass } from 'lucide-react';
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
  { name: 'SPECIAL OFFERS', href: '/offers' },
  { name: 'THE SOUL CAFE', href: '/soul-cafe' },
  { name: 'GALLERY', href: '/gallery' },
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
      className="fixed top-0 left-0 right-0 z-50 bg-forest/95 backdrop-blur-md text-cream border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.1)] h-[64px] md:h-[76px] px-4 sm:px-6 flex items-center transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
          >
            <Link to="/" className="flex items-center group gap-2 xs:gap-3">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-2xl border border-white/20 group-hover:border-terracotta/50 transition-all duration-500 shrink-0">
                <img 
                  src="https://i.postimg.cc/V6CDy34v/IMG-8050.jpg" 
                  alt="The Soul Himalaya Logo" 
                  className="h-8 md:h-10 w-auto object-contain brightness-110 contrast-125 group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="flex items-baseline gap-1 leading-none transition-all duration-500 pt-1">
                <span className="text-[12px] xs:text-[14px] lg:text-[16px] xl:text-[18px] font-playfair italic font-medium text-white/90">
                  The
                </span>
                <span className="text-[12px] xs:text-[14px] lg:text-[16px] xl:text-[18px] font-playfair italic font-bold text-terracotta drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] px-0.5">
                  Soul
                </span>
                <span className="text-[12px] xs:text-[14px] lg:text-[16px] xl:text-[18px] font-playfair italic font-medium text-white/90 hidden xs:inline">
                  Himalaya
                </span>
              </span>
            </Link>
          </motion.div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden xl:flex items-center ml-8 xl:ml-12 2xl:ml-16 space-x-3 xl:space-x-5 2xl:space-x-8">
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
                    'text-[9px] xl:text-[10px] 2xl:text-[11px] font-montserrat font-black uppercase tracking-[0.1em] xl:tracking-[0.15em] transition-all duration-300 hover:text-terracotta text-white/60 relative group pb-1 block whitespace-nowrap',
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
                    'text-[9px] xl:text-[10px] 2xl:text-[11px] font-montserrat font-black uppercase tracking-[0.1em] xl:tracking-[0.15em] transition-all duration-300 hover:text-terracotta text-white/60 relative group pb-1 block whitespace-nowrap',
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
            <div className="flex items-center gap-3 xl:gap-5 border-l border-white/10 pl-3 xl:pl-5">
              <Link
                to="/dashboard"
                className={cn(
                  'text-[9px] xl:text-[10px] font-black uppercase tracking-widest transition-colors hover:text-terracotta text-white/60 flex items-center gap-1.5',
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
                    'text-[9px] xl:text-[10px] font-black uppercase tracking-widest transition-colors hover:text-terracotta text-white/60 flex items-center gap-1.5',
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
        <div className="xl:hidden flex items-center -mr-2 sm:-mr-4 gap-1 sm:gap-2">
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
            <SheetContent side="right" className="w-[280px] xs:w-[320px] sm:w-[400px] bg-forest border-white/10 text-cream p-0 overflow-hidden">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="p-6 pt-12 h-full flex flex-col relative">
                {/* Decorative Background for Mobile Menu */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-terracotta/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                
                <div className="mb-8 flex items-center gap-3 px-2">
                  <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center overflow-hidden border border-white/20">
                    <img 
                      src="https://i.postimg.cc/V6CDy34v/IMG-8050.jpg" 
                      alt="Logo" 
                      className="h-9 w-auto object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-terracotta font-playfair italic font-bold text-2xl leading-none">Soul</span>
                    <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Himalaya</span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col space-y-1.5 overflow-y-auto no-scrollbar pb-6">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileTap={{ scale: 0.95 }}
                    className="mb-1.5"
                  >
                    <Link
                      to="/"
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'flex items-center w-full px-5 py-3 rounded-xl transition-all duration-200 group border border-white/5 bg-white/5 text-cream',
                        location.pathname === '/' && 'text-terracotta font-bold border-terracotta/20 bg-white/10'
                      )}
                    >
                      <HomeIcon className="h-4 w-4 mr-3 text-terracotta/40" />
                      <span className="text-xs font-black tracking-widest uppercase">Home</span>
                    </Link>
                  </motion.div>
                  {user && (
                    <div className="flex flex-col gap-2 mb-2">
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link
                          to="/dashboard"
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            'flex items-center w-full px-5 py-3 rounded-xl transition-all duration-200 group border border-terracotta/30 bg-terracotta text-white shadow-xl shadow-terracotta/20',
                            location.pathname === '/dashboard' && 'ring-2 ring-white/50'
                          )}
                        >
                          <User className="h-4 w-4 mr-3" />
                          <span className="text-xs font-black tracking-widest uppercase">Dashboard</span>
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
                              'flex items-center w-full px-5 py-3 rounded-xl transition-all duration-200 group border border-white/10 bg-forest text-white shadow-lg',
                              location.pathname === '/admin' && 'ring-2 ring-white/50'
                            )}
                          >
                            <ShieldCheck className="h-4 w-4 mr-3 text-terracotta" />
                            <span className="text-xs font-black tracking-widest uppercase">Admin Panel</span>
                          </Link>
                        </motion.div>
                      )}
                    </div>
                  )}
                  {!user && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4"
                    >
                      <Button 
                        onClick={() => {
                          login();
                          setIsOpen(false);
                        }}
                        className="w-full bg-terracotta hover:bg-terracotta/90 text-white rounded-xl h-12 font-black uppercase tracking-widest shadow-lg shadow-terracotta/20 flex items-center justify-center gap-2 group"
                      >
                        <User className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        Customer Login
                      </Button>
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileTap={{ scale: 0.95 }}
                    className="mb-4"
                  >
                    <Link
                      to="/parvati-valley"
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'flex items-center w-full px-5 py-3 rounded-xl transition-all duration-200 group border border-terracotta/20 bg-terracotta/10 text-terracotta',
                        location.pathname === '/parvati-valley' && 'ring-1 ring-terracotta'
                      )}
                    >
                      <Compass className="h-4 w-4 mr-3" />
                      <span className="text-xs font-black tracking-widest uppercase">Explore Parvati Valley</span>
                    </Link>
                  </motion.div>

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
                            'flex items-center w-full px-5 py-3 rounded-xl transition-all duration-300 group border border-white/5 text-cream/70 hover:text-white hover:bg-white/10 hover:border-terracotta/20'
                          )}
                        >
                          <ArrowRight className="h-4 w-4 mr-3 text-terracotta opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1" />
                          <span className="text-[13px] font-black tracking-[0.1em] uppercase">{link.name}</span>
                        </a>
                      ) : (
                        <Link
                          to={link.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            'flex items-center w-full px-5 py-3 rounded-xl transition-all duration-300 group border border-white/5',
                            location.pathname === link.href 
                              ? 'text-terracotta font-black border-terracotta/30 bg-terracotta/5' 
                              : 'text-cream/70 hover:text-white hover:bg-white/10 hover:border-terracotta/20'
                          )}
                        >
                          <ArrowRight className={cn(
                            "h-4 w-4 mr-3 text-terracotta transition-all duration-300 transform",
                            location.pathname === link.href ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-1"
                          )} />
                          <span className="text-[13px] font-black tracking-[0.1em] uppercase">{link.name}</span>
                        </Link>
                      )}
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-auto pt-8 border-t border-white/10">
                  <p className="text-xs text-cream/40 uppercase tracking-widest mb-4">Connect with us</p>
                  <div className="flex gap-4">
                    <a href="https://www.instagram.com/thesoulhimalaya" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram">
                      <Button variant="outline" size="icon" className="rounded-full border-white/20 text-white hover:bg-terracotta hover:border-terracotta">
                        <Instagram className="h-4 w-4" />
                      </Button>
                    </a>
                    <a href="https://x.com/TheSoulhimalaya" target="_blank" rel="noopener noreferrer" aria-label="Follow us on X (Twitter)">
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
