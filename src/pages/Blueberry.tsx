import { motion } from 'motion/react';
import { Sparkles, Mail, ArrowRight, Flower2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Blueberry() {
  return (
    <div className="pt-20 min-h-screen flex flex-col">
      <section className="relative flex-grow flex items-center justify-center overflow-hidden py-20">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=1920&q=80"
            alt="Blueberry Farm"
            className="w-full h-full object-cover opacity-20 grayscale"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-cream via-cream/90 to-cream" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center space-x-2 bg-terracotta/10 text-terracotta px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-8">
              <Sparkles className="h-4 w-4" />
              <span>Coming Summer 2026</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-heading font-bold text-forest mb-6">
              The Soul <br />
              <span className="text-himalayan-blue italic">Blueberry Farm</span>
            </h1>
            
            <p className="text-lg md:text-xl text-forest/60 mb-12 max-w-2xl mx-auto leading-relaxed">
              We're cultivating something sweet in the high altitudes of Tosh. 
              A sustainable, organic blueberry farm where you can pick your own berries 
              and enjoy the purest mountain air.
            </p>

            <div className="bg-white p-2 rounded-full shadow-2xl max-w-md mx-auto flex items-center border border-forest/5">
              <Input 
                placeholder="Enter your email" 
                className="border-none bg-transparent focus-visible:ring-0 text-forest placeholder:text-forest/30"
              />
              <Button className="bg-himalayan-blue hover:bg-himalayan-blue/90 text-white rounded-full px-6">
                Notify Me <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <p className="mt-4 text-xs text-forest/40">Be the first to know when we open for the season.</p>
          </motion.div>
        </div>

        {/* Floating elements */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-10 text-himalayan-blue/20 hidden lg:block"
        >
          <Flower2 className="h-24 w-24" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 right-10 text-terracotta/20 hidden lg:block"
        >
          <Flower2 className="h-32 w-32" />
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 bg-forest text-cream">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="space-y-4">
            <h3 className="text-2xl font-heading font-bold">Pick-Your-Own</h3>
            <p className="text-cream/60 text-sm">Experience the joy of harvesting fresh, organic blueberries directly from the shrubs.</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-heading font-bold">Farm-to-Table</h3>
            <p className="text-cream/60 text-sm">Fresh berry preserves, pies, and juices available at our local farm shop.</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-heading font-bold">Eco-Tours</h3>
            <p className="text-cream/60 text-sm">Learn about high-altitude organic farming and sustainable mountain agriculture.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
