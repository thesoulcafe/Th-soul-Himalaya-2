import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  Info, 
  Phone, 
  Mail, 
  Clock, 
  Hash,
  Compass,
  ArrowRight,
  Share2,
  Download,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

interface BookingItem {
  id: string;
  name: string;
  price: number | string;
  quantity: number;
  type: string;
  dateRange: string;
}

interface BookingDetails {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  phone: string;
  city: string;
  pincode: string;
  items: BookingItem[];
  totalPrice: number;
  status: string;
  createdAt: any;
  note?: string;
}

export default function BookingDetails() {
  const { id } = useParams();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchBooking = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'bookings', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Security check: ensure the booking belongs to the current user
          if (data.userId !== user?.uid) {
            toast.error("Access Denied", { description: "You are not authorized to view this booking." });
            navigate('/dashboard');
            return;
          }
          setBooking({ id: docSnap.id, ...data } as BookingDetails);
        } else {
          toast.error("Booking Not Found", { description: "The requested journey could not be located." });
          navigate('/dashboard');
        }
      } catch (error) {
        console.error("Error fetching booking details:", error);
        toast.error("Fetch Failed", { description: "An error occurred while accessing the spiritual records." });
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchBooking();
  }, [id, user, navigate]);

  const handleShare = async () => {
    if (!booking) return;
    const shareData = {
      title: 'My Soul Journey Booking',
      text: `Excited about my upcoming journey: ${booking.items.map(i => i.name).join(', ')}!`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link Copied", { description: "Journey URL copied to clipboard." });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] pt-24 pb-20 flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-forest/10 border-t-terracotta rounded-full animate-spin" />
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-24 pb-20 font-sans selection:bg-terracotta/10">
      <div className="max-w-4xl mx-auto px-6">
        {/* Back Navigation */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-forest/40 hover:text-forest transition-colors mb-12 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Return to Dashboard</span>
        </button>

        <div className="space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-terracotta animate-pulse" />
                <span className="text-[10px] font-black text-terracotta uppercase tracking-[0.4em]">Confidential Itinerary</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-playfair font-black italic tracking-tighter text-forest uppercase leading-none">
                Soul Journey Receipt
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-forest/40 uppercase tracking-widest">
                <span className="flex items-center gap-2">
                  <Hash className="h-3 w-3 text-terracotta" /> ID: {booking.id.toUpperCase()}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-terracotta" /> Deciphered: {booking.createdAt?.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleShare}
                variant="outline" 
                size="icon" 
                className="h-14 w-14 rounded-2xl border-forest/10 text-forest hover:bg-forest hover:text-white transition-all shadow-lg shadow-forest/5"
              >
                <Share2 className="h-5 w-5" />
              </Button>
              <Button 
                onClick={() => navigate(`/guide?q=${encodeURIComponent(booking.items[0]?.name || '')}`)}
                className="h-14 px-8 rounded-2xl bg-forest text-white hover:bg-forest/90 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-forest/20 flex items-center justify-center gap-3 group"
              >
                <HelpCircle className="h-4 w-4" /> Get Assistance <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Package Details */}
              <section className="space-y-4">
                <h2 className="text-[10px] font-black text-forest/20 uppercase tracking-[0.5em] mb-4">Expedition Composition</h2>
                <div className="space-y-4">
                  {booking.items.map((item, idx) => (
                    <Card key={idx} className="border-none bg-white rounded-[2.5rem] shadow-xl shadow-forest/[0.03] overflow-hidden group">
                      <CardContent className="p-8">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                          <div className="h-20 w-20 rounded-2xl bg-forest/5 flex items-center justify-center shrink-0">
                            <Compass className="h-10 w-10 text-forest/20 group-hover:text-terracotta group-hover:rotate-45 transition-all duration-700" />
                          </div>
                          <div className="flex-1 text-center sm:text-left">
                            <div className="text-[9px] font-black text-terracotta uppercase tracking-[0.2em] mb-1">{item.type}</div>
                            <h3 className="text-2xl font-heading font-black text-forest mb-2">{item.name}</h3>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-[10px] font-bold text-forest/40 uppercase tracking-widest">
                              <span className="flex items-center gap-2">
                                <Calendar className="h-3 w-3 text-terracotta" /> {item.dateRange}
                              </span>
                              <span className="flex items-center gap-2">
                                <Users className="h-3 w-3 text-terracotta" /> {item.quantity} Traveler{item.quantity > 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                          <div className="sm:text-right">
                            <div className="text-2xl font-black text-forest">₹{item.price.toLocaleString()}</div>
                            <div className="text-[8px] font-bold text-forest/20 uppercase tracking-widest">Unit Value</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Guest Manifest */}
              <section className="space-y-4">
                <h2 className="text-[10px] font-black text-forest/20 uppercase tracking-[0.5em] mb-4">Voyager Manifest</h2>
                <Card className="border-none bg-white rounded-[2.5rem] shadow-xl shadow-forest/[0.03] p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-xl bg-forest/5 flex items-center justify-center text-forest/40">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-forest/30 uppercase tracking-widest mb-1">Lead Voyager</p>
                          <p className="text-base font-bold text-forest">{booking.userName}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-xl bg-forest/5 flex items-center justify-center text-forest/40">
                          <Mail className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-forest/30 uppercase tracking-widest mb-1">E-Archive Path</p>
                          <p className="text-sm font-medium text-forest">{booking.userEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-xl bg-forest/5 flex items-center justify-center text-forest/40">
                          <Phone className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-forest/30 uppercase tracking-widest mb-1">Signal Line</p>
                          <p className="text-sm font-medium text-forest">{booking.phone}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-xl bg-forest/5 flex items-center justify-center text-forest/40">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-forest/30 uppercase tracking-widest mb-1">Soul Origin (City)</p>
                          <p className="text-sm font-medium text-forest">{booking.city}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-xl bg-forest/5 flex items-center justify-center text-forest/40">
                          <Hash className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-forest/30 uppercase tracking-widest mb-1">Spatial Key (Pincode)</p>
                          <p className="text-sm font-medium text-forest">{booking.pincode}</p>
                        </div>
                      </div>
                      {booking.note && (
                        <div className="flex items-start gap-4">
                          <div className="h-10 w-10 rounded-xl bg-forest/5 flex items-center justify-center text-forest/40">
                            <Info className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-[8px] font-black text-forest/30 uppercase tracking-widest mb-1">Extra Wisdom</p>
                            <p className="text-xs font-medium text-forest/60 italic leading-relaxed">"{booking.note}"</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </section>
            </div>

            {/* Receipt Summary */}
            <div className="space-y-8">
              <Card className="border-none bg-forest rounded-[3rem] p-10 text-white shadow-2xl shadow-forest/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Sparkles className="h-32 w-32" />
                </div>
                <div className="relative z-10 space-y-8">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-terracotta">
                      <ShieldCheck className="h-4 w-4" />
                      <span className="text-[9px] font-black uppercase tracking-[0.3em]">Identity Verified</span>
                    </div>
                    <h3 className="text-3xl font-heading font-black italic">Financial Sync</h3>
                  </div>

                  <div className="space-y-4 pt-8 border-t border-white/10">
                    <div className="flex justify-between items-center opacity-40">
                      <span className="text-[9px] font-black uppercase tracking-widest">Base Energy</span>
                      <span className="text-sm font-bold">₹{Math.round(booking.totalPrice / 1.05).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center opacity-40">
                      <span className="text-[9px] font-black uppercase tracking-widest">Growth Tax (5%)</span>
                      <span className="text-sm font-bold">₹{(booking.totalPrice - Math.round(booking.totalPrice / 1.05)).toLocaleString()}</span>
                    </div>
                    <div className="pt-4 flex flex-col items-center gap-2">
                      <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20">Final Devotion</span>
                      <div className="text-5xl font-heading font-black tracking-tighter text-terracotta">
                        ₹{booking.totalPrice.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="pt-8">
                    <Badge className={cn(
                      "w-full h-12 flex items-center justify-center rounded-2xl text-[10px] font-black uppercase tracking-[0.3em]",
                      booking.status === 'confirmed' ? "bg-emerald-500 text-white" : "bg-white/10 text-white/60"
                    )}>
                      {booking.status === 'confirmed' ? 'Successfully Manifested' : 'Reserved in Silence'}
                    </Badge>
                  </div>

                  <p className="text-[9px] text-center text-white/30 font-medium leading-relaxed uppercase tracking-tighter">
                    Our Soul Guides will contact you shortly to confirm the logistical flow of your expedition.
                  </p>
                </div>
              </Card>

              {/* Guide Card */}
              <Card className="border-none bg-terracotta p-8 rounded-[2.5rem] text-white shadow-xl shadow-terracotta/20 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                   <HelpCircle className="h-20 w-20" />
                 </div>
                 <h4 className="text-xl font-heading font-black italic mb-4">Seeking Wisdom?</h4>
                 <p className="text-[11px] text-white/70 font-medium leading-relaxed mb-8">Embark on the Soul Guide path for frequently asked revelations and manual search for this journey.</p>
                 <Button 
                   onClick={() => navigate(`/guide?q=${encodeURIComponent(booking.items[0]?.name || '')}`)}
                   className="w-full bg-white text-terracotta hover:bg-forest hover:text-white rounded-full h-14 text-[9px] font-black uppercase tracking-widest transition-all"
                 >
                   Open Soul Guide
                 </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
