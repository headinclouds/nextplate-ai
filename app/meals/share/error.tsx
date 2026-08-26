'use client';

export default function MealsErrorPage({ error, reset }) {
  return (
    <main className="error">
      <h1>Something went wrong.</h1>
      <p>{error.message || 'Failed to create meal.'}</p>
      <button onClick={reset}>Try again</button>
    </main>
  );
}
