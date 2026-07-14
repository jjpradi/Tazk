import React, {useEffect, useState, useRef, useContext} from 'react';
import {
  Button,
  TextField,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material/';
import {PostAdd, DeleteOutline, EditOutlined, CloseOutlined, DoneOutline, DoneOutlined} from '@mui/icons-material';
import debounce from 'lodash.debounce';
import {useCallback } from 'react';
import apiCalls from 'utils/apiCalls';
import context from '../../../context/CreateNewButtonContext';
import { useDispatch, useSelector } from 'react-redux';
import { getLotDetailsAction } from 'redux/actions/sales_actions';
import { ErrorAlert, errorAlertAction } from '../../../redux/actions/load';


export default function AlertDialog(props) {
  const {calledfrom = ''} = props
  const [filter, setfilter] = useState([0]);
  const [formValues, setformValue] = useState({});
  const [error, seterror] = useState(null);
  const [errorLots, setErrorLots] = useState({});
  const [countval, setcountval] = useState (0)
  const [lotNumber, setLotNumber] = useState('')
  const [index, setIndex] = useState(null)
  const [editData, setEditData] = useState(null)
  const tempinitsform = useRef(null);
  const [lotArray,setLotArray]=useState(false)
  const [validatedLots, setValidatedLots] = useState({});
  // console.log("lotArray",lotArray)

   const {
     commoncookie,
     setModalTypeHandler,
     setLoaderStatusHandler,
     headerLocationId,
   } = useContext(context);
       const {
        salesReducer:{lotDetails},
     } = useSelector((state) => state);

 const dispatch = useDispatch()
 


  useEffect(() => {
    if (props.row_id.open && props.row_id.data.lots?.length) {
      const makearr = [];
      for (let i = 0; i < props.row_id.data.lots.length; i++) {
        makearr.push(i);
      }
      


      const makeobj = {};
      makearr.forEach((d, i) => {
        makeobj[`text${i}`] = props.row_id.data.lots[i] || {};
      });
      const makeerr = {};
      makearr.forEach((d, i) => {
        makeerr[`text${i}`] = false;
      });
      makearr.push(props.row_id.data.lots.length)
      setformValue(makeobj);
      setcountval(Object.keys(makeobj).length)
      seterror(null);
      setfilter(makearr);
    }
  }, [props.row_id.open]);



  const handleChange = (e) => {
  const value = e.target.value;
  setLotNumber(value);

  if (value === "") {
    seterror("REQUIRED");
    return;
  }

  // // Dispatch debounced API call
  // debouncedAPIValidation(dispatch, {
  //   item_id: props.row_id.data.item_id,
  //   location_id: props.location_id,
  //   sale_id:props.sale_id,
  //   receiving_id:props.receiving_id
  // }, value);
};


// const debouncedAPIValidation = useRef(
//   debounce((dispatch, data, value) => {
//     const payload = {
//       item_id: data.item_id,
//       location_id: data.location_id,
//       lot_number: value
//     };

//     if (props.returnState === true) {
//       if (props.calledfrom === 'sales_return') {
//         payload.calledFrom = 'sales_return';
//         payload.sale_id = data.sale_id;
//       } else if (props.calledfrom === 'purchase_return') {
//         payload.calledFrom = 'purchase_return';
//         payload.receiving_id = data.receiving_id;
//       }
//     }
//     apiCalls(
//       setModalTypeHandler,
//       setLoaderStatusHandler,
//       dispatch(getLotDetailsAction(payload, (res) => {
//         // console.log("res", res)
//         if (res) {
//           // console.log("asdadad")
//           setLotArray(true)
//         }
//       })))
//   }, 600)
// ).current;






// useEffect(() => {
//   if(lotArray){
//     if (index === null && lotNumber && lotDetails) {
//       console.log("lotDetailslotDetails",lotDetails)
//     const apiLot = lotDetails.find(l => 
//       l.lot_number === lotNumber.toString() && lotcheck(l)
//     );
//     console.log("apiLot",apiLot)

//     const isDuplicate = Object.values(formValues).some(
//       entry => entry.lot_number === lotNumber
//     );

//     if (!apiLot || isDuplicate) {
//       seterror("INVALID"); 
//       setLotArray(false)
//     } else {
//       seterror(null);
//       setLotArray(false)
//     }
//   }
//   }
  
// }, [lotDetails, lotNumber, formValues, index,lotArray]);







  const handleup = (event) => {
    if (event.keyCode === 13) {
      event.preventDefault();
      addData('new');
    }
  };



const findUniq = (name, input, lotDetails = [], updatedFormValues) => {
  let lotvalid = {
    isvalid: true,
    lot_id: '',
    trans_items_cost_price: '',
    purchase_price: ''
  };

  const apiLot = lotDetails.find(l => 
    l.lot_number === input.toString() && lotcheck(l)
  );

  // console.log("apiLot",apiLot)

  if (apiLot) {
    lotvalid.isvalid = false;
    lotvalid.lot_id = apiLot.lot_id;
    lotvalid.trans_items_cost_price = apiLot.trans_items_cost_price;
    lotvalid.purchase_price = apiLot.purchase_price;
  }
  const lotValues = updatedFormValues ? updatedFormValues : formValues

  for (let key in lotValues) {
    const val = lotValues[key]
    if (key !== name && val.lot_number === input) {
      lotvalid.isvalid = true;
    }
  }
  // props.itemsData.forEach((d, inx) => {
  //   if (inx !== props.row_id.id) {
  //     d.lots.forEach((data) => {
  //       if (data.lot_number === input.toString()) {
  //         lotvalid.isvalid = true;
  //       }
  //     });
  //   }
  // });

  return lotvalid;
};


 

  const lotcheck = (data) =>{
    if(calledfrom === 'sales_return'){
      if(data.status === 'D' ){
        return data.status === 'D'
      }
      return data.status === 'S'
    }
    if(calledfrom === 'purchase_return'){
      if(data.status === 'PR'){
        return false;
      }
      return data.status !=='S'
    }
    return true;

  }

  const handleSubmit = () => {
    let isvalid = true;
    for (let key in errorLots) {
      if (errorLots[key]) {
        isvalid = false;
      }
    }
    if(index !== null){
      isvalid = false
    }
    // if (Number(props.row_id.data.quantity) !== Object.keys(formValues).length) {
    //   isvalid = false;
    //   // seterror({text0: 'QUANTITY'})
    // }
    const last = props.row_id.data;
    if (isvalid) {
      console.log('heritsis');
      
      last.lots = Object.values(formValues).map((d) => d);
      last.item_cost_price = last.lots[0]?.trans_items_cost_price || last.item_cost_price
      last.purchase_price = last.lots[0]?.purchase_price ||  last.purchase_price
      if (typeof props.row_id.id === 'number') {
        console.log('hereminni',...props.itemsData);
        if(props.row_id.type === 'stockTransfer'){
          const index = props.itemsData.findIndex(d => d.line === last.line)
          const updatedData = props.itemsData.map((d, i) => {
            if(i === index){
              return last
            }
            else{
              return d
            }
          })
          props.setitemsData(updatedData)
        }
        else{
          props.setitemsData(prev => {
          return prev.map((row, i) =>
          i === last.line - 1 ? { ...row, ...last } : row
          );
          
        });
        }
        // props.row_id.onRowDataChange(last)
      } 
      else {
        if(props.row_id.onRowDataChange){
          props.row_id.onRowDataChange(last);
        }
      }
      setformValue({});
      setcountval(0)
      seterror(null);
      setfilter([0]);
      setLotArray(false)
      props.handleClose();
    }
  };
  // const emptyCheck = () => {
  //   let isvalid = false;
  //   if (!Object.keys(formValues).length) {
  //     return (isvalid = true);
  //   }
  //   for (let key in formValues) {
  //     if (!formValues[key]) {
  //       isvalid = true;
  //     }
  //   }
  //   return isvalid;
  // };
  

  const validateAndFetchLotDetails = async (data, value) => {
    // console.log(props.row_id.data,'datasasasasa',value)
  return new Promise((resolve, reject) => {
    const payload = {
      item_id: data.item_id,
      location_id: data.location_id,
      lot_number: value
    };

    if (props.returnState === true) {
      if (props.calledfrom === 'sales_return') {
        payload.calledFrom = 'sales_return';
        payload.sale_id = data.sale_id;
      } else if (props.calledfrom === 'purchase_return') {
        payload.calledFrom = 'purchase_return';
        payload.receiving_id = data.receiving_id;
      }else if (props.calledfrom === 'dc_return') {
        payload.calledFrom = 'dc_return';
        payload.dc_id = data.dc_id;
      }
    }
    if(props.dc_id && !payload.dc_id){
       payload.dc_id = data.dc_id;
    }

    dispatch(
      getLotDetailsAction(payload, (res) => {
        if(res?.message){
          ErrorAlert(dispatch, { message: res.message });
        }
        if (res && res.length) {
          setLotArray(true);
          resolve(res); 
        } else {
          reject('INVALID');
        }
      })
    );
  });
};

  
  const addData = async (type) => {
  const lotNumberTrimmed = lotNumber?.toString().trim();

  if (!lotNumberTrimmed || lotNumberTrimmed === 'null') {
    seterror('REQUIRED');
    return;
  }

  try {
    const lot = await validateAndFetchLotDetails({
      item_id: props.row_id.data.item_id,
      location_id: props.location_id,
      sale_id: props.sale_id,
      receiving_id: props.receiving_id,
      dc_id:props.dc_id
    }, lotNumberTrimmed);

    const key = type === 'new' ? `text${[...filter].pop()}` : `text${index}`;
    const lots = findUniq(key, lotNumberTrimmed, lot);

    if (lots.isvalid) {
      seterror('INVALID');
      return;
    }


    setformValue(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        lot_number: lotNumberTrimmed,
        lot_id: lots.lot_id,
        trans_items_cost_price: lots.trans_items_cost_price,
        purchase_price: lots.purchase_price
      }
    }));

    if (type === 'new') {
      if (Number(props.row_id.data.quantity) !== countval) {
        setcountval(countval + 1);
      }
      setfilter([...filter, [...filter].pop() + 1]);
    }

    setLotNumber('');
    seterror(null);
    setIndex(null);
    setEditData(null);
    setLotArray(false);

  } catch (err) {
    seterror('INVALID');
    setLotArray(false);
  }
};

const editDataValidateAndSave = async (lotKey) => {
   const lotValue = formValues[lotKey]?.lot_number?.trim();

  if (!lotValue) {
    setErrorLots(prev => ({ ...prev, [lotKey]: "REQUIRED" }));
    return;
  }

  const payload = {
    item_id: props.row_id.data.item_id,
    location_id: props.location_id,
    lot_number: lotValue,
  };

  if (props.returnState === true) {
    if (props.calledfrom === 'sales_return') {
      payload.calledFrom = 'sales_return';
      payload.sale_id = props.sale_id;
    } else if (props.calledfrom === 'purchase_return') {
      payload.calledFrom = 'purchase_return';
      payload.receiving_id = props.receiving_id;
    }else if (props.calledfrom === 'dc_return') {
        payload.calledFrom = 'dc_return';
        payload.dc_id = props.dc_id;
      }
  }
   if(props.dc_id && !payload.dc_id){
       payload.dc_id = props.dc_id;
    }

  const res = await new Promise((resolve) => {
    dispatch(getLotDetailsAction(payload, (data) => resolve(data)));
  });

  if (!res || res.length === 0) {
    setErrorLots(prev => ({ ...prev, [lotKey]: 'INVALID' }));
    return;
  }

  const result = findUniq(lotKey, lotValue, res, formValues);

  if (result.isvalid) {
    setErrorLots(prev => ({ ...prev, [lotKey]: 'INVALID' }));
    return;
  }


  setformValue(prev => ({
    ...prev,
    [lotKey]: {
      ...prev[lotKey],
      lot_number: lotValue,
      lot_id: result.lot_id,
      trans_items_cost_price: result.trans_items_cost_price,
      purchase_price: result.purchase_price
    }
  }));
  setLotNumber('');
  setIndex(null); 
  setEditData(null);
  setErrorLots(prev => ({ ...prev, [lotKey]: null }));
};

// console.log("formValues",formValues)



const deleteData = (index) => {
  const updatedFilter = [...filter];
  const updatedValues = { ...formValues };
  const updatedErrors = { ...error };

  const keyToRemove = `text${updatedFilter[index]}`;
  delete updatedValues[keyToRemove];
  delete updatedErrors[keyToRemove];

  updatedFilter.splice(index, 1);

  setfilter(updatedFilter);
  setformValue(updatedValues);
  // seterror(updatedErrors);

  const validCount = Object.values(updatedValues).filter(val => val?.lot_number?.trim()).length;
  setcountval(validCount);
};



  const handleEdit = (index, key) => {
    setIndex(index)
    setEditData(formValues[key])
    setLotNumber(formValues[key].lot_number)
  }

// const debouncedEditValidation = useRef(
//   debounce(async (lotKey, value, item_id, location_id,sale_id,receiving_id,calledfrom, updatedFormValues) => {
//      const payload = {
//       item_id,
//       location_id,
//       lot_number: value,
//     };
//     if (props.returnState === true) {
//       if (calledfrom === 'sales_return' && sale_id) {
//         payload.calledFrom = 'sales_return';
//         payload.sale_id = sale_id;
//       } else if (calledfrom === 'purchase_return' && receiving_id) {
//         payload.calledFrom = 'purchase_return';
//         payload.receiving_id = receiving_id;
//       }
//     }
//     if (!value) {
//       setErrorLots(prev => ({ ...prev, [lotKey]: 'REQUIRED' }));
//       return;
//     }
    
//     await dispatch(getLotDetailsAction(payload,(res)=>{
      
//     const lotDetailsFetched = res
    
//     const result = findUniq(lotKey, value, lotDetailsFetched, updatedFormValues);


//     setErrorLots(prev => ({
//       ...prev,
//       [lotKey]: result.isvalid ? 'INVALID' : null
//     }));
//     }));
    
//   }, 600)
// ).current;




  const enteredVal = () => {
    let count = 0;
    for (let key in formValues) {
      if (Object.values(formValues[key]).length > 0) {
        count += 1;
      }
    }

    return count;
  };

  const cancelEdit = (lot) => {
    setformValue((prev) => ({ ...prev, [lot]: { ...prev[lot], lot_number: lotNumber } }))
    setLotNumber('')
    setIndex(null)
    setErrorLots({})
  }

  const lotEditData = (lot) => {
    const lotValue = formValues[lot]?.lot_number?.trim();

    if (!lotValue) {
      setErrorLots(prev => ({ ...prev, [lot]: "REQUIRED" }));
      return;
    }

    if (!validatedLots[lot]) {
      setErrorLots(prev => ({ ...prev, [lot]: 'EnterValue' }));
      return;
    }

    if (errorLots[lot]) {
      return;
    }

    setLotNumber('');
    setIndex(null);
    setErrorLots({});
    setValidatedLots(prev => {
      const { [lot]: removed, ...rest } = prev;
      return rest;
    });
  };

  
  return (
    <div>
      <Dialog
        open={props.open}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>
          {`Serial/Lot Number (Count ${Object.values(formValues).filter(val => val?.lot_number?.trim()).length}/${Number(props.row_id.data.quantity)})`}
        </DialogTitle>


        <DialogContent style={{overflowX: 'hidden'}}>
          <div style={{width: '450px'}}>
            {/* <DialogContentText id="lotnumber-dialog-description"> */}
            <Grid container spacing={2}>
              <Grid size={12} style={{ display: 'flex', paddingTop: '15px' }}>
                <TextField
                  label='Serial / Lot Number'
                  value={index === null ? lotNumber : ''}
                  fullWidth
                  disabled={Number(props.row_id.data.quantity) === countval}
                  onChange={handleChange}
                  error={error}
                  helperText={error === "QUANTITY" ? "Enter Product Quantity" : error === "EnterValue" ? "Please click enter to validate" : error === "INVALID" ? "Serial/Lot Number is invalid" : error === "REQUIRED" ? "Serial/Lot Number is required" : ""}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && index === null) {
                      e.preventDefault();

                      if (!lotNumber) {
                        seterror("REQUIRED");
                        return;
                      }

                      addData('new');
                    }
                  }}

                />

                <PostAdd
                  style={{
                    margin: '0 10px',
                    cursor:
                      Number(props.row_id.data.quantity) ===
                        Object.keys(formValues).length
                        ? 'default'
                        : 'pointer',
                  }}
                  color={
                    Number(props.row_id.data.quantity) ===
                      countval
                      ? 'disabled'
                      : 'primary'
                  }
                  onClick={() => {
                    if (
                      Number(props.row_id.data.quantity) !== Object.keys(formValues).length &&
                          index === null
                    ) {
                      addData('new');
                    }
                  }}
                />
              </Grid>
              {
                Object.keys(formValues).length > 0 ? Object.keys(formValues).map((lot, Index) => (
                  <Grid size={12} style={{ display: 'flex', alignItems: 'center' }} key={lot}>
                    <TextField
                      value={formValues[lot]?.lot_number || ''}
                      disabled={index !== Index}
                      fullWidth
                      onChange={async (e) => {
                        if (index === Index) {
                          const newValue = e.target.value;
                          const updatedFormValues = {
                            ...formValues,
                            [lot]: { ...formValues[lot], lot_number: newValue }
                          }
                          setformValue(prev => ({
                            ...prev,
                            [lot]: { ...prev[lot], lot_number: newValue }
                          }));
                          setErrorLots(prev => ({ ...prev, [lot]: null }));
                          setValidatedLots(prev => ({ ...prev, [lot]: false }));
                        }
                      }}
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter' && index === Index) {
                          e.preventDefault();
                          await editDataValidateAndSave(lot);
                        }
                      }}



                      error={errorLots[lot]}
                      helperText={errorLots[lot] === "QUANTITY" ? "Enter Product Quantity" : error === "EnterValue" ? "Please click enter to validate" :  errorLots[lot] === "INVALID" ? "Serial/Lot Number is invalid" : errorLots[lot] === "REQUIRED" ? "Serial/Lot Number is required" : ""}
                    />
                    {
                      index !== null && index === Index &&
                      <CloseOutlined
                        color='error'
                        onClick={e => cancelEdit(lot)}
                        style={{ cursor: 'pointer' }}
                      />
                    }
                    {
                      index !== null && index === Index &&
                      <DoneOutlined
                        color='success'
                       onClick={() => editDataValidateAndSave(lot)}
                        style={{ cursor: 'pointer' }}
                      />
                    }
                    {
                      (index === null || index !== Index) &&
                      <DeleteOutline
                        color='error'
                        onClick={(e) => deleteData(Index)}
                        style={{ cursor: 'pointer' }}
                      />
                    }
                    {
                      (index === null || index !== Index) &&
                      <EditOutlined
                        color='primary'
                        onClick={(e) => handleEdit(Index, lot)}
                        style={{ cursor: 'pointer' }}
                      />
                    }
                  </Grid>
                )) : null
              }
              {/* {[...filter].reverse().map((d, i) => (
                <Grid size={{ xs: 12, lg: 12 }} style={{display: 'flex' , paddingTop:'15px'}} key={i}>
                  <TextField
                    inputRef={(input) => {
                      if (i === 0 && input && !input.dataset.focused) {
                        input.focus();
                        input.dataset.focused = 'true';
                      }
                    }}
                    // autoFocus
                    error={error[`text${d}`]}
                    disabled={props.disabledel}
                    fullWidth
                    id='standard-basic'
                    value={formValues[`text${d}`]?.lot_number || ''}
                    name={`text${d}`}
                    onChange={handleChange}
                    label='Serial/Lot Number'
                    Style={{margin:'10px 10px'}}
                    helperText={error[`text${d}`] === "QUANTITY" ? "Enter Product Quantity" : error[`text${d}`] === "INVALID" ? "Serial/Lot Number is invalid" : error[`text${d}`] === "REQUIRED" ? "Serial/Lot Number is required" : ""}
                  />
                  {Number(props.row_id.data.quantity) >=
                    Object.keys(formValues).length && (
                    <div style={{display: 'flex', marginTop: '10px'}}>
                      {i === 0 && (
                        <PostAdd
                          style={{
                            margin: '0 10px',
                            cursor:
                              Number(props.row_id.data.quantity) ===
                              Object.keys(formValues).length
                                ? 'default'
                                : 'pointer',
                          }}
                          color={
                            Number(props.row_id.data.quantity) ===
                           countval
                              ? 'disabled'
                              : 'primary'
                          }
                          onClick={addData}
                        />
                      )}

                      {i !== 0 && (
                        <DeleteOutline
                          color='error'
                          onClick={(e) => deleteData(d)}
                          style={{cursor: 'pointer'}}
                        />
                      )}
                    </div>
                  )}
                </Grid>
              ))} */}
            </Grid>
            {/* </DialogContentText> */}
          </div>
        </DialogContent>

        {/* </div> */}
        <DialogActions>
          <Button
            onClick={(e) => {
              if(index !== null){
                return
              }
              else{
                props.handleClose();
                setformValue({});
                seterror(null);
                setLotNumber('')
                setIndex(null)
                setErrorLots({})
                setfilter([0]);
                setcountval(0)
                setValidatedLots({})
                setLotArray(false)
              }
            }}
            color='secondary'
          >
            Cancel
          </Button>
          {!props.disabledel ? (
            <Button
              // disabled={
              //   props.row_id.data.is_serialized === 1
              //     ? Number(props.row_id.data.quantity) > enteredVal()
              //       ? true
              //       : Number(props.row_id.data.quantity) === enteredVal()
              //       ? false
              //       : props.row_id.data.qty_per_pack >=
              //         Number(props.row_id.data.quantity)
              //       ? false
              //       : true
              //     : false
              // }
              onClick={handleSubmit}
              // variant='contained'
              color='primary'
              autoFocus
            >
              Submit
            </Button>
          ) : (
            ''
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}
