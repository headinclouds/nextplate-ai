import Link from 'next/link';
import SuccessMessage from '@/components/ui/success-message';
import LoginForm from './login-form';
import classes from './page.module.css';

export const metadata = {
  title: 'Log In',
  description: 'Log in to your NextLevel Food account.',
};

export default function LoginPage({ searchParams }) {
  const showRegistrationSuccess = searchParams?.registered === 'true';

  return (
    <>
      {showRegistrationSuccess && <SuccessMessage message="Your registration was successful." />}
      <header className={classes.header}>
        <h1>
          Log in to your <span className={classes.highlight}>account</span>
        </h1>
      </header>
      <main className={classes.main}>
        <LoginForm />
        <p className={classes.signupPrompt}>
          New to NextLevel Food? <Link href="/register">Create an account</Link>
        </p>
      </main>
    </>
  );
}
