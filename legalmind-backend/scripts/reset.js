import { Database } from '../src/database/database.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔄 Resetting database...');

try {
  const db = new Database();
  
  // Get current stats
  const stats = db.getStats();
  console.log('📊 Current database stats:', stats);
  
  // Close database connection
  db.close();
  
  // Delete database file
  const dbPath = join(__dirname, '../data/legalmind.db');
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('🗑️ Database file deleted');
  }
  
  // Recreate database
  const newDb = new Database();
  console.log('✅ Database reset completed successfully');
  console.log('📊 New database stats:', newDb.getStats());
  
  newDb.close();
} catch (error) {
  console.error('❌ Reset failed:', error);
  process.exit(1);
}