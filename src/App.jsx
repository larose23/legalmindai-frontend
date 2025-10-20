import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Loader2, FileText, Search, PenTool, Brain } from 'lucide-react'
import './App.css'

const API_BASE = '/api/legalmind'

function App() {
  const [loading, setLoading] = useState(false)
  const [documentText, setDocumentText] = useState('')
  const [analysisResult, setAnalysisResult] = useState(null)
  const [summaryResult, setSummaryResult] = useState(null)
  const [researchQuery, setResearchQuery] = useState('')
  const [researchResult, setResearchResult] = useState(null)
  const [draftParams, setDraftParams] = useState({
    effective_date: '',
    party_a_name: '',
    party_b_name: '',
    confidential_info_description: '',
    purpose_of_disclosure: '',
    term_duration: ''
  })
  const [draftResult, setDraftResult] = useState(null)

  const analyzeDocument = async () => {
    if (!documentText.trim()) {
      alert('Please enter document text to analyze')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/analyze-document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: documentText }),
      })
      
      const data = await response.json()
      setAnalysisResult(data)
    } catch (error) {
      console.error('Error analyzing document:', error)
      alert('Error analyzing document')
    } finally {
      setLoading(false)
    }
  }

  const summarizeDocument = async (type = 'concise') => {
    if (!documentText.trim()) {
      alert('Please enter document text to summarize')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/summarize-document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: documentText, type }),
      })
      
      const data = await response.json()
      setSummaryResult(data)
    } catch (error) {
      console.error('Error summarizing document:', error)
      alert('Error summarizing document')
    } finally {
      setLoading(false)
    }
  }

  const performResearch = async () => {
    if (!researchQuery.trim()) {
      alert('Please enter a research query')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/legal-research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: researchQuery }),
      })
      
      const data = await response.json()
      setResearchResult(data)
    } catch (error) {
      console.error('Error performing research:', error)
      alert('Error performing research')
    } finally {
      setLoading(false)
    }
  }

  const draftDocument = async () => {
    const requiredFields = ['effective_date', 'party_a_name', 'party_b_name']
    const missingFields = requiredFields.filter(field => !draftParams[field].trim())
    
    if (missingFields.length > 0) {
      alert(`Please fill in required fields: ${missingFields.join(', ')}`)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/draft-document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          type: 'nda',
          parameters: draftParams 
        }),
      })
      
      const data = await response.json()
      setDraftResult(data)
    } catch (error) {
      console.error('Error drafting document:', error)
      alert('Error drafting document')
    } finally {
      setLoading(false)
    }
  }

  const ingestSampleData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/ingest-sample-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      alert(data.message || 'Sample data ingested successfully')
    } catch (error) {
      console.error('Error ingesting sample data:', error)
      alert('Error ingesting sample data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="h-10 w-10 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">LegalMind AI</h1>
          </div>
          <p className="text-lg text-gray-600">AI-Powered Legal Assistant for Document Analysis, Research & Drafting</p>
          <div className="mt-4">
            <Button onClick={ingestSampleData} variant="outline" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Load Sample Legal Knowledge
            </Button>
          </div>
        </header>

        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Document Analysis
            </TabsTrigger>
            <TabsTrigger value="research" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Legal Research
            </TabsTrigger>
            <TabsTrigger value="drafting" className="flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              Document Drafting
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Summarization
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Document Analysis</CardTitle>
                <CardDescription>
                  Extract key information from legal documents including parties, dates, clauses, and terms.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="document-text">Document Text</Label>
                  <Textarea
                    id="document-text"
                    placeholder="Paste your legal document text here..."
                    value={documentText}
                    onChange={(e) => setDocumentText(e.target.value)}
                    className="min-h-[200px]"
                  />
                </div>
                <Button onClick={analyzeDocument} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Analyze Document
                </Button>
                
                {analysisResult && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle>Analysis Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analysisResult.error ? (
                        <p className="text-red-600">{analysisResult.error}</p>
                      ) : (
                        <div className="space-y-4">
                          {analysisResult.parties && (
                            <div>
                              <h4 className="font-semibold mb-2">Parties:</h4>
                              <div className="flex flex-wrap gap-2">
                                {analysisResult.parties.map((party, index) => (
                                  <Badge key={index} variant="secondary">
                                    {party.name} ({party.role})
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {analysisResult.effective_date && (
                            <div>
                              <h4 className="font-semibold">Effective Date:</h4>
                              <p>{analysisResult.effective_date}</p>
                            </div>
                          )}
                          
                          {analysisResult.governing_law && (
                            <div>
                              <h4 className="font-semibold">Governing Law:</h4>
                              <p>{analysisResult.governing_law}</p>
                            </div>
                          )}
                          
                          {analysisResult.key_terms && (
                            <div>
                              <h4 className="font-semibold mb-2">Key Terms:</h4>
                              <div className="flex flex-wrap gap-2">
                                {analysisResult.key_terms.map((term, index) => (
                                  <Badge key={index} variant="outline">
                                    {term}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="research" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Legal Research</CardTitle>
                <CardDescription>
                  Ask legal questions and get answers based on the knowledge base using RAG technology.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="research-query">Research Query</Label>
                  <Input
                    id="research-query"
                    placeholder="e.g., What is force majeure in contract law?"
                    value={researchQuery}
                    onChange={(e) => setResearchQuery(e.target.value)}
                  />
                </div>
                <Button onClick={performResearch} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Research
                </Button>
                
                {researchResult && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle>Research Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {researchResult.error ? (
                        <p className="text-red-600">{researchResult.error}</p>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Answer:</h4>
                            <p className="whitespace-pre-wrap">{researchResult.answer}</p>
                          </div>
                          
                          {researchResult.sources && researchResult.sources.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2">Sources:</h4>
                              <div className="flex flex-wrap gap-2">
                                {researchResult.sources.map((source, index) => (
                                  <Badge key={index} variant="secondary">
                                    {source}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="drafting" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Document Drafting - NDA</CardTitle>
                <CardDescription>
                  Generate a Non-Disclosure Agreement by filling in the required parameters.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="effective-date">Effective Date *</Label>
                    <Input
                      id="effective-date"
                      placeholder="e.g., January 1, 2025"
                      value={draftParams.effective_date}
                      onChange={(e) => setDraftParams({...draftParams, effective_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="party-a">Party A Name *</Label>
                    <Input
                      id="party-a"
                      placeholder="e.g., Acme Corporation"
                      value={draftParams.party_a_name}
                      onChange={(e) => setDraftParams({...draftParams, party_a_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="party-b">Party B Name *</Label>
                    <Input
                      id="party-b"
                      placeholder="e.g., Beta LLC"
                      value={draftParams.party_b_name}
                      onChange={(e) => setDraftParams({...draftParams, party_b_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="term-duration">Term Duration</Label>
                    <Input
                      id="term-duration"
                      placeholder="e.g., five (5) years"
                      value={draftParams.term_duration}
                      onChange={(e) => setDraftParams({...draftParams, term_duration: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="confidential-info">Confidential Information Description</Label>
                  <Textarea
                    id="confidential-info"
                    placeholder="e.g., proprietary software algorithms and business strategies"
                    value={draftParams.confidential_info_description}
                    onChange={(e) => setDraftParams({...draftParams, confidential_info_description: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="purpose">Purpose of Disclosure</Label>
                  <Textarea
                    id="purpose"
                    placeholder="e.g., evaluating a potential joint venture"
                    value={draftParams.purpose_of_disclosure}
                    onChange={(e) => setDraftParams({...draftParams, purpose_of_disclosure: e.target.value})}
                  />
                </div>
                
                <Button onClick={draftDocument} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Draft NDA
                </Button>
                
                {draftResult && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle>Generated Document</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {draftResult.error ? (
                        <p className="text-red-600">{draftResult.error}</p>
                      ) : (
                        <div className="space-y-4">
                          <Textarea
                            value={draftResult.draft}
                            readOnly
                            className="min-h-[400px] font-mono text-sm"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Document Summarization</CardTitle>
                <CardDescription>
                  Generate different types of summaries for legal documents.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="summary-text">Document Text</Label>
                  <Textarea
                    id="summary-text"
                    placeholder="Paste your legal document text here..."
                    value={documentText}
                    onChange={(e) => setDocumentText(e.target.value)}
                    className="min-h-[200px]"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={() => summarizeDocument('concise')} disabled={loading} variant="outline">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Concise Summary
                  </Button>
                  <Button onClick={() => summarizeDocument('detailed')} disabled={loading} variant="outline">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Detailed Summary
                  </Button>
                  <Button onClick={() => summarizeDocument('key_points')} disabled={loading} variant="outline">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Key Points
                  </Button>
                </div>
                
                {summaryResult && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle>Summary ({summaryResult.type})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {summaryResult.error ? (
                        <p className="text-red-600">{summaryResult.error}</p>
                      ) : (
                        <p className="whitespace-pre-wrap">{summaryResult.summary}</p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App

