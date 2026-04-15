#!/bin/bash
# Auto-restart dev server until turbopack cache is rebuilt
cd /home/z/my-project
ATTEMPT=0
while true; do
  ATTEMPT=$((ATTEMPT + 1))
  echo "=== Starting dev server (attempt $ATTEMPT) ===" >> dev.log
  npx next dev -p 3000 >> dev.log 2>&1
  EXIT_CODE=$?
  echo "=== Server exited with code $EXIT_CODE ===" >> dev.log
  if [ $EXIT_CODE -eq 0 ]; then
    break
  fi
  sleep 3
done
