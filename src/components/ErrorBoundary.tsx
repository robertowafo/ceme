import { Component, type ReactNode } from 'react';

interface Props  { children: ReactNode }
interface State  { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#1A1A2E', color: '#fff', fontFamily: 'sans-serif',
          padding: '2rem', textAlign: 'center',
        }}>
          <div style={{
            background: 'rgba(242,101,34,0.1)', border: '1px solid rgba(242,101,34,0.4)',
            borderRadius: '1rem', padding: '2rem', maxWidth: '600px',
          }}>
            <p style={{ color: '#F26522', fontWeight: 'bold', fontSize: '0.75rem',
              textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1rem' }}>
              Erreur de chargement
            </p>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Quelque chose s'est mal passé
            </h1>
            <pre style={{
              background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '0.5rem',
              fontSize: '0.75rem', textAlign: 'left', overflowX: 'auto',
              color: '#fca5a5', marginBottom: '1.5rem',
            }}>
              {this.state.error.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#F26522', color: '#fff', border: 'none',
                padding: '0.75rem 2rem', borderRadius: '999px',
                fontWeight: 'bold', cursor: 'pointer', fontSize: '0.875rem',
              }}
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
