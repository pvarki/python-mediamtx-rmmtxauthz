#!/bin/bash -l
# shellcheck disable=SC1091
. /container-init.sh
set -e
if [ "$#" -eq 0 ]; then
  # TODO: Put your actual program start here
  exec true
else
  exec "$@"
fi
