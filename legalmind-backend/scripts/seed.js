import { Database } from '../src/database/database.js';
import { seedSampleData } from '../src/utils/seedData.js';

console.log('🌱 Seeding database with sample data...');

try {
  const db = new Database();
  const results = await seedSampleData(db);
  
  console.log('✅ Database seeding completed successfully');
  console.log('📊 Results:', results);
  console.log('📈 Database statistics:', db.getStats());
  
  db.close();
} catch (error) {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
}