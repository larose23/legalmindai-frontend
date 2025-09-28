import express from 'express';
import { Database } from '../database/database.js';
import { seedSampleData } from '../utils/seedData.js';

const router = express.Router();
const db = new Database();

// Ingest sample data endpoint
router.post('/ingest-sample-data', async (req, res) => {
  try {
    const result = await seedSampleData(db);
    
    res.json({
      message: 'Sample data ingested successfully',
      ...result
    });
  } catch (error) {
    console.error('Sample data ingestion error:', error);
    res.status(500).json({ 
      error: 'Failed to ingest sample data',
      message: error.message 
    });
  }
});

// Get database statistics
router.get('/stats', (req, res) => {
  try {
    const stats = db.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve statistics',
      message: error.message 
    });
  }
});

// Check for duplicates
router.get('/duplicates', (req, res) => {
  try {
    const documentDuplicates = db.findDuplicates();
    const knowledgeDuplicates = db.findDuplicateKnowledge();
    
    res.json({
      documents: documentDuplicates,
      knowledge_base: knowledgeDuplicates,
      total_document_duplicates: documentDuplicates.length,
      total_knowledge_duplicates: knowledgeDuplicates.length
    });
  } catch (error) {
    console.error('Check duplicates error:', error);
    res.status(500).json({ 
      error: 'Failed to check for duplicates',
      message: error.message 
    });
  }
});

// Remove duplicates
router.post('/remove-duplicates', (req, res) => {
  try {
    const documentDuplicatesRemoved = db.removeDuplicates();
    const knowledgeDuplicatesRemoved = db.removeDuplicateKnowledge();
    
    res.json({
      message: 'Duplicates removed successfully',
      documents_removed: documentDuplicatesRemoved,
      knowledge_removed: knowledgeDuplicatesRemoved,
      total_removed: documentDuplicatesRemoved + knowledgeDuplicatesRemoved
    });
  } catch (error) {
    console.error('Remove duplicates error:', error);
    res.status(500).json({ 
      error: 'Failed to remove duplicates',
      message: error.message 
    });
  }
});

// Get knowledge base entries
router.get('/knowledge', (req, res) => {
  try {
    const { category, limit = 100, offset = 0 } = req.query;
    const knowledge = db.getAllKnowledge(category, parseInt(limit), parseInt(offset));
    
    const formattedKnowledge = knowledge.map(item => ({
      id: item.id,
      title: item.title,
      content: item.content,
      category: item.category,
      tags: JSON.parse(item.tags || '[]'),
      source: item.source,
      created_at: item.created_at,
      updated_at: item.updated_at
    }));

    res.json({
      knowledge: formattedKnowledge,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: formattedKnowledge.length
      }
    });
  } catch (error) {
    console.error('Get knowledge error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve knowledge base',
      message: error.message 
    });
  }
});

// Search knowledge base
router.get('/knowledge/search', (req, res) => {
  try {
    const { q, category, limit = 50 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const knowledge = db.searchKnowledge(q, category, parseInt(limit));
    
    const formattedKnowledge = knowledge.map(item => ({
      id: item.id,
      title: item.title,
      content: item.content,
      category: item.category,
      tags: JSON.parse(item.tags || '[]'),
      source: item.source,
      created_at: item.created_at,
      updated_at: item.updated_at
    }));

    res.json({
      knowledge: formattedKnowledge,
      query: q,
      category: category || 'all',
      total: formattedKnowledge.length
    });
  } catch (error) {
    console.error('Search knowledge error:', error);
    res.status(500).json({ 
      error: 'Failed to search knowledge base',
      message: error.message 
    });
  }
});

// Add knowledge base entry
router.post('/knowledge', (req, res) => {
  try {
    const { title, content, category, tags, source } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const result = db.saveKnowledge(title, content, category, tags, source);
    
    res.json({
      message: 'Knowledge base entry added successfully',
      id: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Add knowledge error:', error);
    res.status(500).json({ 
      error: 'Failed to add knowledge base entry',
      message: error.message 
    });
  }
});

// Update knowledge base entry
router.put('/knowledge/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags, source } = req.body;
    
    const knowledge = db.getKnowledge(id);
    if (!knowledge) {
      return res.status(404).json({ error: 'Knowledge base entry not found' });
    }

    const updates = {};
    if (title) updates.title = title;
    if (content) updates.content = content;
    if (category) updates.category = category;
    if (tags) updates.tags = JSON.stringify(tags);
    if (source) updates.source = source;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    const stmt = db.db.prepare(`
      UPDATE knowledge_base 
      SET ${Object.keys(updates).map(key => `${key} = ?`).join(', ')}
      WHERE id = ?
    `);
    const result = stmt.run(...Object.values(updates), id);
    
    res.json({
      message: 'Knowledge base entry updated successfully',
      changes: result.changes
    });
  } catch (error) {
    console.error('Update knowledge error:', error);
    res.status(500).json({ 
      error: 'Failed to update knowledge base entry',
      message: error.message 
    });
  }
});

// Delete knowledge base entry
router.delete('/knowledge/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const knowledge = db.getKnowledge(id);
    if (!knowledge) {
      return res.status(404).json({ error: 'Knowledge base entry not found' });
    }

    const stmt = db.db.prepare('DELETE FROM knowledge_base WHERE id = ?');
    const result = stmt.run(id);
    
    res.json({ 
      message: 'Knowledge base entry deleted successfully',
      changes: result.changes 
    });
  } catch (error) {
    console.error('Delete knowledge error:', error);
    res.status(500).json({ 
      error: 'Failed to delete knowledge base entry',
      message: error.message 
    });
  }
});

// Database maintenance
router.post('/maintenance/cleanup', (req, res) => {
  try {
    const documentDuplicatesRemoved = db.removeDuplicates();
    const knowledgeDuplicatesRemoved = db.removeDuplicateKnowledge();
    
    // Get updated stats
    const stats = db.getStats();
    
    res.json({
      message: 'Database maintenance completed',
      duplicates_removed: {
        documents: documentDuplicatesRemoved,
        knowledge: knowledgeDuplicatesRemoved,
        total: documentDuplicatesRemoved + knowledgeDuplicatesRemoved
      },
      current_stats: stats
    });
  } catch (error) {
    console.error('Database maintenance error:', error);
    res.status(500).json({ 
      error: 'Failed to perform database maintenance',
      message: error.message 
    });
  }
});

export { router as DataController };
export default router;