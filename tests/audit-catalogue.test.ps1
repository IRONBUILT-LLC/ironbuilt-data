$ErrorActionPreference = 'Stop'
$temp = Join-Path $PSScriptRoot ('ironbuilt-audit-test-' + [guid]::NewGuid())
New-Item -ItemType Directory -Path $temp | Out-Null
try {
  & git -C $temp init --quiet
  if ($LASTEXITCODE -ne 0) { throw 'Cannot initialize test repository' }
  & git -C $temp -c user.name=Test -c user.email=test@example.invalid commit --allow-empty --quiet -m fixture
  '<gameSystem id="system" revision="1"/>' | Set-Content (Join-Path $temp 'system.gst')
  '<catalogue id="library" gameSystemId="system" revision="2"/>' | Set-Content (Join-Path $temp 'Actual Library.cat')
  '<catalogue id="pilot" gameSystemId="system"><catalogueLinks><catalogueLink name="Display name differs" targetId="library"/></catalogueLinks><sharedProfiles><profile><description>Must not be copied</description></profile></sharedProfiles></catalogue>' | Set-Content (Join-Path $temp 'pilot.cat')
  $audit = & "$PSScriptRoot/../tools/audit-catalogue.ps1" -Repository $temp -Catalogue 'pilot.cat'
  $data = ($audit -join "`n") | ConvertFrom-Json
  if ($data.files.Count -ne 3 -or ($audit -join '').Contains('Must not be copied')) { throw 'Dependency closure or prose exclusion failed' }
  $failed = $false
  try { & "$PSScriptRoot/../tools/audit-catalogue.ps1" -Repository $temp -Catalogue '../pilot.cat' | Out-Null } catch { $failed = $true }
  if (!$failed) { throw 'Traversal accepted' }
  '<!DOCTYPE catalogue [<!ENTITY x SYSTEM "file:///private">]><catalogue id="pilot">&x;</catalogue>' | Set-Content (Join-Path $temp 'pilot.cat')
  $failed = $false
  try { & "$PSScriptRoot/../tools/audit-catalogue.ps1" -Repository $temp -Catalogue 'pilot.cat' | Out-Null } catch { $failed = $true }
  if (!$failed) { throw 'DTD accepted' }
  Write-Output 'PASS: source identity dependencies, metadata-only output, traversal and DTD rejection'
} finally {
  $resolved = [IO.Path]::GetFullPath($temp)
  $allowed = [IO.Path]::GetFullPath($PSScriptRoot) + [IO.Path]::DirectorySeparatorChar
  if ($resolved.StartsWith($allowed, [StringComparison]::OrdinalIgnoreCase) -and [IO.Path]::GetFileName($resolved).StartsWith('ironbuilt-audit-test-')) { Remove-Item -LiteralPath $resolved -Recurse -Force }
}
