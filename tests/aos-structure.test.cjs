'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {validateInventory,validateArmyStructure,importInventory}=require('../tools/aos-structure.cjs');
const root=path.join(__dirname,'..'),body=fs.readFileSync(path.join(root,'pilots/aos-stormcast-inventory.json'),'utf8'),p=validateInventory(JSON.parse(body));
const hero=p.entries.find(e=>e.roleCandidate==='hero'),unit=p.entries.find(e=>e.sourceId==='e914-877f-21fe-8db9');
const draft=()=>({context:{...p.context},regiments:[{leader:{instanceId:'leader-1',entryId:hero.id,reinforced:false},units:[{instanceId:'unit-1',entryId:unit.id,reinforced:false}]}],auxiliaries:[],generalInstanceId:'leader-1'});
test('inventory is comprehensive source metadata rather than verified current profile coverage',()=>{
  assert.equal(p.entries.length,96);assert.equal(new Set(p.entries.map(e=>e.sourceId)).size,91);assert.equal(p.entries.filter(e=>e.roleCandidate==='hero').length,47);
  assert.ok(p.entries.every(e=>e.currentProfilesVerified===false&&e.regimentEligibility==='unverified'));
  assert.equal(unit.requiredBaseline.publication,'Battletome: Stormcast Eternals');assert.equal(unit.requiredBaseline.printedPage,null);
  assert.ok(p.entries.some(e=>e.requiredBaseline.publication==='Scourge of Aqshy'));assert.ok(p.entries.some(e=>e.requiredBaseline.publication==='Warhammer Legends'));
});
test('regiment, auxiliary and general references validate structure without pricing or eligibility claims',()=>{
  const d=draft();d.auxiliaries.push({instanceId:'aux-1',entryId:unit.id,reinforced:true});
  const r=validateArmyStructure(p,d);assert.equal(r.structureValid,true);assert.equal(r.status,'unverified');assert.equal(r.eligibilityVerified,false);assert.equal(r.pointsCalculated,false);assert.ok(r.pending.some(x=>x.includes('Reinforcement eligibility requires review')));
});
test('unknown identities, duplicate instances, wrong source roles and versions fail structurally',()=>{
  for(const mutate of [d=>d.context.sourceRevision='b'.repeat(40),d=>d.context.datasetVersion='other',d=>d.regiments[0].leader.entryId=unit.id,d=>d.regiments[0].units[0].entryId='killteam:captain',d=>d.regiments[0].units[0].instanceId='leader-1',d=>d.generalInstanceId='missing',d=>d.regiments[0].units[0].reinforced='yes']){const d=draft();mutate(d);assert.equal(validateArmyStructure(p,d).structureValid,false);}
});
test('inventory integrity and dev gates reject false currentness and accidental profile payloads',()=>{
  const e=JSON.parse(fs.readFileSync(path.join(root,'pilots/manifest.dev.json'),'utf8')).entries.find(e=>e.kind==='source-inventory');assert.equal(Buffer.byteLength(body),e.bytes);assert.equal(importInventory(body,e.sha256,'dev','localhost').id,p.id);
  assert.throws(()=>importInventory(body,e.sha256,'dev','ironbuilt.app'));assert.throws(()=>importInventory(body+' ',e.sha256,'dev','localhost'));
  for(const mutate of [q=>q.coverage.currentProfilesVerified=true,q=>q.entries[0].currentProfilesVerified=true,q=>q.entries[0].stats={health:1},q=>q.entries[0].id='killteam:wrong']){const q=structuredClone(p);mutate(q);assert.throws(()=>validateInventory(q));}
});
