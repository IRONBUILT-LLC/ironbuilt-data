# Age of Sigmar and Kill Team: 2.3 foundation

Status: developer tooling, 2026-11-02. No playable dataset has been published.
The public manifest and every existing 40K bundle are unchanged. Test values are
invented, visibly synthetic and kept under tests/fixtures, outside datasets/.

## Verified source options

| System | Official reference | Structured candidate | Pilot |
| --- | --- | --- | --- |
| AoS fourth edition | [Downloads](https://www.warhammer-community.com/en-gb/downloads/warhammer-age-of-sigmar/), Battle Profiles and Rules Updates dated 2026-10-28 | [BSData age-of-sigmar-4th](https://github.com/BSData/age-of-sigmar-4th), revision `6909c1401ee52c63b5187a7c2d00fb34190479bd` | Stormcast Eternals |
| Kill Team 2024 edition | [Downloads](https://www.warhammer-community.com/en-gb/downloads/kill-team/), latest shared updates dated 2026-10-28; Angels of Death dated 2026-08-26 | [BSData wh40k-killteam](https://github.com/BSData/wh40k-killteam), revision `30c48ce2bdcabc0cb6516f813283086cc2d78fab` | Angels of Death |

Edition basis: official [AoS new-edition release material](https://www.warhammer-community.com/en-gb/articles/4F5Ezznb/warhammer-age-of-sigmar-these-are-the-key-download-dates/)
and [Kill Team Hivestorm launch](https://www.warhammer-community.com/en-gb/articles/niWasyf6/saturday-pre-orders-a-new-edition-begins-in-kill-team-hivestorm/),
cross-checked with current download indexes and current structured system files.
Edition and balance/source revision are separate identities; never call 2026 updates a new edition.

These pilots provide familiar entry points and exercise distinct structures.
They are audit choices, not a promise that starter-box rules are the full current rules.
Neither candidate has a root LICENSE/COPYING file at the inspected revision.
This does not establish that no permission exists elsewhere; it means none was verified.
The repository's own proposed licence expressly excludes third-party IP.
[GW download terms](https://www.warhammer-community.com/en-gb/terms-of-use/) grant personal
use and restrict redistribution and business use. Free availability is not permission
to republish. No official PDFs, full rules prose, images or community catalogues are
vendored by this change. Review applicable terms and field-level scope before publishing
real content; a community licence cannot grant GW rights. A missing licence does not
establish that every mechanical value is prohibited. See `SOURCE-DUE-DILIGENCE-23.md`
for the narrower numerical pilot and the exact outstanding publication decision.

## Architecture audit

The current app's `_build/src/game-systems.js` already isolates Trench Crusade from
legacy 40K/GDF globals using system/edition/ruleset/format/source-revision context.
Its `pack()` supports only Trench Crusade; its base-cost draft validation cannot be
reused as army or team legality. Preview availability explicitly excludes production.
The ordinary data manifest uses schema 1, game/edition, version, URL, bytes and SHA256;
the normal bundles are faction/datasheet/detachment shaped. They are unsuitable for
directly inserting AoS or KT. No new entries are added to that feed.

The real source audit shows why flattening is unsafe:

* Stormcast catalogue dependency closure: 33 source files, 16,809,542 bytes,
  6,459 modifiers and 11,426 constraints. This includes linked libraries and narrative
  catalogues, not 33 supported factions or 17 MB needed for a matched-play pilot.
* Angels of Death: two source files, 107,566 bytes, 11 modifiers and 83 constraints.
  The repository also contains older Kill Team editions: select the 2024 system ID,
  not a filename or team name alone.

Exact per-file hashes, source revisions, profile types, dependency edges and counts
are in `sources/*-audit.json`. Dependency resolution uses IDs: display names can
contain prefixes absent from filenames. Reports contain metadata only.
Hashes and byte sizes describe canonical Git blobs, independent of checkout line endings.

## Implemented contract and importer

`tools/multigame.cjs` accepts a new `ironbuilt-multigame-preview/1` envelope, with
independent `aos` / `killteam` IDs, strict supported edition/format pairs, checked date,
source hash, permission evidence and explicit incomplete-coverage flags. Input bytes
must match an externally supplied SHA256. This is a normalized JSON importer, **not**
a complete BattleScribe catalogue converter or an app dataset installer.

AoS contract: unit model counts, points, reinforcement permission, regiment leader
and explicit eligible-unit IDs. Draft checks total points, regiment size, encoded
eligibility and doubling base points for one reinforcement. These are contract
mechanics demonstrated with invented values, not verified real-faction constraints.

KT contract: team operative bounds, eligible operative IDs, per-operative maxima
and loadout IDs. Draft checks those constraints without inventing points costs.
Weapons, abilities and actions have separate reserved reference arrays. Typed weapon
profiles, action effects and ability evaluation remain unimplemented in both systems.

All passing drafts remain `unverified`. No full legality, combat, export, account sync,
saved-roster migration, UI game selector or player-facing integration is claimed.
The importer is build-time only, deliberately absent from the app bundle.

Reproduce:

```powershell
node --test tests/multigame.test.cjs
node --test tests/numeric-profile.test.cjs
./tests/audit-catalogue.test.ps1
./tools/audit-catalogue.ps1 -Repository <local-source-checkout> -Catalogue 'Stormcast Eternals.cat'
./tools/audit-catalogue.ps1 -Repository <local-source-checkout> -Catalogue '2024 - Angels of Death.cat'
$hash = (Get-FileHash tests/fixtures/aos-synthetic.json -Algorithm SHA256).Hash.ToLowerInvariant()
node tools/multigame.cjs tests/fixtures/aos-synthetic.json $hash
```

## Staged implementation

1. Done: architecture/source audit, pinned pilot dependency reports, normalized import
   contract, integrity/rights gates and synthetic import-to-draft validation tests.
2. Review source terms and select a justified field-level scope. Cross-check exact pilot
   profiles and restrictions against current official updates; retain publication,
   page/section, effective date and per-record upstream IDs. The catalogue snapshot
   being current on GitHub does not prove it matches the October update.
3. Add separate AoS and KT adapters: typed weapons, actions and abilities, a graph
   resolver for links/groups/modifiers/conditions, and unsupported-condition reporting.
   AoS needs regiment exceptions, auxiliary units, general, enhancements, lores,
   manifestations, formations and format-specific restrictions. KT needs leader and
   specialist exclusions, shared weapon caps, equipment and replacement choices.
   Do not silently drop a conditional source restriction.
4. Produce one permission-cleared, verified pilot per system. Pin source revisions,
   bundle hashes and a separate experimental manifest; reject unsupported conditions
   rather than certify legality. Keep normal manifest schema/40K data unchanged.
5. Wire adapters to the existing isolated preview behind its dev/local gate. Add
   explicit capabilities and source/coverage UI, namespaced saves, and production
   exclusion regressions. Then expand faction/team coverage with validation fixtures.

No production deployment, database, subscription or app-size guard changes.
