'use strict';
// Narrow, original mapping of individual mechanical values. Never copies rules prose.
// This evidence adapter is independent of the playable pack importer.
const fields = Object.freeze({
  aos: Object.freeze({type:'Unit', edition:'4e', map:{Move:'moveInches',Health:'health',Save:'saveThreshold',Control:'control'}}),
  killteam: Object.freeze({type:'Operative', edition:'2024', map:{APL:'actionPointLimit',Move:'moveInches',Save:'saveThreshold',Wounds:'wounds'}})
});
function validateNumericEvidence(e) {
  const expected=['schema','context','id','sourceId','provenance','auditOnly','publishable','status','stats','pending'];
  if (!e || Object.keys(e).sort().join() !== expected.sort().join() || e.schema !== 'ironbuilt-numeric-evidence/1' || e.auditOnly !== true || e.publishable !== false || e.status !== 'unverified') throw Error('Invalid numeric evidence envelope');
  const c=e.context,config=c && Object.hasOwn(fields,c.systemId) && fields[c.systemId];
  if (!config || c.editionId !== config.edition || !/^[a-f0-9]{40}$/.test(c.sourceRevision || '') || Object.keys(c).sort().join() !== 'editionId,sourceRevision,systemId') throw Error('Invalid numeric evidence context');
  if (!/^[a-zA-Z0-9-]{1,100}$/.test(e.sourceId || '') || e.id !== c.systemId+':'+e.sourceId) throw Error('Numeric evidence identity mismatch');
  const p=e.provenance;
  if (!p || Object.keys(p).sort().join() !== 'path,sha256,url' || !/^[a-f0-9]{64}$/.test(p.sha256 || '') || typeof p.path !== 'string' || !/^[^\\/:]{1,200}\.cat$/.test(p.path)) throw Error('Invalid numeric provenance');
  let url;try {url=new URL(p.url);}catch {throw Error('Invalid source URL');}
  if (url.protocol !== 'https:' || url.username || url.password) throw Error('Invalid source URL');
  if (!e.stats || Array.isArray(e.stats) || !Array.isArray(e.pending) || !e.pending.length || e.pending.length > 10 || e.pending.some(x=>typeof x!=='string'||x.length>300)) throw Error('Invalid numeric evidence scope');
  const names=Object.values(config.map),keys=Object.keys(e.stats);
  if (keys.length && (keys.length !== names.length || keys.some(k=>!names.includes(k)))) throw Error('Incomplete or unsupported evidence statistics');
  for (const [key,value] of Object.entries(e.stats)) {
    if (!Number.isSafeInteger(value) || value<0 || value>100 || (['health','wounds','actionPointLimit'].includes(key)&&value<1) || (key==='saveThreshold'&&(value<2||value>7))) throw Error('Invalid numeric evidence statistic');
  }
  return e;
}
function adaptNumericProfile(context, profile) {
  const config = context && Object.hasOwn(fields,context.systemId) && fields[context.systemId];
  if (!config || context.editionId !== config.edition || !/^[a-f0-9]{40}$/.test(context.sourceRevision || '')) throw Error('Unsupported or unpinned game context');
  const source=context.source;
  if (!source || !/^[a-f0-9]{64}$/.test(source.sha256 || '') || typeof source.path !== 'string' || !/^[^\\/:]{1,200}\.cat$/.test(source.path) || typeof source.url !== 'string' || !source.url.startsWith('https://')) throw Error('Missing source file provenance');
  if (!profile || profile.type !== config.type || !/^[a-zA-Z0-9-]{1,100}$/.test(profile.id || '') || !Array.isArray(profile.fields) || profile.fields.length > 100) throw Error('Invalid source profile');
  const evidence = {schema:'ironbuilt-numeric-evidence/1',context:{systemId:context.systemId,editionId:context.editionId,sourceRevision:context.sourceRevision},
    id:context.systemId+':'+profile.id,sourceId:profile.id,provenance:{path:source.path,sha256:source.sha256,url:source.url},auditOnly:true,publishable:false,status:'unverified',stats:{},pending:[]};
  // Never flatten a conditional value into a supposedly authoritative base profile.
  if (profile.conditional !== false) { evidence.pending.push('Conditional or unknown modifier scope; numeric profile withheld.'); return validateNumericEvidence(evidence); }
  const seen = new Set();
  for (const field of profile.fields) {
    if (!field || !Object.hasOwn(config.map,field.name)) continue;
    if (seen.has(field.name)) throw Error('Duplicate numeric field');
    seen.add(field.name);
    const raw=String(field.value).trim(), suffix=field.name === 'Save' ? '\\+' : field.name === 'Move' ? '["″]?' : '';
    if (!(new RegExp('^([0-9]{1,3})'+suffix+'$')).test(raw)) throw Error('Unsupported numeric expression: '+field.name);
    const n=Number(raw.match(/^[0-9]+/)[0]);
    if (!Number.isSafeInteger(n) || n < 0 || n > 100 || (field.name === 'Save' && (n < 2 || n > 7))) throw Error('Numeric value outside supported range');
    evidence.stats[config.map[field.name]]=n;
  }
  if (seen.size !== Object.keys(config.map).length) throw Error('Incomplete numeric profile');
  evidence.pending.push('Source terms, current-value verification, weapons, abilities and roster legality are outside this evidence record.');
  return validateNumericEvidence(evidence);
}
module.exports={adaptNumericProfile,validateNumericEvidence};
if (require.main === module) {
  const fs=require('node:fs');
  try { const input=JSON.parse(fs.readFileSync(process.argv[2],'utf8')); console.log(JSON.stringify(adaptNumericProfile(input.context,input.profile),null,2)); }
  catch(e) { console.error(e.message); process.exitCode=1; }
}
