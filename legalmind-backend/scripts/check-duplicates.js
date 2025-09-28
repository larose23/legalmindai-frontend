import { Database } from '../src/database/database.js';

console.log('🔍 Checking for duplicates in database...');

try {
  const db = new Database();
  
  // Wait for database to initialize
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check for duplicates
  const documentDuplicates = await db.findDuplicates();
  const knowledgeDuplicates = await db.findDuplicateKnowledge();
  
  console.log('📊 Duplicate Analysis:');
  console.log(`📄 Document duplicates: ${documentDuplicates.length}`);
  console.log(`📚 Knowledge base duplicates: ${knowledgeDuplicates.length}`);
  
  if (documentDuplicates.length > 0) {
    console.log('\n📄 Document Duplicates:');
    documentDuplicates.forEach((dup, index) => {
      console.log(`${index + 1}. Title: "${dup.title}"`);
      console.log(`   Content preview: "${dup.content.substring(0, 100)}..."`);
      console.log(`   Count: ${dup.count}`);
      console.log('');
    });
  }
  
  if (knowledgeDuplicates.length > 0) {
    console.log('\n📚 Knowledge Base Duplicates:');
    knowledgeDuplicates.forEach((dup, index) => {
      console.log(`${index + 1}. Title: "${dup.title}"`);
      console.log(`   Content preview: "${dup.content.substring(0, 100)}..."`);
      console.log(`   Count: ${dup.count}`);
      console.log('');
    });
  }
  
  if (documentDuplicates.length === 0 && knowledgeDuplicates.length === 0) {
    console.log('✅ No duplicates found!');
  } else {
    console.log(`⚠️ Total duplicates found: ${documentDuplicates.length + knowledgeDuplicates.length}`);
    console.log('💡 Run "npm run db:remove-duplicates" to clean up duplicates');
  }
  
  // Get overall stats
  const stats = await db.getStats();
  console.log('\n📈 Database Statistics:');
  console.log(`📄 Documents: ${stats.documents}`);
  console.log(`🔍 Analyses: ${stats.analyses}`);
  console.log(`📚 Research: ${stats.research}`);
  console.log(`📝 Drafts: ${stats.drafts}`);
  console.log(`🧠 Knowledge: ${stats.knowledge}`);
  
  db.close();
} catch (error) {
  console.error('❌ Duplicate check failed:', error);
  process.exit(1);
}