import { useEffect, useState, useMemo } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ArrowRight, 
  LogOut, 
  Mountain, 
  Compass, 
  User, 
  ShieldCheck, 
  Wallet, 
  Star,
  Settings,
  HelpCircle,
  Hash,
  ChevronRight,
  Download,
  MessageSquare,
  TrendingUp,
  Zap,
  Award,
  CheckCircle2,
  Heart,
  Flag,
  Footprints,
  ScrollText,
  Crown,
  Plus,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DEFAULT_TOURS } from '@/constants';
import { useAuth } from '@/lib/AuthContext';

interface Booking {
  id: string;
  item: string;
  price: string;
  type: string;
  createdAt: any;
  status: string;
  dateRange?: string;
  image?: string;
}

export default function Dashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'settings'>('overview');
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();
  const { profile } = useAuth();
  const user = auth.currentUser;

  // Personalization state
  const [experienceLevel, setExperienceLevel] = useState(profile?.experienceLevel || 'novice');
  const [difficulty, setDifficulty] = useState(profile?.trekPreferences?.difficulty || 'moderate');
  const [groupSize, setGroupSize] = useState(profile?.trekPreferences?.groupSize || 'solo');

  useEffect(() => {
    if (profile) {
      setExperienceLevel(profile.experienceLevel || 'novice');
      setDifficulty(profile.trekPreferences?.difficulty || 'moderate');
      setGroupSize(profile.trekPreferences?.groupSize || 'solo');
    }
  }, [profile]);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[];
      setBookings(bookingData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching bookings:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, navigate]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  const handleUpdatePreferences = async () => {
    if (!user) return;
    setIsUpdating(true);
    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        experienceLevel,
        trekPreferences: {
          ...(profile?.trekPreferences || {}),
          difficulty,
          groupSize
        }
      });
      alert("Personalization updated! The Soul Guide will now give more tailored advice.");
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) return null;

  const stats = [
    { label: 'Journeys Taken', value: bookings.length, icon: Mountain, color: 'text-terracotta', trend: '+1' },
    { label: 'Soul Credits', value: '₹1,500', icon: Wallet, color: 'text-forest', trend: 'Active' },
    { label: 'Experience Pts', value: bookings.length * 250, icon: Zap, color: 'text-amber-500', trend: 'Level Up' },
    { label: 'Profile Trust', value: '100%', icon: ShieldCheck, color: 'text-emerald-500', trend: 'Verified' },
  ];

  const badges = [
    { name: 'Base Camp Pioneer', icon: Flag, color: 'bg-emerald-500', condition: true },
    { name: 'Valley Walker', icon: Footprints, color: 'bg-indigo-500', condition: bookings.length >= 1 },
    { name: 'Mountain Sage', icon: ScrollText, color: 'bg-amber-500', condition: bookings.length >= 5 },
    { name: 'Himalayan Legend', icon: Crown, color: 'bg-rose-500', condition: bookings.length >= 10 },
  ];

  const recommendations = useMemo(() => {
    return [...DEFAULT_TOURS].sort(() => 0.5 - Math.random()).slice(0, 3);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-20">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
        <Mountain className="absolute -bottom-40 -left-40 w-[600px] h-[600px] text-forest" />
        <Compass className="absolute -top-20 -right-20 w-[400px] h-[400px] text-terracotta rotate-12" />
      </div>

      {/* Mobile Header Tabs */}
      <div className="lg:hidden sticky top-20 bg-white/80 backdrop-blur-md border-b border-forest/5 z-20 flex px-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Home', icon: Hash },
          { id: 'bookings', label: 'History', icon: Calendar },
          { id: 'settings', label: 'Profile', icon: Settings },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-4 text-xs font-bold transition-all whitespace-nowrap border-b-2",
              activeTab === item.id 
                ? "border-terracotta text-forest" 
                : "border-transparent text-forest/40"
            )}
          >
            <item.icon className="h-3.5 w-3.5" />
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex relative z-10">
        {/* Sidebar */}
        <aside className="fixed left-0 top-20 bottom-0 w-72 bg-white border-r border-forest/5 hidden lg:flex flex-col p-8 z-20 shadow-2xl shadow-forest/[0.02]">
          <button 
            onClick={() => setActiveTab('settings')}
            className="flex flex-col items-center text-center mb-10 pb-8 border-b border-forest/5 group/profile w-full"
          >
            <div className="relative mb-4 group">
              <div className="h-24 w-24 rounded-[2rem] bg-gradient-to-br from-forest to-forest/80 flex items-center justify-center border-4 border-white shadow-2xl overflow-hidden transform group-hover:rotate-6 transition-transform">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-white" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 h-6 w-6 rounded-full border-4 border-white flex items-center justify-center">
                <CheckCircle2 className="h-3 w-3 text-white" />
              </div>
            </div>
            <div className="group-hover/profile:opacity-80 transition-opacity">
              <p className="font-heading font-bold text-xl text-forest tracking-tight">
                {user.displayName || 'Explorer'}
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <Badge variant="outline" className="text-[9px] border-forest/10 text-forest/40 font-black tracking-widest px-2 py-0">LEVEL 12</Badge>
                <Badge className="bg-terracotta text-white text-[9px] font-black tracking-widest px-2 py-0">PRO</Badge>
              </div>
            </div>
          </button>

          <nav className="space-y-3 flex-grow">
            {[
              { id: 'overview', label: 'Launchpad', icon: Hash },
              { id: 'bookings', label: 'My Voyages', icon: Calendar },
              { id: 'settings', label: 'Account', icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={cn(
                  "w-full flex items-center justify-between px-5 py-4 rounded-3xl text-sm font-bold transition-all group",
                  activeTab === item.id 
                    ? "bg-forest text-white shadow-2xl shadow-forest/30" 
                    : "text-forest/60 hover:bg-forest/5 hover:text-forest"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn("h-4 w-4", activeTab === item.id ? "text-terracotta" : "text-forest/40 group-hover:text-forest")} />
                  {item.label}
                </div>
                {activeTab === item.id && <ChevronRight className="h-4 w-4 text-white/40" />}
              </button>
            ))}
          </nav>

          <div className="pt-8 border-t border-forest/5 space-y-4">
            <div className="bg-forest/5 rounded-[2rem] p-5">
              <p className="text-[10px] font-black text-forest/40 uppercase tracking-widest mb-3">Soul Wallet</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-terracotta" />
                  <span className="text-lg font-bold text-forest tracking-tighter">₹1,500</span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl bg-white shadow-sm">
                  <Plus className="h-3 w-3 text-forest" />
                </Button>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-5 py-4 rounded-3xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100"
            >
              <LogOut className="h-4 w-4" />
              Abandon Station
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-72 p-6 lg:p-14">
          <div className="max-w-6xl mx-auto">
            {/* Header section with stylized typography */}
            <div className="mb-14 relative flex flex-col md:flex-row md:items-end justify-between items-start gap-8">
              <div>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 mb-6"
                >
                  <div className="h-px w-8 bg-terracotta" />
                  <span className="text-xs font-black text-terracotta uppercase tracking-[0.4em]">
                    Digital Base Camp
                  </span>
                </motion.div>
                <h1 className="text-6xl lg:text-8xl font-heading font-black text-forest leading-[0.8] tracking-tighter">
                  Namaste, <br />
                  <span className="text-terracotta italic font-medium">{user.displayName?.split(' ')[0] || 'Traveler'}</span>
                </h1>
              </div>
              
              <div className="bg-white p-2 rounded-full border border-forest/5 shadow-xl flex items-center gap-1">
                {['General', 'Business', 'Legendary'].map(mode => (
                  <button 
                    key={mode} 
                    className={cn(
                      "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                      mode === 'General' ? "bg-forest text-white shadow-lg" : "text-forest/40 hover:text-forest"
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-32 bg-forest/5 rounded-[2.5rem] animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
                {stats.map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1, type: 'spring', stiffness: 200 }}
                  >
                    <Card className="border-none bg-white shadow-2xl shadow-forest/[0.04] overflow-hidden rounded-[2.5rem] hover:-translate-y-2 transition-all duration-500 group">
                      <CardContent className="p-8">
                        <div className="flex items-center justify-between mb-6">
                          <div className={cn("p-3.5 rounded-2xl group-hover:rotate-12 transition-transform", stat.color.replace('text-', 'bg-') + '/10')}>
                            <stat.icon className={cn("h-6 w-6", stat.color)} />
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full ring-1 ring-emerald-100 shadow-sm">{stat.trend}</span>
                        </div>
                        <div>
                          <p className="text-[10px] text-forest/30 font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                          <p className="text-3xl font-heading font-bold text-forest tracking-tighter">{stat.value}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-12"
                >
                  {/* Latest Activity / Upcoming */}
                  <section>
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-3xl font-heading font-bold text-forest tracking-tight">Recent Journey</h2>
                      <button onClick={() => setActiveTab('bookings')} className="text-terracotta text-xs font-bold uppercase tracking-widest flex items-center gap-2 group">
                        View All <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>

                    {bookings.length > 0 ? (
                      <Card className="border-none bg-white overflow-hidden shadow-2xl rounded-[3rem]">
                        <div className="grid grid-cols-1 md:grid-cols-5 h-full min-h-[400px]">
                          <div className="md:col-span-2 relative overflow-hidden h-64 md:h-auto">
                            <img 
                              src={bookings[0].image || "https://images.unsplash.com/photo-1506466010722-395aa2bef877?auto=format&fit=crop&w=800&q=80"} 
                              alt={bookings[0].item}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-forest/40 to-transparent" />
                          </div>
                          <CardContent className="md:col-span-3 p-8 lg:p-12 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-4">
                                <span className={cn(
                                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm",
                                  bookings[0].status === 'completed' 
                                    ? "bg-emerald-100 text-emerald-700" 
                                    : bookings[0].status === 'Confirmed' 
                                      ? "bg-blue-100 text-blue-700" 
                                      : "bg-orange-100 text-orange-700"
                                )}>
                                  {bookings[0].status || 'Awaiting'}
                                </span>
                                <span className="text-[10px] font-bold text-forest/30 uppercase tracking-widest">{bookings[0].type}</span>
                              </div>
                              <h3 className="text-4xl lg:text-5xl font-heading font-bold text-forest mb-6 leading-none">
                                {bookings[0].item}
                              </h3>
                              
                              <div className="grid grid-cols-2 gap-8 mb-10">
                                <div className="space-y-1">
                                  <p className="text-[10px] text-forest/30 uppercase tracking-widest font-bold">Planned Date</p>
                                  <div className="flex items-center gap-2 text-forest font-bold">
                                    <Calendar className="h-4 w-4 text-terracotta" />
                                    {bookings[0].dateRange || bookings[0].createdAt?.toDate().toLocaleDateString() || 'Pending'}
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] text-forest/30 uppercase tracking-widest font-bold">Location</p>
                                  <div className="flex items-center gap-2 text-forest font-bold">
                                    <MapPin className="h-4 w-4 text-terracotta" />
                                    Parvati Valley, HP
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-4">
                              <Button className="rounded-full bg-forest text-white px-8 h-12 font-bold shadow-lg shadow-forest/20">
                                View Full Itinerary
                              </Button>
                              <Button variant="outline" className="rounded-full border-forest/10 text-forest h-12 font-bold hover:bg-forest/5">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Contact Guide
                              </Button>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    ) : (
                      <Card className="border-dashed border-2 border-forest/10 bg-transparent rounded-[3rem]">
                        <CardContent className="py-24 text-center">
                          <Mountain className="h-16 w-16 text-forest/10 mx-auto mb-6" />
                          <h3 className="text-2xl font-heading font-bold text-forest mb-2">No active journeys</h3>
                          <p className="text-forest/40 mb-8 max-w-sm mx-auto font-medium">
                            The mountains are calling. Find your next soul-guided adventure in the heart of the Himalayas.
                          </p>
                          <Button 
                            onClick={() => navigate('/services')}
                            className="bg-terracotta text-white rounded-full px-10 h-14 font-bold shadow-xl shadow-terracotta/20 hover:scale-105 transition-transform"
                          >
                            Discover Experiences
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </section>

                  {/* Badges Section */}
                  <section>
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-3xl font-heading font-bold text-forest tracking-tight">Himalayan Legacy</h2>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {badges.map((badge, idx) => (
                        <motion.div
                          key={badge.name}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          className={cn(
                            "flex flex-col items-center gap-3 p-6 rounded-[2.5rem] min-w-[140px] transition-all",
                            badge.condition ? "bg-white shadow-xl shadow-forest/[0.02]" : "bg-forest/[0.02] opacity-40 grayscale"
                          )}
                        >
                          <div className={cn(
                            "h-16 w-16 rounded-full flex items-center justify-center text-white shadow-lg",
                            badge.condition ? badge.color : "bg-forest/10"
                          )}>
                            <badge.icon className="h-8 w-8" />
                          </div>
                          <span className="text-[10px] font-black text-forest/40 uppercase tracking-widest text-center max-w-[80px]">
                            {badge.name}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </section>

                  {/* Experience Discovery */}
                  <section>
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-3xl font-heading font-bold text-forest tracking-tight">Curated Voyages</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {recommendations.map((tour, idx) => (
                        <Link key={tour.id} to={`/tours?id=${tour.id}`}>
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group relative h-64 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-forest/[0.05]"
                          >
                            <img src={tour.image} alt={tour.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-forest/20 to-transparent transition-opacity" />
                            <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col justify-end h-full">
                              <div className="flex items-center gap-2 mb-2">
                                <Star className="h-3 w-3 text-terracotta fill-current" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">{tour.rating} Rating</span>
                              </div>
                              <h4 className="text-2xl font-heading font-bold text-white mb-2 leading-tight">{tour.title}</h4>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white/70 uppercase tracking-widest">{tour.price}</span>
                                <div className="h-10 w-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 text-white group-hover:bg-white group-hover:text-forest transition-all">
                                  <ArrowRight className="h-4 w-4" />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </Link>
                      ))}
                    </div>
                  </section>
                </motion.div>
              )}

              {activeTab === 'bookings' && (
                <motion.div
                  key="bookings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-3xl font-heading font-bold text-forest tracking-tight">Full History</h2>
                    <span className="text-xs font-bold text-forest/40 uppercase tracking-widest">
                      Showing {bookings.length} journeys
                    </span>
                  </div>

                  <div className="space-y-4">
                    {bookings.length > 0 ? (
                      bookings.map((booking) => (
                        <Card key={booking.id} className="border-none bg-white rounded-3xl shadow-lg shadow-forest/[0.02] hover:shadow-xl transition-all group">
                          <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row md:items-center">
                              <div className="w-full md:w-32 h-32 relative overflow-hidden shrink-0">
                                <img 
                                  src={booking.image || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80"} 
                                  alt="" 
                                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                />
                              </div>
                              <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold text-forest/30 uppercase tracking-widest">{booking.type}</span>
                                    <span className="h-1 w-1 rounded-full bg-forest/10" />
                                    <span className="text-[10px] font-bold text-terracotta uppercase">{booking.status || 'Confirmed'}</span>
                                  </div>
                                  <h3 className="font-bold text-xl text-forest font-heading">
                                    {booking.item}
                                  </h3>
                                  <div className="flex items-center gap-4 text-[10px] text-forest/40 font-bold uppercase tracking-wider mt-2">
                                    <span className="flex items-center gap-1.5">
                                      <Calendar className="h-3 w-3 text-terracotta" />
                                      {booking.createdAt?.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                      <Hash className="h-3 w-3 text-terracotta" />
                                      Order ID: {booking.id.slice(-6).toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 justify-between md:justify-end">
                                  <div className="text-right">
                                    <p className="text-2xl font-bold text-forest">{booking.price}</p>
                                    <p className="text-[10px] text-forest/30 uppercase tracking-widest font-bold">Total Paid</p>
                                  </div>
                                  <Button size="icon" variant="ghost" className="h-12 w-12 rounded-full border border-forest/5 hover:bg-forest/5">
                                    <Download className="h-5 w-5 text-forest/40" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-forest/5">
                        <History className="h-12 w-12 text-forest/10 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-forest mb-2">No Journey History</h3>
                        <p className="text-sm text-forest/40 max-w-xs mx-auto mb-6">Your past adventures will appear here once as you complete them.</p>
                        <Button 
                          onClick={() => setActiveTab('overview')}
                          variant="outline" 
                          className="rounded-full border-forest/10 text-forest font-bold"
                        >
                          Back to Launchpad
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-heading font-bold text-forest tracking-tight">Profile Settings</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="border-none bg-white rounded-[2rem] shadow-xl shadow-forest/[0.02] p-8">
                      <h3 className="text-xl font-bold text-forest mb-6 flex items-center gap-2">
                        <Mountain className="h-5 w-5 text-terracotta" />
                        Trek & Personalization
                      </h3>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] text-forest/40 uppercase tracking-widest font-bold">Experience Level</label>
                          <div className="flex flex-wrap gap-2">
                            {['novice', 'intermediate', 'expert'].map((lvl) => (
                              <button
                                key={lvl}
                                onClick={() => setExperienceLevel(lvl)}
                                className={cn(
                                  "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                                  experienceLevel === lvl 
                                    ? "bg-forest text-white border-forest shadow-md" 
                                    : "bg-white text-forest/40 border-forest/10 hover:border-forest/30"
                                )}
                              >
                                {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] text-forest/40 uppercase tracking-widest font-bold">Preferred Difficulty</label>
                          <div className="flex flex-wrap gap-2">
                            {['easy', 'moderate', 'challenging', 'extreme'].map((d) => (
                              <button
                                key={d}
                                onClick={() => setDifficulty(d)}
                                className={cn(
                                  "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                                  difficulty === d 
                                    ? "bg-terracotta text-white border-terracotta shadow-md" 
                                    : "bg-white text-forest/40 border-forest/10 hover:border-forest/30"
                                )}
                              >
                                {d.charAt(0).toUpperCase() + d.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] text-forest/40 uppercase tracking-widest font-bold">Typical Group Size</label>
                          <div className="flex flex-wrap gap-2">
                            {['solo', 'couple', 'group'].map((g) => (
                              <button
                                key={g}
                                onClick={() => setGroupSize(g)}
                                className={cn(
                                  "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                                  groupSize === g 
                                    ? "bg-forest text-white border-forest shadow-md" 
                                    : "bg-white text-forest/40 border-forest/10 hover:border-forest/30"
                                )}
                              >
                                {g.charAt(0).toUpperCase() + g.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>

                        <Button 
                          onClick={handleUpdatePreferences}
                          disabled={isUpdating}
                          className="w-full h-14 rounded-full bg-forest text-white font-bold shadow-lg shadow-forest/20 mt-4 active:scale-95 transition-transform"
                        >
                          {isUpdating ? 'Saving Insights...' : 'Save Preferences'}
                        </Button>
                      </div>
                    </Card>

                    <Card className="border-none bg-white rounded-[2rem] shadow-xl shadow-forest/[0.02] p-8">
                      <h3 className="text-xl font-bold text-forest mb-6 flex items-center gap-2">
                        <User className="h-5 w-5 text-terracotta" />
                        Personal Information
                      </h3>
                      <div className="space-y-6">
                        <div className="space-y-1">
                          <label className="text-[10px] text-forest/40 uppercase tracking-widest font-bold">Email Address</label>
                          <div className="p-4 bg-forest/5 rounded-2xl text-forest font-medium border border-forest/5">
                            {user.email}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-forest/40 uppercase tracking-widest font-bold">Display Name</label>
                          <input 
                            type="text" 
                            defaultValue={user.displayName || ''} 
                            placeholder="Enter your name"
                            className="w-full p-4 bg-white rounded-2xl text-forest font-medium border border-forest/10 focus:border-terracotta/50 outline-none transition-all"
                          />
                        </div>
                        <Button className="w-full h-14 rounded-full bg-forest text-white font-bold shadow-lg shadow-forest/20 mt-4">
                          Update Profile
                        </Button>
                      </div>
                    </Card>

                    <Card className="border-none bg-white rounded-[2rem] shadow-xl shadow-forest/[0.02] p-8">
                      <h3 className="text-xl font-bold text-forest mb-6 flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-terracotta" />
                        Account Security
                      </h3>
                      <div className="space-y-6">
                        <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-4">
                          <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shrink-0">
                            <ShieldCheck className="h-5 w-5 text-emerald-500" />
                          </div>
                          <div>
                            <p className="font-bold text-emerald-900 text-sm">Verified Account</p>
                            <p className="text-emerald-700/60 text-xs mt-1 leading-relaxed">Your account is fully secured and verified for Himalayan travel services.</p>
                          </div>
                        </div>
                        
                        <div className="space-y-4 pt-4">
                          <button className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-forest/5 transition-colors border border-transparent hover:border-forest/5">
                            <span className="text-sm font-bold text-forest">Change Password</span>
                            <ChevronRight className="h-4 w-4 text-forest/20" />
                          </button>
                          <button className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-forest/5 transition-colors border border-transparent hover:border-forest/5">
                            <span className="text-sm font-bold text-forest">Privacy Preferences</span>
                            <ChevronRight className="h-4 w-4 text-forest/20" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
