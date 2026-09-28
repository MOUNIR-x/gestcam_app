import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import authRoutes from './server/routes/auth.js';
import invoiceRoutes from './server/routes/invoices.js';
import stockRoutes from './server/routes/stocks.js';
import treasuryRoutes from './server/routes/treasury.js';
import mobileMoneyRoutes from './server/routes/mobileMoney.js';
import taxRoutes from './server/routes/tax.js';
import aiRoutes from './server/routes/ai.js';
import { pgService } from './server/services/pgService.js';
import { seedDatabase } from './server/data/seed.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();

  if (process.env.AUTO_SEED_DB === 'true') {
    try {
      const seeded = await seedDatabase();
      if (seeded) {
        console.log('[DB] Seed complete');
      }
    } catch (error: any) {
      console.warn('[DB] Seed skipped or failed:', error?.message || error);
    }
  }

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logger for API calls
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API ${req.method}] ${req.path}`);
    }
    next();
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'GestCam Cameroun Backend API',
      version: '1.0.0',
      system: 'OHADA Revision & Loi de Finances Cameroun 2026',
      environment: isProd ? 'production' : 'development',
      timestamp: new Date().toISOString()
    });
  });

  // Database connectivity & live table verification endpoint
  app.get('/api/health/db', async (req, res) => {
    try {
      const [products, invoices, clients, accounts] = await Promise.all([
        pgService.getProducts(),
        pgService.getInvoices(),
        pgService.getClients(),
        pgService.getTreasuryAccounts()
      ]);
      res.json({
        status: 'connected',
        database: 'Cloud SQL PostgreSQL',
        instance: 'ai-studio-ec8668af',
        region: 'europe-west2',
        counts: {
          products: products.length,
          invoices: invoices.length,
          clients: clients.length,
          treasuryAccounts: accounts.length
        },
        sampleProduct: products[0] || null,
        sampleInvoice: invoices[0] || null
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'error',
        message: err?.message || 'Database error'
      });
    }
  });

  // Mount API modules
  app.use('/api/auth', authRoutes);
  app.use('/api/invoices', invoiceRoutes);
  app.use('/api/stocks', stockRoutes);
  app.use('/api/treasury', treasuryRoutes);
  app.use('/api/mobile-money', mobileMoneyRoutes);
  app.use('/api/tax', taxRoutes);
  app.use('/api/ai', aiRoutes);

  // Mount Vite development middlewares or serve static build
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 GestCam Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
