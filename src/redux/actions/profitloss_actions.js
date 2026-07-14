import {
  CLOSING_STOCKS,
  EXPENSE_AREA_CHART,
  EXPENSE_CHART,
  LIST_PROFITLOSS,
  OPENING_STOCKS,
  TOTAL_PROFITLOSS_COUNT,
  TOP_EXPENSES,
  STOCKS_PROFIT_LOSS,
  TOTAL_EXPENSE_CHART,
  CURRENT_MONTH_EXPENSE,
  MOST_SPEND_EXPENSE,
} from '../actionTypes';
import Profitlossservice from '../../services/profitloss_services';
import { ErrorAlert, FailLoad, ListLoad } from './load';
//import Jwt from './common_actions';

export const listProfitlossAction =
  (from, to, grossday, setModalTypeHandler, setLoaderStatusHandler) =>
    async (dispatch) => {
      try {
        // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
        const res = await Profitlossservice.getAll(from, to, grossday);
        if (res.status === 200) {
          dispatch({
            type: LIST_PROFITLOSS,
            payload: res.data,
          });
          // dispatch({
          //   type: OPENING_STOCKS,
          //   payload: res.data[1]?.openingstocks,
          // });
          // dispatch({
          //   type: CLOSING_STOCKS,
          //   payload: res.data[3]?.closingstocks,
          // });
        }
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        ErrorAlert(dispatch, err);
        return Promise.reject("API_FINISHED_ERROR");
      }
    };

    export const stocksProfitloss =
    (from, to, grossday, setModalTypeHandler, setLoaderStatusHandler) =>
      async (dispatch) => {
        try {
          // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
          const res = await Profitlossservice.stocks(from, to, grossday);
          if (res.status === 200) {
            dispatch({
              type: STOCKS_PROFIT_LOSS,
              payload: res.data,
            });
            dispatch({
              type: OPENING_STOCKS,
              payload: res.data[1]?.openingstocks,
            });
            dispatch({
              type: CLOSING_STOCKS,
              payload: res.data[3]?.closingstocks,
            });
          }
          // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
          return Promise.resolve("API_FINISHED_SUCCESS");
        } catch (err) {
          // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
          ErrorAlert(dispatch, err);
          return Promise.reject("API_FINISHED_ERROR");
        }
      };


export const getlimitdatafromprofitloss =
  (setModalTypeHandler, setLoaderStatusHandler, data) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Profitlossservice.getpaginationdata(data);
      if (res.status === 200) {
        dispatch({
          type: LIST_PROFITLOSS,
          payload: res.data.data,
        });
        dispatch({
          type: TOTAL_PROFITLOSS_COUNT,
          payload: res.data.numRows,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const listProfitlossdateAction = (from, to, grossday) => async (dispatch) => {
  try {
    // ListLoad(setModalTypeHandler, setLoaderStatusHandler)
    const res = await Profitlossservice.getDate(from, to, grossday);
    if (res.status === 200) {
      dispatch({
        type: LIST_PROFITLOSS,
        payload: res.data,
      });
    }
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const listExpenseChart = (from, to) => async (dispatch) => {
  try {
    // ListLoad(setModalTypeHandler, setLoaderStatusHandler)
    const res = await Profitlossservice.getexpensechart(from, to);
    if (res.status === 200) {
      dispatch({
        type: EXPENSE_CHART,
        payload: res.data,
      });
    }
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};
export const listExpenseAreaChart = (month, headerLocationId, response) => async (dispatch) => {
  try {
    // ListLoad(setModalTypeHandler, setLoaderStatusHandler)
    const res = await Profitlossservice.getExpenseAreaChart(month, headerLocationId);
    if (res.status === 200) {
      dispatch({
        type: EXPENSE_AREA_CHART,
        payload: res.data,
      });
      if(response){
        response(res)
      }
    }
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};
// export const getprofitAction = () => async (dispatch) => {
//   try {
//     const res = await Profitlossservice.getprofit();
//     if (res.status === 200) {
//       dispatch({
//         type: GET_PROFIT,
//         payload: res.data,
//       });
//     }
//   } catch (err) { }
// }

export const listTopExpensesAction = (location_id) => async (dispatch) => {
  try {
    // ListLoad(setModalTypeHandler, setLoaderStatusHandler)
    const res = await Profitlossservice.topExpenses(location_id);
    if (res.status === 200) {
      dispatch({
        type: TOP_EXPENSES,
        payload: res.data,
      });
      return Promise.resolve("API_FINISHED_SUCCESS");
    }
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
  } catch (err) {
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
}


//Expense Total Card Action
export const TotalExpenseAction = (location_id) => async (dispatch) => {
  try {
    // ListLoad(setModalTypeHandler, setLoaderStatusHandler)
    const res = await Profitlossservice.TotalExpense(location_id);
    if (res.status === 200) {
      dispatch({
        type: TOTAL_EXPENSE_CHART,
        payload: res.data,
      });
    }
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

// Current Month Expense Action only 
export const currentMonthExpenseAction = (location_id) => async (dispatch) => {
  try {
    // ListLoad(setModalTypeHandler, setLoaderStatusHandler)
    const res = await Profitlossservice.currentMonthExpense(location_id);
    if (res.status === 200) {
      dispatch({
        type: CURRENT_MONTH_EXPENSE,
        payload: res.data,
      });
    }
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};


//Most Spending Expense ACtion only
export const MostSpendExpenseAction = (location_id) => async (dispatch) => {
  try {
    // ListLoad(setModalTypeHandler, setLoaderStatusHandler)
    const res = await Profitlossservice.MostSpendExpense(location_id);
    if (res.status === 200) {
      dispatch({
        type: MOST_SPEND_EXPENSE,
        payload: res.data,
      });
    }
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};