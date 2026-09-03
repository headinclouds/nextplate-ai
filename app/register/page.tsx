import classes from './page.module.css';
import RegisterForm from './register-form';

export const metadata = {
  title: 'Create an Account',
  description: 'Create an account to share your favorite meals with the NextLevel Food community.',
};

export default function RegisterPage() {
  return (
    <>
      <header className={classes.header}>
        <h1>
          Create your <span className={classes.highlight}>account</span>
        </h1>
        <p>Join the community and start sharing your favorite meals.</p>
      </header>
      <main className={classes.main}>
        <RegisterForm />
      </main>
    </>
  );
}
