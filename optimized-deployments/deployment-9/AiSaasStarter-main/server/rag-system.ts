import fs from 'fs';
import path from 'path';

interface DatasetItem {
  input: string;
  output: string;
  source: string;
}

interface SearchResult {
  input: string;
  output: string;
  similarity: number;
  source: string;
}

export class RAGSystem {
  private dataset: DatasetItem[] = [];
  private initialized = false;

  constructor() {
    this.loadDatasets();
  }

  private async loadDatasets() {
    try {
      console.log("Loading RAG datasets...");
      
      // Load internal Mistral dataset
      await this.loadMistralDataset();
      
      // Load external customer support dataset
      await this.loadCustomerSupportDataset();
      
      this.initialized = true;
      console.log(`RAG system initialized with ${this.dataset.length} records`);
    } catch (error) {
      console.error("Error loading RAG datasets:", error);
      this.initialized = false;
    }
  }

  private async loadMistralDataset() {
    const filePath = path.join(process.cwd(), 'attached_assets', 'mistral_finetune_1749699759898.jsonl');
    
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.messages && data.messages.length >= 2) {
            const userMsg = data.messages.find((msg: any) => msg.role === 'user');
            const assistantMsg = data.messages.find((msg: any) => msg.role === 'assistant');
            
            if (userMsg && assistantMsg) {
              this.dataset.push({
                input: userMsg.content,
                output: assistantMsg.content,
                source: 'internal_mistral'
              });
            }
          }
        } catch (parseError) {
          // Skip invalid JSON lines
          continue;
        }
      }
      
      console.log(`Loaded ${this.dataset.length} records from Mistral dataset`);
    }
  }

  private async loadCustomerSupportDataset() {
    const filePath = path.join(process.cwd(), 'attached_assets', 'customer_support_data_1749698601485.json');
    
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      if (Array.isArray(data)) {
        const supportData = data.slice(0, 100); // Limit for performance
        
        for (const item of supportData) {
          if (item.text && item.label) {
            this.dataset.push({
              input: item.text,
              output: `This appears to be a ${item.label} type request. Let me help you with this.`,
              source: 'external_support'
            });
          }
        }
        
        console.log(`Added ${supportData.length} records from customer support dataset`);
      }
    }
  }

  private normalizeText(text: string): string {
    return text.toLowerCase().replace(/[^\w\s]/g, '').trim();
  }

  private calculateSimilarity(query: string, text: string): number {
    const queryNorm = this.normalizeText(query);
    const textNorm = this.normalizeText(text);
    
    const queryWords = new Set(queryNorm.split(/\s+/).filter(w => w.length > 0));
    const textWords = new Set(textNorm.split(/\s+/).filter(w => w.length > 0));
    
    if (queryWords.size === 0) return 0;
    
    // Calculate Jaccard similarity
    const queryWordsArray = Array.from(queryWords);
    const textWordsArray = Array.from(textWords);
    const intersection = queryWordsArray.filter(word => textWords.has(word));
    const union = new Set([...queryWordsArray, ...textWordsArray]);
    const jaccard = intersection.length / union.size;
    
    // Boost for exact phrase matches
    const phraseBoost = textNorm.includes(queryNorm) ? 0.3 : 0;
    
    // Boost for important keywords
    const importantKeywords = ['problem', 'issue', 'help', 'support', 'error', 'bug', 'question', 'how', 'what', 'why'];
    const keywordBoost = queryWordsArray.some(word => importantKeywords.includes(word)) ? 0.1 : 0;
    
    return Math.min(1.0, jaccard + phraseBoost + keywordBoost);
  }

  public searchSimilar(query: string, topK: number = 3): SearchResult[] {
    if (!this.initialized || this.dataset.length === 0) {
      return [];
    }

    const results: SearchResult[] = [];
    
    for (const item of this.dataset) {
      const similarity = this.calculateSimilarity(query, item.input);
      
      if (similarity > 0.1) { // Minimum threshold
        results.push({
          input: item.input,
          output: item.output,
          similarity,
          source: item.source
        });
      }
    }
    
    // Sort by similarity and return top results
    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, topK);
  }

  private handleSmallTalk(query: string): string | null {
    const queryLower = query.toLowerCase().trim();
    
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
    if (greetings.some(greeting => queryLower.includes(greeting))) {
      return "Hello! I'm your AI assistant. How can I help you today?";
    }
    
    const thanks = ['thank you', 'thanks', 'appreciate'];
    if (thanks.some(thank => queryLower.includes(thank))) {
      return "You're welcome! Is there anything else I can help you with?";
    }
    
    const goodbyes = ['bye', 'goodbye', 'see you', 'farewell'];
    if (goodbyes.some(goodbye => queryLower.includes(goodbye))) {
      return "Goodbye! Feel free to reach out if you need any assistance.";
    }
    
    return null;
  }

  public getResponse(query: string, sessionId: string): { reply: string; sessionId: string; results?: SearchResult[] } {
    try {
      // Handle small talk
      const smallTalkResponse = this.handleSmallTalk(query);
      if (smallTalkResponse) {
        return {
          reply: smallTalkResponse,
          sessionId,
          results: []
        };
      }

      // Search for similar responses
      const searchResults = this.searchSimilar(query, 3);
      
      let response: string;
      
      if (searchResults.length > 0 && searchResults[0].similarity > 0.5) {
        // High confidence match
        const bestMatch = searchResults[0];
        response = `Based on similar queries, here's what I found:\n\n${bestMatch.output}`;
        
        if (searchResults.length > 1) {
          response += `\n\nFor additional context: ${searchResults[1].output.substring(0, 100)}...`;
        }
      } else if (searchResults.length > 0) {
        // Moderate confidence - provide multiple options
        response = "I found some related information that might help:\n\n";
        
        searchResults.slice(0, 2).forEach((result, index) => {
          response += `${index + 1}. ${result.output.substring(0, 150)}...\n\n`;
        });
        
        response += "Would you like me to elaborate on any of these points?";
      } else {
        // No good matches found
        response = "I understand you're asking about this topic, but I don't have specific information in my current knowledge base. Could you provide more details or rephrase your question? I'm here to help with customer support, technical issues, and general inquiries.";
      }
      
      return {
        reply: response,
        sessionId,
        results: searchResults
      };
      
    } catch (error) {
      console.error("Error in RAG processing:", error);
      return {
        reply: "I'm experiencing some technical difficulties. Please try rephrasing your question or contact our support team for immediate assistance.",
        sessionId,
        results: []
      };
    }
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  public getDatasetSize(): number {
    return this.dataset.length;
  }
}

// Create singleton instance
export const ragSystem = new RAGSystem();