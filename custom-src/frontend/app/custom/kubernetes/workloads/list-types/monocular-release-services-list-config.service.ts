import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from 'frontend/packages/store/src/app-state';

import { BaseKubernetesServicesListConfig } from '../../list-types/kubernetes-service-list-config.service';
import { HelmReleaseHelperService } from '../release/tabs/helm-release-helper.service';
import { HelmReleaseServicesDataSource } from './monocular-release-services-list-source';


// cardComponent = HelmReleaseServiceCardComponent; // TODO: RC

@Injectable()
export class HelmReleaseServicesListConfig extends BaseKubernetesServicesListConfig {
  dataSource: HelmReleaseServicesDataSource;

  public getDataSource = () => this.dataSource;

  constructor(
    private store: Store<AppState>,
    public activatedRoute: ActivatedRoute,
    helmReleaseHelper: HelmReleaseHelperService
  ) {
    super();
    this.dataSource = new HelmReleaseServicesDataSource(this.store, this, helmReleaseHelper.endpointGuid, helmReleaseHelper.releaseTitle);
  }

  public getColumns = () => this.columns;
  public getGlobalActions = () => [];
  public getMultiActions = () => [];
  public getSingleActions = () => [];
  public getMultiFiltersConfigs = () => [];

}
