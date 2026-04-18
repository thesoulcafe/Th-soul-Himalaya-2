import { motion } from 'motion/react';
import { Camera, Instagram, Maximize2 } from 'lucide-react';

const images = [
  { url: 'https://images.unsplash.com/photo-1506466010722-395aa2bef877?auto=format&fit=crop&w=800&q=80', title: 'Tosh Village' },
  { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80', title: 'Kheerganga Peak' },
  { url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80', title: 'Yoga in the Wild' },
  { url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80', title: 'Himalayan Retreat' },
  { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80', title: 'Macramé Art' },
  { url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80', title: 'WFH Views' },
  { url: 'https://images.unsplash.com/photo-1533387558684-6297b785d177?auto=format&fit=crop&w=800&q=80', title: 'Paragliding' },
  { url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80', title: 'Valley Sunset' },
  { url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80', title: 'Starlit Skies' },
];

export default function Gallery() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-20 bg-cream text-center px-6">
        <div className="max-w-3xl mx-auto">
          <Camera className="h-12 w-12 text-terracotta mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-forest mb-4">Himalayan Frames</h1>
          <p className="text-forest/60 text-lg">A visual journey through the soul of Parvati Valley.</p>
        </div>
      </section>

      {/* Masonry Grid */}
      <section className="py-12 px-6 bg-cream min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {images.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="relative group overflow-hidden rounded-3xl shadow-lg"
              >
                <img
                  src={img.url}
                  alt={img.title}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white">
                  <Maximize2 className="h-8 w-8 mb-2" />
                  <span className="font-bold tracking-widest uppercase text-xs">{img.title}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram CTA */}
      <section className="py-24 bg-forest text-cream text-center px-6">
        <div className="max-w-2xl mx-auto">
          <Instagram className="h-12 w-12 text-terracotta mx-auto mb-8" />
          <h2 className="text-3xl font-heading font-bold mb-6">Want to see more?</h2>
          <p className="text-cream/70 mb-10">
            Follow us on Instagram for daily doses of mountain magic, guest stories, and live updates from the valley.
          </p>
          <a
            href="https://instagram.com/thesoulhimalaya"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-3 bg-terracotta hover:bg-terracotta/90 text-white px-10 py-4 rounded-full font-bold transition-all shadow-lg shadow-terracotta/20"
          >
            <span>@thesoulhimalaya</span>
          </a>
        </div>
      </section>
    </div>
  );
}
