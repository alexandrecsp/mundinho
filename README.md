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
- **Som**: é gerado pelo próprio navegador, com volume baixo e um limitador, então nenhum jogo toca alto.
- **Imagem**: as animações são lentas e as trocas de cena são suaves, sem nada piscando.

## Adicionar um jogo

1. Crie `content/games/<id>/<id>.game.js`:

   ```js
   export default {
     mount(stage) {
       const { ctx } = stage;

       stage.onPress(({ x, y, source }) => {
         // source: 'pointer' (toque/clique) ou 'key' (tecla, em posição aleatória)
         stage.audio.chime('E5');
       });

       stage.onFrame((dt, t) => {
         ctx.fillStyle = '#fff';
         ctx.fillRect(0, 0, stage.width, stage.height);
         // desenhe aqui
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
| `random(min, max)`, `pick(lista)`, `emojiFont(tamanho)` | atalhos |
| `audio.tone(nota, opções)` | uma nota: `'C5'`, `'F#4'` ou Hz; opções `duration`, `wave`, `gain`, `delay`, `glideTo` |
| `audio.chime(nota)`, `audio.pop()` | sininho e estouro de bolha |
| `audio.play(melodia, opções)` | toca `[[nota, tempos], ...]` em loop; opções `bpm`, `ring`, `onNote` |

O player desliga tudo isso sozinho quando a atividade fecha: quadros, toques e som.

## Adicionar um vídeo

- **Animação** (como as que vêm prontas): igual a um jogo, mas com `type: 'video'`. O arquivo vai em `content/videos/<id>/<id>.animation.js`.
- **Arquivo de vídeo**: coloque o `.mp4` ou `.webm` em `content/videos/media/` e cadastre com `kind: 'file'` e `src: 'content/videos/media/arquivo.mp4'`.
- **YouTube**: `kind: 'youtube'` e `src` com o código do vídeo (o que vem depois de `v=`). Os toques do bebê ficam bloqueados por cima do vídeo, então ele não abre outros vídeos.

Há exemplos comentados no fim de [content/catalog.js](content/catalog.js).

## Estrutura

Veja [docs/STRUCTURE.md](docs/STRUCTURE.md).
