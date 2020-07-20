import { EventAggregator } from 'aurelia-event-aggregator';
import { singleton, computedFrom } from 'aurelia-framework';
import { AppEventPublisher, AppEditMode, MessageState, TypeChanged, MessageUpdate, Message } from 'types';

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

    public sendChangeNotification(type: TypeChanged, state: MessageState, newValue: any, oldValue: any, item?: Message) {
        if (state === MessageState.Unchanged)
            return;

        let message: MessageUpdate = new MessageUpdate();
        message.Type = type;
        message.State = state;
        message.OldValue = oldValue;
        message.NewValue = newValue;
        if (item) {
            message.Scenario = item.Scenario;
            message.FsPath = item.FsPath;
        }
        message.DeleteProcedure = [TypeChanged.Given, TypeChanged.When, TypeChanged.Then].indexOf(type) !== -1 && state == MessageState.Deleted;


        this.eventAggregator.publish(AppEventPublisher.saveChanges, message);
    }


    // Standard uuid package won't work with Aurelia embedded into VSCode :(
    // Source: https://stackoverflow.com/questions/105034/how-to-create-guid-uuid
    public uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}