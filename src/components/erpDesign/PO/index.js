import React, {useEffect, useState, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Grid, IconButton, Tooltip, Button, Typography, Divider, Stack, useTheme} from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from '@mui/icons-material/Close';
import OptionButton from './actionButton';
import ProductTopCards from './productTopOrder';
import {getProductErpDetails} from '../../../redux/actions/erpDetails_actions';
import PurchaseCard from './billsRow';
import PurchaseTable from './purchaseTable';
import StatusCard from './status';
import TimeLine from './timeline';
import { useLocation } from 'react-router-dom';
import { supplierTimelineDataAction } from 'redux/actions/purchase_actions';
import API_URLS from 'utils/customFetchApiUrls';
import { useCustomFetch } from 'utils/useCustomFetch';
import ReceiptTableLanding from 'components/ReceiptTableLanding';

export default function App({
  rowIndex, type, handleEdit, handleDelete, receivings_items, handleClose,
  rowPopupClose, cnhandleOpen, ledgerReturnApi, from, to, filtedValue,
  responseType, page, pageSize, exportValue, searchVal, pathnameType
}) {
  const ref1 = useRef(null);
  const dispatch = useDispatch();
  const theme = useTheme();
  const {
    productReducer: {product},
    erpDetailsReducer: {product_erp_details},
    purchasesReducer: {purchases_id_data, purchases, purchases_filter, purchasesByPagination, searchPurchaseData, supplierTimelineData},
  } = useSelector((state) => state);

  const [index, setIndex] = useState(rowIndex);
  const [receiving_id, setReceiving_id] = useState('');
  const [recevingData, setRecevingData] = useState({});
  const [receiptData, setReceiptData] = useState([])

  const customFetch = useCustomFetch()
  const location = useLocation();
  const { pathname } = location;

  const display_data = (purchasesByPagination && purchasesByPagination.length > 0) || searchVal.length > 0
    ? purchasesByPagination || []
    : purchases || [];

  const func1 = async() => {
    if (index !== '' && Array.isArray(display_data) && display_data[index]) {
      const receiving_id = display_data[index]?.receiving_id;
      setReceiving_id(receiving_id);
      setRecevingData(display_data[index]);
      if (pathnameType === '/sales/purchasesOrders') {
        dispatch(supplierTimelineDataAction('PO', receivings_items[0]?.po_id))
      } else if (pathnameType === '/sales/bills') {
        dispatch(supplierTimelineDataAction('Bills', receivings_items[0]?.receiving_id))
        const { data } = await customFetch(
          API_URLS.GET_RECEIPT_DATA_BY_SALES_PURCHASE('payments', receivings_items[0]?.receiving_id),
          'GET'
        )
        setReceiptData(data)
      }
    } else {
      setReceiving_id('');
      setRecevingData({});
    }
  };

  ref1.current = func1;

  useEffect(() => {
    ref1.current();
  }, [index, rowIndex, purchasesByPagination, searchPurchaseData]);

  const handleChange = (option) => {
    if (pathnameType === '/sales/purchasesOrders') {
      if (option === 0) handleDelete(recevingData);
      else if (option === 1) handleEdit(recevingData, false, index, true);
      else if (option === 2) handleEdit(recevingData, true, index, true);
    } else if (pathnameType === '/sales/bills') {
      if (option === 0) handleDelete(recevingData);
      else if (option === 2) handleEdit(recevingData, true, index, true);
    }
  };

  const docNumber = recevingData?.po_number || recevingData?.invoice_number || '';

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
            cnhandleOpen={cnhandleOpen}
            ledgerReturnApi={ledgerReturnApi}
            handleChange={handleChange}
            handleClose={rowPopupClose}
            receivings_items={recevingData?.receivings_items}
            recevingData={recevingData}
            from={from}
            to={to}
            filtedValue={filtedValue}
            responseType={'cashOut'}
            page={page}
            pageSize={pageSize}
            exportValue={exportValue}
            pathType={pathname}
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
              <IconButton size="small" disabled={display_data?.length - 1 === index} onClick={() => setIndex(index + 1)}>
                <ArrowForwardIosIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Close">
            <IconButton size="small" onClick={rowPopupClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* ---- Scrollable Content ---- */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
        <ProductTopCards recevingData={recevingData} />

        <div style={{marginTop: 10}}>
          <PurchaseCard recevingData={recevingData} pathnameType={pathnameType} billsData={supplierTimelineData} />
        </div>
        <div style={{marginTop: 10}}>
          <StatusCard recevingData={recevingData} />
        </div>

        <div style={{marginTop: 10}}>
          <PurchaseTable
            company_name={recevingData?.company_name}
            location_name={recevingData?.location_name}
            receivings_items={recevingData?.receivings_items}
            invoiceNumber={recevingData?.invoice_number}
            total={recevingData?.total}
            shipping_address={recevingData?.shipping_address}
          />
        </div>

        {
          pathnameType === '/sales/bills' &&
          <div style={{marginTop: 10}}>
            <ReceiptTableLanding
              data={receiptData}
              title='Payments'
            />
          </div>
        }

        <div style={{minHeight: 200, marginTop: 10}}>
          <TimeLine recevingData={supplierTimelineData} />
        </div>
      </Box>
    </Card>
  );
}
