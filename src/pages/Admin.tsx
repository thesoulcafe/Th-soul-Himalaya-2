import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Edit2, Trash2, Save, X, Package, Map, ShoppingBag, 
  Flower2, Users, History, LayoutDashboard, TrendingUp, DollarSign,
  CheckCircle2, Clock, AlertCircle, Search, Filter, ChevronRight,
  LogOut, ShieldCheck, Star, LogIn, RefreshCw, Zap, Laptop, Compass, Wind, Menu,
  MessageCircle as MessageCircleIcon, Mail, Eye, EyeOff, Activity, Calendar,
  ArrowUpRight, ArrowDownRight, MoreVertical, Settings, Bell, Upload, Sparkles,
  Share2, Send, Instagram
} from 'lucide-react';
import { 
  DEFAULT_TOURS, 
  DEFAULT_TREKKS, 
  DEFAULT_SHOP, 
  DEFAULT_YOGA, 
  DEFAULT_MEDITATION,
  DEFAULT_ADVENTURE,
  DEFAULT_WFH,
  DEFAULT_SERVICES
} from '@/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { auth, db } from '@/lib/firebase';
import { 
  collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, 
  query, where, serverTimestamp, orderBy, limit, getDoc
} from 'firebase/firestore';
import { cn } from '@/lib/utils';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

type AdminTab = 'overview' | 'content' | 'bookings' | 'users' | 'messages' | 'seo_manager';
type ContentType = 'tour' | 'trekk' | 'shop_item' | 'service' | 'yoga' | 'meditation' | 'adventure' | 'wfh' | 'itinerary' | 'config' | 'page_parvati' | 'instagram' | 'all';

interface ContentItem {
  id: string;
  type: ContentType;
  data: any;
  updatedAt: any;
}

interface Message {
  id: string;
  userId: string | null;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: any;
}

interface Booking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items?: {
    id: string;
    name: string;
    type: string;
    price: number;
    quantity: number;
  }[];
  // Backward compatibility
  serviceType?: string;
  serviceName?: string;
  date?: string;
  guests?: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'paid' | 'reserved';
  totalPrice: number;
  createdAt: any;
}

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'user' | 'admin';
  loyaltyPoints: number;
  isBlocked?: boolean;
  createdAt?: any;
  phone?: string;
}

export default function Admin() {
  const { profile, loading, login, logout, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const coverInputRef = React.useRef<HTMLInputElement>(null);
  const galleryInputRef = React.useRef<HTMLInputElement>(null);
  const [activeMainTab, setActiveMainTab] = useState<AdminTab>((searchParams.get('tab') as AdminTab) || 'overview');
  const [activeContentTab, setActiveContentTab] = useState<ContentType>((searchParams.get('type') as ContentType) || 'tour');
  
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [tourCategories, setTourCategories] = useState<string[]>(['Romantic', 'Wellness', 'Corporate', 'Backpacker', 'Adventure', 'Mix-up']);
  const [newCategory, setNewCategory] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const parseExperienceToItinerary = (exp: string) => {
    if (!exp || typeof exp !== 'string') return [];
    
    // Split by newlines and handle various "Day X:" headers
    const segments = exp.split(/\n/).filter(l => l.trim() !== '');
    
    return segments.map((segment, index) => {
      const trimmed = segment.trim();
      // Match patterns like "Day 1:", "Day 1 Experience:", etc.
      const match = trimmed.match(/^((?:Day|Week|Morning|Afternoon|Evening)\s*(\d*|))\s*:\s*(.*)/i);
      
      if (match) {
        const header = match[1];
        const content = match[3];
        // Try to split title and description by the first period
        const firstPeriod = content.indexOf('.');
        let title = '';
        let description = content;
        
        if (firstPeriod !== -1 && firstPeriod < 50) {
          title = content.substring(0, firstPeriod).trim();
          description = content.substring(firstPeriod + 1).trim();
        }

        return {
          day: index + 1,
          title: title || header,
          description: description || content
        };
      }
      
      return {
        day: index + 1,
        title: '',
        description: trimmed
      };
    });
  };

  const startEditing = (item: ContentItem) => {
    setIsEditing(item.id);
    let data = { ...item.data };
    
    // Auto-convert legacy 'theExperience' string to 'itinerary' array if itinerary is missing
    if ((!data.itinerary || !Array.isArray(data.itinerary) || data.itinerary.length === 0) && data.theExperience) {
      data.itinerary = parseExperienceToItinerary(data.theExperience);
    }
    
    setFormData(data);
  };
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string, index?: number) => {
    // 0. Safety Check
    if (isUploading) {
      console.warn("Upload already in progress. Ignoring request.");
      return;
    }

    const file = e.target.files?.[0];
    if (!file) {
      console.warn("No file selected.");
      return;
    }

    console.log("--- File Upload Sequence Started ---");
    console.log(`File: ${file.name}, Size: ${(file.size / 1024).toFixed(2)} KB, Type: ${file.type}`);

    // 1. Client-side Validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      const msg = `Invalid file type (${file.type}). Please upload a JPEG, PNG, or WebP image.`;
      console.error(msg);
      setNotification({ message: msg, type: 'error' });
      e.target.value = '';
      return;
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      const msg = `File too large (${(file.size / (1024 * 1024)).toFixed(2)} MB). Max 10MB allowed.`;
      console.error(msg);
      setNotification({ message: msg, type: 'error' });
      e.target.value = '';
      return;
    }

    // 2. Prepare Upload
    setIsUploading(true);
    setUploadProgress(10); // Start with some progress
    
    try {
      console.log("Uploading to server /api/upload...");
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `Upload failed with status ${response.status}` }));
        throw new Error(errorData.error || `Upload failed with status ${response.status}`);
      }

      const result = await response.json();
      const downloadURL = result.url;
      
      console.log("File uploaded successfully:", downloadURL);
      setUploadProgress(100);
      
      setFormData(prev => {
        const updated = { ...prev };
        if (fieldName === 'image') {
          updated.image = downloadURL;
        } else if (fieldName === 'tempLink') {
          updated.tempLink = downloadURL;
        } else if (fieldName === 'images' && typeof index === 'number') {
          const currentImages = Array.isArray(prev.images) ? [...prev.images] : [];
          currentImages[index] = downloadURL;
          updated.images = currentImages;
        } else if (fieldName === 'new_image') {
          const currentImages = Array.isArray(prev.images) ? [...prev.images] : [];
          updated.images = [...currentImages, downloadURL];
        }
        return updated;
      });

      setNotification({ message: 'Media synced successfully!', type: 'success' });
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    } catch (error: any) {
      console.error("UPLOAD FAILURE:", error);
      
      setNotification({ 
        message: error.message || "Failed to upload file to server.", 
        type: 'error' 
      });
      
      setIsUploading(false);
      setUploadProgress(0);
    } finally {
      // Clear the input so the same file can be selected again
      if (e.target) e.target.value = '';
    }
  };
  const [searchTerm, setSearchTerm] = useState('');

  // Password Protection State
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  // Custom Notifications & Confirmations
  const [isSyncing, setIsSyncing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [seoFormData, setSeoFormData] = useState({ path: '', keyword: '', title: '', description: '' });
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ message: string; onConfirm: () => void | Promise<void> } | null>(null);

  // The admin password from environment or default
  const REQUIRED_PASSWORD = (import.meta as any).env.VITE_ADMIN_PASSWORD || "SoulHimalaya2024";

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === REQUIRED_PASSWORD) {
      setIsAuthorized(true);
      setPasswordError(false);
      // Store authorization in session storage
      sessionStorage.setItem('soul_himalaya_admin_auth', 'true');
    } else {
      setPasswordError(true);
      setAdminPassword('');
    }
  };

  // Check session storage on mount
  useEffect(() => {
    const isAuth = sessionStorage.getItem('soul_himalaya_admin_auth');
    if (isAuth === 'true') {
      setIsAuthorized(true);
    }
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Real-time listeners
  useEffect(() => {
    if (!profile || !isAuthorized) return;
    // Check if it's a gmail account as requested
    if (!profile.email?.endsWith('@gmail.com')) return;

    // Content Listener
    const contentQuery = query(collection(db, 'content'), orderBy('updatedAt', 'desc'));
    const unsubscribeContent = onSnapshot(contentQuery, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ContentItem[];
      setContentItems(items);
      
      // Sync categories from config if exists
      const configItem = items.find(i => i.type === 'config');
      if (configItem?.data?.tourCategories) {
        setTourCategories(configItem.data.tourCategories);
      }
    });

    // Bookings Listener
    const bookingsQuery = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Booking[]);
    });

    // Users Listener
    const usersQuery = query(collection(db, 'users'), limit(100));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id })) as UserProfile[]);
    });

    // Messages Listener
    const messagesQuery = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Message[]);
    });

    return () => {
      unsubscribeContent();
      unsubscribeBookings();
      unsubscribeUsers();
      unsubscribeMessages();
    };
  }, [profile, isAuthorized]);

  // Handle deep linking for editing
  useEffect(() => {
    if (contentItems.length > 0 && isAuthorized) {
      const editId = searchParams.get('edit');
      if (editId) {
        const item = contentItems.find(i => i.id === editId);
        if (item) {
          startEditing(item);
          // Clear the param so it doesn't reopen on refresh
          const newParams = new URLSearchParams(searchParams);
          newParams.delete('edit');
          setSearchParams(newParams);
        }
      }
    }
  }, [contentItems, isAuthorized, searchParams, setSearchParams]);

  // Analytics Calculations
  const stats = useMemo(() => {
    const totalRevenue = bookings.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
    const confirmedBookings = bookings.filter(b => ['confirmed', 'paid', 'reserved'].includes(b.status)).length;
    
    // Most Sold Trekk
    const itemsList: any[] = [];
    bookings.forEach(b => {
      if (b.items && Array.isArray(b.items)) {
        itemsList.push(...b.items);
      } else if (b.serviceName) {
        itemsList.push({ name: b.serviceName, type: b.serviceType });
      }
    });

    const trekkBookings = itemsList.filter(i => i.type === 'trekk' || i.type === 'trek');
    const trekkCounts: Record<string, number> = {};
    trekkBookings.forEach(i => {
      trekkCounts[i.name] = (trekkCounts[i.name] || 0) + (i.quantity || 1);
    });
    const mostSoldTrekk = Object.entries(trekkCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      totalRevenue,
      confirmedBookings,
      totalUsers: users.length,
      mostSoldTrekk
    };
  }, [bookings, users]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="h-12 w-12 border-4 border-terracotta border-t-transparent rounded-full"
      />
    </div>
  );

  if (!profile || !isAuthorized || !profile.email?.endsWith('@gmail.com')) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center p-6 font-sans selection:bg-terracotta/30">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-terracotta/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-forest/10 rounded-full blur-[120px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full relative z-10"
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-forest border border-white/10 shadow-2xl mb-6">
              <ShieldCheck className="h-8 w-8 text-terracotta" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-white tracking-tight mb-2">Soul Admin</h1>
            <p className="text-white/40 text-sm font-medium uppercase tracking-[0.2em]">Management Terminal</p>
          </div>

          <Card className="border border-white/5 shadow-2xl rounded-[2.5rem] bg-white/[0.03] backdrop-blur-xl overflow-hidden">
            <CardContent className="p-10">
              {!profile ? (
                <div className="space-y-8">
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-white">Identity Required</h3>
                    <p className="text-white/40 text-sm leading-relaxed">
                      Access to the Soul Himalaya management suite is restricted to authorized personnel.
                    </p>
                  </div>
                  <Button 
                    onClick={() => login()} 
                    className="w-full bg-terracotta hover:bg-terracotta/90 text-white rounded-2xl h-16 text-lg font-bold shadow-2xl shadow-terracotta/20 transition-all hover:scale-[1.02] active:scale-[0.98] border-none"
                  >
                    <LogIn className="mr-3 h-5 w-5" /> Authenticate with Google
                  </Button>
                </div>
              ) : !profile.email?.endsWith('@gmail.com') ? (
                <div className="space-y-6">
                  <div className="p-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-sm font-medium text-center leading-relaxed">
                    <AlertCircle className="h-6 w-6 mx-auto mb-3" />
                    Access restricted to Gmail accounts only. Your current identity is not authorized.
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => logout()} 
                    className="w-full rounded-2xl h-14 border-white/10 text-white hover:bg-white/5"
                  >
                    Switch Identity
                  </Button>
                </div>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="space-y-8">
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <img src={profile.photoURL} alt="" className="h-10 w-10 rounded-full border border-white/10" />
                      <div className="text-left">
                        <p className="text-sm font-bold text-white">{profile.displayName}</p>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Authorized User</p>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white">Security Challenge</h3>
                    <p className="text-white/40 text-sm">Enter the master key to unlock the terminal.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="relative group">
                      <Input 
                        type="password"
                        placeholder="••••••••"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className={cn(
                          "rounded-2xl h-16 bg-white/5 border-white/10 text-white text-center text-2xl tracking-[0.5em] focus:ring-terracotta/20 focus:border-terracotta/30 transition-all",
                          passwordError && "border-rose-500/50 animate-shake"
                        )}
                        required
                      />
                    </div>
                    {passwordError && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-rose-400 text-xs font-bold text-center"
                      >
                        Invalid master key. Access denied.
                      </motion.p>
                    )}
                  </div>

                  <div className="flex flex-col gap-4">
                    <Button 
                      type="submit"
                      className="w-full bg-forest hover:bg-forest/90 text-white rounded-2xl h-16 text-lg font-bold shadow-2xl shadow-forest/20 transition-all"
                    >
                      Unlock Terminal
                    </Button>
                    <button 
                      type="button"
                      onClick={() => logout()} 
                      className="text-white/20 hover:text-white/40 text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                      De-authenticate
                    </button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
          
          <p className="mt-10 text-center text-[10px] text-white/20 font-bold uppercase tracking-[0.3em]">
            Soul Himalaya &copy; 2026 • Secure Environment
          </p>
        </motion.div>
      </div>
    );
  }

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Process array fields if they exist
      const processedData = { ...formData };
      
      // Ensure highlights and features are arrays of strings, filtering out empty entries
      if (Array.isArray(processedData.highlights)) {
        processedData.highlights = processedData.highlights.filter((s: string) => s && s.trim() !== '');
      } else if (typeof processedData.highlights === 'string') {
        processedData.highlights = processedData.highlights.split(',').map((s: string) => s.trim()).filter(Boolean);
      }

      if (Array.isArray(processedData.features)) {
        processedData.features = processedData.features.filter((s: string) => s && s.trim() !== '');
      } else if (typeof processedData.features === 'string') {
        processedData.features = processedData.features.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      if (Array.isArray(processedData.images)) {
        processedData.images = processedData.images.filter((img: string) => img && img.trim() !== '');
      }

      if (Array.isArray(processedData.itinerary)) {
        processedData.itinerary = processedData.itinerary.filter((item: any) => item && item.description && item.description.trim() !== '');
      }

      if (isEditing === 'new') {
        await addDoc(collection(db, 'content'), {
          type: activeContentTab,
          data: processedData,
          updatedAt: serverTimestamp()
        });
        setNotification({ message: 'Content created successfully', type: 'success' });
      } else if (isEditing) {
        await updateDoc(doc(db, 'content', isEditing), {
          data: processedData,
          updatedAt: serverTimestamp()
        });
        setNotification({ message: 'Content updated successfully', type: 'success' });
      }
      setIsEditing(null);
      setFormData({});
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'content');
    }
  };

  const updateBookingStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status });
      setNotification({ message: 'Booking status updated', type: 'success' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `bookings/${id}`);
    }
  };

  const deleteBooking = async (id: string) => {
    setConfirmModal({
      message: 'Are you sure you want to permanently delete this reservation? It will be removed from all reports and dashboards. This action cannot be undone.',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'bookings', id));
          setNotification({ message: 'Reservation deleted globally', type: 'success' });
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `bookings/${id}`);
        }
        setConfirmModal(null);
      }
    });
  };

  const handleShareBooking = (booking: Booking) => {
    const userProfile = users.find(u => u.uid === booking.userId);
    const phone = userProfile?.phone || '';
    
    const itemsText = booking.items?.map(i => i.name).join(', ') || booking.serviceName || 'Package';
    const message = `Namaste ${booking.userName}! 🙏 Your booking with The Soul Himalaya is ${booking.status.toUpperCase()}.\n\nBooking ID: ${booking.id}\nExpedition: ${itemsText}\nTotal: ₹${booking.totalPrice.toLocaleString()}\n\nWarm regards,\nThe Soul Himalaya Team 🏔️`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
    const emailUrl = `mailto:${booking.userEmail}?subject=Expedition Confirmation - Soul Himalaya&body=${encodedMessage}`;

    setConfirmModal({
      message: `Send confirmation to ${booking.userName} via WhatsApp & Email?`,
      onConfirm: () => {
        // Open WhatsApp in new tab
        window.open(whatsappUrl, '_blank');
        // Trigger Email
        window.location.href = emailUrl;
        setConfirmModal(null);
        setNotification({ message: 'Communication channels initialized', type: 'success' });
      }
    });
  };

  const toggleBlockUser = async (uid: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', uid), { isBlocked: !currentStatus });
      setNotification({ message: `User ${currentStatus ? 'unblocked' : 'blocked'} successfully`, type: 'success' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const deleteUser = async (uid: string) => {
    setConfirmModal({
      message: 'Are you sure you want to permanently delete this user account? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'users', uid));
          setNotification({ message: 'User deleted successfully', type: 'success' });
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `users/${uid}`);
        }
        setConfirmModal(null);
      }
    });
  };

  const bootstrapContent = async () => {
    setConfirmModal({
      message: 'This will sync all default packages to the database so you can edit them. Continue?',
      onConfirm: async () => {
        setIsSyncing(true);
        setConfirmModal(null);
        
          const mappings = [
            { type: 'tour', data: DEFAULT_TOURS },
            { type: 'trekk', data: DEFAULT_TREKKS },
            { type: 'shop_item', data: DEFAULT_SHOP },
            { type: 'yoga', data: DEFAULT_YOGA },
            { type: 'meditation', data: DEFAULT_MEDITATION },
            { type: 'adventure', data: DEFAULT_ADVENTURE },
            { type: 'wfh', data: DEFAULT_WFH },
            { type: 'service', data: DEFAULT_SERVICES },
            { type: 'instagram', data: [
              { url: 'https://www.instagram.com/p/DBititYyy66/', image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80', title: 'Mountain Expedition' },
              { url: 'https://www.instagram.com/p/C-iY0yiy8XQ/', image: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=600&q=80', title: 'Valley Life' },
              { url: 'https://www.instagram.com/thesoulhimalaya', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80', title: 'Soul Himalayan Peaks' },
              { url: 'https://www.instagram.com/thesoulhimalaya', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80', title: 'Starry Nights' }
            ]},
            { type: 'config', data: [{
              title: 'Customize your trip',
              description: "Tell us your preferences and we'll craft the perfect Himalayan experience for you.",
              places: ['Tosh', 'Kasol', 'Malana', 'Manikaran', 'Pulga', 'Kalga'],
              trekks: ['Kheerganga', 'Bunbuni Pass', 'Sar Pass', 'Pin Parvati'],
              yoga: ['Hatha Yoga', 'Vinyasa Flow', 'Ashtanga', 'Yin Yoga'],
              meditation: ['Vipassana', 'Guided Meditation', 'Sound Healing', 'Zen'],
              tourCategories: ['Romantic', 'Wellness', 'Corporate', 'Backpacker', 'Adventure', 'Mix-up']
            }] },
          ];

        try {
          let addedCount = 0;
          for (const mapping of mappings) {
            for (const item of mapping.data) {
              // Check if already exists by title/name
              const existing = contentItems.find(i => 
                i.type === mapping.type && 
                (i.data.title === (item as any).title || i.data.name === (item as any).name)
              );
              
              if (!existing) {
                const itemData = { ...item } as any;
                // Auto-convert string experience to itinerary array during bootstrap
                if (itemData.theExperience && !itemData.itinerary) {
                  itemData.itinerary = parseExperienceToItinerary(itemData.theExperience);
                }

                await addDoc(collection(db, 'content'), {
                  type: mapping.type,
                  data: itemData,
                  updatedAt: serverTimestamp()
                });
                addedCount++;
              }
            }
          }
          setNotification({ 
            message: addedCount > 0 
              ? `Bootstrap complete! ${addedCount} packages added to the database.` 
              : 'All default packages are already in the database.', 
            type: 'success' 
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, 'content');
        } finally {
          setIsSyncing(false);
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row overflow-hidden font-sans selection:bg-terracotta/20">
      {/* Mobile Header */}
      <div className="lg:hidden h-16 bg-forest flex items-center justify-between px-6 sticky top-0 z-[60]">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-terracotta" />
          <span className="font-heading font-bold text-white">Soul Admin</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-white hover:bg-white/10"
        >
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ 
          x: isSidebarOpen || window.innerWidth >= 1024 ? 0 : -300,
        }}
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-[80] w-72 bg-forest text-white flex flex-col h-screen lg:h-auto shadow-2xl lg:shadow-none transition-transform duration-300 lg:translate-x-0",
          !isSidebarOpen && "max-lg:-translate-x-full"
        )}
      >
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-10 w-10 rounded-xl bg-terracotta flex items-center justify-center shadow-lg shadow-terracotta/20">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-heading font-bold tracking-tight">Soul Admin</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Management Suite</p>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'content', label: 'Content Manager', icon: Package },
              { id: 'bookings', label: 'Reservations', icon: History },
              { id: 'users', label: 'User Directory', icon: Users },
              { id: 'messages', label: 'Direct Messages', icon: MessageCircleIcon },
              { id: 'seo_manager', label: 'SEO Manager', icon: Search },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMainTab(item.id as AdminTab);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group relative",
                  activeMainTab === item.id 
                    ? "bg-white/10 text-white shadow-sm" 
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                {activeMainTab === item.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute left-0 w-1 h-5 bg-terracotta rounded-r-full"
                  />
                )}
                <item.icon className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  activeMainTab === item.id ? "scale-110 text-terracotta" : "group-hover:scale-110"
                )} />
                <span className="font-semibold text-sm tracking-tight">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-white/5 bg-black/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-10 w-10 rounded-full border-2 border-terracotta/30 p-0.5">
              <img src={profile.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{profile.displayName}</p>
              <p className="text-[10px] text-white/40 truncate uppercase tracking-wider font-bold">Administrator</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => logout()}
            className="w-full justify-start text-white/50 hover:text-white hover:bg-white/5 rounded-xl h-12"
          >
            <LogOut className="mr-3 h-4 w-4" /> 
            <span className="text-sm font-bold">Sign Out</span>
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col h-screen overflow-y-auto">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-forest/5 flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-grow max-w-xl">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-forest/30 group-focus-within:text-terracotta transition-colors" />
              <input 
                type="text" 
                placeholder="Search everything..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-forest/5 border-none rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-terracotta/20 transition-all outline-none"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-cream/50 rounded-full border border-forest/5">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-forest/60">System Online</span>
            </div>
            <button className="relative p-2 text-forest/40 hover:text-forest transition-colors">
              <Star className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-terracotta rounded-full border-2 border-white" />
            </button>
          </div>
        </header>

        <div className="p-10">
          <AnimatePresence mode="wait">
            {activeMainTab === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10', trend: '+12.5%' },
            { label: 'Confirmed Bookings', value: stats.confirmedBookings, icon: CheckCircle2, color: 'text-sky-500', bg: 'bg-sky-500/10', trend: '+8.2%' },
            { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-500/10', trend: '+5.4%' },
            { label: 'Top Trekk', value: stats.mostSoldTrekk, icon: TrendingUp, color: 'text-terracotta', bg: 'bg-terracotta/10', trend: 'Popular' },
          ].map((stat, i) => (
                    <Card key={stat.label} className="border border-forest/5 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl bg-white overflow-hidden group">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110", stat.bg)}>
                            <stat.icon className={cn("h-5 w-5", stat.color)} />
                          </div>
                          <span className={cn("text-[10px] font-mono font-bold px-2 py-0.5 rounded border", stat.bg, stat.color, "border-current/20")}>
                            {stat.trend}
                          </span>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-forest/40 uppercase tracking-widest mb-1">{stat.label}</p>
                          <h3 className="text-2xl font-mono font-bold text-forest tracking-tighter">{stat.value}</h3>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Recent Activity */}
                  <Card className="lg:col-span-2 border border-forest/5 shadow-sm rounded-xl bg-white overflow-hidden">
                    <CardHeader className="px-6 py-4 border-b border-forest/5 flex flex-row items-center justify-between bg-forest/[0.01]">
                      <div>
                        <CardTitle className="text-lg font-bold text-forest">Recent Activity</CardTitle>
                        <CardDescription className="text-[10px] text-forest/40 font-bold uppercase tracking-widest">Live Transaction Stream</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest border-forest/10 hover:bg-forest/5">
                        Export CSV
                      </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-forest/[0.02] border-b border-forest/5">
                              <th className="px-6 py-3 text-[10px] font-bold text-forest/40 uppercase tracking-widest">Customer</th>
                              <th className="px-6 py-3 text-[10px] font-bold text-forest/40 uppercase tracking-widest">Service</th>
                              <th className="px-6 py-3 text-[10px] font-bold text-forest/40 uppercase tracking-widest text-right">Amount</th>
                              <th className="px-6 py-3 text-[10px] font-bold text-forest/40 uppercase tracking-widest text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-forest/5">
                            {bookings.slice(0, 6).map((booking, i) => (
                              <motion.tr 
                                key={booking.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="hover:bg-forest/[0.01] transition-colors group"
                              >
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-forest/5 flex items-center justify-center text-forest font-mono text-xs font-bold border border-forest/10">
                                      {booking.userName.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-forest">{booking.userName}</p>
                                      <p className="text-[10px] text-forest/40 font-mono">
                                        {booking.createdAt?.toDate ? new Date(booking.createdAt.toDate()).toLocaleDateString() : 'Pending Synch'}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-forest/70">
                                      {booking.items?.length 
                                        ? (booking.items.length > 1 ? `${booking.items[0].name} +${booking.items.length - 1}` : booking.items[0].name)
                                        : (booking.serviceName || 'N/A')}
                                    </span>
                                    <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-forest/10 text-forest/40 font-mono uppercase">
                                      {booking.items?.[0]?.type || booking.serviceType || 'N/A'}
                                    </Badge>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <span className="text-xs font-mono font-bold text-forest">₹{booking.totalPrice.toLocaleString()}</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <Badge className={cn(
                                    "text-[9px] px-2 py-0.5 rounded border font-mono font-bold uppercase",
                                    (booking.status === 'confirmed' || booking.status === 'paid') ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 
                                    (booking.status === 'pending' || booking.status === 'reserved') ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                                  )}>
                                    {booking.status}
                                  </Badge>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Controls */}
                  <div className="space-y-6">
                    <Card className="border border-forest/5 shadow-sm rounded-xl bg-forest text-white overflow-hidden relative group">
                      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
                        <Zap className="h-24 w-24" />
                      </div>
                      <CardContent className="p-6 relative z-10">
                        <h3 className="text-lg font-bold mb-1">Mission Control</h3>
                        <p className="text-white/40 text-[10px] mb-6 font-bold uppercase tracking-widest">Core System Overrides</p>
                        <div className="grid grid-cols-1 gap-3">
                          <Button 
                            onClick={() => { setActiveMainTab('content'); setActiveContentTab('all'); }}
                            className="h-10 rounded-lg bg-terracotta hover:bg-terracotta/90 text-white text-xs font-bold shadow-lg shadow-terracotta/20 border-none"
                          >
                            <Package className="mr-2 h-4 w-4" /> Content Manager
                          </Button>
                          <Button 
                            onClick={() => { setActiveMainTab('content'); setActiveContentTab('service'); }}
                            variant="outline"
                            className="h-10 rounded-lg border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold"
                          >
                            <Flower2 className="mr-2 h-4 w-4" /> Global Services
                          </Button>
                          <Button 
                            onClick={() => setActiveMainTab('bookings')}
                            variant="outline"
                            className="h-10 rounded-lg border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold"
                          >
                            <History className="mr-2 h-4 w-4" /> Booking Ledger
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-forest/5 shadow-sm rounded-xl bg-white overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <Activity className="h-4 w-4 text-amber-500" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-forest">System Status</h3>
                            <p className="text-[10px] text-forest/40 font-bold uppercase tracking-widest">Real-time Health</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          {[
                            { label: 'Database Latency', value: '12ms', color: 'bg-emerald-500' },
                            { label: 'Auth Uptime', value: '100%', color: 'bg-emerald-500' },
                            { label: 'Storage Usage', value: '84%', color: 'bg-amber-500' },
                          ].map((item) => (
                            <div key={item.label} className="space-y-1.5">
                              <div className="flex justify-between text-[10px] font-bold">
                                <span className="text-forest/40 uppercase tracking-widest">{item.label}</span>
                                <span className="text-forest font-mono">{item.value}</span>
                              </div>
                              <div className="h-1 w-full bg-forest/5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: item.value.includes('%') ? item.value : '100%' }}
                                  className={cn("h-full rounded-full", item.color)}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Content Tab */}
            {activeMainTab === 'content' && (
              <motion.div 
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                {/* Media Center / Image Uploader Overlay - New Section */}
                <Card className="border border-forest/10 shadow-xl rounded-[2.5rem] bg-white overflow-hidden mb-12">
                  <CardHeader className="p-10 border-b border-forest/5 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-heading font-bold text-forest">Media Center</CardTitle>
                      <CardDescription className="text-forest/40 text-sm font-medium">Upload images to Cloud & get direct links for your content.</CardDescription>
                    </div>
                    <Upload className="h-8 w-8 text-terracotta/20" />
                  </CardHeader>
                  <CardContent className="p-10">
                    <div className="flex flex-col md:flex-row gap-8 items-center bg-forest/[0.02] p-8 rounded-[2rem] border border-forest/5 border-dashed">
                      <div className="flex-grow space-y-4 w-full">
                        <div className="flex items-center gap-3 mb-2">
                          <Sparkles className="h-5 w-5 text-terracotta" />
                          <h4 className="font-bold text-forest uppercase tracking-widest text-xs">Direct Link Generator</h4>
                        </div>
                        <p className="text-xs text-forest/60">Upload any image here to generate a permanent soul-himalaya cloud link. You can use these links in the gallery or description fields below.</p>
                        
                        <div className="flex gap-3">
                          <Input 
                            value={formData.tempLink || ''} 
                            readOnly
                            placeholder="Your generated link will appear here..."
                            className="h-14 rounded-2xl bg-white border-forest/10 focus:ring-2 focus:ring-terracotta/20 font-mono text-xs"
                          />
                          {formData.tempLink && (
                            <Button 
                              variant="outline"
                              onClick={() => {
                                navigator.clipboard.writeText(formData.tempLink);
                                setNotification({ message: 'Link copied to clipboard!', type: 'success' });
                              }}
                              className="h-14 px-6 rounded-2xl border-forest/10 text-forest font-bold hover:bg-forest hover:text-white"
                            >
                              <Share2 className="h-4 w-4 mr-2" /> Copy
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0">
                        <input
                          id="media-center-upload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            // Temporary handle for media center
                            handleFileUpload(e, 'tempLink');
                          }}
                        />
                        <Button 
                          onClick={() => document.getElementById('media-center-upload')?.click()}
                          disabled={isUploading}
                          className="h-24 w-64 rounded-[2rem] bg-forest text-white hover:bg-forest/90 font-bold text-lg shadow-2xl shadow-forest/20 flex flex-col items-center justify-center gap-2 group transition-all"
                        >
                          {isUploading ? (
                            <>
                              <RefreshCw className="h-6 w-6 animate-spin mb-1" />
                              <span className="text-xs uppercase tracking-widest text-white/60">Syncing {uploadProgress}%</span>
                            </>
                          ) : (
                            <>
                              <Upload className="h-6 w-6 group-hover:-translate-y-1 transition-transform" />
                              <span>Upload to Cloud</span>
                              <span className="text-[10px] uppercase tracking-widest text-white/40">JPEG, PNG, WEBP</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'tour', label: 'Tours', icon: Map, color: 'text-sky-500', bg: 'bg-sky-500/10' },
                  { id: 'trekk', label: 'Trekks', icon: Compass, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                  { id: 'shop_item', label: 'Shop', icon: ShoppingBag, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                  { id: 'service', label: 'Services', icon: Flower2, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                  { id: 'yoga', label: 'Yoga', icon: Wind, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
                  { id: 'meditation', label: 'Meditation', icon: Star, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                  { id: 'adventure', label: 'Adventure', icon: Zap, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                  { id: 'wfh', label: 'WFH', icon: Laptop, color: 'text-slate-500', bg: 'bg-slate-500/10' },
                  { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-500', bg: 'bg-pink-500/10' },
                  { id: 'itinerary', label: 'Itineraries', icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-600/10' },
                  { id: 'config', label: 'Config', icon: Settings, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                  { id: 'page_parvati', label: 'Parvati Page', icon: Sparkles, color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10' },
                  { id: 'all', label: 'All Assets', icon: LayoutDashboard, color: 'text-forest', bg: 'bg-forest/10' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveContentTab(tab.id as ContentType)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 font-bold text-[10px] uppercase tracking-widest border",
                      activeContentTab === tab.id 
                        ? "bg-forest text-white border-forest shadow-md shadow-forest/20" 
                        : "bg-white text-forest/40 border-forest/5 hover:border-forest/20 hover:bg-forest/[0.02]"
                    )}
                  >
                    <tab.icon className={cn("h-3.5 w-3.5", activeContentTab === tab.id ? "text-white" : tab.color)} />
                    {tab.label}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-4 w-full xl:w-auto">
                <Button 
                  variant="outline"
                  onClick={bootstrapContent}
                  disabled={isSyncing}
                  className="flex-grow xl:flex-grow-0 h-12 rounded-2xl border-forest/10 text-forest font-bold hover:bg-forest hover:text-white transition-all duration-300"
                >
                  <RefreshCw className={cn("mr-2 h-4 w-4", isSyncing && "animate-spin")} /> 
                  Sync Defaults
                </Button>
                <Button 
                  onClick={() => { setIsEditing('new'); setFormData({}); }}
                  className="flex-grow xl:flex-grow-0 h-12 rounded-2xl bg-terracotta hover:bg-terracotta/90 text-white font-bold shadow-lg shadow-terracotta/20 border-none transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus className="mr-2 h-5 w-5" /> Add {activeContentTab.replace('_', ' ')}
                </Button>
              </div>
            </div>

            {isEditing && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-forest/20 backdrop-blur-sm"
              >
                <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
                  <form onSubmit={handleSaveContent} className="flex flex-col h-full overflow-hidden">
                    {/* Sticky Header */}
                    <div className="px-10 py-8 border-b border-forest/5 flex justify-between items-center shrink-0 bg-white">
                      <div>
                        <h3 className="text-2xl font-heading font-bold text-forest">
                          {isEditing === 'new' ? 'Create New' : 'Update'} {activeContentTab.replace('_', ' ')}
                        </h3>
                        <p className="text-forest/40 text-sm font-medium">Fill in the details below to update your platform.</p>
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => setIsEditing(null)} className="rounded-full hover:bg-forest/5 text-forest/40 hover:text-forest">
                        <X className="h-6 w-6" />
                      </Button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-grow overflow-y-auto p-10 custom-scrollbar">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Common Fields */}
                        {activeContentTab !== 'instagram' && (
                          <div className="space-y-3">
                            <label className="text-[10px] font-bold text-forest/40 uppercase tracking-widest ml-1">
                              {activeContentTab === 'shop_item' ? 'Item Name' : 'Title'}
                            </label>
                            <Input 
                              value={formData.title || formData.name || ''} 
                              onChange={(e) => setFormData({
                                ...formData, 
                                [activeContentTab === 'shop_item' ? 'name' : 'title']: e.target.value
                              })}
                              className="h-12 rounded-xl bg-forest/[0.03] border-forest/5 focus:ring-2 focus:ring-terracotta/20 font-medium text-sm"
                              placeholder="e.g. Mystical Parvati Expedition"
                              required
                            />
                          </div>
                        )}
                        {activeContentTab !== 'instagram' && activeContentTab !== 'page_parvati' && (
                          <div className="space-y-3">
                            <label className="text-[10px] font-bold text-forest/40 uppercase tracking-widest ml-1">Price / Cost</label>
                            <Input 
                              value={formData.price || ''} 
                              onChange={(e) => setFormData({...formData, price: e.target.value})}
                              className="h-14 rounded-2xl bg-forest/[0.03] border-none focus:ring-2 focus:ring-terracotta/20 font-medium"
                              placeholder="e.g. ₹14,999"
                              required={activeContentTab !== 'service' && activeContentTab !== 'page_parvati'}
                            />
                          </div>
                        )}
                        <div className="space-y-3">
                          <label className="text-[10px] font-bold text-forest/40 uppercase tracking-widest ml-1">Display Order (Lower = First)</label>
                          <Input 
                            type="number"
                            value={formData.order || ''} 
                            onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                            className="h-14 rounded-2xl bg-forest/[0.03] border-none focus:ring-2 focus:ring-terracotta/20 font-medium"
                            placeholder="e.g. 1"
                          />
                        </div>
                        <div className="space-y-3 md:col-span-2">
                          <label className="text-[10px] font-bold text-forest/40 uppercase tracking-widest ml-1">
                            {activeContentTab === 'instagram' ? 'Post Image (Required)' : 'Cover Image (URL or Upload)'}
                          </label>
                          <div className="flex gap-4 items-start">
                            {formData.image && (
                              <div className="relative group shrink-0">
                                <div className="h-14 w-14 rounded-2xl overflow-hidden border border-forest/10 shadow-sm">
                                  <img src={formData.image} alt="Cover Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => setFormData({ ...formData, image: '' })}
                                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                            <div className="flex-grow flex gap-2">
                              <Input 
                                value={formData.image || ''} 
                                onChange={(e) => setFormData({...formData, image: e.target.value})}
                                className="h-14 rounded-2xl bg-forest/[0.03] border-none focus:ring-2 focus:ring-terracotta/20 font-medium flex-grow"
                                placeholder={activeContentTab === 'instagram' ? "Paste direct image link or upload below..." : "Paste image link here..."}
                                required={activeContentTab !== 'service' && activeContentTab !== 'config'}
                              />
                              <input
                                ref={coverInputRef}
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'image')}
                              />
                              <Button 
                                type="button"
                                onClick={() => coverInputRef.current?.click()}
                                disabled={isUploading}
                                className={cn(
                                  "h-14 w-14 rounded-2xl flex items-center justify-center transition-all relative overflow-hidden p-0",
                                  isUploading ? "bg-forest/5 text-forest/40" : "bg-terracotta/10 text-terracotta hover:bg-terracotta/20"
                                )}
                              >
                                {isUploading ? (
                                  <>
                                    <div 
                                      className="absolute bottom-0 left-0 w-full bg-forest/20 transition-all duration-300" 
                                      style={{ height: `${uploadProgress}%` }}
                                    />
                                    <span className="relative z-10 text-[10px] font-mono font-bold">{uploadProgress}%</span>
                                  </>
                                ) : (
                                  <Upload className="h-5 w-5" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                        {activeContentTab !== 'instagram' && (
                          <div className="space-y-3 md:col-span-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-bold text-forest/40 uppercase tracking-widest ml-1">Additional Gallery</label>
                              <div className="flex gap-2">
                                <Button 
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newImages = [...(formData.images || []), ''];
                                    setFormData({ ...formData, images: newImages });
                                  }}
                                  className="h-8 rounded-full border-forest/10 text-forest hover:bg-forest/5 px-4"
                                >
                                  <Plus className="h-3 w-3 mr-2" /> Add Link
                                </Button>
                                <input
                                  ref={galleryInputRef}
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => handleFileUpload(e, 'new_image')}
                                />
                                <Button 
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => galleryInputRef.current?.click()}
                                  disabled={isUploading}
                                  className="h-8 rounded-full border border-forest/10 text-forest hover:bg-forest/5 px-4 flex items-center text-[11px] font-bold gap-2 relative overflow-hidden"
                                >
                                  {isUploading ? (
                                    <>
                                      <div 
                                        className="absolute inset-0 bg-forest/10" 
                                        style={{ width: `${uploadProgress}%` }}
                                      />
                                      <span className="relative z-10">{uploadProgress}%</span>
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="h-3 w-3" />
                                      Upload
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-3">
                              {(Array.isArray(formData.images) ? formData.images : []).map((img: string, index: number) => (
                                <div key={index} className="flex gap-2 items-start">
                                  {img && (
                                    <div className="h-14 w-14 rounded-2xl overflow-hidden border border-forest/10 shrink-0 shadow-sm">
                                      <img src={img} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    </div>
                                  )}
                                  <div className="flex-grow flex gap-2">
                                    <Input 
                                      value={img} 
                                      onChange={(e) => {
                                        const currentImages = Array.isArray(formData.images) ? [...formData.images] : [];
                                        currentImages[index] = e.target.value;
                                        setFormData({ ...formData, images: currentImages });
                                      }}
                                      className="h-14 rounded-2xl bg-forest/[0.03] border-none focus:ring-2 focus:ring-terracotta/20 font-medium flex-grow"
                                      placeholder={`Gallery URL ${index + 1}`}
                                    />
                                    <label htmlFor={`gallery-item-${index}`} className="shrink-0 cursor-pointer">
                                      <input
                                        id={`gallery-item-${index}`}
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload(e, 'images', index)}
                                      />
                                      <div className="h-14 w-14 rounded-2xl bg-forest/[0.02] flex items-center justify-center text-forest/30 hover:bg-forest/10 transition-colors relative overflow-hidden">
                                        {isUploading ? (
                                          <span className="text-[9px] font-mono font-bold">{uploadProgress}%</span>
                                        ) : (
                                          <Upload className="h-4 w-4" />
                                        )}
                                      </div>
                                    </label>
                                  </div>
                                  <Button 
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      const currentImages = Array.isArray(formData.images) ? [...formData.images] : [];
                                      const newImages = currentImages.filter((_: any, i: number) => i !== index);
                                      setFormData({ ...formData, images: newImages });
                                    }}
                                    className="h-14 w-14 rounded-2xl text-forest/20 hover:text-destructive hover:bg-destructive/5"
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </Button>
                                </div>
                              ))}
                              {(!formData.images || !Array.isArray(formData.images) || formData.images.length === 0) && (
                                <p className="text-[10px] text-forest/30 font-medium italic ml-1">No additional images added.</p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Type Specific Fields */}
                        {activeContentTab === 'page_parvati' && (
                          <div className="md:col-span-2 space-y-6">
                            <h4 className="font-bold text-forest border-b border-forest/10 pb-2">Parvati Section Images</h4>
                            <p className="text-xs text-forest/60 mb-4">Note: The "Cover Image" above controls the main Hero Banner. "Additional Gallery" controls the image gallery on the Parvati page.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <label className="text-[10px] font-bold text-forest/40 uppercase tracking-widest ml-1">Divinity Narrative Image</label>
                                <Input 
                                  value={formData.narrativeImage || ''} 
                                  onChange={(e) => setFormData({...formData, narrativeImage: e.target.value})}
                                  className="h-14 rounded-2xl bg-forest/[0.03] border-none focus:ring-2 focus:ring-terracotta/20 font-medium"
                                  placeholder="Image URL"
                                />
                              </div>
                              <div className="space-y-3">
                                <label className="text-[10px] font-bold text-forest/40 uppercase tracking-widest ml-1">Malana Image</label>
                                <Input 
                                  value={formData.malanaImage || ''} 
                                  onChange={(e) => setFormData({...formData, malanaImage: e.target.value})}
                                  className="h-14 rounded-2xl bg-forest/[0.03] border-none focus:ring-2 focus:ring-terracotta/20 font-medium"
                                  placeholder="Image URL"
                                />
                              </div>
                              <div className="space-y-3">
                                <label className="text-[10px] font-bold text-forest/40 uppercase tracking-widest ml-1">Tosh Image</label>
                                <Input 
                                  value={formData.toshImage || ''} 
                                  onChange={(e) => setFormData({...formData, toshImage: e.target.value})}
                                  className="h-14 rounded-2xl bg-forest/[0.03] border-none focus:ring-2 focus:ring-terracotta/20 font-medium"
                                  placeholder="Image URL"
                                />
                              </div>
                              <div className="space-y-3">
                                <label className="text-[10px] font-bold text-forest/40 uppercase tracking-widest ml-1">Pulga Image</label>
                                <Input 
                                  value={formData.pulgaImage || ''} 
                                  onChange={(e) => setFormData({...formData, pulgaImage: e.target.value})}
                                  className="h-14 rounded-2xl bg-forest/[0.03] border-none focus:ring-2 focus:ring-terracotta/20 font-medium"
                                  placeholder="Image URL"
                                />
                              </div>
                              <div className="space-y-3">
                                <label className="text-[10px] font-bold text-forest/40 uppercase tracking-widest ml-1">Kheerganga Image</label>
                                <Input 
                                  value={formData.kheergangaImage || ''} 
                                  onChange={(e) => setFormData({...formData, kheergangaImage: e.target.value})}
                                  className="h-14 rounded-2xl bg-forest/[0.03] border-none focus:ring-2 focus:ring-terracotta/20 font-medium"
                                  placeholder="Image URL"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {activeContentTab === 'config' && (
                          <div className="md:col-span-2 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <label className="text-[10px] font-bold text-forest/40 uppercase tracking-widest ml-1">Places to Visit (Comma separated)</label>
                                <Input 
                                  value={Array.isArray(formData.places) ? formData.places.join(', ') : formData.places || ''} 
                                  onChange={(e) => setFormData({...formData, places: e.target.value.split(',').map((s: string) => s.trim())})}
                                  className="h-14 rounded-2xl bg-forest/[0.03] border-none focus:ring-2 focus:ring-terracotta/20 font-medium"
                                  placeholder="Tosh, Kasol, Malana"
                                />
                              </div>
                              <div className="space-y-3">
                                <label className="text-[10px] font-bold text-forest/40 uppercase tracking-widest ml-1">Trekks to Include (Comma separated)</label>
                                <Input 
                                  value={Array.isArray(formData.trekks || formData.treks) ? (formData.trekks || formData.treks).join(', ') : formData.trekks || formData.treks || ''} 
                                  onChange={(e) => setFormData({...formData, trekks: e.target.value.split(',').map((s: string) => s.trim())})}
                                  className="h-14 rounded-2xl bg-forest/[0.03] border-none focus:ring-2 focus:ring-terracotta/20 font-medium"
                                  placeholder="Kheerganga, Sar Pass"
                                />
                              </div>
                              <div className="space-y-3">
                                <label className="text-[10px] font-bold text-forest/40 uppercase tracking-widest ml-1">Yoga Styles (Comma separated)</label>
                                <Input 
                                  value={Array.isArray(formData.yoga) ? formData.yoga.join(', ') : formData.yoga || ''} 
                                  onChange={(e) => setFormData({...formData, yoga: e.target.value.split(',').map((s: string) => s.trim())})}
                                  className="h-14 rounded-2xl bg-forest/[0.03] border-none focus:ring-2 focus:ring-terracotta/20 font-medium"
                                  placeholder="Hatha, Vinyasa"
                                />
                              </div>
                              <div className="space-y-3">
                                <label className="text-[10px] font-bold text-forest/40 uppercase tracking-widest ml-1">Meditation Styles (Comma separated)</label>
                                <Input 
                                  value={Array.isArray(formData.meditation) ? formData.meditation.join(', ') : formData.meditation || ''} 
                                  onChange={(e) => setFormData({...formData, meditation: e.target.value.split(',').map((s: string) => s.trim())})}
                                  className="h-14 rounded-2xl bg-forest/[0.03] border-none focus:ring-2 focus:ring-terracotta/20 font-medium"
                                  placeholder="Vipassana, Zen"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {activeContentTab === 'instagram' && (
                          <div className="md:col-span-2 space-y-6">
                            <h4 className="font-bold text-forest border-b border-forest/10 pb-2">Instagram Post Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <label className="text-[10px] font-bold text-forest/40 uppercase tracking-widest ml-1">Instagram Link (Post URL)</label>
                                <Input 
                                  value={formData.url || ''} 
                                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                                  className="h-14 rounded-2xl bg-forest/[0.03] border-none focus:ring-2 focus:ring-terracotta/20 font-medium"
                                  placeholder="https://www.instagram.com/p/..."
                                />
                              </div>
                              <div className="space-y-3">
                                <label className="text-[10px] font-bold text-forest/40 uppercase tracking-widest ml-1">Visual Caption (Internal)</label>
                                <Input 
                                  value={formData.title || ''} 
                                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                                  className="h-14 rounded-2xl bg-forest/[0.03] border-none focus:ring-2 focus:ring-terracotta/20 font-medium"
                                  placeholder="e.g. Sunset at Tosh"
                                />
                              </div>
                            </div>
                            <p className="text-xs text-forest/40 italic">Note: Please provide a valid Image URL or Upload an image for this post. Direct Instagram image embeds are often blocked, so a local copy is best.</p>
                          </div>
                        )}
                        
                        {(activeContentTab === 'tour' || activeContentTab === 'trek' || activeContentTab === 'service' || activeContentTab === 'yoga' || activeContentTab === 'meditation' || activeContentTab === 'adventure' || activeContentTab === 'wfh') && (
                          <div className="space-y-3">
                            <label className="text-[10px] font-bold text-forest/40 uppercase tracking-widest ml-1">Duration</label>
                            <Input 
                              value={formData.duration || ''} 
                              onChange={(e) => setFormData({...formData, duration: e.target.value})}
                              className="h-14 rounded-2xl bg-forest/[0.03] border-none focus:ring-2 focus:ring-terracotta/20 font-medium"
                              placeholder="e.g. 5 Days / 4 Nights"
                            />
                          </div>
                        )}

                        {activeContentTab === 'tour' && (
                          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                              <label className="text-[10px] font-bold text-forest/40 uppercase tracking-widest ml-1">Rating (0-5)</label>
                              <Input 
                                type="number" step="0.1" min="0" max="5"
                                value={formData.rating || ''} 
                                onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})}
                                className="h-14 rounded-2xl bg-forest/[0.03] border-none focus:ring-2 focus:ring-terracotta/20 font-medium"
                                placeholder="4.9"
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-[10px] font-bold text-forest/40 uppercase tracking-widest ml-1">Reviews Count</label>
                              <Input 
                                type="number"
                                value={formData.reviews || ''} 
                                onChange={(e) => setFormData({...formData, reviews: parseInt(e.target.value)})}
                                className="h-14 rounded-2xl bg-forest/[0.03] border-none focus:ring-2 focus:ring-terracotta/20 font-medium"
                                placeholder="124"
                              />
                            </div>
                            <div className="md:col-span-2 space-y-4 bg-forest/[0.02] p-6 rounded-[2rem] border border-forest/5">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                  <label className="text-xs font-black text-forest uppercase tracking-widest">Journey Category</label>
                                  <p className="text-[10px] text-forest/40 font-medium italic">Tag this tour for better discovery</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {tourCategories.map(cat => (
                                    <button
                                      key={cat}
                                      type="button"
                                      onClick={() => setFormData({ ...formData, category: cat })}
                                      className={cn(
                                        "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                                        formData.category === cat 
                                          ? "bg-terracotta text-white shadow-lg shadow-terracotta/20 scale-105" 
                                          : "bg-white text-forest/40 border border-forest/5 hover:border-forest/20"
                                      )}
                                    >
                                      {cat}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className="pt-4 border-t border-forest/5 flex items-center gap-3">
                                <Input 
                                  placeholder="Add New Collection Name..."
                                  value={newCategory}
                                  onChange={(e) => setNewCategory(e.target.value)}
                                  className="h-10 rounded-xl bg-white border-forest/10 text-xs font-bold uppercase tracking-widest max-w-[240px]"
                                />
                                <Button
                                  type="button"
                                  onClick={async () => {
                                    if (!newCategory.trim()) return;
                                    const updatedCats = [...new Set([...tourCategories, newCategory.trim()])];
                                    setTourCategories(updatedCats);
                                    
                                    // Also sync to global config in DB if it exists
                                    const configItem = contentItems.find(i => i.type === 'config');
                                    if (configItem) {
                                      await updateDoc(doc(db, 'content', configItem.id), {
                                        "data.tourCategories": updatedCats,
                                        updatedAt: serverTimestamp()
                                      });
                                    }
                                    
                                    setFormData({ ...formData, category: newCategory.trim() });
                                    setNewCategory('');
                                    setNotification({ message: 'New collection category added!', type: 'success' });
                                  }}
                                  className="h-10 px-4 bg-forest text-white rounded-xl text-[10px] font-black uppercase tracking-wider"
                                >
                                  <Plus className="h-4 w-4 mr-1" /> Add Category
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {(activeContentTab === 'tour' || activeContentTab === 'adventure' || activeContentTab === 'yoga' || activeContentTab === 'meditation' || activeContentTab === 'wfh' || activeContentTab === 'trek') && (
                          <div className="md:col-span-2 space-y-4">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-bold text-forest/40 uppercase tracking-widest ml-1">
                                {(activeContentTab === 'tour' || activeContentTab === 'adventure' || activeContentTab === 'trek') ? 'Highlights' : 'Key Features'}
                              </label>
                              <Button 
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const field = (activeContentTab === 'tour' || activeContentTab === 'adventure' || activeContentTab === 'trek') ? 'highlights' : 'features';
                                  const currentList = Array.isArray(formData[field]) ? formData[field] : [];
                                  setFormData({ ...formData, [field]: [...currentList, ''] });
                                }}
                                className="h-8 rounded-full border-forest/10 text-forest hover:bg-forest/5 px-4"
                              >
                                <Plus className="h-3 w-3 mr-2" /> Add Item
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {(Array.isArray((activeContentTab === 'tour' || activeContentTab === 'adventure' || activeContentTab === 'trek') ? formData.highlights : formData.features) 
                                ? ((activeContentTab === 'tour' || activeContentTab === 'adventure' || activeContentTab === 'trek') ? formData.highlights : formData.features) 
                                : []
                              ).map((item: string, index: number) => (
                                <div key={index} className="flex gap-2 items-center group">
                                  <div className="flex-grow relative">
                                    <Input 
                                      value={item} 
                                      onChange={(e) => {
                                        const field = (activeContentTab === 'tour' || activeContentTab === 'adventure' || activeContentTab === 'trek') ? 'highlights' : 'features';
                                        const newList = [...formData[field]];
                                        newList[index] = e.target.value;
                                        setFormData({ ...formData, [field]: newList });
                                      }}
                                      className="h-12 rounded-xl bg-forest/[0.03] border-forest/5 focus:ring-2 focus:ring-terracotta/20 font-medium text-sm"
                                      placeholder={`Item ${index + 1}`}
                                    />
                                  </div>
                                  <Button 
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      const field = (activeContentTab === 'tour' || activeContentTab === 'adventure' || activeContentTab === 'trek') ? 'highlights' : 'features';
                                      const newList = formData[field].filter((_: any, i: number) => i !== index);
                                      setFormData({ ...formData, [field]: newList });
                                    }}
                                    className="h-10 w-10 rounded-xl text-forest/20 hover:text-rose-500 hover:bg-rose-500/5 transition-all"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              {(!(activeContentTab === 'tour' || activeContentTab === 'adventure' || activeContentTab === 'trek' ? formData.highlights : formData.features) || 
                                 !Array.isArray(activeContentTab === 'tour' || activeContentTab === 'adventure' || activeContentTab === 'trek' ? formData.highlights : formData.features) || 
                                 (activeContentTab === 'tour' || activeContentTab === 'adventure' || activeContentTab === 'trek' ? formData.highlights : formData.features).length === 0) && (
                                <div className="md:col-span-2 text-center py-6 border-2 border-dashed border-forest/5 rounded-2xl">
                                  <p className="text-[10px] text-forest/30 font-medium italic">No items added yet. Click 'Add Item' to begin.</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {activeContentTab === 'service' && (
                          <div className="space-y-3">
                            <label className="text-[10px] font-bold text-forest/40 uppercase tracking-widest ml-1">Navigation Link</label>
                            <Input 
                              value={formData.link || ''} 
                              onChange={(e) => setFormData({...formData, link: e.target.value})}
                              className="h-14 rounded-2xl bg-forest/[0.03] border-none focus:ring-2 focus:ring-terracotta/20 font-medium"
                              placeholder="e.g. /tours"
                              required
                            />
                          </div>
                        )}

                        {activeContentTab === 'trek' && (
                          <>
                            <div className="space-y-3">
                              <label className="text-[10px] font-bold text-forest/40 uppercase tracking-widest ml-1">Difficulty Level</label>
                              <select 
                                value={formData.difficulty || ''} 
                                onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                                className="w-full h-14 rounded-2xl bg-forest/[0.03] border-none focus:ring-2 focus:ring-terracotta/20 font-medium px-4 outline-none appearance-none"
                              >
                                <option value="">Select Difficulty</option>
                                <option value="Easy">Easy</option>
                                <option value="Moderate">Moderate</option>
                                <option value="Challenging">Challenging</option>
                                <option value="Difficult">Difficult</option>
                                <option value="Extreme">Extreme</option>
                              </select>
                            </div>
                            <div className="space-y-3">
                              <label className="text-[10px] font-bold text-forest/40 uppercase tracking-widest ml-1">Altitude</label>
                              <Input 
                                value={formData.altitude || ''} 
                                onChange={(e) => setFormData({...formData, altitude: e.target.value})}
                                className="h-14 rounded-2xl bg-forest/[0.03] border-none focus:ring-2 focus:ring-terracotta/20 font-medium"
                                placeholder="e.g. 2,960m"
                              />
                            </div>
                          </>
                        )}

                        {activeContentTab === 'shop_item' && (
                          <div className="space-y-3">
                            <label className="text-[10px] font-bold text-forest/40 uppercase tracking-widest ml-1">Category</label>
                            <Input 
                              value={formData.category || ''} 
                              onChange={(e) => setFormData({...formData, category: e.target.value})}
                              className="h-12 rounded-xl bg-forest/[0.03] border-forest/5 focus:ring-2 focus:ring-terracotta/20 font-medium text-sm"
                              placeholder="e.g. Clothing, Souvenirs"
                            />
                          </div>
                        )}

                        <div className="md:col-span-2 space-y-3">
                          <label className="text-[10px] font-bold text-forest/40 uppercase tracking-widest ml-1">Description</label>
                          <textarea 
                            value={formData.description || ''} 
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="w-full min-h-[150px] rounded-2xl bg-forest/[0.03] border-none focus:ring-2 focus:ring-terracotta/20 font-medium p-4 outline-none resize-none"
                            placeholder="Write a detailed description..."
                            required
                          />
                        </div>

                        {/* Day-by-Day Experience Editor */}
                        {(activeContentTab === 'tour' || activeContentTab === 'trek' || activeContentTab === 'trekk' || activeContentTab === 'yoga' || activeContentTab === 'meditation' || activeContentTab === 'adventure') && (
                          <div className="md:col-span-2 space-y-4 border-t border-forest/5 pt-8 mt-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <label className="text-[10px] font-bold text-forest/40 uppercase tracking-widest ml-1">Day-by-Day Experience</label>
                                <p className="text-[10px] text-forest/20 font-medium italic mt-0.5">Define for packages correctly</p>
                              </div>
                              <Button 
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newItinerary = Array.isArray(formData.itinerary) ? [...formData.itinerary] : [];
                                  newItinerary.push({ day: newItinerary.length + 1, title: '', description: '' });
                                  setFormData({ ...formData, itinerary: newItinerary });
                                }}
                                className="h-8 rounded-lg border-forest/10 text-forest/60 hover:text-forest"
                              >
                                <Plus className="h-4 w-4 mr-1" /> Add Day
                              </Button>
                            </div>
                            <div className="space-y-4">
                              {Array.isArray(formData.itinerary) && formData.itinerary.map((item: any, index: number) => (
                                <div key={index} className="bg-white/50 border border-forest/5 p-6 rounded-2xl space-y-4 group">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="h-8 w-8 rounded-lg bg-terracotta/10 text-terracotta flex items-center justify-center font-bold text-xs ring-1 ring-terracotta/20">
                                        {index + 1}
                                      </div>
                                      <span className="text-xs font-black text-forest uppercase tracking-widest">Day {index + 1} Experience</span>
                                    </div>
                                    <Button 
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        const newItinerary = formData.itinerary.filter((_: any, i: number) => i !== index);
                                        const reindexed = newItinerary.map((it: any, i: number) => ({ ...it, day: i + 1 }));
                                        setFormData({ ...formData, itinerary: reindexed });
                                      }}
                                      className="text-rose-400 hover:text-rose-500 hover:bg-rose-500/5 h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <Input
                                    value={item.title || ''}
                                    onChange={(e) => {
                                      const newItinerary = [...formData.itinerary];
                                      newItinerary[index] = { ...item, title: e.target.value };
                                      setFormData({ ...formData, itinerary: newItinerary });
                                    }}
                                    placeholder="Title for the day (e.g., Arrival in Tosh)..."
                                    className="w-full rounded-xl bg-white border-forest/10"
                                  />
                                  <textarea 
                                    value={item.description || ''} 
                                    onChange={(e) => {
                                      const newItinerary = [...formData.itinerary];
                                      newItinerary[index] = { ...item, description: e.target.value };
                                      setFormData({ ...formData, itinerary: newItinerary });
                                    }}
                                    className="w-full min-h-[100px] rounded-xl bg-forest/[0.02] border border-forest/5 focus:ring-2 focus:ring-terracotta/20 font-medium p-4 outline-none resize-none text-sm placeholder:text-forest/20"
                                    placeholder={`Describe the highlights and activities for Day ${index + 1}...`}
                                  />
                                </div>
                              ))}
                              {(!formData.itinerary || !Array.isArray(formData.itinerary) || formData.itinerary.length === 0) && (
                                <div className="text-center py-10 border-2 border-dashed border-forest/5 rounded-3xl bg-forest/[0.01]">
                                  <Sparkles className="h-8 w-8 text-forest/10 mx-auto mb-3" />
                                  <p className="text-xs text-forest/30 font-medium italic">No itinerary defined yet. Start building the journey day by day.</p>
                                  <Button 
                                    type="button"
                                    variant="ghost" 
                                    onClick={() => {
                                      setFormData({ ...formData, itinerary: [{ day: 1, title: '', description: '' }] });
                                    }}
                                    className="mt-4 text-[10px] font-black uppercase tracking-widest text-terracotta hover:bg-terracotta/5"
                                  >
                                    Initialize Itinerary
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Slots Management */}
                        {(activeContentTab === 'tour' || activeContentTab === 'trek' || activeContentTab === 'yoga' || activeContentTab === 'meditation' || activeContentTab === 'wfh' || activeContentTab === 'adventure') && (
                          <div className="md:col-span-2 space-y-4">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-bold text-forest/40 uppercase tracking-widest ml-1">Available Slots (Dates)</label>
                              <Button 
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newSlots = [...(formData.slots || []), { startDate: '', endDate: '', available: true }];
                                  setFormData({ ...formData, slots: newSlots });
                                }}
                                className="h-8 rounded-lg border-forest/10 text-forest/60 hover:text-forest"
                              >
                                <Plus className="h-4 w-4 mr-1" /> Add Slot
                              </Button>
                            </div>
                            <div className="space-y-3">
                              {(formData.slots || []).map((slot: any, index: number) => (
                                <div key={index} className="flex items-center gap-4 bg-forest/[0.02] p-4 rounded-2xl border border-forest/5">
                                  <div className="flex-grow grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <span className="text-[9px] font-bold text-forest/30 uppercase">Start Date</span>
                                      <Input 
                                        type="date"
                                        value={slot.startDate || ''}
                                        onChange={(e) => {
                                          const newSlots = [...formData.slots];
                                          newSlots[index] = { ...slot, startDate: e.target.value };
                                          setFormData({ ...formData, slots: newSlots });
                                        }}
                                        className="h-10 rounded-xl bg-white border-forest/5"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-[9px] font-bold text-forest/30 uppercase">End Date</span>
                                      <Input 
                                        type="date"
                                        value={slot.endDate || ''}
                                        onChange={(e) => {
                                          const newSlots = [...formData.slots];
                                          newSlots[index] = { ...slot, endDate: e.target.value };
                                          setFormData({ ...formData, slots: newSlots });
                                        }}
                                        className="h-10 rounded-xl bg-white border-forest/5"
                                      />
                                    </div>
                                  </div>
                                  <Button 
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      const newSlots = formData.slots.filter((_: any, i: number) => i !== index);
                                      setFormData({ ...formData, slots: newSlots });
                                    }}
                                    className="text-rose-400 hover:text-rose-500 hover:bg-rose-500/5"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              {(!formData.slots || formData.slots.length === 0) && (
                                <div className="text-center py-6 border-2 border-dashed border-forest/5 rounded-2xl">
                                  <p className="text-xs text-forest/30 font-medium italic">No slots defined. Users will see a generic date picker.</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="md:col-span-2 p-6 rounded-2xl bg-forest/[0.03] flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-forest mb-1">Service Availability</h4>
                            <p className="text-xs text-forest/40 font-medium">Toggle whether this service is visible and bookable by guests.</p>
                          </div>
                          <Button
                            type="button"
                            onClick={() => setFormData({ ...formData, isAvailable: formData.isAvailable === false ? true : false })}
                            className={cn(
                              "h-12 px-6 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300",
                              formData.isAvailable !== false 
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" 
                                : "bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20"
                            )}
                          >
                            {formData.isAvailable !== false ? (
                              <><Eye className="mr-2 h-4 w-4" /> Available</>
                            ) : (
                              <><EyeOff className="mr-2 h-4 w-4" /> Unavailable</>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Sticky Footer */}
                    <div className="px-10 py-6 border-t border-forest/5 flex flex-wrap justify-between items-center gap-4 shrink-0 bg-white">
                      <div className="flex-shrink-0">
                        {isEditing !== 'new' && activeContentTab !== 'config' && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => {
                              setConfirmModal({
                                title: 'Delete Asset?',
                                message: 'Are you sure you want to permanently delete this asset? This cannot be undone.',
                                onConfirm: async () => {
                                  try {
                                    await deleteDoc(doc(db, 'content', isEditing!));
                                    setNotification({ message: 'Asset deleted', type: 'success' });
                                    setIsEditing(null);
                                  } catch (error) {
                                    handleFirestoreError(error, OperationType.DELETE, `content/${isEditing}`);
                                  }
                                  setConfirmModal(null);
                                }
                              });
                            }}
                            className="h-14 px-6 rounded-2xl font-bold text-rose-400 hover:text-rose-500 hover:bg-rose-500/5 group transition-all"
                          >
                            <Trash2 className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" /> 
                            Delete Asset
                          </Button>
                        )}
                      </div>
                      <div className="flex gap-4 items-center">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          onClick={() => setIsEditing(null)}
                          className="h-14 px-8 rounded-2xl font-bold text-forest/40 hover:text-forest hover:bg-forest/5"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={isUploading}
                          className={cn(
                            "h-14 px-10 rounded-2xl font-bold shadow-xl transition-all active:scale-[0.98]",
                            isUploading 
                              ? "bg-forest/20 text-forest/40 cursor-not-allowed" 
                              : "bg-forest hover:bg-forest/90 text-white shadow-forest/10 hover:shadow-forest/20"
                          )}
                        >
                          {isUploading ? (
                            <><RefreshCw className="mr-2 h-5 w-5 animate-spin" /> Uploading...</>
                          ) : (
                            <><Save className="mr-2 h-5 w-5" /> {isEditing === 'new' ? 'Create Item' : 'Save Changes'}</>
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </Card>
              </motion.div>
            )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {contentItems
                  .filter(i => {
                    if (activeContentTab === 'all') return true;
                    if (activeContentTab === 'itinerary') return (i.data.itinerary && i.data.itinerary.length > 0) || i.data.theExperience;
                    if (activeContentTab === 'trekk') return i.type === 'trekk' || i.type === 'trek';
                    return i.type === activeContentTab;
                  })
                  .filter(i => {
                  const title = (i.data.title || i.data.name || '').toLowerCase();
                  return !title.includes('cafe') && !title.includes('food');
                })
                .filter(i => {
                  if (!searchTerm) return true;
                  const search = searchTerm.toLowerCase();
                  return (
                    i.data.title?.toLowerCase().includes(search) ||
                    i.data.name?.toLowerCase().includes(search) ||
                    i.data.description?.toLowerCase().includes(search) ||
                    i.type.toLowerCase().includes(search)
                  );
                })
                .sort((a, b) => {
                  const aOrder = (a.data.order !== undefined && a.data.order !== null) ? Number(a.data.order) : 999;
                  const bOrder = (b.data.order !== undefined && b.data.order !== null) ? Number(b.data.order) : 999;
                  if (aOrder !== bOrder) return aOrder - bOrder;
                  
                  const aAvail = a.data.isAvailable !== false;
                  const bAvail = b.data.isAvailable !== false;
                  if (aAvail && !bAvail) return -1;
                  if (!aAvail && bAvail) return 1;
                  return 0;
                })
                .map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className="group relative border border-forest/5 shadow-sm hover:shadow-lg transition-all duration-500 rounded-2xl bg-white overflow-hidden flex flex-col h-full p-0">
                    <div className="aspect-[16/10] relative overflow-hidden bg-forest/5">
                      {item.data.image ? (
                        <img 
                          src={item.data.image} 
                          alt={item.data.title || item.data.name} 
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-forest/10">
                          <Package className="h-8 w-8 mb-1" />
                          <span className="text-[8px] font-bold uppercase tracking-widest">No Asset</span>
                        </div>
                      )}
                      
                      {/* Status Badges Overlay */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                        <Badge className="bg-white/95 backdrop-blur shadow-sm text-forest border-none px-2 py-0.5 rounded-md font-bold text-[8px] uppercase tracking-widest">
                          {item.type.replace('_', ' ')}
                        </Badge>
                        {item.data.isAvailable === false && (
                          <Badge className="bg-rose-500 text-white border-none px-2 py-0.5 rounded-md font-bold text-[8px] uppercase tracking-widest shadow-lg shadow-rose-500/20">
                            Offline
                          </Badge>
                        )}
                        {(item.data.itinerary?.length > 0 || item.data.theExperience) && (
                          <Badge className="bg-emerald-500/90 backdrop-blur shadow-sm text-white border-none px-2 py-0.5 rounded-md font-bold text-[8px] uppercase tracking-widest flex items-center gap-1">
                            <Clock className="h-2 w-2" />
                            Itinerary
                          </Badge>
                        )}
                      </div>

                      {/* Quick Actions Overlay */}
                      <div className="absolute inset-0 bg-forest/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3">
                        <Button 
                          size="sm"
                          className="w-32 rounded-full bg-white text-forest font-bold hover:bg-terracotta hover:text-white transition-all transform scale-90 group-hover:scale-100"
                          onClick={() => startEditing(item)}
                        >
                          <Edit2 className="h-4 w-4 mr-2" /> Edit
                        </Button>
                        <Button 
                          size="sm"
                          variant="secondary"
                          className={cn(
                            "w-32 rounded-full font-bold transition-all transform scale-90 group-hover:scale-105",
                            item.data.isAvailable !== false ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                          )}
                          onClick={async (e) => {
                            e.stopPropagation();
                            const newAvail = item.data.isAvailable === false ? true : false;
                            try {
                              const docRef = doc(db, 'content', item.id);
                              await updateDoc(docRef, {
                                'data.isAvailable': newAvail,
                                updatedAt: new Date().toISOString()
                              });
                              setNotification({ message: `Item is now ${newAvail ? 'Available' : 'Unavailable'}`, type: 'success' });
                            } catch (e) {
                              setNotification({ message: 'Update failed', type: 'error' });
                            }
                          }}
                        >
                          {item.data.isAvailable !== false ? <><Eye className="h-4 w-4 mr-2" /> Hide</> : <><EyeOff className="h-4 w-4 mr-2" /> Show</>}
                        </Button>
                        {item.type !== 'config' && (
                          <Button 
                            size="sm"
                            variant="destructive"
                            className="w-32 rounded-full font-bold bg-rose-600/90 text-white transform scale-90 group-hover:scale-110"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmModal({
                                title: 'Delete Asset?',
                                message: 'Are you sure you want to delete this asset permanently?',
                                onConfirm: async () => {
                                  try {
                                    await deleteDoc(doc(db, 'content', item.id));
                                    setNotification({ message: 'Asset deleted', type: 'success' });
                                  } catch (error) {
                                    handleFirestoreError(error, OperationType.DELETE, `content/${item.id}`);
                                  }
                                  setConfirmModal(null);
                                }
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </Button>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-4 flex-grow flex flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-forest text-xs leading-tight line-clamp-2 group-hover:text-terracotta transition-colors">{item.data.title || item.data.name}</h3>
                        <span className="text-terracotta font-mono font-bold text-[10px] whitespace-nowrap bg-terracotta/5 px-1.5 py-0.5 rounded leading-none">{item.data.price}</span>
                      </div>
                      
                      <p className="text-[10px] text-forest/50 font-medium line-clamp-2 leading-relaxed mb-2">
                        {item.data.description || item.data.category || 'No description provided.'}
                      </p>

                      <div className="mt-auto flex items-center justify-between pt-3 border-t border-forest/5">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-[9px] font-bold text-forest/30 uppercase tracking-tighter">
                            <Clock className="h-3 w-3" />
                            {item.data.duration || 'N/A'}
                          </div>
                          {item.data.difficulty && (
                            <div className="flex items-center gap-1 text-[9px] font-bold text-forest/30 uppercase tracking-tighter">
                              <Compass className="h-3 w-3" />
                              {item.data.difficulty}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 rounded-lg text-forest/40 hover:text-terracotta hover:bg-terracotta/5 transition-all font-bold text-[9px] uppercase tracking-widest"
                            onClick={() => startEditing(item)}
                          >
                            <Edit2 className="h-3 w-3 mr-1" /> Edit
                          </Button>

                          <Button
                            size="icon"
                            variant="ghost"
                            className={cn(
                              "h-7 w-7 rounded-lg transition-all duration-300",
                              item.data.isAvailable !== false ? "text-emerald-500 hover:bg-emerald-500/10" : "text-rose-500 hover:bg-rose-500/10"
                            )}
                            onClick={async (e: any) => {
                              e.stopPropagation();
                              const newAvail = item.data.isAvailable === false ? true : false;
                              try {
                                const docRef = doc(db, 'content', item.id);
                                await updateDoc(docRef, {
                                  'data.isAvailable': newAvail,
                                  updatedAt: new Date().toISOString()
                                });
                                setNotification({ message: `Item marked as ${newAvail ? 'available' : 'unavailable'}`, type: 'success' });
                              } catch (e) {
                                console.error('Error updating availability:', e);
                                setNotification({ message: 'Failed to update availability', type: 'error' });
                              }
                            }}
                          >
                            {item.data.isAvailable !== false ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                          </Button>
                          
                          {item.type !== 'config' && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 rounded-lg text-forest/20 hover:text-rose-600 hover:bg-rose-500/10 transition-all font-bold"
                              onClick={(e: any) => {
                                e.stopPropagation();
                                setConfirmModal({
                                  title: 'Delete Asset?',
                                  message: 'Delete this asset permanently?',
                                  onConfirm: async () => {
                                    try {
                                      await deleteDoc(doc(db, 'content', item.id));
                                      setNotification({ message: 'Asset deleted', type: 'success' });
                                    } catch (error) {
                                      handleFirestoreError(error, OperationType.DELETE, `content/${item.id}`);
                                    }
                                    setConfirmModal(null);
                                  }
                                });
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Bookings Tab */}
        {activeMainTab === 'bookings' && (
          <motion.div 
            key="bookings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-3xl font-heading font-bold text-forest tracking-tight">Reservations</h2>
                <p className="text-forest/40 text-sm font-medium">Manage all customer bookings and order history.</p>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-grow md:w-72">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-forest/30" />
                  <Input 
                    placeholder="Search reservations..." 
                    className="h-12 pl-12 rounded-2xl bg-white border-forest/5 focus:ring-2 focus:ring-terracotta/20 font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" className="h-12 w-12 rounded-2xl border-forest/5 bg-white p-0">
                  <Filter className="h-4 w-4 text-forest/40" />
                </Button>
              </div>
            </div>

            <Card className="border border-forest/5 shadow-sm rounded-xl bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-forest/[0.02] border-b border-forest/5">
                      <th className="px-6 py-4 text-[10px] font-bold text-forest/40 uppercase tracking-widest">Customer</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-forest/40 uppercase tracking-widest">Packages</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-forest/40 uppercase tracking-widest">Booking Date</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-forest/40 uppercase tracking-widest text-right">Amount</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-forest/40 uppercase tracking-widest text-center">Status</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-forest/40 uppercase tracking-widest text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forest/5">
                    {bookings.filter(b => 
                      b.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      (b.serviceName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                      b.items?.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    ).map((booking, i) => (
                      <motion.tr 
                        key={booking.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-forest/[0.01] transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-forest/5 flex items-center justify-center text-forest font-mono text-xs font-bold border border-forest/10">
                              {booking.userName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-forest">{booking.userName}</p>
                              <p className="text-[10px] text-forest/40 font-mono">{booking.userEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-terracotta uppercase tracking-widest">
                              {booking.items?.[0]?.type || booking.serviceType || 'N/A'}
                            </span>
                            <p className="text-xs font-medium text-forest">
                              {booking.items?.length 
                                ? (booking.items.length > 1 ? `${booking.items[0].name} + ${booking.items.length - 1} more` : booking.items[0].name)
                                : (booking.serviceName || 'N/A')}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-forest/40">
                            <Clock className="h-3.5 w-3.5" />
                            <span className="text-xs font-mono">
                              {booking.createdAt?.toDate ? new Date(booking.createdAt.toDate()).toLocaleDateString() : (booking.date || 'Pending')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-xs font-mono font-bold text-forest">₹{booking.totalPrice.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge className={cn(
                            "text-[9px] px-2 py-0.5 rounded border font-mono font-bold uppercase",
                            (booking.status === 'confirmed' || booking.status === 'paid') ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 
                            (booking.status === 'pending' || booking.status === 'reserved') ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                          )}>
                            {booking.status}
                          </Badge>
                          {booking.paymentMethod === 'reserve' && (
                            <p className="text-[8px] font-bold text-terracotta uppercase tracking-tighter mt-1">Reserve Option</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Share & Notify"
                              className="h-8 w-8 rounded-lg text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
                              onClick={() => handleShareBooking(booking)}
                            >
                              <Share2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Update Status"
                              className="h-8 w-8 rounded-lg text-forest/40 hover:text-forest hover:bg-forest/5"
                              onClick={() => {
                                setConfirmModal({
                                  message: `Mark this booking as ${booking.status === 'confirmed' ? 'pending' : 'confirmed'}?`,
                                  onConfirm: async () => {
                                    try {
                                      await updateDoc(doc(db, 'bookings', booking.id), {
                                        status: booking.status === 'confirmed' ? 'pending' : 'confirmed',
                                        updatedAt: serverTimestamp()
                                      });
                                      setNotification({ message: 'Booking status updated', type: 'success' });
                                    } catch (error) {
                                      handleFirestoreError(error, OperationType.UPDATE, `bookings/${booking.id}`);
                                    }
                                    setConfirmModal(null);
                                  }
                                });
                              }}
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Delete Globally"
                              className="h-8 w-8 rounded-lg text-rose-400 hover:text-rose-500 hover:bg-rose-50"
                              onClick={() => deleteBooking(booking.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeMainTab === 'users' && (
          <motion.div 
            key="users"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-2xl font-bold text-forest tracking-tight">User Registry</h2>
                <p className="text-[10px] text-forest/40 font-bold uppercase tracking-widest">Access Control & Identity Management</p>
              </div>
              <div className="px-4 py-1.5 bg-forest text-white rounded-lg font-mono font-bold text-[10px] uppercase tracking-widest shadow-md shadow-forest/20">
                {users.length} NODES ACTIVE
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {users.map((user, i) => (
                <motion.div
                  key={user.uid}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card 
                    className="border border-forest/5 shadow-sm hover:shadow-xl transition-all duration-500 rounded-2xl bg-white overflow-hidden group cursor-pointer relative p-0"
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                      <div className={cn(
                        "h-2 w-2 rounded-full",
                        user.isBlocked ? "bg-rose-500 animate-pulse" : "bg-emerald-500"
                      )} />
                    </div>

                    <CardContent className="p-8">
                      <div className="flex flex-col items-center text-center">
                        <div className="relative mb-6">
                          <div className="h-24 w-24 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-forest/5 group-hover:ring-terracotta/20 transition-all duration-700 transform group-hover:rotate-3">
                            <img 
                              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=random`} 
                              alt={user.displayName} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            />
                          </div>
                        </div>
                        
                        <h3 className="font-heading font-bold text-forest text-lg mb-1 group-hover:text-terracotta transition-colors">{user.displayName}</h3>
                        <p className="text-[10px] text-forest/40 font-mono font-bold uppercase tracking-widest mb-6">{user.email}</p>
                        
                        <div className="flex flex-wrap justify-center gap-2 mb-8">
                          <Badge className={cn(
                            "text-[9px] px-3 py-1 rounded-full border font-bold uppercase tracking-tighter",
                            user.role === 'admin' ? 'bg-terracotta/10 text-terracotta border-terracotta/20' : 'bg-forest/5 text-forest/40 border-forest/10'
                          )}>
                            {user.role}
                          </Badge>
                          {user.loyaltyPoints > 0 && (
                            <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[9px] px-3 py-1 rounded-full font-bold uppercase tracking-tighter">
                              {user.loyaltyPoints} XP
                            </Badge>
                          )}
                        </div>

                        <div className="w-full pt-6 border-t border-forest/5 flex justify-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBlockUser(user.uid, !!user.isBlocked);
                            }}
                            className={cn(
                              "w-full rounded-xl text-[10px] h-10 font-bold uppercase tracking-widest transition-all",
                              user.isBlocked 
                                ? "text-emerald-600 hover:bg-emerald-50" 
                                : "text-rose-600 hover:bg-rose-50"
                            )}
                          >
                            {user.isBlocked ? 'Restore' : 'Suspend'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* User Detail Modal */}
            <AnimatePresence>
              {selectedUser && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedUser(null)}
                    className="absolute inset-0 bg-forest/40 backdrop-blur-md"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
                  >
                    {/* Sidebar Info */}
                    <div className="w-full md:w-80 bg-forest p-10 text-white flex flex-col items-center shrink-0">
                      <div className="h-32 w-32 rounded-3xl overflow-hidden shadow-2xl mb-6 ring-4 ring-white/10">
                        <img 
                          src={selectedUser.photoURL || `https://ui-avatars.com/api/?name=${selectedUser.displayName}&background=random`} 
                          alt={selectedUser.displayName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-2xl font-heading font-bold mb-1 text-center">{selectedUser.displayName}</h3>
                      <p className="text-white/40 text-xs font-mono mb-8">{selectedUser.uid}</p>
                      
                      <div className="w-full space-y-4">
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Email Address</p>
                          <p className="text-sm font-medium truncate">{selectedUser.email}</p>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Loyalty Status</p>
                          <p className="text-sm font-medium text-amber-400">{selectedUser.loyaltyPoints} Experience Points</p>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Account Role</p>
                          <Badge className="bg-terracotta text-white border-none text-[10px] uppercase font-bold px-3 py-1 rounded-full mt-1">
                            {selectedUser.role}
                          </Badge>
                        </div>
                      </div>

                      <Button 
                        variant="outline" 
                        onClick={() => setSelectedUser(null)}
                        className="mt-auto w-full rounded-2xl border-white/10 text-white hover:bg-white/10 h-12 font-bold uppercase tracking-widest text-[10px]"
                      >
                        Close Terminal
                      </Button>
                    </div>

                    {/* Main Content: Order History */}
                    <div className="flex-grow p-10 overflow-y-auto bg-cream/30">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h4 className="text-xl font-heading font-bold text-forest">Order History</h4>
                          <p className="text-xs text-forest/40 font-medium">Complete record of Himalayan journeys</p>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-forest/5 flex items-center justify-center">
                          <History className="h-6 w-6 text-forest/40" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        {bookings.filter(b => b.userId === selectedUser.uid).length === 0 ? (
                          <div className="py-20 text-center">
                            <div className="h-16 w-16 rounded-2xl bg-forest/5 flex items-center justify-center mx-auto mb-4">
                              <Package className="h-8 w-8 text-forest/10" />
                            </div>
                            <p className="text-forest/40 text-sm font-bold uppercase tracking-widest">No transaction history found</p>
                          </div>
                        ) : (
                          bookings
                            .filter(b => b.userId === selectedUser.uid)
                            .map((booking) => (
                              <Card key={booking.id} className="border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden bg-white">
                                <CardContent className="p-6">
                                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex items-center gap-4">
                                      <div className={cn(
                                        "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                                        (booking.items?.[0]?.type || booking.serviceType) === 'tour' ? "bg-sky-500/10 text-sky-600" :
                                        (booking.items?.[0]?.type || booking.serviceType) === 'trek' ? "bg-emerald-500/10 text-emerald-600" :
                                        "bg-indigo-500/10 text-indigo-600"
                                      )}>
                                        {(booking.items?.[0]?.type || booking.serviceType) === 'tour' ? <Map className="h-6 w-6" /> : <Compass className="h-6 w-6" />}
                                      </div>
                                      <div>
                                        <h5 className="font-bold text-forest text-sm">
                                          {booking.items?.length 
                                            ? (booking.items.length > 1 ? `${booking.items[0].name} +${booking.items.length - 1}` : booking.items[0].name)
                                            : (booking.serviceName || 'N/A')}
                                        </h5>
                                        <div className="flex items-center gap-3 text-[10px] text-forest/40 font-bold uppercase tracking-widest mt-0.5">
                                          <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {booking.createdAt?.toDate ? new Date(booking.createdAt.toDate()).toLocaleDateString() : (booking.date || 'Pending')}
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            {booking.guests || booking.items?.reduce((a, c:any) => a + (c.quantity || 1), 0) || 0} Travelers
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end gap-2">
                                      <div className="text-sm font-bold text-terracotta">₹{booking.totalPrice.toLocaleString()}</div>
                                      <Badge className={cn(
                                        "text-[8px] font-bold uppercase px-2 py-0.5 rounded-full border",
                                        (booking.status === 'confirmed' || booking.status === 'paid') ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                                        (booking.status === 'pending' || booking.status === 'reserved') ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                                        "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                      )}>
                                        {booking.status}
                                      </Badge>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Direct Messages Tab */}
        {activeMainTab === 'seo_manager' && (
          <motion.div
            key="seo_manager"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-10"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-forest tracking-tight">SEO Manager</h2>
              <p className="text-[10px] text-forest/40 font-bold uppercase tracking-widest">
                Optimize content for high-intent traffic
              </p>
            </div>
            
            <Card className="border border-forest/5 shadow-sm rounded-xl p-6">
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await addDoc(collection(db, 'seo_settings'), {
                      ...seoFormData,
                      updatedAt: serverTimestamp()
                    });
                    setNotification({ message: 'SEO data saved successfully', type: 'success' });
                    setSeoFormData({ path: '', keyword: '', title: '', description: '' });
                  } catch (error) {
                    handleFirestoreError(error, OperationType.WRITE, 'seo_settings');
                  }
                }}
                className="space-y-4"
              >
                <Input placeholder="Page Path or Slug (e.g., /tours)" value={seoFormData.path} onChange={e => setSeoFormData({...seoFormData, path: e.target.value})} className="h-12 rounded-lg" required />
                <Input placeholder="Target Keyword" value={seoFormData.keyword} onChange={e => setSeoFormData({...seoFormData, keyword: e.target.value})} className="h-12 rounded-lg" />
                <Input placeholder="SEO Title" value={seoFormData.title} onChange={e => setSeoFormData({...seoFormData, title: e.target.value})} className="h-12 rounded-lg" required />
                <Textarea placeholder="Meta Description" value={seoFormData.description} onChange={e => setSeoFormData({...seoFormData, description: e.target.value})} className="rounded-lg" required />
                <Button type="submit" className="bg-terracotta hover:bg-terracotta/90 text-white font-bold h-10 w-full">Save SEO Data</Button>
              </form>
            </Card>
          </motion.div>
        )}
        {activeMainTab === 'messages' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-10"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-forest tracking-tight">Communications</h2>
                <p className="text-[10px] text-forest/40 font-bold uppercase tracking-widest">Inbound Signal Stream</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="rounded-lg px-3 py-1 bg-white border-forest/10 text-forest/40 font-mono font-bold text-[10px] uppercase tracking-widest">
                  {messages.filter(m => m.status === 'unread').length} UNREAD SIGNALS
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {messages.length === 0 ? (
                <Card className="border-dashed border border-forest/10 bg-transparent p-12 flex flex-col items-center justify-center text-center rounded-xl">
                  <div className="h-16 w-16 rounded-xl bg-forest/5 flex items-center justify-center mb-4">
                    <MessageCircleIcon className="h-8 w-8 text-forest/20" />
                  </div>
                  <h3 className="text-sm font-bold text-forest mb-1">No signals detected</h3>
                  <p className="text-[10px] text-forest/40 max-w-xs font-bold uppercase tracking-widest">Awaiting guest transmissions</p>
                </Card>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className={cn(
                      "border border-forest/5 shadow-sm rounded-xl overflow-hidden transition-all duration-300",
                      msg.status === 'unread' ? "bg-white ring-1 ring-terracotta/20" : "bg-white/60 opacity-80"
                    )}>
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-6">
                          <div className="flex-grow">
                            <div className="flex items-center gap-3 mb-3">
                              <Badge className={cn(
                                "rounded px-2 py-0.5 text-[8px] font-mono font-bold uppercase tracking-widest border",
                                msg.status === 'unread' ? "bg-terracotta/10 text-terracotta border-terracotta/20" : "bg-forest/5 text-forest/40 border-forest/10"
                              )}>
                                {msg.status}
                              </Badge>
                              <span className="text-[10px] text-forest/30 font-mono font-bold">
                                {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleString() : 'Syncing...'}
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-forest mb-1">{msg.subject}</h3>
                            <div className="flex items-center gap-4 mb-4">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-forest/60">{msg.userName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-forest/30 font-mono">{msg.userEmail}</span>
                              </div>
                            </div>
                            <div className="bg-forest/[0.02] border border-forest/5 rounded-lg p-4 text-xs text-forest/70 leading-relaxed font-medium">
                              {msg.message}
                            </div>
                          </div>
                          <div className="flex lg:flex-col gap-2 justify-end lg:justify-start min-w-[140px]">
                            <Button
                              size="sm"
                              onClick={async () => {
                                try {
                                  const newStatus = msg.status === 'unread' ? 'read' : 'unread';
                                  await updateDoc(doc(db, 'messages', msg.id), { status: newStatus });
                                  setNotification({ message: `Signal marked as ${newStatus}`, type: 'success' });
                                } catch (error) {
                                  handleFirestoreError(error, OperationType.UPDATE, `messages/${msg.id}`);
                                }
                              }}
                              className={cn(
                                "rounded-lg font-bold text-[9px] uppercase tracking-widest h-9 w-full",
                                msg.status === 'unread' ? "bg-forest text-white" : "bg-white border border-forest/10 text-forest/40"
                              )}
                            >
                              {msg.status === 'unread' ? 'Acknowledge' : 'Re-flag'}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setConfirmModal({
                                  title: 'Delete Signal?',
                                  message: 'Are you sure you want to permanently delete this communication? This cannot be undone.',
                                  onConfirm: async () => {
                                    try {
                                      await deleteDoc(doc(db, 'messages', msg.id));
                                      setNotification({ message: 'Signal deleted successfully', type: 'success' });
                                    } catch (error) {
                                      handleFirestoreError(error, OperationType.DELETE, `messages/${msg.id}`);
                                    }
                                    setConfirmModal(null);
                                  }
                                });
                              }}
                              className="rounded-lg font-bold text-[9px] uppercase tracking-widest h-9 w-full text-rose-500 hover:bg-rose-500/5 mt-1"
                            >
                              <Trash2 className="h-3 w-3 mr-2" /> Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {confirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-forest/40 backdrop-blur-sm"
              onClick={() => setConfirmModal(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-heading font-bold text-forest mb-4">Confirm Action</h3>
              <p className="text-forest/60 mb-8">{confirmModal.message}</p>
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  className="flex-grow rounded-xl border-forest/10"
                  onClick={() => setConfirmModal(null)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-grow rounded-xl bg-terracotta text-white"
                  onClick={async () => {
                    setIsProcessing(true);
                    try {
                      await confirmModal.onConfirm();
                    } finally {
                      setIsProcessing(false);
                    }
                  }}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    'Confirm'
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: 100 }}
            className={cn(
              "fixed bottom-10 right-10 z-[100] p-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[300px]",
              notification.type === 'success' ? 'bg-forest text-white' : 'bg-red-500 text-white'
            )}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            ) : (
              <AlertCircle className="h-5 w-5 text-white" />
            )}
            <p className="text-sm font-bold">{notification.message}</p>
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-auto h-6 w-6 hover:bg-white/10"
              onClick={() => setNotification(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Syncing Overlay */}
      <AnimatePresence>
        {isSyncing && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-forest/20 backdrop-blur-[2px]">
            <Card className="p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
              <RefreshCw className="h-10 w-10 text-terracotta animate-spin" />
              <p className="font-bold text-forest">Syncing default packages...</p>
            </Card>
          </div>
        )}
      </AnimatePresence>
      </main>
    </div>
  );
}
