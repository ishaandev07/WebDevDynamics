import fs from 'fs';
import path from 'path';
import { vectorSearch } from './vector-search';

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

interface ChatFeedback {
  id: string;
  sessionId: string;
  message: string;
  response: string;
  rating: number; // 1-5 stars
  feedback: string;
  timestamp: Date;
}

export class AdvancedRAGSystem {
  private dataset: DatasetItem[] = [];
  private feedbackData: ChatFeedback[] = [];
  private initialized = false;
  private responseTemplates: { [key: string]: string } = {};

  constructor() {
    this.initializeTemplates();
    this.loadDatasets();
    this.loadFeedback();
  }

  private initializeTemplates() {
    this.responseTemplates = {
      greeting: "Hello! I'm your AI assistant specialized in customer support and technical assistance. How can I help you today?",
      technical: "Based on my knowledge base, here's what I found regarding your technical issue:",
      password_reset: "For password reset requests, here's the recommended process:",
      general_support: "I found relevant information that should help with your inquiry:",
      no_match: "I understand your question, but I don't have specific information about this topic in my current knowledge base. Let me provide some general guidance:",
      multiple_options: "I found several relevant solutions for your query. Here are the most applicable ones:",
      clarification: "To provide you with the most accurate assistance, could you please provide more details about:"
    };
  }

  private async loadDatasets() {
    try {
      console.log("Loading advanced RAG datasets...");
      
      await this.loadMistralDataset();
      await this.loadCustomerSupportDataset();
      await this.loadCustomDatasets();
      
      // Initialize vector search with loaded data
      await this.initializeVectorSearch();
      
      this.initialized = true;
      console.log(`Advanced RAG system initialized with ${this.dataset.length} records`);
    } catch (error) {
      console.error("Error loading RAG datasets:", error);
      this.initialized = false;
    }
  }

  private async initializeVectorSearch() {
    try {
      console.log("Initializing vector search engine...");
      
      const documents = this.dataset.map(item => ({
        text: `${item.input} ${item.output}`,
        metadata: {
          input: item.input,
          output: item.output,
          source: item.source
        }
      }));
      
      await vectorSearch.addDocuments(documents);
      console.log("Vector search engine populated successfully");
    } catch (error) {
      console.error("Error initializing vector search:", error);
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
          continue;
        }
      }
    }
  }

  private async loadCustomerSupportDataset() {
    const filePath = path.join(process.cwd(), 'attached_assets', 'customer_support_data_1749698601485.json');
    
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      if (Array.isArray(data)) {
        const supportData = data.slice(0, 200);
        
        for (const item of supportData) {
          if (item.text && item.label) {
            this.dataset.push({
              input: item.text,
              output: this.generateContextualResponse(item.text, item.label),
              source: 'external_support'
            });
          }
        }
      }
    }
  }

  private async loadCustomDatasets() {
    const customDir = path.join(process.cwd(), 'custom_datasets');
    
    if (fs.existsSync(customDir)) {
      const files = fs.readdirSync(customDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const filePath = path.join(customDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(content);
            
            if (Array.isArray(data)) {
              for (const item of data) {
                if (item.input && item.output) {
                  this.dataset.push({
                    input: item.input,
                    output: item.output,
                    source: `custom_${file.replace('.json', '')}`
                  });
                }
              }
            }
          } catch (error) {
            console.error(`Error loading custom dataset ${file}:`, error);
          }
        }
      }
    }
  }

  private generateContextualResponse(text: string, label: string): string {
    const templates = {
      'complaint': "I understand your concern. This appears to be a complaint regarding: {text}. Let me help you resolve this issue by connecting you with the appropriate support team.",
      'question': "Thank you for your question about: {text}. Based on our knowledge base, here's what I can help you with.",
      'request': "I see you're requesting: {text}. I'll guide you through the process to fulfill this request.",
      'technical': "This seems to be a technical issue: {text}. Let me provide you with troubleshooting steps and relevant solutions.",
      'billing': "I understand you have a billing-related inquiry: {text}. I'll help you resolve this financial matter promptly."
    };
    
    const template = templates[label as keyof typeof templates] || 
                    "I can help you with your inquiry: {text}. Let me provide relevant information.";
    
    return template.replace('{text}', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
  }

  private normalizeText(text: string): string {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private calculateAdvancedSimilarity(query: string, text: string): number {
    const queryNorm = this.normalizeText(query);
    const textNorm = this.normalizeText(text);
    
    const queryWords = queryNorm.split(' ').filter(w => w.length > 2);
    const textWords = textNorm.split(' ').filter(w => w.length > 2);
    
    if (queryWords.length === 0) return 0;
    
    // Enhanced similarity calculation
    let score = 0;
    
    // 1. Exact phrase match
    if (textNorm.includes(queryNorm)) {
      score += 0.5;
    }
    
    // 2. Word overlap with importance weighting
    const queryWordSet = new Set(queryWords);
    const textWordSet = new Set(textWords);
    const intersection = queryWords.filter(word => textWordSet.has(word));
    const jaccard = intersection.length / (queryWordSet.size + textWordSet.size - intersection.length);
    score += jaccard * 0.4;
    
    // 3. Keyword importance boosting
    const importantKeywords = {
      'password': 2.0, 'reset': 1.8, 'login': 1.8, 'account': 1.5,
      'error': 1.7, 'bug': 1.7, 'issue': 1.5, 'problem': 1.5,
      'billing': 2.0, 'payment': 1.8, 'charge': 1.6,
      'help': 1.3, 'support': 1.4, 'assistance': 1.4,
      'how': 1.2, 'what': 1.2, 'why': 1.2, 'when': 1.2
    };
    
    let keywordBoost = 0;
    for (const word of queryWords) {
      const weight = importantKeywords[word as keyof typeof importantKeywords];
      if (weight && textWords.includes(word)) {
        keywordBoost += (weight - 1) * 0.1;
      }
    }
    score += Math.min(keywordBoost, 0.3);
    
    // 4. Semantic proximity (simple heuristic)
    const semanticPairs = [
      ['password', 'reset'], ['login', 'authentication'], ['error', 'bug'],
      ['billing', 'payment'], ['account', 'profile'], ['help', 'support']
    ];
    
    for (const [word1, word2] of semanticPairs) {
      if (queryWords.includes(word1) && textWords.includes(word2) ||
          queryWords.includes(word2) && textWords.includes(word1)) {
        score += 0.1;
      }
    }
    
    return Math.min(1.0, score);
  }

  public async searchSimilar(query: string, topK: number = 5): Promise<SearchResult[]> {
    if (!this.initialized || this.dataset.length === 0) {
      return [];
    }

    // First try vector search for better semantic matching
    try {
      if (vectorSearch.isReady()) {
        const vectorResults = await vectorSearch.enhancedSearch(query, topK);
        
        if (vectorResults.length > 0) {
          return vectorResults.map(result => ({
            input: result.metadata.input,
            output: result.metadata.output,
            similarity: result.similarity,
            source: result.metadata.source
          }));
        }
      }
    } catch (error) {
      console.error("Vector search failed, falling back to keyword search:", error);
    }

    // Fallback to keyword-based search
    const results: SearchResult[] = [];
    
    for (const item of this.dataset) {
      const similarity = this.calculateAdvancedSimilarity(query, item.input);
      
      if (similarity > 0.15) {
        results.push({
          input: item.input,
          output: item.output,
          similarity,
          source: item.source
        });
      }
    }
    
    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, topK);
  }

  private categorizeQuery(query: string): string {
    const queryLower = this.normalizeText(query);
    
    if (queryLower.includes('password') || queryLower.includes('reset') || queryLower.includes('login')) {
      return 'password_reset';
    }
    if (queryLower.includes('error') || queryLower.includes('bug') || queryLower.includes('not working')) {
      return 'technical';
    }
    if (queryLower.includes('hello') || queryLower.includes('hi') || queryLower.includes('hey')) {
      return 'greeting';
    }
    
    return 'general_support';
  }

  private generateAdvancedResponse(query: string, searchResults: SearchResult[]): string {
    const category = this.categorizeQuery(query);
    
    if (searchResults.length === 0) {
      return `I don't have specific information about "${query}" in my current knowledge base. Please provide more details about your issue, or contact our support team for immediate assistance.`;
    }
    
    const bestMatch = searchResults[0];
    
    if (bestMatch.similarity > 0.6) {
      // High confidence - use the dataset response directly
      const cleanResponse = this.refineResponse(bestMatch.output, query, category);
      return `Based on our knowledge base (${Math.round(bestMatch.similarity * 100)}% match from ${bestMatch.source}):\n\n${cleanResponse}`;
    } else if (searchResults.length > 1 && bestMatch.similarity > 0.3) {
      // Multiple relevant options from dataset
      let response = `I found several relevant solutions in our knowledge base:\n\n`;
      
      searchResults.slice(0, 3).forEach((result, index) => {
        const refinedResponse = this.refineResponse(result.output, query, category);
        response += `**Solution ${index + 1}** (${Math.round(result.similarity * 100)}% match from ${result.source}):\n${refinedResponse}\n\n`;
      });
      
      response += "Which solution works best for your situation?";
      return response;
    } else if (bestMatch.similarity > 0.2) {
      // Single moderate match from dataset
      const cleanResponse = this.refineResponse(bestMatch.output, query, category);
      return `Here's the most relevant information I found (${Math.round(bestMatch.similarity * 100)}% match from ${bestMatch.source}):\n\n${cleanResponse}\n\nIf this doesn't fully address your question, please provide more specific details.`;
    } else {
      return `I found some potentially related information in our knowledge base, but it may not be directly applicable to "${query}". Please provide more specific details about your issue for better assistance.`;
    }
  }

  private refineResponse(originalResponse: string, query: string, category: string): string {
    // Clean up the response but preserve more of the original content
    let refined = originalResponse
      .replace(/^Assign Ticket to L1 Resolver Group,/i, '') // Remove ticket assignment prefixes
      .replace(/\\"/g, '"') // Fix escaped quotes
      .replace(/\\\\/g, '') // Remove double backslashes
      .replace(/\\n/g, '\n') // Convert literal \n to actual newlines
      .trim();
    
    // If the refined response is very short or just punctuation, use the original
    if (refined.length < 10 || /^[,\s]*$/.test(refined)) {
      refined = originalResponse.trim();
    }
    
    // Only add minimal context for better responses
    const contextPrefixes: { [key: string]: string } = {
      'password_reset': 'For password reset: ',
      'technical': 'Technical support: ',
      'general_support': '',
      'greeting': ''
    };
    
    const prefix = contextPrefixes[category] || '';
    
    // Make it more conversational without losing the original meaning
    refined = refined
      .replace(/Please provide us/g, 'Please provide')
      .replace(/customer details/g, 'more details')
      .replace(/suitable screenshot/g, 'a screenshot')
      .replace(/to proceed further/g, 'to help you better');
    
    // Only add prefix if the response doesn't already have good context
    if (refined.length > 20 && !refined.toLowerCase().includes('password') && category === 'password_reset') {
      return prefix + refined;
    }
    
    return refined;
  }

  private handleSmallTalk(query: string): string | null {
    const queryLower = query.toLowerCase().trim();
    
    const patterns = {
      greeting: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
      thanks: ['thank you', 'thanks', 'appreciate', 'grateful'],
      goodbye: ['bye', 'goodbye', 'see you', 'farewell', 'take care'],
      status: ['how are you', 'how do you do', 'what\'s up']
    };
    
    for (const [type, keywords] of Object.entries(patterns)) {
      if (keywords.some(keyword => queryLower.includes(keyword))) {
        switch (type) {
          case 'greeting':
            return this.responseTemplates.greeting;
          case 'thanks':
            return "You're welcome! I'm glad I could help. Is there anything else you'd like assistance with?";
          case 'goodbye':
            return "Thank you for using our support system. Have a great day, and don't hesitate to reach out if you need any further assistance!";
          case 'status':
            return "I'm functioning well and ready to help! I have access to our knowledge base and I'm here to assist you with any questions or issues you might have.";
        }
      }
    }
    
    return null;
  }

  public async getAdvancedResponse(query: string, sessionId: string): Promise<{ 
    reply: string; 
    sessionId: string; 
    results?: SearchResult[];
    confidence: number;
    category: string;
  }> {
    try {
      // Handle small talk
      const smallTalkResponse = this.handleSmallTalk(query);
      if (smallTalkResponse) {
        return {
          reply: smallTalkResponse,
          sessionId,
          results: [],
          confidence: 1.0,
          category: 'greeting'
        };
      }

      // Search for similar responses using vector search
      const searchResults = await this.searchSimilar(query, 5);
      const category = this.categorizeQuery(query);
      
      // Generate advanced response
      const response = this.generateAdvancedResponse(query, searchResults);
      
      // Calculate overall confidence
      const confidence = searchResults.length > 0 ? 
        searchResults[0].similarity : 0.1;
      
      return {
        reply: response,
        sessionId,
        results: searchResults,
        confidence,
        category
      };
      
    } catch (error) {
      console.error("Error in advanced RAG processing:", error);
      return {
        reply: "I apologize, but I'm experiencing technical difficulties. Please try rephrasing your question, and if the issue persists, contact our support team for immediate assistance.",
        sessionId,
        results: [],
        confidence: 0,
        category: 'error'
      };
    }
  }

  // Feedback system methods
  public addFeedback(feedback: Omit<ChatFeedback, 'id' | 'timestamp'>): string {
    const feedbackId = `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newFeedback: ChatFeedback = {
      ...feedback,
      id: feedbackId,
      timestamp: new Date()
    };
    
    this.feedbackData.push(newFeedback);
    this.saveFeedback();
    
    return feedbackId;
  }

  private saveFeedback() {
    try {
      const feedbackDir = path.join(process.cwd(), 'feedback_data');
      if (!fs.existsSync(feedbackDir)) {
        fs.mkdirSync(feedbackDir, { recursive: true });
      }
      
      const feedbackFile = path.join(feedbackDir, 'chat_feedback.json');
      fs.writeFileSync(feedbackFile, JSON.stringify(this.feedbackData, null, 2));
    } catch (error) {
      console.error('Error saving feedback:', error);
    }
  }

  private loadFeedback() {
    try {
      const feedbackFile = path.join(process.cwd(), 'feedback_data', 'chat_feedback.json');
      if (fs.existsSync(feedbackFile)) {
        const content = fs.readFileSync(feedbackFile, 'utf-8');
        this.feedbackData = JSON.parse(content);
      }
    } catch (error) {
      console.error('Error loading feedback:', error);
      this.feedbackData = [];
    }
  }

  public getFeedbackStats(): {
    totalFeedback: number;
    averageRating: number;
    positiveCount: number;
    negativeCount: number;
    ratingDistribution: { [key: number]: number };
    recentFeedback: ChatFeedback[];
  } {
    try {
      const total = this.feedbackData.length;
      const avgRating = total > 0 ? 
        this.feedbackData.reduce((sum, fb) => sum + (fb.rating || 0), 0) / total : 0;
      
      const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      let positiveCount = 0;
      let negativeCount = 0;
      
      this.feedbackData.forEach(fb => {
        const rating = fb.rating || 0;
        if (rating >= 1 && rating <= 5) {
          distribution[rating] = (distribution[rating] || 0) + 1;
          if (rating >= 4) positiveCount++;
          if (rating <= 2) negativeCount++;
        }
      });
      
      const recent = this.feedbackData
        .sort((a, b) => {
          const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
          const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
          return bTime - aTime;
        })
        .slice(0, 10);
      
      return {
        totalFeedback: total,
        averageRating: Math.round(avgRating * 10) / 10,
        positiveCount,
        negativeCount,
        ratingDistribution: distribution,
        recentFeedback: recent
      };
    } catch (error) {
      console.error('Error calculating feedback stats:', error);
      return {
        totalFeedback: 0,
        averageRating: 0,
        positiveCount: 0,
        negativeCount: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        recentFeedback: []
      };
    }
  }

  // Dataset management methods
  public addCustomDataset(data: DatasetItem[], name: string): boolean {
    try {
      const customDir = path.join(process.cwd(), 'custom_datasets');
      if (!fs.existsSync(customDir)) {
        fs.mkdirSync(customDir, { recursive: true });
      }
      
      const filename = `${name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
      const filepath = path.join(customDir, filename);
      
      fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
      
      // Add to current dataset
      data.forEach(item => {
        this.dataset.push({
          ...item,
          source: `custom_${name}`
        });
      });
      
      console.log(`Added custom dataset '${name}' with ${data.length} records`);
      return true;
    } catch (error) {
      console.error('Error adding custom dataset:', error);
      return false;
    }
  }

  public getDatasetInfo(): {
    totalRecords: number;
    sourceDistribution: { [key: string]: number };
    isInitialized: boolean;
  } {
    const distribution: { [key: string]: number } = {};
    
    this.dataset.forEach(item => {
      distribution[item.source] = (distribution[item.source] || 0) + 1;
    });
    
    return {
      totalRecords: this.dataset.length,
      sourceDistribution: distribution,
      isInitialized: this.initialized
    };
  }
}

// Create singleton instance
export const advancedRAG = new AdvancedRAGSystem();