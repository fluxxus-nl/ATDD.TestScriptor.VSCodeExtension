import { connectTo, StateHistory, Store } from 'aurelia-store';
import { State } from 'state';
import { autoinject } from 'aurelia-framework';

@autoinject()
@connectTo<State>()
export class App {

  public state: State;

  constructor(private store: Store<State>) {
    this.store.registerAction('updateEntries', updateEntries);
  }

  attached() {
    this.store.dispatch('updateEntries', [
      { Feature: 'Test 1', Scenario: 'Scenario 1' }
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