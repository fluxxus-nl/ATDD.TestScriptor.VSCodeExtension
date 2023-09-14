import { AppService } from 'services/app-service';
import { EventAggregator } from 'aurelia-event-aggregator';
import { autoinject, bindable, Disposable } from 'aurelia-framework';
import { AppEventPublisher, Message, MessageDetailType, TypeChanged, MessageState, MessageUpdate } from 'types';

@autoinject()
export class EntryFormGroup {

    @bindable()
    title: any;

    @bindable()
    scenario: Message;

    @bindable()
    entries: Array<string>;

    @bindable()
    singleEntry: boolean;

    @bindable()
    type: string;

    subscriptions: Array<Disposable> = [];

    maxInputLength: number;

    constructor(private eventAggregator: EventAggregator, private appService: AppService) {
        let descLengthTxt = this.appService.getVsConfig('maxLengthOfDescription');
        let descLength = Number.parseInt(descLengthTxt);
        this.maxInputLength = isNaN(descLength) ? 500 : descLength;
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
        this.subscriptions.map(m => m.dispose());
    }

    add() {
        if (this.entries) {
            this.entries.splice(this.entries.length, 0, '');
        } else {
            this.entries = [''];
        }
    }

    update(index: number, newValue: any) {
        let oldValue: string = '';
        if (index !== -1) {
            oldValue = this.entries[index];
            this.entries.splice(index, 1, newValue);
        }
        let message: Message = JSON.parse(JSON.stringify(this.scenario));
        message.ArrayIndex = index;

        let newState = !oldValue || oldValue.length == 0 ? MessageState.New : MessageState.Modified;
        this.appService.sendChangeNotification(this.getTypeChanged(), newState, newValue, oldValue, message);
    }

    remove(index: number, e: MouseEvent) {
        let currValue: string = '';
        if (index !== -1) {
            currValue = this.entries[index];
        }

        let message: Message = JSON.parse(JSON.stringify(this.scenario));
        message.ArrayIndex = index;

        this.appService.sendChangeNotification(this.getTypeChanged(), MessageState.Deleted, null, currValue, message);
    }

    focus(index: number) {
        return index == this.entries.length - 1;
    }

    getTypeChanged() {
        let changedType: TypeChanged;
        switch (this.type) {
            case MessageDetailType.Given:
                changedType = TypeChanged.Given;
                break;
            case MessageDetailType.When:
                changedType = TypeChanged.When;
                break;
            case MessageDetailType.Then:
                changedType = TypeChanged.Then;
                break;
        }

        return changedType;
    }

    async savechangeEventHandler(message: MessageUpdate, cancelled: boolean = false) {        

        if (Number.isInteger(message.ArrayIndex) === false || message.ArrayIndex < 0) {
            return;
        }

        if ([TypeChanged.Given, TypeChanged.When, TypeChanged.Then].indexOf(message.Type) == -1) {
            return;
        }

        let type: MessageDetailType;
        switch (message.Type) {
            case TypeChanged.Given:
                type = MessageDetailType.Given;
                break;
            case TypeChanged.When:
                type = MessageDetailType.When;
                break;
            case TypeChanged.Then:
                type = MessageDetailType.Then;
                break;
        }

        if (type != MessageDetailType[this.type]) {
            return;
        }        

        console.log('savechangeEventHandler', message, cancelled, this.type);

        if (cancelled !== true) {
            switch (message.State) {
                case MessageState.Deleted:
                    this.entries.splice(message.ArrayIndex, 1);
                    break;
                case MessageState.Modified:
                    this.entries.splice(message.ArrayIndex, 1, message.NewValue);
                    break;
            }
        } else {
            let originalValue: string = message.OldValue;
            this.entries.splice(message.ArrayIndex, 1, originalValue);
        }
    }
}