param(
    [string]$TaskName = "CareerPlatform-DB-Backup",
    [string]$ProjectPath = "C:\\career-platform",
    [string]$RunAt = "02:00"
)

$scriptPath = Join-Path $ProjectPath "backend\scripts\backup.ps1"
if (-not (Test-Path $scriptPath)) {
    throw "Backup script not found: $scriptPath"
}

$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`""
$trigger = New-ScheduledTaskTrigger -Daily -At $RunAt
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType S4U -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force | Out-Null
Write-Output "Scheduled task '$TaskName' created/updated."
