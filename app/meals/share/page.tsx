import classes from './page.module.css';
import ShareMealForm from './share-meal-form';
import { getCurrentSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Share Your Meal',
  description:
    'Share your favorite recipe with the NextLevel Food community. Upload your meal or generate an AI image.',
  openGraph: {
    title: 'Share Your Meal | NextLevel Food',
    description: 'Share your favorite recipe with our community.',
  },
};

export default async function ShareMealPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <>
      <header className={classes.header}>
        <h1>
          Share your <span className={classes.highlight}>favorite meal</span>
        </h1>
        <p>Or any other meal you feel needs sharing!</p>
      </header>
      <main className={classes.main}>
        <ShareMealForm />
      </main>
    </>
  );
}
