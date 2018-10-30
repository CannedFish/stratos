import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KubernetesNodeConditionCardComponent } from './kubernetes-node-condition-card.component';
import { BaseTestModules } from '../../../../../../test-framework/cloud-foundry-endpoint-service.helper';
import { KubernetesNodeService } from '../../../../services/kubernetes-node.service';
import { KubernetesEndpointService } from '../../../../services/kubernetes-endpoint.service';
import { BaseKubeGuid } from '../../../../kubernetes-page.types';
import { KubernetesNodeConditionComponent } from './kubernetes-node-condition/kubernetes-node-condition.component';

describe('KubernetesNodeConditionCardComponent', () => {
  let component: KubernetesNodeConditionCardComponent;
  let fixture: ComponentFixture<KubernetesNodeConditionCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [KubernetesNodeConditionCardComponent, KubernetesNodeConditionComponent],
      imports: BaseTestModules,
      providers: [BaseKubeGuid, KubernetesEndpointService, KubernetesNodeService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KubernetesNodeConditionCardComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
