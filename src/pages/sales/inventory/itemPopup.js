import React, {useEffect, useState, useRef} from 'react';
import {
  Button,
  TextField,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  // DialogContentText,
  DialogTitle,
} from '@mui/material/';
import {PostAdd, DeleteOutline} from '@mui/icons-material';

export default function AlertDialog(props) {
  const [filter, setfilter] = useState([0]);
  const [formValues, setformValue] = useState({text0: {}});
  const [error, seterror] = useState({text0: false});
  const tempinitsform = useRef(null);
  const handleChange = (e) => {
    const {name, value} = e.target;
    var lots = findUniq(name, value);

    if (lots.isvalid) {
      seterror((p) => ({...p, [name]: true}));
    } else {
      seterror((p) => ({...p, [name]: false}));
    }
    setformValue((p) => ({
      ...p,
      [name]: {
        ...p[name],
        lot_number: value,
        lot_id: lots.lot_id,
        trans_items_cost_price: lots.trans_items_cost_price,
      },
    }));
  };
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

  useEffect(() => {
    window.addEventListener('keydown', handleup);

    // cleanup this component
    return () => {
      window.removeEventListener('keydown', handleup);
    };
  }, [formValues]);
  const findUniq = (name, input) => {
    let lotvalid = {isvalid: true, lot_id: ''};

    for (let data of props.row_id.data.oldlots) {
      if (data.lot_number === input.toString() && props.row_id.data.trans_items_cost_price === data.trans_items_cost_price) {
        lotvalid.isvalid = false;
        lotvalid.lot_id = data.lot_id;
        lotvalid.trans_items_cost_price = data.trans_items_cost_price;
      }
    }
    for (let data in formValues) {
      if (data !== name) {
        if (formValues[data].lot_number === input) {
          lotvalid.isvalid = true;
          lotvalid.trans_items_cost_price = data.trans_items_cost_price;
        }
      }
    }
    props.itemsData.forEach((d, inx) => {
      if (inx !== props.row_id.id) {
        d.lots.forEach((data) => {
          if (data.lot_number === input.toString()) {
            lotvalid.isvalid = true;
            lotvalid.trans_items_cost_price = data.trans_items_cost_price;
          }
        });
      }
    });
    // if (!isvalid) {
    //   for (let data of props.product) {
    //     if (data.lots.length) {
    //       for (let lot of data.lots) {
    //         if (lot.lot_number === input) {
    //           isvalid = true
    //         }
    //       }
    //     }
    //   }
    // }
    return lotvalid;
  };

  const handleSubmit = () => {
    let isvalid = true;
    for (let key in error) {
      if (error[key]) {
        isvalid = false;
      }
    }
    
    if (Number(props.row_id.data.quantity) !== Object.keys(formValues).length) {
      isvalid = false;
    }
    const last = props.row_id.data;

    if (isvalid) {
      last.lots = Object.values(formValues).map((d) => d);
      // last.received_quantity=enteredVal()*last.qty_per_pack

      if (typeof props.row_id.id === 'number') {
        const full = [...props.itemsData];
        const index = props.row_id.id;
        full[index] = last;
        props.setitemsData(full);
      } else {
        props.row_id.onRowDataChange(last);
      }
      setformValue({text0: {}});
      seterror({text0: false});
      setfilter([0]);
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

  const addData = () => {
    if (Number(props.row_id.data.quantity) === Object.keys(formValues).length) {
      return;
    }

    const getlast = [...filter].pop();
    if (!formValues[`text${getlast}`]?.lot_number) return;
    setformValue({...formValues, [`text${getlast + 1}`]: {}});
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
  }, [props.row_id.data]);

  const enteredVal = () => {
    let count = 0;
    for (let key in formValues) {
      if (formValues[key]) {
        count += 1;
      }
    }
    return count;
  };

  return (
    <div>
      <Dialog
        open={props.open}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>{`Serial/Lot Number (Count ${enteredVal()}/${Number(
          props.row_id.data.quantity,
        )})`}</DialogTitle>

        <DialogContent style={{overflowX: 'hidden'}}>
          <div style={{width: '450px'}}>
            {/* <DialogContentText id="itempopup-dialog-description"> */}
            <Grid container spacing={2}>
              {[...filter].reverse().map((d, i) => (
                <Grid size={{ lg: 12 }} style={{ display: 'flex', padding: '16px' }} key={i}>
                  <TextField
                    inputRef={(input) => i === 0 && input && input.focus()}
                    // autoFocus
                    error={error[`text${d}`]}
                    disabled={props.disabledel}
                    fullWidth
                    id='standard-basic'
                    value={formValues[`text${d}`]?.lot_number || ''}
                    name={`text${d}`}
                    onChange={handleChange}
                    label='Serial/Lot Number'
                  />
                  {!props.disabledel && (
                    <div style={{display: 'flex', marginTop: 'auto'}}>
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
                          onClick={(e) => deleteData(d)}
                          style={{cursor: 'pointer'}}
                        />
                      )}
                    </div>
                  )}
                </Grid>
              ))}
            </Grid>
            {/* </DialogContentText> */}
          </div>
        </DialogContent>

        {/* </div> */}
        <DialogActions>
          <Button
            onClick={(e) => {
              props.handleClose();
              setformValue({text0: {}});
              seterror({text0: false});
              setfilter([0]);
            }}
            color='secondary'
          >
            Cancel
          </Button>
          {!props.disabledel ? (
            <Button
              // disabled={
              //   emptyCheck() ||
              //   !(
              //     Number(props.row_id.data.received_quantity) /
              //       props.row_id.data.qty_per_pack ===
              //     Object.keys(formValues).length
              //   )
              // }
              onClick={handleSubmit}
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
