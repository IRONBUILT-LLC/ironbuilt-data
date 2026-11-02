param([Parameter(Mandatory)][string]$Repository, [Parameter(Mandatory)][string]$Catalogue)
$ErrorActionPreference = 'Stop'
# Read metadata only. Do not copy profiles, characteristics, descriptions or artwork.
$root = (Resolve-Path -LiteralPath $Repository).Path
$revision = & git -C $root rev-parse HEAD
if ($LASTEXITCODE -ne 0) { throw 'Cannot identify source revision' }
$revision = $revision.Trim()
$settings = [System.Xml.XmlReaderSettings]::new()
$settings.DtdProcessing = [System.Xml.DtdProcessing]::Prohibit
$settings.XmlResolver = $null
$settings.MaxCharactersInDocument = 30000000
$byId = @{}
foreach ($file in (Get-ChildItem -LiteralPath $root -File | Where-Object Extension -In '.cat','.gst')) {
  $reader = [System.Xml.XmlReader]::Create($file.FullName, $settings)
  try {
    [void]$reader.MoveToContent()
    $id = $reader.GetAttribute('id')
    if ($id) {
      if ($byId.ContainsKey($id)) { throw "Duplicate catalogue identity: $id" }
      $byId[$id] = $file.Name
    }
  } finally { $reader.Dispose() }
}
$seen = @{}
$queue = [System.Collections.Generic.Queue[string]]::new()
$queue.Enqueue($Catalogue)
$files = [System.Collections.Generic.List[object]]::new()
while ($queue.Count) {
  $relative = $queue.Dequeue()
  if ($seen.ContainsKey($relative)) { continue }
  if ([IO.Path]::GetFileName($relative) -ne $relative) { throw 'Only repository root catalogue filenames are supported' }
  $seen[$relative] = $true
  $path = Join-Path $root $relative
  # Hash canonical git blob bytes, not Windows CRLF checkout bytes.
  $info = [Diagnostics.ProcessStartInfo]::new('git')
  $info.UseShellExecute = $false
  $info.RedirectStandardOutput = $true
  $info.RedirectStandardError = $true
  foreach ($arg in @('-C', $root, 'cat-file', 'blob', "${revision}:$relative")) { $info.ArgumentList.Add($arg) }
  $process = [Diagnostics.Process]::Start($info)
  $stream = [IO.MemoryStream]::new()
  try {
    $process.StandardOutput.BaseStream.CopyTo($stream)
    $process.WaitForExit()
    if ($process.ExitCode -ne 0) { throw "Source file is absent from pinned commit: $relative" }
    $bytes = $stream.ToArray()
  } finally { $process.Dispose(); $stream.Dispose() }
  $inputStream = [IO.MemoryStream]::new($bytes, $false)
  $reader = [System.Xml.XmlReader]::Create($inputStream, $settings)
  try { $doc = [System.Xml.XmlDocument]::new(); $doc.XmlResolver = $null; $doc.Load($reader) } finally { $reader.Dispose(); $inputStream.Dispose() }
  $targetIds = @($doc.SelectNodes('//*[local-name()="catalogueLink"]') | ForEach-Object { $_.GetAttribute('targetId') })
  if ($doc.DocumentElement.LocalName -eq 'catalogue') { $targetIds += $doc.DocumentElement.GetAttribute('gameSystemId') }
  $links = @($targetIds | ForEach-Object {
    if (!$byId.ContainsKey($_)) { throw "Missing source dependency: $_" }
    $byId[$_]
  } | Select-Object -Unique)
  foreach ($link in $links) { $queue.Enqueue($link) }
  $files.Add([ordered]@{
    path = $relative
    sha256 = [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($bytes)).ToLowerInvariant()
    bytes = $bytes.Length
    revision = $doc.DocumentElement.GetAttribute('revision')
    selectionEntries = $doc.SelectNodes('//*[local-name()="selectionEntry"]').Count
    entryLinks = $doc.SelectNodes('//*[local-name()="entryLink"]').Count
    modifiers = $doc.SelectNodes('//*[local-name()="modifier"]').Count
    constraints = $doc.SelectNodes('//*[local-name()="constraint"]').Count
    profileTypes = @($doc.SelectNodes('//*[local-name()="profileType"]') | ForEach-Object { $_.GetAttribute('name') })
    dependencies = $links
  })
}
$licenses = @(Get-ChildItem -LiteralPath $root -File | Where-Object Name -Match '^(licen[cs]e|copying)(\.|$)' | ForEach-Object Name)
[ordered]@{ schema = 'ironbuilt-source-audit/1'; sourceRevision = $revision; catalogue = $Catalogue; licenseFiles = $licenses; rulesCopied = $false; files = @($files.ToArray()) } | ConvertTo-Json -Depth 8
