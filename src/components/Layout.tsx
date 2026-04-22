import Navbar from './Navbar';
import Footer from './Footer';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import AIAssistant from './AIAssistant';
import { Button } from './ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-terracotta selection:text-white relative">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />

      {/* Beautiful Floating Navigation Pill */}
      <AnimatePresence>
        {location.pathname !== '/' && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]"
          >
            <div className="flex items-center gap-1 p-2 rounded-full bg-forest/80 backdrop-blur-3xl border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.5)] ring-1 ring-white/20 group hover:ring-terracotta/40 transition-all duration-500">
              <Button 
                onClick={() => navigate(-1)}
                variant="ghost"
                className="h-12 w-12 sm:h-16 sm:w-16 rounded-full text-cream/70 hover:text-white hover:bg-white/10 transition-all duration-300 flex flex-col items-center justify-center gap-1 group/back relative overflow-hidden"
                title="Go Back"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover/back:opacity-100 transition-opacity" />
                <ArrowLeft className="h-6 w-6 group-hover/back:-translate-x-1 transition-transform" />
                <span className="text-[8px] font-black uppercase tracking-tighter opacity-0 group-hover/back:opacity-60 transition-opacity">Back</span>
              </Button>
              
              <div className="w-[1px] h-10 bg-white/10 mx-2" />
              
              <Button 
                onClick={() => navigate('/')}
                variant="ghost"
                className="h-12 w-12 sm:h-16 sm:w-16 rounded-full text-cream/70 hover:text-white hover:bg-white/10 transition-all duration-300 flex flex-col items-center justify-center gap-1 group/home relative overflow-hidden"
                title="Go Home"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover/home:opacity-100 transition-opacity" />
                <Home className="h-6 w-6 group-hover/home:scale-110 transition-transform" />
                <span className="text-[8px] font-black uppercase tracking-tighter opacity-0 group-hover/home:opacity-60 transition-opacity">Home</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2026 Generative AI Assistant */}
      <AIAssistant />
    </div>
  );
}
