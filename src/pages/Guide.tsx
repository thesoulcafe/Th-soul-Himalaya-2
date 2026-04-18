import React from 'react';
import { motion } from 'motion/react';
import { REGIONAL_GUIDE } from '@/constants';
import { MapPin, Clock, Router, Wallet, Sun, CloudRain, Snowflake, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Guide() {
  return (
    <div className="min-h-screen bg-cream pb-32">
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
              Operational Guide
            </span>
            <h1 className="text-2xl sm:text-4xl md:text-7xl font-heading font-bold text-white mb-4 md:mb-6 leading-tight">
              Strategic Portfolio <br className="hidden md:block" /> & <span className="text-white/80 italic">Regional Intelligence</span>
            </h1>
            <p className="text-sm md:text-lg text-white/80 font-medium max-w-2xl mx-auto leading-relaxed">
              A comprehensive analysis of the Kullu-Parvati-Manali corridor, designed for maximized regional potential and logistical precision.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 md:px-6 -mt-10 md:-mt-20 relative z-20">
        {/* Transit Matrix */}
        <section className="bg-white rounded-[1.5rem] md:rounded-[3rem] shadow-2xl shadow-forest/5 p-5 md:p-16 mb-8 md:mb-20 border border-forest/5 overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-4">
            <div>
              <h2 className="text-xl md:text-3xl font-heading font-bold text-forest mb-1 md:mb-2">Transit Dynamics</h2>
              <p className="text-forest/40 text-[9px] md:text-sm font-medium uppercase tracking-widest leading-relaxed">Seasonal Accessibility & Logistical Foundation</p>
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
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-forest mb-2 md:mb-4">Seasonal Portfolio Matrix</h2>
            <p className="text-forest/40 text-[10px] md:text-sm font-bold uppercase tracking-[0.2em]">Operational Viability & Risks</p>
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

        {/* Strategic Portfolio Summary */}
        <section className="bg-forest rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
            <div className="w-full h-full border-[60px] md:border-[100px] border-white/20 rounded-full translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="relative z-10 max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 md:mb-6 leading-tight">The 40-Package Analysis</h2>
            <p className="text-white/60 text-sm md:text-lg leading-relaxed mb-8 md:mb-10 font-medium">
              Our curated portfolio addresses six key market segments: Romantic Retreats, Wellness Immersions, Corporate MICE, Backpacker Expeditions, High-Altitude Adventure, and Mixed-Interest thematic tours.
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
