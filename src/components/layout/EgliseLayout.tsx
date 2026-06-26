import { Outlet } from 'react-router-dom';

/**
 * Wrapper des routes /eglise/*. La navbar et le footer de l'univers église
 * sont gérés par RootLayout (EgliseNavbar / EgliseFooter) selon l'URL.
 * Ce layout ne fait donc que rendre la page courante.
 */
export function EgliseLayout() {
  return <Outlet />;
}
