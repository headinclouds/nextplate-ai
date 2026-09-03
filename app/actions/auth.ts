'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

import { auth } from '@/lib/auth';

interface ErrorData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export async function signUp(
  prevState: { errors: ErrorData },
  formData: FormData,
): Promise<{ errors: ErrorData }> {
  const name = formData.get('name') as string | null;
  const email = formData.get('email') as string | null;
  const password = formData.get('password') as string | null;
  const confirmPassword = formData.get('confirmPassword') as string | null;
  const error: ErrorData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  if (password !== confirmPassword) {
    error.password = 'Passwords do not match.';
  }
  if (password && password.length < 8) {
    error.password = 'Password must be at least 8 characters long.';
  }

  if (!name || !email || !password || !confirmPassword) {
    if (!name) error.name = 'Name is required.';
    if (!email) error.email = 'Email is required.';
    if (!password) error.password = 'Password is required.';
    if (!confirmPassword) error.confirmPassword = 'Confirm password is required.';
  }

  const hasErrors = Object.values(error).some((message) => message !== '');
  if (hasErrors) {
    return { errors: error };
  }

  try {
    await auth.api.signUpEmail({
      body: {
        name: name as string,
        email: email as string,
        password: password as string,
      },
    });
  } catch (createUserError) {
    if (
      createUserError instanceof Error &&
      createUserError.message.toLowerCase().includes('already exists')
    ) {
      error.email = 'It seems like an account for the chosen email already exists.';
      return { errors: error };
    }
    throw createUserError;
  }

  redirect('/login?registered=true');
}

interface LoginState {
  error: string;
}

export async function signIn(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get('email') as string | null;
  const password = formData.get('password') as string | null;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  try {
    await auth.api.signInEmail({
      body: { email, password },
    });
  } catch {
    return { error: 'Invalid email or password.' };
  }

  redirect('/meals');
}

export async function signOut() {
  await auth.api.signOut({ headers: headers() });
  redirect('/');
}
