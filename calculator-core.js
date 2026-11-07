/* Ingredient scaling only; fermentation timing is not modelled. */
(function (root) {
  'use strict';
  function dough(input) {
    const limits = {count:[1,20],size:[150,500],hydration:[50,80],salt:[0,3.5],yeast:[0.01,2]};
    for (const [key,[min,max]] of Object.entries(limits)) {
      if (!Number.isFinite(input[key]) || input[key]<min || input[key]>max) throw new RangeError(key);
    }
    if (!Number.isInteger(input.count)) throw new RangeError('count');
    const total=input.count*input.size;
    const flour=total/(1+(input.hydration+input.salt+input.yeast)/100);
    return {total,flour,water:flour*input.hydration/100,salt:flour*input.salt/100,yeast:flour*input.yeast/100};
  }
  if (typeof module==='object' && module.exports) module.exports={dough};
  else root.pizzaMath={dough};
})(globalThis);
