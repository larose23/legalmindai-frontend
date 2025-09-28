import express from 'express';
import { Database } from '../database/database.js';
import { validateDraftParameters } from '../utils/validators.js';
import { generateDocumentDraft } from '../utils/aiService.js';

const router = express.Router();
const db = new Database();

// Draft document endpoint
router.post('/draft-document', async (req, res) => {
  try {
    const { type, parameters } = req.body;
    
    // Validate input
    const { error } = validateDraftParameters({ type, parameters });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Generate document draft using AI
    const draftContent = await generateDocumentDraft(type, parameters);
    
    // Save draft to database
    const draftResult = db.saveDraft(type, parameters, draftContent);

    res.json({
      id: draftResult.lastInsertRowid,
      type,
      parameters,
      draft: draftContent,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Document drafting error:', error);
    res.status(500).json({ 
      error: 'Failed to draft document',
      message: error.message 
    });
  }
});

// Get draft by ID
router.get('/drafts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const draft = db.getDraft(id);
    
    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    res.json({
      id: draft.id,
      type: draft.draft_type,
      parameters: JSON.parse(draft.parameters),
      content: draft.content,
      created_at: draft.created_at,
      updated_at: draft.updated_at
    });
  } catch (error) {
    console.error('Get draft error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve draft',
      message: error.message 
    });
  }
});

// Get all drafts
router.get('/drafts', (req, res) => {
  try {
    const { type, limit = 100, offset = 0 } = req.query;
    const drafts = db.getAllDrafts(type, parseInt(limit), parseInt(offset));
    
    const formattedDrafts = drafts.map(draft => ({
      id: draft.id,
      type: draft.draft_type,
      parameters: JSON.parse(draft.parameters),
      content: draft.content,
      created_at: draft.created_at,
      updated_at: draft.updated_at
    }));

    res.json({
      drafts: formattedDrafts,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: formattedDrafts.length
      }
    });
  } catch (error) {
    console.error('Get drafts error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve drafts',
      message: error.message 
    });
  }
});

// Update draft
router.put('/drafts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content, parameters } = req.body;
    
    const draft = db.getDraft(id);
    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    const updates = {};
    if (content) updates.content = content;
    if (parameters) updates.parameters = JSON.stringify(parameters);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    const result = db.updateDocument(id, updates);
    
    res.json({
      message: 'Draft updated successfully',
      changes: result.changes
    });
  } catch (error) {
    console.error('Update draft error:', error);
    res.status(500).json({ 
      error: 'Failed to update draft',
      message: error.message 
    });
  }
});

// Delete draft
router.delete('/drafts/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const draft = db.getDraft(id);
    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    const stmt = db.db.prepare('DELETE FROM document_drafts WHERE id = ?');
    const result = stmt.run(id);
    
    res.json({ 
      message: 'Draft deleted successfully',
      changes: result.changes 
    });
  } catch (error) {
    console.error('Delete draft error:', error);
    res.status(500).json({ 
      error: 'Failed to delete draft',
      message: error.message 
    });
  }
});

// Get draft templates
router.get('/draft-templates', (req, res) => {
  try {
    const templates = [
      {
        type: 'nda',
        name: 'Non-Disclosure Agreement',
        description: 'Generate a comprehensive NDA template',
        required_fields: [
          'effective_date',
          'party_a_name',
          'party_b_name'
        ],
        optional_fields: [
          'confidential_info_description',
          'purpose_of_disclosure',
          'term_duration',
          'governing_law',
          'jurisdiction'
        ]
      },
      {
        type: 'contract',
        name: 'Service Contract',
        description: 'Generate a service contract template',
        required_fields: [
          'effective_date',
          'service_provider',
          'client_name',
          'service_description'
        ],
        optional_fields: [
          'payment_terms',
          'duration',
          'termination_clause',
          'governing_law'
        ]
      },
      {
        type: 'employment',
        name: 'Employment Agreement',
        description: 'Generate an employment agreement template',
        required_fields: [
          'effective_date',
          'employee_name',
          'employer_name',
          'position_title'
        ],
        optional_fields: [
          'salary',
          'benefits',
          'work_schedule',
          'probation_period',
          'termination_terms'
        ]
      }
    ];

    res.json({ templates });
  } catch (error) {
    console.error('Get draft templates error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve draft templates',
      message: error.message 
    });
  }
});

export { router as DraftController };
export default router;