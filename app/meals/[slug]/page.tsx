import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getMeal } from '@/lib/meals';
import classes from './page.module.css';

export async function generateMetadata({ params }) {
  const meal = await getMeal(params.slug);

  if (!meal) {
    return {
      title: 'Meal Not Found',
    };
  }

  return {
    title: meal.title,
    description: meal.summary,
    openGraph: {
      title: meal.title,
      description: meal.summary,
      images: [meal.image],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: meal.title,
      description: meal.summary,
      images: [meal.image],
    },
  };
}

export default async function MealDetailsPage({ params }) {
  const meal = await getMeal(params.slug);

  if (!meal) {
    notFound();
  }

  const instructions = meal.instructions.replace(/\n/g, '<br />');

  return (
    <>
      <header className={classes.header}>
        <Link href="/meals" className={classes.backButton}>
          ← Back to Meals
        </Link>
        <div>
          <div className={classes.image}>
            <Image src={meal.image} alt={meal.title} fill />
          </div>
          <div className={classes.headerText}>
            <h1>{meal.title}</h1>
            <p className={classes.creator}>
              by <a href={`mailto:${meal.creator_email}`}>{meal.creator}</a>
            </p>
            <p className={classes.summary}>{meal.summary}</p>
          </div>
        </div>
      </header>
      <main>
        <p
          className={classes.instructions}
          dangerouslySetInnerHTML={{ __html: instructions }}
        ></p>
      </main>
    </>
  );
}
