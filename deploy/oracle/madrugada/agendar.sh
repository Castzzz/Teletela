#!/bin/bash
# Enfileira uma versão explicitamente aprovada. O rascunho deve apontar para o SHA completo.
set -euo pipefail
cd "$(dirname "$0")/../../.."
source deploy/oracle/config.sh
modo=${1:-}
case "$modo" in app|servidor|ambos) ;; *) echo 'Uso: agendar.sh app|servidor|ambos' >&2; exit 2;; esac
if [[ -n "$(git status --porcelain -- . ':!public/sounds')" ]]; then
  echo 'Crie o commit da versão aprovada antes de agendar.' >&2; exit 1
fi
commit=$(git rev-parse HEAD)
tag="v$(node -p "require('./package.json').version")"
base=/var/lib/teletela-agenda
ssh_cmd=(ssh -o BatchMode=yes -i "$SSH_KEY" "$VM")
stage=$(mktemp -d)
trap 'rm -rf "$stage"' EXIT
if [[ "$modo" != servidor ]]; then
  "${ssh_cmd[@]}" "sudo test -s '$base/github.token'" || { echo 'Falta a credencial do repositório na agenda.' >&2; exit 1; }
  gh release view "$tag" --repo Castzzz/Teletela --json databaseId --jq .databaseId > "$stage/id"
  gh api "repos/Castzzz/Teletela/releases/$(cat "$stage/id")" > "$stage/release"
fi
python3 - "$stage" "$commit" "$tag" <<'PY'
import json, sys
from pathlib import Path
p, commit, tag = Path(sys.argv[1]), *sys.argv[2:]
pedido = {'commit': commit}
if (p/'release').exists():
    r = json.loads((p/'release').read_text())
    assets = sorted([a['name'], a['id'], a['digest']] for a in r['assets'])
    exigidos = {'latest.yml','latest-linux.yml','Teletela-Setup.exe','Teletela-Setup.exe.blockmap',
                'Teletela-Portatil.exe','Teletela.AppImage','Teletela.tar.gz'}
    if (not r['draft'] or r['prerelease'] or r['tag_name'] != tag or r['target_commitish'] != commit
        or not exigidos.issubset(a[0] for a in assets)
        or not all(a[2] and a[2].startswith('sha256:') for a in assets)):
        sys.exit('Confira o commit, o tipo do rascunho e os instaladores com SHA-256.')
    pedido.update(release=r['id'], tag=tag, arquivos=assets)
(p/'pedido.json').write_text(json.dumps(pedido))
PY
arquivos=(pedido.json)
if [[ "$modo" != app ]]; then
  TELETELA_PREPARAR_EM="$stage/servidor" ENABLE_MUSIC=1 bash deploy/oracle/deploy.sh
  arquivos+=(servidor)
fi
# O upload só vira um pedido após o tar completo, sob a mesma trava do timer.
tar -C "$stage" -cf - "${arquivos[@]}" | "${ssh_cmd[@]}" "sudo /usr/local/lib/teletela-madrugada/receber.sh"
echo "Agendado $commit ($modo). O PC já pode ser desligado."
