import React from 'react';
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
  selectedSlotIndex,
  onSelectSlot,
  onCustomize,
  title
}: SlotSelectionPopupProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] bg-white rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
        <div className="bg-forest p-8 text-white relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10">
            <Calendar className="h-32 w-32" />
          </div>
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-2xl font-heading font-bold text-white">Select a Slot</DialogTitle>
            <DialogDescription className="text-white/60">
              Choose your preferred dates for {title}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 space-y-4 max-h-[400px] overflow-y-auto">
          {slots.map((slot, i) => {
            const isSelected = selectedSlotIndex === i.toString();
            const startDate = new Date(slot.startDate);
            const endDate = new Date(slot.endDate);
            
            return (
              <button
                key={i}
                onClick={() => {
                  onSelectSlot(i.toString());
                  onClose();
                }}
                className={cn(
                  "w-full p-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between group",
                  isSelected 
                    ? "border-terracotta bg-terracotta/5 shadow-md" 
                    : "border-forest/5 bg-cream/30 hover:border-terracotta/30 hover:bg-white"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                    isSelected ? "bg-terracotta text-white" : "bg-forest/5 text-forest/40 group-hover:bg-terracotta/10 group-hover:text-terracotta"
                  )}>
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-forest">
                      {startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {endDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="text-[10px] text-forest/40 font-bold uppercase tracking-widest">
                      {slot.available !== false ? 'Available' : 'Limited Slots'}
                    </div>
                  </div>
                </div>
                {isSelected ? (
                  <CheckCircle2 className="h-5 w-5 text-terracotta" />
                ) : (
                  <ArrowRight className="h-4 w-4 text-forest/20 group-hover:text-terracotta transition-transform group-hover:translate-x-1" />
                )}
              </button>
            );
          })}
        </div>

        <div className="p-8 pt-0">
          <div className="bg-forest rounded-3xl p-6 text-white relative overflow-hidden group cursor-pointer" onClick={() => { onCustomize(); onClose(); }}>
            <div className="absolute -right-4 -bottom-4 opacity-10 transition-transform group-hover:scale-110">
              <Zap className="h-24 w-24" />
            </div>
            <div className="relative z-10">
              <h4 className="text-lg font-bold mb-1 flex items-center gap-2">
                Customize Trip <Zap className="h-4 w-4 text-terracotta" />
              </h4>
              <p className="text-white/60 text-xs mb-4">None of these work? Tell us your preferred dates and we'll craft a perfect trip for you.</p>
              <Button 
                className="w-full h-10 rounded-xl bg-terracotta hover:bg-terracotta/90 text-white font-bold border-none"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
