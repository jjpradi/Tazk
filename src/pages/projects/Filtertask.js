import React, { useEffect, useState, useContext } from 'react';
import {
  Modal,
  Card,
  Button,
  TextField,
  Autocomplete,
  MenuItem,
  InputLabel,
  Select,
  FormControl,
  Box,
  Badge,
  Grid,
  Typography,
  FormHelperText,
} from '@mui/material';
import { FilterAlt } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from "@mui/material/IconButton";
import { useDispatch, useSelector } from 'react-redux';
import context from '../../context/CreateNewButtonContext';
import { filterTaskLogAction, getProjectsAction } from 'redux/actions/payrollDashboard_actions';
import { getEmpbasecompanyAction, getEmpbasecompanyFilterAction, get_search_company_based_employee, set_search_company_based_employee } from 'redux/actions/attendance_actions';
import { capitalize } from 'lodash';
import CommonUserAutoCompleteForSingleUser from 'utils/commonAutoCompleteForSingleUser';
import { GET_EMP_BASECOMPANY_FILTER } from 'redux/actionTypes';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 350,
  bgcolor: 'background.paper',
  boxShadow: 25,
  p: 4,
  borderRadius: 5,
};

const button = {
  position: 'absolute',
  top: '89%',
  left: '37%',
};

function TaskFilter(props) {
  let date = new Date();





  const { stockLocationReducer: { stocklocation }, productReducer: { product },PayrolldashboardReducers: { get_projects, get_taskProjects },
    paymentMethodReducer: { list_payment_type },
    attendanceReducer: { get_empbasecompany,searchCompanyBasedEmployeeFilter,getCompanyBasedEmployeeFilter  },
  } = useSelector(state => state)

  const { commoncookie, setModalTypeHandler, setLoaderStatusHandler, headerLocationId, } = useContext(context);

  const dispatch = useDispatch();

  useEffect(() => {
    let data1 = {
      searchString:""
    }
    dispatch(getProjectsAction()),
  
   dispatch(getEmpbasecompanyFilterAction(data1,(res)=>{
     dispatch({
       type: GET_EMP_BASECOMPANY_FILTER,
       payload: res,
     });
   }))
  }, [])

  

  const handleChange = (event) => {
    const { value, name } = event.target;
    props.setFormValue({ ...props.formValue, [name]: value });
  };

  // const clearButton = () => {
  //   props.setFormValue({
  //     task_id: 'null',
  //     emp_id: 'null'
  //   });
    
  //   props.handleClose(false)
  //   const data = {
  //     task_id: 'null',
  //     emp_id: 'null'
  //   }
  //   dispatch(filterTaskLogAction(data));
   
  //   //props.clearButton()
  // };

// const handleSubmit=()=>{
//   let data = {
//     ...formValue,
//     pageCount: 0,
//     numPerPage: props.pageSize,
//   }
//   // console.log('formValue',data)
//   dispatch(filterTaskLogAction(data));
//   props.handleClose(false)
// }

  return (
    <>
    <Box
  sx={{
    position: props.iconPosition || 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    ml: 1,
    flexShrink: 0,
  }}
>
      <Badge color='secondary' badgeContent={props.count}>
        <FilterAlt
          onClick={() => props.handleClose(true)}
        />
      </Badge></Box>
      <Modal
        open={props.open}
        onClose={() => props.handleClose(false)}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
        align='right'
      >
        <Card sx={style} style={{ overflow: 'auto', maxHeight: "38pc" }}>

          <div style={{ marginLeft: "16pc" }} onClick={() => props.close(false)}>
            <IconButton aria-label="close" >
              <CloseIcon />
            </IconButton>
          </div>

          <Grid container spacing={3} direction={'row'} display='flex' justifyContent='center' alignItems='center'>
  <Grid
    size={{
      lg: 12,
      md: 12,
      sm: 12,
      xs: 12
    }}>
    <Autocomplete
      options={get_projects}
      getOptionLabel={(option) => option.project_name}
      onChange={(event, newValue) => {
        handleChange({
          target: { name: 'task_id', value: newValue ? newValue.id : '' }
        });
      }}
      value={
        props.formValue.task_id
          ? get_projects.find((project) => project.id === props.formValue.task_id) || null
          : null
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label="Project Name"
          variant="filled"
          fullWidth
        />
      )}
    />
  </Grid>

            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
          <FormControl
            variant='filled'
            // required={true}
            component='fieldset'
            fullWidth={true}
          >
               <CommonUserAutoCompleteForSingleUser
                    searchVal={props.searchValEmployeeFilter}
                    setSearchValEmployeeFilter={props.setSearchValEmployeeFilter}
                    requestSearch={props.requestSearch}
                    value={props.value}
                    setValue={props.setValue}
                    type={getCompanyBasedEmployeeFilter}
                    searchType={searchCompanyBasedEmployeeFilter}
                    labelName = "Select Employee"
                    
                    
                    // error={props.userSelectError}
                    // selectedAll={props.selectedAll}
                    // setSelectedAll={props.setSelectedAll}
                  />
          </FormControl>
        </Grid>

          </Grid>

          <Grid container spacing={7} display='flex' justifyContent='center' alignItems='center' p='20px 0px 5px 0px' >
            <Grid>
              <Button
                onClick={props.clearButton}
                variant='contained'
                color='secondary'
              >
                Clear
              </Button>
            </Grid>

            <Grid>
              <Button
                onClick={props.handleSubmit}
                variant='contained'
              >
                Apply
              </Button>
            </Grid>
          </Grid>
        </Card>
      </Modal>
    </>
  );
}

export default TaskFilter;
