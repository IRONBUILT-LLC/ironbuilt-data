'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {validatePilot}=require('./real-pilot.cjs');
const root=path.join(__dirname,'../pilots');
const entries=['aos-liberators.json','killteam-angels-captain.json'].map(file=>{
  const bytes=fs.readFileSync(path.join(root,file));
  const p=validatePilot(JSON.parse(bytes.toString('utf8')));
  return {id:p.entity.id,systemId:p.context.systemId,editionId:p.context.editionId,version:p.context.datasetVersion,sourceRevision:p.context.sourceRevision,file,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
});
fs.writeFileSync(path.join(root,'manifest.dev.json'),JSON.stringify({schema:'ironbuilt-pilot-index/1',releaseChannel:'dev',complete:false,playableRosterSupport:false,entries},null,2)+'\n');
console.log('Validated and packaged '+entries.length+' partial real pilots; public manifest unchanged.');
