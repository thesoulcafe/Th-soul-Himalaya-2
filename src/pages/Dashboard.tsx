import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  History,
  LogOut, 
  Mountain, 
  Compass, 
  ArrowRight,
  Hash,
  User as UserIcon,
  Mail,
  Shield,
  Star as StarIcon,
  Sparkles,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

interface Booking {
  id: string;
  item: string;
  price: string;
  type: string;
  createdAt: any;
  status: string;
  image?: string;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'history' | 'profile'>('history');
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newPincode, setNewPincode] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();

  useEffect(() => {
    if (profile) {
      setNewName(profile.displayName || '');
      setNewPhone(profile.phone || '');
      setNewCity(profile.city || '');
      setNewPincode(profile.pincode || '');
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: newName,
        phone: newPhone,
        city: newCity,
        pincode: newPincode
      });
      toast.success("Identity Manifested", {
        description: "Your soul profile has been updated successfully.",
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Manifestation Failed", {
        description: "Failed to update profile. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

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
    await logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-20">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden text-forest/5">
        <div className="absolute top-0 right-0 w-full h-[50vh] bg-gradient-to-b from-forest/[0.03] to-transparent" />
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-terracotta/[0.02] rounded-full blur-[120px]" />
        <Mountain className="absolute -bottom-40 -left-40 w-[600px] h-[600px]" />
        <Compass className="absolute top-1/4 left-1/4 w-[800px] h-[800px] -rotate-12 opacity-[0.02]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 lg:py-20 font-sans">
        {/* Header Section */}
        <div className="mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-[2px] w-12 bg-terracotta" />
                <span className="text-[10px] font-black text-terracotta uppercase tracking-[0.5em]">
                  Voyager Portal
                </span>
              </div>
              <Button 
                onClick={handleLogout}
                variant="ghost" 
                className="text-xs font-bold text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-full px-6"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <h1 className="text-5xl md:text-8xl font-playfair font-black italic text-forest leading-none tracking-tighter uppercase">
                {activeTab === 'history' ? 'Your History' : 'Soul Profile'}
              </h1>

              {/* Tab Navigation */}
              <div className="flex items-center gap-2 bg-forest/5 p-1.5 rounded-2xl">
                {[
                  { id: 'history', label: 'History', icon: History },
                  { id: 'profile', label: 'Profile', icon: UserIcon }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                      activeTab === tab.id 
                        ? "bg-white text-forest shadow-lg shadow-forest/5 scale-105" 
                        : "text-forest/40 hover:text-forest hover:bg-white/50"
                    )}
                  >
                    <tab.icon className={cn("h-3.5 w-3.5", activeTab === tab.id ? "text-terracotta" : "text-forest/20")} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Content Section */}
        <AnimatePresence mode="wait">
          {activeTab === 'history' ? (
            <motion.div 
              key="history"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="h-10 w-10 rounded-2xl bg-forest flex items-center justify-center text-white shadow-lg shadow-forest/20">
                   <History className="h-5 w-5" />
                </div>
                <p className="text-forest/60 font-medium">Tracking {bookings.length} soulful expeditions.</p>
              </div>

              {loading ? (
                <div className="py-20 text-center">
                  <div className="h-12 w-12 border-4 border-forest/10 border-t-terracotta rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-forest/40 font-bold uppercase tracking-widest text-xs">Accessing Records...</p>
                </div>
              ) : bookings.length > 0 ? (
                bookings.map((booking, idx) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="border-none bg-white rounded-[2rem] shadow-xl shadow-forest/[0.03] hover:shadow-2xl hover:shadow-forest/[0.08] transition-all group overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row md:items-center">
                          <div className="w-full md:w-48 h-48 relative overflow-hidden shrink-0">
                            <img 
                              src={booking.image || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80"} 
                              alt="" 
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-forest/40 to-transparent" />
                          </div>
                          <div className="flex-1 p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <Badge className="bg-forest/5 text-forest/40 border-none px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">
                                  {booking.type || 'Journey'}
                                </Badge>
                                <span className="h-1 w-1 rounded-full bg-forest/10" />
                                <Badge className={cn(
                                  "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                                  booking.status === 'confirmed' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                )}>
                                  {booking.status || 'Reserved'}
                                </Badge>
                              </div>
                              <h3 className="font-heading font-bold text-2xl md:text-3xl text-forest tracking-tight mb-4">
                                {booking.item}
                              </h3>
                              <div className="flex flex-wrap items-center gap-6 text-[10px] text-forest/40 font-black uppercase tracking-widest">
                                <span className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3 text-terracotta" />
                                  {booking.createdAt?.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                                <span className="flex items-center gap-2">
                                  <Hash className="h-3 w-3 text-terracotta" />
                                  ID: {booking.id.slice(-8).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-8 justify-between lg:justify-end border-t lg:border-none pt-8 lg:pt-0">
                              <div className="text-right">
                                <p className="text-3xl font-black text-forest tracking-tighter mb-1">{booking.price}</p>
                                <p className="text-[8px] text-forest/20 uppercase tracking-[0.3em] font-black">Expedition Value</p>
                              </div>
                              <Button size="icon" variant="ghost" className="h-14 w-14 rounded-2xl bg-forest/5 hover:bg-forest hover:text-white transition-all text-forest/40">
                                 <ArrowRight className="h-5 w-5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="py-32 text-center bg-white rounded-[4rem] border-2 border-dashed border-forest/5">
                  <div className="h-24 w-24 rounded-[2.5rem] bg-forest/5 flex items-center justify-center mx-auto mb-8">
                    <History className="h-10 w-10 text-forest/20" />
                  </div>
                  <h3 className="text-3xl font-heading font-black text-forest mb-4">No Journeys Found</h3>
                  <p className="text-forest/40 max-w-xs mx-auto mb-10 font-medium">Your historical expeditions will manifest here once you embark on your first journey.</p>
                  <Button 
                    onClick={() => navigate('/services')}
                    className="bg-forest text-white rounded-full px-12 h-14 text-[10px] font-black uppercase tracking-[0.4em] shadow-xl shadow-forest/20"
                  >
                    Explore Services
                  </Button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Profile Card */}
              <Card className="lg:col-span-2 border-none bg-white rounded-[3rem] shadow-xl shadow-forest/[0.03] overflow-hidden">
                <div className="h-32 bg-forest relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/topography.png")' }} />
                  <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                </div>
                <CardContent className="p-10 -mt-16">
                  <div className="flex flex-col md:flex-row gap-8 items-start md:items-end mb-12">
                    <div className="h-32 w-32 rounded-[2.5rem] bg-white p-2 shadow-2xl relative group">
                      <img 
                        src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                        alt={user.displayName || 'User'} 
                        className="w-full h-full rounded-[2rem] object-cover"
                      />
                      <div className="absolute inset-2 bg-forest/40 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <UserIcon className="text-white h-6 w-6" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                       <div className="flex items-center gap-4 group/title">
                         {isEditing ? (
                           <div className="flex items-center gap-2 w-full max-w-md">
                             <input 
                               value={newName}
                               onChange={(e) => setNewName(e.target.value)}
                               className="bg-forest/5 border border-forest/10 rounded-xl px-4 py-2 text-2xl font-heading font-black text-forest focus:outline-none focus:ring-2 focus:ring-terracotta/20 w-full"
                               autoFocus
                               placeholder="Enter your name"
                             />
                             <Button 
                               onClick={handleUpdateProfile} 
                               disabled={isSaving}
                               size="icon" 
                               className="bg-emerald-500 hover:bg-emerald-600 text-white shrink-0 rounded-xl"
                             >
                               <Check className="h-4 w-4" />
                             </Button>
                             <Button 
                               onClick={() => {
                                 setIsEditing(false);
                                 setNewName(profile?.displayName || '');
                                  setNewPhone(profile?.phone || '');
                                  setNewCity(profile?.city || '');
                                  setNewPincode(profile?.pincode || '');
                               }} 
                               size="icon" 
                               variant="ghost" 
                               className="text-forest/40 hover:bg-rose-50 hover:text-rose-500 shrink-0 rounded-xl"
                             >
                               <X className="h-4 w-4" />
                             </Button>
                           </div>
                         ) : (
                           <>
                             <h2 className="text-4xl font-heading font-black text-forest tracking-tight">{profile?.displayName || user.displayName || 'Soul Voyager'}</h2>
                             <button 
                               onClick={() => setIsEditing(true)}
                               className="p-2 rounded-full hover:bg-forest/5 text-forest/20 hover:text-terracotta transition-all opacity-0 group-hover/title:opacity-100"
                             >
                               <Edit2 className="h-4 w-4" />
                             </button>
                           </>
                         )}
                       </div>
                       <div className="flex flex-wrap gap-4">
                         <Badge className="bg-forest/5 text-forest/40 border-none px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                           <Shield className="h-3 w-3 mr-2 text-terracotta" />
                           {profile?.role || 'Voyager'}
                         </Badge>
                         <Badge className="bg-forest/5 text-forest/40 border-none px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                           <Mail className="h-3 w-3 mr-2 text-terracotta" />
                           {user.email}
                         </Badge>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-forest/5">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-forest/20 uppercase tracking-widest">Account Details</label>
                      <div className="space-y-4">
                        {[
                          { label: 'Display Name', value: profile?.displayName || user.displayName || 'Not Set', field: 'displayName' },
                          { label: 'Mobile Number', value: profile?.phone || 'Not Set', field: 'phone' },
                          { label: 'City', value: profile?.city || 'Not Set', field: 'city' },
                          { label: 'Pincode', value: profile?.pincode || 'Not Set', field: 'pincode' },
                          { label: 'Email Address', value: user.email, field: 'email' },
                          { label: 'Account Level', value: profile?.role?.toUpperCase() || 'STANDARD', field: 'role' },
                          { label: 'Member Since', value: profile?.createdAt?.toDate ? profile.createdAt.toDate().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'Recent', field: 'createdAt' }
                        ].map((item) => (
                          <div key={item.label} className="p-5 rounded-2xl bg-forest/[0.02] border border-forest/5 hover:border-terracotta/20 transition-all group relative">
                            <p className="text-[8px] font-black text-forest/30 uppercase tracking-tight mb-1">{item.label}</p>
                            {isEditing && (item.field === 'displayName' || item.field === 'phone' || item.field === 'city' || item.field === 'pincode') ? (
                              <input
                                value={
                                  item.field === 'displayName' ? newName : 
                                  item.field === 'phone' ? newPhone :
                                  item.field === 'city' ? newCity :
                                  newPincode
                                }
                                onChange={(e) => {
                                  if (item.field === 'displayName') setNewName(e.target.value);
                                  else if (item.field === 'phone') setNewPhone(e.target.value);
                                  else if (item.field === 'city') setNewCity(e.target.value);
                                  else if (item.field === 'pincode') {
                                    const val = e.target.value.replace(/\D/g, '');
                                    if (val.length <= 6) setNewPincode(val);
                                  }
                                }}
                                className="bg-transparent border-none p-0 text-sm font-bold text-forest focus:ring-0 w-full"
                                placeholder={`Enter your ${item.label.toLowerCase()}`}
                              />
                            ) : (
                              <p className="text-sm font-bold text-forest">{item.value}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-forest/20 uppercase tracking-widest">Spirit Stats</label>
                      <div className="p-8 rounded-[2.5rem] bg-forest text-white shadow-2xl shadow-forest/20 relative overflow-hidden h-full">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                          <Sparkles className="h-32 w-32" />
                        </div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 text-terracotta mb-4">
                               <StarIcon className="h-5 w-5 fill-current" />
                               <span className="text-[10px] font-black uppercase tracking-[0.3em]">Himalayan Loyalty</span>
                            </div>
                            <div className="text-7xl font-black italic tracking-tighter mb-2">
                              {profile?.loyaltyPoints || 0}
                            </div>
                            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Loyalty Points Earned</p>
                          </div>
                          
                          <div className="mt-12 pt-8 border-t border-white/10">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Soul Energy</span>
                              <span className="text-[10px] font-black text-terracotta">{profile?.soulPoints || 0}%</span>
                            </div>
                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((profile?.soulPoints || 0), 100)}%` }}
                                className="h-full bg-terracotta"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sidebar Action Card */}
              <div className="space-y-8">
                 <Card className="border-none bg-terracotta p-8 rounded-[3rem] text-white shadow-xl shadow-terracotta/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                      <Compass className="h-20 w-20" />
                    </div>
                    <h4 className="text-2xl font-heading font-black italic mb-4 relative z-10">Need Assistance?</h4>
                    <p className="text-white/70 text-xs font-medium leading-relaxed mb-8 relative z-10">Our Himalayan experts are ready to personalize your next spiritual journey.</p>
                    <Button 
                      onClick={() => navigate('/contact')}
                      className="w-full bg-white text-terracotta rounded-full h-14 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-forest hover:text-white transition-all relative z-10"
                    >
                      Connect with Expert
                    </Button>
                 </Card>

                 <div className="p-8 rounded-[2rem] bg-forest/5 border border-forest/5">
                    <h5 className="text-[10px] font-black text-forest uppercase tracking-widest mb-6">Security & Privacy</h5>
                    <div className="space-y-4">
                      <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white transition-all group">
                        <span className="text-xs font-bold text-forest/60 group-hover:text-forest">Privacy Policy</span>
                        <ArrowRight className="h-4 w-4 text-forest/20 group-hover:text-terracotta group-hover:translate-x-1 transition-all" />
                      </button>
                      <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white transition-all group">
                        <span className="text-xs font-bold text-forest/60 group-hover:text-forest">Terms of Service</span>
                        <ArrowRight className="h-4 w-4 text-forest/20 group-hover:text-terracotta group-hover:translate-x-1 transition-all" />
                      </button>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
