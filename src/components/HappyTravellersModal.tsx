import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Star, ChevronRight, User, Upload, Plus, Trash2, Edit2, Play, Pause } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';

interface Traveller {
  id: string;
  name: string;
  trips: number;
  badges: string[];
  image: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  testimonial: string;
  rating: number;
  status: 'pending' | 'approved';
  createdAt?: any;
}

interface HappyTravellersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HappyTravellersModal({ isOpen, onClose }: HappyTravellersModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [travellers, setTravellers] = useState<Traveller[]>([]);
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Review Form State
  const [formData, setFormData] = useState({
    name: '',
    testimonial: '',
    rating: 5,
    mediaFile: null as File | null,
    mediaPreview: '',
    mediaType: 'image' as 'image' | 'video' | null,
    trips: 1,
    badges: 'Wanderer'
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Reviews
  useEffect(() => {
    const q = query(collection(db, 'wall_of_fame_reviews'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Traveller[] = [];
      snapshot.forEach(docSnap => {
        data.push({ id: docSnap.id, ...docSnap.data() } as Traveller);
      });
      setTravellers(data);
    }, (err) => console.error("Error fetching reviews:", err));
    return () => unsubscribe();
  }, []);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setIsWritingReview(false);
      setEditingId(null);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ 
        ...prev, 
        mediaFile: file,
        mediaPreview: URL.createObjectURL(file),
        mediaType: file.type.startsWith('video/') ? 'video' : 'image'
      }));
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Perform upload
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Upload failed: ${res.status} ${errorText}`);
    }
    
    const data = await res.json();
    return data.url;
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      let finalMediaUrl = editingId ? (travellers.find(t => t.id === editingId)?.mediaUrl || '') : '';
      let finalMediaType = editingId ? (travellers.find(t => t.id === editingId)?.mediaType || 'image') : ('image' as 'image' | 'video');

      if (formData.mediaFile) {
        const url = await uploadFile(formData.mediaFile);
        if (url) {
          finalMediaUrl = url;
          finalMediaType = formData.mediaType || 'image';
        }
      }

      const reviewPayload = {
        name: formData.name || user?.displayName || 'Anonymous Traveller',
        testimonial: formData.testimonial,
        rating: formData.rating,
        trips: Number(formData.trips) || 1,
        badges: formData.badges.split(',').map(b => b.trim()).filter(Boolean),
        mediaUrl: finalMediaUrl,
        mediaType: finalMediaType,
        image: user?.photoURL || 'https://images.unsplash.com/photo-1544735230-c112df2146bc?q=80&w=200&auto=format&fit=crop',
        status: user?.role === 'admin' ? 'approved' : 'pending',
        updatedAt: serverTimestamp()
      };

      if (editingId) {
        await updateDoc(doc(db, 'wall_of_fame_reviews', editingId), reviewPayload);
      } else {
        await addDoc(collection(db, 'wall_of_fame_reviews'), {
          ...reviewPayload,
          createdAt: serverTimestamp()
        });
      }
      
      setIsWritingReview(false);
      setEditingId(null);
      setFormData({ name: '', testimonial: '', rating: 5, mediaFile: null, mediaPreview: '', mediaType: null, trips: 1, badges: 'Wanderer' });
    } catch (err: any) {
      console.error('Error submitting review:', err);
      if (err.code === 'permission-denied') {
        alert('Permission denied: Wait for the system to process or login properly. Check console.');
      } else {
        alert('Failed to submit review. Check console: ' + err.message);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteDoc(doc(db, 'wall_of_fame_reviews', id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const openEdit = (t: Traveller, e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData({
      name: t.name,
      testimonial: t.testimonial,
      rating: t.rating,
      mediaFile: null,
      mediaPreview: t.mediaUrl || '',
      mediaType: t.mediaType || 'image',
      trips: t.trips || 1,
      badges: t.badges ? t.badges.join(', ') : ''
    });
    setEditingId(t.id);
    setIsWritingReview(true);
  };

  const filteredTravellers = travellers.filter(t => 
    t.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.badges?.some(b => b.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100]"
          />

          {/* Modal Panel */}
          <div className="fixed inset-0 z-[101] flex items-end sm:items-center justify-center pointer-events-none sm:p-4">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full sm:w-[600px] sm:max-w-full bg-white/95 backdrop-blur-xl sm:rounded-[2rem] rounded-t-[2.5rem] h-[90dvh] sm:h-auto sm:max-h-[85vh] flex flex-col shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden pointer-events-auto border border-white/40 relative"
            >
              {/* iOS Pull Indicator */}
              <div className="w-full flex justify-center pt-4 pb-2 sm:hidden cursor-pointer" onClick={onClose}>
                <div className="w-12 h-1.5 bg-neutral-300 rounded-full" />
              </div>

              {isWritingReview ? (
                /* Review Form */
                <div className="flex flex-col h-full">
                  <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-white shrink-0">
                    <h2 className="text-xl font-bold">{editingId ? 'Edit Review' : 'Write a Review'}</h2>
                    <button onClick={() => { setIsWritingReview(false); setEditingId(null); }} className="p-2 bg-neutral-100 rounded-full hover:bg-neutral-200">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 style-scroll">
                    <form id="review-form" onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <label className="text-sm font-bold text-neutral-700 block mb-1">Your Name</label>
                        <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 rounded-xl bg-neutral-100/80 focus:ring-2 focus:ring-forest outline-none transition-all" placeholder="John Doe" />
                      </div>
                      
                      {user?.role === 'admin' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-bold text-neutral-700 block mb-1">Badges (comma separated)</label>
                            <input type="text" value={formData.badges} onChange={e => setFormData({ ...formData, badges: e.target.value })} className="w-full p-3 rounded-xl bg-neutral-100/80 focus:ring-2 focus:ring-forest outline-none transition-all" placeholder="Pro Trekker, Explorer" />
                          </div>
                          <div>
                            <label className="text-sm font-bold text-neutral-700 block mb-1">Trips Completed</label>
                            <input type="number" min="1" value={formData.trips} onChange={e => setFormData({ ...formData, trips: Number(e.target.value) })} className="w-full p-3 rounded-xl bg-neutral-100/80 focus:ring-2 focus:ring-forest outline-none transition-all" />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="text-sm font-bold text-neutral-700 block mb-1">Rating</label>
                        <div className="flex gap-2">
                          {[1,2,3,4,5].map(star => (
                            <button type="button" key={star} onClick={() => setFormData({ ...formData, rating: star })} className={`p-2 rounded-xl transition-all ${formData.rating >= star ? 'bg-amber-100 text-amber-500' : 'bg-neutral-100 text-neutral-300 hover:text-amber-300'}`}>
                              <Star className="w-6 h-6 fill-current" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-bold text-neutral-700 block mb-1">Memory (Image or Video)</label>
                        <input type="file" accept="image/*,video/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                        
                        {formData.mediaPreview ? (
                          <div className="relative w-full h-48 bg-black rounded-xl overflow-hidden group">
                            {formData.mediaType === 'video' ? (
                              <video src={formData.mediaPreview} className="w-full h-full object-cover opacity-80" controls />
                            ) : (
                              <img src={formData.mediaPreview} className="w-full h-full object-cover" />
                            )}
                            <button type="button" onClick={() => { fileInputRef.current?.click(); }} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-bold backdrop-blur-sm">
                              Change File
                            </button>
                          </div>
                        ) : (
                          <div onClick={() => fileInputRef.current?.click()} className="w-full h-32 border-2 border-dashed border-neutral-300 rounded-xl flex flex-col items-center justify-center text-neutral-500 hover:text-forest hover:border-forest hover:bg-forest/5 cursor-pointer transition-all">
                            <Upload className="w-6 h-6 mb-2" />
                            <span className="text-sm font-medium">Click to upload photo or video</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-bold text-neutral-700 block mb-1">Your Story</label>
                        <textarea required value={formData.testimonial} onChange={e => setFormData({ ...formData, testimonial: e.target.value })} rows={4} className="w-full p-3 rounded-xl bg-neutral-100/80 focus:ring-2 focus:ring-forest outline-none transition-all resize-none" placeholder="Share your experience with The Soul Himalaya..." />
                      </div>
                      
                      <div className="pb-4">
                        <Button type="submit" form="review-form" disabled={isUploading} className="w-full py-6 rounded-xl bg-forest hover:bg-forest/90 text-white font-bold text-lg shadow-lg">
                          {isUploading ? 'Uploading...' : (editingId ? 'Update Review' : 'Post Review')}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="px-6 pb-4 pt-2 sm:pt-8 border-b border-neutral-100 bg-white/50 shrink-0">
                    <div className="flex justify-between items-center mb-5">
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-neutral-900">Reviews of Fame</h2>
                        <p className="text-xs sm:text-sm font-bold tracking-widest uppercase text-terracotta mt-1">HAPPY TRAVELLERS</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setIsWritingReview(true)}
                          className="h-10 px-4 bg-forest rounded-full flex items-center justify-center text-white hover:bg-forest/90 transition-colors shadow-md text-sm font-bold gap-2"
                        >
                          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Write a Review</span>
                        </button>
                        <button 
                          onClick={onClose}
                          className="h-10 w-10 shrink-0 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-200 hover:text-neutral-800 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input 
                        type="text" 
                        placeholder="Search by name or badge..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-neutral-100/80 border-none rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 transition-all font-medium text-neutral-800 placeholder:text-neutral-400 shadow-inner"
                      />
                    </div>
                  </div>

                  {/* List */}
                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-12 style-scroll">
                    {filteredTravellers.map((traveller, idx) => (
                      <motion.div
                        key={traveller.id}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.3) }}
                        className="bg-white rounded-3xl p-5 shadow-[0_5px_15px_-5px_rgba(0,0,0,0.05)] border border-neutral-100 flex flex-col gap-3 group hover:border-forest/20 transition-colors relative"
                        itemScope itemType="https://schema.org/Review"
                      >
                        {user?.role === 'admin' && (
                          <div className="absolute top-4 right-4 flex gap-1 bg-white p-1 rounded-full shadow-sm border border-neutral-100 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => openEdit(traveller, e)} className="p-1.5 text-neutral-400 hover:text-blue-500 hover:bg-blue-50 rounded-full"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={(e) => handleDelete(traveller.id, e)} className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-full"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        )}

                        <div itemProp="itemReviewed" itemScope itemType="https://schema.org/Organization" className="hidden">
                          <meta itemProp="name" content="The Soul Himalaya" />
                        </div>

                        <div className="flex items-start gap-4">
                          {/* Generic Avatar Icon */}
                          <div className="relative shrink-0 mt-1">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex items-center justify-center relative bg-terracotta/10 text-terracotta shrink-0 shadow-inner">
                              <User className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0 pt-1 pr-12">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-bold text-neutral-900 truncate text-sm sm:text-base" itemProp="author" itemScope itemType="https://schema.org/Person">
                                  <span itemProp="name">{traveller.name}</span>
                                  {traveller.status === 'pending' && <span className="ml-2 text-[10px] text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-widest font-black">Pending</span>}
                                </h3>
                                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                  {traveller.badges?.map(badge => (
                                    <span key={badge} className="px-2 py-0.5 bg-terracotta/10 text-terracotta text-[9px] font-black uppercase tracking-widest rounded-full">
                                      {badge}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Rating */}
                              <div className="flex text-amber-400 shrink-0 mt-1" itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
                                <meta itemProp="ratingValue" content={String(traveller.rating)} />
                                <meta itemProp="bestRating" content="5" />
                                {Array.from({length: traveller.rating || 5}).map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-current" />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Testimonial */}
                        <div className="text-sm text-neutral-600 italic tracking-wide pb-1 sm:pl-16">
                          <span itemProp="reviewBody">"{traveller.testimonial}"</span>
                        </div>

                        {/* Standalone Media for better visibility if custom uploaded */}
                        {traveller.mediaUrl && (
                           <div className="mt-2 w-full relative bg-neutral-100 rounded-xl overflow-hidden shadow-sm max-h-[350px] border border-neutral-100/50 group/media">
                              {traveller.mediaType === 'video' ? (
                                <video src={traveller.mediaUrl} className="w-full max-h-[350px] object-contain bg-black" controls preload="metadata" />
                              ) : (
                                <img src={traveller.mediaUrl} className="w-full max-h-[350px] object-cover" loading="lazy" />
                              )}
                           </div>
                        )}

                        {/* Action */}
                        <div className="pt-4 border-t border-neutral-100 flex justify-end">
                          <Link 
                            to="/tours" 
                            onClick={onClose}
                            className="text-[11px] font-bold text-forest hover:text-terracotta transition-colors flex items-center gap-1.5 px-4 py-2 bg-neutral-50 hover:bg-terracotta/5 rounded-full uppercase tracking-wider"
                          >
                            Plan a trip like {traveller.name?.split(' ')[0] || 'them'} 
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                    
                    {filteredTravellers.length === 0 && (
                      <div className="py-16 text-center text-neutral-500">
                        <User className="w-16 h-16 mx-auto mb-4 text-neutral-200" />
                        <p className="font-medium">No reviews found yet.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
