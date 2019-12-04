import { Actions } from './../../actions/index';
import { ICommand } from "backend/CommandHandlerService";
import { transient } from "aurelia-framework";
import { connectTo, Store } from "aurelia-store";
import { State } from "state";
import addEntry from "actions/addEntry";

@transient()
@connectTo<State>()
export class NewScenarioCommand implements ICommand {

    constructor(private store: Store<State>) {
        this.store.registerAction(Actions.addEntry.name, addEntry);
    }

    async execute(payload: any): Promise<void> {
        this.store.dispatch(Actions.addEntry, { Project: 'My app', Feature: 'Test 11', Scenario: 'Scenario 11', Codeunit: 'Test 11 Codeunit' });
    }
}
