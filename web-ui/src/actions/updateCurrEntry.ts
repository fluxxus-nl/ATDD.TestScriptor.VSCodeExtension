import { State } from "state";

const updateCurrEntry = (state: State, entry: any) => {
    const newState = Object.assign({}, state);
    newState.currEntry = entry;
    return newState;
}

export default updateCurrEntry;