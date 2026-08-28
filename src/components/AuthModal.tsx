import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  Sparkles, 
  Shield, 
  ArrowRight, 
  Loader2,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GoogleAuthGuideModal } from './GoogleAuthGuideModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { 
    signInWithEmail, 
    signUpWithEmail, 
    signInWithGoogle, 
    isConfigured
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        const res = await signInWithEmail(email, password);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          onClose();
        }
      } else {
        const res = await signUpWithEmail(email, password, fullName);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          setSuccessMsg('Account created successfully! You are now logged in.');
          setTimeout(() => onClose(), 1000);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'An authentication error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setLoading(true);
    const res = await signInWithGoogle();
    if (res.error) {
      setErrorMsg(res.error);
      setLoading(false);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 p-5 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          id="close-auth-modal-btn"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E75480] to-[#FFB6C1] flex items-center justify-center text-white mx-auto mb-3 shadow-md shadow-pink-100">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-xl text-slate-900">
            {mode === 'signin' ? 'Welcome Back' : 'Join Petals Haven'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'signin' 
              ? 'Sign in to access your gift orders, wishlist & discounts' 
              : 'Create an account to track deliveries & unlock VIP perks'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-100 p-1 rounded-full mb-5">
          <button
            id="auth-tab-signin"
            type="button"
            onClick={() => { setMode('signin'); setErrorMsg(''); }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
              mode === 'signin' ? 'bg-white text-[#E75480] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            id="auth-tab-signup"
            type="button"
            onClick={() => { setMode('signup'); setErrorMsg(''); }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
              mode === 'signup' ? 'bg-white text-[#E75480] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl space-y-2">
            <p>{errorMsg}</p>
            {errorMsg.toLowerCase().includes('google') && (
              <button
                type="button"
                onClick={() => setIsGuideOpen(true)}
                className="inline-flex items-center gap-1 font-bold underline text-[#E75480] hover:text-[#D6336C] cursor-pointer"
              >
                <span>Open Step-by-Step Google & Admin Guide →</span>
              </button>
            )}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl">
            {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#E75480] focus:ring-1 focus:ring-[#FFB6C1]"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#E75480] focus:ring-1 focus:ring-[#FFB6C1]"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#E75480] focus:ring-1 focus:ring-[#FFB6C1]"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#E75480] hover:bg-[#D6336C] text-white font-medium text-xs rounded-full shadow-md shadow-pink-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-white px-2 text-slate-400 font-medium">Or continue with</span>
          </div>
        </div>

        {/* Google OAuth Option */}
        <button
          id="google-oauth-btn"
          type="button"
          onClick={handleGoogleAuth}
          className="w-full py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-full transition flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
        >
          {/* Google G SVG */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.9c2.28-2.1 3.645-5.2 3.645-9.15z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.73-2.1-6.66-4.93H1.3v3.13C3.33 21.36 7.39 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.34 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.6H1.3C.47 8.24 0 10.06 0 12s.47 3.76 1.3 5.4l4.04-3.13z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.39 0 3.33 2.64 1.3 6.6l4.04 3.13c.93-2.83 3.56-4.98 6.66-4.98z"
            />
          </svg>
          <span>Sign In with Google</span>
        </button>

        {/* Step-by-step setup guide link */}
        <div className="mt-2.5 text-center">
          <button
            type="button"
            onClick={() => setIsGuideOpen(true)}
            className="inline-flex items-center gap-1.5 text-[11px] text-[#E75480] hover:text-[#D6336C] hover:underline font-medium cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How do I connect Google Login & Admins? Step-by-Step Guide</span>
          </button>
        </div>

        {/* Store Administrator Access Notice */}
        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Store Administrators: Sign in with <span className="font-medium text-slate-600">bloomsandb3yond@gmail.com</span> or <span className="font-medium text-slate-600">kenrodgersutugi@gmail.com</span> to automatically unlock the Store Management Console.
          </p>
        </div>

      </div>

      {/* Embedded Google Auth & Admin Setup Guide */}
      <GoogleAuthGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
};
