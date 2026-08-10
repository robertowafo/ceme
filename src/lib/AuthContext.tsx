import React, { createContext, useContext, useEffect, useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';

export interface AppUser {
  email: string;
  name: string;
  picture: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  /** Sections du dashboard accessibles à cet admin (le super-admin les a toutes). */
  sections?: string[];
}

interface AuthContextType {
  user: AppUser | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  /** Sections autorisées pour l'utilisateur courant (vide si non connecté). */
  sections: string[];
  isLoading: boolean;
  loginWithGoogle: () => void;
  loginWithPassword: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Restaurer la session au démarrage — le cookie HttpOnly est envoyé
  // automatiquement par le navigateur, il n'y a rien à lire côté JS.
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'same-origin' })
      .then(r => r.ok ? r.json() : null)
      .then((data: { user: AppUser } | null) => {
        if (data?.user) {
          setUser(data.user);
          setIsAdmin(data.user.isAdmin ?? false);
          setIsSuperAdmin(data.user.isSuperAdmin ?? false);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: tokenResponse.access_token })
        });
        if (!res.ok) throw new Error('Échec de l\'authentification');
        const data = await res.json() as { user: AppUser };
        setUser(data.user);
        setIsAdmin(data.user.isAdmin ?? false);
        setIsSuperAdmin(data.user.isSuperAdmin ?? false);
      } catch (error) {
        console.error('Erreur de connexion:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error('Erreur Google OAuth:', error);
      setIsLoading(false);
    }
  });

  const loginWithGoogle = () => {
    setIsLoading(true);
    googleLogin();
  };

  const loginWithPassword = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json() as { user?: AppUser; error?: string };
      if (!res.ok || !data.user) throw new Error(data.error || 'Échec de la connexion');
      setUser(data.user);
      setIsAdmin(data.user.isAdmin ?? false);
      setIsSuperAdmin(data.user.isSuperAdmin ?? false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => {});
    setUser(null);
    setIsAdmin(false);
    setIsSuperAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, isSuperAdmin, sections: user?.sections ?? [], isLoading, loginWithGoogle, loginWithPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return context;
}
