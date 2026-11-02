'use strict';
const crypto=require('node:crypto');
const {devAvailable}=require('./real-pilot.cjs');
const contextKeys=['systemId','editionId','formatId','rulesetId','sourceRevision','datasetVersion'];
const integer=(n,min,max)=>Number.isSafeInteger(n)&&n>=min&&n<=max;
const insist=(ok,message)=>{if(!ok)throw Error(message);};
function validateTeamPack(p){
  insist(p&&p.schema==='ironbuilt-team-preview/1'&&p.releaseChannel==='dev'&&p.synthetic===false&&p.name==='Angels of Death','Unsupported team pack');
  const c=p.context;insist(c&&c.systemId==='killteam'&&c.editionId==='2024'&&c.formatId==='selected-team'&&typeof c.rulesetId==='string'&&/^[a-f0-9]{40}$/.test(c.sourceRevision)&&/^\d{4}\.\d{2}\.\d{2}-pilot\.\d+$/.test(c.datasetVersion),'Invalid selected-team context');
  insist(p.authorization&&p.authorization.basis==='user-stated-rules-permission'&&p.authorization.originalAbilityWording===true,'Missing rules-use basis');
  insist(p.coverage&&p.coverage.operativeOptionsComplete===true&&p.coverage.weaponOptionsComplete===true&&p.coverage.fullRules===false&&p.coverage.fullValidation===false&&p.coverage.combat===false&&p.coverage.appUI===false,'Invalid coverage claims');
  insist(Array.isArray(p.sources)&&p.sources.length>=2&&p.sources.every(s=>s&&/^https:\/\//.test(s.url)&&/^[a-f0-9]{64}$/.test(s.sha256)),'Invalid source identity');
  const sourceRefs=e=>Array.isArray(e.sourceRefs)&&e.sourceRefs.length&&e.sourceRefs.every(i=>integer(i,0,p.sources.length-1))&&typeof e.officialLocation==='string';
  const tables=['operatives','weapons','abilities','actions','tactics','teamRules'],allIds=new Set();
  for(const table of tables){
    insist(Array.isArray(p[table])&&p[table].length<=200,'Invalid entity table');
    for(const e of p[table]){insist(e&&typeof e.id==='string'&&e.id.startsWith('killteam:')&&!allIds.has(e.id)&&typeof e.name==='string'&&sourceRefs(e),'Invalid namespaced entity/provenance');allIds.add(e.id);}
  }
  function inspect(o){if(!o||typeof o!=='object')return;for(const [key,value] of Object.entries(o)){insist(!['artwork','image','images','rawRules','verbatimText'].includes(key),'Artwork/raw rules prohibited');inspect(value);}}
  inspect(p);
  const weapons=new Set(p.weapons.map(w=>w.id)),abilities=new Set(p.abilities.map(a=>a.id)),actions=new Set(p.actions.map(a=>a.id));
  insist(p.operatives.length===9&&p.operatives.filter(o=>o.leader).length===3&&p.tactics.length===8,'Incomplete reviewed operative/tactic inventory');
  for(const w of p.weapons)insist(integer(w.attacks,1,100)&&integer(w.hit,2,6)&&integer(w.damageNormal,0,100)&&integer(w.damageCritical,0,100)&&['melee','ranged'].includes(w.kind)&&(w.rangeInches===null||integer(w.rangeInches,1,100))&&Array.isArray(w.keywords)&&w.keywords.every(k=>typeof k==='string')&&typeof w.sourceId==='string'&&typeof w.sourceEntryId==='string','Invalid typed weapon');
  for(const o of p.operatives){
    const b=o.basic;insist(b&&integer(b.actionPointLimit,1,10)&&integer(b.moveInches,0,100)&&integer(b.saveThreshold,2,7)&&integer(b.wounds,1,100)&&typeof o.basicSourceId==='string'&&typeof o.sourceId==='string'&&typeof o.leader==='boolean'&&typeof o.warrior==='boolean'&&integer(o.baseMillimetres,1,200),'Invalid operative profile');
    insist(o.warrior===o.name.endsWith('Warrior')&&o.additionalChapterTactics===(o.name.endsWith('Sergeant')?1:undefined),'Invalid operative selection capability');
    insist(Array.isArray(o.weaponRefs)&&o.weaponRefs.length&&o.weaponRefs.every(w=>weapons.has(w))&&o.abilityRefs.every(a=>abilities.has(a))&&o.actionRefs.every(a=>actions.has(a)),'Unresolved operative references');
    insist(Array.isArray(o.loadouts)&&o.loadouts.length>0&&o.loadouts.length<=30,'Missing explicit loadouts');
    const seen=new Set();for(const l of o.loadouts){insist(typeof l.id==='string'&&l.id.startsWith(o.id+':loadout:')&&!seen.has(l.id)&&sourceRefs(l)&&Array.isArray(l.weaponRefs)&&l.weaponRefs.length&&l.weaponRefs.every(w=>o.weaponRefs.includes(w)),'Invalid loadout');seen.add(l.id);}
  }
  for(const r of [...p.abilities,...p.actions,...p.tactics,...p.teamRules])insist(r.wording==='original'&&r.automated===false&&typeof r.summary==='string'&&r.summary.length>0&&r.summary.length<2000&&r.mechanics&&typeof r.mechanics==='object','Unreviewed rule summary');
  const s=p.selection;insist(s&&s.totalOperatives===6&&s.leaders===1&&s.otherOperatives===5&&s.nonWarriorMaximum===1&&s.warriorMaximum===5&&s.chapterTactics.options.length===8&&s.chapterTactics.options.every(id=>p.tactics.some(t=>t.id===id)),'Unsupported composition contract');
  insist(Array.isArray(p.pending)&&p.pending.length>0,'Missing partial-rules disclosure');return p;
}
function validateTeamSelection(p,d){
  validateTeamPack(p);const errors=[],totals={operatives:0,leaders:0,otherOperatives:0};
  const result=()=>({status:errors.length?'invalid':'unverified',compositionValid:errors.length===0,errors,totals,pending:p.pending});
  if(!d||!d.context||!contextKeys.every(k=>d.context[k]===p.context[k])){errors.push('invalid-context');return result();}
  if(!Array.isArray(d.lines)||d.lines.length>100){errors.push('invalid-lines');return result();}
  const allowed=new Set(p.tactics.map(t=>t.id)),t=d.chapterTactics;
  if(!t||!allowed.has(t.primaryId)||!allowed.has(t.secondaryId))errors.push('invalid-chapter-tactic');
  if(d.campaignLock&&(!t||t.primaryId!==d.campaignLock.primaryId||t.secondaryId!==d.campaignLock.secondaryId))errors.push('campaign-tactic-mismatch');
  totals.operatives=d.lines.length;if(totals.operatives!==6)errors.push('operative-count');
  const instances=new Set(),counts=new Map();
  for(const line of d.lines){
    if(!line||typeof line.instanceId!=='string'||!line.instanceId||line.instanceId.length>100||Object.hasOwn(line,'quantity')){errors.push('invalid-line');continue;}
    if(instances.has(line.instanceId))errors.push('duplicate-instance');instances.add(line.instanceId);
    const o=p.operatives.find(o=>o.id===line.operativeId);if(!o){errors.push('unknown-operative');continue;}
    if(o.leader)totals.leaders++;else totals.otherOperatives++;
    const count=(counts.get(o.id)||0)+1;counts.set(o.id,count);if(count>(o.warrior?5:1))errors.push('unique-operative');
    if(!o.loadouts.some(l=>l.id===line.loadoutId))errors.push('invalid-loadout');
    if(o.additionalChapterTactics===1){if(!allowed.has(line.additionalTacticId))errors.push('missing-additional-tactic');}
    else if(line.additionalTacticId!==undefined)errors.push('unexpected-additional-tactic');
  }
  if(totals.leaders!==1)errors.push('leader-count');if(totals.otherOperatives!==5)errors.push('other-operative-count');return result();
}
function importTeamPack(body,hash,env,host){
  insist(devAvailable(env,host),'Selected-team packs are dev/local only');
  insist(typeof body==='string'&&Buffer.byteLength(body)<=2000000&&/^[a-f0-9]{64}$/.test(hash)&&crypto.createHash('sha256').update(body).digest('hex')===hash,'Team checksum/size mismatch');
  return validateTeamPack(JSON.parse(body,(k,v)=>{insist(!['__proto__','prototype','constructor'].includes(k),'Unsafe key');return v;}));
}
module.exports={validateTeamPack,validateTeamSelection,importTeamPack};
