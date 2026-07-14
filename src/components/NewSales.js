import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
  createRef,
  memo
} from 'react';
import {useTheme} from '@mui/material/styles';
import MaterialTable, {MTableAction, MTableHeader, MTableToolbar } from 'utils/SafeMaterialTable';
// import { findAllByKey } from './common';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import _ from 'lodash';
// import { useHistory } from 'react-router-dom';
import DublicateLotList from '../pages/sales/sales/dublicateLotsList';
import CommonImport from './pos/payment_section/CommonImport';
import {
  Sales_Item_Taxes,
  getItemTaxes,
  checkEachBarcodeWasEntered,
  Sale_Status,
  AddSales_Status,
  singleTax,
} from '../pages/sales/sales/sale_status_list';
import ActionButton from '../pages/sales/sales/actionButton';
import UnSavedChangesWarning from '../pages/common/unChangeswarning';
import CancelDialog from './CancelDialog';
// import {formLabelsTheme} from "./Asterisk";
import PaymentDialog from '../pages/sales/paymentSalesPurchase/Dialog';
import {useDispatch, useSelector} from 'react-redux';
// import {sendMail, returnActions} from '../redux/actions/sales_actions';
import context from '../context/CreateNewButtonContext';
import MissingProduct from '../pages/sales/purchases/MissingProduct';
import debounce from "lodash.debounce";
// import { CommentsDisabledOutlined } from '@mui/icons-material';
import {
  Button,
  Radio,
  TextField,
  Typography,
  Grid,
  Select,
  InputLabel,
  MenuItem,
  FormControl,
  FormHelperText,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Icon,
  popoverClasses,
  RadioGroup,
  FormControlLabel,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  InputAdornment,
  Box,
  Checkbox,
  TableContainer,
} from '@mui/material';
import Autocomplete, {createFilterOptions} from '@mui/material/Autocomplete';
import {Close, Add,Edit} from '@mui/icons-material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ItemPopup from '../pages/sales/sales/lotNumber';
import Fab from '@mui/material/Fab';
import {getTrimmedData} from './trimFunction/index';
import ProductSelect from './productAutoComplete';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import AddIcon from '@mui/icons-material/Add';
import moment from 'moment';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import {read, utils} from 'xlsx-js-style';
import AppHeader from '@crema/core/AppLayout/DefaultLayout/AppHeader';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle } from 'utils/pageSize';
import { listStockLocationAction, listStockLocationSequenceAction } from 'redux/actions/stock_Location_actions';
import { getPriceListAction } from 'redux/actions/priceList_actions';
import { getCustomerOutstandingDetailsAction, getCustomerOutstandingDetailsDuesAction, listCustomerAction, updateCreditDaysAction, updateShippingDetailAction } from 'redux/actions/customer_actions';
import { bulkProductAction, listProductAction, changeProductHsnCodeDescriptionAction, listProductActionByType, getProductByLotNumberSearchAction } from 'redux/actions/product_actions';
import apiCalls from 'utils/apiCalls';
import { filterOptions } from 'utils/searchFunc';
import { getAppConfigDataAction } from 'redux/actions/app_config_actions';
import { getLocationDataBasedOnPincode } from './common';
import { commontoastAction } from 'redux/actions/actions';
import {AdapterMoment as DataAdapter} from '@mui/x-date-pickers/AdapterMoment';
import { GetTdsTaxes } from 'redux/actions/purchase_actions';
import { getsessionStorage } from 'pages/common/login/cookies';
import { approvalUserRightsAction, creditDebitNoteSeq, creditDebitNoteSeqUpdate, getLatestTransporterDetailsAction, salesApprovalsAction, triggerSalesModal,customesSalesmanAction } from 'redux/actions/sales_actions';
import CloseIcon from '@mui/icons-material/Close';
import ShippingDetailPopup from 'pages/sales/customer/shippingdetailpopup';
import { productCreateSalesAlert, requiredFieldsAlert } from 'redux/actions/load';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import EditIcon from '@mui/icons-material/Edit';
import { getRoleAuthorization } from '@crema/utility/helper/RoleAuthHelper';
import { getUserRightsByRoleIdAction } from 'redux/actions/role_actions';
import { getUserRightsAction } from 'redux/actions/userRole_actions';
import DoneIcon from '@mui/icons-material/Done';
import { gstValidation, vehicleNumberValidation } from './regexFunction';
import { useCustomFetch } from 'utils/useCustomFetch';
import { sequenceBasedOnNameAction } from 'redux/actions/sequencePattern_actions';
import API_URLS from '../utils/customFetchApiUrls';
 const customFetch = useCustomFetch();


const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});



const rootSx = {
  display: 'flex',
  justifyContent: 'center',
};
const widthSx = {
  width: '100%',
};
const headSx = {
  display: 'flex',
};
const taxHeadSx = {
  display: 'flex',
  justifyContent: 'flex-end',
};

// function AlertDialogSlide({
//   misMatchData, 
//   setOpenAlert, 
//   setMisMatchData,
//   productMisMatch,
//   productOutOfStock,
//   duplicateLot,
//   setProductMisMatch,
//   setProductOutOfStock,
//   setDuplicateLot,
//   duplicateLotInDb, 
//   setDuplicateLotInDb,
//   locationMisMatch, 
//   setLocationMisMatch,
//   setSalesItems,
//   excelItemsNotAdded,
//   setExcelItemsNotAdded
// }) {

//   const[open , setOpen] = useState(true)



//   const handleClose = () => {
//     setProductMisMatch([])
//     setProductOutOfStock([])
//     setDuplicateLot([])
//     setDuplicateLotInDb([])
//     setLocationMisMatch({})
//     setOpen(false);
//     setOpenAlert(false)
//     setExcelItemsNotAdded([])
//     setSalesItems([])
//   };

//   function Table({data, tableName}) {

//     const tableNameList = {
//       productMisMatch : 'Some products Mis Matched',
//       duplicateLot : 'Duplicate Lot number',
//       productOutOfStock : 'Some products Out of Stock',
//       duplicateLotInDb : 'Product has duplicate Lot Number in Database',
//       excelItemsNotAdded : 'Some Items not Added from the Excel'
//     }

    
    

//     return (
//       <Grid
//         style={{
//           margin: '10px',
//           width:'65vh'
//         }}
//       >
//         <Typography variant='h6' pb={1}>
//           {tableNameList[tableName]}
//         </Typography>
//         <table
//           style={{
//             border: '1px solid',
//             fontSize: '12px',
//             borderCollapse: 'collapse',
//             padding: '0px 5px',
//             width: '100%',
//             paddingBottom: '10px'
//           }}
//         >
//           <tr>
//             <th style={{border: '1px solid', width:'60%'}}>Product Name</th>
//             <th style={{border: '1px solid', width:'40%'}}>Lot Number / Qty</th>
//           </tr>
//           {data.map((d, i) => (
//             <tr key={i}>
//               <td style={{border: '1px solid', padding: '0px 5px'}}>
//                 {d.name}
//               </td>

//               {d.uploadQty ? (
//                 <td style={{border: '1px solid', padding: '0px 5px'}}>
//                   Uploaded Qty
//                   <span style={{fontWeight: 'bold'}}>({d.uploadQty})</span> is
//                   more than actual qty
//                   <span style={{fontWeight: 'bold'}}>({d.actualQty})</span>
//                 </td>
//               ) : (
//                 <td style={{border: '1px solid', padding: '0px 5px'}}>
//                   {d.lot}
//                 </td>
//               )}
//             </tr>
//           ))}
//         </table>
//       </Grid>
//     );
//   }


//   return (
//     <div>
//       <Dialog
//         open={open}
//         TransitionComponent={Transition}
//         keepMounted
//         onClose={handleClose}
//         aria-describedby='alert-dialog-slide-description'
//       >

//         {productMisMatch.length > 0 ? (
//           <Table data={productMisMatch} tableName={'productMisMatch'} />
//         ) : (<></>)}

//         {productOutOfStock.length > 0 ? (
//           <Table data={productOutOfStock} tableName={'productOutOfStock'} />
//         ) : (<></>)}

//         {duplicateLot.length > 0 ? (
//           <Table data={duplicateLot} tableName={'duplicateLot'} />
//         ) : (<></>)}

//         {duplicateLotInDb.length > 0 ? (
//           <Table data={duplicateLotInDb} tableName={'duplicateLotInDb'} />
//         ) : (<></>)}

//         {excelItemsNotAdded.length > 0 ? (
//           <Table data={excelItemsNotAdded} tableName={'excelItemsNotAdded'} />
//         ) : (<></>)}

//         {productMisMatch.length === 0 &&
//         productOutOfStock.length === 0 &&
//         duplicateLot.length === 0 &&
//         locationMisMatch.title && (
//           <>
//             <DialogTitle>{locationMisMatch.title}</DialogTitle>
//             <DialogContent>{locationMisMatch.content}</DialogContent>
//           </>
//         )}
//         <DialogActions>
//           <Button onClick={handleClose}>Close</Button>
//         </DialogActions>
//       </Dialog>
//     </div>
//   );
// }


function AlertDialogSlide({
  setValidationToDefault,
  productOutOfStock,
  duplicateLotNumber,
  lotAlreadyExistInDb,
  differentVendor,
  setOpenAlert
}) {

  const[open , setOpen] = useState(true)

  const handleClose = () => {
    setOpen(false);
    setOpenAlert(false)
    setValidationToDefault()
  };

  return (
    <div>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby='alert-dialog-slide-description'
      >
        

        {duplicateLotNumber.length > 0 && (
          <>
            <Tables data={duplicateLotNumber[1]} tableName={'duplicateLotInDb'} />
          </>
          
        )}

       {productOutOfStock.length > 0 && (
          <>
            <Tables data={productOutOfStock[1]} tableName={'productOutOfStock'} />
          </>
          
        )}

       
        
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}



const Popup = (props) => {
  const {setinvoicelayout,invoicelayout} = props;
  // console.log(props,'propproduct')
  // console.log(props?.appConfigData,'appconfigdataaa')
  const theme = useTheme()
  const defaultPriceList = props.price_list.length > 0 && props.price_list?.filter(pList => pList.price_list_name === 'Default')[0];
  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(context);

 

  // const history = useHistory();
  // const [ setTableData] = useState({ item_id: '' })
 const [loader, setLoader] = useState(false)
   const textRef = useRef(null);
     const [Rdata ,setRData]=useState()
  const [button, setButton] = useState(false)
  const [editHSNDesc, setEditHSNDesc] = useState(null)
  const [hsnDesc, setHsnDesc] = useState({
    hsnCode: null,
    description: null,
    item_id: null
  })
  const [formValues, setFormValues] = useState({
    customer_id: null,
    employee_id: commoncookie,
    comment: null,
    reference: null,
    invoice_number: null,
    sale_status: null,
    counter_id: null,
    work_order_number: null,
    location_id: null,
    sale_type: 0,
    note: '',
    price_list: null,
    ship_legal_name:null,
    ship_address:null,
    ship_location:null,
    ship_stcd:null,
    ship_zip:null,
    ship_gstin:null,
    ship_phone_number:null,
    ship_person_name:null,
    disp_address:null,
    disp_company_name:null,
    disp_location:null,
    disp_zip:null,
    disp_stcd:null,
    trans_name:null,
    trans_doc_no:null,
    trans_id:null,
    trans_mode:null,
    distance:null,
    veh_no:null,
    tax_types: "0",
    tcs:"",
    tcs_percent:"0%",
    tds:"",
    tds_percent :"0%",
    tds_value: null,
    sales_man : null,
    invoiceCreditDays : null,
    invoiceCreditValue : null

    // sale_time: new Date()
  });
 
  const [formErrors, setFormErrors] = useState({
    customer_id: null,
    comment: null,
    invoice_number: null,
    sale_status: null,
    counter_id: null,
    work_order_number: null,
    location_id: null,
    price_list: null,
    ship_legal_name : null,
    ship_address:null,
    ship_location:null,
    ship_stcd:null,
    ship_zip:null,
    disp_address:null,
    disp_company_name:null,
    disp_location:null,
    disp_zip:null,
    disp_stcd:null,
    trans_name:null,
    trans_mode:null,
    distance:null,
    veh_no:null,
    trans_id:null,
    trans_doc_no:null,
    sales_man : null

  });
  const [requiredFields] = useState([
    'customer_id',
    'sale_status',
    'location_id',
  ]);

  const [ewayrequiredFields] = useState([  
    // 'ship_legal_name',
    // 'ship_address',
    // 'ship_location',
    // 'ship_stcd',
    // 'ship_zip',
    // 'disp_address',
    // 'disp_company_name',
    // 'disp_location',
    // 'disp_zip',
    // 'disp_stcd',
    'trans_mode',
    'trans_doc_no',
    'trans_id',
    'distance',
  ])
  const [sales_items, setSalesItems] = useState([]);
  // console.log("sales_items",sales_items)
  const [entryvalue, setHandleEntry] = useState(false)
  const [regex] = useState({});
  const [sales_taxes, setSalesTaxes] = useState([]);
  const [taxVisible, setTaxVisible] = useState(true);
  const [tcstaxvisible, setTcsVisible] = useState(false);
  const [dublicateLotVisible, setDublicateLot] = useState([]);
  const [locationWiseProduct, setLocationWiseProduct] = useState([]);
  const [rowdata, setRowData] = useState([])
  const [qty, setQty] = useState(0);
  // console.log("qty")
const [subTotal, setSubTotal] = useState("0.00");
 
  const [productMisMatch, setProductMisMatch] = useState([]);
  const [productOutOfStock, setProductOutOfStock] = useState([]);
  const [duplicateLot, setDuplicateLot] = useState([]);
  const [duplicateLotInDb, setDuplicateLotInDb] = useState([]);
  const [locationMisMatch, setLocationMisMatch] = useState({});
  const [excelItemsNotAdded, setExcelItemsNotAdded] = useState([]);
  const [touchedFields, setTouchedFields] = useState({});
  const [showCancel, setShowCancel] = useState(false);
  // const [sale_type_options] = useState([{ option: 'On Hold', value: 1 }, { option: 'Okey to Ship', value: 2 }, { option: 'Shipped', value: 3 }, { option: 'Delivered', value: 4 }, { option: 'Invoiced', value: 5 }, { option: 'Canceled', value: 6 }])
  // const [filteredProduct, setFilteredProduct] = useState([]);
  const [add_click, setAdd_click] = useState(false);
  const [Prompt, setDirty, setPristine] = UnSavedChangesWarning();
  const [initialState, setInitialState] = useState({});
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState(false);
  const [openAlert, setOpenAlert] = useState(false)
  const tempinit = useRef(null);
  const inputRef = useRef(null);
  const tempinitform = useRef(null);
  const tempedits = useRef(null);
  const temptaxedits = useRef(null);
  const tempitem = useRef(null);
  const tempcust = useRef(null);
  const temptcscust = useRef(null);
  const tempLocation = useRef(null);
  const bulkEditRef = useRef(null);
  // const tempinitformedit = useRef(null)
  // const tempinitformVal = useRef(null)
  const [paymentOpen, setpaymentOpen] = useState(false);
  const [Tdata, setTdata] = useState([]);
  const [selectionModel, setSelectionModel] = useState([]);
  const [getPay, setgetPay] = useState([]);
  const dispatch = useDispatch()
  const [posSeq, setposSeq] = useState(false);
  const [row_id, setRowid] = useState({
    id: '1',
    data: '',
    open: false,
    status: '',
  });
  const [previousSellingPrice, setPreviousSellingPrice] = useState([]);
  const [qtyError, setQtyErr] = useState(null);
  const [returnItems, setreturnItems] = useState([]);
  const [filterOpen, setFilterOpen ] = useState(false);
  const [ dcchallan, setDchallan ] = useState(false);
  const [priceList, setPriceList] = useState([]);
  const [defaultPriceListId, setDefaultPriceListId] = useState('');
  const [productData, setProductData] = useState([]);
  const addActionRef = useRef(null);
  const cancelActionRef = useRef(null);
  const receivingTimeRef = useRef(null);
  const [viewSerialNumber, setViewSerialNumber] = useState([])
  const [viewSerialNumberOpen, setViewSerialNumberOpen] = useState(false)
  const [productResetDialog, setProductResetDialog] = useState(false)
  const [oldSaleStatus, setOldSaleStatus] = useState(null)
  const [request,setRequest]= useState(false)
  const [shipTo, setShipTo] = useState(null)
   const [shippingOpen, setShippingOpen] = useState(false)
  const [status, setStatus ] = useState('create')
  const [shippingData, setShippingData] = useState([]);
  const [productDetails, setProductDetails] = useState([]);
  const [editShippingMode, setEditShippingMode] = useState(false);
  const [mOpen, setmOpen] = useState(false);
  const [xlData, setXlData] = useState([]);
  const [dataApi, setDataApi] = useState([]);
  const [withItemId, setWithItemId] = useState([]);
  const [lotNumberSearch, setLotNumberSearch] = useState([])
  const [lotNumberMessage, setLotNumberMessage] = useState({error: false, message: ''})
  const storage = getsessionStorage()
  const isAdmin = storage?.role_name === 'Administrator'
  // console.log(shippingOpen,shipTo,'shippingOpen')
    const {
      PriceListReducer: {price_list}, customerReducer: {customer,getCustomerOutstanding, getCustomerOutstandingDues}, appConfigReducer: {app_config_data,app_config_data_based_on_type},
      purchasesReducer:{tds_taxrate},
      salesReducer : {salesApprovals,getApprovalRights,customer_salesman}, productReducer:{product,productByType},
      salesReducer:{credit_debit_seq},
      UserRoleReducer: {userRights},
       sequencePatternReducer: {get_sequence_based_on_name},

  } = useSelector((state) => state);

  console.log(get_sequence_based_on_name, "JKJKJKKJKJKJKJ")



  const hasCreditDaysEdit = userRights?.some(
    (perm) => perm.right_name === "creditDaysEdit" && perm.value === true
  );

  const hasCreditDaysValueEdit = userRights?.some(
    (d) => d.right_name === 'creditDaysValueEdit' && d.value === true
  )

const [shipformValues, setShipFormValues] = useState({
    company_name: null,
    contactperson_name: null,
    contactperson_num: null,
    Gst: null,
    city: null,
    state: null,
    zip: null,
    country: 'India',
    latitude : null,
    longitude : null,
    address : null,
    area : null
  });

  const [shipformErrors, setShipFormErrors] = useState({
      company_name: null,
      zip: null,
      state: null,
      city: null,
      address: null,
      area: null
    });

    const [shiprequiredFields] = useState([ 
        'company_name',
        'zip',
        'state',
        'city',
        'address',
        'area'
      ]);


      const [openDialog, setOpenDialog] = useState(false);
      const [selectedAddress, setSelectedAddress] = useState(null);
      const [addressManuallySelected, setAddressManuallySelected] = useState(false);
      const [selectedCustomer, setSelectedCustomer] = useState(null);
      const [customerEdit, setCustomerEdit] = useState(false)
      const [editOpen, setEditOpen] = useState(false);
      const [editCreditDaysValueOpen, setCreditDaysValueOpen] = useState(false);
      const [editSalesManOpen, setEditSalesManOpen] = useState(false);
      const [dueDaysInput, setDueDaysInput] = useState('');
      const [salesMan, setSalesMan] = useState({id:null,value:null});
      // const [invoiceCreditDays, setInvoiceCreditDays] = useState('');
      // const [invoiceCreditValue, setInvoiceCreditValue] = useState('');
      const [dueDaysValueInput, setDueDaysValueInput] = useState('');
      const [customerSelectionDialogOpen, setCustomerSelectionDialogOpen] = useState(false);
      const [dueAmountPopupOk, setDueAmountPopupOk] = useState('')
      const [addressDialog, setAddressDialog] = useState(false)
      console.log(dueDaysInput,dueDaysValueInput,"selectedCustomer",selectedCustomer)


  useEffect(() => {
    console.log(props.pageType,'pagetyuewrerwe')
    if (props.pageType === '/sales/invoices') {
      setFormValues((prev) => ({
        ...prev,
        sale_status: 2
      }));
    }
    else if (props.pageType === '/sales/salesOrders') {
      setFormValues((prev) => ({
        ...prev,
        sale_status: 1
      }));

    } else {
      setFormValues((prev) => ({
        ...prev,
        sale_status: 8
      }));
    }
  }, [props.pageType]);

  useEffect(() => {
  setFormValues({
    customer_id: null,
    employee_id: commoncookie,
    comment: null,
    reference: null,
    invoice_number: null,
    sale_status: props.pageType === '/sales/invoices' ? 2 : props.pageType === '/sales/salesOrders' ? 1 : 8,
    counter_id: null,
    work_order_number: null,
    location_id: null,
    sale_type: 0,
    note: '',
    price_list: null,
    ship_legal_name: null,
    ship_address: null,
    ship_location: null,
    ship_stcd: null,
    ship_zip: null,
    ship_gstin: null,
    ship_phone_number: null,
    ship_person_name: null,
    disp_address: null,
    disp_company_name: null,
    disp_location: null,
    disp_zip: null,
    disp_stcd: null,
    trans_name: null,
    trans_doc_no: null,
    trans_id: null,
    trans_mode: null,
    distance: null,
    veh_no: null,
    tax_types: "0",
    tcs: "",
    tcs_percent: "0%",
    tds: "",
    tds_percent: "0%",
    tds_value: null
  });

  setShipFormValues({
    company_name: null,
    contactperson_name: null,
    contactperson_num: null,
    Gst: null,
    city: null,
    state: null,
    zip: null,
    country: 'India',
    latitude: null,
    longitude: null,
    address: null,
    area: null
  });
    
    
}, [props.pageType]);


      
      const handleOpenDialog = () => {
        setOpenDialog(true);
      };
    
      const handleCloseDialog = () => {
        setOpenDialog(false);
      };

      const handleOpenEdit = () => {
        if(dueDaysInput === ''){
          setDueDaysInput(selectedCustomer?.credit_days ?? '');
        }
        setEditOpen(true);
      };
    
      const handleCloseEdit = () => {
        setEditOpen(false);
      };

      const handleSalesmanEdit = () => {
        setEditSalesManOpen(true);
      };

      const handleOpenCreditDaysValueEdit = () => {
        if(dueDaysValueInput === ''){
          setDueDaysValueInput(selectedCustomer?.credit_value ?? '');
        }
        setCreditDaysValueOpen(true);
      };
    
      const handleCloseCreditDaysValueEdit = () => {
        setCreditDaysValueOpen(false);
      };

      const handleSalesmanChange = (id) => {

        if(customer_salesman.sales_man_list.length > 0) {

          const selected = customer_salesman.sales_man_list.find(s => s.employee_id === id);
          setSalesMan({id : selected.employee_id,value : selected.username});
        }
      };

  const handleSave = async (e, type) => {
    e.preventDefault()
    if(type === 'CreditDays') {

      console.log(dueDaysInput,'dueDaysInput')
      const data = {
        customer_id: selectedCustomer?.customer_id,
        credit_days: dueDaysInput || null,
        type : type
      }
      setFormValues((prev) => ({
        ...prev,
        invoiceCreditDays: dueDaysInput
      }));

      // setFormValues({...formValues,invoiceCreditDays : dueDaysInput })
      // setInvoiceCreditDays(dueDaysInput)
      setDueDaysInput(dueDaysInput)

      if(selectedCustomer.credit_days === 0 || selectedCustomer.credit_days === null){

        apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(updateCreditDaysAction(data, true, setLoaderStatusHandler, async(res) => {
            if (res) {
              setSelectedCustomer(res[0])
            //  await dispatch(listCustomerAction(setModalTypeHandler, setLoaderStatusHandler))
            }
          })),
    
        );
      }

      handleCloseEdit()

    }

    else if(type === 'salesman'){
      const data = {
        customer_id: selectedCustomer?.customer_id,
        salesMan_id : salesMan || null,
        type : type
      }
       setFormValues((prev) => ({
        ...prev,
        sales_man: salesMan
      }));
      // setFormValues({...formValues,sales_man : salesMan })

      if(selectedCustomer.salesman_id === null && customer_salesman?.customer_sales_man?.length === 0){

        apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(updateCreditDaysAction(data, true, setLoaderStatusHandler)));
      }
      setEditSalesManOpen(false)


    }
    else {
      const data = {
        customer_id: selectedCustomer?.customer_id,
        credit_value : dueDaysValueInput || null,
        type : type
      }
       setFormValues((prev) => ({
        ...prev,
        invoiceCreditValue: dueDaysValueInput
      }));
      // setFormValues({...formValues,invoiceCreditValue : dueDaysValueInput })
      // setInvoiceCreditValue(dueDaysValueInput)
      setDueDaysValueInput(dueDaysValueInput)
      if(selectedCustomer.credit_value === null){

        apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(updateCreditDaysAction(data, true, setLoaderStatusHandler, async(res) => {
            if (res) {
              setSelectedCustomer(res[0])
            //  await dispatch(listCustomerAction(setModalTypeHandler, setLoaderStatusHandler))
            }
          })),
    
        );
      }
    // 
      handleCloseCreditDaysValueEdit()
    }
  };

      const handleSelectAddress = async (address) => {
        // console.log("address", address);
      
        setSelectedAddress(address);
        setAddressManuallySelected(true);
        // console.log('Addresss', address)
        const locationData = await getLocationDataBasedOnPincode(address.pin_code || address.zip);
        // console.log("locationData",locationData)
        let location = { ship_location: null, ship_stcd: null };
      
        if (locationData?.city && locationData?.statecode) {
          location = {
            ship_location: locationData.district,
            ship_stcd: locationData.statecode,
          };
        }
      
        setFormValues((prev) => ({
          ...prev,
          ship_legal_name : address.company_name,
          ship_address: address.address,
          ship_zip: address.pin_code || address.zip,
          ship_gstin: address.Gst || address.tax_id,
          ship_phone_number: address.phone_number || address.contactperson_num,
          ship_person_name : address.contactperson_name,
          ...location,
        }));
      
        handleCloseDialog();
      };
      



  const locationFunction = () => {
  if (headerLocationId && props.status !== 'edit' && storage?.company_type !== 10) {
      const isLocation = props.stocklocation.find(
        (d) => d.location_id === headerLocationId,
      );
      //console.log(isLocation,headerLocationId,'isLocation');
      
      let location_id_1 = isLocation ? headerLocationId : formValues.location_id;
      setTimeout(() => {
       // console.log(location_id_1,props.status,'location_id_1');
        
        const { comment, reference, sale_status, location_id } = props?.newSalesAfterCreating_Data
        setFormValues((prev) => ({ ...prev, location_id : location_id_1, ...(props.isNewSales && { comment, sale_status, reference, location_id}) }));
        setFormErrors((prev) => ({ ...prev, location_id: null }));
      }, 3000);
    }
  };

  const handleshippingEditSubmit =(data) =>{
    console.log('dataaaaediyg', data);
    data.pin_code = data.zip
    let index_value = data.tableData.index;
    console.log('index_value', index_value)
    let updated = [...props.shippingData]; // Clone before edit
    console.log(updated, "klaaaaaaa")
    if (index_value !== undefined && updated[index_value]) {
      updated[index_value] = data;
    }

    props.setShippingData(updated);
    setShippingOpen(false);
   }

  const shippingApply = async(values) =>{
   
  console.log('shippingdatas', values, formValues)
    const indexToUpdate = values?.tableData?.index;

    let payload = {};
  
    if (editShippingMode === "EditShipping") {
      const updatedShipping = {
        ...values,
        customer_id: formValues?.customer_id,
        mode: editShippingMode,
        isPrimary: values.shipping_id ? false : true,
      };
  
      console.log("Payload for updateShippingDetailAction (EDIT):", updatedShipping);
  
      payload = updatedShipping;
  
    } else {
      payload = {
        ...values,
        customer_id: formValues?.customer_id,
        mode: "create"
      };
  
      console.log("Payload for updateShippingDetailAction (CREATE):", payload);
    }
    // let ID_data = props.edit_id_data;
    // var value = ID_data;
    // setShippingData(value.shipping_address);
    // props.setShippingData([...props.shippingData, values]);
    setFormValues((prev) => ({ ...prev, company_name: null,
      contactperson_name: null,
      contactperson_num: null,
      Gst: null,
      city: null,
      state: null,
      pin_code: null,
      country: 'India',
      latitude : null,
      longitude: null
    }))
    const payloadd = { ...values,  customer_id: formValues?.customer_id };
      console.log("Payload for updateShippingDetailAction:", payloadd);
    
    setShippingOpen(false)
         apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(updateShippingDetailAction(payload,() => {
              dispatch(listCustomerAction(setModalTypeHandler, setLoaderStatusHandler))
            }),
         ))
   
  }

  const shippingFilter = (data) =>{
    setShippingOpen(data)
  }

  useEffect(() => {
    if (receivingTimeRef.current) {
      setTimeout(() => {
        receivingTimeRef?.current?.focus();
      }, 100);
    }
  }, []);

  // useEffect(() => {
  //   let raf;
  
  //   const checkBulkEdit = () => {
  //     const isOpen = tableRef.current?.dataManager?.bulkEditOpen;
  //     if (typeof isOpen === 'boolean' && isOpen !== isBulkEditing) {
  //       // Wrap the state update in requestAnimationFrame to avoid render conflicts
  //       console.log('tableRef bulkOpen true')
  //       raf = requestAnimationFrame(() => {
  //         setIsBulkEditing(isOpen);
  //       });
  //     }
  //   };
  
  //   const interval = setInterval(checkBulkEdit, 300);
  
  //   return () => {
  //     clearInterval(interval);
  //     if (raf) cancelAnimationFrame(raf);
  //   };
  // }, [tableRef.current?.dataManager?.bulkEditOpen]);


    useEffect(() => {
      if(props.status!='edit'){
       dispatch(getUserRightsAction());
      }
      
    
    }, []);

    useEffect(()=>{
      if(formValues.customer_id){
        setCustomerSelectionDialogOpen(false)
        if(getApprovalRights){
          if(getApprovalRights?.rights !== true){
             return;
          }
          else{
            if(getCustomerOutstandingDues.length > 0){
              const hasDueExceeds = getCustomerOutstandingDues.some(item => item.due_status === 'due_exceeds');
              if (hasDueExceeds && props.status !== 'edit') {
                setCustomerSelectionDialogOpen(true)
              }
              // else {
              //   setFormValues(prevValues => ({
              //     ...prevValues,
              //     sale_status: 2,
              //   }))
              // }
            }
            // else {
            //   setFormValues(prevValues => ({
            //     ...prevValues,
            //     sale_status: 2,
            //   }))
            // }
          }
        }
      }
    },[formValues.customer_id,getApprovalRights,getCustomerOutstandingDues])
     
  // useEffect(() => {
  //   locationFunction();
  // }, [
  //   headerLocationId,
  //   props.status,
  //   props.newSalesAfterCreating_Data,
  //   props.isNewSales,
  //   props.stocklocation,
  //   formValues.location_id,
  // ]);


  // useEffect(() => {
  // }, [ productMisMatch,productOutOfStock,duplicateLot]);

  tempLocation.current = locationFunction;

  useEffect(() => {
    tempLocation.current();
  }, [headerLocationId]);

  // useEffect(() => {
  //   // if (props.newSalesAfterCreating_Data.isNewSales) {
  //   const { comment, reference, sale_status, location_id } = props.newSalesAfterCreating_Data
  //   await setFormValues(prevState => ({
  //     ...prevState,
  //     comment,
  //     sale_status,
  //     location_id,
  //     reference
  //   }))
  //   // }
  // },[props.status])

  const initform = () => {
    setInitialState(formValues);
  };

  tempinitform.current = initform;
  useEffect(() => {
    tempinitform.current();
    if(props.returnState){
      bulkEditRef?.current?.click()
    }
  }, []);

  const inits = () => {
    if (JSON.stringify(initialState) !== JSON.stringify(formValues)) {
      setDirty();
      setForm(true);
    } else {
      setPristine();
      setForm(false);
    }
  };

  useEffect(()=>{
     !tds_taxrate?.length && dispatch(GetTdsTaxes('list','null'))
     !props.returnState && props.status !== 'edit' && addActionRef.current?.click();
  },[])

  // useEffect(() =>{
  //   if(props.price_list?.length > 0 && props.status !== 'edit'){
  //     let defaultPriceList = await props.price_list.find((f) => f.price_list_name === 'Default')
  //     await setFormValues({ ...formValues, price_list: defaultPriceList?.id })
  //     // await setDefaultPriceListId(defaultPriceList?.id) 
  //     // await setPriceList(props.price_list);
  //   }
  // },[props.status])

  // useEffect(()=>{
  //   if(formValues.price_list === null && props.price_list.length > 0 && props.status !== 'edit' ){
  //     let defaultPriceList = await props.price_list.find((f) => f.price_list_name === 'default')
  //     let priceId = await typeof defaultPriceList.id === 'undefined' ? null : defaultPriceList.id
  //     await setFormValues({ ...formValues, price_list: priceId })
  //     await setDefaultPriceListId(defaultPriceList.id) 
  //     await setPriceList(props.price_list);
  //   }
  // },[props.price_list,props.status])

  // useEffect(() => {
  //   if(props.price_list.length > 0 && props.status === 'edit' ){
  //     await setPriceList(props.price_list);

  //   }
  // },[props.price_list,props.status])


  useEffect(() => { (async () => {
       if(formValues.customer_id !== null){
              let customerId = cusArray.filter(f => f.customer_id === formValues.customer_id)[0]
              // console.log("customerId",customerId)
              let temp =  props.price_list?.filter((f) => f.id === customerId.price_list)
              if(temp.length){
                setFormValues((prev) => ({ ...prev, price_list: customerId.price_list }))
              }else{
                setFormValues((prev) => ({ ...prev, price_list: defaultPriceList?.id}))
              }
      // apiCalls(
      //   // setModalTypeHandler,
      //   // setLoaderStatusHandler,
      //   dispatch(listCustomerAction(null,null,() => {},
      //     (response) => {
      //       if(response.length){
      //         let customerId = response.filter(f => f.customer_id === formValues.customer_id)[0]
      //         let temp =  props.price_list?.filter((f) => f.id === customerId.price_list)
      //         if(temp.length){
      //           setFormValues((prev) => ({ ...prev, price_list: customerId.price_list }))
      //         }else{
      //           setFormValues((prev) => ({ ...prev, price_list: defaultPriceList?.id}))
      //         }
      //       }
      //     } 
      //   ))
      // )     

    }else if(formValues.price_list !== null && props.price_list.length > 0){
      await setFormValues((prev) => ({ ...prev, price_list: defaultPriceList?.id }))

    }

  })();
},[formValues.customer_id])


  useEffect(() => { (async () => {
    let type='credit'
    let productType='sales'
    await apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(getPriceListAction()),
      // !props.customer.length && dispatch(listCustomerAction()),
      dispatch(listProductActionByType(productType)),
      dispatch(creditDebitNoteSeq(type))
    )
  })();
}, [])

  //  useEffect(() => {
  //   if(filterOpen){
  //   await apiCalls(
  //     setModalTypeHandler,
  //     setLoaderStatusHandler,
  //    dispatch(listProductAction()),
  //     )
  //   }
  
  // }, [filterOpen])



  
  useEffect(() => {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
         dispatch(listCustomerAction(setModalTypeHandler, setLoaderStatusHandler))
      );
  }, []);

  useEffect(() => {
    // console.log("formValues.sale_status",formValues.sale_status,props.status)
   if (formValues.sale_status === 1 || formValues.sale_status === 2 || formValues.sale_status === 8 || props.returnState ) {
    const data = {
      sequence_name: props.returnState === true ? 'SALESRETURN SEQUENCE' :
        formValues.sale_status === 1
          ? 'SO SEQUENCE'
          : formValues.sale_status === 2
          ? 'SALESINV SEQUENCE'
          : formValues.sale_status === 8 ?  'DC SEQUENCE' : '',
    };

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(sequenceBasedOnNameAction(data))
    );
  }
}, [formValues.sale_status,props.returnState]);


  const cusArray = customer?.length > 0 ? customer : []
  
  const customerData = cusArray?.find(customer => customer.customer_id === formValues.customer_id);
  console.log(customerData, "customerDatam")
const shippingList = customerData?.shipping_address || [];
  
  const handleEditShipping = (address, index, shippingList) => {
    console.log('Editing shipping address:', address, index);
  console.log('Full shipping list:', shippingList);
    // Open the ShippingDetailPopup with current address data
    setShipFormValues({
      ...address,
      isPrimary: !address.shipping_id ? false : false,
      Gst : address.tax_id || address.Gst,
      contactperson_num : address.contactperson_num || address.phone_number,
      contact_person_name : address.contact_person_name || address.first_name,
      tableData: { index: index },
      fullList: shippingList
    });
    setEditShippingMode('EditShipping');
    setShippingOpen(true);
  };
  console.log('shipping', shipformValues)

  console.log(cusArray,'cusArray')
 //console.log(formValues.sale_time,'salesssTimee')
  
  // useEffect(() => {
  //   (async() => {

  //   if(formValues?.price_list !== null){
  //     let filteredPriceList = await props.price_list?.find((f) => f.id === formValues.price_list)?.productData
  //     if(filteredPriceList?.length > 0 && filteredPriceList !== undefined){
  //       const filteredProduct = await productData.filter(v => { return filteredPriceList?.some(f => f.product_id === v.item_id ); })
  //       console.log(filteredPriceList,props.price_list,"filteredProduct")
  //       if(filteredProduct?.length > 0){
  //         await setLocationWiseProduct(filteredProduct);
  //       }else{
  //         await setLocationWiseProduct(productData);
  //       }
        
  //     }else{
  //       // let defaultPriceList = await props.price_list?.filter((f) => f.price_list_name === 'Default')[0]
  //       //  setFormValues({ ...formValues, price_list: defaultPriceList?.id })
  //        setLocationWiseProduct(productData);
  //     }
  //   }
  // })()
  // },[formValues.price_list, props.price_list])

  // useEffect( () =>{
  //   if(props.status === 'edit' && props.edit_id_data[0].dc_number !== null && !props.returnState && formValues.sale_status === 2){
  //     setDchallan(true)
  //   }else{
  //     setDchallan(false)
  //   }
  // }, [formValues.sale_status])



  useEffect(() => {
    if (formValues.location_id !== '' && formValues.location_id !== null) {
      // const {price_list_name, productData} = await props.price_list.find( (f) => f.id === formValues.price_list,) || defaultPriceList ;
      let LocationWiseProduct = productByType.filter((p) => {
        if (formValues.sale_status === 2 || formValues.sale_status === 8) {
          if (Array.isArray(p.lots) && p.lots.length > 0) {
            return p.lots.some((s) => s.location_id === formValues.location_id);
          }
          return true;
        }
        return true;
      });
        setProductData(productByType)
      setLocationWiseProduct(LocationWiseProduct);
    } else {
      setProductData(productByType)
      setLocationWiseProduct(productData);
    }
  }, [formValues.location_id, formValues.sale_status, formValues.price_list, props.price_list, productByType]);

  useEffect(() => {
    if (sales_items.length > 0) {
      const updatedSalesItems = sales_items.map((item) => {
        const prod = productByType.find((p) => p.item_id === item.item_id)
        if (prod) {
          return {
            ...item,
            name: prod.name,
            item_cost_price: prod.cost_price,
            hsn_code: prod.hsn_code,
            taxes: prod.taxes,
            is_serialized: prod.is_serialized,
            qty_per_pack: prod.qty_per_pack,
            NSlots: [],
            description: prod.description,
            stock_type: prod.stock_type,
          };
        }
        return item
      });
  
      setSalesItems(updatedSalesItems)
    }
  }, [productByType])

  tempinit.current = inits;
  useEffect(() => {
    tempinit.current();
  }, [formValues, initialState, props.open]);

  useEffect(() => {
    if (formValues.customer_id) {
      const {ledger_id} =
        cusArray?.filter(
          (d) => formValues.customer_id === d.customer_id,
        )[0] || {};
      props.getCustLedger && props.getCustLedger(ledger_id);
    }
  }, [formValues.customer_id]);



  // useEffect(() =>{
  //   if(formValues.sale_status === 8){
  //   setFormValues({...formValues, location_id: null})
  //   }

  // }, [formValues.sale_status])
  // useEffect(()=> {
  //   if(formValues.sale_status === 8 && props.status !== 'edit'){
  //   props.listStockLocationSequenceAction(
  //     {sequence_type: 'DC'},
  //     null,
  //     commoncookie,
  //     headerLocationId,
  //   )
  //   // handleChange({target:{value: null, name:'location_id'}})
  //   // setFormValues({...formValues, location_id : null})
  //   } 
  //   if(formValues.sale_status === 1 || formValues.sale_status === 2 ) {
  //     props.listStockLocationSequenceAction(
  //       {sequence_type: 'SO'},
  //       null,
  //       commoncookie,
  //       headerLocationId,
  //     )
  //     setFormValues({...formValues, location_id : null})
  //   }
  //   if( props.status === 'edit' && props.edit_id_data[0]?.sale_status === 8 ){
  //     props.listStockLocationSequenceAction(
  //       {sequence_type: 'SO'},
  //       null,
  //       commoncookie,
  //       headerLocationId,
  //     )
  //   }
  // }, [formValues.sale_status])

  // useEffect(() => {
  //   if(props.status === 'edit' && formValues.sale_status === 1){
  //     let editDate = moment(props.edit_id_data[0].sale_time).format("YYYY-MM-DD HH:mm:ss");
  //     setFormValues({ ...formValues, sale_time : editDate, sale_status : 2})
  //   }
  // }, [props.status, formValues.sale_status])
  // useEffect(() => {
  //   dispatch(getAppConfigDataAction())
  // }, [])

  useEffect(()=>{ 
    const po =  props.stocklocation.find(
      (d) => d.location_id === formValues.location_id,
    ) || {};

     let email = props.appConfigData ? props.appConfigData?.companyEmail : ''
    
   // console.log(po,props.stocklocation,email,"test2")
  if(Object.keys(po).length){
    let locationData = {
      ...props.appConfigData,
      companyAddress: po.address ,
      companyEmail: po.email?? email ,
      companyMobile: po.phone_number ,
      state: po.state,
      zip:po.zip,
      city:po.city
    }
    props.setAppConfigData(locationData)
  }
    
  },[formValues.location_id])
   console.log("outside",formValues.invoice_number)
  useEffect(() => {
    console.log("paternnnnn",formValues.invoice_number)
    if(props.status === 'edit' && formValues.sale_status === 1){
      setFormValues((prev) => ({ ...prev, sale_status : 2}))
    }
     let pattren =  get_sequence_based_on_name.pattern  ;
    //  console.log("pattren",pattren)
    // const po =  props.stocklocation.find(
    //   (d) => d.location_id === formValues.location_id,
    // ) || {};
    if (
      props.status !== 'edit' &&
      (formValues.sale_status !== 1 &&
      formValues.sale_status !== 3 && formValues.sale_status !==8 )
      // && formValues.price_list === null
    ) {

     // let defaultPriceList = props.price_list?.filter((f) => f.price_list_name === 'Default')[0]
      // setposSeq(po);
    

      setFormValues((prev) => ({
        ...prev,
        // ship_location: null,
        invoice_number: pattren,
        so_number : null, dc_number : null ,
        //price_list: defaultPriceList,
      }));
    } else if (
      (props.status !== 'edit' && formValues.sale_status === 1 && formValues.sale_status !==8) 
    ) {
     
      const so_number = pattren
      //let defaultPriceList = props.price_list?.filter((f) => f.price_list_name === 'Default')[0]
      // setposSeq(po);

      setFormValues((prev) => ({...prev, so_number, invoice_number: null, dc_number : null, 
      //  price_list: defaultPriceList?.id
      }));
    } else if (
      (props.returnState === true) 
    ) {
     
      const so_number = pattren
      //let defaultPriceList = props.price_list?.filter((f) => f.price_list_name === 'Default')[0]
      // setposSeq(po);

      setFormValues((prev) => ({...prev, so_number
      //  price_list: defaultPriceList?.id
      }));
    }
    if (props.status === 'edit' && formValues.sale_status === 2) {
      console.log("adasdd")
      // setposSeq(po);

      setFormValues((prev) => ({...prev, 
         ship_legal_name : formValues.Einvoice !== undefined && formValues.Einvoice.length&&formValues.Einvoice[0]?.shipping !==undefined ?  formValues.Einvoice[0]?.shipping?.legal_name : null,

         ship_address: formValues.Einvoice !== undefined && formValues.Einvoice.length&&formValues.Einvoice[0]?.shipping !==undefined ?  formValues.Einvoice[0]?.shipping?.address : null,

         ship_location: formValues.Einvoice !== undefined &&  formValues.Einvoice.length&&formValues.Einvoice[0]?.shipping !==undefined ?  formValues.Einvoice[0]?.shipping?.location : null,

         ship_stcd: formValues.Einvoice !== undefined && formValues.Einvoice.length&&formValues.Einvoice[0]?.shipping !==undefined ?  formValues.Einvoice[0]?.shipping?.stcd : null,

         ship_zip: formValues.Einvoice !== undefined && formValues.Einvoice.length&&formValues.Einvoice[0]?.shipping !==undefined ?  formValues.Einvoice[0]?.shipping?.zip : null,

         disp_address: formValues.Einvoice !== undefined && formValues.Einvoice.length&&formValues.Einvoice[0]?.dispatch !==undefined ?  formValues.Einvoice[0]?.dispatch?.address : null,

         disp_company_name:formValues.Einvoice !== undefined && formValues.Einvoice.length&&formValues.Einvoice[0]?.dispatch !==undefined ?formValues.Einvoice[0]?.dispatch?.legal_name : null,

         disp_location: formValues.Einvoice !== undefined && formValues.Einvoice.length&&formValues.Einvoice[0]?.dispatch !==undefined ?formValues.Einvoice[0]?.dispatch?.location : null,

         disp_zip: formValues.Einvoice !== undefined && formValues.Einvoice.length&&formValues.Einvoice[0]?.dispatch !==undefined ? formValues.Einvoice[0]?.dispatch?.zip : null,

         disp_stcd: formValues.Einvoice !== undefined && formValues.Einvoice.length&&formValues.Einvoice[0]?.dispatch !==undefined ?formValues.Einvoice[0]?.dispatch?.stcd : null,

         trans_name: formValues.Einvoice !== undefined &&formValues.Einvoice.length&&formValues.Einvoice[0]?.transport !==undefined ? formValues.Einvoice[0]?.transport?.trans_name : null,
         
         trans_mode: formValues.Einvoice !== undefined &&formValues.Einvoice.length&&formValues.Einvoice[0]?.transport !==undefined ? formValues.Einvoice[0]?.transport?.trans_mode : null,

         trans_doc_no: formValues.Einvoice !== undefined &&formValues.Einvoice.length&&formValues.Einvoice[0]?.transport !==undefined ? formValues.Einvoice[0]?.transport?.trans_doc_no : null,

         trans_id: formValues.Einvoice !== undefined &&formValues.Einvoice.length&&formValues.Einvoice[0]?.transport !==undefined ? formValues.Einvoice[0]?.transport?.trans_id : null,

         distance: formValues.Einvoice !== undefined &&formValues.Einvoice.length&&formValues.Einvoice[0]?.transport !==undefined ?  formValues.Einvoice[0]?.transport?.distance : null,

         veh_no: formValues.Einvoice !== undefined &&formValues.Einvoice.length&&formValues.Einvoice[0]?.transport !==undefined ? formValues.Einvoice[0]?.transport?.veh_no : null,

         invoice_number: pattren }));
    }
    if(formValues.sale_status === 8
      //  && formValues.price_list === null
      ){
   
      // const dc_number = po.dc_pattern || '';
     // let defaultPriceList = props.price_list?.filter((f) => f.price_list_name === 'Default')[0]
      // setposSeq(po);

      setFormValues((prev) => ({...prev, so_number: null, invoice_number: null, dc_number : pattren, 
        //price_list: defaultPriceList?.id

      }));
    }
    // if (
    //   (props.status === 'edit' && props.edit_id_data[0].dc_number !== null && formValues.sale_status ===2 && !props.returnState ) 
    // ) {
    //   // const so_number = po.sequence_pattern || '';

    //   // setposSeq(po);

    //   setFormValues((prev) => ({...prev, so_number:null,  invoice_number: pattren}));
    // }

  }, [formValues.sale_status, props.status, formValues.location_id,get_sequence_based_on_name?.pattern]);

  useEffect(() => { (async () => {
    setFormValues((prev) => ({ ...prev, disp_company_name: props.appConfigData.companyName, disp_address: props.appConfigData.companyAddress, disp_zip: props.appConfigData.pinCode }))
    console.log(props.appConfigData, "props.appConfigData")
    if(props.appConfigData.pinCode?.length === 6){
      const locationData = await getLocationDataBasedOnPincode(props.appConfigData.pinCode)
      if(locationData !== undefined){
        const { district, city, statecode } = locationData
        if(city && statecode){
          setFormValues((prev) => ({ ...prev, disp_company_name: props.appConfigData.companyName, disp_address: props.appConfigData.companyAddress, disp_zip: props.appConfigData.pinCode, disp_location: district, disp_stcd: statecode }))
        }
        console.log(formValues.disp_address,formValues.disp_company_name,formValues.disp_zip,  "disp_address")
      }
    }
  })();
}, [props.appConfigData])

  const cancel = () => {
    setDialog(false);
  };

  const validClose = () => {
    setDialog(true);
  };

  const validationZipHandler = (name, value) => {
    if (!Object.keys(formErrors).includes(name)) return;

    if (name === 'ship_zip'|| name =='disp_zip') {
      if (value.length === 0) {
        setFormErrors({
          ...formErrors,
          [name]: "Zip is required"
        })
      }
    }
  }

  const handleChange = async (e) => {
    let { name, value } = e.target;
    const oldSaleStatus = formValues.sale_status
    setStateHandler(name, value);
    validationZipHandler();
    // console.log("name",name,value)
    if (name === 'ship_zip' || name =='disp_zip') {
      if (value.length === 6) {
        setLoader(true)
        const locationData = await getLocationDataBasedOnPincode(value);
        if (locationData !== undefined) {
          const { district, state, city, statecode } = locationData;
          if (city && statecode) {
            // textRef.current.focus();
            if(name == 'ship_zip'){
            setFormValues((prev) => ({ ...prev, ship_zip: value, ship_location: district, ship_stcd: statecode }));
            setFormErrors({
              ...formErrors,
              ship_stcd: null,
              ship_location: null
            });
            }else{
              setFormValues((prev) => ({ ...prev, disp_zip: value, disp_location: district, disp_stcd: statecode }));
            setFormErrors({
              ...formErrors,
              disp_stcd: null,
              disp_location: null
            });
            }
            setLoader(false)
          }
        }
        else {
          setLoader(false)
          setFormErrors({
            ...formErrors,
            zip: "Pincode Not Found",
          });
        }
      }
    }
    if (name === 'ship_location' || name == 'disp_location') {
      if (value.length < 3 || value.length > 50) {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          [name]: 'Location must be between 3 and 50 characters.',
        }));
      } else {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          [name]: null, // Clear error if input is valid
        }));
      }
    }
    if (name === 'ship_address' || name == 'disp_address') {
      if (value.length < 1 || value.length > 100) {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          [name]: 'Address must be between 1 and 100 characters.',
        }));
      } else {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          [name]: null, // Clear error if input is valid
        }));
      }
    }
    if (name === 'TransId') {
      if (value.length ===15) {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          [name]: 'Transaction Trans Id should be 15.',
        }));
      } else {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          [name]: null, // Clear error if input is valid
        }));
      }
    }
    if (name === 'ship_stcd' || name == 'disp_stcd') {
      if (value.length !==2) {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          [name]: 'stcd must 2 character',
        }));
      } else {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          [name]: null, // Clear error if input is valid
        }));
      }
    }
    if (name === 'trans_mode'){
      if (value.length !==1) {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          [name]: 'Mode of transport (Road-1, Rail-2, Air-3, Ship-4)',
        }));
      } else {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          [name]: null, // Clear error if input is valid
        }));
      }
    }
    if(name === 'tds_percent'){
      setFormValues((prev) => ({...prev, tds_percent: (value?.tds_rate || 0), tds_value: value}))
    }

    if(name === 'sale_status' && sales_items.length > 0 && oldSaleStatus === 2 && (value === 1)){
      setProductResetDialog(true)
      setOldSaleStatus(oldSaleStatus)
    }

    if(name === 'veh_no'){
      if(vehicleNumberValidation(value) !== true){
        setFormErrors((prev) => ({...prev, veh_no: 'Vehicle Number is Invalid'}))
      }
      else{
        setFormErrors((prev) => ({...prev, veh_no: null}))
      }
    }
    
    if(name === 'trans_id'){
      if(gstValidation(value) !== true){
        setFormErrors((prev) => ({...prev, trans_id: 'GST Number is Invalid'}))
      }
      else{
        setFormErrors((prev) => ({...prev, trans_id: null}))
      }
    }
  };

  //console.log('formValuesss', formValues.ship_location, formValues.ship_stcd)


  const setStateHandler = async (name, value) => {
      let formObj = {};
      formObj = {
        ...formValues,
        [name]: value === '' ? null : value,
      };
      // if(name=='invoice_number')
      setFormValues((prev) => ({...prev, [name]: value === '' ? null : name === 'trans_id' || name === 'veh_no' ? value.toUpperCase() : value}));

    if (name !== 'customer_id') validationHandler(name, value);
  };

  // const handleShipAdd = () => {
  //   console.log(formValues,'formValuesformValues')
  //   if(formValues?.customer_id !== null){
  //     setShippingOpen(true)
  //   } else {
  //     alert("Please select the customer before add the shipping detail")
  //   }
  // }

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



  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const createMail = () => {
    const custData = getCustomer();
    props.createMail(
      custData,
      formValues.sale_status === 1
        ? formValues.so_number
        : formValues.invoice_number,
      sales_items,
      custData.email,
      formValues.sale_status === 1
        ? formValues.sale_time
        : formValues.invoice_date,
    );
  };

  const handleChangeInvoiceNumber = async() => {
    // const po =  props.stocklocation.find(
    //   (d) => d.location_id === formValues.location_id,
    // ) || {}
    setFormValues((prev) => ({
      ...prev,
      // invoice_number: po.invoice_pattern,
    }))
    handleSubmit((data) => setButton(data))
  }
  
  const handleSubmit = async (setDisable, isAddressChecked) => {
    if(excelItemsNotAdded.length > 0){
      setOpenAlert(true)
      return
    }
    if(formValues.sale_status === 2 && formValues.ship_address === null && selectedCustomer.gst === '1' && !isAddressChecked && !props.returnState){
      setAddressDialog(true)
      return
    }

    setAddressDialog(false)
    props.handle_newCreate();
    props.handle_newSalesAfterCreating_Data({
      sale_status: formValues.sale_status,
      location_id: formValues.location_id,
      comment: formValues.comment,
      reference: formValues.reference
    })
    // event.preventDefault();
    let isValid = true;
    let formErrorsObj = {...formErrors};
    await Object.keys(formValues).map((key, i) => {
      if (
        requiredFields.includes(key) &&
        (formValues[key] === null || formValues[key] === '')
      ) {
        isValid = false;
        formErrorsObj[key] = capitalize(key) + ' is Required!';
      }
      if(formValues.sale_status === 2 && (untaxed() + untaxed('taxes') >= 50000) && (props.appConfigData.eInvoice === '1' || props.appConfigData.ewayBill === '1')){
        //console.log('editonly',isValid )
          if(ewayrequiredFields.includes(key) &&
          (formValues[key] === null || formValues[key] === ''))
         {
          //console.log('isvalidddd', isValid)
          isValid = false;
          formErrorsObj[key] = capitalize(key.replace(/_/g, ' ')) + ' is Required!';
        }
      }

       else if((formValues.invoice_number === null && formValues.sale_status === 2) || typeof formValues.invoice_number === 'undefined' && formValues.sale_status === 2){
        isValid = false;
      }
      // else if(formValues.sale_status === 1 && (formValues.dc_number === null || typeof formValues.dc_number === 'undefined')){
      //   isValid = false;
      //   console.log('sonumbercantbenull',formValues.dc_number,formValues.sale_status,typeof formValues.dc_number)
      //   // alert(" SO Number Cannot null")
      // }
      
      else if (regex[key]) {
        if (!regex[key].test(formValues[key])) {
          isValid = false;
          formErrorsObj[key] = capitalize(key) + ' is Invalid!';
        }
      }
      // else if (_.isEmpty(props.edit_id_data)) {
      //   let exist = findAllByKey(props.sales, 'invoice_number').filter(f => f !== null)
      //   if (exist.length > 0 && _.includes(exist, formValues.invoice_number)) {
      //     isValid = false;
      //     formErrorsObj['invoice_number'] = `${formValues.invoice_number} Already Exist`
      //   }
      // }
      return null;
    });
    await setFormErrors(formErrorsObj);
    //console.log('isValid', isValid)
    // API call..
    await setFormValues((prev) => ({
      ...prev,
      sales_taxes:
        sales_taxes ||
        [].map((m) => {
          const {tableData, ...rest} = m;
          return rest;
        }),
      sales_items: sales_items
    }));

    let SalesItems =
      ( formValues.sale_status === 2  ||  formValues.sale_status === 8 )
        ? sales_items.map((s) => {

            return {
              ...s,
              item_cost_price:
              s?.lots?.length > 0 && s.lots !== undefined && s.lots[0]?.trans_items_cost_price !== null && s.stock_type === 1
                  ? s.lots[0]?.trans_items_cost_price
                  : 0.00 || 0,
              item_unit_price: s.stock_type === 1 ? s.item_unit_price : s.item_unit_price || 0
                  // : s.item_cost_price || 0,
            };
          })
        : sales_items;

        const custData = getCustomer();
        // console.log('custDataaaaaaa', custData, custData.address, custData.area, typeof(custData.address))
        // if(custData?.tax_id !== null ){
        //   if(custData.address == null || custData.area == null){
        //     isValid = false;
        //     dispatch(commontoastAction("Customer Address & Area Required"))
        //   }
        // }
    // await setTableData('')
    if (isValid) {
      setDisable(true);
      const received_amount = Tdata.reduce(function (acc, obj) {
        return acc + +obj.payment_amount;
      }, 0);

     
      const dcchallan = props.edit_id_data[0]?.dc_number !== null && formValues.sale_status === 2 ? 'create' : 'edit' 
       
      let shippingData = {
        legal_name:  formValues.ship_legal_name,
        address:   formValues.ship_address,
        zip:   formValues.ship_zip,
        location:  formValues.ship_location,
        stcd:   formValues.ship_stcd,
        contact_person_name:   formValues.ship_person_name || selectedCustomer.first_name ,
        phone_number : formValues.ship_phone_number || selectedCustomer.phone_number,
        gstin : formValues.ship_gstin || selectedCustomer.tax_id || selectedCustomer.Gst
      }
      let dispatchData = {
        legal_name: formValues.disp_company_name || null,
        address: formValues.disp_address|| null,
        zip: formValues.disp_zip|| null,
        location: formValues.disp_location|| null,
        stcd: formValues.disp_stcd|| null
      }
      let EwaytransData = {
        trans_name:formValues.trans_name || null,
        trans_mode:formValues.trans_mode || null,
        veh_no:formValues.veh_no || null,
        distance:formValues.distance || null,
        trans_doc_no:formValues.trans_doc_no || null,
        trans_id:formValues.trans_id|| null
      }
      
      const newRowData = {...formValues,tds : calculatetdsTaxAmount(),tcs_percent : calculateTcsTaxRate()}
      setRData(newRowData)

      const newform = {...formValues};

      delete  newform.disp_company_name;
      delete  newform.disp_address;
      delete  newform.disp_zip;
      delete  newform.disp_location;
      delete  newform.disp_stcd;
      delete  newform.ship_legal_name;
      delete  newform.ship_address;
      delete  newform.ship_zip;
      delete  newform.ship_location;
      delete  newform.ship_stcd;
      delete newform.ship_phone_number;
      delete newform.ship_gstin;
      delete newform.ship_person_name;
      delete  newform.trans_name;
      delete  newform.trans_mode;
      delete  newform.veh_no;
      delete  newform.distance;
      delete newform.trans_id;
      delete newform.trans_doc_no;
      delete newform.tax_types;
      delete newform.tcs_percent;
      delete newform.tds;
      delete newform.tds_value;
      delete newform.company_name;
      delete newform.contactperson_name;
      delete newform.contactperson_num;
      delete newform.Gst;
      delete newform.city;
      delete newform.state;
      delete newform.pin_code;
      delete newform.country;
      delete newform.latitude;
      delete newform.longitude;
      delete newform.sales_man;
      delete newform.invoiceCreditValue;
      delete newform.invoiceCreditDays;

      
      props.handleSubmit(
        getTrimmedData({
          ...newform,
          shippingData,
          dispatchData,
          EwaytransData,
          no_mail: true,
          salesman_id  : formValues?.sales_man?.id,
          invoice_credit_days  : formValues?.invoiceCreditDays,
          invoice_credit_value  : formValues?.invoiceCreditValue,
          tcs_percent : calculateTcsTaxRate(),
          tds:calculatetdsTaxAmount(),
          isRoundedOffNegative: (Math.round(
            untaxed() > 0
              ? floatnum(
                  untaxed() + untaxed('taxes') + tcsuntaxed('taxes') - calculatetdsTaxAmount()
                )
              : 0
          ) - (untaxed() > 0
            ? floatnum(
                untaxed() + untaxed('taxes') + tcsuntaxed('taxes') - calculatetdsTaxAmount()
              )
            : 0)
            ).toFixed(2) > 0 ? 0 : 1,
          rounded_off: (Math.round(
            untaxed() > 0
              ? floatnum(
                  untaxed() + untaxed('taxes') + tcsuntaxed('taxes') - calculatetdsTaxAmount()
                )
              : 0
          ) - (untaxed() > 0
            ? floatnum(
                untaxed() + untaxed('taxes') + tcsuntaxed('taxes') - calculatetdsTaxAmount()
              )
            : 0)
            ).toFixed(2),
          total: Math.round(untaxed() > 0 ? floatnum((untaxed() + untaxed('taxes')+ tcsuntaxed('taxes'))- calculatetdsTaxAmount()) : 0),
          received_amount : props.edit_id_data[0]?.received_amount ?? received_amount,
          sales_items: SalesItems,
          sales_taxes,
          sales_payment: Tdata,
          email: custData.email,
          custData,
          appConfigData: props.appConfigData,
          full_sale_time: props.edit_id_data[0]?.full_sale_time,
          status : dueAmountPopupOk === '' ? null : 'Waiting Approval',
          quotoationId : props.quotoationId
        }),
        posSeq,
        getCostPrice(),
        untaxed(),
        (untaxed('taxes') / 2).toFixed(2),
        (tcsuntaxed('taxes')).toFixed(2),
        setDisable,
        dcchallan
      );

      setpaymentOpen(false)
      props.handleClose()
    }
    else{
      dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
    }
  };

  const getCostPrice = () => {
    let total = 0;
  
    sales_items.filter((d)=> d.stock_type !== 0).forEach((d) => {
      total += d.quantity * +d.item_cost_price;
    });
    return total;
  };

  function usePrevious(value) {
    const ref = useRef(null);
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }
  // var value = 0
  // const TaxValue = (id, taxes) => {
  //   productByType.map(p => {
  //     if (p.item_id === 4)
  //       return p.taxes.map(t => {
  //         if (t.tax_group === 'IGST' && taxes)
  //           return value = t.tax_category
  //         else if (t.tax_group === 'IGST')
  //           return value = t.tax_rate

  //       })
  //   })
  //   return value
  // }
  
  // useEffect(() => {
  //   if(formValues.ship_zip !== null && props.appConfigData.pinCode){
  //     console.log('distance ship_zip', formValues.ship_zip, props.appConfigData.pinCode)
  //     console.log('distance calculation')
  //     if(window.google){
  //       console.log('distance calculation using google')
  //       const service = new window.google.maps.DistanceMatrixService()
  //       console.log(service, 'distance service')
  //       try{
  //         service.getDistanceMatrix(
  //           {
  //             origins: [String(props.appConfigData.pinCode)],
  //             destinations: [String(formValues.ship_zip)],
  //             travelMode: window.google.maps.TravelMode.DRIVING,
  //           },
  //           async(response, status) => {
  //             console.log('distance from response')
  //             const res = await response
  //             console.log('distance from res', res)
  //             if(status === 'OK'){
  //               const distance = response.rows[0].elements[0].distance.text
  //               console.log(distance, 'distance')
  //               setFormValues((prev) => ({ ...prev, distance: distance }))
  //             }
  //             else{
  //               console.log(status, 'distance error')
  //             }
  //           }
  //         )
  //       }
  //       catch(err){
  //         console.log('distance try error', err)
  //       }
  //     }
  //   }
  // }, [formValues.ship_zip, sales_items, props])

  async function edits() {
    setRequest(false)
    if (_.isEmpty(props.stocklocation)) {
      // props.listStockLocationSequenceAction(
      //   props.responseDialog,
      //   setLoaderStatusHandler,
      //   commoncookie,
      //   headerLocationId,
      // );
    }
    if (_.isEmpty(productByType)) {
      let productType='sales'
      await listProductActionByType(
        productType,
        setModalTypeHandler,
        setLoaderStatusHandler,
      );
      // await setProducts(newArr)
    }
    if (_.isEmpty(cusArray)) {
      listCustomerAction(props.responseDialog);
      // notNull()
    }

    if (!_.isEmpty(props.edit_id_data)) {
      let ID_data = [...props.edit_id_data];
      let obj = ID_data;
      // obj.map(async r => {
      // r.sale_status = r.sale_status === 1? 2: r.sale_status
      const {sales_items, so_date, invoice_date_converted, ...record} =
        obj?.[0];
      await setFormValues(record);
      props.getCustLedger && props.getCustLedger(record.ledger_id);
      // setFormValues({
      //   ...record,
      //   sale_status: !props.new_status
      //     ? record.sale_status === 1
      //       ? 2
      //       : record.sale_status
      //     : props.new_status,
      // });
      await setInitialState(record);
       let salesData = sales_items.map((s, i) => {
         const taxes = productByType.filter((f) => f.item_id === s.item_id);
         const itemQty = taxes[0]?.item_qty || [];
        //  console.log("itemQty",itemQty,props.edit_id_data)
         const available_quantity = (() => {
           const qtyObj = itemQty.find(q => q.location_id === props.edit_id_data[0].location_id);
           return qtyObj ? qtyObj.totalQuantity : 0;
         })();
        //  console.log("available_quantity",available_quantity)
        return {
          name: s.name,
          item_id: s.item_id,
          description: s.description,
          sku: s.sku,
          quantity: !props.returnState ? s.quantity : 0,
          soldQuantity : s.quantity,
          returnQuantity: s.return_quantity === null ? s.quantity : s.quantity - s.return_quantity,
          item_unit_price: s.item_unit_price,
          item_cost_price: s.item_cost_price,
          return_quantity:s.return_quantity,
          sub_total: singleTax(
            s.item_unit_price,
            s.quantity,
            taxes[0]?.taxes,
          ).toFixed(2),
          taxes_name: Mapping(s.item_id, 'tax'),
          hsn_code: s.hsn_code,
          sales_item_taxes: Sales_Item_Taxes(productByType, [s], sales_items, s.item_unit_price),
          taxes: getItemTaxes(productByType, s.item_id),
          discount: s.discount,
          discount_type: s.discount_type,
          print_option: s.print_option,
          lots:
            ( s.is_serialized === 0)
              ? LotRes({...s, NSlots: taxes[0]?.lots}, s.quantity)
              : [],
          NSlots: taxes[0]?.lots || [],
          is_serialized: s.is_serialized,
          line: i + 1,
          soldLots: s.soldLots || [],
          price_list: taxes[0]?.price_list,
          stock_type: taxes[0]?.stock_type,
          available_quantity: available_quantity,
        }; //,name:Mapping(s.item_id,'name')
      })
      await setSalesItems(
        salesData
      );

      return ID_data;

      // })
      //  setFormValues({...formValues,sale_status:props.edit_id_data[0].sale_status === 1? 2: props.edit_id_data[0].sale_status})
    }
  }
  tempedits.current = edits;
  useEffect(() => {
    tempedits.current();
  }, [productByType.length > 0]);
  let Mapping = (id, type) => {
    let res = '';
    productByType.map((p) => {
      if (id === p.item_id && type === 'tax') {
        res = p.taxes[0]?.tax_category
      }
      if (id === p.item_id && type === 'name') {
        res = p.name;
      }
      return null;
    });
    return res;
  };
  const productAdding = (v, newProductAdd) => {
    console.log("9999",v)
    setProductDetails(v)
    let discount_price;
    if(props?.price_list?.length > 0){
     const aa =  props.price_list.find((e)=> e.id === formValues.price_list )
     discount_price = aa
    }

    let discount_added ;
    if(discount_price?.productData.length > 0){
      const dd = discount_price.productData.find((e)=> e.product_id == v.item_id)
      discount_added = dd
    }

    // if(formValues.price_list !== null && props.price_list)
    setHsnDesc({
      hsnCode: v.hsn_code,
      description: v.description,
      item_id: v.item_id
    })

          const itemQty = v?.item_qty || [];
         const available_quantity = (() => {
           const qtyObj = itemQty.find(q => q.location_id === formValues.location_id);
           return qtyObj ? qtyObj.totalQuantity : 0;
         })();

   const  data =  {
      item_id: v.item_id,
      name: v.name,
      item_cost_price: v.cost_price,
      item_unit_price: parseFloat(discount_added?.discount_price !== undefined
      ? discount_added.discount_price
      : newProductAdd
        ? v.unit_price
        : 0).toFixed(2),
      taxes_name: v.taxes
        .map((t) => {
          return t.tax_group === 'IGST' ? t.tax_category : null;
        })
        .filter((f) => f !== null)[0],
      quantity: 1,
      line: sales_items.length + 1,
      sub_total: singleTax(
        discount_added?.discount_price !== undefined
          ? discount_added.discount_price
          :newProductAdd ? v.unit_price : 0,
        parseInt(1),
        v.taxes,
      ).toFixed(2),
      discount: 0,
      discount_type: 0,
      print_option: 1,
      available_quantity: available_quantity,
      sales_item_taxes: Sales_Item_Taxes(productByType, [v], sales_items),
      hsn_code: v.hsn_code,
      taxes: v.taxes,
      is_serialized: v.is_serialized,
      qty_per_pack: v.qty_per_pack,
      // NSlots: v.is_serialized === 0 && v.lots.length > 0 ? v.lots : [],
      lots: [],
      description: v.description,
      // taxes: v.taxes,
      stock_type: v.stock_type,
    };
    setRowData(data)
    return data
  };
  const taxedits = () => {
    if (props.selectData.product) {
      const filter = [...productByType];
      const pop = filter.shift();
      setSalesItems([...sales_items, productAdding(pop, true)]);
      addActionRef.current?.click();
      props.setselectData('product', false);
    }
  };
  temptaxedits.current = taxedits;
   useEffect(() => {
    temptaxedits.current();
  }, [props.selectData.product]);

  const item = () => {
    if(sales_items.length === 0) return;
    let res = [];
    const sale_tax_amount = sales_items.map((s) => {
      res.push(floatnum(s.sales_item_taxes?.item_tax_amount));
      return getArraySum(res);
    });
    let basis = [];
    const sale_tax_basis = sales_items.map((s) => {
      basis.push(s.sub_total);
      return getArraySum(basis);
    });
    const productSearch = (id) => {
      const Match = productByType.filter((f) => f.item_id === id);
      return Match[0];
    };
    let sales_tax1 = sales_items
      .map((s) => {
        const p = productSearch(s.item_id);
        if (!p) {
          console.error(`Product not found for item_id: ${s.item_id}`);
          return null;
        }
        if (s.item_id === p?.item_id && p.taxes.length > 0) {
          return p.taxes
            .map((t) => {
              if (t.tax_group === 'IGST') {
                return {
                  jurisdiction_id: 0,
                  tax_category_id: p.tax_category_id,
                  tax_type: 0,
                  tax_group: t.tax_group,
                  sale_tax_basis: sale_tax_basis[sale_tax_basis.length - 1],
                  sale_tax_amount:
                    sale_tax_amount[sale_tax_amount.length - 1],
                  print_sequence: '1',
                  name: t.tax_category,
                  tax_rate: t.tax_rate,
                  sales_tax_code_id: 0,
                  rounding_code: 0,
                };
              }
              else return null


            })
            .filter((f) => f !== null)[0];
        } else return null;
      })
      .filter((f) => f !== null)[0]
    let sales_tax2;
    if(tcstaxvisible === true){
      sales_tax2 =  sales_items
      ?.map((s) => {
        const p = productSearch(s.item_id);
        if (s.item_id === p?.item_id && p.taxes.length > 0) {
          return p.taxes
            ?.map((t) => {
              if (t.tax_group === 'TCS') {
                return {
                  jurisdiction_id: 0,
                  tax_category_id: p.tax_category_id,
                  tax_type: 0,
                  tax_group: t.tax_group,
                  sale_tax_basis: sale_tax_basis[sale_tax_basis.length - 1],
                  sale_tax_amount: tcsuntaxed('taxes'),
                  print_sequence: '1',
                  name: t.tax_category,
                  tax_rate: t.tax_rate,
                  sales_tax_code_id: 0,
                  rounding_code: 0,
                };
              }
              // if(tcstaxvisible === true && t.tax_group === 'TCS'){
              //   return {
              //     jurisdiction_id: 0,
              //     tax_category_id: p.tax_category_id,
              //     tax_type: 0,
              //     tax_group: t.tax_group,
              //     sale_tax_basis: sale_tax_basis[sale_tax_basis.length - 1],
              //     sale_tax_amount:
              //       sale_tax_amount[sale_tax_amount.length - 1],
              //     print_sequence: '1',
              //     name: t.tax_category,
              //     tax_rate: t.tax_rate,
              //     sales_tax_code_id: 0,
              //     rounding_code: 0,
              //   };
              // }
              else return null


            })
            .filter((f) => f !== null)[0];
          } else return null;
        })
        .filter((f) => f !== null)[0];
      }
      setSalesTaxes([sales_tax1, ...(tcstaxvisible && sales_tax2 ? sales_tax2 : [])])
  };
  tempitem.current = item;
  useEffect(() => {
    tempitem.current();
    // item(); //current_item_id
  }, [sales_items]);

  const cust = () => {
    const getState =
      props.app_config_data_based_on_type?.find((d) => d.key_name === 'address.state') || {};
    cusArray?.map((c) => {
      if (formValues.customer_id === c.customer_id) {
        if ((c.state?.toLowerCase() || "") === (getState.value?.toLowerCase() || "")) {
          setTaxVisible(true);
        } else {
          setTaxVisible(false);
        }
      }
      return null;
    });
  };

  tempcust.current = cust;
  useEffect(() => {
    tempcust.current();
  }, [formValues.customer_id]);
  const tcscust = () =>{
    cusArray?.map((c) => {
      if (formValues.customer_id === c.customer_id) {
        if (c.tcs === 1) {
          setTcsVisible(true);
        } else {
          setTcsVisible(false);
        }
      }
      return null;
    });
  }

  tcscust.current = tcscust;
  useEffect(() => {
    tcscust.current();
  }, [formValues.customer_id]);
  const floatnum = (num) => {
    if (!num) return 0;
    const str = num.toFixed(2);
    const numarray = str.split('.');
    let convert = numarray[0];
    if (numarray[1]) {
      convert += '.' + numarray[1];
    } else {
      convert += '.00';
    }
    return parseFloat(convert);
  };
  const taxes = (tax_rate) => {
    let total = 0;
    var newArray = sales_items.filter(function (el) {
      return el.taxes_name === tax_rate;
    });
    newArray.map((n) => {
      total +=
        ((n.item_unit_price * n.quantity) / 100) * tax_rate.match(/\d+/)[0];
      return null;
    });
    return total.toFixed(2);
  };

  const custData = () => {
    const filterCol = [
      {tax_des: 'CGST'},
      {tax_des: 'SGST'},
      {tax_des: 'Amount'},
    ];
    // let count = 0
    for (let [count, data] of sales_items.entries()) {
      productByType.map((p) => {
        if (data.item_id === p.item_id) {
          p.taxes.map((t) => {
            if (t.tax_group === 'CGST')
              filterCol[0][`tax${count}`] = floatnum(t.tax_rate);

            if (t.tax_group === 'SGST')
              filterCol[1][`tax${count}`] = floatnum(t.tax_rate);

            if (t.tax_group === 'IGST')
              filterCol[2][`tax${count}`] = taxes(t.tax_category);
            return null;
          });
        }
        return null;
      });
    }
    return filterCol;
  };
  const custColumn = () => {
    let taxes = [{title: '', field: 'tax_des'}];
    let taxValue = [];
    sales_items.map((d, i) =>
      productByType.map((p) => {
        if (d.item_id === p.item_id)
          return p.taxes.map((t) => {
            if (t.tax_group === 'IGST') {
              if (_.includes(taxValue, t.tax_rate / 2) === false)
                taxes.push({title: `${t.tax_rate / 2}%`, field: `tax${i}`});
              taxValue.push(t.tax_rate / 2);
            }
            return null;
          });
        return null;
      }),
    );
    return taxes;
  };
  const untaxed = (taxes) => {
    let mappingColumn = ['quantity', 'item_unit_price', 'item_id'];
    let total = 0;
    sales_items?.map((s) => {
      let arr = [];
      mappingColumn.map((c) => {
        if (_.includes(Object.keys(s), c)) {
          arr.push(s[c]);
        }
        return null;
      });
      if (taxes) {
        productByType.map((p) => {
          if (p.item_id === arr[2]) {
            p.taxes.map((t) => {
              if (t.tax_group === 'IGST') {
                total += ((arr[0] * arr[1]) / 100) * t.tax_rate;
              }
              return null;
            });
          }
          return null;
        });
        return null;
      } else {
        total += arr[0] * arr[1];
      }
      return total;
    });
    return total;
  };
  
  // const tcsuntaxed = (taxes) => {
  //   if(tcstaxvisible === false){
  //   return 0;
  //   }else{
  //   let mappingColumn = ['quantity', 'item_unit_price', 'item_id'];
  //   let total = 0;
  //   sales_items?.map((s) => {
  //     let arr = [];
  //     mappingColumn.map((c) => {
  //       if (_.includes(Object.keys(s), c)) {
  //         arr.push(s[c]);
  //       }
  //       return null;
  //     });
  //     if (taxes) {
  //       productByType.map((p) => {
  //         if (p.item_id === arr[2]) {
  //           p.taxes.map((t) => {
  //             if (t.tax_group === 'TCS') {
  //               total += ((arr[0] * arr[1]) / 100) * t.tax_rate;
  //             }
  //             return null;
  //           });
  //        }
  //         return null;
  //       });
  //       return null;
  //     } else {
  //       total += arr[0] * arr[1];
  //     }
  //     return total;
  //   });
  //   return total;
  // }
  // };
//   const tdstaxes = () => {
//     let total = 0;
//     if (formValues.tds_percent && !isNaN(formValues.tds_percent)) {  // Check if not empty and is a valid number
//        total = parseFloat(formValues.tds_percent) || 0; // Convert to number, default to 0
//     }
//     console.log('totallll', total);
//     return total;
// };

function calculateTcsTaxRate() {
  if (formValues.tcs && !isNaN(formValues.tcs)) {
    let taxableAmount = untaxed() - parseFloat(formValues.tcs) || 0;
    
    // Corrected tax rate calculation
    let taxRate = (parseFloat(formValues.tcs) / taxableAmount) * 100;
    
    return taxRate.toFixed(2);
  } else {
    return "0%";
  }
}


  const tcsuntaxed = () => {
    let total = 0;
    if (formValues.tcs && !isNaN(formValues.tcs)) {  // Check if not empty and is a valid number
       total = parseFloat(formValues.tcs) || 0; // Convert to number, default to 0
       return total
    }
  
    return total;
};

function calculateTcsTaxRate() {
  if (formValues.tcs && !isNaN(formValues.tcs)) {
    let taxableAmount = untaxed();
    
    // Corrected tax rate calculation
    let taxRate = (parseFloat(formValues.tcs) / taxableAmount) * 100;
    let tax_value = taxRate.toFixed(2);
    // setFormValues({...formValues, tcs_percent : tax_value})
    return tax_value;
  } else {
    return "0%";
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

  function getArraySum(a) {
    var tot = 0;
    for (var i in a) {
      tot += parseFloat(a[i]);
    }
    return tot;
  }

  // const filterOptions = (options, { inputValue }) => {
  //   const inputKeywords = inputValue.toLowerCase().split(' ');
  //   return options.filter((option) => {
  //     const optionName = option.name ? option.name.toLowerCase() : '';
  //     const optionSku = option.sku ? option.sku.toLowerCase() : '';
  //     const optionLots = option.lots ? option.lots.map((d) => d.lot_number.toLowerCase()).join(' ') : '';
  //     const optionString = optionName + optionSku + optionLots;

  //     return inputKeywords.every((keyword) => optionString.includes(keyword));
  //   });
  // }

  // const filterOptions = createFilterOptions({
  //   stringify: (option) => option.item_id + option.name.trim().split(" ").map(n => n) + option.sku + option.brand + option.category + option.lots.map((d) => d.lot_number),
  // });

  // const filterOptions = createFilterOptions({
  //   stringify: (option) =>
  //     JSON.stringify(
  //       option.name + option.sku + option.lots.map((d) => d.lot_number),
  //     ),
  //   shouldFilter: (options, { inputValue }) => {
  //     if (!inputValue || inputValue.trim() === '') {
  //       // If the input is empty, do not filter the options.
  //       return options;
  //     }
  //   },
  // });
  

  const dublicateItemPopup = (data, key) => {
    setSalesItems([
      ...sales_items,
      {
        name: data.name,
        sku: key.toUpperCase(),
        discount: 0,
        discount_type: 0,
        print_option: 1,
        item_unit_price: data.unit_price,
        sub_total: floatnum(1 * parseInt(data.unit_price)),
        item_id: data.item_id,
        line: sales_items.length + 1,
        taxes_name: data.taxes
          .map((t) => {
            return t.tax_group === 'IGST' ? t.tax_category : null;
          })
          .filter((f) => f !== null)[0],
        quantity: parseFloat('1.000'),
        hsn_code: data.hsn_code,
        taxes: data.taxes,
      },
    ]);
    setDublicateLot([]);
  };

  const getCustomer = () =>
    cusArray?.filter((d) => formValues.customer_id === d.customer_id)[0];

  // const createMail = () => {

  //   const custData = getCustomer()

  //   const data = {
  //     custData,
  //     invoice_number: formValues.invoice_number,
  //     sales_items: sales_items,
  //     email: custData.email,
  //   }

  //   dispatch(sendMail(data, setLoaderStatusHandler))
  //   // handleSubmit()
  // }
  const FilterdLocation = (product) => {
    let res = productByType.lots.filter(
      (f) => f.location_id === formValues.location_id,
    );
    return res;
  };

  //   // dispatch(sendMail(data, setLoaderStatusHandler))
  //   handleSubmit()
  // }

  const addNote = (data) => {
    setFormValues((prev) => ({...prev, note: data}));
  };

  const paymentButtun = () => {
    const pendingPayment = props.sale_outstanding?.filter(
      (f) => f.customer_id === formValues.customer_id,
    );
    let payData = [];
    //console.log(pendingPayment,"dataaa")
    if (pendingPayment?.length > 0) {
      pendingPayment.map((p) => {
        p.childRow.map((c) => {
          payData.push({
            id: c.sale_id,
            po_number: c.invoice_number,
            paid_amount: c.received_amount,
            total: c.total,
          });
        });
      });
      if (payData.length > 0 && props.edit_id_data.length > 0) {
        setgetPay([...payData]);
        setpaymentOpen(true);
      } else if (payData.length === 0) {
        setgetPay([
          {
            id: formValues.sale_id,
            po_number: formValues.invoice_number,
            paid_amount: formValues.received_amount,
            total: formValues.total,
          },
        ]);
        setpaymentOpen(true);
      }
    }
  };
  const handleItemPopup = async (data, onRowDataChange, type) => {
    // const id = onRowDataChange ? '' : data.tableData?.id
    console.log(data,'555555');
    
    const id = data.tableData?.id
    setRowid({
      onRowDataChange,
      open: true,
      id: id,
      data: data,
      status: 'edit'
    })
    // setRowid({open: true, id: id.tableData.id, data: id, status: 'edit'});
    // setdisabledel(false)
  };

  const handleItemPopUpClose = () => {
    setRowid({...row_id, open: false});
  };
  useEffect(() => {
    if (formValues.customer_id !== null) {
      let PreviousSellingPrice = [];
      props.searchSalesData === 'search' ? props.searchSalesData : props.salesByPagination
      // props.sales?.map((f, i) => {
      //   if (f.customer_id === formValues.customer_id) {
      //     f.sales_items.map((s) =>
      //       PreviousSellingPrice.push({
      //         item_id: s.item_id,
      //         item_unit_price: s.item_unit_price,
      //       }),
      //     );
      //   }
      //   if (props.sales.length - 1 === i) {
      //     setPreviousSellingPrice(PreviousSellingPrice);
      //   }
      // });

    }
  }, [formValues.customer_id]);


  // const getPriviousSelling = (item_id) => {
  //   let res = 0;

  //   previousSellingPrice.map((p) => {
  //     if (p.item_id === item_id) {
  //       res = p.item_unit_price;
  //     }
  //   });

  //   return res;
  // };

  //console.log('salesitemsdata', sales_items)
  const LotRes = (rowData, qty) => {
    //console.log('Lotressssssssssss', rowData, qty)
    let res = [];
    // console.log(props.edit_id_data)
    if (rowData.is_serialized === 0) {
      const matchedProductType = productByType.find(
        (p) => parseInt(p.item_id) === parseInt(rowData.item_id)
      );

      const itemQty = matchedProductType?.item_qty || [];

      const locationId = !_.isEmpty(props.edit_id_data)
        ? props.edit_id_data[0].location_id: formValues.location_id;

      const qtyObj = itemQty.find(q => parseInt(q.location_id) === parseInt(locationId));
      return qtyObj ? qtyObj.totalQuantity : 0;
    } else {
      res = rowData.lots
      return res;
    }

  };



    const creditSequenceUpdate = () => {
      let type = 'credit'
      const { sequence_id, current_seq } = credit_debit_seq;
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
      // console.log("sequence_id, current_seq",sequence_id, current_seq)
       dispatch(creditDebitNoteSeqUpdate(type, { sequence_id, current_seq })),
      )
  
    };

  const returnFunc = () => {
    const filteredSalesItems = sales_items
      .filter(s => s.quantity > 0)
      .map(item => {
        if (item.is_serialized === 0) {
          return {
            ...item,
            lots: [],
            NSlots: [],
            soldLots: []
          };
        }
        return item;
      });
    const data = {...formValues, total: (untaxed() + untaxed('taxes')).toFixed(2),cnInvoiceNumber:credit_debit_seq.credit_note, sales_items:filteredSalesItems};

    if (checkEachBarcodeWasEntered(sales_items.filter(s=> s.quantity > 0)) === 'allEntered') {
      props.returnActions(
        {
          ...data, transactionEntryData: {
            total_cost_price: sales_items.filter(s => s.quantity > 0).reduce((acc, cur) => acc + cur.item_cost_price * cur.quantity, 0),
            total_unit_price: untaxed(),
            total_with_gst: parseFloat((untaxed() + untaxed('taxes')) + parseFloat(tcsuntaxed('taxes'))) - calculatetdsTaxAmount(),
            gst_inter: (untaxed('taxes') / 2).toFixed(2),
            tcs_inter: (tcsuntaxed('taxes')).toFixed(2),
            tds_inter: calculatetdsTaxAmount()

          },
        },
        setLoaderStatusHandler,
        commoncookie,
        headerLocationId, (res) => {
          // console.log("result", res.status, res)
          if (res.status === 200) {

            props.cnInvoiceFunction({ ...formValues, total: (untaxed() + untaxed('taxes')).toFixed(2), sales_items: sales_items.filter(s => s.quantity > 0) }, customer, credit_debit_seq);
            creditSequenceUpdate();
            const paginationData = {
              brand: '',
              category: '',
              location_id: headerLocationId,
              max_price: '',
              min_price: '',
              payment_type: '',
              from: null,
              to: null,
              user_id: commoncookie,
              pageCount: 0,
              numPerPage: 20,
              sale_status: 'All',
              searchString: ''
            };
            props.listSalesPaginateAction(
              paginationData,
              commoncookie,
              headerLocationId,
              setModalTypeHandler,
              setLoaderStatusHandler,
            )
          }
        }
      );
      

    } else {
      alert('Please Enter Barcode All Items');
    }
  };

  const dcreturnFunc = async() =>{
    const data = {...formValues, total: (untaxed() + untaxed('taxes')).toFixed(2), sales_items:sales_items.filter(s=> s.quantity > 0)};
    if (checkEachBarcodeWasEntered(sales_items.filter(s=> s.quantity > 0)) === 'allEntered') {
      await props.dcreturnActions(
        data,
        setLoaderStatusHandler,
        commoncookie,
        headerLocationId,
      );
      
      await props.closeDc();
    }  
    else {
      alert('Please Enter Barcode All Items');
    }
  }

  const handleFilter = (data) => {
    if(formValues.location_id === null){
      alert("Select any location")
    }else{
      setFilterOpen(data)
    }
   
  };

 const setDataApiFromMissingProduct = (data) => {
    setDataApi(data)
  };

  const productClose = () => {
    setmOpen(false)
  };

 const bulkApiCreate = (productData) => {
      // console.log("productData",productData)
      const dataApi = productData.map(({ tableData, tax_percentage,lotNumber, ...record }) => record);
      // console.log("asdasd",dataApi)
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(bulkProductAction(
          dataApi,
          setLoaderStatusHandler,
          (isRes, data) => {
            if (isRes) {
              productCreateSalesAlert(dispatch)
              // const getResData = data.map((d,index) => {
              //   const newData = {};
              
              //   let lots = [];
              //   let quantity = 0;
              //   xlData.forEach((t) => {
              //     if (t.ProductName.toString() === d.name) {
              //       if (t.LotNumber && t.LotNumber !== '') {
              //         const lotNumbers = t.LotNumber.split(',').map(lot => lot.trim());
              //         lotNumbers.forEach(lot => {
              //           if (lot) {
              //             lots.push({ lot_number: lot });
              //           }
              //         });
              //       }
              //       quantity += t.Qty;
              //     }
              //   });
              

               
              

          
              //   newData.item_id = d.item_id, 
              //   newData.name = d.name,
              //   newData.item_cost_price = d.cost_price;
              //   newData.item_unit_price = xlData.find((f) => f.ProductName === d.name)?.SellingCost || d.unit_price
              //   newData.taxes_name = d.taxes.map((t) => (t.tax_group === 'IGST' ? t.tax_category : null)).filter((f) => f !== null)[0]
              //   newData.quantity = quantity
              //   newData.line = sales_items.length + 1,
              //   newData.sub_total = singleTax(
              //     xlData.find((f) => f.ProductName === d.name)?.SellingCost || d.unit_price,
              //     parseInt(quantity),
              //     d.taxes
              //   ).toFixed(2),
              //   newData.discount= 0,
              //   newData.discount_type= 0,
              //   newData.print_option= 1,
              //   newData.sales_item_taxes=Sales_Item_Taxes(productByType, [d], sales_items),
              //   newData.taxes = d.taxes,
              //   newData.hsn_code = d.hsn_code,
              //   newData.taxes = d.taxes,
              //   newData.is_serialized = d.is_serialized,
              //   newData.qty_per_pack = d.qty_per_pack
              //   newData.NSlots=
              //     d.is_serialized === 0 && d.lots.length > 0 ? d.lots : [],
              //   newData.lots =
              //   d.is_serialized === 1 && (props.status === 'edit' || formValues.sale_status === 2) ? lots : [],
              //   newData.description = d.description,
              //   newData.stock_type = d.stock_type
              //   return newData;
              // });
              // console.log("getResData",getResData)
    
              // const mergeData = [...withItemId, ...getResData];
              setSalesItems(withItemId);
              setmOpen(false)
              setDataApi([])
              setWithItemId([])
            }
          },
        ))
        
      );
  
    };

//old excel upload
  // const encodeImageFileAsURL111 = (e) => {
  //   const reader = new FileReader();
  //   const rABS = !!reader.readAsBinaryString;
  //   const file = e.target.files[0];

  //   reader.onload = async(e) => {
  //     setFilterOpen(false)
  //     const bstr = e.target.result;
  //     const wb = read(bstr, {type: rABS ? 'binary' : 'array', bookVBA: true});
  //     const wsname = wb.SheetNames[0];
  //     const ws = wb.Sheets[wsname];
  //     const temp_xl_data = utils.sheet_to_json(ws);
  //     const temp_1_xl_data = temp_xl_data.filter(i => i.ProductName && i.Qty && i.SellingCost)
      
  //     const xl_data = temp_1_xl_data.map((i) => ({
  //       ['ProductName']: i.ProductName.replace(/(\r\n|\n|\r)/gm, ""),
  //       ['LotNumber']: parseInt(i.LotNumber),
  //       ['Qty']: parseInt(i.Qty),
  //       ['SellingCost']: parseFloat(i.SellingCost),
  //     }));


  //     const matchingProduct = locationWiseProduct.filter(f => xl_data.some(s => f.name?.trim().toLowerCase() === s.ProductName?.trim().toLowerCase()))
  //     let lotMissing = true
  //     const checkLots = (obj, lot_number) => {

  //       const res = obj.lots.some(s => formValues.location_id === s.location_id && parseInt(s.lot_number) === parseInt(lot_number))
  //       if (res) {
  //         return true
  //       } else {
  //         lotMissing = false
  //         return false
  //       }
  //     }
  //     const uniqByName = (array,property) =>{
  //        return array.filter((f,i) =>{
  //         return array.findIndex(fi => fi[property]?.trim().toLowerCase() === f[property]?.trim().toLowerCase()) === i
  //        })
  //     }

  

  //     let flag = false;

  //     if(uniqByName(xl_data,'ProductName').length !== matchingProduct.length){
  //         let temp = xl_data.map(i => { return {['name'] : i.ProductName.trim(),  ['lot']:i.LotNumber }})
  //         let unMatchedData = _(temp).differenceBy(locationWiseProduct, 'name') .map(_.partial(_.pick, _, 'name', 'lot')) .value();
  //         if(unMatchedData.length > 0){
  //           flag=false;
  //           setProductMisMatch(unMatchedData)
  //           setOpenAlert(true);
  //           return
  //         }
  //     }else{
  //       flag=true;
  //     }

  //     const uploadItems = matchingProduct.filter((f) => {
  //       if (f.is_serialized === 1) {
  //         let getAllByName = xl_data.filter((x) => x.ProductName.trim().toLowerCase() === f.name.trim().toLowerCase());
  //         let res = getAllByName.every((s) =>
  //           f.lots.some((l) => parseInt(l.lot_number) == parseInt(s.LotNumber)),
  //         );
  //         return getAllByName.every((s) => checkLots(f, s.LotNumber));
  //       } else {
  //         return xl_data.some(
  //           (s) => parseInt(s.Qty) <= f.lots.filter((l) => formValues.location_id === l.location_id).length,
  //         );
  //       }
  //     });
  //     // if(productMisMatch.length){
  //     //   flag = false
  //     // }
  //     if(uploadItems.length !== matchingProduct.length){

  //       let unMatchedData = [];
  //       const LotsFilter = async (data)=>{
  //         let prod = matchingProduct.find((m)=> m.name.trim().toLowerCase() === data.ProductName.trim().toLowerCase())
  //         if(prod){
  //           const { lots, is_serialized } = prod

  //           for(let key in lots){
  //             const { lot_number } = lots[key]
  //             if(is_serialized === 1){
  //               if(parseInt(lot_number) === parseInt(data.LotNumber)){
  //                 return
  //               }
  //             }else{
  //               if(parseInt(data.Qty) <= lots.length){
  //                 return
  //               }
  //             }
  //           }

  //           if(is_serialized === 1){
  //             unMatchedData.push(data)
  //           }else{
  //             let tempData = {...data, uploadQty : data.Qty, actualQty : lots.length}
  //             unMatchedData.push(tempData)
  //           }
  //         }
  //       }

  //       xl_data.forEach(x => LotsFilter(x))
  //       if(unMatchedData.length > 0){
  //         let temp = unMatchedData.map(item => {
  //           return {['name']:item.ProductName, ['lot']:item.LotNumber, ['uploadQty']:item.uploadQty, ['actualQty']:item.actualQty}
  //           })
  //           flag = false;
  //           setProductOutOfStock(temp)
  //       }


  //       // alert("Some Products Are Out of Stock")
  //     }else{
  //       flag = true
  //     }


  //     let tempDuplicateLot = xl_data.map(e =>  e['LotNumber'])
  //                                   .map((e, i, final) => final.indexOf(e) !== i && i)
  //                                   .filter(obj=> xl_data[obj])
  //                                   .map(e => ({name : xl_data[e]['ProductName'], lot: xl_data[e]["LotNumber"]}))
  //     if(tempDuplicateLot.length){
  //       setDuplicateLot(tempDuplicateLot)
  //       flag = false;
  //     }

  
  //     const tempSalesItems = uploadItems.map((v, i) => {
  //       let getAllItem = xl_data.filter(f => f.ProductName === v.name)
  //       let quantity = getAllItem.reduce((count, obj) => count + +obj.Qty, 0)

  //       return {
  //         item_id: v.item_id,
  //         name: v.name,
  //         item_cost_price: v.cost_price,
  //         item_unit_price: xl_data.find(f => f.ProductName === v.name)?.SellingCost || v.unit_price,
  //         taxes_name: v.taxes
  //           .map((t) => {
  //             return t.tax_group === 'IGST' ? t.tax_category : null;
  //           })
  //           .filter((f) => f !== null)[0],
  //         quantity,
  //         line: sales_items.length + 1,
  //         sub_total: singleTax(
  //           xl_data.find(f => f.ProductName === v.name)?.SellingCost || v.unit_price,
  //           parseInt(quantity),
  //           v.taxes,
  //         ).toFixed(2),
  //         discount: 0,
  //         discount_type: 0,
  //         print_option: 1,
  //         sales_item_taxes: Sales_Item_Taxes(productByType, [v], sales_items),
  //         hsn_code: v.hsn_code,
  //         taxes: v.taxes,
  //         is_serialized: v.is_serialized,
  //         qty_per_pack: v.qty_per_pack,
  //         NSlots: v.is_serialized === 0 && v.lots.length > 0 ? v.lots : [],
  //         lots: v.is_serialized === 1 ? v.lots.filter(l => getAllItem.some(s => parseInt(s.LotNumber) === parseInt(l.lot_number))) : v.lots.filter(f => f.location_id === formValues.location_id).slice(0, parseInt(quantity)),
  //         description: v.description,
  //         stock_type: v.stock_type,
  //       }
  //     })

      
  //     if(tempSalesItems.length){
  //       if (tempSalesItems.every(a => a.quantity === a.lots.length) && flag) {
  //         flag = true
  //       }else{
  //         flag=false;
  //         const duplicateLotDb = []
  //         tempSalesItems.forEach(a => {
            
  //           if(a.quantity !== a.lots.length){
  
  //             let dupLots = a.lots
  //             const lookup = dupLots.reduce((a, e) => {
  //               a[e.lot_number] = ++a[e.lot_number] || 0;
  //               return a;
  //             }, {});
  
  
  //             dupLots.forEach(e => {
  //               if(lookup[e.lot_number]){
  //                 let tempObj = { name: a.name,lot: e.lot_number }
  //                 if(!duplicateLotDb.some(i => i.lot === tempObj.lot)){
  //                   duplicateLotDb.push(tempObj)
  //                 }
  //               }
  //             });
  //           }
  //         });
  
  //         setDuplicateLotInDb(duplicateLotDb)
  //         // alert("Some Products LotNumber invalid")
  //       }
  //     }else{
  //       flag=false;
  //       setLocationMisMatch({
  //         title: 'Selected Location and Lot Location mismatch', 
  //         content: 'Select different location or Upload lot number belongs to same location.'
  //       })
  //     }
      

  //     if (flag) {
  //       if (tempSalesItems.length) {
  //         const _sales_items = tempSalesItems.flatMap(i => {
  //           return i.lots.map(j => ({ProductName:i.name, LotNumber: +j.lot_number, Qty : 1}))
  //         })
          

  //         const temp1 = [..._sales_items, ...xl_data];

  //         const lookup = temp1.reduce((a, e) => {
  //           a[e.LotNumber] = ++a[e.LotNumber] || 0;
  //           return a;
  //         }, {});
          
  //         const diff_items = temp1.filter(e => lookup[e.LotNumber] === 0);
  //         setExcelItemsNotAdded(diff_items.map(i => ({name:i.ProductName, lot:i.LotNumber})))

  //         setSalesItems(tempSalesItems);
  //       }
  //     } else {
  //       setOpenAlert(true);
  //     }
  //   };

  //   if (rABS) {
  //     reader.readAsBinaryString(file);
  //   } else {
  //     reader.readAsArrayBuffer(file);
  //   }

  //   setFilterOpen(false);
  // };

  //old excel 

  //  const encodeImageFileAsURL = (e) => {
  //   const reader = new FileReader();
  //   const rABS = !!reader.readAsBinaryString;
  //   const file = e.target.files[0];

  //   reader.onload = async (e) => {
  //     setFilterOpen(false)
  //     const bstr = e.target.result;
  //     const wb = read(bstr, { type: rABS ? 'binary' : 'array', bookVBA: true });
  //     const wsname = wb.SheetNames[0];
  //     const ws = wb.Sheets[wsname];
  //     const temp_xl_data = utils.sheet_to_json(ws);
  //     const temp_1_xl_data = temp_xl_data.filter(i => i.ProductName && i.Qty && i.SellingCost)

  //     const data = temp_1_xl_data.map((i) => (removeUnnecessaryChar(i)));

  //     // console.log("data11", data)
  //     function removeUnnecessaryChar(data) {

  //       const conversion = {
  //         LotNumber(val) {
  //           // console.log("val", val)
  //           return val.trim()
  //         },
  //         Qty(val) {
  //           return parseInt(val)
  //         },
  //         SellingCost(val) {
  //           return parseFloat(val)
  //         },
  //       }

  //       let tempObj = {};

  //       for (let key in data) {
  //         let val = data[key]
  //         let modifiedVal;
  //         if (val !== undefined && typeof val === 'string') {
  //           modifiedVal = val.replace(/(\r\n|\n|\r)/gm, "").trim()
  //         }
  //         if (['LotNumber', 'Qty', 'SellingCost'].includes(key)) {
  //           tempObj[key] = conversion[key](modifiedVal || val)
  //         } else {
  //           tempObj[key] = modifiedVal || val
  //         }
  //       }

  //       return tempObj;
  //     }


  //     const withItemId = [];
  //     const wOutItemId = [];
  //     let customer_id = ''
  //     let flag = false;

  //     // console.log("withItemId", withItemId)
  //     // console.log("2222", wOutItemId)

  //     // console.log("formValues.customer_id", data)
  //     if (formValues.sale_status === 2 && data.length) {
  //       if (formValues.customer_id) {
  //         let lotCount = {};
  //         data.forEach(item => {
  //           const lots = item.LotNumber.split(",").map(lot => lot.trim());
  //           lots.forEach(lot => {
  //             if (!lot) return;
  //             if (!lotCount[lot]) lotCount[lot] = [];
  //             lotCount[lot].push(item);
  //           });
  //         });


  //         let tempDuplicateLot = [];
  //         for (const [lot, items] of Object.entries(lotCount)) {
  //           if (items.length > 1) {
  //             items.forEach(item => {
  //               tempDuplicateLot.push({
  //                 name: item.ProductName,
  //                 lot: lot
  //               });
  //             });
  //           }
  //         }

  //         if (tempDuplicateLot.length > 0) {

  //           setDuplicateLot(['Duplicate Lot Number', tempDuplicateLot])
  //           flag = false;
  //         } else {
  //           flag = true;
  //         }


  //         const uniqByName = (array, property) => {
  //           return array.filter((f, i) => {
  //             return (
  //               array.findIndex(
  //                 (fi) => fi[property]?.trim().toLowerCase() === f[property]?.trim().toLowerCase()
  //               ) === i
  //             );
  //           });
  //         };


  //         const matchingProduct = productByType.filter((f) =>
  //           data.some(
  //             (s) => f.name?.trim().toLowerCase() === s.ProductName?.trim().toLowerCase()
  //           )
  //         );

  //         let MisMatchProduct = data.filter(d => !productByType.some(f => f.name === d.ProductName))
  //       //  console.log("MisMatchProduct",MisMatchProduct)
  //         MisMatchProduct.forEach((misMatch, index) => {
  //           //  console.log("misMatch",misMatch)
  //           wOutItemId.push(misMatch);
  //         })

  //         // console.log(wOutItemId);





  //         const validateLotsAndUpload = async () => {
  //           let flag = true;
  //           let unMatchedData = [];

  //           const processLot = async (dataItem) => {
  //             const lots = dataItem.LotNumber.split(',').map((l) => l.trim());
  //             const prod = productByType.find(
  //               (p) => p.name.trim().toLowerCase() === dataItem.ProductName.trim().toLowerCase()
  //             );

  //             if (!prod) return;

  //             const { is_serialized, lots: prodLots } = prod;

  //             for (let lot of lots) {
  //               const exists = prodLots.some(
  //                 (pLot) =>
  //                   formValues.location_id === pLot.location_id &&
  //                   parseInt(pLot.lot_number) === parseInt(lot)
  //               );

  //               if (is_serialized === 1 && !exists) {
  //                 unMatchedData.push({
  //                   name: dataItem.ProductName,
  //                   lot,
  //                 });
  //               }
  //             }

  //             if (is_serialized !== 1) {
  //               const availableQty = prodLots.filter(
  //                 (l) => l.location_id === formValues.location_id
  //               ).length;

  //               if (parseInt(dataItem.Qty) > availableQty) {
  //                 unMatchedData.push({
  //                   name: dataItem.ProductName,
  //                   lot: dataItem.LotNumber,
  //                   uploadQty: dataItem.Qty,
  //                   actualQty: availableQty,
  //                 });
  //               }
  //             }
  //           };

  //           await Promise.all(data.map(processLot));

  //           if (unMatchedData.length > 0) {
  //             setProductOutOfStock(['Some products Out of Stock', unMatchedData]);
  //             setOpenAlert(true);
  //             flag = false;
  //             return;
  //           }






  //           const uploadItems = matchingProduct.filter((f) => {
  //             if (f.is_serialized === 1) {
  //               let getAllByName = data.filter(
  //                 (x) =>
  //                   x.ProductName.trim().toLowerCase() === f.name.trim().toLowerCase()
  //               );
  //               return getAllByName.every((s) =>
  //                 f.lots.some(
  //                   (l) =>
  //                     formValues.location_id === l.location_id &&
  //                     parseInt(l.lot_number) === parseInt(s.LotNumber)
  //                 )
  //               );
  //             } else {
  //               return data.some(
  //                 (s) =>
  //                   parseInt(s.Qty) <=
  //                   f.lots.filter((l) => formValues.location_id === l.location_id).length
  //               );
  //             }
  //           });

  //           const tempSalesItems = uploadItems.map((v, i) => {
  //             let getAllItem = data.filter((f) => f.ProductName === v.name);
  //             // console.log("getAllItem",getAllItem)
  //             let quantity = getAllItem.reduce((count, obj) => count + +obj.Qty, 0);

  //             return {
  //               item_id: v.item_id,
  //               name: v.name,
  //               item_cost_price: v.cost_price,
  //               item_unit_price:
  //                 data.find((f) => f.ProductName === v.name)?.SellingCost || v.unit_price,
  //               taxes_name: v.taxes
  //                 .map((t) => (t.tax_group === 'IGST' ? t.tax_category : null))
  //                 .filter((f) => f !== null)[0],
  //               quantity,
  //               line: sales_items.length + 1,
  //               sub_total: singleTax(
  //                 data.find((f) => f.ProductName === v.name)?.SellingCost || v.unit_price,
  //                 parseInt(quantity),
  //                 v.taxes
  //               ).toFixed(2),
  //               discount: 0,
  //               discount_type: 0,
  //               print_option: 1,
  //               sales_item_taxes: Sales_Item_Taxes(productByType, [v], sales_items),
  //               hsn_code: v.hsn_code,
  //               taxes: v.taxes,
  //               is_serialized: v.is_serialized,
  //               qty_per_pack: v.qty_per_pack,
  //               NSlots:
  //                 v.is_serialized === 0 && v.lots.length > 0 ? v.lots : [],
  //               lots:
  //               v.is_serialized === 1
  //               ? v.lots.filter((l) =>
  //                   getAllItem.some((s) =>
  //                     s.LotNumber
  //                       ?.split(',')
  //                       .map(num => parseInt(num.trim()))
  //                       .includes(parseInt(l.lot_number))
  //                   )
  //                 )
  //               : v.lots
  //                   .filter((f) => f.location_id === formValues.location_id)
  //                   .slice(0, parseInt(quantity)),
              
  //               description: v.description,
  //               stock_type: v.stock_type,
  //             };
  //           });


  //           withItemId.push(...tempSalesItems);
  //         };



  //         await validateLotsAndUpload();

  //         if (wOutItemId.length) {
  //           const dataApi = wOutItemId.map((d) => {
  //             const lotArray = d.LotNumber
  //               ? d.LotNumber.split(',').map((num) => ({ lot_number: num.trim() }))
  //               : [];
  //             // console.log("ddd",d)
  //             const newD = {
  //               name: d.ProductName,
  //               unit_price: d.SellingCost || 0,
  //               receiving_quantity: 0,
  //               qty_per_pack: 1,
  //               is_serialized:
  //                 typeof d.LotNumber !== 'undefined' &&
  //                   d.LotNumber !== '' &&
  //                   d.LotNumber !== null
  //                   ? 1
  //                   : 0,
  //               hsn_code: null,
  //               brand: null,
  //               category: null,
  //               model: null,
  //               cost_price:0,
  //               sku: null,
  //               tax_category_id: null,
  //               max_price: 0
  //             };
             
  //             return {
  //               ...newD,
  //               stock_type: 1,
  //             };
  //           });
          
  //           // console.log("dataApi",dataApi)
  //           if (flag) {
  //             setmOpen(true)
  //             setWithItemId(withItemId)
  //             setDataApi(dataApi)
  //             setXlData(data)
  //           } else {
  //             setOpenAlert(true)
  //           }
  //         } else {

  //           let RowData = withItemId.map((row, i) => {
  //             let check = sales_items.filter(item => item.item_id === row.item_id)
  //             if (check.length) {
  //               return { ...row, line: i + 1 }
  //             } else {
  //               return row
  //             }

  //           })
  //           // console.log("flag", flag)
  //           if (flag) {
  //             setSalesItems(props.status !== 'edit' ? withItemId : RowData);
  //           } else {
  //             setOpenAlert(true)
  //           }
  //         }



  //       }
  //       else {
  //         alert('Select Customer');
  //         return;
  //       }
  //     }










  //   };

  //   if (rABS) {
  //     reader.readAsBinaryString(file);
  //   } else {
  //     reader.readAsArrayBuffer(file);
  //   }

  //   setFilterOpen(false);
  // };

   useEffect(()=>{ (async () => {
    if(formValues.customer_id !== null){
      const data = {
        customer_id :  formValues.customer_id
      }
     await dispatch(customesSalesmanAction(data))
    }
  })();
},[formValues.customer_id])


  const encodeImageFileAsURL = (e) => {
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;
    const file = e.target.files[0];

    reader.onload = async (e) => {
      setFilterOpen(false)
      const bstr = e.target.result;
      const wb = read(bstr, { type: rABS ? 'binary' : 'array', bookVBA: true });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const temp_xl_data = utils.sheet_to_json(ws);
      const temp_1_xl_data = temp_xl_data.filter(i => i.ProductName && i.Qty && i.SellingCost)

      const data = temp_1_xl_data.map((i) => (removeUnnecessaryChar(i)));

      // console.log("data11", data)
      function removeUnnecessaryChar(data) {

        const conversion = {
          LotNumber(val) {
            // console.log("val", val)
            return typeof val === 'string' ? val.trim() : String(val).trim();
          },
          Qty(val) {
            return parseInt(val)
          },
          SellingCost(val) {
            return parseFloat(val)
          },
        }

        let tempObj = {};

        for (let key in data) {
          let val = data[key]
          let modifiedVal;
          if (val !== undefined && typeof val === 'string') {
            modifiedVal = val.replace(/(\r\n|\n|\r)/gm, "").trim()
          }
          if (['LotNumber', 'Qty', 'SellingCost'].includes(key)) {
            tempObj[key] = conversion[key](modifiedVal || val)
          } else {
            tempObj[key] = modifiedVal || val
          }
        }

        return tempObj;
      }


      const withItemId = [];
      const wOutItemId = [];
      let customer_id = ''
      let flag = false;

      // console.log("withItemId", withItemId)
      // console.log("2222", wOutItemId)

      // console.log("formValues.customer_id", data)
      if (formValues.sale_status === 2 && data.length) {
        if (formValues.customer_id) {
          let lotCount = {};
          data.forEach(item => {
                const lot = item.LotNumber?.toString().trim();
                if (!lot) return;
                if (!lotCount[lot]) lotCount[lot] = [];
                lotCount[lot].push(item);
              });

              let tempDuplicateLot = [];

              for (const [lot, items] of Object.entries(lotCount)) {
                if (items.length > 1) {
                  items.forEach(item => {
                    tempDuplicateLot.push({
                      name: item.ProductName,
                      lot: lot
                    });
                  });
                }
              }
          if (tempDuplicateLot.length > 0) {

            setDuplicateLot(['Duplicate Lot Number', tempDuplicateLot])
            flag = false;
          } else {
            flag = true;
          }


          const uniqByName = (array, property) => {
            return array.filter((f, i) => {
              return (
                array.findIndex(
                  (fi) => fi[property]?.trim().toLowerCase() === f[property]?.trim().toLowerCase()
                ) === i
              );
            });
          };

          let MisMatchProduct = data.filter(d => !productByType.some(f => f.name === d.ProductName))
          //  console.log("MisMatchProduct",MisMatchProduct)
          MisMatchProduct.forEach((misMatch, index) => {
            //  console.log("misMatch",misMatch)
            wOutItemId.push(misMatch);
          })

          // console.log(wOutItemId);





          const validateLotsAndUpload = async () => {
            let flag = true;
            let unMatchedData = [];
            const matchedLots = [];
            const matchedProducts = [];

            const processLot = async (dataItem) => {
              const lot = dataItem.LotNumber?.toString().trim();

              const prod = productByType.find(
                (p) => p.name.trim().toLowerCase() === dataItem.ProductName.trim().toLowerCase()
              );
              if (!prod) return;

              const data = {
                item_id: prod.item_id,
                location_id: formValues.location_id,
                lot_number: lot,
              };

            

              const { is_serialized } = prod;

              if (is_serialized === 1) {
                const response2 = await customFetch(API_URLS.GET_LOTS_DETAILS, 'POST', data);
                const result = Array.isArray(response2.data) ? response2.data : [];  
                const exists = result.some(
                  (pLot) =>
                    parseInt(pLot.location_id) === parseInt(formValues.location_id) &&
                    parseInt(pLot.lot_number) === parseInt(lot)
                );

                if (!exists) {
                  unMatchedData.push({
                    name: dataItem.ProductName,
                    lot,
                  });
                } else {
                  const matchedLotsForThis = result
                    .filter((pLot) => parseInt(pLot.location_id) === parseInt(formValues.location_id))
                    .map((lotObj) => ({ ...lotObj, name: dataItem.ProductName }));

                  matchedLots.push(...matchedLotsForThis);

                  if (!matchedProducts.some((p) => p.item_id === prod.item_id)) {
                    matchedProducts.push(prod);
                  }
                }
              } else {
                const itemQty = prod?.item_qty || [];
                //  console.log("itemQty",itemQty,props.edit_id_data)
                const available_quantity = (() => {
                  const qtyObj = itemQty.find(q => q.location_id === formValues.location_id);
                  return qtyObj ? qtyObj.totalQuantity : 0;
                })();



                if (parseInt(dataItem.Qty) > available_quantity) {
                  unMatchedData.push({
                    name: dataItem.ProductName,
                    lot: dataItem.LotNumber,
                    uploadQty: dataItem.Qty,
                    actualQty: available_quantity,
                  });
                } else {



                  if (!matchedProducts.some((p) => p.item_id === prod.item_id)) {
                    matchedProducts.push(prod);
                  }
                  
                }
              }
            };
            // console.log("matchedProducts",matchedProducts)
            // console.log("matchedProductLots",matchedLots)


            await Promise.all(data.map(processLot));

            if (unMatchedData.length > 0) {
              setProductOutOfStock(['Some products Out of Stock', unMatchedData]);
              setOpenAlert(true);
              flag = false;
              return;
            }






            const uploadItems = matchedProducts.filter((f) => {
              const matchedProductLots = matchedLots.filter(
                (l) => l.name.trim().toLowerCase() === f.name.trim().toLowerCase()
              );
              // console.log("asdasdad",matchedProductLots)

              if (f.is_serialized === 1) {
                const getAllByName = data.filter(
                  (x) => x.ProductName.trim().toLowerCase() === f.name.trim().toLowerCase()
                );

                return getAllByName.every((s) =>
                  matchedProductLots.some(
                    (l) =>
                      parseInt(formValues.location_id) === parseInt(formValues.location_id) && 
                      parseInt(l.lot_number) === parseInt(s.LotNumber)
                  )
                );
              } else {
                return data.some(
                  (s) =>
                    s.ProductName.trim().toLowerCase() === f.name.trim().toLowerCase() 
                );
              }
            });

            // console.log("uploadItems",uploadItems)


            const tempSalesItems = uploadItems.map((v, i) => {
              let getAllItem = data.filter((f) => f.ProductName === v.name);
              // console.log("getAllItem",getAllItem)
              let quantity = getAllItem.reduce((count, obj) => count + +obj.Qty, 0);
              const matchedProductLots = matchedLots.filter(
                (l) => l.name.trim().toLowerCase() === v.name.trim().toLowerCase()
              );

              return {
                item_id: v.item_id,
                name: v.name,
                item_cost_price: v.cost_price,
                item_unit_price:
                  data.find((f) => f.ProductName === v.name)?.SellingCost || v.unit_price,
                taxes_name: v.taxes
                  .map((t) => (t.tax_group === 'IGST' ? t.tax_category : null))
                  .filter((f) => f !== null)[0],
                quantity,
                line: sales_items.length + 1,
                sub_total: singleTax(
                  data.find((f) => f.ProductName === v.name)?.SellingCost || v.unit_price,
                  parseInt(quantity),
                  v.taxes
                ).toFixed(2),
                discount: 0,
                discount_type: 0,
                print_option: 1,
                sales_item_taxes: Sales_Item_Taxes(productByType, [v], sales_items),
                hsn_code: v.hsn_code,
                taxes: v.taxes,
                is_serialized: v.is_serialized,
                qty_per_pack: v.qty_per_pack,
                NSlots:
                  [],
                lots:
                  v.is_serialized === 1
                    ? matchedProductLots.filter(l =>
                      getAllItem.some(s => parseInt(s.LotNumber) === parseInt(l.lot_number))
                    )
                    : [],

              
                description: v.description,
                stock_type: v.stock_type,
              };
            });


            withItemId.push(...tempSalesItems);
          };

          // console.log("withItemId",withItemId)



          await validateLotsAndUpload();

          if (wOutItemId.length) {
            const dataApi = wOutItemId.map((d) => {
              const lotArray = d.LotNumber
                ? d.LotNumber.split(',').map((num) => ({ lot_number: num.trim() }))
                : [];
              // console.log("ddd",d)
              const newD = {
                name: d.ProductName,
                unit_price: d.SellingCost || 0,
                receiving_quantity: 0,
                qty_per_pack: 1,
                is_serialized:
                  typeof d.LotNumber !== 'undefined' &&
                    d.LotNumber !== '' &&
                    d.LotNumber !== null
                    ? 1
                    : 0,
                hsn_code: null,
                brand: null,
                category: null,
                model: null,
                cost_price:0,
                sku: null,
                tax_category_id: null,
                max_price: 0
              };
             
              return {
                ...newD,
                stock_type: 1,
              };
            });
          
            // console.log("dataApi",dataApi)
            if (flag) {
              setmOpen(true)
              setWithItemId(withItemId)
              setDataApi(dataApi)
              setXlData(data)
            } else {
              setOpenAlert(true)
            }
          } else {

            let RowData = withItemId.map((row, i) => {
              let check = sales_items.filter(item => item.item_id === row.item_id)
              if (check.length) {
                return { ...row, line: i + 1 }
              } else {
                return row
              }

            })
            // console.log("flag", flag)
            if (flag) {
              setSalesItems(props.status !== 'edit' ? withItemId : RowData);
            } else {
              setOpenAlert(true)
            }
          }



        }
        else {
          alert('Select Customer');
          return;
        }
      }










    };

    if (rABS) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsArrayBuffer(file);
    }

    setFilterOpen(false);
  };


  useEffect(() => {
    if(!props.modalStatus && customerEdit ){
      dispatch(listCustomerAction())
    }
  }, [props.modalStatus])

  useEffect (() => {
     if (props.selectData.NewCustomer === true) {     
      const filter = [...cusArray];
      const popc = filter[0]?.customer_id;
      setStateHandler('customer_id',  popc);
      props.setModalStatusHandler(false);
      props.setselectData('NewCustomer', false);
    }
  },[props.selectData.NewCustomer])

  useEffect(() => { (async () => {
    if(sales_items.length > 0 && formValues.customer_id !== null){
      if((props.appConfigData.eInvoice === '1' || props.appConfigData.ewayBill === '1') && (untaxed() > 0 ? floatnum((untaxed() + untaxed('taxes')+ tcsuntaxed('taxes'))- calculatetdsTaxAmount()) : 0) >= 50000 ){
        dispatch(getLatestTransporterDetailsAction(formValues.customer_id, async(response) => {
          const res = await response
          setFormValues((prev) => ({ 
            ...prev, 
            trans_doc_no: formValues.invoice_number, 
            trans_id: props.appConfigData.gstin ? props.appConfigData.gstin : res[0]?.trans_id || 1, 
            trans_name: props.appConfigData.companyName,
            veh_no: res[0]?.veh_no || '',
            distance: res[0]?.distance || '',
            trans_mode: res[0]?.trans_mode || ''
          }))
        }))
      }
      else{
        setFormValues((prev) => ({ ...prev, trans_doc_no: null, trans_id: null, trans_name: null }))
      }
    }
  })();
}, [sales_items, formValues.invoice_number, formValues.customer_id])

  const [initialTotalCust, setInitialTotalCust] = useState(cusArray.length); 
  const [updatedTotalCust, setUpdatedTotalCust] = useState(initialTotalCust);

  useEffect(() => {
    setUpdatedTotalCust(cusArray.length);
  }, [cusArray]); 


  //  console.log(formValues.sale_status,'cusArray')
  const totalAmount = floatnum(untaxed() + untaxed('taxes') + tcsuntaxed('taxes') + getCustomerOutstanding[0]?.total_amount);
  console.log(totalAmount, 'cvjdujhe')
  useEffect(() => {
    if(getApprovalRights && props.status !== 'edit'){
      if(getApprovalRights?.rights !== true){
        return setRequest(false)
      }
    }
    if (totalAmount > 0 && getApprovalRights?.rights === true && props.status !== 'edit' && getCustomerOutstanding[0]?.total_amount !== null) {
      console.log(customer, 'customertotalAmount', totalAmount)
        const matchedCustomer = customer.find(
            (e) =>
                e.customer_id === formValues.customer_id &&
                // (e.credit_value === null ? 0 : e.credit_value)  &&
                totalAmount >= (e.credit_value === null ? 0 : e.credit_value)
        );

        if (matchedCustomer ) {
           setDueAmountPopupOk('WaitingSo')
           return setRequest(true);
        }
        else{
            setDueAmountPopupOk('')
            setRequest(false);
        }
      // if(salesApprovals?.length > 0){
      //   if(salesApprovals[0].status === 'Approved'){
      //     setRequest(false)
      //   }
      //   }


    }
}, [formValues.customer_id,totalAmount,getApprovalRights?.length]);

useEffect(()=>{ (async () => {
  if(formValues.customer_id != null && getApprovalRights.rights === true && storage?.company_type === 3 && props.status === 'edit'){
    const payload = {
      type : 'Customer_sale_item',
      // customer_id : formValues.customer_id,
      sale_id : props.edit_id_data[0].sale_id,
      pageCount: 0,
      numPerPage: 15
    }
   await  dispatch(salesApprovalsAction(payload))
  }
  else if(formValues.customer_id != null && getApprovalRights.rights === true && storage?.company_type === 3 && props.status !== 'edit'){
    const payload = {
      type : 'Customer_sale_item_create',
      customer_id : formValues.customer_id,
      pageCount: 0,
      numPerPage: 15
    }
   await  dispatch(salesApprovalsAction(payload))
  }
})();
},[formValues.customer_id])

useEffect(() => {
  const updateSalesApproval = async () => {
    if( storage?.company_type === 3) {

      // if(getApprovalRights?.rights === true && salesApprovals.length === 0){
      //   return setSalesItems([])
      // }
  
      if ((getApprovalRights?.rights !== true) || salesApprovals.length === 0) return;
      const salesApproval = salesApprovals[0];

      // if (salesApproval.sales_items) {
      //   setSalesItems(JSON.parse(salesApproval.sales_items));
      // }
      
      if (salesApproval.status === 'Approved') {
        setRequest(false);
        return;
      }
  
      const creditValue = salesApproval.credit_value ?? 0;
      if (
        (salesApproval.credit_days === 0 && creditValue === 0) || 
        (salesApproval.outstanding >= creditValue) || 
        salesApproval.is_overdue === 1 || 
        totalAmount > creditValue
      ) {
        setRequest(true);
      } else {
        // console.log('notworkingggg');
        setRequest(false);
      }
    }
   
  };

  updateSalesApproval();
}, [salesApprovals?.length]);

const leadcompyupdate = formValues?.location_id === null  && props.status === 'convertSO'
// console.log(leadcompyupdate,'leadcompyupdate');

useEffect(() => {
  if (storage?.company_type === 10) {
//  console.log(formValues?.location_id ,'112');

    const isLocation = props.stocklocation.find(
      (d) => d.location_id === headerLocationId,
    );
//  console.log(isLocation ,'2112');

    const {comment, reference, sale_status, location_id} =
      props?.newSalesAfterCreating_Data;
    let loc_id =
      isLocation?.length > 0 ? isLocation?.location_id : headerLocationId;
//  console.log(headerLocationId ,loc_id,'11222');

    setFormValues((prev) => ({
      ...prev,
      location_id: loc_id,
      ...(props.isNewSales && {comment, sale_status, reference, location_id}),
    }));
    //setFormValues({ ...formValues,location_id: loc_id})
    setFormErrors((prev) => ({...prev, location_id: null}));
    
  }
}, [leadcompyupdate]);


useEffect(() => { (async () => {
  const fetchAndSetLocation = async () => {
    if (addressManuallySelected) return;

    if (formValues.customer_id && cusArray.length > 0 && !openDialog) {
      setCustomerEdit(true)
      const customerInfo = cusArray.find(
        (e) => e.customer_id === formValues.customer_id
      );
      setSelectedCustomer(
      customerInfo
      );
      if (customerInfo) {
        const locationData = await getLocationDataBasedOnPincode(customerInfo.zip);

        setFormValues((prev) => ({
          ...prev,
          ship_legal_name: customerInfo.company_name,
          ship_address: customerInfo.address,
          ship_zip: customerInfo.zip,
          ship_location: locationData?.district || null,
          ship_stcd: locationData?.statecode || null,
        }));
      }
    } else if (!openDialog && !selectedAddress) {
      setFormValues((prev) => ({
        ...prev,
        ship_legal_name: null,
        ship_address: null,
        ship_zip: null,
        ship_location: null,
        ship_stcd: null,
      }));
      setCustomerEdit(false)
    }
  };
  fetchAndSetLocation();
 setFormValues((prev) => ({
  ...prev,
  sales_man:
    customer_salesman?.customer_sales_man?.length > 0 && formValues.customer_id !== null && props.status !== 'edit'
      ? {
          id: customer_salesman.customer_sales_man[0].employee_id,
          value: customer_salesman.customer_sales_man[0].username,
        }
      : { id: null, value: null },
}));

if (
  selectedCustomer?.sales_man_id !== null &&
  props.status === 'edit' &&
  customer_salesman?.sales_man_list?.length > 0
) {
  const cust_salesman = customer_salesman.sales_man_list.find(
    (e) => e.employee_id === formValues.salesman_id
  );

  if (cust_salesman) {
    setFormValues((prev) => ({
      ...prev,
      sales_man: {
        id: cust_salesman.employee_id,
        value: cust_salesman.username,
      },
    }));
  }
}


})();
}, [formValues.customer_id, openDialog, addressManuallySelected,customer?.length,customer_salesman]);

useEffect(() => {
  setAddressManuallySelected(false);
  setSelectedAddress(null);
}, [formValues.customer_id]);

useEffect(() => { (async () => {
 if(formValues.customer_id && storage?.company_type === 3 ){
  const data={
    customer_id : formValues.customer_id
  }
  setCustomerSelectionDialogOpen(false)
  apiCalls(
    setModalTypeHandler,
    setLoaderStatusHandler,
    await dispatch(getCustomerOutstandingDetailsAction(data, true, setLoaderStatusHandler)),
    await dispatch(getCustomerOutstandingDetailsDuesAction(data, true, setLoaderStatusHandler))
  );
 }
})();
}, [formValues.customer_id]);




  const handleViewSerialNumber = (rowData) => {
    const serialNumbers = []
    if(rowData.is_serialized === 1){
      rowData.lots.map((lot, index) => serialNumbers.push({sNo: index + 1, lotNumber: lot.lot_number}))
      setViewSerialNumber([...serialNumbers])
    }
    setViewSerialNumberOpen(true)
  }

  const handleSaleItemsReset = (reset) => {
    if(reset === 'yes'){
      setSalesItems([])
      setProductResetDialog(false)
    }
    else{
      setFormValues((prev) => ({ ...prev, sale_status: oldSaleStatus }))
      setProductResetDialog(false)
    }
  }

  useEffect(()=>{ (async () => {
    if(props.status === 'edit' && props.edit_id_data[0].dc_number !== null && !props.returnState && formValues.sale_status === 2 ){
           let lot_value = await [...sales_items]?.map((d)=>{
            return {
              ...d,    
            lots:  d.soldLots 
            // setSalesItems({...sales_items, lots : d.soldLots })
            }}) ;
       await setSalesItems([...lot_value ])

    }

    if(props.status === 'convertSO'){
      // console.log(props.edit_id_data[0],'editDataaaaa')
      setSalesItems([...props.edit_id_data[0].sales_items])
    }
  })();
},[formValues.sale_status])

  const editDiasble = props.status === 'edit' && props.edit_id_data?.[0]?.status === 'Approved'
  console.log('typeof props.setinvoicelayout:', typeof props.setinvoicelayout);

  const handleHsnDescEdit = (type, rowData) => {
    setEditHSNDesc(type)
    setHsnDesc({
      hsnCode: rowData.hsn_code,
      description: rowData.description,
      item_id: rowData.item_id
    })
  }

  const handleHsnDescEditCancel = () => {
    setEditHSNDesc(null)
  }

  const handleHsnDescChange = async(rowData, hsn, desc) => {
    await dispatch(changeProductHsnCodeDescriptionAction({hsnCode: hsn, description: desc, item_id: rowData.item_id}))
    setEditHSNDesc(null)
  }

  const debouncedHandleHsnDescChange = debounce((rowData, hsn, desc, dispatch, setEditHSNDesc) => {
  dispatch(changeProductHsnCodeDescriptionAction({ hsnCode: hsn, description: desc, item_id: rowData.item_id }))
    .then(() => setEditHSNDesc(null));
}, 500); // 500ms debounce â€” adjust as needed

  const handleLotNumberSearch = (event) => {
    const value = event.target.value
    setLotNumberSearch(value)
    
    if(event.target.value !== ''){
      if(!sales_items.some(item => item.lots && item.lots.some(lot => lot.lot_number === value))){
        dispatch(getProductByLotNumberSearchAction({lot_number: value, location_id: formValues.location_id, calledFrom: 'salesLotSearch'}, setModalTypeHandler, setLoaderStatusHandler, (response) => {
          if(response.length > 0){
            if(sales_items.some(item => item.item_id === response[0].item_id)){
              const product = sales_items.find(item => item.item_id === response[0].item_id)
              const updatedProduct = {
                ...product,
                quantity: product.quantity + 1,
                lots: [...product.lots, {
                  lot_number: value,
                  lot_id: response[0].lot_id,
                  trans_items_cost_price: response[0].trans_items_cost_price
                }]
              }
              const updatedSalesItems = sales_items.map((item) => {
                if(item.item_id === response[0].item_id){
                  return updatedProduct
                }
                else{
                  return item
                }
              })
              console.log(updatedSalesItems, 'updatedSalesItems')
              setSalesItems(updatedSalesItems)
            }
            else{
              const product = productByType.find(product => product.item_id === response[0].item_id)
              let discount_price
              if(props?.price_list?.length > 0){
                const aa =  props.price_list.find((e)=> e.id === formValues.price_list )
                discount_price = aa
              }
    
              let discount_added ;
              if(discount_price?.productData.length > 0){
                const dd = discount_price.productData.find((e)=> e.product_id == product.item_id)
                discount_added = dd
              }
              const itemQty = product?.item_qty || [];
              const available_quantity = (() => {
                const qtyObj = itemQty.find(q => q.location_id === formValues.location_id);
                return qtyObj ? qtyObj.totalQuantity : 0;
              })()
              const newSaleItem = {
                item_id: product.item_id,
                name: product.name,
                item_cost_price: product.cost_price,
                item_unit_price: parseFloat(discount_added?.discount_price !== undefined
                ? discount_added.discount_price
                : product
                  ? product.unit_price
                  : 0).toFixed(2),
                taxes_name: product.taxes
                  .map((t) => {
                    return t.tax_group === 'IGST' ? t.tax_category : null;
                  })
                  .filter((f) => f !== null)[0],
                quantity: 1,
                line: sales_items.length + 1,
                sub_total: singleTax(
                  discount_added?.discount_price !== undefined
                    ? discount_added.discount_price
                    :product ? product.unit_price : 0,
                  parseInt(1),
                  product.taxes,
                ).toFixed(2),
                discount: 0,
                discount_type: 0,
                print_option: 1,
                available_quantity: available_quantity,
                sales_item_taxes: Sales_Item_Taxes(productByType, [product], sales_items),
                hsn_code: product.hsn_code,
                taxes: product.taxes,
                is_serialized: product.is_serialized,
                qty_per_pack: product.qty_per_pack,
                lots: [{
                  lot_number: value,
                  lot_id: response[0].lot_id,
                  trans_items_cost_price: response[0].trans_items_cost_price
                }],
                description: product.description,
                stock_type: product.stock_type,
              }
    
              setSalesItems((prev) => ([...prev, newSaleItem]))
              setHsnDesc({
                hsnCode: product.hsn_code,
                description: product.description,
                item_id: product.item_id
              })
            }
            setLotNumberSearch(null)
            setLotNumberMessage({error: false, message: 'Added Successfully!'})
            setTimeout(() => {
              setLotNumberMessage({error: false, message: ''})
            }, 2000)
          }
          else{
            setLotNumberMessage({error: true, message: 'Invalid Lot Number!'})
          }
        }))
      }
      else{
        setLotNumberMessage({error: true, message: 'Lot Number Already Entered'})
      }
    }
  }
 console.log(sales_items, 'sales_items')

  console.log(formValues,'shippinggsssadddd')


  // let sdfgrtg = props.customer.find((d) => d.customer_id === formValues.customer_id) || {company_name : ''}
  return (
    <>
      {/* <AppHeader hidden={false} /> */}
      {Prompt}
      {/* <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}> */}
      <Grid container sx={rootSx}>
        <Card sx={rootSx} style={{overflow:'hidden'}}>
          <CardContent sx={widthSx} style={{overflow:'hidden'}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <div>
                {
                  (formValues.sale_status === 1 || formValues.sale_status === 8 || props.status === 'edit' || props.status === 'convertSo') &&
                  <Typography variant="h6" align="left" style={{ paddingBottom: props.status === 'edit' ? '20px' : '0px', margin: props.status === 'edit' ? '0px' : '0 0 5px 0' }}>
                    {props.returnState && props.edit_id_data?.[0]?.sale_status !== 8
                      ? 'Sales Return'
                      : props.status === 'edit' && props.edit_id_data?.[0]?.dc_number 
                      ? 'Edit Delivery Challan'
                      : props.status === 'edit' && props.edit_id_data?.[0]?.sale_status !== 8
                        ? 'Edit Sales Order'
                        : props.returnState && props.edit_id_data?.[0]?.sale_status === 8
                          ? 'DC Return'
                          : formValues.sale_status === 8
                            ? 'New Dc Order'
                            : 'Sales Order'}{' '}
                    -{' '}
                    <span style={{ variant: 'h6' }}>
                      {formValues.so_number !== null ? formValues.so_number : formValues.dc_number}
                    </span>
                  </Typography>
                }

                {formValues.sale_status !== 1 && formValues.sale_status !== 3 && formValues.sale_status !== 8 && !props.edit_id_data[0]?.dc_number && (
                  <Typography variant="h6" style={{ margin: '0 0 5px 0' }}>
                    Invoice No. -{' '}
                    <span style={{ fontSize: headerStyle.fontSize }}>
                      {formValues.invoice_number}
                    </span>
                  </Typography>
                )}
            </div>
            </div>

            <Grid container style={{ marginRight: '50px', marginBottom: '10px' }}>
                {formValues.customer_id && getCustomerOutstanding[0]?.invoice_count !== 0 && getCustomerOutstanding.length > 0 &&
                  <>
                    <Grid
                      size={{
                        lg: 10,
                        md: 10,
                        sm: 10,
                        xs: 10
                      }}>
                      <Box
                        display="flex"
                        flexDirection="row"
                        alignItems="flex-start"
                        p={2}
                        mt={2}
                        border="1px solid #ccc"
                        borderRadius={2}
                        bgcolor="#f9f9f9"
                        // style={{ minWidth: '300px', maxHeight: '75px', overflowY: 'auto' }}
                      >
                        <Typography variant="h6" sx={{ mb: '2px' }} gutterBottom>
                          <strong>Customer Outstandings : </strong>
                        </Typography>

                        {getCustomerOutstanding.map((item, index) => (
                          <Box key={index} display="flex" flexDirection="row" gap={4} ml={2}>
                            <Typography variant="body2">
                              <strong>Invoice Count : </strong> {item.invoice_count}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Total Amount : </strong> ₹ {item.total_amount}
                            </Typography>
                            <Typography variant="body2">
                            <strong>Due Date : </strong> {item.due_date === null ? moment(item.invoice_date).format('DD/MM/YYYY') : moment(item.due_date).format('DD/MM/YYYY')}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Grid>
                  </>
                // ) : (
                //   formValues.customer_id && (
                //     <Grid size={{ xs: 10, sm: 10, md: 10, lg: 10 }}>
                //     <Box
                //       display="flex"
                //       flexDirection="column"
                //       alignItems="flex-start"
                //       p={2}
                //       mt={2}
                //       border="1px solid #ccc"
                //       borderRadius={2}
                //       bgcolor="#f9f9f9"
                //       style={{ minWidth: '300px', maxHeight: '75px', overflowY: 'auto' }}
                //     >
                //       <Typography variant="h6" sx={{ mb: '2px' }} gutterBottom>
                //         <strong>Customer Outstandings:</strong>
                //       </Typography>

                //       <Typography variant="body2" color="textSecondary">
                //         No outstanding invoices
                //       </Typography>
                //     </Box>
                //     </Grid>
                //     )
                // )
                }
              </Grid>

            {dublicateLotVisible.length > 0 ? (
              <DublicateLotList
                data={dublicateLotVisible}
                dublicateItem={dublicateItemPopup}
                handleClose={setDublicateLot}
              />
            ) : (
              ''
            )}
            {filterOpen === true && (<CommonImport
                                  handleClose={handleFilter}
                                  open={filterOpen}
                                  encodeImageFileAsURL ={encodeImageFileAsURL}
                                  exportSample={()=>{}}
                                  headers = {[]}
                                  data = {[]} 
                                  sampleDownloadButtonName = {'Here'} 
                                  type = 'sale'                    
          />)}
            <Grid
              style={{
                alignItems: 'flex-end',
                backgroundColor: '#FDFEFE',
                margin: 0,
              }}
              // spacing={2}
              sx={widthSx}
              container
              direction='row'
              value='one'
            >
              <Grid container spacing={3} sx={{mb: 1}}>
              <Grid
                size={{
                  lg: 10,
                  md: 10,
                  sm: 10,
                  xs: 10
                }}>
              <Grid container spacing={3}>
                <Grid
                  style={{display: 'flex', alignItems: 'flex-end'}}
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <Autocomplete
                    id='multiple-limit-tags'
                    disabled={props.status === 'edit' ? true : false}
                    value={
                      updatedTotalCust > initialTotalCust ? 
                      cusArray?.find(
                        (d) => d.customer_id === formValues.customer_id,
                      ) || {company_name : ''}
                      :
                      !_.isEmpty(props.edit_id_data)
                        ? cusArray?.find(
                            (d) =>
                              d.customer_id ===
                              props.edit_id_data[0]?.customer_id,
                          ) || {company_name : ''}
                        : cusArray?.find(
                            (d) => d.customer_id === formValues.customer_id,
                          ) || {company_name : ''}
                    }
                    options={cusArray?.filter(
                      (c) =>
                        c.company_name !== null &&
                        c.company_name !== '' &&
                        c.customer_id &&
                        c.customer_type === '1',
                        
                    )}
                    fullWidth
                    getOptionLabel={(option) => option?.company_name || ''}
                    onChange={(e, c) =>{
                      setStateHandler('customer_id', c !== null ? c.customer_id : '');
                    }
                      
                    }
                    renderOption={(props, option) => {
                      return (
                        <li {...props} key={option?.customer_id}>
                          {option?.company_name}
                        </li>
                      );
                    }}
                    // renderInput={(params) => (
                    //   <TextField
                    //     {...params}
                    //     fullWidth={true}
                    //     required={true}
                    //     variant='outlined'
                    //     label='Select Customer'
                    //     placeholder='Select Cutomer'
                    //     error={formErrors.customer_id === null ? false : true}
                    //     helperText={
                    //       formErrors.customer_id === null
                    //         ? ''
                    //         : 'Select a Customer'
                    //     }
                    //   />
                    // )}
                    renderInput={(params) => {
                      const get = { ...params }

                      get.InputProps = {
                        ...params.InputProps, 
                        startAdornment: !customerEdit ? (
                          <Tooltip title="Create New">
                            <IconButton size='small' onClick={() => {
                              props.setModalStatusHandler(true);
                              props.setModalTypeHandler("NewCustomer");
                              // if (add_click) {
                              //   addActionRef.current?.click()
                              //   setAdd_click(false)
                              // }
                            }}
                            >
                              <AddIcon/>
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Edit Customer">
                            <IconButton size="small" onClick={() => {
                              props.setModalStatusHandler(true)
                              props.setModalTypeHandler("EditCustomer")
                              props.setEditCustomerHandler(selectedCustomer)
                            }}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        )
                      }

                      return  <TextField {...get}
                      fullWidth={true}
                      required = {true}
                      variant="filled"
                      label="Select Customer"
                      inputRef={receivingTimeRef}
                      // placeholder="Select Cutomer"
                      error={formErrors.customer_id === null ? false : true}
                      helperText={formErrors.customer_id === null ? '' : 'Customer is required!'}

                    />
                    }}
                  />
                </Grid>
            
                {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                  style={{display: 'flex', alignItems: 'flex-end'}}
                 
                >
                  <FormControl
                    required={true}
                    error={formErrors.sale_status === null ? false : true}
                    component='fieldset'
                    fullWidth={true}
                    disabled ={(props.returnState || (props.status === 'edit' && [3, 4, 5, 6, 7].includes(formValues.sale_status))) ? true : false}
                    variant="filled"
                  >
                    <InputLabel>Sale Status</InputLabel>
                    <Select
                      style={{ marginBottom : '-4px' }}
                      name='sale_status'
                      label='Sale Status'
                      onChange={handleChange}
                      value={
                        formValues.sale_status === null 
                          ? ''
                          : formValues.sale_status
                      }
                       disabled={true}
                    >
                          {[{ name: 'Send SO', value: 1 },
                          { name: 'Delivery Challan', value: 8 },
                          { name: 'Create Invoice', value: 2 }].map(
                            (d) =>

                              <MenuItem value={d.value} key={d.value}>
                                {d.name}
                              </MenuItem>
                          )}
                          {/* <MenuItem
                            disabled={props.status === 'edit' ? true : false}
                            value={1}
                          >
                            Send SO
                          </MenuItem>
                          <MenuItem
                            disabled={
                              props.status === 'edit'
                                ? props.edit_id_data[0].sale_status === 1 ||
                                  props.edit_id_data[0].sale_status === 3
                                  ? false
                                  : props.edit_id_data[0].sale_status > 3
                                    ? true
                                    : false
                                : false
                            }
                            value={8}
                          >
                            {"Delivery Challan"}
                          </MenuItem>
                          <MenuItem
                            disabled={
                              props.status === 'edit'
                                ? props.edit_id_data[0].sale_status === 1 ||
                                  props.edit_id_data[0].sale_status === 3 ||
                                  props.edit_id_data[0].sale_status === 8
                                  ? false
                                  : props.edit_id_data[0].sale_status > 3 && props.edit_id_data[0].dc_number === null
                                    ? true
                                    : false
                                : false
                            }
                            value={2}
                          >
                            Create Invoice
                          </MenuItem> */}
                      {
                        (props.status === 'edit' && [3, 5, 6, 7].includes(formValues.sale_status)) && 
                        <MenuItem
                          disabled={
                            props.status === 'edit'
                              ? props.edit_id_data[0].sale_status === 1 ||
                                props.edit_id_data[0].sale_status === 3
                                ? false
                                : props.edit_id_data[0].sale_status > 4
                                ? true
                                : false
                              : props.status !== 'edit'
                              ? false
                              : true
                          }
                          value={3}
                        >
                          On Hold
                        </MenuItem>
                      }
                      {
                        (props.status === 'edit' && [3, 5,  6, 7].includes(formValues.sale_status)) && 
                        <MenuItem
                          disabled={
                            props.status !== 'edit'
                              ? true
                              : props.edit_id_data[0].sale_status <= 4
                              ? false 
                              : true
                              //props.edit_id_data[0].dc_number !== null? false
                          }
                          value={4}
                        >
                          Ready To Ship
                        </MenuItem>
                      }
                      {
                        (props.status === 'edit' && [3, 5,  6, 7].includes(formValues.sale_status)) && 
                        <MenuItem
                          disabled={
                            props.status !== 'edit'
                              ? true
                              : props.edit_id_data[0].sale_status <= 5
                              ? false : true
                              // props.edit_id_data[0].dc_number !== null 
                            // ? false :
                          }
                          value={5}
                        >
                          In Transit
                        </MenuItem>
                      }
                      {
                        (props.status === 'edit' && [3, 5,  6, 7].includes(formValues.sale_status)) && 
                        <MenuItem
                          disabled={
                            props.status !== 'edit'
                              ? true
                              : props.edit_id_data[0].sale_status <= 6 
                              ? false : props.edit_id_data[0].dc_number === null
                              ? true : false
                          }
                          value={6}
                        >
                          Delivered
                        </MenuItem>
                      }
                      {
                        (props.status === 'edit' && [3, 5,  6, 7].includes(formValues.sale_status)) && 
                        <MenuItem
                          disabled={
                            props.status === 'edit'
                              ? props.edit_id_data[0].sale_status === 1 ||
                                props.edit_id_data[0].sale_status === 3
                                ? false
                                : props.edit_id_data[0].sale_status > 4 && props.edit_id_data[0].sale_status < 8
                                ? props.edit_id_data[0].sale_status === 6 ? false : true
                                : false
                              : true
                          }
                          value={7}
                        >
                          Cancel
                        </MenuItem>
                      }
                    {/* </Select>
                    <FormHelperText>{formErrors.sale_status}</FormHelperText>
                  </FormControl>
                </Grid> */}
                <Grid
                  style={{display: 'flex', alignItems: 'flex-end'}}
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <FormControl
                    required={true}
                    disabled={props.status === 'edit' ? true : false}
                    error={formErrors.location_id === null ? false : true}
                    component='fieldset'
                    fullWidth={true}
                    variant='filled'
                  >
                    <InputLabel>Location</InputLabel>
                    <Select
                      style={{ marginBottom : '-4px' }}
                      name='location_id'
                      label='Location'
                      items={[
                        {label: 'Select one', value: ''},
                        {label: 'option 1', value: 'one'},
                        {label: 'option 2', value: 'two'},
                      ]}
                      onChange={handleChange}
                      value={
                        formValues.location_id === null
                          ? ''
                          : formValues.location_id
                      }
                    >
                      {props.stocklocation.filter((d)=> {
                          if(headerLocationId === 'null') return true
                          else return headerLocationId === d.location_id
                          }).map(
                        (s) =>
                          s.location_type_name !== "Scrap" && s.location_type_name !== "office"  && (
                            <MenuItem value={s.location_id} key={s.location_id}>
                              {s.location_name}
                            </MenuItem>
                          ),
                      )}
                    </Select>
                    <FormHelperText>{formErrors.location_id ? 'Location is required!' : ''}</FormHelperText>
                  </FormControl>
                             {/* <Autocomplete
                  value={formValues.location_id !== null? props.stocklocation.filter(f=>f.id === formValues.location_id)[0] : {name:''}}
                  name='location_id'
                  fullWidth={true}
                  onChange={(event, newValue) => {
                      handleChange({target : {name : 'location_id' , value : newValue.id}})
                  }}
                  options={_.uniqBy(props.location_id,'location_id')}
                  getOptionLabel={(option) => option.name}                
                  renderInput={(params) => <TextField {...params}
                   variant="outlined"
                    error={formErrors.location_id === null ? false : true} 
                     helperText={formErrors.location_id === null ? '' : formErrors.location_id}
                      label='Location'
                       required={ Location} />} */}
              

                </Grid>

                <Grid
                  style={{ display: 'flex', alignItems: 'flex-end' }}
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <LocalizationProvider dateAdapter={DataAdapter}>
                    <DateTimePicker
                      disableFuture
                      format="DD-MM-YYYY hh:mm A" // Match the input format to your data
                      disabled={props.status === 'edit'}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: 'filled',
                          inputProps: {
                            readOnly: true,
                          },
                        },
                      }}
                      value={formValues.sale_time
                        // ? dayjs(formValues.sale_time, "DD-MM-YYYY hh:mm A", true) // Use correct format
                        ? moment(formValues.sale_time, "YYYY-MM-DD HH:mm:ss").format("YYYY/MM/DD hh:mm A")
                        : moment()} // Default to current date if invalid
                      onChange={(newValue) => {
                        if (newValue) {
                          setStateHandler('sale_time', moment(newValue).format("YYYY-MM-DD HH:mm:ss"));
                        }
                      }}
                      label={formValues.sale_status == '2' ? "Invoice Date" : "SO Date"}
                    />

                  </LocalizationProvider>
                </Grid>

                <Grid
                  style={{display: 'flex', alignItems: 'flex-end'}}
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <TextField
                    onChange={handleChange}
                    disabled={props.status === 'edit' ? true : false}
                    // onBlur={handleChange}
                    required={false}
                    style={{}}
                    fullWidth={true}
                    placeholder='Reference'
                    label='Reference'
                    name='reference'
                    value={
                      formValues.reference === null ? '' : formValues.reference
                    }
                    color='primary'
                    multiline={false}
                    type='text'
                    regex=''
                    variant='filled'
                    x
                  />
                </Grid>

                <Grid
                  style={{display: 'flex', alignItems: 'flex-end'}}
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <TextField
                    fullWidth={true}
                    name='comment'
                    label='Comments'
                    multiline={true}
                    placeholder='Comment here...'
                    rows={1}
                    value={
                      formValues.comment === null ? '' : formValues.comment
                    }
                    variant='filled'
                    onChange={handleChange}
                    // onBlur={handleChange}
                    // required={undefined}
                    error={formErrors.comment === null ? false : true}
                    helperText={
                      formErrors.comment === null ? '' : formErrors.comment
                    }
                  />
                </Grid>
                <Grid
                  style={{display: 'flex', alignItems: 'flex-end'}}
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <TextField
                    fullWidth={true}
                    name='credit_days'
                    label='Credit Days'
                    value={ (formValues.invoiceCreditDays !== undefined && formValues.invoiceCreditDays !== null )  ? formValues.invoiceCreditDays : selectedCustomer?.credit_days !== undefined && selectedCustomer?.credit_days !== null 
                      ? selectedCustomer.credit_days 
                      : ''}
                    variant='filled'
                    disabled
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      endAdornment :hasCreditDaysEdit && (
                        <IconButton
                          onClick={handleOpenEdit}
                          edge="end"
                          disabled={!formValues.customer_id}
                        >
                          <EditIcon
                            sx={{
                              color: formValues.customer_id ? '#000' : 'rgba(0, 0, 0, 0.26)',
                            }}
                          />
                        </IconButton>
                      ),
                    }}
                  />
                </Grid>

                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                <TextField
                    fullWidth={true}
                    name='credit_value'
                    label='Credit Days Value'
                    value={((formValues.invoiceCreditValue !== undefined && formValues.invoiceCreditValue !== null ) ? formValues.invoiceCreditValue : selectedCustomer?.credit_value !== undefined && selectedCustomer?.credit_value !== null 
                      ? selectedCustomer.credit_value 
                      : '') || ''}
                    variant='filled'
                    disabled
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      endAdornment : hasCreditDaysValueEdit && (
                        <IconButton
                          onClick={handleOpenCreditDaysValueEdit}
                          edge="end"
                          disabled={!formValues.customer_id}
                        >
                          <EditIcon
                            sx={{
                              color: formValues.customer_id ? '#000' : 'rgba(0, 0, 0, 0.26)',
                            }}
                          />
                        </IconButton>
                      ),
                    }}
                  />
                </Grid>

                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <TextField
                      fullWidth={true}
                      name='sales_man'
                      label='SalesMan'
                      value={formValues.sales_man?.value || ''}
                      variant='filled'
                      disabled
                      InputLabelProps={{ shrink: true }}
                      InputProps={ { endAdornment: (selectedCustomer?.salesman_id !== null || selectedCustomer?.salesman_id !== undefined) && (
                          <IconButton
                            onClick={handleSalesmanEdit}
                            edge="end"
                            disabled={!formValues.customer_id}
                          >
                            <EditIcon
                              sx={{
                                color: formValues.customer_id ? '#000' : 'rgba(0, 0, 0, 0.26)',
                              }}
                            />
                          </IconButton>
                        )
                      }}
                    />
                </Grid>

                {/* { formValues.sale_status !== 1 && <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                  style={{display: 'flex', alignItems: 'flex-end'}}
                 
                >
                  <FormControl
                    required={true}
                    disabled={props.status === 'edit' ? true : false}
                    error={formErrors.sales_man === null ? false : true}
                    component='fieldset'
                    fullWidth={true}
                    variant='filled'
                  >
                    <InputLabel>Sales Man</InputLabel>
                    <Select
                      style={{ marginBottom : '-4px' }}
                      name='sales_man'
                      label='Sales Man'
                      onChange={handleChange}
                      value={formValues.sales_man || formValues.salesman_id || ''}

                    >
                      {customer_salesman.map(
                        (s) =>
                          
                            <MenuItem value={s.employee_id} key={s.id}>
                              {s.username}
                            </MenuItem>
                          
                      )}
                    </Select>
                    <FormHelperText>{formErrors.sales_man ? 'Sales Man is required!' : ''}</FormHelperText>
                  </FormControl>

                </Grid>
                } */}
                </Grid>
                </Grid>
                <Grid
                  size={{
                    lg: 2,
                    md: 2,
                    sm: 2,
                    xs: 2
                  }}></Grid>
                </Grid>
                {/* Shipping-Details */}
                { formValues.sale_status === 2 && 
                <>
              {/* <div style={headSx}>
                <div>
                  <Typography variant='h6' align='left' style={{ paddingBottom: '20px' }}>
                    Shipping Details
                  </Typography>
                </div>
              </div>
              <Grid
                style={{
                  alignItems: 'flex-end',
                  backgroundColor: '#FDFEFE',
                  margin: 0,
                }}
                // spacing={2}
                sx={widthSx}
                container
                direction='row'
                value='one'
              >
                <Grid container spacing={3} sx={{ mb: 1 }}>
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}
                    style={{ display: 'flex', alignItems: 'flex-end' }}
                   
                  >
                    <TextField
                      fullWidth={true}
                      name='ship_legal_name'
                      label='Legal Name'
                      multiline={true}
                      placeholder='Legal Name'
                      rows={1}
                      value={
                        formValues.ship_legal_name === null ? '' : formValues.ship_legal_name
                      }
                      variant='filled'
                      onChange={handleChange}
                      // onBlur={handleChange}
                      // required={undefined}
                      error={formErrors.ship_legal_name === null ? false : true}
                      helperText={
                        formErrors.ship_legal_name === null ? '' : formErrors.ship_legal_name
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}
                    style={{ display: 'flex', alignItems: 'flex-end' }}
                   
                  >
                    <TextField
                      fullWidth={true}
                      name='ship_address'
                      label='Address'
                      multiline={true}
                      placeholder='Address'
                      rows={1}
                      value={
                        formValues.ship_address === null ? '' : formValues.ship_address
                      }
                      variant='filled'
                      onChange={handleChange}
                      // onBlur={handleChange}
                      // required={undefined}
                      error={formErrors.ship_address === null ? false : true}
                      helperText={
                        formErrors.ship_address === null ? '' : formErrors.ship_address
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}
                    style={{ display: 'flex', alignItems: 'flex-end' }}
                   
                  >
                    <TextField
                      fullWidth={true}
                      name='ship_zip'
                      label='Pin Code'
                      multiline={true}
                      placeholder='Pin Code'
                      rows={1}
                      value={
                        formValues.ship_zip === null ? '' : formValues.ship_zip
                      }
                      variant='filled'
                      onChange={handleChange}
                      // onBlur={handleChange}
                      // required={undefined}
                      error={formErrors.ship_zip === null ? false : true}
                      helperText={
                        formErrors.ship_zip === null ? '' : formErrors.ship_zip
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} item>
  <TextField
    fullWidth
    name="ship_location"
    label="Location"
    multiline
    placeholder="Location"
    rows={1}
    value={formValues.ship_location || ''}
    variant="filled"
    onChange={(e) => handleChange({ ...formValues, ship_location: e.target.value })}
    error={!!formErrors.ship_location}
    helperText={formErrors.ship_location || ''}
  />
</Grid>

<Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}
  style={{ display: 'flex', alignItems: 'flex-end' }}
  item
>
  <TextField
    fullWidth
    name="ship_stcd"
    label="Stcd"
    multiline
    placeholder="Stcd"
    rows={1}
    value={formValues.ship_stcd || ''}
    variant="filled"
    onChange={(e) => handleChange(e)}
    error={Boolean(formErrors.ship_stcd)}
    helperText={formErrors.ship_stcd || ''}
  />
</Grid>

                </Grid>
              </Grid> */}

              <Grid
                size={{
                  lg: 10,
                  md: 10,
                  sm: 10,
                  xs: 10
                }}>
                <Grid container spacing={2}>

                    {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                      <Grid container spacing={2}> */}
                        {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                          <Typography variant='h6' align='left'>
                            Ship To
                          </Typography>
                        </Grid> */}

                        {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                          <Autocomplete
                            value={shipTo}
                            options = {cusArray?.find((c) => c.customer_id === formValues.customer_id)?.shipping_address || []}
                            getOptionLabel={(option) => `${option.address || ''} - ${option.city} - ${option.pin_code}`}
                            onChange={(event, newValue) => setShipTo(newValue)}
                            renderInput={(props) => (
                              <TextField
                                {...props}
                                variant = 'filled'
                                label = 'Ship To'
                              />
                            )}
                          />
                        </Grid> */}

                        {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                          <Autocomplete
                            value={shipTo}
                            options={cusArray?.find((c) => c.customer_id === formValues.customer_id)?.shipping_address || []}
                            getOptionLabel={(option) => `${option.address || ''} - ${option.city} - ${option.pin_code}`}
                            onChange={(event, newValue) => setShipTo(newValue)}
                            disabled={formValues?.customer_id == null}
                            renderInput={(params) => {
                              const showRequired = props.appConfigData.eInvoice === '1' &&
                              (untaxed() > 0
                                ? floatnum((untaxed() + untaxed('taxes') + tcsuntaxed('taxes')) - calculatetdsTaxAmount())
                                : 0) >= 50000;
                              const get = {...params}
                              get.InputProps = {
                                ...params.InputProps,
                                  startAdornment: (
                                    // <InputAdornment position="start">
                                      <Tooltip title="Create New">
                                        <IconButton
                                          size="small"
                                          edge="start"
                                          disabled={formValues?.customer_id == null}
                                          onClick={() => setShippingOpen(true)}
                                        >
                                          <AddIcon />
                                        </IconButton>
                                      </Tooltip>
                                    // </InputAdornment>
                                  )
                              }
                              return(
                              <TextField
                              {...get}
                              variant="filled"
                              label="Ship To"
                              required={showRequired}
                              error={showRequired && !shipTo}
                              helperText={
                                showRequired && !shipTo
                                  ? 'Shipping address is required'
                                  : ''
                              }
                                // InputProps={{
                                //   
                                // }}
                              />
                            )}}
                          />
                        </Grid> */}
                        {shippingOpen && <ShippingDetailPopup
                          type="bankdetail"
                          open={shippingOpen}
                          ApplyButton={shippingApply}
                          handleClose={shippingFilter}
                          formValues={shipformValues}
                          setFormValues={setShipFormValues}
                          formErrors={shipformErrors}
                          setFormErrors={setShipFormErrors}
                          status={status}
                          handleEdit={handleshippingEditSubmit}
                          setStatus={setStatus}
                          requiredFields={shiprequiredFields}
                          editshippingAddress={editShippingMode}
                          shippingData={props.shippingData}   
                          setShippingData={props.setShippingData}
                          customerData={customerData}
                        />}
                      {/* </Grid>
                    </Grid>  */}
                    
                    <Grid
                      style={{ marginTop : '10px' }}
                      size={{
                        lg: 9,
                        md: 8,
                        sm: 12,
                        xs: 12
                      }}>
                      <>
                        <Box sx={{ border: `1px solid ${theme.palette.primary.main}`, borderRadius: '5px', height: '100%', padding: 1 }}>
                          <Grid container>
                            <Grid
                              size={{
                                lg: 11,
                                md: 11,
                                sm: 11,
                                xs: 11
                              }}>
                              {((formValues.ship_legal_name && formValues.ship_address && formValues.ship_location && formValues.ship_zip) || selectedAddress?.shipping_id ) ? (
                                <>
                                <Typography variant="h6">Ship To: </Typography>
                                  {/* <Typography>{formValues.ship_legal_name}</Typography> */}
                                  <Typography>{formValues.ship_legal_name || selectedCustomer.company_name}</Typography>
                                  <Typography>
                                    {`${formValues.ship_address},`}
                                    <br /> 
                                    {`${formValues.ship_location} - ${formValues.ship_zip}`}
                                  </Typography>
                                  <Typography>
                                    {`Contact: ${formValues.ship_person_name||selectedCustomer.first_name || '-'} ${selectedCustomer.last_name || ''}, Phone Number: ${
                                      formValues.ship_phone_number || selectedCustomer.phone_number || '-'}` || '-'}
                                  </Typography>
                                  <Typography>
                                    {`GSTIN: ${formValues.ship_gstin||selectedCustomer.tax_id || '-'}` || '-'}
                                  </Typography>
                                </>
                              ) : (
                                formValues.customer_id && <Typography color="textSecondary" fontStyle="italic">No shipping address provided.</Typography>
                              )}
                            </Grid>

                            <Grid
                              size={{
                                lg: 1,
                                md: 1,
                                sm: 1,
                                xs: 1
                              }}>
                              {isAdmin && (
                                <Box display="flex" justifyContent="flex-end">
                                  <IconButton
                                    onClick={handleOpenDialog}
                                    disabled={!formValues.customer_id}
                                  >
                                    <EditIcon
                                      sx={{
                                        color: formValues.customer_id ? '#000' : 'rgba(0, 0, 0, 0.26)',
                                      }}
                                    />
                                  </IconButton>
                                
                                </Box>
                              )}
                            </Grid>
                          </Grid>
                          
                        </Box>
                      </>
                    </Grid>




                  </Grid>
                </Grid>

              {/* <div style={headSx}>
                <div>
                  <Typography variant='h6' align='left'>
                    Ship To
                  </Typography>
                </div>
              </div>
              <Grid
                style={{
                  alignItems: 'flex-end',
                  backgroundColor: '#FDFEFE',
                  margin: 0,
                }}
                spacing={2}
                sx={widthSx}
                container
                direction='row'
                value='one'
              >
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                  <Autocomplete
                    value={shipTo}
                    options = {cusArray?.find((c) => c.customer_id === formValues.customer_id)?.shipping_address || []}
                    getOptionLabel={(option) => `${option.address || ''} - ${option.city} - ${option.pin_code}`}
                    onChange={(event, newValue) => setShipTo(newValue)}
                    renderInput={(props) => (
                      <TextField
                        {...props}
                        variant = 'filled'
                        label = 'Ship To'
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 8, lg: 8 }}>
                  <Box sx={{border: `1px solid ${theme.palette.primary.main}`, borderRadius: '5px', minHeight: '20px'}}>
                    <Typography variant='h6'>Ship To: </Typography>
                    {
                      (formValues.disp_company_name && formValues.disp_address && formValues.disp_location && formValues.disp_zip) && 
                      <>
                        <Typography>{formValues.disp_company_name || ''}</Typography>
                        <Typography>{`${formValues.disp_address}, ${formValues.disp_location} - ${formValues.disp_zip}`}</Typography>
                      </>
                    }
                  </Box>
                </Grid>
              </Grid> */}

              {/* <Grid
                style={{
                  alignItems: 'flex-end',
                  backgroundColor: '#FDFEFE',
                  margin: 0,
                }}
                // spacing={2}
                sx={widthSx}
                container
                direction='row'
                value='one'
              >
                <Grid container spacing={3} sx={{ mb: 1 }}>
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}
                    style={{ display: 'flex', alignItems: 'flex-end' }}
                   
                  >
                    <TextField
                      fullWidth={true}
                      name='disp_company_name'
                      label='Name of the company'
                      multiline={true}
                      placeholder='Name of the company'
                      rows={1}
                      value={
                        formValues.disp_company_name === null ? '' : formValues.disp_company_name
                      }
                      variant='filled'
                      onChange={handleChange}
                      // onBlur={handleChange}
                      // required={undefined}
                      error={formErrors.disp_company_name === null ? false : true}
                      helperText={
                        formErrors.disp_company_name === null ? '' : formErrors.disp_company_name
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}
                    style={{ display: 'flex', alignItems: 'flex-end' }}
                   
                  >
                    <TextField
                      fullWidth={true}
                      name='disp_address'
                      label='Address'
                      multiline={true}
                      placeholder='Address'
                      rows={1}
                      value={
                        formValues.disp_address === null ? '' : formValues.disp_address
                      }
                      variant='filled'
                      onChange={handleChange}
                      // onBlur={handleChange}
                      // required={undefined}
                      error={formErrors.disp_address === null ? false : true}
                      helperText={
                        formErrors.disp_address === null ? '' : formErrors.disp_address
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}
                    style={{ display: 'flex', alignItems: 'flex-end' }}
                   
                  >
                    <TextField
                      fullWidth={true}
                      name='disp_zip'
                      label='Pin Code'
                      multiline={true}
                      placeholder='Pin Code'
                      rows={1}
                      value={
                        formValues.disp_zip === null ? '' : formValues.disp_zip
                      }
                      variant='filled'
                      onChange={handleChange}
                      // onBlur={handleChange}
                      // required={undefined}
                      error={formErrors.disp_zip === null ? false : true}
                      helperText={
                        formErrors.disp_zip === null ? '' : formErrors.ship_zip
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}
  style={{ display: 'flex', alignItems: 'flex-end' }}
  item
>
  <TextField
    fullWidth
    name="disp_location"
    label="Location"
    multiline
    placeholder="Location"
    rows={1}
    value={formValues.disp_location || ''}
    variant="filled"
    onChange={(e) => handleChange(e)}
    error={Boolean(formErrors.disp_location)}
    helperText={formErrors.disp_location || ''}
  />
</Grid>

<Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}
  style={{ display: 'flex', alignItems: 'flex-end' }}
  item
>
  <TextField
    fullWidth
    name="disp_stcd"
    label="Stcd"
    multiline
    placeholder="Stcd"
    rows={1}
    value={formValues.disp_stcd || ''}
    variant="filled"
    onChange={(e) => handleChange(e)}
    error={Boolean(formErrors.disp_stcd)}
    helperText={formErrors.disp_stcd || ''}
  />
</Grid>

                </Grid>
              </Grid> */}

              {/* <div style={headSx}>
                <div>
                  <Typography variant='h6' align='left' style={{ paddingBottom: '20px' }}>
                    Transaction Details
                  </Typography>
                </div>
              </div>
              <Grid
                style={{
                  alignItems: 'flex-end',
                  backgroundColor: '#FDFEFE',
                  margin: 0,
                }}
                // spacing={2}
                sx={widthSx}
                container
                direction='row'
                value='one'
              >
                <Grid container spacing={3} sx={{ mb: 1 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}
                    style={{ display: 'flex', alignItems: 'flex-end' }}
                   
                  >
                    <TextField
                      fullWidth={true}
                      name='trans_id'
                      label='TransId'
                      multiline={true}
                      placeholder='Transcation Id'
                      rows={1}
                      value={
                        formValues.trans_id === null ? '' : formValues.trans_id
                      }
                      variant='filled'
                      onChange={handleChange}
                      // onBlur={handleChange}
                      // required={undefined}
                      error={formErrors.trans_id === null ? false : true}
                      helperText={
                        formErrors.trans_id === null ? '' : formErrors.trans_id
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}
                    style={{ display: 'flex', alignItems: 'flex-end' }}
                   
                  >
                    <TextField
                      fullWidth={true}
                      name='trans_name'
                      label='TransName'
                      multiline={true}
                      placeholder='Transcation Name'
                      rows={1}
                      value={
                        formValues.trans_name === null ? '' : formValues.trans_name
                      }
                      variant='filled'
                      onChange={handleChange}
                      // onBlur={handleChange}
                      // required={undefined}
                      error={formErrors.trans_name === null ? false : true}
                      helperText={
                        formErrors.trans_name === null ? '' : formErrors.trans_name
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}
                    style={{ display: 'flex', alignItems: 'flex-end' }}
                   
                  >
                    <TextField
                      fullWidth={true}
                      name='trans_doc_no'
                      label='TransDoc'
                      multiline={true}
                      placeholder='Transcation DocumentNo'
                      rows={1}
                      value={
                        formValues.trans_doc_no === null ? '' : formValues.trans_doc_no
                      }
                      variant='filled'
                      onChange={handleChange}
                      // onBlur={handleChange}
                      // required={undefined}
                      error={formErrors.trans_doc_no === null ? false : true}
                      helperText={
                        formErrors.trans_doc_no === null ? '' : formErrors.trans_doc_no
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}
                    style={{ display: 'flex', alignItems: 'flex-end' }}
                   
                  >
                    <TextField
                      fullWidth={true}
                      name='trans_mode'
                      label='TransMode'
                      multiline={true}
                      placeholder='TransMode'
                      rows={1}
                      value={
                        formValues.trans_mode === null ? '' : formValues.trans_mode
                      }
                      variant='filled'
                      onChange={handleChange}
                      // onBlur={handleChange}
                      // required={undefined}
                      error={formErrors.trans_mode === null ? false : true}
                      helperText={
                        formErrors.trans_mode === null ? '' : formErrors.trans_mode
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}
                    style={{ display: 'flex', alignItems: 'flex-end' }}
                   
                  >
                    <TextField
                      fullWidth={true}
                      name='distance'
                      label='Distance'
                      multiline={true}
                      placeholder='Distance'
                      rows={1}
                      value={
                        formValues.distance === null ? '' : formValues.distance
                      }
                      variant='filled'
                      onChange={handleChange}
                      // onBlur={handleChange}
                      // required={undefined}
                      error={formErrors.distance === null ? false : true}
                      helperText={
                        formErrors.distance === null ? '' : formErrors.distance
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}
                    style={{ display: 'flex', alignItems: 'flex-end' }}
                   
                  >
                    <TextField
                      fullWidth={true}
                      name='veh_no'
                      label='VehNo'
                      multiline={true}
                      placeholder='VehNo'
                      rows={1}
                      value={
                        formValues.veh_no === null ? '' : formValues.veh_no
                      }
                      variant='filled'
                      onChange={handleChange}
                      // onBlur={handleChange}
                      // required={undefined}
                      error={formErrors.veh_no === null ? false : true}
                      helperText={
                        formErrors.veh_no === null ? '' : formErrors.veh_no
                      }
                    />
                  </Grid>

                </Grid>
              </Grid> */}
              </>}

              {/* Material-Table */}
              <Grid
                style={{margin: '10px 0'}}
                size={{
                  xs: 12,
                  sm: 12,
                  md: 12,
                  lg: 12
                }}>
                <style>
                  {`
                      ::-webkit-scrollbar-button {
                          display : none
                      }
                      ::-webkit-scrollbar {
                          width : 10px
                      }
                      ::-webkit-scrollbar-thumb {
                          background-color : #888
                          border-radius : 10px
                      }
                      ::-webkit-scrollbar-thumb:hover {
                          background-color : #555
                      }
                  `}
                </style>

                
                <MaterialTable
                  options={{
                    headerStyle,
                    cellStyle,
                    paging: false,
                    maxBodyHeight : '500px',
                    minBodyHeight : '500px',
                    exportButton:true,
                    showTitle: true,
                    // filtering: false,
                    // maxBodyHeight: '60vh',
                    actionsColumnIndex: -1,
                       // search: formValues.sale_status !== 4 ? true : false,
                    exportMenu: formValues.sale_id && formValues.sale_status  !== 4 ? [
                      {
                        label: 'Export PDF',
                        exportFunc: (cols, datas) =>
                          ExportPdf(cols, datas, 'SalesItemData'),
                      },
                      {
                        label: 'Export CSV',
                        exportFunc: (cols, datas) =>
                          ExportCsv(cols, datas, 'SalesItemData'),
                      },
                    ] : [],
                    // selection: props.returnState
                  }}
                  components={{
                    Action: (props) => {
                      console.log(props, 'djefjf')
                      if (props.action.tooltip === 'Cancel') {
                        return (
                          <div
                            ref={cancelActionRef}
                            onClick={() => {
                              setQty(0);
                              setSubTotal("0.00");
                              setTouchedFields({});
                              props.action.onClick();
                            }}
                          >
                            <Tooltip title='Cancel'>
                              <IconButton>
                                <Close style={{ color: 'black' }} />
                              </IconButton>
                            </Tooltip>
                          </div>
                        );
                      }
                      
                      if (props.action.tooltip === 'Edit All') {
                        return (
                          <div
                            ref={bulkEditRef}
                            hidden= {formValues.sale_status  === 4 ? true : false}
                            onClick={!editDiasble ? props.action.onClick : undefined}
                          >
                            <Tooltip title='Edit All'>
                              <IconButton>
                                <Edit style={{color: 'black'}} />
                              </IconButton>
                            </Tooltip>
                          </div>
                        );
                      }

                      if (
                        typeof props.action === typeof Function ||
                        props.action.tooltip !== 'Add'
                      ) {
                        return <MTableAction {...props} />;
                      } else {
                        return (
                          <div
                            ref={addActionRef}
                            hidden= {formValues.sale_status  === 4 ? true : false}
                            onClick={props.action.onClick}
                          />
                        );
                      }
                    },
                    Toolbar: tableProps => (
                      <>
                        <Grid container style={{display: 'flex', width: '100%', alignItems: 'center'}}>
                        <Grid
                          style={{width: '100%'}}
                          size={{
                            lg: formValues.sale_status === 1 ? 10 : 8,
                            md: formValues.sale_status === 1 ? 8 : 6,
                            sm: formValues.sale_status === 1 ? 8 : 6,
                            xs: 12
                          }}>
                          {/* style={{display: "flex",justifyContent: "flex-end",alignItems: "center"}} */}
                          <MTableToolbar {...tableProps} />
                          </Grid>
                          {
                            formValues.sale_status !== 1 &&
                            <Grid
                              display={'flex'}
                              justifyContent={'center'}
                              size={{
                                lg: 2,
                                md: 4,
                                sm: 4,
                                xs: 12
                              }}>
                                <TextField
                                  value={lotNumberSearch}
                                  label='Barcode / Lot Number'
                                  onChange={handleLotNumberSearch}
                                  error={lotNumberMessage.error}
                                  helperText={lotNumberMessage.message}
                                />
                            </Grid>
                          }
                          <Grid
                            display={'flex'}
                            justifyContent={'center'}
                            size={{
                              lg: 2,
                              md: 4,
                              sm: 4,
                              xs: 12
                            }}>
                          
                              <FormControl fullWidth >
                                <InputLabel id="price-list-select-label">Price List</InputLabel>
                                <Select
                                  required={true}
                                  hidden={formValues.sale_status === 4 ? true : false}
                                  sx={{ minWidth: '100%' }}
                                  size={'small'}
                                  labelId="demo-simple-select-label"
                                  id="price-list-select"
                                  value={
                                    formValues.price_list === null 
                                      ? defaultPriceList.id
                                      : props.price_list?.length >0 && props.price_list?.filter(pList => pList.id === formValues.price_list)[0]?.id
                                  } 
                                  name='price_list'
                                  label="Price List"
                                  error={formErrors.price_list === null ? false : true}
                                  helpertext={formErrors.price_list}
                                  onChange={handleChange}
                                >
                                  {props.price_list.map(pList => (
                                    <MenuItem key={pList.id} value={pList.id}>{pList.price_list_name}</MenuItem>
                                  ))}
                                  
                                </Select>
                              </FormControl>
                          </Grid>
                      </Grid>
                      </>
                    ),
                    // Pagination : props => (
                    //   <div style={{ display : 'flex', justifyContent : 'flex-end', alignItems : 'center', padding : '1px 16px' }}>
                    //     <Typography variant='h6'>
                    //       {`Toatl Quantity : ${sales_items.reduce((count, item) => count + parseInt(item.quantity), 0) }`}
                    //     </Typography>
                    //   </div>
                    // )
                  }}
                  actions={[
                    {
                      icon: () => (
                        <UploadFileIcon >
                        <div style={{display: 'flex'}}>
                        </div>
                        </UploadFileIcon>
                      ),
                      tooltip: 'upload',
                      isFreeAction: true,
                      disabled: formValues.sale_status === 1,
                      onClick:() => handleFilter(true)
                    },
                    {
                      icon: 'add',
                      tooltip: 'add',
                      isFreeAction: true,
                      onClick: (event, rowData) => {
                        addActionRef.current?.click();
                        setAdd_click(!add_click);
                      },
                      disabled: salesApprovals[0]?.status === "Pending" || (props.status === 'edit' && props.edit_id_data[0]?.status === 'Approved') ? true : false
                    },
                  ]}
                  // onSelectionChange={(rows) => setreturnItems(rows)}
                  columns={[
                    {
                      field: 'name',
                      title: 'Product',
                      cellStyle: {
                        whiteSpace: 'wrap',
                        fontSize:cellStyle.fontSize
                       },
                      width:'30%',
                      render: (rowData) => {
                        if(!props.returnState){
                          return (
                            <Grid container>
                              <Grid size={12}>
                                <Typography sx={{fontSize: '11px'}}>
                                  {rowData.name}
                                </Typography>
                              </Grid>
                              <Grid size={12}>
                                <Grid container display='flex' justifyContent='space-between' spacing={3}>
                                  <Grid size={6}>
                                    <Typography sx={{fontSize: '11px'}}>
                                      {`Desc: ${rowData.description || '-'}`}
                                    </Typography>
                                  </Grid>
                                  <Grid size={6}>
                                    <Typography sx={{fontSize: '11px'}}>
                                      {`HSN: ${rowData.hsn_code || '-'}`}
                                    </Typography>
                                  </Grid>
                                </Grid>
                              </Grid>
                            </Grid>
                          );
                        }
                        else{
                          return(
                            <Typography sx={{fontSize: '11px'}}>
                              {rowData.name}
                            </Typography>
                          )
                        }
                      },
                      // validate: (rowData) => (!rowData.name ? false : true),
                      editComponent: (Props) => {
                        const [localHsn, setLocalHsn] = useState(Props.rowData?.hsn_code || '')
                        const [localDesc, setLocalDesc] = useState(Props.rowData?.description || '')
                        const [hsnError, setHsnError] = useState('');

                        const validateHsn = (value) => {
                          const validPattern = /^(?!0+$)([0-9]{4}|[0-9]{6}|[0-9]{8})$/;
                          if (value && !validPattern.test(value)) {
                            setHsnError('Enter a valid 4, 6, or 8 digit HSN Code (not all zeroes)');
                          } else {
                            setHsnError('');
                          }
                        };

                        const handleHsnChange = (e) => {
                          const value = e.target.value;

                          if (!/^\d*$/.test(value) || value.length > 8) return;

                          setLocalHsn(value);
                          Props.onRowDataChange({
                            ...Props.rowData,
                            hsn_code: value
                          });

                          const validPattern = /^(?!0+$)([0-9]{4}|[0-9]{6}|[0-9]{8})$/;
                          if (value && !validPattern.test(value)) {
                            setHsnError('Enter a valid 4, 6, or 8 digit HSN Code (not all zeroes)');
                          } else {
                            setHsnError('');
                          }
                        };

                        useEffect(() => {
                          validateHsn(localHsn);
                        }, [localHsn]);

                        useEffect(() => {
                          if (rowdata && Object.keys(rowdata).length > 0) {
                            const updatedProduct = productByType.find(
                              (e) => e.item_id === rowdata.item_id
                            );
                       
                            // Compare to see if there's any actual change before updating
                            const isDifferent =
                              updatedProduct &&
                              JSON.stringify(updatedProduct) !== JSON.stringify(productDetails); // compare against current
                       
                            if (updatedProduct && isDifferent) {
                              const updatedRow = productAdding(updatedProduct, true);
                              setRowData(updatedRow); // update only if changed
                              Props.onRowDataChange(updatedRow)
                            }
                          }
                        }, [productByType]);

                        return (
                          <>
                            <ProductSelect
                              name='prodct'
                              // label='Product'
                              value={{name: Props.value ? Props.value : ''}}
                              product={locationWiseProduct}
                              getOptionLabel={(option) => option.name}
                              interSection={sales_items}
                              filterOptions={filterOptions}
                              disabled={!formValues.location_id || props.returnState ? true : false}
                              edit={Props.value}
                              onChange={(e, v) => { 
                                if (v !== null) {
                                  const updatedProduct = productAdding(v, true);
                                  const updatedRow = {
                                    ...Props.rowData,
                                    ...updatedProduct,
                                  };
 
                                  Props.onRowDataChange(updatedRow);
 
                                  const index = Props.rowData?.tableData?.id;
                                  if (typeof index === 'number') {
                                    const updatedSalesItems = [...sales_items];
                                    updatedSalesItems[index] = updatedRow;
                                    setSalesItems(updatedSalesItems);
                                  }
 
                                  setTimeout(() => {
                                    document.querySelector(`[name="quantity"]`)?.focus();
                                  }, 100);
                                } else {
                                  Props.onRowDataChange({});
                                }
                              }}
                              //error={formValues.customer_id === null ? true : false}
                              error = 
                              // {formValues.customer_id === null ? true : false}
                              {
                              props.value !== undefined ?
                              props.error : false
                            }   
      
                              addIconClick={() => {
                                props.setModalStatusHandler(true);
                                props.setModalTypeHandler('product');
                                if (add_click) {
                                  addActionRef.current?.click();
                                  setAdd_click(false);
                                }
                              }}
                              editIconClick={() => {
                                props.setModalStatusHandler(true);
                                props.setModalTypeHandler('updateProduct');
                                props.setEditProductDataHandler([productDetails]);
                              }}
                            />
                            {
                              !props.returnState &&
                              <Grid container spacing={2} display='flex' justifyContent='space-between'>
                                <Grid size={6}>
                                  {/* <Typography>{`HSN Code: ${Props.hsn_code}`}</Typography> */}
                                  <TextField
                                    value={localDesc || ''}
                                    label='Desc'
                                    variant='standard'
                                    onChange={e => {
                                      setLocalDesc(e.target.value)
                                      Props.onRowDataChange({
                                        ...Props.rowData,
                                        description: e.target.value
                                      })
                                      }}
                                    />
                                  </Grid>

                                  <Grid size={6}>
                                    {/* <Typography>{`Description: ${Props.description}`}</Typography> */}
                                    <TextField
                                      value={localHsn || ''}
                                      label='HSN'
                                      variant='standard'
                                      onChange={handleHsnChange}
                                      error={!!hsnError}
                                      helperText={hsnError}
                                      inputProps={{
                                        maxLength: 8,
                                        inputMode: 'numeric'
                                      }}
                                    />
                                  </Grid>
                                </Grid>
                            }
                          </>
                        );
                      }
                    },
                    // {
                    //   title: 'Description',
                    //   field: 'description',
                    //   cellStyle: {
                    //     whiteSpace: 'wrap',
                    //     fontSize:cellStyle.fontSize
                    //    },
                    //   width:'50px',
                    //   editComponent: (props) => (
                    //     <Chip sx={{width:'100px'}} label={props.rowData.description} />
                    //   ),
                    // },
                    {
                      title: 'Sold Qty',
                      field: 'soldQuantity',
                      hidden : !props.returnState,
                      editable: 'never',
                      cellStyle: {
                        whiteSpace: 'wrap',
                        fontSize:cellStyle.fontSize,
                       },
                      width:'50px',
                    },
                    {
                      title: props.returnState ? 'Return Qty' : 'Qty',
                      field: 'quantity',
                      cellStyle: {
                        whiteSpace: 'wrap',
                        fontSize:cellStyle.fontSize

                       },
                      width:'10%',
                      render: (rowData) => {
                        const unit = productDetails?.unitName || '';
                        // console.log(rowData, 'rowData')
                        if(!props.returnState){
                          return (
                            <Grid container>
                              <Grid size={12}>
                                <Typography sx={{fontSize: '11px'}}>
                                  {`${rowData.quantity} ${unit}`}
                                </Typography>
                              </Grid>
                              <Grid size={12}>
                                <Typography sx={{fontSize: '11px'}}>
                                  {`Avail Qty: ${rowData.available_quantity || 0}`}
                                </Typography>
                              </Grid>
                            </Grid>
                          );
                        }
                        else{
                          return(
                            <Typography sx={{fontSize: '11px'}}>
                              {`${rowData.quantity} ${unit}`}
                            </Typography>
                          )
                        }
                      },
                      
                      
                      validate: (rD) =>
                      rD.quantity <=0 ? false  :
                        props.returnState
                          ? rD.quantity > rD.returnQuantity
                            ? false
                           :true
                          : ( formValues.sale_status !== 2 || formValues.sale_status !== 8 ) 
                          ? true
                          :  true,
                          editComponent: (prop) => {
                            const [localQty, setLocalQty] = useState(prop.value === 0 ? '' : prop.value);
                            const lotRes = LotRes(prop.rowData, localQty); 
                            const availableQty = lotRes;
                            const showError = prop.rowData.is_serialized === 0 ? (localQty > availableQty) : false;
                          
                            // const handleSave = () => {
                            //   const value = parseInt(localQty) || 0;
                              
                            //   prop.onRowDataChange({
                            //     ...prop.rowData,
                            //     quantity: value,
                            //     sub_total: singleTax(
                            //       prop.rowData.item_unit_price,
                            //       value,
                            //       prop.rowData.taxes
                            //     ).toFixed(2),
                            //   });
                            // };
                          
                            return (
                              <TextField
                                variant='filled'
                                name='quantity'
                                fullWidth
                                type='text'
                                style={{paddingBottom: '35%'}}
                                value={localQty}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 0;
                                  // if (/^\d*$/.test(value)) {
                                    setLocalQty(value);
                                    prop.onRowDataChange({
                                      ...prop.rowData,
                                      quantity: value,
                                      sub_total: singleTax(
                                        prop.rowData.item_unit_price,
                                        value,
                                        prop.rowData.taxes
                                      ).toFixed(2),
                                    });
                                    // setQty(value)
                                  // }
                                }}
                                // onBlur={handleSave}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position='end' sx={{ alignSelf: 'flex-end', mb: '13px' }}>
                                      <span>{productDetails.unitName}</span>
                                    </InputAdornment>
                                  )
                                }}
                                error={showError && !props.returnState}
                                helperText={
                                  showError && !props.returnState
                                    ? `Available ${availableQty} Qty`
                                    : ''
                                }
                              />
                            );
                          },
                          
                    },
                    {
                      title: 'Returned Qty',
                      field: 'return_quantity',
                      hidden : !props.returnState,
                      editable: 'never',
                      cellStyle: {
                        whiteSpace: 'wrap',
                        fontSize:cellStyle.fontSize

                       },
                      width:'50px',
                    },
                    {
                      field: 'item_unit_price',
                      title: 'Selling Cost',
                      cellStyle: {
                        whiteSpace: 'wrap',
                        fontSize:cellStyle.fontSize

                       },
                      width:'15%',
                      validate: (rData) =>
                        rData.item_unit_price <= 0 ||
                        isNaN(rData.item_unit_price)
                          ? false
                          : true,
                      editComponent: (prop) => (
                        <TextField
                        variant='filled'
                        id="salesId"
                        fullWidth
                          //label="Length"
                          // ref={inputRef}
                          disabled = {props.returnState ? true : false}
                          placeholder='Unit Price'
                          name='item_unit_price'
                          value={prop.value}
                          style={{paddingBottom: '22%'}}
                          // sx={{width:"100px"}}
                          type='number'
                          // onBlur={(e) => {
                          //   if(
                          //       [2,8].includes(formValues.sale_status) &&
                          //       prop.rowData.quantity && 
                          //       e.target.value &&
                          //       prop.rowData.is_serialized === 1
                          //     ){
                          //     handleItemPopup(prop.rowData, prop.onRowDataChange)
                          //   }
                          // }}
                          onChange={(e) =>
                            prop.onRowDataChange({
                              ...prop.rowData,
                              item_unit_price: e.target.value,
                              sub_total: singleTax(
                                e.target.value,
                                prop.rowData.quantity,
                                prop.rowData.taxes,
                              ).toFixed(2),
                            })
                          }
                          error={
                            prop.value !== undefined ? prop.error : false
                          }
                          // helperText = {props.error  ? "Amount Required" : ''}
                        />
                      ),
                    },
                    {
                      title: "Taxes",
                      field: "taxes_name",
                      cellStyle: {
                        whiteSpace: "wrap",
                        fontSize: cellStyle.fontSize,
                      },
                      width: "10%",
                      editable: false,
                      // editComponent: (props) => (
                      //   <TextField
                      //     variant="filled"
                      //     value={props.value || ""}
                      //     onChange={(e) => e.preventDefault()}
                      //     sx={{ width: "100%" }}
                      //   />
                      // ),
                    },
                    

                    {
                      field: "sub_total",
                      title: "Subtotal",
                      cellStyle: {
                        textAlign: "center",
                        fontSize: cellStyle.fontSize,
                        // marginLeft: "20px",
                      },
                      width: "15%",
                      editable: false,
                      // validate: (rowData) => rowData.sub_total && parseFloat(rowData.sub_total) > 0,
                      // editComponent: (props) => {
                      //   const rowId = props.rowData?.tableData?.id ?? props.rowData?.id ?? Math.random();
                      
                      //   return (
                      //     <TextField
                      //       variant="filled"
                      //       value={props.value === "0.00" ? '' : props.value}
                      //       onChange={(e) => {
                      //         let value = e.target.value;
                      
                      //         if (value === "" || isNaN(value)) {
                      //           value = "0.00";
                      //         }
                      
                      //         setSubTotal(value);
                      //         props.onRowDataChange({ ...props.rowData, sub_total: value });
                      
                      //         setTouchedFields((prev) => ({ ...prev, [rowId]: true }));
                      //       }}
                      //       sx={{ width: "100%" }}
                      //       error={
                      //         touchedFields[rowId] &&
                      //         (!props.value || parseFloat(props.value) <= 0)
                      //       }
                      //       helperText={
                      //         touchedFields[rowId] &&
                      //         (!props.value || parseFloat(props.value) <= 0)
                      //           ? "Subtotal required"
                      //           : ""
                      //       }
                      //     />
                      //   );
                      // }
                      
                    },
                    {
                      field: 'serial_number',
                      title: 'Serial Number',
                      cellStyle: {
                        whiteSpace: 'wrap',
                        fontSize:cellStyle.fontSize,

                       },
                      width:'10%',
                      hidden: formValues.sale_status !== 2 && formValues.sale_status !== 8 && !props.returnState,
                      render: (rowData) => (
                        <Stack flexDirection='row' gap={5}>
                            { rowData.is_serialized === 1 &&
                            <Tooltip title={rowData.is_serialized === 1 ? 'Serial Number' : ''} >
                            <Icon
                            style={{
                              color:
                                // rowData.is_serialized === 1
                                //   ? Number(rowData.quantity) <=
                                //     productByType.filter(
                                //       (f) => f.item_id === rowData.item_id,
                                //     )[0].lots.length
                                //     ? rowData.lots.length > 0
                                //       ? 'green'
                                //       : 'red'
                                //     : rowData.qty_per_pack >=
                                //       Number(rowData.quantity)
                                //     ? 'green'
                                //     : 'red'
                                //   : 'green',
                                rowData.is_serialized === 1 &&
                              (rowData.quantity) > 0
                                ? Number(rowData.quantity) /
                                    1 ===
                                  rowData.lots.length
                                  ? 'green'
                                  : 'red'
                                : 'grey',
                              display: props.returnState
                                ? rowData.is_serialized === 0
                                  ? 'none'
                                  : 'block'
                                : ![2,8].includes(formValues.sale_status)
                                ? 'none'
                                : 'block',
                              
                            }}
                            onClick={()=>handleItemPopup(rowData, null, 'nonEdit')}
                          >
                            toc
                          </Icon>
                          </Tooltip>
                          }
                          {
                            rowData.is_serialized === 1 &&
                            <Tooltip title='View'>
                              <Icon
                                onClick={() => handleViewSerialNumber(rowData)}
                                >visibility</Icon>
                            </Tooltip>
                          }
                        </Stack>
                      ),
                      // validate: (rowData) => (!rowData ? false : true),
                      validate: (rowData) => {
                        // console.log(rowData,"lotrowData");

                        // if (rowData.is_serialized === 1) {
                        //   const quantity = Number(rowData.quantity);
                        //   const lots = rowData.lots;

                        //   if (!Array.isArray(lots) || lots.length !== quantity) {
                        //     return false;
                        //   }

                        //   const hasEmptyLot = lots.some(
                        //     (lot) => !lot.lot_number || lot.lot_number.trim() === ''
                        //   );

                        //   if (hasEmptyLot) {
                        //     return false;
                        //   }
                        // }
                        return true;
                      },
                      
                      editComponent: ({ rowData, columnDef: {tableData}, onRowDataChange }) => (

                        <Tooltip title={rowData.is_serialized === 1 ? 'serial number' : ''} >
                        { rowData.is_serialized === 1 &&
                        <Icon
                        style={{
                          color:
                            // rowData.is_serialized === 1
                            //   ? Number(rowData.quantity) <=
                            //     productByType.filter(
                            //       (f) => f.item_id === rowData.item_id,
                            //     )[0].lots.length
                            //     ? rowData.lots.length > 0
                            //       ? 'green'
                            //       : 'red'
                            //     : rowData.qty_per_pack >=
                            //       Number(rowData.quantity)
                            //     ? 'green'
                            //     : 'red'
                            //   : 'green',
                            rowData.is_serialized === 1 &&
                          (rowData.quantity) > 0
                            ? Number(rowData.quantity) /
                                1 ===
                              rowData.lots.length
                              ? 'green'
                              : 'red'
                            : 'grey',
                          display: props.returnState
                            ? rowData.is_serialized === 0
                              ? 'none'
                              : 'block'
                            : ![2,8].includes(formValues.sale_status)
                            ? 'none'
                            : 'block',
                           
                        }}
                        onClick={()=>{
                          console.log(rowData,"rowData");
                          
                          handleItemPopup({...rowData, tableData: {...tableData, id: rowData.isEntered === 1 ? tableData.id : null},quantity:rowData.quantity}, onRowDataChange)}
                        }
                      >
                        toc
                      </Icon>
                      }
                      </Tooltip>
                     
                      ),
                    },
                  ]}
                  
                  data={sales_items || [].map((m) => {
                      const {tableData, ...rest} = m;
                      return rest;
                    })
                  }
                  editable={{
                    isEditable: (rowData) =>
                      props.returnState ||
                      formValues.sale_status === 1 ||
                      formValues.sale_status === 2 ||
                      formValues.sale_status === 8 || 
                      formValues.sale_status === 3,
                    isDeletable: (delRow) => props.returnState || [1,2,8].includes(formValues.sale_status),
                    onRowAdd: (newData) =>
                      new Promise((resolve, reject) => {
                        setTimeout(() => {
                          if(getCustomerOutstandingDues.length > 0){
                            const hasDueExceeds = parseFloat(newData.sub_total) >= (getCustomerOutstandingDues[0].credit_value === null ? 0  : getCustomerOutstandingDues[0].credit_value)|| (parseFloat(newData.sub_total) + parseFloat(getCustomerOutstanding[0].total_amount)) >= (getCustomerOutstandingDues[0].credit_value === null ? 0 : getCustomerOutstandingDues[0].credit_value)
                            if (hasDueExceeds && formValues.sale_status === 2 && !isAdmin && props.status !== 'edit') {
                              setCustomerSelectionDialogOpen(true)
                            }
                            else {
                              delete newData['tableData'];
                              newData.lots =
                                (formValues.sale_status === 2 ||  formValues.sale_status === 8)
                                  ? LotRes(newData, newData.quantity)
                                  : [];
                             
                              // if (
                              //   newData.is_serialized === 0 &&
                              //   (formValues.sale_status === 2 ||  formValues.sale_status === 8)  &&
                              //   newData.stock_type === 1
                              // ) {
                              
                              //   if (
                              //     newData.lots.length !== parseInt(newData.quantity)
                              //   ) {
                              //     setQtyErr(true);
                              //     return reject();
                              //   } else {
                              //     setQtyErr(null);
                              //   }
                              // }
                              newData.sub_total = singleTax(
                                newData.item_unit_price,
                                newData.quantity,
                                newData.taxes,
                              ).toFixed(2);
                              newData = {
                                ...newData,
                                sales_item_taxes: Sales_Item_Taxes(
                                  productByType,
                                  [{item_id: newData.item_id}],
                                  sales_items,
                                  newData.item_unit_price
                                ),
                                isEntered: 1
                              };
                              delete newData['tableData'];
                              //console.log('newaddsalesitemdd', sales_items, newData)
                              setSalesItems([...sales_items, newData]);
                              // if(newData.hsn_code !== hsnDesc.hsnCode || newData.description !== hsnDesc.description){
                              //   handleHsnDescChange(newData, newData.hsn_code, newData.description)
                              // }
                              if (
                                newData.hsn_code !== hsnDesc.hsnCode ||
                                newData.description !== hsnDesc.description
                              ) {
                                debouncedHandleHsnDescChange(newData, newData.hsn_code, newData.description, dispatch, setEditHSNDesc);
                              }
                              setTimeout(() => {
                                addActionRef.current?.click();
                              }, 0);
                            }
                          }
                          else {
                            delete newData['tableData'];
                            newData.lots =
                              (formValues.sale_status === 2 ||  formValues.sale_status === 8)
                                ? LotRes(newData, newData.quantity)
                                : [];
                           
                            // if (
                            //   newData.is_serialized === 0 &&
                            //   (formValues.sale_status === 2 ||  formValues.sale_status === 8)  &&
                            //   newData.stock_type === 1
                            // ) {
                            
                            //   if (
                            //     newData.lots.length !== parseInt(newData.quantity)
                            //   ) {
                            //     console.log('newSalesItems entering into lot condition')
                            //     setQtyErr(true);
                            //     return reject();
                            //   } else {
                            //     setQtyErr(null);
                            //   }
                            // }
                            newData.sub_total = singleTax(
                              newData.item_unit_price,
                              newData.quantity,
                              newData.taxes,
                            ).toFixed(2);
                            newData = {
                              ...newData,
                              sales_item_taxes: Sales_Item_Taxes(
                                productByType,
                                [{item_id: newData.item_id}],
                                sales_items,
                                newData.item_unit_price
                              ),
                              isEntered: 1
                            };
                            delete newData['tableData'];
                            setSalesItems([...sales_items, newData]);
                            if (
                                newData.hsn_code !== hsnDesc.hsnCode ||
                                newData.description !== hsnDesc.description
                              ) {
                                debouncedHandleHsnDescChange(newData, newData.hsn_code, newData.description, dispatch, setEditHSNDesc);
                              }
                            // if(newData.hsn_code !== hsnDesc.hsnCode || newData.description !== hsnDesc.description){
                            //   handleHsnDescChange(newData, newData.hsn_code, newData.description)
                            // }
                            setTimeout(() => {
                              addActionRef.current?.click();
                            }, 0);
                          }
                          resolve();
                        }, 1000);
                      }),
                    
                    onRowUpdate: (newData, oldData) =>
                      new Promise((resolve, reject) => {
                        // setTimeout(() => {

                          const dataUpdate = [...sales_items];
                          if(getCustomerOutstanding.length > 0){
                            const hasDueExceeds = parseFloat(newData.sub_total) >= getCustomerOutstandingDues[0].credit_value || (parseFloat(newData.sub_total) + parseFloat(getCustomerOutstanding[0].total_amount)) >= getCustomerOutstandingDues[0].credit_value
                            if (hasDueExceeds && formValues.sale_status === 2 && !isAdmin && props.status !== 'edit') {
                              setCustomerSelectionDialogOpen(true)
                            }
                            else {
                              const index = oldData.tableData.id;
                              newData = {
                                ...newData,
                                sales_item_taxes: Sales_Item_Taxes(
                                  productByType,
                                  [{item_id: newData.item_id}],
                                  sales_items,
                                  newData.item_unit_price,
                                ),
                              };
                              dataUpdate[index] = newData;
                              newData.lots =
                                (formValues.sale_status === 2 ||  formValues.sale_status === 8 )
                                  ? LotRes(newData, newData.quantity)
                                  : [];
                              if (
                                newData.is_serialized === 0 &&
                                ( formValues.sale_status === 2 ||  formValues.sale_status === 8 ) &&
                                newData.stock_type === 1
                              ) {
                                if (
                                  newData.lots.length !== parseInt(newData.quantity)
                                ) {
                                  //  setQtyErr(true)
                                  return reject();
                                } else {
                                  setQtyErr(null);
                                }
                              }
                              setSalesItems([...dataUpdate]);
                              if (
                                newData.hsn_code !== hsnDesc.hsnCode ||
                                newData.description !== hsnDesc.description
                              ) {
                                debouncedHandleHsnDescChange(newData, newData.hsn_code, newData.description, dispatch, setEditHSNDesc);
                              }
                              // if(newData.hsn_code !== oldData.hsnCode || newData.description !== oldData.description){
                              //   handleHsnDescChange(newData, newData.hsn_code, newData.description)
                              // }
                            }
                          }
                          else {
                            const index = oldData.tableData.id;
                            newData = {
                              ...newData,
                              sales_item_taxes: Sales_Item_Taxes(
                                productByType,
                                [{item_id: newData.item_id}],
                                sales_items,
                                newData.item_unit_price,
                              ),
                            };
                            dataUpdate[index] = newData;
                            newData.lots =
                              (formValues.sale_status === 2 ||  formValues.sale_status === 8 )
                                ? LotRes(newData, newData.quantity)
                                : [];
                            if (
                              newData.is_serialized === 0 &&
                              ( formValues.sale_status === 2 ||  formValues.sale_status === 8 ) &&
                              newData.stock_type === 1
                            ) {
                              if (
                                newData.lots.length !== parseInt(newData.quantity)
                              ) {
                                //  setQtyErr(true)
                                return reject();
                              } else {
                                setQtyErr(null);
                              }
                            }
                            setSalesItems([...dataUpdate]);
                            if (
                                newData.hsn_code !== hsnDesc.hsnCode ||
                                newData.description !== hsnDesc.description
                              ) {
                                debouncedHandleHsnDescChange(newData, newData.hsn_code, newData.description, dispatch, setEditHSNDesc);
                              }
                            // if(newData.hsn_code !== oldData.hsnCode || newData.description !== oldData.description){
                            //   handleHsnDescChange(newData, newData.hsn_code, newData.description)
                            // }
                          }
                          resolve();
                        // }, 1000);
                      }),
                    onBulkUpdate: (changes) =>
                      new Promise((resolve, reject) => {
                        // setTimeout(() => {
                          if(getCustomerOutstandingDues.length > 0){
                            const hasDueExceeds = parseFloat(changes.sub_total) >= getCustomerOutstandingDues[0].credit_value || (parseFloat(changes.sub_total) + parseFloat(getCustomerOutstanding[0].total_amount)) >= getCustomerOutstandingDues[0].credit_value
                            if (hasDueExceeds && formValues.sale_status === 2 && !isAdmin && props.status !== 'edit') {
                              setCustomerSelectionDialogOpen(true)
                            }
                            else {
                              const makeData = [...sales_items];
                              Object.keys(changes).map((d) => {
                                makeData[d] = changes[d].newData;
                              });
                              setSalesItems(makeData);
                            }
                          }
                          else {
                            const makeData = [...sales_items];
                            Object.keys(changes).map((d) => {
                              makeData[d] = changes[d].newData;
                            });
                            setSalesItems(makeData);
                          }
                          resolve();
                        // }, 1000);
                      }),
                    onRowDelete: (oldData) =>
                      new Promise((resolve, reject) => {
                        // setTimeout(() => {
                          const dataDelete = [...sales_items];
                          const index = oldData.tableData.id;
                          dataDelete.splice(index, 1);
                          setSalesItems([...dataDelete]);

                          resolve();
                        // }, 1000); 
                      }),
                  }}
                  title={
                      <Typography variant='h6' align='left'  style={{ paddingTop: '10px', paddingBottom: '10px' }}>Sales Items</Typography>
                  }
                />
                   <MissingProduct
                          open={mOpen}
                          handleClose={productClose}
                          wOutItemId={dataApi}
                          setDataApi={setDataApiFromMissingProduct}
                          bulkApiCreate={bulkApiCreate}
                          from='salesUpload'
                        />
                <Grid style={{ display : 'flex', justifyContent : 'flex-end', alignItems : 'center', padding : '1px 16px' }}>
                  <Typography variant='h6'>
                      {`Total Quantity : ${sales_items.reduce((count, item) => count + parseInt(item.quantity), 0) }`}
                  </Typography>
                </Grid>
              </Grid>

              {
                ((props.appConfigData.eInvoice === '1' || props.appConfigData.ewayBill === '1') && (untaxed() > 0 ? floatnum((untaxed() + untaxed('taxes')+ tcsuntaxed('taxes'))- calculatetdsTaxAmount()) : 0) >= 50000 )&& formValues.sale_status !==1 &&
                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <div style={headSx}>
                    <div>
                      <Typography variant='h6' align='left'>
                        Transporter Details
                      </Typography>
                    </div>
                  </div>
                  <Grid
                    style={{
                      alignItems: 'flex-end',
                      backgroundColor: '#FDFEFE',
                      margin: 0,
                    }}
                    // spacing={2}
                    sx={widthSx}
                    container
                    direction='row'
                    value='one'
                  >
                    <Grid container spacing={3} sx={{ mb: 1 }}>
                      <Grid
                        style={{ display: 'flex', alignItems: 'flex-end' }}
                        size={{
                          lg: 3,
                          md: 4,
                          sm: 6,
                          xs: 12
                        }}>
                        <TextField
                          fullWidth={true}
                          name='trans_name'
                          label='Transporter name'
                          multiline={true}
                          placeholder='Transporter name'
                          required
                          rows={1}
                          value={
                            formValues.trans_name === null ? '' : formValues.trans_name
                          }
                          variant='filled'
                          onChange={handleChange}
                          // onBlur={handleChange}
                          // required={undefined}
                          error={formErrors.trans_name === null ? false : true}
                          helperText={
                            formErrors.trans_name === null ? 'Name of the transporter' : formErrors.trans_name
                          }
                          FormHelperTextProps={{
                            style: { minHeight: '3.3em', whiteSpace: 'normal' }
                          }}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid
                        style={{ display: 'flex', alignItems: 'flex-end' }}
                        size={{
                          lg: 3,
                          md: 4,
                          sm: 6,
                          xs: 12
                        }}>
                        <TextField
                          fullWidth={true}
                          name='trans_id'
                          label='Transporter Gstin'
                          multiline={true}
                          required
                          placeholder='Transporter Gstin'
                          rows={1}
                          value={
                            formValues.trans_id === null ? '' : formValues.trans_id
                          }
                          variant='filled'
                          onChange={handleChange}
                          // onBlur={handleChange}
                          // required={undefined}
                          error={formErrors.trans_id === null ? false : true}
                          helperText={
                            formErrors.trans_id === null ? 'Transin/GSTIN' : formErrors.trans_id
                          }
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid
                        style={{ display: 'flex', alignItems: 'flex-end' }}
                        size={{
                          lg: 3,
                          md: 4,
                          sm: 6,
                          xs: 12
                        }}>
                        <TextField
                          fullWidth={true}
                          name='trans_doc_no'
                          label='Document Number'
                          multiline={true}
                          required
                          placeholder='Document Number'
                          rows={1}
                          value={
                            formValues.trans_doc_no === null ? '' : formValues.trans_doc_no
                          }
                          variant='filled'
                          onChange={handleChange}
                          // onBlur={handleChange}
                          // required={undefined}
                          error={formErrors.trans_doc_no === null ? false : true}
                          helperText={
                            formErrors.trans_doc_no === null ? 'Tranport Document Number' : formErrors.trans_doc_no
                          }
                      InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid
                        style={{ display: 'flex', alignItems: 'flex-end' }}
                        size={{
                          lg: 3,
                          md: 4,
                          sm: 6,
                          xs: 12
                        }}>
                        <TextField
                          fullWidth={true}
                          name='trans_mode'
                          label='Mode of transport'
                          multiline={true}
                          required
                          placeholder='Mode of transport'
                          rows={1}
                          value={
                            formValues.trans_mode === null ? '' : formValues.trans_mode
                          }
                          variant='filled'
                          onChange={handleChange}
                          // onBlur={handleChange}
                          // required={undefined}
                          error={formErrors.trans_mode === null ? false : true}
                          helperText={
                            formErrors.trans_mode === null ? 'Mode of transport (Road-1, Rail-2, Air-3, Ship-4)' : formErrors.trans_mode
                          }
                      InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid
                        style={{ display: 'flex', alignItems: 'flex-end' }}
                        size={{
                          lg: 3,
                          md: 4,
                          sm: 6,
                          xs: 12
                        }}>
                        <TextField
                          fullWidth={true}
                          name='distance'
                          label='Distance'
                          multiline={true}
                          required
                          placeholder='Distance'
                          rows={1}
                          value={formValues.distance ? formValues.distance : ''}
                          variant='filled'
                          onChange={handleChange}
                          // onBlur={handleChange}
                          // required={undefined}
                          error={formErrors.distance === null ? false : true}
                          helperText={
                            formErrors.distance === null ? 'Distance between source and destination PIN codes' : formErrors.distance
                          }
                      InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid
                        style={{ display: 'flex', alignItems: 'flex-end' }}
                        size={{
                          lg: 3,
                          md: 4,
                          sm: 6,
                          xs: 12
                        }}>
                        <TextField
                          fullWidth={true}
                          name='veh_no'
                          label='Vehicle Number'
                          multiline={true}
                          required
                          placeholder='Vehicle Number'
                          rows={1}
                          value={
                            formValues.veh_no === null ? '' : formValues.veh_no
                          }
                          variant='filled'
                          onChange={handleChange}
                          // onBlur={handleChange}
                          // required={undefined}
                          error={formErrors.veh_no === null ? false : true}
                          helperText={
                            formErrors.veh_no === null ? 'Vehicle Number (DD45ABCD1234, 22BH1234AA)' : formErrors.veh_no
                          }
                      InputLabelProps={{ shrink: true }}
                        />
                      </Grid>

                    </Grid>
                  </Grid>
                </Grid>
              }

              <Grid container spacing={3}>
                <Grid
                  size={{
                    lg: 4,
                    md: 6
                  }}>
                  {sales_items?.length > 0 && (
                    <MaterialTable
                      //  style={{height:'10%'}}
                      options={{
                        headerStyle,
                        cellStyle,
                        showTitle: false,
                        paging: false,
                        toolbar: false,
                        search: false,
                      }}
                      columns={custColumn()}
                      data={custData()}
                    />
                  )}
                </Grid>

                <Grid
                  style={{marginTop: '10px'}}
                  size={{
                    lg: 4,
                    md: 6
                  }}>
                  <div style={{width: '300px'}}>
                    <div style={taxHeadSx}>
                      <Typography variant='h6' style={{fontWeight: 'bold'}}>
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
                    {taxVisible && (
                      <>
                        <div style={taxHeadSx}>
                          <Typography
                            style={{fontWeight: 'bold', margin: '5px'}}
                          >
                            CGST :
                          </Typography>
                          <Typography
                            style={{
                              width: '150px',
                              textAlign: 'end',
                              margin: '5px',
                            }}
                          >
                           <span> ₹ </span> {(floatnum(untaxed('taxes')) / 2).toFixed(2)}
                          </Typography>
                        </div>
                        <div style={taxHeadSx}>
                          <Typography
                            style={{fontWeight: 'bold', margin: '5px'}}
                          >
                            SGST :
                          </Typography>
                          <Typography
                            style={{
                              width: '150px',
                              textAlign: 'end',
                              margin: '5px',
                            }}
                          >
                          <span> ₹ </span> {(floatnum(untaxed('taxes')) / 2 ).toFixed(2)}
                          </Typography>
                        </div>

                           
                        {/* {tcstaxvisible === true &&
                        <div style={taxHeadSx}>
                          <Typography
                            style={{fontWeight: 'bold', margin: '5px'}}
                          >
                            TCS :
                          </Typography>
                          <Typography
                            style={{
                              width: '150px',
                              textAlign: 'end',
                              margin: '5px',
                            }}
                          >
                            {floatnum(tcsuntaxed('taxes'))} <span>â‚¹</span>
                          </Typography>
                        </div>
                         } */}
                      </>
                    )}
                    {taxVisible === false && (
                      <div style={taxHeadSx}>
                        <Typography style={{fontWeight: 'bold', margin: '5px'}}>
                          IGST :
                        </Typography>
                        <Typography
                          style={{
                            width: '150px',
                            textAlign: 'end',
                            margin: '5px',
                          }}
                        >
                          <span> ₹ </span> {floatnum(untaxed('taxes'))}
                        </Typography>
                      </div>
                    )}
                    <>
                    {formValues.sale_status == 2 &&(
                      <FormControl>
                                                <RadioGroup
                                                  row
                                                  aria-label='Tax Rate'
                                                  value={formValues.tax_types}
                                                  name='tax_types'
                                                  onChange={handleChange}
                                                >
                                                  <FormControlLabel value='0' control={<Radio />} label='TCS' />
                                                  <FormControlLabel value='1' control={<Radio />} label='TDS' />
                                                </RadioGroup>
                                              </FormControl>
                                               )} 
                                              {formValues.sale_status == 2 && (formValues.tax_types === '1' ? (
                                              <>
                                                {/*<FormControl fullWidth>
                                                  <InputLabel id = 'id'>Select a Tax</InputLabel>
                                                  <Select value={formValues.tds_percent} name='tds_percent' onChange={handleChange} displayEmpty label='Select a Tax' labelId='id' MenuProps={{
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
                                                        }}>

                                                    <TextField
                                                        variant="outlined"
                                                        size="small"
                                                        placeholder="Search"
                                                        fullWidth
                                                        onChange={(e) => setSearchText(e.target.value)}
                                                        sx={{ margin: "8px" }}
                                                      />

                                                    {tds_taxrate?.map((option, index) => (
                                                      <MenuItem key={index} value={option?.tds_rate}>
                                                        {option.category} [{option.tds_rate}]
                                                      </MenuItem>
                                                    ))}
                                                  </Select> 

                                                  
                                               </FormControl> : */}

                                                <Autocomplete
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
                                                  />
                                                  </>
                                                ) :
                                                <TextField
                                                  id='standard-basic'
                                                  value={formValues.tcs}
                                                  name='tcs'
                                                  label='TCS'
                                                  fullWidth={true}
                                                  onChange={handleChange}
                                                  variant='filled'
                                                  type='number'
                                                />
                        
                                                  )}
                                                
                    </>
                    <hr style={{backgroundColor: 'rgba(0,0,0,0.3)'}} />
                    <div style={taxHeadSx}>
                      <Typography style={{margin: 'auto 5px 5px'}}>
                        Rounded off:
                      </Typography>
                      <Typography
                        style={{
                          width: '150px',
                          textAlign: 'end',
                          fontWeight: 'bolder',
                          fontSize: headerStyle.fontSize,
                          margin: '5px',
                        }}
                      >
                        {` ₹ ${(Math.round(
                          untaxed() > 0
                            ? floatnum(
                                untaxed() + untaxed('taxes') + tcsuntaxed('taxes') - calculatetdsTaxAmount()
                              )
                            : 0
                        ) - (untaxed() > 0
                          ? floatnum(
                              untaxed() + untaxed('taxes') + tcsuntaxed('taxes') - calculatetdsTaxAmount()
                            )
                          : 0)
                          ).toFixed(2) > 0 ? '+' : ''}${(Math.round(
                          untaxed() > 0
                            ? floatnum(
                                untaxed() + untaxed('taxes') + tcsuntaxed('taxes') - calculatetdsTaxAmount()
                              )
                            : 0
                        ) - (untaxed() > 0
                          ? floatnum(
                              untaxed() + untaxed('taxes') + tcsuntaxed('taxes') - calculatetdsTaxAmount()
                            )
                          : 0)
                          ).toFixed(2)}`}
                      </Typography>

                    </div>
                    <div style={taxHeadSx}>
                      <Typography style={{margin: 'auto 5px 5px'}}>
                        Total:
                      </Typography>
                      <Typography
                        style={{
                          width: '150px',
                          textAlign: 'end',
                          fontWeight: 'bolder',
                          fontSize: headerStyle.fontSize,
                          margin: '5px',
                        }}
                      >
                        <span>₹</span> {Math.round(untaxed() > 0 ? floatnum((untaxed() + untaxed('taxes')+ tcsuntaxed('taxes'))- calculatetdsTaxAmount()) : 0)} 
                      </Typography>
                    </div>
                  </div>
                </Grid>
                <Grid
                  style={{marginTop: 'auto'}}
                  size={{
                    lg: 4,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <div style={{padding: '20px 0'}}>
                    <TextField
                      sx={{marginLeft: 'auto', marginBottom: '10px'}}
                      fullWidth
                      name='note'
                      variant='outlined'
                      size='small'
                      onChange={handleChange}
                      value={formValues.note}
                      label='Notes'
                      minRows={2}
                      multiline
                    />

                    {/* <div style={{float: 'right', marginBottom: '5px'}}>
                      <Tooltip placement='left' title='Payment'>
                        <Fab
                          variant='contained'
                          size='small'
                          onClick={() => paymentButtun()}
                          color='primary'
                          // sx={{mb: 1}}
                          aria-label='add'
                        >
                          <AccountBalanceWalletIcon  />
                        </Fab>
                      </Tooltip>
                    </div> */}
                  </div>

                  <div style={{display: 'flex', width: '100%'}}>
                    <div style={{display: 'flex', marginLeft: 'auto'}}>
                      <div style={{marginRight: 20}}>
                        {form === false ? (
                          <Button
                            variant='contained'
                            onClick={() => {
                              setinvoicelayout(false);
                              props.handleClose();
                            }}
                            color='secondary'
                          >
                            Close
                          </Button>
                        ) : (
                          <Button
                          variant="contained"
                          onClick={() => {
                            if (typeof setinvoicelayout === 'function') {
                              setinvoicelayout(false);
                              dispatch(triggerSalesModal(false));
                            }
                            validClose();
                          }}
                          color="secondary"
                        >
                          Close
                        </Button>
                        )}
                      </div>
                      {!props.returnState ? (
                        <ActionButton
                          appConfigData={props.appConfigData}
                          shipping_details={[props.shipping_details]}
                          note={formValues.note}
                          addNote={addNote}
                          createMail={createMail}
                          custType={'CUSTOMER'}
                          approvalRequest = {request} 
                          custData={getCustomer()}
                          handleSubmit={handleSubmit}
                          status = {(salesApprovals.length > 0)  ?  salesApprovals[0].status : null}
                          invoice={
                            formValues.sale_status === 1
                              ? formValues.so_number :  formValues.sale_status === 8 
                              ? formValues.dc_number
                              : formValues.invoice_number
                          }
                          soDate={moment(formValues.sale_time).format('YYYY-MM-DD HH:MM:SS')} 
                          soNumber={formValues.so_number}
                          sales_items={sales_items}
                          sale_status={formValues.sale_status}
                          customer_id={formValues.customer_id}
                          checkEachBarcodeWasEntered={
                            checkEachBarcodeWasEntered
                          }
                          handleClose={props.handleClose}
                          mail_configuration={props.mail_configuration}
                          handleNewopen={props.handleNewopen}
                          dc_number = {formValues.dc_number}
                          tcs={Rdata?.tcs}
                          tds={Rdata?.tds}
                          tcs_percent={Rdata?.tcs_percent}
                          tds_percent={Rdata?.tds_percent}
                          tds_value={Rdata?.tds_value}
                          total={untaxed() > 0 ? floatnum((untaxed() + untaxed('taxes')+ tcsuntaxed('taxes'))- calculatetdsTaxAmount()) : 0}
                          location_id = {formValues?.location_id}
                          invoicelayout={invoicelayout}
                          setinvoicelayout={setinvoicelayout}
                          isRoundedOffNegative={(Math.round(
                            untaxed() > 0
                              ? floatnum(
                                  untaxed() + untaxed('taxes') + tcsuntaxed('taxes') - calculatetdsTaxAmount()
                                )
                              : 0
                          ) - (untaxed() > 0
                            ? floatnum(
                                untaxed() + untaxed('taxes') + tcsuntaxed('taxes') - calculatetdsTaxAmount()
                              )
                            : 0)
                            ).toFixed(2) > 0 ? 0 : 1}
                          rounded_off={(Math.round(
                            untaxed() > 0
                              ? floatnum(
                                  untaxed() + untaxed('taxes') + tcsuntaxed('taxes') - calculatetdsTaxAmount()
                                )
                              : 0
                          ) - (untaxed() > 0
                            ? floatnum(
                                untaxed() + untaxed('taxes') + tcsuntaxed('taxes') - calculatetdsTaxAmount()
                              )
                            : 0)
                            ).toFixed(2)}
                        />
                      ) : (
                        <Button
                          variant="contained"
                          onClick={() => {
                            formValues.sale_status === 8 ? dcreturnFunc() : returnFunc();
                            if (typeof setinvoicelayout === 'function') {
                              setinvoicelayout(false);
                            }
                          }}
                          color="primary"
                        >
                          return
                        </Button>
                      )}
                      <ItemPopup
                        cancelref={() => {}}
                        open={row_id.open}
                        returnState={props.returnState}
                        status={row_id.status}
                        setitemsData={setSalesItems}
                        handleClose={handleItemPopUpClose}
                        itemsData={sales_items}
                        row_id={row_id}
                        product={productByType}
                        sale_status = {dcchallan}
                        location_id={formValues.location_id}
                        sale_id={formValues.sale_id}
                        calledfrom = {props.returnState ? 'sales_return' : ''}
                      />
                    </div>
                  </div>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      {/* </LoadScript> */}
      <CancelDialog
        handle={props.page !== 'soTracking' && cancel}
        delete={dialog}
        close={() => {setRequest(false); props.handleClose();}}
      ></CancelDialog>
      <PaymentDialog
        activeINV={'INV'}
        getPay={getPay}
        selectionModel={selectionModel}
        status={'edit'}
        setSelectionModel={setSelectionModel}
        entryvalue ={entryvalue}
        sethandleEntry = {setHandleEntry}
        handleSubmit={handleSubmit}
        custType={'CUSTOMER'}
        Tdata={Tdata}
        setTdata={setTdata}
        custData={getCustomer()}
        sales_items={sales_items}
        paymentOpen={paymentOpen}
        setpaymentOpen={setpaymentOpen}
      />
      {/* {openAlert && <AlertDialogSlide
        setOpenAlert={setOpenAlert}
        productMisMatch={productMisMatch}
        productOutOfStock={productOutOfStock}
        duplicateLot={duplicateLot}
        setProductMisMatch={setProductMisMatch}
        setProductOutOfStock={setProductOutOfStock}
        setDuplicateLot={setDuplicateLot}
        duplicateLotInDb={duplicateLotInDb}
        setDuplicateLotInDb={setDuplicateLotInDb}
        locationMisMatch={locationMisMatch}
        setLocationMisMatch={setLocationMisMatch}
        setSalesItems={setSalesItems}
        setExcelItemsNotAdded={setExcelItemsNotAdded}
        excelItemsNotAdded={excelItemsNotAdded}
      />} */}
      {openAlert === true && (<AlertDialogSlide
        setOpenAlert={(data) => setOpenAlert(data)}

        duplicateLotNumber={duplicateLot}
        productOutOfStock={productOutOfStock}
        setValidationToDefault={() => {
          setDuplicateLot([])
          setProductOutOfStock([])
        }}
      />)}
      {/* View shipping address Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
       <DialogTitle>
         <Box display="flex" justifyContent="space-between" alignItems="center">
           <span>Select Shipping Address</span>
                 <IconButton onClick={() => { setEditShippingMode(false); setShippingOpen(true) }} size="small">
             <AddIcon />
           </IconButton>
         </Box>
       </DialogTitle>
       
       <DialogContent>
         {cusArray?.length > 0 ? (
           cusArray
             .filter(customer => customer.customer_id === formValues.customer_id)
             .map((customer, index) => {
               const shippingList = customer.shipping_address || [];
               const primaryShippingList = [
                 {
                   shipping_id: null,
                   company_id: customer.company_id,
                   company_name: customer.company_name,
                   contactperson_name: customer.first_name + (customer.last_name ? ` ${customer.last_name}` : ""),
                   contactperson_num: customer.phone_number,
                   Gst: customer.gst_type,
                   address: customer.address,
                   latitude: customer.latitude,
                   longitude: customer.longitude,
                   area: customer.area,
                   city: customer.city,
                   state: customer.state,
                   pin_code: customer.zip,
                   country: customer.country,
                   deleted: 0,
                   createdAt: customer.createdAt,
                   updatedAt: customer.updatedAt,
                   createdBy: customer.createdBy,
                   updatedBy: customer.updatedBy,
                   customer_id: customer.customer_id,
                   zip: customer.zip
                 }
               ];
       
               const hasPrimary = !!customer.address;
               const hasShipping = shippingList.length > 0;
               return hasPrimary || hasShipping ? (
                 <TableContainer
                   key={index}
                   sx={{
                     maxHeight: 360, // ~6 rows + header
                     border: '1px solid #ccc',
                     borderRadius: 1,
                     boxShadow: 1,
                     overflowY: 'auto',
                   }}
                 >
                   <Table stickyHeader size="small">
                     <TableHead>
                       <TableRow>
                         <TableCell>Select</TableCell>
                         <TableCell>Company Name</TableCell>
                         <TableCell>Address</TableCell>
                         <TableCell>Address Type</TableCell>
                         <TableCell>Actions</TableCell>
                       </TableRow>
                     </TableHead>
                     <TableBody>
                       {hasPrimary && (
                         <TableRow>
                           <TableCell>
                             <Checkbox
                               // checked={selectedAddress?.shipping_id === undefined && selectedAddress?.id === customer.id}
                               checked={selectedAddress === null || selectedAddress?.id === customer.id}
                               onChange={() => handleSelectAddress(customer)}
                             />
                           </TableCell>
                           <TableCell>{customer.company_name || '-'}</TableCell>
                           <TableCell>{`${customer.address} ${customer.city || ''}, ${customer.state || ''} - ${customer.pin_code || ''}`}</TableCell>
                           <TableCell>Primary</TableCell>
                           <TableCell>
                             <IconButton onClick={() => handleEditShipping(customer, 0, primaryShippingList)}>
                               <EditIcon />
                             </IconButton>
                           </TableCell>
                         </TableRow>
                       )}

                       {hasShipping && shippingList.map((address, addrIndex) => (
                         <TableRow key={addrIndex}>
                           <TableCell>
                             <Checkbox
                               checked={selectedAddress?.shipping_id === address.shipping_id}
                               onChange={() => handleSelectAddress(address)}
                             />
                           </TableCell>
                           <TableCell>{address.company_name || '-'}</TableCell>
                           <TableCell>{`${address.address} ${address.city}, ${address.state} - ${address.pin_code}`}</TableCell>
                           <TableCell>Additional</TableCell>
                           <TableCell>
                             <IconButton onClick={() => handleEditShipping(address, addrIndex, shippingList)}>
                               <EditIcon />
                             </IconButton>
                           </TableCell>
                         </TableRow>
                       ))}
                     </TableBody>
                   </Table>
                 </TableContainer>
               
               ) : (
                 <Typography key={index} color="textSecondary">
                   No shipping address available
                 </Typography>
               );
             })
         ) : (
           <Typography color="textSecondary">
             No customer data available
           </Typography>
         )}
       </DialogContent>

       <DialogActions>
         <Button onClick={handleCloseDialog} color="primary">
           Cancel
         </Button>
       </DialogActions>
     </Dialog>
      {/* edit credit_days */}
      <Dialog open={editOpen} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Credit Days</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Credit Days"
            type="number"
            variant='filled'
            value={dueDaysInput}
            onChange={(e) => setDueDaysInput(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Cancel</Button>
          <Button onClick={(e) => handleSave(e, 'CreditDays')} variant="contained" color="primary">
            update
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={editCreditDaysValueOpen} onClose={handleCloseCreditDaysValueEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Credit Days Value</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Credit Days Value"
            type="number"
            variant='filled'
            value={ dueDaysValueInput}
            onChange={(e) => setDueDaysValueInput(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreditDaysValueEdit}>Cancel</Button>
          <Button onClick={(e) => handleSave(e, 'CreditDaysValue')} variant="contained" color="primary">
            update
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={editSalesManOpen} onClose={editSalesManOpen === false} maxWidth="sm" fullWidth>
        <DialogTitle>Edit SalesMan</DialogTitle>
        <DialogContent>
           <FormControl
              required
              error={!!formErrors.sales_man}
              component="fieldset"
              fullWidth
              variant="filled"
            >
            <InputLabel>Sales Man</InputLabel>
            <Select
              style={{ marginBottom: '-4px' }}
              name="sales_man"
              label="Sales Man"
              onChange={(e) => handleSalesmanChange(e.target.value)}
              value={  salesMan?.id ??
                      formValues?.sales_man?.id ??
                      formValues?.salesman_id ??
                      ''}
            >
              {customer_salesman?.sales_man_list?.map((s) => (
                <MenuItem value={s.employee_id} key={s.id}>
                  {s.username}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {formErrors.sales_man ? 'Sales Man is required!' : ''}
            </FormHelperText>
          </FormControl>

        </DialogContent>
        <DialogActions>
          <Button onClick={()=> setEditSalesManOpen(false) }>Cancel</Button>
          <Button onClick={(e) => handleSave(e, 'salesman')} variant="contained" color="primary">
            update
          </Button>
        </DialogActions>
      </Dialog>
      {/* View Serial Number Dialog */}
      <Dialog open={viewSerialNumberOpen} onClose={() => setViewSerialNumberOpen(false)}>
        <DialogTitle>
          <Grid container display='flex' justifyContent='space-between' alignItems='center'>
            <Grid>
              <Typography variant='h6' textAlign='center'>Serial Numbers</Typography>
            </Grid>
            <Grid>
              <IconButton onClick={() => setViewSerialNumberOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Grid>
          </Grid>
        </DialogTitle>

        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>S.No</TableCell>
                <TableCell>Serial Number</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {
                viewSerialNumber.length > 0 ? 
                  viewSerialNumber.map(lot => (
                    <TableRow key={lot.sNo}>
                      <TableCell style={{textAlign: 'center'}}>{lot.sNo}</TableCell>
                      <TableCell style={{textAlign: 'center'}}>{lot.lotNumber}</TableCell>
                    </TableRow>
                  ))
                : <TableRow>
                    <TableCell colSpan={2} style={{textAlign: 'center'}}>No Records</TableCell>
                  </TableRow>
              }
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
      {/* Product Reset Confirmation Dialog */}
      <Dialog open={productResetDialog}>
        <DialogTitle>Product Reset Confirmation</DialogTitle>
        
        <DialogContent>
          <Typography variant='h6'>
            Are you sure to change the sale status ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Grid container spacing={2} display='flex' justifyContent='flex-end'>
            <Grid>
              <Button variant='contained' color='error' onClick={() => handleSaleItemsReset('no')}>No</Button>
            </Grid>

            <Grid>
              <Button variant='contained' onClick={() => handleSaleItemsReset('yes')}>Yes</Button>
            </Grid>
          </Grid>
        </DialogActions>
      </Dialog>
      <Dialog open={customerSelectionDialogOpen} onClose={() => setCustomerSelectionDialogOpen(false)}>
        <DialogTitle>Action Required</DialogTitle>
        <DialogContent>
        <Typography>
          Due Days Exceeds.You are not allowed to create an Invoice.<br />
          Only Sale Orders are allowed.<br />
          Are you sure you want to continue?
        </Typography>
        </DialogContent>
        <DialogActions>
        <Button 
          onClick={async() => {
                    setFormValues(prevValues => ({
                      ...prevValues,
                      sale_status: 1,
                    }));
                    await setCustomerSelectionDialogOpen(false);
                  }} 
                  color="primary" 
                  variant="contained"
                  >
          OK
        </Button>
        <Button 
          onClick={() => {
            setCustomerSelectionDialogOpen(false);
            props.handleClose()
          }} 
          color="secondary" 
          variant="contained"
        >
          Cancel
        </Button>
        </DialogActions>
    </Dialog>
      <Dialog open={props.invoiceNumberChangeDialog} onClose={() => props.setInvoiceNumberChangeDialog(false)}>
        <DialogTitle>Action Required</DialogTitle>

        <DialogContent>
          <Typography>
            Invoice Number is Already Exist. Would you like to proceed with the next invoice number?
          </Typography>
        </DialogContent>
          
        <DialogActions>
          <Button 
            onClick={async() => {
              handleChangeInvoiceNumber()
            }} 
            color="primary" 
            variant="contained"
            >
            OK
          </Button>
          <Button 
            onClick={() => {
              props.setInvoiceNumberChangeDialog(false);
              props.handleClose()
            }} 
            color="secondary" 
            variant="contained"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={addressDialog}>
        <DialogTitle>Action Required</DialogTitle>

        <DialogContent>
          <Typography>
            {`The customer's shipping address is missing. Would you like us to use the address from the customer's GST details instead ?`}
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button 
            onClick={async() => {
              handleSubmit((data) => setButton(data), true)
            }} 
            color="primary" 
            variant="contained"
            >
            OK
          </Button>
          <Button 
            onClick={() => {
              setAddressDialog(false)
            }} 
            color="secondary" 
            variant="contained"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Popup;

function Tables({data, tableName}) {

  const tableNameList = {
    productMisMatch : 'Some products Mis Matched',
    duplicateLot : 'Duplicate Lot number',
    productOutOfStock : 'Some products Out of Stock',
    duplicateLotInDb : 'Product has duplicate Lot Number in Uploaded file',
    lotAlreadyExistInDb : 'Lot number already exist in Database'
  }

  

  return (
    <Grid
      style={{
        margin: '10px',
        width:'65vh'
      }}
    >
      <Typography variant='h6' pb={1}>
        {tableNameList[tableName]}
      </Typography>
      <table
        style={{
          border: '1px solid',
          fontSize:cellStyle.fontSize ,
          borderCollapse: 'collapse',
          padding: '0px 5px',
          width: '100%',
          paddingBottom: '10px'
          
        }}
      > 
        <tr>
          <th style={{border: '1px solid', width:'60%'}}>Product Name</th>
          <th style={{border: '1px solid', width:'40%'}}>Lot Number / Qty</th>
        </tr>
        {data.map((d, i) => (
          <tr key={i}>
            <td style={{border: '1px solid', padding: '0px 5px'}}>
              {d.name}
            </td>

            {d.uploadQty ? (
              <td style={{border: '1px solid', padding: '0px 5px'}}>
                Uploaded Qty
                <span style={{fontWeight: 'bold'}}>({d.uploadQty})</span> is
                more than actual qty
                <span style={{fontWeight: 'bold'}}>({d.actualQty})</span>
              </td>
            ) : (
              <td style={{border: '1px solid', padding: '0px 5px'}}>
                {d.lot}
              </td>
            )}
          </tr>
        ))}
      </table>
    </Grid>
  );
}

