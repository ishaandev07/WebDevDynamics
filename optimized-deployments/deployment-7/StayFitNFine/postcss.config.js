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
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
} catch (error) {
  console.error('Application initialization error:', error);
  document.body.innerHTML = '<div style="text-align:center;padding:50px;font-family:Arial,sans-serif;"><h2>Application Error</h2><p>Please refresh the page to try again.</p></div>';
}