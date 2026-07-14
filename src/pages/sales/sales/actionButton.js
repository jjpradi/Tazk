import React, {useContext, useEffect, useRef, useState} from 'react';
import {Button} from '@mui/material';
import ButtonGroup from '@mui/material/ButtonGroup';
// import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
// import ClickAwayListener from '@mui/material/ClickAwayListener';
// import Grow from '@mui/material/Grow';
// import Paper from '@mui/material/Paper';
// import Popper from '@mui/material/Popper';
// import MenuItem from '@mui/material/MenuItem';
// import MenuList from '@mui/material/MenuList';
import InvoiceDialog from './InvoiceDialog';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { useDispatch } from 'react-redux';
import { createSalesApproval } from 'redux/actions/sales_actions';
import { now } from 'lodash';
import { normalizeQuantity } from 'pages/sales/sales/sale_status_list';

// const options = ['Invoice &'];

export default function SplitButton(props) {
  // console.log("props.shipping_address",props.shipping_address)
  // const [open, setOpen] = React.useState(false);
  const {invoicelayout,setinvoicelayout}=props
  const [Dopen, setDopen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const tempinitsform = useRef(null);
  const [disable, setDisable] = useState(false);
  const [salesRequest,setSalesRequest] = useState(false)
  const dispatch = useDispatch()
  // const [selectedIndex, setSelectedIndex] = React.useState(0);

  const {soDialogOpenStatus} = useContext(CreateNewButtonContext); //,setSoDialogOpenHandler
  const handleClick = (e) => {
    if(props.approvalRequest){
      setSalesRequest(true)
    }
    if(props.status === 'Approved'){
      const payload = {
        type : 'Update',
        is_ordered : 1,
        customer_id : props.customer_id
      }
      dispatch(createSalesApproval(payload))
    }
    let checkEachBarcodeWasEntered = props.checkEachBarcodeWasEntered(
      props.sales_items,
    );
    // let checkEachBarcodeWasEnteredForSaleOrder = props.checkEachBarcodeWasEnteredForSaleOrder(props.sales_items)
    if (props.customer_id === null) {
      props.handleSubmit(setDisable);
    } else if (props.dc_number === 'undefined' && props.invoice === null || typeof props.invoice === 'undefined') {
      alert('Invoice Number Cannot Null');
    } else if (props.sale_status === 1) {
      props.handleSubmit(setDisable);
    } else if (props.sale_status === 2 || props.sale_status === 8) {
      // if(props.soNumber && props.sale_status === 2){
      //    if (checkEachBarcodeWasEnteredForSaleOrder === 'allEntered') {
      //     props.handleSubmit(setDisable);
      //   } else {
      //     alert('Please Enter Barcode All Items');
      //   }
      // } else{
        if (checkEachBarcodeWasEntered === 'allEntered' || ((props.pageType === '/salesOrders' || props.pageType === '/deliveryChallan') && props.formStatus === 'edit')) {
          props.handleSubmit(setDisable);
        } else {
          alert('Please Enter Barcode All Items');
        }
      // }
     
    } else 
    if (props.sale_status === 7){
      props.handleSubmit(setDisable)
    }
    else if (props.sale_status) {
      props.handleSubmit(setDisable);
    }
  };

  // const handleMenuItemClick = (event, index) => {
  //   setSelectedIndex(index);
  //   setOpen(false);
  //   handleClick(index)
  // };

  // const handleToggle = () => {
  //   setOpen((prevOpen) => !prevOpen);
  // };

  //   setOpen(false);
  // };
  // useEffect(()=>{
  //   if(soDialogOpenStatus &&props.sale_status===1||props.sale_status ===2 || props.sale_status===6){
  //    setDopen(true)
  //   }
  // },[soDialogOpenStatus])

  function formatDate(dateStr) {
    // Split the date and time
    const [datePart] = dateStr.split(" "); // Get only the date part
    return datePart; // Return the date part in YYYY-MM-DD format
  }
  


  useEffect(()=>{

    if(salesRequest === true){
     const payload = [{
       data :{
        customer_id : props?.custData?.customer_id,
        credit_value : props?.custData?.credit_value,
        date : formatDate(props?.soDate),
        status  :  'Pending',
        request_type : 'Sales',
        so_number : props?.invoice,
        sales_items : JSON.stringify(props.sales_items),
        is_ordered : 0,
        total : props?.total

      },

       data1 : {
        customer_id : props?.custData?.customer_id,
        tot_amount : props?.total,
        req_date : new Date(),
        status  :  'Pending',
        request_type : 'Sales'
      }
     }]
  
      dispatch(createSalesApproval(payload[0]))
      setSalesRequest(false)
      // props.handleClose()
    }
  },[salesRequest])

  const initsform = () => {

    if (
      (soDialogOpenStatus && props.sale_status === 1) ||
      (soDialogOpenStatus && props.sale_status === 2) ||
      props.sale_status === 6
    ) {
      // setDopen(true);
    }
  };
  tempinitsform.current = initsform;
  useEffect(() => {
    tempinitsform.current();
  }, [soDialogOpenStatus]);


  //   setOpen(false);
  // };

  // console.log("props.sales_items",props.invoiceButtonDisable)

  return (
    <React.Fragment>
      <InvoiceDialog
        appConfigData={props.appConfigData}
        addNote={props.addNote}
        note={props.note}
        createMail={props.createMail}
        custType={props.custType}
        custData={props.custData}
        invoice={props.invoice}
        soDate={props.soDate}
        soNumber={props.soNumber}
        sales_items={props.sales_items}
        open={Dopen}
        handleSubmit={props.handleSubmit}
        handleClose={() => props.handleClose()}
        sale_status={props.sale_status}
        posSale={
          props.sale_status === 2 || props.sale_status === 6 ? true : false
        }
        mail_configuration={props.mail_configuration}
        handleNewopen = {() => props.handleNewopen() }
        tcs={props.tcs}
        tds={props.tds}
        tcspercent={props.tcs_percent}
        tdspercent={props.tds_percent}
        tds_value={props.tds_value}
        shipping_details={props.shipping_details}
        isRoundedOffNegative={props?.isRoundedOffNegative || 0}
        rounded_off={props?.rounded_off || 0}
      />

      <ButtonGroup
        color='primary'
        ref={anchorRef}
        aria-label='split button'
        disabled={
          props.sales_items?.length === 0 ||
          props?.status === 'Pending' ||
          disable ||
          !props.customer_id ||
          props.sales_items.some((s) =>
            s.name === '' ||
            normalizeQuantity(s.item_unit_price) === 0 ||
            normalizeQuantity(s.quantity) <= 0
          )
        }
      >
        <Button
          variant='contained'
          color='primary'
          onClick={(e) => {
            handleClick(e);
            if (typeof setinvoicelayout === 'function') {
              setinvoicelayout(false);
            }
          }}
          disabled={props.sale_status === 2 && props.invoiceButtonDisable}
        >
          {
            props?.status === 'Pending' ? 'Waiting For Approval' :
            ((props.sale_status === 1 ) && props?.approvalRequest) ?'Request Approval' : 
            props.sale_status === 1
            ? 'SAVE & SEND SO'
            : (props.sale_status === 2 || props?.status === 'Approved') 
            ? 'Create Invoice'
            : props.sale_status === 6
            ? 'SAVE'
            : props.sale_status === 8 
            ? 'SAVE DC' : props.sale_status === 7 
            ? 'Cancel'
            : 'SAVE' }
        </Button>
      </ButtonGroup>

      {/* <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="sales-action-split-button-menu">
                  {options.map((option, index) => (
                    <MenuItem
                      disabled={index === 1 && !props.sales_items.length}
                      key={option}
                      selected={index === selectedIndex}
                      onClick={(event) => handleMenuItemClick(event, index)}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper> */}
    </React.Fragment>
  );
}
