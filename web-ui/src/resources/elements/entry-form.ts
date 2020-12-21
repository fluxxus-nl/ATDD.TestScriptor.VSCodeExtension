import { AppService } from 'services/app-service';
import { EventAggregator } from 'aurelia-event-aggregator';
import { autoinject, bindable, observable, BindingEngine, Disposable } from 'aurelia-framework';
import { DeepObserver } from 'services/deep-observable';
import { Message, MessageState, AppEventPublisher, TypeChanged, MessageUpdate, MessageDetailType } from 'types';

@autoinject()
export class EntryForm {

    /*
    <!-- editable feature and ID are out of scope for now
    <select class="custom-select" value.bind="scenario.Feature">
        <option value="">-- None --</option>
        <optgroup repeat.for="link of sidebarLinks" label="${link.name}" if.bind="link.name != 'All'">
            <option repeat.for="sublink of link.children" value.bind="sublink">${sublink}</option>
        </optgroup>
    </select>

    <input type="text" class="form-control" value.bind="scenario.Id & debounce:300" placeholder="Scenario ID...">
    -->
    */

    @bindable()
    scenario: Message;

    @bindable()
    sidebarLinks: Array<any> = [];

    subscriptions: Array<Disposable> = [];

    skipObserverChangeEmitting: boolean = false;

    constructor(private eventAggregator: EventAggregator, private appService: AppService, private deepobserver: DeepObserver, private bindingEngine: BindingEngine) {
        this.deepobserver.observe(this, 'scenario', (n, o, p) => {
            if (this.skipObserverChangeEmitting === true) {
                return;
            }

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
        this.subscriptions.push(this.eventAggregator.subscribe(AppEventPublisher.saveChangesOK, async (message: MessageUpdate) => {
            this.savechangeEventHandler(message, false);
        }));

        this.subscriptions.push(this.eventAggregator.subscribe(AppEventPublisher.saveChangesCancelled, async (message: MessageUpdate) => {
            this.savechangeEventHandler(message, true);
        }));
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

    async savechangeEventHandler(message: MessageUpdate, cancelled: boolean = false) {
        console.log('savechangeEventHandler', message, cancelled, this.scenario);

        if ([TypeChanged.ScenarioFeature, TypeChanged.ScenarioName, TypeChanged.ScenarioId].indexOf(message.Type) == -1) {
            return;
        }

        this.skipObserverChangeEmitting = true;
        if (cancelled === true) {
            switch (message.Type) {
                case TypeChanged.ScenarioName:
                    this.scenario.Scenario = message.OldValue;
                    this.scenario.MethodName = message.MethodName;
                    break;
                case TypeChanged.ScenarioId:
                    this.scenario.Id = Number(message.OldValue);
                    break;
                case TypeChanged.ScenarioFeature:
                    this.scenario.Feature = message.OldValue;
                    break;
            }
        } else {
            switch (message.Type) {
                case TypeChanged.ScenarioName:
                    this.scenario.MethodName = message.MethodName;
                    this.scenario.FsPath = message.FsPath;
                    break;
                case TypeChanged.ScenarioId:
                    // no processing is required yet
                    break;
                case TypeChanged.ScenarioFeature:
                    // no processing is required yet
                    break;
            }            
        }
        
        setTimeout(() => {
            this.skipObserverChangeEmitting = false;
        }, 50);
    }
}