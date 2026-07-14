/*
 * Unit tests for CashInHandFilter dialog.
 *
 * Scope: the dialog is self-contained — owns its own draft state, emits
 * backend-shaped payloads on Apply/Clear. No Redux, no router, no API.
 * We can test it in isolation with just props.
 */
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import moment from 'moment'
import CashInHandFilter from './CashInHandFilter'

const TODAY = moment().format('YYYY-MM-DD')

const defaultProps = {
    open: true,
    currentFilter: {
        from: TODAY,
        to: TODAY,
        paymentMode: null,
        min_amount: null,
        max_amount: null,
    },
    currentAccountChip: 'All',
    onApply: vi.fn(),
    onClear: vi.fn(),
    onClose: vi.fn(),
}

const renderDialog = (propOverrides = {}) => {
    const props = { ...defaultProps, ...propOverrides, onApply: vi.fn(), onClear: vi.fn(), onClose: vi.fn() }
    render(<CashInHandFilter {...props} />)
    return props
}

describe('CashInHandFilter', () => {

    describe('Initial state from currentFilter', () => {
        test('renders all expected fields on open', () => {
            renderDialog()
            expect(screen.getByText(/filter cash-in-hand/i)).toBeInTheDocument()
            expect(screen.getByText(/account type/i)).toBeInTheDocument()
            expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: 'Cash' })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: 'Bank' })).toBeInTheDocument()
            expect(screen.getByLabelText(/quick range/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/from date/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/to date/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/min amount/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/max amount/i)).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
        })

        test('Account Type toggle reflects currentAccountChip=Cash', () => {
            renderDialog({ currentAccountChip: 'Cash' })
            const cashBtn = screen.getByRole('button', { name: 'Cash' })
            expect(cashBtn).toHaveAttribute('aria-pressed', 'true')
        })

        test('Account Type toggle reflects currentAccountChip=Bank', () => {
            renderDialog({ currentAccountChip: 'Bank' })
            const bankBtn = screen.getByRole('button', { name: 'Bank' })
            expect(bankBtn).toHaveAttribute('aria-pressed', 'true')
        })

        test('min_amount and max_amount pre-populate from currentFilter', () => {
            renderDialog({
                currentFilter: { ...defaultProps.currentFilter, min_amount: 1000, max_amount: 5000 },
            })
            expect(screen.getByLabelText(/min amount/i)).toHaveValue(1000)
            expect(screen.getByLabelText(/max amount/i)).toHaveValue(5000)
        })
    })

    describe('Apply button → onApply payload', () => {
        test('Apply with defaults emits {from: today, to: today, accountChip: All, min_amount: null, max_amount: null}', async () => {
            const user = userEvent
            const props = renderDialog()
            await user.click(screen.getByRole('button', { name: /apply/i }))
            expect(props.onApply).toHaveBeenCalledTimes(1)
            const payload = props.onApply.mock.calls[0][0]
            expect(payload).toMatchObject({
                from: TODAY,
                to: TODAY,
                accountChip: 'All',
                min_amount: null,
                max_amount: null,
            })
        })

        test('Apply with Bank toggle emits accountChip: Bank', async () => {
            const user = userEvent
            const props = renderDialog()
            await user.click(screen.getByRole('button', { name: 'Bank' }))
            await user.click(screen.getByRole('button', { name: /apply/i }))
            expect(props.onApply.mock.calls[0][0].accountChip).toBe('Bank')
        })

        test('Apply with min/max amount emits numeric values', async () => {
            const user = userEvent
            const props = renderDialog()
            await user.type(screen.getByLabelText(/min amount/i), '500')
            await user.type(screen.getByLabelText(/max amount/i), '5000')
            await user.click(screen.getByRole('button', { name: /apply/i }))
            const payload = props.onApply.mock.calls[0][0]
            expect(payload.min_amount).toBe(500)
            expect(payload.max_amount).toBe(5000)
        })

        test('Apply with min > max silently swaps the values', async () => {
            const user = userEvent
            const props = renderDialog()
            await user.type(screen.getByLabelText(/min amount/i), '9000')
            await user.type(screen.getByLabelText(/max amount/i), '100')
            await user.click(screen.getByRole('button', { name: /apply/i }))
            const payload = props.onApply.mock.calls[0][0]
            expect(payload.min_amount).toBe(100)
            expect(payload.max_amount).toBe(9000)
        })

        test('paymentMode field is not in emitted payload (removed per UI spec)', async () => {
            const user = userEvent
            const props = renderDialog()
            await user.click(screen.getByRole('button', { name: /apply/i }))
            const payload = props.onApply.mock.calls[0][0]
            expect(payload).not.toHaveProperty('paymentMode')
        })

        test('txnChip field is not in emitted payload (removed per UI spec)', async () => {
            const user = userEvent
            const props = renderDialog()
            await user.click(screen.getByRole('button', { name: /apply/i }))
            const payload = props.onApply.mock.calls[0][0]
            expect(payload).not.toHaveProperty('txnChip')
        })
    })

    describe('Clear button → onClear payload', () => {
        test('Clear emits today/today with chip=All and null amounts', async () => {
            const user = userEvent
            const props = renderDialog({
                currentFilter: { from: '2026-03-01', to: '2026-03-31', min_amount: 500, max_amount: 9999, paymentMode: null },
                currentAccountChip: 'Bank',
            })
            await user.click(screen.getByRole('button', { name: /clear/i }))
            expect(props.onClear).toHaveBeenCalledTimes(1)
            const payload = props.onClear.mock.calls[0][0]
            expect(payload).toEqual({
                from: TODAY,
                to: TODAY,
                min_amount: null,
                max_amount: null,
                accountChip: 'All',
            })
        })
    })

    describe('Close button → onClose without Apply', () => {
        test('clicking close icon calls onClose and not onApply', async () => {
            const user = userEvent
            const props = renderDialog()
            // The close icon is an IconButton at the top — find by its aria-label via MUI default or test id.
            // Use getAllByRole('button') and pick the one with CloseIcon (svg descendant).
            const buttons = screen.getAllByRole('button')
            // Heuristic: the close-X sits in the dialog title. MUI sets no default aria-label,
            // so match via an empty-name button in the title.
            const title = screen.getByText(/filter cash-in-hand/i).closest('div')
            const closeBtn = within(title).getAllByRole('button')[0]
            await user.click(closeBtn)
            expect(props.onClose).toHaveBeenCalled()
            expect(props.onApply).not.toHaveBeenCalled()
        })
    })

    describe('Re-opening dialog syncs with latest currentFilter', () => {
        test('changing currentFilter while open updates draft via useEffect', async () => {
            const user = userEvent
            const onApply = vi.fn()
            const { rerender } = render(
                <CashInHandFilter
                    {...defaultProps}
                    open={true}
                    currentFilter={{ from: '2026-03-01', to: '2026-03-31', min_amount: null, max_amount: null, paymentMode: null }}
                    onApply={onApply}
                />
            )
            // Rerender with a different currentFilter while still open
            rerender(
                <CashInHandFilter
                    {...defaultProps}
                    open={true}
                    currentFilter={{ from: '2026-04-01', to: '2026-04-30', min_amount: 999, max_amount: null, paymentMode: null }}
                    onApply={onApply}
                />
            )
            // min_amount field should now show 999
            expect(screen.getByLabelText(/min amount/i)).toHaveValue(999)
        })
    })

    describe('Exclusive toggle: cannot deselect last option', () => {
        test('clicking the currently-active Account Type toggle does not set it to null', async () => {
            const user = userEvent
            const props = renderDialog({ currentAccountChip: 'Cash' })
            // Cash is pressed; clicking it again would deselect in exclusive mode without guard.
            await user.click(screen.getByRole('button', { name: 'Cash' }))
            await user.click(screen.getByRole('button', { name: /apply/i }))
            // Value stayed Cash (not null / 'All')
            expect(props.onApply.mock.calls[0][0].accountChip).toBe('Cash')
        })
    })
})
