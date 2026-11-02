'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {operativeRules,tactics,rule}=require('./angels-reviewed-rules.cjs');
const root=path.join(__dirname,'..');
const ref=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
if(ref.schema!=='ironbuilt-angels-reference/1'||ref.sourceRevision!=='30c48ce2bdcabc0cb6516f813283086cc2d78fab'||ref.sourceSha256!=='2882d3107b9f853e10e5d0ded1aade098ce6a095cc9a742ce68e268aff8faee5'||ref.models.length!==9)throw Error('Unreviewed source snapshot');
const captain=JSON.parse(fs.readFileSync(path.join(root,'pilots/killteam-angels-captain.json')));
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const number=s=>{if(!/^\d+["+]?$/u.test(s))throw Error('Unsupported numeric value: '+s);return Number(s.match(/^\d+/)[0]);};
const p={schema:'ironbuilt-team-preview/1',id:'killteam:angels-of-death',releaseChannel:'dev',synthetic:false,name:'Angels of Death',checkedAt:'2026-11-02',
  context:{...captain.context,formatId:'selected-team',rulesetId:'2026-10-angels-of-death',datasetVersion:'2026.11.02-pilot.2'},authorization:captain.authorization,attribution:captain.attribution,sources:captain.sources,
  coverage:{operativeOptionsComplete:true,weaponOptionsComplete:true,weaponScope:'Operative-card weapons; universal equipment excluded',compositionChecks:true,fullRules:false,fullValidation:false,combat:false,appUI:false},operatives:[],weapons:[],abilities:[],actions:[],tactics:[],teamRules:[],sourceDiscrepancies:[],pending:['Ploys, faction/universal equipment and grenade profiles are not included.','Weapon keyword effects, Chapter tactics and operative abilities are reference descriptions, not executed gameplay.','Mission restrictions, event roster locks and in-game ploy changes are outside composition validation.']};
const pages={'Space Marine Captain':[1],'Assault Intercessor Sergeant':[1],'Intercessor Sergeant':[1,2],'Assault Intercessor Grenadier':[2],'Assault Intercessor Warrior':[2],'Heavy Intercessor Gunner':[2],'Intercessor Gunner':[3],'Intercessor Warrior':[3],'Eliminator Sniper':[3]};
const provenance=(sourceId,page)=>({sourceId,sourceRefs:[0,1],officialLocation:'Angels of Death PDF page(s) '+page.join(', '),verification:'official-card-visually-reviewed'});
const weapons=new Map();
for(const m of ref.models){
  const id='killteam:'+slug(m.name),families=new Map(),weaponRefs=[];
  for(const w of m.weapons){
    if(w.unresolvedModifiers.length)throw Error('Unresolved profile modifiers: '+w.name);
    const [normal,critical]=w.fields.DMG.split('/').map(number),attacks=number(w.fields.ATK),hit=number(w.fields.HIT);
    const wid='killteam:weapon:'+w.sourceId+':a'+attacks+'h'+hit;
    let keywords=w.fields.WR==='-'?[]:w.fields.WR.split(',').map(s=>s.trim());
    const range=keywords.find(s=>s.startsWith('Range '));keywords=keywords.filter(s=>!s.startsWith('Range '));
    const melee=/^(Fists|Chainsword|Power fist|Power weapon|Thunder hammer)$/i.test(w.name);
    if(w.name==='Bolt sniper rifle (hyperfrag)'&&keywords.includes('Blast 1')){
      keywords=keywords.map(x=>x==='Blast 1'?'Blast 1"':x);
      if(!p.sourceDiscrepancies.some(d=>d.sourceId===w.sourceId))p.sourceDiscrepancies.push({sourceId:w.sourceId,field:'weapon rule distance unit',sourceValue:'Blast 1',effectiveValue:'Blast 1 inch',authority:'Official PDF page 3'});
    }
    const weapon={id:wid,name:w.name,kind:melee?'melee':'ranged',attacks,hit,damageNormal:normal,damageCritical:critical,rangeInches:melee?null:range?number(range.slice(6)):null,keywords,...provenance(w.sourceId,pages[m.name]),sourceEntryId:w.sourceEntryId,contextOperativeSourceIds:[m.sourceId],appliedModifiers:w.appliedModifiers};
    if(weapons.has(wid)){const prev=weapons.get(wid);prev.contextOperativeSourceIds.push(m.sourceId);prev.officialLocation+='; '+weapon.officialLocation;}else weapons.set(wid,weapon);
    weaponRefs.push(wid);const family=families.get(w.sourceEntryId)||{name:w.name.replace(/ \((standard|supercharge|heavy|mobile|focused|sweeping|frag|krak|hyperfrag|executioner|mortis)\)$/,''),weapons:[]};family.weapons.push(wid);families.set(w.sourceEntryId,family);
  }
  const o={id,name:m.name,...provenance(m.sourceId,pages[m.name]),basicSourceId:m.basicSourceId,basic:{actionPointLimit:number(m.stats.APL),moveInches:number(m.stats.Move),saveThreshold:number(m.stats.Save),wounds:number(m.stats.Wounds)},leader:['Space Marine Captain','Assault Intercessor Sergeant','Intercessor Sergeant'].includes(m.name),warrior:m.name.endsWith('Warrior'),baseMillimetres:m.name==='Space Marine Captain'||m.name==='Eliminator Sniper'||m.name==='Heavy Intercessor Gunner'?40:32,weaponRefs:[...new Set(weaponRefs)],abilityRefs:[],actionRefs:[],loadouts:[]};
  for(const a of m.abilityProfiles){
    const inherited=captain.abilities.find(x=>x.sourceId===a.sourceId);
    const reviewed=operativeRules[a.sourceId]||inherited;
    if(!reviewed)throw Error('Ability/action lacks original reviewed wording: '+a.name);
    const entity={id:'killteam:rule:'+a.sourceId,name:a.name,...provenance(a.sourceId,pages[m.name]),wording:'original',automated:false,summary:reviewed.summary,mechanics:reviewed.mechanics};
    if(a.type==='Unique Actions'){p.actions.push(entity);o.actionRefs.push(entity.id);}else{p.abilities.push(entity);o.abilityRefs.push(entity.id);}
  }
  function addLoadout(entryIds){
    if(entryIds.some(x=>!families.has(x)))throw Error('Missing weapon family for '+m.name);
    const loadout={id:id+':loadout:'+entryIds.join('.'),name:entryIds.map(x=>families.get(x).name).join(' + '),sourceEntryIds:entryIds,weaponRefs:entryIds.flatMap(x=>families.get(x).weapons),sourceRefs:[0,1],officialLocation:'Angels of Death PDF page 12, '+m.name+' selection'};
    o.loadouts.push(loadout);
  }
  const familyIds=[...families.keys()];
  const getFamily=name=>familyIds.find(id=>families.get(id).name.toLowerCase()===name.toLowerCase());
  if(m.name==='Assault Intercessor Sergeant'){
    for(const ranged of ['Hand Flamer','Heavy bolt pistol'])for(const melee of ['Chainsword','Power fist','Power weapon','Thunder hammer'])addLoadout([getFamily(ranged),getFamily(melee)]);
    addLoadout([getFamily('Plasma pistol'),getFamily('Chainsword')]);
  }else if(m.name==='Intercessor Sergeant'){
    for(const ranged of ['Auto bolt rifle','Bolt rifle','Stalker bolt rifle'])for(const melee of ['Chainsword','Fists','Power fist','Power weapon','Thunder hammer'])addLoadout([getFamily(ranged),getFamily(melee)]);
  }else if(['Intercessor Warrior','Intercessor Gunner'].includes(m.name)){
    for(const ranged of ['Auto bolt rifle','Bolt rifle','Stalker bolt rifle'])addLoadout([getFamily(ranged),getFamily('Fists'),...(m.name==='Intercessor Gunner'?[getFamily('Auxiliary grenade launcher')]:[])]);
  }else addLoadout(familyIds);
  if(m.name.endsWith('Sergeant'))o.additionalChapterTactics=1;
  p.operatives.push(o);
}
p.weapons=[...weapons.values()];
p.tactics=tactics.map(t=>({id:'killteam:tactic:'+slug(t.name),...t,...provenance(t.sourceId,[4,5])}));
p.teamRules.push({id:'killteam:astartes',name:'Astartes',sourceRefs:[1],officialLocation:'Angels of Death PDF page 5',verification:'official-card-visually-reviewed',...rule('In each friendly ANGEL OF DEATH activation, it may take either two Shoot actions or two Fight actions. For two Shoots, at least one must use a bolt weapon; if both use its bolt sniper rifle or heavy bolter, the second costs +1AP. Friendly ANGEL OF DEATH operatives may counteract with either order.',{target:'friendly ANGEL OF DEATH operatives',perActivationOptions:['two Shoot actions','two Fight actions'],twoShootRequirement:'at least one bolt weapon',secondShootExtraAP:{value:1,condition:'both actions use the bolt sniper rifle or both use the heavy bolter'},counteractRegardlessOfOrder:true})});
p.selection={totalOperatives:6,leaders:1,otherOperatives:5,nonWarriorMaximum:1,warriorMaximum:5,weaponProfileModesGroupedBy:'sourceEntryId',chapterTactics:{primary:1,secondary:1,options:p.tactics.map(t=>t.id),duplicatesDoNotStack:true,seriesChoicesLocked:true,secondaryCanChangeInGameVia:'Adaptive Tactics'},sourceRefs:[1],officialLocation:'PDF pages 4-5 and 12'};
p.sourceDiscrepancies.push({sourceId:'42bd-e2a7-e8f2-1d75',field:'Doctrine Warfare choices',sourceValue:['Devastator','Tactical'],effectiveValue:['Assault','Tactical'],authority:'Official PDF page 1'},{sourceId:'b32f-5a76-356e-68cb',field:'Doctrine Warfare use limits',sourceValue:'No once-per-battle use limit in source profile text',effectiveValue:'Each listed doctrine once per battle',authority:'Official PDF page 2'});
require('./add-angels-support.cjs')(p);
const {validateTeamPack}=require('./team-preview.cjs');validateTeamPack(p);
fs.writeFileSync(path.join(root,'pilots/killteam-angels-team.json'),JSON.stringify(p,null,2)+'\n');
console.log(JSON.stringify({operatives:p.operatives.length,weaponProfiles:p.weapons.length,loadouts:p.operatives.reduce((n,o)=>n+o.loadouts.length,0),abilities:p.abilities.length,actions:p.actions.length,tactics:p.tactics.length}));
