import React, {useState, useEffect, useRef} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CustTable from './CustTable';
import Customer from '../../../pages/sales/customer';

export default function AlertDialog(props) {
  const [newCust, setnewCust] = useState(false);
  const [selectData, setData] = useState({NewCustomer: false});
  const tempselectcust = useRef(null);
  // const [pointofsale, setPointofsale] = (true)

  const setselectData = (data, type) => {
    setData((prev) => ({...prev, [data]: type}));
  };
  const selectcust = () => {
    if (selectData.NewCustomer) {
      const customers = Array.isArray(props.customer) ? [...props.customer] : [];
      const latestCustomer = selectData.NewCustomerData || customers.reduce((latest, current) => {
        if (!latest) return current;
        const latestId = Number(latest.customer_id || latest.id || 0);
        const currentId = Number(current.customer_id || current.id || 0);
        return currentId > latestId ? current : latest;
      }, null);

      if (latestCustomer) {
        props.setone(latestCustomer);
      }
      props.handleClose();
      setselectData('NewCustomer', false);
      setselectData('NewCustomerData', null);
    }
  };
  tempselectcust.current = selectcust;
  useEffect(() => {
    tempselectcust.current();
  }, [selectData.NewCustomer, props.customer]);


  return (
    <div>
      <Dialog
        fullWidth
        maxWidth='lg'
        sx={{
          px: 6,
          pb: 0,
          '& .MuiDialogContent-root': {
          overflowX: 'hidden'
          },
         
          
        }}
        open={props.open}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogContent>
          {!newCust ? (
            <CustTable
              setnewCust={setnewCust}
              handleClose={props.handleClose}
              setone={props.setone}
              handlePageChange={props.handlePageChange}
              handlePageSizeChange={props.handlePageSizeChange}
              pageSize={props.pageSize}
              pageCount={props.pageCount}
            />
          ) : (
            <Customer
              setModalStatusHandler={setnewCust}
              setselectData={setselectData}
              modalStatus={newCust}
              iswidth={true}
              pointofsale ={true}
              location_id={props.location_id}
              // pointofsaleopen = {props.handleClose}
         
            />
          )}
        </DialogContent>
        <DialogActions style={{display: !newCust ? '' : 'none'}}>
          <Button
            onClick={(e) => {
              props.handleClose();
              props.setone({});
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={props.handleClose}
            disabled={Object.keys(props.one).length ? false : true}
            autoFocus
          >
            Select
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
