const express = require('express');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env file (optional, for local dev)

const app = express();

// Configuration - Load from environment variables with fallbacks for local development
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const API_KEY_OPENAI = process.env.API_KEY_OPENAI || ''; // For future AI integration
const BILLING_URL = process.env.BILLING_URL || 'https://billing.rivixservers.com';
const TICKET_URL = process.env.TICKET_URL || 'https://billing.rivixservers.com/tickets/create';
const COMPANY_EMAIL = process.env.COMPANY_EMAIL || 'support@rivixservers.com';
const COMPANY_NAME = process.env.COMPANY_NAME || 'Rivix Servers';
const BASE_URL = process.env.BASE_URL || 'https://rivixservers.com';

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Generate CSP Nonce for inline scripts
const crypto = require('crypto');

// Security Headers Middleware with CSP Nonce
app.use((req, res, next) => {
  // Generate unique nonce for this request
  const nonce = crypto.randomBytes(16).toString('base64');
  
  // Store nonce in response locals for use in templates
  res.locals.nonce = nonce;
  
  // HSTS - Force HTTPS
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Content Security Policy with nonce support
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "script-src 'self' 'nonce-" + nonce + "' https://cdn.tailwindcss.com https://unpkg.com/aos@2.3.1/dist/aos.js https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js https://tawk.to/; " +
    "connect-src 'self' wss://*.tawk.to; " +
    "img-src 'self' data: https:; " +
    "frame-src 'self' https://tawk.to/"
  );
  
  // X-Frame-Options
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // X-Content-Type-Options
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // X-XSS-Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
});

// Rate Limiting Middleware
const rateLimitStore = new Map();
const rateLimiter = (req, res, next) => {
  if (req.method === 'POST') {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 5;
    
    if (!rateLimitStore.has(ip)) {
      rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const record = rateLimitStore.get(ip);
    
    if (now > record.resetTime) {
      rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (record.count >= maxRequests) {
      console.log(`[RATE LIMIT] Blocked request from IP: ${ip} - Too many requests`);
      return res.status(429).json({ 
        success: false, 
        message: 'Too many requests. Please try again in a minute.' 
      });
    }
    
    record.count++;
    next();
  } else {
    next();
  }
};

// Cleanup old rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// Middleware
app.use(express.json()); // For API routes
app.use(express.urlencoded({ extended: true })); // For form data
app.use(rateLimiter); // Apply rate limiting

// Serve static files (images, CSS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Global data object - ensures consistency across all templates
const globalData = {
  NODE_ENV: NODE_ENV,
  BASE_URL: BASE_URL,
  trustMetrics: {
    uptime: '99.9%',  // SLA commitment, not historical data
    servers: 'Growing',  // Removed false claim
    latency: '<20ms',  // Realistic target
    support: '24/7',
    rating: null,  // Remove until you have actual reviews
    customers: 'Growing'  // Removed false claim
  },
  company: {
    name: COMPANY_NAME,
    email: COMPANY_EMAIL,
    billingUrl: BILLING_URL,
    ticketUrl: TICKET_URL
  },
  images: {
    logo: '/images/rivix-logo.png',
    logoAlt: '/images/rivix-logo-2.png',
    hero: [
      '/images/random (1).png', // Hero section image
      '/images/random (2).png', // Infrastructure section
      '/images/random (3).png', // Features section
      '/images/random (4).png', // Support section
      '/images/random (5).png', // Support center
      '/images/random (6).png', // Hardware specs
      '/images/random (7).png', // Additional images
      '/images/random (8).png',
      '/images/random (9).png',
      '/images/random (10).png'
    ]
  },
  statusData: {
    overallStatus: 'operational',
    uptime: '99.9%',
    cpuUsage: '25%',
    ramUtilization: '68%',
    networkLatency: '45ms',
    nodes: [
      { id: 'us-east-1', name: 'US East (Vint Hill)', status: 'operational', location: 'Ashburn, VA', load: '22%' },
      { id: 'us-east-2', name: 'US East (New York)', status: 'operational', location: 'New York, NY', load: '18%' },
      { id: 'us-west-1', name: 'US West (Los Angeles)', status: 'operational', location: 'Los Angeles, CA', load: '31%' },
      { id: 'us-east-1', name: 'US East (Ashburn)', status: 'operational', location: 'Ashburn, VA', load: '15%' }
    ],
    incidents: [
      { id: 1, title: 'Minor Network Degradation', date: '2025-11-15', status: 'resolved', description: 'Brief latency spike in US West region. Resolved within 15 minutes.' },
      { id: 2, title: 'Scheduled Maintenance', date: '2025-10-28', status: 'resolved', description: 'Routine hardware upgrade completed successfully.' },
      { id: 3, title: 'DDoS Mitigation', date: '2025-09-12', status: 'resolved', description: 'Automated DDoS protection successfully mitigated attack with zero downtime.' }
    ]
  }
};

// Pricing data
const pricingData = {
  java: [
    { name: 'Dirt Block', memory: '2GB', priceMonthly: 6.99,  priceYearly: 69.99,  popular: false, bestFor: 'Small servers up to 15 players', productId: '1', productUrl: 'https://billing.rivixservers.com/products/minecraft-java-hosting/dirt-block-2gb/checkout?plan=1' },
    { name: 'Grass Block', memory: '4GB', priceMonthly: 9.99,  priceYearly: 99.99,  popular: false, bestFor: 'Small to medium servers up to 25 players', productId: '2', productUrl: 'https://billing.rivixservers.com/products/minecraft-java-hosting/grass-block-4gb/checkout?plan=5' },
    { name: 'Stone Block', memory: '6GB', priceMonthly: 12.99, priceYearly: 129.99, popular: false, bestFor: 'Medium servers up to 35 players', productId: '3', productUrl: 'https://billing.rivixservers.com/products/minecraft-java-hosting/stone-block-6gb/checkout?plan=7' },
    { name: 'Cobblestone', memory: '8GB', priceMonthly: 15.99, priceYearly: 159.99, popular: false, bestFor: 'Medium to large servers up to 50 players', productId: '4', productUrl: 'https://billing.rivixservers.com/products/minecraft-java-hosting/cobblestone-8gb/checkout?plan=10' },
    { name: 'Iron Block', memory: '12GB', priceMonthly: 22.99, priceYearly: 229.99, popular: false, bestFor: 'Large servers up to 75 players', productId: '5', productUrl: 'https://billing.rivixservers.com/products/minecraft-java-hosting/iron-block-12gb/checkout?plan=12' },
    { name: 'Gold Block', memory: '16GB', priceMonthly: 29.99, priceYearly: 299.99, popular: true,  bestFor: 'Large servers up to 100 players', productId: '6', productUrl: 'https://billing.rivixservers.com/products/minecraft-java-hosting/gold-block-16gb/checkout?plan=14' },
    { name: 'Diamond Block', memory: '24GB', priceMonthly: 44.99, priceYearly: 449.99, popular: false, bestFor: 'Enterprise servers up to 150 players', productId: '7', productUrl: 'https://billing.rivixservers.com/products/minecraft-java-hosting/diamond-block-24gb/checkout?plan=16' },
    { name: 'Netherite Block', memory: '32GB', priceMonthly: 64.99, priceYearly: 649.99, popular: false, bestFor: 'Enterprise servers up to 200+ players', productId: '8', productUrl: 'https://billing.rivixservers.com/products/minecraft-java-hosting/netherite-block-32gb/checkout?plan=18' }
  ],
  bedrock: [
    { name: 'Bedrock', memory: '2GB',  priceMonthly: 3.99,  priceYearly: 39.99,  popular: false, bestFor: 'Small servers up to 15 players', productId: '10', productUrl: 'https://billing.rivixservers.com/products/minecraft-bedrock-hosting/bedrock-2gb/checkout?plan=20' },
    { name: 'Bedrock', memory: '4GB',  priceMonthly: 7.99,  priceYearly: 79.99,  popular: false, bestFor: 'Small to medium servers up to 25 players', productId: '11', productUrl: 'https://billing.rivixservers.com/products/minecraft-bedrock-hosting/bedrock-4gb/checkout?plan=22' },
    { name: 'Bedrock', memory: '6GB',  priceMonthly: 10.99, priceYearly: 109.99, popular: false, bestFor: 'Medium servers up to 35 players', productId: '12', productUrl: 'https://billing.rivixservers.com/products/minecraft-bedrock-hosting/bedrock-6gb/checkout?plan=24' },
    { name: 'Bedrock', memory: '8GB',  priceMonthly: 13.99, priceYearly: 139.99, popular: false, bestFor: 'Medium to large servers up to 50 players', productId: '13', productUrl: 'https://billing.rivixservers.com/products/minecraft-bedrock-hosting/bedrock-8gb/checkout?plan=26' },
    { name: 'Bedrock', memory: '12GB', priceMonthly: 19.99, priceYearly: 199.99, popular: false, bestFor: 'Large servers up to 75 players', productId: '14', productUrl: 'https://billing.rivixservers.com/products/minecraft-bedrock-hosting/bedrock-12gb/checkout?plan=28' },
    { name: 'Bedrock', memory: '16GB', priceMonthly: 24.99, priceYearly: 249.99, popular: true,  bestFor: 'Large servers up to 100 players', productId: '15', productUrl: 'https://billing.rivixservers.com/products/minecraft-bedrock-hosting/bedrock-16gb/checkout?plan=30' },
    { name: 'Bedrock', memory: '24GB', priceMonthly: 36.99, priceYearly: 369.99, popular: false, bestFor: 'Enterprise servers up to 150 players', productId: '16', productUrl: 'https://billing.rivixservers.com/products/minecraft-bedrock-hosting/bedrock-24gb/checkout?plan=32' },
    { name: 'Bedrock', memory: '32GB', priceMonthly: 49.99, priceYearly: 499.99, popular: false, bestFor: 'Enterprise servers up to 200+ players', productId: '17', productUrl: 'https://billing.rivixservers.com/products/minecraft-bedrock-hosting/bedrock-32gb/checkout?plan=34' }
  ],
  standardFeatures: {
    java: [
      'Dedicated Ryzen 7 CPU',
      'Unlimited SSD Storage',
      'Full FTP Access',
      'One-Click Modpack Installer',
      'MySQL Database Included',
      'Custom JAR Support',
      '99.9% Uptime SLA'
    ],
    bedrock: [
      'Dedicated Ryzen 7 CPU',
      'Unlimited SSD Storage',
      'Full FTP Access',
      'Bedrock Edition Support',
      'MySQL Database Included',
      'Custom Server Software',
      '99.9% Uptime SLA'
    ]
  }
};

// Dedicated/VPS Server Plans
const dedicatedPlans = {
  vps: [
    {
      name: 'VPS Starter',
      cpu: '2 vCPU',
      ram: '4GB',
      storage: '80GB NVMe SSD',
      bandwidth: '1TB',
      priceMonthly: 24.99,
      priceYearly: 19.99,
      popular: false,
      bestFor: 'Light workloads, small applications',
      productId: 'vps-1'
    },
    {
      name: 'VPS Business',
      cpu: '4 vCPU',
      ram: '8GB',
      storage: '160GB NVMe SSD',
      bandwidth: '2TB',
      priceMonthly: 49.99,
      priceYearly: 39.99,
      popular: true,
      bestFor: 'Medium applications, databases',
      productId: 'vps-2'
    },
    {
      name: 'VPS Professional',
      cpu: '8 vCPU',
      ram: '16GB',
      storage: '320GB NVMe SSD',
      bandwidth: '4TB',
      priceMonthly: 99.99,
      priceYearly: 79.99,
      popular: false,
      bestFor: 'High-traffic applications',
      productId: 'vps-3'
    }
  ],
  dedicated: [
    {
      name: 'Dedicated Entry',
      cpu: 'Ryzen 7 (6 cores)',
      ram: '32GB DDR4',
      storage: '500GB NVMe SSD',
      bandwidth: 'Unlimited',
      priceMonthly: 149.99,
      priceYearly: 119.99,
      popular: false,
      bestFor: 'Small to medium businesses',
      productId: 'ded-1'
    },
    {
      name: 'Dedicated Pro',
      cpu: 'Ryzen 7 5800X (8 cores)',
      ram: '64GB DDR4',
      storage: '1TB NVMe SSD + 2TB HDD',
      bandwidth: 'Unlimited',
      priceMonthly: 249.99,
      priceYearly: 199.99,
      popular: true,
      bestFor: 'Enterprise applications',
      productId: 'ded-2'
    },
    {
      name: 'Dedicated Enterprise',
      cpu: 'Ryzen 9 5950X (16 cores)',
      ram: '128GB DDR4',
      storage: '2TB NVMe SSD + 4TB HDD',
      bandwidth: 'Unlimited',
      priceMonthly: 449.99,
      priceYearly: 359.99,
      popular: false,
      bestFor: 'High-performance workloads',
      productId: 'ded-3'
    }
  ],
  standardFeatures: {
    vps: [
      'Full Root Access',
      'KVM Virtualization',
      '99.9% Uptime SLA',
      'DDoS Protection',
      '24/7 Support',
      'Instant Provisioning',
      'Custom OS Images'
    ],
    dedicated: [
      'Dedicated Hardware',
      'Full Root Access',
      '99.95% Uptime SLA',
      'DDoS Protection',
      '24/7 Priority Support',
      'Custom Hardware Config',
      'IPMI/KVM Access'
    ]
  }
};

// Locations data - single location
const locationsData = {
  location: {
    name: 'US-East (Vint Hill)',
    location: 'Ashburn, Virginia',
    datacenter: 'Vint Hill Data Center',
    latency: 12,
    status: 'operational'
  }
};

// Helper function to merge global data with page-specific data
function renderPage(res, view, pageData = {}) {
  // Generate canonical URL from the request path
  const canonicalUrl = pageData.canonicalUrl || BASE_URL + (res.req.path || '/');
  
  res.render(view, {
    ...globalData,
    ...pageData,
    canonicalUrl: canonicalUrl,
    nonce: res.locals.nonce // Include nonce in all renders
  });
}

// Routes
app.get('/', (req, res) => {
  renderPage(res, 'index', {
    title: 'Premium Minecraft Server Hosting - Rivix Servers',
    heroImage: '/images/hero-custom.jpg', // Custom hero image from OneDrive
    javaPlans: pricingData.java,
    bedrockPlans: pricingData.bedrock
  });
});

app.get('/pricing', (req, res) => {
  const serverType = req.query.type === 'bedrock' ? 'bedrock' : 'java';
  
  const plans = pricingData[serverType];
  const planCategory = 'minecraft';
  
  renderPage(res, 'pricing', {
    title: getPricingTitle(serverType),
    serverType: serverType,
    planCategory: planCategory,
    plans: plans,
    data: pricingData
  });
});

// Helper function for pricing page titles
function getPricingTitle(serverType) {
  const titles = {
    'java': 'Minecraft Java Server Pricing - Rivix Servers',
    'bedrock': 'Minecraft Bedrock Server Pricing - Rivix Servers'
  };
  return titles[serverType] || 'Minecraft Server Pricing - Rivix Servers';
}

app.get('/support', (req, res) => {
  renderPage(res, 'support', {
    title: 'Support Center & Knowledge Base - Rivix Servers'
  });
});

app.get('/about', (req, res) => {
  renderPage(res, 'about', {
    title: 'About Us - Rivix Servers'
  });
});

app.get('/contact', (req, res) => {
  renderPage(res, 'contact', {
    title: 'Contact Us - Rivix Servers'
  });
});

app.get('/locations', (req, res) => {
  renderPage(res, 'locations', {
    title: 'Server Locations - Rivix Servers',
    data: locationsData
  });
});

app.get('/status', (req, res) => {
  renderPage(res, 'status', {
    title: 'System Status - Rivix Servers'
  });
});

app.get('/terms', (req, res) => {
  renderPage(res, 'terms', {
    title: 'Terms of Service - Rivix Servers'
  });
});

app.get('/privacy', (req, res) => {
  renderPage(res, 'privacy', {
    title: 'Privacy Policy - Rivix Servers'
  });
});

app.get('/refunds', (req, res) => {
  renderPage(res, 'refunds', {
    title: 'Refund Policy - Rivix Servers'
  });
});

app.get('/aup', (req, res) => {
  renderPage(res, 'aup', {
    title: 'Acceptable Use Policy - Rivix Servers'
  });
});

app.get('/tools', (req, res) => {
  renderPage(res, 'dev_tools', {
    title: 'Integrated Administrator Tools - Rivix Servers'
  });
});

// Alias for /tools (some links might use /tools)
app.get('/dev-tools', (req, res) => {
  renderPage(res, 'dev_tools', {
    title: 'Integrated Administrator Tools - Rivix Servers'
  });
});

app.get('/ai-support', (req, res) => {
  renderPage(res, 'ai_support', {
    title: 'AI Support Assistant - RyzenBot | Rivix Servers'
  });
});

// Launch MOP route (Internal Documentation)
app.get('/mop', (req, res) => {
  renderPage(res, 'launch_mop', {
    title: 'Launch MOP - Rivix Servers'
  });
});

// API Routes
app.get('/api/faqs', (req, res) => {
  res.json([
    { id: 1, question: 'What payment methods do you accept?', answer: 'We accept all major credit cards, PayPal, and cryptocurrency.' },
    { id: 2, question: 'Do you offer refunds?', answer: 'Yes, we offer a 7-day money-back guarantee on all plans.' },
    { id: 3, question: 'Can I upgrade my plan later?', answer: 'Yes, you can upgrade or downgrade your plan at any time through your control panel.' },
    { id: 4, question: 'What makes Ryzen 7 CPUs better for Minecraft?', answer: 'AMD Ryzen 7 CPUs have exceptional single-core performance, which is critical for Minecraft\'s single-threaded nature. This ensures higher TPS and zero lag.' },
    { id: 5, question: 'Do you oversell CPU resources?', answer: 'No. Every server gets a dedicated Ryzen 7 CPU core. We never share CPU cores between servers, ensuring consistent performance.' }
  ]);
});

app.post('/api/subscribe', (req, res) => {
  const { email } = req.body;
  
  // Validation
  if (!email || !email.includes('@')) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide a valid email address.' 
    });
  }
  
  // In production, this would integrate with your email service (Mailchimp, SendGrid, etc.)
  // For now, we'll simulate success
  console.log(`Newsletter subscription: ${email}`);
  
  res.json({ 
    success: true, 
    message: 'Thank you for subscribing! Check your email for confirmation.' 
  });
});

// 404 Handler (must be after all routes)
app.use((req, res) => {
  res.status(404).render('404', {
    ...globalData,
    title: '404 - Page Not Found | Rivix Servers',
    nonce: res.locals.nonce
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).render('error', {
    ...globalData,
    title: 'Server Error - Rivix Servers',
    error: NODE_ENV === 'development' ? err.message : 'An error occurred',
    NODE_ENV: NODE_ENV
  });
});

// Start server
app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════');
  console.log(`🚀 Rivix Servers - Server Running`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log('═══════════════════════════════════════════════════');
  console.log('Available Routes:');
  console.log(`  • Home:      http://localhost:${PORT}/`);
  console.log(`  • Pricing:   http://localhost:${PORT}/pricing`);
  console.log(`  • Support:   http://localhost:${PORT}/support`);
  console.log(`  • About:      http://localhost:${PORT}/about`);
  console.log(`  • Contact:   http://localhost:${PORT}/contact`);
  console.log(`  • Locations: http://localhost:${PORT}/locations`);
  console.log(`  • Status:    http://localhost:${PORT}/status`);
  console.log(`  • Terms:     http://localhost:${PORT}/terms`);
  console.log(`  • Privacy:   http://localhost:${PORT}/privacy`);
  console.log(`  • Tools:     http://localhost:${PORT}/tools`);
  console.log(`  • AI Support: http://localhost:${PORT}/ai-support`);
  console.log(`  • Launch MOP: http://localhost:${PORT}/mop`);
  console.log('═══════════════════════════════════════════════════');
  console.log(`Environment: ${NODE_ENV}`);
  console.log('═══════════════════════════════════════════════════');
});
