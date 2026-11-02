# Structure

Hexagonal modules (Ports and Adapters): domain at the centre, application around it, infrastructure at the edge.

## Rules for the whole repo

- Dependencies point inward: infrastructure → application → domain. The domain imports only the domain and `src/shared/`.
- Another module is reached only through its `index.js`.
- Use cases take commands and return results built by `application/dtos/` mappers; driving adapters never hold an entity.
- Each module wires itself in `infrastructure/config/`; `src/app/composition-root.js` calls those once for the whole app.
- Tests sit beside the file they test, as `<file>.test.js`, and run with `node --test`. Use-case tests run on in-memory driven adapters.

## `/` — the portal

Frontend, vanilla JavaScript (ES modules, no framework, no build step).

```
index.html                     ← page shell, loads src/main.js
server.mjs                     ← zero-dependency static server (npm start)
src/
├── main.js                    ← mounts the app
├── styles.css
├── app/                       ← shell: router, home page, composition root
│   ├── composition-root.js
│   ├── router.js
│   └── home-page.js
├── shared/                    ← shared kernel
│   ├── audio/synth.js         ← soft Web Audio synth, one channel per activity
│   ├── stage/create-stage.js  ← canvas, unified input and frame loop handed to plugins
│   └── ui/dom.js              ← h() element builder
└── modules/
    ├── catalog/               ← which activities exist and how to open one
    │   ├── index.js
    │   ├── domain/{entities,errors,ports}/
    │   ├── application/{use-cases,dtos}/
    │   └── infrastructure/{driven,driving,config}/
    ├── screen-time/           ← daily screen-time limit
    │   ├── index.js
    │   ├── domain/{entities,ports}/
    │   ├── application/{use-cases,services,dtos}/
    │   └── infrastructure/{driven,driven/dtos,driving,config}/
    └── player/                ← plays one activity full screen (display only)
        ├── index.js
        └── infrastructure/driving/
content/                       ← activity plugins and the catalog that lists them
├── catalog.js
├── catalog.test.js
├── games/<id>/<id>.game.js
└── videos/<id>/<id>.animation.js, videos/media/
```

### Names

| Folder | Spelling | Example |
|---|---|---|
| `domain/entities` | `<noun>.js` | `daily-screen-time.js` |
| `domain/ports` | `<noun>.port.js` | `screen-time-repository.port.js` |
| `domain/errors` | `<noun>.error.js` | `activity-not-found.error.js` |
| `application/use-cases` | `<verb-noun>.use-case.js` | `record-screen-time.use-case.js` |
| `application/services` | `<noun>.service.js` | `today-screen-time.service.js` |
| `application/dtos` | `<noun>.result.js` | `screen-time.result.js` |
| `infrastructure/driven` | `<technology>-<port>.adapter.js` | `local-storage-screen-time-repository.adapter.js` |
| `infrastructure/driven/dtos` | `<technology>-<noun>.model.js` | `local-storage-screen-time.model.js` |
| `infrastructure/driving` | `<noun>-<widget>.js` | `catalog-grid.js`, `player-page.js` |
| `infrastructure/config` | `<module>.config.js` | `catalog.config.js` |
| `content/games` | `<id>.game.js` | `bolhas.game.js` |
| `content/videos` | `<id>.animation.js` | `estrelinha.animation.js` |

### Departures

- **Ports are JSDoc typedefs** in `domain/ports/*.port.js`. Plain JavaScript has no interfaces, and a typedef keeps one home per port without a build step.
- **The catalog has one driven adapter.** `StaticCatalogAdapter` already reads an in-memory list, so the use-case tests run on it with their own entries.
- **Driving adapters are plain functions** (`render…`, `mount…`) that return elements or a cleanup function. There is no UI framework, so there are no components or hooks.
- **`content/` sits outside `src/`.** Games and videos are plugins that a non-programmer edits often. They depend only on the `stage` object they receive, never on imports from `src/`. The catalog lives beside them so that adding one is a change in one folder.
- **`app/home-page.js` composes two modules** (the catalog grid and the screen-time panel), so it belongs to the shell and not to either module.
