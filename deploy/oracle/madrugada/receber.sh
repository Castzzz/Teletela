#!/bin/bash
set -euo pipefail
umask 077
cd /var/lib/teletela-agenda
exec 9>trava
flock -n 9
[[ ! -e pendente ]] || { echo 'Já existe uma versão pendente.' >&2; exit 1; }
stage=$(mktemp -d -p .)
trap 'rm -rf "$stage"' EXIT
tar -xf - -C "$stage"
test -s "$stage/pedido.json"
mv -T "$stage" pendente
