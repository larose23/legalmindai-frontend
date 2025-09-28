import express from 'express';
import { Database } from '../database/database.js';
import { validateResearchQuery } from '../utils/validators.js';
import { performLegalResearch } from '../utils/aiService.js';

const router = express.Router();
const db = new Database();

// Legal research endpoint
router.post('/legal-research', async (req, res) => {
  try {
    const { query } = req.body;
    
    // Validate input
    const { error } = validateResearchQuery({ query });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if research already exists
    const existingResearch = db.getResearch(query);
    if (existingResearch) {
      return res.json({
        answer: existingResearch.answer,
        sources: JSON.parse(existingResearch.sources || '[]'),
        confidence_score: existingResearch.confidence_score,
        cached: true
      });
    }

    // Perform AI research
    const researchResult = await performLegalResearch(query);
    
    // Save research to database
    db.saveResearch(
      query, 
      researchResult.answer, 
      researchResult.sources, 
      researchResult.confidence_score
    );

    res.json({
      answer: researchResult.answer,
      sources: researchResult.sources,
      confidence_score: researchResult.confidence_score,
      cached: false
    });
  } catch (error) {
    console.error('Legal research error:', error);
    res.status(500).json({ 
      error: 'Failed to perform legal research',
      message: error.message 
    });
  }
});

// Get research by query
router.get('/research', (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const research = db.getResearch(query);
    if (!research) {
      return res.status(404).json({ error: 'Research not found' });
    }

    res.json({
      query: research.query,
      answer: research.answer,
      sources: JSON.parse(research.sources || '[]'),
      confidence_score: research.confidence_score,
      created_at: research.created_at
    });
  } catch (error) {
    console.error('Get research error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve research',
      message: error.message 
    });
  }
});

// Get all research
router.get('/research/all', (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const research = db.getAllResearch(parseInt(limit), parseInt(offset));
    
    const formattedResearch = research.map(item => ({
      id: item.id,
      query: item.query,
      answer: item.answer,
      sources: JSON.parse(item.sources || '[]'),
      confidence_score: item.confidence_score,
      created_at: item.created_at
    }));

    res.json({
      research: formattedResearch,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: formattedResearch.length
      }
    });
  } catch (error) {
    console.error('Get all research error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve research',
      message: error.message 
    });
  }
});

// Search research
router.get('/research/search', (req, res) => {
  try {
    const { q, limit = 50 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const research = db.searchKnowledge(q, 'legal_research', parseInt(limit));
    
    const formattedResearch = research.map(item => ({
      id: item.id,
      title: item.title,
      content: item.content,
      category: item.category,
      tags: JSON.parse(item.tags || '[]'),
      source: item.source,
      created_at: item.created_at
    }));

    res.json({
      research: formattedResearch,
      query: q,
      total: formattedResearch.length
    });
  } catch (error) {
    console.error('Search research error:', error);
    res.status(500).json({ 
      error: 'Failed to search research',
      message: error.message 
    });
  }
});

// Delete research
router.delete('/research/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const research = db.getResearch(id);
    if (!research) {
      return res.status(404).json({ error: 'Research not found' });
    }

    const stmt = db.db.prepare('DELETE FROM legal_research WHERE id = ?');
    const result = stmt.run(id);
    
    res.json({ 
      message: 'Research deleted successfully',
      changes: result.changes 
    });
  } catch (error) {
    console.error('Delete research error:', error);
    res.status(500).json({ 
      error: 'Failed to delete research',
      message: error.message 
    });
  }
});

export { router as ResearchController };
export default router;