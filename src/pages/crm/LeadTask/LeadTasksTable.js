import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import {Card,Link} from '@mui/material';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import React, {useContext, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  getLeadsTaskAction,
  getSearchLeadsAction,
  setSearchLeadsTaskAction,
} from 'redux/actions/leads_task_actions';
import CommonSearch from 'utils/commonSearch';
import AddIcon from '@mui/icons-material/Add';
import TaskCreation from './TaskCreation';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import {maxBodyHeight, headerStyle, cellStyle} from 'utils/pageSize';
import moment from 'moment';
import LeadDetails from 'pages/crm/leadManagement/leadDetails';
import { getLeadsAction, getAllLeadsAction } from 'redux/actions/leadManagement_actions';
import CustomerLeadCards from 'pages/crm/leadManagement/CustomerLeadCards';

const LeadTasksTable = (props) => {
  const dispatch = useDispatch();
  const [task, setTask] = useState(false);
  const [data, setData] = useState([]);
  const [open, setOpen] = useState('list');

  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(CreateNewButtonContext);

  const {
    LeadsTaskReducer: {getTasks},
    leadManagementReducers: {allLeads}
  } = useSelector((state) => state);

  const [paginateData, setPaginateData] = useState({
    searchString: '',
    pageCount: 0,
    pageSize: 20,
  });

  // console.log(rowData)

  const requestSearch = (e) => {
    const val = e.target.value;

    setPaginateData({...paginateData, searchString: val});

    dispatch(
      setSearchLeadsTaskAction({
        data: [],
        numRows: 0,
      }),
    );

    const payload = {
      searchString: val,
      pageCount: 0,
      numPerPage: paginateData.pageSize,
    };
    dispatch(
      getSearchLeadsAction(
        payload,
        setModalTypeHandler,
        setLoaderStatusHandler,
      ),
    );
  };

  const cancelSearch = () => {
    setPaginateData({...paginateData, searchString: ''});

    dispatch(
      setSearchLeadsTaskAction({
        data: [],
        numRows: 0,
      }),
    );

    const payload = {
      searchString: '',
      pageCount: paginateData.pageCount,
      numPerPage: paginateData.pageSize,
    };
    dispatch(
      getLeadsTaskAction(payload, setModalTypeHandler, setLoaderStatusHandler),
    );
  };

  const  handleLeadDetail = async(rowData) => {
    
    console.log(allLeads,'lead_id', rowData);
    // await dispatch(getLeadsAction(payload, setModalTypeHandler, setLoaderStatusHandler));
    
    setData(rowData)
    setOpen('detail')

  }

  const columns = [
    {
      field: 'lead_id',
      title: 'Task Id',
      render: (rowData) => {
        if (!rowData.lead_id) return null; 
        return (
          <Link
            onClick={() => {
              console.log('Link clicked for:', rowData.lead_id); 
              handleLeadDetail(rowData);
            }}
            style={{
              textDecoration: 'underline',
              cursor: 'pointer',
              color: 'blue',
              display: 'inline-block',
              padding: '5px',
            }}
          >
            {rowData.lead_id}
          </Link>
        );
      },
    
    },
    {
      field: 'task_owner',
      title: 'Task Owner'
    },
    {
      field: 'subject',
      title: 'Subject'
    },
    {
      field: 'due_date',
      title: 'Due Date',
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

  const handlePageChange = (page) => {
    setPaginateData({...paginateData, pageCount: page});
  };

  const handleSizeChange = (size) => {
    setPaginateData({...paginateData, pageSize: size});
  };

  const handleOpen = () => {
    setTask(true);
  };
  const handleClose = async () => {
    const payload = {
      searchString: paginateData.searchString,
      pageCount: paginateData.pageCount,
      numPerPage: paginateData.pageSize,
    };
    await dispatch(getLeadsTaskAction(payload));

    setTask(false);
    setOpen('list')
  };

  useEffect(() => {
    const payload = {
      searchString: paginateData.searchString,
      pageCount: paginateData.pageCount,
      numPerPage: paginateData.pageSize,
    };
    dispatch(getLeadsTaskAction(payload));
  }, [paginateData.pageCount, paginateData.pageSize]);

  useEffect(() => {
    dispatch(getAllLeadsAction());
  }, [])

  return (
    <>
      {(!task && open == 'list' ) &&  (
        <Card>
          <MaterialTable
            columns={columns}
            data={getTasks.data}
            title={'Leads Task'}
            totalCount={getTasks.numRows}
            options={{
              actionsColumnIndex: -1,
              filtering: false,
              search: false,
              paging: true,
              pageSize: paginateData.pageSize,
              pageSizeOptions: [20, 50, 100],
              maxBodyHeight: maxBodyHeight,
              minBodyHeight: maxBodyHeight,
              overflowY:'visible',
              headerStyle,
              cellStyle
            }}
            page={paginateData.pageCount}
            onPageChange={(page) => {
              handlePageChange(page);
            }}
            onRowsPerPageChange={(size) => {
              handleSizeChange(size);
            }}
            components={{
              Toolbar: (props) => (
                <div
                  style={{
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                  }}
                >
                  <div style={{width: '100%'}}>
                    <MTableToolbar {...props} />
                  </div>
                  <div>
                    <CommonSearch
                      searchVal={paginateData.searchString}
                      cancelSearch={cancelSearch}
                      requestSearch={requestSearch}
                    />
                  </div>
                </div>
              ),
            }}
            actions={[
              {
                icon: () => <AddIcon />,
                tooltip: 'Add Task',
                isFreeAction: true,
                onClick: () => handleOpen(),
              },
            ]}
          />
        </Card>
      )}

      {task && <TaskCreation handleClose={handleClose} />}
      {open == 'detail' && <LeadDetails data={allLeads} index={data.lead_id} handleClose={handleClose}  />}
      {/* {<CustomerLeadCards/>} */}
    </>
  );
};

// LeadTasksTable.propTypes = {
//   handleClose : PropTypes.func,
//   data : PropTypes.object,
//   type : PropTypes.string
// }

export default LeadTasksTable;

