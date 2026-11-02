'use strict';
const crypto=require('node:crypto');
const {validateNumericEvidence}=require('./numeric-profile.cjs');
const systems={aos:{edition:'4e',format:'unit-configuration'},killteam:{edition:'2024',format:'operative-configuration'}};
const integer=(n,min,max)=>Number.isSafeInteger(n)&&n>=min&&n<=max;
function requireValue(ok,message){if(!ok)throw Error(message);}
function devAvailable(env,host){return env!=='prod'&&['localhost','127.0.0.1','[::1]','dev--ironbuilt40k.netlify.app'].includes(host);}
function validatePilot(p){
  requireValue(p&&p.schema==='ironbuilt-real-pilot/1'&&p.releaseChannel==='dev'&&p.synthetic===false,'Not a real dev pilot');
  const c=p.context,s=c&&Object.hasOwn(systems,c.systemId)&&systems[c.systemId];
  requireValue(s&&c.editionId===s.edition&&c.formatId===s.format&&typeof c.rulesetId==='string'&&/^\d{4}\.\d{2}\.\d{2}-pilot\.\d+$/.test(c.datasetVersion||'')&&/^[a-f0-9]{40}$/.test(c.sourceRevision),'Invalid game context');
  requireValue(p.coverage&&p.coverage.complete===false&&p.coverage.playableRoster===false&&p.coverage.fullValidation===false&&p.coverage.combat===false,'Pilot cannot claim gameplay coverage');
  requireValue(p.authorization&&p.authorization.basis==='user-stated-rules-permission'&&p.authorization.date==='2026-11-02'&&p.authorization.originalAbilityWording===true,'Missing recorded rules-use basis');
  function inspect(value){if(!value||typeof value!=='object')return;for(const [key,item] of Object.entries(value)){requireValue(!['artwork','images','image','rawRules','verbatimText'].includes(key),'Artwork and raw rules are excluded from pilots');inspect(item);}}
  inspect(p);
  requireValue(Array.isArray(p.pending)&&p.pending.length>0&&Array.isArray(p.sources)&&p.sources.length>0,'Missing provenance or pending coverage');
  for(const source of p.sources)requireValue(typeof source.url==='string'&&source.url.startsWith('https://')&&/^[a-f0-9]{64}$/.test(source.sha256)&&typeof source.location==='string','Invalid source provenance');
  const prefix=c.systemId+':',seen=new Set();
  for(const entity of [p.entity,...p.weapons,...p.abilities]){
    requireValue(entity&&typeof entity.id==='string'&&entity.id.startsWith(prefix)&&typeof entity.name==='string'&&!seen.has(entity.id),'Duplicate/cross-game entity');seen.add(entity.id);
    requireValue(Array.isArray(entity.sourceRefs)&&entity.sourceRefs.length>0&&entity.sourceRefs.every(i=>integer(i,0,p.sources.length-1)),'Missing entity source');
  }
  validateNumericEvidence(p.entity.basic);
  requireValue(p.entity.basic.context.systemId===c.systemId&&p.entity.basic.context.sourceRevision===c.sourceRevision&&Object.keys(p.entity.basic.stats).length===4,'Cross-game or missing basic profile');
  requireValue(p.entity.weaponRefs.every(id=>p.weapons.some(w=>w.id===id))&&p.entity.abilityRefs.every(id=>p.abilities.some(a=>a.id===id)),'Missing referenced weapon or ability');
  for(const w of p.weapons){
    requireValue(integer(w.attacks,1,100)&&integer(w.hit,2,6)&&Array.isArray(w.keywords),'Invalid weapon profile');
    if(c.systemId==='aos')requireValue(integer(w.wound,2,6)&&integer(w.rend,0,10)&&integer(w.damage,1,100)&&w.kind==='melee','Invalid AoS weapon');
    else requireValue(integer(w.damageNormal,0,100)&&integer(w.damageCritical,0,100)&&['melee','ranged'].includes(w.kind)&&(w.kind!=='ranged'||integer(w.rangeInches,1,100)),'Invalid KT weapon');
  }
  for(const a of p.abilities)requireValue(typeof a.summary==='string'&&a.summary.length>0&&a.summary.length<2000&&a.wording==='original'&&a.automated===false&&a.mechanics&&typeof a.mechanics==='object','Unreviewed ability wording');
  if(c.systemId==='aos')requireValue(integer(p.selection.baseModels,1,100)&&integer(p.selection.basePoints,0,10000)&&p.selection.maxReinforcements===1&&p.selection.championMaximum===1&&p.selection.grandhammerPerModels===5&&p.selection.championMayTakeGrandhammer===false,'Unsupported AoS selection contract');
  else requireValue(p.selection.maximumCaptain===1&&p.selection.fixedLoadout==='plasma-pistol-and-power-fist','Unsupported Captain selection contract');
  return p;
}
function importPilot(body,expectedHash,env,host){
  requireValue(devAvailable(env,host),'Real pilots are available only on explicit dev/local hosts');
  requireValue(typeof body==='string'&&Buffer.byteLength(body)<=1000000,'Invalid pilot size');
  requireValue(/^[a-f0-9]{64}$/.test(expectedHash)&&crypto.createHash('sha256').update(body).digest('hex')===expectedHash,'Pilot checksum mismatch');
  return validatePilot(JSON.parse(body,(k,v)=>{requireValue(!['__proto__','prototype','constructor'].includes(k),'Unsafe pilot key');return v;}));
}
function validateSelection(p,draft){
  validatePilot(p);
  const errors=[],totals={};
  if(!draft||!draft.context||!['systemId','editionId','rulesetId','formatId','sourceRevision','datasetVersion'].every(k=>draft.context[k]===p.context[k]))return {status:'invalid',errors:['Different game, edition, format, rules, source revision or dataset version'],totals};
  if(p.context.systemId==='aos'){
    const s=p.selection;
    if(!integer(draft.reinforcements,0,s.maxReinforcements)||!integer(draft.champions,0,s.championMaximum)||!integer(draft.grandhammers,0,2)||typeof draft.championHasGrandhammer!=='boolean')errors.push('Invalid model configuration');
    else{
      totals.models=s.baseModels*(1+draft.reinforcements);totals.points=s.basePoints*(1+draft.reinforcements);
      if(draft.grandhammers>Math.floor(totals.models/s.grandhammerPerModels))errors.push('Too many grandhammers');
      if(draft.championHasGrandhammer)errors.push('The champion cannot take the grandhammer');
      if(draft.models!==totals.models)errors.push('Model count does not match reinforcement');
    }
  }else{
    if(draft.captains!==1||draft.loadout!==p.selection.fixedLoadout)errors.push('Pilot requires one Captain with his fixed loadout');
    totals.operatives=draft.captains;
  }
  return {status:errors.length?'invalid':'unverified',errors,totals,pending:p.pending};
}
module.exports={validatePilot,importPilot,validateSelection,devAvailable};
