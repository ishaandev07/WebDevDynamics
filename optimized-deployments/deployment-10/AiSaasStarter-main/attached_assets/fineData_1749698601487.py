# ============================
# ✅ fineData.py (Updated Full)
# ============================
import json

# Load your raw JSON file
with open("customer_support_data.json", "r", encoding="utf-8") as f:
    raw_data = json.load(f)

# Create a clean dataset
cleaned_data = []

for ticket in raw_data:
    complaint_text = ticket.get("complaint_text", "").strip()
    response_text = ticket.get("response_text", "").strip()

    if complaint_text and response_text:
        cleaned_data.append({
            "input": complaint_text,
            "output": response_text
        })

# Save the cleaned data
with open("cleaned_dataset.json", "w", encoding="utf-8") as f:
    json.dump(cleaned_data, f, indent=2, ensure_ascii=False)

print(f"\u2705 Cleaned {len(cleaned_data)} records saved to 'cleaned_dataset.json'")                                    
# This script reads a raw JSON file containing customer support tickets,        
# cleans the data by removing empty complaint and response texts,
# and saves the cleaned data to a new JSON file.
# This script is designed to process customer support ticket data
# and prepare it for further analysis or training machine learning models.
