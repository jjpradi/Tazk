import React, { useEffect, useState } from 'react';
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
  Slider,
  Typography,
} from '@mui/material';
import { FilterAlt } from '@mui/icons-material';
import _, { countBy } from 'lodash';
import { DatePicker, DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from "@mui/material/IconButton";
import { getDateFormat } from 'utils/getTimeFormat';
import { useDispatch, useSelector } from 'react-redux';
import { getEmpbasecompanyAction } from 'redux/actions/attendance_actions';
import { capitalize } from 'lodash';

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
  top: '86%',
  left: '37%',
};

const FilterEmployee = (props) => {

  // useEffect(() => {
  //   setFormValue(props.filtedValue);
  // }, []);

  // useEffect(() => {
  //   setFormValue(props.filtedValue);
  // }, [props.filtedValue]);

  const [formValue, setFormValue] = useState({employee_id : null});

  const {
    attendanceReducer: {  get_empbasecompany},

} = useSelector((state) => state);
const dispatch = useDispatch();

// useEffect(() => {
//     // dispatch(listMigrationAction());
//     if(!get_empbasecompany.length){
//     dispatch(getEmpbasecompanyAction())
//     }
// }, [!get_empbasecompany.length]);

  const status = [
    // { value: "Rejected", label: "Rejected" },
    { value: "Waiting for approval", label: "Waiting for approval" },
    { value: "Approved", label: "Approved" }
  ];

  const handleChange = (event) => {
    const { value, name } = event.target;
    // if (name === 'name') {
    //   formValue.product_name = value;
    // }
    console.log('namevalue', name, value)
    props.setFilteredValue({...props.filteredValue, [name] : value})
    //setFormValue({ ...formValue, name: value });
    // props.filterHandler(name,value)
  };
console.log('formvalueee',formValue )
console.log('props.filtered', props.filteredValue)
  const clearButton = () => {
    setFormValue({
      brand: '',
      category: '',
      location_id: 'null',
      payment_type: '',
      max_price: '',
      min_price: '',
    });
  };


  return (
    <>
      <Badge color='secondary' //</>badgeContent={props.count}
      >
        <FilterAlt
          onClick={() => props.handleOpen(true)}
        />
      </Badge>
      <Modal
        open={props.open}
        onClose={() => props.handleOpen(false)}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
        align='left'
      >
        <Card sx={style}>
          <div style={{ marginLeft: "17.2pc" }}>
            <IconButton aria-label="close"
               onClick={() => props.handleOpen(false)}
            >
              <CloseIcon />

            </IconButton>
          </div>
          <Grid container spacing={3} display='flex' justifyContent='center' direction={'row'} >
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
            <FormControl variant='filled' fullWidth>
                <InputLabel>User</InputLabel>
                <Select
                  value={props.filteredValue.employee_id}
                  name='employee_id'
                  onChange={handleChange}
                  label='User'
                  required
                //   error={formErrors.employee_id !== null}
                //   helperText={formErrors.employee_id}
                  sx={{
                    '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline':
                      {
                        borderColor: 'red', // Set the border color to red when error is true
                      },
                    '& .MuiFormHelperText-root.Mui-error': {
                      color: 'red', // Set the helper text color to red when error is true
                    },
                  }}
                >
                  { get_empbasecompany.map((m) => (
                    <MenuItem key={m.employee_id} value={m.employee_id}>
                      { 
                          m.last_name ?
                            `${capitalize(m.first_name)} ${capitalize(m.last_name)}`
                          :
                          capitalize(m.first_name)
                        }
                    </MenuItem>
                  ))}
                </Select>
                {/* <FormHelperText sx={{color: 'red'}}>
                  {formErrors.employee_id}
                </FormHelperText> */}
              </FormControl>
            </Grid>

           
            
            <Grid container spacing={5} pt='15px' style={{ display: 'flex', justifyContent: 'center' }} >
            <Grid>
                <Button
                  fullWidth
                onClick={() => props.handleClose()}
                // sx={button}
                variant='contained'
                color='warning'
              >
                Clear
              </Button>
            </Grid>
            <Grid>
                <Button
                  fullWidth
                onClick={() => props.ApplyButton()}
                // sx={button}
                variant='contained'
              >
                Apply
              </Button>
            </Grid>
          </Grid>
          </Grid>
        </Card>
      </Modal>
    </>
  );
}

export default FilterEmployee;
