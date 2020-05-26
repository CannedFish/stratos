import { GetCurrentUserRelationsComplete } from '../../../actions/permissions.actions';
import { ISpacesRoleState } from '../../types/cf-current-user-roles.types';
import { addNewRoles, removeOldRoles } from './current-user-reducer.helpers';
import { currentUserSpaceRoleReducer } from './current-user-roles-space.reducer';

export function currentUserSpaceRolesReducer(state: ISpacesRoleState = {}, action: GetCurrentUserRelationsComplete) {
  const { newState, addedIds } = addNewRoles(state, action, currentUserSpaceRoleReducer);
  return removeOldRoles(newState, action, addedIds, currentUserSpaceRoleReducer);
}
