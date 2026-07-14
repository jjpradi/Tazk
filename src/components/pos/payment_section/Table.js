import React, {useState, useContext} from 'react';
import {DataGrid} from '@mui/x-data-grid';
import CancelIcon from '@mui/icons-material/Cancel';
import {darken, lighten} from '@mui/material/styles';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import {TextField, Box} from '@mui/material';
import {v4 as uuidv4} from 'uuid';
// import Denominations from './popper';
import DenominationDialog from './DenominationDialog';
import {CONSOLIDATED_SALES} from '../../../redux/actionTypes';
import context from '../../../context/CreateNewButtonContext';

const rootSx = (theme) => {
  const getBackgroundColor = (color) =>
    theme.palette.mode === 'dark' ? darken(color, 0.6) : lighten(color, 0.6);

  const getHoverBackgroundColor = (color) =>
    theme.palette.mode === 'dark' ? darken(color, 0.5) : lighten(color, 0.5);

  return {
    '& .super-app-theme--Filled': {
      backgroundColor: getBackgroundColor(theme.palette.success.main),
      '&:hover': {
        backgroundColor: `${getHoverBackgroundColor(
          theme.palette.success.main,
        )} !important`,
      },
    },
    '& .super-app-theme--cell': {
      backgroundColor: 'rgba(255, 255, 255)',
      color: '#1a3e72',
      fontWeight: '600',
    },
    '& .super-app-theme--PartiallyFilled': {
      backgroundColor: getBackgroundColor(theme.palette.warning.main),
      '&:hover': {
        backgroundColor: `${getHoverBackgroundColor(
          theme.palette.warning.main,
        )} !important`,
      },
    },
  };
};

const inputSx = {
  '& input[type=number]': {
    '-moz-appearance': 'textfield',
  },
  '& input[type=number]::-webkit-outer-spin-button': {
    '-webkit-appearance': 'none',
    margin: 0,
  },
  '& input[type=number]::-webkit-inner-spin-button': {
    '-webkit-appearance': 'none',
    margin: 0,
  },
};

export default function DataGridDemo({
  posId,
  Tdata,
  total,
  setTdata,
  index,
  setIndex,
  setEntered,
  openDenominationDialog,
  setOpenDenominationDialog,
  currentTarget,
  setCurrrentTarget,
  setStateCashBoxInfo,
  normalCashBoxInfo,
  cashOutIn_denomination,
  responseType,
  defaultcash,
  postype,
  denominationtable
}) {
  const [openDenomination, setOpenDenomination] = useState(false);
  const {commoncookie} = useContext(context);

  const removeItem = (params, event) => {
    event.ignore = true;
    const {id} = params;
    let cindex = {i: 0};
    const fil = Tdata.filter((d, i) => {
      if (d.id !== id) {
        return true;
      } else {
        cindex = {d, i};
        return false;
      }
    });
    let ecount = [];
    const arr = fil.map((t, i) => {
      if (i >= cindex.i) {
        t.due = +t.due + +cindex.d.payment_amount;
      }
      if (!t.payment_type || !+t.payment_amount) {
        ecount.push(i);
      }
      return t;
    });

    const nindex = ecount[0] !== undefined ? ecount[0] : -1;

    setTimeout(() => {
      setTdata(arr);
      setIndex(nindex);
    }, 0);
  };

  const change = (getData, getAmount) => {

    const newAmount = Math.round(getAmount) - Math.round(+total);
    getData.forEach((d, ind) => {
      if (
        ind === index &&
        Math.sign(newAmount) === 1 &&
        +getData[index].payment_amount
      ) {
        getData[index].cash_adjustment = newAmount
      } else {
        getData[ind].cash_adjustment = 0;
      }
    });
    setTdata(getData);
  };

  const dialogTochange = (val, changeArr) => {
    Tdata[index].cash_adjustment = val;
    Tdata[index].change = changeArr;
    setTdata(Tdata);
  };
  const editPay = (getData, getAmount, cindex) => {
    let nindex = index;
    for (let i = index + 1; i < getData.length; i++) {
      let due = +getData[nindex].due - +getData[nindex].payment_amount;
      getData[i].due = Math.sign(due) === 1 ? due : 0;
      nindex += 1;

      if (i === getData.length - 1 && getAmount > +total) {
        if (cindex) {
          cindex.forEach((d) => {
            if (getData.length - 1 === d) getData.splice(d, 1);
          });
        }
      }
    }
    
  };

  const setDefault = (getData, getAmount, cindex) => {
    let venter = false;

    if (cindex.length >= 1 && cindex.length) {
      venter = true;
    } else {
      venter = false;
    }

    if (venter && index < getData.length - 1) {
      editPay(getData, getAmount, cindex);
    } else if (!venter && Math.round(getAmount) < Math.round(+total)) {
      editPay(getData, getAmount);
      const obj = {
        id: uuidv4(),
        due: Math.round(+total) - Math.round(getAmount),
        payment_amount: '',
        cash_adjustment: 0,
        payment_type: ``,
        cash_refund: 0,
        employee_id: commoncookie,
        reference_code: '',
        tendered: [],
        change: [],
      };
      getData.push(obj);
    } else {
      editPay(getData, getAmount);
    }
    return getData;
  };

  const keyboard = (val, tendered) => {
    console.log(val, tendered,'valtendered')
    setOpenDenominationDialog(false);
    const {cash_box_id,cashboxLedgerId} = normalCashBoxInfo
    const getData = [...Tdata];
    if (!getData[index]) return;
    
    // Validate that the amount is positive
    const numericVal = parseFloat(val) || 0;
    if (numericVal <= 0) return; // Prevent zero or negative amounts
    
    getData[index].payment_amount = val;
    getData[index].tendered = tendered;

    if(cash_box_id !== null && cashboxLedgerId !== null){
      getData[index].cash_box_id = cash_box_id
      getData[index].cashboxLedgerId = cashboxLedgerId
    }
    

    let cindex = [];
    
    const getAmount = getData.reduce(function (acc, obj, i) {
      if (!+obj.payment_amount) {
        cindex.push(i);
      }
      return acc + +obj.payment_amount;
    }, 0);
    if (getAmount > total && Tdata[index]?.payment_type === "Cash (INR)" && denominationtable === 1) {
      setOpenDenominationDialog(true);
      setCurrrentTarget('Change');
    }
    change(setDefault(getData, getAmount, cindex), getAmount);
  };

  

  // const getId = () => {
  //     return Tdata[index]?.id
  // }

  const getIndex = (id) => {
    let newIndex = 0;
    Tdata.forEach((d, i) => {
      if (d.id === id) newIndex = i;
    });
    setIndex(newIndex);
  };

  const openingDenominationStatus = () => {
    setOpenDenomination(!openDenomination);
    setOpenDenominationDialog(!openDenomination);
  };
  const columns = [
    {
      field: 'due',
      headerName: 'Due',
      flex: 1,
    },
    {
      field: 'payment_amount',
      headerName: 'Tendered',
      width: 10,
      flex: 1,
      renderCell: (params) => (
        <div style={{display: 'flex', alignItems: 'center', width: '100%'}}>
          <TextField
            name='Tendered'
            onClick={(e) => {
              if ( postype !== 'posSalePage' && defaultcash !== undefined && defaultcash.id !== params.row.cash_box_id && params.row.payment_type === 'Cash (INR)') {
                setOpenDenominationDialog(!openDenominationDialog);
                setCurrrentTarget(e.target.name);
              }else if(postype === 'posSalePage' && denominationtable === 1 && params.row.payment_type === 'Cash (INR)'){
                setOpenDenominationDialog(!openDenominationDialog);
                setCurrrentTarget(e.target.name);
              }
            }}
            sx={inputSx}
            style={{backgroundColor: 'white', paddingBottom: '0px'}}
            placeholder='0.00'
            type='number'
            variant='standard'
            value={params.value}
            onChange={(e) => keyboard(e.target.value)}
            slotProps={{input: {disableUnderline: true, style: {fontSize: 15}}}}
          />
        </div>
      ),
      cellClassName: 'super-app-theme--cell',
    },
    {
      field: 'cash_adjustment',
      headerName: 'Change',
      width: 10,
      flex: 1,
      renderCell: (params) => (
        <div style={{display: 'flex', alignItems: 'center', width: '100%'}}>
          <TextField
            name='Change'
            onClick={(e) => {
              if (params.row.payment_type === 'Cash (INR)') {
                setOpenDenominationDialog(!openDenominationDialog);
                setCurrrentTarget(e.target.name);
              }
            }}
            sx={inputSx}
            style={{backgroundColor: 'white', paddingBottom: '0px'}}
            placeholder='0.00'
            type='number'
            variant='standard'
            value={params.value}
            onChange={(e) => keyboard(e.target.value)}
            slotProps={{input: {disableUnderline: true, style: {fontSize: 15}}}}
          />
        </div>
      ),
      cellClassName: 'super-app-theme--cell',
    },
    {
      field: 'payment_type',
      headerName: 'Method',
      flex: 1,
      renderCell: (params) => (
        <div style={{display: 'flex', alignItems: 'center', width: '100%'}}>
          <span>{params.value}</span>
          {params.value === 'Card (INR)' ? (
            <CreditCardIcon color='success' sx={{ml: 'auto'}} />
          ) : (
            ''
          )}
        </div>
      ),
    },
    {
      field: 'action',
      headerName: ' ',
      renderCell: (params) => (
        <div
          style={{cursor: 'pointer', color: 'rgba(0,0,0,0.6)', display: 'flex'}}
        >
          <CancelIcon onClick={(e) => removeItem(params, e)} color='inherit' />
        </div>
      ),
      width: '',
    },
  ];

  console.log(Tdata,'tagagaga')


  return (
    <Box sx={[rootSx, {height: 384}]}>
      <DataGrid
        rows={Tdata}
        columns={columns}
        hideFooter
        disableColumnMenu
        // selectionModel={getId()}
        disableRowSelectionOnClick
        onRowClick={(params, event) => !event.ignore && getIndex(params.id)}
        getRowClassName={(params) =>
          `super-app-theme--${
            !+params.row.payment_amount || !params.row.payment_type
              ? 'PartiallyFilled'
              : 'Filled'
          }`
        }
      />

      {/* {openDenomination&&openDenominationDialog&& */}
      <DenominationDialog
        open={openDenominationDialog}
        setOpenDenomination={setOpenDenominationDialog}
        keyboard={keyboard}
        dialogTochange={dialogTochange}
        openingDenominationStatus={openingDenominationStatus}
        currentTarget={currentTarget}
        Due={Tdata}
        setTdata={setTdata}
        index={index}
        setStateCashBoxInfo={setStateCashBoxInfo}
        posId = {posId}
        cashOutIn_denomination={cashOutIn_denomination}
        responseType={responseType}
      />
      {/* } */}
    </Box>
  );
}
