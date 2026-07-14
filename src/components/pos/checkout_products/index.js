// import "./styles.css";
import {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {changePriceAndDiscount, changeSerialNumberForProduct, deleteItem, deleteItemInPreOrder, PushPreOrderItems, PushProductList, removeItemsBasedLotNumbers, removeItemsInPreOrder, SelectIndex} from '../../../redux/actions/pos_product_list';
import TocIcon from '@mui/icons-material/Toc';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';
import {Box, Button, Card, CardMedia, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, InputAdornment, TextField, Typography, useTheme} from '@mui/material';
import {taxes, totalCost, getIgst, singleTax, taxForCommonDiscount} from './commonTax';
import { SelectOnData } from 'redux/actions/notification_actions';
import { base_url } from 'http-common';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloseIcon from '@mui/icons-material/Close';
import { getsessionStorage } from 'pages/common/login/cookies';
import { thermalPrinterAction } from 'redux/actions/sales_actions';

export default function App(props) {
  const dispatch = useDispatch();
  const {
    productListReducer: { product_lists, tab_count, index, pre_order_status, pre_order_list },
    RequestConfigReducer: { posDiscountByPOSId },
    appConfigReducer: {app_config_data}
  } = useSelector((state) => state);
  const temphandle = useRef(null);
  const selectedIndexRef = useRef(null);
  const storage = getsessionStorage()
  const theme = useTheme()

  //  const list = product_lists[tab_count].productData
  const list = pre_order_status
    ? pre_order_list['pre_order'].productData
    : product_lists[tab_count].productData;
  const discount = pre_order_status
    ? pre_order_list['pre_order'].discount
    : product_lists[tab_count].discount;

  const roundOffAppConfig = app_config_data.filter(f => f.key_name === 'company.applyRoundOff')
  const roundedOffEnabled = roundOffAppConfig.length > 0 ? roundOffAppConfig[0].value : 'false'

  // (function (){
  //   if(list.some(i => +i.quantity > i.received_quantity)){
  //     alert("ddd")
  //   }
  // })()

  const [manageDialogOpen, setManageDialogOpen] = useState(false)
  const [manageCartItems, setManageCartItems] = useState({
    quantity: 0,
    price: 0.00,
    discount: 0,
    image: [],
    name: '',
    lots: [],
    item_id: 0,
    is_serialized: 0,
    serialNumber: null
  })
  const [manageCartItemsError, setManageCartItemsError] = useState({
    serialNumber: null
  })
  const [currentItem, setCurrentItem] = useState({})

  useEffect(() => {
    const groupDiv = document.querySelectorAll('.groupDiv');
    groupDiv.forEach((d, i) => {
      groupDiv[i].style.backgroundColor = 'rgba(0,0,0,.1)';
      groupDiv[i].style.boxShadow = 3
      groupDiv[i].style.transition = 'transform 0.3s ease, box-shadow 0.3s ease'
    });
  }, [tab_count]);

  const handleClick = (data,index) => {
    const productTax = getIgst(data)
    const price = parseFloat(data.isTaxIncluded ? (data.selling_price ?? data.unit_price) : (data.selling_price ?? data.unit_price) + ((data.selling_price ?? data.unit_price) * productTax) / 100).toFixed(2)
    
    setManageCartItems((prev) => ({
      ...prev,
      quantity: pre_order_status ? `${list.find(e => e.item_id === data.item_id)?.quantity}` : data.is_serialized === 1 ? `${list.filter(e => e.item_id === data.item_id && e.lot_number === data.lot_number).length}` : `${list.find(e => e.item_id === data.item_id)?.quantity}`,
      price: price,
      discount: data?.discount || 0,
      image: data.imageUrl,
      name: data.name,
      lots: data.lots,
      item_id: data.item_id,
      is_serialized: data.is_serialized,
      serialNumber: data.is_serialized === 1 ? data.lot_number : null
    }))
    setManageCartItemsError((prev) => ({ ...prev, serialNumber: null }))
    setCurrentItem(data)
    setManageDialogOpen(true)
    dispatch(SelectIndex(index));
    dispatch(SelectOnData(data.is_serialized))
  };


 const handleExportReceipt = async () => {
  try {
    const response = await dispatch(thermalPrinterAction({  }));
    
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'receipt.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Download failed:', error);
  }
};

  const setIndexHandler = () => {
    const groupDiv = document.querySelectorAll('.groupDiv');
    groupDiv.forEach((d, i) => {
      if (i === index) {
        groupDiv[i].style.backgroundColor = 'rgba(0,0,0,.3)';
        groupDiv[i].style.boxShadow = 3
        groupDiv[i].style.transition = 'transform 0.3s ease, box-shadow 0.3s ease'
      } else {
        groupDiv[i].style.backgroundColor = 'rgba(0,0,0,.1)';
        groupDiv[i].style.boxShadow = 3
        groupDiv[i].style.transition = 'transform 0.3s ease, box-shadow 0.3s ease'
      }
    });
  };
  const handle = () => {
    document.onkeydown = checkKey;
    function checkKey(e) {
      e = e || window.event;
      if (e.keyCode === 38) {
        // up arrow
        let inc = index !== '' ? index : list.length - 1;
        if (index !== '') {
          inc--;
        }
        if (inc < 0) {
          return;
        }
        handleClick(inc);
      } else if (e.keyCode === 40) {
        // down arrow
        let inc = index !== '' ? index : 0;
        if (index !== '') {
          inc++;
        }
        if (inc > list.length - 1) {
          return;
        }
        handleClick(inc);
      }
    }
  };
  temphandle.current = handle;
  selectedIndexRef.current = setIndexHandler;
  useEffect(() => {
    temphandle.current();
    selectedIndexRef.current();
  }, [list, index]);

  const qtytax = (sell, prc, tax) => {
    return sell ? sell : ((prc / 100) * tax + prc).toFixed(2);
  };
  
  const handleCartChanges = async(event) => {
    event.preventDefault()
    
    // Serial Number Change
    if(currentItem.lot_number !== manageCartItems.serialNumber && currentItem.is_serialized === 1){
      const hasLotNumber = Object.values(product_lists).some(tab => tab.productData.some(product => product.lot_number === manageCartItems.serialNumber))
      const productLots = currentItem.lots.find(lot => lot.lot_number === manageCartItems.serialNumber)

      if(hasLotNumber){
        setManageCartItemsError((prev) => ({ ...prev, serialNumber: 'Lot Number already in use' }))
        return;
      }
      else if(!productLots){
        setManageCartItemsError((prev) => ({ ...prev, serialNumber: 'Please enter the correct serial number' }))
        return;
      }
      else{
        dispatch(changeSerialNumberForProduct({item_id: manageCartItems.item_id, newLotNumber: manageCartItems.serialNumber, oldLotNumber: currentItem.lot_number}, props.posId))
      }
    }
    else{
      setManageCartItemsError((prev) => ({ ...prev, serialNumber: null }))
    }


    // Quantity Change

    const existingQuantityCheck = pre_order_status ? currentItem.quantity : currentItem.is_serialized === 1 ? list.filter(e => e.item_id === manageCartItems.item_id && e.lot_number === currentItem.lot_number).length : currentItem.quantity
    if(parseInt(existingQuantityCheck) !== parseInt(manageCartItems.quantity) && parseInt(existingQuantityCheck) < parseInt(manageCartItems.quantity)){
      let countToBeInserted = parseInt(manageCartItems.quantity) - list.filter(e => e.item_id === manageCartItems.item_id).length
      if(countToBeInserted !== 0){
        if(currentItem.is_serialized === 1){
          const existingLotNumber = list.filter(l => l.item_id === manageCartItems.item_id)?.map(e => e.lot_number)
          const insertingLots = manageCartItems.lots.filter(e => !existingLotNumber.includes(e.lot_number))
          let lotIndex = 0
          while(countToBeInserted !== 0){
            if (pre_order_status) {
              const data = { ...currentItem }
              await dispatch(PushPreOrderItems({...data}, props.posId));
            } else {
              const data = { ...currentItem, lot_number: insertingLots[lotIndex].lot_number }
              await dispatch(PushProductList({...data}, props.posId));
            }
            countToBeInserted--
            lotIndex++
          }
        }
        else{
          let lotIndex = 0
          while(countToBeInserted !== 0){
            const data = { ...currentItem }
            if (pre_order_status) {
              await dispatch(PushPreOrderItems({...data}, props.posId));
            } else {
              await dispatch(PushProductList({...data}, props.posId));
            }
            countToBeInserted--
            lotIndex++
          }
        }
      }
    }
    else if(existingQuantityCheck !== parseInt(manageCartItems.quantity) && existingQuantityCheck > parseInt(manageCartItems.quantity)){
      let countToBeRemoved =  pre_order_status ? currentItem.quantity - parseInt(manageCartItems.quantity) : currentItem.is_serialized === 1 ? list.filter(e => e.item_id === manageCartItems.item_id).length - parseInt(manageCartItems.quantity) : currentItem.quantity - parseInt(manageCartItems.quantity)
      if(countToBeRemoved !== 0){
        const existingLotNumber = list.filter(l => l.item_id === manageCartItems.item_id).map(e => e.lot_number)
        const removedLotNumber = existingLotNumber.splice(-countToBeRemoved)
        if (pre_order_status) {
          await dispatch(removeItemsInPreOrder({lotNumbers: removedLotNumber, item_id: manageCartItems.item_id, currentQuantity: currentItem.quantity - countToBeRemoved}, props.posId));
        } else {
          await dispatch(removeItemsBasedLotNumbers({lotNumbers: removedLotNumber, item_id: manageCartItems.item_id, currentQuantity: currentItem.is_serialized ? currentItem.quantity - countToBeRemoved : parseInt(manageCartItems.quantity), is_serialized: manageCartItems.is_serialized}, props.posId))
        }
      }
    }
    
    // Price Change
    let price = 0
    const unitPrice = parseFloat(currentItem.isTaxIncluded ? (currentItem.selling_price ?? currentItem.unit_price) : (currentItem.selling_price ?? currentItem.unit_price) + ((currentItem.selling_price ?? currentItem.unit_price) * getIgst(currentItem)) / 100).toFixed(2)
    
    if(parseFloat(manageCartItems.price).toFixed(2) !== unitPrice){
      price = parseFloat(manageCartItems.price).toFixed(2)
    }
    else{
      price = unitPrice
    }
    
    await dispatch(changePriceAndDiscount({price: price, item_id: manageCartItems.item_id, isSerialized: currentItem.is_serialized, pre_order_status: pre_order_status, lot_number: currentItem.lot_number}, props.posId))

    setManageDialogOpen(false)
  }

  const handleRemoveItem = async() => {
    if (pre_order_status) {
      await dispatch(deleteItemInPreOrder(manageCartItems.item_id, props.posId));
    } else {
      await dispatch(deleteItem({item_id: manageCartItems.item_id, isSerialized: currentItem.is_serialized, lot_number: currentItem.lot_number}, props.posId))
    }
    setManageDialogOpen(false)
  }

  return (
    <>
      <style>
        {`
          .groupDiv {
            width: 100%;
            margin-top: 10px;
            margin-bottom: 10px;
            background-color: rgba(0, 0, 0, 0.1);
            padding: 10px;
            cursor: pointer;
            position: relative;
            box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.2);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .groupDiv:hover {
            transform: scale(1.05);
            box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.3);
          }
        `}
      </style>
      <div
        style={{
          maxHeight: 'calc(100% - 65px)',
          display: list.length ? '' : 'none',
          overflow: 'auto',
          paddingLeft: 15,
          paddingRight: 15
        }}
      >
        {list.map((d, i) => (
          <Grid
            key={i}
            container
            onClick={(e) => handleClick(d,i)}
            className='groupDiv'        
          >
            <Grid
              size={{
                lg: 8,
                md: 8,
                sm: 8,
                xs: 8
              }}>
              <Typography
                style={{
                  fontWeight: '600',
                  position: 'relative',
                  alignContent: 'center',
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  color: theme.palette.primary.main,
                  fontSize: '13px'
                }}
              >
                {d.name}
              </Typography>

              {
                d.lot_number && (
                  <Typography style={{margin: '0', fontSize: '13px'}}>
                    {`Serial No: ${d.lot_number}`}
                  </Typography>
                )
              }

              <Typography style={{margin: 0}}>{`Unit Price: ${
                d.stock_type === 1
                  ? d.isTaxIncluded ? d.unit_price : qtytax(d.selling_price, d.unit_price, getIgst(d))
                  : d.selling_price
                  ? d.selling_price
                  : d.max_price
              }`}</Typography>

              {
                d?.taxes?.length > 0 &&
                <Typography style={{margin: 0, fontSize: '13px'}}>
                  {`Includes ${d.taxes[0].tax_category}`}
                </Typography>
              }
            </Grid>

            <Grid
              size={{
                lg: 4,
                md: 4,
                sm: 4,
                xs: 4
              }}>
              <Grid container>
                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <Typography style={{margin: '0 0 0 auto', fontWeight: '600', fontSize: '13px', textAlign: 'end'}}>
                    {d.stock_type === 1
                      ? d.isTaxIncluded ? `${d.unit_price} ₹` :`${singleTax(
                          d.quantity,
                          d.unit_price,
                          getIgst(d),
                          d.discount,
                          d.selling_price,
                          d.discount_type,
                        )} ₹`
                      : `${
                          d.selling_price
                            ? d.quantity * d.selling_price
                            : d.quantity * d.max_price
                        } ₹`}
                  </Typography>
                </Grid>

                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <Typography style={{margin: '0 0 0 auto', fontWeight: '600', fontSize: '13px', textAlign: 'end'}}>
                    {`${d.quantity || 1 } ${d.unit || 'nos'}`}
                  </Typography>
                </Grid>
              </Grid>

            </Grid>

            {d.discount ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'rgba(0,0,0,0.5)',
                }}
              >
                <Typography style={{margin: '0', fontWeight: 'bold'}}>
                  Discount
                </Typography>
                <Typography
                  style={{margin: '0 0 0 auto', fontWeight: 'bold'}}
                >{`${d.discount || 0} ${
                  d.discount_type === 0 ? '%' : '₹'
                }`}</Typography>
              </div>
            ) : (
              ''
            )}
          
          </Grid>
        )
        )}
      </div>
      {list.length ? (
        <div style={{display: 'flex', margin: '0 10px 0 0'}}>
          <div style={{marginLeft: 'auto', textAlign: 'center'}}>
            <hr />
            <Typography style={{ margin: 0, fontWeight: '600', fontSize: '13px' }}>
              {`Sub Total: ₹${roundedOffEnabled === 'true' ? Math.round(totalCost(list, 'noDiscount')) : totalCost(list, 'noDiscount').toFixed(2)}`}
            </Typography>
            {
              discount !== undefined && discount?.amount !== 0 &&
              <Typography style={{margin: 0, fontSize: '13px'}}>
                {`Discount: -${discount.amount.toFixed(2)} ₹`}
              </Typography>
            }
            <Typography style={{ margin: 0, fontSize: '13px' }}>
              {`(Tax Included: ${Number.isFinite(taxForCommonDiscount(list, discount))
                  ? taxForCommonDiscount(list, discount).toFixed(2)
                  : '0'
                } ₹)`}
            </Typography>

          </div>
        </div>
      ) : (
        ''
      )}
      {!list.length && (
        <div style={{height: '100%', display: 'flex'}}>
          <div
            style={{
              textAlign: 'center',
              color: 'rgba(0,0,0,0.5)',
              margin: 'auto',
            }}
          >
            <LocalGroceryStoreIcon style={{fontSize: '5rem'}} />
            <h2 style={{margin: 0}}>List is empty</h2>
          </div>
        </div>
      )}
      {/* <Button
        variant="contained"
        color="primary"
        onClick={handleExportReceipt}
      >
        Download Receipt
      </Button> */}
      <Dialog open={manageDialogOpen && list.length > 0} maxWidth='sm' fullWidth onClose={() => setManageDialogOpen(false)}>
        <DialogTitle sx={{ paddingTop: 3, paddingBottom: 2, paddingRight: 2 }}>
          <Grid container sx={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '' }}>
            <Grid sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant='h6'>
                Edit Item
              </Typography>
            </Grid>

            <Grid>
              <IconButton aria-label='close' onClick={() => setManageDialogOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Grid>
          </Grid>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={4}>
            <Grid
              size={{
                lg: 5,
                md: 5,
                sm: 5,
                xs: 5
              }}>
              <Box>
                <Grid container>
                  <Grid
                    sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                    }}>
                    <CardMedia
                      component="img"
                      image={manageCartItems?.image?.length > 0 ? `${manageCartItems.image[0]}` : 'img.png'}
                      // alt={manageCartItems?.name}
                      sx={{ width: '180px', height: '180px', objectFit: 'cover' }}
                    />
                  </Grid>

                  <Grid
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                    }}>
                    <Typography>{manageCartItems?.name}</Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            <Grid
              sx={{ display: 'flex', alignItems: 'center' }}
              size={{
                lg: 7,
                md: 7,
                sm: 7,
                xs: 7
              }}>
              <Grid container spacing={3}>
                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <TextField
                    variant="filled"
                    label="Quantity"
                    type='number'
                    value={manageCartItems.quantity}
                    fullWidth
                    onChange={(event) => currentItem.is_serialized === 1 || currentItem.stock_type === 0 ? event.preventDefault() : setManageCartItems((prev) => ({...prev, quantity: event.target.value}))}
                    error = {!props.pre_order_status && manageCartItems.quantity > currentItem.received_quantity}
                    helperText = {!props.pre_order_status && manageCartItems.quantity > currentItem.received_quantity ? `Available Quantity : ${currentItem.received_quantity}` : ''}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconButton disabled={manageCartItems.quantity === '1'} onClick={() => setManageCartItems((prev) => ({...prev, quantity: `${parseInt(prev.quantity) - 1}`}))}>
                            <RemoveIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton disabled={ !props.pre_order_status ? currentItem.is_serialized === 1 ? true : currentItem.received_quantity === parseInt(manageCartItems.quantity) : false} onClick={() => setManageCartItems((prev) => ({...prev, quantity: `${parseInt(prev.quantity) + 1}`}))}>
                            <AddIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    inputProps={{
                      style: { textAlign: "center" }, // Centers the text inside the input field
                    }}
                    sx={{
                      "& .MuiFilledInput-root": {
                        padding: "0", // Adjust padding to align text and icons properly
                      },
                      "& .MuiInputBase-input": {
                        textAlign: "center", // Center-aligns the value
                      },
                    }}
                  />
                </Grid>

                {
                  (storage.role_name === 'Administrator' || posDiscountByPOSId.length > 0 && posDiscountByPOSId[0]?.allow_price_change === 1) &&
                  <Grid
                    size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                    }}>
                    <TextField
                      variant='filled'
                      type='number'
                      label='Price'
                      value={manageCartItems.price}
                      fullWidth
                      onChange={(event) => setManageCartItems((prev) => ({ ...prev, price: event.target.value === '' ? 0 : event.target.value }))}
                    />
                  </Grid>
                }

                {
                  (currentItem.is_serialized === 1) &&
                  <Grid
                    size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                    }}>
                    <TextField
                      variant='filled'
                      type='number'
                      label='Serial Number'
                      value={manageCartItems.serialNumber}
                      fullWidth
                      onChange={(event) => setManageCartItems((prev) => ({ ...prev, serialNumber: event.target.value }))}
                      error={manageCartItemsError.serialNumber !== null}
                      helperText={manageCartItemsError.serialNumber}
                    />
                  </Grid>
                }

                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <Grid container sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Grid>
                      <Button color='error' onClick={() => handleRemoveItem()} sx={{ textAlign: 'center' }}>
                          <DeleteOutlineIcon fontSize='small' /> &nbsp; {'Remove Item '}
                      </Button>
                    </Grid>

                    <Grid>
                      <Grid container spacing={2}>
                        <Grid>
                          <Button variant='contained' color='error' onClick={() => setManageDialogOpen(false)}>Cancel</Button>
                        </Grid>

                        <Grid>
                          <Button variant='contained' onClick={handleCartChanges} disabled={!props.pre_order_status && manageCartItems.quantity > currentItem.received_quantity}>Save</Button>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            
          </Grid>
        </DialogContent>

        {/* <DialogActions>
        </DialogActions> */}
      </Dialog>
    </>
  );
}
