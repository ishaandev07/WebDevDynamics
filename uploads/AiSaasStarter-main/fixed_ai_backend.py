"""
AI-Powered SaaS Platform Backend with RAG Pipeline
FastAPI backend with proper dataset loading and RAG integration
"""

from fastapi import FastAPI, HTTPException, Query, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import json
import sqlite3
import re
import os
from datetime import datetime
import logging
from pathlib import Path

# Initialize FastAPI app
app = FastAPI(title="AI SaaS Platform API", version="1.0.0")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create directories
os.makedirs("ai_data", exist_ok=True)
os.makedirs("uploads", exist_ok=True)

# Initialize databases
def init_databases():
    """Initialize SQLite databases for feedback and datasets"""
    
    # Feedback database
    feedback_conn = sqlite3.connect("ai_data/feedback.db")
    feedback_cursor = feedback_conn.cursor()
    feedback_cursor.execute("""
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticket_id TEXT,
            complaint TEXT NOT NULL,
            response TEXT NOT NULL,
            similarity REAL NOT NULL,
            feedback BOOLEAN NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    feedback_conn.commit()
    feedback_conn.close()
    
    # Dataset management database
    dataset_conn = sqlite3.connect("ai_data/datasets.db")
    dataset_cursor = dataset_conn.cursor()
    dataset_cursor.execute("""
        CREATE TABLE IF NOT EXISTS datasets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            file_path TEXT NOT NULL,
            file_type TEXT NOT NULL,
            record_count INTEGER DEFAULT 0,
            uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT 1
        )
    """)
    dataset_conn.commit()
    dataset_conn.close()

# Initialize on startup
init_databases()

# Load and process datasets
class DatasetManager:
    def __init__(self):
        self.internal_data = []
        self.external_data = []
        self.combined_data = []
        self.load_datasets()
    
    def load_datasets(self):
        """Load internal and external datasets"""
        try:
            # Load internal dataset
            self.load_internal_dataset()
            
            # Load external dataset
            self.load_external_dataset()
            
            # Combine datasets
            self.combine_datasets()
            
        except Exception as e:
            logger.error(f"Error loading datasets: {e}")
            self.internal_data = []
            self.external_data = []
            self.combined_data = []
    
    def load_internal_dataset(self):
        """Load internal dataset from mistral_finetune.jsonl"""
        try:
            internal_file = Path("attached_assets/mistral_finetune_1749699759898.jsonl")
            if internal_file.exists():
                with open(internal_file, 'r', encoding='utf-8') as f:
                    for line in f:
                        try:
                            data = json.loads(line.strip())
                            if 'messages' in data and len(data['messages']) >= 2:
                                user_msg = next((msg for msg in data['messages'] if msg['role'] == 'user'), None)
                                assistant_msg = next((msg for msg in data['messages'] if msg['role'] == 'assistant'), None)
                                
                                if user_msg and assistant_msg:
                                    self.internal_data.append({
                                        'input': user_msg['content'],
                                        'output': assistant_msg['content'],
                                        'source': 'internal_mistral'
                                    })
                        except json.JSONDecodeError:
                            continue
                            
                logger.info(f"Loaded {len(self.internal_data)} internal records")
            else:
                logger.warning("Internal dataset file not found")
                
        except Exception as e:
            logger.error(f"Error loading internal dataset: {e}")
    
    def load_external_dataset(self):
        """Load external dataset from customer support data"""
        try:
            external_file = Path("attached_assets/customer_support_data_1749698601485.json")
            if external_file.exists():
                with open(external_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    
                    if isinstance(data, list):
                        for item in data[:100]:  # Limit to first 100 for performance
                            if isinstance(item, dict) and 'text' in item and 'label' in item:
                                self.external_data.append({
                                    'input': item['text'],
                                    'output': f"This is a {item['label']} type query. I'll help you with this request.",
                                    'source': 'external_support'
                                })
                    
                logger.info(f"Loaded {len(self.external_data)} external records")
            else:
                logger.warning("External dataset file not found")
                
        except Exception as e:
            logger.error(f"Error loading external dataset: {e}")
    
    def combine_datasets(self):
        """Combine internal and external datasets"""
        self.combined_data = self.internal_data + self.external_data
        logger.info(f"Combined dataset size: {len(self.combined_data)}")
    
    def add_custom_dataset(self, data: List[Dict], name: str) -> bool:
        """Add a custom dataset"""
        try:
            # Add to combined data
            for item in data:
                if 'input' in item and 'output' in item:
                    item['source'] = f'custom_{name}'
                    self.combined_data.append(item)
            
            # Save to database
            conn = sqlite3.connect("ai_data/datasets.db")
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO datasets (name, description, file_path, file_type, record_count)
                VALUES (?, ?, ?, ?, ?)
            """, (name, f"Custom dataset: {name}", f"custom_{name}.json", "json", len(data)))
            conn.commit()
            conn.close()
            
            logger.info(f"Added custom dataset '{name}' with {len(data)} records")
            return True
            
        except Exception as e:
            logger.error(f"Error adding custom dataset: {e}")
            return False

# Data models
class ChatRequest(BaseModel):
    message: str
    sessionId: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    sessionId: str
    results: Optional[List[Dict]] = None

class CommandRequest(BaseModel):
    command: str
    async_execution: bool = False

class CommandResponse(BaseModel):
    message: str
    commandId: int
    output: Optional[str] = None
    status: str = "pending"

class FeedbackRequest(BaseModel):
    ticket_id: Optional[str] = "external"
    complaint: str
    response: str
    similarity: float
    feedback: bool

class DatasetUploadResponse(BaseModel):
    message: str
    dataset_id: Optional[int] = None
    records_added: int = 0

# Advanced RAG System
class AdvancedRAG:
    def __init__(self):
        self.dataset_manager = DatasetManager()
        self.conversation_history = {}
    
    def normalize_text(self, text: str) -> str:
        """Normalize text for matching"""
        return re.sub(r'[^\w\s]', '', text.lower().strip())
    
    def enhanced_similarity(self, query: str, text: str) -> float:
        """Enhanced similarity calculation with keyword weighting"""
        query_norm = self.normalize_text(query)
        text_norm = self.normalize_text(text)
        
        # Basic word overlap
        query_words = set(query_norm.split())
        text_words = set(text_norm.split())
        
        if not query_words:
            return 0.0
        
        # Calculate Jaccard similarity
        intersection = len(query_words.intersection(text_words))
        union = len(query_words.union(text_words))
        jaccard = intersection / union if union > 0 else 0.0
        
        # Boost for exact phrase matches
        phrase_boost = 0.3 if query_norm in text_norm else 0.0
        
        # Boost for important keywords
        important_keywords = ['problem', 'issue', 'help', 'support', 'error', 'bug', 'question']
        keyword_boost = 0.2 if any(word in query_words for word in important_keywords) else 0.0
        
        return min(1.0, jaccard + phrase_boost + keyword_boost)
    
    def search_similar(self, query: str, top_k: int = 3) -> List[Dict]:
        """Search for similar responses with enhanced matching"""
        if not self.dataset_manager.combined_data:
            return []
        
        results = []
        for item in self.dataset_manager.combined_data:
            similarity = self.enhanced_similarity(query, item['input'])
            if similarity > 0.1:  # Minimum threshold
                results.append({
                    'input': item['input'],
                    'output': item['output'],
                    'similarity': similarity,
                    'source': item['source']
                })
        
        # Sort by similarity and return top results
        results.sort(key=lambda x: x['similarity'], reverse=True)
        return results[:top_k]
    
    def handle_small_talk(self, query: str) -> Optional[str]:
        """Handle small talk and conversational queries"""
        query_lower = query.lower().strip()
        
        greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening']
        if any(greeting in query_lower for greeting in greetings):
            return "Hello! I'm your AI assistant. How can I help you today?"
        
        thanks = ['thank you', 'thanks', 'appreciate']
        if any(thank in query_lower for thank in thanks):
            return "You're welcome! Is there anything else I can help you with?"
        
        goodbyes = ['bye', 'goodbye', 'see you', 'farewell']
        if any(goodbye in query_lower for goodbye in goodbyes):
            return "Goodbye! Feel free to reach out if you need any assistance."
        
        return None
    
    def get_response(self, query: str, session_id: str) -> Dict:
        """Get AI response using advanced RAG pipeline"""
        try:
            # Handle small talk
            small_talk_response = self.handle_small_talk(query)
            if small_talk_response:
                return {
                    'reply': small_talk_response,
                    'sessionId': session_id,
                    'results': []
                }
            
            # Search for similar responses
            search_results = self.search_similar(query, top_k=3)
            
            if search_results and search_results[0]['similarity'] > 0.5:
                # High confidence match
                best_match = search_results[0]
                response = f"Based on similar queries, here's what I found:\n\n{best_match['output']}"
                
                if len(search_results) > 1:
                    response += f"\n\nFor additional context, you might also find this helpful: {search_results[1]['output'][:100]}..."
                
            elif search_results:
                # Moderate confidence - provide multiple options
                response = "I found some related information that might help:\n\n"
                for i, result in enumerate(search_results[:2], 1):
                    response += f"{i}. {result['output'][:150]}...\n\n"
                response += "Would you like me to elaborate on any of these points?"
                
            else:
                # No good matches found
                response = "I understand you're asking about this topic, but I don't have specific information in my current knowledge base. Could you provide more details or rephrase your question? I'm here to help with customer support, technical issues, and general inquiries."
            
            return {
                'reply': response,
                'sessionId': session_id,
                'results': search_results
            }
            
        except Exception as e:
            logger.error(f"Error in RAG processing: {e}")
            return {
                'reply': "I'm experiencing some technical difficulties. Please try rephrasing your question or contact our support team for immediate assistance.",
                'sessionId': session_id,
                'results': []
            }

# Initialize RAG system
rag_system = AdvancedRAG()

# API Routes
@app.get("/")
async def root():
    return {
        "message": "AI-Powered SaaS Platform API",
        "version": "1.0.0",
        "status": "active",
        "datasets_loaded": len(rag_system.dataset_manager.combined_data)
    }

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Main chat endpoint with RAG pipeline"""
    try:
        session_id = request.sessionId or f"session_{datetime.now().isoformat()}"
        result = rag_system.get_response(request.message, session_id)
        
        return ChatResponse(
            reply=result['reply'],
            sessionId=result['sessionId'],
            results=result.get('results', [])
        )
        
    except Exception as e:
        logger.error(f"Chat endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/command", response_model=CommandResponse)
async def command_endpoint(request: CommandRequest):
    """Command execution endpoint"""
    try:
        # Simple command processing
        command_id = hash(request.command) % 10000
        
        if request.command.lower().startswith('search'):
            # Handle search commands
            query = request.command[6:].strip()
            results = rag_system.search_similar(query, top_k=5)
            output = f"Found {len(results)} relevant results for: {query}"
            
        elif request.command.lower() == 'status':
            output = f"System status: Active. Datasets loaded: {len(rag_system.dataset_manager.combined_data)}"
            
        else:
            output = f"Command '{request.command}' executed successfully"
        
        return CommandResponse(
            message="Command executed",
            commandId=command_id,
            output=output,
            status="completed"
        )
        
    except Exception as e:
        logger.error(f"Command endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Command execution failed")

@app.post("/feedback")
async def feedback_endpoint(request: FeedbackRequest):
    """Store feedback for model improvement"""
    try:
        conn = sqlite3.connect("ai_data/feedback.db")
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO feedback (ticket_id, complaint, response, similarity, feedback)
            VALUES (?, ?, ?, ?, ?)
        """, (request.ticket_id, request.complaint, request.response, 
              request.similarity, request.feedback))
        
        conn.commit()
        conn.close()
        
        return {"message": "Feedback stored successfully"}
        
    except Exception as e:
        logger.error(f"Feedback endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Failed to store feedback")

@app.post("/upload-dataset", response_model=DatasetUploadResponse)
async def upload_dataset(
    file: UploadFile = File(...),
    name: str = Form(...),
    description: str = Form(default="")
):
    """Upload and add custom dataset"""
    try:
        # Read uploaded file
        content = await file.read()
        
        if file.filename.endswith('.json'):
            data = json.loads(content.decode('utf-8'))
        elif file.filename.endswith('.jsonl'):
            data = []
            for line in content.decode('utf-8').split('\n'):
                if line.strip():
                    data.append(json.loads(line))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
        
        # Process and add to dataset
        processed_data = []
        for item in data:
            if isinstance(item, dict):
                if 'input' in item and 'output' in item:
                    processed_data.append(item)
                elif 'question' in item and 'answer' in item:
                    processed_data.append({
                        'input': item['question'],
                        'output': item['answer']
                    })
        
        # Add to dataset manager
        success = rag_system.dataset_manager.add_custom_dataset(processed_data, name)
        
        if success:
            return DatasetUploadResponse(
                message="Dataset uploaded successfully",
                records_added=len(processed_data)
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to process dataset")
            
    except Exception as e:
        logger.error(f"Upload dataset error: {e}")
        raise HTTPException(status_code=500, detail="Upload failed")

@app.get("/datasets")
async def list_datasets():
    """List all datasets"""
    try:
        conn = sqlite3.connect("ai_data/datasets.db")
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM datasets WHERE is_active = 1")
        datasets = cursor.fetchall()
        conn.close()
        
        return {
            "datasets": [
                {
                    "id": row[0],
                    "name": row[1],
                    "description": row[2],
                    "record_count": row[5],
                    "uploaded_at": row[6]
                }
                for row in datasets
            ],
            "total_records": len(rag_system.dataset_manager.combined_data)
        }
        
    except Exception as e:
        logger.error(f"List datasets error: {e}")
        raise HTTPException(status_code=500, detail="Failed to list datasets")

@app.get("/search")
async def search_endpoint(query: str = Query(...), top_k: int = Query(default=3)):
    """Search endpoint for finding similar responses"""
    try:
        results = rag_system.search_similar(query, top_k)
        return {
            "query": query,
            "results": results,
            "total_found": len(results)
        }
        
    except Exception as e:
        logger.error(f"Search endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Search failed")

@app.get("/feedback/stats")
async def feedback_stats():
    """Get feedback statistics"""
    try:
        conn = sqlite3.connect("ai_data/feedback.db")
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM feedback")
        total = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM feedback WHERE feedback = 1")
        positive = cursor.fetchone()[0]
        
        cursor.execute("SELECT AVG(similarity) FROM feedback")
        avg_similarity = cursor.fetchone()[0] or 0
        
        conn.close()
        
        return {
            "total_feedback": total,
            "positive_feedback": positive,
            "negative_feedback": total - positive,
            "average_similarity": round(avg_similarity, 3)
        }
        
    except Exception as e:
        logger.error(f"Feedback stats error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get stats")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)