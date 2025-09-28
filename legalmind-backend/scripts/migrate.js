import { Database } from '../src/database/database.js';

console.log('🔄 Running database migrations...');

try {
  const db = new Database();
  console.log('✅ Database migration completed successfully');
  console.log('📊 Database statistics:', db.getStats());
  db.close();
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
}