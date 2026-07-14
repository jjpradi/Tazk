import React, {useState, useEffect, useRef, useContext} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CustTable from './CustTable';
import Customer from '../../sales/customer';
import { useDispatch, useSelector } from 'react-redux';
import { listCustomerAction, listPickCustomerAction } from 'redux/actions/customer_actions';
import Context from '../../../context/CreateNewButtonContext';

export default function AlertDialog(props) {
  const dispatch = useDispatch()
  const {
    customerReducer: { pickCustomer },
  } = useSelector((state) => state);

  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
    commoncookie,
  } = useContext(Context);
  const [newCust, setnewCust] = useState(false);
  const [selectData, setData] = useState({customer: false});
  // const [pageCount, setPageCount] = useState(0)
  // const [pageSize, setPageSize] = useState(100)
  const [leadsgender] = useState(false);
  const tempselectcust = useRef(null);

  const setselectData = (data, type) => {
    setData({...selectData, [data]: type});
  };

  const selectcust = () => {
    if (selectData.customer) {
      const filter = [...pickCustomer];
      const pop = filter.shift();
      props.setone(pop);
      props.handleClose();
      setselectData('customer', false);
    }
  };
  tempselectcust.current = selectcust;
  useEffect(() => {
    tempselectcust.current();
  }, [selectData.customer]);

  // useEffect(() => {
  //   const data = {
  //     pageCount: pageCount,
  //     numPerPage: pageSize
  //   }
  //   // dispatch(listCustomerAction(setModalTypeHandler, setLoaderStatusHandler))
  //   dispatch(listPickCustomerAction(data, true, setLoaderStatusHandler))
  // }, [pageCount, pageSize]);

  // const handlePageChange = async (page) => {
  //   setPageCount(page);
  // }

  // const handlePageSizeChange = async (size) => {
  //   setPageSize(size);
  // };

  return (
    <div>
      <Dialog
        fullWidth
        maxWidth='lg'
        open={props.open}
        onClose={() => props.handleClose()}
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
              handleLeadsClose={setnewCust}
              setselectData={setselectData}
              modalStatus={newCust}
              iswidth={true}
              leadsgender={leadsgender}
              type={"leads"}
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
