import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import {
  Autocomplete,
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import React, {useContext, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  getDevelopersDetailsAction,
  listErrorDashboardAction,
  updateAssignerror,
} from 'redux/actions/errorDashboard_actions';
import apiCalls from 'utils/apiCalls';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { getsessionStorage } from 'pages/common/login/cookies';
import { getEmpbasecompanyAction } from 'redux/actions/attendance_actions';

const Bulkassign = ({open, onClose}) => {
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [data, setData] = useState({
    assignee: '',
    assignedBy: '',
    errorId: '',
    assigned_name: '',
    current_status: 0,
  });
  const storage = getsessionStorage();

  const handleAssignChange = (value) => {
    // const rowId = params.row.id
    // setRowData(rowId)
    setData({
      assignee: value.employee_id,
      assignedBy: storage.employee_id,
      errorId: selectedRowIds,
      assigned_name: value.first_name,
      current_status: 0,
    });
  };

  const openDialog = () => {
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };
  const handleErrorSubmit = () => {
    const body = {
      company_id: 'currentCompany',
    };
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(updateAssignerror(data)),
      dispatch(
        listErrorDashboardAction(
          body,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      ),
    );
    setDialogOpen(false);
  };

  const dispatch = useDispatch();

  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(CreateNewButtonContext);

  const {
    CompanyReducers: {companyName},
    ErrorDashboardReducer: { error_dashboard_list, developers_details },
    attendanceReducer: { get_empbasecompany },
  } = useSelector((state) => state);

  useEffect(() => {
    const body = {
      company_id: 'currentCompany',
    };
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      // dispatch(getDevelopersDetailsAction()),
      dispatch(getEmpbasecompanyAction()),
      dispatch(
        listErrorDashboardAction(
          body,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      ),
    );
  }, []);

  return (
    <div>
      <Card sx={{borderRadius: '20px'}}>
        <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
          <DialogTitle>Assign bulk task</DialogTitle>
          <Divider />
          <DialogContent>
            <MaterialTable
              components={{
                Toolbar: (props) => (
                  <>
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
                    </div>
                  </>
                ),
              }}
              options={{
                selection: true,
                search: false,
                exportButton: false,
                filtering: false,
                actionsColumnIndex: -1,
                pageSizeOptions: [20, 50, 100],
              }}
              onSelectionChange={(rows) => {
                const selectedIds = rows.map((row) => row.id);
                setSelectedRowIds(selectedIds);
              }}
              columns={[
                {title: 'Error id', field: 'id'},
                {title: 'Company Name', field: 'company_name'},
                {title: 'Created By', field: 'createdBy'},
                {title: 'Error Description', field: 'meta'},
                {title: 'Date & Time', field: 'timestamp'},
                {title: 'Issue Type', field: 'level'},
                {
                  title: 'Assignee',
                  field: 'assigned_name',
                  render: (rowData) => {
                     const assignedStatus = rowData.assigned_name;
                     const isAssigned = assignedStatus?.length > 0;
              
                    const cellStyle = {
                      color: isAssigned ? 'green' : 'red',
                    };
              
                    return (
                      <span style={cellStyle}>
                        {isAssigned ? assignedStatus : 'unassigned'}
                      </span>
                    );
                  },
                },
                
              ]}
              
              data={error_dashboard_list}
              title={
                <Typography
                  variant='h6'
                  align='left'
                  style={{paddingTop: '10px', paddingBottom: '10px'}}
                >
                  Error list
                </Typography>
              }
            />
            
            <Grid
              style={{display: 'flex', justifyContent: 'end', marginTop: '5px'}}
            >
              <Button
                variant='contained'
                color='primary'
                disabled={selectedRowIds?.length > 0 ? false : true}
                onClick={openDialog}
              >
                Assign
              </Button>
            </Grid>
          </DialogContent>
        </Dialog>
      </Card>


      <div>
      <Grid minWidth={'600px'}>
      <Dialog
        open={isDialogOpen}
        onClose={closeDialog}
        PaperProps={{
          sx: {
            minHeight: 300,
            width: 400,
          },
        }}
      >
        <DialogTitle>Developers</DialogTitle>
        <DialogContent>
          <Autocomplete
            disablePortal
            name='assignee'
            onChange={(event, newValue) => {
              handleAssignChange(newValue);
            }}
            disableClearable={true}
            options={get_empbasecompany}
            getOptionLabel={(options) => options.username}
            sx={{width: 350}}
            renderInput={(params) => (
              <TextField {...params} label='Developers' />
            )}
          />
         <div style={{ display: 'flex',  justifyContent: 'center', position: 'absolute', bottom: 0, width: '100%' }}>
  <Button variant='outlined' color='primary' onClick={closeDialog}>
    Close
  </Button>
  <Button variant='outlined' color='primary' onClick={handleErrorSubmit}>
    Submit
  </Button>
</div>

        </DialogContent>
          </Dialog>
          </Grid>
            </div>
    </div>
  );
};

export default Bulkassign;

