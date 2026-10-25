const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const { randomUUID } = require('node:crypto');
process.env.JWT_SECRET = 'test-only-secret-longer-than-thirty-two-characters';
process.env.BREVO_API_KEY = 'test-only'; process.env.EMAIL_FROM = 'test@example.com';
let repl, app, User, Product, Order, Otp, customer, admin, other, product;
const sent = []; const originalFetch = global.fetch;
const auth = u => `Bearer ${jwt.sign({ id: u.id, version: u.tokenVersion }, process.env.JWT_SECRET)}`;
const checkout = (items, key = randomUUID()) => request(app).post('/api/orders').set('Authorization', auth(customer)).set('Idempotency-Key', key).send({ items, name: 'Test Customer', phone: '9876543210', addressLine1: 'Test street', addressLine2: '', city: 'Kochi', state: 'Kerala', pincode: '682001' });
before(async () => {
 repl = await MongoMemoryReplSet.create({ replSet: { count: 1 }, binary: { version: '8.0.5' } });
 process.env.MONGODB_URI = repl.getUri('test'); await require('../dist/config/database').connectDatabase();
 ({ User, Product, Order, Otp } = require('../dist/models'));
 await Promise.all([User.init(),Product.init(),Order.init(),Otp.init(),require('../dist/models/RateLimit').default.init()]);
 global.fetch = async (url, opts) => { assert.equal(url,'https://api.brevo.com/v3/smtp/email');sent.push(JSON.parse(opts.body));return {ok:true}; };
 app = require('../dist/server').default;
 const password = await bcrypt.hash('Test-pass-123',10);
 customer=await User.create({name:'Customer',email:'customer@example.com',phone:'9876543210',password});
 other=await User.create({name:'Other',email:'other@example.com',password});
 admin=await User.create({name:'Admin',email:'admin@example.com',role:'admin',password});
 product=await Product.create({name:'RC Car',description:'Test toy',category:'Vehicles & Remote-Controlled (RC)',price:100.25,wholesalePrice:60,stock:30});
},{timeout:120000});
after(async()=>{global.fetch=originalFetch;await mongoose.disconnect();if(repl)await repl.stop();});
test('products protect cost and search escapes regex',async()=>{
 let r=await request(app).get('/api/products');assert.equal(r.status,200);assert.equal(r.body[0].wholesalePrice,undefined);
 r=await request(app).get('/api/products').set('Authorization',auth(admin));assert.equal(r.body[0].wholesalePrice,60);
 r=await request(app).get('/api/products?search=%5B');assert.equal(r.status,200);assert.equal(r.body.length,0);
});
test('customer cannot use admin routes; public email-sending endpoint removed',async()=>{
 assert.equal((await request(app).post('/api/products').set('Authorization',auth(customer)).send({})).status,403);
 assert.equal((await request(app).get('/api/orders/all').set('Authorization',auth(customer))).status,403);
 assert.equal((await request(app).post('/api/notifications/order-confirmation').send({email:'victim@example.com'})).status,404);
});
test('checkout uses real price, prevents duplicates and hides internal cost',async()=>{
 const key=randomUUID(),items=[{productId:product.id,quantity:2,price:0.01}];
 let r=await checkout(items,key);assert.equal(r.status,201);assert.equal(r.body.totalAmount,200.5);assert.equal(r.body.OrderItems[0].Product.wholesalePrice,undefined);assert.equal(r.body.notes,undefined);
 const id=r.body.id;r=await checkout(items,key);assert.equal(r.status,200);assert.equal(r.body.id,id);assert.equal((await Product.findById(product.id)).stock,28);
 const own=await request(app).get('/api/orders').set('Authorization',auth(customer));assert.equal(own.body[0].OrderItems[0].Product.wholesalePrice,undefined);
 const another=await request(app).get('/api/orders').set('Authorization',auth(other));assert.equal(another.body.length,0);
});
test('reject invalid quantities, duplicate product lines and absent addresses',async()=>{
 for(const quantity of [-1,0,1.5,'2',100])assert.equal((await checkout([{productId:product.id,quantity}])).status,400);
 assert.equal((await checkout([{productId:product.id,quantity:1},{productId:product.id,quantity:1}])).status,400);
 assert.equal((await request(app).post('/api/orders').set('Authorization',auth(customer)).set('Idempotency-Key',randomUUID()).send({items:[{productId:product.id,quantity:1}]})).status,400);
});
test('failed multi-product order rolls back earlier stock reservations',async()=>{
 const sold=await Product.create({name:'Sold out',description:'Test',category:'Toys',price:50,stock:0});const count=await Order.countDocuments(),stock=(await Product.findById(product.id)).stock;
 assert.equal((await checkout([{productId:product.id,quantity:1},{productId:sold.id,quantity:1}])).status,409);
 assert.equal(await Order.countDocuments(),count);assert.equal((await Product.findById(product.id)).stock,stock);
});
test('concurrent buyers cannot oversell the last item',async()=>{
 const last=await Product.create({name:'Last car',description:'Test',category:'Toys',price:50,stock:1});
 const results=await Promise.all([checkout([{productId:last.id,quantity:1}]),checkout([{productId:last.id,quantity:1}])]);
 assert.deepEqual(results.map(r=>r.status).sort(),[201,409]);assert.equal((await Product.findById(last.id)).stock,0);
});
test('cancel restores stock once; cancellation cannot be reversed',async()=>{
 const created=await checkout([{productId:product.id,quantity:2}]);assert.equal(created.status,201);const stock=(await Product.findById(product.id)).stock;
 const change=status=>request(app).put(`/api/orders/${created.body.id}/status`).set('Authorization',auth(admin)).send({status});
 assert.equal((await change('cancelled')).status,200);assert.equal((await change('cancelled')).status,200);assert.equal((await Product.findById(product.id)).stock,stock+2);assert.equal((await change('pending')).status,400);
 assert.equal((await request(app).delete(`/api/orders/${created.body.id}`).set('Authorization',auth(admin))).status,200);assert.equal((await Product.findById(product.id)).stock,stock+2);
});
test('manual order stores customer details and is initially unpaid',async()=>{
 const r=await request(app).post('/api/orders/manual').set('Authorization',auth(admin)).set('Idempotency-Key',randomUUID()).send({items:[{productId:product.id,quantity:1,price:80}],customerName:'Counter Buyer',customerPhone:'9876543210',customerAddress:'Counter sale'});
 assert.equal(r.status,201);assert.equal(r.body.customerName,'Counter Buyer');assert.equal(r.body.paymentStatus,'pending');assert.equal(r.body.totalAmount,80);
 assert.equal((await request(app).delete(`/api/orders/${r.body.id}`).set('Authorization',auth(admin))).status,400);
});
test('OTP stored hashed and single-use; requested admin role ignored',async()=>{
 const email='new@example.com';let r=await request(app).post('/api/auth/send-register-otp').send({email});assert.equal(r.status,200);
 const otp=sent.find(m=>m.to[0].email===email).htmlContent.match(/<strong>(\d{6})<\/strong>/)[1];const record=await Otp.findOne({email});assert.notEqual(record.hash,otp);assert.equal(record.otp,undefined);
 const body={email,name:'New',phone:'9876543210',password:'Test-pass-123',otp,role:'admin'};
 r=await request(app).post('/api/auth/register').send(body);assert.equal(r.status,201);assert.equal(r.body.user.role,'user');assert.equal((await request(app).post('/api/auth/register').send(body)).status,400);
});
test('expired and exhausted OTPs rejected without waiting for TTL deletion',async()=>{
 const email='expired@example.com';await Otp.create({email,purpose:'register',hash:await bcrypt.hash('123456',10),expiresAt:new Date(Date.now()-1000)});
 const body={email,name:'Expired',phone:'9876543210',password:'Test-pass-123',otp:'123456'};assert.equal((await request(app).post('/api/auth/register').send(body)).status,400);
 await Otp.updateOne({email},{$set:{expiresAt:new Date(Date.now()+600000),attempts:5}});assert.equal((await request(app).post('/api/auth/register').send(body)).status,400);
});
test('password reset invalidates previous sessions',async()=>{
 const oldToken=auth(customer);await Otp.create({email:customer.email,purpose:'forgot_password',hash:await bcrypt.hash('123456',10),expiresAt:new Date(Date.now()+600000)});
 const r=await request(app).post('/api/auth/reset-password').send({email:customer.email,otp:'123456',newPassword:'Changed-pass-123'});assert.equal(r.status,200);
 assert.equal((await request(app).get('/api/orders').set('Authorization',oldToken)).status,401);
 assert.equal((await request(app).post('/api/auth/login').send({email:customer.email,password:'Changed-pass-123'})).status,200);
});
test('guests can order, retry safely and appear in admin orders without an account',async()=>{
 const toy=await Product.create({name:'Guest toy',description:'Test',category:'Toys',price:125,stock:3});
 const key=randomUUID(),userCount=await User.countDocuments();
 const body={items:[{productId:toy.id,quantity:1,price:1}],name:'Guest Buyer',phone:'9876543210',addressLine1:'Guest delivery street',city:'Kochi',state:'Kerala',pincode:'682001',userId:admin.id,role:'admin'};
 const submit=()=>request(app).post('/api/orders').set('Idempotency-Key',key).send(body);
 const r=await submit();assert.equal(r.status,201);assert.equal(r.body.userId,null);assert.equal(r.body.totalAmount,125);assert.equal(r.body.customerName,'Guest Buyer');
 assert.equal(r.body.OrderItems[0].Product.wholesalePrice,undefined);assert.equal(r.body.checkoutKey,undefined);
 const retry=await submit();assert.equal(retry.status,200);assert.equal(retry.body.id,r.body.id);assert.equal((await Product.findById(toy.id)).stock,2);
 assert.equal(await User.countDocuments(),userCount);
 const all=await request(app).get('/api/orders/all').set('Authorization',auth(admin));
 const saved=all.body.find(o=>o.id===r.body.id);assert.ok(saved);assert.equal(saved.User,null);assert.equal(saved.customerPhone,body.phone);assert.equal(saved.shippingCity,'Kochi');
 const own=await request(app).get('/api/orders').set('Authorization',auth(other));assert.ok(!own.body.some(o=>o.id===r.body.id));
 assert.equal((await request(app).get('/api/orders')).status,401);
 assert.equal((await request(app).get('/api/orders/all')).status,401);
 assert.equal((await request(app).post('/api/orders/manual').send(body)).status,401);
 assert.equal((await request(app).put(`/api/orders/${r.body.id}/status`).send({status:'confirmed'})).status,401);
 assert.equal((await request(app).delete(`/api/orders/${r.body.id}`)).status,401);
});
test('guest details are validated before stock is changed',async()=>{
 const r=await request(app).post('/api/orders').set('Idempotency-Key',randomUUID()).send({items:[{productId:product.id,quantity:1}],name:'Guest',phone:'123'});
 assert.equal(r.status,400);
});
test('failed email delivery reports failure and removes undelivered OTP',async()=>{
 global.fetch=async()=>({ok:false});const r=await request(app).post('/api/auth/send-register-otp').send({email:'failed@example.com'});assert.equal(r.status,503);assert.equal(await Otp.countDocuments({email:'failed@example.com'}),0);
});

