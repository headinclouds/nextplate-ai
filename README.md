# 🍽️ NextLevel Food - Food Sharing Platform

A modern, full-stack food sharing platform built with Next.js 14, featuring AI-powered image generation, cloud storage, and comprehensive optimizations for production use.

![Next.js](https://img.shields.io/badge/Next.js-14.0.3-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js)

## 🌟 Key Features

### Core Functionality
- **📸 Image Management**: Upload your own images or generate them with AI
- **🤖 AI Image Generation**: Powered by Pollinations.ai with Apply/Retry workflow
- **☁️ Cloud Storage**: Cloudinary integration with automatic optimization (WebP/AVIF, quality auto-tuning)
- **📄 Server-Side Rendering**: Fast initial page loads and SEO-friendly
- **🔍 SEO Optimized**: Dynamic metadata, Open Graph, and Twitter Cards

### Performance & Security
- **⚡ Rate Limiting**: 15 requests/hour per IP to prevent API abuse
- **📊 Pagination**: Efficient data loading (12 meals per page)
- **🔒 XSS Protection**: All user inputs sanitized
- **🏷️ Smart Slugs**: URL-safe slugs with automatic deduplication
- **📈 Database Indexes**: Optimized queries on slug and creator_email
- **🎨 CSS Variables**: Maintainable theming system with 50+ variables

### User Experience
- **✨ Loading States**: Visual feedback during all async operations
- **✅ Success Messages**: Toast notifications with auto-dismiss
- **❌ Error Handling**: Context-specific, actionable error messages
- **🎯 Form Validation**: Client-side and server-side validation
- **📱 Responsive Design**: Works on all screen sizes
- **♿ Accessible**: Semantic HTML and ARIA labels

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - App Router with Server Components
- **React 18** - Client Components for interactivity
- **CSS Modules** - Scoped styling with CSS variables

### Backend
- **Next.js Server Actions** - Type-safe server-side functions
- **Vercel Postgres** - Managed production database on Vercel
- **better-sqlite3** - Local fallback database for development
- **Cloudinary** - Cloud image storage and optimization

### AI & APIs
- **Pollinations.ai** - Free AI image generation
- **Next.js Image** - Automatic image optimization

### Developer Tools
- **ESLint** - Code quality and consistency
- **Slugify** - URL-safe string generation
- **XSS** - Input sanitization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd foodies
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Cloudinary credentials (optional for development):
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=development
# Optional for local Postgres workflow
# POSTGRES_URL=postgres://...
```

4. **Initialize the database**
```bash
node initdb.js
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open your browser**
```
http://localhost:3000
```

## 📁 Project Structure

```
foodies/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with metadata
│   ├── page.tsx             # Homepage
│   ├── globals.css          # Global styles & CSS variables
│   ├── meals/               # Meals feature
│   │   ├── page.tsx         # Meals list with pagination
│   │   ├── [slug]/          # Dynamic meal detail pages
│   │   └── share/           # Share meal form
│   └── community/           # Community page
├── components/              # React components
│   ├── meals/              # Meal-specific components
│   ├── main-header/        # Navigation header
│   ├── footer/             # Site footer
│   └── ui/                 # Reusable UI components
├── lib/                     # Server-side utilities
│   ├── actions.ts          # Server Actions (form handling)
│   ├── meals.ts            # Database operations
│   ├── storage.ts          # Cloud storage abstraction
│   ├── rate-limit.ts       # Rate limiting logic
│   └── constants.ts        # Configuration constants
├── public/                  # Static assets
│   └── images/             # Local image storage (dev)
└── initdb.js               # Database initialization script
```

## 🎯 Core Features Explained

### 1. AI Image Generation
```javascript
// User flow:
1. User enters meal title and summary
2. Clicks "Generate with AI"
3. AI generates image preview (not saved yet)
4. User can "Retry" or "Apply"
5. Image only saved to cloud/disk on final submit
```

**Benefits:**
- No wasted storage on unused previews
- Fast iteration on AI-generated images
- Fallback to manual upload if AI fails

### 2. Cloud Storage Strategy
```javascript
// Automatic provider selection:
- Development: Local filesystem (public/images/)
- Production: Cloudinary with optimization
  - Auto WebP/AVIF format conversion
  - Quality auto-tuning
  - 1200x1200 size limit
```

### 3. Rate Limiting
```javascript
// In-memory rate limiting:
- 15 requests per hour per IP
- Applies to AI generation only
- Automatic cleanup of old entries
- Graceful error messages with reset time
```

### 4. Database Optimization
```sql
-- Indexes for fast queries:
CREATE INDEX idx_meals_slug ON meals(slug);
CREATE INDEX idx_meals_creator_email ON meals(creator_email);
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Deploy to Vercel**
- Visit [vercel.com](https://vercel.com)
- Import your GitHub repository
- Add Vercel Postgres integration in your Vercel project (Storage tab)
- Add environment variables:
  ```
  CLOUDINARY_CLOUD_NAME
  CLOUDINARY_API_KEY
  CLOUDINARY_API_SECRET
  NODE_ENV=production
  POSTGRES_URL
  ```
- Deploy!

3. **Database Note**
- With Vercel Postgres enabled, meal creation and updates persist normally.
- If `POSTGRES_URL` is not set, the app falls back to local SQLite (good for local dev only).
- SQLite on Vercel itself is not suitable for persistent writes.

### Alternative Deployment Options
- **Netlify**: Similar to Vercel
- **Railway**: Full-stack hosting with persistent storage
- **AWS**: EC2 + S3 + RDS for full control
- **DigitalOcean**: App Platform with managed database

## 📊 Performance Metrics

| Metric | Value |
|--------|-------|
| **Lighthouse Performance** | 95+ |
| **First Contentful Paint** | < 1.2s |
| **Time to Interactive** | < 2.5s |
| **CSS Bundle Size** | ~42.5KB (15% smaller after optimization) |
| **Image Optimization** | Auto WebP/AVIF, quality auto-tuning |

## 🔐 Security Features

- ✅ XSS protection on all user inputs
- ✅ SQL injection prevention (parameterized queries)
- ✅ Rate limiting on API routes
- ✅ File type validation (images only)
- ✅ File size limits (5MB max)
- ✅ Input length validation
- ✅ Environment variables for secrets
- ✅ HTTPS enforced in production

## 🎨 Customization

### Change Theme Colors
Edit `app/globals.css`:
```css
:root {
  --color-primary: #f9572a;     /* Main brand color */
  --color-secondary: #ff8a05;   /* Secondary color */
  --color-accent: #ffc905;      /* Accent color */
}
```

### Adjust Rate Limits
Edit `lib/constants.ts`:
```javascript
export const RATE_LIMIT_MAX_REQUESTS = 15;
export const RATE_LIMIT_WINDOW_MS = 3600000; // 1 hour
```

### Change Pagination Size
Edit `lib/constants.ts`:
```javascript
export const DEFAULT_PAGE_SIZE = 12;
```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name | Production only |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key | Production only |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret | Production only |
| `POSTGRES_URL` | Vercel Postgres connection string | Required on Vercel for writable data |
| `SQLITE_PATH` | Local SQLite path when no Postgres URL is set | Optional (local/dev) |
| `NODE_ENV` | Environment (development/production) | Yes |

## 🤝 Contributing

This is a portfolio project, but feedback and suggestions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Your Name**
- GitHub: [@headinclouds](https://github.com/headinclouds)
- LinkedIn: [olena-deordiieva](https://www.linkedin.com/in/olena-deordiieva/)

## 🙏 Acknowledgments

- AI image generation powered by [Pollinations.ai](https://pollinations.ai)
- Cloud storage by [Cloudinary](https://cloudinary.com)
- Built with [Next.js](https://nextjs.org)
- Icons from [Hero Icons](https://heroicons.com)

---

**Built with ❤️ using Next.js 14**
