import * as React from 'react';
import TimelineDesign from '../timeline_design';
import { useCustomFetch } from 'utils/useCustomFetch';
import { Box, Button } from '@mui/material';
import { headerStyle } from 'utils/pageSize';
import API_URLS from '../../../utils/customFetchApiUrls';
import { useLocation } from 'react-router-dom';

export default function OppositeContentTimeline(props) {
  console.log("props.salesData",props.salesData)
  const id = props.salesData?.sale_id || props.salesData?.order_id || props.salesData?.dc_id;
  const [getData, setGetData] = React.useState(null);
  const {pathname} = useLocation();

  React.useEffect(() => { (async () => {
     const customFetch = useCustomFetch();
    const fetchData = async () => {
      try {
        const type = props.salesData?.sale_id ? 'sales' : props.salesData?.dc_id ? 'deliveryChallan' : 'saleOrder'
         const postBody = props.salesData?.return_id ? { return_id: props.salesData?.return_id } : {};
        const { data } = await customFetch(
          API_URLS.GET_SALES_TIMELINE_DETAILS(id, type),
          'POST',
          postBody
        );
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
  
  // console.log("getData",getData)

  const timeLine_data = getData || [];

    const [visibleCount, setVisibleCount] = React.useState(10);

   const handleShowMore = () => {
    setVisibleCount((prev) => prev + 10); // Show 10 more items each time
  };

  const visibleItems = timeLine_data.slice(0, visibleCount)


  return (
    <React.Fragment>
      <hr></hr>
      <h4  style={{paddingLeft: 10 , fontSize:headerStyle.fontSize,fontWeight:headerStyle.fontWeight}}>Timeline</h4>
      <Box sx={{
        '& .MuiTimeline-root': { padding: 0 },
        '& .MuiTimelineItem-root:before': { display: 'none' },
        '& .MuiTimelineOppositeContent-root': { flex: '0 0 160px', textAlign: 'left' },
      }}>
      {visibleItems?.map((m) => {

        let status_description =
          m.status === 1
            ? 'Sales Order'
            : m.status === 2
            ? 'Sales Invoice'
            : m.status === 3
            ? 'On Hold'
            : m.status === 4
            ? 'Ready To Ship'
            : m.status === 5
            ? 'In Transit'
            : m.status === 6
            ? 'Delivered'
            : m.status === 8
            ? 'Delivery Challan'
            :  m.status === 11 ? 'Credit Noted Added' : (m.status === 12 || m.status === 14 )  ? 'Return' 
            : m.status === 20 ? 'Receipt Deleted' 
            : m.status === 21 ? 'Cheque Update' : 'Cancelled';

        let title =
          m.status === 2
            ? 'Invoice Added'
            : m.status === 10
            ? 'Payment Added'
            : m.status === 1
            ? 'Sales Order'
            : m.status === 8
            ? 'Delivery Challan' : m.status === 11 ? 'Credit Note Added' : (m.status=== 11 || m.status === 12  || m.status === 14)  ? 'Return' : m.status === 12 ? 'Sales Order Updated'
            : m.status === 20 ? 'Receipt Deleted' 
            : m.status === 21 ? 'Cheque Update'
            : 'Updated';

        let content =
          m.status === 2
            ? `Invoice ${m.invoice_number || m.dc_number} of amount ₹${m.sale_total || m.total} created by ${m.username} `
            : m.status === 10
            ? `Receipt #${m.receipt_number} of amount ₹${m.payment_amount}  Received by ${m.username}`
            : m.status === 1
            ? `Sales Order ${m.so_number} created by ${m.username}`
            : m.status === 8
            ? `Delivery Challan ${m.dc_number} created by ${m.username}` :  m.status === 11 ? `Credit Note #${m.sequence_number} of amount ₹${m.total} Added by ${m.username || ''}`
            :(m.status=== 11 || m.status === 12  || m.status === 14 ) ? `${'Delivery Challan'} ${m.dc_number || ''} Returned by ${m.username}`  :   m.status === 19 ? `Sales Order ${m.so_number} has been updated by ${m.username}`
            : m.status === 7
            ? `${m.invoice_number ? 'Invoice' : 'Delivery Challan'} ${m.invoice_number || m.dc_number || ''} Cancelled by ${m.username}`
            : m.status === 20 ? `Receipt #${m.receipt_number} of amount ₹${m.payment_amount} has been deleted` 
            : m.status === 21 ? m.description 
            :`Invoice ${m.invoice_number} marked as ${status_description} by ${m.username} `;

            if (pathname === '/sales/salesOrders' && (m.status === 2 || m.status === 10)) {
              return null;
            }

        return <TimelineDesign m={m} title={title} content={content} />;
      })}
      </Box>

      {visibleCount < timeLine_data.length && (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <Button variant="outlined" onClick={handleShowMore}>
                    Show More
                  </Button>
                </div>
              )}
    </React.Fragment>
  );
}
