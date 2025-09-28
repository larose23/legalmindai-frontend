import express from 'express';
import { Database } from '../database/database.js';
import { validateDocumentAnalysis, validateDocumentSummary } from '../utils/validators.js';
import { analyzeDocument, summarizeDocument } from '../utils/aiService.js';

const router = express.Router();
const db = new Database();

// Analyze document endpoint
router.post('/analyze-document', async (req, res) => {
  try {
    const { text } = req.body;
    
    // Validate input
    const { error } = validateDocumentAnalysis({ text });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if document already exists
    const existingDoc = await db.getDocumentByContent(text);
    let documentId = existingDoc?.id;

    // If document doesn't exist, create it
    if (!documentId) {
      const docResult = await db.createDocument(
        `Document Analysis - ${new Date().toISOString()}`,
        text,
        'legal_document'
      );
      documentId = docResult.id;
    }

    // Check if analysis already exists
    const existingAnalysis = await db.getAnalysis(documentId, 'document_analysis');
    if (existingAnalysis.length > 0) {
      return res.json(JSON.parse(existingAnalysis[0].result));
    }

    // Perform AI analysis
    const analysisResult = await analyzeDocument(text);
    
    // Save analysis to database
    await db.saveAnalysis(documentId, 'document_analysis', analysisResult, 0.85);

    res.json(analysisResult);
  } catch (error) {
    console.error('Document analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze document',
      message: error.message 
    });
  }
});

// Summarize document endpoint
router.post('/summarize-document', async (req, res) => {
  try {
    const { text, type = 'concise' } = req.body;
    
    // Validate input
    const { error } = validateDocumentSummary({ text, type });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if document already exists
    const existingDoc = db.getDocumentByContent(text);
    let documentId = existingDoc?.id;

    // If document doesn't exist, create it
    if (!documentId) {
      const docResult = db.createDocument(
        `Document Summary - ${new Date().toISOString()}`,
        text,
        'legal_document'
      );
      documentId = docResult.id;
    }

    // Check if summary already exists
    const existingSummary = db.getAnalysis(documentId, `summary_${type}`);
    if (existingSummary.length > 0) {
      return res.json(JSON.parse(existingSummary[0].result));
    }

    // Perform AI summarization
    const summaryResult = await summarizeDocument(text, type);
    
    // Save summary to database
    db.saveAnalysis(documentId, `summary_${type}`, summaryResult, 0.90);

    res.json(summaryResult);
  } catch (error) {
    console.error('Document summarization error:', error);
    res.status(500).json({ 
      error: 'Failed to summarize document',
      message: error.message 
    });
  }
});

// Get document by ID
router.get('/documents/:id', (req, res) => {
  try {
    const { id } = req.params;
    const document = db.getDocument(id);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve document',
      message: error.message 
    });
  }
});

// Get all documents
router.get('/documents', (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const documents = db.getAllDocuments(parseInt(limit), parseInt(offset));
    
    res.json({
      documents,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: documents.length
      }
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve documents',
      message: error.message 
    });
  }
});

// Get document analysis
router.get('/documents/:id/analysis', (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;
    
    const document = db.getDocument(id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const analyses = db.getAnalysis(id, type);
    res.json(analyses);
  } catch (error) {
    console.error('Get document analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve document analysis',
      message: error.message 
    });
  }
});

// Delete document
router.delete('/documents/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const document = db.getDocument(id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const result = db.deleteDocument(id);
    res.json({ 
      message: 'Document deleted successfully',
      changes: result.changes 
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ 
      error: 'Failed to delete document',
      message: error.message 
    });
  }
});

export { router as DocumentController };
export default router;