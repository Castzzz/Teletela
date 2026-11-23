#!/bin/bash
# Lê a credencial em silêncio no terminal e grava somente no Ubuntu, com acesso do root.
set -euo pipefail
source "$(dirname "$0")/../config.sh"
read -rsp 'Token fine-grained do repositório Castzzz/Teletela: ' credencial </dev/tty
echo >&2
[[ "$credencial" == github_pat_* ]] || { echo 'Use um token fine-grained.' >&2; exit 1; }
printf '%s\n' "$credencial" | ssh -i "$SSH_KEY" -o BatchMode=yes "$VM" 'sudo flock /var/lib/teletela-agenda/trava sh -ec "
  umask 077
  cd /var/lib/teletela-agenda
  cat > github.token.novo
  test -s github.token.novo
  mv github.token.novo github.token"'
