const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {dough}=require('../calculator-core.js');
function setup(){
 const nodes={};
 function element(id){return nodes[id]??=( {id,value:'',textContent:'',hidden:false,handlers:{},addEventListener(name,fn){this.handlers[name]=fn;},focus(){this.focused=true;},select(){this.selected=true;}} );}
 const values={count:4,size:250,hydration:60,salt:2.9,yeast:.44};
 const form=element('dough-form');form.elements=Object.fromEntries(Object.entries(values).map(([key,value])=>[key,Object.assign(element(key),{value:String(value)})]));form.checkValidity=()=>true;
 element('preset').value='today';
 const classes=new Set(),events={},copies=[];
 const window={pizzaMath:{dough},pizzaTrack(){return false;},print(){window.prints++;},prints:0,addEventListener(name,fn){events[name]=fn;}};
 const navigator={clipboard:{async writeText(text){copies.push(text);}}};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../script.js'),'utf8'),{window,navigator,document:{getElementById:element,body:{classList:{add:c=>classes.add(c),remove:c=>classes.delete(c)}}}});
 return {nodes,element,form,window,navigator,copies,classes,events,calculate(){form.handlers.submit({preventDefault(){}});},input(key,value){form.elements[key].value=String(value);form.elements[key].handlers.input();}};
}
(async()=>{
 const t=setup();
 await t.nodes['copy-recipe'].handlers.click();
 assert.ok(t.copies[0].includes('4 pizza’s van 250 g'));
 assert.ok(t.copies[0].includes('Bloem: 612,2 g'));
 assert.ok(t.copies[0].includes('https://thuispizza.nl/rekenmethode.html'));
 t.input('count',2);
 assert.equal(t.nodes.ingredients.hidden,true);
 await t.nodes['copy-recipe'].handlers.click();assert.equal(t.copies.length,1,'stale result must not be copied');
 t.calculate();await t.nodes['copy-recipe'].handlers.click();assert.ok(t.copies[1].includes('2 pizza’s van 250 g'));
 t.navigator.clipboard.writeText=async()=>{throw new Error('Denied');};
 await t.nodes['copy-recipe'].handlers.click();
 assert.equal(t.nodes['copy-fallback'].hidden,false);
 assert.equal(t.nodes['recipe-text'].selected,true);
 assert.ok(t.nodes['recipe-text'].value.includes('2 pizza’s van 250 g'));
 t.input('hydration',65);assert.equal(t.nodes['recipe-text'].value,'');assert.equal(t.nodes['copy-fallback'].hidden,true);
 t.calculate();t.nodes['print-recipe'].handlers.click();assert.equal(t.window.prints,1);assert.equal(t.classes.has('printing-recipe'),true);
 t.events.afterprint();assert.equal(t.classes.has('printing-recipe'),false);
 t.window.print=()=>{throw new Error('Unavailable');};t.nodes['print-recipe'].handlers.click();assert.equal(t.classes.has('printing-recipe'),false);
 const race=setup();let finish;
 race.navigator.clipboard.writeText=()=>new Promise(resolve=>{finish=resolve;});
 const pending=race.nodes['copy-recipe'].handlers.click();race.input('count',3);finish();await pending;
 assert.equal(race.nodes['recipe-action-status'].textContent,'','old async completion must not overwrite changed input state');
 console.log('PASS: copy matches recipe, stale exports blocked, clipboard fallback, print cleanup and async copy race');
})().catch(e=>{console.error(e);process.exitCode=1;});
