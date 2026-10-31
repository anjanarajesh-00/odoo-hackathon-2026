import { getDb } from '../config/database.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runRollback() {
  console.log('====================================================');
  console.log(' BRIGHTLOOP DATABASE ROLLBACK');
  console.log('====================================================');

  const db = getDb();
  const migrationsPath = path.resolve(__dirname, '../database/migrations');

  try {
    console.log(`Rolling back latest batch of migrations...`);
    const [batchNo, log] = await db.migrate.rollback({
      directory: migrationsPath,
      loadExtensions: ['.ts', '.js'],
    });

    if (log.length === 0) {
      console.log('ℹ️ Already at the base migration.');
    } else {
      console.log(`✅ Batch ${batchNo} rolled back: ${log.length} migration(s):`);
      log.forEach((file: string) => console.log(`   - ${file}`));
    }
  } catch (error: any) {
    console.error('❌ Rollback failed:', error.message);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

runRollback();
