import {GET_EXPENSES, CREATE_EXPENSE, GET_EXPENSE_LEDGERS,EXPENSE_LAST_INSERT_ID, UPDATE_EXPENSES, EXPENSES_BY_VENDOR, GET_EXPENSES_BY_ID} from '../actionTypes';

const initialState = {
  expenses: [],
  expenseLedgers : [],
  expenseLastInsertId: 0,
  expense_count : 0,
  expensesByVendor: [],
  expensesForSixMonths: [],
  expensesCount: [],
  getExpenseById: []
};

function ExpenseReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case GET_EXPENSES:
      return {
        ...state,
        expenses: payload.data,
        expense_count : payload.numRows
      };

    case CREATE_EXPENSE:
      return {
        ...state,
        expenses: payload,
      };
      
    case UPDATE_EXPENSES:
      return {
        ...state,
        expenses: payload,
      };

    case GET_EXPENSE_LEDGERS:
      return {
        ...state,
        expenseLedgers: payload,
      };

    case EXPENSE_LAST_INSERT_ID:
      return{
        ...state,
        expenseLastInsertId:payload,
      }

    case EXPENSES_BY_VENDOR:
      return { ...state, expensesByVendor: payload.data , expensesForSixMonths : payload.data1, expensesCount: payload.numRows?.[0]?.total_count ?? 0
}

    case GET_EXPENSES_BY_ID: 
      return {...state, getExpenseById: payload.data}

    default:
      return state;
  }
}

export default ExpenseReducer;
