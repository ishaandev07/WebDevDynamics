# ✅ retrain_index.py (Updated Full)
# ============================
import sqlite3
import faiss
from sentence_transformers import SentenceTransformer
import numpy as np
import pickle
import json
from datasets import load_dataset
# from myconn import get_db
# cleaned_dataset
import os
# ...existing code...
# Step 1: Load feedback
# conn, cursor = get_db()
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
feedback_db_path = os.path.join(ROOT_DIR, "backend", "feedback.db")
conn = sqlite3.connect(feedback_db_path)
cursor = conn.cursor()
cursor.execute("SELECT * FROM feedback")
rows = cursor.fetchall()
columns = [desc[0] for desc in cursor.description]
conn.close()

# Print as table
print("Feedback Table:\n")
row_format = "{:<5}  {:<30}  {:<30}  {:<10}  {:<10}  {:<25}"
print(row_format.format(*columns))
print("-" * 120)
for row in rows:
    print(row_format.format(*[str(x)[:28] for x in row]))
print("\nTotal rows:", len(rows))

# Step 2: Load cleaned dataset
custom_data_path = os.path.join(ROOT_DIR, "data", "cleaned_dataset.json")
with open(custom_data_path, "r", encoding="utf-8") as f:
    custom_data = json.load(f)
    # After loading custom_data
custom_data = [
    {"input": item.get("input", item.get("complaint", "")), "output": item.get("output", item.get("response", ""))}
    for item in custom_data
    if ("input" in item or "complaint" in item) and ("output" in item or "response" in item)
]

# Step 3: Load Hugging Face dataset
hf_dataset = load_dataset("bitext/Bitext-customer-support-llm-chatbot-training-dataset")['train']
hf_data = [
    {"input": item["customer_query"], "output": item["agent_response"]}
    for item in hf_dataset
    if "customer_query" in item and "agent_response" in item
]

# Step 4: Combine all
texts = [row[0] + " " + row[1] for row in rows] + [d["input"] + " " + d["output"] for d in custom_data + hf_data]

# Step 5: Vectorize
model = SentenceTransformer('all-MiniLM-L6-v2')
vectors = model.encode(texts)

# Step 6: Create and save FAISS index
index = faiss.IndexFlatL2(vectors.shape[1])
index.add(np.array(vectors))

faiss_index_path = os.path.join(ROOT_DIR, "data", "free_faiss_index.index")
faiss.write_index(index, faiss_index_path)
feedback_texts_path = os.path.join(ROOT_DIR, "data", "feedback_texts.pkl")
with open(feedback_texts_path, "wb") as f:
    pickle.dump(texts, f)

print("\u2705 FAISS index retrained and saved successfully.")