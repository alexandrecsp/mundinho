import { compose } from './app/composition-root.js';
import { startRouter } from './app/router.js';

startRouter(document.getElementById('app'), compose());
