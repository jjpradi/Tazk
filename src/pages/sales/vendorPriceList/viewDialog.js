import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import Draggable from 'react-draggable';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Typography,
} from '@mui/material';
import {useCustomFetch} from 'utils/useCustomFetch';
import {DataGrid} from '@mui/x-data-grid';
import API_URLS from '../../../utils/customFetchApiUrls';

function PaperComponent(props) {
  const nodeRef = React.useRef(null);
  return (
    <Draggable
      nodeRef={nodeRef}
      handle='#draggable-dialog-title'
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper ref={nodeRef} {...props} />
    </Draggable>
  );
}

function ViewDialog(props) {
  const customFetch = useCustomFetch();
  const {open, handleClose, viewData} = props;


  const [data, setData] = useState([]);

  useEffect(() => { (async () => {
    let body = {
      priceId: viewData?.id,
    };
     const { data: productData } = await customFetch(
      API_URLS.SUPPLIER_PRICE_LIST_VIEW,
      'POST',
      body
    );
    await setData(productData);
  })();
}, []);

  const columns = [
    {
      headerName: 'Product Name',
      field: 'name',
      flex: 1,
      minWidth: 200,
    },
    {
      headerName: 'Dealer Price',
      field: 'dealerPrice',
      flex: 1,
      minWidth: 100,
    },
    {
      headerName: 'Selling Price',
      field: 'sellingPrice',
      flex: 1,
      minWidth: 100,
    },
    {
      headerName: 'MRP',
      field: 'mrp',
      flex: 1,
      minWidth: 100,
    },
    {
      headerName: 'Margin',
      field: 'margin',
      flex: 1,
      minWidth: 100,
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={() => handleClose()}
      // PaperComponent={PaperComponent}
      maxWidth='md'
      fullWidth
      aria-labelledby='draggable-dialog-title'
    >
      <DialogTitle
        id="draggable-dialog-title"
        sx={{ cursor: "move" }}
      >
        {viewData?.name}
      </DialogTitle>
      <DialogContent>
        <Box
          p='20px'
          sx={{
            height: 400,
            width: '100%',
            backgroundColor: '#F4F7FE',
            cursor: 'pointer',
          }}
        >
          <DataGrid
            rows={data}
            columns={columns}
            initialState={{
              pagination: { paginationModel: { pageSize: 20 } }
            }}
            pageSizeOptions={[20, 50, 100]}
            density="compact"
            disableRowSelectionOnClick
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button color='secondary' onClick={() => handleClose()}>
          {'Close'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ViewDialog;

ViewDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  viewData: PropTypes.obj,
};
