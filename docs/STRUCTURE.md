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
│   ├── stage/create-stage.js  ← canvas, unified input, frame loop and theme colours handed to plugins
│   ├── theme/mix-palette.js   ← blends a { light, dark } palette across a theme change
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
    ├── theme/                 ← light or dark, chosen or by time of day
    │   ├── index.js
    │   ├── domain/{value-objects,ports}/
    │   ├── application/{use-cases,dtos}/
    │   └── infrastructure/{driven,driving,config}/
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
| `domain/value-objects` | `<noun>.js` | `theme-preference.js` |
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
- **`app/home-page.js` composes three modules** (the catalog grid, the screen-time panel and the theme picker), so it belongs to the shell and not to any one of them.
- **The theme module's config wires a driving adapter.** `theme-controller.js` must exist once per app, because it owns `<html data-theme>` and the clock re-check, so `createThemeModule` builds it alongside the use cases.
- **Each module keeps its own clock port.** Screen time needs the day and the theme needs the hour. Sharing one port would couple two modules that change for different reasons.
