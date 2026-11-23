#!/bin/bash
# Instala somente a agenda. Nenhum release é criado e a sala continua rodando.
set -euo pipefail
cd "$(dirname "$0")"
source ../config.sh
tar -cf - executar.py receber.sh teletela-madrugada.{service,timer} | ssh -o BatchMode=yes -i "$SSH_KEY" "$VM" 'set -eu
  stage=$(mktemp -d)
  trap '\''rm -rf "$stage"'\'' EXIT
  tar -xf - -C "$stage"
  cd "$stage"
  sudo install -d -m 700 /var/lib/teletela-agenda
  sudo install -d /usr/local/lib/teletela-madrugada
  sudo install -m 755 executar.py receber.sh /usr/local/lib/teletela-madrugada/
  sudo install -m 644 teletela-madrugada.service teletela-madrugada.timer /etc/systemd/system/
  sudo systemctl daemon-reload
  sudo systemctl enable --now teletela-madrugada.timer
  systemctl list-timers --all teletela-madrugada.timer'
