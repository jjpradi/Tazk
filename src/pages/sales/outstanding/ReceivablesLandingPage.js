import React, { useEffect, useState } from 'react'
import { useCustomFetch } from 'utils/useCustomFetch';
import { Box, Card, Divider, Grid, IconButton, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import Status from 'components/erpDesign/SO/status';
import ProductTopCards from 'components/erpDesign/SO/productTopOrder';
import BillsRow from 'components/erpDesign/SO/billsRow';
import Gsttable from 'components/erpDesign/SO/purchaseTable';
import OppositeContentTimeline from 'components/erpDesign/SO/timeLine';
import API_URLS from 'utils/customFetchApiUrls';
import CloseIcon from '@mui/icons-material/Close';

const ReceivablesLandingPage = (props) => {
  const theme = useTheme();
  const [getData, setGetData] = React.useState(null);
  let finalData = getData ? getData[0] : {}

  const id = props.rowData.sale_id
  useEffect(() => { (async () => {
    const customFetch = useCustomFetch();
    const fetchData = async () => {
      try {
        let type = 'sales'
        const postBody = {};
        const { data } = await customFetch(
          API_URLS.GET_SALES_CHILD_PAGE_DETAILS(id, type),
          'POST',
          postBody
        );
        setGetData(data);
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
          {finalData?.invoice_number || ''}
        </Typography>
        <Tooltip title="Close">
          <IconButton size="small" onClick={props.rowPopupClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
        <ProductTopCards salesData={finalData} />
        <div style={{marginTop: 10}}>
          <BillsRow salesData={finalData} />
        </div>
        <div style={{marginTop: 10}}>
          <Status saleStatus={finalData?.sale_status_name} soStatus={finalData?.status} />
        </div>
        <div style={{marginTop: 10}}>
          <Gsttable
            sales_items={finalData?.sales_items}
            sales_data={finalData}
            location_name={finalData?.location_name}
            total={finalData?.total}
            shipping_address={finalData?.shipping_address}
            company_name={finalData?.company_name}
            user_name={finalData?.username}
            statusType={finalData.sale_status}
            pageType={'sales'}
          />
        </div>
        <div style={{minHeight: 200, marginTop: 10}}>
          <OppositeContentTimeline salesData={props.rowData} />
        </div>
      </Box>
    </Card>
  );
}

export default ReceivablesLandingPage
