#!/bin/sh
# Sao lưu database ChungAuto (Docker) vào thư mục backups/, giữ 14 ngày gần nhất.
# Chạy hằng ngày bằng cron:  0 3 * * * cd /opt/chungauto && sh scripts/backup.sh >> backups/backup.log 2>&1
# Khôi phục:  gunzip -c backups/<tệp>.sql.gz | docker compose exec -T db psql -U chungauto -d chungauto
set -e
cd "$(dirname "$0")/.."
mkdir -p backups
f="backups/chungauto-$(date +%Y%m%d-%H%M%S).sql.gz"
docker compose exec -T db pg_dump -U chungauto -d chungauto --no-owner --clean --if-exists | gzip > "$f"
find backups -name 'chungauto-*.sql.gz' -mtime +14 -delete
echo "$(date '+%F %T') đã sao lưu $f ($(du -h "$f" | cut -f1))"
