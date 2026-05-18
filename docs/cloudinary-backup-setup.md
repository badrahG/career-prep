# Cloudinary + Daily Backup Setup

This project now supports Cloudinary for CV uploads, with local-disk fallback.

## 1) Cloudinary setup (backend)

Add these variables to `backend/.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Behavior:
- If Cloudinary variables are present, `/api/cv/upload-photo` and `/api/cv/upload-certificate` return Cloudinary `secure_url`.
- If variables are missing, files are stored locally in `backend/uploads` and served via `/uploads/...`.

## 2) Linux daily backup (cron)

Run once on server:

```bash
bash /path/to/career-platform/backend/scripts/install_backup_cron.sh /path/to/career-platform
```

Manual backup test:

```bash
bash /path/to/career-platform/backend/scripts/backup.sh
```

Optional env overrides:
- `DB_NAME`, `DB_USER`, `DB_HOST`, `DB_PORT`, `DB_PASSWORD`
- `BACKUP_DIR`, `RETENTION_DAYS`, `LOG_FILE`

## 3) Windows daily backup (Task Scheduler)

Create/update scheduled task:

```powershell
powershell -ExecutionPolicy Bypass -File C:\career-platform\backend\scripts\setup_backup_task.ps1
```

Manual backup test:

```powershell
powershell -ExecutionPolicy Bypass -File C:\career-platform\backend\scripts\backup.ps1
```

Optional params for `backup.ps1`:
- `-DbName`, `-DbUser`, `-DbHost`, `-DbPort`, `-DbPassword`
- `-BackupDir`, `-RetentionDays`, `-LogFile`
