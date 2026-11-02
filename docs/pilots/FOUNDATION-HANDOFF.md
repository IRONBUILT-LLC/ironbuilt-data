# IRONBUILT 2.3 multi-game foundation

Initial project deliverable, 2026-11-02. This is the review checkpoint before
expanding to more factions or building the ordinary app's game selector.

## Available now

| Deliverable | Actual coverage |
| --- | --- |
| Angels of Death selected-team data | All nine operative types, 35 allowed loadouts, 27 contextual operative-card weapon profiles and two universal grenade profiles |
| Original reference rules | Eight operative abilities, eight Chapter tactics, Astartes, eight faction ploys plus Command Re-roll, four faction and eleven universal equipment options, five unique/equipment actions, and 25 weapon/terrain keyword definitions |
| Validation | Six individual operatives, one leader, unique specialists, repeatable Warriors, enumerated loadouts, Sergeant tactic choices, optional campaign tactic lock, up to four unique equipment options and correct two-grenade pools |
| Stormcast foundation | Retained Liberators reference pilot; 96 catalogue entries referring to 91 source units; structural regiment/auxiliary/general schema with no currentness, eligibility or army-price claims |
| Developer preview | Standalone local UI for selecting and inspecting Angels of Death, equipment, sources, validation and reference rules; Stormcast displays only explicitly unverified inventory metadata |

Passing composition checks always leaves full gameplay **unverified**. No action,
damage, AP, CP, terrain or equipment effect is executed. No accounts or saved 40K
rosters are connected. The ordinary app UI and public dataset manifest are unchanged.

## Sources and verification

The selected-team pack is `pilots/killteam-angels-team.json`, curated version
`2026.11.02-pilot.3`, with upstream BSData revision
`30c48ce2bdcabc0cb6516f813283086cc2d78fab`. All profile/rule records include source
references, IDs where supplied, document locations and source-file hashes.

* Official Angels of Death document, updated 2026-08-26: operative cards on PDF
  pages 1-3, tactics/Astartes on 4-5, ploys/equipment on 5-8, updates on 9-10 and
  team selection on 12. Source differences in Sergeant abilities and contextual
  weapons are explicitly recorded; official cards control those differences.
* Official Universal Equipment, updated 2026-10-28: all eleven equipment options,
  grenade profiles and equipment actions are represented. The October ladder
  requirement is preserved: the same ladder must remain in control range for
  the entire discounted climb. Smoke changes only the specified Piercing 2/Crits 2
  variants to 1, with the within-2-inch exception and exact expiry sequence.
* Official Lite Rules provide standard ploy costs/repeat limits; the public official
  equipment explanation supplies the standard four-option limit. Mission-specific
  overrides remain outside validation.
* The 25 keyword definitions are original summaries of the pinned BSData GST.
  Obstructing, Protective and Portable are additionally cross-checked against the
  current equipment document. Independent comparison of the remaining definitions
  against the current full core rules remains open and is labelled in the preview.

Rules-use permission is recorded from the user's explicit statement and instruction
to follow IRONBUILT 40K's original-ability-wording approach. That statement is the
basis, not synonym replacement itself; no independent legal assurance is claimed.
GW/BSData attribution remains. No artwork or raw source rule paragraphs ship.

For Stormcast, current independent evidence still needed is **Battletome: Stormcast
Eternals, fourth edition (2024), Liberators warscroll**, including its basic stats,
weapons and Stalwart Defenders. Accessible upstream metadata supplies the book and
section but no printed page number; `printedPage:null` is intentional. October
Battle Profiles page 22 and Stormcast errata pages 73-74 were already reviewed.
Other inventory entries retain their own publication identities, including Legends,
supplements, Scourge variants and one unresolved publication ID.

## Run the preview

Use app feature branch `work/23-multigame-audit` beside data feature branch
`work/23-multigame-foundation`. From the app checkout:

```powershell
node _build/serve-multigame-preview.cjs --data-root ../ironbuilt-data
```

Open `http://127.0.0.1:17773/?preview=multigame-23`.
The preview requires both a loopback host and the explicit flag. It has no entry
point in the ordinary application. The local server validates the data index hashes,
binds only to 127.0.0.1, accepts same-origin developer requests, and never calls
production APIs or writes persistent state. Selection JSON can be downloaded manually.

Production hosts and requests without opt-in render no data and issue no data
requests. This is a developer feature boundary, not a claim of account authentication.

## Validation evidence

* 30 Node data tests, including 21 explicit valid/invalid roster fixtures, all 35
  loadouts, equipment option/piece distinction, grenade pools, source/version gates,
  source-specific ability corrections and keyword/terrain exceptions.
* PowerShell audit tests: dependency identity, metadata-only output, traversal and
  DTD rejection. Pinned-source builds reproduce identical artifact hashes; committed
  Git blobs are checked against index sizes/hashes.
* Local Chromium checks at 1280, 768 and 390px: team changes, invalid leaders,
  equipment limits, grenade choices, JSON export, reference filters, keyboard focus,
  explicit unverified AoS, zero horizontal page overflow, and production/no-flag gates.
* axe-core WCAG 2 A/AA and 2.1 AA checks report zero violations at all three widths.
  Screenshots were visually inspected for table and form readability.

The app checkout contains the browser test, preview instructions and original UI
screenshots under `.impeccable/review/multigame-23/`. No broad 40K suite was run:
the normal app runtime, data schema, production guards and 8,500,000-byte size guard
were not changed.

## Remaining backlog for review

1. Independently verify full-core keyword baselines and the current Liberators
   battletome entry; resolve the source condition group before evaluating it.
2. Choose one Stormcast regiment leader and verify eligibility/format rules before
   admitting a current army-construction pilot. Do not price from inventory snapshots.
3. Review this foundation and its reference coverage before expanding faction/team
   coverage. No additional factions have been started automatically.
4. Integrate approved adapters into the ordinary app's existing dev/local system
   boundary, then design saves, imports/exports and capabilities per game. Full
   gameplay, mission/event validation, account sync and production release are separate work.
