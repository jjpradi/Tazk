import * as React from 'react';
import TimelineDesign from './timeline_design';
import { Button } from '@mui/material';

export default function OppositeContentTimeline(props) {
  let timeLine_data = props.productData ? props.productData.timeLine_data : [];

      const [visibleCount, setVisibleCount] = React.useState(10);

   const handleShowMore = () => {
    setVisibleCount((prev) => prev + 10); // Show 10 more items each time
  };

  const visibleItems = timeLine_data.slice(0, visibleCount)

  return (
    <React.Fragment>
      <h4 style={{paddingLeft: 10}}>TimeLine</h4>
      {visibleItems?.map((m) => {
        let title = m.status === 'sales' ? 'Sales Order' : 'Purchase Order';

        let content =
          m.status === 'sales'
            ? `${m.quantity} Quantity of ${m.name} product has been sold to ${m.customer_name}`
            : `${m.quantity} Quantity of ${m.name} product has been purchased from ${m.vendor_name}`;

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
