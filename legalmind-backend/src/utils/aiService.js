// Mock AI service for document analysis and generation
// In production, this would integrate with OpenAI, Anthropic, or other AI services

export async function analyzeDocument(text) {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock analysis logic
  const parties = extractParties(text);
  const effectiveDate = extractDate(text);
  const governingLaw = extractGoverningLaw(text);
  const keyTerms = extractKeyTerms(text);
  
  return {
    parties,
    effective_date: effectiveDate,
    governing_law: governingLaw,
    key_terms: keyTerms,
    confidence_score: 0.85,
    analysis_timestamp: new Date().toISOString()
  };
}

export async function summarizeDocument(text, type = 'concise') {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const wordCount = text.split(' ').length;
  let summary = '';
  
  switch (type) {
    case 'concise':
      summary = generateConciseSummary(text);
      break;
    case 'detailed':
      summary = generateDetailedSummary(text);
      break;
    case 'key_points':
      summary = generateKeyPointsSummary(text);
      break;
    default:
      summary = generateConciseSummary(text);
  }
  
  return {
    type,
    summary,
    original_word_count: wordCount,
    summary_word_count: summary.split(' ').length,
    compression_ratio: (summary.split(' ').length / wordCount).toFixed(2),
    generated_at: new Date().toISOString()
  };
}

export async function performLegalResearch(query) {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock research results based on query
  const researchResults = generateResearchResults(query);
  
  return {
    answer: researchResults.answer,
    sources: researchResults.sources,
    confidence_score: researchResults.confidence_score,
    research_timestamp: new Date().toISOString()
  };
}

export async function generateDocumentDraft(type, parameters) {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  switch (type) {
    case 'nda':
      return generateNDA(parameters);
    case 'contract':
      return generateContract(parameters);
    case 'employment':
      return generateEmploymentAgreement(parameters);
    default:
      throw new Error(`Unsupported document type: ${type}`);
  }
}

// Helper functions for document analysis
function extractParties(text) {
  const partyPatterns = [
    /(?:between|among)\s+([^,]+?)\s+(?:and|&)\s+([^,]+?)(?:\s|$)/gi,
    /(?:party\s+a|first\s+party)[:\s]+([^,\n]+)/gi,
    /(?:party\s+b|second\s+party)[:\s]+([^,\n]+)/gi
  ];
  
  const parties = [];
  const foundNames = new Set();
  
  partyPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const name = match[1]?.trim() || match[2]?.trim();
      if (name && !foundNames.has(name.toLowerCase())) {
        parties.push({
          name: name,
          role: parties.length === 0 ? 'Party A' : 'Party B'
        });
        foundNames.add(name.toLowerCase());
      }
    }
  });
  
  return parties.length > 0 ? parties : [
    { name: 'Company A', role: 'Disclosing Party' },
    { name: 'Company B', role: 'Receiving Party' }
  ];
}

function extractDate(text) {
  const datePatterns = [
    /(?:effective\s+date|commencement\s+date)[:\s]+([^,\n]+)/gi,
    /(?:this\s+agreement\s+is\s+effective\s+as\s+of|commencing\s+on)[:\s]+([^,\n]+)/gi,
    /(?:dated|signed\s+on)[:\s]+([^,\n]+)/gi
  ];
  
  for (const pattern of datePatterns) {
    const match = pattern.exec(text);
    if (match) {
      return match[1].trim();
    }
  }
  
  return new Date().toLocaleDateString();
}

function extractGoverningLaw(text) {
  const lawPatterns = [
    /(?:governed\s+by|subject\s+to)[:\s]+([^,\n]+?)(?:\s+law|$)/gi,
    /(?:jurisdiction|venue)[:\s]+([^,\n]+)/gi
  ];
  
  for (const pattern of lawPatterns) {
    const match = pattern.exec(text);
    if (match) {
      return match[1].trim();
    }
  }
  
  return 'State of California';
}

function extractKeyTerms(text) {
  const legalTerms = [
    'confidentiality', 'non-disclosure', 'proprietary', 'intellectual property',
    'termination', 'breach', 'remedies', 'indemnification', 'liability',
    'force majeure', 'governing law', 'jurisdiction', 'arbitration',
    'warranties', 'representations', 'covenants', 'conditions'
  ];
  
  const foundTerms = legalTerms.filter(term => 
    text.toLowerCase().includes(term.toLowerCase())
  );
  
  return foundTerms.length > 0 ? foundTerms : ['confidentiality', 'non-disclosure'];
}

// Helper functions for summarization
function generateConciseSummary(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const keySentences = sentences.slice(0, 3);
  return keySentences.join('. ').trim() + '.';
}

function generateDetailedSummary(text) {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 20);
  const summary = paragraphs.map(p => {
    const sentences = p.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return sentences[0]?.trim() + '.';
  }).join(' ');
  
  return summary || generateConciseSummary(text);
}

function generateKeyPointsSummary(text) {
  const keyPoints = [
    '• Document type and purpose identified',
    '• Key parties and their roles established',
    '• Effective date and duration specified',
    '• Confidentiality obligations outlined',
    '• Termination conditions defined'
  ];
  
  return keyPoints.join('\n');
}

// Helper functions for research
function generateResearchResults(query) {
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes('force majeure')) {
    return {
      answer: 'Force majeure is a legal doctrine that allows parties to a contract to be excused from performance when circumstances beyond their control make performance impossible or impracticable. Common force majeure events include natural disasters, war, government actions, and pandemics. The specific definition and scope of force majeure events should be clearly defined in the contract.',
      sources: ['Black\'s Law Dictionary', 'Uniform Commercial Code', 'Restatement of Contracts'],
      confidence_score: 0.92
    };
  }
  
  if (queryLower.includes('confidentiality') || queryLower.includes('nda')) {
    return {
      answer: 'Confidentiality agreements, also known as Non-Disclosure Agreements (NDAs), are legal contracts that protect sensitive information shared between parties. They typically include definitions of confidential information, obligations of the receiving party, exceptions to confidentiality, duration of the agreement, and remedies for breach. NDAs are essential for protecting trade secrets and proprietary information.',
      sources: ['Trade Secrets Act', 'Uniform Trade Secrets Act', 'Federal Rules of Civil Procedure'],
      confidence_score: 0.89
    };
  }
  
  if (queryLower.includes('contract') && queryLower.includes('termination')) {
    return {
      answer: 'Contract termination clauses specify the conditions under which a contract may be ended. Common termination triggers include material breach, insolvency, change of control, and convenience termination. The clause should specify notice requirements, cure periods, and the consequences of termination, including payment obligations and return of confidential information.',
      sources: ['Restatement of Contracts', 'Uniform Commercial Code', 'Contract Law Principles'],
      confidence_score: 0.87
    };
  }
  
  // Default response
  return {
    answer: `Based on your query about "${query}", this appears to be a legal matter that requires careful consideration of applicable laws and regulations. I recommend consulting with a qualified attorney for specific legal advice tailored to your situation. General legal principles suggest that proper documentation, clear terms, and compliance with relevant laws are essential.`,
    sources: ['General Legal Principles', 'Legal Practice Guidelines'],
    confidence_score: 0.75
  };
}

// Helper functions for document generation
function generateNDA(parameters) {
  const {
    effective_date = 'January 1, 2025',
    party_a_name = 'Company A',
    party_b_name = 'Company B',
    confidential_info_description = 'proprietary information and trade secrets',
    purpose_of_disclosure = 'evaluating a potential business relationship',
    term_duration = 'five (5) years'
  } = parameters;
  
  return `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into on ${effective_date} between ${party_a_name} ("Disclosing Party") and ${party_b_name} ("Receiving Party").

1. CONFIDENTIAL INFORMATION
The Disclosing Party may disclose confidential information including but not limited to: ${confidential_info_description}. The purpose of such disclosure is: ${purpose_of_disclosure}.

2. OBLIGATIONS
The Receiving Party agrees to:
a) Hold all confidential information in strict confidence
b) Use confidential information solely for the stated purpose
c) Not disclose confidential information to third parties
d) Return or destroy confidential information upon request

3. TERM
This Agreement shall remain in effect for ${term_duration} from the effective date.

4. GOVERNING LAW
This Agreement shall be governed by the laws of the State of California.

5. REMEDIES
The parties acknowledge that breach of this Agreement may cause irreparable harm and that monetary damages may be insufficient. The Disclosing Party shall be entitled to seek injunctive relief.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

${party_a_name}                    ${party_b_name}
_________________                  _________________
Signature                         Signature

_________________                  _________________
Print Name                        Print Name

_________________                  _________________
Date                             Date`;
}

function generateContract(parameters) {
  const {
    effective_date = 'January 1, 2025',
    service_provider = 'Service Provider Inc.',
    client_name = 'Client Company LLC',
    service_description = 'consulting services'
  } = parameters;
  
  return `SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into on ${effective_date} between ${service_provider} ("Provider") and ${client_name} ("Client").

1. SERVICES
Provider agrees to provide the following services: ${service_description}.

2. COMPENSATION
Client agrees to pay Provider according to the terms specified in the attached schedule.

3. TERM
This Agreement shall commence on the effective date and continue until completion of services or termination as provided herein.

4. TERMINATION
Either party may terminate this Agreement with thirty (30) days written notice.

5. CONFIDENTIALITY
Both parties agree to maintain the confidentiality of all proprietary information shared during the course of this Agreement.

6. GOVERNING LAW
This Agreement shall be governed by the laws of the State of California.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

${service_provider}               ${client_name}
_________________                 _________________
Signature                        Signature

_________________                 _________________
Print Name                       Print Name

_________________                 _________________
Date                            Date`;
}

function generateEmploymentAgreement(parameters) {
  const {
    effective_date = 'January 1, 2025',
    employee_name = 'John Doe',
    employer_name = 'Company Inc.',
    position_title = 'Software Engineer'
  } = parameters;
  
  return `EMPLOYMENT AGREEMENT

This Employment Agreement ("Agreement") is entered into on ${effective_date} between ${employer_name} ("Employer") and ${employee_name} ("Employee").

1. POSITION
Employee shall serve as ${position_title} and shall perform such duties as may be assigned by Employer.

2. COMPENSATION
Employee shall receive compensation as specified in the attached compensation schedule.

3. TERM
This Agreement shall commence on the effective date and continue until terminated as provided herein.

4. TERMINATION
Either party may terminate this Agreement with notice as specified in the Employee Handbook.

5. CONFIDENTIALITY
Employee agrees to maintain the confidentiality of all proprietary information and trade secrets of Employer.

6. NON-COMPETE
Employee agrees not to compete with Employer for a period of one (1) year following termination.

7. GOVERNING LAW
This Agreement shall be governed by the laws of the State of California.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

${employer_name}                  ${employee_name}
_________________                 _________________
Signature                        Signature

_________________                 _________________
Print Name                       Print Name

_________________                 _________________
Date                            Date`;
}