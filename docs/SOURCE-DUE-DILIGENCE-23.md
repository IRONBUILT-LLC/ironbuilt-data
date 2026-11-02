# Source scope checkpoint: AoS and Kill Team

Checked 2026-11-02. A missing repository licence is an unresolved reuse question,
not proof that every individual mechanical number is prohibited. Copyright in
expression, source access terms, trademarks and database/compilation rights are
distinct questions. The [US Copyright Office](https://www.copyright.gov/circs/circ33.pdf)
distinguishes methods/systems from creative expression describing them. That does
not alone resolve fictional stat tables, copied compilations or source contracts.
No blanket legal conclusion is made here.

Current authorization and verification are recorded in `pilots/README.md` and
`pilots/minimal-review.json`. The user expressly states rules use is permitted and
directs original synonymous ability wording following 40K, with BSData as another
reference. Work proceeds on that stated basis; no independent legal assurance or
artwork permission is claimed. The earlier source-specific pause is superseded for
the bounded pilots. Captain basic/weapon/ability values are visually verified;
Liberators current points/models are verified, with their battletome baseline open.

## Exact candidates

| Source | Snapshot inspected | Explicit permission/limits | Fit |
| --- | --- | --- | --- |
| [BSData/age-of-sigmar-4th](https://github.com/BSData/age-of-sigmar-4th) | `6909c1401ee52c63b5187a7c2d00fb34190479bd`, 2026-10-23 | No LICENSE/COPYING/NOTICE/terms file found in the checked tree; README explains maintenance and regiments, with no general reuse grant | Strong structured candidate; snapshot predates latest official update |
| [BSData/wh40k-killteam](https://github.com/BSData/wh40k-killteam) | `30c48ce2bdcabc0cb6516f813283086cc2d78fab`, 2026-10-29, October 2026 Update | No LICENSE/COPYING/NOTICE/terms file found in checked tree; README offers community development/download links, no general reuse grant | Strong current candidate; select the 2024 GST/catalogues, not older editions |
| [andrewcharlton/aos-parser](https://github.com/andrewcharlton/aos-parser) | `67b66f2fa53d68346a088bcae563a062bd5bd884`, last commit 2024-07-21 | README informally permits reuse of parsed data; no SPDX licence detected. JSON derives from official faction PDFs and includes prose | AoS4 launch baseline, stale for 2026. Author permission helps for their contribution but does not verify a GW grant |
| [brittonhayes/aos](https://github.com/brittonhayes/aos) | `082d0b89d5a643f9baa41650cb9b945b47da56c9`, 2025-01-07 | MIT software licence; README separately asserts GW data ownership and requires noncommercial data use/compliance with GW guidelines | Not verified current AoS4 data; code licence does not settle data reuse |
| [gregario/warhammer-oracle](https://github.com/gregario/warhammer-oracle) | `7d5f15f61777a47b3b8bc5f58babca95a2d73517`, 2026-11-02 | MIT explicitly for MCP server code; data attributed to BSData and GW IP for personal gameplay reference | Maintained KT derivative, but no added rules-data permission; prefer upstream provenance |
| [damonhook/aos-statshammer](https://github.com/damonhook/aos-statshammer) | `c8d442a97cbedb8c771c938cfac3b754b1a8e6d9`, 2025-02-25 | MIT project licence | Calculator with user-created profiles, not a verified current faction dataset |

Official [AoS downloads](https://www.warhammer-community.com/en-gb/downloads/warhammer-age-of-sigmar/)
list Battle Profiles/Rules Updates dated 2026-10-28. Official
[KT downloads](https://www.warhammer-community.com/en-gb/downloads/kill-team/) list shared
updates dated 2026-10-28 and Angels of Death dated 2026-08-26. Official 2024 launch
material (linked in MULTIGAME-23.md) and current structured system IDs establish AoS
fourth edition and KT 2024 as targets. Source update dates are not edition IDs.
Relevant shared/faction errata and each pilot value still need cross-checking.

[GW download terms](https://www.warhammer-community.com/en-gb/terms-of-use/) provide
a personal licence and restrict redistribution/business use. These are recorded
access/use constraints, not a universal copyright determination about isolated
numbers obtained from every other source. No access restrictions were bypassed.

## Field-level scope

| Category | Proposed handling |
| --- | --- |
| AoS Move, Health, Save, Control, model count and points | Candidate mechanical/numerical facts: independently transcribe or verify a small selection, retaining source locations/dates; do not clone whole tables |
| KT APL, Move, Save, Wounds and selection counts | Candidate mechanical/numerical facts, same limited scope |
| Numeric weapon profiles, dice expressions and damage pairs | Mechanical values requiring typed per-system schemas/source review; excluded from first numeric adapter |
| Unit/team/weapon names and short identifiers | Nominative identification and provenance; no logos or endorsement implication; independent namespaced app IDs |
| Eligibility and roster restrictions | Independently encode verified mechanics; copying a substantial authored constraint graph raises separate compilation questions |
| Ability/ploy/equipment/action/spell/army-rule prose and lore | Exclude from numeric pilot. Link to authoritative references; separately review an original implementation or applicable permission |
| Artwork, logos, PDF/card layout and screenshots | Exclude; code/catalogue licensing does not imply an art grant |

## Existing pipeline precedent

App `_build/parse-sm.ps1` reads a BattleScribe baseline for 10e.
`_build/build-dataset-11e.ps1` says 11e is hand-maintained from 10e baselines plus
faction-pack deltas, not regenerated by those parsers. The useful precedent is
source checking, normalization and versioned publishing, not proof of blanket
BSData licensing.

Onboarding `_build/audit-combat-patrol-source.py` pins
`LordTyberias/armamentarium-combat-patrol-data` revision
`c7ec09eb7305700a8ae71e577a139e242f09d14f`, recording MIT for the catalogue while
separating GW IP. It covers Combat Patrol, not AoS/current KT. Its inventory-only,
not-publishable review pattern applies here.

## Bounded real pilot and remaining verification

The real packs now include **Liberators** and **Space Marine Captain** within
Angels of Death: basic stats, typed weapons, original ability summaries, mechanical
evidence, source IDs/links and bounded configuration checks. Artwork, raw source
sentences, whole tables and roster-legality claims remain excluded.

Implemented `tools/numeric-profile.cjs` maps the distinct Unit/Operative profiles,
drops unrecognized/prose fields, rejects unsupported numeric expressions and
duplicates, and withholds conditional/unknown-modifier profiles. Evidence always
says `auditOnly:true`, `publishable:false`, `status:unverified`. Synthetic tests are
not game coverage. Local unpublished runs on the two real profiles exercise the
mapping but do not establish currentness, external modifier scope or clearance.

The user's stated permission is recorded in each real pack; changing synonyms is
not itself the permission basis. No explicit conflicting BSData compilation licence
was found in the inspected trees. Keep limited reviewed records and attribution;
do not infer a general grant to redistribute the full upstream compilation.

Next: independently verify the Liberators battletome baseline and its embedded
source condition group, expand a regiment/team selection, then wire the portable
adapters to the isolated app preview. Real pilot imports already test production
host exclusion and exact byte integrity. Numeric audit evidence remains distinct
from a playable dataset, and synthetic fixtures remain distinct from real coverage.
