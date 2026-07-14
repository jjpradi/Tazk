/*
 * NewCashInHand orchestration tests.
 *
 * Focus: the parent's applyFilter / clearFilter split accountChip off the emitted
 * filter payload and update the right slice of state. Rather than rendering the
 * whole page (which would mount ~20 MUI cards and the heavy TransactionList),
 * we stub the children so we can drive the callbacks directly.
 */
import { screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../../test/renderWithProviders'

// Stub the heavy children so we only test the parent's orchestration logic.
// Each stub exposes the props it receives via a global capture so tests can
// invoke callbacks directly and inspect state changes.
const captured = { accountList: null, txnList: null, filter: null }

vi.mock('./AccountList', () => ({
    default: (props) => {
        captured.accountList = props
        return <div data-testid="account-list-stub" />
    },
}))

vi.mock('./TransactionList', () => {
    const React = require('react')
    return {
        default: React.forwardRef((props, ref) => {
            captured.txnList = props
            // Expose an imperative handle matching the real TransactionList so
            // NewCashInHand can call handleApplyFilter / handleClearFilter on its ref.
            React.useImperativeHandle(ref, () => ({
                handleApplyFilter: vi.fn(),
                handleClearFilter: vi.fn(),
                handleExport: vi.fn(),
            }))
            return <div data-testid="transaction-list-stub" />
        }),
    }
})

vi.mock('./CashInHandFilter', () => ({
    default: (props) => {
        captured.filter = props
        return (
            <div data-testid="filter-dialog-stub">
                <button onClick={() => props.onApply({
                    from: '2026-04-01', to: '2026-04-30',
                    min_amount: 100, max_amount: 5000,
                    accountChip: 'Bank',
                })}>mock-apply</button>
                <button onClick={() => props.onClear({
                    from: '2026-04-11', to: '2026-04-11',
                    min_amount: null, max_amount: null,
                    accountChip: 'All',
                })}>mock-clear</button>
            </div>
        )
    },
}))

// Neutralize unrelated imports that would otherwise drag in Firebase/axios/etc.
vi.mock('react-helmet-async', () => ({ Helmet: () => null }))
vi.mock('http-common', () => ({ default: {}, titleURL: 'Tazk' }))
vi.mock('services/cash_box_services', () => ({
    default: {
        getBankAndCashAccounts: () => Promise.resolve({ status: 200, data: [] }),
        getConsolidatedTotalAmount: () => Promise.resolve({ status: 200, data: [] }),
        getTransactionList: () => Promise.resolve({ status: 200, data: { count: 0, data: [] } }),
    },
}))

import NewCashInHand from './NewCashInHand'

beforeEach(() => {
    captured.accountList = null
    captured.txnList = null
    captured.filter = null
})

describe('NewCashInHand — initial props wiring', () => {
    test('TransactionList receives txnChip="All" by default', () => {
        renderWithProviders(<NewCashInHand />)
        expect(captured.txnList).not.toBeNull()
        expect(captured.txnList.txnChip).toBe('All')
    })

    test('AccountList receives accountChip="All" by default', () => {
        renderWithProviders(<NewCashInHand />)
        expect(captured.accountList).not.toBeNull()
        expect(captured.accountList.accountChip).toBe('All')
    })

    test('CashInHandFilter receives currentAccountChip="All" and a currentFilter with min_amount/max_amount nulls', () => {
        renderWithProviders(<NewCashInHand />)
        expect(captured.filter).not.toBeNull()
        expect(captured.filter.currentAccountChip).toBe('All')
        expect(captured.filter.currentFilter).toMatchObject({
            paymentMode: null,
            min_amount: null,
            max_amount: null,
        })
    })

    test('initial filter from/to default to today (YYYY-MM-DD)', () => {
        renderWithProviders(<NewCashInHand />)
        const today = new Date().toISOString().slice(0, 10)
        expect(captured.filter.currentFilter.from).toBe(today)
        expect(captured.filter.currentFilter.to).toBe(today)
    })
})

describe('NewCashInHand — applyFilter destructures accountChip', () => {
    test('onApply with accountChip="Bank" updates AccountList.accountChip to "Bank"', async () => {
        renderWithProviders(<NewCashInHand />)
        // Sanity: starts at All
        expect(captured.accountList.accountChip).toBe('All')
        // Trigger the stub's mock-apply button which emits a payload with accountChip='Bank'
        await userEvent.click(screen.getByText('mock-apply'))
        // After the click, the parent should have setAccountChip('Bank').
        // captured.accountList is set on every render — read the latest.
        expect(captured.accountList.accountChip).toBe('Bank')
    })

    test('onApply passes row-level filter to TransactionList via props.filter (no accountChip in the filter object)', async () => {
        renderWithProviders(<NewCashInHand />)
        await userEvent.click(screen.getByText('mock-apply'))
        // TransactionList's filter prop should NOT contain accountChip — it's split off
        expect(captured.txnList.filter).not.toHaveProperty('accountChip')
        // It should contain the row-level fields
        expect(captured.txnList.filter.from).toBe('2026-04-01')
        expect(captured.txnList.filter.to).toBe('2026-04-30')
        expect(captured.txnList.filter.min_amount).toBe(100)
        expect(captured.txnList.filter.max_amount).toBe(5000)
        // paymentMode is always set to null by the parent (backend shim)
        expect(captured.txnList.filter.paymentMode).toBeNull()
    })

    test('onClear resets accountChip back to "All"', async () => {
        renderWithProviders(<NewCashInHand />)
        // First change to Bank
        await userEvent.click(screen.getByText('mock-apply'))
        expect(captured.accountList.accountChip).toBe('Bank')
        // Then clear (which emits accountChip='All')
        await userEvent.click(screen.getByText('mock-clear'))
        expect(captured.accountList.accountChip).toBe('All')
    })
})
