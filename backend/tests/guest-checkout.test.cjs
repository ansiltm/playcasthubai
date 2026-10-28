const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('node:crypto');
const { Order, Product, User } = require('../dist/models');
const RateLimit = require('../dist/models/RateLimit').default;
const app = express(); app.use(express.json()); app.use('/orders', require('../dist/routes/orders').default);
app.use((err, req, res, next) => res.status(err.status || 500).json({ message: err.message }));
test('guest checkout persists customer details, replays once and is admin-visible with private routes protected', async () => {
  process.env.JWT_SECRET = 'guest-route-test-only-secret-at-least-32-characters';
  delete process.env.ADMIN_NOTIFICATION_EMAIL;
  const originals = { transaction: mongoose.connection.transaction, create: Order.create, findOne: Order.findOne, find: Order.find, product: Product.findOneAndUpdate, user: User.findById, update: User.updateOne, limit: RateLimit.findOneAndUpdate };
  const records = []; let deductions = 0;
  const id = '507f1f77bcf86cd799439011';
  try {
    mongoose.connection.transaction = async fn => fn({});
    RateLimit.findOneAndUpdate = async () => ({ count: 1 });
    User.findById = () => ({ select: async () => ({ id: '507f1f77bcf86cd799439012', email: 'admin@example.com', role: 'admin', tokenVersion: 0 }) });
    User.updateOne = async () => { throw new Error('Guest must not update an account'); };
    Product.findOneAndUpdate = async () => { deductions++; return { _id: id, id, name: 'Test toy', price: 125, wholesalePrice: 50, colors: [], colorMedia: [], media: [], imageUrl: '' }; };
    Order.findOne = async filter => records.find(o => o.checkoutKey === filter.checkoutKey);
    Order.create = async ([data]) => { const doc = new Order(data); doc.validateSync() && assert.fail('Invalid order schema'); records.push(doc); return [doc]; };
    Order.find = filter => ({ populate: () => ({ sort: async () => records }), sort: async () => records.filter(o => String(o.userId) === filter.userId) });
    const key = randomUUID();
    const body = { items: [{ productId: id, quantity: 1, price: 1 }], name: 'Guest Buyer', email: 'guest@example.com', phone: '9876543210', addressLine1: 'Test address', city: 'Kochi', state: 'Kerala', pincode: '682001', userId: id, role: 'admin' };
    const submit = () => request(app).post('/orders').set('Idempotency-Key', key).send(body);
    let res = await submit(); assert.equal(res.status, 201); assert.equal(res.body.userId, null); assert.equal(res.body.customerName, 'Guest Buyer'); assert.equal(res.body.totalAmount, 125); assert.equal(res.body.checkoutKey, undefined); assert.equal(res.body.OrderItems[0].Product.wholesalePrice, undefined);
    const orderId = res.body.id;
    res = await submit(); assert.equal(res.status, 200); assert.equal(res.body.id, orderId); assert.equal(records.length, 1); assert.equal(deductions, 1);
    assert.equal(records[0].customerPhone, body.phone); assert.equal(records[0].shippingAddressLine1, body.addressLine1);
    const token = jwt.sign({ id, version: 0 }, process.env.JWT_SECRET);
    res = await request(app).get('/orders/all').set('Authorization', `Bearer ${token}`); assert.equal(res.status, 200); assert.equal(res.body[0].id, orderId); assert.equal(res.body[0].User, null);
    for (const path of ['/orders', '/orders/all']) assert.equal((await request(app).get(path)).status, 401);
    assert.equal((await request(app).post('/orders/manual').send(body)).status, 401);
    assert.equal((await request(app).put(`/orders/${orderId}/status`).send({ status: 'confirmed' })).status, 401);
    assert.equal((await request(app).delete(`/orders/${orderId}`)).status, 401);
    assert.equal((await request(app).post('/orders').set('Idempotency-Key', randomUUID()).send({ ...body, phone: '123' })).status, 400);
    assert.equal(deductions, 1);
  } finally {
    mongoose.connection.transaction = originals.transaction; Order.create = originals.create; Order.findOne = originals.findOne; Order.find = originals.find; Product.findOneAndUpdate = originals.product; User.findById = originals.user; User.updateOne = originals.update; RateLimit.findOneAndUpdate = originals.limit;
  }
});
