# Minimal numerical pilot review

`minimal-review.json` is a developer review artifact, not a dataset. It deliberately
contains no numerical stat lines and cannot enter the public dataset manifest.
Candidate numerical evidence remains local and unpublished. There is no player UI.

The current official Angels of Death PDF text agrees with all four candidate Captain
values; its stat card is on PDF page 1 and changes are logged on page 10. The official
download index dates the document 2026-08-26. The 2026-10-28 update article identifies
shared terrain changes and other teams' changes, without announcing a Captain stat
change. Text extraction places APL separately, so visual verification is still open.
This is a text comparison, not a claim that every conditional mechanic is verified.

Liberators remain unverified against a current official baseline. The publicly
accessible launch warscroll and preview article are historical. The October update
not announcing a Stormcast change cannot prove the current battletome baseline.
No paid battletome or entitled app access was bypassed.

## Exact source restriction encountered

The [official website terms](https://www.warhammer-community.com/en-gb/terms-of-use/),
Downloadable Material Licence paragraphs 1-2, limit the grant to personal storage
and access. Paragraph 3 extends its restriction to parts of downloaded material.
Clause 3.5 specifically addresses use
"commercially or in relation to any business or business activities".
The inspected [June 2026 Battle Profiles](https://assets.warhammer-community.com/eng_aos_battle_profiles-2wsrrn6poc-wb3lenb8nn.pdf),
PDF page 2 footer, separately limits personal use and expressly restricts
"text and data mining activities". It is an inspected terms example, not current
authority for the pilot's values.

Consequently automated extraction and publication **from these official downloads**
stopped. This is source-specific; it is not a declaration that every game number is
copyrightable or that no factual-value pilot can ever be published. An alternative
applicable source-use basis or permission would need to address these express terms.
Code, synthetic tests and verification metadata continue independently.

## Concrete next coverage milestones

1. Establish a source route permitting the intended limited use; do not treat a
   third-party software MIT licence as overriding the official download terms.
2. Obtain a current accessible/entitled official Liberators baseline and finish the
   Captain visual comparison. Record exact source locations and effective dates.
3. Add typed per-game weapon profiles, then one independently encoded selection
   constraint at a time, with source evidence and unsupported-condition reporting.
4. Complete a small Stormcast regiment and a complete Angels of Death selection
   pilot. Test counts, eligibility, exclusions, source revisions and partial coverage.
5. Only then wire the isolated dev/local app preview, with explicit production
   exclusion and no claims of complete faction/team support.

Validation: `node --test tests/*.test.cjs` plus
`./tests/audit-catalogue.test.ps1`. The numeric adapter validates its serialized
output, provenance, game-specific fields and permanent audit-only status; it rejects
added artwork/prose fields, gameplay claims and cross-game corruption.
