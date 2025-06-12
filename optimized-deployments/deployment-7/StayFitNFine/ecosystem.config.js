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
module.exports = {
  apps: [{
    name: 'stayfitfine',
    script: 'server/index.ts',
    cwd: '/var/www/stayfitfine',
    instances: 'max',
    exec_mode: 'cluster',
    interpreter: 'node',
    interpreter_args: '--loader tsx',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/stayfitfine/error.log',
    out_file: '/var/log/stayfitfine/out.log',
    log_file: '/var/log/stayfitfine/combined.log',
    time: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
} catch (error) {
  console.error('Application initialization error:', error);
  document.body.innerHTML = '<div style="text-align:center;padding:50px;font-family:Arial,sans-serif;"><h2>Application Error</h2><p>Please refresh the page to try again.</p></div>';
}