import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  role: 'customer' | 'admin';
  isAdminUser: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, pass: string, fullName: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  setRole: (role: 'customer' | 'admin') => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'petals_haven_current_user_v1';

// Strictly authorized administrator email addresses
export const AUTHORIZED_ADMIN_EMAILS = [
  'bloomsandb3yond@gmail.com',
  'kenrodgersutugi@gmail.com',
] as const;

// Helper to check if an email qualifies as an administrator (strictly restricted to approved admin emails)
export function checkIsAdminEmail(email?: string | null, _metadataRole?: string | null): boolean {
  if (!email) return false;
  const lower = email.toLowerCase().trim();
  return (
    lower === 'bloomsandb3yond@gmail.com' ||
    lower === 'kenrodgersutugi@gmail.com'
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      // Clean up any legacy demo flags or fake demo accounts
      localStorage.removeItem(LOCAL_USER_KEY + '_demo');
      const saved = localStorage.getItem(LOCAL_USER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // If legacy demo test accounts exist in storage, purge them
        if (
          parsed?.id === 'admin-usr-001' ||
          parsed?.id === 'cust-usr-002' ||
          parsed?.id === 'google-usr-9872' ||
          parsed?.email === 'clara.rose@gmail.com' ||
          parsed?.email === 'customer.google@petalshaven.com'
        ) {
          localStorage.removeItem(LOCAL_USER_KEY);
          return null;
        }
        // If parsed user was previously saved with 'admin' role but is NOT in the authorized list, downgrade to 'customer'
        if (parsed?.role === 'admin' && !checkIsAdminEmail(parsed.email)) {
          parsed.role = 'customer';
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const isAdminUser = Boolean(user && checkIsAdminEmail(user.email, user.role));

  // Site should always default to 'customer' view mode unless an admin specifically switched
  const [role, setRoleState] = useState<'customer' | 'admin'>(() => {
    if (user && checkIsAdminEmail(user.email, user.role)) {
      return user.role === 'admin' ? 'admin' : 'customer';
    }
    return 'customer';
  });
  const [isLoading, setIsLoading] = useState(true);

  // Sync role changes (only allowed if user is an actual admin)
  const setRole = (newRole: 'customer' | 'admin') => {
    if (newRole === 'admin' && !isAdminUser) {
      // Non-admins cannot switch to admin mode
      return;
    }
    setRoleState(newRole);
    if (user) {
      const updated = { ...user, role: newRole };
      setUser(updated);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    // Check active session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const isAdmin = checkIsAdminEmail(session.user.email, session.user.user_metadata?.role);
        const userProfile: UserProfile = {
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
          role: isAdmin ? 'admin' : 'customer',
          avatar_url: session.user.user_metadata?.avatar_url,
        };
        setUser(userProfile);
        setRoleState(isAdmin ? 'admin' : 'customer');
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(userProfile));
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const isAdmin = checkIsAdminEmail(session.user.email, session.user.user_metadata?.role);
        const userProfile: UserProfile = {
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
          role: isAdmin ? 'admin' : 'customer',
          avatar_url: session.user.user_metadata?.avatar_url,
        };
        setUser(userProfile);
        setRoleState(isAdmin ? 'admin' : 'customer');
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(userProfile));
      } else {
        setUser(null);
        setRoleState('customer');
        localStorage.removeItem(LOCAL_USER_KEY);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, pass: string): Promise<{ error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const isAdmin = checkIsAdminEmail(trimmedEmail);

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: pass,
        });
        if (error) return { error: error.message };
        
        if (data.user) {
          const detectedAdmin = checkIsAdminEmail(data.user.email || trimmedEmail, data.user.user_metadata?.role);
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email || trimmedEmail,
            full_name: data.user.user_metadata?.full_name || trimmedEmail.split('@')[0],
            role: detectedAdmin ? 'admin' : 'customer',
          };
          setUser(profile);
          setRoleState(detectedAdmin ? 'admin' : 'customer');
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
        }
        return {};
      } catch (err: unknown) {
        return { error: err instanceof Error ? err.message : 'Sign in failed' };
      }
    }

    // Direct local authentication when offline or Supabase unconfigured
    const profile: UserProfile = {
      id: `usr-${Date.now()}`,
      email: trimmedEmail,
      full_name: trimmedEmail.split('@')[0],
      role: isAdmin ? 'admin' : 'customer',
    };
    setUser(profile);
    setRoleState(isAdmin ? 'admin' : 'customer');
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
    return {};
  };

  const signUpWithEmail = async (email: string, pass: string, fullName: string): Promise<{ error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const isAdmin = checkIsAdminEmail(trimmedEmail);

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: pass,
          options: {
            data: {
              full_name: fullName.trim(),
              role: isAdmin ? 'admin' : 'customer',
            }
          }
        });
        if (error) return { error: error.message };

        if (data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email || trimmedEmail,
            full_name: fullName.trim() || trimmedEmail.split('@')[0],
            role: isAdmin ? 'admin' : 'customer',
          };
          setUser(profile);
          setRoleState(profile.role);
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
        }
        return {};
      } catch (err: unknown) {
        return { error: err instanceof Error ? err.message : 'Sign up failed' };
      }
    }

    // Direct local account creation
    const newProfile: UserProfile = {
      id: `usr-${Date.now()}`,
      email: trimmedEmail,
      full_name: fullName.trim() || trimmedEmail.split('@')[0],
      role: isAdmin ? 'admin' : 'customer',
    };
    setUser(newProfile);
    setRoleState(newProfile.role);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newProfile));
    return {};
  };

  const signInWithGoogle = async (): Promise<{ error?: string }> => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          }
        });
        if (error) return { error: error.message };
        return {};
      } catch (err: unknown) {
        return { error: err instanceof Error ? err.message : 'Google OAuth failed' };
      }
    }

    return { 
      error: 'Google Sign-In requires Supabase credentials to be configured in your environment settings.' 
    };
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Sign out error:', err);
      }
    }
    setUser(null);
    setRoleState('customer');
    localStorage.removeItem(LOCAL_USER_KEY);
    localStorage.removeItem(LOCAL_USER_KEY + '_demo');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdminUser,
        isLoading,
        isConfigured: isSupabaseConfigured,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        setRole,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
