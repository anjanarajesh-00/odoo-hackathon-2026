import { env } from '../config/env.js';
import { testDatabaseConnection, closeDatabaseConnection } from '../config/database.js';

async function main() {
  console.log('====================================================');
  console.log(' BRIGHTLOOP DATABASE CONNECTION TEST');
  console.log('====================================================');
  console.log(`Configured DATABASE_TYPE : ${env.DATABASE_TYPE.toUpperCase()}`);

  if (env.DATABASE_TYPE === 'supabase') {
    console.log(`Target Supabase Host     : ${env.SUPABASE_DB_HOST}:${env.SUPABASE_DB_PORT}`);
    console.log(`Target Database Name     : ${env.SUPABASE_DB_NAME}`);
    console.log(`User                     : ${env.SUPABASE_DB_USER}`);
    console.log(`SSL Enabled              : ${env.SUPABASE_DB_SSL}`);
  } else {
    console.log(`Target MySQL Host        : ${env.MYSQL_DB_HOST}:${env.MYSQL_DB_PORT}`);
    console.log(`Target Database Name     : ${env.MYSQL_DB_NAME}`);
    console.log(`User                     : ${env.MYSQL_DB_USER}`);
  }
  console.log('----------------------------------------------------');
  console.log('Attempting connection...');

  const result = await testDatabaseConnection();

  if (result.connected) {
    console.log(`✅ SUCCESS: ${result.message}`);
    console.log('====================================================');
    await closeDatabaseConnection();
    process.exit(0);
  } else {
    console.error(`❌ FAILED: ${result.message}`);
    console.log('----------------------------------------------------');
    console.log('💡 TROUBLESHOOTING TIPS:');
    if (env.DATABASE_TYPE === 'mysql') {
      console.log(' 1. Ensure your local MySQL server is running (e.g. XAMPP, MySQL Workbench, or Windows Service).');
      console.log(` 2. Verify database "${env.MYSQL_DB_NAME}" exists. If not, run:`);
      console.log(`    CREATE DATABASE ${env.MYSQL_DB_NAME};`);
      console.log(' 3. Check credentials in your .env file.');
    } else {
      console.log(' 1. Check your internet connection.');
      console.log(' 2. Verify your Supabase PostgreSQL credentials from Supabase Dashboard -> Database -> Connection String.');
      console.log(' 3. Ensure SSL is enabled (SUPABASE_DB_SSL=true).');
    }
    console.log('====================================================');
    await closeDatabaseConnection();
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
