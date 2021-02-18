import {FrameworkConfiguration} from 'aurelia-framework';

export function configure(config: FrameworkConfiguration) {
  config.globalResources([
    './elements/toolbar',
    './elements/test-list',
    './elements/feature-list',
    './elements/entry-form',
    './elements/entry-form-group',
    './elements/loader.html'
  ]);
}
