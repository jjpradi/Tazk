import React from 'react';
import Dialog from '@mui/material/Dialog';
import Customer from '../pages/sales/customer';
import TaxCategory from '../pages/sales/taxCategory';
import Supplier from '../pages/sales/vendor';
import Product from '../pages/sales/product';
import Vendor from '../pages/sales/vendor';
import TaxCodes from '../pages/sales/taxCodes';
import TaxJurisdiction from '../pages/sales/taxJurisdiction';
import StockLocation from '../pages/common/stockLocation';
import Inventory from '../pages/sales/inventory';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import NewCashBox from '../pages/accounts/cashBoxCreation';
import NewPaymentMethod from '../pages/sales/paymentmethods';
import BarcodeDialog from '../pages/sales/sales/barcodeDialog';
import PreOrderList from '../pages/pointofsale/pointOfsale/pre_orders_list';
import DiscountType from '../pages/sales/discountType/index';
import OutOfStockDialog from '../pages/pointofsale/pointOfsale/preorder_qty_dialog';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';

export default function AlertDialog(props) {
  const {
    type,
    modalStatus,
    setModalStatusHandler,
    setselectData,
    loaderStatus,
    selectData,
    editProduct,
    editCustomer,
    open
  } = props;
 
  const navigate = useNavigate();

  const handleBack = () => {
    setModalStatusHandler(false)
  };
  const renderSwitch = (type) => {
    switch (type) {
      case 'NewCustomer':
        return (
          <Customer
            modalStatus={modalStatus}
            setselectData={setselectData}
            setModalStatusHandler={setModalStatusHandler}
            type_id = {1}
            newcustomer_type = {'type:1'}
            salesCustomer={'salesCustomer'}
          />
        );
        case 'EditCustomer':
          return (
            <Customer
              modalStatus={modalStatus}
              setselectData={setselectData}
              setModalStatusHandler={setModalStatusHandler}
              type_id = {1}
              edit_id_data={editCustomer}
              newcustomer_type = {'type:1'}
              status='edit'
              editType='Sales'
            />
          );
        case 'NewserviceCustomer':
          return (
            <Customer
              modalStatus={modalStatus}
              setselectData={setselectData}
              setModalStatusHandler={setModalStatusHandler}
              type_id = {0}
              newcustomer_type = {'type:1'}
              modaltype={type}
            />
          );
      case 'NewTaxCategory':
        return (
          <TaxCategory
            setselectData={setselectData}
            setModalStatusHandler={setModalStatusHandler}
          />
        );
      case 'NewTaxCode':
        return (
          <TaxCodes
            setselectData={setselectData}
            setModalStatusHandler={setModalStatusHandler}
          />
        );
      case 'supplier':
        return   <Supplier setModalStatusHandler={setModalStatusHandler} />;
      case 'product':
        return (
          <Product
            isWidth={true}
            setselectData={setselectData}
            setModalStatusHandler={setModalStatusHandler}
          />
        );
      case 'updateProduct':
        return (
          <Product
            isWidth={true}
            setselectData={setselectData}
            setModalStatusHandler={setModalStatusHandler}
            edit_id_data={editProduct}
            status = 'edit'
          />
        );
      case 'NewVendor':
        return (
          // <Vendor
          //   setselectData={setselectData}
          //   setModalStatusHandler={setModalStatusHandler}
          // />
          <Customer
          modalStatus={modalStatus}
          setselectData={setselectData}
          setModalStatusHandler={setModalStatusHandler}
          type_id = {2}
          newcustomer_type = {'type:2'}
        />
        );
      case 'inventory':
        return (
          <Inventory
            setselectData={setselectData}
            setModalStatusHandler={setModalStatusHandler}
          />
        );
      case 'NewTaxJurisdiction':
        return (
          <TaxJurisdiction
            setselectData={setselectData}
            setModalStatusHandler={setModalStatusHandler}
          />
        );
      case 'NewStockLocation':
        return (
          <StockLocation
            setselectData={setselectData}
            setModalStatusHandler={setModalStatusHandler}
          />
        );
      case 'NewCashBox':
        return (
          <NewCashBox
            setselectData={setselectData}
            setModalStatusHandler={setModalStatusHandler}
          />
        );
      case 'NewPaymentMethod':
        return (
          <NewPaymentMethod
            setselectData={setselectData}
            setModalStatusHandler={setModalStatusHandler}
          />
        );
      case 'NewDiscountType':
        return (
          <DiscountType
            setselectData={setselectData}
            setModalStatusHandler={setModalStatusHandler}
          />
        );
        
      // case 'Loader':
      //     return <Backdrop loaderStatus={loaderStatus} />

      // case 'updateProject':
      //     return <NewProjectTemplate header={ UPDATE_PROJECT } type={type} setModalStatusHandler = {setModalStatusHandler} />
      // case 'copyProject':
      //     return <CopyProjectTemplate header={ COPY_PROJECT } type={type} setModalStatusHandler = {setModalStatusHandler} />
      // case 'getFielditem':
      //     return <GetFieldnameTemplate  type={type} setModalStatusHandler = {setModalStatusHandler}/>
      // case 'connection':
      //     return <ConnectionTemplate  header={ CONNECT_PROJECT } type={type} setModalStatusHandler = {setModalStatusHandler}/>
      case 'barCodeError':
        return (
          <BarcodeDialog
            setselectData={setselectData}
            selectData={selectData.barCodeError}
            setModalStatusHandler={setModalStatusHandler}
          />
        );

      case 'PreOrderList':
        return (
          <PreOrderList
            setselectData={setselectData}
            setModalStatusHandler={setModalStatusHandler}
          />
        );

      case 'outOfStock':
        return (
          <OutOfStockDialog
            setselectData={setselectData}
            selectData={selectData}
            setModalStatusHandler={setModalStatusHandler}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div>
        <Dialog
        maxWidth='lg'
        // fullScreen
        open={modalStatus}
        disableEnforceFocus={true}
        disablePortal={true}
        disableBackdropClick={true}
        // onClose={() => setModalStatusHandler(false)}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <div style={{display:'block',padding: '10px',pointerEvents: "auto"}}>{renderSwitch(type)}</div>
        {/* <Button variant="contained" color="primary" onClick={handleBack} style={{ margin: '5px' }}>
          Back
        </Button> */}
      </Dialog>
      <Backdrop
        sx={{color: '#fff', zIndex: 9999999}}
        open={loaderStatus}
        // onClick={handleClose}
      >
        <CircularProgress color='primary' />
        {/* <div style={{ padding: '20px' }} >{renderSwitch(type)}</div> */}
      </Backdrop>
    </div>
  );

  // style={{overflow:'hidden', position:'relative',top:-30}}
}
