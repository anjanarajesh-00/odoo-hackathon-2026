import { getDb } from '../config/database.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  console.log('====================================================');
  console.log(' BRIGHTLOOP DATABASE MIGRATIONS');
  console.log('====================================================');

  const db = getDb();
  const migrationsPath = path.resolve(__dirname, '../database/migrations');

  try {
    console.log(`Applying migrations from: ${migrationsPath}`);
    const [batchNo, log] = await db.migrate.latest({
      directory: migrationsPath,
      loadExtensions: ['.ts', '.js'],
    });

    if (log.length === 0) {
      console.log('✅ All migrations are already up to date.');
    } else {
      console.log(`✅ Batch ${batchNo} applied ${log.length} migration(s):`);
      log.forEach((file: string) => console.log(`   - ${file}`));
    }
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Database server is not reachable.');
      console.error('   - If using MySQL, please start your local MySQL server (XAMPP / MySQL Service).');
      console.error('   - If using Supabase, set DATABASE_TYPE=supabase in .env with your credentials.\n');
    }
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

runMigrations();
