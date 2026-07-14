import MaterialTable, { MTableToolbar } from "utils/SafeMaterialTable";
import { Button, Card, Chip, Dialog, DialogActions, DialogContent, Grid, Link, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteQuotationAction, getQuotationsActions, getQuotationSearchAction, sendQuotationMailAction, setQuotationSearchAction , quotationTimelineDataAction} from "redux/actions/quotation_actions";
import CommonSearch from "utils/commonSearch";
import { headerStyle, cellStyle, maxBodyHeight } from "utils/pageSize";
import AddIcon from '@mui/icons-material/Add';
import QuotationForm from "./QuotationForm";
import CreateNewButtonContext from "context/CreateNewButtonContext";
import QuotationTemp from "components/QuotationTemp";
import { getAppConfigDataAction, getAppConfigDataBasedOnTypeAction, getAppConfigWithCompanyInfoAction } from "redux/actions/app_config_actions";
import MailIcon from '@mui/icons-material/Mail';
import PrintIcon from '@mui/icons-material/Print';
import ReactToPrint from "react-to-print";
import '../../../sales/sales/styles.css';
import NewSales from 'components/Sales/NewSalesForm';
import { getPriceListAction } from "redux/actions/priceList_actions";
import { listProductAction } from "redux/actions/product_actions";
import { listStockLocationAction, listStockLocationSequenceAction } from "redux/actions/stock_Location_actions";
import { getsessionStorage } from "pages/common/login/cookies";
import { listCustomerAction } from "redux/actions/customer_actions";
import { createSalesAction } from "redux/actions/sales_actions";
import Mail from "components/Mail";
import moment from "moment";
import { getIgst } from "components/pos/checkout_products/commonTax";
import FilterSalesOrder from "pages/sales/sales/FilterSalesOrder";
import apiCalls from "utils/apiCalls";
import { getUserRightsByRoleIdAction } from "redux/actions/role_actions";
import { getRoleAuthorization } from "@crema/utility/helper/RoleAuthHelper";
import NewQuotationForm from "../NewQuotationForm";
import { Helmet } from "react-helmet-async";
import { titleURL } from 'http-common';
import { setInvoiceTempAction } from "redux/actions/vendor_actions";
import ReceiptTempDialog from "pages/sales/Receipt/ReceiptTemp";
import { useCustomFetch } from "utils/useCustomFetch";
import BusinessIcon from '@mui/icons-material/Business'
  import {
    getStickyTableOptions,
    stickyTableComponents,
  } from 'utils/stickyTableLayout';
import { OpenCustomerLandingPage } from "@crema/utility/helper/RouteHelper";
import QuotationDetailsPage from "../quotationDetailPage"
import API_URLS from "utils/customFetchApiUrls";
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';


function QuotationTable(props){

  const dispatch = useDispatch()
  const sessionStorage = getsessionStorage()
  const {
    quotationReducer: {quotations},
    appConfigReducer: {appConfigWithCompanyInfo, app_config_data},
    PriceListReducer: {price_list},
    productReducer: {product},
    stockLocationReducer: {stocklocation},
    customerReducer: {customer, customerAsCompany},
    roleReducer : { user_rights },
    ConfigurationReducer: { mail_configuration },
     rbacReducer: { menuAccess } 
  } = useSelector(state => state)
  const {
    setModalTypeHandler, 
    setLoaderStatusHandler,
    setcreatNewDataHandler,
    creatNewData,
    selectData,
    setselectData,
    setModalStatusHandler,
    headerLocationId,
    commoncookie
  } = useContext(CreateNewButtonContext)
  
  let componentRef
    const customFetch = useCustomFetch();
  const[display, setDisplay] = useState('list')
  const[dialogOpen, setDialogOpen] = useState(false)
  const[mailDialog, setMailDialog] = useState(false)
  const[pagination, setPagination] = useState({
    pageCount: 0,
    numPerPage: 20,
    searchString: ""
  })
  let firstDay = null;
  let lastDay = null;
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    from: firstDay,
    to: lastDay,
    dateRange: null,
    status: null,
    payment_status: null,
    filtedValue: {
      brand: '',
      category: '',
      location_id: 'null',
      payment_type: '',
      max_price: '',
      min_price: '',
    },
  });
  const [errormsg, setErrormsg] = useState({
    from: '',
    to: '',
  });
  const[rowData, setRowData] = useState([])
  const[appConfigData, setAppConfigData] = useState(app_config_data)
  const[newSalesAfterCreating_Data, setNewSalesAfterCreating_Data] = useState({
    sale_status: null,
    location_id: null,
    comment: '',
    reference: ''
  })
  const[convertData, setConvertData] = useState([])
  const[isNewSales, setIsNewSales] = useState(false)
  const[quotoationId, setQuotoationId] = useState([])
  const[detailOpen, setDetailOpen] = useState(false)
  const[detailData, setDetailData] = useState('')
  const[detailsOpen, setDetailsOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null);

console.log(selectedRow,"selectedRow")
  const  getAppConfigData = () => {
    // const {app_config_data} = this.props;
  
    const companyName = app_config_data.filter((f) => f.key_name == 'company.name');
    const fullAddress = app_config_data.filter(
      (f) => f.key_name == 'address.fulladdress',
    );
    const emailData = app_config_data.filter((f) => f.key_name == 'company.email');
    const gstinData = app_config_data.filter(
      (f) => f.key_name == 'company.gstin/uin',
    );
    const companyMobile = app_config_data.filter(
      (f) => f.key_name == 'company.mobile',
    );
    const state = app_config_data.filter((f) => f.key_name == 'address.state');
    let city = app_config_data.filter((f)=> f.key_name == 'address.city');
    let zip = app_config_data.filter((f)=> f.key_name == 'address.pincode');
    let email =  emailData[0]?.value
    const eInvoice = app_config_data.filter((f) => f.key_name === 'company.einvoice')
    const pinCode = app_config_data.filter((f) => f.key_name === 'address.pincode')
    const ewayBill = app_config_data.filter((f) => f.key_name === 'company.ewaybill')
    setAppConfigData ({
        companyName: companyName.length > 0 ? companyName[0].value : '',
        companyAddress: fullAddress.length > 0 ? fullAddress[0].value : '',
        companyEmail: email,
        gstin: gstinData.length > 0 ? gstinData[0].value : '',
        companyMobile: companyMobile.length > 0 ? companyMobile[0].value : '',
        state: state.length > 0 ? state[0].value : '',
        zip:zip,
        city:city,
        eInvoice: eInvoice.length > 0 ? eInvoice[0].value : '',
        pinCode: pinCode.length > 0 ? pinCode[0].value : '',
        ewayBill: ewayBill.length > 0 ? ewayBill[0].value : ''

  })
  
  };

  useEffect(() => { (async () => {
    if(props?.customer){
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
      numPerPage: pagination.numPerPage,
      pageCount: pagination.pageCount,
      searchString: pagination.searchString,
      customer_id: props.customer[0]?.customer_id
    };
      await dispatch(getQuotationsActions(paginationData, setModalTypeHandler, setLoaderStatusHandler))
    }
    else if(props?.type){
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
      numPerPage: pagination.numPerPage,
      pageCount: pagination.pageCount,
      searchString: pagination.searchString,
      type: props.index
    };
      await dispatch(getQuotationsActions(paginationData, setModalTypeHandler, setLoaderStatusHandler))
    }
    else{
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
      numPerPage: pagination.numPerPage,
      pageCount: pagination.pageCount,
      searchString: pagination.searchString,
    };
      dispatch(getQuotationsActions(paginationData, setModalTypeHandler, setLoaderStatusHandler))
    }
  })();
}, [pagination.pageCount, pagination.numPerPage,props?.customer,props?.type])

  useEffect(() => {
    // setAppConfigData(app_config_data)
    getAppConfigData()
  }, [app_config_data])

  useEffect(()=>{
     dispatch(listStockLocationAction(commoncookie, headerLocationId))
     dispatch(listProductAction())
     dispatch(getUserRightsByRoleIdAction())
     let type='sales'
     dispatch(getAppConfigDataBasedOnTypeAction(type))
  },[])

  const handlePageChange = (page) => {
    setPagination((prev) => ({...prev, pageCount: page}))
  }

  const handlePageSizeChange = (size) => {
    setPagination((prev) => ({...prev, numPerPage: size}))
  }

  const cancelSearch = () => {
    setPagination((prev) => ({...prev, searchString: ""}))

    dispatch(setQuotationSearchAction({data: [], count: 0}))

    const payload = {
      numPerPage: pagination.numPerPage,
      pageCount: pagination.pageCount,
      searchString: ""
    }
    dispatch(getQuotationSearchAction(payload, setModalTypeHandler, setLoaderStatusHandler))
  }

  const requestSearch = (event) => {
    let val = event.target.value
    setPagination((prev) => ({...prev, searchString: val}))

    if(val.length >= 3 || val.length === 0) {
      dispatch(setQuotationSearchAction({data: [], count: 0}))
    }

    const payload = {
      numPerPage: pagination.numPerPage,
      pageCount: 0,
      searchString: val
    }
    dispatch(getQuotationSearchAction(payload, setModalTypeHandler, setLoaderStatusHandler))
  }

  const handleFormOpen = () => {
    setDisplay('form')
  }

  const handleOpenQuotationDetail = async(rowData) => {

    const response = await customFetch(
      API_URLS.GET_QUOTATION_TEMPLATE(rowData.quotation_id),
      'GET'
    );
            await apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler,
                dispatch(setInvoiceTempAction(response.data))
            );
    setRowData(rowData)
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
  }

  const handleClose = () => {
    setDisplay('list')
    dispatch(getQuotationsActions(pagination, setModalTypeHandler, setLoaderStatusHandler))
  }

  const sendMail = () => {
    let payload = {
      ...quotations.companyDetails,
      ...rowData
    }
    dispatch(sendQuotationMailAction(payload, setModalTypeHandler, setLoaderStatusHandler))
  }

  const setAppConfigDataFunc = (data) => {
    setAppConfigData({...appConfigData, ...data})
  }
  
  const handleFilter = (data) => {
    setFilterOpen(data);
  };

  const handleChange = async (data) => {
    const { name, value, value1, value2 } = data.target;

    if (name === 'dateRange') {
      setFilters((prev) => ({
        ...prev,
        from: value,
        to: value1,
        dateRange: value2,
      }));
    } else {
      const date_val = value._d;

      setFilters((prev) => ({
        ...prev,
        [name]: date_val,
      }));
    }

    const newFrom = name === 'from' || name === 'dateRange' ? (name === 'from' ? value._d : value) : filters.from;
    const newTo = name === 'to' || name === 'dateRange' ? (name === 'to' ? value._d : value1) : filters.to;

    const fromDate = moment(newFrom);
    const toDate = moment(newTo);

    if (fromDate.isSameOrBefore(toDate, 'day')) {
      setErrormsg({ from: '', to: '' });
    } else {
      let errorLabel = '';
      if (fromDate.year() > toDate.year()) {
        errorLabel = 'Invalid Date 3';
      } else if (fromDate.month() > toDate.month()) {
        errorLabel = 'Invalid Date 2';
      } else {
        errorLabel = 'Invalid Date 1';
      }

      setErrormsg((prev) => ({
        ...prev,
        [name]: errorLabel,
      }));
    }
  };

  const commonFilterMapping = (array, columnName) => {
    if (typeof array === 'object') {
      let Data = array.map((a) => a[columnName]);
      return Data;
    } else {
      return array;
    }
  };


  const ApplyButton = (formValue) => {
    setFilters((prev) => ({
      ...prev,
      filtedValue: formValue,
    }));

    setPagination((prev) => ({
      ...prev,
      searchString: '',
    }));

    const {
      brand,
      category,
      location_id,
      payment_type,
      max_price,
      min_price,
      status,
      payment_status,
    } = formValue;

    const fromFormatted = filters.from
      ? moment(filters.from).format('YYYY-MM-DD')
      : null;

    const toFormatted = filters.to
      ? moment(filters.to).format('YYYY-MM-DD')
      : null;

    const mappedCommonFields = {
      brand: commonFilterMapping(brand, 'brand'),
      category: commonFilterMapping(category, 'category'),
      location_id: commonFilterMapping(location_id, 'location_id'),
      max_price: commonFilterMapping(max_price, 'max_price'),
      min_price: commonFilterMapping(min_price, 'min_price'),
    };

    const data = {
      from: fromFormatted,
      to: toFormatted,
      ...mappedCommonFields,
      status: status?.status || '',
      user_id: commoncookie,
      payment_type:
        payment_type === ''
          ? ''
          : payment_type.map((p) => `${p.payment_type} (INR)`),
      pageCount: 0,
      numPerPage: pagination.numPerPage,
      searchString: pagination.searchString,
    };

    const data1 = {
      from: fromFormatted,
      to: toFormatted,
      ...mappedCommonFields,
      user_id: commoncookie,
      pageCount: 0,
      numPerPage: pagination.numPerPage,
      searchString: '',
    };

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(getQuotationsActions(data, setModalTypeHandler, setLoaderStatusHandler))
    );

    setFilterOpen(false);
  };


  const clearButton = () => {
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
      numPerPage: pagination.numPerPage,
      pageCount: pagination.pageCount,
      searchString: pagination.searchString,
      // customer_id: props.customer[0]?.customer_id
    };

    const paginationData1 = {
      ...paginationData,
    };
    delete paginationData1.sale_status;

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(getQuotationsActions(paginationData1, setModalTypeHandler, setLoaderStatusHandler))
    );

    setFilters({
      from: null,
      to: null,
      dateRange: null,
      status: null,
      payment_status: null,
      filtedValue: {
        brand: '',
        category: '',
        location_id: 'null',
        payment_type: '',
        max_price: '',
        min_price: '',
      },
    });

    setFilterOpen(false);
  };

  const handleConvertSO = async(rowData) => {
    // dispatch(getAppConfigDataAction())
    dispatch(getAppConfigWithCompanyInfoAction())
    dispatch(getPriceListAction())
   
    dispatch(listStockLocationSequenceAction({sequence_type: ["SO", "DC"]}, setLoaderStatusHandler, sessionStorage.employee_id, headerLocationId))
    // dispatch(listCustomerAction())
    setDisplay('sales')
    setQuotoationId(rowData.quotation_id)
    const productsArray = Array.isArray(rowData.products) ? rowData.products : [rowData.products];
    let convertData = [{
      customer_id: rowData.customer_id,
      employee_id: commoncookie,
      comment: null,
      reference: rowData.reference,
      invoice_number: null,
      sale_status: 1,
      counter_id: null,
      work_order_number: null,
      location_id: null,
      sale_type: 0,
      note: "",
      price_list: null,
      company_name: rowData.customerCompanyName,
      sales_items: productsArray.map((prod, index) => {
        const product_items = product.find((e)=> e.item_id === prod.item_id)
        return({
          NSlots : product_items?.NSlots,
          hsn_code : product_items.hsn_code,
          is_serialized : product_items.is_serialized,
          lots : product_items.lots,
          qty_per_pack : product_items.qty_per_pack,
          sales_items_taxes : product_items.sales_items_taxes,
          stock_type : product_items.stock_type,
          taxes : product_items.taxes,
          taxes_name : product_items.taxes_name,
          sub_total : (parseFloat(prod.price) + (parseFloat(prod.price) * (getIgst(product_items.taxes) / 100))) * parseInt(prod.quantity),
          item_id: product_items.item_id,
          name: product_items.name,
          description: product_items.description,
          quantity: prod.quantity,
          item_unit_price: prod.netPrice,
          // taxes: product_items.taxes,
          line: index + 1,
          item_cost_price: product_items.cost_price,
          discount: prod.price * prod.discount / 100,
          discount_type: 0,
          print_option: 1,
          delivered_qty: 0,
          return_quantity: 0
        })
      })
    }]
    setConvertData(convertData)
  }
  const handleConvertDetailSO = async(rowData) => {
    // dispatch(getAppConfigDataAction())
    dispatch(getAppConfigWithCompanyInfoAction())
    dispatch(getPriceListAction())
   
    dispatch(listStockLocationSequenceAction({sequence_type: ["SO", "DC"]}, setLoaderStatusHandler, sessionStorage.employee_id, headerLocationId))
    // dispatch(listCustomerAction())
    // setDisplay('landingPage')
    setQuotoationId(rowData.quotation_id)
    const productsArray = Array.isArray(rowData.products) ? rowData.products : [rowData.products];
    let convertData = [{
      customer_id: rowData.customer_id,
      employee_id: commoncookie,
      comment: null,
      reference: rowData.reference,
      invoice_number: null,
      sale_status: 1,
      counter_id: null,
      work_order_number: null,
      location_id: null,
      sale_type: 0,
      note: "",
      price_list: null,
      company_name: rowData.customerCompanyName,
      sales_items: productsArray.map((prod, index) => {
        const product_items = product.find((e)=> e.item_id === prod.item_id)
        return({
          NSlots : product_items?.NSlots,
          hsn_code : product_items.hsn_code,
          is_serialized : product_items.is_serialized,
          lots : product_items.lots,
          qty_per_pack : product_items.qty_per_pack,
          sales_items_taxes : product_items.sales_items_taxes,
          stock_type : product_items.stock_type,
          taxes : product_items.taxes,
          taxes_name : product_items.taxes_name,
          sub_total : (parseFloat(prod.price) + (parseFloat(prod.price) * (getIgst(product_items.taxes) / 100))) * parseInt(prod.quantity),
          item_id: product_items.item_id,
          name: product_items.name,
          description: product_items.description,
          quantity: prod.quantity,
          item_unit_price: prod.netPrice,
          // taxes: product_items.taxes,
          line: index + 1,
          item_cost_price: product_items.cost_price,
          discount: prod.price * prod.discount / 100,
          discount_type: 0,
          print_option: 1,
          delivered_qty: 0,
          return_quantity: 0
        })
      })
    }]
    setConvertData(convertData)
  }

  const handle_newSalesAfterCreating_Data = (data) => {
    const { sale_status, location_id, comment, reference } = data;
    setNewSalesAfterCreating_Data({
        sale_status,
        location_id,
        comment,
        reference
    })
  }

  const handleSubmit = async (data, posSeq, total_cost_price, total_unit_price, gst_inter, tcs_inter, setDisable, dcchallan) => {


    let nameDeleting = data;
    nameDeleting.sales_items = data.sales_items.map(({ name, ...rest }) => {
      if (rest.is_serialized === 0) {
        return {
          ...rest,
          NSlots: [],
          lots: [],
        };
      }
      return rest;
    });

    let transactionEntryData = {
      total_cost_price,
      total_unit_price,
      total_with_gst: parseFloat(data.total) + parseFloat(tcs_inter),
      gst_inter,
      tcs_inter
    }
    const {sequence_id, dcsequence_id} = posSeq;
      nameDeleting.type =data.dc_number !== null ?'type2' : 'type1'
      delete nameDeleting.location
      nameDeleting.employee_id = sessionStorage.employee_id    

      if(data.dc_number !== null && data.sale_status !== 8){
        delete nameDeleting.location_name;
        delete nameDeleting.updated_by;
        delete nameDeleting.created_by;
        delete nameDeleting.sale_time;
        delete nameDeleting.invoice_date;
        delete nameDeleting.quote_number;
        delete nameDeleting.reference;
        delete nameDeleting.company_name;
        delete nameDeleting.customer_type;
        delete nameDeleting.ledger_id;
        delete nameDeleting.payment_type;
        delete nameDeleting.ordered_qty;
        delete nameDeleting.delivery_qty;
        delete nameDeleting.shipping_address;
        delete nameDeleting.billed_on;
        delete nameDeleting.due_amount;
        delete nameDeleting.timeLine_data;
        delete nameDeleting.due_days;
        delete nameDeleting.amount;
        delete nameDeleting.hsn_code;
        delete nameDeleting.changed_on;
        delete nameDeleting.dc_number;
      }
    await dispatch(createSalesAction(
      { ...nameDeleting, pre_order: {}, transactionEntryData, sequence_id: data.sale_status === 8 ? dcsequence_id : sequence_id, quotoationId : quotoationId },
      commoncookie,
      headerLocationId,
      setModalTypeHandler,
      setLoaderStatusHandler,
      setDisable,
      (response) => {
        if (response?.status === 200) {
          listStockLocationSequenceAction(
            { sequence_type: ['SO', 'DC'] },
            null,
            commoncookie,
            headerLocationId,
          )
          handleClose()
        }
      }
    )
  );
  handleClose()
  }

  const handleOpenMail = () => {
    setDialogOpen(false)
    setMailDialog(true)
  }

  const handleMailClose = () => {
    setMailDialog(false)
    setDialogOpen(true)
  }

  const handleCustomerDetail = async (rowData) => {
    const customerIndex = customerAsCompany.findIndex(c => c.customer_id === rowData.customer_id)

    let openData = {
      rowIndex: customerIndex,
      sales_customer_id: rowData.customer_id,
      routeFrom: "QUOTATION",
      salesOrder: "salesOrder",
      mail_configuration: mail_configuration,
      setOnbackClick: false,
      backToSales: customerDetailClose,
    }
    setDetailData(openData)
    setDetailOpen(true)
  }

  const customerDetailClose = () => {
    setDetailOpen(false)
  }

  const columns = [
    {
      title: 'Quotation#',
      field: 'quotation_number',
      flex: 1,
      render: (rowData) => {
        if(rowData.status === 'Approved'){
          return(
            <span
              style={{
                cursor: 'pointer',
                textDecoration: 'none',
                color: '#03adfc',
                display: 'inline-block',
                padding: '5px'
              }} 
              onClick={(e) => {
                e.stopPropagation();
                handleOpenQuotationDetail(rowData)
              }}
            >
              {rowData.quotation_number}
            </span>
          )
        }
        else{
          return rowData.quotation_number
        }
      }
    },
    {
      title: 'Date',
      field: 'quotation_date',
      render : (rowData)=>{
        return moment(rowData.quotation_date).format('DD/MM/YYYY')
      },
      flex: 1,
    },
    {
      title: 'Customer',
      field: 'customerCompanyName',
      flex: 1,
      render: (rowData) => (
        <div>
          <List component='nav' aria-label='main mailbox folders' disablePadding>
            <ListItem sx={{ pl: 0 }}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                {
                  <BusinessIcon />
                }
              </ListItemIcon>
              <ListItemText 
                primary={
                  <span style={{ fontSize: cellStyle.fontSize, fontWeight: cellStyle.fontWeight }}>
                    <Link
                      style={{
                        textDecoration: 'none',
                        cursor: 'pointer',
                        color: '#03adfc',
                        display: 'inline-block'
                      }}
                      onClick={(e) => {
                        e.preventDefault(); 
                        e.stopPropagation()
                        handleCustomerDetail(rowData)
                      }}
                    >
                      {rowData.customerCompanyName}
                    </Link>
                  </span>
                }
              />
            </ListItem>
          </List>
        </div>
      )
    },
    {
      title: 'Contact Person',
      field: 'first_name',
      render: rowData => {
        const first = rowData.first_name || '';
        const last = rowData.last_name || '';
        const fullName = `${first} ${last}`.trim();

        const value = fullName === '' ? '-' : fullName;
        const isDash = value === '-';

        return (
          <div style={{ paddingLeft: isDash ? '25%' : '0%', width: '100%' }}>
            {value}
          </div>
        );
      },
      flex: 1,
    },

    {
      title: 'Expiry',
      field: 'expiry',
      flex: 1,
    },
    {
      title: 'Amount',
      field: 'total',
      align: 'right', 
      cellStyle: {textAlign: 'right',  paddingRight:'10px'},
      flex: 1,
    },
    {
      title: 'Status',
      field: 'status',
      flex: 1,
      render: (rowData) => {

        let color

        if(rowData.status === 'Approved'){
          color = 'green'
        }
        else if(rowData.status === 'Rejected'){
          color = 'red'
        }
        else {
          color = 'orange'
        }

        return (
          <Chip
            label = {rowData.status}
            style = {{backgroundColor: color}}
          />
        )
      }
    },
    {
      field: 'action',
      flex: 1,
      render: (rowData) => {
        if (!salesConvert) return null; 
        return (
          <Button
            sx={{ fontSize: '12px' }}
            disabled={
              rowData.status !== 'Approved' ||
              rowData.isConverted !== 0
            }
            onClick={(e) => {
              e.stopPropagation();
              handleConvertSO(rowData);
            }}
          >
            {rowData.isConverted === 0 ? 'Convert SO' : 'Converted'}
          </Button>
        );
      }
    }
  ]
console.log("stocklocation",stocklocation);

  const handleDelete = (rowData) => {
    let data = {
      quotation_id: rowData?.quotation_id
    }
    dispatch(deleteQuotationAction(data))
    let paginationData = {};

    if (props?.customer) {
      paginationData = {
        brand: '',
        category: '',
        location_id: headerLocationId,
        max_price: '',
        min_price: '',
        payment_type: '',
        from: null,
        to: null,
        user_id: commoncookie,
        numPerPage: pagination.numPerPage,
        pageCount: pagination.pageCount,
        searchString: pagination.searchString,
        customer_id: props.customer[0]?.customer_id,
      };
    } else if (props?.type) {
      paginationData = {
        brand: '',
        category: '',
        location_id: headerLocationId,
        max_price: '',
        min_price: '',
        payment_type: '',
        from: null,
        to: null,
        user_id: commoncookie,
        numPerPage: pagination.numPerPage,
        pageCount: pagination.pageCount,
        searchString: pagination.searchString,
        type: props.index,
      };
    } else {
      paginationData = {
        brand: '',
        category: '',
        location_id: headerLocationId,
        max_price: '',
        min_price: '',
        payment_type: '',
        from: null,
        to: null,
        user_id: commoncookie,
        numPerPage: pagination.numPerPage,
        pageCount: pagination.pageCount,
        searchString: pagination.searchString,
      };
    }

    dispatch(getQuotationsActions(paginationData, setModalTypeHandler, setLoaderStatusHandler));
  }

   const selectedRole = sessionStorage.role_name
    useEffect(() => {
      if (!selectedRole) return;
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler, dispatch(getMenuAccessAction(selectedRole)));
    }, [selectedRole, dispatch]);

    const quotationCreate =  UserRightsAuthorization(menuAccess[selectedRole], 'sales__quotation', 'can_create') ;
    const quotationEdit = UserRightsAuthorization(menuAccess[selectedRole], 'sales__quotation', 'can_edit') ;
    const quotationDelete =  UserRightsAuthorization(menuAccess[selectedRole], 'sales__quotation', 'can_delete') ;
    const quotationView =  UserRightsAuthorization(menuAccess[selectedRole], 'sales__quotation', 'can_view');
     const salesConvert =  UserRightsAuthorization(menuAccess[selectedRole], 'sales__sales_orders', 'can_create') 

    const handleDetailClick = (rowData) => {
      console.log("detailssss",rowData)
    setDisplay('landingpage')
    setSelectedRow(rowData);
    setDetailsOpen(true);
    handleConvertDetailSO(rowData);
    // dispatch(quotationTimelineDataAction(rowData?.quotation_number))
  }

    const handleDetailClose = () => {
    setDetailsOpen(false);
    setDisplay("list"); 
  };

  return(
    <>
      {
        display === 'list' && detailOpen === false &&
        <>
          <Helmet>
            <meta charSet="utf-8" />
            <title> {titleURL} |  Quotations </title>
          </Helmet>
          <Card style={{ width: '100%' }}>
            <MaterialTable
              style={{height: 'calc(100vh - 85px)'}}
              totalCount = {quotations.count}
              columns = {columns}
              data = {quotations.data}
              options = {getStickyTableOptions({
                bodyOffset: 200,
                cellStyle,
                 headerStyle,
                options:{
                   rowStyle: {
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  }
                },
                filtering: false,
                actionsColumnIndex: -1,
                paging: true,
                pageSize: props.type ? 5 :  pagination.numPerPage,
                pageSizeOptions: props.type ? [5,10,15] : [20, 50, 100],
                search: false,
                tableLayout: "auto",
                toolbar: true,
                },
              })}
              page = {pagination.pageCount}
              onPageChange = {(page) => handlePageChange(page)}
              onRowsPerPageChange = {(size) => handlePageSizeChange(size)}
              onRowClick={(event,rowData) => handleDetailClick(rowData)}
              components = {{
                ...stickyTableComponents,
                Toolbar: (props) => (
                  <div>
                    <div style={{display: 'flex', width: '100%', alignItems: 'center'}}>
                      <div style={{width: '100%'}}>
                        <MTableToolbar {...props} />
                      </div>

                      <div>
                        <CommonSearch 
                          searchVal = {pagination.searchString}
                          cancelSearch = {cancelSearch}
                          requestSearch = {requestSearch}
                        />
                      </div>
                    </div>
                  </div>
                )
              }}
              actions = {[
                quotationCreate ? {
                  icon: () => <AddIcon />,
                  tooltip: 'Add',
                  isFreeAction: true,
                  onClick: handleFormOpen
                } : null,
                {
                  icon: () => (
                    <div style={{ display: 'flex' }}>
                      <FilterSalesOrder
                        fromTo={true}
                        catabrand={true}
                        from={filters.from}
                        locat={true}
                        to={filters.to}
                        count={0}
                        // product={this.props.productByType}
                        category={filters.filtedValue.category}
                        brand={filters.filtedValue.brand}
                        // list_payment_type={this.props.list_payment_type}
                        stocklocation={stocklocation}
                        filtedValue={filters.filtedValue}
                        setFilter={setFilters}
                        // brandSearch={this.brandSearch}
                        handleChange={handleChange}
                        dateRange={filters.dateRange}
                        handleClose={handleFilter}
                        open={filterOpen}
                        ApplyButton={ApplyButton}
                        clearButton={clearButton}
                        pageType={'/salesOrders'}
                      />
                    </div>
                  ),
                  tooltip: 'Filter',
                  isFreeAction: true,
                },
               ...(quotationDelete ? [ rowData => ({
                  icon: 'delete',
                  tooltip: 'Delete Quotation',
                  disabled: rowData.isConverted === 1,
                  onClick: (event, rowData) => handleDelete(rowData),
                })] : []),
              ]}
              title = 'Quotations'
            />
          </Card>

          {/* <Dialog open = {dialogOpen} maxWidth='lg' fullWidth>
            <DialogContent ref={(el) => componentRef = el} sx={{ width: '100%'}}>
              <QuotationTemp  data = {rowData} company = {quotations.companyDetails} />
            </DialogContent>

            <DialogActions>
              <Button variant='contained' color='error' onClick={() => handleDialogClose()}>Close</Button>

              <Button variant='contained' onClick={() => handleOpenMail()}>
                <MailIcon sx={{mr: 1}} />
                Send Mail
              </Button>

              <ReactToPrint
                trigger={() => (
                  <Button variant='contained'>
                    <PrintIcon sx={{mr: 1}} />
                    Print
                  </Button>
                )}
                content={() => componentRef}
              />
            </DialogActions>
          </Dialog> */}

           <ReceiptTempDialog
                  open={dialogOpen}
                  handleClose={() => setDialogOpen(false)}
                  type = {'quotation'}
                />


          <Dialog open={mailDialog} maxWidth='lg' fullWidth>
            {/* <DialogContent> */}
              <Mail handleMailClose={handleMailClose} company={quotations.companyDetails} data={rowData} setModalTypeHandler={setModalTypeHandler} setLoaderStatusHandler={setLoaderStatusHandler}/>
            {/* </DialogContent> */}
          </Dialog>
        </>
      }



      {display === 'landingpage'  &&(
        <QuotationDetailsPage
          data={selectedRow}
          handleClose={handleClose}
          handleDelete={handleDelete}
          handleSubmit={handleSubmit}
          detailstype = 'quotationdetails'
          appConfigData={appConfigData}
          setAppConfigData={setAppConfigDataFunc}
          price_list={price_list}
          product={product}
          stocklocation={stocklocation}
          newSalesAfterCreating_Data={newSalesAfterCreating_Data}
          app_config_data={app_config_data}
          edit_id_data={convertData}
          customer={customer}
          handle_newCreate = {(bool) => setIsNewSales(bool)}
          handle_newSalesAfterCreating_Data={handle_newSalesAfterCreating_Data}
          quotoationId={quotoationId}
          status='convertSO'
          type='customer'
          setModalTypeHandler={setModalTypeHandler}
          setModalStatusHandler={setModalStatusHandler}
          setcreatNewDataHandler={setcreatNewDataHandler}
          creatNewData={creatNewData}
          selectData={selectData}
          setselectData={setselectData}
          returnState={false}
          listStockLocationSequenceAction={(data, setLoaderStatusHandler, employee_id, headerLocationId) => dispatch(listStockLocationSequenceAction({ sequence_type: ["SO", "DC"] }, setLoaderStatusHandler, employee_id, headerLocationId))}
          pageType={'/salesOrders'}
          user_rights={menuAccess}
        />
      )}

      {
        display === 'form' && 
        <NewQuotationForm handleClose = {handleClose}/>
      }

      {
        display === 'sales' &&
        <NewSales 
          status='convertSO'
          setModalTypeHandler={setModalTypeHandler}
          setModalStatusHandler={setModalStatusHandler}
          setcreatNewDataHandler={setcreatNewDataHandler}
          creatNewData={creatNewData}
          selectData={selectData}
          setselectData={setselectData}
          appConfigData={appConfigData}
          setAppConfigData={setAppConfigDataFunc}
          type='customer'
          handleClose={handleClose}
          returnState={false}
          price_list={price_list}
          product={product}
          stocklocation={stocklocation}
          newSalesAfterCreating_Data={newSalesAfterCreating_Data}
          app_config_data={app_config_data}
          edit_id_data={convertData}
          listStockLocationSequenceAction={(data, setLoaderStatusHandler, employee_id, headerLocationId) => dispatch(listStockLocationSequenceAction({sequence_type: ["SO", "DC"]}, setLoaderStatusHandler, employee_id, headerLocationId))}
          customer={customer}
          handle_newCreate = {(bool) => setIsNewSales(bool)}
          handle_newSalesAfterCreating_Data={handle_newSalesAfterCreating_Data}
          handleSubmit={handleSubmit}
          quotoationId={quotoationId}
          pageType={'/salesOrders'}
        />
      }

      {
        detailOpen === true && (
          OpenCustomerLandingPage(detailData)
        )
      }
    </>
  )

}

export default QuotationTable

