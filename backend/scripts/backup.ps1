param(
    [string]$DbName = "career_platform",
    [string]$DbUser = "odoo",
    [string]$DbHost = "localhost",
    [string]$DbPort = "5432",
    [string]$DbPassword = "odoo123",
    [string]$BackupDir = "C:\\backups\\career_platform",
    [int]$RetentionDays = 7,
    [string]$LogFile = "C:\\backups\\career_platform\\backup.log"
)

$ErrorActionPreference = "Stop"

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$filename = "backup_$timestamp.sql"
$gzipFile = "$filename.gz"

New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $LogFile) | Out-Null

$env:PGPASSWORD = $DbPassword

$sqlPath = Join-Path $BackupDir $filename
$gzPath = Join-Path $BackupDir $gzipFile

"[$(Get-Date -Format s)] Backup started: $gzipFile" | Out-File -FilePath $LogFile -Append

try {
    & pg_dump -h $DbHost -p $DbPort -U $DbUser $DbName -f $sqlPath
    if ($LASTEXITCODE -ne 0) {
        throw "pg_dump failed with exit code $LASTEXITCODE"
    }

    $inStream = [System.IO.File]::OpenRead($sqlPath)
    $outStream = [System.IO.File]::Create($gzPath)
    $gzip = New-Object System.IO.Compression.GzipStream($outStream, [System.IO.Compression.CompressionLevel]::Optimal)
    $inStream.CopyTo($gzip)
    $gzip.Dispose()
    $outStream.Dispose()
    $inStream.Dispose()
    Remove-Item -LiteralPath $sqlPath -Force

    $cutoff = (Get-Date).AddDays(-$RetentionDays)
    $deleted = Get-ChildItem -Path $BackupDir -Filter "backup_*.sql.gz" -File | Where-Object { $_.LastWriteTime -lt $cutoff }
    foreach ($file in $deleted) {
        Remove-Item -LiteralPath $file.FullName -Force
    }

    "[$(Get-Date -Format s)] Backup completed: $gzipFile" | Out-File -FilePath $LogFile -Append
}
catch {
    "[$(Get-Date -Format s)] Backup failed: $($_.Exception.Message)" | Out-File -FilePath $LogFile -Append
    throw
}
finally {
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}
