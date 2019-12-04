import { bootstrap } from 'aurelia-bootstrapper';
import { StageComponent } from 'aurelia-testing';

describe('Stage Entry Form Group Component', () => {
  let component;

  beforeEach(() => {
    component = StageComponent
      .withResources('resources/elements/entry-form-group')
      .inView('<entry-form-group></entry-form-group>');
  });

  afterEach(() => component.dispose());

  it('should have loaded', done => {
    component.create(bootstrap).then(() => {
      const elem = document.querySelector('.card-body');
      expect(elem).toBeDefined();
      done();
    }).catch(e => {
      fail(e);
      done();
    });
  });

  it('should have button', done => {
    component.create(bootstrap).then(() => {
      const elem = document.querySelectorAll('button');
      expect(elem.length).toBeGreaterThanOrEqual(1);
      done();
    }).catch(e => {
      fail(e);
      done();
    });
  });

});
