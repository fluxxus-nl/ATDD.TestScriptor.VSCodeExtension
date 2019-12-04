import { State } from "state";
import { BackendType } from "backend/BackendType";

const updateBackendMode = (state: State, newType: BackendType) => {
    const newState = Object.assign({}, state);
    newState.backendType = newType;
    return newState;
};

export default updateBackendMode;
