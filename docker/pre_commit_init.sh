#!/bin/bash -l
if [ ! -d .git ]
then
  git init
  git checkout -b precommit_init
  git add .
  git reset rune
fi
set -e
uv run prek install
SKIP="uv-lock" uv run prek run --all-files
