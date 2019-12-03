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
        this.entries.push('');
    }

    remove(index: number, e: MouseEvent) {
        if (index !== -1)
            this.entries.splice(index, 1);
    }
}