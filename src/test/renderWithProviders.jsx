/*
 * Test helper: render a component inside the minimum providers the cash-in-hand
 * components rely on — a tiny Redux store and the CreateNewButtonContext.
 *
 * Only seeds the slices used by cash-in-hand so tests stay fast and hermetic.
 * If a test needs richer state, pass `preloadedState` into render options.
 */
import React from 'react'
import { Provider } from 'react-redux'
import { legacy_createStore as createStore, combineReducers, applyMiddleware } from 'redux'
import { thunk } from 'redux-thunk'
import { render } from '@testing-library/react'
import CreateNewButtonContext from '../context/CreateNewButtonContext'

// Minimal cashBoxReducer mimic — only the fields cash-in-hand reads.
const cashBoxInitial = {
    cashAndBankAccounts: [],
    cashAndBankConsolidatedTotal: [],
    cashAndBankTransactionList: { count: 0, data: [] },
}
const cashBoxReducer = (state = cashBoxInitial, action) => {
    switch (action.type) {
        case 'TEST_SET_ACCOUNTS':
            return { ...state, cashAndBankAccounts: action.payload }
        case 'TEST_SET_TRANSACTION_LIST':
            return { ...state, cashAndBankTransactionList: action.payload }
        case 'TEST_SET_CONSOLIDATED':
            return { ...state, cashAndBankConsolidatedTotal: action.payload }
        default:
            return state
    }
}

const paymentMethodReducer = (state = { list_payment_type: [] }) => state

export const makeStore = (preloadedState = {}) => {
    const rootReducer = combineReducers({
        cashBoxReducer,
        paymentMethodReducer,
    })
    // Thunk middleware so real action creators dispatched by components
    // (which return functions) can flow without extra mocking.
    return createStore(
        rootReducer,
        {
            cashBoxReducer: { ...cashBoxInitial, ...(preloadedState.cashBox || {}) },
            paymentMethodReducer: { list_payment_type: [] },
        },
        applyMiddleware(thunk)
    )
}

const defaultCtxValue = {
    headerLocationId: 'loc-1',
    setModalTypeHandler: () => {},
    setLoaderStatusHandler: () => {},
}

export function renderWithProviders(ui, {
    preloadedState = {},
    store = makeStore(preloadedState),
    ctxValue = defaultCtxValue,
    ...renderOptions
} = {}) {
    const Wrapper = ({ children }) => (
        <Provider store={store}>
            <CreateNewButtonContext.Provider value={ctxValue}>
                {children}
            </CreateNewButtonContext.Provider>
        </Provider>
    )
    return {
        store,
        ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    }
}
