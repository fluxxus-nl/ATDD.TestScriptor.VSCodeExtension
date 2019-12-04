import { State } from "state";

const updateEntries = (state: State, newEntries: Array<any>) => {
    const newState = Object.assign({}, state);
    newState.testEntries = newEntries;
    return newState;
}

export default updateEntries;