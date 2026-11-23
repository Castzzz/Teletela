# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

(Interface em JS puro dentro de Electron no desktop, também servida no navegador e no APK Android. Linguagem visual única para todos.)

## Users

Uma turma de amigos brasileiros que se reúne quase todo dia em call. Usam à noite e de madrugada, geralmente no PC enquanto jogam, assistem filme junto ou só fazem companhia. O dono do projeto é um deles e mantém a sala. (Inferido do repositório; confirmar.)

## Product Purpose

Ponto de encontro privado: canais de voz, transmissão de várias telas ao mesmo tempo com o som do PC separado do microfone, chat, música compartilhada e assistir juntos. Sucesso é a galera entrar, se ouvir bem e ver a tela uns dos outros sem atrito.

## Positioning

Não é uma plataforma pública: é a sala de uma turma só, com as vozes, piadas e rituais dela (sons dos amigos, K7 de música, acessórios de época nos avatares, tempo de call por pessoa).

## Operating Context

App aberto horas a fio ao lado de um jogo ou vídeo. Muitas vezes em tela cheia de transmissão, com a call no fundo. Três temas (escuro, preto, claro) e visuais alternativos escolhidos por cada pessoa em Configurações → Aparência (Clássico, Roda, Terminal).

## Capabilities and Constraints

- Cores sempre por tokens CSS; tudo precisa funcionar nos 3 temas e com a cor de tema/primária personalizadas.
- Ícones SVG de traço (`icon-svg`), sem emoji como ícone.
- Mudanças em `public/` só chegam à turma com release aprovada pelo dono.
- Interface e textos em português, tom informal.

## Brand Commitments

- Nome Teletela (antigo Telinha); ícone em `public/icon.png`; ilustração do K7 em `public/k7.svg`.
- Vozes dos amigos em `public/sounds/` nunca vão pro git.

## Product Principles

1. A call vem primeiro: ver quem está falando e transmitindo nunca fica atrás de decoração.
2. Cada pessoa escolhe sua aparência; nenhum visual é imposto.
3. Calor de turma, não de empresa: o app tem a cara de quem usa.
