import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Slot {
  startDate: string;
  endDate: string;
  available?: boolean;
}

interface SlotSelectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  slots: Slot[];
  selectedSlotIndex: string | undefined;
  onSelectSlot: (index: string) => void;
  onCustomize: () => void;
  title: string;
}

export default function SlotSelectionPopup({
  isOpen,
  onClose,
  slots,
  selectedSlotIndex: initialSelectedSlotIndex,
  onSelectSlot,
  onCustomize,
  title
}: SlotSelectionPopupProps) {
  const [localSelectedIndex, setLocalSelectedIndex] = useState<string | undefined>(initialSelectedSlotIndex);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed bottom-0 sm:bottom-auto sm:top-1/2 left-1/2 -translate-x-1/2 sm:-translate-y-1/2 w-full sm:max-w-[540px] bg-[#FAF9F6] rounded-t-[2.5rem] sm:rounded-[3rem] border-none shadow-[0_-20px_100px_rgba(45,62,53,0.3)] p-0 flex flex-col max-h-[92vh] focus-visible:outline-none focus:outline-none overflow-hidden overscroll-behavior-contain transition-all duration-500">
        
        {/* Main Scroll Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative min-h-0">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none grayscale invert" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")' }} />

          {/* Header Section */}
          <div className="bg-forest p-6 sm:p-12 text-white relative overflow-hidden shrink-0">
            {/* Decorative Elements */}
            <div className="absolute -right-10 -top-10 opacity-10 blur-2xl">
              <Calendar className="h-32 w-32 sm:h-64 sm:w-64" />
            </div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10"
            >
              <span className="font-fluid text-lg sm:text-2xl text-terracotta mb-0 sm:mb-2 block">Choose your Path</span>
              <DialogTitle className="text-xl sm:text-3xl font-playfair font-black italic tracking-tight text-white mb-1 sm:mb-2">{title}</DialogTitle>
              <DialogDescription className="text-white/50 text-[9px] sm:text-xs font-bold uppercase tracking-widest leading-tight max-w-[240px] sm:max-w-none">
                Seize the Moment. Selective departures.
              </DialogDescription>
            </motion.div>
          </div>

          {/* Body Content */}
          <div className="px-6 sm:px-10 py-6 space-y-4 bg-white/40">
            <div className="grid grid-cols-1 gap-4">
              {slots.map((slot, i) => {
                const isSelected = localSelectedIndex === i.toString();
                const startDate = new Date(slot.startDate);
                const endDate = new Date(slot.endDate);
                
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setLocalSelectedIndex(i.toString())}
                    className={cn(
                      "w-full p-5 rounded-[1.5rem] border-2 transition-all duration-500 flex items-center justify-between group relative overflow-hidden cursor-pointer",
                      isSelected 
                        ? "border-terracotta bg-white shadow-xl scale-[1.02]" 
                        : "border-forest/5 bg-white hover:border-terracotta/30"
                    )}
                  >
                    {isSelected && (
                      <motion.div 
                        layoutId="active-bg"
                        className="absolute inset-0 bg-terracotta/[0.03] pointer-events-none" 
                      />
                    )}
                    
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-500",
                        isSelected ? "bg-terracotta text-white shadow-lg shadow-terracotta/20 rotate-6" : "bg-forest/5 text-forest/20 group-hover:bg-terracotta/10 group-hover:text-terracotta"
                      )}>
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-black text-forest tracking-tight">
                          {startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} — {endDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div className={cn(
                          "text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5",
                          isSelected ? "text-terracotta" : "text-forest/30"
                        )}>
                          {slot.available !== false ? 'Available Seat' : 'Last few spots'}
                        </div>
                      </div>
                    </div>
                    {isSelected ? (
                      <div className="bg-terracotta p-1 rounded-full text-white shadow-lg shadow-terracotta/20">
                        <CheckCircle2 className="h-3 w-3" />
                      </div>
                    ) : (
                      <div className="bg-forest/5 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                        <ArrowRight className="h-3 w-3 text-terracotta" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Confirm Selection Button */}
            <div className="pt-2">
              <Button 
                disabled={localSelectedIndex === undefined}
                onClick={() => {
                  if (localSelectedIndex !== undefined) {
                    onSelectSlot(localSelectedIndex);
                  }
                }}
                className={cn(
                  "w-full h-14 rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.3em] transition-all duration-500 shadow-xl",
                  localSelectedIndex === undefined
                    ? "bg-forest/10 text-forest/30 cursor-not-allowed"
                    : "bg-forest hover:bg-forest/90 text-white shadow-forest/20 hover:scale-[1.02] active:scale-95"
                )}
              >
                Confirm Path Selection
                <ArrowRight className="ml-3 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Customize Section - Now part of scrollable content */}
          <div className="px-6 sm:px-10 py-6 border-t border-forest/5 bg-white/60 mb-12 sm:mb-0">
            <motion.div 
              whileHover={{ y: -3 }}
              className="bg-forest/[0.03] border border-forest/10 rounded-[2rem] p-6 text-forest relative overflow-hidden group cursor-pointer" 
              onClick={() => { onCustomize(); onClose(); }}
            >
              <div className="absolute -right-6 -bottom-6 opacity-[0.05] transition-transform group-hover:scale-125 duration-700">
                <Zap className="h-24 w-24" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-fluid text-xl text-terracotta">Custom Path</span>
                  <div className="h-px flex-grow bg-forest/5" />
                </div>
                <p className="text-forest/50 text-[9px] uppercase font-bold tracking-[0.15em] mb-4 leading-relaxed">
                  Dates don't align? Let us weave a journey unique to your rhythm.
                </p>
                <div className="w-full h-12 bg-forest rounded-full flex items-center justify-center text-white font-black text-[9px] uppercase tracking-[0.3em] shadow-xl group-hover:bg-forest/90 transition-all">
                  Craft My Journey
                  <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-2" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

