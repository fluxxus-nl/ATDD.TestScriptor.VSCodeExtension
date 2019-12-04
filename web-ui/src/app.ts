import { Actions } from './actions/index';
import { BackendService } from './backend/BackendService';
import { connectTo, StateHistory, Store } from 'aurelia-store';
import { State } from 'state';
import { autoinject, observable } from 'aurelia-framework';
import updateEntries from 'actions/updateEntries';

@autoinject()
@connectTo<State>()
export class App {

  private scenario: any = {
    feature: 'Feature 1',
    name: 'Scenario 1',
    given: ['This', 'That', 'And these'],
    when: ['This happens'],
    then: ['This should be it', 'That is also true']
  }

  constructor(private store: Store<State>, private backendService: BackendService) {
    this.store.registerAction(Actions.updateEntries.name, updateEntries);
    this.backendService.determineType();
  }

  async attached() {
    await this.store.dispatch(Actions.updateEntries, [
      { Project: 'My app', Feature: 'Test 1', Scenario: 'Scenario 1', Codeunit: 'Test 1 Codeunit', Details: Object.assign({}, this.scenario) },
      { Project: 'My app', Feature: 'Test 1', Scenario: 'Scenario 2', Codeunit: 'Test 1 Codeunit', Details: Object.assign({}, this.scenario) },
      { Project: 'My other app', Feature: 'Test 2', Scenario: 'Scenario 1', Codeunit: 'Test 2 Codeunit', Details: Object.assign({}, this.scenario) }
    ]);
  }

  stateChanged(newState: State, oldState: State) {
    console.log('The state has changed', newState);
  }
}
