#!/usr/bin/env python3
"""
Simple Flask API server for fitness tracking application
"""

from flask import Flask, jsonify, request, cors
from flask_cors import CORS
import json
import datetime
import os

app = Flask(__name__)
CORS(app)

# Sample data storage (in production, this would be a database)
users = {}
workouts = [
    {
        "id": 1,
        "name": "Morning Cardio",
        "duration": 30,
        "calories": 350,
        "difficulty": "intermediate"
    },
    {
        "id": 2,
        "name": "Strength Training",
        "duration": 45,
        "calories": 420,
        "difficulty": "advanced"
    },
    {
        "id": 3,
        "name": "Yoga Flow",
        "duration": 60,
        "calories": 180,
        "difficulty": "beginner"
    }
]

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.datetime.now().isoformat(),
        "service": "fitness-api",
        "version": "1.0.0"
    })

@app.route('/api/workouts', methods=['GET'])
def get_workouts():
    """Get all available workouts"""
    return jsonify({
        "workouts": workouts,
        "total": len(workouts)
    })

@app.route('/api/workouts/<int:workout_id>', methods=['GET'])
def get_workout(workout_id):
    """Get specific workout by ID"""
    workout = next((w for w in workouts if w["id"] == workout_id), None)
    if not workout:
        return jsonify({"error": "Workout not found"}), 404
    return jsonify(workout)

@app.route('/api/users/<user_id>/stats', methods=['GET'])
def get_user_stats(user_id):
    """Get user fitness statistics"""
    if user_id not in users:
        users[user_id] = {
            "workouts_completed": 0,
            "total_calories": 0,
            "streak_days": 0,
            "joined_date": datetime.datetime.now().isoformat()
        }
    
    return jsonify(users[user_id])

@app.route('/api/users/<user_id>/workouts', methods=['POST'])
def complete_workout(user_id):
    """Record a completed workout for user"""
    data = request.get_json()
    
    if not data or 'workout_id' not in data:
        return jsonify({"error": "Workout ID required"}), 400
    
    workout_id = data['workout_id']
    workout = next((w for w in workouts if w["id"] == workout_id), None)
    
    if not workout:
        return jsonify({"error": "Workout not found"}), 404
    
    # Initialize user if not exists
    if user_id not in users:
        users[user_id] = {
            "workouts_completed": 0,
            "total_calories": 0,
            "streak_days": 0,
            "joined_date": datetime.datetime.now().isoformat()
        }
    
    # Update user stats
    users[user_id]["workouts_completed"] += 1
    users[user_id]["total_calories"] += workout["calories"]
    users[user_id]["streak_days"] += 1
    
    return jsonify({
        "message": f"Workout '{workout['name']}' completed!",
        "calories_burned": workout["calories"],
        "user_stats": users[user_id]
    })

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    """Get fitness leaderboard"""
    leaderboard = []
    for user_id, stats in users.items():
        leaderboard.append({
            "user_id": user_id,
            "workouts_completed": stats["workouts_completed"],
            "total_calories": stats["total_calories"],
            "streak_days": stats["streak_days"]
        })
    
    # Sort by total calories burned
    leaderboard.sort(key=lambda x: x["total_calories"], reverse=True)
    
    return jsonify({
        "leaderboard": leaderboard[:10],  # Top 10
        "total_users": len(users)
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    print(f"Starting Fitness API server on port {port}")
    print(f"Debug mode: {debug}")
    print("Available endpoints:")
    print("  GET  /health - Health check")
    print("  GET  /api/workouts - List all workouts")
    print("  GET  /api/workouts/<id> - Get specific workout")
    print("  GET  /api/users/<id>/stats - Get user statistics")
    print("  POST /api/users/<id>/workouts - Complete a workout")
    print("  GET  /api/leaderboard - Get fitness leaderboard")
    
    app.run(host='0.0.0.0', port=port, debug=debug)