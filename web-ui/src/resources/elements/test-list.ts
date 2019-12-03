import { autoinject, bindable } from 'aurelia-framework';
import { ColumnApi, GridApi, GridOptions } from 'ag-grid-community';

@autoinject()
export class TestList {

    @bindable()
    data: Array<any>;
    
    private gridOptions: GridOptions;
    private api: GridApi;
    private columnApi: ColumnApi;

    constructor() {
        this.gridOptions = <GridOptions>{
            defaultColDef: {
                resizable: true,
                sortable: true,
                editable: true
            }
        };
    }

    attached() {

    }

    detached() {

    }

    selectRow(data: any, e: any) {

    }

    sendCommand(entry: any, type: string) {
        
    }
}