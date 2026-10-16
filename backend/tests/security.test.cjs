const {test}=require('node:test');
const assert=require('node:assert/strict');
const jwt=require('jsonwebtoken');
const v=require('../dist/utils/validation');
const {customerOrder}=require('../dist/routes/orders');
const {jwtSecret,authenticate,authorizeAdmin}=require('../dist/middleware/auth');
const User=require('../dist/models/User').default;
const RateLimit=require('../dist/models/RateLimit').default;
const {sendTransactionalEmail}=require('../dist/services/emailService');
const {consumeLimit}=require('../dist/middleware/rateLimit');
test('reject fractional, negative, string and excessive cart quantities',()=>{
 for(const value of [-1,0,1.5,'2',100,Infinity,NaN])assert.throws(()=>v.quantity(value),{status:400});
 assert.equal(v.quantity(1),1);assert.equal(v.quantity(99),99);
});
test('validate Indian shipping phone numbers, email input and bounded money',()=>{
 assert.equal(v.phone('9876543210'),'9876543210');
 for(const value of ['123','1234567890',{},null])assert.throws(()=>v.phone(value),{status:400});
 assert.equal(v.email(' Person@Example.com '),'person@example.com');
 assert.throws(()=>v.email({$ne:null}),{status:400});
 for(const value of [-1,'50',NaN,Infinity,10000001])assert.throws(()=>v.money(value),{status:400});
 assert.equal(v.money(23.456),23.46);
});
test('password boundaries account for bcrypt byte truncation',()=>{
 assert.throws(()=>v.password('short'),{status:400});assert.throws(()=>v.password('😀'.repeat(20)),{status:400});assert.equal(v.password('Long-pass-123'),'Long-pass-123');
});
test('customer order projection strips internal cost, notes, and idempotency key',()=>{
 const order={notes:'private',checkoutKey:'internal',stockRestored:false,OrderItems:[{price:50,Product:{id:'1',name:'Car',wholesalePrice:30,secret:'hidden',media:[]}}]};
 const safe=customerOrder(order);assert.equal(safe.notes,undefined);assert.equal(safe.checkoutKey,undefined);assert.equal(safe.OrderItems[0].Product.wholesalePrice,undefined);assert.equal(safe.OrderItems[0].Product.secret,undefined);assert.equal(order.notes,'private');
});
test('JWT cannot use missing or weak default secret',()=>{
 const previous=process.env.JWT_SECRET;delete process.env.JWT_SECRET;assert.throws(jwtSecret);process.env.JWT_SECRET='secret';assert.throws(jwtSecret);if(previous)process.env.JWT_SECRET=previous;else delete process.env.JWT_SECRET;
});
test('admin middleware denies ordinary customers',()=>{
 let error;authorizeAdmin({user:{role:'user'}},{},e=>error=e);assert.equal(error.status,403);error=undefined;authorizeAdmin({user:{role:'admin'}},{},e=>error=e);assert.equal(error,undefined);
});
test('authentication checks current role and token version in database',async()=>{
 const previousSecret=process.env.JWT_SECRET,originalFind=User.findById;process.env.JWT_SECRET='unit-test-secret-at-least-32-characters';
 const run=token=>new Promise(resolve=>{const req={header:()=>`Bearer ${token}`};authenticate(req,{},error=>resolve({req,error}));});
 try{
  User.findById=()=>({select:async()=>({id:'test',role:'user',tokenVersion:2})});
  let r=await run(jwt.sign({id:'test',version:1,role:'admin'},process.env.JWT_SECRET));assert.equal(r.error.status,401);
  r=await run(jwt.sign({id:'test',version:2,role:'admin'},process.env.JWT_SECRET));assert.equal(r.error,undefined);assert.equal(r.req.user.role,'user');
 }finally{User.findById=originalFind;if(previousSecret)process.env.JWT_SECRET=previousSecret;else delete process.env.JWT_SECRET;}
});
test('database-backed limits reject requests over budget',async()=>{
 const original=RateLimit.findOneAndUpdate;try{RateLimit.findOneAndUpdate=async()=>({count:3});await assert.rejects(()=>consumeLimit('test',2,60000),{status:429});RateLimit.findOneAndUpdate=async()=>({count:2});await consumeLimit('test',2,60000);}finally{RateLimit.findOneAndUpdate=original;}
});
test('email API uses HTTPS, no SMTP, and reports provider failures',async()=>{
 const originalFetch=global.fetch,originalLimit=RateLimit.findOneAndUpdate;const old={key:process.env.BREVO_API_KEY,from:process.env.EMAIL_FROM};
 process.env.BREVO_API_KEY='test-only';process.env.EMAIL_FROM='sender@example.com';RateLimit.findOneAndUpdate=async()=>({count:1});
 try{
  let body;global.fetch=async(url,options)=>{assert.equal(url,'https://api.brevo.com/v3/smtp/email');body=JSON.parse(options.body);return {ok:true};};
  await sendTransactionalEmail({to:'customer@example.com',subject:'Test',html:'<p>Test</p>'});assert.equal(body.to[0].email,'customer@example.com');assert.equal(body.sender.email,'sender@example.com');
  global.fetch=async()=>({ok:false});await assert.rejects(()=>sendTransactionalEmail({to:'customer@example.com',subject:'Test',html:'Test'}),{status:503});
  delete process.env.BREVO_API_KEY;await assert.rejects(()=>sendTransactionalEmail({to:'customer@example.com',subject:'Test',html:'Test'}),{status:503});
 }finally{global.fetch=originalFetch;RateLimit.findOneAndUpdate=originalLimit;for(const [key,value] of [['BREVO_API_KEY',old.key],['EMAIL_FROM',old.from]]){if(value)process.env[key]=value;else delete process.env[key];}}
});
test('email text is escaped before rendering HTML',()=>assert.equal(v.escapeHtml('<script>"&\''),'&lt;script&gt;&quot;&amp;&#39;'));
