import {
  GET_ROLE_LIST,
  GET_MODULES_LIST,
  GET_CREATE_MODULES,
  DELETE_ROLES,
  GET_BY_ID_ROLES,
  UPDATE_ROLES,
  USER_BASED_LOCATIONS,
  MENUS_USER_DISPLAY,
  GET_POS_PAGES,
  SET_SEARCH_USER_ROLE,
  GET_ROLE_NAME,
  SET_USER_RIGHTS,
  UPDATE_USER_RIGHTS,
  GET_MODULES_FOR_ALL_ROLES,
  GET_FRONTDESK_RIGHTS,
  ADD_FAVOURITE_MENU,
  FAVOURITE_MENU_LIST,
  GET_ROLES_CHILD_MODULES,
  SET_SEARCH_USER_MODULE_ACTION,
  NAVIGATION_BOOTSTRAP
} from '../actionTypes';

const initialState = {
  listrole: [],
  listmodule: [],
  list_id_data: [],
  user_base_locations: [],
  menus_id_get: {},
  pos_pages: [],
  searchUserRoleData:[],
  shift_role: [],
  role_name:[],
  user_rights:[],
  update_user_rights:[],
  listModulesForAllRoles: [],
  frontDeskUserRights: [],
  addFavouirteMenu: [],
  favouirteMenuList: [],
  getChildModules:[],
  searchUserModules:[]
};

function roleReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case GET_CREATE_MODULES:
      return {...state, listmodule: payload};

    case GET_ROLE_LIST:
      return {...state, listrole: payload};

    case GET_MODULES_FOR_ALL_ROLES:
      return {...state, listModulesForAllRoles: payload}

    case GET_BY_ID_ROLES:
      return {...state, list_id_data: payload};

    case GET_MODULES_LIST:
      return {...state, listmodule: payload};

    case DELETE_ROLES:
      return {...state, listmodule: payload};

    case UPDATE_ROLES:
      return {...state, listmodule: payload};

    case USER_BASED_LOCATIONS:
      return {...state, user_base_locations: payload};

    case MENUS_USER_DISPLAY:
      return {...state, menus_id_get: payload};

    case GET_POS_PAGES:
      return { ...state, pos_pages: payload };
    
      case GET_ROLE_NAME:
        return {...state, role_name: payload};

      case SET_SEARCH_USER_ROLE:
        return {
          ...state,
          searchUserRoleData:payload,
          shift_role:payload?.data
        }

        case SET_USER_RIGHTS:
          return {...state, user_rights: payload};

          case UPDATE_USER_RIGHTS:
            return {...state, update_user_rights: payload};

    case GET_FRONTDESK_RIGHTS:
      return { ...state, frontDeskUserRights: payload };
    
    case ADD_FAVOURITE_MENU:
      return { ...state, addFavouirteMenu: payload };
    
    case FAVOURITE_MENU_LIST:
      return {...state, favouirteMenuList: payload};

    case GET_ROLES_CHILD_MODULES:
      return {...state, getChildModules: payload};

    case SET_SEARCH_USER_MODULE_ACTION:
      return {...state,    searchUserModules: {
      ...state.searchUserModules,
      [action.payload.role]: action.payload.data
    }};

    case NAVIGATION_BOOTSTRAP: {
      const navRights = payload.userRights || {};
      const rightsArray = Object.entries(navRights).map(([right_name, value]) => ({ right_name, value }));
      return { ...state, user_rights: rightsArray };
    }

    default:
      return state;
  }
}

export default roleReducer;
