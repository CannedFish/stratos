import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { AppState } from '../../../../../../store/src/app-state';
import { BaseKubeGuid } from '../../kubernetes-page.types';
import { KubernetesNamespaceService } from '../../services/kubernetes-namespace.service';
import { BaseKubernetesPodsListConfigService } from '../kubernetes-pods/kubernetes-pods-list-config.service';
import { KubernetesNamespacePodsDataSource } from './kubernetes-namespace-pods-data-source';

@Injectable()
export class KubernetesNamespacePodsListConfigService extends BaseKubernetesPodsListConfigService {

  private podsDataSource: KubernetesNamespacePodsDataSource;

  getDataSource = () => this.podsDataSource;

  constructor(
    store: Store<AppState>,
    kubeId: BaseKubeGuid,
    public kubeNamespaceService: KubernetesNamespaceService,
  ) {
    super();
    this.podsDataSource = new KubernetesNamespacePodsDataSource(store, kubeId, this, kubeNamespaceService);
  }

}
