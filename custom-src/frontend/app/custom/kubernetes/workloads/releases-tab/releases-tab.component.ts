import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'frontend/packages/store/src/app-state';
import { endpointOfTypeSelector } from 'frontend/packages/store/src/selectors/endpoint.selectors';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ListConfig } from '../../../../shared/components/list/list.component.types';
import { HELM_ENDPOINT_TYPE } from '../../../helm/helm-entity-factory';
import { HelmReleasesListConfig } from '../list-types/monocular-releases-list-config.service';

@Component({
  selector: 'app-releases-tab',
  templateUrl: './releases-tab.component.html',
  styleUrls: ['./releases-tab.component.scss'],
  providers: [{
    provide: ListConfig,
    useClass: HelmReleasesListConfig,
  }]
})
// TODO: RC Rename all 'HelmRelease' files/names to 'Workload`
export class HelmReleasesTabComponent implements OnInit {
  public helmIds$: Observable<string[]>;

  constructor(private store: Store<AppState>) { }

  ngOnInit() {
    this.helmIds$ = this.store.select(endpointOfTypeSelector(HELM_ENDPOINT_TYPE)).pipe(
      map(endpoints => Object.keys(endpoints)),
    );
  }
}
