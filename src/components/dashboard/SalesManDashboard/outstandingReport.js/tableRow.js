import React, {useContext} from 'react';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import {useDispatch} from 'react-redux';
import context from '../../../../context/CreateNewButtonContext';
import {getTop10OutstandingReportAction} from 'redux/actions/salesMan_action';

export default function Top10OutstandingRow(props) {
  const {row} = props;

  return (
    <React.Fragment>
      <TableRow sx={{'& > *': {borderBottom: 'unset'}}}>
        <TableCell>
          {row.company_name === null ? '-' : row.company_name}
        </TableCell>
        <TableCell>
          {row.invoice_number === null ? '-' : row.invoice_number}
        </TableCell>
        <TableCell>
          {row.invoice_date === null ? '-' : row.invoice_date}
        </TableCell>
        <TableCell>{row.total === null ? '-' : row.total}</TableCell>
        <TableCell>{row.due_amount === null ? '-' : row.due_amount}</TableCell>
        <TableCell>{row.due_days === null ? '-' : row.due_days}</TableCell>
      </TableRow>
    </React.Fragment>
  );
}
