import React, { useContext, useEffect, useState } from 'react'
import context from '../../../context/CreateNewButtonContext';
import { getsessionStorage } from 'pages/common/login/cookies';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { titleURL } from 'http-common';
import AppAnimate from '../../../@crema/core/AppAnimate';
import { Avatar, Box, Button, Card, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Typography } from '@mui/material';
import CommonFilter from 'components/pos/payment_section/CommonFilter';
import { deleteRegisteredUser, getRecordsofFaceRegisteredUsers, getSearchFaceRegistrationState, setSearchFaceRegistrationState } from 'redux/actions/face_registration_action';
import CommonSearch from 'utils/commonSearch';
import apiCalls from 'utils/apiCalls';
import moment from 'moment';
import { getRoleAuthorization } from '@crema/utility/helper/RoleAuthHelper';
import { getUserRightsByRoleIdAction } from 'redux/actions/role_actions';

export default function FaceAttendance() {
  const dispatch = useDispatch();
  const {
    setLoaderStatusHandler,
    setModalStatusHandler,
    setModalTypeHandler,
    commoncookie,
  } = useContext(context);

  const storage = getsessionStorage();

  const {  
    FaceRegistrationConfig: { getList },
    roleReducer : {user_rights}

  } = useSelector((state) => state);

  const [searchVal, setSearchVal] = useState('')

  console.log("getList", getList)
  const [employeeId, setEmployeeId] = useState('');

  const [filterOpen, handleFilter] = useState(false);
  const [deleteRow, setDeleteRow] = useState();
  const [data, setData] = React.useState({
    full_name: [],
  });

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    let payLoad = {
      searchString: "",
      emp_id: [],
    }

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
    dispatch(getRecordsofFaceRegisteredUsers(payLoad, (response) => {
      console.log("response", response)
   
    })),
    dispatch(getUserRightsByRoleIdAction())
  )
  }, [])



  const ApplyButton = async (val) => {

    setData({
      ...data,
      full_name: val.length ? val?.map(v => v?.employee_id) : ['']
    })

    let payLoad = {

      emp_id: val.length ? val?.map(v => v?.employee_id) : [],

    }
    dispatch(getRecordsofFaceRegisteredUsers(payLoad, (response, resData) => {

    }))
    handleFilter(false)

  };



  const clearButton = (e) => {
    setEmployeeId(null)
    let payLoad = {
      searchString: "",
      emp_id: [],
    }

    dispatch(getRecordsofFaceRegisteredUsers(payLoad, (response, resData) => {

    }))
    handleFilter(false)
  }

  const handleDelete = (id) => {
    let payLoad = {
      searchString: "",
      emp_id: [],
    }

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        deleteRegisteredUser(
          deleteRow,(res)=>{
            if(res){
              dispatch(getRecordsofFaceRegisteredUsers(payLoad, (response, resData) => {

              }))
            }
          }
        ),
      )
    );

    handleClose();
  };

  const handleSelectChange = (event) => {
    setEmployeeId(event.target.value);

  };
  const requestSearch = (e) => {
    const val = e.target.value;
    setSearchVal(val)

    dispatch(setSearchFaceRegistrationState({ data: [] }));
    let body = {
      emp_id: '',

      searchString: val,
    }
    dispatch(getSearchFaceRegistrationState(body, setModalTypeHandler, setLoaderStatusHandler))
  };

  const cancelSearch = () => {
    setSearchVal('')
    dispatch(setSearchFaceRegistrationState({ data: [] }));
    let body = {
      emp_id: '',
      searchString: ""
    }
    dispatch(getSearchFaceRegistrationState(body, setModalTypeHandler, setLoaderStatusHandler))

  };

  const isAuthorized = getRoleAuthorization(user_rights, 'Deregister');

  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <title> {titleURL} | Face Attendance </title>
      </Helmet>
      <AppAnimate animation='transition.slideLeftIn' delay={300}>
        <Card sx={{ p: '15px', height: '100%' }} >
          <Grid
            container
            display='flex'
            flexDirection='row'
            pb='60px'
            alignItems='center'
          >

            <Grid
              size={{
                lg: 7,
                md: 7,
                sm: 7,
                xs: 7
              }}>
              <Typography variant='h7' align='left' p='0px 0px 15px 0px'>
                {'Face Attendance'}
              </Typography>
            </Grid>

            {/* <Grid
              display='flex'
              justifyContent='flex-end'
              // pr="60px"
              sx={{pl:"160px",}}
              size={{
                lg: 2.5,
                md: 2.5,
                sm: 2.5,
                xs: 2.5
              }}>

            </Grid> */}

            <Grid
              display='flex'
              justifyContent='flex-end'
              sx={{gap:3}}
              size={{
                lg: 5,
                md: 5,
                sm: 5,
                xs: 2.5
              }}>
                <CommonFilter
                employeeOnlyFilter={true}
                handleClose={handleFilter}
                open={filterOpen}
                clearButton={clearButton}
                ApplyButton={ApplyButton}
                handleSelectChange={handleSelectChange}
                shouldFetchData={true}
              />
              <CommonSearch
                searchVal={searchVal}
                cancelSearch={cancelSearch}
                requestSearch={(e) => requestSearch(e)}
              />
            </Grid>


          </Grid>





          <Grid container spacing={3}>
            {getList && getList.length > 0 ? (
              getList.map((user) => {
                // Parse the images field if it's a stringified array
                const imagesArray = user.images ? JSON.parse(user.images) : [];
                // console.log("imagesArray",imagesArray)
                const profileImage = imagesArray.length > 0 ? imagesArray[0] : '/default-profile.png';

                return (
                  <Grid
                    key={user.emp_id}
                    size={{
                      xs: 12,
                      sm: 12,
                      md: 6,
                      lg: 4
                    }}>
                    <Card sx={{height: '180px' , boxShadow: 8,mb:'20px' ,pt:'20px',pl:'20px'}}>
                      <Box display="flex" alignItems="center">
                        <Avatar
                          alt={user.full_name || 'User'}
                          src={profileImage}
                          sx={{ width: 90, height: 90, mr: 5 }}
                        />
                        <Box>
                          <Typography variant="body3">Full Name: {user.full_name || '-'}</Typography>
                          <Typography variant="body2">Employee Code: {user.employeeId || '-'}</Typography>
                          <Typography variant="body2">Verified By: {user.verifiedBy || '-'}</Typography>
                       

                          <Typography variant="body2">
                            Verified At: {user.updatedAt ? moment(user.updatedAt).format('DD-MM-YYYY hh:mm A') : '-'}
                          </Typography>
                        </Box>
                      </Box>

                      <Box display="flex" justifyContent="flex-end" mt={2} pr={2}>
                        { isAuthorized && (
                  <Button
                    variant='outlined' color="error"
                    onClick={() => {
                      
                    setDeleteRow(user.emp_id);
                     
                      handleClickOpen()
                    }
                      
                    }
                  >
                    Deregister
                  </Button>
                        )}
                </Box>
                    </Card>
                  </Grid>
                );
              })
            ) : (
              <Grid
                display="flex"
                justifyContent="center"
                alignItems="center"
                style={{ height: '300px' }}
                size={12}>
              <Typography variant="h6">No records to display</Typography>
            </Grid>
            )}
          </Grid>
          <Grid>
            <Grid>
              <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{'Delete Alert'}</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Are you sure you want to Delete this?
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button variant='contained' color='error' onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button variant='contained' onClick={handleDelete} autoFocus>
                    Delete
                  </Button>
                </DialogActions>
              </Dialog>
            </Grid>
          </Grid> 

        </Card>
      </AppAnimate>
    </>
  );
}
