import { BackendService } from './../../src/backend/BackendService';
import { App } from '../../src/app';
import { BackendType } from '../../src/backend/BackendType';
import { Container, view } from 'aurelia-framework';
import { bootstrap } from 'aurelia-bootstrapper';
import { StageComponent, ComponentTester } from 'aurelia-testing';

describe('Stage Backend Connectors', () => {
  let component: ComponentTester<any>;
  let container: Container;
  let backendService: BackendService;
  let viewModel: App;

  beforeEach(async () => {
    container = new Container();
    backendService = container.get(BackendService);
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
      expect(backendService.type).toEqual(BackendType.Standalone);
      done();
    }).catch(e => {
      fail(e);
      done();
    });
  });
});
