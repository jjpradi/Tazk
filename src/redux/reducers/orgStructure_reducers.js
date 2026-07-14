import {
  ORG_DEPARTMENT_TREE,
  ORG_CHART_DATA,
  ORG_COST_CENTERS,
  ORG_DEPARTMENT_STATS,
} from 'redux/actionTypes';

const initialState = {
  departmentTree: [],
  orgChartData: { tree: [], flat: [] },
  costCenters: [],
  departmentStats: [],
};

function OrgStructureReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case ORG_DEPARTMENT_TREE:
      return { ...state, departmentTree: payload };
    case ORG_CHART_DATA:
      return { ...state, orgChartData: payload };
    case ORG_COST_CENTERS:
      return { ...state, costCenters: payload };
    case ORG_DEPARTMENT_STATS:
      return { ...state, departmentStats: payload };
    default:
      return state;
  }
}

export default OrgStructureReducer;
