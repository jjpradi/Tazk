import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {MenuItem, Typography} from '@mui/material';
import MaterialTable from 'utils/SafeMaterialTable';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import { pageSize } from 'utils/pageSize';

export default function AlertDialog({
  receivings_items,
  cnhandleOpen,
  ledgerReturnApi,
}) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <MenuItem onClick={handleClickOpen}>Return</MenuItem>
      <Dialog
        open={open}
        // onClose={handleClose}
        maxWidth='lg'
        fullWidth
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>
          {'Select product to return'}
        </DialogTitle>
        <DialogContent>
          <MaterialTable
            options={{
              headerStyle: {
                fontSize: 15
              },
              showTitle: false,
              // toolbar: false,
              // paging: Tdata.length > 4 ? true : false,
              pageSize: pageSize,
              pageSizeOptions: [20, 50, 100],
              exportButton: true,
              exportMenu: [
                {
                  label: 'Export PDF',
                  exportFunc: (cols, datas) =>
                    ExportPdf(cols, datas, 'PurchaseSO'),
                },
                {
                  label: 'Export CSV',
                  exportFunc: (cols, datas) =>
                    ExportCsv(cols, datas, 'PurchaseSO'),
                },
              ],
              selection: true,
            }}
            columns={[
              {
                field: 'name',
                title: 'Item',
              },
              {
                field: 'description',
                title: 'Description',
              },
              {
                field: 'model',
                title: 'Modal',
              },
              {
                field: 'quantity',
                title: 'Ordered Qty',
              },
              {
                field: 'quantity',
                title: 'Received Qty',
              },
              {
                field: 'item_cost_price',
                title: 'Cost',
              },
              {
                field: 'sub_total',
                title: 'Sub Total',
                render: (row) => (
                  <div style={{display: 'flex'}}>
                    {row.item_cost_price * row.quantity}
                  </div>
                ),
              },
            ]}
            data={receivings_items}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          <Button
            onClick={() => {
              handleClose();
              ledgerReturnApi();
              cnhandleOpen();
            }}
            autoFocus
          >
            Return
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

