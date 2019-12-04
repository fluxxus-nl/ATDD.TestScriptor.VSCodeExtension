import { State } from './../../src/state';
import { Container } from 'aurelia-framework';
import { bootstrap } from 'aurelia-bootstrapper';
import { StageComponent, ComponentTester } from 'aurelia-testing';
import { Store } from 'aurelia-store';
import { Actions } from 'actions';

describe('Stage Test List Component', () => {
  let component: ComponentTester<any>;
  let container: Container;
  let store: Store<State>;

  beforeEach(async () => {
    container = new Container();
    store = container.get<Store<State>>(Store);
    store.registerAction(Actions.updateCurrEntry.name, Actions.updateCurrEntry);
    await store.dispatch(Actions.updateCurrEntry, { Feature: 'Test 1' });

    component = StageComponent
      .withResources('resources/elements/test-list')
      .inView('<test-list></test-list>');
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
      store.state.subscribe(
        (state: State) => expect(state.currEntry.Feature).toBe('Test 1')
      );
      done();
    }).catch(e => {
      fail(e);
      done();
    });
  });
});
