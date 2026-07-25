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
