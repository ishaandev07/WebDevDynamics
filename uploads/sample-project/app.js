// StayFitNFine JavaScript Application

// Sample workout data
const workouts = [
    {
        id: 1,
        name: "Morning Cardio Blast",
        duration: "30 mins",
        difficulty: "Intermediate",
        calories: 350,
        image: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 200'><rect fill='%23667eea' width='400' height='200'/><text x='200' y='100' text-anchor='middle' dy='.35em' fill='white' font-size='20'>Cardio</text></svg>"
    },
    {
        id: 2,
        name: "Strength Training",
        duration: "45 mins",
        difficulty: "Advanced",
        calories: 420,
        image: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 200'><rect fill='%23764ba2' width='400' height='200'/><text x='200' y='100' text-anchor='middle' dy='.35em' fill='white' font-size='20'>Strength</text></svg>"
    },
    {
        id: 3,
        name: "Yoga Flow",
        duration: "60 mins",
        difficulty: "Beginner",
        calories: 180,
        image: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 200'><rect fill='%23ff6b6b' width='400' height='200'/><text x='200' y='100' text-anchor='middle' dy='.35em' fill='white' font-size='20'>Yoga</text></svg>"
    }
];

// User data
let userData = {
    workoutsCompleted: 0,
    totalCaloriesBurned: 0,
    currentStreak: 0
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadWorkouts();
    updateUserStats();
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Load workouts into the DOM
function loadWorkouts() {
    const workoutList = document.getElementById('workoutList');
    if (!workoutList) return;
    
    workoutList.innerHTML = workouts.map(workout => `
        <div class="workout-card" onclick="selectWorkout(${workout.id})">
            <img src="${workout.image}" alt="${workout.name}">
            <div class="workout-info">
                <h3>${workout.name}</h3>
                <p>Get your heart pumping with this energizing workout session.</p>
                <div class="workout-meta">
                    <span><strong>Duration:</strong> ${workout.duration}</span>
                    <span><strong>Level:</strong> ${workout.difficulty}</span>
                </div>
                <div class="workout-meta">
                    <span><strong>Calories:</strong> ~${workout.calories}</span>
                    <span class="difficulty-badge difficulty-${workout.difficulty.toLowerCase()}">${workout.difficulty}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Start workout function
function startWorkout() {
    showNotification('Welcome to StayFitNFine! Choose a workout to get started.', 'success');
    
    // Scroll to workouts section
    const workoutsSection = document.getElementById('workouts');
    if (workoutsSection) {
        workoutsSection.scrollIntoView({
            behavior: 'smooth'
        });
    }
}

// Select a specific workout
function selectWorkout(workoutId) {
    const workout = workouts.find(w => w.id === workoutId);
    if (!workout) return;
    
    const confirmed = confirm(`Start "${workout.name}"? This ${workout.duration} ${workout.difficulty.toLowerCase()} workout will burn approximately ${workout.calories} calories.`);
    
    if (confirmed) {
        startSelectedWorkout(workout);
    }
}

// Start the selected workout
function startSelectedWorkout(workout) {
    showNotification(`Starting ${workout.name}! Let's get moving!`, 'success');
    
    // Simulate workout completion after 3 seconds (for demo purposes)
    setTimeout(() => {
        completeWorkout(workout);
    }, 3000);
    
    // Update UI to show workout in progress
    showWorkoutProgress(workout);
}

// Show workout progress
function showWorkoutProgress(workout) {
    const progressHtml = `
        <div class="workout-progress">
            <h3>Workout in Progress: ${workout.name}</h3>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <p>Keep going! You're doing great!</p>
        </div>
    `;
    
    // Add progress indicator to the page
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        const progressDiv = document.createElement('div');
        progressDiv.innerHTML = progressHtml;
        progressDiv.className = 'workout-overlay';
        heroContent.appendChild(progressDiv);
        
        // Animate progress bar
        setTimeout(() => {
            const progressFill = document.querySelector('.progress-fill');
            if (progressFill) {
                progressFill.style.width = '100%';
            }
        }, 100);
    }
}

// Complete workout
function completeWorkout(workout) {
    userData.workoutsCompleted++;
    userData.totalCaloriesBurned += workout.calories;
    userData.currentStreak++;
    
    showNotification(`Congratulations! You completed "${workout.name}" and burned ${workout.calories} calories!`, 'success');
    updateUserStats();
    
    // Remove progress indicator
    const overlay = document.querySelector('.workout-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Update user statistics
function updateUserStats() {
    // Create or update stats display
    let statsDiv = document.querySelector('.user-stats');
    if (!statsDiv) {
        statsDiv = document.createElement('div');
        statsDiv.className = 'user-stats';
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.appendChild(statsDiv);
        }
    }
    
    statsDiv.innerHTML = `
        <div class="stats-grid">
            <div class="stat-item">
                <span class="stat-number">${userData.workoutsCompleted}</span>
                <span class="stat-label">Workouts</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${userData.totalCaloriesBurned}</span>
                <span class="stat-label">Calories</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${userData.currentStreak}</span>
                <span class="stat-label">Day Streak</span>
            </div>
        </div>
    `;
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '100px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: 'bold',
        zIndex: '9999',
        maxWidth: '300px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease'
    });
    
    // Set background color based on type
    switch(type) {
        case 'success':
            notification.style.backgroundColor = '#28a745';
            break;
        case 'error':
            notification.style.backgroundColor = '#dc3545';
            break;
        default:
            notification.style.backgroundColor = '#667eea';
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 4000);
}

// Add some CSS for dynamic elements
const style = document.createElement('style');
style.textContent = `
    .user-stats {
        margin-top: 2rem;
        background: rgba(255,255,255,0.1);
        border-radius: 15px;
        padding: 1.5rem;
        backdrop-filter: blur(10px);
    }
    
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
        text-align: center;
    }
    
    .stat-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .stat-number {
        font-size: 2rem;
        font-weight: bold;
        color: #ffd700;
    }
    
    .stat-label {
        font-size: 0.9rem;
        opacity: 0.9;
    }
    
    .workout-progress {
        background: rgba(255,255,255,0.1);
        border-radius: 15px;
        padding: 2rem;
        margin-top: 2rem;
        text-align: center;
        backdrop-filter: blur(10px);
    }
    
    .progress-bar {
        width: 100%;
        height: 8px;
        background: rgba(255,255,255,0.2);
        border-radius: 4px;
        margin: 1rem 0;
        overflow: hidden;
    }
    
    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #ff6b6b, #ffd700);
        width: 0%;
        transition: width 3s ease;
        border-radius: 4px;
    }
    
    .difficulty-badge {
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: bold;
    }
    
    .difficulty-beginner { background: #28a745; color: white; }
    .difficulty-intermediate { background: #ffc107; color: black; }
    .difficulty-advanced { background: #dc3545; color: white; }
`;
document.head.appendChild(style);

// Initialize on page load
console.log('StayFitNFine app initialized successfully!');