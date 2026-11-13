/* Arithmetic helpers only: no fermentation or flour-performance prediction. */
(function (root) {
  'use strict';
  function bounded(value, min, max, integer = false) {
    if (!Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) throw new RangeError('Controleer de ingevulde waarden.');
    return value;
  }
  function water({flour, from, to}) {
    bounded(flour, 100, 5000, true);
    bounded(from, 50, 80);
    bounded(to, 50, 80);
    const before = flour * from / 100, after = flour * to / 100;
    return {before, after, difference: after - before, points: to - from};
  }
  function planning({bake, cold, prep, heat}) {
    bounded(cold, 24, 72, true);
    bounded(prep, 10, 180, true);
    bounded(heat, 5, 180, true);
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(bake);
    if (!match) throw new RangeError('Vul een volledige datum en tijd in.');
    const parts = match.slice(1).map(Number), [year, month, day, hour, minute] = parts;
    bounded(year, 2000, 2100, true);
    const end = new Date(year, month - 1, day, hour, minute);
    // Reject normalized invalid dates and a nonexistent local time at a DST change.
    if ([end.getFullYear(), end.getMonth() + 1, end.getDate(), end.getHours(), end.getMinutes()].some((v, i) => v !== parts[i])) throw new RangeError('Kies een geldige datum en tijd.');
    const out = end.getTime() - 5 * 3600000;
    const fridge = out - cold * 3600000;
    return {mix: new Date(fridge - prep * 60000), fridge: new Date(fridge), out: new Date(out), heat: new Date(end.getTime() - heat * 60000), bake: end};
  }
  if (typeof module === 'object' && module.exports) module.exports = {water, planning};
  else root.pizzaGuideMath = {water, planning};
})(globalThis);
