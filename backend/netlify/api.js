const serverless = require('serverless-http');
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
    initialized = Promise.all([User.init(), Product.init(), Order.init(), Otp.init(), RateLimit.init()])
      .catch(error => { initialized = undefined; error.setupStage = 'database indexes'; throw error; });
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
    return { statusCode: 503, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({ message: 'Store temporarily unavailable. Please try again shortly.' }) };
  }
  // Support both rewritten /api paths and direct Function URLs.
  const prefix = '/.netlify/functions/api';
  const suffix = event.path.startsWith(prefix) ? event.path.slice(prefix.length) : null;
  const path = suffix === null ? event.path : suffix === '/healthz' ? '/healthz' : `/api${suffix || '/'}`;
  return serve({ ...event, path }, context);
};
