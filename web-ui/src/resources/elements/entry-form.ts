import { EventAggregator } from 'aurelia-event-aggregator';
import { autoinject, bindable, observable, BindingEngine } from 'aurelia-framework';
import { DeepObserver } from 'services/deep-observable';

@autoinject()
export class EntryForm {

    @bindable()
    scenario: any = false;

    @bindable()
    sidebarLinks: Array<any> = [];

    constructor(private eventAggregator: EventAggregator, private deepobserver: DeepObserver, private bindingEngine: BindingEngine) {
        this.deepobserver.observe(this, 'scenario', (n, o, p) => {
            console.log('DATA CHANGED:', p, ':', o, '===>', n);
            this.saveChanges();
        });

        this.eventAggregator.subscribe('entryFormEdited', response => {
            this.saveChanges();
        })
    }

    bind() {
        
    }

    unbind() {

    }

    attached() {

    }

    detached() {

    }

    saveChanges() {
        this.eventAggregator.publish('selectedEntryEdited', this.scenario);
        console.log('selectedEntryEdited', this.scenario);
    }
}