import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Tag, Map, Flower2, Coffee, Sparkles, Compass, Calendar, ArrowRight, Gift, Percent } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { SEO } from '@/components/SEO';
import { toast } from 'sonner';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const iconMap: Record<string, React.ElementType> = {
  compass: Compass,
  sparkles: Sparkles,
  coffee: Coffee,
  tag: Tag,
  map: Map,
  flower: Flower2,
  gift: Gift
};

const DEFAULT_OFFERS = [
  {
    id: "earlybird",
    title: "Early Bird Mountain Retreat",
    description: "Book your 7-day Kheerganga or Tosh trek 60 days in advance and save 15% on the entire package.",
    code: "SOUL15",
    discount: "15% OFF",
    iconName: "compass",
    validUntil: "Valid year-round",
    color: "bg-terracotta"
  },
  {
    id: "couples",
    title: "Romantic Himalayan Escape",
    description: "Special pricing for couples on our 4-day premium stay in Parvati Valley. Includes a complimentary candle-light dinner at The Soul Cafe.",
    code: "COUPLE2026",
    discount: "₹2000 OFF",
    iconName: "sparkles",
    validUntil: "Valid till Nov 2026",
    color: "bg-[#2A433A]" // forest lighter
  },
  {
    id: "workation",
    title: "Extended Digital Workation",
    description: "Stay 14 days or longer and receive a 25% discount on accommodation, plus unlimited high-speed Wi-Fi and complimentary morning coffee.",
    code: "NOMAD25",
    discount: "25% OFF",
    iconName: "coffee",
    validUntil: "Valid for long stays",
    color: "bg-forest"
  }
];

export default function Offers() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [offers, setOffers] = useState<any[]>(DEFAULT_OFFERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const offersRef = collection(db, 'offers');
        const snapshot = await getDocs(offersRef);
        
        if (!snapshot.empty) {
          const fetchedOffers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setOffers(fetchedOffers);
        }
      } catch (error) {
        console.error("Error fetching offers:", error);
        // Fallback to default offers if offline or error
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied!`);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <div className="min-h-screen bg-cream pt-24 pb-20">
      <SEO 
        title="Exclusive Offers & Deals | The Soul Himalaya"
        description="Discover exclusive discounts and special offers on Parvati Valley tour packages, yoga retreats, and digital workations."
        keywords="Himalaya tour discounts, Parvati Valley offers, Tosh trekking deals, workation discounts Himachal"
      />
      
      {/* Header */}
      <section className="max-w-7xl mx-auto px-6 mb-16 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto relative z-10 pt-10"
        >
          <div className="inline-flex items-center justify-center p-3 bg-terracotta/10 text-terracotta rounded-full mb-6">
            <Gift className="h-8 w-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-playfair font-bold text-forest mb-6">
            Exclusive <span className="text-terracotta italic">Offers</span>
          </h1>
          <p className="text-forest/70 text-lg md:text-xl font-medium leading-relaxed">
            Curated deals for our community. Whether you're planning a quick getaway or a month-long workation, find the perfect offer for your journey.
          </p>
        </motion.div>
      </section>

      {/* Offers List */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {offers.map((offer, idx) => {
            const Icon = iconMap[offer.iconName] || Tag;
            return (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[2rem] overflow-hidden shadow-xl border border-forest/5 flex flex-col group relative"
              >
                <div className={cn("absolute top-6 right-6 z-20 text-white font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-1", offer.color)}>
                  <Percent className="h-4 w-4" /> {offer.discount}
                </div>
                
                <div className="p-8 flex flex-col flex-grow relative bg-gradient-to-b from-cream/50 to-white pt-16">
                  <div className="w-12 h-12 bg-cream rounded-full flex items-center justify-center text-terracotta absolute top-6 left-8 z-20 shadow-lg border border-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  <h3 className="text-2xl font-playfair font-bold text-forest mb-3 mt-6">{offer.title}</h3>
                  <p className="text-forest/70 text-sm mb-6 flex-grow leading-relaxed">{offer.description}</p>
                  
                  <div className="bg-forest/5 rounded-xl p-4 mb-6 border border-forest/10 flex flex-col items-center justify-center relative overflow-hidden group/code cursor-pointer" onClick={() => copyToClipboard(offer.code)}>
                    <div className="absolute inset-0 bg-terracotta/5 opacity-0 group-hover/code:opacity-100 transition-opacity" />
                    <span className="text-[10px] uppercase tracking-widest text-forest/50 font-bold mb-1">Use Code at Checkout</span>
                    <span className="text-xl font-montserrat font-black tracking-widest text-forest group-hover/code:text-terracotta transition-colors">
                      {copiedCode === offer.code ? "COPIED!" : offer.code}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-forest/10">
                    <span className="text-xs font-medium text-forest/50 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {offer.validUntil}
                    </span>
                    <Link to="/tours" className="text-terracotta text-sm font-bold uppercase tracking-wider hover:underline flex items-center gap-1">
                      Book Now <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
        
        {/* Referral Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-forest to-[#1a2e26] rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl"
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-terracotta/20 rounded-full blur-[80px]" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="md:w-2/3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 mb-4">
                <Sparkles className="h-4 w-4 text-terracotta" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Refer & Earn</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-playfair font-bold mb-4">Share the Journey</h3>
              <p className="text-white/80 text-lg font-light leading-relaxed mb-6">
                Invite your friends to experience the magic of the Himalayas. When they book their first trip using your unique referral link, they get 10% off, and you earn ₹1000 in travel credits.
              </p>
            </div>
            
            <div className="md:w-1/3 flex justify-center md:justify-end w-full">
              <Link 
                to="/dashboard"
                className={cn(buttonVariants({ size: "lg" }), "bg-terracotta hover:bg-[#a04832] text-white rounded-full px-8 py-6 w-full md:w-auto shadow-xl")}
              >
                Get Referral Link
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
