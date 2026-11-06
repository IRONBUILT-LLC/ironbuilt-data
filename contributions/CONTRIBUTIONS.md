# Community contribution log

This dataset is compiled and corrected by the people who use IRONBUILT. This file is the record of
that: every **data suggestion** from the community, who raised it, and what came of it.

It is deliberately an honest record, not a marketing one. Suggestions that were investigated and
**not** applied are listed alongside those that were, with the reason. A log that only showed
accepted reports would not be a record of what the community contributed.

**How entries get here:** a player files a data suggestion (in-app **Report Bug** → a *Game data*
category, or an issue/PR). It is verified against a source. If it holds up, the dataset is changed
and the entry is appended here with the commit that carried it. See
[`CONTRIBUTING.md`](../CONTRIBUTING.md).

**Credit and privacy:** contributors are credited by the **opt-in** *Credit name* they supply, or as
*anonymous* if they leave it blank. Reporter email addresses are used only to reply and are **never
published here**. Entries below predate the credit-name field, so they are recorded as anonymous.

A machine-readable copy of this log lives in [`log.jsonl`](log.jsonl).

---

## 2026-07

| Reported | Contributor | Area | Suggestion | Outcome |
| --- | --- | --- | --- | --- |
| 2026-07-24 | anonymous | Tyranids · Trygon (Trygon Prime) | Trygon Prime enhancement's WS/Strength buff not shown on the datasheet | **Applied.** The desc had been reworded and dropped 'characteristics', so the stat-mod parser skipped it. Restored the official pack wording; verified +1 S / WS improved by 1 now applies. (`5c4222c`) |
| 2026-07-24 | anonymous | Tyranids · Harridan | Movement wrong + missing Hover | **Applied.** Move was '20+"' (a dead 10e Aircraft convention); corrected to 14" and added Hover. Verified vs Wahapedia 11e / 40k.app. (`5c4222c`) |
| 2026-07-24 | Duck Man | Adeptus Custodes · army rule | Orks/Custodes army rules look like 10e rules | **Applied (Custodes).** Our Martial Ka'tah was the 10e *Index* version; replaced with the current Codex/11e per-unit stance rule (Dacatarai [SUSTAINED HITS 1] / Rendax [LETHAL HITS]), verified vs Wahapedia 11e + the 11e faction pack. **Orks:** no change — WAAAGH! is unchanged 10e→11e and already matches. (`fdfc770`) |
| 2026-07-24 | anonymous | Adeptus Astartes · Wulfen | Wulfen stat line is entirely missing (M/Sv/OC/etc. blank) | **Applied.** The 11e datasheet had an empty stat block; filled in M 9", T 6, Sv 4+, W 2, Ld 7+, OC 0. Verified against Wahapedia 11e. (`0e2c76a`) |
| 2026-07-24 | anonymous | Imperial Knights · Canis Rex | Missing the VEHICLE keyword | **Applied.** Added VEHICLE plus the other missing keywords (WALKER, TITANIC, TOWERING, QUESTORIS). Verified against Wahapedia 11e. (`0e2c76a`) |
| 2026-07-15 | anonymous | Aeldari · Shining Spears | Shining Spears show an *Aspect Shrine Token* ability they should not have | **Applied.** Verified against the 11e Aeldari faction pack and the library source: both list exactly seven Aspect Warrior squads for that ability, and Shining Spears is in neither. Removed. (`a6a5a58`) |
| 2026-07-15 | anonymous | Adeptus Mechanicus · Belisarius Cawl | *Canticles of the Omnissiah* is missing its rules text | **Applied.** The 11e clone had kept only the pointer paragraph and dropped the section it points at. Restored all three canticles from source. (`c1add22`) |
| 2026-07-15 | anonymous | Adeptus Mechanicus · Cybernetica Datasmith | Cannot attach a Datasmith to a Kastelan Robots unit that already has one | **Applied.** Its rule explicitly permits stacking; a missing space in the source text (`havealready`) stopped the clause parsing. Data typo fixed and the parser taught the "one or more other X models" shape. (`a6a5a58`) |
| 2026-07-15 | anonymous | Adeptus Mechanicus · Cohort Cybernetica | Four errors in how the Doctrina Imperatives and *Auto-Divinatory Targeting* are modelled | **Applied — all four correct.** Doctrines change a *characteristic* (BS/WS), not the hit roll, so they now stack with the [HEAVY] Protector grants; Conqueror's AP bonus applies to shooting as well as melee; Auto-Divinatory now sets BS to 3+. Cawl's re-roll aura added. (`58f28cf`) |
| 2026-07-15 | anonymous | Orks · Kommandos | *Slippery Git* should let its bearer lead Kommandos | **Applied.** The unlock is not in the enhancement's rules text; it is the Munitorum Field Manual's `LEADER: KOMMANDOS` line. Prompted a full MFM audit that found five further missing leader unlocks. (`4520e45`, `4735533`) |
| 2026-07-15 | anonymous | Necrons · Imotekh the Stormlord | A weapon with both a melee and a ranged profile is stacked into one entry | **Investigated — not a dataset error.** The export is correct (two entries, A3 ranged / A4 melee); the merge happens in a third-party table mod. The report did surface a genuine double-count elsewhere in the app, which was fixed. (`fba2cc3`) |
| 2026-07-15 | anonymous | Orks · Boyz | Two leaders on a 20-Boy mob does not work for Bigboss + Weirdboy | **Investigated — correctly refused.** The Boyz *Bodyguard* rule requires one of the two to be a WARBOSS, and Bigboss has no WARBOSS keyword. The report did expose a real bug next to it: the "Starting Strength of 20" gate was ignored entirely, so a 10-model mob wrongly accepted two leaders. Fixed. (`a6a5a58`) |
| 2026-07-15 | anonymous | Leagues of Votann · Einhyr Champion | No 4++ save when taking the Teleport crest | **Investigated — no change.** The 4++ comes from the *Weavefield* crest; Teleport grants Deep Strike instead, and the two are mutually exclusive. Data matches source. |
| 2026-07-15 | anonymous | Leagues of Votann · Brôkhyr | Hearthfyre Arsenal enhancements missing for the Brôkhyr | **Investigated — no change.** Three of the four are gated to *Memnyr Strategist* in the source data, which the app reflects; Graviton Vault is ungated and is offered. Re-open with a source if the printed rules differ. |

---

### Summary

| | |
| --- | --- |
| Data suggestions received | 9 |
| Applied to the dataset | 5 |
| Investigated, no change warranted | 4 |
| Distinct dataset corrections shipped | 5 |

Four of the nine were closed without a change, and two of those still uncovered real defects
elsewhere. Both outcomes are contributions.

## 2026-09

| Reported | Contributor | Area | Suggestion | Outcome |
| --- | --- | --- | --- | --- |
| 2026-09-11 | anonymous | Astra Militarum · Cadian Command Squad | Count should be one Commander and four Veterans; check standard/plasma swap | **Applied.** Mandatory group minimums corrected to 1 and 4. Saved/imported counts repaired in app without changing wargear. Standard-to-plasma option already present. (`e18ebcd`) |

## 2026-10-31 — Imperial Agents Artemis current profile

Anonymous community report verified against the supplied current datasheet screenshot and the explicitly titled 11e Imperial Agents reference. Corrected T5, melee S6, Hellfire A3, 75 points, Sustained Hits 1 and the three-wound return. Only this Agents entry changed; current Daily scoring and other variants remain fixed. App source: [d4060f60](https://github.com/IRONBUILT-LLC/ironbuilt/commit/d4060f60). Reference: https://wahapedia.ru/wh40k11ed/factions/imperial-agents/Watch-Captain-Artemis.

## 2026-11-02 - Agents shared marine profiles

Anonymous community report. Ported only the reviewed five-unit correction from data `04ccd71`, matching app source `6a99b0c5`: Deathwatch Kill Team, Aquila Kill Team, Watch Master, Corvus Blackstar and Grey Knights Terminator Squad. The 81-profile parity audit checks the approved current marine counterparts; Agents points, identity, equipment restrictions and faction rules remain independent. Existing stable Artemis correction and all other factions are preserved. Frozen current Daily puzzles, catalogues and scores are unchanged. See the app audit `docs/agents-marine-parity-20261101.md` for sources, aliases and unresolved exceptions.

## 2026-11-05 — reviewed production data corrections

- Anonymous community reporter: A replacement for two weapons must remove both. Release of the reviewed offWith corrections from BSData wh40k-11e; app source dbabd6be and its regression test.
- Anonymous community reporter: Exaction Squad shows a Feel No Pain rule it does not have. Release of the correction verified against Wahapedia 11e and BSData wh40k-11e bf57faf; app source e42e5f2e. The medi-kit returns models and grants no Feel No Pain.
- Anonymous community reporter: E-COG model profiles must use one wound. Release of the reviewed explicit W1 plasma torch and manipulator-arm profiles; app source ccf56555, already ported to production source in b9baba80.
