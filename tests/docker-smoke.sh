#!/usr/bin/env bash
set -euo pipefail

game_url="http://127.0.0.1:${GAME_PORT:-8080}"
docker compose config --quiet
docker compose exec -T game nginx -t

test "$(curl --fail --silent --show-error "$game_url/healthz")" = "ok"
echo 'PASS container health endpoint and Nginx configuration'

curl --fail --silent --show-error "$game_url/" | cmp - index.html
curl --fail --silent --show-error --compressed "$game_url/" | cmp - index.html
echo 'PASS HTML bytes and compressed responses match the packaged game'

find art -type f -print | while IFS= read -r asset; do
    curl --fail --silent --show-error --output /dev/null "$game_url/$asset"
done
echo 'PASS all game artwork loads'

for missing in /missing-file /art/missing.png /Dockerfile /compose.yaml /.git/config; do
    status="$(curl --silent --show-error --output /dev/null --write-out '%{http_code}' "$game_url$missing")"
    test "$status" = "404"
done
echo 'PASS missing assets and deployment files are not served as game HTML'
