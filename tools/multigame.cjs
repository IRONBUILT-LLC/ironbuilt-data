'use strict';
// Build-time contract only. Never feed these packs to the legacy 40K loader.
const fs = require('node:fs');
const crypto = require('node:crypto');
const contexts = ['systemId', 'editionId', 'rulesetId', 'formatId', 'sourceRevision'];
const editions = {aos: '4e', killteam: '2024'};
function check(ok, message) { if (!ok) throw Error(message); }
function integer(n, min = 0, max = 100000) { return Number.isSafeInteger(n) && n >= min && n <= max; }
function text(s) { return typeof s === 'string' && s.length > 0 && s.length <= 200; }
function list(a) { return Array.isArray(a) && a.length <= 10000; }
function ids(a, prefix) {
  check(list(a), 'Expected bounded entity array');
  const seen = new Set();
  for (const e of a) {
    check(e && text(e.id) && e.id.startsWith(prefix + ':') && text(e.name) && !seen.has(e.id), 'Invalid, duplicate or cross-game entity');
    seen.add(e.id);
  }
  return seen;
}
function validatePack(p) {
  check(p && p.schema === 'ironbuilt-multigame-preview/1' && p.releaseChannel === 'dev', 'Only dev preview packs are supported');
  const c = p.context;
  check(c && Object.hasOwn(editions, c.systemId) && c.editionId === editions[c.systemId], 'Unsupported game or edition');
  contexts.forEach(k => check(text(c[k]), 'Missing context: ' + k));
  check(/^\d{4}-\d{2}-\d{2}$/.test(p.checkedAt), 'Missing source check date');
  check(p.coverage && p.coverage.complete === false && p.coverage.fullValidation === false, 'Preview cannot claim complete coverage or legality');
  const source = p.provenance;
  check(source && text(source.url) && /^https:\/\//.test(source.url) && /^[a-f0-9]{64}$/.test(source.sha256), 'Missing immutable source identity');
  check(['synthetic', 'permission-recorded'].includes(source.rightsStatus) && text(source.rightsEvidence), 'Source permission evidence is required');
  check(source.rightsStatus !== 'synthetic' || p.synthetic === true, 'Synthetic source must be labelled');
  if (c.systemId === 'aos') {
    check(c.formatId === 'army-draft', 'Unsupported AoS format');
    const units = ids(p.units, 'aos');
    ids(p.regimentLeaders, 'aos');
    for (const u of p.units) {
      check(integer(u.points) && integer(u.models, 1) && typeof u.reinforceable === 'boolean', 'Invalid AoS profile');
      check(list(u.weapons) && list(u.abilityRefs), 'Missing AoS reference arrays');
    }
    for (const r of p.regimentLeaders) {
      check(units.has(r.unitId) && list(r.eligibleUnitIds) && r.eligibleUnitIds.every(id => units.has(id)) && integer(r.maxUnits, 1, 10), 'Invalid regiment eligibility');
    }
  } else {
    check(c.formatId === 'selected-team-draft', 'Unsupported Kill Team format');
    const operatives = ids(p.operatives, 'killteam');
    ids(p.teams, 'killteam');
    for (const o of p.operatives) {
      check(integer(o.maxSelections, 1, 100) && list(o.loadouts) && o.loadouts.length > 0 && new Set(o.loadouts).size === o.loadouts.length && o.loadouts.every(text), 'Invalid operative options');
      check(list(o.weapons) && list(o.actionRefs) && list(o.abilityRefs), 'Missing operative reference arrays');
    }
    for (const t of p.teams) {
      check(integer(t.minOperatives, 1, 100) && integer(t.maxOperatives, t.minOperatives, 100) && list(t.operativeIds) && t.operativeIds.every(id => operatives.has(id)), 'Invalid team composition');
    }
  }
  return p;
}
function validateDraft(pack, draft) {
  validatePack(pack);
  const errors = [];
  const out = {status: 'invalid', errors, totals: {}, pending: ['Only the encoded pilot constraints are checked; full rules legality is unverified.']};
  if (!draft || !draft.context || !contexts.every(k => draft.context[k] === pack.context[k])) { errors.push('Game, edition, rules, format or source revision mismatch'); return out; }
  if (pack.context.systemId === 'aos') {
    if (!integer(draft.pointsLimit, 1) || !list(draft.regiments) || !draft.regiments.length) { errors.push('Invalid army draft'); return out; }
    let points = 0;
    for (const r of draft.regiments) {
      const leader = r && pack.regimentLeaders.find(x => x.id === r.leaderId);
      if (!leader || !list(r.units) || r.units.length > leader.maxUnits) { errors.push('Invalid regiment'); continue; }
      points += pack.units.find(x => x.id === leader.unitId).points;
      for (const line of r.units) {
        const u = line && pack.units.find(x => x.id === line.unitId);
        if (!u || !leader.eligibleUnitIds.includes(u.id) || typeof line.reinforced !== 'boolean' || (line.reinforced && !u.reinforceable)) { errors.push('Ineligible unit or reinforcement'); continue; }
        points += u.points * (line.reinforced ? 2 : 1);
      }
    }
    out.totals.points = points;
    if (points > draft.pointsLimit) errors.push('Points limit exceeded');
  } else {
    const team = pack.teams.find(x => x.id === draft.teamId);
    if (!team || !list(draft.operatives)) { errors.push('Invalid team draft'); return out; }
    if (draft.operatives.length < team.minOperatives || draft.operatives.length > team.maxOperatives) errors.push('Operative count outside encoded bounds');
    const counts = new Map();
    for (const line of draft.operatives) {
      const o = line && pack.operatives.find(x => x.id === line.operativeId);
      if (!o || !team.operativeIds.includes(o.id) || !o.loadouts.includes(line.loadoutId)) { errors.push('Ineligible operative or loadout'); continue; }
      counts.set(o.id, (counts.get(o.id) || 0) + 1);
      if (counts.get(o.id) > o.maxSelections) errors.push('Operative selection maximum exceeded');
    }
    out.totals.operatives = draft.operatives.length;
  }
  out.status = errors.length ? 'invalid' : 'unverified';
  return out;
}
function importPack(body, expectedSha256) {
  check(typeof body === 'string' && Buffer.byteLength(body) <= 6000000, 'Input exceeds preview size limit');
  check(/^[a-f0-9]{64}$/.test(expectedSha256) && crypto.createHash('sha256').update(body).digest('hex') === expectedSha256, 'Input checksum mismatch');
  const p = JSON.parse(body, (k, v) => { check(!['__proto__', 'constructor', 'prototype'].includes(k), 'Unsafe input key'); return v; });
  return validatePack(p);
}
module.exports = {validatePack, validateDraft, importPack};
if (require.main === module) {
  try {
    const [file, hash] = process.argv.slice(2);
    const p = importPack(fs.readFileSync(file, 'utf8'), hash);
    console.log(JSON.stringify({context:p.context, synthetic:p.synthetic === true, status:'validated-dev-contract', complete:false}));
  } catch (e) { console.error(e.message); process.exitCode = 1; }
}
