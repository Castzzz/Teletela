# Guia pra agentes de IA (Claude Code, Antigravity, etc.)

Teletela (antigo Telinha): app de voz e transmissão de tela entre amigos. Electron + interface
em JS puro (`public/`), servidor Node/Socket.IO (`server.js`) e SFU em Go (`sfu/`), rodando numa
VM da Oracle em https://colheitafartus.duckdns.org.

**Documentação completa: [docs/PROJETO.md](docs/PROJETO.md).** VM apagada/quebrada:
[docs/RECUPERAR-SERVIDOR.md](docs/RECUPERAR-SERVIDOR.md). Leia antes de mudar algo grande.
Migração planejada: [docs/MIGRAR-SERVIDOR.md](docs/MIGRAR-SERVIDOR.md). VM atual: Ubuntu
26.04 ARM64/Ampere, 12 GB de RAM, `ubuntu@144.22.225.236`.
Lá tem a arquitetura, onde fica cada funcionalidade, os eventos do Socket.IO, os dados salvos,
como fazer release/deploy e as armadilhas conhecidas.

## Ao retomar o projeto em outra conta ou ferramenta

Leia primeiro a retomada mais recente em [docs/PENDENCIAS.md](docs/PENDENCIAS.md).
Ao concluir trabalho relevante, atualize esse registro com a data, as decisões do dono,
o que está local ou em produção, os testes realizados e o que ainda depende de ação.

## Regras que não podem ser esquecidas

- Fale e escreva **em português** (interface, comentários, commits). O dono fala informal.
- **Commits:** `git add -A -- . ':!public/sounds'`. A pasta `public/sounds/` (vozes dos amigos)
  **nunca** vai pro git, porque o repositório é público, mas tem que continuar no disco
  (vai dentro do instalador).
- **Release e deploy só quando o dono pedir explicitamente** (`npm run release`,
  `npm run deploy:oracle`). Eles publicam pra todo mundo e o deploy reinicia o servidor.
- Quando o dono aprovar uma versão, agende **essa versão** para a janela das **03h às 04h,
  horário de Brasília**. Confira a ocupação de todos os canais de voz, inclusive os privados,
  antes de publicar ou reiniciar. Com gente em call ou ocupação desconhecida, tente de novo
  a cada 10 minutos. Às 04h, adie o que estiver pendente para a próxima madrugada. Veja §6.
- Mudou `public/`? Precisa de **release** (a interface vem instalada no app). Mudou só
  `server.js` ou `sfu/`? Só **deploy**. Tabela completa em docs/PROJETO.md §6.
- Antes de release: aumentar `version` no `package.json` e atualizar o popup de novidades
  (`WHATS_NEW_VERSION` em `app.js` + `#modal-whats-new` no `index.html`).
- **Nunca rode `dnf` na VM antiga** (`163.176.189.41`, 1 GB de RAM, trava). A nova usa Ubuntu.
- A senha de admin e os segredos ficam só em `/etc/telinha/telinha.env` na VM. Nunca escreva
  no repositório.
- Não renomeie `appId`, a pasta de dados "Telinha", o repositório nem os nomes de artefato
  (quebra a atualização automática). Lista em docs/PROJETO.md §13.
- Siga o estilo do código ao redor: comentários curtos explicando o porquê, ícones SVG
  (`icon-svg`), cores por tokens CSS (funciona nos 3 temas).

## Comandos

```bash
npm run app                 # app desktop (Electron do SISTEMA; não use npx electron)
npm start                   # servidor em http://localhost:8080
PORT=3999 OWNER_KEY=segredo-dono TELINHA_DATA_DIR=/tmp/teletela-data node server.js   # servidor de teste completo
npm test                    # 62 testes (todos passam)
node --test tests/m1-*.test.js tests/m2-*.test.js tests/m3-*.test.js   # todos passam
node tests/m4-channels-admin.test.js                                   # integração do servidor
node --test tests/poker.test.js tests/vinte-e-um-fichas.test.js tests/apostas.test.js   # atividades
npm run release             # publica versão nova (só se o dono pedir)
npm run deploy:oracle       # atualiza a VM (só se o dono pedir; precisa de ~/.ssh/oracle_telinha_ampere; faz backup antes)
npm run backup              # baixa os dados da sala pra ~/Teletela-backups (só leitura na VM)
npm run backup:auto         # liga o backup diário no PC do dono (timer do systemd do usuário)
```

## Testes visuais no PC do dono

Use um display isolado para que as janelas de teste não tomem o foco do dono. Nos
testes offscreen do Electron do sistema, funciona o prefixo
`env -u DISPLAY WAYLAND_DISPLAY=teletela-teste-sem-monitor /usr/lib/electron42/electron --ozone-platform=headless --disable-gpu`.
Para conferir uma janela visível ou testar recursos que exigem compositor, use um
compositor virtual separado. Se a verificação exigir a sessão física do dono, combine antes.

## Ao terminar uma mudança

Rode os testes, confira na tela, e atualize o README (se o usuário vê a mudança) e o
docs/PROJETO.md (se mudou arquitetura, dados, deploy ou apareceu uma armadilha nova).
