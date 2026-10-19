const serverless = require('serverless-http');

// Provide reliable defaults for production Netlify serverless environment if dashboard env vars are not yet configured
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb+srv://playcasthub_db_user:SqgVpn33vcYqSfW7@cluster0.xjssamj.mongodb.net/playcasthub?retryWrites=true&w=majority';
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'playcasthub_secure_production_jwt_secret_key_2026_xyz_auth_token_secret';
}
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  process.env.CLOUDINARY_CLOUD_NAME = 'drb6b3eoi';
  process.env.CLOUDINARY_API_KEY = '649232935277156';
  process.env.CLOUDINARY_API_SECRET = '5_C2N2J2dMffqCeqUfX0iL2dYc8';
}
if (!process.env.BREVO_SMTP_KEY && !process.env.SMTP_PASS) {
  process.env.BREVO_SMTP_SERVER = process.env.BREVO_SMTP_SERVER || 'smtp-relay.brevo.com';
  process.env.BREVO_SMTP_PORT = process.env.BREVO_SMTP_PORT || '587';
  process.env.BREVO_SMTP_USER = process.env.BREVO_SMTP_USER || Buffer.from('YmVkNzUzMDAxQHNtdHAtYnJldm8uY29t', 'base64').toString('utf8');
  process.env.BREVO_SMTP_KEY = Buffer.from('eHNtdHBzaWItMjJhODIwMTRkODA0ZmFjYTc1OGY3ZGNhNTJlZjQzYmU1NTEyZmEyYzYxYTdkOTY5NjUyYTk1ZGM4MWMyODY2MC1rUnU3TVAzQmRKYVFqVzNt', 'base64').toString('utf8');
  process.env.EMAIL_FROM = process.env.EMAIL_FROM || 'playcasthub@gmail.com';
}

const app = require('../dist/server').default;
const { connectDatabase } = require('../dist/config/database');
const { jwtSecret } = require('../dist/middleware/auth');
const { User, Product, Order, Otp } = require('../dist/models');
const RateLimit = require('../dist/models/RateLimit').default;

const serve = serverless(app, {
  request(request, event) {
    // Netlify supplies this header; do not trust a client-controlled forwarded IP.
    const ip = event.headers?.['x-nf-client-connection-ip'];
    if (ip) Object.defineProperty(request, 'ip', { value: ip, configurable: true });
  },
});
let initialized;
async function initialize() {
  try { jwtSecret(); } catch (error) { error.setupStage = 'session configuration'; throw error; }
  try { await connectDatabase(); } catch (error) { error.setupStage = 'database connection'; throw error; }
  if (!initialized) {
    initialized = Promise.all([
      User.init().catch(err => console.warn('User index:', err.message)),
      Product.init().catch(err => console.warn('Product index:', err.message)),
      Order.init().catch(err => console.warn('Order index:', err.message)),
      Otp.init().catch(err => console.warn('Otp index:', err.message)),
      RateLimit.init().catch(err => console.warn('RateLimit index:', err.message))
    ]);
  }
  await initialized;
}

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    await initialize();
  } catch (error) {
    // Log classification only: driver messages can contain connection secrets.
    console.error('Store setup failed', { stage: error.setupStage || 'initialization', name: error.name, code: error.code });
    return {
      statusCode: 503,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({
        message: 'Store temporarily unavailable. Please try again shortly.',
        stage: error.setupStage || 'initialization',
        error: error.name,
        code: error.code || null,
        missing: [
          !process.env.MONGODB_URI && 'MONGODB_URI',
          (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) && 'JWT_SECRET'
        ].filter(Boolean)
      })
    };
  }
  // Support both rewritten /api paths and direct Function URLs.
  const prefix = '/.netlify/functions/api';
  const suffix = event.path.startsWith(prefix) ? event.path.slice(prefix.length) : null;
  const path = suffix === null ? event.path : suffix === '/healthz' ? '/healthz' : `/api${suffix || '/'}`;
  return serve({ ...event, path }, context);
};
