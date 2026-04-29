import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, MapPin, Clock, Star, ArrowRight, Share2, 
  CheckCircle2, Wind, Heart, Zap, Play, Info, Users,
  ChevronRight, Shield, Coffee, Camera, Mountain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';
import ImageSlider from '@/components/ImageSlider';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { 
  DEFAULT_TOURS, 
  DEFAULT_TREKKS, 
  DEFAULT_YOGA, 
  DEFAULT_MEDITATION,
  DEFAULT_ADVENTURE,
  DEFAULT_WFH
} from '@/constants';
import { useAuth } from '@/lib/AuthContext';

export default function ServiceDetail() {
  const { category, id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        // 1. Try Firestore first
        const docRef = doc(db, "content", id!);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setItem({ id: docSnap.id, ...docSnap.data().data });
        } else {
          toast.error("Path not found", {
            description: "The spiritual journey you seek could not be located."
          });
          navigate(`/${category}`);
        }
      } catch (error) {
        console.error("Error fetching detail:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchItem();
  }, [id, category, navigate]);

  const handleShare = async () => {
    if (!item) return;
    const shareData = {
      title: `Soul Himalaya - ${item.title || item.name}`,
      text: item.description,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Spirit Shared", {
          description: "Link copied to clipboard!"
        });
      }
    } catch (err) {
      console.error("Sharing failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 border-4 border-terracotta border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="pt-20 min-h-screen bg-cream">
      <SEO 
        title={`${item.title || item.name} | The Soul Himalaya`}
        description={item.description}
        image={item.image}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Visuals Column */}
          <div className="space-y-6">
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl h-[400px] md:h-[600px] bg-forest">
              <ImageSlider 
                images={[item.image, ...(item.images || [])].filter(Boolean)} 
                alt={item.title || item.name}
                className="h-full w-full"
                autoSwipe={true}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/60 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                <Badge className="bg-white/90 backdrop-blur-md text-forest border-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                  {item.category || 'Curated Path'}
                </Badge>
              </div>

              <div className="absolute bottom-8 left-8 right-8 text-white">
                <div className="flex items-center gap-2 text-white/70 text-[10px] font-black uppercase tracking-[0.3em] mb-2">
                  <MapPin className="h-4 w-4 text-terracotta" />
                  <span>The Soul Himalaya</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-playfair font-black italic leading-none tracking-tighter uppercase">
                  {item.title || item.name}
                </h1>
              </div>
            </div>
            <div className="px-6 py-4 flex items-center justify-between text-forest/50 bg-white/50 backdrop-blur-sm rounded-full border border-forest/10 shadow-sm mx-4">
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Gallery of the Journey</span>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-forest/30" />
                <div className="h-1.5 w-1.5 rounded-full bg-forest/30" />
                <div className="h-1.5 w-1.5 rounded-full bg-forest/30" />
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Duration', value: item.duration, icon: Clock },
                { label: 'Intensity', value: item.difficulty || 'Balanced', icon: Mountain },
                { label: 'Vibe', value: item.focus || 'Peaceful', icon: Wind },
                { label: 'Rating', value: `${item.rating || 4.9} (${item.reviews || 12}+)`, icon: Star },
              ].map((stat, i) => (
                <Card key={i} className="bg-white border-forest/5 p-4 rounded-3xl shadow-sm hover:shadow-md transition-all">
                  <stat.icon className="h-5 w-5 text-terracotta mb-2" />
                  <p className="text-[8px] font-black uppercase tracking-widest text-forest/40">{stat.label}</p>
                  <p className="text-sm font-black text-forest mt-0.5">{stat.value}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Info Column */}
          <div className="flex flex-col h-full bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-forest/5">
            <div className="flex justify-between items-start mb-8">
              <div>
                <span className="font-fluid text-2xl text-terracotta block mb-1">The Essence</span>
                <div className="flex items-center gap-4 text-3xl md:text-5xl font-black text-forest tracking-tighter">
                  {item.price}
                  <span className="text-xs font-bold text-forest/30 uppercase tracking-widest">per soul</span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleShare}
                className="h-12 w-12 rounded-full border border-forest/10 text-forest hover:bg-forest hover:text-white transition-all shadow-sm"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-grow space-y-10">
              <section>
                <h3 className="text-[10px] font-black text-forest/30 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                  <Info className="h-3 w-3" /> The Narrative
                </h3>
                <p className="text-lg text-forest leading-relaxed font-medium">
                  {item.description}
                </p>
              </section>

              <section>
                <h3 className="text-[10px] font-black text-forest/30 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                  <Zap className="h-3 w-3" /> Highlights of the Path
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(item.highlights || item.features || []).map((h: string, i: number) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 p-4 bg-cream/30 rounded-2xl border border-forest/5 group hover:border-terracotta/30 transition-all"
                    >
                      <div className="h-6 w-6 rounded-full bg-forest/5 flex items-center justify-center group-hover:bg-terracotta/10 transition-all">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500 group-hover:text-terracotta" />
                      </div>
                      <span className="text-xs font-bold text-forest/80 uppercase tracking-wide">{h}</span>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Itinerary Snippet */}
              {item.itinerary && (
                <section>
                  <h3 className="text-[10px] font-black text-forest/30 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                    <MapPin className="h-3 w-3" /> Journey Itinerary
                  </h3>
                  <div className="space-y-4">
                    {item.itinerary.slice(0, 3).map((day: any, i: number) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="h-8 w-8 rounded-full bg-forest text-white text-[10px] font-black flex items-center justify-center shrink-0">
                            {i + 1}
                          </div>
                          {i < item.itinerary.slice(0, 3).length - 1 && <div className="w-px flex-grow bg-forest/10 my-1" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-forest mb-1">{day.title}</h4>
                          <p className="text-xs text-forest/60 line-clamp-2">{day.description}</p>
                        </div>
                      </div>
                    ))}
                    {item.itinerary.length > 3 && (
                      <p className="text-[10px] font-black text-terracotta uppercase tracking-[0.2em] ml-12">
                        + {item.itinerary.length - 3} more days of exploration
                      </p>
                    )}
                  </div>
                </section>
              )}
            </div>

            <div className="mt-12 flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => navigate(`/${category}/${id}/book`)}
                className="flex-1 h-16 rounded-full bg-forest hover:bg-forest/90 text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-forest/20 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
                <span className="relative z-10 flex items-center justify-center gap-3">
                  Seize the Moment <ArrowRight className="h-4 w-4" />
                </span>
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate(`/${category}`)}
                className="h-16 rounded-full border-2 border-forest/10 text-forest font-black text-xs uppercase tracking-[0.3em] px-8 hover:bg-forest hover:text-white transition-all"
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
