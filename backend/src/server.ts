import { createApp } from './app.js';
import { env } from './config/env.js';
import { testDatabaseConnection, closeDatabaseConnection } from './config/database.js';

const startServer = async () => {
  const app = createApp();

  console.log('🚀 Starting Brightloop Subscription Management Backend...');
  console.log(`🔧 Environment: ${env.NODE_ENV}`);
  console.log(`🗄️  Active Database Engine: ${env.DATABASE_TYPE.toUpperCase()}`);

  // Test database connection at startup
  const dbHealth = await testDatabaseConnection();
  if (dbHealth.connected) {
    console.log(`✅ [Database] ${dbHealth.message}`);
  } else {
    console.warn(`⚠️  [Database Warning] ${dbHealth.message}`);
    console.warn('⚠️  Server will still start, but database operations will fail until connected.');
  }

  const server = app.listen(env.PORT, () => {
    console.log(`⚡ Server running on http://localhost:${env.PORT}`);
    console.log(`🩺 Health check: http://localhost:${env.PORT}/api/health`);
    console.log(`📡 API Base:     http://localhost:${env.PORT}/api/v1`);
  });

  // Graceful Shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      console.log('💤 HTTP server closed.');
      await closeDatabaseConnection();
      console.log('🗄️  Database pool destroyed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer().catch((error) => {
  console.error('💥 Fatal error starting server:', error);
  process.exit(1);
});
