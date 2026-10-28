const {test}=require('node:test');
const assert=require('node:assert/strict');
const {productData}=require('../dist/routes/products');
test('shipping measurements accept decimal units, preserve omitted data, clear blanks and reject invalid inputs',async()=>{
 const product={media:[],colors:[],colorMedia:[]};
 const base=await productData({body:{},files:[]},product);
 assert.equal(base.packedWeightKg,undefined);
 const valid=await productData({body:{packedWeightKg:'0.75',packageLengthCm:'30',packageWidthCm:'20.5',packageHeightCm:'10'},files:[]},product);
 assert.equal(valid.packedWeightKg,.75);assert.equal(valid.packageWidthCm,20.5);
 const cleared=await productData({body:{packedWeightKg:''},files:[]},product);assert.equal(cleared.packedWeightKg,null);
 for(const bad of ['-1','0','NaN','Infinity','1001',true,[]]) await assert.rejects(()=>productData({body:{packedWeightKg:bad},files:[]},product));
});
