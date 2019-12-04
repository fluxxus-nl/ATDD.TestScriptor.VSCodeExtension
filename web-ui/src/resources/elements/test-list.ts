import { Actions } from './../../actions/index';
import { autoinject, bindable, observable, BindingEngine, ICollectionObserverSplice } from 'aurelia-framework';
import { ColumnApi, GridApi, GridOptions } from 'ag-grid-community';
import { connectTo, Store } from 'aurelia-store';
import { State } from 'state';
import { Subscription } from 'rxjs';
import updateCurrEntry from 'actions/updateCurrEntry';

@autoinject()
@connectTo<State>()
export class TestList {

    public state: State;
    private subscription: Subscription;

    private gridOptions: GridOptions;
    private api: GridApi;
    private columnApi: ColumnApi;

    constructor(private store: Store<State>) {
        this.store.registerAction(Actions.updateCurrEntry.name, updateCurrEntry);

        this.gridOptions = <GridOptions>{
            defaultColDef: {
                resizable: true,
                sortable: true,
                editable: true
            }
        };
    }

    bind() {
        this.subscription = this.store.state.subscribe(
            (state) => this.state = state
        );
    }

    unbind() {
        this.subscription.unsubscribe();
    }

    attached() {
        //this.gridOptions.rowHeight = 40; TODO
        this.gridOptions.onGridReady = () => {
          this.api = this.gridOptions.api;
          this.columnApi = this.gridOptions.columnApi;
        };    
    }

    detached() {

    }

    async selectionChanged() {
        let data = this.api.getSelectedRows();
        await this.store.dispatch(Actions.updateCurrEntry, data[0]);
    }

    sendCommand(entry: any, type: string) {

    }

    stateChanged(newState: State, oldState: State) {
        console.log('CurrEntry changed', newState.currEntry);
    }
}
