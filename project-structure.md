# ContentSync Micro SaaS - Complete Project Structure

## Tech Stack
- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with JWT
- **Background Jobs**: Vercel Cron Jobs + Redis (Upstash)
- **AI**: Google Gemini API
- **Deployment**: Vercel (Frontend + API), Supabase (Database), Upstash (Redis)
- **Monitoring**: Sentry for error tracking

## Project Structure
```
contentsync/
├── app/                          # Next.js 14 app directory
│   ├── (auth)/                   # Auth route group
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/page.tsx        # Main dashboard
│   ├── platforms/page.tsx        # Platform management
│   ├── content/page.tsx          # Content management
│   ├── api/                      # API routes
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── platforms/route.ts
│   │   ├── content/route.ts
│   │   ├── generate/route.ts
│   │   └── cron/monitor/route.ts
│   ├── globals.css
│   └── layout.tsx
├── components/                   # Reusable components
│   ├── ui/                      # shadcn/ui components
│   ├── dashboard/
│   ├── platform-card.tsx
│   └── content-card.tsx
├── lib/                         # Utilities and services
│   ├── auth.ts                  # NextAuth configuration
│   ├── db.ts                    # Database connection
│   ├── scrapers/                # Platform scrapers
│   ├── ai/                      # AI generation service
│   ├── queue.ts                 # Background job queue
│   └── utils.ts
├── prisma/                      # Database schema and migrations
│   ├── schema.prisma
│   └── migrations/
├── types/                       # TypeScript type definitions
├── docker-compose.yml           # Local development
├── Dockerfile
└── package.json
```