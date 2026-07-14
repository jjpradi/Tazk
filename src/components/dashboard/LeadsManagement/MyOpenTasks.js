import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import {Card, Typography} from '@mui/material';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import React, {useContext, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  getLeadsTaskAction,
  getSearchLeadsAction,
  setSearchLeadsTaskAction,
} from 'redux/actions/leads_task_actions';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import moment from 'moment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { maxBodyHeight } from 'utils/pageSize';
import { ExportCsv, ExportPdf } from '@material-table/exporters';


const MyOpenTasks = (props) => {

const [open, setOpen] = useState(true);
  const dispatch = useDispatch();
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(CreateNewButtonContext);

  const {
    LeadsTaskReducer: {getTasks},
  } = useSelector((state) => state);

  const [paginateData, setPaginateData] = useState({
    searchString: '',
    pageCount: 0,
    pageSize: 5,
  });



  const columns = [
    {
      field: 'task_owner',
      title: 'Owner'
    },
    {
      field: 'subject',
      title: 'Subject'
    },
    {
      field: 'due_date',
      title: 'Date',
      render: (rowData) => {
        return moment(rowData.due_date).format('DD/MM/YYYY');
      },
    },
    {
      field: 'lead',
      title: 'Lead'
    },
    {
      field: 'account',
      title: 'Account'
    },
    {
      field: 'status',
      title: 'Status'
    },
    {
      field: 'priority',
      title: 'Priority'
    },
    {
      field: 'reminder',
      title: 'Reminder',
      render: (rowData) => {
        if (rowData.reminder === 1) {
          return (
            <>
              <DoneIcon sx={{color: 'green'}} />
            </>
          );
        } else {
          return (
            <>
              <CloseIcon sx={{color: 'red'}} />
            </>
          );
        }
      },
    },
    {
      field: 'duration',
      title: 'Repeat',
      render: (rowData) => {
        if (rowData.repeat === 1) {
          return (
            <>
              <DoneIcon sx={{color: 'green'}} />
            </>
          );
        } else {
          return (
            <>
              <CloseIcon sx={{color: 'red'}} />
            </>
          );
        }
      },
    },
    {field: 'description', title: 'Description'},
    {
      field : 'duration',
      title : 'Repeat Duration',
      render : (rowData) => {
          if(rowData.duration !== null) {
              return rowData.duration
          }
          else {
              return '-'
          }
      }
  },
  ];

  // useEffect(() => {
  //   const payload = {
  //     type : 'Dashboard'
  //   };
  //   dispatch(getLeadsTaskAction(payload));
  // }, [paginateData.pageCount, paginateData.pageSize]);

  useEffect(() => {
    if(props?.mode === 'edit'){
        setOpen(false)
    }
    else{
        setOpen(true)
    }
  },[props?.mode])

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
        
          <MaterialTable
            // style={{height: '100%'}}
            columns={columns}
            data={props.data[0]?.myOpenTasks || []}
            title={
              <Typography
                variant = 'h6'
                style = {{
                  padding : '5px',
                  paddingBottom : props.mode === 'edit' ? '23px' : '20px'
                }}
              >
                My Open Tasks
              </Typography>
            }
            options={{
              actionsColumnIndex: -1,
              filtering: false,
              search: false,
              paging: false,
              maxBodyHeight: '325px',
              minBodyHeight : '325px', 
              exportButton : true,
              exportMenu : [
                {
                  label : 'Export CSV',
                  exportFunc : (cols, datas) =>
                    ExportCsv(cols, datas, 'My Open Tasks')
                },
                {
                  label : 'Export PDF',
                  exportFunc : (cols, datas) => 
                    ExportPdf(cols, datas, 'My Open Tasks')
                }
              ]
            }}
            actions={[
                {
                    icon:()=>props.isEnabled ? <VisibilityOffIcon/> : <VisibilityIcon />,
                    isFreeAction:true,
                    hidden:open,
                    onClick:()=>props.setCardClose()
                }
            ]}
            
          />   
    </>
  );
};


export default MyOpenTasks;

