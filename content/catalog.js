/**
 * Tudo o que aparece no portal, na ordem em que aparece.
 * Para adicionar um jogo ou vídeo, acrescente uma entrada aqui (veja o README).
 *
 *   id           minúsculas e hífens; vira o endereço #/brincar/<id>
 *   type         'game' ou 'video'
 *   kind         só para vídeos: 'animation' (padrão), 'file' ou 'youtube'
 *   title        nome no cartão
 *   description  frase curta no cartão (opcional)
 *   emoji        figura do cartão
 *   color        cor do cartão, em hexadecimal; prefira tons claros
 *   ages         [de, até] em meses (opcional)
 *   load         jogos e animações: () => import('./caminho/do/modulo.js')
 *   src          vídeos 'file': caminho do .mp4/.webm; 'youtube': o id do vídeo
 */
export const catalog = [
  {
    id: 'bolhas',
    type: 'game',
    title: 'Bolhas',
    description: 'Toque para estourar',
    emoji: '🫧',
    color: '#9ad8ff',
    ages: [3, 24],
    load: () => import('./games/bolhas/bolhas.game.js'),
  },
  {
    id: 'contraste',
    type: 'game',
    title: 'Preto no Branco',
    description: 'Figuras de alto contraste',
    emoji: '🎯',
    color: '#ffc9c9',
    ages: [0, 12],
    load: () => import('./games/contraste/contraste.game.js'),
  },
  {
    id: 'achou',
    type: 'game',
    title: 'Cadê? Achou!',
    description: 'Os bichinhos se escondem',
    emoji: '🐶',
    color: '#ffc38a',
    ages: [4, 24],
    load: () => import('./games/achou/achou.game.js'),
  },
  {
    id: 'piano',
    type: 'game',
    title: 'Piano de Cores',
    description: 'Cada cor, uma nota',
    emoji: '🎹',
    color: '#ffe27a',
    ages: [4, 36],
    load: () => import('./games/piano/piano.game.js'),
  },
  {
    id: 'luzinhas',
    type: 'game',
    title: 'Luzinhas',
    description: 'Desenhe com estrelas',
    emoji: '✨',
    color: '#c9b8ff',
    ages: [4, 36],
    load: () => import('./games/luzinhas/luzinhas.game.js'),
  },
  {
    id: 'jardim',
    type: 'game',
    title: 'Jardim Musical',
    description: 'Toque e uma flor nasce',
    emoji: '🌷',
    color: '#c5f0a4',
    ages: [4, 36],
    load: () => import('./games/jardim/jardim.game.js'),
  },
  {
    id: 'lagoa',
    type: 'game',
    title: 'Lagoa do Patinho',
    description: 'Ondinhas na água',
    emoji: '🦆',
    color: '#a8e6f0',
    ages: [3, 30],
    load: () => import('./games/lagoa/lagoa.game.js'),
  },
  {
    id: 'estrelinha',
    type: 'video',
    title: 'Brilha, Brilha Estrelinha',
    description: 'Canção de ninar com a lua',
    emoji: '🌙',
    color: '#b8c4ff',
    ages: [0, 36],
    load: () => import('./videos/estrelinha/estrelinha.animation.js'),
  },
  {
    id: 'fundo-do-mar',
    type: 'video',
    title: 'Fundo do Mar',
    description: 'Peixinhos nadando devagar',
    emoji: '🐠',
    color: '#8fe3d6',
    ages: [3, 36],
    load: () => import('./videos/fundo-do-mar/fundo-do-mar.animation.js'),
  },
  {
    id: 'formas',
    type: 'video',
    title: 'Formas Dançantes',
    description: 'Pulam no ritmo da música',
    emoji: '🔺',
    color: '#ffb3d9',
    ages: [4, 36],
    load: () => import('./videos/formas/formas.animation.js'),
  },
  {
    id: 'trenzinho',
    type: 'video',
    title: 'Trenzinho',
    description: 'Os bichinhos vão passear',
    emoji: '🚂',
    color: '#ffcfa8',
    ages: [6, 36],
    load: () => import('./videos/trenzinho/trenzinho.animation.js'),
  },
  {
    id: 'chuva',
    type: 'video',
    title: 'Chuva e Arco-íris',
    description: 'Chove, chove e o sol volta',
    emoji: '🌈',
    color: '#cfe0ff',
    ages: [0, 36],
    load: () => import('./videos/chuva/chuva.animation.js'),
  },

  // Vídeo seu (coloque o arquivo em content/videos/media/):
  // {
  //   id: 'passeio-no-parque',
  //   type: 'video',
  //   kind: 'file',
  //   title: 'Passeio no Parque',
  //   emoji: '🌳',
  //   color: '#c5f0a4',
  //   src: 'content/videos/media/passeio-no-parque.mp4',
  // },

  // Vídeo do YouTube (src é o código depois de "v=" no link):
  // {
  //   id: 'musica-do-youtube',
  //   type: 'video',
  //   kind: 'youtube',
  //   title: 'Música do YouTube',
  //   emoji: '📺',
  //   color: '#ffd6a5',
  //   src: 'CODIGO_DO_VIDEO',
  // },
];
