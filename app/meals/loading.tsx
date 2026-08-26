import classes from './loading.module.css';

export default function MealsLoading() {
  return (
    <div className={classes.loading}>
      <p>Loading delicious meals...</p>
    </div>
  );
}
