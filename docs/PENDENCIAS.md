# Pendências atuais

## 25/11/2026 — 5.0.1 aprovada e agendada (`ambos`) pra 26/11 às 03h

O dono mandou preparar a atualização e deixar na VM como a 5.0, pras 03h. Versão 5.0.1 (package.json/lock), `WHATS_NEW_VERSION = '5.0.1'` com cinco novidades (cartas maiores, vez com cor e som, apostar mais fácil/5 em 5, 21 com 3:2 e Dobrar, aceleração por hardware); a lista da 5.0.0 virou `#whats-new-5-0-0`. Antes do commit: 62/62, 26 das atividades, `poker-browser` e `vinte-e-um-browser` com prints (novidades conferidas). Commit `d599752` na `main` e enviado; instaladores em `dist/release-5.0.1` (com os 15 sons); rascunho v5.0.1 apontando pro SHA completo com os 7 arquivos; `agendar.sh ambos` rodado e pedido conferido em `/var/lib/teletela-agenda/pendente`. Timer: 26/11 06:00 UTC (03h de Brasília), tenta até 03h50 com os canais vazios. Depois conferir o journal de `teletela-madrugada.service` e se a v5.0.1 saiu do rascunho. Mudanças de fichas do dono não foram conferidas na tela. **Reagendada no mesmo dia:** o dono achou a montagem da aposta do 21 presa no canto esquerdo; agora fica centralizada (`justify-content: center` no painel enquanto `#montar-21` aparece). Pedido antigo (`d599752`) removido da fila sob a trava, rascunho refeito no commit novo e `agendar.sh ambos` rodado de novo.

## 25/11/2026 — opção de desligar a aceleração por hardware (local)

Pedido do dono depois da 5.0: um amigo transmite e assiste melhor pelo navegador sem aceleração. O app vinha sempre com ela ligada (padrão do Electron). Agora **Configurações → Transmissão → Usar aceleração por hardware** (só no app do PC, ligada por padrão). A escolha vai pro `config.json` e só vale ao abrir o app; ao mudar aparece **Reiniciar o Teletela** (sai da call). Sem aceleração a transmissão volta pro VP8 no processador. Mexeu em `electron/` e `public/`: precisa de **release** (sem deploy). Testado: 62/62 e a opção num Electron isolado (mock do IPC) no Clássico e no Terminal, prints num `kwin_wayland --virtual`; o `disableHardwareAcceleration()` de verdade e o reinício não foram testados no app instalado. Falta: item nas novidades da próxima versão e o amigo testar.

**Mesmo dia, tela preta e fechando nas Atividades (amigo no Windows, 3 vezes, no 21/poker; outros 2 no Windows normais).** Não reproduzido aqui e o código das mesas não tem nada pesado (sem canvas, sem loop de animação, só Web Animations curtas). Tela preta seguida de fechar é o sintoma do processo da GPU caindo seguidas vezes, até o Chromium encerrar o app. Feito: `falhas.log` + minidumps locais, página caída recarrega (até 3x por minuto) e, depois de uma queda da GPU, o app reabre perguntando se desliga a aceleração. Testado com o `main.cjs` real num `kwin_wayland --virtual`: `chrome://gpucrash` gravou a queda e marcou `gpuCrash`, e 5 quedas da página seguidas geraram 4 registros e 3 recargas antes de parar. O aviso foi conferido no Clássico e no Terminal, por cima das Novidades, e os botões funcionam. 62/62. Falta: o amigo desligar a aceleração (já dá na versão nova) e, se cair de novo, mandar o `falhas.log`. Se não for a GPU (motivo `oom` ou `crashed` da página), aí sim procurar vazamento nas mesas.

**Mesmo dia, "a mesa do 21 sempre ganha".** O baralho é honesto: 200 mil rodadas com o módulo real deram banca em 17/18/19/20/21/estouro = 14,4/14,0/13,5/17,8/12,1/28,3%, igual à tabela de cassino (20 ou 21 em ~30% das rodadas é normal). O que pesava eram as regras: 21 de cara pagando 1:1 e sem dobrar davam 4,2% pra casa (simulação com estratégia básica). O dono aprovou: agora **21 de cara paga 3:2** (fração arredondada pra baixo) e ganha de 21 comum, o 21 de cara da banca ganha do 21 comum do jogador, e dá pra **Dobrar** contra a banca nas duas primeiras cartas (aposta dobra, uma carta só, precisa de saldo). Entre amigos não muda. Vantagem da casa estimada em ~0,8%. Dividir par ficou pra depois. Testes: 3 novos em `vinte-e-um-fichas.test.js` (26 das atividades passam) e `vinte-e-um-browser.cjs` estendido (sem Dobrar entre amigos; contra a banca, Dobrar dá uma carta só), rodado duas vezes num `kwin_wayland --virtual` com prints. Mexeu em `vinte-e-um.js` e `public/`: precisa de **release + deploy juntos**. Falta pôr nas novidades.

**Mesmo dia, poker: cartas maiores, botões e som da vez (pedido de amigo + dono).** As cartas são pixel art 48×64 e o índice tem 5 px; saíam em ~1× (48 px) até numa janela de 1440, ilegível ("o 8"). Agora tamanhos fixos em múltiplos: mesa e sua mão 96 px (2×), adversários 72 px; palco ≥1500 px: 144/96; palco de 601–900 px: 72/48; celular como antes (mão 72, outros 48). As cartas dos lugares ficam ao lado do nome (antes em cima/embaixo), senão encostavam nas do meio; mesa um pouco mais alta (`clamp(26rem, 58vh, 52rem)`). Na sua vez o painel vira grade: três botões iguais Largar (vermelho) / Passar-Pagar (verde) / Apostar-Aumentar (amarelo), tinta sobre `--bg-secondary` pros 3 temas, valor em cima. Som da vez: `tocar.vez()` em `sons-mesa.js`, sino de duas notas sintetizado (sem arquivo), toca até com a mesa fechada (junto do aviso), respeita o botão de som e ensurdecer; substituiu o `leque`. Conferido com `poker-browser.cjs` (prints) em 1440×960, 2560×1440, celular e Terminal claro; passou 2x em 2560 (1 falha antes, intermitente na carteira, também passa sem a mudança). **O som não foi ouvido** (só roda sem erro). Só `public/`: release.

**Mesmo dia, apostas de 5 em 5 e visual do valor e do 21 (pedido do dono, usando a skill de design).** Toda aposta anda de 5 em 5; só o all-in vale quebrado. Servidor: poker recusa sentar/repor/aumentar fora de 5 (exceto o mínimo e o all-in) e divide o pote em partes de 5; apostas da call recusam palpite fora de 5 (exceto o saldo inteiro) e pagam de 5 em 5; 21 entre amigos divide de 5 em 5 e o 3:2 agora arredonda **pra cima** de 5 em 5 (aposta 5 → +10; 25 → +40). Poker: o valor virou um bloco (número grande editável, faixa desenhada com − e +, atalhos com o valor do lado, o escolhido aceso), "Tudo" virou **All-in**, digitado fora de 5 arredonda ao sair do campo. 21: na vez, Parar (vermelho) / Pedir carta (verde) / Dobrar (amarelo, "+N fichas") com a mesma classe `.jogada-mesa` do poker; "Sair da mesa" vai em cima; fichas da aposta num bloco com All-in e Limpar; cartas em 72/96/144 px como o poker (eram `clamp` e borravam); a banca não quebra mais as cartas em várias linhas (o topo ficava preso à metade da mesa e a placa ia pro meio do feltro). Mesas um pouco mais baixas (`clamp(25rem, 50vh, …)`) pro painel caber em 1440×960. Testado: 62/62, 26 das atividades (novos: aumentar 52 recusado, palpite 7 recusado, 3:2 de 25 = 1040, teste aleatório do poker sentando e apostando de 5 em 5), `poker-browser` (atalhos, arredondar 302 → 300) e `vinte-e-um-browser` passando com prints em `kwin_wayland --virtual`. Mexeu em servidor e `public/`: **release + deploy juntos**.

**Mesmo dia, dono mexe nas fichas de qualquer um.** Pedido do dono: em vez de só recarregar uma pessoa pra 1.000, digitar qualquer quantidade e adicionar ou remover. Configurações → Servidor e cargos → Fichas das atividades agora tem pessoa, "Quantas fichas" e **Adicionar**/**Remover** (Enter adiciona; sem confirmação, o toast mostra o saldo novo). Remover demais zera, nunca negativo. "Recarregar todo mundo" continua. Servidor: evento `fichas-admin-ajustar` (só o dono, inteiro até 1 bilhão) e `FichasStore.ajustar()`; as mesas e apostas abertas recebem o saldo novo. O valor do dono não precisa ser de 5 em 5. Testado: `ajustar()` no teste do dono (`vinte-e-um-fichas.test.js`). **A tela não foi conferida** (precisa de dono com conta e carteira). Mexeu em servidor e `public/`: release + deploy juntos.

## 24/11/2026 — transmissão pela placa de vídeo entra na 5.0 (reagendada)

Relato do dono: um amigo tem quedas de qualidade sem perda nem ping ruim, e às vezes todas as transmissões travam pra todo mundo. A VM está saudável (detalhes em DIAGNOSTICO-TRANSMISSOES, 24/11). Hipótese principal: VP8 codificado no processador do emissor. O dono pediu H.264 pela placa e mandou incluir na 5.0 se desse.

Feito: `public/video-codec.js` prefere H.264 só quando `mediaCapabilities` diz que a placa codifica (sem placa, fica VP8); SFU aceita H.264 (PT 102) além do VP8; o Diagnóstico mostra "Codificação: Placa de vídeo/Processador (nome)"; item nas novidades da 5.0. Testado com câmera falsa em Electron offscreen: H.264 via SFU e P2P chegando no espectador (OpenH264, sem placa aqui), VP8 forçado e automático, texto do diagnóstico. **Não testado numa placa de verdade nem no Android** (WebView decodifica H.264, mas não conferido). `stream-window-browser.cjs` completo continua precisando de compositor. 62/62, 234 testes de `tests/*.test.js` (o estresse do M1 só falha em paralelo, igual sem a mudança), canais/admin e `go test -race ./sfu`.

Falta: o amigo transmitir com a 5.0 e mandar print do Diagnóstico (Codificação e Limitação). Próximo passo possível só no SFU: contar PLI por espectador e espaçar os keyframes (~1,5 s).

## 24/11/2026 — 5.0.0 aprovada e agendada (`ambos`) pra 25/11 às 03h

O dono aprovou a 5.0.0 com as apostas vinculadas à conta e mandou agendar pra madrugada de 25/11. Reagendada no mesmo dia com a transmissão pela placa de vídeo (entrada acima): pedido antigo removido da fila, instaladores refeitos e rascunho apontando pro commit novo. Antes do commit passaram 62/62, as atividades (23) e a integração de canais/admin. `main` enviada ao GitHub, instaladores gerados com os sons locais, rascunho v5.0.0 apontando pro commit da versão e `agendar.sh ambos` rodado. O timer da VM tenta das 03h às 03h50 com os canais vazios; se ninguém sair da call, fica pra próxima madrugada. Depois conferir no journal de `teletela-madrugada.service` e no GitHub se a v5.0.0 saiu do rascunho.

## 24/11/2026 — apostas da 5.0 vinculadas à conta (local)

O servidor exige conta para criar apostas da call, palpitar e jogar 21 ou poker valendo fichas. Visitantes podem assistir, consultar o ranking e jogar só por diversão. A carteira usa o accessId estável da conta e o ranking filtra carteiras antigas de visitantes. Testados os dois jogos no Electron isolado, inclusive com visitante assistindo ao poker. Passaram 23 testes das atividades, 62 gerais, integração de canais/admin e 81 de M1–M3 em série (o teste de estresse falhou na execução paralela).

Conferência na Oracle em 24/11 por volta das 20h de Brasília: timer ativo para 25/11 às 03h, sem pedido na fila. GitHub sem rascunho v5.0.0, última publicação v4.9.0. A correção está no PC. Falta confirmar e agendar a versão corrigida.

## 24/11/2026 — 5.0.0 preparada (local, `main`)

`version` 5.0.0 (package.json e package-lock), `WHATS_NEW_VERSION = '5.0.0'` e novidades novas (Atividades, 21, Poker, Apostas, Fichas, Ligações entre amigos, Visual novo); a lista da 4.9.0 virou o bloco `#whats-new-4-9-0`; os Créditos ficaram. Conferido: quem vinha da 4.9.0 vê só a 5.0 e os Créditos. 62/62. Falta: push da `main` e, quando o dono pedir, `npm run release` + `npm run deploy:oracle` juntos na janela das 03h às 04h com os canais vazios.

## 24/11/2026 — ideia pra 5.1 (ou depois): minigame pra farmar fichas

Pedido do dono: um minigame estilo cookie clicker ou idle nas Atividades, pra ganhar fichas sem depender só dos +1.000 da segunda. Ainda sem desenho; pensar num teto (por dia ou por hora) pra não desequilibrar o ranking, e o servidor contar o ganho (não confiar no cliente).

## 24/11/2026 — 5.0 commitada e na `main` (local)

O dono aprovou o salão e mandou commitar a `visual-unico` e juntar na `main`, porque tudo entra na 5.0. Feito localmente (sem push, sem release). `.impeccable/` (imagens de referência de terceiros e relatórios das revisões) foi pro `.gitignore` por ser repositório público; continua no disco. Falta pra publicar: `version` 5.0.0, popup de novidades (manter os Créditos), release + deploy juntos na janela das 03h.

## 24/11/2026 — salão das Atividades em tela grande (local, branch `visual-unico`)

O dono achou o salão estranho em 1440p e 1080p (três cartões pequenos no canto, o resto vazio). Agora o grupo fica centralizado com o letreiro "Cassino Colheita" e uma frase em cima. A arte em pixel sobe pra 3× quando o salão tem 1000 px ou mais e pra 4× a partir de 1800 px (tela cheia em 1440p), sempre em múltiplo inteiro pra não borrar. O salão mede a si mesmo (`container: salao`), porque em tela cheia o palco da call deixa de servir de medida. Conferido em janela de 1280/1920/2560, tela cheia de 1920 e 2560 (Clássico e Terminal) e no celular. Testes: 62/62, atividades e ligações (21) e `poker-browser.cjs`. Só `public/`.

## 24/11/2026 — poker: embaralhar, nome da mão e tabela de mãos (local, branch `visual-unico`)

Pedido do dono depois de jogar no modo de teste: embaralhar como no 21, mostrar perto do nome como está a mão a cada carta, e um "i" com as mãos do poker usando os sprites das cartas.

- **Embaralhar:** o servidor manda `proxima` no resultado; ~2,6 s antes da próxima mão as cartas voam de volta pro monte, ele faz o riffle de duas passadas e a mão nova é dada sem repetir o som.
- **Nome da mão:** selo sob o seu nome ("Par de 10", "Flush, ás alto"), troca quando as cartas novas pousam, dourado a partir da sequência e com brilho quando melhora. Quem assiste não vê selo.
- **Mãos:** botão no topo (só com o poker aberto) abre a tabela das 10 categorias com 5 cartas de exemplo cada e a sua marcada ("sua mão agora"); abre uma de cada vez com Ranking e Apostas. Avaliador movido pra `public/poker-maos.js` (servidor e app usam o mesmo).
- **Monte do poker:** tinha sumido (o 21 marca o palco com `data-fase="abertura"` quando não há mesa de 21, e a regra do poker escondia o monte por isso). Agora fica do lado esquerdo das cartas da mesa, do tamanho delas.
- **Testes:** 62/62, poker/fichas/apostas/ligações (21), integração canais/admin, `poker-browser.cjs` estendido (selo, tabela com 50 cartas e a sua marcada, limpeza antes da próxima mão) com prints conferidos.
- **Falta:** o dono ver no modo de teste. Vai junto no release + deploy da 5.0 (mexeu em `poker.js` do servidor).

## 24/11/2026 — K7 encontra a música, mas falha ao preparar o áudio

Na Oracle, o yt-dlp 2026.10.26 retornou cinco resultados na busca por “a-ha Take On Me”, mas falhou ao processar o player do YouTube e listou só imagens para o vídeo. Com o yt-dlp oficial 2026.11.23 em pasta temporária (SHA-256 conferido), o módulo instalado, a sessão e o proxy da sala, o FFmpeg decodificou três segundos de áudio de cada vídeo (`djV11Xbc914` e `jNQXAC9IVRw`). Os 19 testes locais de música passaram. Versão padrão do deploy atualizada no repositório local. O dono autorizou trocar só o executável para testar. A Oracle está com a 2026.11.23 instalada por troca atômica, com a anterior guardada em `/opt/telinha/backup-k7-20261124-aic1j4ro/yt-dlp`. Depois da troca, o bot encontrou cinco resultados e o FFmpeg decodificou três segundos de cada um dos dois vídeos com o executável instalado. Servidor e SFU mantiveram os mesmos PIDs. Falta ouvir pelo app na call.

## 24/11/2026 — ligação privada entre amigos (local, branch `visual-unico`)

Pedido do dono: não tocava, era feia, não dava para ligar estando em call nem para quem estava em call (e ligar deveria tirar a pessoa da call).

- **Toque:** antes era um único "plim" que dependia do áudio da call já estar ligado. Agora toca em loop até atender/recusar (recebendo: notas subindo; ligando: "tuu" de 425 Hz a cada 5 s), pela saída de áudio escolhida. No Não perturbe aparece sem tocar. Com o app fora de foco, sai notificação do sistema.
- **Visual:** cartão flutuante no topo (não trava mais o app), com foto do amigo, ondas no avatar enquanto chama, botões redondos verde/vermelho, tempo de ligação e Mutar. Ajustes pro visual Terminal e pro celular.
- **Em call:** dá para ligar e receber estando num canal (o cartão avisa que atender tira do canal). Ao atender, o servidor tira os dois dos canais e o app toca o som de saída. Quem já está em outra ligação dá "Seu amigo já está em outra ligação.".
- **Testes:** 62/62, `private-calls.test.js` (2, um novo) e `controls-friends-browser.cjs` com `PRIVATE_CALL_TEST=1` e SFU compilado do código atual: voz nos dois sentidos, recusa, mute, desligar e quem ligou saindo do Geral. Prints conferidos.
- **Sala da ligação (etapa 1, pedida depois de ele aprovar o cartão):** ao atender, o palco vira a sala "tipo Discord com a cara do Teletela": os dois em cartões com anel verde de quem fala e ícones de mutado/sem áudio, conversa privada encaixada do lado (aberta por padrão no PC, escondida no celular — ele não escolheu, ficou assim), controles mutar/ensurdecer/conversa/tela cheia/desligar, minimizar volta pro cartão com **Abrir**. No celular cobre a tela. Testado em duas janelas com SFU: sala nos dois lados, mutado aparecendo pro outro, esconder conversa, minimizar/abrir, desligar devolvendo a conversa; prints no escuro, claro e celular.
- **Etapa 2 — tela (feita, a pedido dele só a tela por enquanto):** botão Transmitir tela na sala; mesma escolha de tela/qualidade/som do canal (captura extraída pra `captureScreen()`); a tela toma o palco, os dois viram faixa; duplo clique abre a tela em tela cheia. Testado com SFU em duas janelas (tela chega do outro lado e some ao parar) e `test:stream:ui` passando depois da extração. **Câmera na ligação ainda não** (mesmo caminho: `kind: 'camera'`).
- **Falta:** o dono testar com um amigo. Mexeu em `public/` e `server.js`/`private-calls.js`: precisa de **release + deploy juntos** (cliente antigo com servidor novo continua funcionando; servidor antigo recusa ligar em call).

## 24/11/2026 — poker, fichas semanais e sons nas apostas (local, branch `visual-unico`)

Decisões do dono pro poker: blinds 5/10; 60 s por vez (acabou: passa se der, senão larga); 21 e poker abertos ao mesmo tempo no canal, com abas nas Atividades ("quem quiser joga um, quem quiser joga outro").

- **Fichas semanais:** toda segunda à 00h de Brasília cada carteira ganha +1.000 (soma, não reseta). `FichasStore` guarda `semana` (última segunda creditada) e credita ao ler; semanas sem abrir somam. Textos trocados ("Na segunda você ganha mais 1.000"). Teste atualizado.
- **Sons nas apostas:** abrir (`bater`), pôr fichas (as suas: `fichas`; dos outros: uma ficha baixinho), fechar (`virar`), resultado (ganhou: `pote` + `fichas`; perdeu: `bater` baixo; devolvido: `fichas`). Tocam pra quem está vendo o card e obedecem ao botão de som da mesa e ao ensurdecer. O tocador saiu do 21 pra `public/sons-mesa.js`.
- **Poker:** `poker.js` + `public/poker.js`/`.css`, aba ao lado do 21. Sentar com quanto quiser da carteira (mín. 10), pôr mais entre mãos, levantar; check/call/raise/fold/all-in com barra e atalhos (Mínimo, ½ pote, Pote, Tudo); potes paralelos; avaliação de 7 cartas; dealer girando; ausente depois de 2 tempos esgotados; toast e selo na aba quando a vez chega e você não está olhando; Só diversão. As fichas só saem da carteira quando vão pro pote. Peças da mesa extraídas pra `public/mesa-pecas.js`. Detalhes em PROJETO ("Poker").
- **Testes:** 62/62, m1–m3 (81), integração canais/admin, `poker.test.js` (9, incluindo 300 mãos aleatórias; rodado também com 100 sementes = 30 mil mãos sem sumir ficha nem travar), fichas e apostas, `vinte-e-um-browser.cjs` e `poker-browser.cjs` (duas janelas + celular). Prints conferidos no escuro, claro e celular.
- **Cartas e fichas em pixel art (pedido do dono):** comparou Kerenel, IvoryRed e Screaming Brain na mesa e escolheu o IvoryRed completo ("(Pixel) Poker Cards", CC BY 4.0, crédito em `public/baralho/LICENCA.txt` e no README). Fichas em 1× (32 px) depois de ele achar 2× gigante. Depois ele aprovou: pilhas prontas do pacote (uma coluna por cor, inclusive no 21, que antes empilhava na ordem do clique), leque reto, virada retrô, ficha caindo ao apostar, fichas voando em arco e brilho em quem ganha. A bandeja da banca usa as pilhas de 10. Também pediu que o 21 limpe a mesa ao fim de cada rodada e que a aposta seja montada de novo (antes ela ficava guardada): a mesa espera 5 s com o placar (contados de quando o placar aparece) e, na limpeza, o monte embaralha em riffle (ideia dele). Crédito do IvoryRed (e da Kenney) também dentro do app, a pedido dele: pé do Ranking e seção fixa "Créditos" no fim das Novidades (Configurações → Novidades); ao reescrever as novidades da 5.0, manter essa seção. Entrada das Atividades virou um salão (pedido dele: não cair direto no 21): cartões de 21, Poker e Apostas com arte em pixel e status ao vivo; sentado numa mesa, abre direto nela; as abas do título saíram. Só interface (`public/salao.js`/`salao.css`). O `m1-challenger-stress` falhou nesta máquina com carga alta (load ~8), igual no último commit sem as mudanças: instabilidade de tempo do teste, não regressão e se limpa sozinha (mudou `vinte-e-um.js` do servidor também, então vai em release + deploy juntos). O baralho ilustrado antigo saiu do `public/` (não estava no git; a fonte era o playing-cards-assets de Howard Yeh, MIT). Pro futuro ele guardou o pacote de dados https://dani-maccari.itch.io/cute-dice.
- **Falta:** o dono jogar com a turma e ouvir os sons no app (`npm run app`). Antes do release: subir `version`, popup de novidades (`WHATS_NEW_VERSION` + `#modal-whats-new`) falando de 21, poker, apostas e fichas semanais. Precisa de **release + deploy juntos** (servidor novo: `poker.js` já está no `deploy.sh` e no `package.json`). Um reinício do servidor no meio de uma mão perde só o pote dela, por isso o deploy na janela das 03h com o canal vazio.

## 23/11/2026 — 21 na call (5.0, local na branch `visual-unico`)

O dono escolheu os dois modos. Em **Atividades**, a banca joga contra cada participante e para em 17. Entre amigos, quem chegar mais perto de 21 ganha, e todos os empatados no maior valor válido vencem. O ás conta como 1 ou 11. Cada canal tem uma mesa para até oito pessoas. Quem chega durante a rodada pode acompanhar e entrar na próxima.

A pedido do dono, a mesa ganhou feltro verde com borda de madeira, baralho ilustrado local, versos estampados e uma animação curta ao distribuir. A banca e os amigos ficam do outro lado da mesa. O visual foi conferido no Electron em tamanho de desktop e de celular.

A mesa agora ocupa o palco da call como uma transmissão, com tela cheia opcional. O chat lateral recolhe ao abrir e pode ser reaberto durante a partida. Voltar à call mantém a mão; os testes conferem a retomada.

Em 23/11, o dono pediu apostas. Implementadas como fichas virtuais por mesa: 100 por pessoa, entrada opcional de 5, 10 ou 25, confirmação individual em cada rodada e liquidação pelo servidor. Testados cancelamento, desistência, reentrada com o mesmo saldo, divisão de pote ímpar e os três resultados contra a banca.

Validação local com dois clientes Electron em display isolado, cartas ocultas e conclusão dos dois modos. Passaram os 62 testes gerais e a integração de canais/admin. Falta o dono experimentar a dinâmica com a turma. A mudança está só no repositório local, sem release ou deploy.

Ainda em 23/11, o dono achou o visual sem graça e sem áudio e pediu uma revisão com as skills (impeccable). Escolheu "cassino caprichado", sons gravados livres e som só para quem está com a mesa aberta. Feito: assentos com avatar, placa (nome, situação, saldo, +/− da rodada) e pilha de fichas da aposta; selo de pontos sobre o leque (vermelho ao estourar, dourado no 21); monte no canto de onde as cartas voam; frase em arco impressa no feltro; carta da banca virando em 3D e compras uma por vez; resultado grande no meio do feltro; entrada escolhida em fichas de 5/10/25. Sons do pacote Kenney Casino Audio (CC0) em `public/mesa-sons/` com botão de ligar/desligar. Conferido com prints no escuro, claro e celular; 62 testes, fichas e `vinte-e-um-browser.cjs` passaram. Falta o dono ouvir os sons no app de verdade (`npm run app`). Tudo local, sem release.

O dono testou, gostou e pediu os jogadores sentados ao redor da mesa e fichas melhores. Feito: lugares na borda em elipse (você embaixo, banca em cima com bandeja e monte), cartas e aposta viradas pro centro, amigos com rosto grande e crachá; círculo de aposta com fichas vistas de cima empilhadas por cor; fichas voando (apostas pro pote, banca recolhe e paga, pote pro vencedor). No celular volta pra grade. Conferido com 3, 4 e 5 jogadores, tela cheia e celular; 62 testes e `vinte-e-um-browser.cjs` passaram.

Depois o dono pediu fichas de valores variados, 1000 iniciais com recarga semanal e competição na sala. Decisões dele: recarga só pra quem zerou (segunda 00h de Brasília), aposta livre sem limite contra a banca, aposta livre entre amigos com pote dividido na proporção da aposta, ranking na tela de Atividades. Feito: `fichas-store.js` (`fichas.json`, carteira por `accessId` pra todas as atividades), aposta montada clicando em fichas de 5/10/25/50/100 (empilha no círculo na ordem posta, Tudo/Limpar, repete na rodada seguinte), carteira no topo da mesa, painel Ranking (top 20 + sua posição). Mesa criada como Fichas ou Só diversão. `deploy.sh` e `package.json` incluem o arquivo novo. Testes: 62, fichas (5 casos novos: pilha, empate/all-in, proporção, recarga na segunda, ranking), canais/admin e `vinte-e-um-browser.cjs` passaram. Precisa de release + deploy juntos.

Ajustes pedidos depois de testar no monitor 1440p: o feltro agora diz "Cassino Colheita" (maior); sem aviso enquanto a mesa espera (só "precisa de pelo menos duas pessoas" entre amigos) e sem a dica de clicar nas fichas; banca maior, mão dos amigos menor; cartas, fichas, círculo, placas e selo de pontos crescem até telas grandes (limites em `cqw`); a pilha montada mantém a ordem durante a rodada.

Recarga pelo dono: em Configurações → Servidor e cargos aparece "Fichas das atividades" (só pro dono), com a lista de carteiras e os botões "Recarregar essa pessoa" e "Recarregar todo mundo" (volta pra 1.000, com confirmação; mesas abertas atualizam na hora). Testado: 6/6 fichas, 62/62, integração e o fluxo no app (Lia zerou, dono recarregou, a mesa dela mostrou 1.000). Precisa de release + deploy juntos.

Apostas estilo Twitch (23/11, local). Decisões do dono: quem cria marca o resultado e também pode apostar; aparece no chat da call e nas Atividades; poker depois (Texas Hold'em, blinds fixos, cada um entra com quanto quiser). Feito: `apostas.js` + `apostas.json`, `public/apostas.js`/`.css`, botão de moeda no chat, painel Apostas nas Atividades, diálogo de criar. Ninguém acertou/cancelou devolve; fecha sozinha no tempo; resultado só depois de fechar. Testes: `tests/apostas.test.js` (3), 62/62, fichas, integração e o fluxo no app com 3 pessoas. Falta: poker. Lançar tudo junto (release + deploy).

Ajustes depois do teste do dono (23/11): carteira sincronizada entre 21 e apostas (evento `teletela-carteira` no app; o servidor reenvia as mesas de 21 quando uma aposta mexe nas fichas); confirmações no visual do app (`public/confirmar.js`) no lugar do `window.confirm` nas apostas e na recarga de fichas.

## 23/11/2026 — visual único (branch `visual-unico`, só local)

O dono pediu a revisão de design do Clássico (impeccable critique, nota 24/40, relatório em
`.impeccable/critique/`) e mandou fazer tudo, começando pela call, numa branch separada.
Commits em `visual-unico` (nada em `main`, nada publicado):

1. `f771c68` ponto de partida (tudo como estava, com os visuais de teste) — pra voltar, é daqui.
2. Call: quem fala acende o cartão inteiro e a foto respira; nome verde na barra lateral; grade
   de cartões iguais (do Roda); cabeçalho só com o nome; clipe só no palco, com "Clipar"/"Sons";
   Transmitir sem degradê.
3. Roda, Aconchego, Pixel, Fita K7 e Personagens saem; Aparência fica Clássico e Terminal; valores
   antigos caem no Clássico. Mola ao apertar e chegada suave (Aconchego), foco visível (Roda).
4. Rosto próprio: Figtree + Bricolage Grotesque, roxo do ícone (#745af6) como cor padrão, links
   sem o azul do Discord, chat da call com o nome do canal e banner "Papo da call".
5. Acabamentos: contraste, legendas maiores, cartões do início, ícones no lugar de emojis,
   título no celular.

6. Configurações do canal repaginadas (Clássico e Terminal): blocos, escolha "Todo mundo" /
   "Só quem eu escolher", cargos como etiquetas, pessoas com busca; `permissions-browser.cjs` passou.

7. Revisão do Terminal (25/40, relatório em `.impeccable/critique/`) e correções: quem fala vira a
   linha mais forte; chegada mais fraca e sem congelar com o app sem foco; nome de quem fala acende
   na barra lateral; controles como no Clássico ([Clipar], [Sons], "Sair" escrito, também no
   Clássico); tudo em mono sem letras grudadas; [x] como único jeito de marcar no modal do canal;
   teclas 1–9 entram no canal e setas no início (`configurarNumerosTerminal` em `terminal.js`);
   aviso de teclas some após o uso (localStorage `teletela-terminal-teclas-visto`); miniatura verde;
   sem "👋" no log; avisos repetidos não empilham (máx. 3).

Testes: 62/62, canais/admin e personalização passaram. O teste da janela de transmissão só roda
com tela (ver armadilha em PROJETO §13); passou na etapa 3 rodando na tela do dono. Falta: o dono
experimentar (`npm run app` na branch), decidir se junta em `main`, e o popup de novidades quando
for a release (a 5.0 vai ser a das atividades).

## 23/11/2026 — plano da 5.0 e decisões sobre os visuais

- **5.0 = atividades** (no começo, 21 e talvez pôquer, no estilo das atividades do Discord). O clipe
  de transmissões também está nos planos. A unificação visual entra junto como um extra.
- **Unificar Clássico, Roda e Aconchego** num visual só, com a cara do Clássico. Deve trazer as
  animações do Aconchego (apertar com mola, chegada suave) e outras mudanças. Quem usa Roda ou
  Aconchego cai no visual único (`visual.js` já trata valor desconhecido como Clássico). Terminal fica.
  O dono não tinha nada específico em mente; pediu uma revisão de design do Clássico (impeccable
  critique) para decidir o que mudar.
- **Pixel, Fita K7 e Personagens descartados por enquanto**: não entram na 5.0. Ficam no disco
  (sem commit) como referência.
- **Ideia para depois da 5.0:** cada pessoa escolher o estilo do próprio cartão na call, como
  personalização de perfil (ex.: a fitinha com carretéis que giram ao falar, do K7, e os pulinhos
  ao falar, do Personagens). Cada um usaria o seu.

## 23/11/2026 — identidade forte: Pixel pronto, K7 e Personagens na fila

O dono pediu uma identidade visual mais forte. O sorteio no registro mais ousado deu
quatro direções. Ele gostou de três e pediu para construir uma de cada vez. Quando todas
estiverem prontas, vai lançar a preferida junto com a próxima versão.

1. **Pixel (teste)**, pronto localmente em `public/pixel.css`. Inspiração: catálogo de fonte
   bitmap (Emigre). Títulos em Silkscreen sempre em múltiplos de 8 px, texto em Schibsted
   Grotesk, papel e tinta com um rosa sintético (#ff2da0), bordas de 2 px e retícula.
   Após o primeiro teste do dono, as bordas passaram de branco para cinza (`--px-linha`),
   os cabeçalhos perderam a faixa invertida e os avatares voltaram a ser redondos.
   Quem fala ganha retícula piscando e nome invertido. Quem chega fica rosa. O título da call
   se monta em degraus. Conferido com prints nos 3 temas e no celular. Passaram os 62 testes
   e o de personalização.
2. **Fita K7 (teste)**, pronto localmente em `public/fita.css` (valor `fita`). Carcaça de
   plástico escura (#131216/#232229) nos temas escuro e preto, capinha de papel creme no claro.
   Etiquetas de papel creme com caneta azul (#24429f) e a faixa da marca (cor primária, laranja,
   amarelo) no início, no topo da call e no canal atual. Títulos e nomes de canal em Patrick Hand,
   texto em Barlow, legendas impressas em Barlow Condensed ("LADO A", "CANAIS DE VOZ"). O tempo
   da call é um contador de fita. Cada cartão da call é uma fitinha com parafusos nos cantos e dois
   carretéis (`public/fita/carretel.svg`) ao lado da foto, que giram enquanto a pessoa fala; quem
   fala ganha a borda vermelha do REC, quem chega entra de cima com a borda amarela. O nome do
   canal é "escrito" da esquerda pra direita ao abrir a call. Conferido com prints nos 3 temas,
   no celular e na janela de entrada; passaram os 62 testes. Falta o dono experimentar no app.
3. **Personagens (teste)**, pronto localmente em `public/personagens.css` (valor `personagens`).
   Noite de anil no escuro, lilás claro no claro. Cada cartão da call é uma figurinha: fundo pastel
   na cor da pessoa (`--pessoa`, posto por `app.js`), foto com contorno branco grosso e plaquinha
   do nome levemente torta. Quem fala dá pulinhos com amassadinha e ganha borda na cor dela; quem
   chega é "colado" com um balancinho (desligado com o app sem foco). Títulos em Lilita One, texto
   em Figtree, ação em amarelo-gema com texto escuro. Aniversário e frase no perfil ficaram de fora
   (precisariam de campos novos). Conferido com prints nos 3 temas e no celular; 62 testes e o de
   canais passaram. O Fita K7 também desliga a animação de chegada com o app sem foco.

   Após ver o K7, o dono achou que não ficou ruim, mas não sabe se os amigos usariam. Falta ele
   ver o Personagens e escolher qual dos três (ou nenhum) vai pra release.

## 23/11/2026 — Terminal mais característico e teto de imagens

A pedido do dono, o visual Terminal ganhou movimento com função. Tem um medidor de fala
de cinco barras em degraus, com o nome de quem fala na cor da fala. Quem chega com a call
aberta aparece com a linha acesa, controlada pela classe `acabou-de-entrar` em `app.js`.
O título do canal é digitado ao abrir a call. Os avisos do chat seguem o estilo IRC (`* ...`).
O resto da moldura passou para mono e cantos retos, com IBM Plex Mono 600 de verdade
(`public/terminal/*.woff2`). Com movimento reduzido, nada se mexe. Com o app sem foco,
o título aparece direto e a linha de quem chegou fica acesa até a pessoa voltar.

O teto das imagens dos canais de texto caiu de 25 para 15 GB (`server.js`), abrindo espaço
para clipes e para o site de RPG. Essa parte só precisa de deploy. O clipe de transmissão
ficou em espera: o dono vai consultar os amigos (proposta: 1080p60, até 60 s, cota de 20 GB).

Passaram os 62 testes e o teste de celular. O `stream-window-browser.cjs` termina com
segfault (139) em headless, inclusive na `main` sem mudanças. É do ambiente, não da mudança.

## 23/11/2026 — visual Aconchego (teste)

A pedido do dono, começou o redesign com as skills de design (impeccable, frontend-design).
Entre quatro direções sorteadas, o dono escolheu o "app caloroso e macio". Ele virou uma
4ª opção em **Configurações → Aparência**, "Aconchego (teste)", sem mexer em Clássico, Roda
e Terminal: `public/aconchego.css`, fonte Nunito em `public/fonts/nunito/`, miniatura em
`public/previews/aconchego.png` e o registro em `visual.js`, `index.html`, `stream-window.html`
e `electron/connect.html`. O contrato da direção fica em `.impeccable/surfaces/` e o produto
em `PRODUCT.md`.

Conferido em Electron headless com `tests/visual-capture.cjs` (início, call com duas
pessoas, configurações e celular, nos 3 temas). Passaram os 62 testes e o teste de
personalização. Também apareceu um bug antigo: com o app sem foco, o cartão de quem entra
na call fica a 55% de opacidade nos visuais alternativos (ver armadilhas no PROJETO.md);
só o Aconchego foi corrigido. Falta: o dono experimentar no app de verdade, conferir a
janela de entrada e a de transmissão com o visual, e decidir se segue para release.

## 22/11/2026, 23h — 4.9.0 enfileirada na VM

O pedido `ambos` para o commit `73a8692` está em `/var/lib/teletela-agenda/pendente`
desde 23h de Brasília, com o pacote do servidor e o rascunho `v4.9.0` (9 arquivos,
SHA-256 registrados). O pacote foi conferido arquivo por arquivo contra o commit.
O timer tenta das 03h00 às 03h50 de 23/11; a VM ainda roda a 4.8, então a liberação
depende de `totalUsers: 0`. A credencial do GitHub está na VM.

O executor instalado na VM publica o rascunho mandando também a tag e o commit, porque
o GitHub pode restaurar a tag provisória se o PATCH tiver só `draft: false`. Essa
correção foi copiada para `deploy/oracle/madrugada/executar.py`. Depois da janela,
confira `journalctl -u teletela-madrugada.service` e se `pendente/` sumiu.

## 22/11/2026 — preparação da 4.9.0

O dono aprovou as mudanças para a madrugada de 23/11, das 03h às 04h de Brasília.
A versão 4.9.0 reúne a aba Amigos, ligações pela VM, anexos e prévias nos chats,
sons de transmissão, compilados no K7 e acessórios de época. O plano inclui
o deploy do servidor e a publicação do cliente após a verificação de saúde.
Os 62 testes principais e os 90 de canais, conta, música e ligações passaram.

## 22/11/2026 — agenda da madrugada instalada na Oracle

Com autorização do dono, o timer foi instalado e habilitado no Ubuntu da VM
existente. A sala e o SFU continuaram ativos. O systemd confirmou a próxima
janela e ignorou o serviço no teste com a fila vazia. Nenhuma versão aprovada
ou enfileirada. Os scripts de preparação estão na cópia local. O agendador instalado, o remoto
local e a configuração das próximas versões usam Castzzz/Teletela. A credencial
da VM autenticou no GitHub e consultou os releases com HTTP 200. A permissão de
publicação ainda não foi exercitada. Os 62 testes principais passaram.
O mecanismo de pacote, backup e reversão foi exercitado com arquivos temporários
e serviços simulados. O primeiro deploy e a publicação reais aguardam aprovação.
A saúde atual da VM ainda exige zero conexões para confirmar voz livre.

## 22/11/2026 — saída de espectador

Quem transmite ouve um toque descendente quando alguém fecha sua transmissão ou
sai da call enquanto assiste. O toque segue a preferência de sons de transmissão.
Mudança local, aguarda release do cliente. Passaram os 62 testes principais e o
teste do mixer em Electron isolado com saída da tela e desconexão do espectador.

## 22/11/2026 — mensagens privadas na aba Amigos

O atalho Conversas saiu da navegação. A aba Amigos ganhou uma bolinha quando há
mensagem privada por ler, e cada remetente aparece com “Nova mensagem” na lista.
O aviso continua após reabrir o cliente e some quando a última mensagem fica
visível na conversa. Os pedidos de amizade mantêm seu próprio contador.

Mudança local, aguarda release do cliente. Passaram os 62 testes principais,
os dois testes de amizades e o teste de interface em Electron com display isolado.
Foram conferidos o aviso no desktop e no celular, sua persistência e sua leitura.

## 22/11/2026 — compilados longos no K7

A pedido do dono, o limite local passou de 20 para 90 minutos por vídeo gravado,
com até 256 MB de áudio. O extrator, o pré-carregamento e o FFmpeg usam os mesmos
limites de duração ou tamanho que se aplicam a cada etapa. O laboratório de música
também aceita os compilados.

Passaram os 19 testes de música, os 62 da suíte principal e a interface do laboratório
em display isolado. A preparação foi exercitada com metadados simulados de 30, 60 e
90 minutos e com os dois limites excedidos. Em teste acelerado do transporte local,
o FFmpeg recebeu uma fonte sintética de uma hora e produziu 3600,0065 s de Opus.
A mudança do K7 aguarda deploy do servidor Node na VM.

## 22/11/2026 — sons de transmissão

Mudança local no cliente. Um toque ascendente avisa quem já está na call quando
outra pessoa inicia tela, tela extra ou câmera. Outro toque avisa o transmissor
quando um espectador abre aquela transmissão. Os avisos têm opção própria em
**Configurações → Som**, seguem o volume dos avisos da call e respeitam Não Perturbe.
Os dois WAVs originais ficam em `public/avisos/`.

Os 62 testes de `npm test` passaram. No Electron isolado, o teste dos controles
conferiu os dois sons no mixer com eventos do servidor local, a ausência de aviso
ao repetir estado e o desligamento pela preferência. Aguarda release do cliente.

## Retomada em 22/11/2026 — mensagens privadas e prévia de anexos

Na cópia local, a conversa privada se adapta ao monitor e guarda imagens, vídeos e
arquivos com o histórico. A cota de anexos privados é de 5 GB para a sala.
Nos canais de texto, no chat da call e nas DMs, colar, arrastar ou escolher um
arquivo prepara um rascunho. Enter ou Enviar confirma. Trocar de conversa descarta
o anexo pendente para evitar envio ao destino errado.

Passaram os 62 testes da suíte principal, a integração de canais/admin, os testes
de amizades e as suítes Electron de amigos e de canais. Foram verificados prévia,
remoção, envio por Enter, leitura da foto ao reabrir, reprodução de WebM, download
de arquivo e bloqueio após remover a amizade. Interface conferida em 2560 × 1440
e em largura de celular. Release e deploy seguem pendentes.

O dono pediu que os testes visuais fiquem fora da área de trabalho em uso.
A suíte Electron de amigos passou em display headless. Também foi conferida uma
janela visível de teste dentro de um compositor virtual separado.

## Retomada em 22/11/2026 — aba Amigos e ligação privada

Mudança local a pedido do dono. Amigos saiu das configurações e ganhou navegação
no desktop e no celular. A lista preserva pedidos, presença, avatares e conversas.
O telefone convida o amigo para voz pelo SFU. A hospedagem de sala no PC já tinha
saído do aplicativo. O servidor de desenvolvimento conserva os testes de canal P2P.

Verificados no Electron com duas contas e microfones simulados o convite, a recusa,
o aceite, o áudio Opus nos dois sentidos pelo SFU local, o mute e o desligamento.
A interface foi conferida no desktop e em largura de celular. Passaram os 62 testes
de `npm test`, os 20 testes de contas e amizades e o teste de isolamento das ligações. Os 81 testes M1–M3 e a suíte de navegação móvel também passaram.
Falta experimentar em aparelhos físicos e redes diferentes. A mudança depende de
release do cliente e deploy do Node para chegar à VM. Ambos aguardam aprovação.

## Retomada em 21/11/2026

Abra a pasta de trabalho original do Teletela. A base local é a `main`, no commit
`4e0228a`. A última versão publicada registrada é a 4.8.0, de 19/11, com deploy
na Oracle. Há trabalho posterior ainda no disco, inclusive arquivos novos. Ao
retomar, rode `git status --short --branch` e confira o diff antes de editar.
O histórico de releases e operações está em [PROJETO.md](PROJETO.md).

### Pronto na cópia local, aguardando próxima versão

- **Atalho de voz.** Havia seis botões “Clipar vozes” nas configurações. Ficou um
  em **Atalhos**. A tela foi conferida no Electron.
- **Indicador de fala.** A detecção do microfone em `public/audio-manager.js` passou
  a medir por temporizador, inclusive com a janela minimizada. O teste no Electron
  conferiu que o indicador acende com som e apaga no silêncio.
- **Avisos de entrada e saída.** O mixer aplica a saída de áudio escolhida e retoma
  o contexto suspenso ao tocar o aviso. Entrada e saída têm intervalos independentes.
  Um segundo participante entrou no teste e o aviso chegou à saída no Electron/Linux.
  Falta confirmar no PC Windows do amigo que relatou o problema.
- **Acessórios sazonais.** A decisão final foi enfeitar só os avatares. O provador
  manual, as faixas na sala e os confetes foram experimentados e retirados a pedido
  do dono. O calendário está em `public/decoracoes.js` e as cinco artes em
  `public/decoracoes/`. Natal de 01/12 a 28/12, Ano Novo de 29/12 a 05/01,
  Carnaval da sexta à terça, Páscoa da segunda ao domingo de Páscoa e Halloween de
  25/10 a 31/10. Cada pessoa pode desligar em **Configurações → Aparência → Mostrar
  acessórios de época nos avatares**. Foram conferidas as datas de transição e a
  preferência após reabrir o app.
- **Verificações desta sequência.** Os 62 testes de `npm test` passaram após a
  decisão final sobre os avatares. Na correção de áudio também passaram os 81
  testes M1–M3 e `npm run test:microphone:ui`. Os resultados se referem ao estado
  testado naquele momento.
- **Outras mudanças já presentes na pasta.** Há ajustes locais no RNNoise e nos
  modos de pausa do microfone, no tempo e progresso do K7, no endpoint WARP do
  instalador da Oracle e na versão do Android (4.8.0, código 19). Conferir o diff
  desses arquivos para definir o escopo da próxima versão. Os sons privados em
  `public/sounds/` precisam continuar no disco para o instalador e ficam fora do Git.

### Recuperação concluída na Oracle

Em 21/11, com autorização do dono, foi restaurado somente o canal de texto
**Colheitas Gerais**, ID `colheitas-gerais`, com posição e permissões originais.
O backup de 00h08 continha 25 mensagens visíveis e seis imagens. Foi guardada uma
cópia dos dados atuais antes da intervenção. O histórico e as imagens foram
conferidos na VM, os serviços Node e SFU ficaram ativos e a saúde pública
respondeu HTTP 200. A consulta externa ao histórico parou na senha da sala.
O material separado fica no PC do dono em
`~/Teletela-backups/recuperacao/teletela-dados-2026-11-21_00-08-09/colheitas-gerais/`.

### Próximo assunto em aberto

**Proposta anterior à instalação do timer (ver registro de 22/11 acima).** A regra já registrada exige aprovação
do dono para cada versão, com tentativas das 03h00 às 03h50 no horário de Brasília.
Antes de publicar ou reiniciar, confirmar que todos os canais de voz estão vazios,
inclusive os privados. Se houver gente em call ou faltar confirmação, tentar de
novo em dez minutos. Às 04h o restante passa para a próxima madrugada. O procedimento
de backup, deploy e publicação está na [seção 6 de PROJETO.md](PROJETO.md#6-publicar-uma-versão-release).

Hoje os comandos ainda partem do PC. A proposta discutida foi preparar os instaladores
com os sons locais, enviá-los para um rascunho no GitHub e deixar o pacote de deploy
na VM antes de desligar o PC. À noite, um agendador na Oracle cuidaria da ocupação,
do backup, do deploy, da verificação de saúde e da publicação do rascunho. A estimativa
foi de baixo consumo adicional usando a VM existente. A cobrança depende da cota da
conta. **A conversa terminou na proposta.** A configuração do agendador remoto e da
credencial limitada ao repositório continua pendente, assim como a aprovação de uma
próxima versão.

Os registros abaixo têm suas próprias datas. O [histórico de pendências](historico/PENDENCIAS.md)
guarda anotações mais antigas.

## Implementado localmente em 19/11/2026

- [x] **Clipe → soundboard.** Selecionar o começo e o fim de um trecho da call, ouvir a prévia, dar um nome e adicionar ao soundboard. Aumentar de 10 para **15 segundos** a duração máxima de cada som, tanto no envio de arquivo quanto na criação a partir de clipe.
- [x] **K7, o bot de música.** Personagem em forma de fita cassete, conversa lateral para pedidos e fila compartilhada em uma aba própria. Validação pendente.
- [x] **Barra da transmissão.** Música, dados, diagnóstico e parar de assistir ficam em Mais opções (⋯). Assistir juntos fica no topo e o modo Só call foi retirado.
- [x] **Voltar de onde parei no chat.** Reabrir a conversa na primeira mensagem não lida, com atalho para pular às recentes. Ao seguir uma resposta até a mensagem original, permitir voltar ao ponto anterior de leitura.
- [x] **Prévia no selo AO VIVO.** Ao passar o mouse ou focar o selo pelo teclado, mostrar uma miniatura estática antes de entrar na transmissão. Proposta: capturar um quadro de baixa resolução no aparelho de quem transmite a cada 15 segundos, manter apenas o mais recente em memória e liberar a imagem só para quem pode assistir. Distinguir as telas de cada pessoa e retirar a miniatura quando o compartilhamento terminar.

## Candidatos à 5.0 na main

Inventário do código local em 18/11/2026, comparado com a tag `v4.7.0`. A combinação destas mudanças ainda precisa de validação.

| Área | Mudança desde a 4.7.0 |
| --- | --- |
| Aparência | Roda e Terminal opcionais, com o Clássico como padrão. Cor do tema para superfícies, cor primária para ações e secundária para destaques. |
| Call e navegação | Última fileira centralizada no Roda. Terminal com índice por teclado, indicador de fala na bolinha e cursor configurável. Animações de entrada e de painéis. O título Canais abre o início da sala com a call conectada. Botões da janela principal com fundo transparente. |
| Conversas | Histórico privado entre contas amigas, paginado e disponível nos aparelhos da conta. Cartão do primeiro link nos canais, no chat da call e nas conversas diretas, com miniatura para YouTube. |
| Clipes | Pré-escuta e título antes do envio, renomeação, gravação em até 48 kHz, tesoura no painel de voz e atalho configurável no desktop. A gravação de trechos de 10 a 60 segundos já saiu na 4.7.0. |

Sintonia, Recorte, Órbita e Fliperama continuam no trabalho de redesign em `design/estudio`. Há arquivos locais ainda fora do Git nos dois diretórios de trabalho.

Antes da publicação, conferir a atualização da 4.7.0 com perfil e preferências existentes, a troca de visuais e cores no desktop e no Android, DMs entre contas, prévias de links e reprodução de clipes antigos e novos. As DMs, os metadados de links e o reconhecimento dos novos WAVs dependem do servidor atualizado. O pacote, o popup de novidades e a configuração do APK ainda identificam a 4.7.0.

## Assistir juntos — experimental, 4.6.0

- [x] Extensão 0.2.0 para Firefox 140+ (14/11/2026), com
  pareamento e comandos de vídeo testados em perfil descartável no Linux.
  Instalação temporária documentada e download no servidor atualizado. Ainda sem
  assinatura Mozilla; anexo da release 4.6.0 no GitHub permanece na versão antiga.

- [x] Implementar sessão por call, guia transferível, extensão Chrome/Edge/Brave para
  YouTube/Netflix, código individual e revogação ao sair da call; pacote ZIP e documentação.
- [ ] Validar dois navegadores reais, play/pausa/avanços, troca de vídeo/episódio,
  reconexão, anúncios YouTube, autoplay, Netflix e limites de acesso entre calls.
  Painel, pareamento, autenticação, sincronização HTTP e ZIP conferidos localmente
  na preparação da release. Netflix permanece experimental; planos com anúncios
  ainda não são suportados.
- [x] Release 4.6.0 e deploy Oracle concluídos em 14/11/2026. Download público do ZIP conferido.

## Incluído na 4.5.0

Publicação e deploy concluídos com autorização do dono; verificações anteriores aproveitadas, sem repetir testes.

- [x] **Miniatura da transmissão arrastável e ajuste do chat de texto:** ao assistir uma transmissão dentro de um canal de texto (`.text-with-stream #stage-section`), a janelinha pode ser arrastada para qualquer canto da tela (duplo clique na barra **Transmissão** restaura a posição padrão). Removido o espaço vazio de `246px` no final de `#chat-messages` (`public/redesign.css`, `public/server-members.css`, `public/mobile.css`, `public/app.js`).
- [x] **Comandos de mensagem `/t` e `/w` (`/whisper`) nos chats (call e texto):**
  - `/t <segundos> <mensagem>`: duração configurável de `1` a `600` segundos (máximo de 10 minutos), selo com contagem regressiva (`⏱️ Xs`), remoção automática ao expirar, bloqueio de fixação e sem gravação em disco.
  - `/w @pessoa ... <mensagem>` ou `/whisper @pessoa ... <mensagem>`: mensagem privada para uma ou mais pessoas marcadas (inclusive nomes compostos), visível só para o remetente e destinatários marcados (`🔒 Privada para ...`), sem indicador de "digitando…" e sem vazar no arquivo em disco, histórico, busca, contexto, mensagens fixadas, citações públicas de resposta ou texto de notificação do sistema.
- [x] **Fotos dos amigos na tela inicial e na aba Amigos:** resolução de avatar pelo ID estável da conta/membro no servidor (`resolveFriendAvatar` em `server.js`, consultando socket ativo, `account.profile.avatar` e `MemberAvatarStore` em disco), preservando a foto ao entrar em call e suportando imagens WebP, GIF, PNG e JPEG com recorte (`avatarCrop`) em `electron/connect.html` (`/api/launcher/friend-avatar/:accountId`) e em `public/friends.js` (`/api/friend-avatar/:accountId`).
- [x] **Revisão das marcações e fotos:** sugestões com foto/iniciais sem juntar homônimos; escolha privada com identificador curto e recusa de nomes ambíguos; `/t ... /w` sem aviso de digitação; recorte e zoom aplicados na aba Amigos.
- Verificação desta revisão: 62/62 testes básicos, 80/80 de M1–M3, 14/14 de contas/amigos/abertura/privadas e dois cenários Electron (marcações e amigos/controles), com capturas nos três temas. A integração antiga `m4-channels-admin` ficou parada antes dos casos novos e não foi validada completa; os cenários novos cobrem o isolamento em call e canal de texto.
- [x] Publicação desktop, Android/código 15, Flatpak e deploy com backup concluídos. Nove arquivos e metadados de atualização conferidos; servidor saudável.

## Incluído na 4.4.0

Branch `prototipo/presenca-e-atividades`, baseada na `main`, com as alterações locais anteriores preservadas:

- [x] Microfone mono com RNNoise, corrigindo o canal vazio e a perda de volume.
- [x] Sons de entrada/saída audíveis ao ensurdecer, respeitando preferências e volume geral.
- [x] Presença por aparelho: Online, Ausente, Não perturbe e Offline, com cores próprias.
- [x] Ausente automático após cinco minutos ou no canal de Ausentes; seleção manual preservada.
- [x] Não perturbe silencia avisos e menções; Offline oculta presença/atividade e preserva call.
- [x] Abertura com nome Colheita Fartus e imagem do servidor personalizável por quem gerencia.
- [x] Remover as faixas/bordas cinzas das configurações.
- [x] Foto/GIF dos autores no histórico, com identidade estável e cópia persistente da última imagem.
- [x] Teste de microfone com gravação/reprodução local, fora da call e sem alterar o mute.
- [x] Membros com largura ajustável, persistência, teclado e restauração por duplo clique.
- [x] Anotar para depois os dois servidores extras, ID/senha e capacidade de até oito pessoas.
- [x] Atividades prontas sem descrição: estudar, trabalhar, assistir, ouvir e jogar;
  texto livre somente em “Outra atividade…”.
- [x] Troca rápida pelo próprio perfil no rodapé; no celular, pela página Você.
- [x] Todos os seletores da sala com lista aberta no tema do app, incluindo áudio/canais/cargos.
- [x] Redesenhar lateral de canais e configurações, com explicações recolhidas.
- [x] Novo início do desktop com prévia autenticada dos amigos online e avatares.
- [x] Retirar a hospedagem no PC e o código de túnel do desktop.
- [x] Evitar reconstruir a atividade quando a detecção retorna o mesmo jogo.
- [x] Separar pendências atuais dos registros históricos e corrigir ideias já publicadas.
- [x] Publicação autorizada pelo dono após a revisão do protótipo.
- [ ] Ouvir a correção de volume/RNNoise nos microfones reais do grupo, Windows e Android.

## Revisão de código desta retomada

- Consultas idênticas de jogos preservam o HTML da atividade; o relógio atualiza só o texto.
- `public/app.js` concentra interface, sinalização e mídia. Extrair módulos por funcionalidade
  pode facilitar manutenção, mas fica fora deste protótipo para reduzir regressões.
- Não foi identificada evidência para remover módulos de áudio, contas ou transmissão nesta
  revisão. Os documentos duplicavam principalmente estados históricos já concluídos.
- Verificações locais: runner 62/62 e 95 regressões de servidor/mídia/contas/presença/avatares,
  incluindo imagem do servidor. Interface nos três temas/celular, upload e restauração da
  imagem, menções silenciosas em Não perturbe e retorno da notificação em Online passaram.
  Os testes simulados de áudio não substituem a escuta em aparelhos físicos.


## Android e distribuição

- [ ] Conferir PiP em aparelho físico: trocar de app, fechar a janela do sistema, bloquear
  a tela e usar fone/Bluetooth.
- [ ] Conferir captura de tela/áudio com apps reais, inclusive os que bloqueiam captura.
- [ ] Validar troca de rede, áudio em segundo plano, CPU e consumo de bateria em aparelho físico.
- [ ] Definir distribuição/atualização dos APKs; hoje é manual. Preservar a assinatura existente.

## Publicação concluída

Release 4.4.0 publicada e servidor atualizado em 09/11/2026, com autorização do dono.
Windows, AppImage, tar.gz, Flatpak e APK Android/código 14 disponíveis no GitHub.
Backup anterior ao deploy preservado; serviços e saúde pública conferidos. Os testes
já concluídos foram aproveitados, sem nova execução, conforme pedido.

O filtro experimental GTCRN foi revertido; o pendente de escuta atual é RNNoise/volume mono.
Ideias sem implementação ficam em [IDEIAS-FUTURAS.md](IDEIAS-FUTURAS.md).
