#!/usr/bin/env bash
set -e

echo "[start_all] Starting WordCard backend (Spring Boot)..."
cd back
if [ -f pom.xml ]; then
  mvn spring-boot:run > /tmp/wordcard-back.log 2>&1 &
  BACK_PID=$!
  echo "Backend started in background (PID $BACK_PID). Logs: /tmp/wordcard-back.log"
else
  echo "Back pom.xml not found. Abort."
  exit 1
fi
cd - >/dev/null

echo "[start_all] Backend process launched. Please start the frontend via WeChat DevTools manually."
