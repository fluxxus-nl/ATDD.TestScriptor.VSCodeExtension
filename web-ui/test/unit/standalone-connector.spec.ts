import { App } from '../../src/app';
import { BackendType } from '../../src/backend/BackendType';
import { State } from '../../src/state';
import { Container, view } from 'aurelia-framework';
import { bootstrap } from 'aurelia-bootstrapper';
import { StageComponent, ComponentTester } from 'aurelia-testing';
import { Store } from 'aurelia-store';

describe('Stage Backend Connectors', () => {
  let component: ComponentTester<any>;
  let container: Container;
  let store: Store<State>;
  let viewModel: App;

  beforeEach(async () => {
    container = new Container();
    store = container.get<Store<State>>(Store);
    viewModel = container.get(App);

    component = StageComponent
      .withResources('app')
      .inView('<app></app>')
      .boundTo(viewModel);
  });

  afterEach(() => component.dispose());

  it('should have Standalone backend', done => {
    (<any>window).aquireVsCodeApi = null;
    component.create(bootstrap).then(() => {
      store.state.subscribe(
        (state: State) => expect(state.backendType).toEqual(BackendType.Standalone)
      );
      done();
    }).catch(e => {
      fail(e);
      done();
    });
  });
});
