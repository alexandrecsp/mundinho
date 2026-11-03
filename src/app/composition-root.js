import { catalog } from '../../content/catalog.js';
import { createCatalogModule } from '../modules/catalog/index.js';
import { createAnimalShapesModule } from '../modules/animal-shapes/index.js';
import { createColorWordsModule } from '../modules/color-words/index.js';
import { createScreenTimeModule } from '../modules/screen-time/index.js';
import { createThemeModule } from '../modules/theme/index.js';
import { createSynth } from '../shared/audio/synth.js';

const DEFAULT_DAILY_LIMIT_MS = 10 * 60_000;

/** Wires every module once, for the whole app. */
export function compose() {
  const storage = browserStorage();
  return {
    catalog: createCatalogModule({ entries: catalog }),
    screenTime: createScreenTimeModule({ storage, defaultLimitMs: DEFAULT_DAILY_LIMIT_MS }),
    theme: createThemeModule({ storage }),
    colorWords: createColorWordsModule({ storage }),
    animalShapes: createAnimalShapesModule({ storage }),
    synth: createSynth(),
  };
}

// Reading window.localStorage throws when the browser blocks site data.
function browserStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
