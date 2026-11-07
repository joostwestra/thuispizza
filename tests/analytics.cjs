const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function run({host='thuispizza.nl',choice=null,age=0,blocked=false}={}) {
  const calls=[],scripts=[],writes=[];
  const buttons=['denied','granted'].map(value=>({dataset:{consent:value},addEventListener(_,fn){this.click=fn},focus(){}}));
  const banner={setAttribute(){},querySelector(){return buttons[0]},querySelectorAll(){return buttons}};
  const settings={setAttribute(){},addEventListener(_,fn){this.click=fn},focus(){}};
  const window={gtag:(...args)=>calls.push(args)};
  let reloads=0;
  vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../analytics.js'),'utf8'),{
    window,URL,URLSearchParams,location:{hostname:host,origin:`https://${host}`,pathname:'/index.html',search:'?private=visitor-input&utm_source=chatgpt.com',reload(){reloads++}},
    localStorage:{getItem(){if(blocked)throw Error();return choice?JSON.stringify({value:choice,time:Date.now()-age}):null},setItem(_,v){writes.push(v);if(blocked)throw Error()}},
    document:{querySelectorAll(){return []},referrer:'https://example.org/path?secret=visitor-input',cookie:'',createElement(tag){return tag==='section'?banner:tag==='button'?settings:{}},querySelector(){return {append(){}}},body:{append(){}},head:{append(s){scripts.push(s)}}}
  });
  return {calls,scripts,banner,buttons,settings,window,writes,reloads:()=>reloads};
}
for(const options of [{},{choice:'denied'},{choice:'granted',host:'localhost'},{choice:'granted',age:181*86400000},{choice:'granted',age:-86400000}])assert.equal(run(options).scripts.length,0);
const a=run();assert.equal(a.banner.hidden,false);a.buttons[0].click();assert.equal(a.scripts.length,0);a.settings.click();assert.equal(a.banner.hidden,false);a.buttons[1].click();assert.equal(a.scripts.length,1);a.buttons[1].click();assert.equal(a.scripts.length,1);
a.window.pizzaTrack('dough_calculation_complete');a.window.pizzaTrack('unknown');assert.equal(a.calls.filter(c=>c[0]==='event').length,1);
assert.ok(!JSON.stringify(a.calls).includes('visitor-input'));
const config=a.calls.find(c=>c[0]==='config');assert.equal(config[1],'G-KJ7HDK0P9M');assert.equal(config[2].allow_google_signals,false);
a.buttons[0].click();assert.equal(a.window['ga-disable-G-KJ7HDK0P9M'],true);assert.equal(a.reloads(),1);
a.window.pizzaTrack('dough_calculation_complete');assert.equal(a.calls.filter(c=>c[0]==='event').length,1);
assert.equal(run({choice:'granted'}).scripts.length,1);
const blocked=run({blocked:true});blocked.buttons[1].click();assert.equal(blocked.scripts.length,1);
const funnel=run({choice:'granted'}); assert.equal(funnel.window.pizzaTrack('dough_calculation_start'),true); assert.equal(funnel.window.pizzaTrack('dough_calculation_complete'),true); assert.equal(funnel.window.pizzaTrack('free_text_secret'),false); assert.equal(funnel.calls.filter(c=>c[0]==='event').length,2);
console.log('PASS: consent, expiry, withdrawal, local exclusion, event allowlist and private input filtering');

const merchant=run({choice:'granted'});
assert.equal(merchant.window.pizzaTrack('merchant_click','baking-steel-original'),true);
assert.equal(merchant.window.pizzaTrack('merchant_click','visitor-input'),false);
assert.equal(merchant.calls.filter(c=>c[0]==='event').length,1);
assert.equal(merchant.calls.find(c=>c[0]==='event')[2].item_id,'baking-steel-original');
console.log('PASS: fixed product code only, no arbitrary merchant values');
