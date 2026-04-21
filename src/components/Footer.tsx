import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin, Star, ArrowRight } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import ReviewsDialog from './ReviewsDialog';

export default function Footer() {
  const [logoClicks, setLogoClicks] = useState({ count: 0, lastClick: 0 });
  const navigate = useNavigate();

  const handleLogoClick = (e: React.MouseEvent) => {
    const now = Date.now();
    const isQuick = now - logoClicks.lastClick < 2000;
    const newCount = isQuick ? logoClicks.count + 1 : 1;

    if (newCount >= 5) {
      e.preventDefault();
      navigate('/admin');
      setLogoClicks({ count: 0, lastClick: 0 });
    } else {
      setLogoClicks({ count: newCount, lastClick: now });
    }
  };

  return (
    <footer className="bg-forest text-cream pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand Info */}
        <div className="space-y-8">
          <Link to="/" onClick={handleLogoClick} className="flex flex-col gap-6 group cursor-pointer">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="h-24 w-24 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-2xl border border-white/20 group-hover:border-terracotta/50 transition-colors"
            >
              <img 
                src="https://i.postimg.cc/V6CDy34v/IMG-8050.jpg" 
                alt="The Soul Himalaya Logo" 
                className="h-20 w-auto brightness-110 contrast-110 group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <span className="text-3xl font-montserrat font-extrabold text-white tracking-tighter group-hover:text-terracotta transition-colors uppercase leading-[0.95]">
              The Soul <br /><span className="text-terracotta italic font-playfair tracking-normal normal-case">Himalaya</span>
            </span>
          </Link>
          <p className="text-cream/60 text-[13px] leading-relaxed font-medium">
            Authentic Himalayan experiences in the heart of Parvati Valley. 
            From soulful stays to adventurous treks, we bring you closer to the eternal spirit of the mountains.
          </p>
          <div className="flex space-x-6 pt-2">
            <a href="https://www.instagram.com/thesoulhimalaya" target="_blank" rel="noopener noreferrer" className="text-cream/40 hover:text-terracotta transition-colors"><Instagram className="h-5 w-5" /></a>
            <a href="https://x.com/TheSoulhimalaya" target="_blank" rel="noopener noreferrer" className="text-cream/40 hover:text-terracotta transition-colors"><Twitter className="h-5 w-5" /></a>
          </div>
        </div>

        {/* Quick Links & Services Grouped */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:col-span-2">
          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold">Quick Links</h4>
            <ul className="space-y-3 text-sm text-cream/70">
              {['Home', 'About', 'Gallery', 'Contact', 'Blueberry'].map((item) => (
                <motion.li key={item} whileHover={{ x: 5 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <Link to={item === 'Home' ? '/' : `/${item.toLowerCase()}`} className="hover:text-terracotta transition-colors flex items-center gap-2">
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item === 'Blueberry' ? 'Blueberry Farm' : item === 'Contact' ? 'Contact Us' : item === 'About' ? 'Our Story' : item}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold">Services</h4>
            <ul className="space-y-3 text-sm text-cream/70">
              {[
                { name: 'Tour Packages', href: 'https://main.d1yswrq8t3vfwp.amplifyapp.com/tours' },
                { name: 'Mountain Trekks', href: 'https://main.d1yswrq8t3vfwp.amplifyapp.com/trekks' },
                { name: 'Yoga & Wellness', href: '/yoga' },
                { name: 'Digital Workation', href: '/wfh' },
                { name: 'Macramé Shop', href: '/shop' },
              ].map((service) => (
                <motion.li key={service.name} whileHover={{ x: 5 }} transition={{ type: 'spring', stiffness: 300 }}>
                  {service.href.startsWith('http') ? (
                    <a href={service.href} className="hover:text-terracotta transition-colors">
                      {service.name}
                    </a>
                  ) : (
                    <Link to={service.href} className="hover:text-terracotta transition-colors">
                      {service.name}
                    </Link>
                  )}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-6">
          <h4 className="text-lg font-bold">Find Us</h4>
          <ul className="space-y-4 text-sm text-cream/70">
            <li className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-terracotta shrink-0" />
              <span>Tosh Village, Parvati Valley, Himachal Pradesh, India</span>
            </li>
            <li className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-terracotta shrink-0" />
              <span>+91 70232 07620</span>
            </li>
            <li className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-terracotta shrink-0" />
              <span>hello@thesoulhimalaya.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-cream/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-cream/40 text-center md:text-left">
        <p>© {new Date().getFullYear()} The Soul Himalaya. All rights reserved. Crafted with soul in the mountains.</p>
      </div>
    </footer>
  );
}
