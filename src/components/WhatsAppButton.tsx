import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const phoneNumber = "917878200632"; // The Soul Himalaya number
  const prefilledMessage = encodeURIComponent("Namaste! I'd like to know more about the soulful retreats and treks in Parvati Valley.");

  return (
    <div className="fixed bottom-8 right-8 z-[110] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 bg-white/95 backdrop-blur-md border border-forest/10 p-5 rounded-3xl shadow-2xl w-72"
          >
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-playfair font-bold text-forest text-lg">Connect with us</h4>
              <button onClick={() => setIsOpen(false)} className="text-forest/50 hover:text-forest">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-forest/70 text-sm mb-4">
              Need help planning your Parvati Valley adventure? Chat directly with our local experts.
            </p>
            <a 
              href={`https://wa.me/${phoneNumber}?text=${prefilledMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 px-4 rounded-xl font-medium hover:bg-[#128C7E] transition-colors shadow-lg hover:shadow-xl"
            >
              <MessageCircle className="h-5 w-5" />
              Chat on WhatsApp
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "h-16 w-16 rounded-full flex items-center justify-center text-white shadow-[0_10px_30px_rgba(37,211,102,0.4)] transition-colors relative z-10",
          isOpen ? "bg-forest hover:bg-forest/90" : "bg-[#25D366] hover:bg-[#128C7E]"
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="h-8 w-8" />
            </motion.div>
          ) : (
            <motion.div
              key="whatsapp"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageCircle className="h-8 w-8" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
