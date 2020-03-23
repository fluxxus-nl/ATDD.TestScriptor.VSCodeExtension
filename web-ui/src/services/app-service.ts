import { EventAggregator } from 'aurelia-event-aggregator';
import { singleton, computedFrom } from 'aurelia-framework';
import { AppEventPublisher, AppEditMode } from 'types';

@singleton()
export class AppService {    
    private _sidebarLinks: Array<any>;
    private _projects: Array<string>;
    private _editMode: AppEditMode;

    public constructor(private eventAggregator: EventAggregator) {
        this._editMode = AppEditMode.Scenario;
    }
    
    @computedFrom('_editMode')
    public get editMode() {
        return this._editMode;
    }

    public set editMode(newMode: AppEditMode) {
        this._editMode = newMode;
    }

    public get sidebarLinks() {
        return this._sidebarLinks;
    }

    public get projects() {
        return this._projects;
    }

    public updateProjects(entries: Array<any>) {
        this._projects = [...new Set(entries.map(item => item.Project))];
    }

    public updateSidebarLinks(entries: Array<any>) {
        this.updateProjects(entries);
        this._sidebarLinks = [{
            name: 'All',
            active: true,
            children: [],
            hasChildren: false
        }];

        for (let project of this._projects) {
            let features = [...new Set(entries.filter(f => f.Project == project).map(item => item.Feature))].filter(m => m.length > 0);
            this._sidebarLinks.push({
                name: project,
                active: false,
                children: features,
                hasChildren: features.length > 0
            });
        }

        this.eventAggregator.publish(AppEventPublisher.sidebarLinksUpdated);
    }
}