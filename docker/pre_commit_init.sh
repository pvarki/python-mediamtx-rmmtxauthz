#!/bin/bash -l
if [ ! -d .git ]
then
  git init
  git checkout -b precommit_init
  git add .
  git reset rune
fi
set -e
uv run pre-commit install
SKIP="uv-lock" uv run pre-commit run --all-files
