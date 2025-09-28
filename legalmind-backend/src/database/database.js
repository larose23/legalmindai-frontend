import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class Database {
  constructor() {
    this.db = null;
    this.dbPath = join(__dirname, '../../data/legalmind.db');
    this.initialized = false;
    this.init();
  }

  async init() {
    try {
      // Ensure data directory exists
      const fs = await import('fs');
      const dataDir = join(__dirname, '../../data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Initialize database
      this.db = new sqlite3.Database(this.dbPath);
      
      // Promisify database methods
      this.run = promisify(this.db.run.bind(this.db));
      this.get = promisify(this.db.get.bind(this.db));
      this.all = promisify(this.db.all.bind(this.db));
      
      await this.createTables();
      this.initialized = true;
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await new Promise((resolve) => {
        const checkInit = () => {
          if (this.initialized) {
            resolve();
          } else {
            setTimeout(checkInit, 10);
          }
        };
        checkInit();
      });
    }
  }

  async createTables() {
    const tables = [
      `CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        document_type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT,
        UNIQUE(title, content)
      )`,
      `CREATE TABLE IF NOT EXISTS document_analysis (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        analysis_type TEXT NOT NULL,
        result TEXT NOT NULL,
        confidence_score REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS legal_research (
        id TEXT PRIMARY KEY,
        query TEXT NOT NULL,
        answer TEXT NOT NULL,
        sources TEXT,
        confidence_score REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(query)
      )`,
      `CREATE TABLE IF NOT EXISTS document_drafts (
        id TEXT PRIMARY KEY,
        draft_type TEXT NOT NULL,
        parameters TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS knowledge_base (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT,
        tags TEXT,
        source TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(title, content)
      )`
    ];

    for (const table of tables) {
      await this.run(table);
    }

    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type)',
      'CREATE INDEX IF NOT EXISTS idx_documents_created ON documents(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_analysis_document ON document_analysis(document_id)',
      'CREATE INDEX IF NOT EXISTS idx_analysis_type ON document_analysis(analysis_type)',
      'CREATE INDEX IF NOT EXISTS idx_research_query ON legal_research(query)',
      'CREATE INDEX IF NOT EXISTS idx_drafts_type ON document_drafts(draft_type)',
      'CREATE INDEX IF NOT EXISTS idx_knowledge_category ON knowledge_base(category)'
    ];

    for (const index of indexes) {
      await this.run(index);
    }
  }

  // Document operations
  async createDocument(title, content, documentType = null, metadata = null) {
    await this.ensureInitialized();
    const id = uuidv4();
    try {
      await this.run(
        `INSERT INTO documents (id, title, content, document_type, metadata)
         VALUES (?, ?, ?, ?, ?)`,
        [id, title, content, documentType, JSON.stringify(metadata)]
      );
      return { id, changes: 1 };
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        // Check if it's a duplicate
        const existing = await this.getDocumentByContent(content);
        if (existing) {
          return { id: existing.id, changes: 0, message: 'Document already exists' };
        }
      }
      throw error;
    }
  }

  async getDocument(id) {
    await this.ensureInitialized();
    return await this.get('SELECT * FROM documents WHERE id = ?', [id]);
  }

  async getDocumentByContent(content) {
    await this.ensureInitialized();
    return await this.get('SELECT * FROM documents WHERE content = ?', [content]);
  }

  async getAllDocuments(limit = 100, offset = 0) {
    await this.ensureInitialized();
    return await this.all(
      `SELECT * FROM documents 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
  }

  async updateDocument(id, updates) {
    await this.ensureInitialized();
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    const result = await this.run(
      `UPDATE documents SET ${fields} WHERE id = ?`,
      [...values, id]
    );
    return result;
  }

  async deleteDocument(id) {
    await this.ensureInitialized();
    return await this.run('DELETE FROM documents WHERE id = ?', [id]);
  }

  // Analysis operations
  async saveAnalysis(documentId, analysisType, result, confidenceScore = null) {
    await this.ensureInitialized();
    const id = uuidv4();
    return await this.run(
      `INSERT INTO document_analysis (id, document_id, analysis_type, result, confidence_score)
       VALUES (?, ?, ?, ?, ?)`,
      [id, documentId, analysisType, JSON.stringify(result), confidenceScore]
    );
  }

  async getAnalysis(documentId, analysisType = null) {
    await this.ensureInitialized();
    let query = 'SELECT * FROM document_analysis WHERE document_id = ?';
    let params = [documentId];
    
    if (analysisType) {
      query += ' AND analysis_type = ?';
      params.push(analysisType);
    }
    
    query += ' ORDER BY created_at DESC';
    return await this.all(query, params);
  }

  // Research operations
  async saveResearch(query, answer, sources = null, confidenceScore = null) {
    await this.ensureInitialized();
    const id = uuidv4();
    return await this.run(
      `INSERT OR REPLACE INTO legal_research (id, query, answer, sources, confidence_score)
       VALUES (?, ?, ?, ?, ?)`,
      [id, query, answer, JSON.stringify(sources), confidenceScore]
    );
  }

  async getResearch(query) {
    await this.ensureInitialized();
    return await this.get('SELECT * FROM legal_research WHERE query = ?', [query]);
  }

  async getAllResearch(limit = 100, offset = 0) {
    await this.ensureInitialized();
    return await this.all(
      `SELECT * FROM legal_research 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
  }

  // Draft operations
  async saveDraft(draftType, parameters, content) {
    await this.ensureInitialized();
    const id = uuidv4();
    return await this.run(
      `INSERT INTO document_drafts (id, draft_type, parameters, content)
       VALUES (?, ?, ?, ?)`,
      [id, draftType, JSON.stringify(parameters), content]
    );
  }

  async getDraft(id) {
    await this.ensureInitialized();
    return await this.get('SELECT * FROM document_drafts WHERE id = ?', [id]);
  }

  async getAllDrafts(draftType = null, limit = 100, offset = 0) {
    await this.ensureInitialized();
    let query = 'SELECT * FROM document_drafts';
    let params = [];
    
    if (draftType) {
      query += ' WHERE draft_type = ?';
      params.push(draftType);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    return await this.all(query, params);
  }

  // Knowledge base operations
  async saveKnowledge(title, content, category = null, tags = null, source = null) {
    await this.ensureInitialized();
    const id = uuidv4();
    return await this.run(
      `INSERT OR REPLACE INTO knowledge_base (id, title, content, category, tags, source)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, title, content, category, JSON.stringify(tags), source]
    );
  }

  async getKnowledge(id) {
    await this.ensureInitialized();
    return await this.get('SELECT * FROM knowledge_base WHERE id = ?', [id]);
  }

  async searchKnowledge(query, category = null, limit = 50) {
    await this.ensureInitialized();
    let sql = `SELECT * FROM knowledge_base 
               WHERE (title LIKE ? OR content LIKE ?)`;
    let params = [`%${query}%`, `%${query}%`];
    
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    
    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);
    
    return await this.all(sql, params);
  }

  async getAllKnowledge(category = null, limit = 100, offset = 0) {
    await this.ensureInitialized();
    let query = 'SELECT * FROM knowledge_base';
    let params = [];
    
    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    return await this.all(query, params);
  }

  // Duplicate detection
  async findDuplicates() {
    await this.ensureInitialized();
    return await this.all(`
      SELECT title, content, COUNT(*) as count
      FROM documents
      GROUP BY title, content
      HAVING COUNT(*) > 1
    `);
  }

  async findDuplicateKnowledge() {
    await this.ensureInitialized();
    return await this.all(`
      SELECT title, content, COUNT(*) as count
      FROM knowledge_base
      GROUP BY title, content
      HAVING COUNT(*) > 1
    `);
  }

  // Cleanup duplicates
  async removeDuplicates() {
    await this.ensureInitialized();
    const duplicates = await this.findDuplicates();
    let removed = 0;
    
    for (const duplicate of duplicates) {
      await this.run(`
        DELETE FROM documents 
        WHERE title = ? AND content = ? 
        AND id NOT IN (
          SELECT id FROM documents 
          WHERE title = ? AND content = ? 
          ORDER BY created_at ASC 
          LIMIT 1
        )
      `, [duplicate.title, duplicate.content, duplicate.title, duplicate.content]);
      removed += duplicate.count - 1; // Keep one, remove the rest
    }
    
    return removed;
  }

  async removeDuplicateKnowledge() {
    await this.ensureInitialized();
    const duplicates = await this.findDuplicateKnowledge();
    let removed = 0;
    
    for (const duplicate of duplicates) {
      await this.run(`
        DELETE FROM knowledge_base 
        WHERE title = ? AND content = ? 
        AND id NOT IN (
          SELECT id FROM knowledge_base 
          WHERE title = ? AND content = ? 
          ORDER BY created_at ASC 
          LIMIT 1
        )
      `, [duplicate.title, duplicate.content, duplicate.title, duplicate.content]);
      removed += duplicate.count - 1; // Keep one, remove the rest
    }
    
    return removed;
  }

  // Database statistics
  async getStats() {
    await this.ensureInitialized();
    const stats = {};
    
    const docCount = await this.get('SELECT COUNT(*) as count FROM documents');
    stats.documents = docCount.count;
    
    const analysisCount = await this.get('SELECT COUNT(*) as count FROM document_analysis');
    stats.analyses = analysisCount.count;
    
    const researchCount = await this.get('SELECT COUNT(*) as count FROM legal_research');
    stats.research = researchCount.count;
    
    const draftCount = await this.get('SELECT COUNT(*) as count FROM document_drafts');
    stats.drafts = draftCount.count;
    
    const knowledgeCount = await this.get('SELECT COUNT(*) as count FROM knowledge_base');
    stats.knowledge = knowledgeCount.count;
    
    return stats;
  }

  isConnected() {
    return this.db !== null && this.initialized;
  }

  close() {
    if (this.db) {
      this.db.close();
      console.log('📊 Database connection closed');
    }
  }
}