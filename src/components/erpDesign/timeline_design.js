import * as React from 'react';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import CardTemplate from '../customer_erpDesign/cardTemplate';
import {getDateTime} from '../../utils/getTimeFormat';
import moment from 'moment';
import { Typography } from '@mui/material';

export default function OppositeContentTimeline({ m, title, content,contactType }) {
// console.log( m, title, content,contactType,"sfgfgr33");
  const updatedValue = m.updatedAt || m.updated_at;
  return (
    <React.Fragment>
      <Timeline position='alternate' align='left'>
        <TimelineItem>
        <TimelineOppositeContent
  sx={{
    flex: 0.3, 
    textAlign: 'right', 
    padding: '0.5rem 1rem',
    fontSize:'12px',
    fontWeight: 'bold'
  }}
  color="text.secondary"
>
  {moment(updatedValue).isValid() && contactType !== 'Customer' ? (
    <>
      <div>{moment.utc(updatedValue).format('DD/MM/YYYY hh:mm A')}</div>
      {/* <div>{moment(m.updated_at).format('hh:mm A')}</div> */}
    </>
  ) : (
    <div>{updatedValue}</div>
  )}
</TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot style={{backgroundColor:"#427fbd"}} />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <CardTemplate
              cardTitle={title}
              value={content}
              v1={'subtitle2'}
              v2={'body1'}
            />
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    </React.Fragment>
  );
}
