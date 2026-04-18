import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MessageSquare, Send, X, User } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/AuthContext';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  serviceId: string;
  serviceType: string;
  createdAt: any;
}

interface ReviewsDialogProps {
  serviceId: string;
  serviceType: string;
  serviceName: string;
  trigger?: React.ReactNode;
}

export default function ReviewsDialog({ serviceId, serviceType, serviceName, trigger }: ReviewsDialogProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowForm(false);
      return;
    }

    const q = query(
      collection(db, 'reviews'),
      where('serviceId', '==', serviceId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      setReviews(fetchedReviews);
    });

    return () => unsubscribe();
  }, [serviceId, isOpen]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        userId: user.uid,
        userName: user.displayName || 'Anonymous User',
        userPhoto: user.photoURL || '',
        rating: newRating,
        comment: newComment,
        serviceId,
        serviceType,
        createdAt: serverTimestamp()
      });
      setNewComment('');
      setNewRating(5);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger 
        nativeButton={true}
        render={
          trigger || (
            <button className={cn(buttonVariants({ variant: "outline" }), "rounded-full border-forest/20 text-forest hover:bg-forest hover:text-white transition-all px-4 py-2 flex items-center")}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Reviews ({reviews.length})
            </button>
          )
        }
      />
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-hidden flex flex-col p-0 rounded-[2rem] border-none shadow-2xl bg-cream">
        <DialogHeader className="p-8 bg-forest text-white">
          <DialogTitle className="text-2xl font-heading flex items-center justify-between">
            <span>Reviews for {serviceName}</span>
            <div className="flex items-center text-yellow-400 text-sm">
              <Star className="h-4 w-4 fill-current mr-1" />
              {averageRating} ({reviews.length})
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto p-8 space-y-8">
          {/* Add Review Button */}
          {!showForm && (
            <div className="flex justify-center">
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-forest hover:bg-forest/90 text-white rounded-full px-8 py-6 h-auto text-lg font-bold shadow-lg shadow-forest/20"
              >
                <Star className="mr-2 h-5 w-5 fill-current text-yellow-400" />
                Add Review
              </Button>
            </div>
          )}

          {/* Review Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {user ? (
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-forest/5 relative">
                    <button 
                      onClick={() => setShowForm(false)}
                      className="absolute top-4 right-4 text-forest/20 hover:text-forest transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <h4 className="text-sm font-bold text-forest mb-4">Write a Review</h4>
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            className={cn(
                              "transition-all transform hover:scale-110",
                              newRating >= star ? "text-yellow-500" : "text-gray-200"
                            )}
                          >
                            <Star className={cn("h-6 w-6", newRating >= star && "fill-current")} />
                          </button>
                        ))}
                      </div>
                      <Textarea
                        placeholder="Share your experience..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[100px] rounded-xl border-forest/10 focus:ring-forest/20"
                      />
                      <Button 
                        type="submit" 
                        disabled={isSubmitting || !newComment.trim()}
                        className="w-full bg-terracotta hover:bg-terracotta/90 text-white rounded-full"
                      >
                        {isSubmitting ? 'Posting...' : 'Post Review'}
                        <Send className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-white/50 p-6 rounded-2xl text-center border border-dashed border-forest/20 relative">
                    <button 
                      onClick={() => setShowForm(false)}
                      className="absolute top-4 right-4 text-forest/20 hover:text-forest transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <p className="text-sm text-forest/60">Please login to write a review.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reviews List */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold text-forest uppercase tracking-widest opacity-40">Recent Reviews</h4>
            {reviews.length === 0 ? (
              <div className="text-center py-10 opacity-30">
                <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                <p>No reviews yet. Be the first!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <motion.div 
                    key={review.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-forest/5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-forest/10 flex items-center justify-center text-forest overflow-hidden">
                          {review.userPhoto ? (
                            <img src={review.userPhoto} alt={review.userName} className="w-full h-full object-cover" />
                          ) : (
                            <User className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-forest">{review.userName}</p>
                          <p className="text-[10px] text-forest/40">
                            {review.createdAt instanceof Timestamp 
                              ? review.createdAt.toDate().toLocaleDateString()
                              : 'Just now'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center text-yellow-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={cn("h-3 w-3", i < review.rating && "fill-current")} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-forest/70 leading-relaxed italic">
                      "{review.comment}"
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
