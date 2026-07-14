import React, {useState, useEffect, useContext, useRef, createRef} from 'react';
import {connect} from 'react-redux';
import {
  Card,
  CardContent,
  // Button,
  InputLabel,
  MenuItem,
  FormHelperText,
  FormControl,
  Select,
  TextField,
  Grid,
  Autocomplete,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
// import MomentUtils from "@date-io/moment";
import ReceivingsItems from './ReceivingsItems';
import ItcClassificationControl from 'components/gst/ItcClassificationControl';
import { gstItcBlockReasonListAction } from 'redux/actions/gstItcBlockReason.actions';
import GstTable from './GstTable';
import context from '../../../context/CreateNewButtonContext';
import UnSavedChangesWarning from '../../common/unChangeswarning';
import {chartOfAccountsIdNameAction} from '../../../redux/actions/chartOfAccounts';
import CancelDialog from '../../../components/CancelDialog';
import ActionButton from './actionButton';
import PaymentDialog from '../paymentSalesPurchase/Dialog';
import {createTheme} from '@mui/material/styles';
import {Close, Add,Edit} from '@mui/icons-material';
// import {formLabelsTheme} from "../../components/Asterisk";
import {useDispatch, useSelector} from 'react-redux';
import {creditDebitNoteSeq, creditDebitNoteSeqUpdate, getBillingcompany, sendMail} from '../../../redux/actions/sales_actions';
// import {paymentEntry} from '../../redux/actions/purchase_actions';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import {getTrimmedData} from '../../../components/trimFunction/index';
import {getDateTimeFormat} from '../../../utils/getTimeFormat';
import {sendNtfy} from '../../../firebase/firebase.service';
import {
  getLoginRoleAction,
  getLoginTokenAction,
} from '../../../redux/actions/userRole_actions';
import Cookies from 'universal-cookie';
import notificationType from '../../../firebase/notify_type';
import {checkEachBarcodeWasEntered} from '../sales/sale_status_list';
import {
  Purchase,
  Inventory,
  SGST_Receivable,
  CGST_Receivable,
  IGST_Receivable,
  Account_Payable,
} from '../../../utils/ledgers';
import { CreateNotificationAction } from 'redux/actions/notification_actions';
import _ from 'lodash';
import { getsessionStorage } from 'pages/common/login/cookies';
import apiCalls from 'utils/apiCalls';
import { getSupplierDetailsByIdAction, listVendorIdAndNameAction, vendorPriceListDropDownAction, filterPriceListProductAction, setInvoiceTempAction, getSupplierDetailsByIdreceivings_itemsAction, getSearchByVendorAction } from 'redux/actions/vendor_actions';
import { listProductAction, listProductActionByType } from 'redux/actions/product_actions';
import { listStockLocationSequenceAction } from 'redux/actions/stock_Location_actions';
import { roleType } from 'utils/roleType';
import { getAppConfigDataAction, getAppConfigDataBasedOnTypeAction } from 'redux/actions/app_config_actions';
import { checkInvoiceNumberExistAction, GetTdsTaxes, listPurchasesPaginateAction } from 'redux/actions/purchase_actions';
//import { DateTimePicker } from 'formik-material-ui-pickers';
import { DateTimePicker } from '@mui/x-date-pickers';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import { ManualSalesPurchase } from 'redux/actions/manualNotes_actions';
import { useCustomFetch } from 'utils/useCustomFetch';
import { useLocation } from 'react-router-dom';
import API_URLS from '../../../utils/customFetchApiUrls';
import { listTaxCategoryAction } from 'redux/actions/tax_Category_actions';
import SearchIcon from '@mui/icons-material/Search';
import { getPurchaseSuppliersByIdAction, getSearchByVendorDataAction, setSearchByVendorDataAction } from '../../../redux/actions/vendor_actions';
import { searchErrorMessage } from '../../../utils/content';
import toMomentOrNull from 'utils/DateFixer';
// import AppHeader from '@crema/core/AppLayout/DefaultLayout/AppHeader';

const rootSx = {
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  height: 'calc(100dvh - 95px)',
  maxHeight: 'calc(100dvh - 95px)',
  minHeight: 0,
  width: '100%',
  overflow: 'hidden',
};
const widthSx = {
  width: '100%',
  height: '100%',
  minHeight: 0,
  overflowY: 'auto',
  overflowX: 'hidden',
  boxSizing: 'border-box',
  p: { xs: 2, sm: 2.5, md: 3 },
};
const headStyle = {
  display: 'flex',
};
const taxHeadStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
};

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

const Popup = (props) => {
  console.log("props",props)
  const storage = getsessionStorage()
  const [suppliers, setsuppliers] = useState(true);
  const [itemsData, setitemsData] = useState([]);
  // GST classification for the purchase bill (header-level on pos_receivings).
  // Defaults match the DB defaults so legacy bills remain "eligible, not RCM".
  const [gstClassification, setGstClassification] = useState({
    itc_eligible: 1,
    itc_block_reason_id: null,
    is_rcm: 0,
  });
  const [getPay, setgetPay] = useState([]);
  const [add_click, setAdd_click] = useState(false)
  const [vendorId, setVendorId] = useState('') 
  const [showpopup, setshowpopup] = useState (false) 
  const receivingTimeRef = useRef(null);
  const [billNumber , setgetbillNum] = useState()
  const subcompany = storage?.subcompany
    // console.log('itemsData',itemsData)
  const {
    UserRoleReducer: { loginToken, loginRole },
    vendorReducer: { vendorIdAndName: vendor, vendorPriceListDropDown, vendorPriceListProduct },
    productReducer: { product },
    appConfigReducer: {app_config_data,app_config_data_based_on_type},
    purchasesReducer:{tds_taxrate,purchasesByPagination},
    salesReducer:{credit_debit_seq, getbillingcompanydetails},
    gstItcBlockReasonReducer: { list: itcBlockReasons },
  } = useSelector((state) => state);

  // const random6 = () => Math.floor(100000 + Math.random() * 900000)
// console.log('vendorPriceListProduct', vendorPriceListProduct)
  const [formValues, setformValues] = useState({
    receiving_time: moment(),
    supplier_id: '',
    comment: '',
    payment_type: '',
    reference: '',
    location_id: '',
    po_number: ``,
    invoice_number: '',
    note: '',
    tax_types: "1",
    tcs:"",
    tds:"",
    tcs_percent:"0%",
    tds_percent:"0%",
    tds_id: null,
    po_id: '',
    tax_id : null,
    sub_company_id : null,
    rounded_off : '0.00'
    // priceList: ''
  });

  //  console.log("formValuesformValues",formValues, formValues.tcs, formValues.tds_id, formValues.tds, formValues.tcs_percent, formValues.tds_percent)
  const [formErrors, setFormErrors] = useState({
    supplier_id: null,
    location_id: null,
    invoice_number: null,
  });
    // const [selectedTds, setSelectedTds] = useState("");
    // const [searchText, setSearchText] = useState("");

  const [checkerror, setcheckerror] = useState({
    supplier_id: false,
    // payment_type: false,
    invoice_number:false,
    location_id: false,
  });
  const addActionRef = createRef();
  const [Prompt, setDirty, setPristine] = UnSavedChangesWarning();
  const [initialState, setInitialState] = useState({});
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState(false);
  const tempinitform = useRef(null);
  const tempinit = useRef(null);
  const tempedit = useRef(null);
  const tempselect = useRef(null);
  const tempLocation = useRef(null);
  // const lastPotCodeSeq = useRef(null);
  const [paymentOpen, setpaymentOpen] = useState(false);
  const [Tdata, setTdata] = useState([]);
  const [posSeq, setposSeq] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    // Populate the ITC block reason dropdown (used by the GST classification control).
    if (!itcBlockReasons || itcBlockReasons.length === 0) {
      dispatch(gstItcBlockReasonListAction());
    }
  }, [dispatch]);
  const [selectionModel, setSelectionModel] = React.useState([]);
  const [entryvalue, setHandleEntry ] = useState(false)
  const tempinitsform = useRef(null);
  const [insertId, setInsertId] = useState(0);
  const [vendLedgerId, setvendLedgerId] = useState('');
  const [purData, setPurcData] = useState('');
  const [requiredFields] = useState(['invoice_number']);
  const [regex] = useState({});
  const [poOption,setPoOption] = useState('2')
  const [tcstaxvisible, settcstaxvisible] = useState(false)
  const [optionstax, setoptionstax] = useState('0');
  const [Rdata ,setRData]=useState()
  const [productResetDialog, setProductResetDialog] = useState(false)
  const [oldPurchaseStatus, setOldPurchaseStatus] = useState(null)
  const {pathname} = useLocation()
  const [billnumber,setBillnumber] = useState(null);
  const [vendorSearchText, setVendorSearchText] = useState('')
  const [prefillApplied, setPrefillApplied] = useState(false)
  const {
    setModalStatusHandler,
    setModalTypeHandler,
    selectData,
    setselectData,
    setLoaderStatusHandler,
    locationId,
    headerLocationId,
    commoncookie,
  } = useContext(context);
const fallbackEditData = purchasesByPagination?.find((p) => p.bill_number === billnumber);
const finalEditData = props.edit_data || fallbackEditData;
  useEffect(() => {
    if (props.pageType === '/sales/bills') {
      setPoOption('2');
    }else{
      setPoOption('1');
    }
  }, [props.pageType]);

  useEffect(() => {
    if (!props.initialPurchaseProduct) {
      if (prefillApplied) {
        setPrefillApplied(false)
      }
      return
    }

    if (prefillApplied || props.status === 'edit' || itemsData.length > 0) {
      return
    }

    const matchedProduct = product.find((item) =>
      (props.initialPurchaseProduct?.item_id && item.item_id === props.initialPurchaseProduct.item_id) ||
      item.name === props.initialPurchaseProduct?.product_name
    )

    const sourceProduct = matchedProduct || {
      item_id: props.initialPurchaseProduct?.item_id ?? '',
      name: props.initialPurchaseProduct?.product_name ?? '',
      description: '',
      cost_price: 0,
      unit_price: 0,
      taxes: [],
      qty_per_pack: '',
      is_serialized: 0,
      hsn_code: '',
      max_price: 0,
      model: '',
      tax_category_id: null,
    }

    let gst = 0
    let tax_category = ''

    sourceProduct.taxes?.forEach((tax) => {
      if (tax.tax_group === 'IGST') {
        gst = tax.tax_rate
        tax_category = tax.tax_category
      }
    })

    setitemsData([
      {
        name: sourceProduct.name || props.initialPurchaseProduct?.product_name || '',
        item_id: sourceProduct.item_id || '',
        description: sourceProduct.description || '',
        item_cost_price: sourceProduct.cost_price || 0,
        item_unit_price: sourceProduct.unit_price || 0,
        received_quantity: 1,
        ordered_quantity: 1,
        gst,
        tax_category_id: sourceProduct.tax_category_id || null,
        tax_category,
        quantity: 1,
        taxes: sourceProduct.taxes || [],
        sub_total: singleTax(sourceProduct.cost_price || 0, 1, sourceProduct).toFixed(2),
        prod_val: true,
        lots: [],
        qty_per_pack: sourceProduct.qty_per_pack || '',
        is_serialized: sourceProduct.is_serialized || 0,
        line: 1,
        hsn_code: sourceProduct.hsn_code || '',
        max_price: sourceProduct.max_price || 0,
        model: sourceProduct.model || '',
        price_list_id: 0,
        receiving_quantity: 1,
      },
    ])
    setPrefillApplied(true)
    props.onInitialPurchaseProductConsumed?.()
  }, [props.initialPurchaseProduct, props.status, itemsData.length, prefillApplied, product])

  useEffect(()=>{
    subcompany > 0 && dispatch(getBillingcompany())
  },[subcompany])
  
  useEffect(() => {
    if (itemsData.length > 0 && oldPurchaseStatus === '2' && poOption === '1') {
      setProductResetDialog(true);
      setOldPurchaseStatus('2');
    }
  }, [poOption]);
  
  useEffect(() => { (async () => {
    if(props.pageType === '/sales/bills' && formValues.supplier_id !== null && formValues.supplier_id !== '' && formValues.invoice_number !== null && formValues.invoice_number !== '' && props.returnState === false){
      const handler = setTimeout(() => {
          dispatch(checkInvoiceNumberExistAction({invoice_number: formValues.invoice_number, supplier_id: formValues.supplier_id}, async(response) => {
              const res = await response
              if(res.status === 'Exist'){
                  setFormErrors((prev) => ({ ...prev, invoice_number: 'Invoice Number Already Exist' }))
              }
              else{
                  setFormErrors((prev) => ({ ...prev, invoice_number: null }))
              }
          }))
      }, 1500)

      return () => clearTimeout(handler)
    }
  })();
}, [props.pageType, formValues.supplier_id, formValues.invoice_number,props.returnState])

  useEffect(() => {
      let type='debit'
      let productType='purchase'
      // apiCalls(
      //   setModalTypeHandler,
      //   setLoaderStatusHandler,
        // dispatch(listVendorIdAndNameAction()),
        dispatch(listProductActionByType(productType)),
        !vendorPriceListDropDown.length && dispatch(vendorPriceListDropDownAction()),
        !props.returnState && dispatch(GetTdsTaxes(props.status, 'null')),
        dispatch(creditDebitNoteSeq(type)),
        dispatch(listTaxCategoryAction('', setLoaderStatusHandler))
        dispatch(setSearchByVendorDataAction([]))
      // )
 
 
  }, [])

  console.log('props.status', props.status, props.returnState)
  useEffect(() => {
          props.returnState && dispatch(GetTdsTaxes(props.status, formValues.tds_id))
          
      }, [formValues.tds_id])
  

  useEffect(() => {
    if (receivingTimeRef?.current) {
      setTimeout(() => {
        receivingTimeRef?.current?.focus();
      }, 100);
    }
  }, []);

  // const filteredOptions = tds_taxrate?.filter((option) =>
  //   option?.category?.toLowerCase()?.includes(searchText?.toLowerCase())
  // );
  
console.log('tds_taxrate', tds_taxrate)

  useEffect(() => {
    if (poOption === '1') {
      setformValues((prev) => ({ ...prev, invoice_number : '' }))
    }
  }, [poOption])

  useEffect(() => {

      if (itemsData.length) {
        let item_id = itemsData.map((m) => m.item_id)
        let payload = {
          item_id,
          vendor_id: vendorId
        }
        dispatch(filterPriceListProductAction(payload, (result) => {
          const updatedDealerPrice = itemsData.map(itemA => {
  
            const matchingItem = result?.find(itemB => itemB.item_id === itemA.item_id);
            // console.log('matchingItems', matchingItem)
            if (matchingItem) {
              // Update item_cost_price in itemsData with dealerPrice from matching item in vendorPriceListProduct
              return { ...itemA, item_cost_price: matchingItem.dealerPrice, sub_total: singleTax(matchingItem.dealerPrice, 1, itemA).toFixed(2), price_list_id: matchingItem.price_id, price_list_mrp : matchingItem.mrp };
            } else {
              return { ...itemA };
            }
          });
          setitemsData(updatedDealerPrice)
        }))
      }
  

  }, [vendorId])

    const singleTax = (prc = 0, qty = 1, data) => {
    const val = prc * qty + ((prc * qty) / 100) * getIgst(data);
    return val;
  };

  //  const getIgst = (data) => {
  //   let tax = '';

  //   console.log('getigsttttt', data)
  //   if (data.taxes) {
  //     data.taxes.forEach((t) => {
  //       if (t.tax_group === 'IGST') {
  //         tax = t.tax_rate;
  //       }
  //     });
  //   }
  //   return tax;
  // };

  const getIgst = (data) => {
    let tax = '';

    if (data.taxes) {
      data.taxes.forEach((t) => {
        if (t.tax_group === 'IGST') {
          tax = t.tax_rate;
        }
      });
    }
    if (tax === '' || tax === null || tax === undefined) {
      if (data?.gst !== undefined && data?.gst !== null && data?.gst !== '') {
        tax = Number(data.gst) || 0;
      } else if (data?.tax_rate !== undefined && data?.tax_rate !== null && data?.tax_rate !== '') {
        tax = Number(data.tax_rate) || 0;
      } else {
        const cgst = Number(data?.cgst_tax_rate) || 0;
        const sgst = Number(data?.sgst_tax_rate) || 0;
        const igst = Number(data?.igst_tax_rate) || 0;
        tax = igst || (cgst + sgst);
      }
    }
    return tax;
  };
  

  const creditSequenceUpdate = () => {
    let type = 'debit'
    const { sequence_id, current_seq } = credit_debit_seq;
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
    // console.log("sequence_id, current_seq",sequence_id, current_seq)
     dispatch(creditDebitNoteSeqUpdate(type, { sequence_id, current_seq })),
    )

  };


  // useEffect(() => {
  //   if (props.status !== 'edit' && props.status !== 'New') {
  //     const po = props.stocklocation.find(d => d.location_id === formValues.location_id) || {}
  //     const po_number = po.sequence_pattern || ''
  //     setposSeq(po)
  //     setformValues({ ...formValues, po_number })
  //   }
  // },[formValues.location_id, props.status])
  // useEffect(() => {
  //   let type='purchase'
  //   dispatch(getAppConfigDataBasedOnTypeAction(type))
  // }, [])
  useEffect(() => {
    if(props.type === 'returnFromPurchase'){
    const po =
        props.stocklocation.find(
          (d) => d.location_id === formValues.location_id,
        ) || {};
    if (props.status !== 'edit' && props.status !== 'New') {
      
      const po_number = po.sequence_pattern || '';
      setposSeq(po);
      setformValues({...formValues, po_number});
    }
    //  let email = app_config_data_based_on_type?.find(x=>x?.key_name === 'company.email')?.value??""
     let email = props.appConfigData ? props.appConfigData?.companyEmail : ''
    if(Object.keys(po).length){
      let locationData = {
        companyAddress: po.address ,
        companyEmail: po.email?? email,
        companyMobile: po.phone_number ,
        state: po.state ,
      }
      props.setAppconfigData(locationData)
    }
  
}},[formValues.location_id])
    
console.log(finalEditData, 'editData')
  const locationFunction = () => {
    if (props.type === 'returnFromPurchase' && headerLocationId && props.status !== 'edit') {
      const isLocation = props.stocklocation.find(
        (d) => d.location_id === headerLocationId,
      );
      let location_id = isLocation ? headerLocationId : formValues.location_id;
      setTimeout(() => {
        setformValues({...formValues, location_id});
        setcheckerror({...checkerror, location_id: false});
      }, 0);
    }
  };

  tempLocation.current = locationFunction;

  useEffect(() => {
    if(props.type === 'returnFromPurchase'){
      
      tempLocation.current();
    }
    
  }, [headerLocationId]);

  const initsform = () => {
    if (props.type === 'returnFromPurchase') {
   
  }
  };

  tempinitsform.current = initsform;
  useEffect(() => {
    if(props.type === 'returnFromPurchase'){

      tempinitsform.current();
    }
  }, [formValues.location_id, props.status]);

  
  // const po =  props.stocklocation.find(
  //   (d) => d.location_id === formValues.location_id,
  // ) || {};

  const setStateHandler = async (name, value) => {
    let formObj = {};

    formObj = {
      ...formValues,
      [name]: value === '' ? null : value,
    };

    await setformValues((prev) => ({...prev, ...formObj}));
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
        value === 'undefined' ||
        (Object.keys(value) && value.value === null))
    ) {
      setFormErrors({
        ...formErrors,
        [name]: capitalize(name) + ' is Required!',
      });
    } else if (regex[name]) {
      if (!regex[name].test(value)) {
        setFormErrors({
          ...formErrors,
          [name]: capitalize(name) + ' is Invalid!',
        });
      } else {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
      }
    } else {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  const handleChange = (e) => {
    const {name, value} = e.target;
  console.log('nameeeeeeeeeeeeee', name, value)
    setformValues({...formValues, [name]: value});
    if (!value) {
      setcheckerror({...checkerror, [name]: true});
    } else {
      setcheckerror({...checkerror, [name]: false});
    }
    setStateHandler(name, value);
    if (name === 'tds_percent') {
      //console.log('valueeeeeeeeeeeeeeee', value)
      setformValues((prev) => ({ ...prev, tds_percent: (value?.tds_rate || 0), tds_id: value.id }))
    }
    // if(name === 'tds_percent'){
    //   setformValues((prev) => ({...prev, tds_percent: (value?.tds_rate || 0), tds_value: value}))
    // }
    else if(name === 'sub_company_id') {
      setformValues((prev) => ({...prev, tax_id: value.tax_id, sub_company_id: value.sub_company_id}))
    }
  };

  console.log('tcssss', formValues.tcs)
  // const Change = (e) => {
  //   let {value} = e.target;
  //   setoptionstax(value);
  // }
  // const tdshandleChange = (event) => {
  //   console.log('tdshandle', event.target.value)
  //   setSelectedTds(event.target.value);
  // };
  const initform = () => {
    setInitialState(formValues);
  };
  tempinitform.current = initform;
  useEffect(() => {
    // if(props.type === 'returnFromPurchase'){
      tempinitform.current();
    // }

  }, []);

  const init = () => {
    if (JSON.stringify(initialState) !== JSON.stringify(formValues)) {
      setDirty();
      setForm(true);
    } else {
      setPristine();
      setForm(false);
    }
  };
  tempinit.current = init;
  useEffect(() => {
    // if(props.type === 'returnFromPurchase'){
      tempinit.current();
    // }

  }, [formValues, initialState]);

  useEffect(() => {
    // if(props.type === 'returnFromPurchase' ){
      const {ledger_id} =
      vendor.find((d) => formValues.supplier_id === d.supplier_id) || {};
      setvendLedgerId(ledger_id);
    // }
   
  }, [formValues.supplier_id]);

  useEffect(() =>{
    // if(props.type === 'returnFromPurchase'){
      vendor.map((c) => {
        if (formValues.supplier_id === c.supplier_id) {
          if (c.tcs === 1) {
            settcstaxvisible(true);
          } else {
            settcstaxvisible(false);
          }
        }
        return null;
      });
    // }
    
  },[formValues.supplier_id])
  
  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const emptyCheck = () => {
    const errordata = checkerror;
    let isvalid = true;

    Object.keys(formValues).forEach((m) => {
      if (!formValues[m]) {
        if (['supplier_id', 'location_id'].includes(m)) {
          errordata[m] = true;
          isvalid = false;
        } else if (
          (props.status === 'edit'|| poOption === '2') &&
          ['supplier_id', 'location_id', 'invoice_number'].includes(m)
        ) {
          errordata[m] = true;
          setFormErrors({
            ...formErrors,
            [m]: capitalize(m) + ' is Required!',
          });
          isvalid = false;
        }
      }
      return null;
    });

    setcheckerror({...errordata});
    return isvalid;
  };

  const getCostPrice = () => {
    let total = 0;
    itemsData.forEach((d) => {
      total += +d.quantity * +d.item_cost_price;
    });
    return total.toFixed(2);
  };

  const ledgerApi = () => {
    const data = {
      // "code": "00",
      // "entity": "00",
      specialNumber: '00',
      note: 'Purchase Order',
      voucherTypeId: 1,
      location_id : formValues.location_id
    };
    const temp = {
      [Purchase]: {
        desc: 'Total cost price',
        amt: (untaxed()).toFixed(2),
      },
      // [Inventory]: {desc: 'Total cost price', amt: getCostPrice()},
      [SGST_Receivable]: {
        desc: 'SGST% x Total unit price',
        amt: (taxes() / 2).toFixed(2),
      },
      [CGST_Receivable]: {
        desc: 'CGST% x Total unit price',
        amt: (taxes() / 2).toFixed(2),
      },
      [IGST_Receivable]: {desc: 'IGST% x Total unit price', amt: 0},
      Vendor: {
        desc: 'Total purchase amount',
        amt: (untaxed() + taxes()).toFixed(2),
      },
      // [Account_Payable]: {desc: '', amt: (untaxed() + taxes()).toFixed(2)},
    };

    const body = { 
      id:[vendLedgerId],
      name: [Purchase,SGST_Receivable,CGST_Receivable,IGST_Receivable]
    }


    dispatch(chartOfAccountsIdNameAction(body, (list) => {

      const accountTransaction = [];
      list.forEach((d) => {
          const {id, creditSign, debitSign} = d;
        const dd = {accountId: id, description: temp[d.name]?.desc};

        if (
          [
            Purchase,
          ].includes(d.name)
        ) {
          // dd.amount =
          //   Number(debitSign) === 1
          //     ? temp[d.name]?.amt
          //     : `-${temp[d.name]?.amt}`;
          dd.amount = temp[d.name]?.amt
          accountTransaction.push(dd);
        } 
        else if([
          SGST_Receivable,
          CGST_Receivable,
          IGST_Receivable,
        ].includes(d.name)){
          dd.amount = -temp[d.name]?.amt
          accountTransaction.push(dd);
        }
        else if (vendLedgerId === id) {
          // dd.amount =
          //   Number(creditSign) === 1
          //     ? temp['Vendor']?.amt
          //     : `-${temp['Vendor'].amt}`;
          dd.amount = -temp['Vendor']?.amt
          dd.description = temp['Vendor'].desc;
          accountTransaction.push(dd);
        }
      
      })
      data.accountTransaction = accountTransaction;
      props.createTransactionAction(data, true);
    }))

    // const accountTransaction = [];
    // props.chartOfAccounts.forEach((d) => {
    //   const {id, creditSign, debitSign} = d;
    //   const dd = {accountId: id, description: temp[d.name]?.desc};

    //   if (
    //     [
    //       Purchase,
    //       SGST_Receivable,
    //       CGST_Receivable,
    //       IGST_Receivable,
    //     ].includes(d.name)
    //   ) {
    //     dd.amount =
    //       Number(debitSign) === 1
    //         ? temp[d.name]?.amt
    //         : `-${temp[d.name]?.amt}`;
    //     accountTransaction.push(dd);
    //   } 
    //   else if (vendLedgerId === id) {
    //     dd.amount =
    //       Number(creditSign) === 1
    //         ? temp['Vendor']?.amt
    //         : `-${temp['Vendor'].amt}`;
    //     dd.description = temp['Vendor'].desc;
    //     accountTransaction.push(dd);
    //   }
    // });

    // data.accountTransaction = accountTransaction;
    // props.createTransactionAction(data, true);
  };

  const ledgerPaymentApi = () => {
  const context = this.context;
    const data = {
      // "code": "234",
      // "entity": "324",
      location_id : formValues.location_id,
      specialNumber: '324',
      note: 'POS',
      voucherTypeId: 1,
    };
    const temp = {
      Vendor: {desc: '', amt: (untaxed() + taxes()).toFixed(2)},
      'Bank/Cash': {
        desc: 'Amount settled from Bank',
        amt: (untaxed() + taxes()).toFixed(2),
      },
    };
    const accountTransaction = [];
    props.chartOfAccounts.forEach((d) => {
      const {id, creditSign, debitSign} = d;
      const dd = {accountId: id, description: temp[d.name]?.desc};

      if ('Bank/Cash' === d.name) {
        dd.amount =
          Number(debitSign) === 1 ? temp[d.name]?.amt : `-${temp[d.name]?.amt}`;
        accountTransaction.push(dd);
      } else if (vendLedgerId === id) {
        dd.amount =
          Number(creditSign) === 1
            ? temp['Vendor']?.amt
            : `-${temp['Vendor']?.amt}`;
        dd.description = temp['Vendor']?.desc;
        accountTransaction.push(dd);
      }
    });
    data.accountTransaction = accountTransaction;
    // this.props.createTransactionAction(data,true,this.context.setLoaderStatusHandler)
  };
console.log(itemsData,props.status, 'itemsData')
console.log('formValues.tax_types', formValues.tds, formValues.tcs, formValues.tds_percent, formValues.tcs_percent, formValues.tds_id)
  const handleSubmit = async (isCancel, setDisable = () => {}) => {
  const truncateTo2Decimals = (num) => Math.floor(num * 100) / 100;
    const isvalid = emptyCheck();
    // const cookies = new Cookies();
    let storage = getsessionStorage()
    let receive_goods = 'received';
    let inventory = false;
    let alertFlog = false
    let costpricealert = false
    let received_qty = false

    if(itemsData.length && props.status === 'edit' || poOption === '2'){
      //  console.log("props",props)
      itemsData.map((i) =>{
          if(i.receiving_quantity !== i.lots.length && i.is_serialized === 1){
            alertFlog = true
          }
      })    
      itemsData.map((i) =>{
        if(i.item_cost_price === 0){
          costpricealert = true
        }
      }) 
      
      itemsData.map((i) => {
        const total_received = props.status === 'edit' ? i.previousRecievedQty + i.receiving_quantity : i.receiving_quantity;

        // if (total_received > i.ordered_quantity || i.received_quantity === 0) {
        //   received_qty = true;
        // }
      })
    } 
    //lot.length mismatching
    if(alertFlog){
      alert("Please Enter all barcodes")
      return 
    }else if( poOption === '2' && checkerror.invoice_number
    ){
      alert("Please Enter Invoice Number")
      return
    }
    if(costpricealert){
      alert('Please Enter All Buying Cost')
      return
    }
    if(received_qty){
      alert('Plese Check All Received Qty')
      return
    }

    
    const filter = itemsData.filter(d => d.receiving_quantity > 0).map((d, index) => {
      
      const {
        item_id,
        description,
        line,
        quantity,
        item_cost_price,
        item_unit_price,
        // discount,
        // discount_type,
        receiving_quantity,
        received_quantity,
        lots,
        taxes,
        receiving_id,
        is_serialized,
        qty_per_pack,
        receiving_item_id,
        ordered_quantity,
        price_list_id,
        name,
        po_id,
        po_item_id,
        company_id,
        hsn_code
      } = d;

      if (receiving_quantity > 0) {
        inventory = true;
      }


      if ((po_id == null || po_id === "") && poOption !== '2') {
        receive_goods = 'pending';
      }

      // } else if (is_serialized === 0 && received_quantity < ordered_quantity) {
      //   receive_goods = 'pending';
      // }

      const newData = {
        receiving_id,
        receiving_item_id,
        item_id,
        name,
        description,
        po_id,
        po_item_id,
        // barcode,
        line: index + 1,
        ordered_quantity,
        item_cost_price,
        item_unit_price,
        // discount,
        // discount_type,
        receiving_quantity,
        received_quantity,
        lots,
        qty_per_pack,
        is_serialized,
        price_list_id,
        tax_category_id: taxes?.length > 0 ? taxes[0].tax_category_id : (d?.tax_category_id || d?.receivings_tax_category_id || d?.category_id || null),
        company_id,
        hsn_code
      };

      if (is_serialized === 0 && +receiving_quantity) {
        // const newLots = [...lots];
        // const NewC = +receiving_quantity ;
        // if (NewC > 0) {
        //   for (let i = 0; i < NewC; i++) {
        //     newLots.push({lot_number: ''});
        //   }
        // }

        newData.lots = [];
      }

      return newData;
    });

    // console.log(filter,'filter')

    const newRowData = {...formValues,tds : calculatetdsTaxAmount(),tcs_percent : calculateTcsTaxRate()}
    setRData(newRowData)

   
    
    const newform = {...formValues};

   // delete newform.tds_id;
    delete newform.tcs_percent;
    delete newform.tds;
  //  delete newform.tax_types;

    console.log(newform,'newformnewform')

    const {
      receiving_time,
      payment_type,
      location_name,
      company_name,
      paid_amount: oldPaid = 0,
      status: oldStatus,
      receive_goods: db_receive_goods,
      db_inv_no,
      po_date,
      ...record
    } = newform;

   

    const receiving_taxes = {
      jurisdiction_id: 0,
      tax_type: 0,
      receiving_tax_basis: '0',
      receiving_tax_amount: '0',
      print_sequence: '1',
      name: '',
      rounding_code: 0,
      receiving_tax_code_id: 0,
      tax_category_id: 0,
      tax_rate: 0,
      tax_group: 0,
    };
    

    if (isvalid) {
      const bodyData = {
        pageCount : 0,
        numPerPage : 10,
        searchString: "",
      }
      setDisable(true);
      const old_amount = Tdata.reduce(function (acc, obj) {
        return acc + +obj.payment_amount;
      }, 0);

      const paid_amount = old_amount + +oldPaid;
      // setPurcData(paid_amount)

      const total = +((untaxed() + taxes()+tcstaxes()) - calculatetdsTaxAmount()).toFixed(2);
      const tds = calculatetdsTaxAmount();
      const tcs_percent = calculateTcsTaxRate();
      let status = oldStatus ? oldStatus : 'New';
      if (receive_goods === 'received') {
        inventory = true;
        status = 'Pending Payment';
      }

      if (db_receive_goods === 'received') {
        inventory = false;
      }

      // console.log("dfdf", props.status, poOption);
      if(poOption === '1' && props.status === 'create'){
        inventory = false;
      }



      if (inventory === true) {
        let emp_id = storage?.employee_id || '';
        dispatch(
          getLoginRoleAction(emp_id, (role_name, token, content) => {
            if (!roleType.includes(role_name)) {
              let notify_type = notificationType('product received');
              let notify_content = content?.filter(
                (m) => m.notification_type === notify_type,
              );
              let content_body = notify_content[0]?.body_msg
              if (notify_content.length) {
                sendNtfy(
                  token,
                  notify_content[0]?.title,
                  notify_content[0]?.body_msg,
                );
                dispatch(CreateNotificationAction({content_body:content_body,title:notify_content[0]?.title,time:getDateTimeFormat(new Date()),"active":"1"}))
              }
            }
          }),
        );

        // ledgerApi();
      }

      if (paid_amount >= +total && props.status === 'create') {
        status = 'Pending Goods';
      }
      if (
        paid_amount >= +total &&
        receive_goods === 'received' &&
        props.status === 'create' && total !== 0
      ) {
        status = 'Completed';
      }

      let new_payment_type = payment_type;
      if (paymentOpen) {
        new_payment_type = Tdata.filter((d) => d.payment_type)
          .map((d) => d.payment_type.split(' ')[0])
          .join(', ');
      }

      const fulldata = {
        ...record,
        total,
        tds,
        tcs_percent,
        receivings_items: filter,
        receive_goods,
        employee_id: storage?.employee_id,
        receiving_taxes,
        status: props.status,
        // GST / ITC classification — header-level on pos_receivings. Nested as
        // body.table_data.gst per the backend contract (purchase.model.js reads
        // it in createPurchase and updatePurchaseEntryPromise).
        gst: {
          itc_eligible: gstClassification.itc_eligible === 0 ? 0 : 1,
          itc_block_reason_id: gstClassification.itc_block_reason_id != null
            ? Number(gstClassification.itc_block_reason_id) : null,
          is_rcm: gstClassification.is_rcm === 1 ? 1 : 0,
        },
        transactionEntryData : {
          total_cost_price :getCostPrice(),
          total_unit_price:(untaxed()).toFixed(2),
          total_with_gst: ((untaxed() + taxes()+ tcstaxes())-calculatetdsTaxAmount()).toFixed(2),
          gst_inter: truncateTo2Decimals(taxes() / 2).toFixed(2),
          tcs_inter:(tcstaxes().toFixed(2)),
          tds_inter:(calculatetdsTaxAmount()),
          rounded_off : getRoundOff()
        }

      };
     
      const custData = getVendor();

      let data = {
        custData,
        appConfigData: props.appConfigData,
        invoice_number: record.po_number,
        sales_items: itemsData,
        email: custData.email,
        custType: 'VENDOR',
        soDate: record.receiving_time,
      };

      const paymentsAndNotify = () => {
        if (Tdata.length) {
          // ledgerPaymentApi()
          // const cookies = new Cookies();
          // let emp_id = cookies.get('login')?.employee_id || ''
          // dispatch(getLoginRoleAction(emp_id, (role_name, token, content) =>{
          //   if(role_name !== 'Administrator'){
          //     let notify_type = notificationType('purchase payment')
          //     let notify_content = content?.filter(m => m.notification_type === notify_type)
          //     if(notify_content.length){
          //       sendNtfy(token, notify_content[0]?.title, notify_content[0]?.body_msg)
          //     }
          //   }
          // }))
          let ledger = {
            receipt_data : Tdata
          }
          props.receivingsPayments(fulldata.receiving_id, ledger, (response) => {
            if (response === 200) {
             
              // const cookies = new Cookies();
              let storage = getsessionStorage()
              let emp_id = storage?.employee_id || '';
              dispatch(
                getLoginRoleAction(emp_id, (role_name, token, content) => {
                  if (roleType.includes(role_name)) {
                    let notify_type = notificationType('purchase payment');
                    let notify_content = content?.filter(
                      (m) => m.notification_type === notify_type,
                    );
                    if (notify_content.length) {
                      // let paymentRefid = Tdata.customer_id
                      // let vendorName =Tdata.custData.company_name
                      // let amount_value = Tdata.total
                      // let locationName = this.props.stocklocation.find(m => m.location_id === Tdata.location_id)
                      // let content_body =  `${paymentRefid} \n${vendorName} \n${amount_value} \n${locationName.location_name} `
                      // sendNtfy(token, notify_content[0]?.title,content_body)
                    }
                  }
                }),
              );
            }
          });
        }
      };

      if (props.status === 'create') {
        fulldata.paid_amount = paid_amount;
        fulldata.payment_type = new_payment_type;
        fulldata.status = status;
        fulldata.inventory = inventory;

        if (isCancel === true) {
          data = false;
        }
        // const {sequence_id, current_seq} = posSeq;
        setPurcData(paid_amount);
        // await props.posSequence(sequence_id, {
        //   current_seq,
        //   sequence_type: 'PO',
        //   headerLocationId,
        //   commoncookie,
        // });
        if(props.status !== 'edit' && poOption === '2'){
          fulldata.invoice_date = getDateTimeFormat(receiving_time);
        }
        // fulldata.lastPotCodeSeq = lastPotCodeSeq.current;

        // console.log('bodyDatapopup', bodyData)
        await props.createPurchasesAction(
          getTrimmedData(fulldata),
          true,
          setLoaderStatusHandler,
          null,
          data,
          (id) => {
            setInsertId(id);
            // props.receivingsPayments(id, Tdata)

            const {brand, category, location_id, max_price, min_price, name} =
              props.filtedValue;
              // lastPotCodeSeq.current = null;
            // const data = {
            //   brand,
            //   category,
            //   location_id: location_id,
            //   supplier_id:'',
            //   statusfilter:'',
            //   max_price,
            //   min_price,
            //   product_name: name,
            //   from: props.from,
            //   to: props.to,
            //   user_id: commoncookie,
            // };

            const data = {...props.exportValue(), ...{pageCount: props.page || 0, numPerPage:  props.pageSize}};
            props.listPurchasesPaginateAction(
              data,
              commoncookie,
              headerLocationId,
              setModalTypeHandler,
              setLoaderStatusHandler,
            );
            paymentsAndNotify();
          },
          (response) => {
            // console.log('responseeeee', response)
            if (response.status === 200) {
              let supplierId = formValues.supplier_id
              // let vendorName;
              // dispatch(
                //   getSupplierDetailsByIdAction(supplierId, (supplierDetails) => {
              //     vendorName = supplierDetails.company_name || '';
              //   })
              // )
              dispatch(
                getSupplierDetailsByIdreceivings_itemsAction(
                  formValues.supplier_id,
                  fulldata.po_id === null || fulldata.po_id === "" && poOption !== '2' ? {po_id: response.data.insertId} : {receiving_id: response.data.insertId},
                  (supplierDetails) => {
                    setshowpopup(true)
                    console.log(supplierDetails, 'supplierDetails');
                  },
                ),
              );
              dispatch(listStockLocationSequenceAction(
                {sequence_type: 'PO'},
                null,
                commoncookie,
                headerLocationId,
              ))
              // const cookies = new Cookies();
              let storage = getsessionStorage()
              let emp_id = storage?.employee_id || '';
              dispatch(
                getLoginRoleAction(emp_id, (role_name, token, content) => {
                  if (!roleType.includes(role_name)) {
                    let notify_type = notificationType('purchase order');
                    let notify_content = content?.filter(
                      (m) => m.notification_type === notify_type,
                    );
                    if (notify_content.length) {
                      let vendorData =
                        response.data.data?.find(
                          (m) => m.supplier_id === formValues.supplier_id,
                        ) || {};
                      let amount_value = fulldata.total || '';
                      let locationName =
                        props.stocklocation.find(
                          (m) => m.location_id === formValues.location_id,
                        ) || {};
                      let content_body = `${vendorName } \n₹${amount_value} \n${locationName.location_name}`;
                      sendNtfy(token, notify_content[0]?.title, content_body);
                      dispatch(CreateNotificationAction({content_body:content_body,title:notify_content[0]?.title,time:getDateTimeFormat(new Date()),"active":"1"}))
                    }
                  }
                }),
              );
            }else{
              setshowpopup(false)
            }
          },
          commoncookie,
          headerLocationId,
          setDisable,          
          bodyData,
        );

        setformValues({...formValues, status});
      } else {
       // console.log('dtest');
        
        if (props.status === 'edit') {
          data = false;
        }

        if (!db_inv_no) {
          fulldata.invoice_date = getDateTimeFormat(receiving_time);
        }
        // if(props.status !== edit && poOption === 2){
        //   fulldata.invoice_date = getDateTimeFormat(new Date());
        // }
        fulldata.invoice_date = props.status === 'edit' ? getDateTimeFormat(new Date()) : getDateTimeFormat(receiving_time);

        let indiviTotal = old_amount;
        const payables = [];

        let isEditData = true;

        selectionModel.forEach((d) => {
          const newObj = {};
          const sub = indiviTotal - (+d.total - +d.paid_amount);

          if (fulldata.receiving_id === d.receiving_id) {
            if (Math.sign(sub) === 1 || Math.sign(sub) === 0) {
              fulldata.paid_amount = +d.total;
              fulldata.payment_type = new_payment_type;

              // let inventory = false;
              let status = d.status ? d.status : 'Open';

              if (receive_goods === 'received') {
                // inventory = true
                status = 'Completed';
              }
              fulldata.status = status;
              indiviTotal = sub;
            } else {
              fulldata.paid_amount = +d.paid_amount + indiviTotal;
              fulldata.payment_type = new_payment_type;
              indiviTotal = 0;
            }
            fulldata.inventory = inventory;
            isEditData = false;
          } else {
            if (Math.sign(sub) === 1 || Math.sign(sub) === 0) {
              newObj.paid_amount = +d.total;
              newObj.payment_type = new_payment_type;

              let inventory = false;
              let status = d.status ? d.status : 'Open';

              if (d.receive_goods === 'received') {
                // inventory = true
                status = 'Completed';
              }
              newObj.inventory = inventory;
              newObj.status = status;
              indiviTotal = sub;
            } else {
              newObj.paid_amount = +d.paid_amount + indiviTotal;
              newObj.payment_type = new_payment_type;
              indiviTotal = 0;
            }
            newObj.receiving_id = d.receiving_id;
            newObj.receivings_items = d.receivings_items;
            payables.push(newObj);
          }
        });

        if (!selectionModel.length || isEditData) {
          if (+oldPaid >= +total && receive_goods === 'received') {
            status = 'Completed';
          }
          fulldata.status = status;
          fulldata.inventory = inventory;
        }

        fulldata.payables = payables;
        // fulldata.lastPotCodeSeq = lastPotCodeSeq.current;
        console.log(poOption,"poOption342g");
        const id = poOption === "2" ? fulldata.receiving_id : fulldata.po_id

        if(finalEditData.po_id){
          await props.createPurchasesAction(
            getTrimmedData({...fulldata, po_id: finalEditData.po_id,status : props.status}),
            true,
            setLoaderStatusHandler,
            null,
            data,
            (id) => {
              setInsertId(id);
              const {brand, category, location_id, max_price, min_price, name} = props.filtedValue;
              const data = {...props.exportValue(), ...{pageCount: props.page || 0, numPerPage:  props.pageSize}};
              props.listPurchasesPaginateAction(
                data,
                commoncookie,
                headerLocationId,
                setModalTypeHandler,
                setLoaderStatusHandler,
              );
              paymentsAndNotify();
            },
            (response) => {
              if (response.status === 200) {
                let supplierId = formValues.supplier_id
                dispatch(
                  getSupplierDetailsByIdreceivings_itemsAction(
                    formValues.supplier_id,
                    fulldata.po_id === null || fulldata.po_id === "" && poOption !== '2' ? {po_id: response.data.insertId} : {receiving_id: response.data.insertId},
                    (supplierDetails) => {
                      setshowpopup(true)
                      console.log(supplierDetails, 'supplierDetails');
                    },
                  ),
                );
                dispatch(listStockLocationSequenceAction(
                  {sequence_type: 'PO'},
                  null,
                  commoncookie,
                  headerLocationId,
                ))
                let storage = getsessionStorage()
                let emp_id = storage?.employee_id || '';
                dispatch(
                  getLoginRoleAction(emp_id, (role_name, token, content) => {
                    if (!roleType.includes(role_name)) {
                      let notify_type = notificationType('purchase order');
                      let notify_content = content?.filter(
                        (m) => m.notification_type === notify_type,
                      );
                      if (notify_content.length) {
                        let vendorData =
                          response.data.data?.find(
                            (m) => m.supplier_id === formValues.supplier_id,
                          ) || {};
                        let amount_value = fulldata.total || '';
                        let locationName =
                          props.stocklocation.find(
                            (m) => m.location_id === formValues.location_id,
                          ) || {};
                        let content_body = `${vendorData?.vendorName || ''} \n₹${amount_value} \n${locationName.location_name}`;
                        sendNtfy(token, notify_content[0]?.title, content_body);
                        dispatch(CreateNotificationAction({content_body:content_body,title:notify_content[0]?.title,time:getDateTimeFormat(new Date()),"active":"1"}))
                      }
                    }
                  }),
                );
              }else{
                setshowpopup(false)
              }
            },
            commoncookie,
            headerLocationId,
            setDisable,          
            bodyData,
        )
        }
        else{
          await props.updatePurchasesAction( 
            id,
            getTrimmedData(fulldata),
            true,
            setLoaderStatusHandler,
            insertId,
            async (res) => {
              console.log(res,insertId,'etest');
              dispatch(
                getSupplierDetailsByIdreceivings_itemsAction(
                  formValues.supplier_id,
                  {receiving_id: poOption === "2" ? fulldata.receiving_id : res.receiving_id},
                  (supplierDetails) => {
                    console.log(supplierDetails, 'supplierDetails');
                  },
                ),
              );
              if (res.affectedRows > 0) {
                setshowpopup(true);
                // console.log('resupdateqqqqq', showpopup)
                // props.sample(false);
                paymentsAndNotify();
                dispatch(
                  getSupplierDetailsByIdreceivings_itemsAction(
                    formValues.supplier_id,
                    {receiving_id: poOption === "2" ? fulldata.receiving_id : res.receiving_id},
                    (supplierDetails) => {
                      console.log(supplierDetails, 'supplierDetails');
                    },
                  ),
                )
                const {brand, category, location_id, max_price, min_price, name} =
                  props.filtedValue;
                const Filterdata = {
                  brand,
                  category,
                  location_id: location_id,
                  supplier_id:'',
                  statusfilter:'',
                  max_price,
                  min_price,
                  product_name: name,
                  from: props.from,
                  to: props.to,
                  user_id: commoncookie,
                };
                // lastPotCodeSeq.current = null;
                // props.listPurchasesFilterAction(
                //   Filterdata,
                //   commoncookie,
                //   headerLocationId,
                //   setModalTypeHandler,
                //   setLoaderStatusHandler,
                // );
  
                const data = {...props.exportValue(), ...{pageCount: props.page || 0, numPerPage:  props.pageSize}};
                // dispatch(listStockLocationSequenceAction(
                //   {sequence_type: 'PO'},
                //   null,
                //   commoncookie,
                //   headerLocationId,
                // ))
                props.listPurchasesPaginateAction(
                  data,
                  commoncookie,
                  headerLocationId,
                  setModalTypeHandler,
                  setLoaderStatusHandler,
                  fulldata.receiving_id
                );
              }else{
                setshowpopup(false)
              }
            },
            data,
            commoncookie,
            headerLocationId,
            bodyData 
          );
        }
      }
      setpaymentOpen(false);
      // props.handleClose()
      //  props.rowPopupOpen();
      // history.push('/purchases')
    }
    else{
      dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
    }
  };

  const handleBlur = (e) => {
    const {name, value} = e.target;
    if (!value) {
      setcheckerror({...checkerror, [name]: true});
    }
  };

  const cancel = () => {
    setDialog(false);
  };

  const validClose = () => {
    setDialog(true);
  };

  const addNote = (data) => {
    setformValues({...formValues, note: data});
  };

  const untaxed = () => {
    let total = 0;
   const filteredData = itemsData.filter(d => d.receiving_quantity > 0)
    for (let data of filteredData) {
      let arr = [];
      for (let d in data) {
        if (['item_cost_price', props.status === 'edit' ? props.returnState ? 'quantity' : 'received_quantity' : 'quantity'].includes(d)) {
          arr.push(data[d]);
        }
      }
      total += arr[0] * arr[1];
      // console.log("arr[0] * arr[1]",total)
    }
    return total;
  };

  const taxes = () => {
    let total = 0;
    const truncateTo2Decimals = (num) => Math.floor(num * 100) / 100;
    const filteredData = itemsData.filter(d => d.receiving_quantity > 0)
    for (let data of filteredData) {
      // console.log('item_cost_price', data)
      const prc = data?.item_cost_price;
      const qty = props.status === 'edit' ? props.returnState ? data?.quantity :  data?.received_quantity || 0 : data?.quantity || 0;
      const tax = data?.gst || 0;
      total += ((prc * qty) / 100) * tax;
      console.log(total,prc, qty, tax, (total / 2).toFixed(2),  truncateTo2Decimals(total)/2, "jhsjhscbvjsbb" )
    }
    return total ?  truncateTo2Decimals(total) : 0;
  };

//   const tdstaxes = () => {
//     let total = 0;
//     if (formValues.tds && !isNaN(formValues.tds)) {  // Check if not empty and is a valid number
//        total = parseFloat(formValues.tds) || 0; // Convert to number, default to 0
//     }
    
//     return total;
// };

  const tcstaxes = () => {
    let total = 0;
    if (formValues.tcs && !isNaN(formValues.tcs)) {  // Check if not empty and is a valid number
       total = parseFloat(formValues.tcs) || 0; // Convert to number, default to 0
    }
    return total;
};

function calculateTcsFromPercent() {
    const taxableAmount = Number(untaxed()) || 0;
    const percent = Number(formValues.tcs_percent) || 0;

    if (taxableAmount > 0 && percent > 0) {
        return Number(((taxableAmount * percent) / 100).toFixed(2));
    }

    return 0;
}
 
function calculateTcsTaxRate() {
  if (formValues.tcs && !isNaN(formValues.tcs)) {
    let taxableAmount = untaxed();
    
    // Corrected tax rate calculation
    let taxRate = (parseFloat(formValues.tcs) / taxableAmount) * 100;
    let tax_value = taxRate.toFixed(2);
    // setFormValues({...formValues, tcs_percent : tax_value})
    return tax_value;
  } else {
    return "";
  }
}

function calculatetdsTaxAmount() {
  let total = 0
  if (formValues.tds_percent && !isNaN(formValues.tds_percent)) {
    //  total = ((untaxed() * formValues.tds_percent) / (100 + formValues.tds_percent)).toFixed(2)
    total = (((untaxed() * formValues.tds_percent) / 100)).toFixed(2)
    //  setFormValues({...formValues, tds : total})
  return Number(total) ;
  }
  else{
    return total;
  }
}

  // const tcstaxes = () => {
  //   let total = 0;
  //   if(formValues.tcs !== ""){
  //      total = formValues.tcs
  //      console.log('totallll', total)
  //      return 1;
  //   }else{
  //     return total;
  //   }
  // //   if(tcstaxvisible === false){
  // //     return total;
  // //   }else{
  // //   for (let data of itemsData) {
  // //     const prc = data.item_cost_price;
  // //     const qty = data.quantity || 1;
  // //     const tax = data.taxes[3]?.tax_rate || 0;
  // //     total += ((prc * qty) / 100) * tax;
  // //   }
  // //   return total ? total : 0;
  // // }
  // };

  const rupees = (x) => {
    x = x.toString();
    let lastThree = x.substring(x.length - 3);
    const otherNumbers = x.substring(0, x.length - 3);
    if (otherNumbers !== '') lastThree = ',' + lastThree;
    const res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
    return res;
  };





  const floatnum = (num) => {
    console.log('floatnumberrrr', num)
    if (num == null || isNaN(num)) return '0.00'
    const str = String(num)
    const numarray = str.split('.');
    // let convert = rupees(numarray[0]);
    let integerPart  = numarray[0]
    let decimalPart = numarray[1] ? numarray[1].slice(0, 2) : '00'
    // if (numarray[1]) {
    //   convert += '.' + numarray[1];
    // } else {
    //   convert += '.00';
    // }
    if (decimalPart.length === 1) decimalPart += '0';

    const convert = rupees(integerPart)
    return `${convert}.${decimalPart}` 
  };

  const formatRoundOff = (num) => {
    if (num > 0) return `+${floatnum(num)}`
    if (num < 0) return `-${floatnum(Math.abs(num))}`
    return floatnum(0)
  }

  const round2 = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

  const getRoundOff = () => {
    if(props.appConfigData.roundedOffEnabled === 'false'){
      return 0
    }
    else{
      const taxAmount = suppliers ? Number((taxes()/ 2).toFixed(2)) + Number((taxes() / 2).toFixed(2)) : Number(taxes().toFixed(2))
      const subTotal = untaxed()
      const tcs = tcstaxes()
      const tds = calculatetdsTaxAmount()
  
      const taxAmount2 = round2(taxAmount)
      const subTotal2 = round2(subTotal)
      const tcs2 = round2(tcs)
  
      const total = round2(subTotal2 + taxAmount2 + tcs2 - tds)
  
      const nearest = Math.round(total)
  
      const roundOff = round2(nearest - total)
  
      return roundOff
    }
  }


  // console.log('formvaluess', formValues)
  const edits = () => {

    
    if (
      Object.keys(finalEditData || {}).length &&
      (props.status === 'edit' || props.status === 'New')
    ) {
      // console.log('finalEditData', finalEditData, props.returnState)
      const {
        receiving_time,
        supplier_id,
        company_name,
        comment,
        payment_type,
        reference,
        location_id,
        location_name,
        receivings_items,
        receiving_id,
        paid_amount,
        po_number,
        invoice_number,
        status,
        receive_goods,
        po_date,
        partialInvoiceNumber,
        po_id,
        sub_company_id,
        tds_id, 
        tds, tds_percent, tcs,tcs_percent,
        tax_types
      } = finalEditData;

      setVendorSearchText(finalEditData.company_name)
      setformValues({
        receiving_time,
        supplier_id,
        comment,
        payment_type,
        reference,
        location_id,
        location_name,
        company_name,
        receiving_id,
        paid_amount,
        po_number,
        invoice_number: props.returnState
          ? partialInvoiceNumber !== null
            ? partialInvoiceNumber
            : invoice_number
          : props.status =='edit' ? invoice_number : null,
        status,
        receive_goods,
        db_inv_no: invoice_number,
        po_date,
        po_id,
        sub_company_id,
        tds_id, 
        tds, tds_percent, tcs,tcs_percent,
        tax_types
      });
      setInitialState({
        receiving_time,
        supplier_id,
        comment,
        payment_type,
        reference,
        location_id,
        location_name,
        company_name,
        receiving_id,
        paid_amount,
        po_number,
        invoice_number,
        status,
        receive_goods,
        db_inv_no: invoice_number,
        po_date,
        tds_id, 
        tds, tds_percent, tcs,tcs_percent, tax_types
      });
      //  console.log('receivings_items',finalEditData, receivings_items)
      const filterData = receivings_items.map((d, index) => {
        const newData = {...d};

        if (Array.isArray(d?.taxes)) {
          d.taxes.forEach((t) => {
            if (t.tax_group === 'IGST') {
              newData.gst = t.tax_rate;
              newData.tax_category = t.tax_category;
              newData.tax_category_id = t.tax_category_id
            }
          });
        }
        if (newData.gst === undefined || newData.gst === null || newData.gst === '') {
          const taxRate = Number(d?.tax_rate) || 0;
          const igstRate = Number(d?.igst_tax_rate) || 0;
          const cgstRate = Number(d?.cgst_tax_rate) || 0;
          const sgstRate = Number(d?.sgst_tax_rate) || 0;
          newData.gst = taxRate || igstRate || (cgstRate + sgstRate) || 0;
        }
        if (!newData.tax_category) {
          newData.tax_category = d?.tax_category || '';
        }
        if (!newData.tax_category_id) {
          newData.tax_category_id =
            d?.tax_category_id || d?.receivings_tax_category_id || d?.category_id || null;
        }
        const quantity = props.returnState ? 0 : +d.received_quantity || d.ordered_quantity;
        const taxed =
          d.item_cost_price + (d.item_cost_price / 100) * (newData.gst || 1);
        newData.sub_total = (taxed * quantity).toFixed(2);
        newData.quantity = quantity;
        newData.returnQuantity = d.received_quantity;
        newData.previousRecievedQty = d.received_quantity;
        if (props.returnState) {
          newData.soldLots = d.lots;
          newData.lots = [];
        }
        newData.line = index + 1
        newData.isEntered = 1;
        return newData;
      });

      const Pay = props.purchase_outstanding?.filter(
        (d) => d.supplier_id === supplier_id,
      )[0]?.childRow;
      setitemsData(filterData);
      setgetPay(Pay);
    }
  };
  tempedit.current = edits;

  useEffect(() => {
      tempedit.current();

  }, [finalEditData]);
console.log(finalEditData,'eyghb');

 
  // const selectitem = () => {
  //   if (selectData.NewVendor) {
  //     const filter = [...vendor];
  //     const pop = filter.shift();
  //     console.log(' pop.supplier_id', pop)
  //     setformValues({...formValues, supplier_id: pop.supplier_id});
  //     setcheckerror({...checkerror, supplier_id: false});
  //     setselectData('NewVendor', false);
  //   }
  // };
  // tempselect.current = selectitem;

  // useEffect(() => {
  //     tempselect.current();
    
  // }, [selectData.NewVendor]);

  const getVendor = () =>
    vendor.filter((d) => formValues.supplier_id === d.supplier_id)[0];

  // const randomNum = () => {
  //   var val = Math.floor(1000 + Math.random() * 9000);
  //   return val
  // }

  const handleDraft = () => {
    if (
      formValues.location_id &&
      formValues.supplier_id &&
      itemsData.length &&
      props.status === 'create'
    ) {
      handleSubmit(true);
    } else {
      props.handleClose();
    }
  };
  const createMail = () => {
    const custData = getVendor();

    let data = {
      custData,
      appConfigData: props.appConfigData,
      invoice_number: formValues.po_number,
      sales_items: itemsData,
      email: custData.email,
      custType: 'VENDOR',
      soDate: formValues.receiving_time,
    };

    const p_data = {
      status: formValues.status === 'New' ? 'Open' : formValues.status,
      isStatusUpdate: true
    };

    const id = props.status === 'edit' ? formValues.receiving_id : insertId;

    const bodyData = {
      pageCount : 0,
      numPerPage : 10,
      searchString: "",
    }

    dispatch(sendMail(data, setLoaderStatusHandler));
    // if(props.status !== 'edit'){
    props.updatePurchasesAction(
      id,
      p_data,
      true,
      setLoaderStatusHandler,
      null,
      props.sample,
      null,
      commoncookie,
      headerLocationId,
      bodyData
    );
    // }else{
    //   props.handleClose();
    // }
  };


  const returnFunc = () => {
      let old_sequence = credit_debit_seq.debit_note
    // console.log("props.type",props.type)
    if(props.type === 'returnFromInventory'){
    
      // console.log("00000")
      // console.log("itemsData",itemsData)
      const data = {
        ...formValues,
        total:props.appConfigData.roundedOffEnabled === "true" ? Math.round(((untaxed() + taxes() + calculateTcsFromPercent()) - calculatetdsTaxAmount())) : ((untaxed() + taxes() + calculateTcsFromPercent()) - calculatetdsTaxAmount()),
        tds : calculatetdsTaxAmount(),
        tcs : calculateTcsFromPercent(),
        dbSequence:credit_debit_seq.debit_note,
        itemsData:itemsData.filter(f=> f.quantity > 0).map(i => {
            if(i.is_serialized === 0){
              i.lots = i.soldLots.filter(s => s.status === 'A')
            }
            return i;
          })
      };
      const dataReturn = {
        id : null,
        mc_id : null,
        returnFrom : 'Inventory',
        sequence : null,
        status : null,
        type : null
      }
      if(headerLocationId !=='null'){
        if (checkEachBarcodeWasEntered(itemsData.filter(f=> f.quantity > 0)) === 'allEntered') {
          // console.log("vvvv",data)

          // props.cnInvoiceFunction({...formValues, itemsData:itemsData.filter(f=> f.quantity > 0)});
          // props.creditSequenceUpdate();
          props.returnActions(
            {...data,
              location_id : headerLocationId,
               type:'returnFromInventory',
              transactionEntryData : {
              total_cost_price:itemsData.filter(f=> f.quantity > 0).reduce((acc,cur)=> acc + cur.item_cost_price * cur.quantity,0),
              total_unit_price:untaxed(),
              total_with_gst: ((untaxed() + taxes()+ calculateTcsFromPercent()) - calculatetdsTaxAmount()).toFixed(2),
              gst_inter:(taxes()/2).toFixed(2),
              tcs_inter: (calculateTcsFromPercent()),
              tds_inter: (calculatetdsTaxAmount())
            }},
            setLoaderStatusHandler,
            commoncookie,
            headerLocationId,
            (response) => {
              // props.handleClose();
              props.oldSequenceGet(old_sequence)
              creditSequenceUpdate();
              dispatch(ManualSalesPurchase({...dataReturn, mc_id: response.manualRes.insertId, id: response.purchaseReturn}, (response) => {
                if(response) {
                  dispatch(setInvoiceTempAction(response))
                }
              }))
              props.cnInvoiceFunction({...formValues, itemsData:itemsData.filter(f=> f.quantity > 0)},credit_debit_seq,vendor);
              // props.handleCloseForPurchaseReturn();
            }
          );
        
      
        } else {
          alert('Please Enter Barcode All Items');
        }
      }
       else{
        alert('Please Select HeaderLocation');
      }

    }
    else
    {
      const data = {
        ...formValues,
        total: props.appConfigData.roundedOffEnabled === "true" ? Math.round(((untaxed() + taxes() + calculateTcsFromPercent()) - calculatetdsTaxAmount())) : ((untaxed() + taxes() + calculateTcsFromPercent()) - calculatetdsTaxAmount()),
        tds : calculatetdsTaxAmount(),
        tcs : calculateTcsFromPercent(),
        dbSequence:credit_debit_seq.debit_note,
        itemsData:itemsData.filter(f=> f.quantity > 0).map(i => {
            if(i.is_serialized === 0){
              i.lots = i.soldLots.filter(s => s.status === 'A')
            }
            return i;
          }),
        tax_types: '1'
      };
      const datas = {
        id : null,
        mc_id : null,
        returnFrom : 'PurchaseReturn',
        sequence : null,
        status : null,
        type : null
      }

      if(headerLocationId !=='null'){
      if (checkEachBarcodeWasEntered(itemsData.filter(f=> f.quantity > 0)) === 'allEntered') {
        // console.log("data111",data)
        props.returnActions(
          {...data,transactionEntryData : {
            total_cost_price:itemsData.filter(f=> f.quantity > 0).reduce((acc,cur)=> acc + cur.item_cost_price * cur.quantity,0),
            total_unit_price:untaxed(),
            total_with_gst: ((untaxed() + taxes()+ calculateTcsFromPercent()) - calculatetdsTaxAmount()).toFixed(2),
            gst_inter:(taxes()/2).toFixed(2),
            tcs_inter: (calculateTcsFromPercent()),
            tds_inter: (calculatetdsTaxAmount())
          }},
          setLoaderStatusHandler,
          commoncookie,
          headerLocationId,
          async (response) => {
            const dnData = {
              id : response.purchaseReturn,
              mc_id : response.manualRes.insertId,
              returnFrom : 'PurchaseReturn',
              sequence : null,
              status : null,
              type : null
            }
            console.log(response, 'jrhhh')
            if(props.oldSequenceGet){
              props.oldSequenceGet(old_sequence)
            }
            creditSequenceUpdate();
            const res = await customFetch(
              API_URLS.MANUAL_CREDIT_SALES_PURCHASE,
              'POST',
              { ...dnData }
            );
            const getData = res.data || [];
            dispatch(setInvoiceTempAction(getData));
            props.cnInvoiceFunction({...formValues, itemsData:itemsData.filter(f=> f.quantity > 0)},credit_debit_seq,vendor);
          }
        )
         props.manualValue && props.handleClose()
      } else {
        alert('Please Enter Barcode All Items');
      }
    }
    else{
      alert('Please Select HeaderLocation');
    }
    }
   
  };

  useEffect (() => {
      if (selectData.NewVendor === true) {     
        dispatch(listVendorIdAndNameAction(response=>{
          if(response.length > 0){
          const pop = response[0].supplier_id
          setVendorId(pop.supplier_id)
          setformValues({...formValues, supplier_id: pop});
          setcheckerror({...checkerror, supplier_id: false});
          setStateHandler('supplier_id',  pop);
         setModalStatusHandler(false);
         setselectData('NewVendor', false);
          }
        }))
    }
  
 },[selectData.NewVendor])


 function updateItem(data){
  const makeData = [...itemsData];
  let findIndex=makeData.findIndex(v=>v?.item_id === data?.item_id)
  if(findIndex!==-1){
    makeData[findIndex] = data
  
    setitemsData(makeData);
  }
 }

//  const handleLastPotCodeSeq = (data) => lastPotCodeSeq.current = data


  // const filteredData = vendorPriceListDropDown.filter(item => {
  //   // Parse the vendor_id property to a number using JSON.parse()
  //   const vendorId = JSON.parse(item.vendor_id);
    
  //   return vendorId.includes(formValues?.supplier_id);
  // });
    // useEffect(() => {
    //   if (vendor.length > 0) {
    //     setformValues(prevValues => ({
    //       ...prevValues, 
    //       supplier_id: vendor[0].supplier_id, 
    //     }));
    //   }
    // }, [vendor]);

    // console.log(formValues,'sadasd887',Rdata)

    const handlePurchaseItemsReset = (reset) => {
      if(reset === 'yes') {
        setitemsData([])
        setProductResetDialog(false)
      }
      else {
        setPoOption(oldPurchaseStatus)
        setProductResetDialog(false)
      }
    }

const customFetch = useCustomFetch();
useEffect(() => { (async () => {
  const fetchData = async () => {
    const data = await customFetch(API_URLS.PURCHASE_GET_BILL_SEQ, 'GET');
    setgetbillNum(data?.data[0].current_seq)
    console.log(data,'sjhgfkhgkh');
  };

  fetchData();
})();
}, []);
function getFinancialYearString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0 = Jan, 3 = April

  let startYear, endYear;

  if (month >= 3) { // From April onward
    startYear = year % 100;
    endYear = (year + 1) % 100;
  } else {
    startYear = (year - 1) % 100;
    endYear = year % 100;
  }

  return `PRINV/${startYear.toString().padStart(2, '0')}-${endYear.toString().padStart(2, '0')}`;
}

const financialYear = getFinancialYearString();
console.log(financialYear);
useEffect(() => {
  if(props.debitNoteReturn === 'debitNoteReturn') {
    const bill_number_APi = async () => {
      const data = {
        brand: '',
        category: '',
        location_id: 'null',
        supplier_id: [formValues.supplier_id],
        statusfilter: '',
        max_price: '',
        min_price: '',
        product_name: '',
        from: null,
        to: null,
        user_id: commoncookie,
        pageCount: 0,
        numPerPage: 20,
        purchase_status: 'All',
        searchString: '',
        sub_company_id: 'All',
      };
      if (formValues.supplier_id) {
          dispatch(
            listPurchasesPaginateAction(
              data,
              commoncookie,
              headerLocationId,
              setModalTypeHandler,
              setLoaderStatusHandler,
            ),
        );
      }
    };
    bill_number_APi();
  }
}, [formValues.supplier_id, props.debitNoteReturn]);

const handleVendorSearchAPICall = (searchText) => {
  if(searchText.length >= 3) {
    const payload = {
      searchString: searchText
    }
    dispatch(getSearchByVendorDataAction(payload))
    setVendorSearchText('')
  }
  else {
    dispatch(OpenalertActions({msg: searchErrorMessage, severity: 'warning'}))
  }
}

const handleCloseVendorDetails = () => {
  setformValues((prev) => ({...prev, supplier_id: null}))
  setVendorSearchText('')
  dispatch(setSearchByVendorDataAction([]))
}

const handleAutoSearchApicall = (searchText) => {
  dispatch(setSearchByVendorDataAction([]))
  const payload = {
    searchString : searchText
  }
  dispatch(getSearchByVendorAction(payload))
}

useEffect(() => {
  if(props.status === 'edit' && props.debitNoteReturn !== 'debitNoteReturn') {
    dispatch(getPurchaseSuppliersByIdAction(finalEditData?.supplier_id))
  }
}, [props.status, props.debitNoteReturn])

  return (
    <div style={{ width: '100%'}}>
      {/* <AppHeader hidden={true} /> */}
      {Prompt}
      {/* <ThemeProvider theme={formLabelsTheme}> */}
      <Card sx={rootSx}>
   

        <>

          {
            props.type === 'returnFromPurchase' &&
            <CardContent sx={widthSx}>
              <div style={headStyle}>
                <Typography variant='h6' >
                  {props.returnState 
                    ? 'Purchase Return'
                    : props.isPrint
                      ? 'View Purchase Order'
                      : props.status === 'edit'
                        ? 'Receiving Purchase Order'
                        : props.pageType == "/sales/purchasesOrders" ? 'New Purchase Order' : "New Purchase Bill"}{' '}
                  -{' '}
                  <span style={{ variant: 'h6' }}>{props?.pageType == "/sales/purchasesOrders" ? formValues?.po_number : pathname == '/sales/DebitNotes' ? billnumber : props.returnState
                    ? `${financialYear}/${billNumber}` : `${financialYear}/${billNumber+1}`}</span>
                </Typography>

                <div style={{ marginLeft: 'auto' }}>
                  <IconButton aria-label='close' onClick={props.handleClose}>
                    <CloseIcon />
                  </IconButton>
                </div>
              </div>
              <Grid
                container
                spacing={3}
              // lg={12}
              // md={12}
              // sm={12}
              // xs={12}
              >
                <Grid
                  size={{
                    lg: 10,
                    md: 10,
                    sm: 10,
                    xs: 10
                  }}>
                <Grid container spacing={3}>
                      <Grid
                        size={{
                          lg: 3,
                          md: 4,
                          sm: 6,
                          xs: 12
                        }}>
                        <LocalizationProvider dateAdapter={DateAdapter}>
                          <DatePicker
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                variant: 'filled',
                              },
                            }}
                            name="receiving_time"
                            label="Receiving Date"
                            format='DD/MM/YYYY'
                            value={toMomentOrNull(formValues.receiving_time)}
                            views={['year', 'month', 'day']}
                            disableFuture
                            onChange={(date) =>
                              handleChange({
                                target: { value: date, name: 'receiving_time' },
                              })
                            }
                            fullWidth
                          />
                        </LocalizationProvider>
                      </Grid>


                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <Autocomplete
                    disableClearable
                    freeSolo={vendorSearchText.length <= 3}
                    id='combo-box-demo'
                    name='supplier_id'
                    required={true}
                    inputValue={vendorSearchText}
                    onInputChange={(event, newInputValue, reason) => {
                      if(reason === 'input') {
                        setVendorSearchText(newInputValue)
                        if(newInputValue !== '') {
                          handleAutoSearchApicall(newInputValue)
                        }
                        if(newInputValue === '') {
                          setformValues((prev) => ({...prev, supplier_id: null}))
                          dispatch(setSearchByVendorDataAction([]))
                        }
                      }
                    }}
                    value={!_.isEmpty(finalEditData) ? vendor
                      .find((d) => formValues.supplier_id === d.supplier_id) || { company_name: '' }
                        // : vendorSearchText ? {company_name: vendorSearchText}
                       : formValues.supplier_id !== null ? vendor
                        .find((d) => formValues.supplier_id === d.supplier_id) || { company_name: '' } : { company_name: '' }
                    }
                    onChange={(e, val) => {
                      setVendorId(val.supplier_id || null)
                      handleChange({ target: { name: 'supplier_id', value: val !== null ? val.supplier_id : null } })
                      setVendorSearchText(val?.company_name || '')
                    }}
                    onBlur={handleBlur}
                    disabled={(props.status === 'edit') && props.debitNoteReturn !== 'debitNoteReturn'}
                    options={vendor
                      .filter((d) => d.company_name && d.supplier_id && d.supplier_id !== null && d.company_name !== null)
                    }
                    getOptionLabel={(option) => option.company_name}
                    renderInput={(params) => {
                      const get = {...params}
                      let startAdornment = null
                      if(props.status !== 'edit') {
                        startAdornment = (
                          <Tooltip title='Create New'>
                            <IconButton
                              size='small'
                              onClick={() => {
                                setModalStatusHandler(true);
                                setModalTypeHandler('NewVendor');
                              }}
                            >
                              <Add fontSize='small' />
                            </IconButton>
                          </Tooltip>
                        )
                      }
                      else {
                        get.InputProps = {
                          ...params.InputProps
                        }
                      }
                      return (
                        <TextField
                          {...get}
                          label='Vendor'
                          placeholder='Select Vendor'
                          error={checkerror.supplier_id}
                          fullWidth={true}
                          required={true}
                          variant='filled'
                          slotProps={{
                            input: ((props.debitNoteReturn === 'debitNoteReturn') || (props.status !== 'edit')) && {
                              ...get.InputProps,
                              startAdornment: startAdornment,
                              endAdornment: (
                                <>
                                  {
                                    formValues.supplier_id === '' || formValues.supplier_id === null ? 
                                    // <IconButton
                                    //   size='small'
                                    //   onClick={() => {
                                    //     handleVendorSearchAPICall(vendorSearchText)
                                    //   }}
                                    // >
                                    //   <SearchIcon />
                                    // </IconButton> 
                                    '' : 
                                    <IconButton
                                      size='small'
                                      onClick={() => {
                                        handleCloseVendorDetails()
                                      }}
                                    >
                                      <CloseIcon />
                                    </IconButton>
                                  }
                                  {get.InputProps.endAdornment}
                                </>
                              )
                            }
                          }}
                        />
                      );
                    }}
                  />

                  {/* <FormControl
              fullWidth
              error={checkerror.supplier_id}
              required={true}
            >
              <InputLabel id='demo-simple-select-label'>Vendor</InputLabel>
              <Select
                name='supplier_id'
                labelId='demo-simple-select-label'
                id='demo-simple-select'
                required={true}
                label='Vendor'
                value={formValues.supplier_id}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={formValues.receive_goods === 'received'}
              >
                {vendor
                  .filter((d) => d.company_name && d.supplier_id)
                  .map((d) => (
                    <MenuItem value={d.supplier_id} key={d.supplier_id}>
                      {d.company_name}
                    </MenuItem>
                  ))}
                 <MenuItem>
                <a href="#/"
                  style={{ margin: "6px 16px" }}
                  onClick={() => { setModalStatusHandler(true); setModalTypeHandler('NewVendor'); }}
                >
                  Create New
                </a>
                </MenuItem> 
              </Select>
              <FormHelperText>
                {checkerror.supplier_id ? 'Supplier is required!' : ''}
              </FormHelperText> 
            </FormControl> */}
                </Grid>
            {pathname == '/sales/DebitNotes' && <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 6,
                xs: 12
              }}>
            <Autocomplete
              fullWidth
              options={
                purchasesByPagination?.filter((p) => p.bill_number) || []
              }
              getOptionLabel={(option) => option.bill_number || ''}
              isOptionEqualToValue={(option, value) =>
                option.bill_number === value.bill_number
              }
              value={
                purchasesByPagination?.find(
                  (p) => p.bill_number === billnumber,
                ) || null
              }
              onChange={(event, newValue) => {
                const selectedBillNumber = newValue?.bill_number || null;
                setBillnumber(selectedBillNumber);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='Select Bill Number'
                  variant='filled'
                />
              )}
            />
          </Grid>}
                {subcompany > 0 && (
                  <Grid
                    size={{
                      lg: 3,
                      md: 4,
                      sm: 6,
                      xs: 12
                    }}>
                    <Autocomplete
                        disableClearable
                        options={getbillingcompanydetails || []}
                        getOptionLabel={(option) =>
                            option.tax_id ? `${option.company_name} - ${option.tax_id}` : ""
                        }
                        onChange={(e, value) => {
                            handleChange({
                                target: { name: "sub_company_id", value: value || "" }
                            })
                        }}
                        value={
                            getbillingcompanydetails?.find(
                                (d) => d.sub_company_id === formValues.sub_company_id
                            ) || null
                        }
                        disabled={props.returnState}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Billing GST"
                                variant="filled"
                                // error={!!formErrors.tax_id}
                                // helperText={formErrors.tax_id ? "Billing GST is required!" : ""}
                            />
                        )}
                    />
                  </Grid>
                  
                )}

                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <TextField
                    id='standard-basic'
                    name='comment'
                    label='Comments'
                    // required
                    multiline={true}
                    value={formValues.comment}
                    variant='filled'
                    fullWidth={true}
                    onChange={handleChange}
                  />
                </Grid>

                {/* <Grid size={4}>

          <TextField
              id="payment-term-field"
              name="payment_type"
              label="Payment Term"
              value={formValues.payment_type}
              fullWidth={true}
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid> */}

                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <TextField
                    id='standard-basic'
                    value={formValues.reference}
                    name='reference'
                    label='Reference'
                    fullWidth={true}
                    onChange={handleChange}
                    variant='filled'
                  />
                </Grid>

                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <FormControl
                    fullWidth
                    error={checkerror.location_id}
                    required={true}
                    variant='filled'
                  >
                    <InputLabel id='demo-simple-select-label'>
                      Location

                    </InputLabel>
                    <Select
                      name='location_id'
                      label='Location'
                      labelId='demo-simple-select-label'
                      id='demo-simple-select'
                      required={true}
                      value={formValues.location_id}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={formValues.receive_goods === 'received'}
                    >
                      {props.stocklocation.filter((d) => {
                        if (headerLocationId === 'null') return true
                        else return headerLocationId === d.location_id
                      }).map(
                        (d) =>
                          d.location_type_name !== "Scrap" && (
                            <MenuItem value={d.location_id} key={d.location_id}>
                              {d.location_name}
                            </MenuItem>
                          ),
                      )}
                    </Select>
                    <FormHelperText>
                      {checkerror.location_id ? 'Location is required!' : ''}
                    </FormHelperText>
                  </FormControl>
                </Grid>
                {props.status !== 'edit' && (<Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <FormControl
                    fullWidth
                    required={true}
                    variant='filled'
                  >
                    <InputLabel id='demo-simple-select-label'>
                      Po Option
                    </InputLabel>
                    <Select
                      name='poOption'
                      label='Po Option'
                      labelId='demo-simple-select-label'
                      id='demo-simple-select'
                      required={true}
                      value={poOption}
                      onChange={e => {
                        const oldPurchaseStatus = poOption
                        setPoOption(e.target.value)
                        if(itemsData.length > 0 && oldPurchaseStatus === '2' && e.target.value === '1'){
                          setProductResetDialog(true)
                          setOldPurchaseStatus(oldPurchaseStatus)
                        }
                      }}
                      disabled={true}
                    >
                      {[{ name: 'Create PO', value: '1' }, { name: 'Direct Invoice', value: '2' }].map(
                        (d) =>

                          <MenuItem value={d.value} key={d.value}>
                            {d.name}
                          </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>)}

                {(props.status === 'edit' || poOption === '2') && (
                  <Grid
                    size={{
                      lg: 3,
                      md: 4,
                      sm: 6,
                      xs: 12
                    }}>
                    <TextField
                      id='standard-basic'
                      value={formValues.invoice_number}
                      name='invoice_number'
                      label='Invoice Number'
                      required={true}
                      fullWidth={true}
                      onChange={handleChange}
                      disabled={props.returnState}
                      variant='filled'
                      error={formErrors.invoice_number === null ? false : true}
                      helperText={formErrors.invoice_number === null ? '' : formErrors.invoice_number === 'Invoice Number Already Exist' ? 'Invoice Number Already Exist' : 'Invoice Number is Required!'}

                    />
                  </Grid>
                )}

                {/* GST / ITC classification — header-level for this purchase bill */}
                <Grid
                  size={{ lg: 12, md: 12, sm: 12, xs: 12 }}
                  sx={{ pt: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                      GST classification:
                    </Typography>
                    <ItcClassificationControl
                      variant="inline"
                      value={gstClassification}
                      onChange={(v) => setGstClassification((prev) => ({ ...prev, ...v }))}
                      reasons={itcBlockReasons || []}
                      showRcm
                      disabled={props.returnState}
                    />
                  </Box>
                </Grid>
                </Grid>
                </Grid>

                <Grid
                  size={{
                    lg: 2,
                    md: 2,
                    sm: 2,
                    xs: 2
                  }}></Grid>

                {/* <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4 }}>
          <FormControl
              fullWidth
              required={true}
              variant='filled'
            >
              <InputLabel id='demo-simple-select-label'>
                {'Price List'}
              </InputLabel>
              <Select
                name='poOption'
                label='Price List'
                labelId='demo-simple-select-label'
                id='demo-simple-select'
               // required
                value={priceList}
                onChange={e => {
                  let val = e.target.value
                  let data = {
                    priceListId: val
                  }
                  setPriceList(val)
                  apiCalls(
                    setModalTypeHandler,
                    setLoaderStatusHandler,
                    dispatch(filterPriceListProductAction(data))
                  )
                }}
              >
                {filteredData.map(
                  (d) =>
                      <MenuItem value={d.id} key={d.id}>
                        {d.name}
                      </MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid> */}
              </Grid>
              <div style={{ margin: '30px 0' }}>
                <ReceivingsItems
                  itemsData={itemsData}
                  updateItem={updateItem}
                  // handleSwitch={handleSwitch}
                  setitemsData={setitemsData}
                  setModalStatusHandler={setModalStatusHandler}
                  setModalTypeHandler={setModalTypeHandler}
                  selectData={selectData}
                  setselectData={setselectData}
                  edit_data={finalEditData || {}}
                  status={props.status}
                  pot_code_seq={props.pot_code_seq}
                  potCodeAction={props.potCodeAction}
                  setLoaderStatusHandler={setLoaderStatusHandler}
                  returnState={props.returnState}
                  isPrint={props.isPrint}
                  formValues={formValues}
                  invoiceUpdateState={setformValues}
                  supplierUpdate={handleChange}
                  poOption={poOption}
                  checkerror={checkerror}
                  setcheckerror={setcheckerror}
                  vendorPriceListProduct={vendorPriceListProduct}
                  vendorId={vendorId}
                  type={props.type}
                  pathname={pathname}
                // handleLastPotCodeSeq={handleLastPotCodeSeq}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px' }}>
                  <Typography variant='h6'>{`Total Quantity: ${itemsData.reduce((sum, item) => sum + (props.returnState ? Number(item.quantity) : Number(item.receiving_quantity)), 0)}`}</Typography>
                </Box>
              </div>

              <Grid container spacing={3}>
                <Grid
                  size={{
                    lg: 5,
                    md: 6
                  }}>
                  {itemsData.length ? (
                    <GstTable
                      itemsData={itemsData}
                      setsuppliers={setsuppliers}
                      supplier_id={formValues.supplier_id}
                      app_config_data={props.app_config_data_based_on_type}
                      vendor={vendor}
                    />
                  ) : (
                    ''
                  )}
                </Grid>
                <Grid
                  style={{ marginTop: 'auto' }}
                  size={{
                    lg: 6,
                    md: 6
                  }}>
                  <div style={{ width: '300px', marginLeft: 'auto' }}>
                    <div style={taxHeadStyle}>
                      <Typography style={{ fontWeight: 'bold', margin: '5px' }}>
                        Untaxed Amount :
                      </Typography>
                      <Typography
                        style={{
                          width: '150px',
                          textAlign: 'end',
                          margin: '5px',
                        }}
                      >
                       <span>₹</span> {floatnum(untaxed())} 
                      </Typography>
                    </div>

                    {suppliers ? (
                      <>
                        <div style={taxHeadStyle}>
                          <Typography style={{ fontWeight: 'bold', margin: '5px' }}>
                            CGST :
                          </Typography>
                          <Typography
                            style={{
                              width: '150px',
                              textAlign: 'end',
                              margin: '5px',
                            }}
                          >
                             <span>₹</span> {floatnum(taxes() / 2)}
                          </Typography>
                        </div>
                        <div style={taxHeadStyle}>
                          <Typography style={{ fontWeight: 'bold', margin: '5px' }}>
                            SGST :
                          </Typography>
                          <Typography
                            style={{
                              width: '150px',
                              textAlign: 'end',
                              margin: '5px',
                            }}
                          >
                           <span>₹</span> {floatnum(taxes() / 2)} 
                          </Typography>
                        </div>

                        {/* <div style={taxHeadStyle}>
                          <Typography style={{ fontWeight: 'bold', margin: '5px' }}>
                            TCS :
                          </Typography>
                          <Typography
                            style={{
                              width: '150px',
                              textAlign: 'end',
                              margin: '5px',
                            }}
                          >
                            {floatnum(tcstaxes())} <span>₹</span>
                          </Typography>
                        </div> */}
                      </>
                    ) : (
                      <>
                        <div style={taxHeadStyle}>
                          <Typography style={{ fontWeight: 'bold', margin: '5px' }}>
                            IGST :
                          </Typography>
                          <Typography
                            style={{
                              width: '150px',
                              textAlign: 'end',
                              margin: '5px',
                            }}
                          >
                           <span>₹</span> {floatnum(taxes())} 
                          </Typography>
                        </div>
                        {/* <div style={taxHeadStyle}>
                          <Typography style={{ fontWeight: 'bold', margin: '5px' }}>
                            TCS :
                          </Typography>
                          <Typography
                            style={{
                              width: '150px',
                              textAlign: 'end',
                              margin: '5px',
                            }}
                          >
                            {floatnum(tcstaxes())} <span>₹</span>
                          </Typography>
                        </div> */}
                      </>
                    )}

                      {poOption == 2 &&(<FormControl>
                        <RadioGroup
                          row
                          aria-label='Tax Rate'
                          value={formValues.tax_types}
                          name='tax_types'
                          onChange={handleChange}
                          disabled={props.returnState}
                        >
                          <FormControlLabel value='1' control={<Radio />} label='TDS' />
                          <FormControlLabel value='0' control={<Radio />} label='TCS' />
                         
                        </RadioGroup>
                      </FormControl>)}
                      {poOption == 2 && (formValues.tax_types === '1' ?
                      <>
                        {/* <FormControl fullWidth>
                          <InputLabel id='id'>Select a Tax</InputLabel>
                          <Select value={formValues.tds_percent} name='tds_percent' labelId='id' label='Select a Tax' onChange={handleChange}  MenuProps={{
                          getContentAnchorEl: null,
                          anchorOrigin: {
                           vertical: "bottom",
                           horizontal: "left",
                           },
                      transformOrigin: {
                     vertical: "top",
                       horizontal: "left",
                          },
                      PaperProps: {
                       style: {
                         maxHeight: 200, // Limit dropdown height to prevent excessive overlap
                      overflowY: "auto",
                       zIndex: 1300, // Ensures it's above other elements
                          },
                            },
                               }}> */}
                            {/* <TextField
                                variant="outlined"
                                size="small"
                                placeholder="Search"
                                fullWidth
                                onChange={(e) => setSearchText(e.target.value)}
                                sx={{ margin: "8px" }}
                              /> */}
                            {/* {tds_taxrate?.map((option, index) => (
                              <MenuItem key={index} value={option?.tds_rate}>
                                {option.category} [{option.tds_rate}]
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>  */}
                        {/* <Autocomplete
                          name='tds_percent'
                          options={tds_taxrate}
                          value={formValues.tds_value}
                          getOptionLabel={(option) => `${option.category} [${option.tds_rate}]`}
                          onChange={(event, newValue) => handleChange({target: {name: 'tds_percent', value: newValue}})}
                          renderInput={(props) => (
                            <TextField
                              {...props}
                              label='Select a Tax'
                            />
                          )}
                        /> */}
                          <Autocomplete
                            name="tds_percent"
                            disabled={props.returnState}
                            options={tds_taxrate}
                            value={tds_taxrate.find(opt => opt.id === formValues.tds_id) || null}
                            getOptionLabel={(option) => `${option.category} [${option.tds_rate}] [${option.section}]`}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            onChange={(event, newValue) => handleChange({ target: { name: 'tds_percent', value: newValue } })}

                            renderInput={(props) => (
                              <TextField {...props} label="Select a Tax" />
                            )}
                          />
                        </>:
                        <TextField
                          id='standard-basic'
                          disabled={props.returnState}
                          value={formValues.tcs}
                          name='tcs'
                          label='TCS'
                          fullWidth={true}
                          onChange={handleChange}
                          variant='filled'
                          type='number'
                        />

                      )}

                    <hr style={{ backgroundColor: 'rgba(0,0,0,0.3)' }} />
                    {
                      props.appConfigData.roundedOffEnabled !== 'false' &&
                      <div style={taxHeadStyle}>
                        <Typography style={{ margin: 'auto 5px 5px' }}>
                          Rounded Off :
                        </Typography>
                        <Typography
                          style={{
                            width: '150px',
                            textAlign: 'end',
                            fontWeight: 'bolder',
                            fontSize: '1rem',
                            margin: '5px',
                          }}
                        >
                          <span>₹</span> {getRoundOff()} 
                        </Typography>
                      </div>
                    }

                    <div style={taxHeadStyle}>
                      <Typography style={{ margin: 'auto 5px 5px' }}>
                        Total :
                      </Typography>
                      <Typography
                        style={{
                          width: '150px',
                          textAlign: 'end',
                          fontWeight: 'bolder',
                          fontSize: '1rem',
                          margin: '5px',
                        }}
                      >
                      <span>₹</span>{" "}
                      {floatnum(
                        props.appConfigData.roundedOffEnabled === "true"
                          ? Math.round(
                              untaxed() +
                              taxes() +
                              (props.returnState
                                ? calculateTcsFromPercent()
                                : tcstaxes()) -
                              calculatetdsTaxAmount()
                            )
                          : untaxed() +
                            taxes() +
                            (props.returnState
                              ? calculateTcsFromPercent()
                              : tcstaxes()) -
                            calculatetdsTaxAmount()
                      )}
                     </Typography>
                    </div>
                  </div>
                </Grid>
                <Grid
                  style={{ marginTop: 'auto' }}
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <Grid container justifyContent='flex-end' spacing={2}>
                  <Grid>
                        {form === false ? (
                          <Button
                            variant='contained'
                            color='secondary'
                            onClick={props.handleClose}
                          >
                            Close
                          </Button>
                        ) : (
                          <Button
                            variant='contained'
                            color='secondary'
                            onClick={() => validClose()}
                          >
                            Close
                          </Button>
                        )}
                      </Grid>

<Grid>

                      {props.returnState ? (
                        <Button
                          variant='contained'
                          color='primary'
                          onClick={() => {
                          
                            
                              returnFunc();
                            
                          }}
                        >
                          Return
                        </Button>
                      ) : (
                        <ActionButton
                          soDate={formValues.po_date}
                          isPrint={props.isPrint}
                          handleClose={props.handleClose}
                          handleDraft={handleDraft}
                          appConfigData={props.appConfigData}
                          addNote={addNote}
                          note={formValues.note}
                          isDisable={
                            Object.keys(finalEditData).length > 0 ? (+finalEditData?.invoice_number === "")
                            : poOption !== '2' ? (formValues.supplier_id &&
                              formValues.location_id &&
                              itemsData.length) : ((formValues.supplier_id &&
                                formValues.location_id &&
                                itemsData.length && (formValues.invoice_number !== '' || checkerror.invoice_number === false))
                              // checkerror.invoice_number
                            )
                          }
                          // checkReceivingQty = {Object.keys(finalEditData).length > 0 ? itemsData.some(item => item?.received_quantity > 0 || (item.is_serialized === 1 && item.lots.length > 0)) ? false : true : Array.isArray(itemsData) ? itemsData.some(item => item?.receiving_quantity === '' || item?.receiving_quantity === 0 || (item.is_serialized === 1 && item.lots.length === 0)) : false}

                          checkReceivingQty = {Object.keys(finalEditData).length > 0
                            ? itemsData.some(
                              item =>
                              ((item.is_serialized === 1 && item.lots && item.lots.length > 0) || (item.receiving_quantity !== '' && item.receiving_quantity !== 0)) 
                            )
                              ? false
                              : true
                            : Array.isArray(itemsData)
                              ? itemsData.some(
                                item =>
                                  item?.receiving_quantity === '' ||
                                  item?.receiving_quantity === 0 ||
                                  (item.is_serialized === 1 && (!item.lots || item.lots.length === 0))
                              )
                              : false}
                          
                            isDisableSaveButton={
                              formValues.supplier_id &&
                              formValues.location_id &&
                              itemsData.length > 0 &&
                              (formValues.invoice_number !== '' && 
                              formValues.invoice_number !== null && 
                              checkerror.invoice_number === false) &&
                              itemsData.filter(item => Number(item.receiving_quantity) > 0).every(
                                (item) =>
                                  item.receiving_quantity &&
                                  (
                                    (item.is_serialized === 1 && item.lots && item.lots.length > 0) || 
                                    (item.is_serialized === 0)
                                  )
                              )
                            }
                          
                          status={props.status}
                          createMail={createMail}
                          custType={'VENDOR'}
                          handleSubmit={handleSubmit}
                          payment={() => setpaymentOpen(true)}
                          custData={getVendor()}
                          invoice={formValues.po_number}
                          sales_items={itemsData}
                          from={props.from}
                          to={props.to}
                          filtedValue={props.filtedValue}
                          rowPopupOpen={props.rowPopupOpen}
                          mail_configuration={props.mail_configuration}
                          poOption={poOption}
                          showpopup={showpopup}
                          tcs={Rdata?.tcs}
                          tds={Rdata?.tds}
                          tcs_percent={Rdata?.tcs_percent}
                          tds_percent={Rdata?.tds_percent}
                          tds_value={Rdata?.tds_id}
                        />
                      )}
                                         </Grid>
                                         </Grid>

                </Grid>
              </Grid>
            </CardContent>
          }


          {props.type === 'returnFromInventory' && (
            <CardContent sx={widthSx}>
              <div style={headStyle}>
                <Typography variant='h6' >

                  Purchase Return
                </Typography>

                <div style={{ marginLeft: 'auto' }}>
                  <IconButton aria-label='close' onClick={props.handleClose}>
                    <CloseIcon />
                  </IconButton>
                </div>
              </div>
              <Grid
                container
                spacing={3}
              >
                <Grid
                  size={{
                    lg: 4,
                    md: 4,
                    sm: 4,
                    xs: 12
                  }}>

                  <LocalizationProvider dateAdapter={DateAdapter}>
                    <DatePicker
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: 'filled',
                        },
                      }}
                      name='return_time'
                      label='Purchase Return Date'
                      format='DD/MM/YYYY'
                      value={toMomentOrNull(formValues.receiving_time)}
                      views={['year', 'month', 'day']}
                      disableFuture
                      onChange={(date) =>
                        handleChange({
                          target: { value: date, name: 'receiving_time' },
                        })
                      }
                      fullWidth
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid
                  size={{
                    lg: 4,
                    md: 4,
                    sm: 4,
                    xs: 12
                  }}>
                  <Autocomplete
                    // disablePortal
                    id='combo-box-demo'
                    name='supplier_id'
                    required={true}
                    value={formValues.supplier_id !== null ? vendor
                      .find((d) => formValues.supplier_id === d.supplier_id) || { company_name: '' } : { company_name: '' }}
                    onChange={(e, val) => {
                      setVendorId(val.supplier_id)
                      handleChange({ target: { name: 'supplier_id', value: val !== null ? val.supplier_id : null } })
                    }}
                    onBlur={handleBlur}
                    // onInputChange={(event, newInputValue) => {
                    //   setForm({...formValues, supplier_id:newInputValue});
                    // }}

                    disabled
                    options={vendor
                      .filter((d) => d.company_name && d.supplier_id && d.supplier_id !== null && d.company_name !== null)}
                    //renderOption={option => {option.company_name }}
                    getOptionLabel={(option) => option.company_name}

                    renderInput={(params) => {
                      const get = { ...params };

                      get.InputProps = {
                        ...params.InputProps,
                        startAdornment: (
                          <Tooltip title='Create New'>
                            <IconButton
                              size='small'
                              onClick={() => {
                                setModalStatusHandler(true);
                                setModalTypeHandler('NewVendor');
                                // if (this.state.add_click) {
                                //   this.addActionRef.current.click();
                                //   this.setState({add_click: false});
                                // }
                              }}
                            >
                              <Add fontSize='small' />
                            </IconButton>
                          </Tooltip>
                        ),
                      };

                      return (
                        <TextField
                          {...get}
                          label='Vendor'
                          placeholder='Select Vendor'
                          error={checkerror.supplier_id}
                          fullWidth={true}
                          required={true}
                          // autoFocus
                          // error={props.value !== undefined ? props.error : false}
                          // label='Product'
                          variant='filled'
                        />
                      );
                    }}
                  />

                </Grid>

                <Grid
                  size={{
                    lg: 4,
                    md: 4,
                    sm: 4,
                    xs: 12
                  }}>
                  <TextField
                    id='standard-basic'
                    name='comment'
                    label='Comments'
                    // required
                    multiline={true}
                    value={formValues.comment}
                    variant='filled'
                    fullWidth={true}
                    onChange={handleChange}
                  />
                </Grid>

                {/* <Grid size={4}>

          <TextField
              id="payment-term-field-2"
              name="payment_type"
              label="Payment Term"
              value={formValues.payment_type}
              fullWidth={true}
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid> */}

                <Grid
                  size={{
                    lg: 4,
                    md: 4,
                    sm: 4,
                    xs: 12
                  }}>
                  <TextField
                    id='standard-basic'
                    value={formValues.reference}
                    name='reference'
                    label='Reference'
                    fullWidth={true}
                    onChange={handleChange}
                    variant='filled'
                  />
                </Grid>

              </Grid>
              <div style={{ margin: '30px 0' }}>
                <ReceivingsItems
                  itemsData={itemsData}
                  updateItem={updateItem}
                  // handleSwitch={handleSwitch}
                  setitemsData={setitemsData}
                  setModalStatusHandler={setModalStatusHandler}
                  setModalTypeHandler={setModalTypeHandler}
                  selectData={selectData}
                  setselectData={setselectData}
                  edit_data={finalEditData || {}}
                  status={props.status}
                  type={props.type}
                  // pot_code_seq={props.pot_code_seq}
                  // potCodeAction={props.potCodeAction}
                  setLoaderStatusHandler={setLoaderStatusHandler}
                  returnState={props.returnState}
                  // isPrint={props.isPrint}
                  formValues={formValues}
                  invoiceUpdateState={setformValues}
                  supplierUpdate={handleChange}
                  // poOption = {poOption}
                  checkerror={checkerror}
                  setcheckerror={setcheckerror}
                  // vendorPriceListProduct={vendorPriceListProduct}
                  vendorId={vendorId}
                // handleLastPotCodeSeq={handleLastPotCodeSeq}
                />
              </div>

              <Grid container spacing={3}>
                <Grid
                  size={{
                    lg: 5,
                    md: 6
                  }}>
                  {itemsData.length ? (
                    <GstTable
                      itemsData={itemsData}
                      setsuppliers={setsuppliers}
                      supplier_id={formValues.supplier_id}
                      app_config_data={props.app_config_data_based_on_type}
                      vendor={vendor}
                    />
                  ) : (
                    ''
                  )}
                </Grid>
                <Grid
                  style={{ marginTop: 'auto' }}
                  size={{
                    lg: 4,
                    md: 6
                  }}>
                  <div style={{ width: '300px', marginLeft: 'auto' }}>
                    <div style={taxHeadStyle}>
                      <Typography style={{ fontWeight: 'bold', margin: '5px' }}>
                        Untaxed Amount :
                      </Typography>
                      <Typography
                        style={{
                          width: '150px',
                          textAlign: 'end',
                          margin: '5px',
                        }}
                      >
                      <span>₹</span>  {floatnum(untaxed())} 
                      </Typography>
                    </div>

                    {suppliers ? (
                      <>
                        <div style={taxHeadStyle}>
                          <Typography style={{ fontWeight: 'bold', margin: '5px' }}>
                            CGST :
                          </Typography>
                          <Typography
                            style={{
                              width: '150px',
                              textAlign: 'end',
                              margin: '5px',
                            }}
                          >
                           <span>₹</span> {floatnum(taxes() / 2)} 
                          </Typography>
                        </div>
                        <div style={taxHeadStyle}>
                          <Typography style={{ fontWeight: 'bold', margin: '5px' }}>
                            SGST :
                          </Typography>
                          <Typography
                            style={{
                              width: '150px',
                              textAlign: 'end',
                              margin: '5px',
                            }}
                          >
                           <span>₹</span> {floatnum(taxes() / 2)} 
                          </Typography>
                        </div>
                        <div style={taxHeadStyle}>
                          <Typography style={{ fontWeight: 'bold', margin: '5px' }}>
                            TCS :
                          </Typography>
                          <Typography
                            style={{
                              width: '150px',
                              textAlign: 'end',
                              margin: '5px',
                            }}
                          >
                           <span>₹</span> {floatnum(tcstaxes())} 
                          </Typography>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={taxHeadStyle}>
                          <Typography style={{ fontWeight: 'bold', margin: '5px' }}>
                            IGST :
                          </Typography>
                          <Typography
                            style={{
                              width: '150px',
                              textAlign: 'end',
                              margin: '5px',
                            }}
                          >
                          <span>₹</span> {floatnum(taxes())}
                          </Typography>
                        </div>
                        <div style={taxHeadStyle}>
                          <Typography style={{ fontWeight: 'bold', margin: '5px' }}>
                            TCS :
                          </Typography>
                          <Typography
                            style={{
                              width: '150px',
                              textAlign: 'end',
                              margin: '5px',
                            }}
                          >
                            <span>₹</span> {floatnum(tcstaxes())} 
                          </Typography>
                        </div>
                      </>
                    )}

                    <hr style={{ backgroundColor: 'rgba(0,0,0,0.3)' }} />
                    <div style={taxHeadStyle}>
                      <Typography style={{ margin: 'auto 5px 5px' }}>
                        Total :
                      </Typography>
                      <Typography
                        style={{
                          width: '150px',
                          textAlign: 'end',
                          fontWeight: 'bolder',
                          fontSize: '1rem',
                          margin: '5px',
                        }}
                      >
                       <span>₹</span> {floatnum(untaxed() + taxes() + tcstaxes())} 
                      </Typography>
                    </div>
                  </div>
                </Grid>
                <Grid
                  style={{ marginTop: 'auto' }}
                  size={{
                    lg: 3,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <div style={{ display: 'flex' }}>
                    <div style={{ display: 'flex', marginLeft: 'auto' }}>
                      <div style={{ marginRight: 20, marginTop: 'auto' }}>
                        {form === false ? (
                          <Button
                            variant='contained'
                            color='secondary'
                            onClick={props.handleClose}
                          >
                            Close
                          </Button>
                        ) : (
                          <Button
                            variant='contained'
                            color='secondary'
                            onClick={() => validClose()}
                          >
                            Close
                          </Button>
                        )}
                      </div>

                      {props?.returnState ? (
                        <Button
                          variant='contained'
                          color='primary'
                          disabled={!itemsData.length}
                          onClick={() => returnFunc()}
                        >
                          Return
                        </Button>
                      ) : (
                        ''
                      )}
                    </div>
                  </div>
                </Grid>
              </Grid>
            </CardContent>)
          }

        </>
      </Card>
      <CancelDialog
        handle={cancel}
        delete={dialog}
        close={props.handleClose}
      ></CancelDialog>
      <PaymentDialog
        getPay={getPay}
        selectionModel={selectionModel}
        setSelectionModel={setSelectionModel}
        entryvalue = {entryvalue}
        handleEntry = {setHandleEntry}
        status={props.status}
        received_amount={formValues.paid_amount}
        handleSubmit={handleSubmit}
        custType={'VENDOR'}
        Tdata={Tdata}
        setTdata={setTdata}
        custData={getVendor()}
        sales_items={itemsData}
        paymentOpen={paymentOpen}
        setpaymentOpen={setpaymentOpen}
      />
      {/* </ThemeProvider> */}
      <Dialog open={productResetDialog}>
        <DialogTitle>
          Product Reset Confirmation
        </DialogTitle>

        <DialogContent>
          <Typography variant='h6'>
            Are you sure to change the purchase status ?
          </Typography>
        </DialogContent>

        <DialogActions>
          <Grid container spacing={2} display='flex' justifyContent='flex-end'>
            <Grid>
              <Button
                variant = 'contained'
                color = 'error'
                onClick = {() => handlePurchaseItemsReset('no')}
              >
                No
              </Button>
            </Grid>

            <Grid>
              <Button
                variant = 'contained'
                onClick = {() => handlePurchaseItemsReset('yes')}
              >
                Yes
              </Button>
            </Grid>
          </Grid>
        </DialogActions>
      </Dialog>
    </div>
  );
};


export default Popup;
