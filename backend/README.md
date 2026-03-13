# Portfolio Backend API

A Node.js/Express backend API for the Saad Malik Portfolio website.

## Features

- **RESTful API** for portfolio data
- **Firebase Firestore** for data persistence
- **Contact form** with email notifications
- **Admin panel** (coming soon)
- **Type-safe** with TypeScript
- **Security** with Helmet, CORS, and rate limiting

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Firebase Firestore (NoSQL)
- **Language**: TypeScript
- **Email**: SendGrid
- **Development**: tsx (for hot reload)

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase project with Firestore enabled
- SendGrid account (for email)

### Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up Firebase:**
   - Create a Firebase project at https://console.firebase.google.com/
   - Enable Firestore Database
   - Generate a service account key:
   - Go to Project Settings > Service Accounts
   - Generate new private key (JSON file)
   - Download the JSON file (e.g., saadportfolio03-firebase-adminsdk-fbsvc-0756564855.json)
   - Place it in backend/
   - Set FIREBASE_SERVICE_ACCOUNT_PATH in .env to ./saadportfolio03-firebase-adminsdk-fbsvc-0756564855.json

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   FIREBASE_PROJECT_ID=saadportfolio03
   FIREBASE_SERVICE_ACCOUNT_PATH=./saadportfolio03-firebase-adminsdk-fbsvc-0756564855.json

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d

   # Email Configuration (SendGrid)
   SENDGRID_API_KEY=your-sendgrid-api-key-here
   FROM_EMAIL=noreply@saadmalik.dev
   TO_EMAIL=saadmazaa@gmail.com

   # Server Configuration
   PORT=3001
   NODE_ENV=development

   # CORS Configuration
   FRONTEND_URL=http://localhost:5173
   ```

4. **Migrate existing data:**
   ```bash
   npm run db:migrate
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`
   ```

3. **Set up database:**
   ```bash
   # Create database
   createdb portfolio_db

   # Run schema
   psql -d portfolio_db -f schema.sql
   ```

4. **Migrate existing data:**
   ```bash
   bun run db:migrate
   ```

5. **Start development server:**
   ```bash
   bun run dev
   ```

The API will be available at `http://localhost:3001`

## API Endpoints

### Public Endpoints

#### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/featured` - Get featured projects
- `GET /api/projects/:slug` - Get project by slug

#### Blog Posts
- `GET /api/blog-posts` - Get all published blog posts
- `GET /api/blog-posts/:slug` - Get blog post by slug

#### Contact
- `POST /api/contact` - Submit contact form

#### Other Data (Coming Soon)
- `GET /api/work-experience` - Get work experience
- `GET /api/skills` - Get skills
- `GET /api/certificates` - Get certificates

### Admin Endpoints (Coming Soon)
- `GET /api/admin/projects` - Manage projects
- `GET /api/admin/blog-posts` - Manage blog posts
- `GET /api/admin/contact-messages` - View contact messages

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # Route handlers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middleware/     # Express middleware
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript types
│   ├── scripts/        # Migration scripts
│   └── server.ts       # Main server file
├── schema.sql          # Database schema
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript config
└── .env.example        # Environment template
```

## Development

### Available Scripts

- `bun run dev` - Start development server with hot reload
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run db:migrate` - Migrate existing data to database
- `bun run db:seed` - Seed database with sample data

### API Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "pagination": { ... } // For paginated responses
}
```

### Error Handling

Errors are returned with appropriate HTTP status codes:

```json
{
  "success": false,
  "error": "Error message",
  "stack": "..." // Only in development
}
```

## Deployment

### Environment Variables for Production

```env
NODE_ENV=production
DATABASE_URL=your-production-db-url
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@yourdomain.com
TO_EMAIL=your-email@yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

### Build and Deploy

```bash
bun run build
bun run start
```

## Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Write clear commit messages
4. Test API endpoints thoroughly

## License

This project is private and proprietary.