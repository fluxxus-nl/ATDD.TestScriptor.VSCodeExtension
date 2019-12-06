import { BackendService } from './backend/BackendService';
import { autoinject, observable, Disposable, BindingEngine } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

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
  entries: Array<any>;

  @observable()
  currEntry: any;

  constructor(private backendService: BackendService, private eventAggregator: EventAggregator, private bindingEngine: BindingEngine) {
    this.backendService.determineType();
    let scenarioBase = JSON.stringify(this.scenario);
    this.entries = [
      { Project: 'My app', Feature: 'Test 1', Scenario: 'Scenario 1', Codeunit: 'Test 1 Codeunit', Details: JSON.parse(scenarioBase) },
      { Project: 'My app', Feature: 'Test 1', Scenario: 'Scenario 2', Codeunit: 'Test 1 Codeunit', Details: JSON.parse(scenarioBase) },
      { Project: 'My other app', Feature: 'Test 2', Scenario: 'Scenario 1', Codeunit: 'Test 2 Codeunit', Details: JSON.parse(scenarioBase) }
    ];

  }

  attached() {

  }

  detached() {

  }
}
