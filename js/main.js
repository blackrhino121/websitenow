/**
 * Rivix Servers - Main JavaScript
 * Modern UX features: Sticky header, scroll progress, smooth scroll
 */

(function() {
  'use strict';

  // ============================================
  // Sticky/Shrink Header
  // ============================================
  const header = document.querySelector('header');
  if (header) {
    let lastScroll = 0;
    const scrollThreshold = 50;

    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

      if (currentScroll > scrollThreshold) {
        header.classList.add('header-scrolled');
      } else {
        header.classList.remove('header-scrolled');
      }

      lastScroll = currentScroll;
    });
  }

  // ============================================
  // Scroll Progress Bar
  // ============================================
  // Create scroll progress bar if it doesn't exist
  if (!document.getElementById('scroll-progress')) {
    const progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress';
    progressBar.className = 'fixed top-0 left-0 h-1 bg-rivix-orange z-[100] transition-all duration-150';
    progressBar.style.width = '0%';
    document.body.appendChild(progressBar);
  }

  const scrollProgress = document.getElementById('scroll-progress');
  if (scrollProgress) {
    window.addEventListener('scroll', () => {
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (window.pageYOffset / windowHeight) * 100;
      scrollProgress.style.width = scrolled + '%';
    });
  }

  // ============================================
  // Smooth Scroll (Native JavaScript)
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      
      // Skip empty hash or just '#'
      if (href === '#' || href === '') {
        return;
      }

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // ============================================
  // Newsletter Subscription
  // ============================================
  window.subscribeNewsletter = async function(email) {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email })
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message || 'Thank you for subscribing!');
        // Clear form if exists
        const emailInput = document.querySelector('input[type="email"]');
        if (emailInput) emailInput.value = '';
      } else {
        alert(data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      alert('Unable to subscribe. Please try again later.');
    }
  };

  // ============================================
  // Pricing Toggle (Monthly / Yearly)
  // ============================================
  var billingCycle = 'monthly';

  window.togglePricing = function(isYearly) {
    billingCycle = isYearly ? 'yearly' : 'monthly';

    try {
      var monthlyEls = document.querySelectorAll('.price-monthly');
      var yearlyEls = document.querySelectorAll('.price-yearly');
      var periodLabels = document.querySelectorAll('.price-period-label');
      var saveBadges = document.querySelectorAll('.save-badge');

      monthlyEls.forEach(function(el) {
        if (isYearly) {
          el.classList.add('hidden');
        } else {
          el.classList.remove('hidden');
        }
      });

      yearlyEls.forEach(function(el) {
        if (isYearly) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      });

      periodLabels.forEach(function(el) {
        el.textContent = isYearly ? 'per year (billed annually)' : 'per month';
      });

      saveBadges.forEach(function(el) {
        if (isYearly) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      });
    } catch (err) {
      console.error('togglePricing error:', err);
    }
  };

  // ============================================
  // Cookie Consent Logic
  // ============================================
  (function() {
    const COOKIE_NAME = 'rivix_consent_given';
    const COOKIE_EXPIRY_DAYS = 365;
    
    // Get cookie value by name
    function getCookie(name) {
      const nameEQ = name + '=';
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        while (cookie.charAt(0) === ' ') cookie = cookie.substring(1, cookie.length);
        if (cookie.indexOf(nameEQ) === 0) return cookie.substring(nameEQ.length, cookie.length);
      }
      return null;
    }
    
    // Set cookie
    function setCookie(name, value, days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      const expires = 'expires=' + date.toUTCString();
      document.cookie = name + '=' + value + ';' + expires + ';path=/;SameSite=Lax';
    }
    
    // Check if consent already given
    function hasConsent() {
      return getCookie(COOKIE_NAME) === 'true';
    }
    
    // Show cookie banner
    function showCookieBanner() {
      const banner = document.getElementById('cookie-consent-banner');
      if (banner) {
        banner.classList.remove('hidden');
        // Add slide-up animation
        setTimeout(() => {
          banner.style.transform = 'translateY(0)';
          banner.style.opacity = '1';
        }, 100);
      }
    }
    
    // Hide cookie banner
    function hideCookieBanner() {
      const banner = document.getElementById('cookie-consent-banner');
      if (banner) {
        banner.style.transform = 'translateY(100%)';
        banner.style.opacity = '0';
        setTimeout(() => {
          banner.classList.add('hidden');
        }, 300);
      }
    }
    
    // Handle accept button click
    function handleAccept() {
      setCookie(COOKIE_NAME, 'true', COOKIE_EXPIRY_DAYS);
      hideCookieBanner();
    }
    
    // Initialize cookie consent on DOM load
    function initCookieConsent() {
      const acceptButton = document.getElementById('cookie-consent-accept');
      const banner = document.getElementById('cookie-consent-banner');
      
      // Style banner for animation
      if (banner) {
        banner.style.transform = 'translateY(100%)';
        banner.style.opacity = '0';
        banner.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
      }
      
      // Show banner if consent not given
      if (!hasConsent() && banner) {
        showCookieBanner();
      }
      
      // Attach event listener
      if (acceptButton) {
        acceptButton.addEventListener('click', handleAccept);
      }
    }
    
    // Run on DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initCookieConsent);
    } else {
      initCookieConsent();
    }
  })();

  // ============================================
  // Initialize on DOM Load
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // Any additional initialization code here
    console.log('Rivix Servers - JavaScript initialized');

    // Wire up pricing toggle without inline handlers (CSP safe)
    try {
      var pricingToggle = document.getElementById('pricing-toggle');
      if (pricingToggle && typeof window.togglePricing === 'function') {
        // Apply initial state
        window.togglePricing(pricingToggle.checked);

        pricingToggle.addEventListener('change', function(e) {
          window.togglePricing(e.target.checked);
        });
      }
    } catch (err) {
      console.error('Error wiring pricing toggle:', err);
    }
  }

})();

