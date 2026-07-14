import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

/**
 * Inner table that shows opening-balance ledger entries below the main child
 * invoice/bill table inside an expanded group row.
 *
 * Props:
 *   title: string - heading shown above the table (typically the customer/vendor name)
 *   ledgers: array - the opening-balance ledger rows to render
 *   getAmount: (ledger) => number - sign convention differs per page (debit-credit vs credit-debit)
 *   renderPayment: (ledger) => ReactNode | null - per-row payment cell content; if null/undefined, the cell is rendered but empty
 *   showPaymentCell?: boolean - when false, the Payment column is omitted entirely (default true)
 */
export default function OpeningBalanceTable({
  title,
  ledgers,
  getAmount,
  renderPayment,
  showPaymentCell = true,
}) {
  if (!ledgers || ledgers.length === 0) return null;

  return (
    <>
      <Typography variant="h6" gutterBottom component="div">
        {title}
      </Typography>
      <Table size="small" aria-label="opening balance">
        <TableHead>
          <TableRow>
            <TableCell>Opening Balance Amount</TableCell>
            {showPaymentCell && <TableCell>Payment</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {ledgers.map((j) => (
            <TableRow key={j.ledger_id}>
              <TableCell>{getAmount(j)}</TableCell>
              {showPaymentCell && <TableCell>{renderPayment ? renderPayment(j) : null}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
