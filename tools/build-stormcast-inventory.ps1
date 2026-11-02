param([Parameter(Mandatory)][string]$Repository)
$ErrorActionPreference = 'Stop'
$revision = '6909c1401ee52c63b5187a7c2d00fb34190479bd'
function Read-Source([string]$name) {
  $info = [Diagnostics.ProcessStartInfo]::new('git'); $info.UseShellExecute = $false; $info.RedirectStandardOutput = $true
  foreach ($arg in @('-C', (Resolve-Path -LiteralPath $Repository).Path, 'cat-file', 'blob', "${revision}:$name")) { $info.ArgumentList.Add($arg) }
  $process = [Diagnostics.Process]::Start($info); $stream = [IO.MemoryStream]::new()
  try { $process.StandardOutput.BaseStream.CopyTo($stream); $process.WaitForExit(); if ($process.ExitCode) { throw "Pinned source missing: $name" }; $bytes = $stream.ToArray() } finally { $process.Dispose(); $stream.Dispose() }
  $settings = [Xml.XmlReaderSettings]::new(); $settings.DtdProcessing = [Xml.DtdProcessing]::Prohibit; $settings.XmlResolver = $null; $settings.MaxCharactersInDocument = 6000000
  $reader = [Xml.XmlReader]::Create([IO.StringReader]::new([Text.Encoding]::UTF8.GetString($bytes)), $settings)
  try { $doc = [Xml.XmlDocument]::new(); $doc.XmlResolver = $null; $doc.Load($reader) } finally { $reader.Dispose() }
  return @{doc = $doc; source = [ordered]@{url = ('https://github.com/BSData/age-of-sigmar-4th/blob/' + $revision + '/' + [Uri]::EscapeDataString($name)); sha256 = [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($bytes)).ToLowerInvariant(); location = $name; revision = $revision}}
}
$library = Read-Source 'Stormcast Eternals - Library.cat'; $catalogue = Read-Source 'Stormcast Eternals.cat'; $system = Read-Source 'Age of Sigmar 4.0.gst'
$publications = @{}; foreach ($publication in $system.doc.SelectNodes('//*[local-name()="publication"]')) { $publications[$publication.id] = $publication.name }
$units = @{}; foreach ($unit in $library.doc.SelectNodes('/*/*[local-name()="sharedSelectionEntries"]/*[@type="unit"]')) { $units[$unit.id] = $unit }
$entries = @(foreach ($link in $catalogue.doc.SelectNodes('/*/*[local-name()="entryLinks"]/*[@type="selectionEntry"]')) {
  if (!$units.ContainsKey($link.targetId)) { continue }; $unit = $units[$link.targetId]
  $keywords = @($unit.categoryLinks.categoryLink | ForEach-Object name)
  $cost = $link.costs.cost | Where-Object typeId -EQ 'points' | Select-Object -First 1
  $snapshotPoints = if ($null -eq $cost) { $null } else { [int]$cost.value }
  $profiles = @($unit.profiles.profile | Where-Object typeName -EQ 'Unit' | ForEach-Object { [ordered]@{sourceId = $_.id; sourceName = $_.name; currentVerified = $false} })
  [ordered]@{
    id = 'aos:catalogue:' + $link.id; name = $link.name; sourceId = $unit.id; sourceLinkId = $link.id; sourceRefs = @(0,1)
    roleCandidate = $(if ($keywords -contains 'HERO') { 'hero' } else { 'unit' })
    sourceKeywords = $keywords; sourcePoints = $snapshotPoints; pointsStatus = $(if ($unit.id -eq 'e914-877f-21fe-8db9' -and $snapshotPoints -eq 90) { 'Liberators pilot separately verified against October 2026 Battle Profiles page 22' } else { 'upstream snapshot only; current points not verified' })
    basicProfileReferences = $profiles; currentProfilesVerified = $false; regimentEligibility = 'unverified'; reinforcementEligibility = 'unverified'
    sourceConstraintCount = $unit.SelectNodes('.//*[local-name()="constraint"]').Count + $link.SelectNodes('.//*[local-name()="constraint"]').Count
    sourceModifierCount = $unit.SelectNodes('.//*[local-name()="modifier"]').Count + $link.SelectNodes('.//*[local-name()="modifier"]').Count
    requiredBaseline = [ordered]@{publication = $(if ($publications.ContainsKey($unit.publicationId)) { $publications[$unit.publicationId] } else { 'Unresolved upstream publication ID' }); section = ($unit.name + ' warscroll'); sourcePublicationId = $unit.publicationId; sourceRefs = @(2); printedPage = $(if ($unit.HasAttribute('page')) { $unit.GetAttribute('page') } else { $null }); reason = 'Use exact upstream references where supplied; do not invent missing printed page numbers.'}
  }
})
$pilot = Get-Content -Raw (Join-Path $PSScriptRoot '../pilots/aos-liberators.json') | ConvertFrom-Json
[ordered]@{
  schema = 'ironbuilt-stormcast-inventory/1'; id = 'aos:stormcast-inventory'; releaseChannel = 'dev'; checkedAt = '2026-11-02'
  context = [ordered]@{systemId = 'aos'; editionId = '4e'; formatId = 'army-structure'; rulesetId = 'stormcast-source-inventory'; sourceRevision = $revision; datasetVersion = '2026.11.02-inventory.1'}
  authorization = $pilot.authorization; attribution = $pilot.attribution
  coverage = [ordered]@{sourceInventoryOnly = $true; currentProfilesVerified = $false; regimentEligibilityVerified = $false; fullValidation = $false; gameplay = $false}
  sources = @($library.source,$catalogue.source,$system.source); entries = $entries
  pending = @('Inventory identifies upstream entries, not supported current warscrolls.','Current battletome baselines and eligible regiment leaders/units remain independently unverified.','Structure validation does not price armies or certify legal army construction.','Named variants, narrative restrictions, reinforcement permissions and universal army requirements need individual review.')
} | ConvertTo-Json -Depth 12
