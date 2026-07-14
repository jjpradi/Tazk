import React from 'react'
import TimelineDesign from 'components/ledger_erpDesign/timeline_design';
import { Button } from '@mui/material';
import { headerStyle } from 'utils/pageSize';

const QuotationTimeline = ({ data }) => {
  const timeLine_data = Array.isArray(data) ? data : [];

  const [visibleCount, setVisibleCount] = React.useState(10);

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  // prepare visible items
  const visibleItems = timeLine_data.slice(0, visibleCount);

  return (
    <React.Fragment>
     <h4  style={{paddingLeft: 10 , fontSize:headerStyle.fontSize,fontWeight:headerStyle.fontWeight}}>TimeLine</h4>
      {visibleItems?.map((m) => {
        const blocks = [];

        // Quotation created block
        if (m.status === 'quotation') {
          blocks.push(
            <TimelineDesign
              key={`${m.timeline_id}-created`}
              m={m}
              title="Quotation"
              content={`Quotation ${m.quotation_number} of quantity ${m.quantity} created for ${m.company_name}`}
            />
          );

          // If converted, add another block right after
          if (m.isConverted === 1) {
            blocks.push(
              <TimelineDesign
                key={`${m.timeline_id}-converted`}
                m={m}
                title="Converted"
                content={`Quotation ${m.quotation_number} has been converted to SO by ${m.first_name}`}
              />
            );
          }
        } else {
          // fallback if status is already 'converted'
          blocks.push(
            <TimelineDesign
              key={`${m.timeline_id}-converted-only`}
              m={m}
              title="Converted"
              content={`Quotation ${m.quotation_number} has been converted to SO by ${m.first_name}`}
            />
          );
        }

        return blocks;
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
};

export default QuotationTimeline;
