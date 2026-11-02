'use strict';
const crypto=require('node:crypto');const {devAvailable}=require('./real-pilot.cjs');
const keys=['systemId','editionId','formatId','rulesetId','sourceRevision','datasetVersion'];
const check=(ok,m)=>{if(!ok)throw Error(m);};
function validateInventory(p){
  check(p&&p.schema==='ironbuilt-stormcast-inventory/1'&&p.releaseChannel==='dev'&&p.id==='aos:stormcast-inventory','Not a Stormcast source inventory');
  check(p.context&&p.context.systemId==='aos'&&p.context.editionId==='4e'&&p.context.formatId==='army-structure'&&/^[a-f0-9]{40}$/.test(p.context.sourceRevision)&&/^\d{4}\.\d{2}\.\d{2}-inventory\.\d+$/.test(p.context.datasetVersion),'Invalid source inventory context');
  const c=p.coverage;check(c&&c.sourceInventoryOnly===true&&c.currentProfilesVerified===false&&c.regimentEligibilityVerified===false&&c.fullValidation===false&&c.gameplay===false,'Inventory must not claim verified game support');
  check(p.authorization&&p.authorization.basis==='user-stated-rules-permission'&&Array.isArray(p.sources)&&p.sources.every(s=>/^[a-f0-9]{64}$/.test(s.sha256)&&/^https:\/\//.test(s.url)),'Missing inventory provenance');
  check(Array.isArray(p.entries)&&p.entries.length>0&&p.entries.length<500,'Invalid inventory');const seen=new Set();
  function inspect(o){if(!o||typeof o!=='object')return;for(const [key,value] of Object.entries(o)){check(!['stats','weapons','abilities','artwork','image','images','rawRules'].includes(key),'Source inventory cannot include unverified profile payloads');inspect(value);}}
  inspect(p);
  for(const e of p.entries){check(e&&typeof e.id==='string'&&e.id.startsWith('aos:catalogue:')&&!seen.has(e.id)&&typeof e.sourceId==='string'&&typeof e.name==='string','Invalid inventory identity');seen.add(e.id);
    check(['hero','unit'].includes(e.roleCandidate)&&e.currentProfilesVerified===false&&e.regimentEligibility==='unverified'&&e.reinforcementEligibility==='unverified'&&(e.sourcePoints===null||Number.isSafeInteger(e.sourcePoints)&&e.sourcePoints>=0)&&e.sourceRefs.every(i=>Number.isInteger(i)&&p.sources[i])&&e.basicProfileReferences.every(r=>r.currentVerified===false),'Unverified source entry mislabeled');
  }
  check(Array.isArray(p.pending)&&p.pending.length>0,'Missing inventory limitations');return p;
}
function validateArmyStructure(p,d){
  validateInventory(p);const errors=[],pending=[...p.pending],selected=new Map();
  const out=()=>({status:errors.length?'invalid':'unverified',structureValid:errors.length===0,eligibilityVerified:false,pointsCalculated:false,errors,pending});
  if(!d||!d.context||!keys.every(k=>d.context[k]===p.context[k])){errors.push('invalid-context');return out();}
  if(!Array.isArray(d.regiments)||d.regiments.length>20||!Array.isArray(d.auxiliaries)||d.auxiliaries.length>100){errors.push('invalid-army-structure');return out();}
  function line(l,leader=false){
    if(!l||typeof l.instanceId!=='string'||!l.instanceId||l.instanceId.length>100||typeof l.reinforced!=='boolean'||selected.has(l.instanceId)){errors.push('invalid-or-duplicate-instance');return;}
    const e=p.entries.find(e=>e.id===l.entryId);if(!e){errors.push('unknown-inventory-entry');return;}
    selected.set(l.instanceId,e);if(leader&&e.roleCandidate!=='hero')errors.push('source-role-is-not-a-hero');if(l.reinforced)pending.push('Reinforcement eligibility requires review for '+e.name+'.');
  }
  for(const r of d.regiments){if(!r||!Array.isArray(r.units)||r.units.length>100){errors.push('invalid-regiment-structure');continue;}line(r.leader,true);r.units.forEach(l=>line(l));}
  d.auxiliaries.forEach(l=>line(l));if(!selected.size)errors.push('empty-army-structure');
  if(d.generalInstanceId!==undefined&&!selected.has(d.generalInstanceId))errors.push('general-reference-not-selected');
  return out();
}
function importInventory(body,hash,env,host){check(devAvailable(env,host),'Inventory is dev/local only');check(typeof body==='string'&&Buffer.byteLength(body)<2000000&&/^[a-f0-9]{64}$/.test(hash)&&crypto.createHash('sha256').update(body).digest('hex')===hash,'Inventory integrity mismatch');return validateInventory(JSON.parse(body,(k,v)=>{check(!['__proto__','prototype','constructor'].includes(k),'Unsafe key');return v;}));}
module.exports={validateInventory,validateArmyStructure,importInventory};
