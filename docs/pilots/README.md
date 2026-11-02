# Real AoS and Kill Team dev pilots

Four dev artifacts now live under `pilots/`, indexed only by `pilots/manifest.dev.json`:
two retained individual reference packs, the complete Angels of Death operative/
loadout selection pack, and the unverified Stormcast source inventory. They do not
appear in the public dataset feed. `minimal-review.json` records the initial pilot
verification separately from the payloads; `TEAM-MILESTONE.md` describes current coverage.

The selected-team pack has nine operative types, 35 loadouts, 27 contextual weapon
profiles and composition validation with 21 valid/invalid fixtures. This is data
and validation, not a gameplay UI or complete rules engine. The Stormcast inventory
has 96 catalogue entries referring to 91 source units; it does not claim current
profiles, regiment eligibility or current army pricing.

Rules-use basis: the user states they have permission and directs the same original
ability-wording approach as IRONBUILT 40K. This is recorded in each pack, with source
attribution, rather than claimed as independent legal clearance. Artwork and raw
rules text are excluded. The earlier official-source pause is superseded for this
bounded work by that explicit statement. BSData's missing general compilation
licence remains documented; no conflicting explicit licence was found, and no whole
catalogue or full faction compilation is copied.

## Retained individual reference packs

| Pilot | Included | Verification |
| --- | --- | --- |
| Stormcast Eternals: Liberators | Four basic stats, two weapon profiles, original Stalwart Defenders and Champion summaries, 5/10-model configuration, 90/180 points, champion and grandhammer limits | October 2026 official Battle Profiles page 22 checked visually; Stormcast Rules Updates pages 73-74 checked. Basic stats/weapons/ability baseline uses pinned BSData and is not independently verified against the current battletome |
| Angels of Death: Space Marine Captain | Four basic stats, both plasma pistol modes, Captain-specific Power fist, original Heroic Leader and Iron Halo summaries, fixed loadout and singleton limit | Current official team PDF page 1 and selection page 12 checked visually. Captain Power fist Hit resolves to 3+, rather than the shared source default of 4+ |

Every ability has structured mechanical evidence alongside original prose, plus
source IDs. These are reference summaries, not executed effects. Heroic Leader
retains one shared use per turning point, all three alternatives, normal Combat
Doctrine CP cost, Command Re-roll exception, activation timing and killzone/control
range restrictions. Iron Halo applies to Normal Dmg from one die, once per battle.
Liberators' control bonus affects the unit control score at an objective wholly
inside friendly territory. A Regiment/Regimental Leader condition group embedded
in the source characteristic is retained but not evaluated.

## Import and validation

`tools/real-pilot.cjs` validates real pack structure, recorded authorization,
provenance, namespaced references and game-specific weapon/selection fields.
`importPilot(body, sha256, env, host)` checks exact bytes and restricts import to
explicit dev/local hosts, rejecting production even when `env` is accidentally dev.
This is a portable data adapter; it is not connected to the app UI or legacy loader.

`validateSelection(pack, draft)` checks only the supported unit/operative
configuration. Valid selections always return `unverified`, with missing coverage.
AoS checks model/point scaling, grandhammers per five models, one champion, and the
champion/grandhammer exclusion. KT checks one Captain and the fixed equipment.
A complete six-operative team, legal regiment/army or combat result is never inferred.

Reproduce from the data repository:

```powershell
node tools/package-real-pilots.cjs
node --test tests/*.test.cjs
./tests/audit-catalogue.test.ps1
```

The packager validates both curated inputs and writes their exact hashes/sizes to
the isolated dev index. It never writes `manifest.json` or existing datasets.
Curated values are reviewed deliberately rather than blindly flattening all source
constraints. The existing 40K policy in
`docs/orks-codex-src/codex_paraphrase.py` guided wording: preserve numeric values,
units, keywords, targets, timing and exceptions, while writing original explanations.
Permission comes from the user's statement, not from changing synonyms.

## Next coverage milestones

1. Independently verify the Liberators battletome baseline and resolve the source
   characteristic condition group before interpreting it automatically.
2. Add one Stormcast regiment leader and verified eligibility; add the remaining
   Angels of Death operative choices and shared selection exclusions.
3. Add typed keyword definitions, faction abilities, Chapter tactics and ploys with
   original summaries and independent mechanical fingerprints. Keep unsupported
   effects explicit; expand validation alongside each entity.
4. Wire the portable adapters to the existing isolated app preview behind a dev/local
   gate, then browser-test source details, selection controls and saved identity.

No full faction/team support, gameplay simulation, account sync, production deploy,
production manifest change or app-size guard change is claimed.
