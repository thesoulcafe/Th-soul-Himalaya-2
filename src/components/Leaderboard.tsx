import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Medal, Star, Zap, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface LeaderboardUser {
  id: string;
  name: string;
  points: number;
  photoURL?: string;
  level: string;
}

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, we'd have a 'users' collection with pre-calculated 'soulPoints'
    // For this 2026 standard demo, we listen to a 'leaderboard' collection
    const q = query(
      collection(db, 'users'), 
      orderBy('soulPoints', 'desc'), 
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().displayName || 'Himalayan Traveler',
        points: doc.data().soulPoints || 0,
        photoURL: doc.data().photoURL,
        level: (doc.data().soulPoints || 0) > 1000 ? 'Legend' : 'Explorer'
      })) as LeaderboardUser[];
      
      setLeaders(data);
      setLoading(false);
    }, (error) => {
      console.error("Leaderboard error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Card className="border-none bg-white/50 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-forest/[0.05] overflow-hidden">
      <div className="p-8 bg-forest text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Trophy className="h-6 w-6 text-amber-400" />
            </div>
            <h3 className="text-xl font-heading font-bold">Multiplayer Leaderboard</h3>
          </div>
          <Badge className="bg-terracotta/20 text-terracotta border-none text-[10px]">Real-time</Badge>
        </div>
        <p className="text-white/60 text-xs font-medium uppercase tracking-widest">Top Soul Seekers</p>
      </div>

      <div className="p-6">
        <ul className="space-y-4">
          <AnimatePresence mode="popLayout">
            {leaders.map((user, idx) => (
              <motion.li
                key={user.id}
                initial={{ opacity: 0, x: -20, rotateX: idx === 0 ? 15 : 0 }}
                animate={{ opacity: 1, x: 0, rotateX: 0 }}
                whileHover={{ scale: 1.02, rotateY: 2 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "flex items-center justify-between p-4 rounded-3xl transition-all group perspective-1000 transform-gpu",
                  idx === 0 
                    ? "bg-forest text-white border-none shadow-xl shadow-forest/20" 
                    : "bg-white border border-forest/5 hover:border-terracotta/20 text-forest"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center overflow-hidden border-2 shadow-sm",
                      idx === 0 ? "bg-white/10 border-white/20" : "bg-forest/5 border-white"
                    )}>
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.name} className="h-full w-full object-cover" />
                      ) : (
                        <Star className={cn("h-5 w-5", idx === 0 ? "text-white/20" : "text-forest/20")} />
                      )}
                    </div>
                    {idx === 0 && <Crown className="absolute -top-3 -right-3 h-6 w-6 text-amber-500 drop-shadow-md animate-bounce-slow" />}
                  </div>
                  <div>
                    <p className={cn("font-bold text-sm", idx === 0 ? "text-white" : "text-forest")}>{user.name}</p>
                    <p className={cn("text-[10px] font-black uppercase tracking-widest", idx === 0 ? "text-terracotta" : "text-terracotta/80")}>{user.level}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn("text-lg font-black tracking-tighter", idx === 0 ? "text-white" : "text-forest")}>{user.points.toLocaleString()}</p>
                  <p className={cn("text-[9px] font-bold uppercase", idx === 0 ? "text-white/40" : "text-forest/30")}>Soul Pts</p>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </Card>
  );
}
