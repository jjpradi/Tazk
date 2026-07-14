import {
  LIST_PROFITLOSS,
  TOTAL_PROFITLOSS_COUNT,
  OPENING_STOCKS,
  CLOSING_STOCKS,
  EXPENSE_CHART,
  EXPENSE_AREA_CHART,
  TOP_EXPENSES,
  STOCKS_PROFIT_LOSS,
  TOTAL_EXPENSE_CHART,
  CURRENT_MONTH_EXPENSE,
  MOST_SPEND_EXPENSE,
} from '../actionTypes';

const initialState = {
  profitloss: [],
  profitloss_id_data: [],
  profitloss_count: 0,
  opening_stocks: [],
  closing_stocks: [],
  expense_chart: [],
  expense_area_chart: [],
  stocks : [],
  total_expense_chart : [],
  current_month_expense : [],
  most_spend_expense : []

};

function profitlossReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case LIST_PROFITLOSS:
      return { ...state, profitloss: payload };

    case TOTAL_PROFITLOSS_COUNT:
      return { ...state, profitloss_count: payload };
    case OPENING_STOCKS:
      return { ...state, opening_stocks: payload };
    case CLOSING_STOCKS:
      return { ...state, closing_stocks: payload };
    case STOCKS_PROFIT_LOSS:
      return {...state, stocks : payload};
    case EXPENSE_CHART:
      return { ...state, expense_chart: payload };
    case EXPENSE_AREA_CHART:
      return { ...state, expense_area_chart: payload };

      case TOTAL_EXPENSE_CHART:
        return { ...state, total_expense_chart: payload };

        case CURRENT_MONTH_EXPENSE:
        return { ...state, current_month_expense: payload };

        case MOST_SPEND_EXPENSE:
        return { ...state, most_spend_expense: payload };
      // case GET_PROFIT:
      //   return { ...state, get_profit_year: payload };

      return { ...state, closing_stocks: payload };
    case EXPENSE_CHART:
      return { ...state, expense_chart: payload };
    case EXPENSE_AREA_CHART:
      return { ...state, expense_area_chart: payload };
    case TOP_EXPENSES:
      return { ...state, top_expenses: payload };


    default:
      return state;
  }
}

export default profitlossReducer;
