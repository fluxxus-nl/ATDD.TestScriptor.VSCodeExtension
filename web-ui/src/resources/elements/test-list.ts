import { autoinject, bindable, observable, BindingEngine, Disposable, ICollectionObserverSplice } from 'aurelia-framework';
import { ColumnApi, GridApi, GridOptions } from 'ag-grid-community';
import { Subscription, EventAggregator } from 'aurelia-event-aggregator';

@autoinject()
export class TestList {

    subscriptions: Array<Disposable> = [];
    private gridOptions: GridOptions;
    private api: GridApi;
    private columnApi: ColumnApi;

    @bindable()
    entries: Array<any> = [];

    @bindable()
    currEntry: any;

    constructor(private eventAggregator: EventAggregator, private bindingEngine: BindingEngine) {
        this.gridOptions = <GridOptions>{
            defaultColDef: {
                resizable: true,
                sortable: true,
                editable: true
            }
        };
    }

    bind() {
        this.subscriptions.push(this.eventAggregator.subscribe('onNewScenario', response => {
            this.entries.push(response);
            console.log(response, this.entries);
        }));

        this.subscriptions.push(this.bindingEngine.collectionObserver(this.entries).subscribe(this.listChanged.bind(this)));
    }

    unbind() {
        this.subscriptions.forEach(s => s.dispose());
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

    listChanged(splices: Array<ICollectionObserverSplice<any>>) {
        this.api.setRowData(this.entries);
    }

    selectionChanged() {
        let data = this.api.getSelectedRows();
        this.currEntry = data[0];
        console.log('Selection changed', this.currEntry);
    }

    sendCommand(entry: any, type: string) {

    }
}
