const {test}=require('node:test');
const assert=require('node:assert/strict');
const express=require('express'),request=require('supertest'),jwt=require('jsonwebtoken');
const {User,Order}=require('../dist/models');
test('only verified account email can claim unowned online orders',async()=>{
 process.env.JWT_SECRET='email-test-secret-that-is-at-least-32-characters';
 const original={user:User.findById,update:Order.updateMany,find:Order.find};
 let verified=false,claims=0;
 const id='507f1f77bcf86cd799439012';
 const rows=[{userId:null,orderType:'online',customerEmail:'buyer@example.com',OrderItems:[]},{userId:null,orderType:'online',customerEmail:'other@example.com',OrderItems:[]},{userId:'someone-else',orderType:'online',customerEmail:'buyer@example.com',OrderItems:[]},{userId:null,orderType:'custom',customerEmail:'buyer@example.com',OrderItems:[]}];
 try{
 User.findById=()=>({select:async()=>({id,email:'buyer@example.com',emailVerified:verified,tokenVersion:0})});
 Order.updateMany=async(filter,update)=>{claims++;assert.deepEqual(filter,{userId:null,orderType:'online',customerEmail:'buyer@example.com'});for(const o of rows)if(o.userId===null&&o.orderType===filter.orderType&&o.customerEmail===filter.customerEmail)o.userId=update.$set.userId;};
 Order.find=filter=>({sort:async()=>rows.filter(o=>o.userId===filter.userId)});
 const app=express();app.use('/orders',require('../dist/routes/orders').default);
 app.use((e,req,res,next)=>res.status(e.status||500).json({message:e.message}));
 const auth='Bearer '+jwt.sign({id,version:0},process.env.JWT_SECRET);
 assert.equal((await request(app).get('/orders')).status,401);
 let r=await request(app).get('/orders').set('Authorization',auth);assert.equal(r.body.length,0);assert.equal(claims,0);
 verified=true;r=await request(app).get('/orders').set('Authorization',auth);assert.equal(r.status,200);assert.equal(r.body.length,1);assert.equal(rows[1].userId,null);assert.equal(rows[2].userId,'someone-else');assert.equal(rows[3].userId,null);
 r=await request(app).get('/orders').set('Authorization',auth);assert.equal(r.body.length,1);
 }finally{User.findById=original.user;Order.updateMany=original.update;Order.find=original.find;}
});
