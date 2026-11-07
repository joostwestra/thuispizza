const assert=require('node:assert/strict');
const {dough}=require('../calculator-core.js');
const input={count:4,size:250,hydration:60,salt:2.9,yeast:0.44};
const result=dough(input);
assert.equal(result.total,1000);
assert.ok(Math.abs(result.flour-612.2199093914535)<1e-8);
for (const count of [1,4,20]) for(const hydration of [50,60.6,80]) for(const yeast of [0.01,0.23,2]) {
 const values={...input,count,hydration,yeast};const r=dough(values);
 assert.ok(Math.abs(r.flour+r.water+r.salt+r.yeast-count*values.size)<1e-9,'ingredient mass must equal dough mass');
 assert.ok(Math.abs(r.water/r.flour*100-hydration)<1e-10);
}
const doubled=dough({...input,count:8});
for(const key of ['total','flour','water','salt','yeast'])assert.equal(doubled[key],result[key]*2);
for(const [key,value] of [['count',0],['count',1.5],['count',21],['hydration',NaN],['hydration',81],['yeast',Infinity],['yeast',0],['size',501],['salt',-1]])assert.throws(()=>dough({...input,[key]:value}),RangeError);
console.log('Calculator: independent worked example, mass conservation, scaling, boundary rejection passed.');
