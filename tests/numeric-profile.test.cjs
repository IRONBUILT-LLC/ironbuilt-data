'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {adaptNumericProfile,validateNumericEvidence}=require('../tools/numeric-profile.cjs');
const context=systemId=>({systemId,editionId:systemId==='aos'?'4e':'2024',sourceRevision:'a'.repeat(40),source:{path:'synthetic.cat',sha256:'b'.repeat(64),url:'https://example.invalid/synthetic'}});
const profile=(type,names)=>({id:'synthetic-profile',name:'Invented fixture',type,conditional:false,fields:names.map(([name,value])=>({name,value}))});
const aos=()=>profile('Unit',[['Move','8"'],['Health','9'],['Save','5+'],['Control','4'],['Ability','Prose must never appear in output']]);
const kt=()=>profile('Operative',[['APL','2'],['Move','8'],['Save','4+'],['Wounds','9']]);
test('published review artifact contains no numerical stat payload or playable coverage',()=>{
  const fs=require('node:fs'),path=require('node:path');
  const r=JSON.parse(fs.readFileSync(path.join(__dirname,'../docs/pilots/minimal-review.json'),'utf8'));
  assert.equal(r.releaseChannel,'dev');assert.equal(r.numericValuesIncluded,false);
  assert.equal(r.playableRosterSupport,false);assert.equal(r.publishableDataset,false);
  function inspect(o){if(!o||typeof o!=='object')return;for(const [k,v] of Object.entries(o)){assert.ok(!['stats','values','characteristics','weapons','abilities','artwork'].includes(k),'Review metadata must not contain a real profile payload');inspect(v);}}
  inspect(r);assert.deepEqual(r.pilots.map(p=>p.systemId),['aos','killteam']);
});
test('distinct game adapters map only permitted numeric fields',()=>{
  const a=adaptNumericProfile(context('aos'),aos()),k=adaptNumericProfile(context('killteam'),kt());
  assert.deepEqual(a.stats,{moveInches:8,health:9,saveThreshold:5,control:4});
  assert.deepEqual(k.stats,{actionPointLimit:2,moveInches:8,saveThreshold:4,wounds:9});
  assert.ok(!JSON.stringify(a).includes('Prose')); assert.equal(a.publishable,false); assert.equal(a.auditOnly,true);
  assert.notEqual(a.id,k.id); assert.equal(a.status,'unverified');
});
test('serialized evidence rejects gameplay claims, extra content and cross-game corruption',()=>{
  const e=adaptNumericProfile(context('aos'),aos());
  assert.deepEqual(validateNumericEvidence(JSON.parse(JSON.stringify(e))),e);
  const patches=[x=>x.publishable=true,x=>x.status='legal',x=>x.artwork='image',x=>x.stats.wounds=5,x=>x.stats.health=0,x=>x.id='killteam:synthetic-profile',x=>x.provenance.sha256='latest',x=>x.provenance.url='https://user:secret@example.invalid',x=>x.stats.control=1.5];
  for(const patch of patches){const p=structuredClone(e);patch(p);assert.throws(()=>validateNumericEvidence(p));}
});
test('conditional values are withheld and never treated as base statistics',()=>{
  const p=aos();p.conditional=true;assert.deepEqual(adaptNumericProfile(context('aos'),p).stats,{});
  delete p.conditional;assert.deepEqual(adaptNumericProfile(context('aos'),p).stats,{});
});
test('expressions, wrong editions, cross-game profiles and duplicate fields fail closed',()=>{
  assert.throws(()=>adaptNumericProfile(context('aos'),kt()));
  assert.throws(()=>adaptNumericProfile({...context('aos'),editionId:'3e'},aos()));
  assert.throws(()=>adaptNumericProfile({...context('aos'),source:null},aos()));
  for(const v of ['D6','6 plus prose','-1','999','3/6']) {const p=aos();p.fields[0].value=v;assert.throws(()=>adaptNumericProfile(context('aos'),p));}
  const p=aos();p.fields.push(p.fields[0]);assert.throws(()=>adaptNumericProfile(context('aos'),p));
});
