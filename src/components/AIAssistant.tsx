import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { MessageSquare, Send, X, Sparkles, Map, Calendar, ArrowRight, User, Bot, Flower2, Compass, Share2, Home as HomeIcon, Wind, Star, Clock, CheckCircle2, ShoppingBag, Edit2, Zap, Heart, MessageCircle } from 'lucide-react';
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
    try {
      const saved = typeof window !== 'undefined' ? sessionStorage.getItem(`activity_${key}`) : null;
      if (!saved) return initialState;
      return JSON.parse(saved);
    } catch (error) {
      console.error(`Failed to parse activity state for ${key}:`, error);
      return initialState;
    }
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`activity_${key}`, JSON.stringify(state));
      }
    } catch (error) {
      console.error(`Failed to save activity state for ${key}:`, error);
    }
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

  const FAQ_RESPONSES: Record<string, string> = {
    "What should I pack?": "For a Himalayan journey in 2026, we recommend: \n1. Layered clothing (Thermal, Fleece, Down Jacket)\n2. Sturdy trekking boots with good grip\n3. Personal first-aid kit and hydration bladder\n4. Power bank and universal adapter\n5. Sun protection (high SPF sunscreen, polarized glasses)",
    "Mobile connectivity?": "In Parvati Valley, BSNL and Jio offer the best coverage. Kasol and Tosh have decent 4G/5G, but expect signal drops during treks like Kheerganga. Most cafes now offer Starlink or localized high-speed fiber.",
    "Is solo trekking safe?": "Yes, but with caution. Major trails like Kheerganga are well-marked. However, for offbeat routes to Bunbuni or Pin Parvati, we strongly recommend a local Soul Guide. Always register your departure at the local check-post.",
    "How to handle cash?": "Carry sufficient cash. ATMs in Kasol/Manikaran are often out of service or have long queues. While many cafes now accept UPI, network issues can make digital payments unreliable in higher hamlets like Tosh or Grahan.",
    "Track my macrame order": "To track your artisanal macrame decor, please visit the 'Dashboard' section of your profile. Shipping usually takes 5-7 business days across India. For international orders, allow 14-21 days.",
    "Cancellation & Refund policy": "Packaged Tours: Full refund if cancelled 15 days before departure. 50% refund between 7-14 days. No refund within 7 days. \nProducts: 7-day return policy for unused items with original tags.",
    "How to book a customized trip?": "You can use our 'Tailor Made' page to build your own itinerary. Alternatively, message us on WhatsApp with your budget, group size, and preferred vibe, and a Soul Guide will assist you manually.",
    "Contact customer support": "Our Soul Guides are available 24/7 via WhatsApp at +91 7878200632. You can also email us at help@thesoulhimalaya.com for complex queries regarding bulk bookings.",
    "Check my booking status": "Access your 'Dashboard' to view real-time status of your expeditions. 'Confirmed' means logistics are locked. 'Pending' means our guides are verifying trail conditions.",
    "Payment options for tours": "We accept all major Credit/Debit cards, UPI, and Netbanking. For high-value expeditions, we offer 0% EMI options through our payment partners.",
    "Shipping time for products": "Artisanal products usually ship within 48 hours. Standard delivery: 3-5 days for metros, 5-10 days for other regions. All items are shipped in eco-friendly, plastic-free packaging.",
    "Group discount query": "We offer special rates for groups of 6 or more. Please use the WhatsApp button to connect with our logistics lead for a custom corporate or student group quote.",
    "Report a technical issue": "Namaste! If the path has bugs, please email tech@thesoulhimalaya.com with a screenshot. Our digital sherpas will fix the trail immediately.",
    "Talk to a human friend": "Sometimes a machine can't feel the mountains. Click the WhatsApp button below to speak directly with Rohit or Priya, our lead explorers on the ground."
  };

  const handleStarterClick = async (question: string) => {
    setShowStarters(false);
    
    // Check if we have a pre-generated answer
    if (FAQ_RESPONSES[question]) {
      const userMessage = { id: Date.now().toString(), role: 'user', content: question };
      const assistantMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: FAQ_RESPONSES[question] };
      setMessages(prev => [...prev, userMessage, assistantMessage]);
      return;
    }
    
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

    const userQuery = safeInput.trim();
    
    // SEO & Speed Optimization: Catch FAQ queries before calling API
    const matchedFaq = Object.keys(FAQ_RESPONSES).find(q => 
      userQuery.toLowerCase().includes(q.toLowerCase().replace('?', ''))
    );

    if (matchedFaq) {
      setInput('');
      const userMessage = { id: Date.now().toString(), role: 'user', content: userQuery };
      const assistantMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: FAQ_RESPONSES[matchedFaq] };
      setMessages(prev => [...prev, userMessage, assistantMessage]);
      return;
    }
    
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
                className="flex-1 p-6 overflow-y-auto space-y-6 no-scrollbar bg-cream/20"
                ref={scrollRef}
              >
                {/* Wisdom Repository & Soul Support Section */}
                <div className="space-y-6">
                  <div className="text-center mb-4">
                    <div className="flex items-center justify-center gap-2 text-terracotta mb-2">
                      <MessageCircle className="h-3 w-3" />
                      <span className="text-[8px] font-black uppercase tracking-[0.4em]">Wisdom Repository</span>
                    </div>
                    <h2 className="text-2xl font-playfair font-black italic text-forest uppercase tracking-tighter mb-2">Soul Support</h2>
                    <p className="text-forest/40 text-[9px] font-bold uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">
                      Decipher the mysteries of the valley through our curated frequently asked revelations.
                    </p>
                  </div>

                  {/* Strategic Portfolio Summary Quick Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { label: 'Market Segments', value: '06' },
                      { label: 'Strategic Packages', value: '40' },
                      { label: 'Adventure Rating', value: 'A+' },
                      { label: 'Wellness Focus', value: 'Deep' }
                    ].map(stat => (
                      <div key={stat.label} className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-forest/5 shadow-sm text-center">
                        <p className="text-[7px] font-bold uppercase tracking-[0.1em] text-forest/40 mb-0.5">{stat.label}</p>
                        <p className="text-lg font-heading font-black text-terracotta">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Quick FAQs as interactive bubbles */}
                  <div className="space-y-2">
                    {[
                      "What should I pack?", 
                      "Mobile connectivity?", 
                      "Is solo trekking safe?",
                      "How to handle cash?"
                    ].map((q, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleStarterClick(q)}
                        className="w-full text-left p-4 rounded-3xl bg-white border border-forest/5 shadow-sm hover:border-terracotta/30 transition-all group flex items-center justify-between"
                      >
                        <span className="text-xs font-bold text-forest group-hover:text-terracotta transition-colors">{q}</span>
                        <ArrowRight className="h-3 w-3 text-forest/20 group-hover:text-terracotta transition-all group-hover:translate-x-1" />
                      </button>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-forest/5">
                    <p className="text-[8px] text-center text-forest/30 font-black uppercase tracking-[0.3em] mb-4">Chat History</p>
                    {messages.map((m, idx) => (
                      <div 
                        key={m.id || idx} 
                        className={cn(
                          "mb-4 flex flex-col",
                          m.role === 'user' ? "items-end" : "items-start"
                        )}
                      >
                        <div className={cn(
                          "max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed",
                          m.role === 'user' 
                            ? "bg-forest text-white rounded-tr-none" 
                            : "bg-white text-forest rounded-tl-none border border-forest/5 shadow-sm"
                        )}>
                          {m.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white border-t border-forest/5 shrink-0 px-6 pb-10 md:pb-8">
                <Button 
                  className="w-full h-12 rounded-[2rem] bg-forest text-white hover:bg-terracotta transition-all"
                  onClick={() => window.open('https://wa.me/917878200632', '_blank')}
                >
                  Chat on WhatsApp
                </Button>
                <p className="mt-3 text-[9px] text-center text-forest/40 font-black uppercase tracking-[0.2em]">
                  Soul Himalaya Customer Support
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
