'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import classes from './main-header.module.css';

export function MainHeaderNavLink({ href, children }) {
  const pathname = usePathname();

  // Exact match
  if (pathname === href) {
    return (
      <li>
        <Link href={href} className={classes.active}>
          {children}
        </Link>
      </li>
    );
  }

  // For parent routes, check if we're on a child route
  // Special case: /meals should NOT be active when on /meals/share
  let isActive = false;
  if (href !== '/' && pathname.startsWith(`${href}/`)) {
    // Don't activate /meals when on /meals/share (share is a separate nav item)
    if (href === '/meals' && pathname.startsWith('/meals/share')) {
      isActive = false;
    } else {
      isActive = true;
    }
  }

  return (
    <li>
      <Link href={href} className={isActive ? classes.active : undefined}>
        {children}
      </Link>
    </li>
  );
}

export default function MainHeaderNav({ children }) {
  return (
    <nav className={classes.nav}>
      <ul>{children}</ul>
    </nav>
  );
}
