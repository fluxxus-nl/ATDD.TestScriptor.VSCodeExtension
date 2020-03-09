import { autoinject, bindable, observable, BindingEngine, Disposable, ICollectionObserverSplice } from 'aurelia-framework';
import { ColumnApi, GridApi, GridOptions, RowNode } from 'ag-grid-community';
import { Subscription, EventAggregator } from 'aurelia-event-aggregator';
import { BackendService } from 'services/backend-service';

@autoinject()
export class TestList {

    subscriptions: Array<Disposable> = [];
    private gridOptions: GridOptions;
    private api: GridApi;
    private columnApi: ColumnApi;

    @bindable()
    entries: Array<any> = [];

    @bindable()
    currEntry: any = false;

    @bindable()
    searchValue: string;

    constructor(private eventAggregator: EventAggregator, private bindingEngine: BindingEngine, private backendService: BackendService) {
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

        this.subscriptions.push(this.eventAggregator.subscribe('appMainColumnsResized', response => {
            this.api.sizeColumnsToFit();
        }));

        this.subscriptions.push(this.eventAggregator.subscribe('selectedEntryEdited', entry => {
            console.log('test-list selectedEntryEdited', entry, this.entries);
            if (entry) {
                let currNode = this.api.getSelectedNodes()[0];
                if (currNode) {
                    currNode.setData(entry);
                    this.api.refreshCells({rowNodes: [currNode]});
                }
            }
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
            this.api.sizeColumnsToFit();
            this.columnApi = this.gridOptions.columnApi;
            this.columnApi.setColumnVisible('Project', false);
        };
    }

    detached() {

    }

    listChanged(splices: Array<ICollectionObserverSplice<any>>) {
        this.api.setRowData(this.entries);
        let projects = [...new Set(this.entries.map(item => item.Project))];
        this.columnApi.setColumnVisible('Project', projects.length > 1);
    }

    selectionChanged() {
        let data = this.api.getSelectedRows();
        this.currEntry = data[0];
        console.log('Selection changed', this.currEntry);
    }

    async sendCommand(entry: any, type: string) {
        await this.backendService.send({ Command: type, Data: entry });
    }

    searchValueChanged() {
        this.api.setQuickFilter(this.searchValue);
    }

}
