import React, { useEffect, useContext, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
} from '@mui/material';
import { updateDeviceIdStatusAction, userCreationPaginationAction } from 'redux/actions/userCreation_actions';
import { useDispatch } from 'react-redux';
import context from '../../../context/CreateNewButtonContext';
import { pageSize } from 'utils/pageSize';
import { getAllFrontDeskAction } from 'redux/actions/requestConfig';
// import {useSelector, useDispatch} from 'react-redux';
// import apiCalls from 'utils/apiCalls';
//import {getCheckProductAction} from '../redux/actions/product_actions';
// import CreateNewButtonContext from '../context/CreateNewButtonContext';

export default function ResetDialog(props) {
  // const [setOpen] = React.useState(false);

  // const handleDelete=()=>{
  //     props.handleDelete(props.id);
  // }

  // const handleClickOpen = () => {
  //   setOpen(true);
  // };

  // const handleClose = () => {
  //   setOpen(false);
  // };
  // const {setModalTypeHandler, setLoaderStatusHandler} = useContext(
  //   CreateNewButtonContext,
  // );
  // const dispatch = useDispatch();
  // useEffect(() => {
  //   apiCalls(
  //     setModalTypeHandler,
  //     setLoaderStatusHandler,
  //     dispatch(
  //       getCheckProductAction(props.id)
  //     )
  //   );
   
  // },[props.checkproduct])


  const [searchData, setSearchData] = useState({
    page: 0,
    pageSize: 20,
    searchVal: '',
    searchPageData: []
  })

  const dispatch = useDispatch()
  const {
    setModalStatusHandler,
    setModalTypeHandler,
    selectData,
    setselectData,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(context);

  const handleSubmit = (id) => {
    const body = {
      numPerPage: pageSize,
      pageCount: 0,
      searchString:'',
      employeeId:commoncookie,
      headerLocationId:headerLocationId
    }
    dispatch(updateDeviceIdStatusAction(id,
      (response)=>{
      if(response === 200){
      props.setResetConfirm(true)
      }
    }
    ))
    dispatch(userCreationPaginationAction(body)) 
    const data = {
      pageCount: searchData.page,
      numPerPage: searchData.pageSize,
      searchString: searchData.searchVal
    }
    dispatch(
      getAllFrontDeskAction(data),
    );
    props.handleClose()
  }
  return (
    <div>
      {/* <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        Open alert dialog
      </Button> */}
      <Dialog
        open={props.reset}
        onClose={props.handleClose}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>Reset Device Id?</DialogTitle>
        <Grid container>
          <Grid
            size={{
              lg: 6,
              md: 6
            }}>
            <DialogContent style={{width: 500}}>
              <DialogContentText
                id='alert-dialog-description'
                sx={{color: 'warning.main'}}
              >
                Are you sure you want to Reset?
              </DialogContentText>
            </DialogContent>
          </Grid>
          
        </Grid>

        <DialogActions>
          <Button onClick={() => props.handleClose()} color='secondary'>
            Cancel
          </Button>
          <Button
            onClick={() =>
            handleSubmit(props.id)
            }
            color='primary'
            autoFocus
          >
            Reset
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
