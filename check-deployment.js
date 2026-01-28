#!/usr/bin/env node

// Deployment status checker
const https = require('https');
const http = require('http');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkUrl(url, description) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      if (res.statusCode === 200) {
        log('green', `✅ ${description}: OK (${res.statusCode})`);
        resolve(true);
      } else {
        log('yellow', `⚠️  ${description}: ${res.statusCode}`);
        resolve(false);
      }
    });

    req.on('error', (err) => {
      log('red', `❌ ${description}: ${err.message}`);
      resolve(false);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      log('red', `❌ ${description}: Timeout`);
      resolve(false);
    });
  });
}

async function checkDeployment() {
  log('blue', '🚀 AccVault Deployment Status Check');
  log('blue', '=====================================');

  // Get URLs from environment or use defaults
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  console.log(`Backend URL: ${backendUrl}`);
  console.log(`Frontend URL: ${frontendUrl}`);
  console.log('');

  // Check backend endpoints
  log('blue', '🔧 Backend Checks:');
  const backendHealth = await checkUrl(`${backendUrl}/health`, 'Health Check');
  const backendApi = await checkUrl(`${backendUrl}/api/accounts`, 'Accounts API');
  const backendCategories = await checkUrl(`${backendUrl}/api/categories`, 'Categories API');

  console.log('');

  // Check frontend
  log('blue', '📱 Frontend Checks:');
  const frontendHome = await checkUrl(frontendUrl, 'Frontend Home');

  console.log('');

  // Summary
  log('blue', '📊 Summary:');
  const backendStatus = backendHealth && backendApi && backendCategories;
  const frontendStatus = frontendHome;

  if (backendStatus) {
    log('green', '✅ Backend: All systems operational');
  } else {
    log('red', '❌ Backend: Issues detected');
  }

  if (frontendStatus) {
    log('green', '✅ Frontend: Accessible');
  } else {
    log('red', '❌ Frontend: Issues detected');
  }

  if (backendStatus && frontendStatus) {
    log('green', '🎉 Deployment Status: HEALTHY');
    process.exit(0);
  } else {
    log('red', '🚨 Deployment Status: ISSUES DETECTED');
    process.exit(1);
  }
}

// Run the check
checkDeployment().catch(err => {
  log('red', `❌ Check failed: ${err.message}`);
  process.exit(1);
});