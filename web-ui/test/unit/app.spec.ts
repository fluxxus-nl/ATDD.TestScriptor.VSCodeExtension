import { bootstrap } from 'aurelia-bootstrapper';
import { StageComponent } from 'aurelia-testing';

describe('Stage App Component', () => {
  let component;

  beforeEach(() => {
    component = StageComponent
      .withResources('app')
      .inView('<app></app>');
  });

  afterEach(() => component.dispose());

  it('should have main-content', done => {
    component.create(bootstrap).then(() => {
      const elem = document.querySelector('#main-content');
      expect(elem).toBeDefined();
      done();
    }).catch(e => {
      fail(e);
      done();
    });
  });

  it('should have Test List', done => {
    component.create(bootstrap).then(() => {
      const elem = document.querySelector('test-list');
      expect(elem).toBeDefined();
      done();
    }).catch(e => {
      fail(e);
      done();
    });
  });

  it('should have Entry Form', done => {
    component.create(bootstrap).then(() => {
      const elem = document.querySelector('entry-form');
      expect(elem).toBeDefined();
      done();
    }).catch(e => {
      fail(e);
      done();
    });
  });
});
