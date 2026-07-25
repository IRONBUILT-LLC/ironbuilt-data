# Bug-report validation procedure

This is the **reviewer's procedure** for turning a community data suggestion into a dataset change.
It is the detailed version of the "verified against a source" step in
[`CONTRIBUTING.md`](CONTRIBUTING.md). The contributor side (how to file a report) lives there; this
document is how a filed report is **judged, fixed, and recorded**.

The guiding rule: **nothing is changed on a reporter's word alone.** Every change is validated
against an authoritative source first, and the outcome — applied or not — is logged.

---

## The five steps

Every report is worked in this order:

1. **Identify** — restate precisely what the reporter is claiming is wrong, and what they say it
   should be. Reduce it to a single, checkable factual claim. If a report bundles several issues,
   split them.
2. **Validate** — check that claim against the authoritative sources, in the priority order below.
   Find the *current* correct value. Do not stop at the first source if a higher-priority one
   disagrees.
3. **Fix** — only if it checks out. Edit the dataset source, rebuild, and republish the bundle.
   If the claim does not hold up, make no change.
4. **Report back to the user** — tell them what was found and what was done: the corrected value,
   the source it was validated against, or the reason it was refused / needs no change.
5. **Log the contribution** — every validated report (applied *or* not) is appended to the
   community contribution log (see below). This is what makes the dataset a community record.

---

## Source hierarchy (the order that settles disagreements)

When sources conflict, the **higher** source wins. Always validate points, keywords, options and
rules against the highest source that covers the claim.

| Priority | Source | What it is authoritative for | Why it ranks here |
| --- | --- | --- | --- |
| **1** | **Munitorum Field Manual (MFM)** | Points values, Detachment Points, force dispositions, detachment **Unique** tags, borrowed/allied costs | The MFM is the live, most-frequently-updated points/balance document. It supersedes points printed anywhere else. |
| **2** | **Faction Pack** (official GW 11e faction pack PDF) | Detachments, enhancements, stratagems, army-rule and datasheet **errata**, wargear changes | The edition-current rules layer. Overrides the codex where they differ. Note it only prints rules for the detachments/units *it contains* — absence is not evidence. |
| **3** | **Wahapedia** | Datasheet stats, keywords, abilities, wargear profiles, unit composition | A faithful, complete transcription of the codex + errata. Use for anything the MFM/pack don't cover (most base datasheet data). Confirm it is showing the **current edition**, not a stale one. |
| **4** | **BSData** (`.cat` catalogues) | Structural detail: option groupings, per-model wargear, min/max counts, keyword lists | Community-maintained and structurally precise, but can lag official updates. Use to resolve *how* something is composed once the *what* is settled by a higher source. |

**Edition check first.** 11th edition launched mid-2026 and many pages still show 10th-edition
content. Before trusting any source, confirm it is 11e. If only 10e data exists for a claim, say so
explicitly rather than applying 10e values as if current.

**Cite what you used.** Every applied change records the source it was validated against, so the
next reviewer can re-check it.

---

## Outcomes

Every worked report ends in exactly one of:

- **Applied** — the claim was validated and the dataset was changed. Record the corrected value and
  the commit.
- **Investigated — no change** — the data already matches the source, or the reporter's expectation
  was mistaken. Record why. (This is a real contribution: it documents that the data was checked.)
- **Refused / could not verify** — the claim could not be confirmed against any source. No change is
  made; the report is logged as needing a source. Re-open if the reporter supplies one.

A change is **never** made to satisfy a report that a source contradicts, however confident the
reporter is.

---

## Logging a contribution

Two records, kept in step, under [`contributions/`](contributions/):

- **`contributions/log.jsonl`** — one JSON object per line (machine-readable). Fields:
  `reported` (date), `contributor` (the reporter's opt-in credit name, or `null` for anonymous),
  `faction`, `unit` (or `null`), `category` (`data` | `wargear` | `detachment` | `rules`),
  `kind` (`data-suggestion`), `suggestion` (the reporter's claim), `outcome`
  (`applied` | `investigated-no-change` | `refused`), `note` (what was found + the source), and
  `commits` (the commit hashes that carried the fix, or `[]`).
- **`contributions/CONTRIBUTIONS.md`** — the human-readable table, same information, grouped by
  month.

**Credit and privacy:** contributors are credited only by the **opt-in public credit name** they
supply, or as *anonymous*. Reporter **email addresses are used only to reply and are never
published** in the log or anywhere in this repo.

---

## Where the change is actually made

Game data is edited in the IRONBUILT app repo's hand-maintained 11e source
(`_data/11e/*.json`), then compiled and published to this repo's `datasets/` bundle + `manifest.json`
via the app repo's `build-dataset-11e.ps1`. The app and other consumers (e.g. the IRONLOOKUP bot)
read the published bundle. A fix is not "done" until the bundle is rebuilt and republished — an
edit that never reaches the bundle changes nothing for users.
