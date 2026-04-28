import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { MessageSquare, Send, X, Sparkles, Map, Calendar, ArrowRight, User, Bot, Flower2, Compass, Share2, Home as HomeIcon, Wind, Star, Clock, CheckCircle2, ShoppingBag, Edit2, Zap, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import { DEFAULT_TOURS } from '@/constants';
import { Link } from 'react-router-dom';
import { useCart } from '@/lib/CartContext';
import { toast } from 'sonner';

// Phase 3: React 2026 'Activity' hook simulation
// This hook preserves the chat history even if the component is visually hidden/unmounted in some flows.
function useActivityState<T>(key: string, initialState: T) {
  const [state, setState] = useState<T>(() => {
    const saved = sessionStorage.getItem(`activity_${key}`);
    return saved ? JSON.parse(saved) : initialState;
  });

  useEffect(() => {
    sessionStorage.setItem(`activity_${key}`, JSON.stringify(state));
  }, [key, state]);

  return [state, setState] as const;
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useActivityState('soul_guide_open', false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { profile } = useAuth();
  
  // Use stable state for starter questions
  const [showStarters, setShowStarters] = useState(true);

  // Manual chat state management for client-side Gemini
  const [messages, setMessages] = useActivityState<any[]>('soul_guide_messages', [
    { id: 'welcome', role: 'assistant', content: 'Namaste! I am your Soul Guide, here to assist you with customer care. How can I help you with your bookings, orders, or policies today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const { addToCart } = useCart();

  // Remove client-side GenAI initialization since we use the /api/chat server endpoint
  
  const append = async (message: { role: string; content: string }) => {
    const userMessage = { id: Date.now().toString(), ...message };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);
    setShowStarters(false);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({
            role: m.role,
            content: m.content,
            toolInvocations: m.toolInvocations
          })),
          profile
        })
      });

      if (!response.ok) throw new Error('Soul Guide connection failed');

      // Simple implementation for non-streaming UI integration or standard responses
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      
      // We'll create a temporary message for the stream
      const tempId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: tempId, role: 'assistant', content: '', toolInvocations: [] }]);

      while (true && reader) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        
        // Handle the Vercel AI SDK stream format (text chunks start with 0:)
        const lines = chunk.split('\n').filter(l => l.trim());
        for (const line of lines) {
          if (line.startsWith('0:')) {
            const textChunk = line.substring(2).replace(/^"(.*)"$/, '$1').replace(/\\n/g, '\n').replace(/\\"/g, '"');
            accumulatedText += textChunk;
            
            setMessages(prev => prev.map(m => 
              m.id === tempId ? { ...m, content: accumulatedText } : m
            ));
          } else if (line.startsWith('9:')) {
            // Tool call information
            try {
              const toolData = JSON.parse(line.substring(2));
              setMessages(prev => prev.map(m => 
                m.id === tempId ? { 
                  ...m, 
                  toolInvocations: [...(m.toolInvocations || []), {
                    state: 'result',
                    toolCallId: toolData.toolCallId,
                    toolName: toolData.toolName,
                    result: toolData.result
                  }] 
                } : m
              ));
            } catch (e) {
              console.error("Failed to parse tool data:", e);
            }
          }
        }
      }

      // Final cleanup and suggestion extraction (similar to before but adapted for API flow)
      const finalLines = accumulatedText.split('\n');
      const suggestions = finalLines
        .filter(l => l.startsWith('[SUGGESTION]'))
        .map(l => l.replace('[SUGGESTION]', '').trim());

      setMessages(prev => prev.map(m => 
        m.id === tempId ? { 
          ...m, 
          content: accumulatedText.split('\n').filter(l => !l.startsWith('[SUGGESTION]')).join('\n') 
        } : m
      ));

      if (suggestions.length > 0) {
        setSuggestedQuestions(suggestions);
      }
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, my spiritual connection is weak right now. Please try again later."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const currentInput = input;
    setInput('');
    await append({ role: 'user', content: currentInput });
  };

  // Extremely defensive check for input
  const safeInput = (input || '').toString();

  const ALL_STARTER_QUESTIONS = [
    { text: "Track my macrame order", icon: ShoppingBag },
    { text: "Cancellation & Refund policy", icon: CheckCircle2 },
    { text: "How to book a customized trip?", icon: Edit2 },
    { text: "Contact customer support", icon: MessageSquare },
    { text: "Check my booking status", icon: Clock },
    { text: "Payment options for tours", icon: Star },
    { text: "Shipping time for products", icon: Wind },
    { text: "Group discount query", icon: User },
    { text: "Report a technical issue", icon: Zap },
    { text: "Talk to a human friend", icon: Heart }
  ];

  const [currentStarters, setCurrentStarters] = useState(ALL_STARTER_QUESTIONS.slice(0, 4));

  // Rotate questions every time the chat is opened
  useEffect(() => {
    if (isOpen) {
      const shuffled = [...ALL_STARTER_QUESTIONS].sort(() => 0.5 - Math.random());
      setCurrentStarters(shuffled.slice(0, 4));
    }
  }, [isOpen]);

  const handleStarterClick = async (question: string) => {
    setShowStarters(false);
    
    // Use append if available (standard way for non-form triggers)
    if (typeof append === 'function') {
      try {
        await append({ role: 'user', content: question });
        return;
      } catch (err) {
        console.log("Append failed, attempting fallback:", err);
      }
    }

    // Fallback if append is missing or fails: 
    // Manually set input via handleInputChange or setInput and trigger handleSubmit
    if (typeof setInput === 'function') {
      setInput(question);
    } else if (typeof handleInputChange === 'function') {
      handleInputChange({ target: { value: question } } as any);
    }

    setTimeout(() => {
      if (typeof handleSubmit === 'function') {
        handleSubmit({ preventDefault: () => {} } as any);
      }
    }, 50);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    // Auto-hide starters if there's any user interaction
    if (messages.length > 1) {
      setShowStarters(false);
    }
  }, [messages]);

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!safeInput.trim() || isLoading) return;
    
    setShowStarters(false);
    try {
      await handleSubmit(e);
    } catch (err) {
      console.error("Chat submission failed:", err);
      // Fallback: if standard handleSubmit fails, try append
      append({
        role: 'user',
        content: safeInput
      });
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'The Soul Himalaya - Soul Guide',
      text: 'I am planning my Himalayan journey with the Soul Guide! Check it out.',
      url: window.location.origin
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Spirit Shared", {
          description: "Link copied to clipboard! Share it with your fellow explorers.",
        });
      }
    } catch (err) {
      console.log("Sharing failed:", err);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[100] flex flex-col items-end gap-3">
        <Button
          onClick={() => {
            const nextOpen = !isOpen;
            if (nextOpen) {
              // Reset chat when opening for a fresh experience
              setMessages([
                { id: 'welcome', role: 'assistant', content: 'Namaste! I am your Soul Guide, here to assist you with customer care. How can I help you with your bookings, orders, or policies today?' }
              ]);
              setShowStarters(true);
              setSuggestedQuestions([]);
              
              // Shuffle and select 4 random starter questions
              const shuffled = [...ALL_STARTER_QUESTIONS].sort(() => 0.5 - Math.random());
              setCurrentStarters(shuffled.slice(0, 4));
            }
            setIsOpen(nextOpen);
          }}
          className={cn(
            "h-14 w-14 md:h-16 md:w-16 rounded-full shadow-[0_20px_50px_rgba(242,_153,_74,_0.5)] transition-all duration-500 flex items-center justify-center preserve-3d group overflow-hidden border border-white/20",
            isOpen 
              ? "bg-linear-to-tr from-[#FF512F] to-[#DD2476] rotate-y-180 scale-110 shadow-magenta-500/40" 
              : "bg-linear-to-tr from-[#F2994A] via-[#F2C94C] to-[#F2994A] hover:scale-110 hover:-translate-y-2 hover:shadow-orange-500/40 shadow-orange-950/40"
          )}
        >
          {/* Animated Glow Effect */}
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
          
          <div className="relative h-full w-full flex items-center justify-center z-10">
            {isOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <MessageSquare className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
            )}
          </div>
          {!isOpen && (
            <div className="absolute -top-1 -right-1 z-20">
              <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
            </div>
          )}
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, rotateX: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20, rotateX: 10 }}
            className="fixed inset-0 md:inset-auto md:bottom-28 md:right-8 w-full md:w-[420px] h-full md:h-[650px] z-[100] md:rounded-[2.5rem] overflow-hidden perspective-1000"
          >
            <Card className="h-full border-none bg-white rounded-none md:rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl transform-gpu">
              <div className="p-6 bg-forest text-white flex items-center justify-between shrink-0 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                
                <div className="flex items-center gap-3 relative z-10">
                  <motion.div 
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    className="h-10 w-10 rounded-full bg-linear-to-tr from-white/20 to-white/5 flex items-center justify-center border border-white/20 shadow-lg"
                  >
                    <Bot className="h-6 w-6 text-terracotta" />
                  </motion.div>
                  <div>
                    <h3 className="font-heading font-bold text-lg">Soul Guide</h3>
                    <p className="text-[10px] text-white/50 uppercase tracking-widest font-black">Customer Care Support</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 relative z-10">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleShare}
                    className="text-white/50 hover:text-white hover:bg-white/10 rounded-full"
                    title="Share Guide"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsOpen(false)}
                    className="md:hidden text-white/50 hover:text-white rounded-full"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
              </div>

              <div 
                ref={scrollRef}
                className="flex-1 p-6 overflow-y-auto space-y-6 no-scrollbar bg-cream/20"
              >
                {messages.map((m: any, i: number) => (
                  <div key={m.id || i} className="space-y-4">
                    <motion.div 
                      className={cn("flex items-start gap-3", m.role === 'user' ? "flex-row-reverse" : "")}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <motion.div 
                        whileHover={{ scale: 1.1 }}
                        className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-md border border-white/20 transition-all",
                          m.role === 'user' 
                            ? "bg-linear-to-tr from-terracotta to-orange-400" 
                            : "bg-linear-to-tr from-forest to-emerald-800"
                        )}
                      >
                        {m.role === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-white" />}
                      </motion.div>
                      <div className={cn(
                        "max-w-[85%] p-4 rounded-3xl text-sm font-medium leading-relaxed shadow-sm",
                        m.role === 'user' 
                          ? "bg-forest text-white rounded-tr-none" 
                          : "bg-white text-forest rounded-tl-none border border-forest/5"
                      )}>
                        {m.content}
                        
                        {/* Generative UI Components */}
                        {m.toolInvocations?.map((ti: any) => {
                          if (ti.toolName === 'showTours' && ti.state === 'result') {
                            const filteredTours = DEFAULT_TOURS
                              .filter(t => ti.result.category === 'Recommended' || t.category === ti.result.category)
                              .slice(0, ti.result.limit || 3);

                            return (
                              <motion.div 
                                key={ti.toolCallId} 
                                className="mt-4 space-y-3"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                              >
                                <div className="flex items-center gap-2 text-terracotta mb-2">
                                  <Sparkles className="h-4 w-4" />
                                  <span className="font-bold uppercase text-[10px] tracking-widest">{ti.result.category} Journeys</span>
                                </div>
                                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
                                  {filteredTours.map((tour) => (
                                    <Card key={tour.id} className="min-w-[240px] max-w-[240px] shrink-0 overflow-hidden border-forest/5 shadow-md rounded-2xl group bg-white">
                                      <div className="relative h-28 overflow-hidden">
                                        <img src={tour.image} alt={tour.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                        <div className="absolute top-2 right-2 bg-forest text-white px-2 py-0.5 rounded-full font-bold text-[9px] shadow-lg">
                                          {tour.price}
                                        </div>
                                      </div>
                                      <div className="p-3 space-y-2">
                                        <h4 className="font-bold text-xs text-forest line-clamp-1">{tour.title}</h4>
                                        <div className="flex items-center justify-between text-[9px] text-forest/50 font-bold uppercase">
                                          <div className="flex items-center gap-1">
                                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                            {tour.rating}
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3 text-terracotta" />
                                            {tour.duration}
                                          </div>
                                        </div>
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className="w-full h-8 rounded-full border-forest/10 text-[9px] font-black uppercase tracking-widest hover:bg-forest hover:text-white"
                                          onClick={() => append({ role: 'user', content: `Tell me more about the ${tour.title}` })}
                                        >
                                          View Details
                                        </Button>
                                      </div>
                                    </Card>
                                  ))}
                                </div>
                              </motion.div>
                            );
                          }

                          if (ti.toolName === 'bookingCalendar' && ti.state === 'result') {
                            const tour = DEFAULT_TOURS.find(t => t.id === ti.result.tourId);
                            // Simulating slots since we don't have a real DB trigger here for this specific demo
                            const fakeSlots = [
                              { start: '10 Jun', end: '15 Jun' },
                              { start: '20 Jun', end: '25 Jun' },
                              { start: '05 Jul', end: '10 Jul' }
                            ];

                            return (
                              <motion.div 
                                key={ti.toolCallId} 
                                className="mt-4 p-4 bg-forest rounded-2xl border border-white/10 space-y-4 shadow-xl"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                              >
                                <div className="flex items-center gap-2 text-white">
                                  <Calendar className="h-4 w-4 text-terracotta" />
                                  <span className="font-bold uppercase text-[10px] tracking-widest">Select Your Dates</span>
                                </div>
                                <div className="space-y-2">
                                  {fakeSlots.map((slot, idx) => (
                                    <button 
                                      key={idx}
                                      onClick={() => {
                                        if (tour) {
                                          addToCart({
                                            id: `${tour.id}-chat-slot-${idx}`,
                                            name: tour.title,
                                            price: tour.price,
                                            type: 'Tour',
                                            image: tour.image,
                                            dateRange: `${slot.start} to ${slot.end} 2026`
                                          });
                                          append({ role: 'assistant', content: `Great choice! I have added the ${tour.title} for ${slot.start}-${slot.end} to your Soul Cart. Would you like to proceed to checkout or look for something else?` });
                                        }
                                      }}
                                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white hover:text-forest transition-all text-white text-xs font-bold flex justify-between items-center group"
                                    >
                                      <span>{slot.start} - {slot.end}, 2026</span>
                                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                  ))}
                                </div>
                                <p className="text-[9px] text-white/40 font-bold uppercase text-center tracking-widest">
                                  Secure Booking via Soul Guide
                                </p>
                              </motion.div>
                            );
                          }

                          if (ti.toolName === 'showItinerary' && ti.state === 'result') {
                            return (
                              <motion.div 
                                key={ti.toolCallId} 
                                className="mt-4 p-4 bg-cream rounded-2xl border border-terracotta/20 space-y-3 shadow-inner"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                              >
                                <div className="flex items-center gap-2 text-terracotta">
                                  <div className="p-1.5 rounded-lg bg-terracotta/10">
                                    <Map className="h-4 w-4" />
                                  </div>
                                  <span className="font-bold uppercase text-[10px] tracking-widest">Custom Itinerary: {ti.result.place}</span>
                                </div>
                                <p className="text-xs text-forest/80 font-semibold tracking-tight">Planning a {ti.result.days}-day soul journey through {ti.result.place}...</p>
                                <Button variant="outline" size="sm" className="w-full rounded-full border-terracotta/30 text-terracotta text-[10px] font-black uppercase hover:bg-terracotta hover:text-white transition-all shadow-sm">
                                  View Details <ArrowRight className="h-3 w-3 ml-2" />
                                </Button>
                              </motion.div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </motion.div>
                  </div>
                ))}

                {/* Show starter or suggested questions */}
                {(showStarters || suggestedQuestions.length > 0) && (
                  <div className="grid grid-cols-1 gap-2 p-2">
                    {(suggestedQuestions.length > 0 ? suggestedQuestions.map(q => ({ text: q, icon: Sparkles })) : currentStarters).map((sq, si) => (
                      <motion.button
                        key={si}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: si * 0.1 }}
                        onClick={() => handleStarterClick(sq.text)}
                        className="flex items-center gap-3 p-3 text-left rounded-2xl bg-white border border-forest/5 hover:border-terracotta/40 hover:bg-cream/50 transition-all group shadow-sm active:scale-95"
                      >
                        <div className="p-2 mr-1 rounded-xl bg-linear-to-br from-forest/5 to-forest/10 text-forest group-hover:from-terracotta/20 group-hover:to-terracotta/40 group-hover:text-terracotta transition-all duration-300 group-hover:scale-110 shadow-inner">
                          <sq.icon className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-bold text-forest/80 line-clamp-2">{sq.text}</span>
                        <ArrowRight className="h-3 w-3 ml-auto text-terracotta opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.button>
                    ))}
                  </div>
                )}
                
                {isLoading && (
                  <div className="flex items-start gap-3">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="h-8 w-8 rounded-full bg-linear-to-tr from-forest to-emerald-800 flex items-center justify-center shadow-md border border-white/20"
                    >
                      <Bot className="h-4 w-4 text-white" />
                    </motion.div>
                    <div className="p-4 bg-white rounded-3xl rounded-tl-none border border-forest/5 shadow-sm min-w-[60px]">
                      <div className="flex gap-1.5">
                        <div className="h-2 w-2 bg-terracotta rounded-full animate-bounce" />
                        <div className="h-2 w-2 bg-terracotta rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="h-2 w-2 bg-terracotta rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-white border-t border-forest/5 shrink-0 px-6 pb-10 md:pb-8">
                <form 
                  onSubmit={onFormSubmit}
                  className="relative group/form"
                >
                  <input
                    value={safeInput}
                    onChange={handleInputChange}
                    placeholder="Ask your Soul Guide anything..."
                    className="w-full pl-6 pr-20 py-5 bg-forest/[0.03] rounded-[2rem] text-sm font-medium text-forest placeholder:text-forest/30 focus:outline-none focus:ring-4 focus:ring-terracotta/10 transition-all border-2 border-forest/5 focus:border-terracotta/30 shadow-inner"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {safeInput.trim() && (
                      <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        type="submit"
                        disabled={isLoading}
                        className="h-12 w-12 rounded-full bg-forest text-white flex items-center justify-center hover:bg-terracotta transition-all shadow-xl active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                      >
                        <Send className={cn("h-5 w-5 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1", isLoading && "animate-pulse")} />
                      </motion.button>
                    )}
                  </div>
                </form>
                <p className="mt-3 text-[9px] text-center text-forest/40 font-black uppercase tracking-[0.2em]">
                  Soul Himalaya Intelligence System
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
