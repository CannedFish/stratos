import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, of } from 'rxjs';
import { filter, first, map, pairwise, startWith, switchMap } from 'rxjs/operators';

import { IStepperStep, StepOnNextFunction } from '../../../../../../core/src/shared/components/stepper/step/step.component';
import { AppState } from '../../../../../../store/src/app-state';
import { METRICS_ENDPOINT_TYPE } from '../../../../../../store/src/helpers/stratos-entity-factory';
import { ActionState } from '../../../../../../store/src/reducers/api-request-reducer/types';
import { stratosEntityCatalog } from '../../../../../../store/src/stratos-entity-catalog';
import { EndpointModel, EndpointRelationTypes, EndpointsRelation } from '../../../../../../store/src/types/endpoint.types';
import { CF_ENDPOINT_TYPE } from '../../../../cf-types';
import { CfContainerOrchestrator, cfEiriniRelationship } from '../../../eirini.helper';

@Component({
  selector: 'app-container-orchestrator-step',
  templateUrl: './container-orchestrator-step.component.html',
  styleUrls: ['./container-orchestrator-step.component.scss']
})
export class ContainerOrchestratorStepComponent implements OnInit, IStepperStep {

  constructor(
    store: Store<AppState>,
    private fb: FormBuilder,
    activatedRoute: ActivatedRoute
  ) {
    this.cfGuid = activatedRoute.snapshot.params.endpointId;

    this.cf$ = stratosEntityCatalog.endpoint.store.getEntityService(this.cfGuid).waitForEntity$.pipe(
      map(e => e.entity)
    );
    this.cfName$ = this.cf$.pipe(
      map(entity => entity.name)
    );

    this.metricsEndpoints$ = stratosEntityCatalog.endpoint.store.getPaginationService().entities$.pipe(
      filter(endpoints => !!endpoints),
      map(endpoints => endpoints.filter(endpoint => endpoint.cnsi_type === METRICS_ENDPOINT_TYPE)),
      map(registeredMetrics => Object.values(registeredMetrics)),
    );

    // TODO: RC A lot of this could move to eirini service if this component was in the eirini module
    this.eiriniDefaultNamespace$ = store.select('auth').pipe(
      map((auth) => auth.sessionData &&
        auth.sessionData['plugin-config'] &&
        auth.sessionData['plugin-config'].eiriniDefaultNamespace || null
      ));

    this.blocked = combineLatest([
      this.metricsEndpoints$,
      this.eiriniDefaultNamespace$,
      this.cf$
    ]).pipe(
      map(() => false),
      startWith(true)
    );

    this.validate = this.form.statusChanges.pipe(
      map(() => this.form.valid),
      startWith(false)
    );

    // Track changes of orchestrator
    this.form.controls.orchestrator.valueChanges.subscribe(value => this.updateSelectedOrchestrator(value));
  }

  form: FormGroup = this.fb.group({
    orchestrator: new FormControl('', [Validators.required]),
    eiriniMetrics: new FormControl('', [Validators.required]),
    eiriniNamespace: new FormControl('', [Validators.required])
  });
  metricsEndpoints$: Observable<EndpointModel[]>;
  eiriniDefaultNamespace$: Observable<string>;
  cfGuid: string;
  orchestrator = CfContainerOrchestrator;
  blocked: Observable<boolean>;
  validate: Observable<boolean>;
  cfName$: Observable<string>;
  private cf$: Observable<EndpointModel>;

  private existingRelation: EndpointsRelation;

  ngOnInit() {
    // Set the initial values
    combineLatest([
      this.metricsEndpoints$,
      this.eiriniDefaultNamespace$,
      this.cf$
    ]).pipe(
      first()
    ).subscribe(([registeredMetrics, eiriniDefaultNamespace, cf]) => {
      // Set starting values
      this.form.controls.eiriniNamespace.setValue(eiriniDefaultNamespace);
      this.form.controls.orchestrator.setValue(CfContainerOrchestrator.DIEGO);

      // Update given
      if (registeredMetrics.length === 0) {
        // Should never get here
        return;
      } else {
        // Is there an already bound relation?
        this.existingRelation = cfEiriniRelationship(cf);
        if (!!this.existingRelation && !!registeredMetrics.find(registeredMetric => registeredMetric.guid === this.existingRelation.guid)) {
          // Cf is already bound to eirini metrics
          this.form.controls.eiriniMetrics.setValue(this.existingRelation.guid);
          this.form.controls.eiriniNamespace.setValue(this.existingRelation.metadata.namespace || eiriniDefaultNamespace);
          this.form.controls.orchestrator.setValue(CfContainerOrchestrator.EIRINI);
        } else {
          // Select the first one as default
          this.form.controls.eiriniMetrics.setValue(registeredMetrics[0].guid);
        }
      }
    });
  }

  onNext: StepOnNextFunction = () => {
    return this.deleteExistingRelation().pipe(
      switchMap((res): Observable<ActionState> => res.error ? of(res) : this.saveRelation()),
      map(res => ({
        success: !res.error,
        message: res.message,
        redirect: !res.error
      }))
    );
  };

  deleteExistingRelation(): Observable<ActionState> {
    if (this.existingRelation) {
      return stratosEntityCatalog.endpoint.api.deleteEndpointRelation<ActionState>(
        this.cfGuid,
        this.existingRelation,
        CF_ENDPOINT_TYPE
      ).pipe(
        pairwise(),
        filter(([oldVal, newVal]) => oldVal ? oldVal.busy : false && !newVal.busy),
        map(([, newV]: [ActionState, ActionState]) => {
          return {
            ...newV,
            message: `Failed to delete existing relation${newV.message ? `: ${newV.message}` : ''}`,
          };
        })
      );
    }
    return of({
      busy: false,
      error: false,
      message: null
    });
  }

  saveRelation(): Observable<ActionState> {
    if (this.form.controls.orchestrator.value === CfContainerOrchestrator.EIRINI) {
      return stratosEntityCatalog.endpoint.api.createEndpointRelation<ActionState>(
        this.cfGuid,
        {
          guid: this.form.controls.eiriniMetrics.value,
          type: EndpointRelationTypes.METRICS_EIRINI,
          metadata: {
            namespace: this.form.controls.eiriniNamespace.value
          }
        },
        'cf'
      ).pipe(
        pairwise(),
        filter(([oldVal, newVal]) => oldVal ? oldVal.busy : false && !newVal.busy),
        map(([, newV]: [ActionState, ActionState]) => ({
          ...newV,
          message: `Failed to save relation${newV.message ? `: ${newV.message}` : ''}`,
        }))
      );
    }
    // For diego there's no eirini relationship to save, so no op (any existing eirini relation would have been removed in previous step)
    return of({
      busy: false,
      error: false,
      message: null
    });
  }

  updateSelectedOrchestrator(orchestrator: string) {
    if (orchestrator === CfContainerOrchestrator.EIRINI) {
      this.form.controls.eiriniMetrics.enable();
      this.form.controls.eiriniNamespace.enable();
    } else {
      this.form.controls.eiriniMetrics.disable();
      this.form.controls.eiriniNamespace.disable();
    }
  }

}

