# Angels of Death selected-team milestone

This records the selected-team milestone before support-rule/UI completion.
For current coverage and the reviewable preview, use `FOUNDATION-HANDOFF.md`.

Developer data only, checked 2026-11-02. The isolated dev index now distinguishes
`unit-reference`, `selected-team` and `source-inventory` artifacts. Nothing enters
the public dataset manifest, live app UI or legacy 40K loader.

## Complete roster-option coverage

`pilots/killteam-angels-team.json` contains all nine operative types: Captain,
both Sergeants, Assault Grenadier, both Warriors, Eliminator Sniper, Heavy
Intercessor Gunner and Intercessor Gunner. It has 35 legal equipment combinations
and 27 contextual weapon profiles. Modes share `sourceEntryId`; they are profiles
of the same equipment family, not extra weapons to equip simultaneously. Ranged
profiles without a Range keyword have `rangeInches:null`, distinct from a missing
numeric value and from melee through `kind`.

Also included: eight original operative ability summaries, Optics as a 1AP unique
action, eight Chapter tactic summaries and an original Astartes summary. All have
structured mechanical evidence. None executes a gameplay effect. Universal/faction
equipment, frag/krak grenade profiles, ploys, keyword definitions/effects and mission
rules remain outside this milestone. Weapon completeness means the operative cards
and their listed loadout choices, not every universal-equipment weapon.

## Sources and review

The [official team PDF](https://assets.warhammer-community.com/eng_26-08_killteam_angels_of_death_online_rules-1rwlnicmkz-qjtykwlybg.pdf)
is the authority: operative cards on PDF pages 1-3, Chapter tactics/Astartes on
pages 4-5, change log on page 10, and selected-team options on page 12 were inspected.
The download index dates it 2026-08-26; the official 2026-10-28 update article adds
shared terrain changes and does not identify an Angels-specific revision.

BSData `wh40k-killteam` revision
`30c48ce2bdcabc0cb6516f813283086cc2d78fab` provides identifiers and a second reference.
All basic/weapon profiles have source IDs, canonical source-file hash, official
document hash, page locations and per-entity source references. Effective weapon
modifiers retain their base value and operative context. The build rejects an
unreviewed source hash or an ability lacking original reviewed wording.

Recorded source differences are not silently flattened:

* Assault Sergeant Doctrine Warfare uses Assault/Tactical on the official card;
  the pinned source says Devastator/Tactical. The official choices are used.
* Intercessor Sergeant Doctrine Warfare has one use per listed doctrine per battle;
  the pinned source text omits that limit. The official limit is used.
* The Sniper hyperfrag Blast distance is explicitly inches on the official card;
  the source label omits the unit. The typed label includes it.
* Captain Power fist Hit resolves to 3+, while the shared profile defaults to 4+.
  Intercessor Sergeant melee attacks resolve to 4 rather than the shared 5.

Original wording follows the existing 40K policy: retain values, conditions, timing,
targets, limits and exceptions. Rules permission is recorded from the user's
statement, not inferred from paraphrasing. Attribution remains GW/BSData; no artwork
or full source catalogue is copied.

## Composition validation

`tools/team-preview.cjs` validates six individual selections: exactly one leader
and five others, at most one of each non-Warrior type, and repeatable Warriors.
Each selection must use one of its operative's enumerated legal loadouts. It checks
primary/secondary tactic IDs, the Sergeant's extra tactic, duplicate instance IDs,
and an optional initial campaign tactic lock. Repeating a tactic is allowed but
does not stack; the official text does not require two different choices.

The current selection page permits Sniper and Heavy Gunner together. A positive
fixture protects that behavior; no obsolete combined cap is imposed. Assault
Sergeant plasma plus anything except chainsword is rejected. All 35 loadouts are
tested inside an otherwise valid six-operative team.

`tests/fixtures/angels-team-rosters.json` contains 21 explicit fixtures: six valid
compositions and 15 invalid ones. A passing result is `compositionValid:true` with
`status:unverified`, not a claim of complete game, mission or event legality.

Every import checks exact pack bytes and an explicit dev/local host. Context pins
game, edition, format, ruleset, upstream revision and curated dataset version.
Production is excluded even if the environment flag is mistakenly `dev`.

## Stormcast inventory and structure

`pilots/aos-stormcast-inventory.json` records 96 main-catalogue entries referring to
91 distinct source units, including 47 hero-candidate entries. It contains no basic
stat lines, weapon profiles or ability prose. Source points are snapshot metadata,
not current army prices. All profile-currentness and regiment/reinforcement
eligibility flags remain unverified.

Publication mapping distinguishes 63 Battletome entries, 23 Supplement entries,
six Legends entries, one Scourge of Ghyran entry and two Scourge of Aqshy entries.
One upstream publication ID is unresolved. These are entry counts including variants.
The source GST supplies publication titles; none of these entries supplies a printed
page number, so `printedPage` remains null rather than invented.

For the Liberators baseline, the required source is **Battletome: Stormcast Eternals,
fourth edition (2024), Liberators warscroll**, covering its basic stats, Warhammer,
Grandhammer and Stalwart Defenders. The accessible metadata identifies that book
and section but not its printed page. A current authorized book page or entitled
app entry is still needed for independent baseline verification. Already inspected:
October 2026 Battle Profiles PDF page 22, and Stormcast errata PDF pages 73-74.

`tools/aos-structure.cjs` models regiments, a source-role hero leader reference,
unit instances, auxiliaries, reinforcement requests and a general reference.
It checks only structural identity and shape. It always reports eligibility as
unverified and never calculates army points from stale snapshot prices.

## Reproduction and next work

```powershell
./tools/extract-angels-reference.ps1 -Repository <BSData-KT-checkout> | Set-Content <local-reference.json>
node tools/build-angels-team.cjs <local-reference.json>
./tools/build-stormcast-inventory.ps1 -Repository <BSData-AoS-checkout> | Set-Content pilots/aos-stormcast-inventory.json
node tools/package-real-pilots.cjs
node --test tests/*.test.cjs
./tests/audit-catalogue.test.ps1
```

The packager canonicalizes JSON to LF before computing hashes, making the Windows
build reproducible after Git checkout. Source extraction reads canonical pinned Git
blobs, not checkout line endings. Raw ability text is excluded from the KT reference
extraction; human-reviewed explanations live in `tools/angels-reviewed-rules.cjs`.

Next: add referenced equipment/ploy/keyword rules; independently verify the chosen
Stormcast baseline and one leader's regiment eligibility; then wire and browser-test
the existing isolated app preview. No production or app-size guard change is needed.
