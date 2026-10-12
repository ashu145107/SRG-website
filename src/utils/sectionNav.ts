import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/** Router state used to ask the Home page to scroll to a section after it mounts. */
export interface SectionNavState {
  scrollTo: string;
}

/** Reads a pending section target out of router state, or null when there is none. */
export function readSectionTarget(state: unknown): string | null {
  if (!state || typeof state !== 'object' || !('scrollTo' in state)) return null;
  const target = (state as { scrollTo?: unknown }).scrollTo;
  return typeof target === 'string' && target ? target : null;
}

/**
 * Navigates to a Home page section.
 *
 * Plain `href="#about"` anchors cannot be used here: this app runs on HashRouter,
 * which reads a bare `#about` hash as the route `/about`, finds no match and
 * discards the anchor. So the scroll is done in JS instead - directly when
 * already on Home, otherwise by routing home and handing the target to Home
 * through router state.
 */
export function useSectionNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return useCallback(
    (id: string) => {
      if (pathname === '/') {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      const state: SectionNavState = { scrollTo: id };
      navigate('/', { state });
    },
    [navigate, pathname]
  );
}
