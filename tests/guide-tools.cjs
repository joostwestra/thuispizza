const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
process.env.TZ = 'Europe/Amsterdam';
const math = require('../guide-tools-core.js');
assert.deepEqual(math.water({flour:500,from:60,to:65}), {before:300,after:325,difference:25,points:5});
assert.equal(math.water({flour:500,from:70,to:60}).difference, -50);
assert.equal(math.water({flour:500,from:60,to:60}).difference, 0);
for (const input of [{flour:0,from:60,to:65},{flour:500,from:NaN,to:65},{flour:500,from:60,to:81}]) assert.throws(() => math.water(input), RangeError);
const input = {bake:'2026-11-14T18:30',cold:24,prep:30,heat:60};
const p = math.planning(input);
assert.equal(p.mix.getTime(), new Date(2026,10,13,13,0).getTime());
assert.equal(p.out.getTime(), new Date(2026,10,14,13,30).getTime());
assert.equal(p.heat.getTime(), new Date(2026,10,14,17,30).getTime());
assert.equal(math.planning({...input,cold:48}).mix.getTime(), p.mix.getTime()-24*3600000);
assert.equal(math.planning({...input,bake:'2027-01-01T01:00'}).out.getFullYear(),2026);
for (const changes of [{bake:''},{bake:'2026-02-30T18:30'},{bake:'2026-13-01T18:30'},{bake:'2027-03-28T02:30'},{cold:23},{cold:24.5},{prep:NaN},{heat:181}]) assert.throws(() => math.planning({...input,...changes}), RangeError);
// Actual elapsed hours are preserved across the winter-time transition.
const dst = math.planning({...input,bake:'2026-10-25T06:30'});
assert.equal(dst.bake-dst.out, 5*3600000);

function setup(kind, values) {
  const output = {textContent:'',children:[],replaceChildren(){this.children=[];this.textContent='';},append(child){this.children.push(child);}};
  const form = {hidden:true,events:{},elements:Object.assign(Object.entries(values).map(([name,value]) => ({name,value:String(value),valueAsNumber: typeof value==='number' ? value : NaN})),{}),addEventListener(name,fn){this.events[name]=fn;},reportValidity(){return true;}};
  for(const e of form.elements) form.elements[e.name]=e;
  const tool = {dataset:{guideTool:kind},querySelector(selector){return selector==='form'?form:output;}};
  const document = {querySelectorAll(){return [tool];},createElement(tag){return {tag,children:[],append(child){this.children.push(child);}};}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../guide-tools.js'),'utf8'),{window:{pizzaGuideMath:math},document,Intl,Date,RangeError});
  return {form,output,submit(){form.events.submit({preventDefault(){}});}};
}
const w = setup('water',{flour:500,from:60,to:65});
assert.equal(w.form.hidden,false);
w.submit();assert.match(w.output.textContent,/25 g extra water/);
w.form.events.input();assert.doesNotMatch(w.output.textContent,/325/);
assert.match(w.output.textContent,/Bereken opnieuw/);
w.form.elements.flour.valueAsNumber=NaN;w.submit();assert.match(w.output.textContent,/Controleer/);
const t = setup('planning',input);
t.form.elements.bake.value=input.bake;t.submit();
assert.equal(t.output.children[0].children.length,5);
assert.match(t.output.children[0].children[0].textContent,/13 november 2026/);
t.form.events.input();assert.equal(t.output.children.length,0);
console.log('PASS: water differences, date rollover, invalid input, DST, timeline rendering and stale-result clearing');
