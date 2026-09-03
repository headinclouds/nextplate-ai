'use client';

import { useFormState } from 'react-dom';

import { signIn } from '@/app/actions/auth';
import classes from './page.module.css';

const initialState = { error: '' };

export default function LoginForm() {
  const [formState, formAction] = useFormState(signIn, initialState);

  return (
    <form className={classes.form} action={formAction} noValidate>
      <p>
        <label htmlFor="email">Your email</label>
        <input type="email" id="email" name="email" required />
      </p>
      <p>
        <label htmlFor="password">Password</label>
        <input type="password" id="password" name="password" required />
      </p>
      {formState.error && (
        <p className={classes.error} role="alert">
          {formState.error}
        </p>
      )}
      <p className={classes.actions}>
        <button type="submit">Log in</button>
      </p>
    </form>
  );
}
