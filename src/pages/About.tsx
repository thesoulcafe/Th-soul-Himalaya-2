import { motion } from 'motion/react';
import { Heart, MapPin, Users, Sparkles, Mountain } from 'lucide-react';

export default function About() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80"
            alt="About Hero"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-forest/60" />
        </div>
        <div className="relative z-10 text-center text-white px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6">Our Story</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Born in the heart of Tosh, raised by the spirit of the Parvati Valley.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-24 px-6 bg-cream">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-12 text-forest/80 leading-relaxed text-lg"
          >
            <div className="text-center mb-16">
              <Heart className="h-12 w-12 text-terracotta mx-auto mb-6" />
              <h2 className="text-3xl md:text-5xl font-heading font-bold text-forest mb-8">More Than Just Travel</h2>
              <p>
                THE SOUL HIMALAYA isn't just a business; it's a dream that took root in the high-altitude village of Tosh. 
                Our founder, a local resident of the Parvati Valley, envisioned a brand that would showcase the authentic 
                beauty of the Himalayas while preserving its sacred spirit and supporting the local community.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="rounded-3xl overflow-hidden shadow-xl">
                <img src="https://images.unsplash.com/photo-1506466010722-395aa2bef877?auto=format&fit=crop&w=800&q=80" alt="Local Life" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-6">
                <h3 className="text-2xl font-heading font-bold text-forest">Rooted in Tradition</h3>
                <p>
                  We believe in "Slow Travel." We want our guests to not just visit the valley, but to feel its pulse. 
                  Whether it's through the intricate knots of our macramé art, the soulful silence of our meditation retreats, 
                  or the organic connection to nature, every experience is designed to be grounded.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 order-2 md:order-1">
                <h3 className="text-2xl font-heading font-bold text-forest">Sustainably Minded</h3>
                <p>
                  The mountains have given us everything, and we strive to give back. Our upcoming Blueberry Farm is a 
                  testament to our commitment to sustainable agriculture. We employ local guides, support village 
                  artisans, and promote eco-friendly practices across all our services.
                </p>
              </div>
              <div className="rounded-3xl overflow-hidden shadow-xl order-1 md:order-2">
                <img src="https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=800&q=80" alt="Sustainability" className="w-full h-full object-cover" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-forest text-cream">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold mb-4">Our Core Values</h2>
            <div className="w-24 h-1 bg-terracotta mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {[
              { icon: Heart, title: 'Authenticity', desc: 'Real experiences, real people, real stories.' },
              { icon: MapPin, title: 'Community', desc: 'Supporting and empowering the local Himalayan villages.' },
              { icon: Sparkles, title: 'Spirituality', desc: 'Honoring the sacred energy of the mountains.' },
              { icon: Mountain, title: 'Adventure', desc: 'Pushing boundaries while respecting nature.' }
            ].map((value, i) => (
              <div key={i} className="text-center space-y-4">
                <div className="bg-white/10 p-6 rounded-full w-fit mx-auto">
                  <value.icon className="h-8 w-8 text-terracotta" />
                </div>
                <h4 className="text-xl font-bold">{value.title}</h4>
                <p className="text-cream/60 text-sm">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
