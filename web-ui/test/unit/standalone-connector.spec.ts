import { BackendService } from './../../src/backend/BackendService';
import { App } from '../../src/app';
import { BackendType } from '../../src/backend/BackendType';
import { Container, view, PLATFORM, newInstance, NewInstance } from 'aurelia-framework';
import { bootstrap } from 'aurelia-bootstrapper';
import { StageComponent, ComponentTester } from 'aurelia-testing';

describe('Stage Backend Connectors', () => {
  let component: ComponentTester<any>;
  let container: Container;
  let backendService: BackendService;
  let viewModel: App;
  let _window = PLATFORM.global;

  beforeEach(async () => {
    container = new Container();
    backendService = NewInstance.of(BackendService).get(container);
    viewModel = NewInstance.of(App).get(container);

    component = StageComponent
      .withResources('app')
      .inView('<app></app>')
      .boundTo(viewModel);
  });

  afterEach(() => {
    component.dispose()
  });

  it('should have Standalone backend', done => {
    (<any>_window).acquireVsCodeApi = null;

    component.create(bootstrap).then(() => {
      expect(backendService.type).toEqual(BackendType.Standalone);
      done();
    }).catch(e => {
      fail(e);
      done();
    });
  });
});
