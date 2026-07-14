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
import { Typography } from '@mui/material';

export default function OppositeContentTimeline({m, title, content}) {
  return (
    <React.Fragment>
      {/* <Typography variant='h6' style={{paddingLeft: 10 }}>TimeLine</Typography> */}
      <Timeline position='alternate' align='left'>
        <TimelineItem>
          <TimelineOppositeContent sx={{flex: 0.1}} color='text.secondary'>
            {m.updated_at ? m.updated_at : ''}
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot />
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
