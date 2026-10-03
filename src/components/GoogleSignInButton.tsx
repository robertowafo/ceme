import React, { useState } from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../lib/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function Inner({ className, children }: { className?: string; children: React.ReactNode }) {
  const { loginWithGoogleToken } = useAuth();
  const [error, setError] = useState('');

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setError('');
      loginWithGoogleToken(tokenResponse.access_token).catch(() => {
        setError("Connexion refusée. Vérifiez que ce compte est autorisé.");
      });
    },
    onError: () => setError('La connexion Google a échoué. Réessayez.'),
  });

  return (
    <>
      <button type="button" onClick={() => login()} className={className}>
        {children}
      </button>
      {error && <p role="alert" className="mt-2 text-xs text-red-400">{error}</p>}
    </>
  );
}

/**
 * Bouton « Se connecter avec Google ». Le fournisseur Google (et son script) n'est
 * monté qu'ici, donc seulement sur la page admin — plus chez tous les visiteurs.
 */
export function GoogleSignInButton(props: { className?: string; children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Inner {...props} />
    </GoogleOAuthProvider>
  );
}
