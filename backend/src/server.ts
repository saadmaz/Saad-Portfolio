import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { connectDB } from './utils/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { adminAuth } from './middleware/auth.js';

// Import routes
import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

// --- Startup Environment Validation ---
const REQUIRED_ENV = ['FIREBASE_PROJECT_ID'];
const OPTIONAL_BUT_WARN = ['ADMIN_SECRET', 'SENDGRID_API_KEY', 'FRONTEND_URL'];

REQUIRED_ENV.forEach(key => {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}. Exiting.`);
    process.exit(1);
  }
});

OPTIONAL_BUT_WARN.forEach(key => {
  if (!process.env[key]) {
    console.warn(`⚠️  Optional env variable not set: ${key}. Some features may be disabled.`);
  }
});

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Database
connectDB().then(() => {
  console.log('📦 Database initialization process complete');
});

// Security & Base Middleware
app.use(helmet());
app.use(cors({
  // FIX: changed default from :8080 to :5173 (Vite default dev port)
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Stricter rate limit specifically for the contact form (anti-spam)
const contactLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: {
    success: false,
    error: 'Too many contact form submissions. Please wait before trying again.'
  }
});
app.use('/api/contact', contactLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// API routes
app.use('/api', publicRoutes);

// Admin routes with protection
app.use('/api/admin', adminAuth, adminRoutes);

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});