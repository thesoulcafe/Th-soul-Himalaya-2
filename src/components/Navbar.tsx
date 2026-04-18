import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, MessageCircle, Instagram, Twitter, ArrowRight, User, ShieldCheck, ChevronLeft, Home as HomeIcon } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/lib/AuthContext';
import CartDrawer from './CartDrawer';

const navLinks = [
  { name: 'Tours', href: '/tours' },
  { name: 'Trekks', href: '/trekks' },
  { name: 'Guide', href: '/guide' },
  { name: 'Yoga', href: '/yoga' },
  { name: 'Meditation', href: '/meditation' },
  { name: 'Adventure', href: '/adventure' },
  { name: 'Shop', href: '/shop' },
];

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
      className="fixed top-0 left-0 right-0 z-50 bg-forest text-cream border-b border-white/10 shadow-lg py-1 px-6"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          {location.pathname !== '/' && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="text-white hover:bg-white/10 h-10 w-10 md:h-12 md:w-12 rounded-full"
                title="Go Back"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </motion.div>
          )}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/" className="flex items-center">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-inner border border-white/20">
                <img 
                  src="https://i.postimg.cc/LXFYQ7WK/Untitled-design-(1).png" 
                  alt="The Soul Himalaya Logo" 
                  className="h-8 md:h-10 w-auto object-contain brightness-110 contrast-125"
                  referrerPolicy="no-referrer"
                />
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <motion.div
              key={link.name}
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Link
                to={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-terracotta text-white/90 relative group',
                  location.pathname === link.href && 'text-terracotta font-bold'
                )}
              >
                {link.name}
                <span className={cn(
                  "absolute -bottom-1 left-0 w-0 h-0.5 bg-terracotta transition-all duration-300 group-hover:w-full",
                  location.pathname === link.href && "w-full"
                )} />
              </Link>
            </motion.div>
          ))}
          {user && (
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="flex items-center gap-4"
            >
              <Link
                to="/dashboard"
                className={cn(
                  'text-sm font-medium transition-colors hover:text-terracotta text-white/90 flex items-center gap-2',
                  location.pathname === '/dashboard' && 'text-terracotta font-bold'
                )}
              >
                <User className="h-4 w-4" />
                Dashboard
              </Link>
              {profile?.role === 'admin' && (
                <Link
                  to="/admin"
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-terracotta text-white/90 flex items-center gap-2',
                    location.pathname === '/admin' && 'text-terracotta font-bold'
                  )}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin Panel
                </Link>
              )}
            </motion.div>
          )}
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <CartDrawer variant="header" />
          </motion.div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex items-center -mr-4 gap-2">
          <CartDrawer variant="header" />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger
              nativeButton={true}
              render={
                <button className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "text-white hover:bg-white/10 h-14 w-12 p-0")}>
                  <motion.div whileTap={{ scale: 0.9 }} className="flex items-center justify-center">
                    <Menu className="h-13 w-13" />
                  </motion.div>
                </button>
              }
            />
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-forest border-white/10 text-cream p-0">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="p-6 pt-20 h-full flex flex-col">
                <div className="flex flex-col space-y-1.5">
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
                            'flex items-center justify-center w-full px-3 py-3 rounded-lg transition-all duration-200 group border border-terracotta/30 bg-terracotta text-white shadow-lg shadow-terracotta/20',
                            location.pathname === '/dashboard' && 'ring-2 ring-white/50'
                          )}
                        >
                          <User className="h-4 w-4 mr-2" />
                          <span className="text-sm font-bold tracking-wide uppercase">Dashboard</span>
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
                              'flex items-center justify-center w-full px-3 py-3 rounded-lg transition-all duration-200 group border border-white/10 bg-forest text-white shadow-lg',
                              location.pathname === '/admin' && 'ring-2 ring-white/50'
                            )}
                          >
                            <ShieldCheck className="h-4 w-4 mr-2" />
                            <span className="text-sm font-bold tracking-wide uppercase">Admin Panel</span>
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
                        className="w-full bg-terracotta hover:bg-terracotta/90 text-white rounded-lg py-3 font-bold shadow-lg shadow-terracotta/20 flex items-center justify-center gap-2 group"
                      >
                        <User className="h-4 w-4 group-hover:scale-110 transition-transform" />
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
                      <Link
                        to={link.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          'flex items-center justify-center w-full px-3 py-2 rounded-lg transition-all duration-200 group border border-white/5',
                          location.pathname === link.href 
                            ? 'text-terracotta font-bold border-terracotta/20 bg-white/5' 
                            : 'text-cream/70 hover:text-white hover:bg-white/5'
                        )}
                      >
                        <span className="text-sm font-medium tracking-wide">{link.name}</span>
                      </Link>
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
