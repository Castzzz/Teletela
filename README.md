# 📺 Teletela

App de voz e transmissão de tela que eu faço pra usar com meus amigos. Pensa num
Discord pequeno e caseiro: canais de voz, chat, tela compartilhada com o som do PC e
umas atividades pra jogar junto na call.

É um projeto pessoal, mantido só por mim. A sala é nossa, então o código fica aberto
mais pra consulta do que pra contribuição.

## O que tem

- 🔊 Canais de voz e de texto, com cargos e canais privados
- 🖥️ Transmissão de tela com o som do PC separado do microfone (dá pra mandar só o som de um app)
- 🧠 Cancelamento de ruído (RNNoise) e volume de cada amigo só pra você
- 🎵 K7, o bot de música da call (YouTube e Spotify, com fila compartilhada)
- 🎲 Atividades: 21, Poker, Roleta, Apostas da call e o Seu cassino, com Colheita Coins
- 💬 Amigos, mensagens privadas, ligações, clipes de voz e soundboard
- 🔄 Atualização automática no Windows e no Linux

O que mudou em cada versão fica nas [Releases](https://github.com/Castzzz/Teletela/releases)
e no botão **Novidades** dentro do app.

## ⬇️ Baixar

| Sistema | Arquivo | Atualiza sozinho? |
|---|---|---|
| **Windows** 10/11 | **[Teletela-Setup.exe](https://github.com/Castzzz/Teletela/releases/latest/download/Teletela-Setup.exe)** | ✅ |
| **Linux** | **[Teletela.AppImage](https://github.com/Castzzz/Teletela/releases/latest/download/Teletela.AppImage)** | ✅ |
| Android (teste) | [Teletela-Android-teste.apk](https://github.com/Castzzz/Teletela/releases/latest/download/Teletela-Android-teste.apk) | ❌ |

<details>
<summary>Outras opções (não se atualizam sozinhas)</summary>

- [Teletela-Portatil.exe](https://github.com/Castzzz/Teletela/releases/latest/download/Teletela-Portatil.exe): Windows sem instalar nada
- [Teletela.tar.gz](https://github.com/Castzzz/Teletela/releases/latest/download/Teletela.tar.gz): Linux, se o AppImage não abrir
- [Teletela.flatpak](https://github.com/Castzzz/Teletela/releases/latest/download/Teletela.flatpak): Linux pelo Flatpak (experimental)
</details>

### Windows

Abra o `Teletela-Setup.exe` com duplo clique, sem "Executar como administrador".
O app não tem assinatura digital paga, então o Windows desconfia:

- **"O Windows protegeu o computador"**: clique em **Mais informações → Executar assim mesmo**.
- **"Deseja permitir que este aplicativo de um fornecedor desconhecido…"**: clique em **Sim**.
- **Firewall**: clique em **Permitir**.

### Linux

```bash
chmod +x Teletela.AppImage
./Teletela.AppImage
```

Se reclamar de `libfuse.so.2`, instale o fuse2 (`sudo pacman -S fuse2`,
`sudo apt install libfuse2t64` ou `sudo dnf install fuse fuse-libs`). Deixe o AppImage
numa pasta fixa: se mover o arquivo, o atalho e a atualização se perdem.

No Wayland (Hyprland, Sway…), atalhos com o jogo em foco precisam passar pelo
compositor. No Hyprland:

```
bindn = , F8, exec, curl -s --unix-socket $XDG_RUNTIME_DIR/telinha.sock http://telinha/mute
```

(`/deafen` no lugar de `/mute` pra ensurdecer.)

## 🛠️ Deu problema?

| Problema | O que fazer |
|---|---|
| Não atualiza / pede permissão toda hora (Windows) | Desinstale em **Configurações → Aplicativos**, baixe o Setup de novo e abra sem "como administrador". O login e as preferências ficam salvos |
| Ninguém me ouve | Confira se o 🎙️ não está riscado e o microfone certo em ⚙️ → **Microfone → Testar microfone** |
| Amigos não ouvem o som da tela | Linux: ⚙️ → *Áudio da Transmissão*. Windows: me mande um print do aviso que aparece ao transmitir |
| Transmissão travando | ⚙️ → **Transmissão → Diagnóstico**, ou desligue a aceleração por hardware ali mesmo |
| Tela branca / travou | `Ctrl+R` recarrega; `Ctrl+Shift+H` volta pro início |
| O app fechou sozinho | ⚙️ → **Transmissão → Abrir registro de falhas** e me mande o arquivo |

## Créditos

As cartas e fichas em pixel art são do pacote [(Pixel) Poker Cards](https://ivoryred.itch.io/pixel-poker-cards),
de IvoryRed (CC BY 4.0). Os sons da mesa são do Casino Audio da [Kenney](https://www.kenney.nl) (CC0).

---

<details>
<summary>👨‍💻 Anotações de desenvolvimento</summary>

A documentação de verdade fica em [docs/PROJETO.md](docs/PROJETO.md) (arquitetura, deploy,
dados, armadilhas). O estado atual e o que falta estão em [docs/PENDENCIAS.md](docs/PENDENCIAS.md).
Pra agentes de IA: [AGENTS.md](AGENTS.md).

```bash
npm install
npm run app            # app desktop (Electron do sistema)
npm start              # servidor em http://localhost:8080
npm test               # testes
npm run release        # publica uma versão nova no GitHub
npm run deploy:oracle  # atualiza o servidor (faz backup antes)
npm run backup         # baixa os dados da sala pra ~/Teletela-backups
```

- Mudou `public/`: precisa de **release** (a interface vem instalada no app) e de deploy.
- Mudou só `server.js` ou `sfu/`: só **deploy**.
- Antes de lançar: subir o `version` no `package.json` e atualizar as novidades
  (`WHATS_NEW_VERSION` em `public/app.js` e `#modal-whats-new` no `index.html`).
- `public/sounds/` nunca vai pro git: `git add -A -- . ':!public/sounds'`.
- Servidor sumiu: [docs/RECUPERAR-SERVIDOR.md](docs/RECUPERAR-SERVIDOR.md).
  Trocar de VM: [docs/MIGRAR-SERVIDOR.md](docs/MIGRAR-SERVIDOR.md).

**Estrutura:** `server.js` (sinalização e canais, Socket.IO), `sfu/` (repasse de voz e
vídeo em Go), `public/` (interface), `electron/` (app desktop), `native/win-audio/`
(captura do som de um app só no Windows), `android/` (APK).
</details>
