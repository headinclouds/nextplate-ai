'use client';
import classes from './page.module.css';
import { useFormState } from 'react-dom';
import { signUp } from '@/app/actions/auth';

export default function RegisterForm() {
  const [formState, formActions] = useFormState(signUp, {
    errors: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  return (
    <form className={classes.form} action={formActions} noValidate>
      <p>
        <label htmlFor="name">Your name</label>
        <input type="text" id="name" name="name" required />
      </p>
      <p>
        <label htmlFor="email">Your email</label>
        <input type="email" id="email" name="email" required />
      </p>
      <p>
        <label htmlFor="password">Password</label>
        <input type="password" id="password" name="password" required />
      </p>
      <p>
        <label htmlFor="confirmPassword">Confirm password</label>
        <input type="password" id="confirmPassword" name="confirmPassword" required />
      </p>
      {Object.values(formState.errors).map(
        (errMsg, index) =>
          errMsg && (
            <p key={index} className={classes.error}>
              {errMsg}
            </p>
          ),
      )}
      <p className={classes.actions}>
        <button type="submit">Create account</button>
      </p>
    </form>
  );
}
