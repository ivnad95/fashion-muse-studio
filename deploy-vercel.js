#!/usr/bin/env node

/**
 * Deploy Fashion Muse Studio to Vercel via API
 * This script creates a Vercel project with GitHub integration and environment variables
 */

const https = require('https');

// Vercel API configuration
const VERCEL_TOKEN = process.env.VERCEL_TOKEN || '';
const TEAM_ID = 'team_rpAGyBuc26Y3pNKq2I6YIeID'; // Elijah's team

// Project configuration
const PROJECT_CONFIG = {
  name: 'fashion-muse-studio',
  framework: null, // Custom Node.js app
  gitRepository: {
    repo: 'ivnad95/fashion-muse-studio',
    type: 'github',
  },
  buildCommand: 'pnpm run build',
  outputDirectory: 'dist/public',
  installCommand: 'pnpm install',
};

// Environment variables to configure
const ENV_VARS = [
  {
    key: 'GEMINI_API_KEY',
    value: process.env.GEMINI_API_KEY || '',
    type: 'encrypted',
    target: ['production', 'preview', 'development'],
  },
  {
    key: 'DATABASE_URL',
    value: process.env.DATABASE_URL || '',
    type: 'encrypted',
    target: ['production', 'preview', 'development'],
  },
  {
    key: 'S3_ENDPOINT',
    value: process.env.S3_ENDPOINT || '',
    type: 'encrypted',
    target: ['production', 'preview', 'development'],
  },
  {
    key: 'S3_ACCESS_KEY_ID',
    value: process.env.S3_ACCESS_KEY_ID || '',
    type: 'encrypted',
    target: ['production', 'preview', 'development'],
  },
  {
    key: 'S3_SECRET_ACCESS_KEY',
    value: process.env.S3_SECRET_ACCESS_KEY || '',
    type: 'encrypted',
    target: ['production', 'preview', 'development'],
  },
  {
    key: 'S3_BUCKET',
    value: process.env.S3_BUCKET || '',
    type: 'plain',
    target: ['production', 'preview', 'development'],
  },
  {
    key: 'S3_REGION',
    value: process.env.S3_REGION || '',
    type: 'plain',
    target: ['production', 'preview', 'development'],
  },
  {
    key: 'VITE_OAUTH_PORTAL_URL',
    value: 'https://oauth.manus.im',
    type: 'plain',
    target: ['production', 'preview', 'development'],
  },
  {
    key: 'VITE_APP_ID',
    value: process.env.VITE_APP_ID || '',
    type: 'plain',
    target: ['production', 'preview', 'development'],
  },
  {
    key: 'NODE_ENV',
    value: 'production',
    type: 'plain',
    target: ['production'],
  },
  {
    key: 'STRIPE_SECRET_KEY',
    value: process.env.STRIPE_SECRET_KEY || '',
    type: 'encrypted',
    target: ['production', 'preview'],
  },
  {
    key: 'STRIPE_WEBHOOK_SECRET',
    value: process.env.STRIPE_WEBHOOK_SECRET || '',
    type: 'encrypted',
    target: ['production', 'preview'],
  },
  {
    key: 'VITE_STRIPE_PUBLISHABLE_KEY',
    value: process.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
    type: 'plain',
    target: ['production', 'preview'],
  },
];

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.vercel.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(response);
          } else {
            reject(new Error(`API Error: ${res.statusCode} - ${JSON.stringify(response)}`));
          }
        } catch (e) {
          reject(new Error(`Parse Error: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function deploy() {
  try {
    console.log('🚀 Starting Vercel deployment...\n');

    // Step 1: Create project
    console.log('📦 Creating Vercel project...');
    const project = await makeRequest('POST', `/v9/projects?teamId=${TEAM_ID}`, PROJECT_CONFIG);
    console.log(`✅ Project created: ${project.id}`);
    console.log(`   Name: ${project.name}`);
    console.log(`   URL: https://${project.name}.vercel.app\n`);

    // Step 2: Add environment variables
    console.log('🔐 Adding environment variables...');
    const validEnvVars = ENV_VARS.filter(env => env.value && env.value.trim() !== '');
    
    if (validEnvVars.length > 0) {
      const envResponse = await makeRequest(
        'POST',
        `/v10/projects/${project.id}/env?teamId=${TEAM_ID}&upsert=true`,
        validEnvVars
      );
      console.log(`✅ Added ${validEnvVars.length} environment variables\n`);
    } else {
      console.log('⚠️  No environment variables provided\n');
    }

    // Step 3: Trigger deployment
    console.log('🔨 Triggering initial deployment...');
    console.log('   This will happen automatically via GitHub integration\n');

    console.log('✨ Deployment setup complete!\n');
    console.log('📋 Next steps:');
    console.log('   1. Check deployment status: https://vercel.com/dashboard');
    console.log(`   2. View your app: https://${project.name}.vercel.app`);
    console.log('   3. Configure custom domain (optional)\n');

    return project;
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run deployment
if (!VERCEL_TOKEN) {
  console.error('❌ Error: VERCEL_TOKEN environment variable not set');
  console.error('   Get your token from: https://vercel.com/account/tokens');
  process.exit(1);
}

deploy();

