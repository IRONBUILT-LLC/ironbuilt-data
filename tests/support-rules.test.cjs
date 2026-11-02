'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const p=require('../pilots/killteam-angels-team.json'),fixtures=require('./fixtures/angels-team-rosters.json');
const {validateTeamSelection,validateTeamPack}=require('../tools/team-preview.cjs');
const base=()=>structuredClone(fixtures.cases[0].roster);
const eq=name=>p.equipment.find(e=>e.name===name);
test('all faction ploys, equipment and keyword references are present with original wording',()=>{
  assert.equal(p.ploys.filter(x=>x.scope!=='core').length,8);assert.equal(p.equipment.filter(x=>x.scope==='faction').length,4);assert.equal(p.equipment.filter(x=>x.scope==='universal').length,11);assert.equal(p.keywords.length,25);
  assert.ok([...p.ploys,...p.equipment,...p.keywords].every(x=>x.wording==='original'&&x.automated===false&&x.sourceRefs.length&&x.officialLocation));
  assert.equal(p.ploys.find(x=>x.name==='Command Re-roll').usesPerTurningPoint,null);assert.equal(p.ploys.find(x=>x.name==='Shock Assault').mechanics.damageMaximum,7);
  assert.deepEqual(eq('Tilting Shields').mechanics.timing,'after opponent attack roll, before re-rolls');assert.equal(eq('Breaching Charge').mechanics.minimumAP,1);
});
test('equipment limit counts options rather than supplied pieces, and grenade pools total two',()=>{
  const d=base();d.equipment=[{equipmentId:eq('Light Barricades').id},{equipmentId:eq('Ladders').id},{equipmentId:eq('Explosive Grenades').id,configuration:{frag:1,krak:1}},{equipmentId:eq('Utility Grenades').id,configuration:{smoke:2,stun:0}}];assert.equal(validateTeamSelection(p,d).compositionValid,true);
  d.equipment.push({equipmentId:eq('Auspex').id});assert.ok(validateTeamSelection(p,d).errors.includes('equipment-limit'));
  d.equipment=d.equipment.slice(0,4);d.equipment[2].configuration.frag=2;assert.ok(validateTeamSelection(p,d).errors.includes('invalid-grenade-pool'));
  d.equipment=[{equipmentId:eq('Auspex').id},{equipmentId:eq('Auspex').id}];assert.ok(validateTeamSelection(p,d).errors.includes('duplicate-equipment'));
  d.equipment=[{equipmentId:'aos:invented'}];assert.ok(validateTeamSelection(p,d).errors.includes('unknown-equipment'));
});
test('grenadier access is independent of the equipment pool and base grenade profiles remain distinct',()=>{
  const g=p.operatives.find(o=>o.name==='Assault Intercessor Grenadier');assert.equal(g.grantedEquipmentWeaponRefs.length,2);
  const frag=p.weapons.find(w=>w.id==='killteam:universal:frag-grenade');assert.deepEqual([frag.attacks,frag.hit,frag.damageNormal,frag.damageCritical,frag.rangeInches],[4,4,2,4,6]);assert.ok(frag.keywords.includes('Saturate'));assert.equal(p.abilities.find(a=>a.name==='Grenadier').mechanics.hitImprovement,1);
  const d=base();d.lines[1]={instanceId:'grenadier',operativeId:g.id,loadoutId:g.loadouts[0].id};d.equipment=[];assert.equal(validateTeamSelection(p,d).compositionValid,true);
});
test('smoke, ladders and keyword exceptions retain the reviewed mechanical boundaries',()=>{
  const smoke=p.actions.find(a=>a.name==='Smoke Grenade').mechanics;assert.equal(smoke.radiusInches,1);assert.deepEqual(smoke.piercingChanges,{'Piercing 2':'Piercing 1','Piercing Crits 2':'Piercing Crits 1'});assert.equal(smoke.piercingException,'within 2 inches of each other');assert.ok(smoke.expiry.includes('completed activations'));
  assert.equal(eq('Ladders').mechanics.condition,'same ladder within control range during entire climb');assert.equal(eq('Ladders').mechanics.otherClimbsNormal,true);
  assert.equal(p.keywords.find(k=>k.name==='Seek').mechanics.removeCoverSaves,false);assert.deepEqual(p.keywords.find(k=>k.name==='Severe').mechanics.doesNotTrigger,['Punishing','Rending']);
  const q=structuredClone(p);q.weapons[0].keywordRefs=['killteam:missing'];assert.throws(()=>validateTeamPack(q));
});
