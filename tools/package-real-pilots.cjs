'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {validatePilot}=require('./real-pilot.cjs');
const {validateTeamPack}=require('./team-preview.cjs');
const {validateInventory}=require('./aos-structure.cjs');
const root=path.join(__dirname,'../pilots');
const entries=['aos-liberators.json','killteam-angels-captain.json','killteam-angels-team.json','aos-stormcast-inventory.json'].map(file=>{
  const raw=JSON.parse(fs.readFileSync(path.join(root,file),'utf8').replace(/^\uFEFF/,'')),team=raw.schema==='ironbuilt-team-preview/1',inventory=raw.schema==='ironbuilt-stormcast-inventory/1';
  const p=team?validateTeamPack(raw):inventory?validateInventory(raw):validatePilot(raw);
  const bytes=Buffer.from(JSON.stringify(p,null,2)+'\n');fs.writeFileSync(path.join(root,file),bytes);
  return {id:team||inventory?p.id:p.entity.id,kind:team?'selected-team':inventory?'source-inventory':'unit-reference',systemId:p.context.systemId,editionId:p.context.editionId,version:p.context.datasetVersion,sourceRevision:p.context.sourceRevision,file,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
});
fs.writeFileSync(path.join(root,'manifest.dev.json'),JSON.stringify({schema:'ironbuilt-pilot-index/1',releaseChannel:'dev',complete:false,playableRosterSupport:false,entries},null,2)+'\n');
console.log('Validated and packaged '+entries.length+' dev artifacts (references, selected team and source inventory); public manifest unchanged.');
