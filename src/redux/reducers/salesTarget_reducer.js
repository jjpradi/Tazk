import * as types from '../actionTypes/salesTarget_types';

const initialState = {
  periods: [],
  periodDetail: null,
  targets: [],
  targetHierarchy: [],
  suggestions: null,
  achievementSummary: [],
  leaderboard: [],
  myTarget: null,
  myTeam: [],
  plans: [],
  planDetail: null,
  incentiveResults: [],
  historicalTrend: [],
  loading: false,
  error: null,
};

const salesTargetReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.ST_LOADING:
      return { ...state, loading: action.payload };
    case types.ST_ERROR:
      return { ...state, error: action.payload, loading: false };
    case types.ST_CLEAR_ERROR:
      return { ...state, error: null };

    // Periods
    case types.ST_PERIODS_LIST:
      return { ...state, periods: action.payload };
    case types.ST_PERIOD_DETAIL:
      return { ...state, periodDetail: action.payload };
    case types.ST_PERIOD_CREATED:
      return { ...state, periods: [...state.periods, action.payload] };

    // Targets
    case types.ST_TARGETS_LIST:
      return { ...state, targets: action.payload };
    case types.ST_TARGET_HIERARCHY:
      return { ...state, targetHierarchy: action.payload };
    case types.ST_SUGGESTIONS:
      return { ...state, suggestions: action.payload };

    // Achievement
    case types.ST_ACHIEVEMENT_SUMMARY:
      return { ...state, achievementSummary: action.payload };
    case types.ST_LEADERBOARD:
      return { ...state, leaderboard: action.payload };
    case types.ST_MY_TARGET:
      return { ...state, myTarget: action.payload };
    case types.ST_MY_TEAM:
      return { ...state, myTeam: action.payload };

    // Plans
    case types.ST_PLANS_LIST:
      return { ...state, plans: action.payload };
    case types.ST_PLAN_DETAIL:
      return { ...state, planDetail: action.payload };

    // Results
    case types.ST_INCENTIVE_RESULTS:
      return { ...state, incentiveResults: action.payload };

    // Historical
    case types.ST_HISTORICAL_TREND:
      return { ...state, historicalTrend: action.payload };

    default:
      return state;
  }
};

export default salesTargetReducer;
