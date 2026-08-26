import classes from './loading.module.css';

export default function MealsLoadingPage() {
  return (
    <main className={classes.loading}>
      <p>Fetching meals...</p>
    </main>
  );
}
