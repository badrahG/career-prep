#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${1:-/opt/career-platform}"
SCRIPT_PATH="$PROJECT_DIR/backend/scripts/backup.sh"
CRON_EXPR="0 2 * * * /bin/bash $SCRIPT_PATH >> /var/log/career_platform_backup.log 2>&1"

if [[ ! -f "$SCRIPT_PATH" ]]; then
  echo "Backup script not found: $SCRIPT_PATH" >&2
  exit 1
fi

( crontab -l 2>/dev/null | grep -v "career_platform_backup.log"; echo "$CRON_EXPR" ) | crontab -
echo "Cron backup installed: $CRON_EXPR"
