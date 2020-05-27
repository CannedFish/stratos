import { Store } from '@ngrx/store';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { GeneralEntityAppState } from '../../../../store/src/app-state';
import {
  getCurrentUserStratosHasScope,
  getCurrentUserStratosRole,
} from '../../../../store/src/selectors/current-user-role.selectors';
import {
  IPermissionConfigs,
  PermissionConfig,
  PermissionConfigType,
  PermissionTypes,
  PermissionValues,
} from './current-user-permissions.config';


export interface IConfigGroups {
  [permissionType: string]: IConfigGroup;
}

export type IConfigGroup = PermissionConfig[];

export type IPermissionCheckCombineTypes = '||' | '&&';

export interface IPermissionCheckCombiner {
  checks: Observable<boolean>[];
  combineType?: IPermissionCheckCombineTypes;
}
export interface ICurrentUserPermissionsChecker {
  /**
   * For the given permission action find the checker configuration that will determine if the user can or cannot do the action
   * If this is not supported by the the checker null is returned. If another checker also lays claim to the same string the check will
   * always return denied
   */
  getPermissionConfig: (action: string) => PermissionConfigType
  /**
   * Simple checks are used when the permission config contains a single thing to check
   */
  getSimpleCheck: (
    permissionConfig: PermissionConfig,
    endpointGuid?: string,
    ...args: any
  ) => Observable<boolean>;
  /**
   * Used when the permission config contains multiple things to check
   */
  getComplexCheck: (
    configGroup: IConfigGroup,
    permission: PermissionTypes,
    ...args: any[]
  ) => IPermissionCheckCombiner;
  /**
   * If no checker provides simple
   */
  getFallbackCheck: (
    endpointGuid: string,
    endpointType: string
  ) => Observable<boolean>;
}

export abstract class BaseCurrentUserPermissionsChecker {
  public static reduceChecks(checks: Observable<boolean>[], type: IPermissionCheckCombineTypes = '||') {
    const func = type === '||' ? 'some' : 'every';
    if (!checks || !checks.length) {
      return observableOf(true);
    }
    return combineLatest(checks).pipe(
      map(flags => flags[func](flag => flag)),
      distinctUntilChanged()
    );
  }
}

export enum StratosCurrentUserPermissions {
  ENDPOINT_REGISTER = 'register.endpoint',
  PASSWORD_CHANGE = 'change-password',
}

export enum StratosPermissionStrings {
  _GLOBAL_ = 'global',
  STRATOS_ADMIN = 'isAdmin'
}


export enum StratosScopeStrings {
  STRATOS_CHANGE_PASSWORD = 'password.write',
  SCIM_READ = 'scim.read'
}

export enum StratosPermissionTypes {
  STRATOS = 'internal',
  STRATOS_SCOPE = 'internal-scope'
}

// For each set permissions are checked by permission types of ENDPOINT, ENDPOINT_SCOPE, STRATOS_SCOPE, FEATURE_FLAG or a random bag.
// Every group result must be true in order for the permission to be true. A group result is true if all or some of it's permissions are
// true (see `getCheckFromConfig`).
export const stratosPermissionConfigs: IPermissionConfigs = {
  [StratosCurrentUserPermissions.ENDPOINT_REGISTER]: new PermissionConfig(StratosPermissionTypes.STRATOS, StratosPermissionStrings.STRATOS_ADMIN),
  [StratosCurrentUserPermissions.PASSWORD_CHANGE]: new PermissionConfig(StratosPermissionTypes.STRATOS_SCOPE, StratosScopeStrings.STRATOS_CHANGE_PASSWORD),
};

export class StratosUserPermissionsChecker extends BaseCurrentUserPermissionsChecker implements ICurrentUserPermissionsChecker {
  constructor(private store: Store<GeneralEntityAppState>, ) {
    super()
  }

  getPermissionConfig(action: string) {
    return stratosPermissionConfigs[action];
  }

  private check(
    type: PermissionTypes,
    permission: PermissionValues,
  ) {
    if (type === StratosPermissionTypes.STRATOS) {
      return this.store.select(getCurrentUserStratosRole(permission));
    }

    if (type === StratosPermissionTypes.STRATOS_SCOPE) {
      return this.store.select(getCurrentUserStratosHasScope(permission as StratosScopeStrings));
    }
  }
  /**
   * @param permissionConfig Single permission to be checked
   */
  public getSimpleCheck(permissionConfig: PermissionConfig): Observable<boolean> {
    switch (permissionConfig.type) {
      case (StratosPermissionTypes.STRATOS):
        return this.getInternalCheck(permissionConfig.permission as StratosPermissionStrings);
      case (StratosPermissionTypes.STRATOS_SCOPE):
        return this.getInternalScopesCheck(permissionConfig.permission as StratosScopeStrings);
    }
  }

  private getInternalCheck(permission: StratosPermissionStrings) {
    return this.check(StratosPermissionTypes.STRATOS, permission);
  }

  private getInternalScopesChecks(
    configs: PermissionConfig[]
  ) {
    return configs.map(config => {
      const { permission } = config;
      return this.getInternalScopesCheck(permission as StratosScopeStrings);
    });
  }

  private getInternalScopesCheck(permission: StratosScopeStrings) {
    return this.check(StratosPermissionTypes.STRATOS_SCOPE, permission);
  }

  public getComplexCheck(
    configGroup: IConfigGroup,
    permission: PermissionTypes,
    ...args: any[]
  ): IPermissionCheckCombiner {
    switch (permission) {
      case StratosPermissionTypes.STRATOS_SCOPE:
        return {
          checks: this.getInternalScopesChecks(configGroup),
        };
    }
  }
  public getFallbackCheck(endpointGuid: string, endpointType: string): Observable<boolean> {
    return null;
  };

}
