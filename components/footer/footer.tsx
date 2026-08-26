import Link from 'next/link';
import classes from './footer.module.css';

export default function Footer() {
  return (
    <footer className={classes.footer}>
      <div className={classes.container}>
        <div className={classes.section}>
          <h3>NextLevel Food</h3>
          <p>Share your passion for cooking with a global community of food lovers.</p>
        </div>
        
        <div className={classes.section}>
          <h4>Quick Links</h4>
          <ul>
            <li><Link href="/meals">Browse Meals</Link></li>
            <li><Link href="/meals/share">Share a Recipe</Link></li>
            <li><Link href="/community">Our Community</Link></li>
          </ul>
        </div>
        
        <div className={classes.section}>
          <h4>Connect</h4>
          <ul>
            <li><a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a></li>
            <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a></li>
            <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a></li>
          </ul>
        </div>
      </div>
      
      <div className={classes.bottom}>
        <p>&copy; {new Date().getFullYear()} NextLevel Food. All rights reserved.</p>
      </div>
    </footer>
  );
}
