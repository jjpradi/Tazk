import * as React from 'react';
import TimelineDesign from '../../../../src/components/erpDesign/timeline_design';
import { Button } from '@mui/material';

export default function OppositeContentTimeline(props) {
  let timeLine_data = props.timeLineContent
    ? props.timeLineContent
    : [];

    const [visibleCount, setVisibleCount] = React.useState(10);

   const handleShowMore = () => {
    setVisibleCount((prev) => prev + 10); // Show 10 more items each time
  };

  const visibleItems = timeLine_data.slice(0, visibleCount)
  return (
    <React.Fragment>
      <h4 style={{ paddingLeft: 10 }}>TimeLine</h4>

      {timeLine_data?.map((m) => {
        // console.log('TYTT',m);
        let title = m.content_type

        let content = m.content_type === 'Request' ? m.content : `${m.content} by ${m.first_name}`

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
