import React, { createContext, useContext, useEffect, useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';

export interface AppUser {
  email: string;
  name: string;
  picture: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isLoading: boolean;
  loginWithGoogle: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Restaurer la session depuis localStorage au démarrage
  useEffect(() => {
    const token = localStorage.getItem('session_token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then((data: { user: AppUser } | null) => {
        if (data?.user) {
          setUser(data.user);
          setIsAdmin(data.user.isAdmin ?? false);
          setIsSuperAdmin(data.user.isSuperAdmin ?? false);
        } else {
          localStorage.removeItem('session_token');
        }
      })
      .catch(() => localStorage.removeItem('session_token'))
      .finally(() => setIsLoading(false));
  }, []);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: tokenResponse.access_token })
        });
        if (!res.ok) throw new Error('Échec de l\'authentification');
        const data = await res.json() as { token: string; user: AppUser };
        localStorage.setItem('session_token', data.token);
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

  const logout = () => {
    localStorage.removeItem('session_token');
    setUser(null);
    setIsAdmin(false);
    setIsSuperAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, isSuperAdmin, isLoading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return context;
}
