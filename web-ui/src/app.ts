import { BackendService } from 'services/backend-service';
import { autoinject, observable, Disposable, BindingEngine, PLATFORM } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
(<any>PLATFORM.global).process = { env: { NODE_ENV: 'production' } };

@autoinject()
export class App {

  private scenario: any = {
    feature: 'Feature 1',
    name: 'Scenario 1',
    given: ['This', 'That', 'And these'],
    when: ['This happens'],
    then: ['This should be it', 'That is also true']
  }

  subscriptions: Array<Disposable> = [];

  @observable()
  entries: Array<any> = [];

  @observable()
  currEntry: any;

  options: any;

  constructor(private backendService: BackendService) {
    this.backendService.determineType();
    this.options = this.backendService.startup.options;

    let scenarioBase = JSON.stringify(this.scenario);
    /*this.entries = [
      { Project: 'My app', Feature: 'Test 1', Scenario: 'Scenario 1', Codeunit: 'Test 1 Codeunit', Details: JSON.parse(scenarioBase) },
      { Project: 'My app', Feature: 'Test 1', Scenario: 'Scenario 2', Codeunit: 'Test 1 Codeunit', Details: JSON.parse(scenarioBase) },
      { Project: 'My other app', Feature: 'Test 2', Scenario: 'Scenario 1', Codeunit: 'Test 2 Codeunit', Details: JSON.parse(scenarioBase) }
    ];*/

  }

  async attached() {
    this.entries = await this.backendService.send({ Command: 'LoadTests' });
  }

  detached() {

  }
}
