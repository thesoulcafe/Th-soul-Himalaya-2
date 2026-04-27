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
      <DialogContent className="w-[95vw] sm:max-w-[540px] bg-[#FAF9F6] rounded-[2rem] sm:rounded-[3rem] border-none shadow-[0_0_100px_rgba(45,62,53,0.3)] p-0 overflow-y-auto max-h-[92vh] sm:max-h-[90vh] custom-scrollbar relative block focus-visible:outline-none">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none grayscale invert" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")' }} />

        {/* Header Section */}
        <div className="bg-forest p-8 sm:p-12 text-white relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute -right-10 -top-10 opacity-10 blur-2xl">
            <Calendar className="h-48 w-48 sm:h-64 sm:w-64" />
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10"
          >
            <span className="font-fluid text-xl sm:text-2xl text-terracotta mb-1 sm:mb-2 block">Choose your Path</span>
            <DialogTitle className="text-2xl sm:text-3xl font-playfair font-black italic tracking-tight text-white mb-2">{title}</DialogTitle>
            <DialogDescription className="text-white/50 text-[10px] sm:text-xs font-bold uppercase tracking-widest leading-loose max-w-[280px] sm:max-w-none">
              Seize the Moment. Selective departures.
            </DialogDescription>
          </motion.div>
        </div>

        {/* Slots List */}
        <div className="p-6 sm:p-10 space-y-4 bg-white/40">
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
                    "w-full p-6 rounded-[2rem] border-2 transition-all duration-500 flex items-center justify-between group relative overflow-hidden cursor-pointer",
                    isSelected 
                      ? "border-terracotta bg-white shadow-xl scale-[1.02]" 
                      : "border-forest/5 bg-white/40 hover:border-terracotta/30 hover:bg-white"
                  )}
                >
                  {isSelected && (
                    <motion.div 
                      layoutId="active-bg"
                      className="absolute inset-0 bg-terracotta/[0.03] pointer-events-none" 
                    />
                  )}
                  
                  <div className="flex items-center gap-6 relative z-10">
                    <div className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500",
                      isSelected ? "bg-terracotta text-white shadow-lg shadow-terracotta/20 rotate-6" : "bg-forest/5 text-forest/20 group-hover:bg-terracotta/10 group-hover:text-terracotta group-hover:rotate-6"
                    )}>
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-black text-forest tracking-tight">
                        {startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} — {endDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div className={cn(
                        "text-[9px] font-bold uppercase tracking-[0.2em] mt-1",
                        isSelected ? "text-terracotta" : "text-forest/30"
                      )}>
                        {slot.available !== false ? 'Available Seat' : 'Last few spots'}
                      </div>
                    </div>
                  </div>
                  {isSelected ? (
                    <div className="bg-terracotta p-1.5 rounded-full text-white shadow-lg shadow-terracotta/20">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="bg-forest/5 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <ArrowRight className="h-4 w-4 text-terracotta" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Confirm Selection Button */}
          <div className="pt-4">
            <Button 
              disabled={localSelectedIndex === undefined}
              onClick={() => {
                if (localSelectedIndex !== undefined) {
                  onSelectSlot(localSelectedIndex);
                }
              }}
              className={cn(
                "w-full h-16 rounded-[1.5rem] font-black text-[12px] uppercase tracking-[0.3em] transition-all duration-500 shadow-xl",
                localSelectedIndex === undefined
                  ? "bg-forest/10 text-forest/30 cursor-not-allowed"
                  : "bg-forest hover:bg-forest/90 text-white shadow-forest/20 hover:scale-[1.02] active:scale-95"
              )}
            >
              Confirm Path Selection
              <ArrowRight className="ml-3 h-4 w-4" />
            </Button>
            {localSelectedIndex === undefined && (
              <p className="text-center text-[9px] font-bold text-forest/20 uppercase tracking-widest mt-3">
                Please select a date to proceed
              </p>
            )}
          </div>
        </div>

        {/* Customize Section */}
        <div className="p-6 sm:p-10 border-t border-forest/5">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-forest/[0.03] border border-forest/10 rounded-[2.5rem] p-8 text-forest relative overflow-hidden group cursor-pointer" 
            onClick={() => { onCustomize(); onClose(); }}
          >
            <div className="absolute -right-6 -bottom-6 opacity-[0.05] transition-transform group-hover:scale-125 duration-700">
              <Zap className="h-32 w-32" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-fluid text-2xl text-terracotta">Custom Path</span>
                <div className="h-px flex-grow bg-forest/5" />
              </div>
              <p className="text-forest/50 text-[10px] uppercase font-bold tracking-[0.15em] mb-6 leading-relaxed">
                Dates don't align? Let us weave a journey unique to your rhythm.
              </p>
              <div className="w-full h-14 bg-forest rounded-full flex items-center justify-center text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl group-hover:bg-forest/90 transition-all">
                Craft My Journey
                <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-2" />
              </div>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

