import './globals.css';
import MainHeader from '@/components/main-header/main-header';
import Footer from '@/components/footer/footer';

export const metadata = {
  title: {
    template: '%s | NextLevel Food',
    default: 'NextLevel Food',
  },
  description:
    'Discover, create, and share incredible recipes from kitchens around the world. Join our community of food lovers.',
  keywords: ['recipes', 'cooking', 'food', 'meals', 'community', 'AI image generation'],
  authors: [{ name: 'NextLevel Food' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://nextlevelfood.com',
    siteName: 'NextLevel Food',
    title: 'NextLevel Food - Share & Discover Amazing Recipes',
    description: 'Discover, create, and share incredible recipes from kitchens around the world.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NextLevel Food',
    description: 'Discover, create, and share incredible recipes from around the world.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <MainHeader />
        {children}
        <Footer />
      </body>
    </html>
  );
}
