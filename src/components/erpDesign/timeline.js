import * as React from 'react';
import { headerStyle } from 'utils/pageSize';
import TimelineDesign from './timeline_design';
import { Button } from '@mui/material';

export default function OppositeContentTimeline(props) {
  let timeLine_data = props.productData ? props.productData : [];

      const [visibleCount, setVisibleCount] = React.useState(10);
  
     const handleShowMore = () => {
      setVisibleCount((prev) => prev + 10); // Show 10 more items each time
    };
  
    const visibleItems = timeLine_data.slice(0, visibleCount)

  return (
    <React.Fragment>
      <hr />
      <h4  style={{paddingLeft: 10 , fontSize:headerStyle.fontSize,fontWeight:headerStyle.fontWeight}}>TimeLine</h4>
      {visibleItems?.map((m) => {
        let title = m.status === 'salesOrder' ? 'Sales Order' : m.status === 'sales' ? 'Invoice' : m.status === 'purchase' ? 'Bills' : m.status === 'purchase - po' ? 'Purchase Order' : m.status === 'quotation' ? 'Quotation': m.status === 'purchase return' ? 'Bills Return' : 'Delivery Challan';

        let content =
          m.status === 'sales'
            ? ` ${`Invoice ${(m.invoice_number)} `+ '.'}   ${m.quantity} Quantity of ${m.name} product has been sold to ${m.customer_name}`
          : m.status === 'salesOrder'
            ? ` ${`Sales Order ${(m.so_number)} `+ '.'}   ${m.quantity} Quantity of ${m.name} product has been ordered by ${m.customer_name}`
          : m.status === 'purchase'
            ? ` ${`Bills ${(m.bill_number)} `+ '.'}   ${m.quantity} Quantity of ${m.name} product has been purchased from ${m.vendor_name}`
          : m.status === 'purchase - po'
            ? ` ${`Purchase Order ${(m.po_number)} `+ '.'}   ${m.quantity} Quantity of ${m.name} product has been ordered from ${m.vendor_name}`
            : m.status === 'quotation' ? `Quotation ${m.quotation_number} has been created to ${m.customer_name} `
            : m.status === 'purchase return' 
              ? ` ${`Bills ${(m.bill_number)} `+ '.'}   ${m.quantity} Quantity of ${m.name} product has been returned by ${m.vendor_name}`
            : ` ${ m.dc_number === "" ?  "" : "Delivery Challan " + m.dc_number + '.'}   ${m.quantity} Quantity of ${m.name} product has been sold to ${m.customer_name}`;

        return <TimelineDesign m={m} title={title} content={content} />;
      })}

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
