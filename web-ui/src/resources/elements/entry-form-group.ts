import { autoinject, bindable, PassThroughSlot } from 'aurelia-framework';

@autoinject()
export class EntryFormGroup {

    @bindable()
    title: any;

    @bindable()
    entries: Array<any>;

    @bindable()
    singleEntry: boolean;

    constructor() {

    }

    attached() {

    }

    detached() {

    }

    add() {
        if (this.entries) {
            this.entries.push('');
        } else {
            this.entries = [''];
        }
    }

    remove(index: number, e: MouseEvent) {
        if (index !== -1)
            this.entries.splice(index, 1);
    }
}