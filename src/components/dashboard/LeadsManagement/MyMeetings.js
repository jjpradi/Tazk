import React, {useContext, useEffect, useState} from 'react';
import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import {Card, Typography} from '@mui/material';
import {formatTime12Hour, maxBodyHeight} from 'utils/pageSize';
import {useDispatch, useSelector} from 'react-redux';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {
  getSearchMeetingsAction,
  ListMeetings,
  setSearchMeetingsAction,
} from 'redux/actions/meetings_actions';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import moment from 'moment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { ExportCsv, ExportPdf } from '@material-table/exporters';

const MyMeetings = (props) => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(true);

  const {setModalTypeHandler, setLoaderStatusHandler} = useContext(
    CreateNewButtonContext,
  );

  const {
    MeetingsReducers: {meetingsList, meetingsListCount},
  } = useSelector((state) => state);

  const [paginateData, setPaginateData] = useState({
    searchString: '',
    pageCount: 0,
    pageSize: 5,
  });

  const [showForm, setShowForm] = useState(false);

  const columnMeetings = [
    {
      field: 'name',
      title: 'Name',
    },
    {
      field: 'subject',
      title: 'Subject',
    },
    {
      field: 'from_dateTime',
      title: 'From',
      render: (rowData) => {
        const [date, time] = `${rowData.from_dateTime}`.split(' ');
        const formattedDate = moment(date).format('DD/MM/YYYY');
        const formattedTime = formatTime12Hour(time);
        return `${formattedDate} ${formattedTime}`;
      },
    },
    {
      field: 'to_dateTime',
      title: 'To',
      render: (rowData) => {
        const [date, time] = `${rowData.to_dateTime}`.split(' ');
        const formattedDate = moment(date).format('DD/MM/YYYY');
        const formattedTime = formatTime12Hour(time);
        return `${formattedDate} ${formattedTime}`;
      },
    },
    {
      field: 'host_firstName',
      title: 'Host',
      render: (rowData) => {
        const fullName = rowData.host_lastName
          ? `${rowData.host_firstName} ${rowData.host_lastName}`
          : rowData.host_firstName;
        return fullName;
      },
    },
    {
      field: 'participants',
      title: 'Participants',
    },
    {
      field: 'relatedTo',
      title: 'Related',
    },
    {
      field: 'meetingLead_name',
      title: 'Lead',
    },
    {
      field: 'description',
      title: 'Description',
    },
    {
      field: 'repeat',
      title: 'Repeat',
      render: (rowData) => {
        if (rowData.repeat === 1) {
          return <DoneIcon sx={{color: 'green'}} />;
        } else {
          return <CloseIcon sx={{color: 'red'}} />;
        }
      },
    },
    {
      field: 'repeatDate',
      title: 'Repeat Date',
      render: (rowData) => {
        if (rowData.repeatDate !== null) {
          const [date, time] = `${rowData.repeatDate}`.split(' ');
          const formattedDate = moment(date).format('DD/MM/YYYY');
          const formattedTime = formatTime12Hour(time);
          return `${formattedDate} ${formattedTime}`;
        } else {
          return '-';
        }
      },
    },
    {
      field: 'duration',
      title: 'Repeat Duration',
      render: (rowData) => {
        if (rowData.duration !== null) {
          return rowData.duration;
        } else {
          return '-';
        }
      },
    },
  ];

  // useEffect(() => {
  //   const payload = {
  //     type: 'Dashboard'
  //   };
  //   dispatch(ListMeetings(payload));
  // }, []);

  const handleOpen = () => {
    setShowForm(true);
  };

  useEffect(() => {
    if (props?.mode === 'edit') {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [props?.mode]);

  return (
    <>
      <style>
        {`
            ::-webkit-scrollbar-button {
                display : none
            }
            ::-webkit-scrollbar {
                width : 10px
            }
            ::-webkit-scrollbar-thumb {
                background-color : #888
                border-radius : 10px
            }
            ::-webkit-scrollbar-thumb:hover {
                background-color : #555
            }
        `}
      </style>
      {
        // <Card
        //   sx={{width: '100%', height: '100%', overflow: 'auto'}}
        // >
          <MaterialTable
            // style={{height: '100%'}}
            columns={columnMeetings}
            data={props.data?.[0]?.myMeetings || []}
            options={{
              filtering: false,
              actionsColumnIndex: -1,
              paging: false,
              search: false,
              maxBodyHeight: '325px',
              minBodyHeight : '325px',
              exportButton : true,
              exportMenu : [
                {
                  label : 'Export CSV',
                  exportFunc : (cols, datas) =>
                    ExportCsv(cols, datas, 'My Meetings')
                },
                {
                  label : 'Export PDF',
                  exportFunc : (cols, datas) => 
                    ExportPdf(cols, datas, 'My Meetings')
                }
              ]
            }}
            actions={[
              {
                icon: () =>
                  props.isEnabled ? <VisibilityOffIcon /> : <VisibilityIcon />,
                isFreeAction: true,
                hidden: open,
                onClick: () => props.setCardClose(),
              },
            ]}
            title={
              <Typography
                variant = 'h6'
                style = {{
                  padding : '5px',
                  paddingBottom : props.mode === 'edit' ? '23px' : '20px'
                }}
              >
                My Meetings
              </Typography>
            }
          ></MaterialTable>
        // </Card>
      }
    </>
  );
};

export default MyMeetings;

