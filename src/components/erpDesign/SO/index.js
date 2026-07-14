import React, {useEffect, useState, useRef, useContext} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {
  Grid,
  IconButton,
  Tooltip,
  Typography,
  Button,
  Select,
  InputLabel,
  MenuItem,
  FormControl,
  Divider,
  Stack,
  useTheme,
} from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Masonry from '@mui/lab/Masonry';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from '@mui/icons-material/Close';
import OptionButton from './actionButton';
import ProductTopCards from './productTopOrder';
import {
  CancelinvoiceSalesAction,
  getErpSaleDetails,
  updateSalesAction,
  listSalesPaginateAction
} from '../../../redux/actions/sales_actions';
import PurchaseCard from './billsRow';
import Status from './status';
import PurchaseTable from './purchaseTable';
import {Close} from '@mui/icons-material';
import context from '../../../context/CreateNewButtonContext';
import TimeLine from './timeLine';
import apiCalls from 'utils/apiCalls';
import { useCustomFetch } from 'utils/useCustomFetch';
import { useNavigate } from 'react-router-dom';
import API_URLS from '../../../utils/customFetchApiUrls';
import ReceiptTableLanding from '../../ReceiptTableLanding'

export default function App({
  rowIndex,
  type,
  handleEdit,
  handleDelete,
  sales_items,
  handleClose,
  rowPopupClose,
  // allFunctionsReturn,
  invoiceFunction,
  responseType,
  salesByPagination, // from sales
  cancelInvoiceUpdate,
  searchSalesData,
  searchVal,
  transactionRowData,selectedSaleStatus,pageType,
  handleSOEdit,
  soToInvoiceId
}) {
  const ref1 = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    salesReducer: {sales, erp_sale_data},
  } = useSelector((state) => state);

  const [index, setIndex] = useState(rowIndex);
  const [salesData, setSalesData] = useState({});
  const [saleStatus, setSaleStatus] = useState('');
  const [sale_id, setSale_id] = useState('');
  const [receiptData, setReceiptData] = useState([])
  const {
    setModalStatusHandler,
    setModalTypeHandler,
    selectData,
    setselectData,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(context);

  // console.log("salesByPagination",salesByPagination)
  
  const func1 = () => {
    if (index !== '') {
      if (searchVal && searchSalesData.length) {
        const item_id = searchSalesData[index]?.sale_id || searchSalesData[index]?.order_id || searchSalesData[index]?.dc_id ;
        setSale_id(item_id);
        setSalesData(searchSalesData[index]);
      }  else if (salesByPagination && salesByPagination.length > index) {
      const item_id = salesByPagination[index]?.sale_id || salesByPagination[index]?.order_id || salesByPagination[index]?.dc_id;
      setSale_id(item_id);
      setSalesData(salesByPagination[index]);
    }
  }
  };

    const id = salesData?.sale_id || salesData?.order_id || salesData?.dc_id;
    const [getData, setGetData] = React.useState(null);
    let finalData = getData ? getData[0] : {}
    let nextCheck = searchSalesData?.length ? searchSalesData : salesByPagination

    React.useEffect(() => { (async () => {
       const customFetch = useCustomFetch();
      //  console.log(finalData,id,'finalakl2')
      const fetchData = async () => {
        // console.log(finalData,id,'finalakl1')
        try {
          let type = pageType === '/sales/salesOrders' ? 'salesOrders' : pageType === '/sales/deliveryChallan' ? 'deliveryChallan'  : 'sales'
          const postBody = salesData?.return_id ? { return_id: salesData?.return_id } : {};
          //  console.log("type",type)
          const { data } = await customFetch(
            API_URLS.GET_SALES_CHILD_PAGE_DETAILS(id, type),
            'POST',
            postBody
          );
          if(pageType === '/sales/invoices'){
            const { data } = await customFetch(
              API_URLS.GET_RECEIPT_DATA_BY_SALES_PURCHASE('sales', id),
              'GET'
            )
            setReceiptData(data)
          }

    // console.log(finalData,id, data,'finalakl')
          setGetData(data);
        } catch (err) {
          console.error('Error fetching sales details:', err);
        }
      };
  
      if (id) {
        fetchData();
      }
    })();
}, [id]);

    React.useEffect(() => { (async () => {
  const customFetch = useCustomFetch();
  
  const fetchTransactionData = async () => {
    try {
      console.log(transactionRowData, 'transactionRowData before API call');
      let type = 'sales'
       const { data } = await customFetch(
        API_URLS.GET_SALES_CHILD_PAGE_DETAILS(transactionRowData?.sale_id, type),
        'POST',
        {}
      );
      console.log(data, 'transaction data after API call');
      setGetData(data);
    } catch (err) {
      console.error('Error fetching transaction sale details:', err);
    }
  };
  
  if (transactionRowData && transactionRowData.sale_id) {
    fetchTransactionData();
  }
})();
}, [transactionRowData]);

useEffect(() => {
  setSaleStatus(salesData?.sale_status);
}, [salesData]);

ref1.current = func1;
  useEffect(() => {
    ref1.current();
  }, [index, salesByPagination]);

  const handlecancel = (sale_id, salesData) =>{
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        CancelinvoiceSalesAction(
          sale_id,
          salesData,
          setModalTypeHandler,
          setLoaderStatusHandler,
          () => {},
          (response)=>{
            if (response === 200) {
              rowPopupClose()
              cancelInvoiceUpdate()
            }
          }
        ),
      )
    );
  }
  const handleChange = (option) => {
    setSaleStatus(option);
    console.log('optionssss', option)
    if (option === 2) {
      handleEdit(sale_id, option);
    } else if (option === 8) {
      handleDelete(sale_id);
    } else if (option === 9) {
      handleEdit(sale_id, null, true);
    } else if(option === 7){
      handlecancel(sale_id, salesData)
    }
    else if(option === 10){
      handleSOEdit(sale_id)
    }
     else {
      const data1 = salesData;
      data1.sale_status = option;

      const data = {
        sale_status: option,
        customer_id: data1.customer_id,
        sale_id: data1.sale_id,
        status_change: 'true',
      };
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(
          updateSalesAction(
            sale_id,
            data,
            setModalTypeHandler,
            setLoaderStatusHandler,
            () => {},
            commoncookie,
            headerLocationId,
          ),
        )
      );
      setSalesData(data1);
    }
  };

  const itemData = [
    {
      img: 'https://images.unsplash.com/photo-1589118949245-7d38baf380d6',
      title: 'Bike',
    },
  ];

  const theme = useTheme();
  const docNumber = finalData?.invoice_number || finalData?.so_number || finalData?.dc_number || '';
  const handleCloseClick = () => {
    if (transactionRowData && Object.keys(transactionRowData).length > 0) {
      navigate(-1)
    } else {
      rowPopupClose()
    }
  };

  return (
    <Card sx={{ height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
      {/* ---- Top Action Bar ---- */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 2.5, py: 1,
        borderBottom: `2px solid ${theme.palette.primary.main}`,
        bgcolor: `${theme.palette.primary.main}08`,
        flexShrink: 0,
      }}>
        <Typography component="span" sx={{ fontWeight: 600, fontSize: 14, color: theme.palette.primary.main }}>
          {docNumber}
        </Typography>

        <Stack direction="row" alignItems="center" spacing={0.5}>
          <OptionButton
            sales_items={salesData?.sales_items || []}
            salesData={salesData}
            handleChange={handleChange}
            sale_status={salesData?.sale_status}
            invoiceFunction={invoiceFunction}
            payment={salesData?.due_amount}
            responseType={responseType}
            selectedSaleStatus={selectedSaleStatus}
            soToInvoiceId={soToInvoiceId}
            getData={getData}
          />

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <Tooltip title='Previous'>
            <span>
              <IconButton size="small" disabled={index === 0} onClick={() => setIndex(index - 1)}>
                <ArrowBackIosNewIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title='Next'>
            <span>
              <IconButton size="small" disabled={nextCheck?.length - 1 === index} onClick={() => setIndex(index + 1)}>
                <ArrowForwardIosIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Close">
            <IconButton size="small" onClick={handleCloseClick}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* ---- Scrollable Content ---- */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
        <ProductTopCards salesData={finalData} />

        <div style={{marginTop: 10}}>
          <PurchaseCard salesData={finalData} />
        </div>

        <div style={{marginTop: 10}}>
          <Status saleStatus={finalData?.sale_status_name} soStatus={finalData?.status} />
        </div>

        <div style={{marginTop: 10}}>
          <PurchaseTable
            sales_items={finalData?.sales_items}
            sales_data={finalData}
            location_name={finalData?.location_name}
            total={finalData?.total}
            shipping_address={finalData?.shipping_address}
            company_name={finalData?.company_name}
            user_name={finalData?.username}
            statusType={finalData.sale_status}
            pageType={pageType}
          />
        </div>

        {
          pageType === '/sales/invoices' &&
          <div style={{marginTop: 10}}>
            <ReceiptTableLanding
              data={receiptData}
              title='Receipts'
            />
          </div>
        }

        <div style={{minHeight: 200, marginTop: 10}}>
          <TimeLine salesData={salesData} />
        </div>
      </Box>
    </Card>
  );
}
