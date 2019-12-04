import { autoinject, bindable, observable } from 'aurelia-framework';
import { connectTo, Store } from 'aurelia-store';
import { State } from 'state';
import { Subscription } from 'rxjs';

@autoinject()
@connectTo<State>()
export class EntryForm {

    @bindable()
    @observable()
    scenario: any;

    public state: State;
    private subscription: Subscription;

    constructor(private store: Store<State>) {

    }

    bind() {
        this.subscription = this.store.state.subscribe(
            (state) => this.state = state
        );
    }

    unbind() {
        this.subscription.unsubscribe();
    }

    attached() {

    }

    detached() {

    }

}