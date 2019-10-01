import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityMonitorFactory } from '../../../../../core/src/shared/monitors/entity-monitor.factory.service';
import { generateCfBaseTestModulesNoShared } from '../../../../test-framework/cloud-foundry-endpoint-service.helper';
import { ServicesService } from '../../../features/service-catalog/services.service';
import { ServicesServiceMock } from '../../../features/service-catalog/services.service.mock';
import { ServicePlanPublicComponent } from './service-plan-public.component';

describe('ServicePlanPublicComponent', () => {
  let component: ServicePlanPublicComponent;
  let fixture: ComponentFixture<ServicePlanPublicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ServicePlanPublicComponent],
      imports: generateCfBaseTestModulesNoShared(),
      providers: [
        EntityMonitorFactory,
        { provide: ServicesService, useClass: ServicesServiceMock },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServicePlanPublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
