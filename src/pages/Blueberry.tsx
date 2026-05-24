import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Mail, ArrowRight, Flower2, MapPin, Sun, Wind, CloudRain, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';

export default function Blueberry() {
  const [email, setEmail] = useState('');

  return (
    <div className="pt-20 min-h-screen flex flex-col bg-cream">
      <SEO 
        title="The Soul Blueberry Farm | Tosh Village, Himalayas"
        description="Visit our high-altitude organic blueberry farm in Tosh, Parvati Valley. Experience sustainable farming, pick-your-own berries, and farm-to-table freshness."
        keywords="blueberry farm Tosh, organic farm Parvati Valley, sustainable farming Himalayas, pick your own blueberries India, things to do in Tosh"
        type="website"
      />
      
      <section className="relative flex-grow flex items-center justify-center overflow-hidden py-32 md:py-40">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1590059535359-fdcb56cdd2fa?auto=format&fit=crop&w=1920&q=80"
            alt="Organic Blueberries"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-forest/80 via-forest/60 to-cream" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-8 border border-white/20">
              <Sparkles className="h-4 w-4 text-himalayan-blue" />
              <span>Opening Summer 2026</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-heading font-black text-white mb-6 drop-shadow-lg">
              The Soul <br />
              <span className="text-himalayan-blue italic font-serif font-medium">Blueberry Farm</span>
            </h1>
            
            <p className="text-lg md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed font-medium">
              We're cultivating something sweet at 7,900 feet. Experience the purity of high-altitude organic farming in the heart of Parvati Valley.
            </p>

            <div className="flex items-center justify-center gap-4 text-white/80 font-bold uppercase tracking-widest text-xs mb-12">
              <MapPin className="h-4 w-4 text-terracotta" />
              <span>Upper Tosh Village, Himalayas</span>
            </div>

            <div className="bg-white/20 backdrop-blur-xl p-3 md:p-4 rounded-[2rem] shadow-2xl max-w-lg mx-auto flex items-center border border-white/20">
              <Input 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Join the harvest waitlist..." 
                className="border-none bg-transparent focus-visible:ring-0 text-white placeholder:text-white/50 text-lg font-medium outline-none shadow-none"
              />
              <Button 
                onClick={() => {
                  if (email) {
                    toast.success("Manifestation Registered", {
                      description: `Thank you! We will notify you at ${email} when the season begins.`,
                    });
                    setEmail('');
                  }
                }}
                className="bg-himalayan-blue hover:bg-himalayan-blue/80 text-white rounded-[1.5rem] px-8 py-6 h-auto font-bold uppercase tracking-widest text-xs transition-all shadow-lg"
              >
                Notify Me <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-white/50">Limited daily visitor slots during harvest season.</p>
          </motion.div>
        </div>
      </section>

      {/* Farm Experience Sections */}
      <section className="py-24 md:py-32 bg-cream text-forest relative z-10 -mt-10 rounded-t-[3rem] border-t-8 border-terracotta shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-6xl font-heading font-black text-forest uppercase tracking-tighter">The Farm Experience</h2>
            <p className="text-lg text-forest/60 max-w-2xl mx-auto">Discover the magic of sustainable agriculture immersed in the majestic Himalayan landscape.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white p-12 rounded-[3rem] border border-forest/5 shadow-xl shadow-forest/5 space-y-6"
            >
              <div className="h-16 w-16 bg-himalayan-blue/10 rounded-2xl flex items-center justify-center mx-auto text-himalayan-blue mb-8">
                <Sun className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-heading font-bold uppercase tracking-wide">Pick-Your-Own</h3>
              <p className="text-forest/70 font-medium leading-relaxed">Experience the joy of harvesting fresh, sun-kissed organic blueberries directly from the mountain shrubs.</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white p-12 rounded-[3rem] border border-forest/5 shadow-xl shadow-forest/5 space-y-6"
            >
              <div className="h-16 w-16 bg-terracotta/10 rounded-2xl flex items-center justify-center mx-auto text-terracotta mb-8">
                <Star className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-heading font-bold uppercase tracking-wide">Farm-to-Table</h3>
              <p className="text-forest/70 font-medium leading-relaxed">Artisan preserves, pies, and fresh mountain juices available purely from our yield at the local farm shop.</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white p-12 rounded-[3rem] border border-forest/5 shadow-xl shadow-forest/5 space-y-6"
            >
              <div className="h-16 w-16 bg-forest/10 rounded-2xl flex items-center justify-center mx-auto text-forest mb-8">
                <Wind className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-heading font-bold uppercase tracking-wide">Eco-Tours</h3>
              <p className="text-forest/70 font-medium leading-relaxed">Learn about high-altitude organic farming, sustainable water practices, and ecosystem preservation.</p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Location specifics */}
      <section className="py-24 bg-forest text-cream overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-himalayan-blue/20 rounded-full blur-[100px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-terracotta/20 rounded-full blur-[100px] -ml-48 -mb-48" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <h2 className="text-4xl md:text-6xl font-heading font-black text-white uppercase tracking-tighter">Locate The Farm</h2>
            <div className="space-y-6 text-lg text-cream/80 font-medium leading-relaxed">
              <p>Perched proudly above the main village of Tosh, our farm sits at precisely 7,900 feet, enjoying untethered sunlight and pure glacial melt for irrigation.</p>
              <div className="flex items-start gap-4 bg-white/5 p-6 rounded-2xl border border-white/10">
                <MapPin className="h-6 w-6 text-terracotta shrink-0 mt-1" />
                <p><strong>Address:</strong> Upper Tosh Trail, 500m past Pink Floyd Cafe, Tosh Village, Parvati Valley, Himachal Pradesh 175105</p>
              </div>
              <p className="text-sm text-cream/50 italic">*Please note that vehicles cannot reach the farm. A moderate 15-minute hike from Tosh taxi stand is required, offering breathtaking valley views along the way.</p>
            </div>
          </div>
          <div className="flex-1 w-full">
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 aspect-square md:aspect-auto md:h-[500px]">
              <img 
                src="https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=800&q=80" 
                alt="Farm Location in Tosh" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
