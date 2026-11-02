'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {validatePilot,importPilot,validateSelection,devAvailable}=require('../tools/real-pilot.cjs');
const root=path.join(__dirname,'../pilots');
const index=JSON.parse(fs.readFileSync(path.join(root,'manifest.dev.json'),'utf8'));
const packs=index.entries.map(entry=>({entry,body:fs.readFileSync(path.join(root,entry.file),'utf8')}));
const [a,k]=packs.map(x=>validatePilot(JSON.parse(x.body)));
const army=()=>({context:{...a.context},reinforcements:0,champions:1,grandhammers:1,championHasGrandhammer:false,models:5});
const captain=()=>({context:{...k.context},captains:1,loadout:'plasma-pistol-and-power-fist'});
test('real packs import from the isolated index with pinned integrity and dev/local gates',()=>{
  for(const {entry,body} of packs){assert.equal(Buffer.byteLength(body),entry.bytes);assert.equal(importPilot(body,entry.sha256,'dev','dev--ironbuilt40k.netlify.app').synthetic,false);assert.throws(()=>importPilot(body+' ',entry.sha256,'dev','localhost'),/checksum/);assert.throws(()=>importPilot(body,entry.sha256,'prod','localhost'));assert.throws(()=>importPilot(body,entry.sha256,'dev','ironbuilt.app'));}
  assert.equal(devAvailable(undefined,'unknown.example'),false);
});
test('Liberators selection scales points, model count and grandhammer allowance together',()=>{
  assert.deepEqual(validateSelection(a,army()).totals,{models:5,points:90});
  const d=army();d.grandhammers=2;assert.equal(validateSelection(a,d).status,'invalid');
  d.reinforcements=1;d.models=10;assert.deepEqual(validateSelection(a,d).totals,{models:10,points:180});assert.equal(validateSelection(a,d).status,'unverified');
  d.championHasGrandhammer=true;assert.equal(validateSelection(a,d).status,'invalid');
  d.championHasGrandhammer=false;d.champions=2;assert.equal(validateSelection(a,d).status,'invalid');
});
test('Captain uses contextual Power fist profile rather than shared default',()=>{
  const w=k.weapons.find(w=>w.id==='killteam:captain-power-fist');assert.equal(w.hit,3);assert.equal(w.resolvedModifier.sourceBaseHit,4);assert.equal(w.attacks,5);
  assert.equal(k.weapons.filter(w=>w.modeGroup==='plasma-pistol').length,2);
  assert.equal(validateSelection(k,captain()).status,'unverified');
  assert.equal(validateSelection(k,{...captain(),captains:2}).status,'invalid');
  assert.equal(validateSelection(k,{...captain(),loadout:'invented'}).status,'invalid');
});
test('ability mechanical fingerprints retain shared use limits, exceptions, targets and normal damage scope',()=>{
  const h=k.abilities.find(x=>x.id==='killteam:heroic-leader').mechanics;
  assert.deepEqual(h.limit,{uses:1,period:'turning point',sharedAcrossOptions:true});assert.equal(h.options.length,3);
  assert.deepEqual(h.options[0].exceptions,['Command Re-roll']);assert.equal(h.options[1].cost,'normal');assert.ok(h.options[1].conditions.includes('Combat Doctrine not already used this turning point'));assert.equal(h.options[2].costCP,0);
  const halo=k.abilities.find(x=>x.id==='killteam:iron-halo').mechanics;assert.equal(halo.limit.period,'battle');assert.deepEqual(halo.excludes,['Critical Dmg']);assert.ok(halo.trigger.includes('one attack die'));
  const stalwart=a.abilities.find(x=>x.id==='aos:stalwart-defenders').mechanics;assert.equal(stalwart.effect.value,3);assert.ok(stalwart.conditions.includes('objective wholly within friendly territory'));
});
test('cross-game/source drafts, malformed entities and false coverage claims are rejected',()=>{
  for(const p of [a,k])for(const key of Object.keys(p.context)){const d=p===a?army():captain();d.context[key]='other';assert.equal(validateSelection(p,d).status,'invalid');}
  for(const mutate of [p=>p.coverage.playableRoster=true,p=>p.entity.weaponRefs.push('wh40k:weapon'),p=>p.weapons[0].attacks=-1,p=>p.abilities[0].wording='verbatim',p=>p.authorization.basis='assumed',p=>p.entity.artwork='image.png',p=>p.entity.basic.stats={}]){const p=structuredClone(a);mutate(p);assert.throws(()=>validatePilot(p));}
  const feed=JSON.parse(fs.readFileSync(path.join(__dirname,'../manifest.json'),'utf8'));assert.ok(!feed.datasets.some(d=>['aos','killteam'].includes(d.game)));
});
