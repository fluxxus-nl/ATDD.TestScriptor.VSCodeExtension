import { State } from "state";

const addEntry = (state: State, newEntry: any) => {
    const newState = Object.assign({}, state);
    let newEntries = JSON.parse(JSON.stringify(state.testEntries));
    newEntries.push(newEntry);
    newState.testEntries = newEntries;
    return newState;
}

export default addEntry;