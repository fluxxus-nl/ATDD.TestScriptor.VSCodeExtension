import { BackendType } from './backend/BackendType';
// state.ts

export interface State {
    backendType: BackendType;
    testEntries: Array<any>;
    currEntry: any;
}

export const initialState: State = {
    testEntries: [],
    currEntry: null,
    backendType: BackendType.VSCode
};

