import React, { useState, useEffect, useRef, useContext } from 'react';

import { v4 as uuidv4 } from 'uuid';
import { useDispatch, useSelector } from 'react-redux';
import { listPosCreationAction } from '../../../redux/actions/pos_creations_actions';
import { listCashBoxLocationAction } from '../../../redux/actions/cash_box_actions'
import moment from 'moment';
import Card from '../../../../src/components/pos/payment_section/Types/Card';
import { Autocomplete, Box, Button, Checkbox, createTheme, FormControlLabel, Grid, InputAdornment, Paper, Radio, RadioGroup, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import { getsessionStorage } from 'pages/common/login/cookies';
import { approvalUserRightsAction, salesApprovalsAction } from 'redux/actions/sales_actions';
import DenominationDialog from '../../../../src/components/pos/payment_section/DenominationDialog';
import context from '../../../context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import { array } from 'prop-types';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import { makeStyles } from 'tss-react/mui';

// const useStyles = makeStyles((theme) => ({
//   root: {
//     flexGrow: 1,
//     height: "60vh",
//   },
//   item: {
//     p: "3px 0px",
//     border: "1px solid black",
//     width: "100%",
//     borderRadius: 1,
//     mr: "3px",
//   },
// }));

const defaultTheme = createTheme();
const FLOAT_TOLERANCE = 1e-6;

const isNearlyZero = (value) => Math.abs(value) <= FLOAT_TOLERANCE;

const normalizeFloat = (value) => {
  const roundedValue = Number.parseFloat((value || 0).toFixed(6));
  return isNearlyZero(roundedValue) ? 0 : roundedValue;
};

const useStyles = makeStyles(
  (theme) => {
    const getBackgroundColor = (color) =>
      theme.palette.mode === 'dark' ? darken(color, 0.6) : lighten(color, 0.6);

    const getHoverBackgroundColor = (color) =>
      theme.palette.mode === 'dark' ? darken(color, 0.5) : lighten(color, 0.5);

    return {
      root: {
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
      },
      input: {
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
      },
    };
  },
  { defaultTheme },
);

const NewPaymentTable = ({
  Tdata,
  setTdata,
  selectionModel,
  status,
  total,
  index,
  setIndex,
  isEntered,
  setEntered,
  pModes,
  setpModes,
  posId,
  getPay,
  pageType = "posSalePage",
  cashOutIn_denomination,
  PaymentDenominationvalidation,
  responseType,
  rowData,
  isCashTransaction = false,
  receivableData,
  customer,
  advanceAmount,
  rows,
  handleCheckboxChange,
  isRowSelected,
  isCheckboxDisabled,
  selectedTotal,
  activeStep,
  custType,
  setPaymentSelected,
  isAmountTallied,
  setIsAmountTallied,
  setSummaryData,
  summaryData,
  receiptDate,
}) => {
  const dispatch = useDispatch();
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(context);

  const [openDenominationDialog, setOpenDenominationDialog] = useState(false);
  const [currentTarget, setCurrrentTarget] = useState("Tendered");
  const { pos_creation } = useSelector((state) => state.posCreationReducer);
  const { cash_box_denomination, cash_box_list, locateCashBox } = useSelector((state) => state.cashBoxReducer);
  const tempinitsform = useRef(null);
  const [chequeErr, setChequeErr] = useState({ bankName: false, chequeNumber: false, chequeDate: false })
  const [normalCashBoxInfo, setNormalCashBoxInfo] = useState({
    cash_box_id: null,
    cashboxLedgerId: null,
  });
  const [referenceNo, setReferenceNo] = useState(null);
  const [cardReferenceNo, setCardReferenceNo] = useState(null);
  const [referenceNoErr, setReferenceNoErr] = useState(false)
  const [chequeInfo, setChequeInfo] = useState({
    bankName: null,
    chequeDate: moment().format('YYYY-MM-DD'),
    chequeNumber: null,
  });
  const [activeOpen, setActiveOpen] = useState(-2);
  const [open, setOpen] = useState(-1);
  const [defaultcash, setDefaultcash] = useState({});
  const wrapperRef = useRef(null);
  const { salesReducer: { salesApprovals, getApprovalRights } } = useSelector(state => state);
  const [denominationtable, setdenominationtable] = useState(1);
  const [tempData, setTempData] = useState([]);
  const [prevRequest, setPrevRequest] = useState(false);
  const storage = getsessionStorage();
  const [bulkData, setBulkData] = useState([]);
  const [denominationMap, setDenominationMap] = useState({});
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [selectedCashBoxes, setSelectedCashBoxes] = useState({});
  const [focusedPaymentId, setFocusedPaymentId] = useState(null);
  const [data, setdata] = useState({});
  const amountRefs = useRef({});
  const lastDigitRefs = useRef({});



  function isOpen() {
    return open === activeOpen;
  }
  // console.log("nunujnujuj", total);

  const checkAmountTallied = (selectionModel) => {
    const netAmount = selectionModel.reduce((acc, item) => {
        if (item.type === "Invoice") {
          return acc + parseFloat(item.receivable || 0);
        } else if (item.type === "Credit Note") {
          return acc - parseFloat(item.payable || 0);
        }
        return acc;
      }, 0);

    return selectionModel.some((item) => item.type === "Invoice") &&
      selectionModel.some((item) => item.type === "Credit Note") &&
      isNearlyZero(netAmount);
  };

  useEffect(() => {
    const isAmountTallied = checkAmountTallied(selectionModel);
    setIsAmountTallied(isAmountTallied);
  }, [selectionModel]);

  // console.log("cescsefvv", selectionModel);

  const selectedPaymentsRef = useRef([]);

  useEffect(() => {
    selectedPaymentsRef.current = selectedPayments;
  }, [selectedPayments]);


  useEffect(() => { (async () => {
    if (storage.role_name !== 'Administrator' && rowData?.length > 0) {
      const payload1 = {
        type: 'PaymentApproval'
      }
      await dispatch(approvalUserRightsAction(payload1))
    }
    if (getApprovalRights?.rights !== true && rowData?.length > 0) {
      const payload = {
        type: 'Approved',
        customer_id: rowData[0]?.customer_id
      }

      await dispatch(salesApprovalsAction(payload))
    }
  })();
}, [dispatch, rowData?.length])

  const initsform = () => {
    if (pos_creation.length === 0) {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(
          listPosCreationAction(
            () => { },
            () => { },
          ),
        )
      );
    }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(listCashBoxLocationAction(headerLocationId, setModalTypeHandler, setLoaderStatusHandler))
    );
  };
  tempinitsform.current = initsform;

 const didMountRef = useRef(false);

useEffect(() => {
  if (didMountRef.current) {
    tempinitsform.current();
  } else {
    didMountRef.current = true;
  }
}, [activeStep, headerLocationId]); 

  useEffect(() => {
    tempinitsform.current();
    dispatch(listCashBoxLocationAction(headerLocationId, setModalTypeHandler, setLoaderStatusHandler))
  }, [activeStep,headerLocationId]);

  const getCashBoxId = () => {
    let res = pos_creation.filter((f) => f.posId === posId);
    if (res.length > 0) {
      return res[0].cashBox;
    }
  };
  const getCashBoxLedgerId = () => {
    let res = pos_creation.filter((f) => f.posId === posId);
    if (res.length > 0) {
      return res[0].cashboxLedgerId;
    }
  };
  const getPaymentModeLedgerId = (paymentId) => {
    let res = pModes.filter((f) => f.paymentId === paymentId);
    if (res.length > 0) {
      return res[0].ledger_id;
    }
  };

  const handleAmountChange = (e, item, key) => {
    const newValue = e.target.value;
    const updatedPModes = pModes.map((pMode, index) => {
      if (index === key) {
        const value = parseFloat(newValue);
        const amount = isNaN(value) || value <= 0 ? '' : value; // Prevent zero or negative amounts
        const remainingBalance = normalizeFloat((advanceAmount || 0) - amount);
        return {
          ...pMode,
          amount: amount,
          balance: remainingBalance < 0 || isNearlyZero(remainingBalance) ? 0 : remainingBalance,
        };
      }
      return pMode;
    });
    setpModes(updatedPModes);
    keyboard(newValue, null, key, 'textinput');
    changeAmount(updatedPModes, item?.paymentId, item?.payment_type);
    setFocusedPaymentId(item.paymentId);
  };

  useEffect(() => {
    if (focusedPaymentId && amountRefs.current[focusedPaymentId]) {
      amountRefs.current[focusedPaymentId].focus();
      setFocusedPaymentId(null);
    }
  }, [pModes, focusedPaymentId]); 

  const create = (type, getAmount, amount, paymentId) => {
    // console.log("fdcvdsfvfdgv", total, getAmount);

    const obj = {
      id: uuidv4(),
      due: +(+total - getAmount),
      payment_amount: amount
        ? Tdata.length
          ? getAmount < +total
            ? +(+total - getAmount)
            : ''
          : +total
        : '',
      cash_adjustment: 0,
      payment_type: type,
      cash_refund: 0,
      employee_id: commoncookie,
      reference_code: '',
      tendered: [],
      change: [],
      cash_box_id: type === 'Cash' ? normalCashBoxInfo.cash_box_id !== null ? normalCashBoxInfo.cash_box_id : getCashBoxId() : null,
      paymentId: paymentId,
      cashboxLedgerId: type === 'Cash' ? normalCashBoxInfo.cashboxLedgerId !== null ? normalCashBoxInfo.cashboxLedgerId : getCashBoxLedgerId() : null,
      paymentLedgerId: getPaymentModeLedgerId(paymentId),
      ledger_id: typeof getPay !== 'undefined' ? getPay[0]?.ledger_id : 0,
      referenceNumber: referenceNo,
      bankName: chequeInfo.bankName,
      chequeNumber: chequeInfo.chequeNumber,
      chequeDate: moment(chequeInfo.chequeDate).format("YYYY-MM-DD")

    };
    if (getApprovalRights.rights !== true && prevRequest === true) {

      setTempData((prevTdata) => {
        return [...prevTdata, obj];
      });
      setBulkData([...bulkData, obj])
    }
    else {

      setTdata([...Tdata, obj]);
      setBulkData([...bulkData, obj])
      // console.log("ewewwe", Tdata);


    }
    // console.log("obj", obj);

    setIndex(Tdata.length);
  };

  const createData = (type, dueAmount, paymentAmount, paymentId) => {
    // console.log("fdcvdsfvfdgv", type, paymentAmount);
    const isCash = type === 'Cash (INR)';
    const isPOSUndefined = typeof posId === 'undefined';
    // console.log('isCash:', isCash);
    // console.log('isPOSUndefined:', isPOSUndefined);
    // console.log('getCashBoxId:', getCashBoxId());
    // console.log('getCashBoxLedgerId:', getCashBoxLedgerId());
    const obj = {
      id: uuidv4(),
      due: total,
      payment_amount: paymentAmount,
      cash_adjustment: 0,
      payment_type: type,
      cash_refund: 0,
      employee_id: commoncookie,
      reference_code: '',
      tendered: [],
      change: [],
      cash_box_id: type === "Cash (INR)" ? normalCashBoxInfo.cash_box_id !== null && typeof posId === 'undefined' ? normalCashBoxInfo.cash_box_id : getCashBoxId() : null,
      paymentId: paymentId,
      cashboxLedgerId: type === "Cash (INR)" ? normalCashBoxInfo.cashboxLedgerId !== null && typeof posId === 'undefined' ? normalCashBoxInfo.cashboxLedgerId : getCashBoxLedgerId() : null,
      paymentLedgerId: getPaymentModeLedgerId(paymentId),
      ledger_id: typeof getPay !== 'undefined' ? getPay[0]?.ledger_id : 0,
      referenceNumber: referenceNo,
      cardReferenceNumber: cardReferenceNo,
      bankName: chequeInfo.bankName,
      chequeNumber: chequeInfo.chequeNumber,
      chequeDate: type === 'Cheque' ? moment(chequeInfo.chequeDate).format("YYYY-MM-DD") : null

    };
    let index = Tdata?.findIndex(v => v?.paymentId == paymentId)
    let arr = [...Tdata]
    if (index != -1) {
      arr[index] = obj
    } else {
      arr.push(obj)
    }
    setTdata(arr);
  }
// console.log("fcsfv",Tdata);

  useEffect(() => {
    if (receivableData?.length > 0 && salesApprovals?.length > 0 && getApprovalRights?.rights !== true) {

      const parsedPayments = JSON.parse(salesApprovals[0].Payment_Tdata);

      const filteredPayments = parsedPayments.filter(payment =>
        payment.ledger_id === receivableData[0].ledger_id)


      setTempData(filteredPayments);
    }

  }, [receivableData?.length, salesApprovals?.length]);

  const handleClick = (type, paymentId, denomination) => {
    if (denomination === 0) {

      cardPayment('Cash (INR)', paymentId)
    } else {

      setOpenDenominationDialog(true);

      setCurrrentTarget('Tendered');

      pageType === 'posSalePage' && setdenominationtable(denomination)

      const getAmount = Tdata.reduce(function (acc, obj) {
        return acc + +obj.payment_amount;
      }, 0);

      if (!Tdata.length) {
        createData(type, getAmount, undefined, paymentId);
        return;
      }

      if (
        +Tdata[Tdata.length - 1].payment_amount &&
        Tdata[Tdata.length - 1].payment_type &&
        getAmount < +total
      ) {
        createData(type, getAmount, undefined, paymentId);
        return;
      }

      const copy = [...Tdata];
      const pindex = copy.findIndex((i) => !i.payment_type || !+i.payment_amount);
      if (pindex !== -1) {
        copy[pindex].payment_type = type;
        copy[pindex].cash_box_id = normalCashBoxInfo.cash_box_id !== null && typeof posId === 'undefined' ? normalCashBoxInfo.cash_box_id : getCashBoxId(),
          copy[pindex].paymentId = paymentId,
          copy[pindex].cashboxLedgerId = normalCashBoxInfo.cashboxLedgerId !== null && typeof posId === 'undefined' ? normalCashBoxInfo.cashboxLedgerId : getCashBoxLedgerId(),
          copy[pindex].paymentLedgerId = getPaymentModeLedgerId(paymentId),
          copy[pindex].ledger_id = typeof getPay !== 'undefined' ? getPay[0]?.ledger_id : 0,
          copy[pindex].referenceNumber = referenceNo,
          copy[pindex].cardReferenceNumber = cardReferenceNo,
          copy[pindex].bankName = chequeInfo.bankName,
          copy[pindex].chequeNumber = chequeInfo.chequeNumber,
          copy[pindex].chequeDate = moment(chequeInfo.chequeDate).format("YYYY-MM-DD")
      }

      setTdata(copy);
      setIndex(pindex);
      // console.log("hthttrt", Tdata);
    }
  };

  const multiFunction = (paymentId, denominations) => {
    setdenominationtable(denominations);
    handleClick('Cash (INR)', paymentId, denominations);
  }
  const editPay = (pindex, getData, getAmount) => {
    let nindex = pindex;
    for (let i = pindex + 1; i < getData.length; i++) {
      if (getAmount < +total) {
        let due = +getData[nindex].due - +getData[nindex].payment_amount;
        if (!due) {
          getData.splice(i, getData.length - 1 - i + 1);
        } else {
          getData[i].due = due;
          nindex += 1;
        }
      } else {
        if (i === getData.length - 1) {
          getData.splice(pindex + 1, getData.length - 1 - pindex + 1);
        }
      }
    }
  };

  const cardPayment = (type, paymentId) => {

    // console.log('cardPaymnemene')

    if (activeOpen === paymentId) {
      setActiveOpen(-1)
    } else {
      setActiveOpen(paymentId)
    }
    setOpenDenominationDialog(false);
    let getAmount = Tdata.reduce(function (acc, obj) {
      return acc + +obj.payment_amount;
    }, 0);
    if (!Tdata.length) {
      createData(type, getAmount, true, paymentId);
      return;
    }

    if (
      +Tdata[Tdata.length - 1].payment_amount &&
      Tdata[Tdata.length - 1].payment_type &&
      getAmount < +total
    ) {

      createData(type, getAmount, true, paymentId);
      return;
    }

    const copy = [...Tdata];
    const pindex = copy.findIndex((i) => !+i.payment_amount || !i.payment_type);

    if (pindex !== -1) copy[pindex].payment_type = type;

    if (getAmount < +total && !+copy[pindex].payment_amount) {
      copy[pindex].payment_amount = +total - getAmount;

      getAmount = +total - getAmount;
      editPay(pindex, copy, getAmount);
    }

    setTdata(copy);
    setIndex(pindex);
    // console.log("uikuikk", Tdata);
  };


  const handleSubmit = (e) => {
    const { chequeNumber, bankName } = chequeInfo
    if (referenceNo === null && (type === 'UPI' || type === 'NEFT / RTGS / IMPS') || referenceNo === '') {
      setReferenceNoErr(true)
    } else if (type === 'Cheque') {
      let flog = true
      Object.keys(chequeInfo).map((t, inx) => {
        if (chequeInfo[t] === null || chequeInfo[t] === '' || chequeInfo.chequeNumber?.length !== 6) {
          setChequeErr({ ...chequeErr, [t]: true })
          flog = false
        } else if (Object.keys(chequeInfo).length - 1 === inx && flog) {
          props.onClick();
          handleClick({ currentTarget: anchorEl });
        }
      })
    }
    else {
      props.onClick();
      handleClick({ currentTarget: anchorEl });
    }
  }

  const Dropdown = (data, paymentId, payment_type) => {
    // console.log("dcdfcvcv", data);

    setActiveOpen(-1)
    // setclosecard(false)
    PaymentDenominationvalidation(data?.id);
    setOpen(paymentId)
    setNormalCashBoxInfo({ cash_box_id: data?.id || null, cashboxLedgerId: data?.ledger_id || null })

    setDenominationMap((prev) => ({
      ...prev,
      [paymentId]: data?.allowdenomination
    }));

    setSelectedCashBoxes((prev) => ({
      ...prev,
      [paymentId]: data?.id ? true : false,
    }));
    setTimeout(() => {
      amountRefs.current[paymentId]?.focus();
    }, 100);
    if (data?.allowdenomination === 0) {
      setDefaultcash(data)
      // props.onClick();
      // handleClick({ currentTarget: anchorEl });
    }
    else {
      setOpenDenominationDialog(true);
      setDefaultcash({})
      const cash_type = payment_type + " (INR)";
      handleClick(cash_type, paymentId, data?.allowdenomination)
    }
    // await handleCashClick(cash_type,paymentId, data.allowdenomination)
  };

  const handleClose = (e) => {
    if (wrapperRef.current && wrapperRef.current.contains(e.target)) {
      setActiveOpen(-1)
    }
  }

  const [openDenomination, setOpenDenomination] = useState(false);
  const { commoncookie } = useContext(context);

  const removeItem = (params, event) => {
    event.ignore = true;
    const { id } = params;
    let cindex = { i: 0 };
    const fil = Tdata.filter((d, i) => {
      if (d.id !== id) {
        return true;
      } else {
        cindex = { d, i };
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
      // console.log("uyujujjyu", Tdata);
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
    // console.log("bbcvbvcvv", Tdata);
  };

  const dialogTochange = (val, changeArr) => {
    // console.log("dfgvfgv", val, changeArr)
    Tdata[index].cash_adjustment = val;
    Tdata[index].change = changeArr;
    setTdata(Tdata);
    // console.log("jkuujuyuuy", Tdata);
  };
  const editPay2 = (getData, getAmount, cindex) => {
    let nindex = index;
    for (let i = index + 1; i < getData.length; i++) {
      let due = +getData[nindex].due - +getData[nindex].payment_amount;
      getData[i].due = Math.sign(due) === 1 && Math.round(due) === 1 ? due : 0;
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

  const handleDenominationClick = (e, rowCashBoxId, paymentType, targetName) => {
    // console.log("targetName", targetName);

    const isPOS = pageType === 'posSalePage';
    const isCash = paymentType === 'Cash (INR)';

    if (
      (!isPOS && defaultcash !== undefined && defaultcash.id !== rowCashBoxId && isCash) ||
      (isPOS && denominationtable === 1 && isCash)
    ) {
      setOpenDenominationDialog(true);
      setCurrrentTarget(targetName);
    }
  };
  // console.log("Tdatadcdcdc", Tdata);


  const setDefault = (getData, getAmount, cindex) => {
    let venter = false;

    if (cindex.length >= 1 && cindex.length) {
      venter = true;
    } else {
      venter = false;
    }

    if (venter && index < getData.length - 1) {
      editPay2(getData, getAmount, cindex);
    } else if (!venter && Math.round(getAmount) < Math.round(+total)) {
      editPay2(getData, getAmount);
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
      editPay2(getData, getAmount);
    }
    return getData;
  };

  const keyboard = (val, tendered = null, index, type) => {
    // console.log(val, tendered, 'valtendered')
    setOpenDenominationDialog(false);
    if (type !== 'textinput') {
      let value = parseFloat(val);
      value = isNaN(value) ? 0 : value;

      let arr = [...pModes];
      arr[0].amount = value;

      let remainingBalance = advanceAmount - value;
      arr[0].balance = remainingBalance < 0 ? 0 : remainingBalance;
      // console.log("ewewedwedd", arr);

      setpModes(arr);
      let item = pModes[0]
      changeAmount(arr, item?.paymentId, item?.payment_type);
    }
    const { cash_box_id, cashboxLedgerId } = normalCashBoxInfo
    const getData = [...Tdata];
    if (!getData[index]) return;
    getData[index].payment_amount = val;
    getData[index].tendered = tendered;

    if (cash_box_id !== null && cashboxLedgerId !== null) {
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
    if (getAmount > total && Tdata[index]?.payment_type === "Cash (INR)") {
      return;
    }
    change(setDefault(getData, getAmount, cindex), getAmount);
  };


  // console.log("sdcdfcdcfcv", selectedPayments);

  // const getId = () => {
  //     return Tdata[index]?.id
  // }
  const handleChange = (e) => {
    const { name, value } = e.target;
    setdata((p) => ({ ...p, [name]: value }));
  };

  const Change = (e, key) => {
    let { value } = e.target;
    const updated = [...pModes];
    updated[key].axisType = value;
    setdata(value);
    //setDirty();
  };

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

  // console.log("pModes", selectionModel);

  useEffect(() => {
    if (selectedPayments) {
      setPaymentSelected(selectedPaymentsRef.current);
    }
  }, [selectedPayments]);

 

  useEffect(() => {
    if (selectedTotal && pModes.length > 0) {
      const updated = pModes.map((p) => ({
        ...p,
        total: selectedTotal?.toFixed(2),
      }));
      setpModes(updated);
    }
  }, [selectedTotal, pModes.length]);


  const changeAmount = (arr, paymentId, payment_type) => {
    let remaining = !isNaN(selectedTotal) ? parseFloat(selectedTotal) : 0;

    const result = arr.map(item => {
      const amt = isNaN(item?.amount) ? 0 : parseFloat(item?.amount);
      remaining -= amt;
      return {
        ...item,
        total: remaining.toFixed(2),
      };
    });

    let dat = result.find(x => x?.paymentId === paymentId);
    if (dat) {
      let type = payment_type + " (INR)";
      createData(type, dat?.total, dat?.amount, paymentId);
    }

    setpModes(result);
  };

  useEffect(() => {
    if (activeStep === 1 || custType === 'CUSTOMER') {
      // console.log(pModes,'pmmoessss')
      setSelectedPayments(selectedPaymentsRef.current);
      setpModes(pModes.map(v => ({ ...v, amount: 0, total: selectedTotal ?? 0 ,selectedCashBox : null})));
    }
  }, [activeStep, custType]);

  const handleDateChange = (paymentId, index, date, isCheque) => {
    const updatedPaymentModes = pModes.map((v, i) => {
      if (index === i) {
        return {
          ...v,
          transDate: moment(date).format('YYYY-MM-DD')
        }
      }
      else{
        return v
      }
    })
    setpModes(updatedPaymentModes)

    if(isCheque){
      setChequeInfo((prev) => ({ ...prev, chequeDate: moment(date).format('YYYY-MM-DD') }))
    }

    if(setSummaryData){
      const updatedSummaryData = summaryData.map((summary) => {
        if(summary.paymentCreditNoteId === paymentId){
          return {
            ...summary,
            transDate: moment(date).format('DD/MM/YYYY')
          }
        }
        else{
          return { ...summary }
        }
      })
      setSummaryData(updatedSummaryData)
    }
  }

// console.log(isAmountTallied,"trttewq");

  return (
    <div>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ width: 60 }} />
              <TableCell align="center" sx={{ width: 200 }}><strong>Payment Method</strong></TableCell>
              <TableCell align="center" sx={{ width: 200 }}><strong>Trans Date</strong></TableCell>
              <TableCell align="center" sx={{ width: 220 }}><strong>Bank / Cash</strong></TableCell>
              <TableCell align="center" sx={{ width: 180 }}><strong>Reference Number</strong></TableCell>
              <TableCell align="center" sx={{ width: 120 }}><strong>Amount</strong></TableCell>
              {
                custType !== 'CUSTOMER' &&
                <TableCell align="center" sx={{ width: 100 }}><strong>Balance</strong></TableCell>
              }
            </TableRow>
          </TableHead>
          <TableBody>
            {pModes.map((item, key) => {
              const isChecked = selectedPayments.includes(item.paymentId);
              const isUpiOrNeft = ['UPI', 'NEFT / RTGS / IMPS'].includes(item.payment_type);
              const isAnyUpiNeftSelected = pModes.some(
                (p) => selectedPayments.includes(p.paymentId) && ['UPI', 'NEFT / RTGS / IMPS'].includes(p.payment_type)
              );
              return (
                <TableRow key={key}>
                  <TableCell align="center" sx={{ width: 60 }}>
                    <Checkbox
                      checked={isChecked}
                      disabled={(isAmountTallied && !isChecked) || (isUpiOrNeft && isAnyUpiNeftSelected && !isChecked) || (custType === 'CUSTOMER' && ((selectedPayments.length > 0 && !selectedPayments.includes(item.paymentId)) || selectionModel.filter(s => ['Credit Note', 'Unused Credit'].includes(s.type)).length > 0))}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        let updatedPayments = [...selectedPayments];

                        if (checked) {
                          if (isUpiOrNeft) {
                            updatedPayments = updatedPayments.filter(
                              (id) => !pModes.find((p) => p.paymentId === id && ['UPI', 'NEFT / RTGS / IMPS'].includes(p.payment_type))
                            );
                          }
                          if(setSummaryData){
                            setSummaryData((prev) => ([...prev, {paymentCreditNoteId: item.paymentId, sale_id: [], isCreditNote: false, transDate: moment().format('DD/MM/YYYY')}]))
                          }
                          updatedPayments.push(item.paymentId);
                          if (item.payment_type === 'Cash' && locateCashBox.length === 1) {
                            const defaultCashBox = locateCashBox[0];
                            let arr = pModes.map((v, i) => {
                              if (key === i) {
                                return {
                                  ...v,
                                  selectedCashBox: defaultCashBox,
                                  tempCashBox: defaultCashBox,
                                  amount: 0,
                                  balance: v.tempBalance !== undefined ? v.tempBalance : v.balance,
                                  lastDigit: v.tempLastDigit || v.lastDigit || '',
                                  referenceNo: v.tempReferenceNo || v.referenceNo || '',
                                  cardReferenceNo: v.tempCardReferenceNo || v.cardReferenceNo || '',
                                  axisType: v.tempAxisType || v.axisType || '',
                                  transDate: moment(receiptDate).format('YYYY-MM-DD')
                                };
                              }
                              return v;
                            });
                            setpModes(arr);
                            Dropdown(defaultCashBox, item.paymentId, item.payment_type);
                            setSelectedCashBoxes((prev) => ({
                              ...prev,
                              [item.paymentId]: true,
                            }));
                          } else if (item.payment_type === 'Cash' && locateCashBox.length > 1) {
                            setSelectedCashBoxes((prev) => ({
                              ...prev,
                              [item.paymentId]: false,
                            }));
                          } else if (item.payment_type === 'Cash' && locateCashBox.length === 0) {
                            setSelectedCashBoxes((prev) => ({
                              ...prev,
                              [item.paymentId]: false,
                            }));
                          }
                          else{
                            let arr = pModes.map((v, i) => {
                              if (key === i) {
                                return {
                                  ...v,
                                  selectedCashBox: null,
                                  tempCashBox: null,
                                  amount: advanceAmount ? advanceAmount : v.tempAmount !== undefined ? v.tempAmount : v.amount,
                                  balance: v.tempBalance !== undefined ? v.tempBalance : v.balance,
                                  lastDigit: v.tempLastDigit || v.lastDigit || '',
                                  referenceNo: v.tempReferenceNo || v.referenceNo || '',
                                  cardReferenceNo: v.tempCardReferenceNo || v.cardReferenceNo || '',
                                  axisType: v.tempAxisType || v.axisType || '',
                                  transDate: moment(receiptDate).format('YYYY-MM-DD')
                                };
                              }
                              return v;
                            });
                            setpModes(arr);
                          }

                          if(advanceAmount !== '' && advanceAmount !== null){
                            createData(`${item.payment_type} (INR)`, advanceAmount, advanceAmount, item.paymentId)
                          }
                        } else {
                          updatedPayments = updatedPayments.filter((id) => id !== item.paymentId);
                          if(setSummaryData){
                            setSummaryData(summaryData.filter(summary => summary.paymentCreditNoteId !== item.paymentId))
                          }
                          setSelectedCashBoxes((prev) => ({
                            ...prev,
                            [item.paymentId]: false,
                          }));
                          let arr = pModes.map((v, i) => {
                            if (key === i) {
                              return {
                                ...v,
                                amount: 0,
                                balance: 0,
                                lastDigit: '',
                                referenceNo: '',
                                cardReferenceNo: '',
                                axisType: '',
                                selectedCashBox: null,
                                tempAmount: v.amount,
                                tempBalance: v.balance,
                                tempLastDigit: v.lastDigit,
                                tempReferenceNo: v.referenceNo,
                                tempCardReferenceNo: v.cardReferenceNo,
                                tempAxisType: v.axisType,
                                tempCashBox: v.selectedCashBox || selectedCashBoxes[v.paymentId],
                              };
                            }
                            return v;
                          });
                          setpModes(arr);

                          // if(advanceAmount !== '' && advanceAmount !== null){
                          setTdata(Tdata.filter(data => data.paymentId !== item.paymentId))
                          // }
                        }
                        setSelectedPayments(updatedPayments);
                      }}

                    />
                  </TableCell>

                  <TableCell align="left" sx={{ width: 200 }}>
                    <Box display="flex" justifyContent="left" alignItems="center" className='table-content'>
                      {item.payment_type !== 'Cash' ? (
                        item.paymentName || item.payment_type
                      ) : !isChecked ? (
                        item.paymentName || item.payment_type
                      ) : (
                        <Box >
                          {locateCashBox.length === 1 ? (
                            <TextField
                              label="CashBox"
                              variant="outlined"
                              size="small"
                              value={pModes.find((p) => p.paymentId === item.paymentId)?.selectedCashBox?.name || ''}
                              InputProps={{
                                readOnly: true,
                              }}
                            />
                          ) : locateCashBox.length > 1 ? (
                            <Autocomplete
                              disablePortal
                              options={locateCashBox}
                              getOptionLabel={(option) => option.name}
                              value={pModes.find(
                                (p) => p.paymentId === item.paymentId
                              )?.selectedCashBox || null}
                              onChange={(e, val) => {
                                Dropdown(val, item.paymentId, item.payment_type);
                                let arr = pModes.map((v, i) => {
                                  if (key === i) {
                                    return {
                                      ...v,
                                      selectedCashBox: val,
                                      tempCashBox: val,
                                    };
                                  }
                                  return v;
                                });
                                setpModes(arr);
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Select CashBox"
                                  variant="outlined"
                                  size="small"
                                  sx={{ minWidth: 160 }}
                                />
                              )}
                            />
                          ) :
                            <TextField
                              label="CashBox"
                              variant="outlined"
                              size="small"
                              value="No CashBox"
                              InputProps={{
                                readOnly: true,
                              }}
                            />
                          }
                        </Box>
                      )}
                      {/* {item.payment_type === 'Card' && isChecked && (
                        <Box ml={4} >
                          <RadioGroup
                            row
                            name={`axisCardOption-${item.paymentId}`}
                            value={item.axisType || ''}
                            defaultValue="credit"
                            
                            onChange={(e) => {
                              Change(e, key);
                              setTimeout(() => {
                                lastDigitRefs.current[item.paymentId]?.focus();
                              }, 100); 
                            }}
                          >
                            <FormControlLabel value="credit"  control={<Radio size="small" />} label="Credit" />
                            <FormControlLabel value="debit" control={<Radio size="small" />} label="Debit" />
                          </RadioGroup>
                        </Box>
                      )} */}
                    </Box>
                  </TableCell>

                  <TableCell align="center" sx={{ width: 200 }}>
                    {
                      isChecked ? 
                        <LocalizationProvider dateAdapter={DateAdapter}>
                          <DatePicker
                            label = 'Trans Date'
                            value = {item.payment_type === 'Cheque' ? chequeInfo.chequeDate : item?.transDate || moment(receiptDate).format('YYYY-MM-DD')}
                            onChange={(date) => handleDateChange(item.paymentId, key, date, item.payment_type === 'Cheque')}
                            disabled={item.payment_type === 'Cash'}
                            slotProps={{ textField: { fullWidth: true, variant: 'outlined', onKeyDown: e => e.preventDefault() } }}
                          />
                        </LocalizationProvider>
                      : ''
                    }
                  </TableCell>

                  <TableCell align="center" sx={{ width: 200 }}>
                    {item.bankName ? item.bankName : item.paymentName}
                  </TableCell>

                  {/* <TableCell align="left" sx={{ width: 180, height: 56 }}>
                    {isChecked && item.payment_type === 'UPI' || type === 'NEFT / RTGS / IMPS' ? (
                      <Box display="flex" justifyContent="left" alignItems="center">
                        <TextField
                          name='referenceNo'
                          label='Enter Reference Number'
                          variant='outlined'
                          size="small"
                          value={referenceNo || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setReferenceNo(val);
                          }}
                          onBlur={() => {
                            if (referenceNo?.trim().length > 0) {
                              setTimeout(() => {
                                amountRefs.current[item.paymentId]?.focus();
                              }, 100);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && referenceNo?.trim().length > 0) {
                              amountRefs.current[item.paymentId]?.focus();
                            }
                          }}
                          error={referenceNoErr}
                          helperText={referenceNoErr ? "Required!" : ''}
                          sx={{ width: '80%' }}
                          required
                        />
                      </Box>
                    ) : (
                      <Box height={40} />
                    )}
                  </TableCell> */}

                  <TableCell align="left" sx={{ width: 180, height: 56 }}>
                    {isChecked && (
                      ['UPI', 'NEFT', 'RTGS', 'IMPS', 'NEFT / RTGS / IMPS'].includes(item.payment_type) ? (
                        <Box display="flex" justifyContent="left" alignItems="center">
                          <TextField
                            name='referenceNo'
                            label='Enter Reference Number'
                            variant='outlined'
                            size="small"
                            value={item.referenceNo || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setReferenceNo(val);

                              const updatedPaymentModes = pModes.map((v, i) => {
                                if (key === i) {
                                  return {
                                    ...v,
                                    referenceNo: val,
                                  }
                                }
                                else{
                                  return v
                                }
                              })
                              setpModes(updatedPaymentModes)
                            }}
                            onBlur={() => {
                              if (referenceNo?.trim().length > 0) {
                                setTimeout(() => {
                                  amountRefs.current[item.paymentId]?.focus();
                                }, 100);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && referenceNo?.trim().length > 0) {
                                amountRefs.current[item.paymentId]?.focus();
                              }
                            }}
                            error={referenceNoErr}
                            helperText={referenceNoErr ? "Required!" : ''}
                            sx={{ width: '80%' }}
                            required
                          />
                        </Box>
                      ) : item.payment_type === 'Card' ? (
                        <Box display="flex" justifyContent="left" alignItems="center">
                          <TextField
                            id='outlined-basic'
                            size='small'
                            fullWidth
                            name='cardReferenceNo'
                            label='Enter Reference Numbe'
                            sx={{ width: '80%' }}
                            value={item.referenceNo || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setReferenceNo(val);

                              const updatedPaymentModes = pModes.map((v, i) => {
                                if (key === i) {
                                  return {
                                    ...v,
                                    referenceNo: val,
                                  }
                                }
                                else{
                                  return v
                                }
                              })
                              setpModes(updatedPaymentModes)
                            }}
                            onBlur={() => {
                              if (referenceNo?.trim().length > 0) {
                                setTimeout(() => {
                                  amountRefs.current[item.paymentId]?.focus();
                                }, 100);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && referenceNo?.trim().length > 0) {
                                amountRefs.current[item.paymentId]?.focus();
                              }
                            }}
                            InputLabelProps={{
                              style: {
                                paddingTop: '2px',
                              },
                            }}
                          />
                        </Box>
                      ) : item.payment_type === 'Cheque' ? (
                        <Box display="block" alignItems='center' justifyContent='left'>
                          <TextField
                            id='outlined-basic'
                            size='small'
                            fullWidth
                            name='chequeNo'
                            label='Cheque Number'
                            sx={{ width: '80%' }}
                            value={chequeInfo.chequeNumber}
                            onChange={(e) => setChequeInfo((prev) => ({ ...prev, chequeNumber: e.target.value }))}
                            // onBlur={() => {
                            //   if (chequeInfo.chequeNumber?.trim().length > 0) {
                            //     setTimeout(() => {
                            //       amountRefs.current[item.paymentId]?.focus();
                            //     }, 100);
                            //   }
                            // }}
                            // onKeyDown={(e) => {
                            //   if (e.key === 'Enter' && chequeInfo.chequeNumber?.trim().length > 0) {
                            //     amountRefs.current[item.paymentId]?.focus();
                            //   }
                            // }}
                            error={!(/^\d{6,10}$/.test(chequeInfo.chequeNumber)) && chequeInfo.chequeNumber !== null}
                            helperText={!(/^\d{6,10}$/.test(chequeInfo.chequeNumber)) && chequeInfo.chequeNumber !== null ? 'Invalid Cheque Number' : ''}
                            InputLabelProps={{
                              style: {
                                paddingTop: '2px',
                              },
                            }}
                          />

                          <br />
                          <br />

                          <TextField
                            id='outlined-basic'
                            size='small'
                            fullWidth
                            name='bankName'
                            label='Bank Name'
                            sx={{ width: '80%' }}
                            value={chequeInfo.bankName}
                            onChange={(e) => setChequeInfo((prev) => ({ ...prev, bankName: e.target.value }))}
                            // onBlur={() => {
                            //   if (chequeInfo.bankName?.trim().length > 0) {
                            //     setTimeout(() => {
                            //       amountRefs.current[item.paymentId]?.focus();
                            //     }, 100);
                            //   }
                            // }}
                            // onKeyDown={(e) => {
                            //   if (e.key === 'Enter' && chequeInfo.bankName?.trim().length > 0) {
                            //     amountRefs.current[item.paymentId]?.focus();
                            //   }
                            // }}
                            InputLabelProps={{
                              style: {
                                paddingTop: '2px',
                              },
                            }}
                          />
{/* 
                          <br />
                          <br />

                          <LocalizationProvider dateAdapter={DateAdapter}>
                            <DatePicker
                              label = 'Cheque Date'
                              value = {chequeInfo.chequeDate}
                              onChange={(date) => setChequeInfo((prev) => ({ ...prev, chequeDate: moment(date).format('YYYY-MM-DD') }))}
                              renderInput = {(params) => (
                                <TextField
                                  {...params}
                                  fullWidth
                                  variant='outlined'
                                  onKeyDown={e => e.preventDefault()}
                                />
                              )}
                              InputLabelProps={{
                                style: {
                                  paddingTop: '2px',
                                },
                              }}
                              onBlur={() => {
                                if (chequeInfo.chequeNumber?.trim().length > 0) {
                                  setTimeout(() => {
                                    amountRefs.current[item.paymentId]?.focus();
                                  }, 100);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && chequeInfo.chequeNumber?.trim().length > 0) {
                                  amountRefs.current[item.paymentId]?.focus();
                                }
                              }}
                            />
                          </LocalizationProvider> */}
                        </Box>
                      ) : (
                        <Box height={40} />
                      )
                    )}

                  </TableCell>

                  <TableCell align="center" sx={{ width: 100 }} className='table-content'>
                    {isChecked && (
                      <Box display="flex" justifyContent="left" alignItems="center">
                        <TextField
                          id='outlined-basic'
                          size='small'
                          fullWidth
                          inputRef={(el) => (amountRefs.current[item.paymentId] = el)}
                          name="amount"
                          style={{ backgroundColor: 'white', paddingBottom: '0px' }}
                          placeholder="0.00"
                          type="number"
                          variant='outlined'
                          value={item.amount || ''}
                          disabled={
                            (item.payment_type === 'Cash' && !selectedCashBoxes[item.paymentId])
                            // (item.payment_type === 'Card') ||
                            // (item.payment_type === 'Net Banking' && (!referenceNo || referenceNo.trim() === '')) ||
                            // (isUpiOrNeft && (!referenceNo || referenceNo.trim() === ''))
                          }
                          onKeyDown={(e) => {
                            const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', '.']
                        
                            if (['e', 'E', '+', '-'].includes(e.key) || (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key))) {
                                e.preventDefault()
                            }
                          }}
                          onWheel={e => e.target.blur()}
                          onChange={(e) => handleAmountChange(e, item, key)}
                          onBlur={() => setFocusedPaymentId(null)}
                          slotProps={{ input: { disableUnderline: true } }}
                        />
                      </Box>
                    )}
                  </TableCell>

                  {
                    custType !== 'CUSTOMER' &&
                    <TableCell align="center" sx={{ width: 100 }}>
                      {isChecked ? (!isNaN(parseFloat(item?.total)) ? parseFloat(item?.total).toFixed(2) : selectedTotal?.toFixed(2)) : ''}
                    </TableCell>
                  }
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>


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
        setStateCashBoxInfo={setNormalCashBoxInfo}
        posId={posId}
        cashOutIn_denomination={cashOutIn_denomination}
        responseType={responseType}
      />
    </div>
  );
};

export default NewPaymentTable;
