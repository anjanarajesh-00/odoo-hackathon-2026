import { getDb } from '../config/database.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSeeds() {
  console.log('====================================================');
  console.log(' BRIGHTLOOP DATABASE SEEDING');
  console.log('====================================================');

  const db = getDb();
  const seedsPath = path.resolve(__dirname, '../database/seeds');

  try {
    console.log(`Applying seeds from: ${seedsPath}`);
    const [log] = await db.seed.run({
      directory: seedsPath,
      loadExtensions: ['.ts', '.js'],
    });

    console.log(`✅ Seeding complete! ${log.length} seed file(s) executed:`);
    log.forEach((file: string) => console.log(`   - ${file}`));
  } catch (error: any) {
    console.error('❌ Seeding failed:', error.message);
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

runSeeds();
