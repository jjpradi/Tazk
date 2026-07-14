import { Dialog, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import Paper from '@mui/material/Paper';
import React from 'react';

export default function LotDialog(props) {
    const { lotDialog, handleLotClose, tableData } = props;
  return (
    <Dialog open={lotDialog} onClose={() => handleLotClose()}>
      <TableContainer component={Paper}>
        <Table aria-label='collapsible table'>
          <TableHead>
            <TableRow>
              <TableCell>Lot Numbers</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((lot) => (
              <TableRow key={lot.lot_id}>
                <TableCell>{lot.lot_number}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Dialog>
  );
}
