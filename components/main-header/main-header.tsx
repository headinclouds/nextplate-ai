import Link from 'next/link';
import Image from 'next/image';

import classes from './main-header.module.css';
import MainHeaderBackground from './main-header-background';
import MainHeaderNav, { MainHeaderNavLink } from './main-header-nav';
import { getCurrentSession } from '@/lib/auth';
import { signOut } from '@/app/actions/auth';

export default async function MainHeader() {
  const session = await getCurrentSession();

  return (
    <>
      <MainHeaderBackground />
      <header className={classes.header}>
        <Link href="/" className={classes.logo}>
          <Image src="/images/logo.png" alt="NextLevel Food logo" width={48} height={48} priority />
          <span>NextLevel Food</span>
        </Link>

        <MainHeaderNav>
          <MainHeaderNavLink href="/meals">Meals</MainHeaderNavLink>
          <MainHeaderNavLink href="/meals/share">Share a Meal</MainHeaderNavLink>
          <MainHeaderNavLink href="/community">Community</MainHeaderNavLink>
          {session ? (
            <li>
              <form action={signOut}>
                <button className={classes.navButton} type="submit">
                  Log out
                </button>
              </form>
            </li>
          ) : (
            <>
              <MainHeaderNavLink href="/login">Log In</MainHeaderNavLink>
              <MainHeaderNavLink href="/register">Sign Up</MainHeaderNavLink>
            </>
          )}
        </MainHeaderNav>
      </header>
    </>
  );
}
