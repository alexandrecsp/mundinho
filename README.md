# Mundinho 🌈

Portal de joguinhos e vídeos animados para bebês. Feito com HTML, CSS e JavaScript puro, sem dependências nem etapa de build.

## Rodar

```sh
npm start            # http://localhost:8123
npm run start:rede   # também abre no tablet/celular da mesma rede Wi-Fi
npm test             # testes, incluindo a checagem do catálogo
```

Precisa do Node 20.11 ou mais novo. Não dá para abrir o `index.html` direto do disco, porque o navegador bloqueia módulos ES em `file://`.

## Como funciona

- **Home**: os pais escolhem um jogo ou vídeo. O app entra em tela cheia e mantém a tela acesa.
- **Dentro da atividade**: qualquer toque, arrasto ou tecla gera uma resposta. A única saída é **segurar o ✕ do canto por 2 segundos**, então o bebê não sai sem querer.
- **Tempo de tela**: tem um limite diário (padrão de 10 min) que os pais ajustam na *Área dos pais*. Quando acaba, a atividade dá lugar a uma tela de descanso. O contador zera à meia-noite.
- **Tema claro e escuro**: escolhido na *Área dos pais*. No *Automático*, fica claro das 7h às 18h e escuro no resto do dia. Vale para a página e para todos os jogos e vídeos; se o tema virar no meio de um jogo, as cores mudam aos poucos, sem clarão.
- **Nome das cores**: na *Área dos pais* dá para mostrar ou esconder o nome da cor escrito dentro das bolhas. Vem ligado.
- **Bichinhos nas bolhas**: também na *Área dos pais*, as bolhas podem ter contorno de bichinho (urso, gato, coelho, peixinho, pintinho) ou ser redondas. Vem com bichinhos.
- **Som**: é gerado pelo próprio navegador, com volume baixo e um limitador, então nenhum jogo toca alto.
- **Imagem**: as animações são lentas e as trocas de cena são suaves, sem nada piscando.

## Adicionar um jogo

1. Crie `content/games/<id>/<id>.game.js`:

   ```js
   // As cores de dia e de noite. As duas paletas têm as mesmas chaves.
   const PALETTE = {
     light: { ground: '#fff8ef', ball: '#ff595e', glow: 0.5 },
     dark: { ground: '#120f1c', ball: '#9e3a3d', glow: 0.25 },
   };

   export default {
     mount(stage) {
       const { ctx } = stage;

       stage.onPress(({ x, y, source }) => {
         // source: 'pointer' (toque/clique) ou 'key' (tecla, em posição aleatória)
         stage.audio.chime('E5');
       });

       stage.onFrame((dt, t) => {
         const c = stage.colors(PALETTE); // a paleta do tema atual, já misturada na transição
         ctx.fillStyle = c.ground;
         ctx.fillRect(0, 0, stage.width, stage.height);
         // desenhe aqui, sempre com as cores de `c`
       });

       // opcional: devolva uma função para limpar o que você mesmo criou
     },
   };
   ```

2. Acrescente uma entrada em [content/catalog.js](content/catalog.js):

   ```js
   {
     id: 'meu-jogo',
     type: 'game',
     title: 'Meu Jogo',
     description: 'Frase curta',
     emoji: '🦆',
     color: '#c5f0a4',
     ages: [6, 24],
     load: () => import('./games/meu-jogo/meu-jogo.game.js'),
   },
   ```

3. Rode `npm test`. O teste do catálogo confere se a entrada é válida e se o módulo exporta `mount`.

### O que o `stage` oferece

| | |
|---|---|
| `ctx`, `canvas`, `width`, `height` | canvas 2D em tela cheia, já ajustado para telas de alta densidade |
| `onFrame(fn(dt, t))` | chamado a cada quadro; `dt` e `t` em segundos |
| `onPress(fn({ x, y, source, key }))` | toque, clique ou tecla |
| `onDrag(fn({ x, y, id }))` | dedo arrastando |
| `onResize(fn(w, h))` | a tela mudou de tamanho |
| `idleSeconds` | segundos desde o último toque |
| `colors({ light, dark })` | a paleta do quadro atual; mistura cores hexadecimais, números, listas e objetos |
| `theme`, `darkness` | `'light'` ou `'dark'`, e de 0 (claro) a 1 (escuro) durante a transição |
| `colorWords` | `true` quando os pais deixam o nome das cores escrito na tela (*Área dos pais*) |
| `animalShapes` | `true` quando os pais querem as bolhas com formato de bichinho (*Área dos pais*) |
| `random(min, max)`, `pick(lista)`, `emojiFont(tamanho)` | atalhos |
| `audio.tone(nota, opções)` | uma nota: `'C5'`, `'F#4'` ou Hz; opções `duration`, `wave`, `gain`, `delay`, `glideTo` |
| `audio.chime(nota)`, `audio.pop()` | sininho e estouro de bolha |
| `audio.play(melodia, opções)` | toca `[[nota, tempos], ...]` em loop; opções `bpm`, `ring`, `onNote` |

O player desliga tudo isso sozinho quando a atividade fecha: quadros, toques e som.

### Cores de noite

À noite, a tela é a única luz do quarto. Na paleta `dark`, prefira fundos quase pretos, cores menos saturadas e brilhos mais fracos. As cores dentro de textos como `hsl(...)` não se misturam sozinhas; coloque na paleta só os números (luminosidade, transparência) e monte o texto com eles, como em [bolhas.game.js](content/games/bolhas/bolhas.game.js).

## Adicionar um vídeo

- **Animação** (como as que vêm prontas): igual a um jogo, mas com `type: 'video'`. O arquivo vai em `content/videos/<id>/<id>.animation.js`.
- **Arquivo de vídeo**: coloque o `.mp4` ou `.webm` em `content/videos/media/` e cadastre com `kind: 'file'` e `src: 'content/videos/media/arquivo.mp4'`.
- **YouTube**: `kind: 'youtube'` e `src` com o código do vídeo (o que vem depois de `v=`). Os toques do bebê ficam bloqueados por cima do vídeo, então ele não abre outros vídeos.

Há exemplos comentados no fim de [content/catalog.js](content/catalog.js).

## Estrutura

Veja [docs/STRUCTURE.md](docs/STRUCTURE.md).
