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
  const actions=document.getElementById('recipe-actions');
  const actionStatus=document.getElementById('recipe-action-status');
  const copyFallback=document.getElementById('copy-fallback');
  const recipeText=document.getElementById('recipe-text');
  let currentRecipe='';
  let started=false;
  function clearRecipeActions(){
    currentRecipe='';actionStatus.textContent='';copyFallback.hidden=true;recipeText.value='';
  }
  function formatRecipe(input,data){
    const grams=(key)=>data[key].toLocaleString('nl-NL',{minimumFractionDigits:key==='yeast'?2:1,maximumFractionDigits:key==='yeast'?2:1});
    return [
      'Pizzadeeg · thuispizza.nl',
      `${input.count} pizza’s van ${input.size} g`,
      `${input.hydration.toLocaleString('nl-NL')}% water · ${input.salt.toLocaleString('nl-NL')}% zout · ${input.yeast.toLocaleString('nl-NL')}% instantgist`,
      '',`Bloem: ${grams('flour')} g`,`Water: ${grams('water')} g`,`Zout: ${grams('salt')} g`,`Instantgist: ${grams('yeast')} g`,
      '',presets[preset.value].text,
      'Hoeveelheden zijn afgerond. Dit is geen voorspelling van de rijstijd.',
      'Bronnen en rekenmethode: https://thuispizza.nl/rekenmethode.html'
    ].join('\n');
  }
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
      clearRecipeActions();currentRecipe=formatRecipe(input,data);
      result.hidden=false;
      status.textContent=announce?'Ingrediënten bijgewerkt.':'';
      if(announce)window.pizzaTrack?.('dough_calculation_complete');
    }catch{status.textContent='Controleer de invoer: een waarde valt buiten het bereik.';result.hidden=true;}
  }
  preset.addEventListener('change',()=>{
    trackStart();clearRecipeActions();
    const p=presets[preset.value];
    for(const key of ['hydration','salt','yeast'])if(key in p)form.elements[key].value=p[key];
    plan.textContent=p.text;status.textContent='Keuze gewijzigd. Klik op Bereken ingrediënten.';result.hidden=true;
  });
  names.forEach(name=>form.elements[name].addEventListener('input',()=>{
    trackStart();clearRecipeActions();
    if(['hydration','salt','yeast'].includes(name))preset.value='custom';
    result.hidden=true;status.textContent='Invoer gewijzigd. Klik op Bereken ingrediënten.';
  }));
  form.addEventListener('submit',event=>{event.preventDefault();trackStart();calculate();});
  document.getElementById('copy-recipe').addEventListener('click',async()=>{
    if(result.hidden || !currentRecipe)return;
    const text=currentRecipe;
    try{
      if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      if(currentRecipe===text && !result.hidden)actionStatus.textContent='Ingrediënten gekopieerd.';
    }catch{
      if(currentRecipe!==text || result.hidden)return;
      recipeText.value=text;copyFallback.hidden=false;recipeText.focus();recipeText.select();
      actionStatus.textContent='Automatisch kopiëren lukt niet. Kopieer de geselecteerde tekst hieronder.';
    }
  });
  document.getElementById('print-recipe').addEventListener('click',()=>{
    if(result.hidden || !currentRecipe)return;
    document.body.classList.add('printing-recipe');
    try{window.print();}catch{
      document.body.classList.remove('printing-recipe');
      actionStatus.textContent='Afdrukken lukt niet. Gebruik de kopieerknop om je recept te bewaren.';
    }
  });
  window.addEventListener('afterprint',()=>document.body.classList.remove('printing-recipe'));
  actions.hidden=false;
  calculate(false);
})();
