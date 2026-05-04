import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams } from 'react-router-dom';
import Fuse from 'fuse.js';
import { REGIONAL_GUIDE } from '@/constants';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { 
  MapPin, 
  Clock, 
  Router, 
  Wallet, 
  Sun, 
  CloudRain, 
  Snowflake, 
  ArrowRight,
  Search,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Info,
  PhoneCall,
  MessageSquare,
  Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const DEFAULT_FAQS = [
  {
    question: "What should I pack for my Parvati Valley expedition?",
    answer: "Pack layered clothing, sturdy trekking boots, a raincoat (even in summer), a power bank, and a basic medical kit. Don't forget your spirit of adventure!",
    category: "Preparation"
  },
  {
    question: "Is there mobile connectivity in the higher villages like Tosh or Pulga?",
    answer: "Jio and Airtel work reasonably well in Kasol and Tosh. However, in Pulga and Kalga, connectivity can be spotty. BSNL is your best bet for remote locations.",
    category: "Logistics"
  },
  {
    question: "How do I handle cash requirements in the mountains?",
    answer: "ATMs are available in Kasol and Manikaran, but they often run out of cash or have long queues. We strongly recommend carrying enough physical cash from Bhuntar or Kullu.",
    category: "Logistics"
  },
  {
    question: "Is it safe to trek solo in Parvati Valley?",
    answer: "While main trails are generally safe, we recommend hiring a local Soul Guide for offbeat routes. Always inform your base camp or hostel about your planned path and expected return time.",
    category: "Safety"
  },
  {
    question: "What is the best time for the Kheerganga trek?",
    answer: "April to June and September to November are ideal. Winters see heavy snow, making the trail challenging but magical for experienced trekkers.",
    category: "Adventure"
  },
  {
    question: "Are there medical facilities available in the valley?",
    answer: "Basic clinics are available in Kasol and Manikaran. For anything serious, the nearest major hospital is in Kullu, which is about 2-3 hours away.",
    category: "Safety"
  }
];

export default function Guide() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [dbFaqs, setDbFaqs] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'content'), where('type', '==', 'faq'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data().data
      }));
      setDbFaqs(items);
    }, (error) => {
      console.error("Guide FAQ content snapshot failed:", error);
    });
    return () => unsubscribe();
  }, []);

  const faqs = useMemo(() => {
    if (dbFaqs.length > 0) return dbFaqs;
    return DEFAULT_FAQS;
  }, [dbFaqs]);

  const fuse = useMemo(() => {
    return new Fuse(faqs, {
      keys: ['question', 'answer', 'category'],
      threshold: 0.3,
      includeMatches: true
    });
  }, [faqs]);

  const filteredFaqs = useMemo(() => {
    if (!searchQuery) return faqs;
    const results = fuse.search(searchQuery);
    return results.map(r => ({
      ...r.item,
      matches: r.matches
    }));
  }, [fuse, searchQuery, faqs]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setSearchQuery(q);
      // If there's a specific query, maybe expand the first matching FAQ
      if (filteredFaqs.length > 0) {
        setExpandedIndex(0);
      }
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-cream pb-32 font-sans">
      {/* Hero Section */}
      <section className="relative h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1920&q=80" 
            alt="Parvati Valley Landscape" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-forest/40 backdrop-blur-[2px]" />
        </div>
        <div className="relative z-10 text-center px-4 md:px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-terracotta text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-4 md:mb-6 shadow-lg">
              Soul Support
            </span>
            <h1 className="text-2xl sm:text-4xl md:text-7xl font-heading font-bold text-white mb-4 md:mb-6 leading-tight">
              The Soul Guide <br className="hidden md:block" /> & <span className="text-white/80 italic">Regional Intelligence</span>
            </h1>
            <p className="text-sm md:text-lg text-white/80 font-medium max-w-2xl mx-auto leading-relaxed">
              Your spiritual compass for the Kullu-Parvati-Manali corridor. Expert logistical insights and regional mapping for the conscious traveler.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 md:px-6 -mt-10 md:-mt-20 relative z-20">
        {/* Universal Search bar for Guide/FAQ */}
        <div className="mb-12 md:mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="relative group">
              <div className="absolute left-10 top-1/2 -translate-y-1/2 text-terracotta/20 group-focus-within:text-terracotta/60 transition-colors">
                <Search className="h-5 w-5 stroke-[1.5px]" />
              </div>
              <input 
                type="text" 
                placeholder="How can we help your soul today?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-20 bg-white/80 backdrop-blur-xl rounded-full pl-20 pr-8 text-lg font-medium text-forest placeholder:text-forest/20 shadow-xl shadow-forest/[0.03] focus:outline-none focus:ring-4 focus:ring-terracotta/5 border border-forest/[0.05] focus:border-terracotta/20 transition-all text-center md:text-left"
              />
              <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden sm:block">
                <span className="text-[10px] font-bold text-forest/20 uppercase tracking-[0.3em]">
                  Soul Intelligence
                </span>
              </div>
            </div>
            
            <AnimatePresence>
              {searchQuery && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="mt-6 flex flex-wrap justify-center md:justify-start gap-3 px-8"
                >
                  <span className="text-[9px] font-bold text-forest/30 uppercase tracking-[0.2em] mr-2 py-1">Common Inquiries:</span>
                  {['Connectivity', 'Safety', 'Kheerganga', 'ATMs'].map(tag => (
                    <button 
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="text-[9px] font-bold text-terracotta/60 hover:text-terracotta uppercase tracking-[0.2em] bg-terracotta/[0.03] px-4 py-1.5 rounded-full border border-terracotta/[0.05] transition-all hover:bg-terracotta/[0.06]"
                    >
                      {tag}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Transit Matrix */}
        <section className="bg-white rounded-[1.5rem] md:rounded-[3rem] shadow-2xl shadow-forest/5 p-5 md:p-16 mb-8 md:mb-20 border border-forest/5 overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-4">
            <div>
              <h2 className="text-xl md:text-3xl font-heading font-bold text-forest mb-1 md:mb-2">Mountain Logistics</h2>
              <p className="text-forest/40 text-[9px] md:text-sm font-medium uppercase tracking-widest leading-relaxed">Seasonal Accessibility & Spiritual Foundation</p>
            </div>
            <div className="flex items-center gap-2 md:gap-3 px-3 py-1.5 md:px-4 md:py-2 bg-forest/5 rounded-2xl border border-forest/10">
              <Clock className="h-3 w-3 md:h-5 md:w-5 text-forest/40" />
              <span className="text-[9px] md:text-sm font-bold text-forest whitespace-nowrap">Updated: April 2026</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-16">
            <div className="space-y-3 md:space-y-8">
              {REGIONAL_GUIDE.transit.map((item, index) => (
                <motion.div 
                  key={item.segment}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative flex items-center justify-between p-4 md:p-6 rounded-2xl md:rounded-3xl bg-forest/[0.02] border border-forest/5 hover:bg-forest hover:border-forest transition-all duration-500 cursor-default"
                >
                  <div className="flex gap-3 md:gap-4 items-center">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-forest/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                      <MapPin className="h-4 w-4 md:h-5 md:w-5 text-forest group-hover:text-white" />
                    </div>
                    <div>
                      <h4 className="text-xs md:text-sm font-bold text-forest group-hover:text-white transition-colors">{item.segment}</h4>
                      <p className="text-[9px] md:text-[11px] text-forest/40 font-bold group-hover:text-white/60 transition-colors uppercase tracking-tight">{item.mode}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs md:text-sm font-mono font-bold text-forest group-hover:text-white transition-colors tracking-tighter">{item.distance}</p>
                    <p className="text-[9px] md:text-[11px] text-terracotta font-bold group-hover:text-white/80 transition-colors italic">~ {item.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="space-y-6 md:space-y-12">
              <div className="p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] bg-terracotta/5 border border-terracotta/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 md:p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <Wallet className="h-20 w-20 md:h-32 md:w-32" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-forest mb-2 md:mb-4">Financial Infrastructure</h3>
                <p className="text-forest/60 text-xs md:text-sm leading-relaxed mb-4 md:mb-6 font-medium">
                  {REGIONAL_GUIDE.infrastructure.atm}
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="rounded-full border-terracotta/20 text-terracotta bg-white px-3 py-0.5 text-[9px] md:text-[10px]">Carry Cash</Badge>
                  <Badge variant="outline" className="rounded-full border-terracotta/20 text-terracotta bg-white px-3 py-0.5 text-[9px] md:text-[10px]">ATM: Kasol/Manikaran</Badge>
                </div>
              </div>

              <div className="p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] bg-forest/5 border border-forest/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 md:p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <Router className="h-20 w-20 md:h-32 md:w-32" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-forest mb-2 md:mb-4">Digital Backbone</h3>
                <p className="text-forest/60 text-xs md:text-sm leading-relaxed mb-4 md:mb-6 font-medium">
                  {REGIONAL_GUIDE.infrastructure.connectivity}
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="rounded-full border-forest/20 text-forest bg-white px-3 py-0.5 text-[9px] md:text-[10px]">Jio/Airtel: Main Hubs</Badge>
                  <Badge variant="outline" className="rounded-full border-forest/20 text-forest bg-white px-3 py-0.5 text-[9px] md:text-[10px]">BSNL: Remote Hamlets</Badge>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seasonal Matrix */}
        <section className="mb-12 md:mb-20">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-forest mb-2 md:mb-4">Seasonal Wisdom Matrix</h2>
            <p className="text-forest/40 text-[10px] md:text-sm font-bold uppercase tracking-[0.2em]">Regional Viability & Natural Cycles</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              { 
                season: 'Summer (Mar-Jun)', 
                temp: '20°C - 25°C', 
                icon: Sun, 
                desc: REGIONAL_GUIDE.infrastructure.seasonal.summer,
                advice: 'Optimal for all trekking routes. Highly recommended for adventure seekers.',
                color: 'bg-amber-500'
              },
              { 
                season: 'Monsoon (Jul-Sep)', 
                temp: 'Risk Zone', 
                icon: CloudRain, 
                desc: REGIONAL_GUIDE.infrastructure.seasonal.monsoon,
                advice: 'Road closures frequent on Bhuntar-Manikaran axis. Robust contingency required.',
                color: 'bg-indigo-500'
              },
              { 
                season: 'Winter (Dec-Feb)', 
                temp: 'Snowscape', 
                icon: Snowflake, 
                desc: REGIONAL_GUIDE.infrastructure.seasonal.winter,
                advice: 'Snow beyond Barshaini. Advise high-quality thermal layers for all guests.',
                color: 'bg-sky-400'
              }
            ].map((item, index) => (
              <motion.div
                key={item.season}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="group p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] bg-white border border-forest/5 hover:shadow-2xl hover:shadow-forest/5 transition-all duration-500 flex flex-col items-center text-center"
              >
                <div className={cn("h-16 w-16 md:h-20 md:w-20 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center mb-6 md:mb-8 transform -rotate-12 group-hover:rotate-0 transition-all duration-500 shadow-lg shadow-forest/5", item.color)}>
                  <item.icon className="h-8 w-8 md:h-10 md:w-10 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-heading font-bold text-forest mb-1 md:mb-2">{item.season}</h3>
                <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest text-terracotta mb-4 md:mb-6">{item.temp}</span>
                <p className="text-forest/60 text-xs md:text-sm font-medium leading-relaxed mb-6">
                  {item.desc}
                </p>
                <div className="mt-auto pt-4 md:pt-6 border-t border-forest/5 w-full">
                  <p className="text-[10px] md:text-[11px] italic font-medium text-forest/40">
                    "{item.advice}"
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ & Search Section */}
        <section className="mb-20">
          <div className="bg-white rounded-[3rem] shadow-2xl shadow-forest/5 p-8 md:p-16 border border-forest/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
              <HelpCircle className="h-64 w-64 text-forest" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-2 text-terracotta mb-4">
                  <MessageCircle className="h-5 w-5 stroke-[1.5px]" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.4em]">Wisdom Repository</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-playfair font-black text-forest uppercase tracking-tighter mb-4 italic">Soul Support</h2>
                <p className="text-forest/40 text-[10px] font-bold uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed">
                  Decipher the mysteries of the valley through our curated frequently asked revelations.
                </p>
              </div>

              {/* FAQ List */}
              <div className="relative space-y-4">
                <AnimatePresence mode="popLayout">
                  {filteredFaqs.map((faq, index) => {
                    const highlightText = (text: string, matches?: any[], key?: string) => {
                      if (!searchQuery || !matches) return text;
                      const match = matches.find(m => m.key === key);
                      if (!match) return text;

                      let result = [];
                      let lastIndex = 0;
                      
                      // Fuse.js matches are [start, end] pairs
                      const indices = [...match.indices].sort((a, b) => a[0] - b[0]);
                      
                      indices.forEach(([start, end], i) => {
                        result.push(text.slice(lastIndex, start));
                        result.push(<span key={i} className="bg-terracotta/10 text-terracotta px-0.5 rounded-sm">{text.slice(start, end + 1)}</span>);
                        lastIndex = end + 1;
                      });
                      result.push(text.slice(lastIndex));
                      return result;
                    };

                    return (
                      <motion.div
                        key={faq.id || faq.question}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="border-b border-forest/[0.03] last:border-none"
                      >
                        <button 
                          onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                          className="w-full py-6 flex items-center justify-between text-left group"
                        >
                          <div className="flex items-center gap-6">
                             <div className="h-10 w-10 rounded-full bg-forest/[0.02] flex items-center justify-center text-forest/20 group-hover:bg-terracotta/5 group-hover:text-terracotta transition-all">
                               <HelpCircle className="h-4 w-4 stroke-[1.5px]" />
                             </div>
                             <div>
                               <span className="text-[8px] font-bold text-terracotta/50 uppercase tracking-[0.2em] block mb-1">
                                 {highlightText(faq.category, (faq as any).matches, 'category')}
                               </span>
                               <h4 className="text-lg font-medium text-forest leading-tight">
                                 {highlightText(faq.question, (faq as any).matches, 'question')}
                               </h4>
                             </div>
                          </div>
                          {expandedIndex === index ? (
                            <ChevronUp className="h-5 w-5 text-terracotta shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-forest/10 group-hover:text-terracotta/40 shrink-0 transition-all" />
                          )}
                        </button>
                        <AnimatePresence>
                          {expandedIndex === index && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pb-8 pl-[64px] pr-12">
                                <p className="text-forest/60 text-base leading-relaxed italic font-serif">
                                  {highlightText(faq.answer, (faq as any).matches, 'answer')}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                
                {/* Customer Care Support Section */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mt-24 bg-neutral-50 rounded-[3rem] p-12 text-center relative overflow-hidden"
                >
                  {/* Decorative Background Elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-terracotta/[0.03] rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-forest/[0.03] rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

                  <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-forest/40 text-[9px] font-bold uppercase tracking-[0.3em] shadow-sm">
                      <PhoneCall className="h-3 w-3" /> Customer Care Support
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-3xl md:text-4xl font-playfair font-black text-forest italic">
                        Not finding the peace you seek?
                      </h3>
                      <p className="text-forest/50 text-sm font-medium leading-relaxed max-w-sm mx-auto">
                        Our dedicated Soul Guides are standing by to assist with your journey, logistics, or spiritual inquiries.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                      <a 
                        href="https://wa.me/917878200632" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-forest text-white rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-forest/90 transition-all shadow-xl shadow-forest/10"
                      >
                        <MessageSquare className="h-4 w-4" /> Start Soul Chat
                      </a>
                    </div>

                    <p className="text-[9px] font-bold text-forest/20 uppercase tracking-[0.2em] pt-4">
                      Available daily: 09:00 AM — 09:00 PM IST
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Strategic Portfolio Summary */}
        <section className="bg-forest rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
            <div className="w-full h-full border-[60px] md:border-[100px] border-white/20 rounded-full translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="relative z-10 max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 md:mb-6 leading-tight">The 40-Soul Analysis</h2>
            <p className="text-white/60 text-sm md:text-lg leading-relaxed mb-8 md:mb-10 font-medium">
              Our curated collection addresses six key soulful segments: Romantic Retreats, Wellness Immersions, Corporate MICE, Backpacker Expeditions, High-Altitude Adventure, and Mixed-Interest thematic tours.
            </p>
            <div className="grid grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
              {[
                { label: 'Market Segments', value: '06' },
                { label: 'Strategic Packages', value: '40' },
                { label: 'Adventure Rating', value: 'A+' },
                { label: 'Wellness Focus', value: 'Deep' }
              ].map(stat => (
                <div key={stat.label}>
                  <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">{stat.label}</p>
                  <p className="text-2xl md:text-3xl font-heading font-bold text-terracotta transition-transform hover:scale-105 active:scale-95 inline-block cursor-default">{stat.value}</p>
                </div>
              ))}
            </div>
            <Button className="w-full sm:w-auto h-12 md:h-14 px-8 rounded-xl md:rounded-2xl bg-white text-forest hover:bg-white/90 font-bold border-none transition-all shadow-xl shadow-black/10">
              Discover All Packages <ArrowRight className="ml-3 h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
