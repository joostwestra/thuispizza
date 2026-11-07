(() => {
  'use strict';
  const form=document.getElementById('dough-form');
  if (!form) return;
  const names=['count','size','hydration','salt','yeast'];
  const preset=document.getElementById('preset');
  const plan=document.getElementById('plan');
  const status=document.getElementById('calculation-status');
  const result=document.getElementById('ingredients');
  const presets={
    today:{hydration:60,salt:2.9,yeast:0.44,text:'Vandaag bakken: Ooni noemt circa 3–4 uur voorbereiding voor zijn klassieke recept. Werk met een afgedekt deeg en beoordeel de volumetoename. Onze afgeronde percentages zijn een startpunt; je kamer- en deegtemperatuur kunnen het schema veranderen.'},
    cold:{hydration:60.6,salt:3,yeast:0.23,text:'Koud rijzen: het bronrecept gebruikt 24–72 uur in de koelkast, gevolgd door circa 5 uur op het aanrecht. Plan die laatste fase apart in. Houd je koelkast rond 4 °C en volg het deeg; deze calculator voorspelt geen rijpheid.'},
    custom:{text:'Eigen percentages: gebruik een passend recept voor je rijstijd en temperatuur. De calculator schaalt alleen de ingrediënten en bepaalt geen fermentatieduur.'}
  };
  let started=false;
  function trackStart(){if(!started)started=window.pizzaTrack?.('dough_calculation_start')===true;}
  function calculate(announce=true){
    if(!form.checkValidity()){if(announce)form.reportValidity();return;}
    const input=Object.fromEntries(names.map(n=>[n,Number(form.elements[n].value)]));
    try{
      const data=window.pizzaMath.dough(input);
      for(const key of ['flour','water','salt','yeast']) document.getElementById(key+'-result').textContent=data[key].toLocaleString('nl-NL',{minimumFractionDigits:key==='yeast'?2:1,maximumFractionDigits:key==='yeast'?2:1});
      document.getElementById('total-result').textContent=data.total.toLocaleString('nl-NL');
      document.getElementById('recipe-summary').textContent=`${input.count} pizza’s × ${input.size} g · ${input.hydration.toLocaleString('nl-NL')}% water · ${input.salt.toLocaleString('nl-NL')}% zout · ${input.yeast.toLocaleString('nl-NL')}% instantgist`;
      plan.textContent=presets[preset.value].text;
      result.hidden=false;
      status.textContent=announce?'Ingrediënten bijgewerkt.':'';
      if(announce)window.pizzaTrack?.('dough_calculation_complete');
    }catch{status.textContent='Controleer de invoer: een waarde valt buiten het bereik.';result.hidden=true;}
  }
  preset.addEventListener('change',()=>{
    trackStart();
    const p=presets[preset.value];
    for(const key of ['hydration','salt','yeast'])if(key in p)form.elements[key].value=p[key];
    plan.textContent=p.text;status.textContent='Keuze gewijzigd. Klik op Bereken ingrediënten.';result.hidden=true;
  });
  names.forEach(name=>form.elements[name].addEventListener('input',()=>{
    trackStart();
    if(['hydration','salt','yeast'].includes(name))preset.value='custom';
    result.hidden=true;status.textContent='Invoer gewijzigd. Klik op Bereken ingrediënten.';
  }));
  form.addEventListener('submit',event=>{event.preventDefault();trackStart();calculate();});
  calculate(false);
})();
