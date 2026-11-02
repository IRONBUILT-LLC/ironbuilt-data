'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const {validatePack, validateDraft, importPack} = require('../tools/multigame.cjs');
const read = name => JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', name + '.json'), 'utf8'));
const aos = read('aos-synthetic'), kt = read('killteam-synthetic');
const army = () => ({context:{...aos.context}, pointsLimit:300, regiments:[{leaderId:'aos:test-leader', units:[{unitId:'aos:test-unit', reinforced:true}]}]});
const team = () => ({context:{...kt.context}, teamId:'killteam:test-team', operatives:[{operativeId:'killteam:test-leader',loadoutId:'standard'},{operativeId:'killteam:test-operative',loadoutId:'standard'}]});
test('both synthetic contracts import with exact byte integrity', () => {
  for (const p of [aos, kt]) {
    const body = JSON.stringify(p), hash = crypto.createHash('sha256').update(body).digest('hex');
    assert.deepEqual(importPack(body, hash), p);
    assert.throws(() => importPack(body + ' ', hash), /checksum/);
  }
});
test('source rights, identity, date, scope and entity namespace fail closed', () => {
  const patches = [p=>p.provenance.rightsStatus='unknown',p=>p.provenance.sha256='latest',p=>p.coverage.complete=true,p=>p.context.editionId='3e',p=>p.units[0].id='wh40k:collision',p=>p.units.push(p.units[0]),p=>p.checkedAt='',p=>p.synthetic=false,p=>p.releaseChannel='production'];
  for (const mutate of patches) { const p=structuredClone(aos); mutate(p); assert.throws(()=>validatePack(p)); }
});
test('cross-game, format, rules and revision drafts are rejected', () => {
  for (const k of Object.keys(aos.context)) { const d=army(); d.context[k]='other'; assert.equal(validateDraft(aos,d).status,'invalid'); }
  assert.equal(validateDraft(aos,team()).status,'invalid');
});
test('AoS regiment eligibility, reinforcement and points are separate concepts', () => {
  const d=army(); const r=validateDraft(aos,d);
  assert.equal(r.totals.points,300); assert.equal(r.status,'unverified');
  d.pointsLimit=299; assert.equal(validateDraft(aos,d).status,'invalid');
  d.pointsLimit=300; d.regiments[0].units[0].unitId='aos:ineligible'; assert.equal(validateDraft(aos,d).status,'invalid');
  const p=structuredClone(aos); p.units[1].reinforceable=false; assert.equal(validateDraft(p,army()).status,'invalid');
  d.regiments[0].units=Array(4).fill({unitId:'aos:test-unit',reinforced:false}); assert.equal(validateDraft(aos,d).status,'invalid');
});
test('Kill Team checks operative bounds, eligibility, duplicates and loadouts without points', () => {
  const d=team(); assert.equal(validateDraft(kt,d).status,'unverified');
  assert.deepEqual(validateDraft(kt,d).totals,{operatives:2});
  d.operatives[1].loadoutId='unknown'; assert.equal(validateDraft(kt,d).status,'invalid');
  d.operatives=[team().operatives[0],team().operatives[0]]; assert.equal(validateDraft(kt,d).status,'invalid');
  d.operatives=[]; assert.equal(validateDraft(kt,d).status,'invalid');
  d.operatives=[null,null]; assert.equal(validateDraft(kt,d).status,'invalid');
});
test('malformed imported data and unsafe keys are rejected', () => {
  const body='{"__proto__":{}}', hash=crypto.createHash('sha256').update(body).digest('hex');
  assert.throws(()=>importPack(body,hash),/Unsafe/);
  for (const value of [null,{},[],{context:aos.context}]) assert.equal(validateDraft(aos,value).status,'invalid');
  const p=structuredClone(kt); p.operatives[0].maxSelections=1.5; assert.throws(()=>validatePack(p));
});
test('prototype never enters public dataset feed', () => {
  const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'../manifest.json'),'utf8'));
  assert.ok(!manifest.datasets.some(d=>['aos','killteam'].includes(d.game)));
  assert.equal(aos.synthetic,true); assert.equal(kt.synthetic,true);
});
