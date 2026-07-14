import React from 'react';
import { Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import moment from 'moment';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';

const EventTimeline = ({ events }) => {
  return (
    <Timeline position='right'>
      {events.map((event, index) => (
        <TimelineItem key={index}>
          <TimelineOppositeContent
            color="text.secondary"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
          >
            <Typography variant="body2">
              {event.date}
            </Typography>
            <Typography variant="body2">
              {event.time}
            </Typography>
          </TimelineOppositeContent>
           <TimelineSeparator style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <TimelineDot style={{ backgroundColor: '#427fbd' }} />
            {index < events.length -1 && <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent>
            <div style={{ padding: '10px', background: '#f9f9f9', borderRadius: '8px', boxShadow: '0 4px 4px rgba(0, 0, 0, 0.1)' }}>
              <Typography variant="h5" component="h3" style={{ margin: 0 }}>
                {event.title}
              </Typography>
              <Typography>{event.description}</Typography>
            </div>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};

const TimeLine = () => {
  const { retailServiceReducer: { editdata } } = useSelector((state) => state);
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  let events = [];

  if (editdata?.service_id && type === 'edit') {
    if (editdata?.logs?.length > 0) {
      events = editdata.logs.map((v) => ({
        date: moment(v.createdAt).format('DD/MM/YYYY'),
        time: moment(v.createdAt).format('h:mm A'), // Separate time
        title: '',  // You can set titles if needed
        
        description: v.log,
      }));
    }
  }

  return (
    
      <div style={{ textAlign: 'left' }}>
        <Typography style={{ fontSize: '20px', color: 'black', textAlign: 'center' }}>Timeline</Typography>
        <div style={{ height: '1116px', overflowY: 'auto', margin: '0 auto', maxWidth: '800px' }}>
          <EventTimeline events={events} />
        </div>
      </div>
  );
};

export default TimeLine;
