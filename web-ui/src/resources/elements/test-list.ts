import { autoinject, bindable, observable, BindingEngine, Disposable, ICollectionObserverSplice } from 'aurelia-framework';
import { ColumnApi, GridApi, GridOptions, RowNode } from 'ag-grid-community';
import { EventAggregator } from 'aurelia-event-aggregator';
import { BackendService } from 'services/backend-service';
import { Message, AppEventPublisher, AppEditMode } from 'types';
import { AppService } from 'services/app-service';

@autoinject()
export class TestList {

    subscriptions: Array<Disposable> = [];
    private gridOptions: GridOptions;
    private api: GridApi;
    private columnApi: ColumnApi;

    @bindable()
    entries: Array<Message> = [];

    @bindable()
    currEntry: Message;

    @bindable()
    searchValue: string;

    constructor(private eventAggregator: EventAggregator, private bindingEngine: BindingEngine, private appService: AppService, private backendService: BackendService) {
        this.gridOptions = <GridOptions>{
            defaultColDef: {
                resizable: true,
                sortable: true,
                editable: true
            }
        };
    }

    bind() {
        this.subscriptions.push(this.eventAggregator.subscribe(AppEventPublisher.onNewScenario, response => {
            this.entries.splice(this.entries.length, 0, response);
            this.listChanged();
        }));

        this.subscriptions.push(this.eventAggregator.subscribe(AppEventPublisher.appMainColumnsResized, response => {
            this.api.sizeColumnsToFit();
        }));

        this.subscriptions.push(this.eventAggregator.subscribe(AppEventPublisher.selectedEntryEdited, entry => {
            console.log('test-list selectedEntryEdited', entry, this.entries);
            if (entry) {
                let currNode = this.api.getSelectedNodes()[0];
                if (currNode) {
                    currNode.setData(entry);
                    this.api.refreshCells({ rowNodes: [currNode] });
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
            this.columnApi = this.gridOptions.columnApi;
            this.columnApi.setColumnVisible('Project', false);
            this.api.sizeColumnsToFit();
        };
    }

    detached() {

    }

    listChanged(splices?: Array<ICollectionObserverSplice<any>>) {
        this.api.setRowData(this.entries);
        let projects = [...new Set(this.entries.map(item => item.Project))];
        this.columnApi.setColumnVisible('Project', projects.length > 1);
        this.appService.updateSidebarLinks(this.entries);
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
