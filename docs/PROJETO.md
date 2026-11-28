**[4.8.0 publicada em 19/11/2026](https://github.com/Castzzz/Teletela/releases/tag/v4.8.0)** — controle de acesso por transmissão, novo visual do bot de música e mudanças visuais no Teletela. Release desktop publicada com sete artefatos conferidos e atualização automática de Windows/Linux validada pelos manifestos públicos. Deploy na Oracle concluído com backup prévio íntegro, serviços ativos e hashes conferidos.

**[4.7.0 publicada em 17/11/2026](https://github.com/Castzzz/Teletela/releases/tag/v4.7.0)** — clipes de voz de 10 a 60 segundos com envio para um canal de texto. Teste entre dois clientes Electron aprovado. APK de teste 4.7.0 (código 18), dez anexos conferidos e atualização automática de Windows/Linux validada pelos manifestos públicos. Deploy na Oracle concluído com backup íntegro, serviços ativos e hashes de servidor, interface e gravador iguais aos locais.

**[4.6.0 publicada em 14/11/2026](https://github.com/Castzzz/Teletela/releases/tag/v4.6.0):** Assistir juntos experimental, download da extensão, volume de transmissão até 300% e compatibilidade do bot de música. Release e deploy concluídos; reprodução real entre navegadores e Netflix ainda precisam de validação.

**[4.5.1 publicada em 13/11/2026](https://github.com/Castzzz/Teletela/releases/tag/v4.5.1):** correções de segurança e ajustes no SFU. Testes anteriores aproveitados a pedido do dono; pacotes, popup de novidades e saúde dos serviços conferidos.

**[4.5.0 publicada em 09/11/2026](https://github.com/Castzzz/Teletela/releases/tag/v4.5.0):** mensagens privadas e temporárias, marcações com foto, prévia arrastável e fotos dos amigos. Cliente e servidor atualizados; testes anteriores aproveitados a pedido do dono.

# Teletela: documentação do projeto

**[4.4.0 publicada em 09/11/2026](https://github.com/Castzzz/Teletela/releases/tag/v4.4.0):** presença, atividades, redesign, avatares do histórico, teste de microfone e Membros redimensionável. Cliente e servidor atualizados; testes anteriores aproveitados a pedido do dono.

**[4.3.3 publicada em 05/11/2026](https://github.com/Castzzz/Teletela/releases/tag/v4.3.3):** canal de Ausentes bloqueia o microfone de todos,
inclusive administradores, e restaura o estado anterior ao sair. Novo bundle Flatpak
experimental nos downloads do GitHub, com atualização manual. APK 4.3.3/código 13.
Release e servidor atualizados a pedido do dono, com backup prévio e saúde pública conferida.

**[Versão 4.3.2 publicada em 02/11/2026](https://github.com/Castzzz/Teletela/releases/tag/v4.3.2):** correção da conexão alternativa HTTP quando WebSocket falha.
Validação na interface instalada: conexão normal, bloqueio de WebSocket, entrada no canal e
retomada após queda. Release desktop e servidor atualizado para navegador, com backup prévio
e saúde pública conferida. Android permanece na 4.3.1/código 12.

Tudo o que precisa pra entender, rodar, mudar, publicar e manter o Teletela. Escrito pra quem
for mexer no código, inclusive agentes de IA (Claude Code, Antigravity, etc.) em outra conversa.

**[4.3.1 publicada em 31/10/2026](https://github.com/Castzzz/Teletela/releases/tag/v4.3.1):** transmissão em janela normal no desktop,
tela cheia em outro monitor, cabeçalho integrado e controles flutuantes com ocultação
automática. APK 4.3.1/código 12 acompanha a interface; PiP móvel preservado.

**[4.3.0 publicada em 31/10/2026](https://github.com/Castzzz/Teletela/releases/tag/v4.3.0):**
amigos, membros na lateral, tempo individual por canal, exclusão do Geral, barra em tela
cheia e captura nativa Android. APK 4.3.0/código 11. Servidor atualizado e saudável.
Os registros abaixo de desenvolvimento local descrevem as etapas anteriores à publicação.

**Pedidos e andamento:** [pendências atuais](PENDENCIAS.md) e [ideias futuras](IDEIAS-FUTURAS.md).
Registros antigos dessas listas ficam em `docs/historico/`; datas e branches citadas no
histórico descrevem a situação daquela época. Contas/amigos já estão publicados desde a 4.3.0.

**Versão 4.1.0 (28/10/2026):** miniplayer, modo cinema, privacidade inclusive para o dono,
dados de RPG, início/ícones renovados, chat central e contas opcionais. O APK acompanha
a atualização e permite alternar câmera frontal/traseira. Múltiplos servidores ficam para depois.

**Versão 4.2.0 publicada (30/10/2026):** inicialização
com o PC, busca, diagnóstico, categorias/ordenação, apelido só em voz pelo próprio perfil,
download de imagens, ausentes e personalização. O APK passa a 4.2.0/código 9. Os registros
abaixo sobre branches e testes locais descrevem as etapas anteriores à publicação.

**Versão 4.2.1 publicada (30/10/2026):** tempo diário de call por pessoa,
com pausa fora da voz, persistência e reset à meia-noite de Brasília. APK código 10.

**Incluído na 4.3.0 (31/10/2026):** amigos por conta, barra inferior com ocultação automática
em tela cheia e captura nativa de tela/áudio no Android. Lista de membros do servidor na
lateral, com online/offline e busca, e exclusão do Geral por quem gerencia canais.

> O nome antigo era **Telinha**. O app virou **Teletela** na 2.0, mas muita coisa por dentro
> continua com o nome antigo de propósito (pasta do repositório, `appId`, serviços da VM,
> chaves de preferências). Veja [Nomes que não podem mudar](#nomes-que-não-podem-mudar).

---

## Sumário

1. [O que é](#1-o-que-é)
2. [Como funciona (arquitetura)](#2-como-funciona-arquitetura)
3. [Organização das pastas](#3-organização-das-pastas)
4. [Rodar no seu PC](#4-rodar-no-seu-pc)
5. [Testes](#5-testes)
6. [Publicar uma versão (release)](#6-publicar-uma-versão-release)
7. [Atualizar o servidor (deploy)](#7-atualizar-o-servidor-deploy)
8. [O servidor na nuvem (VM da Oracle)](#8-o-servidor-na-nuvem-vm-da-oracle)
9. [Dados guardados](#9-dados-guardados)
10. [Protocolo: eventos do Socket.IO](#10-protocolo-eventos-do-socketio)
11. [Onde fica cada funcionalidade no código](#11-onde-fica-cada-funcionalidade-no-código)
12. [Convenções](#12-convenções)
13. [Armadilhas conhecidas](#13-armadilhas-conhecidas)
14. [Checklist pra uma mudança](#14-checklist-pra-uma-mudança)

---

## 1. O que é

Um "Discord pequeno" pra um grupo de amigos: canais de voz, transmissão de tela com o som do PC
separado do microfone, chat, canais de texto que ficam salvos, soundboard, perfil personalizado
e um admin pra moderar.

- **App desktop** (Electron) pra Windows e Linux, com atualização automática pelo GitHub Releases.
- **Android em teste** (`android/`): APK com a mesma interface empacotada em WebView e serviço
  nativo para a chamada. Veja [ANDROID.md](ANDROID.md) para compilar, instalar e testar.
- **Servidor** (Node + Socket.IO) que cuida de canais, chat, presença e moderação.
- **SFU** (Go + Pion WebRTC) que repassa voz, tela e câmera: cada um manda uma vez só pro
  servidor e ele distribui pra quem está assistindo.
- A sala "oficial" roda numa VM grátis da Oracle em **https://colheitafartus.duckdns.org**.
- **Protótipo de 09/11/2026:** a abertura prioriza a sala oficial e os amigos online.
  A hospedagem pelo app foi retirada; o servidor ainda pode ser executado manualmente
  com `npm start` para desenvolvimento, sem SFU e com mídia P2P. Na branch
  `prototipo/comandos-chat-e-fotos-amigos`, a miniatura da transmissão em canais de texto é
  arrastável, o chat suporta `/t <1..600> <msg>` (temporária) e `/w` / `/whisper @pessoa <msg>`
  (privada sem persistência em disco), e as fotos dos amigos (inclusive WebP/GIF) são
  resolvidas na tela inicial e na aba Amigos via `resolveFriendAvatar` (`server.js`).

Repositório público: https://github.com/Castzzz/Teletela

## 2. Como funciona (arquitetura)

```
        App desktop (Electron)                          VM Oracle (colheitafartus.duckdns.org)
 ┌──────────────────────────────────┐            ┌──────────────────────────────────────────┐
 │ electron/main.cjs                │            │ Caddy :443 (HTTPS automático)             │
 │  - janela, atalhos, atualização  │            │   /sfu/*  → telinha-sfu   :8081 (Go)      │
 │  - serve public/ em telinha://app│  Socket.IO │   resto   → telinha-server:8080 (Node)    │
 │                                  │ ─────────► │                                          │
 │ public/ (a interface da sala)    │            │ server.js: canais, chat, texto, perfil,   │
 │  app.js, audio-manager.js, ...   │  WebRTC    │   admin, soundboard, senhas pro SFU       │
 │                                  │ ─────────► │ sfu/main.go: repassa voz/tela/câmera      │
 └──────────────────────────────────┘ (UDP/TCP   │   (porta de mídia 50000 UDP/TCP)          │
                                        50000)   └──────────────────────────────────────────┘
```

Pontos importantes:

- **Conexão em redes com bloqueio de WebSocket (4.3.2):**
  `public/app.js` usa `transports: ['websocket', 'polling']` com `tryAllTransports: true`.
  Só listar os dois transportes não ativa a alternativa quando o primeiro falha: sem
  essa opção o app repetia WebSocket e nunca tentava HTTP, mesmo com HTTPS acessível.
  A alternativa usa o mesmo domínio/certificado e mantém autenticação; não substitui
  WebRTC para voz/tela. Teste na interface instalada com bloqueio real de requisições
  WebSocket e reconexão: `electron tests/connection-fallback-browser.cjs`.
- **A interface vem instalada no app.** O Electron serve a pasta `public/` empacotada pelo
  protocolo `telinha://app` (`electron/app-protocol.cjs`) e passa o endereço da sala em
  `?server=https://...`. Do servidor só vem a conexão Socket.IO e os arquivos de mídia
  (`/api/avatar/...`, `/api/banner/...`, etc.). **Mudou `public/`? Precisa de release**, não
  basta o deploy.
- Pelo navegador também funciona: aí a página vem do próprio `server.js` (que serve `public/`).
- Abrir o site ou a sala pelo app começa **fora da call**, inclusive ao recarregar e com
  `?channel=` ou um canal salvo por versões antigas. O perfil é enviado ao conectar para
  usar texto sem voz. `prefs.micOn` guarda a escolha de mutado/desmutado entre aberturas;
  sem preferência salva, começa mutado. Restaurar o botão não abre a captura: ao entrar na
  call, ela é aberta se o mic estiver ligado. Clicar num canal preserva o estado escolhido
  no dock, inclusive ao sair e entrar de novo. Moderação não sobrescreve a escolha salva;
  ensurdecer pelo botão salva o mic desligado e restaurar o áudio salva o estado recuperado.
  Falha ao abrir o microfone volta ao mute e salva esse estado. Reconectar após uma queda
  de rede retoma apenas a call já escolhida nessa janela, mantendo o estado do microfone.
- **Sala na nuvem:** voz, tela e câmera passam pelo SFU. O `server.js` dá uma senha temporária
  (HMAC com `SFU_SECRET`) pra cada conexão no SFU (evento `sfu-token`). Salas do SFU:
  `<canal>__<id>` (tela 1), `<canal>__<id>__cam`, `<canal>__<id>__voz`, `<canal>__<id>__s2`,
  `<canal>__<id>__s3` (telas extras).
- **Servidor local de desenvolvimento:** `npm start`, sem SFU (`SFU_SECRET` vazio),
  usa mídia P2P. O Electron não inicia mais servidor local nem túnel; na abertura, o fluxo
  principal entra na sala oficial e **Entrar por outro link** aceita outro endereço.
- **Áudio no cliente:** Web Audio. Vozes passam por um ganho que o "ensurdecer" zera; as
  transmissões passam por outro (dá pra continuar ouvindo as telas ensurdecido). Tudo termina
  no volume geral. Os avisos de entrada/saída da call vão direto ao `outputGain` e continuam
  audíveis ao ensurdecer, respeitando as preferências e o volume desses sons.
  Veja `VolumeMixerManager` em `public/audio-manager.js`.
- **Microfone (3.9.0):** revertido ao processamento da 3.7 por relato de áudio estranho.
  `microphone.js` usa RNNoise opcional → ganho manual → destino Web Audio, sem GTCRN,
  compressão, limitador ou reforço automático. Correção local de 08/11/2026: filtro e destino
  explicitamente mono para eliminar a perda de 6 dB causada por um canal vazio no RNNoise.
  `prefs.micOn` lembra o mute; `micGain` controla 0–300%. O modo antigo `ia-leve` é
  tratado como IA/RNNoise. A troca de filtro preserva o mute e libera a captura anterior.
  Os perfis opcionais de pausa usam a probabilidade de fala calculada pelo RNNoise a cada 10 ms. Após 200 ms sem fala detectada, o ganho desce gradualmente até −12 ou −24 dB antes do ganho manual.
  [DIAGNOSTICO-MICROFONES.md](DIAGNOSTICO-MICROFONES.md) guarda o diagnóstico atual e o experimento histórico.
- **Celular:** `mobile.css` e `mobile.js` usam navegação própria: Canais e Você.
  A call e o chat abrem em telas separadas; uma faixa compacta mantém mute e saída da call
  disponíveis ao navegar. Os botões móveis disparam os controles originais, sem duplicar
  a lógica de WebRTC. Configurações abrem por assunto e ações de mensagem usam uma folha
  embaixo. O layout desktop continua em `style.css`/`redesign.css`.
  O APK usa `WebViewAssetLoader` em `https://appassets.androidplatform.net/` para
  servir os arquivos instalados, conectando ao mesmo Node/SFU do desktop. A ponte
  `TeletelaAndroid` recebe o estado da call e abre a escolha de saída de áudio.
  `CallService` mantém uma notificação e o serviço de microfone/reprodução enquanto há call.
  A saída nativa carrega um ID da chamada: o encerramento assíncrono de um serviço antigo
  não pode tirar a pessoa da call seguinte. Ao sair, a captura é fechada, preservando a
  escolha do botão para a próxima entrada.
  PiP nativo usa `mobile-pip.js` e `MainActivity`: vídeo remoto em uma janela do sistema
  ao minimizar, sem duplicar a captura ou mudar o mixer. Detalhes em [ANDROID.md](ANDROID.md).
  Compartilhar a tela do celular exige integração MediaProjection e ainda não existe.

### Assistir juntos por extensão (experimental, 4.6.0)

Implementação solicitada pelo dono para YouTube e Netflix com extensão ligada ao
Teletela. Na preparação da 4.6.0 foram conferidos o painel no Electron, pareamento,
autenticação, sincronização por HTTP e download do ZIP. Reprodução entre navegadores
reais, anúncios e Netflix ainda precisam de validação.

- `watch-together.js` no servidor mantém uma sessão efêmera por canal de voz, com guia,
  participantes, link canônico, posição, taxa, âncora temporal e revisão dos comandos.
  Não grava histórico nem credenciais em disco. Não usa o SFU nem retransmite mídia.
- `public/watch-together.js` e `.css` criam o painel **Assistir juntos** na barra superior,
  no chat e em Opções da chamada no celular. A sessão é descoberta pelos membros da call; participar é explícito.
  Qualquer participante pode assumir o guia. Quem guia pode encerrar para todos; sair
  da call, ser movido/expulso ou desconectar revoga os próprios códigos/tokens. Se o guia
  sair da sessão/call, ela termina. Não há retomada automática após reconectar o app.
- A extensão Manifest V3 fica em `public/watch-extension/`, para Chrome/Edge/Brave no
  computador; extensão 0.2.0 acrescenta Firefox 140+, disponível pelo download do
  servidor desde 14/11/2026 (instalação temporária, sem assinatura Mozilla).
  O manifesto combina `background.service_worker` para Chromium 121+ e
  `background.scripts` para Firefox, com ID fixo `assistir-juntos@teletela`.
  Os scripts escolhem `browser` quando disponível e usam `chrome` como alternativa.
  O popup solicita permissão apenas para o host do servidor informado no
  código (HTTPS, ou HTTP em localhost/127.0.0.1). Só a aba selecionada é sincronizada.
  As credenciais ficam em `chrome.storage.session`, acessível pelos contextos confiáveis
  da extensão, sem cookies/senhas dos serviços. Fechar o navegador exige parear de novo.
- Cada pessoa gera um código próprio com 32 bytes aleatórios, uso único e validade de
  cinco minutos, vinculado ao socket já autorizado na call. A troca entrega outro token,
  de até 12 horas, válido somente enquanto esse socket continuar participante da sessão.
  Gerar outro código revoga a conexão anterior. Nunca colocar códigos reais em logs/docs.
- `background.js` faz as requisições autenticadas; `content.js` lê/controla o vídeo e
  consulta a sessão uma vez por segundo. Eventos do guia também enviam atualização
  imediatamente. A revisão de comandos permite corrigir play/pausa e avanços pequenos;
  deriva acima de 1,25 s gera busca com intervalo mínimo. Não promete sincronismo exato.
  Ausência de relatos do guia por seis segundos suspende o estado reproduzindo.
- No YouTube, usa o elemento de vídeo no próprio site, detectando `.ad-showing` para
  suspender sincronização durante anúncios. Na Netflix, `netflix-bridge.js` roda no
  contexto da página e tenta a API interna do player, com alternativa no elemento de
  vídeo. Nenhum token do Teletela entra nessa ponte. Essa API pode mudar e **a Netflix
  ainda precisa de validação real**. Planos Netflix com anúncios e vídeos ao vivo não
  são suportados; autenticação, acesso ao título, idioma e legendas são individuais.
- Som/volume saem pelo navegador e não passam pelo mixer/ensurdecer do Teletela.
  Navegador pode exigir clique em play. Travamentos de um participante não pausam todos.
  Troca de vídeo acompanha o guia somente na aba escolhida, com player já aberto;
  o popup também oferece **Abrir vídeo da sessão**. Não abre abas sem ação do usuário.

Eventos Socket.IO (payload `{}`, com ack `{success, ...}`): `watch-together:state`,
`:join`, `:pair`, `:lead`, `:leave`, `:stop`. `watch-together:state` também é emitido
com `{channelId, session}` para os sockets da call; clientes fora dela não recebem a sessão.
HTTP: `POST /api/watch-together/pair` troca `{code}`; `POST .../sync` recebe `{report}`;
`POST .../status` consulta sem marcar uma aba como conectada; `POST .../disconnect`
revoga o token. Estes três últimos exigem `Authorization: Bearer <token>`, com nova
conferência do socket/membro/canal em cada requisição. Limites: JSON de 4 KiB, 20
requisições/s por token e 30 ações Socket.IO a cada dez segundos por socket.

`GET /api/watch-together/extension.zip` entrega somente os oito arquivos públicos
permitidos da extensão, em ZIP gerado sem ferramentas externas. `npm run watch:extension`
gera o mesmo pacote em `dist/Teletela-Assistir-Juntos.zip`, sem iniciar servidor.
[Instruções de instalação manual](../public/watch-extension/LEIA-ME.md).
`package.json` e `deploy/oracle/deploy.sh` incluem o novo módulo do servidor nos pacotes;
esta mudança exige **release + deploy**; publicação autorizada pelo dono em 14/11/2026.

### Transmissão em janela no desktop

O botão ⧉ / atalho P usa `public/stream-window.js` para abrir o player local
`stream-window.html` em uma janela Electron normal, com moldura, maximização e tela cheia. O cabeçalho arrastável usa `titleBarOverlay`
com botões nativos no Windows/Linux e `hiddenInset` no macOS; as cores acompanham
o tema da sala pelo processo principal. A barra flutuante do player usa tokens dos
três temas, SVGs e botões compactos em larguras menores que 540 px.
`electron/stream-window.cjs` libera somente esse endereço e nome de janela no
`setWindowOpenHandler`; links HTTP(S) continuam no navegador. A janela compartilha o
MediaStream já recebido, sem nova conexão WebRTC, e reproduz o vídeo sempre mutado:
o áudio continua no mixer da sala, sem duplicar som nem ignorar volume/ensurdecer.
Reabrir a mesma transmissão fecha a janela; escolher outra reutiliza o player. A remoção
da transmissão, navegação ou fechamento da sala fecha o player. Fechar só o player
não para tracks nem interrompe a call: o vídeo volta imediatamente ao palco. Enquanto o
player está aberto, o vídeo do palco recebe apenas as tracks de áudio (ou fica sem
`srcObject` se não houver áudio), preservando o mixer sem renderizar o vídeo duas vezes.
O palco mostra um aviso de transmissão no popup. Trocar a transmissão do player restaura
a anterior no palco; o áudio do popup continua audível mesmo ao focar outra aba.
Navegador e Android mantêm o PiP anterior.
Os controles do player somem após 3 segundos sem interação, inclusive com foco ou
ponteiro parado nos botões. Eventos de mouse, foco e teclado revelam a barra novamente.
Validação com dois clientes WebRTC reais: `npm run test:stream:ui`.

Os controles de volume usam `public/stream-volume-control.js` na barra do palco e nos
vídeos do mosaico. No palco individual o controle sobre o vídeo fica oculto, evitando
duplicação. O alto-falante alterna mute/restauração do último volume positivo por
transmissão, guardado só durante a sessão; o percentual restaura 100%. O volume salvo por
perfil continua no fluxo existente. A barra usa escala de 0–300 e os três temas.
Correção local de 13/11/2026 (sem release/deploy): `attachScreenStream` e
`applyStreamGain` ainda limitavam o ganho a 2, embora o controle e `setStreamVolume`
aceitassem 300%. Ambos agora usam `MAX_STREAM_VOLUME_PERCENT`. Testes precisam conferir
o ganho aplicado e a amplitude na saída, além do percentual/retorno do setter.
`npm run test:stream:ui` mede o áudio recebido por WebRTC após o `outputGain` com os
sliders da interface: transmissão em 50/100/150/200/250/300% e geral em 0/50/100/200%.
Isso verifica o sinal antes da saída do sistema; não simula o mixer do Windows/Linux
nem a rede dos amigos. O relato de não mudar acima de 100% e de falhar ao reduzir
o geral ainda não foi reproduzido nesses testes locais.
Redesign local de 12/11/2026: validado posteriormente no Electron com SFU/P2P,
incluindo mute, restauração do volume anterior, retorno a 100% e os três temas.

O diagnóstico diferencia resolução recebida, enviada e da captura (`media-source`, quando
disponível). Em recepção, a limitação de envio só pode ser conferida no cliente emissor.
Se o envio estiver menor que a captura, o painel mostra um aviso sem presumir CPU/banda.
Essa melhoria é informativa: não altera presets nem a adaptação da transmissão.
O painel também mostra meta do encoder, banda estimada da conexão (somente no envio)
e transporte UDP/TCP; os valores vêm de `getStats`, sem presumir capacidade da internet.
Também mostra quem codifica/decodifica (`encoderImplementation`/`decoderImplementation` e
`powerEfficientEncoder`/`Decoder`): "Placa de vídeo" ou "Processador".

**Codec da transmissão (5.0).** `public/video-codec.js` consulta
`navigator.mediaCapabilities.encodingInfo({ type: 'webrtc' })` uma vez por sessão e só prefere
H.264 (`setCodecPreferences`, básico 42e01f com packetization-mode=1 na frente) quando o H.264
é `powerEfficient` (placa de vídeo) e o VP8 não. Sem placa, o H.264 cairia no OpenH264 do
processador e não ganharia do VP8, então fica VP8. Vale pra tela e câmera, em SFU e P2P; a voz
não muda. O SFU registra H.264 (PT 102) além do VP8 (PT 96) e repassa sem recodificar; todo
espectador recebe o codec que o emissor escolheu (Electron e WebView do Android decodificam os
dois). Cliente antigo continua oferecendo VP8 primeiro; SFU antigo responde VP8 ao cliente novo.
Para testar: `localStorage['teletela-codec-video'] = 'h264'` ou `'vp8'` força um deles;
`TEST_SFU=1 TEST_CODEC=h264` no `tests/stream-window-browser.cjs` confere o H.264 chegando.

A oferta inicial de vídeo usa `public/stream-start-bitrate.js` em SFU e P2P para indicar
`x-google-start-bitrate`: metade do teto escolhido, limitada a 2 Mbps para tela e
600 kbps para câmera. Redes identificadas como 3G limitam a dica a 500 kbps; em
2G/slow-2g ela não é aplicada. Áudio, RTX, seções rejeitadas/inativas e de recepção
ficam fora do ajuste. Se o navegador rejeitar a dica e a sinalização continuar estável,
a negociação tenta a oferta original. Nenhum piso de bitrate é imposto; o navegador
continua adaptando e o teto existente permanece. A indicação é aplicada na criação
da conexão, sem temporizador de reinício do estimador. Mudança só no cliente: precisa
de release para o desktop. Testes autorizados depois pelo dono: o Chromium aceitou as
indicações de 600 kbps na câmera e 2 Mbps na tela, sem recorrer à oferta alternativa.
Com fonte sintética 1080p60 e SFU local recompilado, primeiro quadro em 700 ms e
1920 × 1080 recebidos após 2,5 s; em P2P, 454 ms e 640 × 360 após 2,5 s. São medições
locais de uma execução, sem comparação antes/depois e sem simular a rede dos amigos;
não comprovam a correção do atraso relatado. Uma execução P2P teve timeout na ocultação
dos controles do popup; passou na repetição, sem causa confirmada. Testes gerais (62),
áudio/câmera/WebRTC (36) e bitrate/diagnóstico (8, incluindo duas regressões já contadas
nos 36) passaram. Ver `tests/stream-start-bitrate.test.js`,
`tests/transmission-diagnostics.test.js` e `tests/stream-window-browser.cjs`.

## 3. Organização das pastas

```
server.js                  Servidor da sala (Express + Socket.IO).
permission-store.js        Identidade persistente, propriedade, cargos e regras dos canais sem conta.
sfu/main.go                SFU em Go (Pion). Compilado no deploy.
go.mod, go.sum             Dependências do SFU.

public/                    A interface (vai dentro do app E é servida pelo server.js)
  index.html               Toda a estrutura da tela, modais e o popup de novidades
  app.js                   Toda a lógica do cliente (~6400 linhas, dividido em seções numeradas)
  permissions.js           Cargos, propriedade e configurações de voz/texto por pessoa/cargo
  profile-identity.js       Chave local Ed25519 e prova de identidade no handshake
  mobile-pip.js            Seleção de vídeo e apresentação compacta do PiP Android
  audio-manager.js         Mixer de volume, ensurdecer, captura de áudio, VAD por temporizador (independe dos quadros da janela)
  microphone.js            Envio mono, reforço nativo, ganho manual e proteção de picos (teste)
  mobile.css, mobile.js    Layout por toque e integração com o APK Android
  style.css                Estilos base + temas (escuro / preto / claro)
  redesign.css             O visual 3.0 (vale com <html data-look="novo">, fixo no index.html)
  icon.png                 Ícone (favicon, logo da barra de cima, janela)
  sounds/amigo-1..9.ogg    Áudios de entrar/sair gravados pelos amigos. FORA DO GIT (veja §13)
  sounds/microfone-*.ogg   Avisos locais de mutar/desmutar (também fora do git)
  sounds/audio-*.ogg       Avisos locais de desativar/restaurar o áudio (fora do git)
  sounds/controle-alternativo-*.ogg  Segunda dupla de avisos, compartilhada entre mic/áudio
  vendor/emoji-picker/     Seletor de emojis (emoji-picker-element, copiado; ver README.txt dele)
  vendor/noise-suppressor/ RNNoise, WASM local e licenças

electron/
  main.cjs                 Processo principal: janela, tela inicial e prévia de amigos,
                           captura de tela/áudio, atalhos globais, auto-update, preferências
  game-activity.cjs         Catálogo de jogos, leitura local dos processos e tempo da atividade
  preferences.cjs          Preferências atômicas e cópia independente da identidade
  preload.cjs              Ponte segura (window.electronAPI) entre a página e o main
  app-protocol.cjs         Protocolo telinha://app que serve public/ empacotado
  connect.html             Tela inicial (sala principal, amigos e outro endereço)
  connect.css / connect.js  Visual e interação da abertura
  launcher-preview.cjs      Consulta autenticada de amigos, sem anunciar presença
  bin/                     telinha-audio.exe compilado (FORA DO GIT, gerado no build)

native/win-audio/          Auxiliar do Windows que captura o som de UM programa só (C++)
android/                  APK Android (WebView local, permissões e serviço da call)
scripts/build-android.sh  Gera somente o APK de teste, sem publicar nem alterar a VM
build/                     Ícone do app pro electron-builder (icon.svg é a fonte; png/ico gerados)
deploy/oracle/
  deploy.sh                Roda no SEU PC: backup, compila, empacota, manda pra VM e chama o install
  config.sh                IP da VM, domínio e chave SSH (os outros scripts leem daqui)
  backup.sh / restore.sh   npm run backup / npm run restore (dados da sala ↔ ~/Teletela-backups)
  backup-auto.sh           npm run backup:auto (timer diário no seu PC)
  install.sh               Roda NA VM: instala Node/Caddy, serviços systemd, firewall, segredos

tests/
  runner.js                Runner próprio (npm test): 62 testes em 4 "tiers" (unit/mocks)
  m1-*.test.js ...         Testes de servidor/áudio com node:test
  m4-channels-admin.test.js  Teste de integração grande: sobe o server.js de verdade
  helpers/, e2e/           Utilitários e cenários do runner

README.md                  Curto: o que é, download, instalar, problemas comuns e anotações de dev
LEIA-ME-AMIGOS.txt         Guia curtinho pros amigos
docs/PROJETO.md            Este arquivo
docs/RECUPERAR-SERVIDOR.md Passo a passo pra recriar a sala se a VM sumir
AGENTS.md / CLAUDE.md      Guia rápido pra agentes de IA
telinha.desktop            Atalho de menu pro Linux
```

## 4. Rodar no seu PC

Pré-requisitos: Node 20.11+ (o projeto usa Node 26 no PC do dono), **Electron instalado no
sistema** (o `npm run app` usa o `electron` do sistema; não há Electron em `node_modules`),
e Go (só pra mexer no SFU; está em `~/.local/go/bin` no PC do dono).

```bash
npm install
npm run app        # abre o app desktop (usa o Electron do sistema)
npm start          # só o servidor, em http://localhost:8080 (abra no navegador)
npm run dev        # servidor reiniciando ao salvar o server.js
npm run sfu        # SFU local (go run ./sfu), raramente necessário
```

Variáveis de ambiente do `server.js`:

| Variável | Pra quê | Padrão |
|---|---|---|
| `PORT` | Porta HTTP | `8080` |
| `TELINHA_DATA_DIR` | Pasta onde ficam canais, histórico de texto, soundboard | vazio = tudo temporário (some ao reiniciar) |
| `ADMIN_KEY` | Antiga chave de admin, mantida apenas para compatibilidade de entrada na sala | vazio = sem esse atalho |
| `OWNER_KEY` | Chave exclusiva para assumir/recuperar a propriedade | vazio = apenas proprietário já vinculado |
| `SFU_SECRET` | Liga o SFU e assina as senhas dele | vazio = sem SFU (P2P) |
| `SFU_PATH` | Caminho do websocket do SFU atrás do Caddy (mandado pro cliente junto com a senha) | `/sfu/ws` |
| `TELINHA_MUSIC` | Liga o bot experimental de música nos canais de voz | desligado; `1` liga |
| `MUSIC_PROXY` | Proxy opcional (ex: `socks5://127.0.0.1:40000`) passado ao `yt-dlp` para contornar bloqueios de IP de datacenter no YouTube | vazio = conexão direta |
| `MUSIC_COOKIES_BASE64` | Sessão opcional de uma conta dedicada do YouTube: arquivo Netscape codificado em base64, guardado somente no `telinha.env` da VM | vazio = sem autenticação |

Exemplo de servidor local completo pra testar admin e dados salvos:

```bash
PORT=3999 OWNER_KEY=segredo-dono TELINHA_DATA_DIR=/tmp/teletela-data node server.js
```

Sem `SFU_SECRET` a transmissão vai P2P, o que é ótimo pra testar no mesmo PC.

O **K7** aparece na call quando o servidor habilita música. O painel em `public/music.js` e `public/index.html` abre na lateral da sala e acompanha o palco em tela cheia. A conversa guarda até 60 mensagens no aparelho enquanto a pessoa estiver no canal. A troca de canal ou desconexão limpa os pedidos locais. As buscas e a fila usam o protocolo de música existente. O avatar compartilhado pela sala e pelo modo cinema fica em `public/k7.svg`.

### Laboratório isolado do bot de música

`npm run music:setup` instala o yt-dlp oficial em `.cache/music-lab/` (fora do git),
conferindo SHA-256. O laboratório exige Python 3.10+, Node 22+ para os desafios JavaScript
do YouTube e FFmpeg. Não modifica dependências nem pacotes do sistema.
Quando chamado dentro do Electron, o extrator deve usar `node` do PATH, nunca
`process.execPath` (que nesse caso abre outro Electron em vez do runtime de console).
`npm run music:lab` abre um Express independente em **127.0.0.1:3998**, sem importar
`server.js`, conectar à VM nem ler dados/perfis da sala. `MUSIC_LAB_PORT` troca a porta;
`MUSIC_YTDLP` pode indicar outro executável yt-dlp já instalado.

`music/source.mjs` (reexportado por `scripts/music-lab/resolver.mjs`) identifica vídeos e faixas Spotify pelo
oEmbed público, busca cinco versões no YouTube e prepara MP3 temporário usando yt-dlp +
FFmpeg; `broadcast.mjs` executa **uma reprodução central** no ritmo real e distribui os
mesmos blocos MP3 por HTTP para todos; `server.mjs` coordena busca, reprodução, parada,
eventos SSE e arquivos temporários. Os clientes só decodificam a transmissão recebida.
O ponto de entrada tardia é o ponto atual do bot, não o começo do arquivo. O volume é local.
O K7 e o laboratório aceitam vídeos gravados de até 90 minutos e 256 MB de áudio de entrada. O laboratório usa
uma preparação de áudio por vez e uma busca por vez. Limpa a faixa ao fechar seu FFmpeg e
o diretório temporário ao encerrar o processo por Ctrl+C/SIGTERM.

**Limites do laboratório HTTP:** oEmbed Spotify só informa o título, sem garantir o artista; mostrar
as versões e permitir ajuste manual evita prometer correspondência exata. Playlists/álbuns
ainda são recusados. Identificar o link ou encontrar uma versão não prova que o áudio
funciona: testar a preparação e a escuta. YouTube pode bloquear downloads, inclusive
dependendo do IP; sucesso no PC não valida a Oracle. HTTP MP3 central permite conferir a
distribuição, mas os buffers dos navegadores podem diferir em segundos. A integração das
calls descrita abaixo já transmite Opus por WebRTC/SFU, com permissões e fila por canal.

`npm run test:music` cobre a distribuição real com FFmpeg, dois ouvintes, entrada tardia,
validação de links, origem local e cancelamento. `npm run test:music:ui` verifica dois
ouvintes Electron, áudio efetivo, volume individual, temas e tela estreita com um tom
gerado localmente. `MUSIC_LAB_REAL=1 npm run test:music:ui` faz o mesmo percurso com uma
faixa Spotify pública e a versão correspondente no YouTube (usa internet).
Andamento e próximos passos: [TESTE-BOT-MUSICA.md](TESTE-BOT-MUSICA.md).

### Bot experimental nas calls (teste local)

`npm run music:build` compila `cmd/music-publisher/` e o SFU para `.cache/music-lab/`.
`npm run music:call` inicia o servidor normal só em **127.0.0.1:3999**, com música habilitada,
dados/credenciais temporários e WebRTC direto. `npm run music:call:sfu` também sobe um SFU
isolado em portas livres, com segredo novo e ICE local. Nenhum dos comandos acessa a VM.
`MUSIC_CALL_PORT` troca a porta da sala. O SFU aceita `SFU_HOST` para limitar seu endereço
HTTP de escuta; o padrão de produção continua igual. Os comandos de teste usam `127.0.0.1`.

`music/manager.mjs` mantém uma fila em memória por canal (até 150 pedidos, até quatro canais
ativos), transmite uma faixa por vez, pré-carrega a próxima, descarta faixas que falham e avança após o fim. Parar
limpa a fila; pular preserva os próximos pedidos. Sair da última pessoa cancela preparação,
fecha as conexões do bot e limpa a fila. Faixas são apagadas após seus processos fecharem.
Pausa interrompe só o consumo de música na ponte Go e mantém Opus de silêncio a cada 20 ms.
O encoder não é suspenso por SIGSTOP e os receptores não ficam sem relógio RTP ao pausar.

`music/transport.mjs` executa um FFmpeg por canal para codificar Opus estéreo a 160 kbps,
48 kHz, pacotes de 20 ms. Opus em Ogg segue por TCP no loopback para a ponte Go/Pion.
`audio.go` separa os pacotes pelas tabelas de segmentos Ogg e controla a emissão com relógio
monotônico. Atrasos pulam posições RTP (perda/silêncio), sem enviar rajadas para recuperar
tempo. Pausa e falta de dados usam silêncio Opus, sem consumir a faixa nem acelerar depois.
Com SFU, a ponte
publica como host em `<canal>__musica` pelo protocolo existente: o SFU distribui aos ouvintes.
Sem SFU, a mesma faixa RTP é entregue a uma conexão WebRTC por ouvinte. O navegador nunca
abre um player de YouTube/Spotify; recebe apenas o áudio central do bot.

`prepareStream` resolve e guarda os metadados da fonte em cache por cinco minutos (até 64
entradas). Consultas simultâneas compartilham o trabalho; cancelar um consumidor não cancela
os outros. Após uma busca, a primeira versão pode adiantar a consulta em segundo plano.
Na primeira reprodução, o yt-dlp lê a fonte para stdout e o FFmpeg decodifica a partir do
pipe, sem MP3 intermediário nem espera pelo arquivo inteiro. `available_at` do YouTube é
respeitado: ignorar essa liberação causou 403 no teste com FFmpeg abrindo a URL diretamente.
A próxima faixa da fila pode ser baixada em formato original para evitar outra espera na
troca. Pular durante esse download o cancela e usa streaming. Cada operação tem sua pasta
temporária, removida ao terminar/cancelar. A pausa não pausa o encoder, e fim do encoder
não significa fim da música: a ponte avisa quando tocou todos os pacotes recebidos.
Ao encerrar, aguardar o evento `exit` e destruir os pipes: esperar somente `close` pode
travar se um stdout estiver pausado após o FFmpeg encerrar sua entrada.

Playlists YouTube usam extração plana paginada (`offset` e até 150 itens por página), sem baixar todas
as músicas para listar. Vídeo com `list=` mantém a opção de tocar só o vídeo ou carregar
a playlist explicitamente. Playlists/álbuns Spotify usam somente os dados públicos de
`open.spotify.com/embed/...`; não usam cookies de usuário nem credenciais. O leitor extrai
título/artista/URI de `__NEXT_DATA__`, ignora podcasts/arquivos locais e informa o limite
da leitura pública (listas grandes podem vir incompletas). Não pressupor que esse HTML é
uma API estável: falhas respondem com erro claro. Resolver as versões YouTube é adiado
para a reprodução/pré-carregamento, sem fazer 150 buscas antes de aceitar a lista. A fila aceita reordenação manual (`action: 'move'`) atualizando o pré-carregamento caso a primeira faixa mude.

`music/integration.mjs` registra eventos Socket.IO somente com `TELINHA_MUSIC=1`. Todos
derivam o canal da presença atual do socket; payloads não permitem escolher outro canal.
Buscar, adicionar e controlar exigem permissão de escrita e ausência de mute/deafen de
moderação. A busca guarda escolhas por socket/canal; adicionar exige uma dessas escolhas.
Consultar/assinar exige presença e visibilidade. Sinais usam a geração atual da faixa.
O token SFU de música é só de **viewer**, vinculado à identidade de mídia revogável já usada
pelas calls. O host só é criado pelo servidor; clientes não podem pedir esse papel.

`public/music.js` integra o botão de fone, o modal, a fila e a presença visual do bot, com
alternativa nas opções móveis. O áudio passa por `VolumeMixerManager.attachUserStream`
(`teletela-music-bot`), respeitando volume geral, saída de áudio e ensurdecer. O controle
individual é salvo como `musicVolume` nas preferências. Trocar de canal/desconectar fecha
a recepção. A interface continua escondida quando o backend não anuncia `music: true` em `me`.

Eventos: `music-get` → estado; `music-search` → versões; `music-enqueue` → pedido;
`music-control` (`pause`, `resume`, `skip`, `stop`, `remove`) → fila/reprodução;
`music-state` → atualização só aos membros da call; `music-subscribe`/`music-offer`/
`music-signal` → sinalização no modo direto; `sfu-token` com `kind: 'music'` → acesso pelo SFU.

`music-search` também retorna `playlist` com faixas e `nextOffset` quando o link é uma
coleção. `music-enqueue-playlist` aceita apenas IDs da página carregada pelo socket no
canal atual, com seleção e embaralhamento. A inclusão é atômica: se não couberem todas as
selecionadas, nenhuma entra. `music-control` aceita `shuffle` e `repeat` (`off`, `one`, `all`).
Repetir vale para fim natural; pular/erro não recolocam a faixa no início. Escolhas de
busca e cache da página são descartados ao desconectar.

Validação: `npm run test:music` testa laboratório, fila e autorização; `npm run test:music:call`
usa três janelas Electron, tom gerado, dois ouvintes no mesmo encoder, volume, deafen, pausa,
fila, isolamento e troca de canais. `MUSIC_TEST_SFU=1` repete pelo SFU;
`MUSIC_LAB_REAL=1 MUSIC_TEST_SFU=1` usa uma faixa Spotify real, buscando áudio no YouTube.
O teste mede cadência RTP e amostras alteradas por aceleração/desaceleração no receptor,
confere silêncio com relógio ativo durante a pausa e exercita seleção de playlist/repetição.
`go test -race ./cmd/music-publisher` testa páginas Ogg, pausa sem consumir música e atraso
do processo sem rajadas de recuperação.

O deploy compila a ponte para a arquitetura da VM e instala em
`/opt/telinha/bin/telinha-music-publisher`. Instala Python 3.10+ e FFmpeg/libopus via apt
na Ubuntu antes de parar a sala. Baixa o yt-dlp oficial com SHA-256, versão fixada em
`2026.11.23` (altere com `YTDLP_VERSION`), e instala em `/opt/telinha/bin/yt-dlp`.
Para evitar o bloqueio de IP de nuvem (`Sign in to confirm you're not a bot`) do YouTube na Oracle,
`install.sh` também instala `wireproxy` em `/opt/telinha/bin/wireproxy`, gera uma credencial
Cloudflare WARP em `/opt/telinha/data/warp.conf` (uma vez, modo `0600`) e sobe o serviço
`telinha-warp` (SOCKS5 em `127.0.0.1:40000`, em userspace, sem alterar rotas/interfaces da VM).
O serviço define `MUSIC_PUBLISHER`, `MUSIC_YTDLP`, `MUSIC_PROXY=socks5://127.0.0.1:40000` e
`TELINHA_MUSIC=1`; não altera os segredos da VM. `ENABLE_MUSIC=0` desativa o recurso e dispensa
as ferramentas no deploy. Após 3 falhas seguidas na fila, `music/manager.mjs` interrompe e limpa
o restante da fila para não tentar 50 faixas em cascata.
`MUSIC_ICE_SERVERS` usa o formato Pion: `urls` precisa ser uma lista, mesmo com um único
STUN (`[{"urls":["stun:stun.l.google.com:19302"]}]`). O formato string aceito pelo navegador
causava `invalid ICEServer` na ponte Go; a validação real na Oracle detectou e corrigiu isso.
Em 29/10/2026, o YouTube voltou a pedir confirmação de robô para parte das fontes mesmo
com WARP ativo e o yt-dlp estável atual. Outra faixa entregou áudio na mesma VM; não
tratar como bloqueio universal nem atribuir ao Chromium da interface. Resultados e limites
em [DIAGNOSTICO-BOT-MUSICA.md](DIAGNOSTICO-BOT-MUSICA.md).
Nos testes posteriores, Firefox real e PO Tokens não resolveram a fonte bloqueada pelo
WARP. A ponte pelo PC entregou áudio, mas foi descartada pelo dono por depender dele ligado.
Uma sessão WARP nova entregou áudio inicialmente, mas voltou a falhar depois da ativação
autorizada e no controle isolado. A configuração anterior foi restaurada; somente WARP
foi reiniciado e o registro novo foi revogado. Renovar WARP não é uma correção validada.
O dono escolheu e autenticou uma conta Google separada num perfil exclusivo, sem acessar
o navegador pessoal. A sessão permitiu obter e decodificar as duas fontes e buscar cinco
resultados na Oracle, com o túnel do PC já encerrado. Com autorização, `music/source.mjs`
e o ambiente da VM foram atualizados em 29/10/2026, às 20:46 UTC; reiniciado somente Node.
A validação do código instalado com o ambiente do processo oficial confirmou busca e áudio;
saúde pública OK e clientes reconectados. SFU/WARP não foram reiniciados nessa ativação.

`MUSIC_COOKIES_BASE64` contém o arquivo Netscape da conta dedicada codificado em base64
(não é criptografia). O segredo persistente fica somente em `/etc/telinha/telinha.env`.
Cada execução do yt-dlp recebe um arquivo temporário `0600` em diretório `0700`, removido
ao encerrar o processo, inclusive em falha/cancelamento normais. Não passam cookies nos
argumentos, na interface nem em logs. O cache de fontes separa sessões por hash, além da
URL/busca/proxy. Sem a variável, permanece a extração anônima. Não usar cookies de conta
pessoal ou de outros sites; não reabrir a sessão exportada no navegador. Um encerramento
forçado do Node pode deixar cópias em `/tmp`; removê-las como operador com o bot parado.
Quando a sessão expirar, renovar via login manual e atualizar a variável com reinício
autorizado do servidor. Não há garantia contra novos bloqueios ou restrições da conta.
Em 13/11/2026, o dono relatou 403 em todas as músicas. A leitura isolada de uma música
falhou com o ambiente oficial, mesmo com extração fresca e serviços ativos; um vídeo
curto de controle entregou bytes. HLS não ofereceu formato e o acesso anônimo exigiu
confirmação de robô. O dono renovou o login em perfil Firefox exclusivo, mas a candidata
também retornou 403, inclusive sem WARP e em AAC/M4A; não foi aplicada. Perfil e cópias
temporárias removidos, serviços/configuração oficiais preservados. Após a pesquisa e
autorização para seguir só com alternativas gratuitas, excluir `web_embedded` resolveu
a leitura em processos isolados. A candidata de `music/source.mjs` usa
`youtube:player_client=default,-web_embedded` na extração e no download. Duas músicas
entregaram cinco segundos de áudio via `prepareStream` → `startMusicDownload` → FFmpeg,
com a conta/WARP atuais e sem instalar provedores. **Aplicada com autorização do dono
em 13/11/2026 às 22:14 de Brasília**, copiando somente esse módulo e reiniciando apenas
Node. Backup completo prévio e cópia da fonte anterior preservados. Código instalado
repetiu a obtenção/decodificação sem 403; saúde pública OK e quatro clientes reconectados.
Credenciais, SFU e WARP preservados; escuta na call ainda depende do grupo. Sem release
desktop ou publicação das outras mudanças locais. Detalhes em
[DIAGNOSTICO-BOT-MUSICA.md](DIAGNOSTICO-BOT-MUSICA.md).
Servidores locais de desenvolvimento continuam com música desativada por padrão; as ferramentas
nativas não vão dentro dos instaladores desktop.

## 5. Testes

```bash
npm test                                   # runner próprio: 62 testes, devem passar todos
node --test tests/m1-*.test.js tests/m2-*.test.js tests/m3-*.test.js
node tests/m4-channels-admin.test.js       # integração: sobe o server.js de verdade
node --test tests/m4-permissions.test.js tests/identity-persistence.test.js # propriedade, hierarquia, texto/voz privados, provas e persistência
node --test tests/identity-upgrade.test.js # Electron real: dados da 3.7 → código novo, URL diferente e recuperação de prefs
npm run test:permissions                  # formulários reais de cargos/acesso, móvel e desktop
/usr/lib/electron42/electron tests/ownership-browser.cjs # regressão: interface nova contra servidor 3.7 real
npm run test:mobile                       # navegação, chat, mute e tamanhos móvel/desktop
npm run test:microphone                   # áudio real: nível, Opus/mixer, mute e comparação com 3.7.0
npm run test:microphone:ui                # controles reais, três temas e avatares durante a fala
go test -race ./sfu                       # SFU: erro de espectador não interrompe os demais
```

- Todos os testes têm que passar. (O `M2.3` falhou por muito tempo porque esperava o AGC do
  microfone ligado; ele foi desligado de propósito e o teste foi corrigido na 3.2.)
- O `m4` cobre: canais salvos, apagar canal, admin (login, tirar da call, mutar/ensurdecer pra
  todos, mover de call), cor do nome, GIF de perfil, várias telas, imagens no chat, canais de
  texto (inclusive sobrevivendo a reinício), perfil 3.0 (banner, moldura, som de entrada),
  responder/editar/apagar/reagir, soundboard, fixar, "digitando" e senha da sala (com chave
  de membro), enquadramento de foto/banner (inclusive validação e preservação do GIF) e
  resposta de ping e atividade de jogos (validação, estado, chegada tardia, encerramento e
  desconexão). O `m3-image-crop` confere a geometria e os limites do recorte; o
  `m3-game-activity` cobre Windows/Linux/Proton, Minecraft, jogos manuais e o relógio.
  **Quando mexer no servidor, acrescente um caso
  lá.**
- Pra conferir a interface sem abrir o app na mão, o jeito usado até agora foi um script
  Electron "headless" (janelas `offscreen: true`) com dois ou três clientes conectados num
  servidor local, simulando cliques com `executeJavaScript` e tirando prints com
  `capturePage()`. Esses scripts não ficam no repositório.

## 6. Publicar uma versão (release)

**Janela de lançamento.** Cada aprovação do dono vale para uma versão específica.
Prepare e teste essa versão com antecedência. Ao agendar, use o fuso `America/Sao_Paulo`
e programe as tentativas das 03h00 às 03h50, a cada 10 minutos. Preserve o commit e os
artefatos aprovados se o lançamento passar para outra noite.

Antes de iniciar a publicação e imediatamente antes de um deploy que reinicie o serviço,
confira se todos os canais de voz estão vazios, inclusive os privados. Em `/api/health`,
`status: ok` com `totalUsers: 0` confirma que ninguém está conectado. Um valor positivo
inclui quem só está lendo o chat. O servidor com ligações privadas também informa o booleano agregado `voiceOccupied`, que considera os canais de voz, os convites de ligação em andamento e as ligações atendidas. Nesse caso, use a ocupação completa de voz se disponível.
Se houver alguém em call ou faltar confirmação, aguarde a próxima tentativa. A partir das
04h, retome as etapas pendentes na próxima madrugada. Faça o backup antes do deploy e
confira a saúde da sala antes de publicar os instaladores.

O timer `teletela-madrugada.timer` roda no Ubuntu da VM mesmo com o PC desligado.
Sem pedido em `/var/lib/teletela-agenda/pendente`, o systemd pula o serviço. Para
reinstalar o timer após recuperar a VM, use `bash deploy/oracle/madrugada/instalar.sh`.
Os comandos manuais de deploy e release continuam tendo efeito imediato.

**Preparação de uma versão aprovada.** Faça o commit da versão e, para publicar o
cliente, envie esse commit ao repositório. Gere os instaladores com os sons locais
em uma pasta de saída limpa (`npm run dist -- --publish never`, confira também
os dois arquivos de atualização). Crie um release **draft** com a tag da versão,
o SHA completo como alvo (`gh release create "$tag" --draft --target "$commit"`)
e envie os artefatos para ele com `gh release upload`. Confira a lista abaixo.
O primeiro agendamento de cliente exige um token fine-grained de **Castzzz/Teletela**
com **Contents → Read and write**. Rode `bash deploy/oracle/madrugada/credencial.sh`
para digitá-lo no terminal. A credencial fica na VM, legível apenas por root.

Com o commit aprovado no PC, execute `bash deploy/oracle/madrugada/agendar.sh app`,
`servidor` ou `ambos` conforme o escopo aprovado. O comando confere os arquivos do
rascunho e guarda seus identificadores e hashes. Para servidor, compila e envia o
pacote antes de armar a fila. Depois da confirmação o PC pode ser desligado. Há um
pedido por vez. O timer local pode ser consultado por SSH com
`systemctl list-timers teletela-madrugada.timer`; as tentativas ficam no journal de
`teletela-madrugada.service`. A agenda de servidor troca apenas a aplicação e os
binários sobre a instalação existente. Mudanças de infraestrutura ou das unidades
do sistema precisam do procedimento de instalação correspondente.

O pacote do servidor usa a lista explícita de módulos em `deploy/oracle/deploy.sh`. Inclua os módulos importados mesmo quando a atividade estiver desligada: o Node resolve os imports ao iniciar.

A VM faz backup de dados e segredos antes do deploy, confere ocupação novamente
antes do reinício e verifica os serviços e a saúde por HTTP local e HTTPS público.
Se a verificação falhar, repõe os arquivos anteriores. Depois do sucesso conserva
o backup mais recente em `/var/lib/teletela-agenda/ultimo-backup.tar.gz`. O backup
externo do PC continua independente. Com `ambos`, o cliente só é publicado depois
da confirmação do servidor. Uma tentativa que não consiga publicar mantém o rascunho
e retoma a etapa pendente na janela seguinte.

**Flatpak experimental:** `npm run dist:flatpak` usa `scripts/build-flatpak.sh`
e `build.flatpak` no `package.json`, sem publicar. Exige `flatpak`, `flatpak-builder`
e o remoto Flathub do usuário; o empacotador instala runtime/SDK/BaseApp 25.08.
O destino continua `com.castzin.telinha` e gera `dist/Teletela.flatpak`, separado dos
alvos padrão AppImage/tar.gz e do comando de release. Para publicar, gere também esse
bundle na versão nova e anexe `Teletela.flatpak` à release do GitHub. As permissões incluem rede,
PulseAudio, Wayland/X11, GPU, notificações e Downloads, sem acesso geral ao diretório pessoal.
Geração, instalação por bundle, abertura no Wayland, conexão e entrada mutada no canal
foram validadas na 4.3.3. Conferir especialmente portais de captura, `pactl`, jogos,
atalhos e autostart antes de distribuir. O updater atual só atende AppImage/Setup;
um bundle local precisa ser reinstalado para atualizar, até haver repositório próprio.


Uma versão nova é o que faz os apps da galera atualizarem sozinhos.

1. Aumente o `version` no `package.json` (ex: `3.1.0` → `3.2.0`). **Sem isso ninguém recebe.**
2. Atualize o popup de novidades:
   - `WHATS_NEW_VERSION` em `public/app.js` (ex: `'3.2'`);
   - o texto em `#modal-whats-new` no `public/index.html`: a lista de cima é a versão nova; a
     anterior vira um bloco `<div id="whats-new-3-1" class="whats-new-older hidden">`;
   - inclua o identificador da versão anterior na lista de `openWhatsNew()` (`app.js`),
     que compara os componentes da versão para mostrar só as novidades ainda não vistas.
3. Commit (veja [Convenções](#12-convenções): **nunca** adicione `public/sounds/`).
4. Na tentativa autorizada pela janela acima, execute `npm run release`. Para preparar os instaladores antes, use `npm run dist -- --publish never`.

O `release` compila o `telinha-audio.exe` (precisa do `mingw-w64-gcc`), gera AppImage,
tar.gz, instalador e portátil do Windows, e publica no GitHub Releases usando o login do
`gh` (`gh auth token`). Leva uns 3 a 5 minutos. O release já sai publicado (não fica rascunho).

Confira:

```bash
gh release view v3.2.0 --json isDraft,assets -q '{draft: .isDraft, assets: [.assets[].name]}'
```

Precisa ter: `latest.yml`, `latest-linux.yml`, `Teletela-Setup.exe`(+`.blockmap`),
`Teletela-Portatil.exe`, `Teletela.AppImage`, `Teletela.tar.gz`.

Depois, se quiser, `git push` (o release não depende do push, mas o código no GitHub fica
atrás se esquecer).

### Quando precisa de release e quando de deploy

| Mudou | Release | Deploy |
|---|---|---|
| `public/` (interface) | **sim** | sim (pra quem usa pelo navegador) |
| `server.js` | não | **sim** |
| `permission-store.js` | **sim** (incluído no pacote desktop) | **sim** |
| `sfu/` | não | **sim** |
| `electron/`, `build/`, `package.json` (build) | **sim** | não |
| `android/` | APK Android separado (`npm run build:android`) | não |
| `deploy/oracle/install.sh` | não | **sim** |

Se mudou o protocolo entre os dois (evento novo), normalmente são os dois. O servidor novo
tem que continuar funcionando com o app antigo até todo mundo atualizar.

O APK também embute `public/`: gere outro APK para levar mudanças da interface ao Android.
O build de Android não executa o release desktop nem publica o APK. Os identificadores,
artefatos e atualização automática do desktop continuam independentes.

## 7. Atualizar o servidor (deploy)

```bash
npm run deploy:oracle
```

O que o `deploy/oracle/deploy.sh` faz, no seu PC:

1. Detecta a arquitetura da VM pelo SSH e compila o SFU e a ponte de música para `linux/amd64` ou `linux/arm64`.
2. Empacota `server.js`, `permission-store.js`, `package.json`, `package-lock.json`, `public/` e `music/` com
   `npm ci --omit=dev` (sem as dependências do app desktop).
3. Descobre a versão LTS mais nova do Node e a mais nova do Caddy (ou usa `NODE_VERSION` e
   `CADDY_VERSION`, se definidos).
4. Manda tudo por `scp` pra VM e roda o `install.sh` lá com `sudo`.

No fim ele mostra o endereço. A senha de admin continua em `/etc/telinha/telinha.env`, sem
ser exibida nos logs do deploy.

Precisa de:

- A chave SSH `~/.ssh/oracle_telinha_ampere`, que só existe no PC do dono. Sem ela não tem deploy.
- Go instalado. O script procura no PATH e, se não achar, em `~/.local/go/bin/go`.
- IP da VM, domínio e chave ficam em `deploy/oracle/config.sh` (dá pra sobrescrever com
  `VM=...`, `DOMAIN=...`, `SSH_KEY=...` na linha de comando).
- `DUCKDNS_TOKEN=xxxx`, só na primeira vez ou pra trocar o token.
- `ACTIVATE_DUCKDNS=0` no deploy **e** restore permite preparar uma VM sem mudar o domínio.
  Para uma troca planejada, siga [MIGRAR-SERVIDOR.md](MIGRAR-SERVIDOR.md).

**O deploy reinicia o servidor.** Isso derruba todo mundo por uns segundos (o app reconecta
sozinho) e perde o que só existe na memória (veja [§9](#9-dados-guardados)).

## 8. O servidor na nuvem (VM da Oracle)

- **VM:** Oracle Cloud Ampere `VM.Standard.A1.Flex`, 2 CPUs ARM64, 12 GB de RAM, disco de
  100 GB, Ubuntu 26.04 LTS, região São Paulo. IP `144.22.225.236`, usuário `ubuntu`.
  Domínio DuckDNS (`colheitafartus.duckdns.org`), com timer que atualiza o IP a cada 30 min.
- O instalador usa binários oficiais de Node e Caddy com hash conferido e detecta ARM64 ou
  x86_64. No Ubuntu da Oracle, acrescenta regras de iptables antes do REJECT e salva com
  `netfilter-persistent`, preservando as regras existentes; também suporta ufw ativo e firewalld.
- **VM antiga:** `opc@163.176.189.41`, Oracle Linux 9, x86_64, 1 GB de RAM. Não rode `dnf`
  nela: trava por falta de memória. Depois da migração, Node/SFU e DuckDNS ficam desativados;
  o Caddy encaminha para a nova VM enquanto houver clientes com DNS antigo em cache.

Serviços (systemd):

| Serviço | O quê | Porta | Limite de RAM |
|---|---|---|---|
| `telinha-server` | `node server.js` | 8080 | 3 GB (`--max-old-space-size=2048`) |
| `telinha-sfu` | `/opt/telinha/bin/telinha-sfu` | 8081 + mídia 50000 UDP/TCP | 2 GB |
| `telinha-warp` | `/opt/telinha/bin/wireproxy -c /opt/telinha/data/warp.conf` (proxy SOCKS5 local pro `yt-dlp`) | `127.0.0.1:40000` | 64 MB |
| `caddy` | HTTPS, `/sfu/*` → 8081, resto → 8080 | 80/443 | 150 MB |
| `duckdns.timer` | atualiza o IP no DuckDNS | | |
| `telinha-keepalive.timer` | a cada 2 h, gasta meio núcleo por 20 min (só CPU, prioridade mínima) pra VM não ser "recuperada" pela Oracle por ficar parada. Desliga com `sudo touch /etc/telinha/keepalive.off` | | 16 MB |

Em máquinas com até 4 GB de RAM, o instalador mantém os limites menores: Node com heap de
192 MB e serviço de 300 MB, SFU com 200 MB.

Caminhos na VM:

| Caminho | O quê |
|---|---|
| `/opt/telinha/app/` | o servidor (apagado e recriado a cada deploy) |
| `/opt/telinha/data/` | **dados que ficam** (canais, texto, soundboard) |
| `/opt/telinha/bin/telinha-sfu` | SFU compilado |
| `/opt/telinha/node/` | Node |
| `/etc/telinha/telinha.env` | `SFU_SECRET`, `OWNER_KEY` e `ADMIN_KEY` legado (gerados uma vez, só ficam aqui) |
| `/etc/telinha/duckdns.env` | token do DuckDNS |
| `/etc/caddy/Caddyfile` | proxy |

Comandos úteis (pelo SSH):

```bash
ssh -i ~/.ssh/oracle_telinha_ampere ubuntu@144.22.225.236
sudo systemctl status telinha-server telinha-sfu caddy
sudo journalctl -u telinha-server -n 100 --no-pager      # logs do servidor
sudo journalctl -u telinha-sfu -f                        # logs do SFU ao vivo
sudo systemctl restart telinha-server
```

**Chave de propriedade/recuperação (`OWNER_KEY`):** fica em `/etc/telinha/telinha.env` e não aparece nos logs do deploy. Pra
trocar: apague a linha `OWNER_KEY` desse arquivo e rode o deploy. **Ela nunca vai pro git.**

## 9. Dados guardados

**Salvos em disco** (`TELINHA_DATA_DIR`, na VM `/opt/telinha/data`):

| Arquivo | O quê |
|---|---|
| `channels.json` | `{ channels, textChannels, defaultSettings, deletedDefaultChannels }`: canais de voz/texto, regras de acesso/escrita, configurações do Geral inicial e registro da exclusão de canais iniciais |
| `text/<canal>.jsonl` | histórico de cada canal de texto (veja abaixo) |
| `text/images/` | imagens/GIFs dos canais de texto (15 MB por envio, até 15 GB no total) |
| `text/files/` | vídeos e arquivos dos canais de texto (20 MB por envio, até 5 GB no total) |
| `soundboard/index.json` + arquivos | sons do soundboard (16 por pessoa, até 1 MB, 300 no total) |
| `room.json` | senha da sala (só o hash scrypt) e o segredo das chaves de membro |
| `member-avatars/<memberId>.json` | última foto/GIF, recorte, perfil público e versão por identidade; arquivo atômico, até 15 MB por arquivo/256 MB no conjunto; entra no backup |
| `conversas/anexos/` | mídia das DMs. Até 15 MB por imagem e 20 MB por arquivo. A cota compartilhada de 5 GB recusa novos anexos quando cheia e preserva os anteriores. |
| `accounts.json` | contas opcionais, accessId original, perfil completo, scrypt e hashes dos códigos/tokens; arquivo atômico 0600, falha fechada se ilegível |
| `fichas.json` | carteira de fichas virtuais por `accessId` (nome, saldo; o campo antigo `semana` é ignorado); vale pra todas as atividades; arquivo atômico 0600 |
| `cassino.json` | Seu cassino: `temporada` global (`numero`, `inicio`, `fim`) e o estado de cada conta em `jogadores` (com `fimTemporada` da última que acabou); arquivo atômico 0600 |
| (poker) | nada em disco: mesas em memória; as fichas já estão na carteira, só o pote da mão em andamento some num reinício |
| `apostas.json` | aposta ativa (ou o último resultado, por 15 min) de cada canal de voz, com os palpites; arquivo atômico 0600, recarregado no início pra um reinício não sumir com fichas |
| `dice.json` | últimas 30 rolagens gerais do servidor (formato v2); autor, horário, dados individuais, modificador e total; arquivo atômico 0600 |
| `permissions.json` | segredo HMAC, dono (`ownerId`), cargos, nomes, vínculos e hash das chaves públicas; acesso 0600 |
| `chat-images/` | imagens/GIFs da call (15 MB por envio, até 2 GB; **apagadas a cada reinício**) |
| `chat-files/` | vídeos e arquivos da call (20 MB por envio, até 1 GB; **apagados a cada reinício**) |

Nos canais, os limites de espaço removem os arquivos mais antigos, mantendo o histórico da mensagem;
o download de um arquivo removido responde 404. Apagar uma mensagem com anexo ou o canal de
texto também remove o arquivo correspondente. Anexos dos canais de texto entram no backup;
mídias da call ficam de fora.

Nas conversas entre amigos, `dm-send-file` grava o arquivo e associa o nome, tipo,
tamanho e identificador à mensagem da dupla. O histórico de texto anterior continua
legível. A rota `/api/dm-file/:file` exige a chave de mídia de um socket conectado,
sessão válida de um participante e amizade aceita, inclusive nas requisições Range.
O cliente reconhece o suporte pelo campo `dmFiles` de `room-info`.

Eventos `text-file` (canal de texto, funciona sem call) e `chat-file` (somente dentro da call)
recebem `{ data: Buffer, mime, name, text?, replyTo?, channelId? }`. A mensagem guarda
`attachment: { url, name, mime, size }` junto com os campos habituais. O servidor valida
tamanho, nome e assinatura de MP4/WebM; outros arquivos são servidos como download em
`application/octet-stream`, com `nosniff`. Rotas `/api/text-file/:file` e
`/api/chat-file/:file` só aceitam UUID gerado no servidor, nunca caminhos do cliente. Vídeos
aceitam Range para o player. Os eventos antigos de imagem continuam compatíveis.

Sons dos controles são locais: `playControlSound` usa gravações privadas e sai
pelo `outputGain`, seguindo o volume geral e permitindo ouvir o aviso mesmo ao ensurdecer.
Só ações nos botões/atalhos tocam esses sons; entrar na call e moderação não os disparam.
Entrar/sair da call e alternar microfone/áudio não exibem toast: o estado aparece nos ícones.
Toasts de erro e moderação continuam ativos.
`prefs.controlSounds` permite desligá-los. Trocar de aviso interrompe o anterior para evitar
sobreposição. A reprodução não envia evento de som para os outros usuários.
`prefs.controlSoundSet` escolhe `originais` (padrão, quatro sons) ou `alternativos` (a nova
dupla, com o mesmo mutar/desmutar para mic e deafen). Mudar de opção cancela o som atual e
qualquer decodificação pendente; a escolha fica salva por perfil, sem mudar áudio de terceiros.

Formato do `text/<canal>.jsonl`: uma linha por mensagem. Editar, apagar e reagir **não
reescrevem** o arquivo: viram uma linha nova com `op` (`{"op":"edit",...}`,
`{"op":"delete",...}`, `{"op":"reactions",...}`) que é aplicada na leitura
(`readTextMessages`). A cada 1000 ops, ou passando de 50 mil mensagens (fica com 90%), o
arquivo é reescrito limpo. As últimas 100 mensagens de cada canal ficam na memória.

Mensagem fixada também é uma op (`{"op":"pin",...}`), guardada no campo `pinned: { by, at }`.

**Backup:** `npm run backup` (`deploy/oracle/backup.sh`) baixa essa pasta (menos `chat-images/` e `chat-files/`)
e o `/etc/telinha` da VM (senha de admin, segredo do SFU, token do DuckDNS) pra
`~/Teletela-backups` no seu PC e guarda os 15 mais novos. `npm run backup:auto` liga um timer
do systemd do seu usuário que faz isso uma vez por dia (`-- off` desliga). **Se a VM sumir:
[docs/RECUPERAR-SERVIDOR.md](RECUPERAR-SERVIDOR.md).** O deploy faz um backup antes de
mexer na VM (pule com `SKIP_BACKUP=1`). Pra voltar: `npm run restore -- <arquivo.tar.gz>`
(`deploy/oracle/restore.sh` pede confirmação, faz backup do estado atual, para o servidor,
troca a pasta e sobe de novo).

**Só na memória** (somem quando o servidor reinicia):

- o chat da call (últimas 50 mensagens por canal);
- quem está mutado/ensurdecido pelo admin;
- foto, banner e som de entrada de cada pessoa (cada app manda de novo quando conecta);
- atividade de jogo (`activity: { id, name, startedAt }` ou `null`), reenviada pelo app ao reconectar;
- canais de voz criados por link (temporários).

**No PC de cada um** (preferências): no app desktop, um arquivo JSON na pasta de dados do
Electron, lido e gravado pelo `main.cjs` (`prefs-get`/`prefs-set`). A pasta continua sendo a
antiga, **"Telinha"**, de propósito, pra ninguém perder perfil e configurações. No navegador
as preferências ficam no `localStorage` (`telinha_prefs`). O perfil (nome, foto, banner, som
de entrada, cor, moldura) fica nas preferências e é mandado pra sala a cada conexão.

A aba **Atividade** salva `shareGameActivity` (padrão ligado) e `customGames`
(`[{ name, executable }]`, até 20 jogos). `get-game-activity` no main consulta os processos
locais a pedido da interface, a cada 15 s, sem bloquear a janela. No Windows usa
[`tasklist /fo csv /nh`](https://learn.microsoft.com/windows-server/administration/windows-commands/tasklist)
e, apenas para Java, PowerShell/CIM para distinguir Minecraft de launchers. No Linux lê
[`/proc/<pid>/exe` e `cmdline`](https://www.kernel.org/doc/html/latest/filesystems/proc.html)
dos processos do próprio usuário; o primeiro argumento permite reconhecer jogos via Proton.
Launchers não entram no catálogo. O cadastro manual compara só o nome exato do executável.
O relógio começa na detecção, preserva o início enquanto o mesmo processo existe e reinicia
ao trocar de processo. Se houver dois jogos, mantém o já exibido até ele fechar.
Só `{ id, name, startedAt }` chega à interface e ao servidor: PID, caminhos e argumentos
ficam no main. Desligar limpa imediatamente a atividade compartilhada e interrompe a consulta.
No navegador a detecção fica indisponível, mas a atividade dos amigos continua visível.

O editor fica em **Configurações → Perfil**. Clicar no próprio nome/foto ou abrir o app
pela primeira vez leva à mesma aba (`openProfileSettings`), com um único `#form-profile`.
Em janelas largas a prévia fica ao lado dos campos; em janelas menores vai para cima.
Salvar e descartar ficam no rodapé fixo das configurações. Trocar de aba mantém o rascunho;
fechar as configurações o descarta. Salvar persiste e mantém a aba aberta.
Todas as abas usam o mesmo cartão (até 1120 × 820 px, limitado à janela), sem mudar
de tamanho ao trocar de tópico. `selectSettingsTab` controla o painel e os botões do rodapé;
`openSettings` inicia uma nova sessão de edição quando necessário. Os dispositivos de
áudio só são consultados ao entrar nas abas Microfone, Som ou Transmissão.

O enquadramento fica nos campos opcionais `avatarCrop` e `bannerCrop` do perfil:
`{ x, y, zoom }`, com posições de 0 a 1 sobre a sobra da imagem e zoom de 1 a 4.
Sem esses campos, usa o centro e zoom 1. `public/image-crop.js` compartilha a normalização
entre cliente e servidor e calcula o recorte do canvas e o estilo da imagem animada.
As imagens paradas novas são reduzidas mantendo a imagem inteira (lado maior de até
1024 px na foto e 1800 px no banner, respeitando os limites de 200 KB/1 MB); os GIFs
continuam nos bytes originais, até 10 MB cada. Assim dá para reenquadrar depois, inclusive
GIFs, sem congelar a animação. Fotos antigas já cortadas só podem ser ajustadas dentro da
área que ainda existe; para recuperar o resto, é preciso escolher o arquivo original.
O recorte também vai em `publicUser`, na exportação/importação e nos estados da sala;
clientes antigos ignoram esses campos e mostram o centro da imagem. Os banners da
prévia, do popup e do perfil grande usam proporção 3:1 para manter o mesmo enquadramento.

Identidade: cada pessoa tem um `profileId` aleatório gerado no primeiro uso e guardado nas
preferências. Dá pra levar pra outro PC com *Exportar/Importar perfil* (no modal do perfil):
o arquivo JSON tem o perfil inteiro, inclusive o `profileId`. É ele que identifica "quem criou o canal", "de quem é a mensagem", reações,
moderação do admin e o volume que você deu pra cada amigo. **Não existe conta nem senha
pessoal.**

### Senha da sala e chave de membro

- O dono ou quem tem `manageServer` define a senha pelo app (`admin-set-room-password`; vazio tira). O servidor guarda
  só o hash (scrypt + sal) em `room.json`.
- Um middleware do Socket.IO (`io.use`) barra a conexão sem uma destas, mandadas no
  `auth` do handshake: `roomPassword`, `adminKey` ou `profileId` + `memberKey`. O erro é
  `room-password` (com `data.reason` `required` ou `wrong`), e o app abre o modal de senha.
- **Chave de membro:** toda conexão aceita recebe `member-key` = HMAC-SHA256(`memberSecret`,
  `profileId`). O app guarda por sala (`prefs.roomAccess[servidor]`). Por isso quem já usou o
  app, ou estava online quando a senha foi colocada, não precisa digitar nada.
- `admin-reset-members` troca o `memberSecret`: quem não estiver online precisa da senha de
  novo (quem está online ganha a chave nova na hora).
- Com senha, `/api/channels` responde 401. As rotas de imagens/arquivos privados também exigem a chave efêmera da conexão e conferem a visibilidade do canal.
- App antigo (antes da 3.2) não sabe pedir senha: **só coloque senha depois que todo mundo
  atualizar**, senão quem estiver desatualizado fica preso.

### Identidade persistente, dono e cargos sem conta

Na 3.8.0, a identidade é vinculada ao perfil e há um único dono do servidor.
Na 3.7.0, o acesso administrativo vinha de uma senha compartilhada.

Cada perfil novo preserva uma semente privada Ed25519 de 32 bytes em
`prefs.profileCredentials[profileId]`. `public/profile-identity.js` gera/salva a chave antes
de conectar. Ela nunca entra em `profilePayload`, listagens ou mensagens. O backup de
perfil v2 inclui `accessIdentity`: é privado e permite usar o mesmo perfil em outro aparelho.
Backups v1, só com `profileId`, não comprovam a identidade e não recuperam cargos.

Antes do handshake, o cliente consulta `GET /api/identity` (CORS liberado, sem cache).
O servidor gera um desafio com expiração de 60 s, nonce e HMAC. O cliente assina
`teletela-profile|host:porta|desafio` e manda `profileProof: { publicKey, challenge, signature }`.
O Node verifica a assinatura e o host da conexão; uma sala não consegue reutilizar a prova
assinada para outro host. A chave privada permanece no aparelho. O hash da chave pública
fica no registro de membro; o UUID desse registro continua sendo usado em cargos e ACLs.

O `permissionToken` HMAC da 3.7.0 ainda é aceito. Na primeira conexão com os dados antigos,
a prova associa a chave pública ao mesmo membro, sem recriar cargos ou alterar as regras.
Depois, a prova assinada recupera o membro mesmo se mudar a URL da sala e o token por URL
não estiver disponível. Essa recuperação exige que o vínculo tenha sido migrado antes.
IDs públicos, nomes e chaves públicas sem assinatura não concedem poderes. Servidores
antigos continuam funcionando pelo token por sala, sem receber a semente privada.
A prova assinada requer WebCrypto Ed25519 (disponível no Electron atual e WebViews recentes);
sem esse suporte, o cliente mantém a identificação pelo token salvo por URL.

A aceleração por hardware fica em `config.json` (mesma pasta, chave
`disableHardwareAcceleration`), não em `prefs.json`: precisa ser lida em `main.cjs` antes do
`ready` (`app.disableHardwareAcceleration()` só vale aí), então mudar pede reiniciar
(`app-relaunch`, só pela interface local). Desligada, o Chromium não codifica na placa e
`video-codec.js` cai pro VP8.

Falhas do app: `main.cjs` grava `falhas.log` (mesma pasta, uma linha JSON por queda, últimas
200) para processo da GPU caído, página caída e página travada, e liga o `crashReporter` só
local (minidumps em `crashDumps`). Página que cai é recarregada (até 3 vezes por minuto, pra
não entrar em loop). Queda da GPU com aceleração ligada marca `gpuCrash` no `config.json`, e
ao reabrir a interface mostra `#modal-gpu-crash` oferecendo desligar a aceleração. **Armadilha:**
tela preta e o app fechando é o processo da GPU caindo várias vezes (o Chromium desiste e
encerra tudo), não bug de página; o registro sai em Configurações → Transmissão → Abrir
registro de falhas (`%APPDATA%\Telinha\falhas.log` no Windows).

No desktop, `electron/preferences.cjs` mantém a pasta **Telinha** e grava `prefs.json` com
arquivo temporário + rename (0600). `identities.json` mantém uma cópia pequena do ID do
perfil, chaves privadas e tokens por sala, independente das fotos/banners. A leitura recupera
a identidade se `prefs.json` estiver ilegível; dados visuais não são recuperados por essa
cópia. No navegador/Android, há também uma cópia da semente em uma chave própria do
localStorage. Apagar os dados do aplicativo remove essa proteção: use o backup de perfil.
A causa exata do relato original não foi reproduzida em uma atualização normal; a gravação
antiga direta e sem cópia era uma fragilidade, não um diagnóstico confirmado.

`permissions.json.ownerId` define um único dono. `owner-claim` com `OWNER_KEY` só assume
propriedade quando ainda não há dono. `ADMIN_KEY` antigo não concede propriedade nem cargos. Após assumir,
a identidade recupera o acesso automaticamente, inclusive em sala com senha. A chave do
servidor continua em `/etc/telinha/telinha.env` e inclui `OWNER_KEY`, usada em `owner-recover` explícito, que
substitui o dono anterior. `owner-transfer` só aceita o dono atual e um membro existente.
O protocolo anuncia `ownershipVersion: 2`. Em servidor 3.7, `permissions-state.owner`
representava admin por senha, não propriedade. O cliente distingue esse caso, mostra um
escudo de admin antigo e nunca inicia reivindicação automaticamente por senha salva.
`publicUser.isOwner` é o campo explícito para a coroa. `admin-login` continua compatível
para reconhecer a identidade que já é dona; a senha antiga não promove outros perfis. `isAdmin` continua no protocolo por compatibilidade, significando
**dono**, nunca um cargo do cliente. Propriedade inválida em disco impede iniciar o servidor.

Cargos têm posição de 1 a 99 e permissões `kickMembers`, `moveMembers`, `muteMembers`,
`deafenMembers`, `manageChannels`, `manageRoles`, `manageServer` e `manageMessages`.
O dono tem todos os poderes. Moderação exige hierarquia maior que a do alvo, inclusive
contra o dono. `manageRoles` só altera cargos abaixo do ator, com poderes que ele já tem;
atribuições não podem alterar o próprio ator nem pessoas de hierarquia igual/maior.
`manageServer` administra senha e chaves de entrada; `manageMessages` modera mensagens
e soundboard. Os cargos ficam no popover/perfil. `displayRoleId` escolhe um cargo para
aparecer junto ao nome, sem alterar as permissões; vazio é o padrão.

### Configurações por canal e privacidade

Voz e texto guardam `description`, `access` e `writeAccess` em `channels.json`. Ambas as
regras usam `{ private, roles: [], members: [] }`. Em `access`, privado libera a visualização
por pessoa OU cargo, com exceção para o dono. `writeAccess` restringe mensagens/anexos
entre quem já tem acesso; não restringe o microfone. Sem restrição, todos com acesso podem
enviar. O Geral permanece público e salva nome, descrição, senha e escrita em
`defaultSettings.geral`. Regras inválidas carregadas do disco falham fechadas.

O botão de configurações fica no fim da linha, depois da lixeira, e aparece no hover,
foco pelo teclado ou canal ativo. O botão de configurações em cada canal usa `get-channel-settings` / `channel-settings`.
`manageChannels` exige que o ator veja o canal. A alteração valida todos os campos antes
de salvar; uma falha de gravação restaura as configurações anteriores. Senhas de voz são
scrypt com sal, não são retornadas pelo editor e continuam obrigatórias para todos.
Os eventos `get-channel-access` / `channel-access` continuam disponíveis para a 3.7.

Listas Socket.IO são individuais para voz e texto. Histórico, fixadas, edição, reações,
mensagens, anexos e digitação de texto verificam o acesso no servidor. REST público só
mostra voz pública. Cada conexão recebe `assetKey` efêmera em `room-info`; o cliente a usa
nas URLs de imagens/arquivos. O servidor mantém índice de anexo → canal (reconstruído do
histórico ao iniciar) e verifica o acesso atual em todo download privado. URLs privadas
sem chave válida respondem 404; mídia usa `Cache-Control: private, no-store`. Revogar o
acesso bloqueia novos downloads imediatamente, sem conseguir apagar cópias já recebidas.
O cliente fecha o texto revogado e descarta seu histórico em memória.

Mudar acesso, cargo ou propriedade reavalia a call atual. Quem perdeu acesso sai, recebe
`kicked` e deixa de obter sinalização ou tokens de mídia. Cada entrada tem um `mediaId`
aleatório. O Node chama `POST /revoke` no SFU (Bearer `SFU_SECRET`) para fechar conexões
WebSockets/WebRTC desse ID e impedir reutilização de tokens válidos. O token revogável é
`mediaId.assinatura`, com HMAC de `sala|role|exp|mediaId`. A próxima entrada usa outro ID.
`SFU_INTERNAL_URL` configura o endereço interno; padrão `http://127.0.0.1:8081`.
A revisão atual não muda o protocolo do SFU da 3.7.0.

Sem `TELINHA_DATA_DIR`, identidade, dono e cargos vivem só no processo. O backup do servidor
copia toda a pasta de dados, incluindo `permissions.json` e o índice dos canais. A revisão
requer o aplicativo e o Node da 3.8.0. O deploy pode vincular o proprietário antes da primeira conexão, conforme a migração abaixo.

## 10. Protocolo: eventos do Socket.IO

### Atividade 21 (5.0 em desenvolvimento)

Cada canal de voz comporta uma mesa em memória. O módulo `vinte-e-um.js` mantém o baralho e calcula os resultados. O evento `jogar-21` consulta ou altera a mesa do canal atual. O evento `mesa-21` envia a cada membro do canal sua visão da rodada. Só o próprio jogador recebe os valores da sua mão até o resultado, e a banca mostra uma carta. Depois do resultado a mesa espera `tempoDoResultado` (as compras da banca, que a tela anima antes do placar, mais `PAUSA_RESULTADO` de 5 s; timer pelo `relogio` injetável) e volta sozinha pra `espera` sem cartas, pote nem pilhas; só nessa fase se aposta (`iniciar`/`cancelar` exigem `espera`). A interface detecta `resultado → espera` na mesma rodada, devolve as cartas ao monte, voa as fichas dos círculos pras placas, zera `montando` e embaralha o monte (`embaralharMonte` em `mesa-pecas.js`: riffle em quadros, duas passadas, com o som de embaralhar, que aí não toca de novo ao dar as cartas). Sair ou desconectar libera o lugar. O último a sair desfaz a mesa (e cancela a limpeza). A interface está em `public/vinte-e-um.js` e `public/vinte-e-um.css`. A publicação requer release e deploy juntos.

As fichas ficam em `fichas-store.js` (`FichasStore`, arquivo `fichas.json`), uma carteira por `accessId` da conta autenticada, compartilhada por todas as atividades. Carteira nova começa com o `inicial` do `FichasStore` (5.000 no `server.js`, o começo de temporada do Seu cassino; o padrão da classe continua 1.000, que os testes antigos das mesas usam). O crédito de +1000 toda segunda saiu (27/11/2026): os coins novos vêm do Seu cassino. A mesa é criada com `fichas: true/false`. Cada pessoa manda a aposta como a pilha montada (`pilha`, só valores 5/10/25/50/100), validada contra o saldo, sem limite. O servidor espera todas as confirmações, debita ao distribuir e liquida uma vez ao concluir. Contra a banca a vitória paga 2× e o empate devolve. Entre amigos o pote (incluindo apostas de quem saiu) é dividido entre os vencedores na proporção da aposta de cada um, com a sobra pela ordem dos assentos; se todos estourarem, ninguém recebe. Visitantes podem assistir, consultar o ranking e jogar só por diversão. O servidor exige conta para abrir apostas da call, palpitar e sentar em mesas valendo fichas. Ranking e lista administrativa filtram as carteiras pelos membros vinculados a contas. O evento `ranking-fichas` devolve o top 20 (mais a posição de quem pediu). `jogar-21` e `mesa-21` mandam também `carteira` (`saldo`). O dono do servidor (só `permissions.isOwner`) vê as carteiras em Configurações → Servidor e cargos (`public/fichas-admin.js`): `fichas-admin-lista` devolve todas e `fichas-admin-resetar` (`{ chave }` ou `{ todos: true }`) volta o saldo pro `inicial` (5.000) e reenvia as mesas abertas.

A interface compara cada `mesa-21` com o anterior para decidir o que animar: cartas novas voam de `#monte-21` (ordem de mesa de verdade na distribuição), a carta escondida da banca vira no estilo retrô (cada `.carta-21` tem frente e verso dentro de `.miolo-21`; `virarRetro` em `mesa-pecas.js`), as compras da banca saem uma a uma e o resultado (`#placar-21`, no lugar da frase do feltro) só aparece depois da última carta (`.revelando` esconde o resultado até lá). Os sons ficam em `public/mesa-sons/` (Kenney Casino Audio, CC0, ver `LICENCA.txt`; podem ir pro git, ao contrário de `public/sounds/`). Tocam pelo `masterDeafenGain` do mixer, só com a mesa aberta; o botão `#som-21` guarda a escolha em `localStorage` (`teletela-mesa-sons`). Os avatares dos assentos vêm do callback `pessoaDaCall` passado por `app.js`.

Os lugares ficam na borda da mesa numa elipse (`angulos()` em `public/vinte-e-um.js`, `--cos`/`--sin` no CSS): você sempre embaixo no meio; contra a banca a turma se espalha pela metade de baixo e pelos lados (até ±120°), entre amigos a roda fecha. A banca, a bandeja de fichas (`#bandeja-21`) e o monte ficam no alto; entre amigos, o monte e o pote ficam no meio. Cada lugar tem um círculo de aposta (`.aposta-21`) com as fichas empilhadas por cor; `voarFichas()` leva pilhas temporárias pelo feltro (aposta pro pote ao distribuir, banca recolhendo de quem perdeu, pagamento pra quem ganhou) e `liquidar()` deixa o estado final. Abaixo de 600 px de largura a roda vira grade.


Cliente → servidor (com callback `cb({ success, error })` quando faz sentido):

| Evento | Pra quê |
|---|---|
| `join-channel` `{ channelId, profile, isMicOn, ... }` | entrar num canal de voz (o perfil vai junto) |
| `leave-channel` | sair da call |
| `update-profile` | mudou o perfil |
| `update-activity` `{ id, name, startedAt }` ou `null` | mudou/encerrou o jogo; valida nome (até 80 caracteres), identificador e início (até 30 dias atrás; tolera 1 min de relógio adiantado). Só os três campos públicos são aceitos; até 10 mudanças em 10 s, limpeza sempre permitida |
| `connection-ping` (só callback) | responde `{ success: true }` para medir a ida e volta até o servidor |
| `user-state-changed` | mic, ensurdecer, transmitindo, câmera, telas extras, falando, o que está assistindo (`watching`) |
| `create-channel` / `delete-channel` | canais de voz |
| `create-text-channel` / `delete-text-channel` / `text-history` / `text-message` / `text-image` | canais de texto |
| `text-file` / `chat-file` | enviar vídeo/arquivo de até 20 MB para texto/call |
| `chat-message` / `chat-image` | chat da call (aceitam `replyTo`) |
| `message-edit` / `message-delete` / `message-react` | `{ scope: 'call'|'text', channelId?, messageId, ... }` |
| `message-pin` / `text-pins` | fixar/desfixar e listar as fixadas (só canal de texto) |
| `typing` `{ scope, channelId? }` | "está digitando" (o app manda a cada ~3 s enquanto digita) |
| `admin-set-room-password` / `admin-reset-members` | senha da sala e chaves de membro |
| `soundboard-add` / `soundboard-delete` / `soundboard-play` | soundboard |
| `reaction` | emoji flutuando na call |
| `sfu-token` | senha temporária pra entrar numa sala do SFU |
| `owner-claim` / `owner-recover` / `owner-transfer` | assumir, recuperar e transferir a propriedade com chave exclusiva |
| `admin-login` | compatibilidade antiga; não promove admin a dono |
| `role-save` / `role-delete` / `member-roles` | administrar cargos com hierarquia |
| `get-channel-settings` / `channel-settings` | configurações de um canal `{ type: 'voice'|'text', channelId, ... }` |
| `kick-user`, `admin-move-user`, `admin-mute-user`, `admin-deafen-user` | moderação autorizada pelos cargos |
| `webrtc-offer` / `webrtc-answer` / `webrtc-ice-candidate` / `webrtc-signal` / `request-stream` | sinalização P2P (sala no PC) |

Servidor → cliente (principais): `channels-list` (e `channels-summary`, mesmo conteúdo, pra
app antigo), `channel-state`, `user-joined`, `user-left`, `user-state-changed` (e
`user-state-updated`), `user-profile-updated`, `user-activity-updated` (`{ userId, activity }`), `chat-message`, `chat-message-updated`,
`chat-message-deleted`, `text-channels`, `text-message`, `text-message-updated`,
`text-message-deleted`, `text-channel-deleted`, `soundboard-list`, `soundboard-played`,
`typing`, `member-key`, `room-info`, `room-password-changed`,
`server-moderation`, `moved-by-admin`, `kicked`, `reaction`.

`room-info` inclui `connectionPing: true` nos servidores com suporte ao ping. Durante
a call, o cliente mede uma vez e espera 5 s após cada resposta antes de medir de novo.
O limite de espera é 4 s: sem resposta, o painel fica vermelho; ao desconectar, mostra
“Reconectando…”. Verde para menos de 150 ms, amarelo de 150 a 299 ms e vermelho a partir
de 300 ms. Sair da call cancela as medições e respostas antigas são ignoradas.
O `title` nativo foi substituído por `#connection-tooltip`, um cartão com ping/qualidade e
cores dos temas, fora da barra lateral para evitar corte por overflow. Abre por hover ou
foco, permite passar o mouse sobre o cartão e fecha com Escape, blur da janela ou saída
da call. O cálculo de ping e o protocolo não mudaram; o visual não exige deploy do Node.
Sem a capacidade anunciada (servidor antigo), o indicador fica neutro e informa que o
ping está indisponível. A medida é da sinalização Socket.IO, não do trajeto de mídia
WebRTC/SFU nem da perda de pacotes de áudio.

Rotas HTTP: `/api/health`, `/api/channels`, `/api/avatar/:userId`, `/api/banner/:userId`,
`/api/join-sound/:userId`, `/api/soundboard/:id`, `/api/chat-image/:file`,
`/api/text-image/:file`.

## 11. Onde fica cada funcionalidade no código

`public/app.js` é dividido em seções numeradas (procure por `// 1.`, `// 2.`, etc.):
1 helpers, 2 estado (`appState`), 3 conexão, 4 eventos do servidor, 5 navegação de canais,
6 lista de canais e pessoas, 7 chat, 8 dock e configurações (8a tela cheia, 8b volume por
pessoa, 8c perfil, 8d atalhos), 9 WebRTC P2P, 10 áudio do sistema, depois SFU e cancelamento
de ruído, e 11 inicialização (`initApp`).

| Funcionalidade | Onde procurar |
|---|---|
| Lista de canais/pessoas (ordem alfabética, recolher, arrastar pra mover) | `renderChannelsTree`, `sortedUsers`, `setupCategoryCollapse`, `moveUserToChannel` |
| Contas opcionais | `account-store.js`, `accounts-protocol.js`, `public/accounts.js`/`.css`; auth `accountToken`, aba Conta e login HTTP antes da senha da sala |
| Dados de RPG | `dice-store.js`, `public/dice.js`/`.css`; eventos `dice-roll`, `dice-history`, `dice-rolled` |
| Cinema e miniplayer | `public/stage-social.js`/`.css` e API de estado/ações em `public/music.js`; integração em `app.js` |
| Visuais locais | A preferência `visual` escolhe Clássico (padrão) ou Terminal; qualquer outro valor salvo (`violeta`, `roda`, `aconchego`, os visuais de teste) cai no Clássico. O Clássico é `style.css` + `redesign.css` + `public/classico.css` (só com `data-visual="classico"`): grade de cartões da call, quem fala, controles com nome, mola ao apertar, chegada suave e as fontes Figtree e Bricolage Grotesque embutidas em `public/fonts/` (OFL). O Terminal usa a camada `alternativo` (`interface.css` + `sala.css`) mais `terminal.css`. Os visuais Roda, Aconchego, Pixel, Fita K7 e Personagens saíram na branch `visual-unico`; o código deles está no commit `f771c68`. Prints sem abrir janela: `VISUAL=classico OUT=/tmp/prints` + o prefixo headless do AGENTS.md + `tests/visual-capture.cjs`. `public/visual.js` ativa as folhas na entrada e na sala. Na janela de transmissão, `public/window-appearance.js` acompanha as mudanças de tema, visual e cores da janela principal. `public/personalization.js` aplica as cores locais de `appearanceExperiment`: `themeColor` para as superfícies geradas por `public/theme-color.css`, `accent` para ações e `secondary` para destaques. |
| Tela inicial e controles por contexto | `renderServerHome` e `setupServerHome`: cartões de voz/pessoas e atalhos de texto; `updateTextLayout` e `updateStageControls`: chat e controles apenas no contexto correspondente |
| Canais de texto | `renderTextChannels`, `openTextChannel`, `loadTextHistory`; servidor: `readTextMessages`, `appendTextMessage` |
| Chat (responder, reagir, editar, apagar) | `buildChatMessage`, `setupChatMessageActions`, `startEditMessage`; servidor: `message-edit/delete/react` |
| Prévia de links | `public/link-previews.js` monta um cartão por mensagem da call, de texto ou direta. O cliente pede o evento `link-preview` quando o cartão chega perto da tela. `link-previews.js` no servidor consulta oEmbed do YouTube ou o HTML e a imagem de páginas públicas, valida o IPv4 de cada conexão e mantém um cache em memória. A miniatura do YouTube vem de `i.ytimg.com` no cliente. Para clipes do Medal, o player nativo carrega o MP4 de `medal.tv/api/content/<id>/socialVideoUrl` e aguarda o play. Usa a capa retornada pelo servidor ou o primeiro quadro do vídeo quando a capa está indisponível. |
| @menção | `mentionify`, `mentionsMe`, `notifyMention`, `setupMentionAutocomplete` |
| Reações da call | `setupEmojiPicker`: hover/clique/teclado abre só os atalhos; **＋** carrega o seletor completo; `renderQuickReactions`, `countReactionUse`, `closeCallReactions` |
| Fixar mensagem | `pinMessage`, `renderPins`, `setupPins`; servidor: `message-pin`, `text-pins` |
| "Está digitando" | `setupTyping`, `renderTyping`; servidor: `typing` |
| Senha da sala | cliente: `roomAccess`, `openRoomPasswordModal`, `setupRoomPasswordAdmin`; servidor: `io.use`, `isMemberKey`, `setRoomPassword` |
| Cargos e canais invisíveis | `permission-store.js`, `public/permissions.js`; `permissions-state`, `channel-access`, listas individualizadas e revogação no SFU |
| Exportar/importar perfil | `setupProfileTransfer` |
| Soundboard | `setupSoundboard`, `renderSoundboard`, `playSoundboard`; servidor: bloco `SOUNDBOARD` |
| Vídeos e arquivos no chat | `sendChatImage`, `chatAttachmentHtml`; servidor: `attachmentStorage`, `prepareAttachment`, `text-file`/`chat-file` |
| Sons ao mutar/desmutar | `playControlSound`, `setupDockControls`, `prefs.controlSounds`; quatro `.ogg` privados em `public/sounds/` |
| Sons de entrar/sair | `playCallSound`, `callSoundChoiceUrl`, `joinSoundUrl` (som do perfil) |
| Perfil (banner, moldura, gradiente, perfil grande) | `renderProfileDraft`, `frameClass`, `nameCss`, `renderBanner`, `openProfileCard`; servidor: `applyProfile` |
| Editor do próprio perfil | `openProfileSettings`, `setupProfileSettings`, `resetProfileDraft`; `#form-profile` na aba `data-settings-section="perfil"` |
| Enquadramento de foto/banner | `editProfileImage`, `setupImageCrop`, `prepareProfileImage`, `renderBanner`; geometria/validação: `image-crop.js` |
| Ping e cores da conexão | `syncConnectionMonitor`, `showConnectionQuality`, `setupConnectionTooltip`; servidor: `connection-ping` e capacidade `room-info.connectionPing` |
| Jogo e tempo de atividade | `setupGameActivity`, `pollGameActivity`, `renderUserActivity`; relógio: `public/game-activity.js`; detecção: `electron/game-activity.cjs`, IPC `get-game-activity`; servidor: `update-activity` |
| Admin | `setupAdminSettings`, popup da pessoa (`openUserPopover`); servidor: `moderate`, `applyServerModeration` |
| Transmissão de tela/câmera, várias telas | `startExtraScreen`, `streamKey`, `updateStageLayout`, `layoutMosaic` (mosaico redimensionável) |
| Prévia própria sob demanda | `showLocalPreview` guarda o stream mesmo oculto; `openStream` registra a prévia local ao clicar no próprio selo; `removeScreenStream` fecha a prévia sem parar a captura |
| Quem está assistindo | `syncWatching`, `renderStreamViewers` |
| Volume / ensurdecer | `audio-manager.js`: `VolumeMixerManager`, `DeafenController` |
| Volume e IA do microfone | `microphone.js`: RNNoise e ganho manual como na 3.7; `app.js`: `setupMicGain`, `openMicrophone`, `restartMicrophone` |
| Atalhos de teclado | seção 8d (`eventToAccelerator`, `SOLO_KEY_CODES`); globais: `setGlobalHotkeys` no `main.cjs` (Ctrl/Shift/Alt sozinhos via `uiohook-napi`) |
| Temas e visual | `style.css` (tokens em `:root`, `[data-theme="preto"]`, `[data-theme="claro"]`), `redesign.css` |
| Modo leve e pausa de animações | `applyPerformancePrefs`, `syncAppVisibility`, `setupPerformanceSelect`, `freezeAvatar`; CSS: `light-mode`, `pause-in-background` |
| Configurações (abas) | `openSettings`, `selectSettingsTab`; `#modal-settings` no `index.html`, abas `data-settings-tab` |
| Popup de novidades | `showWhatsNewOnce` (automático), `openWhatsNew`/`setupWhatsNew` (reabertura no início e configurações), `#modal-whats-new` |
| Tela inicial e amigos online | `electron/connect.html`/`.css`/`.js`, `launcher-preview.cjs` e IPCs do início no `main.cjs` |
| Som de um app só | Linux: `routeAppAudio` (PipeWire/Pulse); Windows: `native/win-audio` + `start-win-audio` |
| Auto-update | `electron-updater` no `main.cjs` (lê o `latest*.yml` do release) |

### Poker (5.0 em desenvolvimento)

`poker.js` (servidor) e `public/poker.js` + `public/poker.css` (interface). Texas Hold'em, uma mesa por canal, ao lado da do 21 (as duas existem ao mesmo tempo). Blinds fixos `SMALL`/`BIG` = 5/10, até `LUGARES` = 8, `PRAZO_VEZ` = 60 s. Evento único `jogar-poker` com `{ canal, acao, passo, valor? }`: `ver`, `sentar` (`valor` de 10 até o saldo; sem mesa, cria com `fichas: true/false`; só diversão senta com 1000), `comecar` (só a primeira mão; depois as mãos saem sozinhas com duas pessoas com fichas), `largar`, `passar`, `pagar`, `aumentar` (`valor` = até quanto a aposta da rua vai), `tudo`, `repor` (fora de uma mão em andamento), `ausentar`, `voltar` e `sair`. `passo` sobe a cada mudança e o servidor recusa pedido com `passo` velho (clique duplo, tela atrasada). O servidor manda `mesa-poker` pra todo mundo do canal com a visão de cada um: cartas dos outros só no showdown, `jogadas` (pagar, mínimo, máximo, pode aumentar) só pra quem tem a vez, `maoAtual` (nome da sua melhor mão), `restante` do tempo e, no resultado, `proxima` (ms até a próxima mão; o app recolhe as cartas e embaralha o monte ~2,6 s antes, classe `.mesa-limpa`).

Dinheiro: a pilha da mesa é um teto, não um saque. As fichas só saem da carteira quando vão pro pote (`por()` chama `fichas.mover(-x)`) e o pote volta pra carteira de quem ganhou ao fim da mão. No começo de cada mão a pilha é limitada ao saldo (o 21 e as apostas podem ter gastado). Assim o ranking mostra o saldo real e um reinício do servidor só perde o pote da mão em andamento.

Regras: dealer gira entre quem joga; no mano a mano o dealer é o small blind e fala primeiro antes do flop. Aumento mínimo = último aumento completo (pelo menos o big blind). All-in curto não reabre o aumento pra quem já falou (`nivel`/`nivelVisto`). Ninguém mais pode apostar: a mesa abre até o river de uma vez. `montarPotes()` faz os potes paralelos pelo total que cada um pôs (quem largou paga, mas não concorre); a sobra de divisão vai pra quem senta primeiro depois do dealer. `melhorMao()` avalia as 21 combinações de 5 entre 7 cartas; o avaliador fica em `public/poker-maos.js` (importado pelo servidor e pela mesa) junto com `CATEGORIAS` (tabela do botão **Mãos**, `#maos-poker`, com exemplos conferidos pelo próprio avaliador) e `categoriaDe()` (royal flush vira a categoria 9). Armadilha: o 21 põe `data-fase` no palco inteiro (`#mesa-21`), então regras do poker por fase precisam começar em `#jogo-poker[data-fase=…]`; e a regra comum do monte (`:is(#monte-21, .monte-poker)`) usa id, por isso a posição do monte do poker vai com `#jogo-poker` na frente. No app, o selo `.mao-poker` sob o seu nome mostra `maoAtual` e só troca quando as cartas novas pousam. Tempo esgotado: passa se der, senão larga; `FALTAS_PRA_AUSENTE` = 2 seguidas deixa ausente (não recebe cartas; se estiver numa mão, joga sozinho na hora). Quem sai no meio da mão larga e libera o lugar quando ela acaba.

Interface: a entrada das Atividades é o salão (`public/salao.js` + `public/salao.css`, painel `#salao-jogos`), com um cartão por jogo (21, Poker, Apostas) feito das cartas e fichas em pixel e o status ao vivo (quantos na mesa, "Sua vez!" em dourado, aposta aberta). A arte vai de 2× pra 3× (cartão ≥ 400 px) e 4× (cartão ≥ 540 px): a escala mede o próprio cartão (`container: cartao`), porque com 4 cartões lado a lado em 1080p/2K o salão é largo mas o cartão não, e a arte vazava; no layout de celular o cartão desliga esse contêiner e a arte fica em 1×. Espaçamento e letra usam o contêiner próprio `salao`, porque em tela cheia o palco sai do fluxo e a medida pelo palco não muda. A moeda aparece pro usuário como **Colheita Coins** ("coins"); no código continua `fichas`. O salão escuta `mesa-21`, `mesa-poker` e `aposta` e pede `ver` dos três ao entrar no canal e ao abrir o palco; o servidor não sabe do salão. Abrir o palco cai no salão, a não ser que você esteja sentado numa mesa (aí vai direto pra ela). Dentro de um jogo, `#voltar-salao` ("← Atividades") volta; o cartão de Apostas só abre o painel `#apostas-21`. `palco.dataset.jogo` é `salao`, `21` ou `poker`, e o evento `teletela-aba-jogo` avisa o 21 e o poker (cada um põe o próprio título e só toca som com o seu jogo na frente). O cabeçalho (carteira, apostas, ranking, som, tela cheia) é compartilhado; o 21 fica em `#jogo-21` e o poker em `#jogo-poker`. As peças comuns (carta, pilha de fichas, rosto, fichas voando) estão em `public/mesa-pecas.js`. Cartas e fichas são pixel art do pacote "(Pixel) Poker Cards" de IvoryRed (CC BY 4.0, crédito obrigatório em `public/baralho/LICENCA.txt`, no README e dentro do app: no pé do Ranking (`.creditos-21`) e na seção fixa **Créditos** no fim do `#modal-whats-new` (`.whats-new-creditos`), que não pode sumir quando as novidades forem reescritas a cada versão): `public/baralho/<valor>_of_<naipe>.png` (48×64, verso em `verso.png`) e `public/fichas/<cor>-<n>.png` (pilhas prontas de 1 a 10 fichas, 32 px de largura, 30 px + 2 px por ficha; as de 3, 5–7, 9 e 10 foram geradas repetindo a faixa lateral da pilha de 8 do pacote). `public/mesa-pixel.css` vem depois de `vinte-e-um.css`/`poker.css` e troca o desenho em CSS pelas imagens. As fichas ficam em 1× (32 px), porque menores que isso o pixel art perde pixel. `pilha()` monta uma coluna por cor (empilhar fichas soltas mostraria a emenda de cada uma); no círculo de aposta as colunas viram um montinho. Pixel art não pode inclinar (fica serrilhado): o leque é reto, as cartas voam sem girar e viram no estilo retrô (`virarRetro`: achata, troca a face e abre em quadros). Também em `mesa-pecas.js`: `voarFichas` (arco, uma coluna de cada vez), `cairFicha` (a ficha clicada cai na coluna da cor dela) e `brilhar` (estrelinhas em quem ganhou); tudo respeita o "reduzir movimento" do sistema e os sons em `public/sons-mesa.js` (mesmo botão de som; ensurdecer cala). Se a vez chega com o palco fechado, no salão ou no 21, aparece um toast. Testes: `tests/poker.test.js` (avaliador, potes, fluxo, tempo, saída e 300 mãos aleatórias conferindo que nenhuma ficha some; `POKER_SEMENTE=n` troca a semente) e `tests/poker-browser.cjs` (duas janelas e um celular de ponta a ponta; `PRINTS=/pasta` salva prints).

### Apostas estilo Twitch (5.0 em desenvolvimento)

`apostas.js` (servidor) e `public/apostas.js` + `public/apostas.css` (interface). Uma aposta por canal de voz, num só evento `aposta` com `{ canal, id, acao }`: `ver`, `criar` (`titulo`, 2 a 10 `opcoes`, `segundos` em 60/120/300/600/1800), `palpitar` (`opcao`, `valor` inteiro até o saldo; dá pra pôr mais na mesma opção, não trocar), `fechar`, `resolver` (`opcao`) e `cancelar`. Quem criou (ou o dono do servidor) fecha, marca e cancela; quem criou também pode apostar. Fecha sozinha no tempo. O pote vai pra quem acertou na proporção do que pôs (sobra pela ordem dos palpites); ninguém acertou ou cancelou devolve tudo. O servidor responde e manda `aposta` pro canal com `{ aposta, carteira }`; o resultado fica 15 min e some. Os sons (abrir, pôr fichas, fechar, resultado) usam `public/sons-mesa.js` e tocam pra quem está vendo o card. Na interface o card fica no topo do chat da call (`#aposta-chat`, some no canal de texto, recolhe e esconde o resultado), no botão de moeda do cabeçalho do chat (`#btn-chat-aposta`) e no painel Apostas das Atividades (`#apostas-21`). Quem cria usa o `<dialog id="dialogo-aposta">`. O app dispara `teletela-call-joined` e `teletela-chat-view` pra o card acompanhar canal e chat.

### Roleta (em teste local)


### Comilança (em desenvolvimento, desligada nas versões)

Fora da 5.1.0 a pedido do dono (falta polir). Pra testar: `COMILANCA_LIGADA = true` em `public/app.js` e o servidor com `TELINHA_COMILANCA=1`; desligada, o app tira o cartão do salão e o servidor não responde ao evento `comilanca`. O `tests/comilanca-browser.cjs` só passa com as duas ligadas.

Slot de coleta solo, inspirado só na mecânica de jogos de grade com coletores (nome, arte e personagens são nossos). Motor sem tela em `public/comilanca-motor.js` (`criarMotor({ escala, aleatorio })`, roda igual no Node e no navegador): grade de 6×6 até `MAX_LADO` 8, quatro coletores (`CORES` vermelho/azul/verde/roxo) que comem a pedra da cor deles ou curinga (toda pedra é de uma das 4 cores, como no jogo de referência; a rodada acaba porque cada amigo fica sem vizinha da cor dele, em média ~13 pedras comidas e ~3 avalanches por giro) em casa vizinha (4 direções) até ninguém ter o que comer; aí, se dois amigos encostados trocando de lugar destravam algum deles, trocam (evento `trocar` com `amigos` e `posicoes`, sempre seguido de um `comer`) e a comilança segue; senão, avalanche (as peças descem e entram novas) com os coletores parados. Seta sobe o nível da cor (`VALOR_BASE` × `escala` × aposta por pedra), bomba cresce a grade, 3+ trevos no fim dão `GIROS_BONUS` 6 giros grátis que guardam lado e níveis (trevos no bônus dão +3); prêmio limitado a `TETO` 5000× a aposta. `SORTEIO` (90% pedra, trevo 0,5%) e `escala` 0.252 foram calibrados por simulação de 1 milhão de giros com aposta 10 (já com a troca): ~95% de retorno, 22% dos giros pagando a aposta ou mais, ~18 pedras comidas, 1,5 troca e 3,8 avalanches por giro, bônus ~1 em 210, maior visto ~610×; ≥10× sai ~1 em 260, ≥25× ~1 em 630, ≥60× ~1 em 940. **Armadilha:** cada pedra é arredondada em centavos, então simular com aposta 1 distorce (o nível 0 vale 0,04 e arredonda); calibre com aposta 5 ou 10. A jogada devolve a lista de eventos (`inicio`, `comer`, `nivel`, `crescer`, `avalanche`, `fim`). Servidor em `comilanca.js` (`criarComilanca`): evento `comilanca` com `acao` `ver` ou `girar` (`aposta` em 5/10/25/50/100), só com conta; sorteia com `crypto.randomInt`, acerta a carteira de uma vez (prêmio arredondado) e responde `{ carteira, premio, jogada }`; `INTERVALO` 250 ms entre giros da mesma conta (o giro mais curto, no turbo, anima ~0,4 s; com 700 ms o turbo batia no limite). Tela em `public/comilanca.js` + `public/comilanca.css`, painel `#jogo-comilanca` e cartão `data-jogo="comilanca"`; mostra o saldo sem o prêmio durante a animação e acerta no fim; abre com uma grade de exemplo que não vale nada. As joias são `<symbol>` SVG gerados uma vez (`#cml-desenhos` no body): um corte só (octógono) pra todas as cores, em três tons chapados (facetas claras em cima/esquerda, escuras embaixo/direita), sem brilho, como o dono pediu; especiais (curinga, medalha, bomba, trevo, e o ícone da troca) são SVG à mão. Ritmo em `RITMO` (Turbo × 0,38); especial comido escurece a grade e segura `RITMO.destaque`; `FAIXAS` 10×/25×/60× disparam Big/Mega/Ultra win com contador (`setInterval`, não rAF, pra não travar em segundo plano) e chuva de moedas; clicar ou espaço pula. Auto (`girarAuto`) gira N vezes no cliente e para sem coins, com erro, ao sair da Comilança ou no Parar. Com 6 jogos o salão vira 3 + 3 (≥ 601 px) ou 6 lado a lado (≥ 1800 px). **Armadilha:** o app pausa todas as animações CSS com a janela fora de foco (`html.pause-in-background.app-unfocused * { animation-play-state: paused }`, em `style.css`); animação de entrada que começa em `scale: 0`/`opacity: 0` fica invisível pausada. Por isso as entradas, faíscas, destaques e moedas usam `el.animate()` (WAAPI não obedece `animation-play-state`). Testes: `tests/comilanca.test.js` (cobrança e pagamento, intervalo, regras do motor e retorno em 60 mil giros) e `tests/comilanca-browser.cjs` (abre pelo salão, gira 3 vezes conferindo a carteira, liga o Auto e para).
Servidor em `roleta.js` (`criarMesasRoleta`, ligado no `server.js` igual ao poker: `conectar`, `sair` ao deixar o canal, `atualizarTodas` quando o saldo muda por fora). Uma mesa por canal de voz, criada pela primeira ficha e apagada quando volta pra espera sem ninguém no canal. Evento `jogar-roleta` com `{ canal, acao, rodada }`: `ver`, `apostar` (`alvo`, `valor`), `desfazer`, `limpar`, `pronto`; a mesa vai pra todos do canal em `mesa-roleta` (`fase` espera/apostando/girando/resultado, `restante` em ms, `numero` só a partir do giro, `historico` dos últimos 12, `apostas` com as fichas de cada um). Alvos: `n0`…`n36` e `vermelho`, `preto`, `par`, `impar`, `baixo`, `alto`, `d1`–`d3`, `c1`–`c3` (`alvoValido`, `multiplicador`: número 36×, dúzia/coluna 3×, o resto 2×, já com a aposta; 0 leva as de fora). Só com conta (visitante só assiste). A ficha sai da carteira na hora e `desfazer`/`limpar`/sair da call com as apostas abertas devolvem; com a roda girando a aposta fica e paga mesmo com a pessoa fora. Tempos: `TEMPO_APOSTAS` 25 s a partir da primeira ficha (todos com ficha em **Pronto** gira antes), `TEMPO_GIRO` 7 s (a tela usa o mesmo), `PAUSA_RESULTADO` 6 s; máximo de 200 fichas por pessoa por rodada. O sorteio é `randomInt(37)` e vai pra tela já no início do giro, pra ela animar até o número. Interface em `public/roleta.js` + `public/roleta.css`, painel `#jogo-roleta` e cartão `data-jogo="roleta"` no salão. A roda é `public/roleta/roda.svg` (gerada por script, ordem real da roda europeia, 0 no topo); a tela gira a imagem até a casa ficar no topo (ângulos acumulam, nunca volta) e a bola (`.bola-orbita`) gira ao contrário e cai do trilho pra casa no fim. Abrir no meio do giro anima só o que falta; no resultado já aparece parada. Pano em grade de 14 colunas (0, 12 de números, 2:1) e 5 linhas, com a ficha de maior valor que cabe no total de cada casa e anel dourado nas suas. Sons: fichas do pacote Kenney e tiques da bola feitos na hora (`tocar.tom`). Com 5 jogos o salão vira 3 + 2 centralizado (salão ≥ 601 px) ou 5 lado a lado (≥ 1240 px). **Armadilha corrigida:** o salão achava o cartão com `[data-jogo="x"]`, mas o palco `#mesa-21` também tem `data-jogo` (o jogo aberto), então com um jogo aberto o status ia pro primeiro cartão; agora procura `.salao-cartao[data-jogo]`. Testes: `tests/roleta.test.js` (pagamentos, fluxo com relógio de mentira, devoluções) e `tests/roleta-browser.cjs` (duas contas apostam, ficam prontas, conferem saldo e que a roda parou no número).

### Seu cassino (idle, desde a 5.1.0)

Cassino e fazenda de cada conta ("Fazenda" na tela; no código ainda é `roca`), que rendem fichas parados. Regras sem tela em `public/cassino-regras.js` (importado pelo servidor e pelo app, como o `poker-maos.js`); servidor em `cassino.js` (`cassino.json` no diretório de dados, um estado por `accessId` de conta); interface em `public/cassino.js` + `public/cassino.css`, painel `#jogo-cassino` e quarto cartão do salão (`data-jogo="cassino"`). Evento único `cassino` com `{ acao, ... }`: `ver`, `coletar`, `plantar` (`i`, `cultura`), `plantarVazios`, `colher` (`i`), `colherTudo`, `vender`, `liberar`, `maquina`/`melhorar`/`contratar` (`id`), `alavanca`, `visita`, `amigos`, `visitar`/`ajudar` (`chave`), `mover` (`tipo`, `i`, `x`, `y`), `proxima` (`i`, `cultura` ou null), `proximaTodos` (`cultura`), `arrancar` (`i`), `legado` (`id`, paga em estrelas). Resposta: `{ estado, carteira, agora, teste, temporada: { numero, fim }, fimTemporada, resultado }`; quem recebe ajuda ganha `cassino-ajuda`. O servidor põe o saldo da carteira em `e.fichas`, roda a regra e devolve a diferença com `fichas.mover` (nada vira ficha sem passar pelas regras). O tempo anda de minuto em minuto em `avancar()` (máx. 14 dias de uma vez); o cofre para no limite de horas, então ficar online não rende mais que coletar 2x por dia. Limites: alavanca 300/dia e 12/s, visita surpresa 8/dia (alavanca e visita surpresa não têm mais botão nem visitante na tela; as ações seguem no servidor), ajudar 1x por dia por amigo. `TELINHA_CASSINO_TESTE=1` liga `pular` (1 h/1 dia), `encerrarTemporada`, três amigos de mentira e começa a carteira com 5.000; sem ele essas ações são recusadas. **Temporada global** (5.1.0): `cassino.json` guarda `temporada: { numero, inicio, fim }`, a mesma pra todos. Dura `DIAS_TEMPORADA` (60) e acaba às 06h UTC (03h de Brasília) do dia em que completa. Ao criar a primeira (lançamento), `fichas.garantirMinimo(5000)` sobe quem tem menos, sem tirar de ninguém. `verificarTemporada()` roda ao iniciar e a cada minuto; no fim, cada jogador (menos os de mentira) avança até a hora do fim, passa por `fimTemporada` (3 estrelas com tudo no máximo, senão 1; fica o legado) e ganha `fimTemporada: { numero, novas, ganho }`, toda carteira de conta vai pra 5.000 (`resetarTodas(5000)`) e quem está conectado recebe `cassino-temporada` (o app pede `ver` e mostra o aviso uma vez por temporada, guardado em `localStorage`). Se o servidor estava desligado há mais de um dia na hora do fim, a próxima conta a partir de agora. O topo do cassino mostra "Temporada N · acaba em X dias". O `encerrarTemporada` do servidor de teste continua sendo só da própria conta. **Ainda não tem:** ranking separado por temporada.


**Salão em grade.** `e.layout` guarda a posição (em células de 8 px da arte) de cada peça: `{ caca: [[x, y], …], roleta, vinte, poker, bar, vaso, dados }`. Tamanhos em `R.PECAS`; a sala vem de `R.sala(e)` e cresce com "Ampliar o salão" (56×34 até 96×56, só pra baixo e pra direita, então nada sai dela), com 2 linhas de parede no topo e a porta no meio de baixo (nada pode ficar nela). `garantirLayout()` roda em `avancar()`, ao comprar e ao melhorar: dá lugar ao que não tem (estado antigo, máquina nova) procurando de cima pra baixo com 2, 1 e 0 células de folga. `mover` só aceita onde `R.cabe()` (dentro da sala, fora da porta, sem sobrepor). No app a cena é desenhada numa escala `--k` (múltiplo de 1/4, até 4×) que cabe no espaço sem rolar; peças e pessoas ficam na mesma camada com `z-index` = linha do pé, então quem está atrás de uma mesa some atrás dela. As pessoas andam por busca em largura na grade (8 direções, sem cortar quina) e nunca pisam numa peça; clientes vão pra frente das máquinas (às vezes do bar) e param de costas; barman fica atrás da parte aberta do balcão (o balcão cobre as pernas); crupiê atrás das mesas de 21/poker; segurança na porta (às vezes faz ronda); gerente circula. **Economia** (tudo em `public/cassino-regras.js`): caça-níquel 5 coins/h, roleta 15, mesa de 21 50, poker 95; cada máquina igual custa 15% a mais, arredondado (`redondo`: de 5 em 5 até 1.000, de 50 em 50 até 10.000, depois de 100 em 100). **Bar:** cada produto com estoque dá +5% (+8% com o Barman) na renda das máquinas e o bar ainda vende as porções: os clientes pedem `3 + renda base/60` porções/h de cada produto, pagas pelo `preco` da cultura (pipoca 1, bolo 1,5, suco 2, expresso 3, vinho 4, piña colada 5) e somadas em `taxaHora` (entram no cofre e no limite dele). Com o cofre cheio o bar não gasta. A venda direta paga 30% desse preço (`precoVenda`) e a fração que sobra fica em `e.troco` pra próxima venda. Com 5 caça-níqueis, 1 roleta e pipoca, o bar dá ~6/h (antes eram 2/h). Com tudo no máximo na 1ª temporada (24 máquinas, bar com os 6 produtos e a equipe toda) dá ~1.290 coins/h, ~31 mil por dia. **Vender máquina** (`venderMaquina`, link "Vender por…" na loja, com 2 cliques pra confirmar) devolve 70% (`DEVOLVE`) do preço da última daquele tipo, arredondado; o valor vai pra carteira sem entrar em `ganhoTemporada`. A equipe aparece só pelo cargo (as chaves `neves`, `ll`, `gg`, `cast` continuam nos saves). **Sons:** `public/cassino.js` usa `criarSons` de `sons-mesa.js` (mesmo botão de som e ensurdecer do 21/poker): fichas e pote do pacote Kenney pra comprar, coletar e vender, e notas curtas feitas na hora (`tocar.tom`) pra plantar, colher, arrancar e a lojinha. O cartão do salão (`.salao-arte-cassino`) é metade tapete com caça-níquel e metade fazenda (terra arada, milho, galinha e, em cartão ≥ 300 px, o celeiro), em escala inteira `--e`. O Soldado saiu. **Lojinha das estrelas** (`R.LEGADO`, no fim da loja do cassino): as estrelas do fim da temporada são fixas (3 com tudo no máximo, contado por `R.faltamProMaximo()`: máquinas, melhorias, equipe e sementes, 66 compras; senão 1) e viraram moeda (não dão mais +5% sozinhas) e compram bônus que passam por todo reset, guardados em `e.legado`: Fama (+10% em tudo, até 5 níveis), Bar da casa (bar aberto), Terra boa (+2 canteiros por nível), Cofre reforçado (+2 h por nível), Banco de sementes (as sementes liberadas continuam) e Irrigação pra sempre. `aplicarLegado()` roda no estado novo e na compra, então vale na hora. Sem o Banco de sementes a fazenda zera junto (`novoEstado(agora, estrelas, temporada, legado, culturas)`). **Editar salão** (botão na barra das abas) mostra a grade e a área de cada peça: arrastar ou foco + setas; verde cabe, vermelho não. **Fazenda** (aba `roca`): cena fixa de 352×208 px de arte (Kenney Tiny Farm/Town) na escala que cabe, com mata no fundo, campo de terra com os 20 lugares de canteiro (24×24, 10 por fileira; os não comprados aparecem apagados; "Mais canteiros" vai de 3 a 20), celeiro, poço, feno, sacos de adubo e regador conforme as melhorias, fazendeiro e bichos andando (sem colisão, só no gramado da frente). Colher tudo/Plantar ficam na barra das abas. A coluna da direita segue a aba: no Cassino, a loja tem máquinas, prédio e a equipe (que trabalha lá); na Fazenda, o cartão do **Celeiro** (estoque e vender) e a loja de sementes e melhorias. Com irrigação, o canteiro guarda `proxima` (o que entra quando a irrigação colher; sem ela, replanta o mesmo); clicar num canteiro crescendo abre o menu de próxima cultura e **Arrancar agora**, e o botão da barra vira **Trocar todos…**. Fazendeiro (Tiny Farmer, Oul Studio), vaca (Duckhive) e galinhas (chicken and pen) são sprites animados CC0, trocados quadro a quadro pelo JS (`SPRITE` em `public/cassino.js`: listas de quadros por animação andar/parado/gesto; o fazendeiro tem uma linha por direção, na ordem cima, direita, baixo, esquerda); `esc` aumenta o fazendeiro (2×) e a vaca (1,5×) pra ficarem na proporção dos tiles). Galinhas e vaca andam só dentro do galinheiro e do curral (`GALINHAS`, `PASTO`); o fazendeiro, na linha `FRENTE`, e só bate a enxada quando um canteiro é colhido (o cliente compara o `plantado` de cada canteiro entre um desenho e outro e põe na `filaColheita`). Com irrigação e o celeiro sem lugar pras porções, a colheita automática espera: o canteiro mostra **cheio** em vermelho e o cartão do Celeiro avisa. Pacotes que proíbem redistribuir os arquivos (Mini Farm da Jofra, Farm RPG da Emanuelle) não entram, porque o repositório é público. A alavanca saiu da tela (a ação `alavanca` continua no servidor, sem botão). Em telas largas o cassino ocupa a altura da mesa sem rolar (a loja rola por dentro); com o contêiner ≤ 820 px vira uma coluna e a página volta a rolar.

Arte: Kenney, josehzz, Alex Kovacs e Franuka em `public/cassino/` (CC0/CC BY, ver `LICENCA.txt`; o crédito CC BY ainda precisa entrar nos Créditos do app antes de publicar). O tileset do cassino (Game Between The Lines, redistribuição não confirmada) fica em `public/cassino-local/` (as fotos dos amigos saíram do cassino; guardadas em `~/Teletela-backups/fotos-cassino/` no PC do dono), **fora do git** (`.gitignore`) como os sons: um clone novo mostra o cassino sem essas imagens. Testes: `tests/cassino.test.js` (servidor) e `tests/cassino-browser.cjs` (Electron, comprar/coletar/plantar/colher/visitar/ajudar, editar o salão com as setas, 1080p sem rolar, celular no tema claro; `PRINTS=/pasta`). Protótipo original e simulador da economia: `~/Downloads/teletela-cassino-prototipo/` (`node simular.js 2 0`).

### Contas, privacidade e dados (branch de testes)

- A conta é opcional, local à sala, sem e-mail/telefone. Usuário único de 3–24 letras,
  números ou `_`, sem diferença entre maiúsculas/minúsculas; senha 8–128 caracteres e apelido
  independente. Cadastro mantém `accessId` (cargos, ACL e dono) e o perfil. Se um ID público
  já estiver associado a outra conta, gera outro ID público, preservando o accessId comprovado.
- `accounts.json` confirma conta, perfil e sessão juntos. Scrypt assíncrono, até dois hashes
  simultâneos; limites por IP/usuário compartilhados entre HTTP e sockets. Sessões de 30 dias,
  até oito por conta, tokens de 256 bits e recuperação de 192 bits guardados só como hashes.
  Recuperar troca senha/código e revoga sessões e mídia. Logout revoga só a sessão atual.
- Handshake `accountToken` resolve a identidade antes da senha da sala. Token expirado retorna
  `account-session-expired`; o cliente volta ao visitante e permite novo login. `GET /api/account`
  anuncia suporte; `POST /api/account/login`, `/recover` e `/logout` permitem entrar mesmo antes
  da senha da sala. Cadastro usa `account-register` em socket que já entrou na sala. Eventos
  `account-state` e `account-session-ended` sincronizam perfil/sessão. Não emitir `permission-identity`
  para contas: tokens de permissões/provas antigos deixam de autenticar identidades vinculadas.
- Perfis de conta são carregados do servidor antes de editar e nunca sobrescritos pelo visitante
  ao conectar. Edição aguarda a gravação atômica antes de publicar ou anunciar sucesso.
  A sessão local guarda só os campos leves; avatar/banner/som completos ficam na RAM e no
  servidor, evitando duplicar GIFs nas preferências. Importar outro perfil exige sair da conta.
  IDs públicos de contas não podem ser apresentados por visitantes para assumir autoria.
- `PermissionStore.visible` aplica ACL inclusive ao dono; `has` ainda delega administração
  global. Alterar cargos que afetam um canal inacessível é recusado, evitando autoliberação.
  Limpeza nunca mescla perfis apenas pelo nome nem apaga referências de conta/canal no reset.
  Continua sendo controle de acesso do aplicativo: o operador da VM tem acesso aos arquivos.
- Rolagens `NdM` com modificador opcional: 1–100 dados, 2–10.000 lados e modificador até 10.000.
  `crypto.randomInt` sorteia no servidor, que persiste antes de anunciar. Limites: 500 ms e
  20 pedidos/minuto por identidade, inclusive entre canais/reconexões. Histórico geral
  acessível a todos conectados, sem depender de canal ou call. `dice-history` e `dice-roll`
  retornam `scope: server`; `dice-rolled` é anunciado para toda a sala, sem IDs/nomes de
  canais. O nome vem do usuário validado no servidor. Excluir um canal não apaga rolagens.
  O formato v1 por canal é copiado para `dice.json.por-canal-v1` (0600) antes de iniciar um
  histórico geral vazio, evitando publicar registros privados antigos. Sem pasta persistente,
  dura só até reiniciar. `room-info.diceVersion: 2` anuncia suporte; a interface bloqueia a
  rolagem e explica a atualização necessária em servidores antigos, sem inventar resultados.
- Novos módulos Node precisam entrar em `build.files` e no staging de `deploy/oracle/deploy.sh`.
  O APK usa todos os arquivos de `public/`; incrementar `versionCode` junto da próxima release
  e manter assinatura, ID e nome do artefato existentes.

### Acesso por transmissão

O servidor anuncia `streamAccess` em `room-info`. O painel em `public/stream-access.js` usa o evento `stream-access` para preparar ou editar o acesso de cada tela e da câmera na call. A transmissão começa aberta por padrão. `stream-access.js` no Node mantém em memória os convites e bloqueios por identidade de membro, a verificação da senha por HMAC com chave efêmera e as admissões por sessão. O término daquela transmissão ou a saída do dono limpa a regra. Se a conexão de quem transmite cair, o cliente interrompe a fonte protegida e exige revisar o acesso antes de retomá-la. Transmissões restritas não oferecem quadros de prévia.

Os pedidos e as ofertas/respostas P2P e a emissão de tokens de espectador no SFU consultam a mesma regra. A expulsão fecha o peer de saída no transmissor e retira a reprodução no espectador. Cada espectador tem uma identidade de mídia própria por transmissão no SFU, revogada pelo endpoint interno existente, inclusive ao sair do canal. A voz, o bot de música e as outras telas têm sessões independentes. O cliente novo e o servidor Node atualizado habilitam o recurso.

### Amigos por conta e controles em tela cheia (31/10/2026, local)

`accounts.json` v2 ganha `friendships`, opcional ao ler arquivos anteriores. Cada relação
guarda `from`, `to` e `status` (`pending`/`accepted`), sem duplicar o par. A gravação usa a
mesma fila/rename das contas: não anuncia sucesso nem troca o estado em RAM se falhar.
Limites: 500 relações/pedidos por conta e 25 mil na sala. Só o destinatário aceita/recusa;
o remetente cancela e qualquer lado remove uma amizade aceita.

`friend-list/request/accept/reject/cancel/remove` exigem sessão autenticada no socket,
com limite por conta. O cliente nunca escolhe o autor. `friends-state` retorna somente
ID de conta, usuário, apelido e presença (esta apenas para amizades aceitas); não retorna
credenciais, dados de canal ou o perfil completo. Presença considera qualquer sessão
válida conectada, mesmo fora de call, e atualiza ao conectar/desconectar/recuperar/sair.
Não é uma lista global entre servidores. Clientes antigos ignoram os novos eventos;
o painel novo informa falta de suporte ao entrar em servidor anterior.

`public/friends.js` também apresenta a amizade no mini perfil usando o ID de conta fornecido pelo servidor para membros autenticados. O mesmo estado de pedidos alimenta o perfil, a aba Amigos na lateral e a aba correspondente na navegação móvel.

As ligações de voz entre amigos usam o módulo Node `private-calls.js` e o cliente
`public/private-calls.js`. O convite expira em 30 segundos. O primeiro aparelho a
atender fica vinculado à ligação. O servidor emite credenciais de host e viewer
para duas salas efêmeras do SFU, uma por sentido da voz. Ao desligar, perder a
conexão ou remover a amizade, o servidor revoga as duas identidades de mídia.
A ligação fica em memória e exige SFU configurado. O P2P do servidor local de
desenvolvimento continua disponível para testar canais comuns.

Convite e toque valem mesmo com uma das pessoas num canal de voz (inclusive o de
ausentes): `reachable` só exige `private-ready` e nenhum bloqueio da moderação
(`moderated`, que ignora o mutado automático do canal de ausentes). Ao atender, o
servidor chama `leaveCurrentChannel` para os dois aparelhos e manda o `soundSeed` em
`private-active.leftSeed`; o cliente só desliga a voz do canal (`leaveCallLocally`).
Ligação atendida exige os dois fora de canal (`available`), e só ela bloqueia o
`join-channel` (`busy`); tocando, a pessoa ainda pode trocar de canal. O cliente
mostra um `<dialog>` não modal no topo, com toque sintetizado em Web Audio
(recebendo: notas subindo; ligando: tom de chamada de 425 Hz), sem tocar no Não
perturbe. A foto vem de `calls.lookup`, preenchido por `friends.js`.

Atendida, a ligação abre a sala `#private-room` (`body.private-room-open`), que esconde
palco, chat da call e Amigos. Qualquer navegação da pessoa (`closeFriendsPage`,
`setMobileView` sem `automatic`, aba Amigos) só fecha a sala; a ligação segue no cartão,
com o botão **Abrir**. A conversa privada é o mesmo `#dm-dialog`, movido para dentro da
sala por `direct.dock()` (aberto com `show()`, classe `dm-docked`) e devolvido por
`undock()` ao desligar ou ao abrir uma conversa pela lista. Quem fala é medido localmente
(AnalyserNode no microfone e no áudio recebido); mutado e ensurdecido vão ao outro lado
por `private-state` (`{ id, muted, deafened }`), repassado pelo servidor só dentro da
ligação atendida. Ensurdecer silencia o `<audio>` da ligação e muta o microfone.

Tela na ligação: `private-token` aceita `kind: 'screen'` (sala `priv-<id>-<lado>-tela`,
mesma identidade de mídia da voz, revogada junto). A captura é `captureScreen()` em
`app.js`, extraída de `onStartScreenShare` e usada pelos dois (qualidade, fonte, som do
PC/app, Android); `releaseScreenCapture()` desfaz rota de som e áudio por processo.
Quem transmite manda `sharing: true` no `private-state`; o outro abre uma `SfuSession`
viewer `kind: 'screen'` com o socket do par (`private-active.peer`) e fecha ao receber
`false`. O som da tela recebida segue o "desativar áudio" da ligação.

Teste completo com voz: `PRIVATE_CALL_TEST=1` em `tests/controls-friends-browser.cjs`
precisa de um SFU compilado do código atual (`go build -o <pasta temporária>/sfu ./sfu`;
o `telinha-sfu` antigo da raiz recusa as senhas novas) e de
`SFU_SECRET`, `SFU_PATH=ws://127.0.0.1:<porta>/ws` e `SFU_INTERNAL_URL`. O offscreen
headless captura imagens 1×1; para prints, rode num compositor virtual separado
(`kwin_wayland --virtual --socket <nome>`) com `--ozone-platform=wayland`.

`public/accounts.js` restaura as preferências em memória se a gravação da sessão falhar.
`public/stage-controls.js` esconde a barra após 3 s em tela cheia nativa ou alternativa CSS,
mantém Tab/toque disponíveis e suspende a ocultação durante hover, arraste ou foco de teclado.
As faixas de participantes seguem suas próprias regras.

Android: `ScreenCaptureService` + `NativeScreenCapture` usam MediaProjection/WebRTC local
para fornecer uma MediaStream à interface; o fluxo de envio P2P/SFU existente a publica.
Detalhes, limitações de áudio e comandos de teste em [ANDROID.md](ANDROID.md).
Validação: `npm run test:friends`, `npm run test:friends:ui`, `npm run test:android:screen`.
O último exige emulador aberto e APK local instalado; só usa dados de uma sala temporária.

### Lista de membros e exclusão do Geral (31/10/2026, local)

`server-members` entrega pessoas da sala inteira, inclusive fora da voz, agrupadas por
identidade comprovada (`accessId`), sem mesclar nomes iguais. Aparelhos da mesma conta
contam uma vez; fica offline somente ao desconectar o último. Perfis conhecidos usam os
registros de permissões, e contas offline mantêm os campos públicos salvos. Visitantes
offline sem foto persistida aparecem com iniciais. A lista não contém canal, atividade,
fala/mute/transmissão, credenciais ou permissões administrativas. Isso permite listar a
pessoa sem revelar a call privada em que ela está.

Atualizações de canais agendam a leitura; um resumo do resultado evita anunciar e
reconstruir a lista por mudanças de fala, mute ou relógio. Conexões novas recebem o estado
mesmo quando o resumo global não muda. `room-info.membersVersion: 1` anuncia suporte.
`/api/member-avatar/:memberId?access=...` usa a chave efêmera de uma conexão válida e
responde sem cache. Fotos offline vêm apenas do perfil de conta; `profileUpdatedAt` em
`accounts.json` invalida a URL depois de editar. Nenhum arquivo novo de dados é criado.

`public/server-members.js/css` acrescentam a lateral e os botões no topo desktop/celular.
Busca e perfil funcionam offline; recolher é salvo no desktop. Em janelas estreitas o
painel abre sobre o conteúdo, com fechamento por fora/Escape/Voltar e foco pelo teclado.
O perfil usa o estado público da lista quando a pessoa não está numa call visível.

O Geral continua sendo o canal público inicial, mas `manageChannels` permite excluí-lo.
`channels.json.deletedDefaultChannels` registra `geral` para não recriar ao iniciar, e
pedidos de entrada antigos deixam de criar um Geral temporário. O cliente também não
inventa o canal ausente. Gravação é confirmada antes de expulsar os participantes; falha
de disco preserva o canal e a call. Criar explicitamente outro canal chamado Geral continua
permitido e ele passa a ser um canal comum. Servidor anterior ignora o registro de exclusão:
evite downgrade sem restaurar/ajustar o backup dos canais. O app antigo pode mostrar um
Geral fantasma, mas o servidor novo recusa entrar/recriá-lo automaticamente.

Testes: `node --test tests/server-members.test.js` verifica persistência entre reinícios,
autorização, falha de gravação, links antigos, presença, aparelhos e privacidade/fotos.
`electron tests/server-members-browser.cjs` confere perfil, busca, recolher, chat central,
três temas, celular e a exclusão do Geral pela interface. Também passaram a regressão
de canais/admin e a regressão móvel. Sem release/deploy nesta retomada.

### Tempo individual por canal (31/10/2026, local)

Substitui no contador visível o total único de calls da 4.2.1. Cada identidade acumula
separadamente em cada canal durante o dia de Brasília. Geral → AFK pausa um e inicia o
outro; voltar retoma o acumulado correto. Saída, desconexão, movimento pela moderação e
AFK automático continuam usando a mesma rotina de entrada/saída. O reset diário não muda.

`DailyCallStore.joinChannel` vincula cada socket a um canal e mantém acumuladores por
identidade/canal. Duas sessões da mesma identidade no mesmo canal contam a união dos
períodos. Se os aparelhos estiverem em canais diferentes, cada canal conta seu período.
`snapshotChannel` produz `{ ...snapshot, scope: 'channel', channelId }`. O `publicUser` e
`daily-call-times` passam a usar esse snapshot apenas para canais visíveis ao destinatário;
a lista global de membros continua sem expor tempo/canal privado. `snapshot` permanece
como total geral separado, para compatibilidade e preservação do registro anterior.

`daily-call-time.json` passa a `{ version: 2, day, timeZone, totals, channelTotals }`, com
`channelTotals[canal][identidade]` em milissegundos. Mesmo arquivo, backup, escrita atômica
e modo 0600; nenhum período desligado é contado. Arquivos anteriores recuperam `totals`
e começam os acumulados por canal vazios: o registro anterior não tem informação para
distribuir o tempo já transcorrido entre canais. Não atribuir o total antigo ao canal
em que a pessoa entrou primeiro. Excluir um canal limpa seu acumulado; recriar o mesmo
ID começa do zero. Migração/limpeza de identidade percorre todos os acumuladores.

A interface diferencia o snapshot por canal pelo `scope` e ajusta a dica do contador.
Contra servidor anterior, continua mostrando o total antigo com a descrição correspondente.
É preciso atualizar servidor e app para ativar o comportamento novo. Sem release/deploy
nesta sessão; o APK local foi reconstruído. Testes de calendário/persistência, AFK real
do servidor, duas pessoas no Electron, troca Geral/AFK, retorno e reabertura passaram,
incluindo os três temas e o layout de celular.

## 12. Convenções

- **Tudo em português**: interface, mensagens, comentários e commits. Tom informal, do jeito
  que o grupo fala.
- Comentários explicam o **porquê**, curtos, no mesmo estilo dos que já existem.
- Commits: `git add -A -- . ':!public/sounds'` (**nunca** adicionar os áudios) e mensagem em
  português dizendo o que mudou pra quem usa. Quem commita com IA costuma terminar com a
  linha `Co-Authored-By` da ferramenta.
- Sem framework no front: HTML + CSS + JS puro, módulos ES. Sem build do front.
- Ícones: SVG desenhado no mesmo traço (`stroke-width 2`, `round`), classe `icon-svg`.
  Emojis só onde é emoji mesmo (reações, soundboard).
- Cores sempre pelos tokens CSS (`var(--bg-primary)` etc.) pra funcionar nos 3 temas.
- O servidor valida tudo que vem do cliente (`safeObject`, regex, limites de tamanho) e nunca
  confia no app. Mídia enviada passa por checagem de tipo (`imageMatchesType`, `SOUND_RE`).
- Compatibilidade: o servidor manda alguns eventos com dois nomes pra app antigo
  (`channels-list` + `channels-summary`, `user-state-changed` + `user-state-updated`), e o
  cliente só escuta um. Evento novo não pode quebrar quem ainda não atualizou.

## 13. Armadilhas conhecidas

**Auditoria local de segurança (10/11/2026):** veja
[achados, evidências e prioridades](AUDITORIA-SEGURANCA-2026-11-10.md).
Foram confirmadas falhas envolvendo identidade pública de visitantes, sussurros,
anexos de salas com senha e tokens de mídia após moderação. Há também dependência
vulnerável identificada. As cinco falhas receberam correções e regressões;
release e deploy concluídos na 4.5.1 em 13/11/2026. Riscos adicionais da auditoria continuam registrados.

- **Identidade pública não autoriza autoria (correção local de 10/11/2026):** mensagens
  usam `authorMemberId`; canais novos persistem `createdByMemberId` em `channels.json`;
  sons novos persistem `ownerMemberId` no índice do soundboard; reações novas incluem
  `m` (ID do membro). Campos antigos de perfil continuam só para aparência/compatibilidade.
  Não deduzir propriedade de conteúdo legado pelo `profileId`, mesmo quando só houver
  uma correspondência: um visitante pode copiar esse identificador. Conteúdo sem prova
  exige moderação para exclusão; reações antigas permanecem sem reivindicação automática.
  Criadores e donos dos sons entram nas referências preservadas pela limpeza de membros.
- **Moderação e SFU (correção local de 10/11/2026):** publicação e recepção de voz têm
  identidades temporárias separadas de tela/câmera/música. Mute revoga a publicação;
  deafen revoga também a recepção. Sair da call revoga as três identidades. O endpoint
  existente `/revoke` do SFU continua igual, com até três tentativas; falhas são registradas
  e uma indisponibilidade entre Node/SFU pode atrasar o fechamento de mídia já aberta.
  Testes novos: `npm run test:security` e `npm run test:security:ui`. Como há mudança em
  `public/app.js`, publicar exige release da interface e deploy do servidor, só a pedido.

- **Reversão dos microfones na 3.6.2:** a 3.6.1 foi revertida após relatos de flicker
  e falha na redução de ruído. O grafo de áudio e os controles voltaram aos da 3.6.0;
  o nivelador, o worklet novo e a atualização periódica do nível na interface foram retirados.
  Os testes locais anteriores não reproduziram os problemas relatados; a causa não foi
  isolada. Não reaplicar essa mudança sem investigar nos dispositivos afetados. O código
  e o diagnóstico da tentativa continuam no histórico do commit `e5ac540`.

Coisas que já deram problema e o motivo:

1. **Mudou `public/` e só fez deploy:** quem usa o app não recebe nada, porque a interface
   vem instalada nele. Precisa de release.
2. **Esqueceu de aumentar a versão** no `package.json`: o release sai, mas ninguém atualiza.
3. **`public/sounds/` fora do git:** são vozes dos amigos e o repositório é público. Os
   arquivos ficam só no PC do dono, mas **vão dentro do instalador**, então o release tem que
   ser feito de um PC que tenha essa pasta. Clonando o repositório em outro lugar, os sons de
   entrar/sair e os "Áudios do app" do soundboard não existem.
4. **`dnf` na VM antiga** trava a máquina (1 GB de RAM). Não rode; a nova usa Ubuntu.
5. **Mídia baixada com `fetch()` pelo app** (som de entrada, soundboard) precisa do cabeçalho
   `Access-Control-Allow-Origin: *` no servidor, porque o app roda em `telinha://app` (outra
   origem). Sem isso o som toca só pra quem subiu. `<img>` não precisa disso.
6. **Reiniciar o servidor** (todo deploy faz isso) perde o chat da call, a moderação do admin
   e a mídia do perfil até cada um reabrir o app.
7. **Electron do sistema:** não há Electron em `node_modules`; o `npm run app` e os scripts de
   teste usam o binário do sistema (`command -v electron` ou `/usr/lib/electron*/electron`).
   `npx electron` baixa outra versão: não use.
8. **Ícone no `.exe`:** a config do Windows usa `"signExecutable": false` (e não
   `signAndEditExecutable: false`), senão o electron-builder não grava o ícone no executável.
9. **`uiohook-napi`** (atalhos com Ctrl/Shift/Alt sozinhos) é dependência **opcional** e usa
   binário pronto (N-API). Por isso o build tem `"npmRebuild": false`. Se ela não carregar, as
   teclas sozinhas só funcionam com a janela em foco.
10. **Wayland:** atalho global no meio do jogo é do compositor; o app abre um socket em
    `$XDG_RUNTIME_DIR/telinha.sock` que o compositor chama (`/mute`, `/deafen`). Está no README.
11. **Ensurdecer não cala as transmissões** (escolha do grupo). Quem quiser o jeito antigo
    marca a opção em Configurações → Som (`prefs.deafenStreams`).
12. **Mic aparecendo mutado mas falando:** quem ouve zera o volume de quem está com
    `isMicOn: false` (proteção contra app antigo). Se mexer em `applyUserVolume`, mantenha isso.
13. **Senha da sala com app antigo:** quem está numa versão antes da 3.2 não consegue digitar
    a senha. Coloque senha só depois que todo mundo atualizar.
14. **Arquivo `channels.json`/`text/*.jsonl` corrompido:** o servidor ignora linhas inválidas
    em vez de cair; o arquivo é reescrito via `.tmp` + `rename` pra não corromper no meio.
15. **Duas VMs atualizando DuckDNS:** a antiga pode reapontar o domínio para si a cada 30 min.
    Desative o timer antigo antes de ativar o novo. A cópia final dos dados precisa da antiga
    parada. Procedimento e volta em [MIGRAR-SERVIDOR.md](MIGRAR-SERVIDOR.md).
16. **Restore rejeitando backup válido:** não use `grep -q` na listagem do tar com pipefail;
    o pipe fecha antes de o tar terminar e provoca SIGPIPE. O validador lê a listagem completa.
17. **SFU parando uma faixa por erro de um espectador:** o `TrackLocalStaticRTP.Write` do Pion
    tenta enviar para todos e retorna erros agregados. Encerrar a leitura do host nesse erro
    interrompia a faixa também para espectadores saudáveis. `forwardPackets` continua o
    repasse até o host encerrar; erros de envio são registrados no máximo a cada 5 s por faixa.
    Testes em `sfu/main_test.go`; contexto e limites em
    [DIAGNOSTICO-TRANSMISSOES.md](DIAGNOSTICO-TRANSMISSOES.md).
18. **GIF congelando com modo leve desligado:** as regras de avatar estático precisam de
    `html.light-mode`. A pausa em segundo plano é independente (`pauseInBackground`) e deve
    prevalecer sobre fala, mouse e perfil aberto. GIF não obedece `animation-play-state`:
    avatares usam o canvas de `freezeAvatar`; animações CSS precisam pausar também os
    pseudoelementos das molduras. Sem as duas opções, os avatares animam continuamente.
19. **GIF parado no perfil grande impedindo ampliar:** `.profile-card-avatar` também
    precisa liberar a animação no modo leve. O clique para ampliar procura a imagem dentro
    do avatar inteiro, inclusive se o alvo do clique for o canvas estático.
    Os avatares têm uma janela `.avatar-photo` que recorta a imagem animada; o canvas de
    `freezeAvatar` recebe o mesmo enquadramento. A pausa em segundo plano continua
    prevalecendo no perfil aberto.
20. **Próprio AO VIVO sem abrir com a prévia oculta:** `hideOwnStream` controla a abertura
    automática. `localPreviews` guarda o `MediaStream` original mesmo escondido; o clique
    explícito usa esse mesmo objeto em `registerScreenStream(..., true)`, sem outra captura,
    conexão SFU ou assinatura de si próprio. O ✕ sobre a prévia local chama `removeScreenStream`,
    mantendo captura e transmissão. Parar a transmissão chama `dropLocalPreview` e limpa
    também o registro. Não chame `unwatchScreen` nem pare faixas para esconder a prévia.
21. **Início e hover em PC fraco:** o início usa as listas que já chegam do servidor,
    sem consultas extras ou vídeos. As fotos usam `avatarInnerHtml`, respeitando recorte,
    modo leve e pausa em segundo plano. Uma assinatura de canais/nomes/cores/fotos/recortes/
    molduras evita reconstruir os cartões durante mudanças de fala, mas atualiza a foto editada.
    O hover das reações exibe apenas sete botões já disponíveis; a importação e os dados
    do seletor completo só são carregados pelo **＋**. Há apenas um timeout curto ao
    sair do hover para atravessar o espaço entre botão e painel.
22. **Atividade sem varrer processos na interface:** só o main lê processos locais, com
    operações assíncronas e limite de concorrência. O tempo na tela muda apenas o texto,
    sem reconstruir canais ou fotos. Uma geração de consulta descarta detecções pendentes
    ao desligar o compartilhamento. O preload não expõe a lista de processos.

- **Teste da janela de transmissão sem tela.** `tests/stream-window-browser.cjs` termina com
  falha de segmentação (código 139) no prefixo headless (`--ozone-platform=headless`), mesmo no
  código antigo: a janela destacada com vídeo precisa de um compositor. Rode com uma tela de verdade
  (combinando com o dono) ou com um compositor virtual.
- **Animação de entrada com o app em segundo plano.** Com "Pausar animações em segundo plano" ligado,
  `animation-play-state: paused` congela as animações no primeiro quadro. Uma entrada que começa
  com opacidade baixa (a `chegada-na-call` de `sala.css`) deixa o cartão apagado até o app ganhar foco.
  Entradas novas devem partir do elemento visível (o Aconchego usa só escala e desliga a animação sem foco).

### Nomes que não podem mudar

Mudar qualquer um destes quebra a atualização automática ou faz a galera perder dados:

- `appId: com.castzin.telinha` e `desktopName: telinha.desktop` (package.json).
- A pasta de dados do Electron fixada em **"Telinha"** (`app.setPath('userData', ...)` no
  `main.cjs`).
- Repositório `Castzzz/Teletela` (o auto-update procura os releases lá).
- Chaves de preferências como `telinha_prefs`, `telinha_audio_*`.
- Nomes de artefato `Teletela.AppImage`, `Teletela-Setup.exe` etc. (os links do README
  apontam pra eles).
- Na VM: serviços `telinha-*`, `/opt/telinha`, `/etc/telinha`. Dá pra mudar, mas exige
  migrar na mão.

## 14. Checklist pra uma mudança

1. Ler a seção certa do `app.js`/`server.js` (tabela da §11) e seguir o estilo do redor.
2. Mexeu no servidor: validar entrada, pensar em app antigo e acrescentar caso no `m4`.
3. Rodar `npm test`, `node --test tests/m1-*.test.js tests/m2-*.test.js tests/m3-*.test.js`
   e `node tests/m4-channels-admin.test.js`.
4. Conferir na tela (`npm run app`, de preferência com dois apps num servidor local).
5. Atualizar o README (curto: só a lista "O que tem" e "Deu problema?") se mudou algo que o usuário vê, e este arquivo se
   mudou arquitetura, deploy, dados ou uma armadilha nova.
6. Pra lançar: versão no `package.json` + popup de novidades, commit sem `public/sounds/`,
   `npm run release` e/ou `npm run deploy:oracle` (tabela da §6).


### Migração de propriedade da 3.8.0

O deploy gera `OWNER_KEY` independente de `ADMIN_KEY` em `/etc/telinha/telinha.env`, sem
imprimir seu valor. Quem conhece a senha compartilhada antiga não pode assumir/recuperar
a propriedade. Não reutilize o valor antigo nessa chave nova.

O operador pode fornecer `/etc/telinha/owner-bootstrap.json` (root, 0600) contendo apenas
`permissionToken` do perfil confirmado. Com os serviços parados, o instalador executa
`scripts/configurar-dono.mjs`: verifica o HMAC contra `permissions.json`, vincula o dono,
preserva os cargos e apaga o pedido. UUID público/nome não são aceitos como comprovação.
O script não imprime a credencial; o arquivo nunca deve entrar no Git. O backup anterior
à migração precisa incluir `data/permissions.json` e `telinha/telinha.env`.


### Publicação 3.8.0 concluída em 26/10/2026

Código de release: `364043e`, tag [v3.8.0](https://github.com/Castzzz/Teletela/releases/tag/v3.8.0).
Node/SFU/Caddy ativos na VM; perfil do proprietário comprovado por HMAC e vinculado antes
do início do Node novo. Cargos e atribuições anteriores foram comparados ao backup e
preservados. API `get-channel-settings` e protocolo de propriedade v2 conferidos na sala.

Windows Setup/portátil, Linux AppImage/tar.gz, blockmap, `latest.yml`, `latest-linux.yml`
e APK publicados (8 arquivos), tamanhos/SHA256 verificados contra o GitHub. SHA512 dos
metadados Windows/Linux corresponde aos instaladores. APK 3.8.0/versionCode 5 usa a mesma
assinatura da 3.7.0. Ainda falta escuta dos microfones/teclados e teste físico no Android.

Backups íntegros antes/depois: `~/Teletela-backups/teletela-dados-2026-10-26_17-23-58.tar.gz`
e `~/Teletela-backups/teletela-dados-2026-10-26_17-37-35.tar.gz`. O segundo inclui a
propriedade e a chave exclusiva de recuperação; o pedido privado de migração foi removido.

### Publicação 3.9.0 concluída em 27/10/2026

Tag [v3.9.0](https://github.com/Castzzz/Teletela/releases/tag/v3.9.0), código `63d5d99`.
Microfones restaurados ao processamento da 3.7; música compartilhada e playlists
habilitadas na Oracle. SFU/Node/Caddy ativos; fontes extraídas como usuário telinha.
Node v24.22.1 e Caddy 2.11.7 preservados, FFmpeg 8.0.1/libopus e yt-dlp 2026.10.26 instalados.

Validação pública com faixa Spotify buscada no YouTube: dois ouvintes Electron receberam
áudio da mesma sala SFU na Oracle, ~49,99 pacotes/s e ~0,15% de correção de ritmo.
Corrigido o formato de `urls` ICE exigido pelo Pion. Canal temporário encerrado após o teste.

Publicados os oito artefatos: Windows Setup/portátil, Linux AppImage/tar.gz, blockmap,
`latest.yml`, `latest-linux.yml` e APK. SHA-256/tamanhos iguais ao GitHub; SHA-512 dos
metadados de atualização conferido contra os instaladores. APK 3.9.0/versionCode 6 mantém
a assinatura da 3.8.0. Assets de microfone/música nos pacotes equivalem aos arquivos testados.

Testes: 62 do runner, 78 de permissões/perfil, 15 de música, integração m4, Go com race,
áudio comparado ao grafo 3.7, controles/mute, celular/permissões na interface e bot pelo
SFU com STUN. A qualidade nos aparelhos reais deve ser conferida pelos amigos.
Backups antes e depois: `~/Teletela-backups/teletela-dados-2026-10-27_17-49-34.tar.gz` e
`~/Teletela-backups/teletela-dados-2026-10-27_18-01-25.tar.gz`. Segredos preservados na VM,
sons dos amigos fora do git. Resultado e histórico em [TESTE-BOT-MUSICA.md](TESTE-BOT-MUSICA.md).

### Ajustes do cinema, música e dados após a conferência de 28/10/2026

A faixa do cinema usa itens horizontais com avatar, nome e indicadores de áudio/transmissão
em regiões separadas. A música fica ao lado e não entra no contador de pessoas. Avatares
continuam preservados ao mudar apenas a fala; tela cheia, temas e modo leve permanecem.
O painel do bot separa reprodução, busca, resultados e fila; controles são os mesmos.
Dados prontos rolam ao clicar e exibem o total em destaque, com histórico geral da sala.
Testar a interface desta branch contra servidor anterior não habilita os handlers novos:
para os dados funcionarem na sala oficial são necessários release do cliente e deploy do Node.

### Retomada do cinema, música e chat em 28/10/2026

Aberta ou recolhida, a faixa de participantes acompanha a interação com o vídeo. Ela some
ao tirar o mouse ou após 2,5 segundos parado. O toque a revela e o foco de teclado na faixa a mantém visível.
Os snapshots de música e de fala não reiniciam esse tempo. A fala fica na borda dos avatares.

A barra de ações fica acima do overlay de participantes. Na tela cheia nativa, o mesmo
`#stage-controls-bar` acompanha o alvo (`.video-tile` ou `#videos-grid`) e volta ao marcador
original ao sair, preservando os listeners. Guarda-se também uma referência à barra
para recuperá-la caso o vídeo em tela cheia seja removido ao parar de assistir.
Isso mantém o seletor de reações clicável;
no fallback CSS a barra permanece fixa embaixo. Não subir a camada de participantes acima
da barra: popovers filhos não conseguem escapar do contexto de empilhamento do pai.

`updateTextLayout()` usa `text-full` para canais de texto abertos e `text-with-stream`
quando existe transmissão. A prévia é o próprio `#stage-section` reduzido por CSS (arrastável
pela tela via `--stream-preview-left`/`--stream-preview-top`, sem reservar folga gigante no
final de `#chat-messages`): nenhum
vídeo, MediaStream, captura ou conexão é recriado ao mudar a conversa. O chat da call usa
a lateral e conserva a largura salva; o canal independente ocupa o centro. No celular,
a prévia fica acima do chat e abaixo da barra da call, escondendo-se com o teclado aberto.

A limpeza da busca de música incrementa uma revisão própria para ignorar respostas em
trânsito. Não reutilizar a revisão de áudio/canal: limpar resultados não deve reiniciar
a escuta. Botão **Limpar busca** e envio de campo vazio compartilham esse caminho.

Validação: `npm test`, suítes m1/m2/m3, `npm run test:mobile` e
`npm run test:music:call`. O último testa alvos de clique e arraste reais, faixa recolhida,
reações em tela cheia, chat central em PC/celular, continuidade do vídeo e do áudio,
limpeza de resposta atrasada e preservação da fila. APK de teste atualizado localmente.


### Câmera frontal/traseira e nome do dono (28/10/2026)

O celular agora tem **Virar** nos controles da call e **⋯ → Virar câmera**. A lógica de
captura está em `public/camera-source.js`, integrada ao fluxo de câmera em `app.js` e aos
controles de `mobile.js`. Mantém a MediaStream, troca apenas o vídeo com `replaceTrack`
nos emissores da câmera e conserva os peers de voz e transmissão de tela. Caso um emissor
recuse a substituição, reconecta apenas aquele envio de câmera. O fluxo inicial e o de
troca têm cancelamento por geração para não reabrir a câmera depois de sair/desligar.

Armadilha: alguns Androids encerram a lente antiga ao abrir a outra, ou exigem que a
captura antiga seja liberada. O `onended` da faixa antiga durante a troca não deve chamar
`stopCameraShare`; o controlador trata esse encerramento e a recuperação. Se a troca
falhar, mantém a captura antiga ou tenta reabri-la, sem mexer no microfone. Detalhes e
validação em [ANDROID.md](ANDROID.md#alternar-câmera-28102026).

A coroinha foi retirada do nome do proprietário na lista, na call e no cabeçalho do
perfil. O texto **Dono do servidor** continua nos detalhes do perfil; identidade,
propriedade e permissões não mudaram. Não transformar a retirada do selo numa alteração
de `isOwner`, `isAdmin` ou dos handlers do servidor.

### Publicação da 4.1.0 (28/10/2026)

Release pública [v4.1.0](https://github.com/Castzzz/Teletela/releases/tag/v4.1.0), código
`7f68864` integrado à main. Inclui Windows (Setup/Portátil), Linux (AppImage/tar.gz), APK
Android (4.1.0, código 8) e os manifests de atualização.

Servidor atualizado com backup anterior em
`~/Teletela-backups/teletela-dados-2026-10-28_19-42-14.tar.gz`. Node `v24.22.1` e Caddy
`2.11.7` foram mantidos, sem trocar versões de infraestrutura. Serviço Node, SFU e Caddy
ativos, saúde HTTP e hashes do código instalado conferidos. A assinatura do APK permanece
a mesma, permitindo atualizar a instalação anterior.

A pedido do dono, a bateria de testes já executada foi reaproveitada; na publicação foram
conferidos versão, build/lint, conteúdo dos pacotes, hashes/tamanhos e links de atualização.
Os artefatos foram gerados com `npm run dist -- --publish never` e `npm run build:android`.
O release foi preparado como rascunho, recebeu os oito arquivos e só depois foi publicado
como latest, com notas em português. Assim não houve uma versão pública com assets pela metade.

### Inicialização, busca e diagnóstico (30/10/2026, ainda sem publicação)

Branch `melhoria/inicializacao-busca-e-diagnostico`:

- `electron/autostart.cjs`: opção desligada por padrão em Configurações → Aparência.
  Consulta o estado do sistema; Windows usa `get/setLoginItemSettings` e Linux usa
  `$XDG_CONFIG_HOME/autostart/telinha.desktop` (ou `~/.config/autostart`). AppImage aponta
  para `APPIMAGE`, nunca para o mount temporário. No desenvolvimento aponta para o Electron
  do sistema e `electron/main.cjs`. Portátil Windows mostra a limitação. Não depende do
  perfil nem do servidor e não entra na call. Mover o AppImage exige reativar a opção.
  A ponte aceita somente a interface instalada e a tela inicial, na frame principal.
- `public/message-search.js`: lupa no chat e cabeçalho móvel; texto, autor e data inicial
  (limite em UTC), sem diferença de acento/maiúscula. Busca por canal, páginas de 30 do mais
  novo para o antigo. “Ver contexto” mostra até três mensagens de cada lado, sem alterar
  o cache paginado do chat. Eventos `message-search` e `message-context` checam acesso
  no servidor antes de ler arquivos e compartilham limite de uma consulta por 700 ms/socket.
  Usa o JSONL consolidado (edições e exclusões aplicadas), inclusive além das 250 mensagens
  em memória, até a retenção existente de 50 mil/canal. O chat da call continua efêmero,
  limitado às 50 mensagens da call atual. Resultados são limpos ao perder acesso/desconectar.
  Não há migração de dados nem índice adicional; a leitura é síncrona, como a paginação
  existente, limitada ao canal escolhido.
- `public/transmission-diagnostics.js`: painel em Mais opções (⋯) no palco e em Configurações → Transmissão.
  `getStats()` a cada 2 segundos apenas com o painel aberto; tela, extras e câmera,
  envio/recepção P2P e SFU. Taxa usa delta de bytes de vídeo; recepção calcula perdas por
  intervalo, envio usa perda informada pelo destino. Codec RTX não é contado como vídeo.
  Dados ausentes ficam indisponíveis; reset de contador não gera valores negativos.
  No SFU mede apenas o trecho local↔SFU, não a conexão inteira entre os amigos.
  Não abre captura, muda bitrate nem coleta IP/candidatos.

Validação: `npm test` (62), suítes m1/m2/m3 + autostart/métricas (84), integração m4,
`node --test tests/message-search.test.js` e Electron do sistema executando
`tests/desktop-tools-browser.cjs` (autostart em diretório temporário, reabertura, busca além
 do cache, contexto, três temas/celular e envio/recepção WebRTC reais). A integração nativa
no Windows e o login real após reiniciar o PC ainda precisam de conferência nesse sistema.

Referências: [Electron: login items](https://www.electronjs.org/docs/latest/api/app#appsetloginitemsettingssettings-macos-windows),
[Desktop Entry: Exec](https://specifications.freedesktop.org/desktop-entry/latest/exec-variables.html),
[estatísticas WebRTC](https://www.w3.org/TR/webrtc-stats/).


#### Hyprland e janela única

A sessão local do dono usa Hyprland sem gerenciador XDG de autostart identificado.
Ao marcar a opção nessa sessão, o app também adiciona um bloco próprio `exec-once` em
`$XDG_CONFIG_HOME/hypr/hyprland.conf`, com backup inicial `.teletela-backup`. O comando
chama um script próprio `autostart/telinha-hyprland.sh`; os argumentos têm escape de shell.
A configuração e seus symlinks são preservados; desmarcar remove só esse bloco/script e
mantém alterações posteriores do usuário. Configuração padrão ausente é informada na tela.
Não dispara o aplicativo na hora: vale no próximo login. Outros ambientes usam apenas XDG.
O app usa `requestSingleInstanceLock` para que disparos duplicados foquem a janela aberta.

O teste de autostart cobre instalação/remoção, reativação sem duplicar blocos, symlink,
backup e execução de argumentos contendo espaços e caracteres especiais. O teste de
interface usa um `hyprland.conf` temporário e verifica a restauração exata ao desmarcar.
A configuração real deste PC não foi alterada nos testes.
Referência: [Hyprland: exec-once](https://wiki.hypr.land/0.53.0/Configuring/Keywords/).

### Experimento de personalização local (30/10/2026)

Branch `experimento/personalizacao-local`, derivada do commit das melhorias de
inicialização/busca/diagnóstico. Inicialmente a personalização ficou separada;
`main` permanece como estava. Sem release/deploy ou alteração de versão.

- `public/personalization.js` / `.css`: seção Personalização em Aparência, seis cores
  prontas, seletor de cor, fundo estático e intensidade de 5 a 30%. As cores claras são
  escurecidas até contraste mínimo de 4,5 com branco nos botões de destaque.
- Preferência `appearanceExperiment: { accent, wallpaper, intensity }` dentro do prefs
  local; não enviada ao servidor nem incluída no perfil compartilhado da conta. A branch
  sem esse módulo ignora a preferência, então alternar entre branches é reversível.
- PNG/JPG/WebP até 2 MB; decodificação local, redução para no máximo 1920×1080 e WebP.
  Apenas data URLs desses formatos, até 3 MB de texto, são aceitas ao restaurar preferências.
  Não aceita SVG, GIF, URL remota ou CSS arbitrário. Bitmap temporário é liberado.
- Usa tokens CSS existentes. Imagens ficam no fundo; cartões, configurações e controles
  preservam superfícies sólidas, sem adicionar blur ou animações. Restaurar remove apenas
  cor/fundo experimentais, sem tocar em tema, perfil, acesso ou volumes.
- Gravações são sequenciais; em falha de persistência restaura o estado anterior e avisa.
  A escolha de outro arquivo/remoção/restauração cancela uma decodificação anterior pendente.

Validação: `node --test tests/personalization.test.js` e Electron do sistema executando
`tests/personalization-browser.cjs`: cor, imagem local real, intensidade, reabertura,
três temas, falha de gravação, remoção e restauração com identidade/tema preservados.
Esse teste também repete os caminhos de inicialização automática, busca e vídeo WebRTC.
Todos os dados e a entrada de autostart desses testes ficam em diretórios temporários.

### Categorias, ordem, apelidos, download e ausentes (30/10/2026, teste local)

Branch `melhoria/categorias-apelidos-e-ausentes`, baseada nas melhorias anteriores. A
personalização foi integrada posteriormente a pedido do dono, sem release/deploy. Os dados antigos continuam
válidos: os canais começam nos grupos padrão até alguém organizar.

- `channel-extras.js` persiste `channel-extras.json` dentro de `TELINHA_DATA_DIR`, via
  arquivo temporário e rename, com rollback em memória quando a gravação falha. Contém
  `categories`, `placements` (`voice:<id>` / `text:<id>` → categoria/posição), `nicknames`
  (por `accessId` e `call:<id>` / `text:<id>`) e `afk: { channelId, minutes }`.
  Faz parte do backup da pasta data; foi incluído nos arquivos do instalador e do deploy.
- Categorias de voz/texto têm tipos separados. Os dois títulos padrão podem ser renomeados;
  os grupos personalizados podem ser criados, reordenados e apagados quando vazios.
  Os grupos padrão permanecem no começo de cada seção. Categorias não acrescentam ACL:
  o acesso continua por canal. Categorias que só contêm canais invisíveis não são enviadas
  a quem não vê nenhum deles, inclusive o dono. Listas de posições só incluem canais visíveis,
  numerados sem lacunas para não denunciar a quantidade de canais ocultos.
- `category-save`, `category-delete`, `category-move`, `channel-move` e `afk-settings`
  exigem `manageChannels`, com máximo de 30 operações por socket em 10 segundos.
  `channel-layout` comunica categorias/posições/ausentes e capacidade de gerenciamento.
  A ordem é compartilhada. Mover usa o ID de um canal anterior ou fim da categoria; não
  aceita destinos de outro tipo ou IDs ocultos. Posições relativas de canais ocultos são
  preservadas. As regras de acesso, senha e propriedade dos canais não mudam ao movê-los.
- `public/channel-organization.js` agrupa a lista existente sem perder seus listeners.
  A alça pontilhada permite arrastar antes de outro canal ou soltar no título de um grupo
  para colocar no final. Um clique abre os seletores de categoria/posição, também para
  teclado e celular. O controle no cabeçalho da lista abre nomes, categorias e ausentes.
  Recolhimento das categorias personalizadas fica local em `collapsedCategories`.
- `chat-nickname-get` / `chat-nickname-set` aceitam somente `scope: 'call'` no canal de voz
  atual e alteram somente o apelido da própria identidade (máximo 25 caracteres, até 10
  mudanças/10 s por socket). A opção **Trocar apelido neste chat** aparece no próprio perfil
  da call, no popup e no cartão ampliado, apenas enquanto está em voz. Não fica no compositor.
  O apelido vale nos participantes e no chat da call. Canais de texto usam o nome de perfil;
  valores antigos `text:<id>` ficam inativos e não podem mais ser consultados/alterados pelo protocolo do chat.
  As mensagens guardam `profileName` para identificar o nome original no tooltip e na busca.
  Histórico não é reescrito; o nome do perfil/conta permanece igual. Apagar o canal limpa
  seu apelido e posição; vazio volta ao nome do perfil. Conta opcional preserva o accessId,
  então usa o mesmo apelido nos aparelhos dessa identidade.
- Imagens da call e dos canais de texto têm **Baixar imagem**, inclusive na ampliação.
  As mesmas rotas recebem `download=1`, validam acesso e devolvem attachment com extensão
  da imagem; não há rota pública alternativa. Revogar acesso bloqueia o download mesmo
  para o dono. CORS permite o uso pela interface instalada; o nome é gerado pelo servidor.
- Ausentes começa desligado. Quem gerencia canais escolhe/cria um canal público sem senha,
  diferente do Geral, e um tempo de 5, 10, 15, 30 ou 60 minutos. A varredura acontece a cada
  10 s; fala, transmissão, câmera e assistir a uma transmissão mantêm a presença.
  `idle-activity` envia apenas atividade sim/não e a preferência, sem teclas ou coordenadas.
  Desktop Windows/X11 consulta `powerMonitor.getSystemIdleTime()` por IPC da interface local;
  Wayland e navegador usam interações dentro do Teletela. A tela explica essa diferença e
  permite desativar em Som (`afkEnabled`), útil ao jogar em silêncio fora da janela.
  Não altera a preferência salva de mute. Não retorna automaticamente ao canal anterior.
  O destino mantém todos mutados, inclusive dono e cargos administrativos, na entrada
  manual ou automática. `applyServerModeration` deriva `afkMuted` do canal atual e o inclui
  em `serverMuted`, sem gravar uma punição no perfil. Entrada, reentrada e atualizações
  bloqueiam microfone/fala; desmutar pela moderação e obter token SFU de voz como host
  nesse canal são negados. Mudar/desligar o destino reaplica o bloqueio aos presentes e
  envia `server-moderation`. A interface silencia o microfone ao entrar e explica o bloqueio;
  sair restaura o estado anterior do microfone, mantendo eventuais punições de moderação.
  `channel-state` e `server-moderation` compartilham `micOnBeforeAdminLock` para preservar
  a escolha durante bloqueios sobrepostos. A restauração reativa a faixa de áudio e
  comunica `isMicOn` ao servidor, sem alterar `prefs.micOn`.
- Ao vencer o tempo, o servidor encerra a participação anterior e emite `afk-move`; o
  cliente entra no destino pelo fluxo normal, que reconfere acesso/senha. Clientes antigos
  que não anunciam suporte via `idle-activity` não são movidos. Se o destino ganhar senha,
  ficar privado ou for apagado, a varredura para; apagar o canal desliga a configuração.

Validação: `npm test` (62), suítes m1/m2/m3 + busca (80), integração m4,
`node --test tests/channel-extras.test.js tests/channel-extras-store.test.js` (3),
e Electron do sistema executando `tests/channel-extras-browser.cjs`: duas pessoas, categorias,
ordem compartilhada por drag/drop e formulário, apelido preservado ao recarregar, download
real de PNG, movimento para Ausentes e interface nos três temas/em 390 px.

Referência para inatividade nativa: [Electron powerMonitor](https://www.electronjs.org/docs/latest/api/power-monitor#powermonitorgetsystemidletime).

As melhorias de categorias/apelidos/ausentes também foram integradas na branch
`experimento/personalizacao-local` para testar tudo junto. Depois, a pedido do dono,
a personalização também foi integrada na branch `melhoria/categorias-apelidos-e-ausentes`.
A `main` permanece sem essas mudanças.


#### Ajuste dos apelidos para voz

A pedido do dono, os apelidos passaram a existir só em voz. Mensagens antigas de texto não
são reescritas; novas mensagens de texto ignoram qualquer apelido de teste anteriormente
salvo. O perfil global/conta permanece igual. Com uma conversa de texto aberta durante a
call, clicar no próprio perfil continua alterando o apelido do canal de voz atual.

Conferido com servidor real (nega get/set para texto e ignora valor antigo) e duas janelas
Electron: menu do próprio participante, opção oculta no perfil alheio, cartão ampliado,
nome recebido pela outra pessoa e persistência ao recarregar/entrar na call novamente.
Criação/nomes/ordem das categorias exigem deploy do servidor; o desktop instalado também
precisa de release para receber a interface. O teste local usa servidor e interface novos.


### Atualizações reunidas (30/10/2026)

A pedido do dono, `experimento/personalizacao-local` foi integrada por fast-forward em
`melhoria/categorias-apelidos-e-ausentes`, que ficou selecionada para os testes de tudo junto.
Inclui inicialização com o PC, busca, diagnóstico de vídeo, categorias/ordenação, apelido
apenas na voz, downloads de imagens, ausentes e personalização. Nenhuma branch foi apagada;
a `main` não foi alterada e não houve push, release ou deploy.


### Publicação da 4.2.0 concluída (30/10/2026)

Release pública [v4.2.0](https://github.com/Castzzz/Teletela/releases/tag/v4.2.0), marcada como
latest e sem pré-release. A tag aponta para `b94a8350357847a153019399e7984a4f94b82c1c`,
integrado por fast-forward e enviado à `main`. Inclui as duas frentes reunidas, com
personalização, e o ajuste final de apelido somente na voz pelo próprio perfil.

- Desktop: Windows Setup/Portátil e Linux AppImage/tar.gz, `latest.yml`, `latest-linux.yml`
  e blockmap do Setup. APK Android 4.2.0, código 9, com a assinatura da 4.1.0 preservada.
- Pacotes gerados com `npm run dist -- --publish never` e `npm run build:android`. A release
  ficou em rascunho até os oito arquivos serem enviados e verificados; depois foi publicada
  como latest. Todos os tamanhos/SHA-256 no GitHub conferem com os arquivos locais. Os dois
  manifests têm versão 4.2.0, tamanhos/SHA-512 válidos e conteúdo público idêntico ao local.
- Pacotes Linux/Windows e APK contêm os módulos novos e os nove sons privados de entrada.
  `public/sounds/` continua fora do Git. Tar.gz validado; o executável Linux empacotado abriu
  a tela inicial e ativou/desativou autostart em configuração temporária do Hyprland.
- Validação: runner (62), testes adicionais incluindo permissões, identidade, busca,
  autostart, personalização e métricas (108), integração m4, interfaces de personalização
  e categorias com duas pessoas, build/lint Android e popup de novidades vindo da 4.1.0.
- Backups íntegros antes de alterar a VM: `~/Teletela-backups/teletela-dados-2026-10-30_20-00-49.tar.gz`
  e `~/Teletela-backups/teletela-dados-2026-10-30_20-05-14.tar.gz` (o segundo foi feito pelo deploy).
- Deploy com Node `v24.22.1` e Caddy `2.11.7` mantidos. Serviços Node, SFU e Caddy ativos;
  `/api/health` saudável. Versão instalada 4.2.0; hashes de `server.js`, `channel-extras.js`
  e `public/app.js` iguais aos locais. Segredos, propriedade, contas e dados preservados.

A `main` ficou selecionada após a publicação. As branches de desenvolvimento foram mantidas.


### Tempo diário por pessoa na call (30/10/2026)

Implementado na branch `melhoria/tempo-diario-na-call`, a partir da 4.2.0 publicada.
Publicado na 4.2.1 com autorização do dono. O contador individual passa de duração da entrada atual para
acumulado em voz no dia civil, com referência comum `America/Sao_Paulo` (Brasília).
O relógio de cada canal (`callStartedAt`) continua medindo a sessão ativa daquele canal.

- `daily-call-store.js`: acumula por `accessId`, com sessões vinculadas aos sockets. Soma
  somente enquanto ao menos uma sessão daquela identidade participa de uma call. Sair,
  trocar de canal, ser movido/removido e desconectar passam por `leaveCurrentChannel` e
  pausam o trecho. Entrar novamente retoma o total. Dois aparelhos da mesma conta/perfil
  contam a união dos intervalos, sem duplicar. Ausentes também é um canal de voz e conta.
- Persistência em `TELINHA_DATA_DIR/daily-call-time.json`, com `{ day, timeZone, totals }`.
  Os totais são milissegundos por identidade, somente do dia corrente, sem nomes ou canais.
  Gravação por arquivo temporário/rename, `0600`, ao entrar/sair, a cada 30 segundos e ao
  fechar o servidor/processo normalmente (inclusive servidor embutido no Electron).
  Reiniciar recupera o último total salvo sem somar o período em que o processo ficou fora.
  Uma interrupção forçada/SIGKILL pode perder os segundos desde o último checkpoint.
  O arquivo participa dos backups existentes da pasta data. Sem diretório, fica em memória.
- Ao mudar a data, descarta os acumulados anteriores. Sessões que continuam abertas
  passam a contar desde a primeira hora válida do novo dia; nenhum tempo de ontem vaza
  para hoje. `public/call-time.js` calcula as fronteiras pelo fuso, incluindo dias históricos
  com horário de verão. Leituras normais usam a janela já calculada, evitando converter
  o fuso para cada pessoa/destinatário durante grandes sequências de presença.
- `publicUser` inclui `dailyCallTime: { day, timeZone, elapsedMs, running, serverTime,
  dayEndsAt }` apenas enquanto aquele socket está em voz. A cada 30 segundos,
  `daily-call-times` atualiza `{ userId, time }` somente para quem pode ver o canal,
  inclusive respeitando canais invisíveis para o dono. Não aceita contadores do cliente.
  A presença de cada canal é calculada uma vez por broadcast e reutilizada entre
  destinatários autorizados; visibilidade e poderes continuam filtrados por destinatário.
- O cliente ancora os snapshots em `performance.now()`, independente do relógio/fuso do
  aparelho. Atualiza a cada segundo, zera localmente na virada mesmo sem outro pacote e
  congela quando a conexão cai. Trocar de canal/recarregar recebe o acumulado do servidor.
  Servidor antigo continua mostrando o contador da sessão anterior, como compatibilidade.
- `daily-call-store.js` foi incluído no instalador e no empacotamento do deploy. Servidor
  e clientes precisam de atualização para disponibilizar o contador novo aos amigos.

Validação: runner (62), m1/m2/m3 + tempo diário (87), testes específicos de calendário,
pausas, troca, aparelhos simultâneos, persistência/reinício, virada e saída do processo,
integração de servidor com privacidade e Electron real com duas pessoas. A conferência
visual cobre meia-noite sem novo pacote, pausa/retorno, troca, reabertura, três temas e
390 px. Todos os dados e relógios simulados desses testes são locais e temporários.

### Publicação da 4.2.1 concluída (30/10/2026)

Release pública [v4.2.1](https://github.com/Castzzz/Teletela/releases/tag/v4.2.1), marcada como
latest e sem pré-release. A tag aponta para `ae01ed6062d1ca70f4d0443a08f86bdcfde65d14`,
integrado por fast-forward e enviado à `main`.

- Oito arquivos publicados: Setup, Portátil, AppImage, tar.gz, blockmap do Setup,
  `latest.yml`, `latest-linux.yml` e APK Android 4.2.1/código 10. Assinatura do APK igual
  à 4.2.0. Tamanhos e SHA-256 de todos os arquivos no GitHub conferem com os locais;
  manifests públicos idênticos aos locais, com tamanhos e SHA-512 validados.
- Pacotes Windows/Linux e APK conferidos com os módulos novos e nove sons privados.
  Tar.gz íntegro. O executável Linux empacotado entrou numa call local e exibiu o
  acumulado diário. `public/sounds/` continua fora do Git.
- Validação final: runner (62), suíte adicional m1/m2/m3, contador diário, permissões e
  identidade (104), integração m4, interface Electron com duas pessoas, popup de novidades
  e build/lint Android. Todos passaram.
- Backups íntegros antes do deploy: `~/Teletela-backups/teletela-dados-2026-10-30_21-30-57.tar.gz`
  e `~/Teletela-backups/teletela-dados-2026-10-30_21-33-43.tar.gz` (automático do deploy).
- Servidor atualizado para 4.2.1, mantendo Node `v24.22.1` e Caddy `2.11.7`. Node, SFU e
  Caddy ativos; saúde pública confirmada. Hashes remotos de `server.js`,
  `daily-call-store.js`, `public/call-time.js` e `public/app.js` iguais aos locais.
  Persistência real confirmada com seis perfis, tempo acumulado, dia de Brasília correto
  e permissão `0600` em `daily-call-time.json`.

A `main` ficou selecionada após a publicação. As branches de desenvolvimento foram mantidas.


### Publicação da 4.3.0 concluída (31/10/2026)

Release e deploy solicitados explicitamente pelo dono.
[4.3.0 pública e marcada como mais recente](https://github.com/Castzzz/Teletela/releases/tag/v4.3.0),
sem pré-release; tag no commit `76648db1c4e62f09ce7aed9d1a2e703ffc0abf43`.

- Oito arquivos publicados: Setup, Portátil, AppImage, tar.gz, blockmap do Setup,
  `latest.yml`, `latest-linux.yml` e APK Android 4.3.0/código 11. Tamanhos e SHA-256
  conferidos com os locais; manifests públicos idênticos, com SHA-512 e tamanhos validados.
  Assinatura do APK preservada em relação à 4.2.1; permite instalar por cima.
- Pacotes Windows/Linux conferidos com os módulos novos e os sons privados.
  `public/sounds/` continua somente no disco e nos instaladores, fora do Git.
- Testes funcionais, integrações de contas/amigos, membros, canais e contador por canal,
  interfaces desktop/celular, popup de novidades e build/lint Android passaram. Captura
  Android validada em emulador, via P2P e SFU; validação em aparelhos físicos continua pendente.
- Backup íntegro anterior ao deploy:
  `~/Teletela-backups/teletela-dados-2026-10-31_14-25-47.tar.gz`.
  Backup íntegro posterior: `~/Teletela-backups/teletela-dados-2026-10-31_14-28-52.tar.gz`.
- Deploy concluído mantendo Node `v24.22.1` e Caddy `2.11.7`. Serviços Node, SFU, WARP
  e Caddy ativos; saúde pública confirmou quatro canais e três usuários reconectados.
  Nove arquivos importantes conferidos por hash entre o código local e a VM.
  Segredos, dono, três contas, um cargo e dezesseis membros preservados.
- Registros de desenvolvimento local anteriores são históricos.


### Publicação da 4.3.1 concluída (31/10/2026)

Release solicitada pelo dono, publicada como versão mais recente e sem pré-release:
[v4.3.1](https://github.com/Castzzz/Teletela/releases/tag/v4.3.1), no commit
`dbe34a8272a86f9269b306070948be9255401b71`, enviado à `main`.

- Janela desktop normal para a transmissão, tela cheia independente, cabeçalho integrado
  ao tema e barra flutuante. Controles somem após três segundos mesmo com foco ou mouse
  parado nos botões; fechar o player mantém a recepção na sala e não duplica o áudio.
- Oito arquivos publicados: Setup, Portátil, AppImage, tar.gz, blockmap, `latest.yml`,
  `latest-linux.yml` e APK Android 4.3.1/código 12. Tamanhos e SHA-256 no GitHub iguais
  aos locais. Manifests 4.3.1 conferidos com os tamanhos e SHA-512 dos instaladores.
- Player e versão conferidos nos pacotes Linux/Windows; interface conferida no APK.
  Sons privados presentes nos instaladores e fora do Git. Tar.gz íntegro. Certificado
  SHA-256 do APK igual ao da 4.3.0, permitindo instalar por cima.
- Validação: runner (62), m1/m2/m3 (79), dois clientes Electron com WebRTC real,
  tela cheia, áudio sem duplicação, foco/mouse parado, fechar/reabrir/parar de assistir,
  três temas e controles compactos. Popup novo e histórico já visto conferidos na tela;
  build e lint Android passaram.
- Sem deploy nesta atualização: nenhuma mudança no servidor ou no protocolo. O servidor
  permanece na 4.3.0; o player novo é específico do app desktop.

### Publicação da 4.3.3 concluída (05/11/2026)

Release solicitada pelo dono e publicada como mais recente, sem pré-release:
[v4.3.3](https://github.com/Castzzz/Teletela/releases/tag/v4.3.3), no commit
`a0e66a0edc7ea0267aaba6afd168e0ccf6a5861d`, enviado à `main`.

- Ausentes mantém todos mutados, inclusive o dono e administradores. Entrada manual e
  automática bloqueiam a captura; sair restaura o estado anterior do microfone. Bloqueios
  da moderação são preservados. O servidor também nega tentativas de desmutar e tokens
  SFU de publicação de voz no canal de Ausentes.
- Nove arquivos publicados: Setup, Portátil, AppImage, tar.gz, Flatpak, blockmap,
  `latest.yml`, `latest-linux.yml` e APK Android 4.3.3/código 13. Tamanhos e SHA-256
  conferidos com os arquivos locais; os manifests de atualização têm versão 4.3.3 e
  SHA-512/tamanhos corretos. Sons continuam nos pacotes e fora do Git.
- Flatpak experimental instalado e aberto no Wayland: interface 4.3.3, conexão ao
  servidor local, entrada mutada no Geral e popup de novidades conferidos. Captura de
  tela, áudio por aplicativo, jogos e atalhos no sandbox ainda exigem validação própria.
  Atualização manual por bundle; nenhum pacote foi publicado no Flathub.
- Validação: runner (62), integração de extras/cargos (16), interface de organização e
  Ausentes com movimentação automática e restauração de faixa de áudio, três temas e
  celular. Popup e código dos pacotes Linux/Windows conferidos; APK com build/lint,
  versão e interface verificados. Certificado Android de desenvolvimento preservado.
- Deploy com backup prévio em `~/Teletela-backups`, preservando Node v24.22.1 e Caddy
  2.11.7. Node/SFU/Caddy ativos; saúde pública saudável e interface 4.3.3 acessível.
  SHA-256 de `server.js`, `package.json`, `public/app.js` e `public/index.html`
  conferidos entre o código local e a VM. Segredos não foram exibidos nem versionados.


### Protótipo de presença e atividades (09/11/2026, local)

Branch `prototipo/presenca-e-atividades`, criada da `main` mantendo as alterações locais
anteriores de áudio. Sem release/deploy; versão permanece 4.3.3.

- `prefs.invisible` é uma preferência por aparelho. O handshake envia `invisible` antes
  de anunciar presença, evitando aparecer online na reconexão. `room-info.presenceVersion: 1`
  anuncia suporte e `update-presence: { invisible: boolean }` confirma mudanças por callback.
- Membros e Amigos só consideram sockets visíveis. Uma conta com outro aparelho visível
  continua online. O participante permanece na call e pode escrever/transmitir normalmente;
  o modo não promete ocultar essas ações nem impedir moderação.
- `publicUser` e eventos de atividade retornam `null` enquanto invisível. A linha offline
  de membros usa perfil persistido e ID de membro, sem expor o socket invisível.
- `update-activity` aceita `type` opcional: `playing`, `studying`, `working`, `watching`,
  `listening`, `custom`. Ausência mantém compatibilidade com jogos dos clientes antigos.
  ID, nome e início continuam validados; campos extras não são repassados.
- Atividade manual existe só nesta janela, funciona também em navegador/Android e tem
  prioridade sobre a detecção. Limpar retoma o jogo detectado, se compartilhamento estiver ligado.
  Invisível oculta ambas. A detecção idêntica não reconstrói os elementos da atividade;
  o relógio continua atualizando separadamente.
- Cliente antigo mostra nomes manuais com o prefixo antigo “Jogando”; publicar o cliente
  e o servidor juntos ao aprovar este protótipo. Servidor antigo não habilita invisibilidade.
- Verificações: `node --test tests/presence-activity.test.js tests/server-members.test.js tests/friends.test.js`
  e `electron tests/server-members-browser.cjs` para formulário, presença, temas e celular.


### Ajustes do protótipo de atividades e seletores (09/11/2026, local)

- Atividades prontas são aplicadas ao selecionar e não exigem descrição. O nome enviado
  é o próprio rótulo (“Estudando”); `activityLabel` evita repetir o prefixo. Somente `custom`
  pede texto. Conversão e rótulos ficam em `public/game-activity.js`, compartilhados com os testes.
- O perfil do rodapé abre `#profile-quick-menu` com atividade, invisibilidade e **Editar perfil**.
  No celular: **Você → Trocar atividade e presença**. O painel usa `popover`, fecha por
  clique fora/Escape/voltar no Android e acompanha as sobreposições de tela cheia.
  Os dois formulários usam a mesma lógica e sincronizam atividade e presença entre si.
- A regra global de `select` em `style.css` também estiliza `::picker(select)`, opções,
  destaque, seta e marca da seleção por tokens. Abrange todos os seletores da sala,
  inclusive os preenchidos dinamicamente. Preserva controles nativos, eventos e teclado,
  sem biblioteca ou cópia de opções em JavaScript. Uso de `appearance: base-select`
  conforme a [documentação do Chromium](https://developer.chrome.com/blog/a-customizable-select).
- O Electron do projeto suporta o seletor personalizável. Em navegador/WebView sem esse
  suporte, `@supports` mantém o controle nativo com as cores de texto/fundo disponíveis;
  o formato da lista pode continuar sendo definido pelo sistema. O laboratório de música
  em `scripts/music-lab/` é uma ferramenta separada da interface instalada.
- Conferência no Electron: todos os selects recebem `base-select`; listas de atividade
  abertas nos três temas, seleção por teclado, presets sem texto, texto personalizado,
  limpeza, menu rápido desktop/celular, edição do perfil e invisibilidade sincronizada.


### Redesign de canais, configurações e abertura (09/11/2026, protótipo)

- `electron/connect.html`, `connect.css` e `connect.js`: nova abertura com sala principal,
  amigos online e outro endereço recolhido no rodapé. Sem **Hospedar no meu PC**; removidos
  IPCs `launcher-host/open/copy`, inicialização local e ciclo de vida do túnel. O comando
  `npm start`, P2P e entrada por endereço continuam úteis no desenvolvimento.
- `launcher-preview` só aceita a página exata do início. `electron/launcher-preview.cjs`
  usa a sessão salva da sala oficial, consulta HTTP sem abrir socket e não anuncia presença.
  Atualiza a cada 30 s com a página visível; cache de consulta por 10 s. Estados de sessão
  expirada, falta de conta, servidor antigo, ninguém online e falha de rede têm mensagens próprias.
  A entrada continua disponível se a prévia falhar.
- `GET /api/launcher/friends` exige `Authorization: Bearer <sessão de conta>` e membro
  autorizado na sala, como o handshake da conta. Só retorna amigos online com amizade aceita da própria conta,
  sem canal, atividade, credenciais ou perfil completo; presença respeita invisibilidade.
- `GET /api/launcher/friend-avatar/:accountId` exige a mesma sessão e amizade aceita.
  Respostas privadas e sem cache HTTP. O processo principal baixa fotos da origem fixa
  (sem seguir redirecionamentos), recorta conforme o enquadramento salvo, reduz para PNG de 80×80 e devolve só a miniatura ao início.
  Até oito amigos são mostrados, com iniciais se a imagem faltar; mais amigos aparecem no contador.
  O cache em memória guarda até 16 miniaturas e separa sessões. Nenhum dado novo em disco.
- `public/redesign.css` e `renderChannelsTree/renderTextChannels`: ícones SVG consistentes,
  nomes com até duas linhas, contexto de Ausentes/Restrito abaixo e ações ao passar mouse/focar.
  Categorias, permissões, ordenação e canais privados preservados.
- `public/settings-layout.js`: agrupa a navegação e recolhe explicações estáticas não interativas
  em **Como funciona**. Perfil/admin e mensagens dinâmicas de erro/estado continuam visíveis.
  O cadastro manual de jogos fica em **Adicionar um jogo não reconhecido**. Modo invisível
  mantém o aviso curto de que a call continua visível; a explicação completa continua acessível.
- Requer release para a interface instalada e deploy para a prévia HTTP. Sem publicação
  nesta etapa. No servidor antigo, o app oferece entrar normalmente e explica que a prévia
  virá com a atualização. Sem conexão, não reutiliza amigos como se estivessem online.
- Testes: `tests/launcher-preview.test.js`, `tests/cinema-music-connect-browser.cjs`,
  `tests/server-members-browser.cjs`, canais/permissões e regressões móveis.


Validação desta etapa: runner 62/62 e regressões de servidor/mídia/contas/atividades 87/87
(`--test-concurrency=1`), além das interfaces de início, canais, configurações, três temas e
celular. Uma execução paralela do teste antigo de desconexão rápida falhou no prazo de
convergência; o mesmo teste passou isolado e na execução sequencial, sem mudança no protocolo.
Capturas de teste em `/tmp/teletela-inicio-*.png`, `/tmp/teletela-canais-redesign.png` e
`/tmp/teletela-config-*-redesign.png` usam dados locais de exemplo.


### Presença completa e imagem do servidor (09/11/2026, protótipo)

- `public/presence.js` compartilha estados/rótulos com servidor e interface. `prefs.presence`
  guarda `online`, `away`, `dnd` ou `offline` por aparelho; `prefs.invisible` antigo migra para
  Offline e continua atualizado para compatibilidade. O handshake aceita `presence`; clientes
  antigos ainda podem enviar `invisible`. `room-info.presenceVersion` passa a **2**.
- `update-presence: { status }` valida a escolha e tem limite de alterações. `presence-state`
  devolve `{ presence, selected, automatic }`; `user-presence-updated` atualiza os indicadores
  dos participantes autorizados sem reconstruir a mídia. Metadados de membros/amigos e a
  prévia HTTP incluem `presence`, preservando o booleano `online` dos clientes antigos.
- Online é o modo automático. Cinco minutos sem atividade marcam Ausente, mesmo fora da
  call. Fala, transmissão ou assistir mantêm a presença ativa; o canal de Ausentes também
  marca ausência. Atividade ou saída desse canal restaura Online. Ausente, DND e Offline
  manuais têm prioridade e não são trocados pela automação.
- O sinal `idle-activity` usa a interação no app e, no desktop compatível, o tempo de
  inatividade do PC via [powerMonitor](https://www.electronjs.org/docs/latest/api/power-monitor).
  O guard existente retorna `null` no Wayland; nesse caso, navegador e Android, a referência
  é a interação no Teletela. A varredura reaproveita o timer de 10 s do AFK. `sweepPresence`
  permite verificar os tempos nos testes sem esperar cinco minutos reais.
- A escolha segue por aparelho. Na presença pública da mesma identidade, Não perturbe
  tem prioridade, depois Online, Ausente e Offline. Um aparelho Offline não oculta outro
  conectado. Nenhum status concede permissões ou esconde participantes da call.
- DND bloqueia avisos de entrada/saída e notificações/toasts de menções. Mensagens,
  indicadores de não lidas e áudio de voz/música continuam; sons de botões e prévias manuais
  continuam disponíveis. O teste de interface confirma mensagem recebida sem notificação
  e notificação voltando após escolher Online.
- `Colheita Fartus` substitui Sala da turma. `channel-extras.json` ganha `server.icon`
  (PNG/JPG/WebP em data URI) e `server.iconVersion`. A gravação usa a mesma transação atômica
  das categorias e restaura o estado anterior se falhar. Backups já incluem esse arquivo;
  senha, identidade e segredos do servidor não mudam.
- `server-icon-set: { icon }` exige `manageServer` e valida assinatura/tamanho (até 512 KB
  após conversão). A interface aceita arquivos até 2 MB, recorta no centro e converte para
  PNG 256×256 antes de enviar. `brandingVersion: 1` anuncia suporte no `room-info`;
  `server-info` anuncia a nova versão após salvar.
- `/api/server-info` e `/api/server-icon` expõem apenas o nome/imagem públicos, inclusive
  para a abertura sem conta; não incluem membros, canais ou dados de autenticação.
  `launcher-preview.cjs` consulta a marca em paralelo aos amigos, gera miniatura e reutiliza
  o cache. A prévia dos amigos também mostra os indicadores amarelo/vermelho.
- Interface: seletores no perfil rápido e configurações, cores em membros/amigos/call,
  nome completo no tooltip do dock, navegação das configurações sem faixas cinzas.
- Testes novos: `tests/presence-status.test.js` e `tests/server-branding.test.js`; regressões
  de membros/amigos/início e teste de imagem por upload na interface. Sem release/deploy.
  A criação/adição dos futuros servidores permanece somente em [Ideias futuras](IDEIAS-FUTURAS.md).


Validação da presença/imagem: runner 62/62, regressões 93/93, integração m4 de canais/chat,
interface de permissões e regressão móvel. A interface confirma cores compartilhadas entre
membros e dock, menção recebida silenciosamente em DND, aviso restaurado em Online,
upload de PNG pelo seletor de arquivo e restauração do ícone. As capturas de `/tmp` usam
perfis/arquivos de teste; os dados da sala oficial não foram alterados.


### Ajustes finais: avatares do chat, teste de mic e largura de Membros (09/11/2026, local)

- Mensagens novas incluem `authorMemberId` e `userAvatarCrop`, preenchidos pelo servidor.
  O ID temporário do socket continua para compatibilidade, mas o cliente usa a rota
  autenticada `/api/member-avatar/:memberId?access=...` para a foto do autor. O histórico,
  paginação, busca, contexto e mensagens fixadas recebem metadados atuais ao serem lidos;
  edições/reações também mantêm a referência. Não há base64 de imagem em cada mensagem.
- `member-avatar-store.js` conserva a última imagem/recorte dos visitantes e ajuda a localizar
  autores de mensagens antigas. Novas referências usam a identidade autenticada; antigas
  usam a conta/perfil conhecido e só associam índices sem ambiguidade. Quando nunca houve
  foto salva, é preciso o autor voltar com o perfil; não é possível reconstruir a imagem perdida.
- `member-avatars/` guarda um JSON por identidade, com troca atômica e remoção registrada,
  preservando os bytes do GIF (sem converter a animação). Limites: 15 MB por arquivo, 256 MB
  no conjunto e cache de mídia em memória até 32 MB. Não usa nomes de arquivo do cliente.
  Perfil sem mudança não regrava. Em falha de gravação, o arquivo anterior é mantido e há
  aviso no log; contas continuam com o perfil persistido em `accounts.json`. Somente uma
  conexão válida da sala pode ler as imagens; a chave de uma conexão encerrada não funciona.
- O novo módulo consta nos arquivos do instalador e na preparação do deploy. O backup já
  inclui a pasta dentro de `data/`; não houve mudança nos segredos nem nos arquivos de voz.
- `public/microphone-test.js` abre captura própria usando as mesmas restrições, RNNoise/ganho
  da voz. Não usa `AudioManager.acquireMicrophoneStream`, que pertenceria à call. Grava 4 s,
  encerra a captura e depois reproduz com a saída escolhida e volume geral; não publica faixa
  no Socket.IO/P2P/SFU. Ganho muda durante a gravação; trocar dispositivo/filtro cancela o teste.
  Parar, trocar de aba, fechar/minimizar ou sair da página encerra os recursos, inclusive uma
  permissão que termine de abrir depois do cancelamento. O antigo medidor restrito à call foi
  substituído pelo teste independente; a indicação de fala nos avatares continua.
- `membersWidth` é uma preferência local (180–420 px, padrão 224). A alça esquerda usa o
  mesmo controle de arraste/teclado das laterais, atualiza `aria-valuenow`, salva e restaura
  com duplo clique. Limita a largura ao espaço disponível, preservando 280 px para o centro;
  o deslocamento do miniplayer usa `--members-width`. No painel móvel a largura é responsiva
  e a alça fica escondida, sem aplicar uma largura desktop maior que a tela.
- Testes: `node --test tests/message-avatars.test.js` verifica persistência após reinício,
  GIF/recorte, identidade preenchida pelo servidor, chave expirada e falha de gravação;
  `electron tests/final-adjustments-browser.cjs` verifica imagens carregadas no histórico
  offline, arraste/teclado/persistência, gravação e reprodução reais, permissão negada/tardia,
  fechamento e preservação do mute da call. Conferidos desktop, três temas e celular.
- Validação: runner 62/62, regressões 95/95, integração m4 e interfaces de membros, microfone
  e navegação móvel. Sem release/deploy; a versão continua 4.3.3 até preparar a publicação.


### Publicação e deploy da 4.4.0 concluídos (09/11/2026)

Autorizados pelo dono, sem repetir os testes já concluídos (runner 62/62, regressões
95/95 e interfaces). Integração do protótipo por avanço direto na `main`, publicada no
commit `a97a81602154ba5338bc5143609df07034dae9e3`, tag
[v4.4.0](https://github.com/Castzzz/Teletela/releases/tag/v4.4.0), sem rascunho/pré-release
e marcada como versão mais recente.

- `npm run release` gerou e publicou Windows Setup/Portátil, AppImage, tar.gz, blockmap
  e manifests de atualização. Flatpak experimental e APK de teste foram gerados e anexados;
  Android passa a 4.4.0/código 14, preservando assinatura. O build Android pulou `lintDebug`
  por pedido de não repetir verificações; não houve nova execução de suítes de teste.
- Nove arquivos confirmados como enviados: tamanhos e SHA-256 do GitHub iguais aos locais;
  `latest.yml` e `latest-linux.yml` apontam para 4.4.0, com tamanhos/SHA-512 conferidos.
  Os sons estão nos pacotes e continuam fora do Git. Código enviado à `main` e à branch
  `prototipo/presenca-e-atividades`, preservada para referência.
- Deploy com Node v24.22.1 e Caddy 2.11.7 preservados. Backup anterior íntegro:
  `~/Teletela-backups/teletela-dados-2026-11-09_17-39-42.tar.gz` (26 MB).
  Node/SFU/Caddy ativos e `/api/health` público com `status: ok` após a instalação.
  SHA-256 de `server.js`, `package.json`, `public/app.js`, `public/index.html` e
  `member-avatar-store.js` iguais entre a VM e o código publicado. Segredos preservados.

### Revisão das mensagens privadas e fotos (09/11/2026, local)

- `publicUser` inclui `memberId`, já disponível na lista de membros, para deduplicar as
  sugestões pela identidade. Homônimos aparecem separadamente com foto/iniciais.
- Ao escolher destinatário de `/w` ou `/whisper` (também após `/t`), o campo usa
  `@nome#identificador` com os oito primeiros caracteres do membro. O servidor resolve
  somente candidatos autorizados no canal e recusa qualquer ambiguidade, inclusive
  colisão do identificador curto. Nomes sem sufixo continuam aceitos quando únicos.
- `friends-state` inclui `avatarV` e `avatarCrop` para amigos e pedidos. A aba Amigos
  usa `imageCropStyle` numa janela de recorte, preservando GIF e o indicador de presença.
- Regressões: `node --test tests/chat-mentions.test.js tests/friends.test.js
  tests/launcher-preview.test.js` e Electron do sistema com
  `tests/chat-mentions-browser.cjs` / `tests/controls-friends-browser.cjs`.

### Publicação da 4.5.0 (09/11/2026)

- Código `7b3ceab`, integrado por avanço direto à `main`, com tag `v4.5.0` no mesmo commit.
  Release pública marcada como latest, sem pré-release; nove arquivos publicados para
  Windows, Linux, Flatpak experimental e Android 4.5.0/código 15.
- Tamanhos e SHA-256 dos nove downloads conferem com os arquivos locais; SHA-512 dos
  metadados `latest.yml` / `latest-linux.yml` corresponde aos instaladores.
- Deploy Oracle concluído; Node, SFU e Caddy ativos, saúde pública OK e SHA-256 do
  `server.js` instalado igual ao código local. Backup anterior preservado em
  `~/Teletela-backups/teletela-dados-2026-11-09_21-30-36.tar.gz`.
- Nenhum teste foi repetido, conforme pedido. Android compilado com `-x lintDebug`;
  identificadores e assinatura existentes preservados. As verificações desta publicação
  ficaram na integridade dos artefatos, versão instalada e saúde dos serviços.


### Investigação de glitches ao assistir (10/11/2026, local)

- `sfu/main.go` remove as extensões RTP do host antes do repasse e gera TWCC por conexão
  de saída com `ConfigureTWCCHeaderExtensionSender`. `TrackLocalStaticRTP` troca SSRC/PT,
  mas não traduz MID/TWCC de uma conexão para outra. Nunca reutilizar os metadados do host
  cegamente nos espectadores. Sequência RTP, timestamps e mídia continuam preservados.
- Regressões em `sfu/main_test.go`: extensões, pacotes fora de ordem, volta da sequência,
  descarte de pacote malformado e continuidade dos demais espectadores. `go test -race ./sfu`
  e runner 62/62 passaram. `TEST_SFU=1 npm run test:stream:ui` permite a checagem visual com
  SFU local compilado em `.cache/music-lab/music-sfu`; checagem concluída com reprodução,
  tela cheia, três temas e fechamento/reabertura funcionando.
- Consulta somente de leitura à VM não indicou falta de memória/carga alta naquele instante.
  Causa do relato do espectador ainda não confirmada. Evidências e limites em
  [DIAGNOSTICO-TRANSMISSOES.md](DIAGNOSTICO-TRANSMISSOES.md). Exige somente deploy do SFU;
  nenhum deploy/release realizado nesta etapa.

### Análise de travamentos em 1080p60/1440p60 (11/11/2026)

Inspeção somente de leitura encontrou 493 descartes acumulados no socket UDP do SFU,
com buffer de recepção de apenas 208 KiB, compartilhado pelas salas. Os contadores não
cresceram durante a consulta; não foi comprovada relação temporal com o relato. A VM
estava com carga baixa e cerca de 10,9 GB de RAM disponível. O SFU repassa uma única
faixa VP8, sem adaptação à banda de cada espectador; TWCC e NACK não substituem um
controlador de banda. Evidências, limites e ordem recomendada de correção/medição em
[DIAGNOSTICO-TRANSMISSOES.md](DIAGNOSTICO-TRANSMISSOES.md#travamentos-em-1080p60-e-1440p60-11112026-análise).
Nenhum ajuste de mídia, release ou deploy nesta análise.

### Buffer de recepção do SFU (11/11/2026, ajuste local)

`setupWebRTC` solicita 4 MiB via `UDPConn.SetReadBuffer` antes de entregar o socket ao
ICE mux. O buffer é único para todas as salas, não por espectador. Falha no ajuste gera
aviso e preserva a inicialização com o padrão do sistema; sucesso registra o tamanho
solicitado, sem presumir que o kernel concedeu esse valor. O limite da VM consultada,
`net.core.rmem_max=4194304`, já permite a solicitação; não é necessário mudar o sysctl
global. No Linux, `ss` informa o valor dobrado para contabilização interna: o teste local
confirmou `rb8388608` (8 MiB), comparado aos `rb212992` observados na VM antes do ajuste.

Ao aplicar, conferir `sudo ss -uanmp 'sport = :50000'` e comparar o crescimento de `d`
durante transmissões reais. O buffer absorve rajadas, sem impor espera para enchê-lo;
congestionamento sustentado ainda pode aumentar a fila/latência e exige investigar banda
e adaptação. Exige deploy do SFU; não precisa de release do aplicativo. Nenhum deploy
realizado nesta etapa.

### Deploy do SFU com buffer maior (11/11/2026, 15:58 de Brasília)

Autorizado pelo dono. Atualização direcionada ao binário do SFU para preservar as outras
alterações locais pendentes; não foi usado o instalador completo. Inclui o buffer maior e
a correção anterior de extensões RTP/TWCC já testada. Apenas `telinha-sfu` foi reiniciado;
Node, Caddy, interface servida, dependências e configuração da VM foram preservados.

- Backup prévio íntegro: `~/Teletela-backups/teletela-dados-2026-11-11_15-58-18.tar.gz`
  (39 MB, `gzip -t` passou). A primeira tentativa foi descartada por mudança de arquivo
  durante a leitura; a segunda concluiu normalmente.
- Compilação `linux/arm64`, substituição atômica do binário, com cópia anterior em
  `/opt/telinha/bin/telinha-sfu.rollback.B562tm`. SHA-256 local/enviado/instalado:
  `834d67c8c22f3bb6b2a2251f29f86fb247aee96b6628bb2fd5f093263a354ad6`.
- `ss` na VM confirmou `rb8388608` (8 MiB), comparado aos 208 KiB anteriores, e zero
  descartes desde o reinício nas consultas iniciais. Esse contador recomeça no socket
  novo: não comprova resolução do problema sob carga.
- Node/SFU/Caddy ativos; `/api/health` e `/sfu/health` públicos saudáveis. Os clientes
  reconectaram e as cinco salas de voz voltaram. Sem release do aplicativo; os testes
  concluídos na preparação foram aproveitados.


### Publicação da 4.5.1 (13/11/2026)

- Release pública [v4.5.1](https://github.com/Castzzz/Teletela/releases/tag/v4.5.1),
  marcada como mais recente, sem rascunho/pré-release. Tag no commit `4c98a99`.
- Nove arquivos publicados: Setup/Portátil Windows, AppImage, tar.gz, Flatpak experimental,
  APK Android 4.5.1/código 16, blockmap e os dois metadados de atualização automática.
  Tamanhos e SHA-256 de todos os downloads conferem com os arquivos locais; SHA-512 dos
  metadados confere com os instaladores. Bundle Flatpak aplicado em repositório temporário
  para conferir a versão interna; tar.gz e interface Android também conferidos.
- Sons locais conferidos nos pacotes desktop/Android e preservados fora do Git.
  Popup da 4.5.1 conferido visualmente no Electron. Testes de ontem aproveitados a pedido
  do dono, sem repetir suítes; Android compilado com `-x lintDebug`.
- Deploy completo Oracle concluído, mantendo Node v26.13.0 e Caddy 2.11.9.
  `telinha-server`, `telinha-sfu` e Caddy ativos; `/api/health` e `/sfu/health` públicos OK,
  com clientes reconectados. SHA-256 de `server.js`, `public/app.js` e `public/index.html`
  na VM iguais aos arquivos locais; versão instalada 4.5.1. Buffer UDP do SFU continua
  `rb8388608`, sem descartes na consulta inicial (não comprova comportamento sob carga).
- Backup anterior ao deploy íntegro em
  `~/Teletela-backups/teletela-dados-2026-11-13_10-55-11.tar.gz` (`gzip -t` passou).
  O reinício do Node aguardou o limite de encerramento de 90 segundos do systemd;
  houve indisponibilidade HTTP temporária nesse intervalo. Segredos preservados na VM.


### Publicação da 4.6.0 (14/11/2026)

Publicação de release e deploy autorizada pelo dono para disponibilizar Assistir juntos
e corrigir o download da extensão na sala oficial. Inclui as alterações locais de
volume das transmissões até 300% e a compatibilidade do extrator de música do YouTube.
Popup de novidades atualizado; Android 4.6.0/código 17.

- `npm test`: 62 testes passaram; regressões m1/m2/m3: 81 testes passaram.
- Integração de canais/admin e 12 testes de fontes de música/segurança passaram.
- Electron: janela de transmissão e amplitude real de 50–300% passaram; popup 4.6.0
  e painel Assistir juntos conferidos visualmente.
- Verificação local da sessão, código de uso único, autenticação, sincronização via HTTP,
  ZIP com oito arquivos e revogação ao sair passou. Não valida reprodução real na Netflix.

- Release pública marcada como mais recente, sem rascunho/pré-release, tag no commit
  `10ccc66`. Dez arquivos: Setup/Portátil Windows, AppImage, tar.gz, Flatpak experimental,
  APK Android 4.6.0/código 17, ZIP da extensão, blockmap e dois metadados do updater.
  Tamanhos e SHA-256 publicados conferem; metadados públicos e SHA-512 dos instaladores
  conferem. Versão interna do tar.gz/Flatpak e interface do APK conferidas.
- Sons locais presentes nos pacotes e preservados fora do Git. Android compilado com lint.
- Deploy Oracle completo preservou Node v26.13.0 e Caddy 2.11.9. Serviços ativos;
  `/api/health` e `/sfu/health` saudáveis, com clientes reconectados. Versão instalada
  4.6.0 e hashes de servidor/interface iguais ao código local.
- `GET /api/watch-together/extension.zip` público retorna HTTP 200, ZIP e attachment;
  SHA-256 idêntico ao pacote local. Corrige o `Cannot GET` da versão anterior no servidor.
- Backup prévio íntegro: `~/Teletela-backups/teletela-dados-2026-11-14_12-55-42.tar.gz`
  (`gzip -t` passou). Segredos preservados na VM.


### Firefox na extensão 0.2.0 — adaptação local (14/11/2026)

Solicitada pelo dono após a publicação da 4.6.0. O mesmo pacote passa a carregar em
Firefox 140+ e Chromium 121+, sem mudar o protocolo nem exigir mudança no servidor.
A instalação Firefox usa `about:debugging#/runtime/this-firefox` e o `manifest.json`
extraído; é temporária até fechar/reiniciar o navegador. Instalação permanente ainda
depende de assinatura pela Mozilla. Não desativar a verificação de assinatura.

- Firefox 159.0.1 no Linux, em perfil descartável via Selenium/geckodriver: manifesto
  instalado, background ativo, popup aberto, autorização do host e pareamento local
  passaram. O teste acionou a conexão pela API do popup após conceder a permissão,
  sem automatizar o clique final do formulário dentro do painel.
- Content script instalado em aba YouTube enviou play, pausa e avanço de um WebM
  de teste para o servidor local; desconexão passou. Isso não valida anúncios,
  dois participantes sincronizados nem episódio real da Netflix.
- `npm test`: 62 testes passaram. `node --test tests/watch-extension.test.js`: dois
  testes passaram para namespaces `browser`/`chrome`, sem exposição do token ao popup,
  bloqueio de abas não selecionadas e desconexão.
- Pacote local gerado com `npm run watch:extension`; instruções no painel, README e
  LEIA-ME atualizadas. Naquela etapa ainda sem nova release/deploy; o deploy direcionado
  autorizado posteriormente está registrado abaixo.


### Download público da extensão Firefox 0.2.0 (14/11/2026)

Atualização do servidor autorizada pelo dono. Publicados somente os oito arquivos de
`public/watch-extension/` e `public/watch-together.js` (instruções no site). A rota do
ZIP lê os arquivos a cada requisição; não foi necessário reiniciar Node, SFU ou Caddy.
A pasta da extensão foi trocada atomicamente, com cópia do código anterior em
`/opt/telinha/extension-backup-h_xtc_t5`. Demais arquivos e configuração preservados.

- Backup prévio íntegro: `~/Teletela-backups/teletela-dados-2026-11-14_13-34-18.tar.gz`
  (`gzip -t` passou).
- `node --test tests/watch-extension.test.js`: dois testes passaram antes da publicação;
  testes gerais e Firefox real da preparação anterior aproveitados.
- Download público conferido: ZIP íntegro, oito arquivos, manifesto 0.2.0 e bytes iguais
  ao pacote local. SHA-256: `a18fe28d17b7e704e19f62a1d58a56e49332bdf9697b3b6a1cf5d2a3c34ebcfd`.
- Node, SFU e Caddy ativos e com mesmos PIDs/horários de início antes e depois;
  `/api/health` e `/sfu/health` saudáveis. Hashes do manifesto e da ajuda iguais aos locais.
- Sem nova release desktop/Android nem alteração dos anexos da release 4.6.0 no GitHub.
  O botão **Baixar extensão** dos apps já instalados agora entrega a versão 0.2.0.
  As instruções novas dentro do app instalado dependem de uma release futura.

### Captura de janela ao entrar em tela cheia no Linux (14/11/2026)

Firefox continua reproduzindo YouTube, mas a captura no Teletela congela ao entrar em
tela cheia e não volta ao sair. Confirmado pelo dono somente no Linux; monitor inteiro
funciona. No PC inspecionado, Hyprland 0.57.1/Wayland e portal Hyprland 1.5.0; o journal
mostra renegociação de formatos e falhas DMA-BUF durante uma captura de janela.
A issue upstream #451 descreve o mesmo gatilho e callbacks de falha sem retomada de
quadros, conferidos no código da versão 1.5.0. Hipótese forte de falha no portal,
ainda sem reprodução instrumentada que confirme a causa neste PC.
Evidências, contorno e critérios de validação em
[DIAGNOSTICO-TRANSMISSOES.md](DIAGNOSTICO-TRANSMISSOES.md#janela-do-firefox-congela-ao-entrar-em-tela-cheia-no-linux-14112026).
Nenhuma correção de código, mudança no sistema, release ou deploy nesta análise.

### Clipes de voz da chamada

Na entrada confirmada no canal, `public/voice-clips.js` liga ao mixer um AudioWorklet
com histórico circular de 60 s (mono, Float32 na taxa do mixer, 11,52 MB a 48 kHz). Entram o mic local e os
ganhos individuais das vozes recebidas por SFU ou P2P. Ensurdecer silencia a entrada.
Tela, música e soundboard têm outras rotas. Sair, trocar de canal ou desconectar
descarta a sessão. A tesoura congela uma cópia para escolher o trecho e o destino.
A prévia e o envio reutilizam o mesmo WAV PCM16 (até 48 kHz, 5,76 MB/min). Picos acima do limite são atenuados em conjunto ao exportar o trecho. O player usa o volume geral do mixer. O evento existente `text-file` publica o WAV e a data/hora do clique no canal escolhido,
com as permissões, a persistência e a cota dos anexos. A VM só recebe o trecho enviado.

### Conversas privadas entre amigos

`direct-messages.js` atende `dm-history` e `dm-send` pelo Socket.IO autenticado da sala.
O servidor resolve o autor pela sessão e exige amizade aceita em cada operação. Entrega
`dm-message` aos aparelhos ativos dessas duas contas. Remover a amizade bloqueia
envio e leitura; se a dupla voltar a ser amiga, recupera o mesmo histórico.
As mensagens ficam no backup de dados, em `conversas/<par de contas>/`, fora de
`public/`. Cada página JSON contém até 40 mensagens de 2000 caracteres. O arquivo
`recentes.json` é substituído por rename depois de salvar uma página cheia.
A interface em `public/direct-messages.js` abre pela lateral ou pela aba Amigos.
`dm-inbox` consulta a última atividade somente das amizades aceitas. O marcador
de leitura fica no aparelho, por sala, conta e amigo, sem o conteúdo das mensagens.
A tesoura do painel de voz e a da barra móvel usam o mesmo histórico local da call.

A prévia usa uma URL de blob local do WAV do trecho selecionado. Trocar a duração
ou fechar a janela libera a URL. O título usa o texto editável da mensagem; o valor
inicial é a data e a hora da captura. O atalho `clip` usa o registro de atalhos
do Electron e a rota local `/clip` no Wayland. Os clipes podem ser fixados como qualquer mensagem do canal de texto.

### Recursos locais de 19/11/2026

- A tesoura e os anexos WAV do chat abrem o editor de trecho em `public/sound-trim.js`. O cliente gera um WAV mono a 24 kHz e usa o envio existente `soundboard-add`. Quinze segundos cabem no limite de 1 MB.
- Os canais de texto usam a marca de leitura das preferências e carregam páginas anteriores ao retomar. O chat temporário da call usa uma marca em memória. As DMs usam a marca local por sala, conta e amigo.
- O emissor gera um JPEG de até 320 × 180 por tela a cada 15 segundos. O evento `screen-preview-set` troca o quadro em memória no socket do emissor. A consulta `screen-preview-get` verifica a visibilidade do canal, a senha e a tela ativa. Encerrar a tela ou sair da call descarta o quadro. A prévia depende da atualização do servidor.
