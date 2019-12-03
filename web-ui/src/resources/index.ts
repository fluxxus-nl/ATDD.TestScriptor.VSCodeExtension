import {FrameworkConfiguration} from 'aurelia-framework';

export function configure(config: FrameworkConfiguration) {
  config.globalResources([
    './elements/toolbar.html',
    './elements/test-list',
    './elements/entry-form',
    './elements/entry-form-group'
  ]);
}
