// Simple TF-IDF based semantic search implementation
// More reliable than transformer models for this environment

interface VectorSearchResult {
  text: string;
  similarity: number;
  metadata: any;
}

export class VectorSearchEngine {
  private documents: Array<{ tokens: string[]; text: string; metadata: any }> = [];
  private vocabulary: Set<string> = new Set();
  private idfScores: Map<string, number> = new Map();
  private initialized = false;

  constructor() {
    this.initialized = true;
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2);
  }

  private calculateTfIdf(tokens: string[], docLength: number): Map<string, number> {
    const tfIdf = new Map<string, number>();
    const termFreq = new Map<string, number>();
    
    // Calculate term frequency
    for (const token of tokens) {
      termFreq.set(token, (termFreq.get(token) || 0) + 1);
    }
    
    // Calculate TF-IDF
    for (const [term, freq] of termFreq.entries()) {
      const tf = freq / docLength;
      const idf = this.idfScores.get(term) || 0;
      tfIdf.set(term, tf * idf);
    }
    
    return tfIdf;
  }

  private calculateIdf() {
    const docCount = this.documents.length;
    const termDocCount = new Map<string, number>();
    
    // Count documents containing each term
    for (const doc of this.documents) {
      const uniqueTokens = new Set(doc.tokens);
      for (const token of uniqueTokens) {
        termDocCount.set(token, (termDocCount.get(token) || 0) + 1);
      }
    }
    
    // Calculate IDF scores
    for (const [term, count] of termDocCount.entries()) {
      const idf = Math.log(docCount / count);
      this.idfScores.set(term, idf);
    }
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  async addDocuments(documents: Array<{ text: string; metadata: any }>): Promise<void> {
    console.log(`Adding ${documents.length} documents to TF-IDF index...`);
    
    // Tokenize all documents
    for (let i = 0; i < documents.length; i++) {
      const tokens = this.tokenize(documents[i].text);
      this.documents.push({
        tokens,
        text: documents[i].text,
        metadata: documents[i].metadata
      });
      
      // Build vocabulary
      for (const token of tokens) {
        this.vocabulary.add(token);
      }

      // Progress logging for large datasets
      if ((i + 1) % 1000 === 0) {
        console.log(`Processed ${i + 1}/${documents.length} documents`);
      }
    }

    // Calculate IDF scores
    this.calculateIdf();
    
    console.log(`TF-IDF index populated with ${this.documents.length} documents and ${this.vocabulary.size} unique terms`);
  }

  async search(query: string, topK: number = 5): Promise<VectorSearchResult[]> {
    if (this.documents.length === 0) {
      return [];
    }

    try {
      const queryTokens = this.tokenize(query);
      const queryTfIdf = this.calculateTfIdf(queryTokens, queryTokens.length);
      
      const results: VectorSearchResult[] = [];
      
      for (const doc of this.documents) {
        const docTfIdf = this.calculateTfIdf(doc.tokens, doc.tokens.length);
        
        // Calculate cosine similarity between query and document TF-IDF vectors
        const commonTerms = new Set([...queryTfIdf.keys()].filter(term => docTfIdf.has(term)));
        
        if (commonTerms.size === 0) {
          continue;
        }
        
        let dotProduct = 0;
        let queryNorm = 0;
        let docNorm = 0;
        
        for (const term of this.vocabulary) {
          const queryWeight = queryTfIdf.get(term) || 0;
          const docWeight = docTfIdf.get(term) || 0;
          
          dotProduct += queryWeight * docWeight;
          queryNorm += queryWeight * queryWeight;
          docNorm += docWeight * docWeight;
        }
        
        const similarity = dotProduct / (Math.sqrt(queryNorm) * Math.sqrt(docNorm));
        
        if (similarity > 0.1) {
          results.push({
            text: doc.text,
            similarity,
            metadata: doc.metadata
          });
        }
      }

      // Sort by similarity and return top K
      return results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);
    } catch (error) {
      console.error("Error during TF-IDF search:", error);
      return [];
    }
  }

  private async waitForInitialization(maxWait: number = 30000): Promise<void> {
    const startTime = Date.now();
    
    while (!this.initialized && (Date.now() - startTime) < maxWait) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (!this.initialized) {
      throw new Error("Vector search engine failed to initialize within timeout");
    }
  }

  isReady(): boolean {
    return this.initialized && this.documents.length > 0;
  }

  getStoreSize(): number {
    return this.documents.length;
  }

  // Enhanced search with query expansion
  async enhancedSearch(query: string, topK: number = 5): Promise<VectorSearchResult[]> {
    // Try multiple query variations for better matching
    const queryVariations = [
      query,
      query.toLowerCase(),
      query.replace(/[?!.]/g, ''),
      `help with ${query}`,
      `how to ${query}`,
      `issue with ${query}`
    ];

    const allResults: VectorSearchResult[] = [];
    
    for (const variation of queryVariations) {
      try {
        const results = await this.search(variation, topK);
        allResults.push(...results);
      } catch (error) {
        continue;
      }
    }

    // Deduplicate and re-rank results
    const uniqueResults = new Map<string, VectorSearchResult>();
    
    for (const result of allResults) {
      const key = result.text;
      if (!uniqueResults.has(key) || uniqueResults.get(key)!.similarity < result.similarity) {
        uniqueResults.set(key, result);
      }
    }

    return Array.from(uniqueResults.values())
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }
}

// Export singleton instance
export const vectorSearch = new VectorSearchEngine();