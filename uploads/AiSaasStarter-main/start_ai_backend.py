#!/usr/bin/env python3
"""
Startup script for AI Backend
Simple script to run the FastAPI backend without heavy dependencies
"""

import sys
import subprocess
import os

def install_basic_packages():
    """Install basic packages if needed"""
    packages = [
        "fastapi",
        "uvicorn",
        "pydantic",
        "python-multipart",
        "aiofiles"
    ]
    
    for package in packages:
        try:
            __import__(package.replace("-", "_"))
        except ImportError:
            print(f"Installing {package}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])

def main():
    """Main startup function"""
    print("Starting AI Backend Server...")
    
    # Install packages if needed
    try:
        install_basic_packages()
    except Exception as e:
        print(f"Warning: Could not install packages: {e}")
        print("Attempting to start with available packages...")
    
    # Start the server
    try:
        import uvicorn
        uvicorn.run("ai_backend:app", host="0.0.0.0", port=8000, reload=True)
    except ImportError:
        print("FastAPI/Uvicorn not available. Starting basic HTTP server...")
        # Fallback to basic server
        from http.server import HTTPServer, BaseHTTPRequestHandler
        import json
        from datetime import datetime
        import urllib.parse
        
        class AIHandler(BaseHTTPRequestHandler):
            def do_GET(self):
                if self.path == "/":
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    response = {"message": "AI Backend Basic Server", "status": "active"}
                    self.wfile.write(json.dumps(response).encode())
                elif self.path.startswith("/datasets"):
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    response = {
                        "datasets": [
                            {
                                "id": "internal",
                                "name": "Internal Support Data",
                                "description": "Built-in support dataset",
                                "record_count": 50,
                                "uploaded_at": "Built-in",
                                "is_active": True
                            }
                        ],
                        "total": 1
                    }
                    self.wfile.write(json.dumps(response).encode())
                elif self.path.startswith("/feedback/stats"):
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    response = {
                        "total_feedback": 0,
                        "positive_feedback": 0,
                        "negative_feedback": 0,
                        "positive_rate": 0
                    }
                    self.wfile.write(json.dumps(response).encode())
            
            def do_POST(self):
                if self.path == "/chat":
                    content_length = int(self.headers['Content-Length'])
                    post_data = self.rfile.read(content_length)
                    
                    try:
                        data = json.loads(post_data.decode('utf-8'))
                        message = data.get('message', '')
                        session_id = data.get('sessionId', f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
                        
                        # Simple response logic
                        if any(greeting in message.lower() for greeting in ['hi', 'hello', 'hey']):
                            reply = "Hello! I'm your AI assistant. How can I help you today?"
                        elif 'login' in message.lower():
                            reply = "For login issues, please try resetting your password using the 'Forgot Password' link on the login page."
                        elif 'cancel' in message.lower() and 'subscription' in message.lower():
                            reply = "You can cancel your subscription by going to Account Settings > Billing > Cancel Subscription."
                        elif 'payment' in message.lower():
                            reply = "For payment issues, please check if your card details are correct and have sufficient funds. You can update your payment information in the billing section."
                        else:
                            reply = "Thank you for your message. I'm here to help with any questions about our platform. Could you please provide more details about what you need assistance with?"
                        
                        self.send_response(200)
                        self.send_header('Content-type', 'application/json')
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.end_headers()
                        
                        response = {
                            "reply": reply,
                            "sessionId": session_id,
                            "results": []
                        }
                        self.wfile.write(json.dumps(response).encode())
                        
                    except Exception as e:
                        self.send_response(500)
                        self.send_header('Content-type', 'application/json')
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.end_headers()
                        error_response = {"error": "Internal server error"}
                        self.wfile.write(json.dumps(error_response).encode())
            
            def do_OPTIONS(self):
                self.send_response(200)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type')
                self.end_headers()
            
            def log_message(self, format, *args):
                # Suppress default logging
                pass
        
        server = HTTPServer(('0.0.0.0', 8000), AIHandler)
        print("Basic AI Backend Server running on http://0.0.0.0:8000")
        server.serve_forever()

if __name__ == "__main__":
    main()