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
  jwtSecret();
  await connectDatabase();
  if (!initialized) {
    initialized = Promise.all([User.init(), Product.init(), Order.init(), Otp.init(), RateLimit.init()])
      .catch(error => { initialized = undefined; throw error; });
  }
  await initialized;
}

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    await initialize();
  } catch {
    return { statusCode: 503, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({ message: 'Store temporarily unavailable. Please try again shortly.' }) };
  }
  // Support both rewritten /api paths and direct Function URLs.
  const prefix = '/.netlify/functions/api';
  const suffix = event.path.startsWith(prefix) ? event.path.slice(prefix.length) : null;
  const path = suffix === null ? event.path : suffix === '/healthz' ? '/healthz' : `/api${suffix || '/'}`;
  return serve({ ...event, path }, context);
};
