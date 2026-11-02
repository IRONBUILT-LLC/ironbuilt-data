param([Parameter(Mandatory)][string]$Repository)
$ErrorActionPreference = 'Stop'
$revision = '30c48ce2bdcabc0cb6516f813283086cc2d78fab'
$file = '2024 - Angels of Death.cat'
$info = [Diagnostics.ProcessStartInfo]::new('git')
$info.UseShellExecute = $false; $info.RedirectStandardOutput = $true
foreach ($arg in @('-C', (Resolve-Path -LiteralPath $Repository).Path, 'cat-file', 'blob', "${revision}:$file")) { $info.ArgumentList.Add($arg) }
$process = [Diagnostics.Process]::Start($info); $stream = [IO.MemoryStream]::new()
try { $process.StandardOutput.BaseStream.CopyTo($stream); $process.WaitForExit(); if ($process.ExitCode) { throw 'Pinned source missing' }; $bytes = $stream.ToArray() } finally { $process.Dispose(); $stream.Dispose() }
$settings = [Xml.XmlReaderSettings]::new(); $settings.DtdProcessing = [Xml.DtdProcessing]::Prohibit; $settings.XmlResolver = $null; $settings.MaxCharactersInDocument = 6000000
$reader = [Xml.XmlReader]::Create([IO.StringReader]::new([Text.Encoding]::UTF8.GetString($bytes)), $settings)
try { $doc = [Xml.XmlDocument]::new(); $doc.XmlResolver = $null; $doc.Load($reader) } finally { $reader.Dispose() }
$index = @{}; foreach ($n in $doc.SelectNodes('//*[@id]')) { $index[$n.GetAttribute('id')] = $n }
$models = @($doc.SelectNodes('//*[local-name()="selectionEntry" and @type="model"]'))
if ($models.Count -ne 9) { throw 'Expected exactly the nine reviewed Angels operative types' }
$result = foreach ($model in $models) {
  $basic = $model.SelectSingleNode('./*[local-name()="profiles"]/*[@typeName="Operative"]')
  $stats = [ordered]@{}; foreach ($field in $basic.characteristics.characteristic) { $stats[$field.name] = $field.InnerText.Trim() }
  $entries = @{}; foreach ($entry in $model.SelectNodes('.//*[local-name()="selectionEntry" and @type="upgrade"]')) { $entries[$entry.id] = $entry }
  foreach ($link in $model.SelectNodes('.//*[local-name()="entryLink" and @type="selectionEntry"]')) {
    if (!$index.ContainsKey($link.targetId)) { throw "Missing weapon source: $($link.targetId)" }; $entries[$link.targetId] = $index[$link.targetId]
  }
  $weapons = @(foreach ($entry in ($entries.Values | Sort-Object id)) { foreach ($p in $entry.SelectNodes('./*[local-name()="profiles"]/*[@typeName="Weapons"]')) {
    $values = [ordered]@{}; $fieldIds = @{}; foreach ($field in $p.characteristics.characteristic) { $values[$field.name] = $field.InnerText.Trim(); $fieldIds[$field.typeId] = $field.name }
    $applied = @(); $pending = @()
    foreach ($modifier in $p.modifiers.modifier) {
      if (!$modifier) { continue }
      $conditions = @($modifier.conditions.condition)
      if ($modifier.type -eq 'set' -and $fieldIds.ContainsKey($modifier.field) -and $conditions.Count -eq 1 -and $conditions[0].type -eq 'instanceOf' -and $conditions[0].scope -eq 'ancestor') {
        if ($conditions[0].childId -eq $model.id) { $name = $fieldIds[$modifier.field]; $applied += [ordered]@{field = $name; base = $values[$name]; effective = $modifier.value; operativeSourceId = $model.id}; $values[$name] = $modifier.value }
      } else { $pending += [ordered]@{field = $modifier.field; type = $modifier.type; value = $modifier.value} }
    }
    [ordered]@{sourceId = $p.id; sourceEntryId = $entry.id; name = ($p.name -replace '^[^A-Za-z]+',''); fields = $values; appliedModifiers = @($applied); unresolvedModifiers = @($pending)}
  } })
  [ordered]@{sourceId = $model.id; name = $model.name; basicSourceId = $basic.id; stats = $stats; weapons = $weapons; abilityProfiles = @($model.profiles.profile | Where-Object typeName -In 'Abilities','Unique Actions' | ForEach-Object { [ordered]@{sourceId = $_.id; name = $_.name; type = $_.typeName} })}
}
[ordered]@{schema = 'ironbuilt-angels-reference/1'; sourceRevision = $revision; sourceFile = $file; sourceSha256 = [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($bytes)).ToLowerInvariant(); sourceOnly = $true; rawAbilityTextIncluded = $false; models = @($result)} | ConvertTo-Json -Depth 15
