import { TestList } from './../../src/resources/elements/test-list';
import { Container, NewInstance } from 'aurelia-framework';
import { bootstrap } from 'aurelia-bootstrapper';
import { StageComponent, ComponentTester } from 'aurelia-testing';

describe('Stage Test List Component', () => {
  let component: ComponentTester<TestList>;
  let container: Container;

  beforeEach(async () => {
    container = new Container();

    component = StageComponent
      .withResources('resources/elements/test-list')
      .inView('<test-list curr-entry.bind="testEntry"></test-list>')
      .boundTo({testEntry: {Feature: 'Test 1'}});
  });

  afterEach(() => component.dispose());

  it('should have ag-grid loaded', done => {
    component.create(bootstrap).then(() => {
      const elem = document.querySelector('ag-grid-aurelia');
      expect(elem).toBeDefined();
      done();
    }).catch(e => {
      fail(e);
      done();
    });
  });

  it('should have state changed', done => {
    component.create(bootstrap).then(() => {
      console.log(component.viewModel);
      expect(component.viewModel.currEntry.Feature).toBe('Test 1');
      done();
    }).catch(e => {
      fail(e);
      done();
    });
  });
});
