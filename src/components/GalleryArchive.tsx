import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  description: string;
}

const SAMPLE_IMAGES: GalleryImage[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1544735230-c112df2146bc?q=80&w=1000&auto=format&fit=crop',
    title: 'The Sacred Valley',
    description: 'A mystical dawn breaking over the peaks of the Parvati Valley, where the mist dances with the ancient pines.'
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop',
    title: 'Temple of Echoes',
    description: 'An ancient stone temple stands resilient against the elements, a testament to the spiritual heritage of the Himalayas.'
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1000&auto=format&fit=crop',
    title: 'Glacial Purity',
    description: 'The crystal clear waters of a high-altitude lake reflecting the snow-capped summits that feed its depths.'
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop',
    title: 'Summit Serenity',
    description: 'Reaching the heights where the air thin and the world below seems like a distant memory of chaotic noise.'
  },
  {
    id: '5',
    url: 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?q=80&w=1000&auto=format&fit=crop',
    title: 'Starlit Haven',
    description: 'The night sky reveals its full glory in the absence of city lights, casting a cosmic glow over the silent range.'
  },
  {
    id: '6',
    url: 'https://images.unsplash.com/photo-1454496522485-0a69e88da117?q=80&w=1000&auto=format&fit=crop',
    title: 'Winter Whispers',
    description: 'A blanket of fresh snow mutes the landscape, creating a monochrome world of breathtaking simplicity.'
  },
  {
    id: '7',
    url: 'https://images.unsplash.com/photo-1506744038236-4627699ad310?q=80&w=1000&auto=format&fit=crop',
    title: 'Autumnal Glow',
    description: 'The valley floor ignites with gold and crimson as autumn descends upon the lower reaches of the forest.'
  },
  {
    id: '8',
    url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1000&auto=format&fit=crop',
    title: 'Cascading Light',
    description: 'Hidden waterfalls revealed by the morning light, their spray creating jewels of moisture on the ancient moss.'
  }
];

interface GalleryArchiveProps {
  images: GalleryImage[];
  title?: string;
  propertyName?: string;
}

export default function GalleryArchive({ 
  images = SAMPLE_IMAGES, 
  title = "Visual Manifest",
  propertyName = "The Soul Himalaya"
}: GalleryArchiveProps) {

  return (
    <div className="w-full bg-white py-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {images.map((img, idx) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-white rounded-3xl p-4 border border-neutral-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            >
              {/* Image Container */}
              <div className="aspect-[4/5] w-full rounded-2xl overflow-hidden mb-4 relative">
                <img 
                  src={img.url} 
                  alt={img.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-neutral-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Text / Review */}
              <div className="space-y-2 px-2">
                <h3 className="font-serif text-lg font-bold text-neutral-900">{img.title}</h3>
                <p className="text-sm text-neutral-600 line-clamp-3 leading-relaxed">
                  "{img.description}"
                </p>
                <div className="pt-2 text-[10px] font-bold text-[#A0522D] uppercase tracking-widest flex items-center gap-2">
                  <span className="h-1 w-4 bg-[#A0522D] rounded-full" />
                  Successful Traveller Review
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
