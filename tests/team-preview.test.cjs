'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {validateTeamPack,validateTeamSelection,importTeamPack}=require('../tools/team-preview.cjs');
const root=path.join(__dirname,'..'),body=fs.readFileSync(path.join(root,'pilots/killteam-angels-team.json'),'utf8'),p=validateTeamPack(JSON.parse(body));
const fixtures=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/angels-team-rosters.json'),'utf8'));
test('all valid and invalid composition fixtures have the expected result',()=>{
  for(const f of fixtures.cases){const r=validateTeamSelection(p,f.roster);assert.equal(r.compositionValid,f.expectedCompositionValid,f.name+': '+r.errors);for(const code of f.expectedErrors||[])assert.ok(r.errors.includes(code),f.name+': missing '+code);if(r.compositionValid)assert.equal(r.status,'unverified','Composition does not certify complete gameplay legality');}
});
test('all nine operative types and all 35 reviewed loadouts can form a valid selected team',()=>{
  assert.equal(p.operatives.length,9);assert.equal(p.weapons.filter(w=>w.scope!=='universal-equipment').length,27);assert.equal(p.operatives.reduce((n,o)=>n+o.loadouts.length,0),35);
  const base=fixtures.cases.find(c=>c.name==='Captain and five Intercessor Warriors').roster;
  for(const o of p.operatives)for(const l of o.loadouts){const d=structuredClone(base),i=o.leader?0:1;d.lines[i]={instanceId:'reviewed-'+i,operativeId:o.id,loadoutId:l.id};if(o.additionalChapterTactics)d.lines[i].additionalTacticId=p.tactics[0].id;assert.equal(validateTeamSelection(p,d).compositionValid,true,o.name+' / '+l.name);}
});
test('contextual weapons and official ability overrides preserve the reviewed mechanics',()=>{
  const weapon=(operative,source)=>{const o=p.operatives.find(o=>o.name===operative);return p.weapons.find(w=>w.sourceId===source&&o.weaponRefs.includes(w.id));};
  assert.deepEqual(['Space Marine Captain','Assault Intercessor Sergeant','Intercessor Sergeant'].map(n=>{const w=weapon(n,'fe27-204c-ff2d-ce83');return [w.attacks,w.hit];}),[[5,3],[5,4],[4,4]]);
  const assault=p.abilities.find(a=>a.sourceId==='42bd-e2a7-e8f2-1d75'),inter=p.abilities.find(a=>a.sourceId==='b32f-5a76-356e-68cb');
  assert.deepEqual(assault.mechanics.choices,['Assault','Tactical']);assert.deepEqual(inter.mechanics.choices,['Devastator','Tactical']);assert.equal(inter.mechanics.usesPerChoice,1);assert.equal(inter.mechanics.sharedBetweenChoices,false);
  assert.ok(p.weapons.find(w=>w.name==='Bolt sniper rifle (hyperfrag)').keywords.includes('Blast 1"'));
  const optics=p.actions[0].mechanics;assert.equal(optics.actionCostAP,1);assert.equal(optics.expires,'start of this operative next activation');assert.equal(optics.prohibitedWhen,'within enemy operative control range');
});
test('all basic profiles and loadout restrictions match the reviewed official cards',()=>{
  const expected={'Space Marine Captain':[3,6,3,15],'Assault Intercessor Sergeant':[3,6,3,15],'Intercessor Sergeant':[3,6,3,15],'Assault Intercessor Grenadier':[3,6,3,14],'Assault Intercessor Warrior':[3,6,3,14],'Eliminator Sniper':[3,7,3,12],'Heavy Intercessor Gunner':[3,5,3,18],'Intercessor Gunner':[3,6,3,14],'Intercessor Warrior':[3,6,3,14]};
  for(const o of p.operatives)assert.deepEqual([o.basic.actionPointLimit,o.basic.moveInches,o.basic.saveThreshold,o.basic.wounds],expected[o.name],o.name);
  const a=p.operatives.find(o=>o.name==='Assault Intercessor Sergeant');assert.equal(a.loadouts.length,9);
  for(const l of a.loadouts){if(l.sourceEntryIds.includes('187a-3d95-c7db-7496'))assert.deepEqual(l.sourceEntryIds,['187a-3d95-c7db-7496','c81d-2f29-2203-ce5b']);}
  assert.equal(p.operatives.find(o=>o.name==='Intercessor Sergeant').loadouts.length,15);
  assert.ok(p.operatives.every(o=>o.officialLocation&&o.sourceRefs.includes(1)&&o.basicSourceId));assert.ok(p.weapons.every(w=>w.officialLocation&&w.sourceId&&w.sourceRefs.includes(w.scope==='universal-equipment'?2:1)));
});
test('pack import checks dev host, bytes, source links and namespaced references',()=>{
  const entry=JSON.parse(fs.readFileSync(path.join(root,'pilots/manifest.dev.json'),'utf8')).entries.find(e=>e.kind==='selected-team');
  assert.equal(Buffer.byteLength(body),entry.bytes);assert.equal(importTeamPack(body,entry.sha256,'dev','localhost').id,p.id);
  assert.throws(()=>importTeamPack(body,entry.sha256,'dev','ironbuilt.app'));assert.throws(()=>importTeamPack(body,entry.sha256,'prod','localhost'));assert.throws(()=>importTeamPack(body+' ',entry.sha256,'dev','localhost'));
  for(const mutate of [q=>q.weapons[0].id='aos:wrong',q=>q.operatives[0].loadouts[0].weaponRefs=['killteam:missing'],q=>q.operatives[0].basic.wounds=0,q=>q.coverage.fullValidation=true,q=>q.abilities[0].wording='verbatim',q=>q.sources[0].sha256='latest',q=>q.operatives[0].image='art.png']){const q=structuredClone(p);mutate(q);assert.throws(()=>validateTeamPack(q));}
});
