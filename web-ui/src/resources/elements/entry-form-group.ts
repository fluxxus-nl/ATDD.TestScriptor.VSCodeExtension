import { AppService } from 'services/app-service';
import { EventAggregator } from 'aurelia-event-aggregator';
import { autoinject, bindable } from 'aurelia-framework';
import { AppEventPublisher, Message, MessageDetailType, TypeChanged, MessageState } from 'types';

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
    type: MessageDetailType;

    constructor(private eventAggregator: EventAggregator, private appService: AppService) {

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
    }

    update(index: number, newValue: any) {
        let oldValue: string = '';
        if (index !== -1) {
            oldValue = this.entries[index];
            this.entries.splice(index, 1, newValue);
        }

        let newState = !oldValue || oldValue.length == 0 ? MessageState.New : MessageState.Modified;
        this.appService.sendChangeNotification(this.getTypeChanged(), newState, newValue, oldValue, this.scenario);
    }

    remove(index: number, e: MouseEvent) {
        let currValue: string = '';
        if (index !== -1) {
            currValue = this.entries[index];
            this.entries.splice(index, 1);
        }

        this.appService.sendChangeNotification(this.getTypeChanged(), MessageState.Deleted, currValue, null, this.scenario);
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

}