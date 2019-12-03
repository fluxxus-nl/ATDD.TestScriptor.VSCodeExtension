import { Aurelia } from 'aurelia-framework'
import { initialState } from './state';
import environment from './environment';

export function configure(aurelia: Aurelia) {
  aurelia.use
    .standardConfiguration()
    .feature('resources');

  aurelia.use.developmentLogging(environment.debug ? 'debug' : 'warn');

  aurelia.use.plugin('aurelia-store', {
    initialState,
    history: {
      undoable: false
    }
  })
    .plugin('ag-grid-aurelia');


  if (environment.testing) {
    aurelia.use.plugin('aurelia-testing');
  }

  aurelia.start().then(() => aurelia.setRoot());
}
