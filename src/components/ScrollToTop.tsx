import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { readSectionTarget } from '../utils/sectionNav';

/**
 * React Router keeps the window scroll position across navigations, so opening
 * a new page (register, signup, dashboard) can land part-way down the previous
 * page. Reset to the top on every route change, unless the navigation asked to
 * scroll to a section instead - Home handles that case itself.
 */
export function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    if (readSectionTarget(location.state)) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.state]);

  return null;
}
