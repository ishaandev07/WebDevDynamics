// Production JavaScript with enhanced error handling and performance
'use strict';

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  showNotification('An error occurred. Please refresh the page.', 'error');
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  showNotification('A system error occurred.', 'error');
});

// Performance monitoring
const perfObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'navigation') {
      console.log('Page load time:', entry.loadEventEnd - entry.loadEventStart);
    }
  }
});

if ('PerformanceObserver' in window) {
  perfObserver.observe({ entryTypes: ['navigation'] });
}

try {
// StayFitNFine JavaScript Application - Production Optimized

// Enhanced workout data with comprehensive metadata
const workouts = [
    {
        id: 1,
        name: "Morning Cardio Blast",
        duration: "30 mins",
        difficulty: "Intermediate",
        calories: 350,
        category: "Cardio",
        equipment: "None",
        description: "High-intensity cardio workout to kickstart your day",
        exercises: ["Jumping jacks", "High knees", "Burpees", "Mountain climbers"],
        image: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 200'><rect fill='%23667eea' width='400' height='200'/><text x='200' y='100' text-anchor='middle' dy='.35em' fill='white' font-size='20' font-weight='bold'>🏃 Cardio Blast</text></svg>"
    },
    {
        id: 2,
        name: "Strength Training Pro",
        duration: "45 mins",
        difficulty: "Advanced",
        calories: 420,
        category: "Strength",
        equipment: "Dumbbells",
        description: "Build muscle and increase strength with progressive overload",
        exercises: ["Squats", "Deadlifts", "Bench press", "Pull-ups"],
        image: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 200'><rect fill='%23764ba2' width='400' height='200'/><text x='200' y='100' text-anchor='middle' dy='.35em' fill='white' font-size='20' font-weight='bold'>💪 Strength Pro</text></svg>"
    },
    {
        id: 3,
        name: "Mindful Yoga Flow",
        duration: "60 mins",
        difficulty: "Beginner",
        calories: 180,
        category: "Flexibility",
        equipment: "Yoga mat",
        description: "Gentle yoga practice for flexibility and mindfulness",
        exercises: ["Sun salutation", "Warrior poses", "Tree pose", "Savasana"],
        image: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 200'><rect fill='%23ff6b6b' width='400' height='200'/><text x='200' y='100' text-anchor='middle' dy='.35em' fill='white' font-size='20' font-weight='bold'>🧘 Yoga Flow</text></svg>"
    },
    {
        id: 4,
        name: "HIIT Power Session",
        duration: "25 mins",
        difficulty: "Advanced",
        calories: 400,
        category: "HIIT",
        equipment: "Timer",
        description: "Maximum intensity interval training for rapid results",
        exercises: ["Sprint intervals", "Plank variations", "Jump squats", "Push-ups"],
        image: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 200'><rect fill='%23f39c12' width='400' height='200'/><text x='200' y='100' text-anchor='middle' dy='.35em' fill='white' font-size='18' font-weight='bold'>⚡ HIIT Power</text></svg>"
    }
];

// Enhanced user data with persistence
let userData = JSON.parse(localStorage.getItem('stayFitUserData')) || {
    workoutsCompleted: 0,
    totalCaloriesBurned: 0,
    currentStreak: 0,
    totalWorkoutTime: 0,
    favoriteWorkouts: [],
    achievements: [],
    lastWorkoutDate: null,
    joinDate: new Date().toISOString(),
    preferences: {
        difficulty: 'intermediate',
        duration: 30,
        categories: []
    }
};

// Enhanced user preferences
let userPreferences = JSON.parse(localStorage.getItem('stayFitPreferences')) || {
    theme: 'auto',
    notifications: true,
    soundEffects: true,
    autoplay: false,
    units: 'metric'
};

// Active workout state
let activeWorkout = null;
let workoutTimer = null;
let workoutStartTime = null;

// Application initialization with comprehensive setup
function initializeApp() {
    try {
        loadWorkouts();
        updateUserStats();
        setupEventListeners();
        setupServiceWorker();
        setupThemeHandling();
        checkDailyStreak();
        loadAchievements();
        
        // Analytics tracking
        trackEvent('app_initialized', {
            user_type: userData.workoutsCompleted > 0 ? 'returning' : 'new',
            total_workouts: userData.workoutsCompleted
        });
        
        showNotification('Welcome to StayFitNFine! 💪', 'success', 2000);
        
    } catch (error) {
        console.error('App initialization error:', error);
        showNotification('App initialization failed. Please refresh.', 'error');
    }
}

// Enhanced workout loading with filtering and search
function loadWorkouts() {
    try {
        const container = document.getElementById('workout-container');
        if (!container) return;

        container.innerHTML = '';
        
        // Add search and filter controls
        const controlsHTML = `
            <div class="workout-controls" style="margin-bottom: 3rem;">
                <div class="search-container">
                    <input type="search" id="workout-search" placeholder="Search workouts..." 
                           style="padding: 1rem; border: 1px solid var(--border-color); border-radius: 8px; width: 100%; max-width: 300px;">
                </div>
                <div class="filter-container" style="margin-top: 1rem;">
                    <select id="difficulty-filter" style="padding: 0.8rem; margin-right: 1rem; border-radius: 8px;">
                        <option value="">All Difficulties</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                    <select id="category-filter" style="padding: 0.8rem; border-radius: 8px;">
                        <option value="">All Categories</option>
                        <option value="cardio">Cardio</option>
                        <option value="strength">Strength</option>
                        <option value="flexibility">Flexibility</option>
                        <option value="hiit">HIIT</option>
                    </select>
                </div>
            </div>
            <div id="workout-list" class="workout-grid"></div>
        `;
        
        container.innerHTML = controlsHTML;
        
        displayWorkouts(workouts);
        setupWorkoutControls();
        
    } catch (error) {
        console.error('Error loading workouts:', error);
        showNotification('Failed to load workouts', 'error');
    }
}

// Display workouts with enhanced cards
function displayWorkouts(workoutsToShow) {
    const listContainer = document.getElementById('workout-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    
    workoutsToShow.forEach(workout => {
        const isFavorite = userData.favoriteWorkouts.includes(workout.id);
        const workoutCard = document.createElement('div');
        workoutCard.className = 'workout-card';
        workoutCard.setAttribute('data-workout-id', workout.id);
        workoutCard.setAttribute('role', 'button');
        workoutCard.setAttribute('tabindex', '0');
        workoutCard.setAttribute('aria-label', `Start ${workout.name} workout`);
        
        workoutCard.innerHTML = `
            <div class="workout-image-container" style="position: relative;">
                <img src="${workout.image}" alt="${workout.name}" class="workout-image" loading="lazy">
                <button class="favorite-btn" onclick="toggleFavorite(event, ${workout.id})" 
                        style="position: absolute; top: 1rem; right: 1rem; background: rgba(255,255,255,0.9); border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer;"
                        aria-label="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                    ${isFavorite ? '❤️' : '🤍'}
                </button>
                <div class="workout-duration" style="position: absolute; bottom: 1rem; left: 1rem; background: rgba(0,0,0,0.7); color: white; padding: 0.5rem 1rem; border-radius: 20px; font-size: 1.2rem;">
                    ⏱️ ${workout.duration}
                </div>
            </div>
            <div class="workout-content">
                <h3 class="workout-title">${workout.name}</h3>
                <p class="workout-description" style="font-size: 1.4rem; color: var(--text-light); margin-bottom: 1.5rem;">${workout.description}</p>
                <div class="workout-meta">
                    <span class="difficulty ${workout.difficulty.toLowerCase()}">${workout.difficulty}</span>
                    <span class="calories">🔥 ${workout.calories} cal</span>
                </div>
                <div class="workout-details" style="margin: 1.5rem 0; font-size: 1.3rem; color: var(--text-light);">
                    <div>📂 ${workout.category}</div>
                    <div>🏋️ ${workout.equipment}</div>
                </div>
                <div class="workout-exercises" style="margin-bottom: 2rem;">
                    <strong style="font-size: 1.4rem;">Exercises:</strong>
                    <ul style="margin-top: 0.5rem; padding-left: 2rem;">
                        ${workout.exercises.map(ex => `<li style="margin-bottom: 0.3rem;">${ex}</li>`).join('')}
                    </ul>
                </div>
                <button class="start-workout-btn" onclick="selectWorkout(${workout.id})" 
                        style="width: 100%; padding: 1.2rem; background: linear-gradient(45deg, var(--primary-color), var(--secondary-color)); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
                    Start Workout
                </button>
            </div>
        `;
        
        // Enhanced keyboard navigation
        workoutCard.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectWorkout(workout.id);
            }
        });
        
        workoutCard.addEventListener('click', (e) => {
            if (!e.target.closest('.favorite-btn') && !e.target.closest('.start-workout-btn')) {
                selectWorkout(workout.id);
            }
        });
        
        listContainer.appendChild(workoutCard);
    });
}

// Setup workout filtering and search
function setupWorkoutControls() {
    const searchInput = document.getElementById('workout-search');
    const difficultyFilter = document.getElementById('difficulty-filter');
    const categoryFilter = document.getElementById('category-filter');
    
    function filterWorkouts() {
        const searchTerm = searchInput?.value.toLowerCase() || '';
        const difficultyValue = difficultyFilter?.value.toLowerCase() || '';
        const categoryValue = categoryFilter?.value.toLowerCase() || '';
        
        const filteredWorkouts = workouts.filter(workout => {
            const matchesSearch = workout.name.toLowerCase().includes(searchTerm) ||
                                workout.description.toLowerCase().includes(searchTerm) ||
                                workout.exercises.some(ex => ex.toLowerCase().includes(searchTerm));
            const matchesDifficulty = !difficultyValue || workout.difficulty.toLowerCase() === difficultyValue;
            const matchesCategory = !categoryValue || workout.category.toLowerCase() === categoryValue;
            
            return matchesSearch && matchesDifficulty && matchesCategory;
        });
        
        displayWorkouts(filteredWorkouts);
        
        // Show results count
        const resultsText = filteredWorkouts.length === workouts.length 
            ? `Showing all ${workouts.length} workouts`
            : `Showing ${filteredWorkouts.length} of ${workouts.length} workouts`;
        
        let resultsInfo = document.getElementById('results-info');
        if (!resultsInfo) {
            resultsInfo = document.createElement('div');
            resultsInfo.id = 'results-info';
            resultsInfo.style.cssText = 'text-align: center; margin-bottom: 2rem; color: var(--text-light); font-size: 1.4rem;';
            document.getElementById('workout-list').parentNode.insertBefore(resultsInfo, document.getElementById('workout-list'));
        }
        resultsInfo.textContent = resultsText;
    }
    
    // Debounced search
    let searchTimeout;
    searchInput?.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(filterWorkouts, 300);
    });
    
    difficultyFilter?.addEventListener('change', filterWorkouts);
    categoryFilter?.addEventListener('change', filterWorkouts);
}

// Enhanced workout selection with preview
function selectWorkout(workoutId) {
    try {
        const workout = workouts.find(w => w.id === workoutId);
        if (!workout) {
            showNotification('Workout not found', 'error');
            return;
        }
        
        // Show workout preview modal
        showWorkoutPreview(workout);
        
    } catch (error) {
        console.error('Error selecting workout:', error);
        showNotification('Failed to select workout', 'error');
    }
}

// Workout preview modal
function showWorkoutPreview(workout) {
    const modal = document.createElement('div');
    modal.className = 'workout-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div class="modal-content" style="
            background: var(--bg-white);
            border-radius: var(--border-radius);
            padding: 3rem;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            margin: 2rem;
            position: relative;
            transform: scale(0.9);
            transition: transform 0.3s ease;
        ">
            <button class="close-modal" style="
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: none;
                border: none;
                font-size: 2rem;
                cursor: pointer;
                color: var(--text-light);
            " aria-label="Close preview">✕</button>
            
            <h2 style="margin-bottom: 2rem; color: var(--primary-color);">${workout.name}</h2>
            <img src="${workout.image}" alt="${workout.name}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 2rem;">
            
            <div class="workout-preview-details">
                <p style="font-size: 1.6rem; margin-bottom: 2rem; line-height: 1.6;">${workout.description}</p>
                
                <div class="preview-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                    <div style="text-align: center; padding: 1rem; background: var(--bg-light); border-radius: 8px;">
                        <div style="font-size: 2rem; font-weight: bold; color: var(--primary-color);">⏱️</div>
                        <div style="font-size: 1.2rem; color: var(--text-light);">${workout.duration}</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: var(--bg-light); border-radius: 8px;">
                        <div style="font-size: 2rem; font-weight: bold; color: var(--accent-color);">🔥</div>
                        <div style="font-size: 1.2rem; color: var(--text-light);">${workout.calories} cal</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: var(--bg-light); border-radius: 8px;">
                        <div style="font-size: 2rem; font-weight: bold; color: var(--secondary-color);">📈</div>
                        <div style="font-size: 1.2rem; color: var(--text-light);">${workout.difficulty}</div>
                    </div>
                </div>
                
                <div style="margin-bottom: 2rem;">
                    <h4 style="margin-bottom: 1rem; color: var(--text-dark);">Exercises included:</h4>
                    <ul style="columns: 2; gap: 2rem;">
                        ${workout.exercises.map(ex => `<li style="margin-bottom: 0.5rem; break-inside: avoid;">${ex}</li>`).join('')}
                    </ul>
                </div>
                
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button onclick="closeModal()" style="
                        padding: 1.2rem 2.4rem;
                        background: var(--text-light);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                    ">Cancel</button>
                    <button onclick="startSelectedWorkout(${workout.id})" style="
                        padding: 1.2rem 2.4rem;
                        background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                    ">Start Workout</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animate in
    requestAnimationFrame(() => {
        modal.style.opacity = '1';
        modal.querySelector('.modal-content').style.transform = 'scale(1)';
    });
    
    // Close handlers
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    modal.querySelector('.close-modal').addEventListener('click', closeModal);
    
    // Keyboard navigation
    document.addEventListener('keydown', function escapeHandler(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escapeHandler);
        }
    });
    
    // Store modal reference
    window.currentModal = modal;
}

function closeModal() {
    if (window.currentModal) {
        window.currentModal.style.opacity = '0';
        window.currentModal.querySelector('.modal-content').style.transform = 'scale(0.9)';
        setTimeout(() => {
            window.currentModal.remove();
            window.currentModal = null;
        }, 300);
    }
}

// Start selected workout with comprehensive tracking
function startSelectedWorkout(workoutId) {
    try {
        const workout = workouts.find(w => w.id === workoutId);
        if (!workout) return;
        
        closeModal();
        activeWorkout = workout;
        workoutStartTime = Date.now();
        
        showWorkoutProgress(workout);
        trackEvent('workout_started', {
            workout_id: workout.id,
            workout_name: workout.name,
            difficulty: workout.difficulty
        });
        
    } catch (error) {
        console.error('Error starting workout:', error);
        showNotification('Failed to start workout', 'error');
    }
}

// Enhanced workout progress display
function showWorkoutProgress(workout) {
    const progressSection = document.createElement('div');
    progressSection.id = 'workout-progress';
    progressSection.className = 'workout-progress-overlay';
    progressSection.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 999;
        text-align: center;
        padding: 2rem;
    `;
    
    const duration = parseInt(workout.duration);
    let timeRemaining = duration * 60; // Convert to seconds
    
    progressSection.innerHTML = `
        <h2 style="font-size: 3rem; margin-bottom: 2rem;">${workout.name}</h2>
        <div class="progress-circle" style="
            width: 200px;
            height: 200px;
            border: 8px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 3rem;
            position: relative;
        ">
            <div id="timer-display" style="font-size: 3rem; font-weight: bold;">${formatTime(timeRemaining)}</div>
            <svg style="position: absolute; top: -8px; left: -8px; width: 216px; height: 216px; transform: rotate(-90deg);">
                <circle id="progress-ring" cx="108" cy="108" r="100" 
                        stroke="white" stroke-width="8" fill="transparent"
                        stroke-dasharray="628" stroke-dashoffset="628"
                        style="transition: stroke-dashoffset 1s ease;"/>
            </svg>
        </div>
        
        <div class="workout-stats" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; margin-bottom: 3rem; width: 100%; max-width: 400px;">
            <div>
                <div style="font-size: 2rem;">🔥</div>
                <div id="calories-progress">0</div>
                <div style="font-size: 1.2rem; opacity: 0.8;">calories</div>
            </div>
            <div>
                <div style="font-size: 2rem;">💪</div>
                <div id="exercises-progress">0/${workout.exercises.length}</div>
                <div style="font-size: 1.2rem; opacity: 0.8;">exercises</div>
            </div>
            <div>
                <div style="font-size: 2rem;">⚡</div>
                <div id="intensity-progress">High</div>
                <div style="font-size: 1.2rem; opacity: 0.8;">intensity</div>
            </div>
        </div>
        
        <div class="workout-controls" style="display: flex; gap: 2rem;">
            <button onclick="pauseWorkout()" id="pause-btn" style="
                padding: 1.5rem 3rem;
                background: rgba(255,255,255,0.2);
                color: white;
                border: 2px solid white;
                border-radius: 50px;
                font-size: 1.6rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            ">⏸️ Pause</button>
            <button onclick="completeWorkout()" id="complete-btn" style="
                padding: 1.5rem 3rem;
                background: var(--accent-color);
                color: white;
                border: none;
                border-radius: 50px;
                font-size: 1.6rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            ">✅ Complete</button>
        </div>
        
        <button onclick="exitWorkout()" style="
            position: absolute;
            top: 2rem;
            right: 2rem;
            background: rgba(255,255,255,0.2);
            color: white;
            border: none;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            font-size: 2rem;
            cursor: pointer;
        " aria-label="Exit workout">✕</button>
    `;
    
    document.body.appendChild(progressSection);
    
    // Start workout timer
    startWorkoutTimer(timeRemaining);
}

// Workout timer functionality
function startWorkoutTimer(initialTime) {
    let timeRemaining = initialTime;
    const totalTime = initialTime;
    
    workoutTimer = setInterval(() => {
        timeRemaining--;
        
        const timerDisplay = document.getElementById('timer-display');
        const progressRing = document.getElementById('progress-ring');
        const caloriesProgress = document.getElementById('calories-progress');
        
        if (timerDisplay) {
            timerDisplay.textContent = formatTime(timeRemaining);
        }
        
        // Update progress ring
        if (progressRing) {
            const progress = ((totalTime - timeRemaining) / totalTime) * 628;
            progressRing.style.strokeDashoffset = 628 - progress;
        }
        
        // Update calories burned estimate
        if (caloriesProgress && activeWorkout) {
            const caloriesPerSecond = activeWorkout.calories / totalTime;
            const caloriesBurned = Math.floor((totalTime - timeRemaining) * caloriesPerSecond);
            caloriesProgress.textContent = caloriesBurned;
        }
        
        if (timeRemaining <= 0) {
            completeWorkout();
        }
    }, 1000);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function pauseWorkout() {
    if (workoutTimer) {
        clearInterval(workoutTimer);
        workoutTimer = null;
        document.getElementById('pause-btn').innerHTML = '▶️ Resume';
        document.getElementById('pause-btn').setAttribute('onclick', 'resumeWorkout()');
        showNotification('Workout paused', 'info');
    }
}

function resumeWorkout() {
    const timerDisplay = document.getElementById('timer-display');
    if (timerDisplay) {
        const timeText = timerDisplay.textContent;
        const [mins, secs] = timeText.split(':').map(Number);
        const timeRemaining = mins * 60 + secs;
        startWorkoutTimer(timeRemaining);
        document.getElementById('pause-btn').innerHTML = '⏸️ Pause';
        document.getElementById('pause-btn').setAttribute('onclick', 'pauseWorkout()');
        showNotification('Workout resumed', 'success');
    }
}

function exitWorkout() {
    if (confirm('Are you sure you want to exit this workout?')) {
        if (workoutTimer) {
            clearInterval(workoutTimer);
            workoutTimer = null;
        }
        
        const progressOverlay = document.getElementById('workout-progress');
        if (progressOverlay) {
            progressOverlay.remove();
        }
        
        activeWorkout = null;
        workoutStartTime = null;
        showNotification('Workout exited', 'info');
    }
}

// Complete workout with achievements and data persistence
function completeWorkout() {
    try {
        if (workoutTimer) {
            clearInterval(workoutTimer);
            workoutTimer = null;
        }
        
        if (!activeWorkout) return;
        
        // Calculate workout duration
        const workoutDuration = workoutStartTime ? Math.floor((Date.now() - workoutStartTime) / 1000) : 0;
        
        // Update user data
        userData.workoutsCompleted++;
        userData.totalCaloriesBurned += activeWorkout.calories;
        userData.totalWorkoutTime += workoutDuration;
        userData.lastWorkoutDate = new Date().toISOString();
        
        // Update streak
        updateStreak();
        
        // Check for achievements
        checkAchievements();
        
        // Save data
        saveUserData();
        
        // Show completion modal
        showCompletionModal(activeWorkout);
        
        // Analytics
        trackEvent('workout_completed', {
            workout_id: activeWorkout.id,
            workout_name: activeWorkout.name,
            duration: workoutDuration,
            calories: activeWorkout.calories
        });
        
        // Clean up
        const progressOverlay = document.getElementById('workout-progress');
        if (progressOverlay) {
            setTimeout(() => progressOverlay.remove(), 3000);
        }
        
        activeWorkout = null;
        workoutStartTime = null;
        
        // Update stats display
        updateUserStats();
        
    } catch (error) {
        console.error('Error completing workout:', error);
        showNotification('Error saving workout progress', 'error');
    }
}

// Show workout completion modal with celebration
function showCompletionModal(workout) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1001;
        animation: fadeIn 0.5s ease;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            padding: 4rem;
            border-radius: 20px;
            text-align: center;
            max-width: 500px;
            margin: 2rem;
            animation: slideUp 0.5s ease;
        ">
            <div style="font-size: 6rem; margin-bottom: 2rem;">🎉</div>
            <h2 style="color: var(--primary-color); margin-bottom: 1rem;">Workout Complete!</h2>
            <p style="font-size: 1.8rem; margin-bottom: 2rem;">You crushed that ${workout.name}!</p>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; margin-bottom: 3rem;">
                <div style="padding: 1.5rem; background: var(--bg-light); border-radius: 10px;">
                    <div style="font-size: 2.5rem; font-weight: bold; color: var(--accent-color);">🔥 ${workout.calories}</div>
                    <div style="color: var(--text-light);">Calories Burned</div>
                </div>
                <div style="padding: 1.5rem; background: var(--bg-light); border-radius: 10px;">
                    <div style="font-size: 2.5rem; font-weight: bold; color: var(--primary-color);">⏱️ ${workout.duration}</div>
                    <div style="color: var(--text-light);">Duration</div>
                </div>
            </div>
            
            <button onclick="this.parentElement.parentElement.remove()" style="
                padding: 1.5rem 3rem;
                background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
                color: white;
                border: none;
                border-radius: 25px;
                font-size: 1.6rem;
                font-weight: 600;
                cursor: pointer;
            ">Continue</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (modal.parentNode) {
            modal.remove();
        }
    }, 5000);
}

// Update user statistics display
function updateUserStats() {
    try {
        const workoutsElement = document.getElementById('workouts-completed');
        const caloriesElement = document.getElementById('calories-burned');
        const streakElement = document.getElementById('current-streak');
        
        if (workoutsElement) {
            animateNumber(workoutsElement, userData.workoutsCompleted);
        }
        if (caloriesElement) {
            animateNumber(caloriesElement, userData.totalCaloriesBurned);
        }
        if (streakElement) {
            animateNumber(streakElement, userData.currentStreak);
        }
        
    } catch (error) {
        console.error('Error updating user stats:', error);
    }
}

// Animate number changes
function animateNumber(element, targetValue) {
    const currentValue = parseInt(element.textContent) || 0;
    const increment = Math.ceil((targetValue - currentValue) / 20);
    
    if (currentValue < targetValue) {
        element.textContent = Math.min(currentValue + increment, targetValue);
        setTimeout(() => animateNumber(element, targetValue), 50);
    }
}

// Enhanced mobile support
function addMobileSupport() {
    const clickableElements = document.querySelectorAll('button, .clickable, [onclick], .workout-card');
    
    clickableElements.forEach(element => {
        // Add touch feedback
        element.addEventListener('touchstart', function() {
            this.style.opacity = '0.7';
        }, { passive: true });
        
        element.addEventListener('touchend', function() {
            this.style.opacity = '1';
        }, { passive: true });
        
        // Prevent 300ms delay on mobile
        element.addEventListener('touchend', function(e) {
            if (this.onclick) {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Swipe gesture support for workout cards
    let touchStartX = 0;
    let touchStartY = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchmove', (e) => {
        if (!touchStartX || !touchStartY) return;
        
        const touchEndX = e.touches[0].clientX;
        const touchEndY = e.touches[0].clientY;
        
        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;
        
        // Horizontal swipe detection
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            const workoutCard = e.target.closest('.workout-card');
            if (workoutCard) {
                if (diffX > 0) {
                    // Swipe left - quick start
                    const workoutId = parseInt(workoutCard.dataset.workoutId);
                    selectWorkout(workoutId);
                } else {
                    // Swipe right - add to favorites
                    const workoutId = parseInt(workoutCard.dataset.workoutId);
                    toggleFavorite(e, workoutId);
                }
            }
        }
        
        touchStartX = 0;
        touchStartY = 0;
    }, { passive: true });
}

// Enhanced user feedback system
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 12px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
        word-wrap: break-word;
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    const colors = {
        info: '#3498db',
        success: '#2ecc71',
        warning: '#f39c12',
        error: '#e74c3c'
    };
    
    const icons = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    notification.innerHTML = `
        <span style="font-size: 1.2em;">${icons[type] || icons.info}</span>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="
            background: none;
            border: none;
            color: white;
            font-size: 1.5em;
            cursor: pointer;
            margin-left: auto;
            opacity: 0.7;
        ">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
}

// Additional utility functions
function toggleFavorite(event, workoutId) {
    event.stopPropagation();
    
    const index = userData.favoriteWorkouts.indexOf(workoutId);
    if (index > -1) {
        userData.favoriteWorkouts.splice(index, 1);
        showNotification('Removed from favorites', 'info');
    } else {
        userData.favoriteWorkouts.push(workoutId);
        showNotification('Added to favorites', 'success');
    }
    
    saveUserData();
    loadWorkouts(); // Refresh display
}

function updateStreak() {
    const today = new Date().toDateString();
    const lastWorkout = userData.lastWorkoutDate ? new Date(userData.lastWorkoutDate).toDateString() : null;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (lastWorkout === today) {
        // Already worked out today, don't change streak
        return;
    } else if (lastWorkout === yesterday) {
        // Worked out yesterday, continue streak
        userData.currentStreak++;
    } else {
        // Broke streak, start new one
        userData.currentStreak = 1;
    }
}

function checkAchievements() {
    const newAchievements = [];
    
    // First workout
    if (userData.workoutsCompleted === 1 && !userData.achievements.includes('first_workout')) {
        newAchievements.push({ id: 'first_workout', name: 'First Steps', description: 'Completed your first workout!' });
    }
    
    // Milestone workouts
    const milestones = [5, 10, 25, 50, 100];
    milestones.forEach(milestone => {
        const achievementId = `workouts_${milestone}`;
        if (userData.workoutsCompleted >= milestone && !userData.achievements.includes(achievementId)) {
            newAchievements.push({ 
                id: achievementId, 
                name: `${milestone} Workouts`, 
                description: `Completed ${milestone} workouts!` 
            });
        }
    });
    
    // Calorie milestones
    const calorieMilestones = [1000, 5000, 10000];
    calorieMilestones.forEach(milestone => {
        const achievementId = `calories_${milestone}`;
        if (userData.totalCaloriesBurned >= milestone && !userData.achievements.includes(achievementId)) {
            newAchievements.push({ 
                id: achievementId, 
                name: `${milestone} Calories`, 
                description: `Burned ${milestone} calories!` 
            });
        }
    });
    
    // Streak achievements
    const streakMilestones = [3, 7, 14, 30];
    streakMilestones.forEach(milestone => {
        const achievementId = `streak_${milestone}`;
        if (userData.currentStreak >= milestone && !userData.achievements.includes(achievementId)) {
            newAchievements.push({ 
                id: achievementId, 
                name: `${milestone} Day Streak`, 
                description: `Worked out ${milestone} days in a row!` 
            });
        }
    });
    
    // Show new achievements
    newAchievements.forEach(achievement => {
        userData.achievements.push(achievement.id);
        showAchievementNotification(achievement);
    });
}

function showAchievementNotification(achievement) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
        animation: fadeIn 0.5s ease;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            padding: 3rem;
            border-radius: 20px;
            text-align: center;
            max-width: 400px;
            margin: 2rem;
            animation: bounce 0.6s ease;
        ">
            <div style="font-size: 5rem; margin-bottom: 1rem;">🏆</div>
            <h3 style="color: var(--primary-color); margin-bottom: 1rem;">Achievement Unlocked!</h3>
            <h4 style="margin-bottom: 0.5rem;">${achievement.name}</h4>
            <p style="color: var(--text-light); margin-bottom: 2rem;">${achievement.description}</p>
            <button onclick="this.parentElement.parentElement.remove()" style="
                padding: 1rem 2rem;
                background: var(--primary-color);
                color: white;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                font-weight: 600;
            ">Awesome!</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => {
        if (modal.parentNode) {
            modal.remove();
        }
    }, 4000);
}

function checkDailyStreak() {
    const today = new Date().toDateString();
    const lastWorkout = userData.lastWorkoutDate ? new Date(userData.lastWorkoutDate).toDateString() : null;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (lastWorkout && lastWorkout !== today && lastWorkout !== yesterday) {
        // Streak broken
        userData.currentStreak = 0;
        saveUserData();
    }
}

function saveUserData() {
    try {
        localStorage.setItem('stayFitUserData', JSON.stringify(userData));
        localStorage.setItem('stayFitPreferences', JSON.stringify(userPreferences));
    } catch (error) {
        console.error('Failed to save user data:', error);
    }
}

function loadAchievements() {
    // Load and display user achievements
    console.log('Achievements loaded:', userData.achievements);
}

function setupEventListeners() {
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
    
    // Intersection Observer for animations
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('.feature-card, .workout-card, .stat-item').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease';
            observer.observe(el);
        });
    }
}

function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered:', registration))
            .catch(error => console.log('SW registration failed:', error));
    }
}

function setupThemeHandling() {
    // Auto theme detection
    if (userPreferences.theme === 'auto') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addListener(handleThemeChange);
        handleThemeChange(mediaQuery);
    }
}

function handleThemeChange(e) {
    if (e.matches) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

function trackEvent(eventName, properties = {}) {
    // Analytics tracking (placeholder)
    console.log('Event tracked:', eventName, properties);
}

// Data validation utilities
function validateInput(value, type) {
    switch(type) {
        case 'email':
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        case 'phone':
            return /^[\+]?[1-9][\d\s\-\(\)]{7,15}$/.test(value);
        case 'url':
            try { new URL(value); return true; } catch { return false; }
        default:
            return value && value.toString().trim().length > 0;
    }
}

// Initialize mobile support when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addMobileSupport);
} else {
    addMobileSupport();
}

// Initialize the application
document.addEventListener('DOMContentLoaded', initializeApp);

// Expose global functions
window.startWorkout = function() {
    document.getElementById('workouts').scrollIntoView({ behavior: 'smooth' });
    showNotification('Choose a workout below to get started!', 'info');
};

window.selectWorkout = selectWorkout;
window.startSelectedWorkout = startSelectedWorkout;
window.completeWorkout = completeWorkout;
window.toggleFavorite = toggleFavorite;
window.closeModal = closeModal;
window.pauseWorkout = pauseWorkout;
window.resumeWorkout = resumeWorkout;
window.exitWorkout = exitWorkout;

} catch (error) {
  console.error('Application initialization error:', error);
  document.body.innerHTML = '<div style="text-align:center;padding:50px;font-family:Arial,sans-serif;"><h2>Application Error</h2><p>Please refresh the page to try again.</p><button onclick="location.reload()" style="padding:10px 20px;background:#3498db;color:white;border:none;border-radius:5px;cursor:pointer;">Refresh Page</button></div>';
}

// CSS animations
const style = document.createElement('style');
style.textContent = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
  40%, 43% { transform: translate3d(0, -30px, 0); }
  70% { transform: translate3d(0, -15px, 0); }
  90% { transform: translate3d(0, -4px, 0); }
}
`;
document.head.appendChild(style);