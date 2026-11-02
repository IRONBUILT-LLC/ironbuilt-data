'use strict';
// Narrow, original mapping of individual mechanical values. Never copies rules prose.
// This evidence adapter is independent of the playable pack importer.
const fields = Object.freeze({
  aos: Object.freeze({type:'Unit', edition:'4e', map:{Move:'moveInches',Health:'health',Save:'saveThreshold',Control:'control'}}),
  killteam: Object.freeze({type:'Operative', edition:'2024', map:{APL:'actionPointLimit',Move:'moveInches',Save:'saveThreshold',Wounds:'wounds'}})
});
function adaptNumericProfile(context, profile) {
  const config = context && Object.hasOwn(fields,context.systemId) && fields[context.systemId];
  if (!config || context.editionId !== config.edition || !/^[a-f0-9]{40}$/.test(context.sourceRevision || '')) throw Error('Unsupported or unpinned game context');
  const source=context.source;
  if (!source || !/^[a-f0-9]{64}$/.test(source.sha256 || '') || typeof source.path !== 'string' || !/^[^\\/:]{1,200}\.cat$/.test(source.path) || typeof source.url !== 'string' || !source.url.startsWith('https://')) throw Error('Missing source file provenance');
  if (!profile || profile.type !== config.type || !/^[a-zA-Z0-9-]{1,100}$/.test(profile.id || '') || !Array.isArray(profile.fields) || profile.fields.length > 100) throw Error('Invalid source profile');
  const evidence = {schema:'ironbuilt-numeric-evidence/1',context:{systemId:context.systemId,editionId:context.editionId,sourceRevision:context.sourceRevision},
    id:context.systemId+':'+profile.id,sourceId:profile.id,provenance:{path:source.path,sha256:source.sha256,url:source.url},auditOnly:true,publishable:false,status:'unverified',stats:{},pending:[]};
  // Never flatten a conditional value into a supposedly authoritative base profile.
  if (profile.conditional !== false) { evidence.pending.push('Conditional or unknown modifier scope; numeric profile withheld.'); return evidence; }
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
  return evidence;
}
module.exports={adaptNumericProfile};
if (require.main === module) {
  const fs=require('node:fs');
  try { const input=JSON.parse(fs.readFileSync(process.argv[2],'utf8')); console.log(JSON.stringify(adaptNumericProfile(input.context,input.profile),null,2)); }
  catch(e) { console.error(e.message); process.exitCode=1; }
}
