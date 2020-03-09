import { BackendService } from 'services/backend-service';
import { autoinject, observable, Disposable, BindingEngine, PLATFORM } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import Split from 'split.js'
(<any>PLATFORM.global).process = { env: { NODE_ENV: 'production' } };

@autoinject()
export class App {

  private scenario: any = {
    feature: 'Feature 1',
    name: 'Scenario 1',
    given: ['This', 'That', 'And these'],
    when: ['This happens'],
    then: ['This should be it', 'That is also true']
  }

  subscriptions: Array<Disposable> = [];

  @observable()
  entries: Array<any> = [];

  @observable()
  sidebarLinks: Array<any> = [];

  @observable()
  selectedLink: string = 'All';

  @observable()
  currEntry: any = false;

  @observable()
  searchValue: string = '';

  options: any;

  constructor(private backendService: BackendService, private eventAggregator: EventAggregator) {
    this.backendService.determineType();
    this.options = this.backendService.startup.options;
  }

  async attached() {
    let eventData = await this.backendService.send({ Command: 'LoadTests' });
    this.entries = eventData.Data;

    window.addEventListener('message', e => {
      if (!e.data)
        return;

      if (e.data.Command == 'LoadTests') {
        this.entries = [];
        this.entries = e.data.Data;
        console.log('entries updated', e.data.Data);
      }
    });

    let projects = [...new Set(this.entries.map(item => item.Project))];
    this.sidebarLinks = [{
      name: 'All',
      active: true,
      children: [],
      hasChildren: false
    }];

    for (let project of projects) {
      let features = [...new Set(this.entries.filter(f => f.Project == project).map(item => item.Feature))].filter(m => m.length > 0);
      this.sidebarLinks.push({
        name: project,
        active: false,
        children: features,
        hasChildren: features.length > 0
      });
    }

    Split(['#test-col-1', '#test-col-2'], {
      sizes: [60, 40],
      gutterSize: 3,
      onDragEnd: e => {
        this.eventAggregator.publish('appMainColumnsResized');
      }
    });

    window.addEventListener('resize', e => {
      this.eventAggregator.publish('appMainColumnsResized');
    });
  }

  detached() {

  }

  selectSideLink(name: string, parent: boolean) {
    this.selectedLink = name;
    console.log('selectSideLink', name, parent);
  }
}
