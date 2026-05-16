#!/bin/bash
# CareerPrep PostgreSQL өдөр тутмын backup скрипт

DB_NAME="${DB_NAME:-career_platform}"
DB_USER="${DB_USER:-odoo}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
PGPASSWORD="${DB_PASSWORD:-odoo123}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/career_platform}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="backup_${DATE}.sql.gz"
LOG_FILE="${LOG_FILE:-/var/log/career_platform_backup.log}"

export PGPASSWORD

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Backup эхэллээ: $FILENAME" >> "$LOG_FILE"

pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_DIR/$FILENAME"

if [ ${PIPESTATUS[0]} -eq 0 ]; then
    SIZE=$(du -sh "$BACKUP_DIR/$FILENAME" | cut -f1)
    echo "[$(date)] ✓ Backup амжилттай: $FILENAME ($SIZE)" >> "$LOG_FILE"

    DELETED=$(find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -print -delete | wc -l)
    if [ "$DELETED" -gt 0 ]; then
        echo "[$(date)] Хуучин $DELETED backup файл устгагдлаа" >> "$LOG_FILE"
    fi
else
    echo "[$(date)] ✗ Backup алдаа гарлаа!" >> "$LOG_FILE"
    exit 1
fi
