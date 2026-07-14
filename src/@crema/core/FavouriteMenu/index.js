import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { alpha, Box, Checkbox, Collapse, ListItemIcon, ListItemText, Snackbar } from '@mui/material';
import PropTypes from 'prop-types';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { favouriteMenuListAction, addFavouriteMenuAction } from 'redux/actions/role_actions';
import { useNavigate } from 'react-router-dom';
import { getsessionStorage } from 'pages/common/login/cookies';
import MuiAlert from '@mui/material/Alert';
import FavouritesMenuIcon from 'assets/icon/favouritemenu.svg';
import PayablesIcon from 'assets/icon/payable.svg?react';
import SellIcon from 'assets/icon/seller.svg?react';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ReceiptPayments from 'components/ReceiptPayments/ReceiptPayments';
import { triggerPayInOutModal } from 'redux/actions/paymentReceipt_actions';
import { triggerDcsModal, triggerSalesModal } from 'redux/actions/sales_actions';
// import  expenseIcon from 'assets/dashboardIcons/07salary.svg';
// import payableIcon  from 'assets/dashboardIcons/payable.svg';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PaymentIcon from '@mui/icons-material/Payment';
import { triggerBillsModel, triggerPOsModal } from 'redux/actions/purchase_actions';





const FavouriteMenu = ({ iconOnly, tooltipPosition, openInvoiceModal  }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const storage = getsessionStorage()
  

  const [anchorEl, setAnchorEl] = useState(null);
  const [moduleList, setModuleList] = useState({});
  const [showModules, setShowModules] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [newOpen, setNewOpen] = useState(false);
  const [receiptComponentProps, setReceiptComponentProps] = useState(null); 

  const iconMap = {
  expenseIcon: AttachMoneyIcon,
  purchaseorderIcon: AttachMoneyIcon,
  MoneyOffIcon: SellIcon,
  payableIcon: PayablesIcon,
  };
  
  const allowedSales = [
    'Invoices',
    'Delivery Challans',
    'Receipts'
  ];

   const allowedPurchases = [
     'Payments',
     'Bills',
     'Purchase Orders'
  ];

   const allowedPayments = [
    'Pay In / Pay Out'
  ];
  
  const showSnackbar = (message, severity = 'success') => {
   setSnackbar({ open: true, message, severity });
  };

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setShowModules(false);
    setModuleList({});
    setExpandedModules({});
    setLoading(true);

    dispatch(favouriteMenuListAction(() => {}, () => {})).then((res) => {
        if (res && typeof res === 'object') {
        setModuleList(res);
        const checkedIds = [];

        Object.values(res).forEach((items) => {
            items.forEach((item) => {
            if (item.checked === 1) {
                checkedIds.push(item.messageId);
            }
            });
        });

        setSelectedItems(checkedIds);
        }
        setLoading(false);
    });
  };

  const handleClose = () => {
    setAnchorEl(null);
    setShowModules(false);
    setExpandedModules({});
  };
  // (Invoice, Delivery Challan, Bill, Receipt, Payment & Pay In - Pay Out)

  const handleAddFavouritesClick = () => {
    setLoading(true);
    dispatch(favouriteMenuListAction(() => {}, () => {})).then((res) => {
      if (res && typeof res === 'object') {

        const updatedRes = { ...res };
        

      if (updatedRes.Sales) {
        updatedRes.Sales = updatedRes.Sales.filter((item) =>
           allowedSales.includes(item.messageId)
        );
      }
      
      if (updatedRes.Purchases) {
        updatedRes.Purchases = updatedRes.Purchases.filter((item) =>
            allowedPurchases.includes(item.messageId)
        );
      }
      
      if (updatedRes.Payments) {
        updatedRes.Payments = updatedRes.Payments.filter((item) =>
          allowedPayments.includes(item.messageId)
        );
      }
      
        setModuleList(updatedRes);
        setShowModules(true);

      const checkedIds = [];
      Object.values(updatedRes).forEach((items) => {
        items.forEach((item) => {
          if (item.checked === 1) {
            checkedIds.push(item.messageId);
          }
        });
      });

      setSelectedItems(checkedIds); 
      }
      setLoading(false);
    });
  };

  const toggleExpand = (moduleName) => {
        setExpandedModules((prev) => ({
            ...prev,
            [moduleName]: !prev[moduleName],
            }));
       };
    
    const handleCheckboxToggle = (e, item) => {
        const isChecked = e.target.checked;
        const checkedValue = isChecked ? 1 : 0;

        setSelectedItems((prevSelected) => {
            if (isChecked) {
            return [...prevSelected, item.messageId];
            } else {
            return prevSelected.filter((id) => id !== item.messageId);
            }
        });

        const payload = {
            employee_id: storage.employee_id,
            role_id: storage.role_id, 
            childPath: item.url,
            messageId: item.messageId,
            checked: checkedValue,
        };

       dispatch(addFavouriteMenuAction(
        payload,
        () => {
            setSelectedItems((prevSelected) => {
            return isChecked
                ? [...prevSelected, item.messageId]
                : prevSelected.filter((id) => id !== item.messageId);
            });
            showSnackbar(isChecked ? 'Added to Favourites' : 'Removed From Favourites');
        },
        () => {
            showSnackbar('Failed to update favourites', 'error');
        }
        ));
    };
  
    return (
   <>
    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
      <IconButton
        sx={{
          height: 32,
          width: 32,
          fontSize: 32,
          color: (theme) => theme.palette.text.secondary,
          backgroundColor: (theme) => theme.palette.background.default,
          border: 1,
          borderColor: 'transparent',
          '&:hover, &:focus': {
            color: (theme) => theme.palette.text.primary,
            backgroundColor: (theme) => alpha(theme.palette.background.default, 0.9),
            borderColor: (theme) => alpha(theme.palette.text.secondary, 0.25),
          },
        }}
        onClick={handleOpen}
        aria-label="open favourites menu"
        color="inherit"
        size="large"
      >
        <img
            src={FavouritesMenuIcon}
            alt="Favourites"
            style={{ width: 15, height: 20 }}
        />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
        }}
        transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
        }}
        slotProps={{
            paper: {
            sx: {
                overflow: 'visible',
                mt: 1.5,
                boxShadow: 3,
                '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                left: 'calc(50% - 8px)', 
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderBottom: (theme) => `8px solid ${theme.palette.background.paper}`,
                zIndex: 1,
                },
            },
            },
        }}
      >
        <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
            <MuiAlert
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                severity={snackbar.severity}
                sx={{ width: '100%' }}
                elevation={6}
                variant="filled"
            >
                {snackbar.message}
        </MuiAlert>
        </Snackbar>
       
        {!showModules ? (
        <>
            {Object.entries(moduleList).map(([moduleName, items]) =>
              items
                .filter(item => item.checked === 1)
                .map((item, idx) => {
                  const IconComponent = iconMap[item.iconName]; 

                  return (
                    <MenuItem
                      key={`${moduleName}-${idx}`}
                      onClick={() => {
                        if (item.messageId === 'Receipts') {
                          setReceiptComponentProps({
                            paymentOpen: true,
                            custType: 'CUSTOMER',
                            handleClose: () => setNewOpen(false),
                            editData: {},
                            responseType: 'cashIn',
                            sales_items: [],
                            selectedInvoice: null,
                            selectedCustomer: {},
                          });
                          setNewOpen(true);
                           navigate(item.url);
                           dispatch(triggerSalesModal(false)); 
                           dispatch(triggerDcsModal(false)); 
                        } else if (item.messageId === 'Payments' && item.url === '/sales/PaymentsPurchases') {
                          setReceiptComponentProps({
                            paymentOpen: true,
                            custType: 'VENDOR',
                            handleClose: () => setNewOpen(false),
                            editData: {},
                            responseType: 'cashOut',
                            sales_items: [],
                            selectedInvoice: null,
                            selectedCustomer: {},
                          });
                          setNewOpen(true);
                          navigate(item.url);
                          dispatch(triggerSalesModal(false)); 
                          dispatch(triggerDcsModal(false)); 
                        } else if (item.messageId === 'Pay In / Pay Out' && item.url === '/accounts/payinout') {
                          dispatch(triggerSalesModal(false)); 
                          dispatch(triggerDcsModal(false)); 
                          dispatch(triggerPayInOutModal(true)); 
                          navigate(item.url);
                        } else if (item.messageId === 'Purchase Orders' && item.url === '/sales/purchasesOrders') {
                          dispatch(triggerBillsModel(true)); 
                          navigate(item.url);
                          return;
                        } else if (item.messageId === 'Bills' && item.url === '/sales/bills') {
                          dispatch(triggerPOsModal(true)); 
                          navigate(item.url)
                          return;
                        } else if (item.messageId === 'Invoices' && item.url === '/sales/invoices') {
                           console.log('Invoice condition triggered');
                          dispatch(triggerSalesModal(true)); 
                          navigate(item.url);
                          return;
                        } else if (item.messageId === 'Delivery Challans' && item.url === '/sales/deliveryChallan') {
                          dispatch(triggerDcsModal(true)); 
                          navigate(item.url);
                          return;
                        } else {
                          dispatch(triggerSalesModal(false)); 
                          dispatch(triggerDcsModal(false)); 
                          navigate(item.url);
                        }
                      }}
                      sx={{ 
                        fontWeight: 'normal', 
                        width: 250, 
                        display: 'flex', 
                        alignItems: 'center' 
                      }}
                    >
                      {IconComponent && (
                        <IconComponent style={{ width: 18, height: 18, marginRight: 8 }} />
                      )}
                     {item.messageId}
                    </MenuItem>
                  );
                })
            )}

            <MenuItem sx={{ fontWeight: 'bold',}} onClick={handleAddFavouritesClick}>
            {loading ? 'Loading...' : 'Add Favourites +'}
            </MenuItem>
        </>
        ) : (
        Object.entries(moduleList).map(([moduleName, items]) => (
            <React.Fragment key={moduleName}>
            <>
                <MenuItem
                onClick={() => toggleExpand(moduleName)}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: 250,
                }}
                >
                <Box
                    sx={{
                    flex: 1,
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    }}
                >
                    {moduleName}
                </Box>
                {expandedModules[moduleName] ? (
                    <ExpandLessIcon fontSize="small" />
                ) : (
                    <ExpandMoreIcon fontSize="small" />
                )}
                </MenuItem>

                <Collapse in={expandedModules[moduleName]} timeout="auto" unmountOnExit>
                {items.map((item, idx) => (
                    <MenuItem
                     key={`${moduleName}-${idx}`}
                    sx={{ 
                        fontWeight: 'normal',
                        fontSize: '0.85rem',      
                        pl: 4,                    
                        py: 0.5,                 
                        minHeight: '32px'     
                    }}
                    onClick={(e) => e.stopPropagation()}
                    >
                    <Checkbox
                        size="small"
                        checked={selectedItems.includes(item.messageId)}
                        onChange={(e) => handleCheckboxToggle(e, item)}
                        onClick={(e) => e.stopPropagation()}
                        sx={{ mr: 1 }}
                    />
                     {item.messageId}
                    </MenuItem>
                ))}
                </Collapse>
            </>
            </React.Fragment>
        ))
        )}
      </Menu>
    </Box>
    {newOpen && receiptComponentProps && (
      <ReceiptPayments {...receiptComponentProps} />
     )}
    </>
  );
};

export default FavouriteMenu;

FavouriteMenu.propTypes = {
  iconOnly: PropTypes.bool,
  tooltipPosition: PropTypes.string,
  openInvoiceModal: PropTypes.func,
};
