# ============================
# ✅ main.py (Updated Fully Fixed)
# ============================
from fastapi import FastAPI, Query, Request
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import json
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import os
import sys
import re
import sqlite3
from dotenv import load_dotenv
from datasets import load_dataset

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Load environment variables
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(BASE_DIR, ".."))
load_dotenv(os.path.join(BASE_DIR, ".env"))

# Initialize FastAPI
app = FastAPI()

INDEX_PATH = os.path.join(ROOT_DIR, "data", "free_faiss_index.index")
CUSTOM_DATA_PATH = os.path.join(ROOT_DIR, "data", "cleaned_dataset.json")
model = SentenceTransformer('all-MiniLM-L6-v2')
index = faiss.read_index(INDEX_PATH)

# Load all datasets
with open(CUSTOM_DATA_PATH, "r", encoding="utf-8") as f:
    raw_custom_data = json.load(f)

# Normalize custom_data keys to match hf_data
custom_data = [
    {"input": item.get("input", item.get("complaint", "")), "output": item.get("output", item.get("response", ""))}
    for item in raw_custom_data
    if ("input" in item or "complaint" in item) and ("output" in item or "response" in item)
]

# Load HF dataset - Bitext format keys
hf_dataset = load_dataset("bitext/Bitext-customer-support-llm-chatbot-training-dataset")['train']
# ...existing code...
hf_data = [
    {"input": item["customer_query"], "output": item["agent_response"]}
    for item in hf_dataset
    if "customer_query" in item and "agent_response" in item
]
# ...existing code...

# Combine all
data = custom_data + hf_data
complaint_texts = [d["input"] for d in data]
responses = [d["output"] for d in data]

# Define greetings
greetings = {"hi", "hello", "hey", "good morning", "good evening"}

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Feedback(BaseModel):
    ticket_id: Optional[str] = "external"
    complaint: str
    response: str
    similarity: float
    feedback: bool
    timestamp: Optional[str] = datetime.utcnow().isoformat()

SMALL_TALK_RESPONSES = {
    "what is your name": "Hello! I'm AppG, your virtual assistant here to help with support-related queries.",
    "who are you": "I'm AppG, your helpful support assistant.",
    "hi": "Hi there! How can I help you today?",
    "hello": "Hello! I’m AppG. What can I assist you with?",
    "how are you": "I'm just a bot, but I'm always ready to help!"
}

def normalize(text):
    return re.sub(r'[^\w\s]', '', text.lower().strip())

class ChatRequest(BaseModel):
    message: str
    state: str = "initial"

@app.get("/search")
def search_tickets(query: str = Query(...), top_k: int = 3):
    embedding = model.encode([query], convert_to_numpy=True).astype("float32")
    D, I = index.search(embedding, top_k)
    results = []
    for score, idx in zip(D[0], I[0]):
        similarity = 1 / (1 + score)
        results.append({
            "ticket_id": f"external-{idx}",
            "complaint": complaint_texts[idx],
            "response": responses[idx],
            "similarity": round(similarity, 2)
        })
    return {"query": query, "results": results}

@app.post("/chat")
def chat(req: ChatRequest):
    msg = normalize(req.message.strip())
    if req.state == "initial" and msg in SMALL_TALK_RESPONSES:
        return {"reply": SMALL_TALK_RESPONSES[msg], "state": "waiting_for_issue"}
    return process_query(req.message)

def process_query(query):
    embedding = model.encode([query], convert_to_numpy=True).astype("float32")
    D, I = index.search(embedding, 3)
    results = []
    for score, idx in zip(D[0], I[0]):
        similarity = 1 / (1 + score)
        if similarity < 0.5:
            continue
        results.append({
            "ticket_id": f"external-{idx}",
            "complaint": complaint_texts[idx],
            "response": responses[idx],
            "similarity": round(similarity, 2)
        })
    if results:
        return {"reply": f"Here’s what I found:\n\n{results[0]['response']}", "state": "waiting_for_issue", "results": results}
    else:
        return {"reply": "Sorry, I couldn't find a suitable answer.", "state": "waiting_for_issue", "results": []}

@app.post("/feedback")
def receive_feedback(fb: Feedback):
    feedback_path = os.path.join(ROOT_DIR, "data", "feedback_log.json")
    if os.path.exists(feedback_path):
        with open(feedback_path, "r", encoding="utf-8") as f:
            feedback_data = json.load(f)
    else:
        feedback_data = []
    feedback_data.append(fb.model_dump())
    with open(feedback_path, "w", encoding="utf-8") as f:
        json.dump(feedback_data, f, indent=2)
    return {"message": "Feedback received successfully"}

class FeedbackLite(BaseModel):
    complaint: str
    response: str
    similarity: float
    relevant: bool

@app.get("/hello")
def hello(feedback: FeedbackLite):
    return {"message": "Hello, world!"}


@app.post("/feedback_lite")
def store_feedback(feedback: FeedbackLite):
    conn = sqlite3.connect("feedback.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint TEXT,
            response TEXT,
            similarity REAL,
            relevant BOOLEAN,
            timestamp TEXT
        )
    """)
    cursor.execute("""
        INSERT INTO feedback (complaint, response, similarity, relevant, timestamp)
        VALUES (?, ?, ?, ?, ?)
    """, (feedback.complaint, feedback.response, feedback.similarity, feedback.relevant, datetime.now().isoformat()))
    conn.commit()
    conn.close()
    return {"message": "Feedback stored successfully"}

# ...existing code...
@app.post("/retrain")
def retrain_index():
    import subprocess
    import os
    ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    retrain_script = os.path.join(ROOT_DIR, "data", "retrain_index.py")
    result = subprocess.run(
        ["python", retrain_script],
        capture_output=True,
        text=True
    )
    return {
        "message": "Retraining triggered",
        "feedback_table": result.stdout
    }
# ...existing code...
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8090)
# To run the server, use the command:
# uvicorn main:app --reload --host 127.0.0.1 --port 8090