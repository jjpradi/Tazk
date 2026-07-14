import * as React from 'react';
import TimelineDesign from '../timeline_design';
import { Box, Button } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { headerStyle } from 'utils/pageSize';

export default function OppositeContentTimeline(props) {

    const {pathname} = useLocation()

    let timeLine_data = pathname === '/sales/bills' || pathname === '/sales/purchasesOrders'
                        ? props.recevingData
                        : props.recevingData?.timeLine_data;

    const safeData = Array.isArray(timeLine_data) ? timeLine_data : [];

    // let timeLine_data = props.recevingData
    // ? props.recevingData.timeLine_data
    // : [];
  //  const vv =  timeLine_data?.map((m) => { m?.payment_amount })

    const [visibleCount, setVisibleCount] = React.useState(10);

   const handleShowMore = () => {
    setVisibleCount((prev) => prev + 10); // Show 10 more items each time
  };

  const visibleItems = safeData?.slice(0, visibleCount)
  const labelText = pathname === '/sales/bills' ? 'Bill' : 'Purchase Order';
  const formatAmount = (value) => Number(value || 0).toFixed(2);

  return (
    <React.Fragment>
      <hr />
        <h4 style={{ paddingLeft: 10, fontSize: headerStyle.fontSize, fontWeight: headerStyle.fontWeight }}>
            Timeline
        </h4>

      <Box sx={{
        '& .MuiTimeline-root': { padding: 0 },
        '& .MuiTimelineItem-root:before': { display: 'none' },
        '& .MuiTimelineOppositeContent-root': { flex: '0 0 160px', textAlign: 'left' },
      }}>
      {visibleItems?.map((m) => {
        const poOrBillNumber =   (pathname === '/sales/bills' || pathname === '/sales/payable' ) ? m.bill_number : m.po_number;
        let title =
          m.status === 'New' || m.status === 'Open' || m.status === 'Pending Payment'
            ? 'Invoice Added'
            : m.status === 'paid'
            ? 'Payment Added' 
            : m.status === 'Payment Delete'
            ? 'Payment Deleted' 
            :m.status === 'Purchase Return'
            ? 'Purchase Return'
            : 'Updated';

        let content =          m.status === 'New' || m.status === 'Pending Payment'
            ? `${labelText} ${poOrBillNumber} of amount ₹${formatAmount(m.total)}  created by ${m.username}`
            : m.status === 'Open'
            ? `${labelText} ${poOrBillNumber} of amount ₹${formatAmount(m.received_amount)}  created and mail has been sent to ${m.username}`
            : m.status === 'received'
            ? `${labelText} ${poOrBillNumber} of ordered quantity has been delivered by ${m.username}`
            : m.status === 'Payment Delete'
            ? `Receipt #${m.receipt_number} of amount ₹${formatAmount(m.payment_amount)} deleted by ${m.username}`
            : m.status === 'return' || m.status === 'Purchase Return'
            ? `${labelText} ${poOrBillNumber} was returned by ${m.username}`
            : `Receipt #${m.receipt_number} of amount ₹${formatAmount(m.payment_amount)} paid by ${m.username}`;
        return <TimelineDesign m={m} title={title} content={content} />;
      })}
      </Box>

      {visibleCount < timeLine_data?.length && (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <Button variant="outlined" onClick={handleShowMore}>
                    Show More
                  </Button>
                </div>
              )}
    </React.Fragment>
  );
}
