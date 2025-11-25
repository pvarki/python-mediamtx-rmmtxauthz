#!/usr/bin/env bash
set -e

# Load profile to restore PATH, pnpm, poetry env, etc.
export PATH=/root/.local/bin:/ui/node_modules/.bin:$PATH

echo "Installing dev dependencies..."
pnpm --dir /ui install

/app/docker/container-init.sh

poetry install

mkdir -p /ui_files/mtx
cp -r /ui_build/* /ui_files/mtx/ || true

echo "Starting pnpm build --watch..."
pnpm --dir /ui build --outDir /ui_files/mtx --watch &

echo "Starting uvicorn..."
exec uvicorn --host 0.0.0.0 --port 8005 --log-level debug \
    --factory rmmtxauthz.web.application:get_app --reload
