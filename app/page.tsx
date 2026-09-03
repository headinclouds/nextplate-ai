import Link from 'next/link';
import ImageSlideshow from '@/components/image-slideshow/image-slideshow';

import classes from './page.module.css';

export const metadata = {
  title: 'NextLevel Food - Share & Discover Amazing Recipes',
  description:
    'Discover, create, and share incredible recipes from kitchens around the world. Join our community of food lovers with AI-powered image generation.',
};

export default function Home() {
  return (
    <>
      <header className={classes.header}>
        <div className={classes.slideshow}>
          <ImageSlideshow />
        </div>
        <div>
          <div className={classes.hero}>
            <h1>NextLevel Food for NextLevel Foodies</h1>
            <p>Discover, create, and share incredible recipes from kitchens around the world.</p>
          </div>
          <div className={classes.cta}>
            <Link href="/community">Join the Community</Link>
            <Link href="/meals">Explore Meals</Link>
          </div>
        </div>
      </header>
      <main>
        <section className={classes.section}>
          <h2>How it works</h2>
          <p>
            Share your culinary masterpieces with a global community of food enthusiasts. Simply
            upload your recipe, add a photo or let AI generate a stunning food image for you, and
            inspire others to cook your favorite dishes.
          </p>
          <p>
            Browse through a growing collection of recipes from home cooks worldwide, discover new
            flavors, and bring restaurant-quality meals to your own kitchen.
          </p>
        </section>

        <section className={classes.section}>
          <h2>Why NextLevel Food?</h2>
          <p>
            We believe cooking is more than following instructions—it&apos;s about passion,
            creativity, and sharing joy. Our platform combines the warmth of a community cookbook
            with cutting-edge AI technology to help you showcase your recipes beautifully.
          </p>
          <p>
            Whether you&apos;re a seasoned chef or a home cooking enthusiast, NextLevel Food gives
            you the tools to share your culinary story and connect with fellow food lovers who
            appreciate great taste.
          </p>
        </section>
      </main>
    </>
  );
}
