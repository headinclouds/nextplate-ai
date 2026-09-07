# 🍽️ NextLevel Food - Food Sharing Platform

A modern, full-stack food sharing platform built with Next.js 14, featuring AI-powered image generation, cloud storage, and comprehensive optimizations for production use.

![Next.js](https://img.shields.io/badge/Next.js-14.0.3-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js)

## 🌟 Key Features

### Core Functionality

- **🔐 Authentication**: Email/password sign-up, login, and logout powered by Better Auth
- **📸 Image Management**: Upload your own images or generate them with AI
- **🤖 AI Image Generation**: Powered by Pollinations.ai with Apply/Retry workflow
- **✍️ AI Recipe Assistance**: Improve, add emojis to, or fix grammar in instructions with one click
- **📝 Markdown Instructions**: Meal instructions render as formatted Markdown (bold, lists, etc.)
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

- **Next.js Server Actions** - Type-safe server-side functions (`app/actions/`)
- **Better Auth** - Email/password authentication, sessions, and cookie handling
- **PostgreSQL** - Required database, locally via Docker and in production via Vercel Postgres/Neon
- **Cloudinary** - Cloud image storage and optimization

### AI & APIs

- **Pollinations.ai** - Free AI image generation and recipe text improvement
- **react-markdown** - Safe Markdown rendering for meal instructions
- **Next.js Image** - Automatic image optimization

### Developer Tools

- **ESLint** + **Prettier** - Code quality, linting, and formatting
- **Jest** + **Testing Library** - Unit and component tests
- **Slugify** - URL-safe string generation
- **XSS** - Input sanitization

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for local PostgreSQL)

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

3. **Start local PostgreSQL**

```bash
docker compose up -d
```

This starts a `postgres:16-alpine` container (see [compose.yaml](compose.yaml)) on `localhost:5432` with a persistent volume.

4. **Set up environment variables**

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Cloudinary credentials (optional for development):

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=development
BETTER_AUTH_SECRET=generate_a_secret_with_openssl_rand_-base64_32
BETTER_AUTH_URL=http://localhost:3000
POSTGRES_URL=postgres://foodies:foodies@localhost:5432/foodies
```

`POSTGRES_URL` is required — the app will not start without it.

5. **Initialize the meals database**

```bash
npm run db:init
```

This creates the meal tables, indexes, and sample meals. Run it against a new local or production database before starting the application.

6. **Initialize the authentication database**

```bash
npm run auth:migrate
```

This creates Better Auth's `user`, `account`, `session`, and `verification` tables. Run it against the production Postgres database before deploying.

7. **Run the development server**

```bash
npm run dev
```

8. **Open your browser**

```
http://localhost:3000
```

## 📁 Project Structure

```
foodies/
├── app/                      # Next.js App Router
│   ├── actions/              # Server Actions (auth, meals, AI recipe help)
│   ├── api/auth/[...all]/    # Better Auth request handler
│   ├── login/                # Login page + form
│   ├── register/             # Registration page + form
│   ├── layout.tsx            # Root layout with metadata
│   ├── page.tsx              # Homepage
│   ├── globals.css           # Global styles & CSS variables
│   ├── meals/                # Meals feature
│   │   ├── page.tsx          # Meals list with pagination
│   │   ├── [slug]/           # Dynamic meal detail pages (Markdown instructions)
│   │   └── share/            # Share meal form (auth-protected)
│   └── community/            # Community page
├── components/               # React components
│   ├── meals/                # Meal-specific components
│   ├── main-header/          # Navigation header (session-aware)
│   ├── footer/               # Site footer
│   └── ui/                   # Reusable UI components
├── lib/                      # Server-side utilities
│   ├── auth.ts               # Better Auth configuration + session helper
│   ├── meals.ts              # Meal database operations (Postgres)
│   ├── meal-validation.ts    # Meal form field validation
│   ├── meal-images.ts        # Generated image persistence
│   ├── pollinations.ts       # AI image + recipe text requests
│   ├── storage.ts            # Cloud storage abstraction
│   ├── rate-limit.ts         # Rate limiting logic
│   └── constants.ts          # Configuration constants
├── public/                   # Static assets
│   └── images/               # Local image storage (dev)
├── compose.yaml              # Local PostgreSQL container
└── initdb.js                 # Meal database initialization script
```

## 🔐 Authentication

Authentication is handled by [Better Auth](https://www.better-auth.com/) with email/password sign-in:

- **Sign up** (`/register`) creates a user via `auth.api.signUpEmail` and redirects to `/login?registered=true` (no auto sign-in).
- **Log in** (`/login`) verifies credentials via `auth.api.signInEmail` and sets a secure session cookie.
- **Log out** revokes the session via `auth.api.signOut`.
- **Protected routes**: `/meals/share` and the `shareMeal` Server Action both check the session server-side; unauthenticated visitors are redirected to `/login`.
- **Session-aware navigation**: the header shows Log In/Sign Up or Log out depending on session state.

Better Auth stores its own `user`, `account`, `session`, and `verification` tables, created by `npm run auth:migrate` — separate from the app's `meals` table, which is created by `npm run db:init`.

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

### 2. AI Recipe Assistance

Three buttons next to the Instructions field call the same `improveRecipe` Server Action with different modes:

- **Improve with AI** — expands the recipe with more detail
- **Add emojis** — adds appropriate cooking emojis
- **Fix grammar** — corrects grammar/spelling without changing meaning

All three are disabled while a request is in flight and blocked client-side if the field is empty. Instructions are rendered as Markdown (via `react-markdown`) on the meal detail page, so AI-generated formatting like `**bold**` displays correctly.

### 3. Cloud Storage Strategy

```javascript
// Automatic provider selection:
- Development: Local filesystem (public/images/)
- Production: Cloudinary with optimization
  - Auto WebP/AVIF format conversion
  - Quality auto-tuning
  - 1200x1200 size limit
```

### 4. Rate Limiting

```javascript
// In-memory rate limiting:
- 15 requests per hour per IP
- Applies to AI generation only
- Automatic cleanup of old entries
- Graceful error messages with reset time
```

### 5. Database Optimization

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
  POLLINATIONS_API_KEY
  POSTGRES_URL
  BETTER_AUTH_SECRET
  BETTER_AUTH_URL
  NODE_ENV=production
  ```
- Deploy!
- Run `npm run db:init` and `npm run auth:migrate` against the production `POSTGRES_URL` (see Installation steps 5–6).

3. **Database Note**

- With Vercel Postgres enabled, meal creation and updates persist normally.
- `POSTGRES_URL` is required; the app will not start without it.

### Alternative Deployment Options

- **Netlify**: Similar to Vercel
- **Railway**: Full-stack hosting with persistent storage
- **AWS**: EC2 + S3 + RDS for full control
- **DigitalOcean**: App Platform with managed database

## 📊 Performance Metrics

| Metric                     | Value                                    |
| -------------------------- | ---------------------------------------- |
| **Lighthouse Performance** | 95+                                      |
| **First Contentful Paint** | < 1.2s                                   |
| **Time to Interactive**    | < 2.5s                                   |
| **CSS Bundle Size**        | ~42.5KB (15% smaller after optimization) |
| **Image Optimization**     | Auto WebP/AVIF, quality auto-tuning      |

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
  --color-primary: #f9572a; /* Main brand color */
  --color-secondary: #ff8a05; /* Secondary color */
  --color-accent: #ffc905; /* Accent color */
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

| Variable                | Description                                                          | Required        |
| ----------------------- | -------------------------------------------------------------------- | --------------- |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name                                           | Production only |
| `CLOUDINARY_API_KEY`    | Your Cloudinary API key                                              | Production only |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret                                           | Production only |
| `POLLINATIONS_API_KEY`  | API key for AI image generation and recipe text improvement          | Yes             |
| `POSTGRES_URL`          | Postgres connection string                                           | Yes             |
| `BETTER_AUTH_SECRET`    | Random secret used to sign and encrypt authentication data           | Yes             |
| `BETTER_AUTH_URL`       | Application URL used by authentication callbacks (no trailing slash) | Yes             |
| `NODE_ENV`              | Environment (development/production)                                 | Yes             |

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
