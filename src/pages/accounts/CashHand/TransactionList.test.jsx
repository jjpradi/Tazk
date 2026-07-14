/*
 * TransactionList tests — focused on the state plumbing regressions.
 * We render the component inside the test providers (no real backend) and assert
 * that parent-provided callbacks fire on specific user actions.
 *
 * Coverage:
 *   - Lifted txnChip wiring (click chip → props.setTxnChip)
 *   - Bug #2 regression: Apply filter resets pageCount
 *   - Pagination first/last buttons exist
 *   - resetToAll effect resets chip/pagination
 *   - OB fallback chain picks bundled openingBalance when present
 */
import { screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { forwardRef } from 'react'
import { renderWithProviders } from '../../../test/renderWithProviders'

// Mock cash_box_services at module boundary — prevents axios/socket.io from booting
// via http-common and gives the actions a stable shape to dispatch against.
vi.mock('services/cash_box_services', () => ({
    default: {
        getBankAndCashAccounts: () => Promise.resolve({ status: 200, data: [] }),
        getConsolidatedTotalAmount: () => Promise.resolve({ status: 200, data: [{ totalBalance: 0, cashTotal: 0, bankTotal: 0, receiptTotal: 0, paymentTotal: 0 }] }),
        getTransactionList: () => Promise.resolve({ status: 200, data: { count: 0, data: [], openingBalance: 0, closingBalance: 0 } }),
    },
}))

// services used by the drill-down views — never reached in these tests
vi.mock('services/customer_services', () => ({ default: { getAllStatement: () => Promise.resolve({ data: { data: [] } }) } }))
vi.mock('services/reports_services', () => ({ default: { checkLinkedAccount: () => Promise.resolve({ data: { linked: false } }) } }))
vi.mock('../reports/reportsApi', () => ({ default: { ledgerVouchers: () => Promise.resolve({ data: {} }) } }))

// CSV export helper — no-op in tests
vi.mock('@material-table/exporters', () => ({ ExportCsv: () => {} }))

// AccountList is imported by TransactionList for the mobile drawer — stub it out
// so we don't double-mount the whole left panel during these tests.
vi.mock('./AccountList', () => ({ default: () => null }))

import TransactionList from './TransactionList'

const CASHVIVO = { id: 1, name: 'CashVIVO', type: 'Cash', amount: 1000, openingBalance: 500, closingBalance: 1500 }
const INDUSIND = { id: 3, name: 'IndusInd', type: 'Bank', amount: 5000, openingBalance: 1000, closingBalance: 6000 }

const defaultProps = {
    selectedAccount: null,
    filter: { from: '2026-04-11', to: '2026-04-11', paymentMode: null, min_amount: null, max_amount: null },
    isDrawerOpen: false,
    setIsDrawerOpen: () => {},
    setSelectedAccount: () => {},
    setFilterOpen: () => {},
    setResetToAll: () => {},
    resetToAll: false,
    accountChip: 'All',
    txnChip: 'All',
    setTxnChip: vi.fn(),
}

const renderTxnList = (propOverrides = {}, preloadedState = {}) => {
    const setTxnChip = vi.fn()
    const setResetToAll = vi.fn()
    const props = { ...defaultProps, setTxnChip, setResetToAll, ...propOverrides }
    const result = renderWithProviders(<TransactionList {...props} />, {
        preloadedState: {
            cashBox: {
                cashAndBankAccounts: [CASHVIVO, INDUSIND],
                cashAndBankTransactionList: { count: 0, data: [], openingBalance: 0, closingBalance: 0 },
                cashAndBankConsolidatedTotal: [{ receiptTotal: 0, paymentTotal: 0 }],
                ...preloadedState,
            },
        },
    })
    return { ...result, props, setTxnChip, setResetToAll }
}

describe('TransactionList — chip state lift (regression)', () => {
    test('renders right-panel chips: All, Receipt, Payment, Transfers, Others', () => {
        renderTxnList()
        expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Receipt' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Payment' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Transfers' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Others' })).toBeInTheDocument()
    })

    test('clicking "Receipt" chip calls props.setTxnChip("Receipt") — NOT local state', async () => {
        const { setTxnChip } = renderTxnList()
        await userEvent.click(screen.getByRole('button', { name: 'Receipt' }))
        expect(setTxnChip).toHaveBeenCalledWith('Receipt')
    })

    test('clicking "Payment" chip calls props.setTxnChip("Payment")', async () => {
        const { setTxnChip } = renderTxnList()
        await userEvent.click(screen.getByRole('button', { name: 'Payment' }))
        expect(setTxnChip).toHaveBeenCalledWith('Payment')
    })

    test('chipFullScreen view appears when txnChip !== "All"', () => {
        // Rendering with txnChip='Receipt' should show the chipFullScreen layout
        // (header with "Receipts" title and back button), not the normal table.
        renderTxnList({ txnChip: 'Receipt' })
        // The full-screen view puts the chip label in the header
        expect(screen.getByText(/Receipts/)).toBeInTheDocument()
    })
})

describe('TransactionList — resetToAll effect', () => {
    test('when resetToAll=true, calls props.setTxnChip("All") then setResetToAll(false)', () => {
        const setTxnChip = vi.fn()
        const setResetToAll = vi.fn()
        renderTxnList({ resetToAll: true, setTxnChip, setResetToAll })
        // Effect fires synchronously on mount when resetToAll was already true
        expect(setTxnChip).toHaveBeenCalledWith('All')
        expect(setResetToAll).toHaveBeenCalledWith(false)
    })
})

describe('TransactionList — Pagination first/last buttons (regression)', () => {
    test('first-page and last-page buttons render', () => {
        // Make the table non-empty-state by seeding some data with count > 0
        // so TablePagination actually renders navigation controls.
        renderTxnList({}, {
            cashAndBankTransactionList: { count: 100, data: Array.from({ length: 20 }, (_, i) => ({ transactionId: i, type: 'Receipt', transactionDate: '2026-04-11', debit: 100, credit: 0, amount: 100, particulars: 'X' })), openingBalance: 0, closingBalance: 0 },
        })
        expect(screen.getByRole('button', { name: /first page/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /last page/i })).toBeInTheDocument()
    })
})

describe('TransactionList — handleApplyFilter resets pageCount (Bug #2)', () => {
    test('the imperative handleApplyFilter resets pagination', async () => {
        // Use a parent shim that captures the ref and drives handleApplyFilter.
        const setTxnChip = vi.fn()
        const setResetToAll = vi.fn()
        const capturedRef = { current: null }
        const Parent = () => {
            const ref = (r) => { capturedRef.current = r }
            return <TransactionList {...defaultProps} ref={ref} setTxnChip={setTxnChip} setResetToAll={setResetToAll} />
        }
        renderWithProviders(<Parent />, {
            preloadedState: {
                cashBox: {
                    cashAndBankAccounts: [CASHVIVO, INDUSIND],
                    cashAndBankTransactionList: { count: 500, data: Array.from({ length: 20 }, (_, i) => ({ transactionId: i, type: 'Receipt', transactionDate: '2026-04-11', debit: 100, credit: 0, amount: 100, particulars: 'X' })), openingBalance: 0, closingBalance: 0 },
                    cashAndBankConsolidatedTotal: [{}],
                },
            },
        })
        // Navigate to a non-zero page
        await userEvent.click(screen.getByRole('button', { name: /last page/i }))
        // Now call handleApplyFilter through the imperative handle
        await act(async () => {
            capturedRef.current.handleApplyFilter({ from: '2026-04-01', to: '2026-04-30', paymentMode: null, min_amount: null, max_amount: null })
        })
        // After handleApplyFilter, pagination should be back at page 0.
        // We verify by re-checking the pagination "Page N" indicator or the selected page button.
        // TablePagination doesn't render a clear "page N" label; instead, when on page 0 the
        // "previous page" button is disabled.
        const prevBtn = screen.getByRole('button', { name: /previous page/i })
        expect(prevBtn).toBeDisabled()
    })
})

describe('TransactionList — OB fallback chain (race condition fix)', () => {
    test('processedRows uses bundled openingBalance when present (not racy accounts OB)', () => {
        renderTxnList({ selectedAccount: CASHVIVO }, {
            cashAndBankTransactionList: {
                count: 1,
                data: [{ transactionId: 1, type: 'Receipt', transactionDate: '2026-04-11', debit: 500, credit: 0, amount: 500, particulars: 'Test Customer' }],
                openingBalance: 9999, // bundled — should win over CASHVIVO.openingBalance=500
                closingBalance: 10499,
            },
        })
        expect(screen.getByText(/Opening Balance/)).toBeInTheDocument()
        // The bundled 9,999 should be rendered somewhere (OB row), 500 is the txn amount
        // so we assert specifically on the formatted 9,999
        const matches = screen.getAllByText(/₹9,999/)
        expect(matches.length).toBeGreaterThan(0)
    })

    test('processedRows falls back to selectedAccount.openingBalance when response lacks openingBalance', () => {
        renderTxnList({ selectedAccount: CASHVIVO }, {
            cashAndBankTransactionList: {
                count: 0,
                data: [],
                // no openingBalance / closingBalance → fallback to CASHVIVO.openingBalance = 500
            },
        })
        // With 0 txns, OB and CB rows both show ₹500 — assert at least one match
        const matches = screen.getAllByText(/₹500/)
        expect(matches.length).toBeGreaterThan(0)
    })
})
