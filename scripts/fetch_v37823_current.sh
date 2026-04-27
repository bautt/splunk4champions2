#!/usr/bin/env bash
# See scripts/ingest_v37823_current.py (merge into current_2026.log.gz, clear remote /var/log/current).
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec python3 "${SCRIPT_DIR}/ingest_v37823_current.py" "$@"
