import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Key, 
  ExternalLink, 
  Copy, 
  Check, 
  CheckCircle2, 
  Sparkles, 
  Users, 
  Lock,
  Globe,
  Settings,
  HelpCircle
} from 'lucide-react';
import { AUTHORIZED_ADMIN_EMAILS } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

interface GoogleAuthGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleAuthGuideModal: React.FC<GoogleAuthGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'setup' | 'admins'>('setup');

  if (!isOpen) return null;

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-rose-50/70 via-pink-50/40 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <span>Google Login & Admin Setup Guide</span>
                <span className="text-[10px] bg-pink-100 text-[#E75480] px-2 py-0.5 rounded-full font-bold">
                  Supabase Auth
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Step-by-step instructions for Google OAuth and Admin registration
              </p>
            </div>
          </div>

          <button
            id="close-google-auth-guide-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-4 sm:px-6 border-b border-slate-100 bg-white flex items-center gap-2 pt-2">
          <button
            onClick={() => setActiveSection('setup')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeSection === 'setup'
                ? 'border-[#E75480] text-[#E75480]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Google Login Setup (3 Steps)</span>
          </button>

          <button
            onClick={() => setActiveSection('admins')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeSection === 'admins'
                ? 'border-[#E75480] text-[#E75480]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Authorized Admin Accounts</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-700">
          
          {activeSection === 'setup' ? (
            <div className="space-y-5">
              {/* Status Notice */}
              <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                isSupabaseConfigured
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <div>
                    <span className="font-semibold block text-xs">
                      {isSupabaseConfigured ? 'Supabase Credentials Detected' : 'Supabase Credentials Needed'}
                    </span>
                    <span className="text-[11px] opacity-80">
                      {isSupabaseConfigured
                        ? 'Your app is connected to Supabase. Ensure Google Provider is enabled in your Supabase dashboard.'
                        : 'Connect your Supabase project in .env to enable production Google OAuth authentication.'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 1 */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#E75480] text-white flex items-center justify-center font-bold text-xs">
                      1
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Create Google OAuth Client in Google Cloud Console
                    </h4>
                  </div>
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#E75480] hover:underline"
                  >
                    <span>Google Cloud Console</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <ol className="list-decimal list-inside space-y-1.5 text-slate-600 text-xs pl-1">
                  <li>Log in to the <strong>Google Cloud Console</strong> and select or create a project.</li>
                  <li>Go to <strong>APIs & Services → OAuth consent screen</strong>:
                    <ul className="list-disc list-inside pl-4 pt-1 text-slate-500 text-[11px]">
                      <li>User Type: <strong>External</strong></li>
                      <li>App name: <strong>Petals Haven</strong></li>
                      <li>User support email: <code className="text-slate-800">bloomsandb3yond@gmail.com</code></li>
                    </ul>
                  </li>
                  <li>Go to <strong>APIs & Services → Credentials</strong> and click <strong>Create Credentials → OAuth Client ID</strong>.</li>
                  <li>Choose Application Type: <strong>Web application</strong>.</li>
                  <li>
                    Under <strong>Authorized redirect URIs</strong>, paste your Supabase callback URL:
                    <div className="mt-1.5 flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800">
                      <span className="truncate flex-1">https://&lt;YOUR-PROJECT-REF&gt;.supabase.co/auth/v1/callback</span>
                      <button
                        onClick={() => copyToClipboard('https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback', 'callback')}
                        className="text-[#E75480] hover:text-[#D6336C] p-1 cursor-pointer shrink-0"
                        title="Copy callback format"
                      >
                        {copiedKey === 'callback' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </li>
                  <li>Click <strong>Create</strong>. Copy your <strong>Client ID</strong> and <strong>Client Secret</strong>.</li>
                </ol>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#E75480] text-white flex items-center justify-center font-bold text-xs">
                      2
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Enable Google Provider in Supabase
                    </h4>
                  </div>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#E75480] hover:underline"
                  >
                    <span>Supabase Dashboard</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <ol className="list-decimal list-inside space-y-1.5 text-slate-600 text-xs pl-1">
                  <li>In your Supabase project, click <strong>Authentication</strong> on the left menu.</li>
                  <li>Select <strong>Providers</strong> and click on <strong>Google</strong>.</li>
                  <li>Switch <strong>Enable Google provider</strong> to <strong>ON</strong>.</li>
                  <li>Paste your <strong>Client ID</strong> and <strong>Client Secret</strong> from Google Cloud.</li>
                  <li>Click <strong>Save</strong>.</li>
                  <li>
                    In <strong>Authentication → URL Configuration</strong>, ensure:
                    <ul className="list-disc list-inside pl-4 pt-1 text-slate-500 text-[11px]">
                      <li><strong>Site URL</strong>: Set to your app domain (or preview URL).</li>
                      <li><strong>Redirect URLs</strong>: Add your app domain/origin so Supabase redirects back cleanly after sign in.</li>
                    </ul>
                  </li>
                </ol>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#E75480] text-white flex items-center justify-center font-bold text-xs">
                    3
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Configure Environment Variables in Applet
                  </h4>
                </div>

                <p className="text-slate-600 text-xs">
                  Provide your Supabase URL and Anon Key in your <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">.env</code>:
                </p>

                <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] space-y-1 relative">
                  <div>VITE_SUPABASE_URL=https://your-project.supabase.co</div>
                  <div>VITE_SUPABASE_ANON_KEY=your-anon-public-key</div>
                  <button
                    onClick={() => copyToClipboard('VITE_SUPABASE_URL=\nVITE_SUPABASE_ANON_KEY=', 'env')}
                    className="absolute top-2.5 right-2.5 text-slate-400 hover:text-white p-1"
                    title="Copy environment variable names"
                  >
                    {copiedKey === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Whitelist Overview */}
              <div className="bg-pink-50/70 p-4 rounded-2xl border border-pink-100 space-y-2">
                <div className="flex items-center gap-2 text-[#E75480] font-bold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Strict Administrator Email Whitelist</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  To protect your store inventory, pricing, customer orders, and branding settings, only the two accounts you specified are authorized as administrators.
                </p>
              </div>

              {/* The 2 Approved Admin Emails */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Authorized Administrator Emails
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {AUTHORIZED_ADMIN_EMAILS.map((adminEmail) => (
                    <div 
                      key={adminEmail}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 text-xs block truncate">
                            {adminEmail}
                          </span>
                          <span className="text-[10px] text-emerald-600 font-semibold">
                            Full Admin Rights
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(adminEmail, adminEmail)}
                        className="text-slate-400 hover:text-[#E75480] p-1 cursor-pointer shrink-0"
                        title="Copy email"
                      >
                        {copiedKey === adminEmail ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* How Registration & Login Works for Admins vs Customers */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">
                  How Admin Accounts are Automatically Recognized:
                </h4>

                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      ✓
                    </span>
                    <div>
                      <strong className="text-slate-800 block">Automatic Admin Elevation:</strong>
                      Whenever you sign in with either of the two emails above (using <strong>Sign In with Google</strong> or email/password), the application automatically checks the email against the security whitelist and immediately activates the <strong>Admin role</strong>.
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-pink-100 text-[#E75480] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      ★
                    </span>
                    <div>
                      <strong className="text-slate-800 block">Admin Features Unlocked:</strong>
                      As an admin, you gain access to the <strong>Store Administrator Console</strong>:
                      <ul className="list-disc list-inside pl-2 pt-1 text-slate-500 text-[11px] space-y-0.5">
                        <li>Add new gifts and edit catalog items with real-time Supabase sync</li>
                        <li>Manage stock levels, restock alerts, and out-of-stock indicators</li>
                        <li>Review and update live customer orders (Pending, In Preparation, Dispatched, Delivered)</li>
                        <li>Update shop branding, custom logos, and top-bar announcement banners</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      👤
                    </span>
                    <div>
                      <strong className="text-slate-800 block">All Other Users:</strong>
                      Any other user who signs in or signs up with Google or email is securely designated as a <strong>Customer</strong>. They can browse products, add items to cart, place orders, and track deliveries, but cannot access administrative tools.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Whitelisted for <strong className="text-slate-700">Petals Haven Boutique Meru</strong>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#E75480] hover:bg-[#D6336C] text-white text-xs font-medium rounded-full transition cursor-pointer"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
