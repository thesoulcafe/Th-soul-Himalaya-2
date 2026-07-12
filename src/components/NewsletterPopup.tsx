import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, MapPin, Compass, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { SAMPLE_IMAGES } from './GalleryArchive';

export default function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSeen, setHasSeen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const popupState = sessionStorage.getItem('soulHimalayaNewsletterShown');
    const localState = localStorage.getItem('soulHimalayaNewsletter');

    if (popupState === 'true' || localState === 'subscribed' || localState === 'dismissed') {
      console.log("The Soul Himalaya: Newsletter popup already shown or dismissed in this session/device.");
      return;
    }

    console.log("The Soul Himalaya: Newsletter popup timer initialized (20 seconds)...");

    const timer = setTimeout(() => {
      setIsOpen(true);
      sessionStorage.setItem('soulHimalayaNewsletterShown', 'true');
      console.log("The Soul Himalaya: Newsletter popup triggered after 20 seconds!");
    }, 20000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setHasSeen(true);
    localStorage.setItem('soulHimalayaNewsletter', 'dismissed');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'newsletter_subscribers'), {
        email,
        subscribedAt: serverTimestamp(),
        source: 'popup'
      });
      
      toast.success("Welcome to the community! Your guide is on its way.");
      setIsOpen(false);
      setHasSeen(true);
      localStorage.setItem('soulHimalayaNewsletter', 'subscribed');
    } catch (error) {
      console.error("Error subscribing:", error);
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % SAMPLE_IMAGES.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + SAMPLE_IMAGES.length) % SAMPLE_IMAGES.length);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-[#FDFBF7] w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-y-auto max-h-[90vh] md:max-h-none md:overflow-visible relative flex flex-col md:flex-row"
          >
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 bg-forest/5 hover:bg-forest/10 rounded-full text-forest/60 hover:text-forest transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Image Side - Gallery */}
            <div className="hidden md:block md:w-5/12 h-64 md:h-auto relative overflow-hidden group">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={currentImageIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  src={SAMPLE_IMAGES[currentImageIndex].url} 
                  alt={SAMPLE_IMAGES[currentImageIndex].title || "Successful Traveller Gallery"} 
                  className="absolute inset-0 w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-forest/80 to-transparent" />
              
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button 
                  onClick={prevImage}
                  className="h-8 w-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button 
                  onClick={nextImage}
                  className="h-8 w-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <div className="absolute bottom-6 left-6 text-white max-w-[250px] z-10">
                <div className="flex items-center gap-2 text-sm font-bold mb-1 drop-shadow-md">
                  <MapPin className="h-4 w-4 text-terracotta" />
                  {SAMPLE_IMAGES[currentImageIndex].title}
                </div>
                <p className="text-xs text-white/90 font-medium italic drop-shadow-md line-clamp-2">"{SAMPLE_IMAGES[currentImageIndex].description}"</p>
              </div>
            </div>

            {/* Content Side */}
            <div className="w-full md:w-7/12 p-6 sm:p-8 md:p-12 flex flex-col justify-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-forest/5 mb-6 text-terracotta">
                <Compass className="h-6 w-6" />
              </div>
              
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-forest mb-4 leading-tight">
                Find Your Perfect <br className="hidden md:block"/> Retreat
              </h2>
              
              <p className="text-forest/70 mb-8 leading-relaxed">
                Join our community of mindful travelers. Subscribe to receive our exclusive PDF guide to offbeat treks, hidden cafes, and sustainable travel in the Himalayas.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address" 
                  required
                  className="flex-1 bg-white border border-forest/10 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-all text-forest placeholder:text-forest/40"
                />
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-forest hover:bg-forest/90 text-white rounded-xl px-8 py-6 h-auto"
                >
                  {isSubmitting ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Send Guide <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
              <p className="text-[10px] text-forest/40 mt-4 font-medium uppercase tracking-wider">
                We respect your privacy. No spam, just soulful stories.
              </p>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
