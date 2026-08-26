import Link from 'next/link';
import { getMeals } from '@/lib/meals';
import classes from './page.module.css';
import MealsGrid from '@/components/meals/meals-grid';
import Pagination from '@/components/meals/pagination';
import SuccessMessage from '@/components/ui/success-message';
import { Suspense } from 'react';

export const metadata = {
  title: 'All Meals',
  description: 'Browse delicious meals shared by our vibrant community of food lovers. Discover new recipes and cooking inspiration.',
  openGraph: {
    title: 'All Meals | NextLevel Food',
    description: 'Browse delicious meals shared by our vibrant community of food lovers.',
  },
};

async function Meals({ page }) {
    const { meals, pagination } = await getMeals(page);
    return (
        <>
            <MealsGrid meals={meals} />
            <Pagination 
                currentPage={pagination.currentPage} 
                totalPages={pagination.totalPages} 
            />
        </>
    );
}

export default async function MealsPage({ searchParams }) {
  const page = Number(searchParams?.page) || 1;
  const showSuccess = searchParams?.success === 'true';
  
  return (
    <>
      {showSuccess && (
        <SuccessMessage message="🎉 Your meal has been shared successfully!" />
      )}
      <header className={classes.header}>
        <div>
          <div className={classes.hero}>
            <h1>Delicious meals, created by you</h1>
            <p>
              Choose your favorite recipe and cook it yourself. It is easy and
              fun!
            </p>
            <p className={classes.cta}>
              <Link href="/meals/share">Share Your Favorite Recipe.</Link>
            </p>
          </div>
        </div>
      </header>
      <main>
        <Suspense fallback={<p className={classes.loading}>Loading meals...</p>}>
          <Meals page={page} />
        </Suspense>
      </main>
    </>
  );
}