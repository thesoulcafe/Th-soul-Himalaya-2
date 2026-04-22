import { useEffect, useState, useMemo } from 'react';
import { auth, db } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
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
  History,
  Sparkles
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
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [mobile, setMobile] = useState(profile?.mobile || '');
  const [city, setCity] = useState(profile?.city || '');
  const [pincode, setPincode] = useState(profile?.pincode || '');
  const [privacySettings, setPrivacySettings] = useState({
    profileVisible: profile?.privacy?.profileVisible ?? true,
    emailNotifications: profile?.privacy?.emailNotifications ?? true,
    shareStats: profile?.privacy?.shareStats ?? false
  });

  useEffect(() => {
    if (profile) {
      setExperienceLevel(profile.experienceLevel || 'novice');
      setDifficulty(profile.trekPreferences?.difficulty || 'moderate');
      setGroupSize(profile.trekPreferences?.groupSize || 'solo');
      setMobile(profile.mobile || '');
      setCity(profile.city || '');
      setPincode(profile.pincode || '');
      setPrivacySettings({
        profileVisible: profile.privacy?.profileVisible ?? true,
        emailNotifications: profile.privacy?.emailNotifications ?? true,
        shareStats: profile.privacy?.shareStats ?? false
      });
    }
    if (user) {
      setDisplayName(user.displayName || '');
    }
  }, [profile, user]);

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
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-[50vh] bg-gradient-to-b from-forest/[0.03] to-transparent" />
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-terracotta/[0.02] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-forest/[0.02] rounded-full blur-[100px]" />
        <Mountain className="absolute -bottom-40 -left-40 w-[600px] h-[600px] text-forest/5" />
        <Compass className="absolute top-1/4 left-1/4 w-[800px] h-[800px] text-forest/[0.01] -rotate-12" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#254336 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
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
        <aside className="fixed left-0 top-20 bottom-0 w-72 bg-white/70 backdrop-blur-xl border-r border-forest/5 hidden lg:flex flex-col p-8 z-20 transition-all duration-500">
          <div className="relative mb-10 pb-10 border-b border-forest/5">
            <button 
              onClick={() => setActiveTab('settings')}
              className="group/profile block w-full text-left"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-forest to-forest/80 flex items-center justify-center p-1 shadow-2xl relative z-10 overflow-hidden transform group-hover/profile:-rotate-6 transition-transform duration-500">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || ''} className="h-full w-full object-cover rounded-xl" />
                    ) : (
                      <User className="h-8 w-8 text-white/50" />
                    )}
                  </div>
                  <div className="absolute -inset-1 bg-terracotta/20 rounded-2xl blur-lg opacity-0 group-hover/profile:opacity-100 transition-opacity" />
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 h-5 w-5 rounded-full border-4 border-white flex items-center justify-center z-20">
                    <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                  </div>
                </div>
                <div>
                  <p className="font-heading font-black text-lg text-forest tracking-tight leading-none mb-1">
                    {user.displayName?.split(' ')[0] || 'Explorer'}
                  </p>
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-forest/40 uppercase tracking-widest">Base Camp</span>
                  </div>
                </div>
              </div>
            </button>
            
            {/* Quick Stats in Sidebar */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-forest/[0.03] p-3 rounded-2xl">
                <p className="text-[8px] font-black text-forest/30 uppercase tracking-[0.2em] mb-1">Soul Pts</p>
                <p className="text-sm font-black text-forest">{bookings.length * 250}</p>
              </div>
              <div className="bg-terracotta/[0.03] p-3 rounded-2xl">
                <p className="text-[8px] font-black text-terracotta/30 uppercase tracking-[0.2em] mb-1">Exp Level</p>
                <p className="text-sm font-black text-terracotta">12</p>
              </div>
            </div>
          </div>

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
        <main className="flex-1 lg:ml-72 p-6 lg:p-14 bg-[#FAFAF9]">
          <div className="max-w-6xl mx-auto">
            {/* Artistic Header Section */}
            <div className="mb-16 relative">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6 relative z-10"
              >
                <div className="flex items-center gap-4">
                  <div className="h-[2px] w-16 bg-terracotta" />
                  <span className="text-[10px] font-black text-terracotta uppercase tracking-[0.5em] font-montserrat">
                    Eternal Peak Terminal
                  </span>
                </div>
                
                <div className="space-y-0 relative">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.8 }}
                    className="relative"
                  >
                    <div className="flex items-center gap-6 mb-2">
                       <div className="h-px w-12 bg-terracotta/30" />
                       <span className="text-xs font-black uppercase tracking-[0.6em] text-terracotta/40">Portal Access Granted</span>
                    </div>
                    
                    <div className="relative group flex items-center">
                      <h1 className="text-4xl sm:text-7xl md:text-9xl lg:text-[12rem] font-playfair font-black italic text-forest leading-[0.8] tracking-tighter uppercase relative z-20 group-hover:tracking-normal transition-all duration-1000">
                        Welcome
                      </h1>
                      
                      {/* Artistic Layer - The Ghost */}
                      <motion.span 
                        animate={{ opacity: [0.1, 0.2, 0.1], x: [-5, 15, -5], skewX: [-2, 2, -2] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 text-4xl sm:text-7xl md:text-9xl lg:text-[12rem] font-playfair font-black italic text-terracotta leading-[0.8] tracking-tighter uppercase z-10 select-none blur-[2px]"
                      >
                        Welcome
                      </motion.span>

                      {/* Floating Particles */}
                      <motion.div 
                        animate={{ 
                          y: [-20, 20, -20],
                          rotate: [0, 360],
                          scale: [1, 1.2, 1]
                        }}
                        transition={{ duration: 15, repeat: Infinity }}
                        className="absolute -top-10 left-1/4 h-24 w-24 bg-terracotta/5 rounded-full blur-2xl"
                      />
                    </div>
                    
                    <div className="flex items-center gap-8 mt-6">
                      <div className="h-px flex-grow bg-forest/5" />
                      <div className="flex items-center gap-4">
                        <Sparkles className="h-4 w-4 text-terracotta" />
                        <span className="font-fluid text-2xl text-terracotta italic">You have arrived at your soulful destination.</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-4">
                  <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-forest/5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-forest/40 uppercase tracking-widest">Profile Verified</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-forest/5">
                    <div className="h-2 w-2 rounded-full bg-terracotta" />
                    <span className="text-[10px] font-black text-forest/40 uppercase tracking-widest">Level 1 Voyager</span>
                  </div>
                </div>
              </motion.div>
              
              {/* Abstract decorative element */}
              <div className="absolute -top-20 -right-20 w-96 h-96 bg-terracotta/5 rounded-full blur-[100px] -z-10" />
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-16"
                >
                  {/* Creative Bento Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Hero Stat - Journeys */}
                    <div className="md:col-span-2 md:row-span-2 group">
                      <Card className="h-full border-none bg-forest text-white overflow-hidden rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl relative transition-all duration-700 hover:shadow-forest/30 hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-terracotta/20 to-transparent rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110" />
                        <CardContent className="p-8 md:p-12 flex flex-col justify-between h-full relative z-10">
                          <div className="flex items-center justify-between mb-12 md:mb-16">
                            <div className="h-12 w-12 md:h-16 md:w-16 rounded-[1.5rem] md:rounded-[2rem] bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/10">
                              <Mountain className="h-6 w-6 md:h-8 md:w-8 text-terracotta" />
                            </div>
                            <Badge className="bg-emerald-500 text-white border-none px-4 md:px-5 py-1.5 md:py-2 rounded-full text-[8px] md:text-[10px] font-black tracking-widest shadow-lg shadow-emerald-500/20 uppercase">
                              Active Soul
                            </Badge>
                          </div>
                          <div>
                            <p className="text-[9px] md:text-[11px] text-white/30 font-black uppercase tracking-[0.4em] mb-3 md:mb-4 font-montserrat">Journeys Taken</p>
                            <div className="flex items-baseline gap-4 mb-4 md:mb-6">
                              <h3 className="text-6xl md:text-8xl font-heading font-black tracking-tighter">{bookings.length}</h3>
                              <span className="text-terracotta font-black text-[10px] md:text-sm uppercase tracking-widest">Completed</span>
                            </div>
                            <div className="flex items-center gap-3 py-3 md:py-4 px-4 md:px-6 bg-white/5 rounded-2xl w-fit border border-white/5 group-hover:bg-white/10 transition-colors">
                              <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-emerald-400" />
                              <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/60">Veteran since 2024</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Credit Stat */}
                    <div className="md:col-span-2 group">
                      <Card className="h-full border-none bg-white overflow-hidden rounded-[2.5rem] md:rounded-[3rem] shadow-xl shadow-forest/[0.03] relative transition-all duration-500 hover:shadow-forest/[0.06] hover:-translate-y-1 bg-gradient-to-br from-white to-orange-50/20">
                        <CardContent className="p-8 md:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-6 md:gap-10 h-full">
                          <div className="h-16 w-16 md:h-20 md:w-20 rounded-[1.5rem] md:rounded-[2rem] bg-terracotta/10 flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform">
                            <Wallet className="h-6 w-6 md:h-8 md:w-8 text-terracotta" />
                          </div>
                          <div className="flex-grow w-full">
                            <p className="text-[9px] md:text-[10px] text-forest/30 font-black uppercase tracking-[0.3em] mb-2 font-montserrat">Soul Credits</p>
                            <div className="flex items-center justify-between">
                              <h3 className="text-4xl md:text-5xl font-heading font-black text-forest tracking-tighter">₹1,500</h3>
                              <Button variant="ghost" className="h-10 w-10 rounded-full border border-forest/5 text-forest/40 hover:text-terracotta hover:bg-terracotta/5">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Progress Stat */}
                    <div className="md:col-span-1 group">
                      <Card className="h-full border-none bg-white overflow-hidden rounded-[2.5rem] md:rounded-[3rem] shadow-xl shadow-forest/[0.03] transition-all duration-500 hover:-translate-y-1 group">
                        <CardContent className="p-8 md:p-10 flex flex-col justify-between h-full">
                          <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Zap className="h-5 w-5 md:h-6 md:w-6 text-amber-500" />
                          </div>
                          <div className="mt-8 md:mt-12">
                            <p className="text-[8px] md:text-[9px] text-forest/30 font-black uppercase tracking-[0.2em] mb-2 font-montserrat">Experience Pts</p>
                            <h3 className="text-3xl md:text-4xl font-heading font-black text-forest tracking-tighter">{bookings.length * 250}</h3>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Trust Stat */}
                    <div className="md:col-span-1 group">
                      <Card className="h-full border-none bg-[#111827] text-white overflow-hidden rounded-[2.5rem] md:rounded-[3rem] shadow-xl shadow-forest/[0.03] transition-all duration-500 hover:-translate-y-1">
                        <CardContent className="p-8 md:p-10 flex flex-col justify-between h-full">
                          <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-white/10 flex items-center justify-center">
                            <ShieldCheck className="h-5 w-5 md:h-6 md:w-6 text-emerald-400" />
                          </div>
                          <div className="mt-8 md:mt-12">
                            <p className="text-[8px] md:text-[9px] text-white/30 font-black uppercase tracking-[0.2em] mb-2 font-montserrat">Profile Trust</p>
                            <h3 className="text-3xl md:text-4xl font-heading font-black text-white tracking-tighter">100%</h3>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Enhanced Active Journey Section */}
                  <section>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-6">
                      <div className="flex items-center gap-6">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-[1rem] md:rounded-[1.25rem] bg-terracotta flex items-center justify-center shadow-2xl shadow-terracotta/30">
                          <Compass className="h-5 w-5 md:h-6 md:w-6 text-white animate-spin-slow" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-heading font-black text-forest tracking-tight italic">Current Expedition</h2>
                      </div>
                      <button onClick={() => setActiveTab('bookings')} className="group flex items-center gap-3 text-[10px] font-black text-terracotta uppercase tracking-[0.4em] hover:gap-5 transition-all">
                        LOGBOOK <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>

                    {bookings.length > 0 ? (
                      <Card className="border-none bg-white overflow-hidden shadow-2xl shadow-forest/[0.08] rounded-[2.5rem] md:rounded-[4rem] group hover:shadow-forest/[0.12] transition-all duration-[1s]">
                        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-fit lg:min-h-[500px]">
                          <div className="lg:col-span-5 relative overflow-hidden h-64 sm:h-96 lg:h-auto">
                            <img 
                              src={bookings[0].image || "https://images.unsplash.com/photo-1506466010722-395aa2bef877?auto=format&fit=crop&w=800&q=80"} 
                              alt={bookings[0].item}
                              className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-125 transition-transform duration-[3s] ease-out shadow-inner"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-forest/20 to-transparent" />
                            <div className="absolute bottom-8 md:bottom-12 left-8 md:left-12">
                              <Badge className="bg-terracotta text-white border-none px-4 md:px-6 py-1.5 md:py-2 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-3 md:mb-4 shadow-xl">
                                {bookings[0].type?.toUpperCase() || 'JOURNEY'}
                              </Badge>
                              <div className="flex items-center gap-2 md:gap-3 text-white/90 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">
                                <MapPin className="h-3 w-3 md:h-4 md:w-4 text-terracotta" />
                                Base Camp: Manali
                              </div>
                            </div>
                          </div>
                          <CardContent className="lg:col-span-7 p-8 md:p-12 lg:p-20 flex flex-col justify-between bg-white relative">
                            <div className="absolute top-0 right-0 p-8 md:p-12 opacity-[0.03] group-hover:rotate-45 transition-transform duration-[2s]">
                              <Mountain className="h-48 w-48 md:h-64 md:w-64" />
                            </div>
                            
                            <div className="relative z-10">
                              <div className="flex flex-row items-center justify-between mb-8 md:mb-12">
                                <div className="space-y-1 md:space-y-2">
                                  <p className="text-[8px] md:text-[10px] font-black text-forest/30 uppercase tracking-[0.4em] md:tracking-[0.5em]">Network Status</p>
                                  <div className="flex items-center gap-2 md:gap-3">
                                    <div className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] md:text-xs font-black text-emerald-600 uppercase tracking-widest">{bookings[0].status || 'EN ROUTE'}</span>
                                  </div>
                                </div>
                                <div className="h-14 w-14 md:h-20 md:w-20 rounded-full border border-forest/5 flex items-center justify-center p-0.5 md:p-1 shrink-0">
                                  <div className="h-full w-full rounded-full border border-dashed border-terracotta/30 flex items-center justify-center animate-spin-slow">
                                    <Star className="h-5 w-5 md:h-8 md:w-8 text-terracotta" />
                                  </div>
                                </div>
                              </div>
                              
                              <h3 className="text-4xl md:text-6xl lg:text-8xl font-heading font-black text-forest mb-8 md:mb-12 leading-[1.1] md:leading-[0.9] tracking-tighter">
                                {bookings[0].item || 'Untitled Expedition'}
                              </h3>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-16 mb-10 md:mb-16">
                                <div className="space-y-3 md:space-y-4">
                                  <p className="text-[8px] md:text-[10px] text-forest/30 uppercase tracking-[0.4em] md:tracking-[0.5em] font-black">Departure</p>
                                  <div className="flex items-center gap-3 md:gap-4 text-forest font-black tracking-tight group/date">
                                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-[1rem] md:rounded-2xl bg-forest/5 flex items-center justify-center group-hover/date:bg-forest group-hover/date:text-white transition-all">
                                      <Calendar className="h-4 w-4 md:h-5 md:w-5 text-terracotta group-hover/date:text-white" />
                                    </div>
                                    <span className="text-lg md:text-xl">
                                      {bookings[0].dateRange?.split(' to ')[0] || 'TBD'}
                                    </span>
                                  </div>
                                </div>
                                <div className="space-y-3 md:space-y-4">
                                  <p className="text-[8px] md:text-[10px] text-forest/30 uppercase tracking-[0.4em] md:tracking-[0.5em] font-black">Expedition Goal</p>
                                  <div className="flex items-center gap-3 md:gap-4 text-forest font-black tracking-tight">
                                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-[1rem] md:rounded-2xl bg-forest/5 flex items-center justify-center">
                                      <Zap className="h-4 w-4 md:h-5 md:w-5 text-amber-500" />
                                    </div>
                                    <span className="text-lg md:text-xl italic">Peak Mastery</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 pt-8 md:pt-12 border-t border-forest/5 relative z-10">
                              <Button className="w-full sm:w-auto rounded-full bg-forest text-white px-8 md:px-14 h-14 md:h-16 text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-forest/30 hover:scale-105 active:scale-95 transition-all">
                                Analyze Itinerary
                              </Button>
                              <Button variant="outline" className="w-full sm:w-auto rounded-full border-forest/10 text-forest h-14 md:h-16 px-8 md:px-10 text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-forest hover:text-white transition-all">
                                Contact Guide
                              </Button>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    ) : (
                      <Card className="border-none bg-gradient-to-br from-forest/5 to-white rounded-[4rem] shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.05] group-hover:scale-110 transition-transform duration-1000">
                          <Mountain className="h-64 w-64" />
                        </div>
                        <CardContent className="py-40 text-center relative z-10">
                          <div className="h-32 w-32 rounded-[3.5rem] bg-white shadow-2xl flex items-center justify-center mx-auto mb-10 relative">
                            <div className="absolute inset-0 bg-terracotta/10 rounded-[3.5rem] animate-ping" />
                            <Star className="h-12 w-12 text-terracotta" />
                          </div>
                          <h3 className="text-5xl font-heading font-black text-forest mb-6 tracking-tighter">Your legend is unwritten.</h3>
                          <p className="text-forest/40 mb-12 max-w-lg mx-auto font-medium text-lg leading-relaxed">
                            The eternal peaks of the Himalayas are echoing for their next soulful traveler. Step into the adventure of a lifetime.
                          </p>
                          <Button 
                            onClick={() => navigate('/services')}
                            className="bg-terracotta text-white rounded-full px-20 h-20 text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-terracotta/30 hover:scale-110 transition-all active:scale-95 border-none"
                          >
                            Invoke Destiny
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
                        <Card key={booking.id} className="border-none bg-white rounded-[1.5rem] md:rounded-3xl shadow-lg shadow-forest/[0.02] hover:shadow-xl transition-all group overflow-hidden">
                          <CardContent className="p-0">
                            <div className="flex flex-col sm:flex-row sm:items-center">
                              <div className="w-full sm:w-32 h-32 relative overflow-hidden shrink-0">
                                <img 
                                  src={booking.image || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80"} 
                                  alt="" 
                                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                />
                              </div>
                              <div className="flex-1 p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold text-forest/30 uppercase tracking-widest">{booking.type}</span>
                                    <span className="h-1 w-1 rounded-full bg-forest/10" />
                                    <span className="text-[10px] font-bold text-terracotta uppercase">{booking.status || 'Confirmed'}</span>
                                  </div>
                                  <h3 className="font-bold text-lg md:text-xl text-forest font-heading">
                                    {booking.item}
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-3 md:gap-4 text-[9px] md:text-[10px] text-forest/40 font-bold uppercase tracking-wider mt-2">
                                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                                      <Calendar className="h-3 w-3 text-terracotta" />
                                      {booking.createdAt?.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                                      <Hash className="h-3 w-3 text-terracotta" />
                                      ID: {booking.id.slice(-6).toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 justify-between md:justify-end border-t md:border-none pt-4 md:pt-0">
                                  <div className="text-right">
                                    <p className="text-xl md:text-2xl font-bold text-forest">{booking.price}</p>
                                    <p className="text-[9px] md:text-[10px] text-forest/30 uppercase tracking-widest font-bold">Total Paid</p>
                                  </div>
                                  <Button size="icon" variant="ghost" className="h-10 w-10 md:h-12 md:w-12 rounded-full border border-forest/5 hover:bg-forest/5">
                                    <Download className="h-4 w-4 md:h-5 md:w-5 text-forest/40" />
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
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Enter your name"
                            className="w-full p-4 bg-white rounded-2xl text-forest font-medium border border-forest/10 focus:border-terracotta/50 outline-none transition-all"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-forest/40 uppercase tracking-widest font-bold">Mobile Number</label>
                          <input 
                            type="tel" 
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            placeholder="+91 00000 00000"
                            className="w-full p-4 bg-white rounded-2xl text-forest font-medium border border-forest/10 focus:border-terracotta/50 outline-none transition-all"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] text-forest/40 uppercase tracking-widest font-bold">City</label>
                            <input 
                              type="text" 
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              placeholder="Kullu"
                              className="w-full p-4 bg-white rounded-2xl text-forest font-medium border border-forest/10 focus:border-terracotta/50 outline-none transition-all"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-forest/40 uppercase tracking-widest font-bold">Pincode</label>
                            <input 
                              type="text" 
                              value={pincode}
                              onChange={(e) => setPincode(e.target.value)}
                              placeholder="175101"
                              className="w-full p-4 bg-white rounded-2xl text-forest font-medium border border-forest/10 focus:border-terracotta/50 outline-none transition-all"
                            />
                          </div>
                        </div>

                        <Button 
                          onClick={async () => {
                            if (user) {
                              try {
                                const docRef = doc(db, 'users', user.uid);
                                await updateDoc(docRef, { 
                                  displayName, 
                                  mobile, 
                                  city, 
                                  pincode 
                                });
                                alert("Personal information updated successfully!");
                              } catch (err) {
                                console.error("Profile update failed:", err);
                                alert("Failed to update profile. Please try again.");
                              }
                            }
                          }}
                          className="w-full h-14 rounded-full bg-forest text-white font-bold shadow-lg shadow-forest/20 mt-4"
                        >
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
                          <button 
                            onClick={async () => {
                              if (user?.email) {
                                try {
                                  await sendPasswordResetEmail(auth, user.email);
                                  alert(`Password reset link sent to ${user.email}`);
                                } catch (err) {
                                  console.error("Password reset failed:", err);
                                  alert("Failed to send reset link. Please try again.");
                                }
                              }
                            }}
                            className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-forest/5 transition-colors border border-transparent hover:border-forest/5"
                          >
                            <span className="text-sm font-bold text-forest text-left">Change Password</span>
                            <ChevronRight className="h-4 w-4 text-forest/20" />
                          </button>
                          
                          <div className="space-y-4 pt-4">
                            <p className="text-[10px] text-forest/40 uppercase tracking-widest font-bold px-4">Privacy Preferences</p>
                            
                            <label className="flex items-center justify-between p-4 rounded-2xl hover:bg-forest/5 transition-colors cursor-pointer group">
                              <span className="text-sm font-bold text-forest">Public Explorer Profile</span>
                              <input 
                                type="checkbox" 
                                checked={privacySettings.profileVisible}
                                onChange={async (e) => {
                                  const newVal = e.target.checked;
                                  setPrivacySettings(prev => ({ ...prev, profileVisible: newVal }));
                                  if (user) {
                                    const docRef = doc(db, 'users', user.uid);
                                    await updateDoc(docRef, { 'privacy.profileVisible': newVal });
                                  }
                                }}
                                className="h-5 w-5 accent-terracotta"
                              />
                            </label>

                            <label className="flex items-center justify-between p-4 rounded-2xl hover:bg-forest/5 transition-colors cursor-pointer group">
                              <span className="text-sm font-bold text-forest">Email Expedition Logs</span>
                              <input 
                                type="checkbox" 
                                checked={privacySettings.emailNotifications}
                                onChange={async (e) => {
                                  const newVal = e.target.checked;
                                  setPrivacySettings(prev => ({ ...prev, emailNotifications: newVal }));
                                  if (user) {
                                    const docRef = doc(db, 'users', user.uid);
                                    await updateDoc(docRef, { 'privacy.emailNotifications': newVal });
                                  }
                                }}
                                className="h-5 w-5 accent-terracotta"
                              />
                            </label>
                          </div>
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
