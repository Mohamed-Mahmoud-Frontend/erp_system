$ErrorActionPreference='Stop'
$erpWorkspace=Split-Path -Parent $PSScriptRoot
$erpScript=Join-Path $erpWorkspace 'scripts/run-background-job.ps1'
$erpAccount=[System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$erpPrincipal=New-ScheduledTaskPrincipal -UserId $erpAccount -LogonType Interactive -RunLevel Limited
$erpSettings=New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 30) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
foreach($erpJob in @('backup','sync')){
 $erpArguments='-NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "'+$erpScript+'" -Job '+$erpJob
 $erpAction=New-ScheduledTaskAction -Execute 'powershell.exe' -Argument $erpArguments -WorkingDirectory $erpWorkspace
 $erpTrigger=if($erpJob -eq 'backup'){New-ScheduledTaskTrigger -Daily -At '02:00'}else{New-ScheduledTaskTrigger -Once -At ((Get-Date).AddMinutes(1)) -RepetitionInterval (New-TimeSpan -Minutes 1)}
 Register-ScheduledTask -TaskName ('FactoryERP-'+$erpJob) -Action $erpAction -Trigger $erpTrigger -Settings $erpSettings -Principal $erpPrincipal -Description 'Factory ERP authorized local backup/sync. Requires signed-in Windows user and internet.' -Force | Select-Object TaskName,State
}
