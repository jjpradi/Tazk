import React, {useEffect, useState, useRef} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Summary from './Summary';
import Typography from '@mui/material/Typography';
import DB from '../../../db';
import TextField from '@mui/material/TextField';
// import {formLabelsTheme} from "../../Asterisk";
import {createTheme} from '@mui/material/styles';
// import ReactToPrint from "react-to-print";
import {useReactToPrint} from 'react-to-print';
// import PrintIcon from '@mui/icons-material/Print';
import PrintContent from './printContent';

export const formLabelsTheme = createTheme({
  overrides: {
    MuiFormLabel: {
      asterisk: {
        color: '#db3131',
        '&$error': {
          color: '#db3131',
        },
      },
    },
  },
});

export default function AlertDialog({
  open,
  handleClose,
  validate,
  Data,
  posId,
  remarks,
  date,
  s_id,
  checkOfflines,
  lastSyncUpdate,
  pos_session,
  status,
  setMoreClick,
  viewSummary,
  active,
  hide,
}) {
  const [formdata, setFormData] = useState({remarkname: ''});
  const [formErrors, setFormErrors] = useState({remarkname: null});
  const [requiredFields] = useState(['remarkname']);
  const [isnet, setnet] = useState(window.navigator.onLine);
  const {data: offlineData, balance} = Data[`offline_${posId}`] || {};
  // const [reqdate, setReqdate] = useState(false)
  const online = () => setnet(true);
  const offline = () => setnet(false);
  const tempcheck = useRef(null);
  // const [display, setDisplay] = useState(false);

  // let componentRef
  const componentRef = useRef(null);

  useEffect(() => {
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);

    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  var db = new DB('pos_session');
  const [Tdata, setTdata] = useState([]);
  const [PSData, setPSData] = useState([]);
  const [Click, setClick] = useState(false);
  const [OrderClick, setOrderClick] = useState(false);
  const [CashBoxClick, setCashBoxClick] = useState(false);

  const closeUpdate = () => {
    setFormErrors({
      ...formErrors,
      ['remarkname']: status === 'close' ? null : 'Remarks is Required!',
    });
  };

  const handleChange = async (name, value, date) => {
    // let {  value } = e.target;
    // setFormData({ ...formdata, name: value })
    setStateHandler(name, value);
    if (value !== null && '') {
      //  setdisab(false)
    }
  };

  // const handleClick = (date) => {

  //   if (date === new Date().toISOString().slice(0, 10)) {
  //     setReqdate(true)
  //     handleClose();
  //   } else {
  //    setReqdate(false)

  //   }

  // }

  const setStateHandler = async (name, value) => {
    let formObj = {};

    formObj = {
      ...formdata,
      [name]: value,
    };
    await setFormData(formObj);
    validationHandler(name, value);
  };

  const validationHandler = (name, value) => {
    if (!Object.keys(formErrors).includes(name)) return;

    if (
      requiredFields.includes(name) &&
      (value === null ||
        value === 'null' ||
        value === '' ||
        value === false ||
        (Object.keys(value) && value.value === null))
    ) {
      setFormErrors({
        ...formErrors,
        [name]: 'Remarks is Required!',
      });
    } else {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  // const capitalize = (s) => {
  //     if (typeof s !== "string") return "";
  //     return s.charAt(0).toUpperCase() + s.slice(1);
  // };

  // const errorHandaler = () => {

  //   if (formdata.remarkname === null || '') {
  //       setFormErrors({ ...formErrors, remarkname: true })

  //   }

  // }

  const check = async () => {
    if (offlineData) {
      const marr = [];
      const mobj = {};
      const varr = [];

      const {paymentModes} = (await db.getAllCheckouts(posId)) || {};
      const modes = paymentModes
        ? paymentModes.map((d) => `${d.paymentName} (INR)`)
        : [];

      const arr = offlineData.map((d, i) => {
        const {
          customer_name,
          sales_payment,
          sales_items,
          invoice_number,
          amount,
        } = d;
        sales_payment.forEach((nd) => {
          let cash_adjustment =
            nd.cash_adjustment !== '' ? nd.cash_adjustment : 0;
          mobj[nd.payment_type] = mobj[nd.payment_type]
            ? (mobj[nd.payment_type] =
                mobj[nd.payment_type] + nd.payment_amount - cash_adjustment)
            : nd.payment_amount - cash_adjustment;
        });

        return {
          sales_order: i + 1,
          customer_name,
          sales_payment,
          amount,
          invoice_number,
          total_products: sales_items.length,
          sales_items,
        };
      });

      for (let key in mobj) {
        const newobj = {};
        newobj.payment_type = key;
        newobj.payment_amount = mobj[key];
        marr.push(newobj);
        varr.push(key);
      }

      const filmodes = modes.filter((item) => !varr.includes(item));

      filmodes.forEach((dd) => {
        const newobj = {};
        newobj.payment_type = dd;
        newobj.payment_amount = 0;
        marr.push(newobj);
      });
      setPSData(marr);
      setTdata(arr);
    }
  };
  tempcheck.current = check;

  useEffect(() => {
    tempcheck.current();
  }, [offlineData]);

  const rupees = (x) => {
    // x = x.toString();
    // let lastThree = x.substring(x.length - 3);
    // const otherNumbers = x.substring(0, x.length - 3);
    // if (otherNumbers !== '') lastThree = ',' + lastThree;
    // const res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
    const res = x.toLocaleString("en-IN");
    return res;
  };

  const sync = async (e) => {
    let isValid = true;
    let formErrorsObj = {...formErrors};
    await Object.keys(formdata).map((key, i) => {
      //  let isValid
      if (
        requiredFields.includes(key) &&
        (formdata[key] === null || formdata[key] === '')
      ) {
        isValid = false;
        formErrorsObj[key] = 'Remarks is Required!';
      }
      return null;
    });
    await setFormErrors(formErrorsObj);
    //  alert("Remark Required - " + isValid);
    if (isValid) {
      // setFalse(false)
      validate(formdata.remarkname);
      handleClose();
    }
    //  const newData = {closingDate: new Date().toISOString().slice(0, 10), status: 'closed'}
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });


  return (
    <div>
      <Dialog
        open={open}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        maxWidth='lg'
      >
        <DialogContent>
          {/* {remarks ? (
            <>
              <img
                style={{width: '350px', height: '205px'}}
                src='nosale.png'
                alt=''
              />
              <br />
            </>
          ) : */}
           
            <Summary
              pos_session={pos_session}
              checkOfflines={checkOfflines}
              lastSyncUpdate={lastSyncUpdate}
              s_id={s_id}
              Tdata={Tdata}
              isnet={isnet}
              PSData={PSData}
              posId={posId}
              active={active}
            />
          
          <div style={{display: 'none'}}>
            {/* <div ref={el => (componentRef = el)} >   */}
            <div ref={componentRef}>
              <PrintContent
                isnet={isnet}
                Tdata={Tdata}
                PSData={PSData}
                posId={posId}
                Click={Click}
                setClick={setClick}
                CashBoxClick={CashBoxClick}
                OrderClick={OrderClick}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          {remarks === false ? (
            <>
              <Typography sx={{mr: 'auto', ml: 2}} variant='h6' component='div'>
                {`Total: ${rupees(balance || '')} ₹`}
              </Typography>
              {!isnet ? (
                <Typography
                  variant='caption'
                  component='div'
                  sx={{mr: 2, color: 'red'}}
                >
                  you can't validate when you are in offline
                </Typography>
              ) : (
                ''
              )}
              {/* <ReactToPrint
                // onAfterPrint={() => props.setpoStatus && props.setpoStatus(true)}
                trigger={() => <Button color='primary'> Print Summary</Button>}
                content={() => componentRef}
                onBeforeGetContent={() => {setClick(true);setCashBoxClick(true);setOrderClick(true);}}
                // onAfterPrint={() => setDisplay(false)}
              /> */}

              <Button
                color='primary'
                onClick={() => {
                  setClick(true);
                  setCashBoxClick(true);
                  setOrderClick(true);
                  setTimeout(() => {
                    handlePrint();
                  }, 1000);
                }}
              >
                {' '}
                Print Summary
              </Button>

              <Button
                onClick={() => {
                  handleClose();
                  setMoreClick(false);
                }}
                color='secondary'
              >
                Cancel
              </Button>
              <Button
                sx={{mr: 1}}
                color='primary'
                disabled={viewSummary || !isnet}
                onClick={() => {
                  validate();
                  handleClose();
                  setMoreClick(false);
                }}
              >
                Validate
              </Button>
            </>
          ) : (
            <>
              {/* <TextField fullWidth id="remarks-field" name='accountNo' variant='outlined' size='small' onChange={handleChange}  label="Remarks" multiline maxRows={1}/> */}
              {!hide && (
                <TextField
                  fullWidth
                  id='standard-basic'
                  size='small'
                  style={{}}
                  required={true}
                  label='Remarks'
                  onChange={(e) => {
                    handleChange('remarkname', e.target.value);
                  }}
                  onBlur={(e) => {
                    handleChange(
                      'remarkname',
                      e.target.value ? e.target.value : null,
                    );
                  }}
                  variant='outlined'
                  name='farmValue'
                  error={formErrors.remarkname === null ? false : true}
                  helperText={
                    formErrors.remarkname === '' ? '' : formErrors.remarkname
                  }
                  multiline
                  maxRows={1}
                />
              )}
              <Button
                onClick={() => {
                  handleClose();
                  closeUpdate();
                  setMoreClick(false);
                }}
                color='secondary'
              >
                Cancel
              </Button>
              <br />
              <br />
              {!hide && (
                <Button
                  sx={{mr: 1}}
                  color='primary'
                  disabled={viewSummary}
                  onClick={() => {
                    sync();
                    setMoreClick(false);
                  }}
                >
                  Validate
                </Button>
              )}
            </>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}
