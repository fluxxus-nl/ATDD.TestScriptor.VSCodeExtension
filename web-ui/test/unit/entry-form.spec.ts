import { bootstrap } from 'aurelia-bootstrapper';
import { StageComponent } from 'aurelia-testing';

describe('Stage Entry Form Component', () => {
  let component;

  beforeEach(() => {
    component = StageComponent
      .withResources('resources/elements/entry-form')
      .inView('<entry-form></entry-form>');
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

  it('should have Entry Groups', done => {
    component.create(bootstrap).then(() => {
      const elem = document.querySelectorAll('entry-form-group');
      expect(elem.length).toEqual(3);
      done();
    }).catch(e => {
      fail(e);
      done();
    });
  });

});
