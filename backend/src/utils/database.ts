import { Pool } from 'pg';

let pool: Pool | null = null;

export const connectDB = async () => {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn('⚠️  DATABASE_URL not set. Running without database connection.');
      return;
    }

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
  } catch (error) {
    console.warn('⚠️  Database connection failed. Running without database:', error.message);
    pool = null;
  }
};

export const query = (text: string, params?: any[]) => {
  if (!pool) {
    throw new Error('Database not connected. Please check your DATABASE_URL.');
  }
  return pool.query(text, params);
};

export const isDBConnected = () => pool !== null;