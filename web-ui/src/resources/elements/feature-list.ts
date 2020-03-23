import { transient } from 'aurelia-framework';
import { AppService } from 'services/app-service';
import { AppEditMode } from 'types';

@transient()
export class FeatureList {

    currentFeature: any;
    entries = [];

    constructor(private appService: AppService) {
    }

    bind() {
        this.entries = this.appService.sidebarLinks;
    }

    save() {
        this.appService.editMode = AppEditMode.Scenario;
    }

    cancel() {
        this.appService.editMode = AppEditMode.Scenario;
    }

    add(parent: any) {
        /*if (this.entries) {
            this.entries.splice(this.entries.length, 0, '');
        } else {
            this.entries = [''];
        }*/

        //this.eventAggregator.publish(AppEventPublisher.entryFormEdited);
    }

    update(index: number, newValue: any) {
        /*if (index !== -1)
            this.entries.splice(index, 1, newValue);

        console.log('features changed', index, newValue, this.entries);*/

        //this.eventAggregator.publish(AppEventPublisher.entryFormEdited);
    }

    remove(index: number, e: MouseEvent) {
        /*if (index !== -1)
            this.entries.splice(index, 1);*/

        //this.eventAggregator.publish(AppEventPublisher.entryFormEdited);
    }

}