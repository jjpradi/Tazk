import React, { useState } from 'react';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import PropTypes from 'prop-types';
import { Box, Button, Dialog, DialogContent, DialogContentText, DialogTitle, IconButton, ListItem, Typography } from '@mui/material';
import { Fonts } from '../../../shared/constants/AppEnums';
import TopOrder from '../../../components/erpDesign/SO'
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { UpdateIsreadAction } from 'redux/actions/notification_actions';
import DeleteIcon from '@mui/icons-material/Delete';
import { updateClearedNotificationAction } from '../../../redux/actions/notification_actions';
import DialogActions from '@mui/material/DialogActions';

const NotificationItem = (props) => {
  const { item } = props;
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [rowPopup, setRowPopup] = useState({ open: false, rowIndex: null, sales_items: [] });
  const [soToInvoice, setSoToInvoice] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(null);

  // const handlenavigate = (item) => {
  //   if (item?.type === 'Receipt Created') {
  //     props.onClose()
  //     console.log(item?.type_id, 'handlenavigatee');
  //     const rowData = item.rowData || {};
  //     navigate('/ReceiptSales')
  //     let data = {
  //       id : item?.id
  //     }
  //     dispatch(UpdateIsreadAction(data))
  //   }
  // };
  const typeRouteMap = {
    'Receipt Created': '/sales/ReceiptSales',
    'Vendor Bill Received': '/sales/bills',
    'Vendor Bill Payment': '/sales/PaymentsPurchases',
    'Vendor Bill Overdue': '/sales/bills',
    'Selling Price Change Detected': '/sales/invoices',
    'Negative Margin Sale Detected': '/sales/invoices',
    'invoice created': '/sales/invoices',
    'Daily Cash Overview': '/accounts/CashInhand',
    'GSTR-1 Filing Due': '/sales/GSTR1',
    'Bank Reconciliation Reminder': '/accounts/bankReconciliation',
    'Pending PDC Reminder': '/accounts/cheques',
    'Invoice Due Tomorrow': '/sales/invoices',
    'Invoice Overdue': '/sales/invoices',
    'Customer Price List Expiry': '/sales/priceList',
    'Vendor Price List Expiry': '/sales/vendorPriceList',
    'Order Delivered': '/sales/invoices',
    'Cheques Bounce Alert': '/accounts/cheques',
    'Critical Master Data Deleted': '/common/apps/contacts',
    'Loan Request': '/common/approvals',
    'Leave Request': '/common/approvals',
    'Permission Request': '/common/approvals',
    'Attendance Correction Request': '/common/approvals',
    'Claim Request': '/common/approvals',
    'Wfh Request': '/common/approvals',
    "Loan Rejection": "/common/approvals",
    "Permission Rejection": "/common/approvals",
    "Attendance Correction Rejection": "/common/approvals",
    "Leave Rejection": "/common/approvals",
    "Permission Approval": "/common/approvals",
    "Attendance Correction Approval": "/common/approvals",
    "Claim Rejected": "/common/approvals",
    "Leave Approval": "/common/approvals",
    "Loan Approval": "/common/approvals",
    "Claim Approval": "/common/approvals",
    "Wfh Approval": "/common/approvals",
    "Wfh Rejected": "/common/approvals",
    "Payslip Available":"/payroll/paySlip"
  };


  const handlenavigate = (item) => {
  const route = typeRouteMap[item?.type];
  if (!route) {
    console.warn(`No route found for type: ${item?.type}`);
    return;
  }
  props.onClose();
  console.log(item?.type_id, 'handlenavigate');
  navigate(route, { state: { id: String(item?.type_id) } });
  const data = {
    id: item?.id
  };
  dispatch(UpdateIsreadAction(data,'readOne'));
};

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    setOpenDeleteDialog(false);
    handleDelete();
  };

  const handleCancel = () => {
    setOpenDeleteDialog(false);
  };

  const handleDelete = async (e) => {
    const payload = {
      id: openDeleteDialog
    }
    await dispatch(updateClearedNotificationAction(payload))
    props.fetchNotifications(0, props.searchVal);
    setOpenDeleteDialog(null)
  }

  return (
    <>
    <ListItem
      sx={{
        padding: '8px 20px',
        cursor: 'pointer'
      }}
      className='item-hover'
      onClick={() => handlenavigate(item)}
    >
      <ListItemAvatar
        sx={{
          minWidth: 0,
          mr: 4,
        }}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
          }}
          alt='Sales'
          src={item.image}
        />
      </ListItemAvatar>
      <Box
        sx={{
          fontSize: 14,
          color: (theme) => theme.palette.text.secondary,
        }}
      >
      <Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Box
            component="span"
            sx={{
              fontSize: 14,
              fontWeight: Fonts.MEDIUM,
              mb: 0.5,
              color: (theme) => theme.palette.text.primary,
              mr: 1,
              display: 'inline-block',
              whiteSpace: 'pre-line',
            }}
          >
            Title : {item.title}{"\n"}
            Details : {item.content_body}{"\n"}
            Time : {item.formattedtime}
          </Box>

          <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                   setOpenDeleteDialog(item.id);
                }}
          >  
            <DeleteIcon />
          </IconButton>
        </Box>
      </Typography>
      </Box>
    </ListItem>
    
      <Dialog open={Boolean(openDeleteDialog)}  onClose={handleCancel}>
        <DialogTitle>Are you sure?</DialogTitle>

        <DialogContent>
          <DialogContentText>
            Do you really want to delete this item! This action cannot be undone.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

    </>
  );
};

export default NotificationItem;

NotificationItem.propTypes = {
  item: PropTypes.object.isRequired,
};
