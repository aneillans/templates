import { ROLES } from '../core/auth/roles';

export interface NavItem {
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
  header?: string;
  items: NavItem[];
}

/** Sidebar menu. Sections whose items are all hidden for the current user are dropped. */
export const NAVIGATION: NavSection[] = [
  {
    items: [{ label: 'Dashboard', icon: 'bi-grid-1x2', link: '/', exact: true }],
  },
  {
    header: 'Administration',
    items: [{ label: 'Admin', icon: 'bi-shield-lock', link: '/admin', roles: [ROLES.admin] }],
  },
];
