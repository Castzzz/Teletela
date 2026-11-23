#!/usr/bin/python3
"""Consome apenas o pedido já aprovado e preparado pelo dono."""
import ctypes
import datetime
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import time
from urllib.error import HTTPError
from urllib.parse import quote
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

BASE = Path('/var/lib/teletela-agenda')
FILA = BASE / 'pendente'
APP = Path('/opt/telinha')
SAUDE = 'http://127.0.0.1:8080/api/health'
PUBLICA = 'https://colheitafartus.duckdns.org/api/health'
API = 'https://api.github.com/repos/Castzzz/Teletela/releases/'
SERVICOS = ['telinha-sfu', 'telinha-server']


def obter(url):
    with urlopen(url, timeout=10) as resposta:
        return json.load(resposta)


def livre(estado):
    if estado.get('status') != 'ok':
        return False
    if 'voiceOccupied' in estado:
        return estado['voiceOccupied'] is False
    return type(estado.get('totalUsers')) is int and estado['totalUsers'] == 0


def conferir_horario():
    if datetime.datetime.now(ZoneInfo('America/Sao_Paulo')).hour != 3:
        raise RuntimeError('Fora da janela das 03h às 04h.')


def conferir():
    conferir_horario()
    if not livre(obter(SAUDE)):
        raise RuntimeError('Ocupação presente ou desconhecida. Pedido mantido.')
    conferir_horario()


def rodar(*args):
    subprocess.run(args, check=True)


def github(identificador, publicar=False):
    token = (BASE / 'github.token').read_text().strip()
    req = Request(API + str(int(identificador)), headers={
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'teletela-agenda',
    }, method='PATCH' if publicar else 'GET', data=b'{"draft":false}' if publicar else None)
    with urlopen(req, timeout=20) as resposta:
        return json.load(resposta)


def conferir_rascunho(pedido):
    atual = github(pedido['release'])
    # Se a tag já existir, o GitHub ignora target_commitish na publicação.
    repo = API.removesuffix('releases/')
    tag = quote(pedido['tag'], safe='')
    try:
        obter(repo + 'git/ref/tags/' + tag)
    except HTTPError as erro:
        if erro.code != 404:
            raise
    else:
        if obter(repo + 'commits/' + tag)['sha'] != pedido['commit']:
            raise RuntimeError('A tag aponta para outro commit.')
    arquivos = sorted([a['name'], a['id'], a['digest']] for a in atual['assets'])
    if (atual['tag_name'] != pedido['tag'] or atual['target_commitish'] != pedido['commit']
            or arquivos != pedido['arquivos'] or atual['prerelease']):
        raise RuntimeError('A versão ou os arquivos mudaram desde a aprovação.')
    return atual


def trocar(a, b):
    # A troca atômica mantém o caminho do serviço válido até durante uma interrupção.
    libc = ctypes.CDLL(None, use_errno=True)
    if libc.renameat2(-100, os.fsencode(a), -100, os.fsencode(b), 2):
        raise OSError(ctypes.get_errno(), 'Falha na troca de ' + str(a))


def saudavel():
    for _ in range(15):
        try:
            if obter(SAUDE).get('status') == 'ok' and obter(PUBLICA).get('status') == 'ok':
                rodar('systemctl', 'is-active', '--quiet', *SERVICOS)
                return
        except (OSError, ValueError, subprocess.SubprocessError):
            pass
        time.sleep(1)
    raise RuntimeError('Serviços não passaram na verificação de saúde.')


def implantar():
    pacote = FILA / 'servidor'
    plano = FILA / 'trocas.json'
    if not plano.exists():
        with tempfile.TemporaryDirectory(dir=FILA) as temp:
            area = Path(temp)
            novo = area / 'app'
            novo.mkdir()
            rodar('tar', '--no-same-owner', '-xzf', pacote / 'app.tar.gz', '-C', novo)
            rodar('chown', '-hR', 'telinha:telinha', novo)
            itens = [(novo, APP / 'app')]
            for nome in ['telinha-sfu', 'telinha-music-publisher', 'yt-dlp']:
                origem = area / nome
                shutil.copyfile(pacote / nome, origem)
                origem.chmod(0o755)
                itens.append((origem, APP / 'bin' / nome))
            # A fila e /opt precisam estar no mesmo filesystem para troca atômica.
            if any(a.stat().st_dev != b.stat().st_dev for a, b in itens):
                raise RuntimeError('A área de preparação precisa estar no volume da aplicação.')
            destino = FILA / 'trocas'
            if destino.exists():
                shutil.rmtree(destino)
            (FILA / 'plano.tmp').write_text(json.dumps([
                [a.name, str(b), a.stat().st_ino] for a, b in itens]))
            area.rename(destino)
            (FILA / 'plano.tmp').rename(plano)
    trocas = [(FILA / 'trocas' / nome, Path(alvo), inode)
              for nome, alvo, inode in json.loads(plano.read_text())]
    backup = FILA / 'backup.tar.gz'
    conferir()
    rodar('tar', '-czf', FILA / 'backup.parcial', '--exclude=data/chat-files',
          '--exclude=data/chat-images', '-C', str(APP), 'data', '-C', '/etc', 'telinha')
    (FILA / 'backup.parcial').replace(backup)
    conferir()
    reiniciou = False
    try:
        for origem, alvo, inode in trocas:
            if alvo.stat().st_ino != inode:
                trocar(origem, alvo)
        conferir()
        reiniciou = True
        rodar('systemctl', 'restart', *SERVICOS)
        saudavel()
    except Exception:
        for origem, alvo, inode in reversed(trocas):
            if alvo.stat().st_ino == inode:
                trocar(origem, alvo)
        if reiniciou:
            rodar('systemctl', 'restart', *SERVICOS)
        raise
    (FILA / 'implantado').touch()


def executar():
    pedido = json.loads((FILA / 'pedido.json').read_text())
    conferir()
    if pedido.get('release'):
        conferir_rascunho(pedido)
    if (FILA / 'servidor').is_dir() and not (FILA / 'implantado').exists():
        implantar()
    if pedido.get('release') and conferir_rascunho(pedido)['draft']:
        saudavel()
        conferir()
        github(pedido['release'], publicar=True)
    if (FILA / 'backup.tar.gz').exists():
        (FILA / 'backup.tar.gz').replace(BASE / 'ultimo-backup.tar.gz')
    # Desarma a fila antes de remover arquivos grandes.
    FILA.rename(BASE / 'concluido')
    shutil.rmtree(BASE / 'concluido')
    print('Versão aprovada concluída:', pedido['commit'])


if __name__ == '__main__':
    try:
        if (BASE / 'concluido').exists():
            shutil.rmtree(BASE / 'concluido')
        if (FILA / 'pedido.json').exists():
            executar()
    except Exception as erro:
        sys.exit(str(erro))
