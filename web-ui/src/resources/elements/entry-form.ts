import { EventAggregator } from 'aurelia-event-aggregator';
import { autoinject, bindable, observable, BindingEngine } from 'aurelia-framework';
import { DeepObserver } from 'services/deep-observable';
import { Message, MessageState, AppEventPublisher } from 'types';

@autoinject()
export class EntryForm {

    @bindable()
    scenario: Message;

    @bindable()
    sidebarLinks: Array<any> = [];

    constructor(private eventAggregator: EventAggregator, private deepobserver: DeepObserver, private bindingEngine: BindingEngine) {
        this.deepobserver.observe(this, 'scenario', (n, o, p) => {            
            console.log('DATA CHANGED:', p, ':', o, '===>', n);
            this.saveChanges();
        });

        this.eventAggregator.subscribe(AppEventPublisher.entryFormEdited, response => {
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
        this.scenario.IsDirty = true;
        if (this.scenario.State == MessageState.Unchanged) {
            this.scenario.State = MessageState.Modified;
        }
        this.eventAggregator.publish(AppEventPublisher.selectedEntryEdited, this.scenario);
        console.log('selectedEntryEdited', this.scenario);
    }
}