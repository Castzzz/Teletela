# Pendências atuais

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
