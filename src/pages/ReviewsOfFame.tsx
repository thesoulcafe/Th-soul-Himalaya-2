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

export default function ReviewsOfFame() {
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
    <div className="min-h-screen bg-white">
      <header className="pt-32 pb-12 px-6 max-w-7xl mx-auto text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-8xl font-serif text-neutral-900 tracking-tight"
        >
          Reviews of <span className="italic text-terracotta">Fame</span>
        </motion.h1>
        <p className="text-sm font-bold tracking-widest uppercase text-forest mt-4">Happy Travellers</p>
      </header>

      <main className="max-w-4xl mx-auto px-6 pb-24">
        {isWritingReview ? (
          <div className="bg-white border text-left border-neutral-100 shadow-xl rounded-[2rem] p-6 sm:p-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">{editingId ? 'Edit Review' : 'Write a Review'}</h2>
              <button onClick={() => { setIsWritingReview(false); setEditingId(null); }} className="p-3 bg-neutral-100 rounded-full hover:bg-neutral-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form id="review-form" onSubmit={handleSubmitReview} className="space-y-6">
              <div>
                <label className="text-sm font-bold text-neutral-700 block mb-2">Your Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-4 rounded-xl bg-neutral-100/80 focus:ring-2 focus:ring-forest outline-none transition-all" placeholder="John Doe" />
              </div>
              
              {user?.role === 'admin' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-neutral-700 block mb-2">Badges (comma separated)</label>
                    <input type="text" value={formData.badges} onChange={e => setFormData({ ...formData, badges: e.target.value })} className="w-full p-4 rounded-xl bg-neutral-100/80 focus:ring-2 focus:ring-forest outline-none transition-all" placeholder="Pro Trekker, Explorer" />
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-bold text-neutral-700 block mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(star => (
                    <button type="button" key={star} onClick={() => setFormData({ ...formData, rating: star })} className={`p-3 rounded-xl transition-all ${formData.rating >= star ? 'bg-amber-100 text-amber-500' : 'bg-neutral-100 text-neutral-300 hover:text-amber-300'}`}>
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-neutral-700 block mb-2">Memory (Image or Video)</label>
                <input type="file" accept="image/*,video/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                
                {formData.mediaPreview ? (
                  <div className="relative w-full h-64 bg-black rounded-xl overflow-hidden group">
                    {formData.mediaType === 'video' ? (
                      <video src={formData.mediaPreview} className="w-full h-full object-cover opacity-80" controls />
                    ) : (
                      <img src={formData.mediaPreview} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    )}
                    <button type="button" onClick={() => { fileInputRef.current?.click(); }} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-bold backdrop-blur-sm">
                      Change File
                    </button>
                  </div>
                ) : (
                  <div onClick={() => fileInputRef.current?.click()} className="w-full h-48 border-2 border-dashed border-neutral-300 rounded-xl flex flex-col items-center justify-center text-neutral-500 hover:text-forest hover:border-forest hover:bg-forest/5 cursor-pointer transition-all">
                    <Upload className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">Click to upload photo or video</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-bold text-neutral-700 block mb-2">Your Story</label>
                <textarea required value={formData.testimonial} onChange={e => setFormData({ ...formData, testimonial: e.target.value })} rows={5} className="w-full p-4 rounded-xl bg-neutral-100/80 focus:ring-2 focus:ring-forest outline-none transition-all resize-none" placeholder="Share your experience with The Soul Himalaya..." />
              </div>
              
              <div className="pt-4">
                <Button type="submit" form="review-form" disabled={isUploading} className="w-full py-6 rounded-xl bg-forest hover:bg-forest/90 text-white font-bold text-lg shadow-lg">
                  {isUploading ? 'Uploading...' : (editingId ? 'Update Review' : 'Post Review')}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input 
                  type="text" 
                  placeholder="Search by name or badge..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-100/80 border-none rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-forest/20 transition-all font-medium text-neutral-800 placeholder:text-neutral-400 shadow-inner"
                />
              </div>
              <button 
                onClick={() => setIsWritingReview(true)}
                className="w-full sm:w-auto h-14 px-8 bg-forest text-white rounded-2xl flex items-center justify-center hover:bg-forest/90 transition-colors shadow-none hover:shadow-xl font-bold gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                <Plus className="w-5 h-5" /> Write a Review
              </button>
            </div>

            <div className="space-y-6">
              {filteredTravellers.map((traveller, idx) => (
                <motion.div
                  key={traveller.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: Math.min(idx * 0.05, 0.3) }}
                  className="bg-white rounded-[2rem] p-6 sm:p-10 shadow-[0_5px_15px_-5px_rgba(0,0,0,0.05)] border border-neutral-100 relative group overflow-hidden"
                >
                  {user?.role === 'admin' && (
                    <div className="absolute top-6 right-6 flex gap-2 bg-white/90 p-2 rounded-full shadow-sm border border-neutral-100 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => openEdit(traveller, e)} className="p-2 text-neutral-400 hover:text-blue-500 hover:bg-blue-50 rounded-full"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={(e) => handleDelete(traveller.id, e)} className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-full"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1 w-full text-left">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden flex items-center justify-center relative bg-terracotta/10 text-terracotta shrink-0 shadow-inner">
                          <User className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-neutral-900 text-lg">
                                {traveller.name}
                                {traveller.status === 'pending' && <span className="ml-2 text-[10px] text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-widest font-black align-middle">Pending</span>}
                              </h3>
                              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                {traveller.badges?.map(badge => (
                                  <span key={badge} className="px-2 py-1 bg-terracotta/5 text-terracotta text-[10px] font-black uppercase tracking-widest rounded-full">
                                    {badge}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="flex text-amber-400 shrink-0 mt-1">
                              {Array.from({length: traveller.rating || 5}).map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-current" />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-base text-neutral-600 italic tracking-wide pb-4 sm:pl-18">
                        "{traveller.testimonial}"
                      </div>
                    </div>

                    {traveller.mediaUrl && (
                      <div className="w-full sm:w-1/3 shrink-0 rounded-2xl overflow-hidden bg-neutral-100 max-h-[300px]">
                        {traveller.mediaType === 'video' ? (
                          <video src={traveller.mediaUrl} className="w-full h-full object-contain bg-black max-h-[300px]" controls preload="metadata" />
                        ) : (
                          <img src={traveller.mediaUrl} className="w-full h-full object-cover max-h-[300px]" loading="lazy" referrerPolicy="no-referrer" />
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {filteredTravellers.length === 0 && (
                <div className="py-20 text-center text-neutral-400">
                  <User className="w-20 h-20 mx-auto mb-6 text-neutral-200" />
                  <p className="text-lg font-medium">No reviews found yet.</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
