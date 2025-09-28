export async function seedSampleData(db) {
  const results = {
    documents_added: 0,
    knowledge_added: 0,
    research_added: 0,
    duplicates_found: 0
  };

  try {
    // Sample legal documents
    const sampleDocuments = [
      {
        title: "Sample NDA - Tech Startup",
        content: `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement is entered into between TechStart Inc. and BetaCorp LLC for the purpose of evaluating a potential partnership.

1. CONFIDENTIAL INFORMATION
TechStart Inc. may disclose proprietary software algorithms, business strategies, and financial information to BetaCorp LLC.

2. OBLIGATIONS
BetaCorp LLC agrees to hold all confidential information in strict confidence and use it solely for evaluation purposes.

3. TERM
This Agreement shall remain in effect for three (3) years from the date of execution.

4. GOVERNING LAW
This Agreement shall be governed by the laws of the State of California.`,
        type: "nda"
      },
      {
        title: "Sample Employment Contract",
        content: `EMPLOYMENT AGREEMENT

This Employment Agreement is entered into between Acme Corporation and Jane Smith for the position of Senior Developer.

1. POSITION
Jane Smith shall serve as Senior Developer and perform software development duties as assigned.

2. COMPENSATION
Jane Smith shall receive an annual salary of $120,000, payable bi-weekly.

3. BENEFITS
Jane Smith shall be eligible for health insurance, dental coverage, and 401(k) matching.

4. TERMINATION
Either party may terminate this Agreement with thirty (30) days written notice.

5. CONFIDENTIALITY
Jane Smith agrees to maintain the confidentiality of all proprietary information.`,
        type: "employment"
      },
      {
        title: "Sample Service Agreement",
        content: `SERVICE AGREEMENT

This Service Agreement is entered into between Legal Services LLC and Client Company for legal consultation services.

1. SERVICES
Legal Services LLC agrees to provide legal consultation and document review services to Client Company.

2. COMPENSATION
Client Company agrees to pay Legal Services LLC at the rate of $300 per hour for all services rendered.

3. TERM
This Agreement shall commence on January 1, 2025, and continue until December 31, 2025.

4. CONFIDENTIALITY
Both parties agree to maintain the confidentiality of all information shared during the course of this Agreement.

5. GOVERNING LAW
This Agreement shall be governed by the laws of the State of New York.`,
        type: "contract"
      }
    ];

    // Add sample documents
    for (const doc of sampleDocuments) {
      try {
        const result = db.createDocument(doc.title, doc.content, doc.type);
        if (result.changes > 0) {
          results.documents_added++;
        } else if (result.message === 'Document already exists') {
          results.duplicates_found++;
        }
      } catch (error) {
        console.warn(`Failed to add document "${doc.title}":`, error.message);
      }
    }

    // Sample knowledge base entries
    const knowledgeEntries = [
      {
        title: "Force Majeure Clauses",
        content: "Force majeure clauses excuse parties from contract performance when circumstances beyond their control make performance impossible or impracticable. Common force majeure events include natural disasters, war, government actions, pandemics, and labor strikes. The clause should clearly define what constitutes a force majeure event and specify the obligations of the parties during such events.",
        category: "contract_law",
        tags: ["force majeure", "contract", "performance", "excuse"],
        source: "Legal Practice Guide"
      },
      {
        title: "Confidentiality Agreement Best Practices",
        content: "Effective confidentiality agreements should include: (1) clear definition of confidential information, (2) specific purpose for disclosure, (3) obligations of the receiving party, (4) exceptions to confidentiality, (5) duration of the agreement, (6) return or destruction of information, and (7) remedies for breach. The agreement should be tailored to the specific circumstances and industry.",
        category: "contract_law",
        tags: ["confidentiality", "nda", "trade secrets", "best practices"],
        source: "Contract Law Handbook"
      },
      {
        title: "Employment Law - At-Will Employment",
        content: "At-will employment means that either the employer or employee can terminate the employment relationship at any time, for any reason, or for no reason at all, as long as the reason is not illegal. Exceptions include termination based on discrimination, retaliation, or violation of public policy. Employment contracts can modify the at-will relationship.",
        category: "employment_law",
        tags: ["employment", "at-will", "termination", "discrimination"],
        source: "Employment Law Guide"
      },
      {
        title: "Intellectual Property Protection",
        content: "Intellectual property can be protected through patents (inventions), trademarks (brands and logos), copyrights (creative works), and trade secrets (confidential business information). Each type of protection has different requirements, duration, and enforcement mechanisms. Proper documentation and registration are essential for effective protection.",
        category: "intellectual_property",
        tags: ["intellectual property", "patents", "trademarks", "copyrights", "trade secrets"],
        source: "IP Law Manual"
      },
      {
        title: "Contract Termination Rights",
        content: "Parties to a contract may have the right to terminate under various circumstances: (1) material breach by the other party, (2) insolvency or bankruptcy, (3) change of control, (4) convenience termination (if specified), and (5) impossibility of performance. Termination clauses should specify notice requirements, cure periods, and consequences of termination.",
        category: "contract_law",
        tags: ["termination", "breach", "contract", "rights"],
        source: "Contract Law Principles"
      }
    ];

    // Add knowledge base entries
    for (const entry of knowledgeEntries) {
      try {
        const result = db.saveKnowledge(
          entry.title,
          entry.content,
          entry.category,
          entry.tags,
          entry.source
        );
        if (result.changes > 0) {
          results.knowledge_added++;
        }
      } catch (error) {
        console.warn(`Failed to add knowledge entry "${entry.title}":`, error.message);
      }
    }

    // Sample legal research queries
    const researchQueries = [
      {
        query: "What is force majeure in contract law?",
        answer: "Force majeure is a legal doctrine that allows parties to a contract to be excused from performance when circumstances beyond their control make performance impossible or impracticable. Common force majeure events include natural disasters, war, government actions, and pandemics. The specific definition and scope of force majeure events should be clearly defined in the contract.",
        sources: ["Black's Law Dictionary", "Uniform Commercial Code", "Restatement of Contracts"],
        confidence_score: 0.92
      },
      {
        query: "How long should a confidentiality agreement last?",
        answer: "The duration of a confidentiality agreement depends on the nature of the information and the business relationship. Typical durations range from 2-5 years, but some agreements may last indefinitely for trade secrets. The duration should be reasonable and necessary to protect the legitimate business interests of the disclosing party.",
        sources: ["Trade Secrets Act", "Confidentiality Law Guide", "Business Law Journal"],
        confidence_score: 0.88
      },
      {
        query: "What are the requirements for a valid employment contract?",
        answer: "A valid employment contract requires: (1) offer and acceptance, (2) consideration (compensation), (3) legal capacity of the parties, (4) lawful purpose, and (5) mutual assent. The contract should clearly specify the terms of employment, including position, compensation, benefits, and termination conditions.",
        sources: ["Employment Law Code", "Labor Relations Act", "Contract Law Principles"],
        confidence_score: 0.90
      }
    ];

    // Add research queries
    for (const research of researchQueries) {
      try {
        const result = db.saveResearch(
          research.query,
          research.answer,
          research.sources,
          research.confidence_score
        );
        if (result.changes > 0) {
          results.research_added++;
        }
      } catch (error) {
        console.warn(`Failed to add research query "${research.query}":`, error.message);
      }
    }

    // Check for duplicates
    const documentDuplicates = db.findDuplicates();
    const knowledgeDuplicates = db.findDuplicateKnowledge();
    results.duplicates_found += documentDuplicates.length + knowledgeDuplicates.length;

    console.log('✅ Sample data seeding completed');
    console.log(`📄 Documents added: ${results.documents_added}`);
    console.log(`📚 Knowledge entries added: ${results.knowledge_added}`);
    console.log(`🔍 Research queries added: ${results.research_added}`);
    console.log(`⚠️ Duplicates found: ${results.duplicates_found}`);

    return results;

  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
    throw error;
  }
}