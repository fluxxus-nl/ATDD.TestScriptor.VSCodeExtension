import { EventAggregator } from 'aurelia-event-aggregator';
import { autoinject, bindable, PassThroughSlot } from 'aurelia-framework';
import { AppEventPublisher } from 'types';

@autoinject()
export class EntryFormGroup {

    @bindable()
    title: any;

    @bindable()
    entries: Array<string>;

    @bindable()
    singleEntry: boolean;

    constructor(private eventAggregator: EventAggregator) {

    }

    attached() {

    }

    detached() {

    }

    add() {
        if (this.entries) {
            this.entries.splice(this.entries.length, 0, '');
        } else {
            this.entries = [''];
        }

        this.eventAggregator.publish(AppEventPublisher.entryFormEdited);
    }

    update(index: number, newValue: any) {
        if (index !== -1)
            this.entries.splice(index, 1, newValue);

        console.log('entry-form-group changed', index, newValue, this.entries);

        this.eventAggregator.publish(AppEventPublisher.entryFormEdited);
    }

    remove(index: number, e: MouseEvent) {
        if (index !== -1)
            this.entries.splice(index, 1);

        this.eventAggregator.publish(AppEventPublisher.entryFormEdited);
    }

}