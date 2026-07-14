import React, {useEffect, useState, useRef, useContext} from 'react';
import {
  Button,
  TextField,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  // DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import {PostAdd, DeleteOutline} from '@mui/icons-material';
import PrintLabel from './PrintLabel';
import { useDispatch } from 'react-redux';
import { potCodeUpdateAction } from 'redux/actions/purchase_actions';
import { getLotDetailsAction } from 'redux/actions/sales_actions';
import debounce from 'lodash.debounce';
import context from '../../../context/CreateNewButtonContext';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import { IconButton } from '@mui/material';

export default function AlertDialog(props) {
  // console.log("props",props)
  const [filter, setfilter] = useState([0]);
  const [formValues, setformValue] = useState({});
  const [error, seterror] = useState({text0: false});
  const [tindex, settindex] = useState(0);
  const tempinitsform = useRef(null);
  const [current_seq,setCurrent_seq] = useState();
  const [seq,setseq] = useState();
  const [labelType, setLabelType] = useState('qrCode')
  const [lotNumber, setLotNumber] = useState('')
  const [errorLotNumber, setErrorLotNumber] = useState(null);
  const [editLotKey, setEditLotKey] = useState(null);
  const [from,setFrom] = useState();
  // True while a debounced lot-validation round-trip is in flight. Blocks
  // addData/handleSubmit so a stale user action cannot outrun the check.
  const [isValidating, setIsValidating] = useState(false);
  // Correlates each dispatched validation request with its callback. A newer
  // dispatch bumps this counter; older callbacks see a mismatch and bail out.
  const requestCounterRef = useRef(0);
  const {
     commoncookie,
     setModalTypeHandler,
     setLoaderStatusHandler,
     headerLocationId,
   } = useContext(context);
  const dispatch = useDispatch();

  // console.log("setformValue",formValues)
  const handleChange = (e) => {
    // console.log('eeeeeeeee', e.target)
    // const target = e.nativeEvent.target || e.currentTarget;
    const {name, value} = e.target;
    setformValue((prevValues) => ({
      ...prevValues,
      [name]: {
        ...prevValues[name],
        lot_number: value,
      },
    }));
    if (findUniq(name, value)) {
      seterror((p) => ({...p, [name]: true}));
    } else {
      seterror((p) => ({...p, [name]: false}));
    }

  };

  const addLotNumber = (e) => {
    const {value} = e.target;
    setLotNumber(value);
    const getlast = [...filter].pop();

    // Synchronous local duplicate check across this popup + every row in the PO.
    // If it fires, skip the API — the API only knows about persisted lots, so an
    // empty response from it would otherwise clear the (correct) local error.
    if (value && findUniq(`text${getlast}`, value)) {
      setErrorLotNumber('Serial / Lot Number is Invalid');
      setIsValidating(false);
      return;
    }
    setErrorLotNumber(null);

    if (!value) {
      setIsValidating(false);
      return;
    }

    setIsValidating(true);
    debouncedAPIValidation(dispatch, {
      location_id: props.location_id,
    }, value);
  };

  const debouncedAPIValidation = useRef(
    debounce((dispatch, data, value) => {
      const reqId = ++requestCounterRef.current;
      dispatch(getLotDetailsAction(
        {
          calledFrom: 'purchaseAdd',
          location_id: data.location_id,
          lot_number: value,
        },
        (result) => {
          // Drop stale responses: a later dispatch has already superseded this one.
          if (reqId !== requestCounterRef.current) return;
          setIsValidating(false);
          if (Array.isArray(result) && result.length > 0) {
            setErrorLotNumber('Serial / Lot Number is Invalid');
          } else {
            setFrom('purchaseAdd');
            setErrorLotNumber(null);
          }
        }
      ));
    }, 600)
  ).current;




  const handleup = (event) => {
    if (event.keyCode === 13) {
      event.preventDefault();
      addData();
    }
  };
  // useEffect(() => {
  //   window.addEventListener('keydown', handleup);

  //   // cleanup this component
  //   return () => {
  //     window.removeEventListener('keydown', handleup);
  //   };
  // }, [formValues]);

  const f1 = () => {
    window.addEventListener('keydown', handleup);
  };

  tempinitsform.current = f1;
  // tempinitsform.current.f2 = initsform2
  // useEffect(() => {
  //   tempinitsform.current();
  //   return () => {
  //     window.removeEventListener('keydown', handleup);
  //   };
  // }, [formValues]);

  const findUniq = (name, input) => {
    if (!input) return false;
    // Current popup: other slots being entered right now.
    for (let data in formValues) {
      if (data !== name && formValues[data].lot_number === input) {
        return true;
      }
    }
    // Cross-row: every other row's lots in the current PO. Skip the row being
    // edited so its existing lots don't falsely flag themselves as duplicates.
    const currentIndex = getRowIndex();
    if (Array.isArray(props.itemsData)) {
      for (let i = 0; i < props.itemsData.length; i++) {
        if (i === currentIndex) continue;
        const row = props.itemsData[i];
        if (!row || !Array.isArray(row.lots)) continue;
        for (const lot of row.lots) {
          if (lot && lot.lot_number === input) return true;
        }
      }
    }
    return false;
  };

const getRowIndex = () => {
  if (!props.row_id?.data) return -1;
  // console.log("props.itemsData",props.itemsData,props.row_id)

  return props.itemsData.findIndex(
    (row) =>
      row &&
      row.item_id === props.row_id.data.item_id &&
      row.line === props.row_id.data.line
  );
};



 const handleSubmit = () => {
  if (isValidating) return;
  let isvalid = true;
  for (let key in error) {
    if (error[key]) isvalid = false;
  }
  if (!isvalid) return;

  const index = getRowIndex();
  if (index === -1) return;

  const last = structuredClone(props.itemsData[index]);

  last.lots = Object.values(formValues).filter(
    (d) => d.lot_number && !d.lot_id
  );

  last.received_ordered_quantity = enteredVal();

  const updated = [...props.itemsData];
  // console.log("updated",updated)
  updated[index] = last;

  props.setitemsData(updated.filter(Boolean));

  setformValue({});
  seterror({ text0: false });
  setfilter([0]);
  props.handleClose();
};



  const potCodeSubmit = (data, current_seq, sequence_id, type) => {
  setLotNumber('');

  if (type !== 'purchaseAdd') {
    setCurrent_seq(current_seq);
    setseq(sequence_id);
  }

  const updatedRow = {
    ...props.row_id.data,
    lots: data,
    received_ordered_quantity: enteredVal(data),
    received_quantity:
      props.lotDialogOpenedThrough === 'ROW_EDIT'
        ? enteredVal(data)
        : 0
  };

  props.setitemsData(prev => {
    const copy = [...prev];

    const index = copy.findIndex(
      item =>
        item.item_id === updatedRow.item_id &&
        item.line === updatedRow.line
    );

    if (index !== -1) {
      copy[index] = updatedRow;
    }

    return copy;
  });

  if (props.row_id.onRowDataChange) {
    props.row_id.onRowDataChange(updatedRow);
  }
};


  const serialPopClose = () => {
    setformValue({});
    seterror({text0: false});
    setfilter([0]);
    // if(from!='purchaseAdd' || from === undefined){
    // dispatch(potCodeUpdateAction(seq, {current_seq}));
    // }

    props.handleClose();
    setFrom()
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

  const addData = () => {
    if (isValidating) {
      setErrorLotNumber('Validating serial/lot — please wait');
      return;
    }
    settindex(0);
    if (
      Number(props.row_id.data.received_quantity) ===
      Object.keys(formValues).length
    ) {
      return;
    }
    const getlast = [...filter].pop();
    //  console.log("getlast",getlast)
    if(lotNumber === '' || lotNumber === null || lotNumber === 'null' || findUniq(`text${getlast}`, lotNumber)){
      setErrorLotNumber(findUniq(`text${getlast}`, lotNumber) ? 'Serial / Lot Number is Invalid' : 'Serial / Lot Number is Required')
      return
    }

    setformValue((prev) =>({...prev, [`text${getlast}`]: {
      ...prev[`text${getlast}`],
        lot_number: lotNumber
    }}));
    setLotNumber('')
    setErrorLotNumber(null)
    seterror({...error, [`text${getlast + 1}`]: false});
    setfilter([...filter, getlast + 1]);
  };

  const deleteData = (index) => {
    const removearr = [...filter].filter((d) => d !== index);
    const removeobj = {...formValues};
    const removeerr = {...error};

    delete removeobj[`text${index}`];
    delete removeerr[`text${index}`];

    setformValue(removeobj);
    seterror(removeerr);
    setfilter(removearr);
  };

  useEffect(() => {

    if (props.row_id.data.lots?.length) {
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

      setformValue(makeobj);
      seterror(makeerr);
      setfilter(makearr);
    }

   // potCodeApi();
  }, [props.row_id]);

  const enteredVal = (data = formValues) => {
    let count = 0;
    for (let key in data) {
      if (data[key].lot_number) {
        count += 1;
      }
    }
    return count;
  };

  const potCodeApi = () => {
    const id = Number(
      props.row_id.data.receiving_quantity,
    );
    if (id > 0) {
      props.potCodeAction(id);
    }
  };

  const SERIAL_PAGE_SIZE = 20;

  const [serialPage, setSerialPage] = useState(1);

  const serialKeys = Object.keys(formValues).reverse();

  const totalSerialPages = Math.ceil(
    serialKeys.length / SERIAL_PAGE_SIZE
  );

  const paginatedSerialKeys = serialKeys.slice(
    (serialPage - 1) * SERIAL_PAGE_SIZE,
    serialPage * SERIAL_PAGE_SIZE
  );

  const displaySerialKeys =
  serialKeys.length > SERIAL_PAGE_SIZE
    ? paginatedSerialKeys
    : serialKeys;

    useEffect(() => {
  setSerialPage(1);
}, [serialKeys.length]);



 
// console.log('row_id={props.row_id}', props.row_id)
// console.log('3333', props.row_id.data.receiving_quantity,props.row_id.data.qty_per_pack,Number.isNaN(
//                    props.row_id.data.receiving_quantity / props.row_id.data.qty_per_pack
//                   ))

  return (
    <div>
      <Dialog
        open={props.open}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <div style={{display: 'flex', alignItems: 'center'}}>
          <DialogTitle id='alert-dialog-title'>{`Serial/Lot Number (Count ${enteredVal()}/${Number.isNaN(
                   props.row_id.data.receiving_quantity
                  ) ? 0 : Number(props.row_id.data.receiving_quantity)})`}</DialogTitle>
          <div >
         
          <Box style={{ height: 30 ,width:130,marginLeft:'1px',borderRadius:'20px'}}>
              <FormControl fullWidth>
                <InputLabel >Select</InputLabel>
                <Select  style={{ height: 30 }}
                  value= {labelType}
                  label='BarCode'
                  onChange={(e)=>{
                    setLabelType(e.target.value);
                  }}
                >
                  <MenuItem value={'barCode'}>BarCode</MenuItem>
                  <MenuItem value={'qrCode'}>QrCode</MenuItem>
                 
                </Select>
              </FormControl>
            </Box>
          </div>
          
          <div style={{marginLeft: 'auto', marginRight: 24}}>
             
            <PrintLabel
              pot_code_seq={props.pot_code_seq}
              formValues={formValues}
              row_id={props.row_id}
              potCodeSubmit={potCodeSubmit}
              serialPopClose={serialPopClose}
              labelType={labelType}
              from={from}
              // handleLastPotCodeSeq={props.handleLastPotCodeSeq}
              
            />
            
          </div>
        </div>

        <DialogContent style={{overflowX: 'hidden', paddingTop: 0}}>
          <div style={{width: '450px'}}>
            {/* <DialogContentText id="itempopup-dialog-description"> */}
            <Grid container spacing={2}>
              <Grid style={{display: 'flex', paddingTop:"18px"}} size={12}>
              <TextField
                    error={errorLotNumber}
                    fullWidth
                    id='standard-basic'
                    value={lotNumber}
                    name={`lotNumber`}
                    onChange={addLotNumber}
                    label='Serial/Lot Number'
                    disabled={Number(props.row_id.data.received_quantity) === Object.keys(formValues).length}
                    helperText={errorLotNumber}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault(); // Optional, prevents default form submission if any
                        addData();
                      }
                    }}
                    // InputProps={{
                    //   readOnly: Boolean(
                    //     props.row_id.data.lots[0]?.current_seq // Modify this condition as needed
                    //   ),
                // }}
                />
                <PostAdd
                  style={{
                    marginLeft: '10px',
                    cursor:
                      Number(props.row_id.data.received_quantity) === Object.keys(formValues).length || errorLotNumber
                        ? 'default'
                        : 'pointer',
                  }}
                  color={
                    Number(props.row_id.data.received_quantity) === Object.keys(formValues).length || errorLotNumber
                      ? 'disabled'
                      : 'primary'
                  }
                  onClick={errorLotNumber ? undefined : addData}
                />

              </Grid>

              {/* <Grid size={12} style={{display: 'flex'}}> */}
                {/* {
                  Object.keys(formValues).length > 0 ? Object.keys(formValues).reverse().map((lot, Index) => (
                    <Grid size={12} style={{display: 'flex', alignItems: 'center'}} key={lot}>
                      <TextField
                        value={formValues[lot]?.lot_number || ''}
                        disabled
                        fullWidth
                        // onChange={async(e) => {
                        //   const lots = findUniq(`text${Index}`, e.target.value)
                        //   if(lots.isvalid){
                        //     setErrorLots((prev) => ({...prev, [lot]: 'INVALID'}))
                        //   }
                        //   else{
                        //     setErrorLots((prev) => ({...prev, [lot]: null}))
                        //   }
                        //   await setformValue((prev) => ({ ...prev, [lot]: {...prev[lot], lot_number: e.target.value} }))
                        // }}
                        // error={errorLots[lot]}
                        // helperText={errorLots[lot] === "QUANTITY" ? "Enter Product Quantity" : errorLots[lot] === "INVALID" ? "Serial/Lot Number is invalid" : errorLots[lot] === "REQUIRED" ? "Serial/Lot Number is required" : ""}
                      />
                    </Grid>
                  )) : null
                } */}
              {displaySerialKeys.map((lot) => (
                <Grid key={lot} sx={{ display: 'flex', gap: 1 }} size={12}>
                  <TextField
                    fullWidth
                    value={formValues[lot]?.lot_number || ''}
                    disabled={editLotKey !== lot}
                    onChange={(e) => {
                      const value = e.target.value;
                      setformValue((prev) => ({
                        ...prev,
                        [lot]: { ...prev[lot], lot_number: value },
                      }));
                    }}
                  />

                  <IconButton
                    onClick={() =>
                      setEditLotKey(editLotKey === lot ? null : lot)
                    }
                  >
                    {editLotKey === lot ? <CheckIcon /> : <EditIcon />}
                  </IconButton>

                  <IconButton
                    color="error"
                    onClick={() => {
                      setformValue((prev) => {
                        const updated = { ...prev };
                        delete updated[lot];
                        return updated;
                      });
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              ))}

              {/* </Grid> */}
              {/* {[...filter].reverse().map((d, i) => (
                <Grid size={12} style={{display: 'flex',paddingTop:"18px"}} key={i}>
                  <TextField
                    inputRef={(input) => i === tindex && input && input.focus()}
                    //  autoFocus
                    error={error[`text${d}`]}
                    fullWidth
                    id='standard-basic'
                    value={formValues[`text${d}`]?.lot_number || ''}
                    name={`text${d}`}
                    onChange={handleChange}
                    label='Serial/Lot Number'
                    onClick={() => settindex(i)}
                    // disabled={
                    //   formValues[`text${d}`]?.receiving_item_id ===
                    //     props.row_id.data.receiving_item_id || false
                    // }
                    // InputProps={{
                    //   readOnly: props.row_id.data.lots[0]?.current_seq && true,
                    // }}
                    InputProps={{
                      readOnly: Boolean(
                        props.row_id.data.lots[0]?.current_seq // Modify this condition as needed
                      ),
                    }}
                  />

                  {!props.row_id.data.lots[0]?.current_seq && (
                    <div style={{display: 'flex', marginTop: 'auto'}}>
                      {i === 0 && (
                        <PostAdd
                          style={{
                            marginLeft: '10px',
                            cursor:
                              Number(props.row_id.data.received_quantity) /
                                props.row_id.data.qty_per_pack ===
                              Object.keys(formValues).length
                                ? 'default'
                                : 'pointer',
                          }}
                          color={
                            Number(props.row_id.data.received_quantity) /
                              props.row_id.data.qty_per_pack ===
                            Object.keys(formValues).length
                              ? 'disabled'
                              : 'primary'
                          }
                          onClick={addData}
                        />
                      )}

                      {filter.length !== 1 && (
                        <DeleteOutline
                          color='error'
                          onClick={(e) => {
                            deleteData(d);
                            settindex(0);
                          }}
                          style={{
                            cursor: 'pointer',
                            marginLeft: '10px',
                            display:
                              formValues[`text${d}`]?.receiving_item_id ===
                              props.row_id.data.receiving_item_id
                                ? 'none'
                                : 'block' || 'block',
                          }}
                          // disabled = {true}
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
        <DialogActions
          sx={{
            position: "sticky",
            bottom: 0,
            borderTop: "1px solid #e0e0e0",
            backgroundColor: "#fff",
            px: 2,
            py: 1
          }}
        >
          <Grid
            container
            alignItems="center"
            justifyContent="space-between"
            sx={{mt:'10px'}}
          >
            <Grid>
              {serialKeys.length > SERIAL_PAGE_SIZE && (
                <Box display="flex" alignItems="center" gap={1}>
                  <Button
                    disabled={serialPage === 1}
                    onClick={() => setSerialPage(p => p - 1)}
                    variant="contained"
                    size="small"
                  >
                    Prev
                  </Button>

                  <Typography>
                    Page {serialPage} / {totalSerialPages}
                  </Typography>

                  <Button
                    disabled={serialPage === totalSerialPages}
                    onClick={() => setSerialPage(p => p + 1)}
                    variant="contained"
                    size="small"
                  >
                    Next
                  </Button>
                </Box>
              )}
            </Grid>

            <Grid>
              <Box display="flex" alignItems="center" gap={1}>
                <Button
                  onClick={() => {
                    props.handleClose();
                    setformValue({});
                    seterror({ text0: false });
                    setfilter([0]);
                    setLotNumber("");
                    setErrorLotNumber(null);
                  }}
                  color="secondary"
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleSubmit}
                  color="primary"
                  autoFocus
                  disabled={Boolean(errorLotNumber)}
                >
                  Submit
                </Button>
              </Box>
            </Grid>
          </Grid>
        </DialogActions>

      </Dialog>
    </div>
  );
}
