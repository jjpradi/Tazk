import { Box, Card, Divider, Grid, IconButton, Stack, Tooltip, Typography, useTheme } from '@mui/material'
import BillsRow from 'components/erpDesign/PO/billsRow'
import ProductTopCards from 'components/erpDesign/PO/productTopOrder'
import Gsttable from 'components/erpDesign/PO/purchaseTable'
import StatusCard from 'components/erpDesign/PO/status'
import OppositeContentTimeline from 'components/erpDesign/PO/timeline'
import CreateNewButtonContext from 'context/CreateNewButtonContext'
import React, { useContext, useEffect, useState } from 'react'
import API_URLS from 'utils/customFetchApiUrls'
import { useCustomFetch } from 'utils/useCustomFetch'
import CloseIcon from '@mui/icons-material/Close'

const PayablesLandingPage = (props) => {
  const theme = useTheme();
  const {
    setModalTypeHandler, setLoaderStatusHandler, commoncookie, headerLocationId
  } = useContext(CreateNewButtonContext);

  const [recevingData, setRecevingData] = useState()
  const id = props.rowData.receiving_id

  useEffect(() => { (async () => {
    const customFetch = useCustomFetch();
    const fetchData = async () => {
      try {
        const postBody = {
          brand: '', category: '', location_id: headerLocationId, supplier_id: '',
          statusfilter: '', max_price: '', min_price: '', product_name: '',
          from: null, to: null, user_id: commoncookie, pageCount: 0, numPerPage: 20,
          purchase_status: 'All', receiving_id: id
        };
        const { data } = await customFetch(
          API_URLS.GET_PURCHASE_PAGINATION(commoncookie, headerLocationId),
          'POST', postBody
        );
        const { data: timelineData } = await customFetch(API_URLS.GET_BILLS_TIMELINE('Bills', id), 'GET')
        setRecevingData({...data.data[0], timeLine_data: timelineData});
      } catch (err) {
        console.error('Error fetching sales details:', err);
      }
    };
    if (id) { fetchData(); }
  })();
  }, [id]);

  return (
    <Card sx={{ height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 2.5, py: 1,
        borderBottom: `2px solid ${theme.palette.primary.main}`,
        bgcolor: `${theme.palette.primary.main}08`,
        flexShrink: 0,
      }}>
        <Typography component="span" sx={{ fontWeight: 600, fontSize: 14, color: theme.palette.primary.main }}>
          {recevingData?.invoice_number || recevingData?.po_number || ''}
        </Typography>
        <Tooltip title="Close">
          <IconButton size="small" onClick={props.rowPopupClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
        <ProductTopCards recevingData={recevingData} />
        <div style={{marginTop: 10}}>
          <BillsRow recevingData={recevingData} />
        </div>
        <div style={{marginTop: 10}}>
          <StatusCard recevingData={recevingData} />
        </div>
        <div style={{marginTop: 10}}>
          <Gsttable
            company_name={recevingData?.company_name}
            location_name={recevingData?.location_name}
            receivings_items={recevingData?.receivings_items}
            invoiceNumber={recevingData?.invoice_number}
            total={recevingData?.total}
            shipping_address={recevingData?.shipping_address}
          />
        </div>
        <div style={{minHeight: 200, marginTop: 10}}>
          <OppositeContentTimeline recevingData={recevingData} />
        </div>
      </Box>
    </Card>
  );
}

export default PayablesLandingPage
