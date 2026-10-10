import { ROLES } from '../core/auth/roles';
import { marker } from '../core/i18n/languages';

export interface NavItem {
  /** Translation key. */
  label: string;
  /** Bootstrap Icons class, e.g. `bi-grid-1x2`. */
  icon: string;
  link: string;
  /** Match the URL exactly when highlighting (needed for `/`). */
  exact?: boolean;
  /** Shown only to users with at least one of these roles. Hiding is cosmetic; guard the route too. */
  roles?: string[];
}

export interface NavSection {
  /** Translation key. */
  header?: string;
  items: NavItem[];
}

/** Sidebar menu. Sections whose items are all hidden for the current user are dropped. */
export const NAVIGATION: NavSection[] = [
  {
    items: [{ label: marker('nav.dashboard'), icon: 'bi-grid-1x2', link: '/', exact: true }],
  },
  {
    header: marker('nav.administration'),
    items: [
      { label: marker('nav.admin'), icon: 'bi-shield-lock', link: '/admin', roles: [ROLES.admin] },
    ],
  },
];
