import { transient } from 'aurelia-framework';
import { AppService } from 'services/app-service';
import { AppEditMode } from 'types';
import dragula from 'dragula';

@transient()
export class FeatureList {

    currentFeature: any;
    entries = [];
    dragApi: any;

    constructor(private appService: AppService) {
    }

    bind() {
        this.entries = this.appService.sidebarLinks;
    }

    attached() {
        this.setupDragula();
    }

    setupDragula() {
        this.dragApi = dragula({
            isContainer: (el: Element) => {
                if (!el) {
                    return false;
                }
                if (this.dragApi.dragging) {
                    return el.classList.contains('sortable-group');
                }

                return el.classList.contains('sortable-group');
            },
            moves: (el: Element, source: Element, handle: Element, sibling: Element) => {
                return true; // elements are always draggable by default
            },
            accepts: (el: Element, target: Element, source: Element, sibling: Element) => {                
                return true;
            },
            invalid: (el: Element, handle: Element) => {
                return false; // don't prevent any drags from initiating by default
            },
            //direction: 'horizontal',
            revertOnSpill: true,
            ignoreInputTextSelection: true,
        });

        this.trackDrop(this.dragApi);
    }

    trackDrop(dragApi: any) {
        dragApi.on('drop', async (el, container, source, sibling) => {
            //console.log('drop', el, source);

        });
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