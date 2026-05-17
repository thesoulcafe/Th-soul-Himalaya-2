import React, { useState } from 'react';
import { auth, googleProvider } from '@/lib/firebase';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Mail, Lock, User, Chrome, Phone } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPhonePrompt, setShowPhonePrompt] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { isBlocked } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists() || !docSnap.data().phone) {
        setPendingUser(user);
        setShowPhonePrompt(true);
        return;
      }
      
      onClose();
      if (window.location.pathname !== '/admin') {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingUser || !phone) return;
    
    setLoading(true);
    try {
      await setDoc(doc(db, 'users', pendingUser.uid), {
        uid: pendingUser.uid,
        email: pendingUser.email,
        displayName: pendingUser.displayName,
        photoURL: pendingUser.photoURL,
        phone: phone,
        role: 'user',
        loyaltyPoints: 0,
        isBlocked: false,
        createdAt: new Date().toISOString()
      }, { merge: true });
      
      onClose();
      if (window.location.pathname !== '/admin') {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        
        // Save additional info
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email,
          displayName: name,
          phone,
          role: 'user',
          loyaltyPoints: 0,
          isBlocked: false,
          createdAt: new Date().toISOString()
        });
      }
      onClose();
      if (window.location.pathname !== '/admin') {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setLoading(true);
    setError('');
    setResetSent(false);
    
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] bg-forest border-white/10 text-cream">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading font-bold text-white">
            {isForgotPassword ? 'Forgot Password' : isLogin ? 'Welcome Back' : 'Join the Soul'}
          </DialogTitle>
          <DialogDescription className="text-cream/60">
            {isForgotPassword ? '' : isLogin ? 'Sign in to access your bookings.' : 'Create an account to start your journey.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {showPhonePrompt ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold">One last step!</h3>
                <p className="text-xs text-cream/60">Please provide your mobile number to complete your profile.</p>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-cream/40" />
                  <Input
                    type="tel"
                    placeholder="Mobile Number"
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-terracotta text-white" disabled={loading}>
                {loading ? 'Saving...' : 'Complete Signup'}
              </Button>
            </form>
          ) : isForgotPassword ? (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold">Reset Password</h3>
                <p className="text-xs text-cream/60">Enter your email address and we'll send you a link to reset your password.</p>
              </div>
              
              {resetSent ? (
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-md text-sm text-center mb-4">
                  Password reset link sent! Check your email.
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-cream/40" />
                    <Input
                      type="email"
                      placeholder="Email Address"
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}
              
              {error && <p className="text-xs text-red-400 text-center">{error}</p>}
              
              {!resetSent && (
                <Button 
                  type="submit" 
                  className="w-full bg-terracotta hover:bg-terracotta/90 text-white"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              )}
              
              <div className="text-center text-sm mt-4">
                <button 
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setError('');
                    setResetSent(false);
                  }}
                  className="text-terracotta hover:underline"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          ) : (
            <>
              <Button 
                variant="outline" 
                className="w-full border-white/20 text-white hover:bg-white/10 flex items-center justify-center gap-2"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <Chrome className="h-5 w-5" />
                Continue with Google
              </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-forest px-2 text-cream/40">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-cream/40" />
                    <Input
                      placeholder="Full Name"
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-cream/40" />
                    <Input
                      type="tel"
                      placeholder="Mobile Number"
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                </div>
              </>
            )}
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-cream/40" />
                <Input
                  type="email"
                  placeholder="Email Address"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-cream/40" />
                <Input
                  type="password"
                  placeholder="Password"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}
            {isBlocked && <p className="text-xs text-red-500 font-bold">Your account has been blocked. Please contact support.</p>}
            
            {isLogin && (
              <div className="text-right">
                <button 
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-xs text-cream/60 hover:text-white transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-terracotta hover:bg-terracotta/90 text-white"
              disabled={loading}
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="text-center text-sm">
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-terracotta hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </>
      )}
    </div>
  </DialogContent>
</Dialog>
  );
}
