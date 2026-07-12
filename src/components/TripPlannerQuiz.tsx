import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Map, Mountain, Sunrise, Coffee, CloudRain, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

export default function TripPlannerQuiz({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = [
    {
      title: "What is your primary travel goal?",
      options: [
        { id: 'peace', label: 'Deep Peace & Meditation', icon: Sparkles },
        { id: 'adventure', label: 'Thrilling Mountain Treks', icon: Mountain },
        { id: 'workation', label: 'Scenic Workation', icon: Coffee },
        { id: 'culture', label: 'Local Culture & Food', icon: Heart }
      ]
    },
    {
      title: "Who are you traveling with?",
      options: [
        { id: 'solo', label: 'Solo Traveler', icon: Sunrise },
        { id: 'couple', label: 'Romantic Couple', icon: Heart },
        { id: 'friends', label: 'Group of Friends', icon: Map },
        { id: 'family', label: 'Family with Kids', icon: CloudRain }
      ]
    },
    {
      title: "How many days are you planning?",
      options: [
        { id: 'weekend', label: '2-3 Days (Weekend)', icon: Sunrise },
        { id: 'short', label: '4-7 Days', icon: Map },
        { id: 'long', label: '1-2 Weeks', icon: Sparkles },
        { id: 'nomad', label: '1 Month+ (Digital Nomad)', icon: Coffee }
      ]
    }
  ];

  const handleSelect = (optionId: string) => {
    setAnswers(prev => ({ ...prev, [step]: optionId }));
    setTimeout(() => {
      if (step < questions.length - 1) {
        setStep(step + 1);
      } else {
        setStep(questions.length); // email capture step
      }
    }, 400);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile || !email) return;
    setIsSubmitting(true);
    
    try {
      const getOptionLabel = (stepIdx: number, optId: string) => {
        const q = questions[stepIdx];
        const opt = q?.options.find(o => o.id === optId);
        return opt ? opt.label : optId;
      };

      const formattedMessage = `
**New Lead from Interactive Trip Planner Quiz!**

- **Primary Travel Goal:** ${getOptionLabel(0, answers[0])}
- **Traveling With:** ${getOptionLabel(1, answers[1])}
- **Planning Duration:** ${getOptionLabel(2, answers[2])}

User has requested their personalized itinerary on Mobile / WhatsApp: ${mobile}
Email: ${email}
      `.trim();

      // 1. Save lead to messages
      await addDoc(collection(db, 'messages'), {
        userId: auth.currentUser?.uid || null,
        userName: "Himalayan Explorer",
        userPhone: mobile,
        userEmail: email,
        subject: "New Trip Planner Quiz & Guide Lead",
        message: formattedMessage,
        status: 'unread',
        createdAt: serverTimestamp()
      });

      // 2. Save email to newsletter subscribers
      await addDoc(collection(db, 'newsletter_subscribers'), {
        email: email,
        subscribedAt: serverTimestamp(),
        source: 'combined_quiz'
      });

      setIsSubmitting(false);
      toast.success("Your personalized itinerary and Himalayan travel guide are on their way!");
      setTimeout(() => {
        onClose();
        // Reset state
        setTimeout(() => {
          setStep(0);
          setAnswers({});
          setMobile('');
          setEmail('');
        }, 500);
      }, 1000);
    } catch (error: any) {
      console.error("Failed to submit quiz lead:", error);
      toast.error("Failed to send submission. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-cream w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-forest/5 hover:bg-forest/10 rounded-full text-forest/60 hover:text-forest transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8 md:p-12">
          {/* Progress Bar */}
          <div className="flex gap-2 mb-8">
            {Array.from({ length: questions.length + 1 }).map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
                  idx <= step ? 'bg-terracotta' : 'bg-forest/10'
                }`}
              />
            ))}
          </div>

          <div className="min-h-[300px] flex flex-col justify-center relative">
            <AnimatePresence mode="wait">
              {step < questions.length ? (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-2xl md:text-3xl font-playfair font-bold text-forest mb-8 text-center">
                    {questions[step].title}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {questions[step].options.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = answers[step] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelect(opt.id)}
                          className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
                            isSelected 
                              ? 'border-terracotta bg-terracotta/5 text-forest scale-[0.98]' 
                              : 'border-forest/10 hover:border-terracotta/40 hover:bg-white text-forest/70 hover:text-forest'
                          }`}
                        >
                          <div className={`p-3 rounded-full ${isSelected ? 'bg-terracotta/20' : 'bg-forest/5'}`}>
                            <Icon className={`h-5 w-5 ${isSelected ? 'text-terracotta' : 'text-forest/60'}`} />
                          </div>
                          <span className="font-medium">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="mobile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-center max-w-md mx-auto"
                >
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-forest/5 mb-4 text-terracotta">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-playfair font-bold text-forest mb-2">
                    Your Personal Journey is Ready
                  </h3>
                  <p className="text-forest/70 mb-6 text-sm">
                    Enter your details below to receive your customized, hand-crafted itinerary on WhatsApp and our exclusive Himalayan PDF travel guide in your email inbox.
                  </p>
                  
                  <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-left">
                    <div>
                      <label className="block text-[11px] font-bold text-forest/60 mb-1 uppercase tracking-wider">Email Address</label>
                      <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@example.com"
                        required
                        className="w-full bg-white border border-forest/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-all text-forest"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-forest/60 mb-1 uppercase tracking-wider">Mobile / WhatsApp Number</label>
                      <input 
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="WhatsApp number with Country Code"
                        required
                        className="w-full bg-white border border-forest/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-all text-forest"
                      />
                    </div>
                    
                    <Button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-forest hover:bg-forest/90 text-white rounded-xl py-5 h-auto text-base font-semibold shadow-md hover:shadow-lg transition-all mt-3"
                    >
                      {isSubmitting ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                      ) : (
                        "Reveal My Journey & Get Guide"
                      )}
                    </Button>
                  </form>
                  <p className="text-[10px] text-forest/40 mt-4 font-semibold uppercase tracking-wider">
                    We respect your privacy. No spam, just pure adventure.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
