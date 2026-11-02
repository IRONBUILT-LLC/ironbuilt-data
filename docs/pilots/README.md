# Real AoS and Kill Team dev pilots

Four dev artifacts now live under `pilots/`, indexed only by `pilots/manifest.dev.json`:
two retained individual reference packs, the complete Angels of Death operative/
loadout selection pack, and the unverified Stormcast source inventory. They do not
appear in the public dataset feed. `minimal-review.json` records the initial pilot
verification separately from the payloads; `TEAM-MILESTONE.md` describes current coverage.

The selected-team pack has nine operative types, 35 loadouts, 27 contextual operative
weapon profiles plus frag/krak grenades, complete faction/universal equipment and
ploy references, and 25 keyword definitions. Composition validation has 21 explicit
roster fixtures plus equipment/rule tests. A gated local developer preview now
renders these references and selections. It is not the ordinary app or a gameplay
engine. See `FOUNDATION-HANDOFF.md` for the consolidated initial deliverable.
The Stormcast inventory
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

## Remaining work after foundation review

1. Independently verify the Liberators battletome baseline and resolve the source
   characteristic condition group before interpreting it automatically.
2. Add one Stormcast regiment leader and verified eligibility. Angels of Death
   operative/loadout options are already present.
3. Independently verify full-core keyword baselines, then review whether to add
   effect execution or mission/event validation. Current rules are references only.
4. Review the gated developer preview before integrating ordinary app selectors,
   saves or account behavior. No further factions are being expanded automatically.

No full faction/team support, gameplay simulation, account sync, production deploy,
production manifest change or app-size guard change is claimed.
