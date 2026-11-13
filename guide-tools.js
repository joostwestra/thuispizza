(function () {
  'use strict';
  const math = window.pizzaGuideMath;
  if (!math) return;
  const number = new Intl.NumberFormat('nl-NL', {maximumFractionDigits: 1});
  const date = new Intl.DateTimeFormat('nl-NL', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'});
  document.querySelectorAll('[data-guide-tool]').forEach(tool => {
    const form = tool.querySelector('form'), output = tool.querySelector('.tool-output');
    const kind = tool.dataset.guideTool;
    if (kind === 'planning') {
      const next = new Date();
      next.setDate(next.getDate() + 2);
      const pad = v => String(v).padStart(2, '0');
      form.elements.bake.value = `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}T18:30`;
    }
    function clear() {
      output.replaceChildren();
      output.textContent = 'Invoer aangepast. Bereken opnieuw voor een actuele uitkomst.';
    }
    form.addEventListener('input', clear);
    form.addEventListener('submit', event => {
      event.preventDefault();
      output.replaceChildren();
      if (!form.reportValidity()) return;
      const values = Object.fromEntries(Array.from(form.elements).filter(e => e.name).map(e => [e.name, e.name === 'bake' ? e.value : e.valueAsNumber]));
      try {
        if (kind === 'water') {
          const r = math.water(values);
          output.textContent = `${number.format(values.flour)} g bloem: van ${number.format(r.before)} g naar ${number.format(r.after)} g water. Verschil: ${number.format(Math.abs(r.difference))} g ${r.difference < 0 ? 'minder' : 'extra'} water (${number.format(r.points)} procentpunt).`;
        } else {
          const r = math.planning(values);
          const list = document.createElement('ol');
          list.className = 'timeline';
          for (const [key, label] of [['mix', 'Mengen en afwegen'], ['fridge', 'Afgedekt in de koelkast'], ['out', 'Uit de koelkast, verdelen en opbollen'], ['heat', 'Oven voorverwarmen'], ['bake', 'Eerste pizza in de oven']]) {
            const item = document.createElement('li');
            item.textContent = `${date.format(r[key])} — ${label}`;
            list.append(item);
          }
          output.append(list);
          const note = document.createElement('p');
          note.textContent = 'Controleer het deeg bij elke overgang. Dit is een tijdplanning, geen voorspelling van deegrijpheid. De tijden volgen de tijdzone van je apparaat.';
          output.append(note);
          if (r.mix < new Date()) {
            const warning = document.createElement('p');
            warning.className = 'notice';
            warning.textContent = 'De berekende starttijd is al voorbij. Begin je nog met mengen, kies dan een latere baktijd of een ander volledig recept.';
            output.append(warning);
          }
        }
      } catch (error) {
        output.textContent = error instanceof RangeError ? error.message : 'Berekenen lukt niet. Gebruik het rekenvoorbeeld hierboven.';
      }
    });
    form.hidden = false;
  });
})();
