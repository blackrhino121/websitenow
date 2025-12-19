/**
 * Tawk.to Async Loader
 * Loads Tawk.to chat widget asynchronously after page render
 * Prevents blocking main thread during initial page load
 */
(function() {
  'use strict';

  // Only load Tawk.to after page has visually rendered
  function loadTawk() {
    if (typeof Tawk_API === 'undefined') {
      // Replace with your actual Tawk.to widget ID
      var Tawk_SRC = 'https://embed.tawk.to/YOUR_PROPERTY_ID/YOUR_WIDGET_ID';
      var s = document.createElement('script');
      s.async = true;
      s.src = Tawk_SRC;
      s.charset = 'UTF-8';
      s.setAttribute('crossorigin', '*');
      var t = document.getElementsByTagName('script')[0];
      t.parentNode.insertBefore(s, t);
    }
  }

  // Load after DOMContentLoaded and a short delay to ensure visual render
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      // Additional delay to ensure page has visually rendered
      setTimeout(loadTawk, 1000);
    });
  } else {
    // DOM already loaded, wait a bit for visual render
    setTimeout(loadTawk, 1000);
  }

  // Optional: Expose openTawkChat function globally
  window.openTawkChat = function() {
    if (typeof Tawk_API !== 'undefined' && Tawk_API.maximize) {
      Tawk_API.maximize();
    } else {
      // If Tawk hasn't loaded yet, queue the action
      setTimeout(function() {
        if (typeof Tawk_API !== 'undefined' && Tawk_API.maximize) {
          Tawk_API.maximize();
        }
      }, 500);
    }
  };
})();

