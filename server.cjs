const path = require('node:path');
require('./backend/node_modules/dotenv').config({ path: path.join(__dirname, '.env') });
const next = require('./frontend/node_modules/next');
const { createServer } = require('node:http');
process.env.NODE_ENV = process.argv.includes('--dev') ? 'development' : 'production';
const backend = require('./backend/dist/server').default;
const { connectDatabase } = require('./backend/dist/config/database');
const { jwtSecret } = require('./backend/dist/middleware/auth');
const dev = process.argv.includes('--dev');
process.env.NODE_ENV = dev ? 'development' : 'production';
const port = Number(process.env.PORT || 3000);
const frontend = next({ dev, dir: path.join(__dirname, 'frontend') });
async function start() {
  jwtSecret();
  await connectDatabase();
  const { User, Product, Order, Otp } = require('./backend/dist/models');
  const RateLimit = require('./backend/dist/models/RateLimit').default;
  await Promise.all([User.init(), Product.init(), Order.init(), Otp.init(), RateLimit.init()]);
  await frontend.prepare();
  const handle = frontend.getRequestHandler();
  const server = createServer((req, res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    if (pathname === '/healthz' || pathname === '/api' || pathname.startsWith('/api/')) return backend(req, res);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    handle(req, res);
  });
  server.listen(port, '0.0.0.0', () => console.log(`PlayCastHub listening on port ${port}`));
  process.on('SIGTERM', () => server.close(() => process.exit(0)));
}
start().catch(() => { console.error('Startup failed. Check database access, JWT_SECRET and the build output.'); process.exitCode = 1; });
