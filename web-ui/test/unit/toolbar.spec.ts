import { Container } from 'aurelia-framework';
import { CommandHandlerService } from './../../src/backend/CommandHandlerService';
import { Toolbar } from './../../src/resources/elements/toolbar';
import { bootstrap } from 'aurelia-bootstrapper';
import { StageComponent } from 'aurelia-testing';

describe('Stage Toolbar Component', () => {
  let component;
  let viewModel;
  let container;

  beforeEach(() => {
    container = new Container();
    viewModel = container.get(Toolbar);
    component = StageComponent
      .withResources('resources/elements/toolbar')
      .inView('<toolbar></toolbar>')
      .boundTo(viewModel);
  });

  afterEach(() => component.dispose());

  it('should have brand', done => {
    component.create(bootstrap).then(() => {
      const navbarBrand = document.querySelector('.navbar-brand');
      expect(navbarBrand.innerHTML).toBe('ATDD TestScriptor');
      done();
    }).catch(e => {
      fail(e);
      done();
    });
  });

  it('should have search input', done => {
    component.create(bootstrap).then(() => {
      const navbarBrand = document.querySelector('.navbar input.form-control');
      expect(navbarBrand.getAttribute('placeholder')).toBe('Search');
      done();
    }).catch(e => {
      fail(e);
      done();
    });
  });

});
