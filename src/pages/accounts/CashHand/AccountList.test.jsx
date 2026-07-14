/*
 * Unit tests for AccountList (the left panel of Cash-in-Hand).
 *
 * Focus: Bug #3 (left chip → setResetToAll cascade) and Bug #5 (preserve selection across refresh).
 * The component dispatches getBankAndCashAccountsAction on mount + on chip change;
 * we mock the action module so tests stay offline and fast.
 */
import { screen, within, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../../test/renderWithProviders'

// Mock the cash_box service at the module boundary — any thunk that reaches out
// to http-common resolves to a no-op. This avoids pulling in axios/socket.io/PouchDB
// which http-common drags in, and keeps tests hermetic.
vi.mock('services/cash_box_services', () => ({
    default: {
        getBankAndCashAccounts: () => Promise.resolve({ status: 200, data: [] }),
        getConsolidatedTotalAmount: () => Promise.resolve({ status: 200, data: [] }),
        getTransactionList: () => Promise.resolve({ status: 200, data: { count: 0, data: [] } }),
        getCreditDebitHint: () => Promise.resolve({ status: 200, data: {} }),
    },
}))

// apiCalls is a helper wrapper around dispatched thunks — no-op is fine.
vi.mock('utils/apiCalls', () => ({ default: () => {} }))

// Import AccountList after the mocks so the mocked modules are used.
import AccountList from './AccountList'

const baseProps = {
    setSelectedAccount: vi.fn(),
    setIsDrawerOpen: vi.fn(),
    setResetToAll: vi.fn(),
    setFilterOpen: vi.fn(),
    setAccountChip: vi.fn(),
    accountChip: 'All',
    filter: { from: '2026-04-11', to: '2026-04-11' },
}

const CASHVIVO = { id: 1, name: 'CashVIVO', type: 'Cash', amount: 1000, openingBalance: 500, closingBalance: 1500 }
const CASHNOKIA = { id: 2, name: 'CashNokia', type: 'Cash', amount: 200, openingBalance: 100, closingBalance: 300 }
const INDUSIND = { id: 3, name: 'IndusInd', type: 'Bank', amount: 5000, openingBalance: 1000, closingBalance: 6000 }

describe('AccountList', () => {

    describe('Chip display and click (Bug #3 regression)', () => {
        test('renders All / Cash / Bank chips, "All" selected by default', () => {
            const props = { ...baseProps, setAccountChip: vi.fn(), setResetToAll: vi.fn() }
            renderWithProviders(<AccountList {...props} />, {
                preloadedState: { cashBox: { cashAndBankAccounts: [CASHVIVO, INDUSIND] } },
            })
            expect(screen.getByText('All')).toBeInTheDocument()
            expect(screen.getByRole('button', { name: 'Cash' })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: 'Bank' })).toBeInTheDocument()
        })

        test('clicking Cash chip calls setAccountChip("Cash") AND setResetToAll(true)', async () => {
            const setAccountChip = vi.fn()
            const setResetToAll = vi.fn()
            renderWithProviders(
                <AccountList {...baseProps} setAccountChip={setAccountChip} setResetToAll={setResetToAll} />,
                { preloadedState: { cashBox: { cashAndBankAccounts: [CASHVIVO, INDUSIND] } } }
            )
            await userEvent.click(screen.getByRole('button', { name: 'Cash' }))
            expect(setAccountChip).toHaveBeenCalledWith('Cash')
            expect(setResetToAll).toHaveBeenCalledWith(true)
        })

        test('clicking Bank chip cascades the same way', async () => {
            const setAccountChip = vi.fn()
            const setResetToAll = vi.fn()
            renderWithProviders(
                <AccountList {...baseProps} setAccountChip={setAccountChip} setResetToAll={setResetToAll} />,
                { preloadedState: { cashBox: { cashAndBankAccounts: [CASHVIVO, INDUSIND] } } }
            )
            await userEvent.click(screen.getByRole('button', { name: 'Bank' }))
            expect(setAccountChip).toHaveBeenCalledWith('Bank')
            expect(setResetToAll).toHaveBeenCalledWith(true)
        })

        test('clicking All chip also cascades (resets right panel even from All)', async () => {
            const setAccountChip = vi.fn()
            const setResetToAll = vi.fn()
            renderWithProviders(
                <AccountList {...baseProps} setAccountChip={setAccountChip} setResetToAll={setResetToAll} />,
                { preloadedState: { cashBox: { cashAndBankAccounts: [CASHVIVO, INDUSIND] } } }
            )
            await userEvent.click(screen.getByText('All'))
            expect(setAccountChip).toHaveBeenCalledWith('All')
            expect(setResetToAll).toHaveBeenCalledWith(true)
        })
    })

    describe('Row rendering', () => {
        test('renders one row per account with name and amount', () => {
            renderWithProviders(<AccountList {...baseProps} />, {
                preloadedState: { cashBox: { cashAndBankAccounts: [CASHVIVO, CASHNOKIA] } },
            })
            expect(screen.getByText('CashVIVO')).toBeInTheDocument()
            expect(screen.getByText('CashNokia')).toBeInTheDocument()
            expect(screen.getByText(/OB: ₹500/)).toBeInTheDocument()
            expect(screen.getByText(/CB: ₹1,500/)).toBeInTheDocument()
        })

        test('shows Cash label for cash accounts, Bank label for bank accounts', () => {
            renderWithProviders(<AccountList {...baseProps} />, {
                preloadedState: { cashBox: { cashAndBankAccounts: [CASHVIVO, INDUSIND] } },
            })
            expect(screen.getAllByText('Cash Account').length).toBeGreaterThan(0)
            expect(screen.getAllByText('Bank Account').length).toBeGreaterThan(0)
        })
    })

    describe('Row selection: toggle + parent callbacks', () => {
        test('clicking a row calls setSelectedAccount + setResetToAll(true)', async () => {
            const setSelectedAccount = vi.fn()
            const setResetToAll = vi.fn()
            renderWithProviders(
                <AccountList {...baseProps} setSelectedAccount={setSelectedAccount} setResetToAll={setResetToAll} />,
                { preloadedState: { cashBox: { cashAndBankAccounts: [CASHVIVO] } } }
            )
            await userEvent.click(screen.getByText('CashVIVO'))
            expect(setSelectedAccount).toHaveBeenCalledWith(expect.objectContaining({ id: 1, name: 'CashVIVO' }))
            expect(setResetToAll).toHaveBeenCalledWith(true)
        })

        test('clicking a selected row again deselects (setSelectedAccount(null))', async () => {
            const setSelectedAccount = vi.fn()
            renderWithProviders(
                <AccountList {...baseProps} setSelectedAccount={setSelectedAccount} />,
                { preloadedState: { cashBox: { cashAndBankAccounts: [CASHVIVO] } } }
            )
            // First click — select
            await userEvent.click(screen.getByText('CashVIVO'))
            // Second click — deselect
            await userEvent.click(screen.getByText('CashVIVO'))
            expect(setSelectedAccount).toHaveBeenLastCalledWith(null)
        })
    })

    describe('Selection preservation (Bug #5 regression)', () => {
        test('does NOT clear selection on accounts refresh if the account is still visible', async () => {
            const setSelectedAccount = vi.fn()
            const { store } = renderWithProviders(
                <AccountList {...baseProps} setSelectedAccount={setSelectedAccount} />,
                { preloadedState: { cashBox: { cashAndBankAccounts: [CASHVIVO, CASHNOKIA] } } }
            )
            // User selects CashVIVO
            await userEvent.click(screen.getByText('CashVIVO'))
            setSelectedAccount.mockClear()
            // Accounts list refreshes but CashVIVO is still present (e.g., filter date changed)
            await act(async () => {
                store.dispatch({
                    type: 'TEST_SET_ACCOUNTS',
                    payload: [CASHVIVO, CASHNOKIA, INDUSIND],
                })
            })
            // setSelectedAccount should NOT be called with null — selection preserved
            expect(setSelectedAccount).not.toHaveBeenCalledWith(null)
        })

        test('DOES clear selection when the account is no longer in the list', async () => {
            const setSelectedAccount = vi.fn()
            const { store } = renderWithProviders(
                <AccountList {...baseProps} setSelectedAccount={setSelectedAccount} />,
                { preloadedState: { cashBox: { cashAndBankAccounts: [CASHVIVO, INDUSIND] } } }
            )
            // Select CashVIVO
            await userEvent.click(screen.getByText('CashVIVO'))
            setSelectedAccount.mockClear()
            // User switches left chip to "Bank" — cash accounts disappear
            await act(async () => {
                store.dispatch({
                    type: 'TEST_SET_ACCOUNTS',
                    payload: [INDUSIND],  // CashVIVO is gone
                })
            })
            // Selection should be cleared
            expect(setSelectedAccount).toHaveBeenCalledWith(null)
        })
    })

    describe('Header — date range label', () => {
        test('renders "Cash In Hand - <from> - <to>" when both dates set', () => {
            renderWithProviders(
                <AccountList {...baseProps} filter={{ from: '2026-03-01', to: '2026-03-31' }} />,
                { preloadedState: { cashBox: { cashAndBankAccounts: [] } } }
            )
            expect(screen.getByText(/01\/03\/2026 - 31\/03\/2026/)).toBeInTheDocument()
        })

        test('renders "Cash In Hand - Today" when both dates are null', () => {
            renderWithProviders(
                <AccountList {...baseProps} filter={{ from: null, to: null }} />,
                { preloadedState: { cashBox: { cashAndBankAccounts: [] } } }
            )
            expect(screen.getByText(/Today/)).toBeInTheDocument()
        })
    })

    describe('Filter button', () => {
        test('clicking filter icon calls setFilterOpen(true)', async () => {
            const setFilterOpen = vi.fn()
            renderWithProviders(
                <AccountList {...baseProps} setFilterOpen={setFilterOpen} />,
                { preloadedState: { cashBox: { cashAndBankAccounts: [] } } }
            )
            // Filter button is the only IconButton in the header (Tooltip wraps it)
            // find via role=button and the FilterAltIcon aria-label is absent, so use a broader pick
            const buttons = screen.getAllByRole('button')
            // Pick the first button that isn't a chip (chips have label text)
            const iconBtn = buttons.find(b => !['All', 'Cash', 'Bank'].includes(b.textContent))
            await userEvent.click(iconBtn)
            expect(setFilterOpen).toHaveBeenCalledWith(true)
        })
    })
})
