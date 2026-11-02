'use strict';
const {ploys,equipment,actions,keywords}=require('./angels-support-rules.cjs');
module.exports=function addSupport(p){
  p.sources.push(
    {url:'https://assets.warhammer-community.com/eng_28-10_kill_team_key_downloads_universal_equipment-oz2irjwu3t-dj0aczxjeo.pdf',sha256:'b6130c6a52585c11f23065816addee321d035fb9329f33c836ef7a5c4dd5f204',location:'Universal Equipment October 2026, PDF pages 1-7',updated:'2026-10-28'},
    {url:'https://github.com/BSData/wh40k-killteam/blob/30c48ce2bdcabc0cb6516f813283086cc2d78fab/2024%20-%20Kill%20Team.gst',sha256:'4d045717f1d6d82a58fca65d472cda3036f2fd176c99c1d06c46db81b537641b',location:'2024 - Kill Team.gst sharedRules and universal equipment',revision:p.context.sourceRevision},
    {url:'https://assets.warhammer-community.com/eng_jul25_kt_lite_rules-jmjv4hdamy-qlsqxdf83p.pdf',sha256:'368eaa5e555550d64542f475b2696ef19f77712b48ab153db23256ac46ab2db1',location:'Lite Rules PDF page 1, ploy costs and repeat limits',updated:'2025-07-23'},
    {url:'https://www.warhammer-community.com/en-gb/articles/ujdaRY04/soar-above-the-killzone-and-blow-it-all-up-with-new-universal-equipment/',sha256:'b7088dfecae99b4c974f664b6bce0bf607ff24dc1cf4ceeb72cdf3dc8f36df6a',location:'Official equipment explanation, up to four options',hashScope:'UTF-8 captured HTML snapshot, 2026-11-02'}
  );
  p.ploys=structuredClone(ploys);p.equipment=structuredClone(equipment);p.keywords=structuredClone(keywords);p.actions.push(...structuredClone(actions));
  for(const k of p.keywords)if(['Obstructing terrain','Protective','Portable'].includes(k.name)){k.sourceRefs.push(2);k.officialLocation+='; Universal Equipment PDF '+(k.name==='Obstructing terrain'?'page 1':'page 3');k.verification='Cross-checked against October 2026 universal equipment';}
  const factionIds={'Purity Seals':'873b-6422-1d59-0447','Chapter Reliquaries':'8553-c762-a6ae-cd0d','Tilting Shields':'8d00-4709-7207-ff6b','Auspex':'45e4-ca6f-8f6f-92fc'};
  for(const e of p.equipment)if(factionIds[e.name]){e.sourceId=factionIds[e.name];e.sourceRefs.unshift(0);}
  const kw=name=>{
    const base=/^Piercing/.test(name)?'Piercing x':/^Lethal/.test(name)?'Lethal x+':/^Accurate/.test(name)?'Accurate x':/^Range/.test(name)?'Range x':/^Blast/.test(name)?'Blast x':/^Torrent/.test(name)?'Torrent x':/^Devastating/.test(name)?'Devastating x':/^Heavy/.test(name)?'Heavy':/^Seek/.test(name)?'Seek':name;
    const found=p.keywords.find(k=>k.name===base);if(!found)throw Error('Missing keyword definition: '+name);return found.id;
  };
  p.weapons.push(...[['Frag grenade',2,4,['Blast 2"','Saturate']],['Krak grenade',4,5,['Piercing 1','Saturate']]].map(([name,normal,critical,weaponKeywords])=>({id:'killteam:universal:'+name.toLowerCase().replace(/ /g,'-'),name,scope:'universal-equipment',kind:'ranged',attacks:4,hit:4,damageNormal:normal,damageCritical:critical,rangeInches:6,keywords:weaponKeywords,sourceId:'official:universal-equipment:page2:'+name,sourceEntryId:'official:explosive-grenades:'+name,sourceRefs:[2],officialLocation:'Universal Equipment PDF page 2',verification:'official profile reviewed',contextOperativeSourceIds:[],appliedModifiers:[]})));
  for(const w of p.weapons){w.keywordRefs=w.keywords.map(kw);if(w.rangeInches!==null)w.rangeRuleRef=kw('Range x');}
  for(const e of [...p.tactics,...p.ploys]){const grants=e.mechanics.grants;e.keywordRefs=grants?(Array.isArray(grants)?grants:[grants]).map(kw):[];}
  for(const e of p.equipment){if(e.name==='Utility Grenades')e.actionRefs=p.actions.filter(a=>['Smoke Grenade','Stun Grenade'].includes(a.name)).map(a=>a.id);if(e.name==='Explosive Grenades')e.weaponRefs=p.weapons.filter(w=>w.scope==='universal-equipment').map(w=>w.id);if(e.name==='Ammo Cache')e.actionRefs=p.actions.filter(a=>a.name==='Ammo Resupply').map(a=>a.id);if(e.name==='Portable Barricade')e.actionRefs=p.actions.filter(a=>a.name==='Move With Barricade').map(a=>a.id);}
  const grenadier=p.operatives.find(o=>o.name==='Assault Intercessor Grenadier');grenadier.grantedEquipmentWeaponRefs=p.weapons.filter(w=>w.scope==='universal-equipment').map(w=>w.id);p.abilities.find(a=>a.name==='Grenadier').mechanics.grenadeProfilesIncluded=true;
  p.selection.equipment={maximumOptions:4,eachOptionMaximum:1,missionOverridesVerified:false,sourceRefs:[5]};
  p.coverage.factionEquipmentComplete=true;p.coverage.universalEquipmentReferenceComplete=true;p.coverage.factionPloysComplete=true;p.coverage.keywordDefinitionsComplete=true;p.coverage.keywordVerification='Core weapon keywords use pinned BSData; terrain keywords match current equipment. An independent current full core-rule comparison remains pending';p.coverage.weaponScope='Operative cards and frag/krak universal grenade profiles';
  p.pending=['Core keyword definitions are original summaries of pinned BSData; independent current full core-rule baseline verification remains open.','Rules, ploys, terrain and equipment are reference descriptions, not executed gameplay effects.','Mission/event overrides, terrain placement and in-game state legality are not checked.'];
  p.context.datasetVersion='2026.11.02-pilot.3';return p;
};
