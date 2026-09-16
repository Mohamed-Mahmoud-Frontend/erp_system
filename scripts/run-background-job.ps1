param([ValidateSet('backup','sync')][string]$Job='backup')
$ErrorActionPreference='Stop'
$erpWorkspace=Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $erpWorkspace
$erpLog=Join-Path $erpWorkspace ('.private/'+$Job+'-task.log')
if($Job -eq 'sync' -and -not (Select-String -LiteralPath '.env.local' -Pattern '^GOOGLE_SYNC_URL=https://script\.google\.com/' -Quiet)){
 'Google connection is not configured; no data sent.' | Set-Content -LiteralPath $erpLog -Encoding utf8
 exit 2
}
$erpScript=if($Job -eq 'backup'){'scripts/backup/export.mjs'}else{'scripts/sync/run.mjs'}
& 'C:\Program Files\nodejs\node.exe' $erpScript *> $erpLog
exit $LASTEXITCODE
