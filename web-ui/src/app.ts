import { connectTo, StateHistory, Store } from 'aurelia-store';
import { State } from 'state';
import { autoinject } from 'aurelia-framework';

@autoinject()
@connectTo<State>()
export class App {

  public state: State;

  private scenario: any = {
    feature: 'Feature 1',
    name: 'Scenario 1',
    given: ['This', 'That', 'And these'],
    when: ['This happens'],
    then: ['This should be it', 'That is also true']
  }

  constructor(private store: Store<State>) {
    this.store.registerAction('updateEntries', updateEntries);
  }

  attached() {
    this.store.dispatch('updateEntries', [
      { Project: 'My app', Feature: 'Test 1', Scenario: 'Scenario 1', Codeunit: 'Test 1 Codeunit' },
      { Project: 'My app', Feature: 'Test 1', Scenario: 'Scenario 2', Codeunit: 'Test 1 Codeunit' },
      { Project: 'My other app', Feature: 'Test 2', Scenario: 'Scenario 1', Codeunit: 'Test 2 Codeunit' }
    ]);
  }

  stateChanged(newState: State, oldState: State) {
    console.log('The state has changed', newState);
  }
}


const updateEntries = (state: State, newEntries: Array<any>) => {
  const newState = Object.assign({}, state);
  newState.testEntries = newEntries;
  return newState;
}