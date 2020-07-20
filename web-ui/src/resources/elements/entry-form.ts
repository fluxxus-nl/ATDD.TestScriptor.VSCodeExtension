import { AppService } from 'services/app-service';
import { EventAggregator } from 'aurelia-event-aggregator';
import { autoinject, bindable, observable, BindingEngine, Disposable } from 'aurelia-framework';
import { DeepObserver } from 'services/deep-observable';
import { Message, MessageState, AppEventPublisher, TypeChanged } from 'types';

@autoinject()
export class EntryForm {

    @bindable()
    scenario: Message;

    @bindable()
    sidebarLinks: Array<any> = [];

    constructor(private eventAggregator: EventAggregator, private appService: AppService, private deepobserver: DeepObserver, private bindingEngine: BindingEngine) {
        this.deepobserver.observe(this, 'scenario', (n, o, p) => {
            if (['scenario', 'scenario.Id', 'scenario.Feature', 'scenario.Scenario'].indexOf(p) != -1 && o != n) {
                this.scenarioItemChanged(p, n, o);
            }
        });
    }

    bind() {

    }

    unbind() {

    }

    attached() {

    }

    detached() {
    }

    scenarioItemChanged(property: string, newValue: Message, oldValue: Message) {
        if (newValue == oldValue) {
            return;
        }

        if (property == 'scenario') {
            // no selection
            if (!newValue || !oldValue || oldValue && !oldValue.Uid || oldValue.Uid.length == 0) {
                return;
            }

            // scenario selection changed
            if (oldValue.Uid !== newValue.Uid)
                return;

            // no changes to be saved
            if (newValue.State == MessageState.Unchanged && oldValue.Uid === newValue.Uid)
                return;
        }

        console.log('scenarioChanged:', property, newValue, oldValue);

        this.scenario.IsDirty = true;
        if (this.scenario.State == MessageState.Unchanged) {
            this.scenario.State = MessageState.Modified;
        }
        this.eventAggregator.publish(AppEventPublisher.selectedEntryEdited, this.scenario);

        let typeChanged = this.getTypeChanged(property);
        this.appService.sendChangeNotification(typeChanged, MessageState.Modified, newValue, oldValue, this.scenario);
    }

    getTypeChanged(property: string) {
        switch (property) {
            case 'scenario.Feature':
                return TypeChanged.ScenarioFeature;
            case 'scenario.Id':
                return TypeChanged.ScenarioId;
            case 'scenario.Scenario':
                return TypeChanged.ScenarioName;
        }
    }
}