import React, {useContext, useEffect, useState} from 'react'; 
import {  
  FormControl, 
  InputLabel, 
  MenuItem, 
  Select, 
  Button, 
  TextField, 
  Grid, 
  Card, 
  Paper, 
  Typography, 
  Radio, 
  RadioGroup, 
  FormControlLabel, 
} from '@mui/material'; 
import apiCalls from 'utils/apiCalls'; 
import {getEmpbasecompanyAction} from 'redux/actions/attendance_actions'; 
import {useDispatch, useSelector} from 'react-redux'; 
import context from '../../../context/CreateNewButtonContext'; 
import {CreatePolicyAction} from 'redux/actions/shifts.actions'; 
 
const PolicyForm = (props) => { 
  const {onBack} = props; 
  const dispatch = useDispatch(); 
  const [isApiFinished, setIsApiFinished] = useState(false); 
  const { 
    commoncookie, 
    headerLocationId, 
    setLoaderStatusHandler, 
    setModalTypeHandler, 
  } = useContext(context); 
  const { 
    attendanceReducer: {get_empbasecompany}, 
  } = useSelector((state) => state); 
 
  const [formValues, setFormValues] = useState({ 
    leaveCount: '', 
    leaveFrequency: 'monthly', 
    user_id: '', 
  });
 
  useEffect(() => { 
    apiCalls( 
      setModalTypeHandler, 
      setLoaderStatusHandler, 
      dispatch(getEmpbasecompanyAction()), 
    ).finally(() => setIsApiFinished(true)); 
  }, []); 
 
  const handleInputChange = (field, value) => { 
    setFormValues((prevValues) => ({ 
      ...prevValues, 
      [field]: value, 
    })); 
  };

  const handleSubmit = (event) => { 
    event.preventDefault(); 
 
    const requiredFields = ['user_id', 'leaveCount', 'leaveFrequency']; 
    const isValid = requiredFields.every((field) => formValues[field] !== ''); 
 
    if (!isValid) { 
      alert('All fields are required'); 
      return; 
    } 
    console.log('formValues', formValues);
    apiCalls(dispatch(CreatePolicyAction(formValues))).then((res) => onBack());
    console.log('Form Values:', formValues); 
  };

  console.log('get_empbasecompany', get_empbasecompany);
 
  return (
    <Card>
      <Grid
        container
        justifyContent='center'
        alignItems='center'
        style={{height: '88vh'}}
      >
        <Grid>
          <Paper elevation={3} style={{padding: '20px', width: '400px'}}>
            <Typography variant='h5' gutterBottom>
              New Policy
            </Typography>
            <form onSubmit={handleSubmit}>
              <FormControl fullWidth variant='outlined' margin='normal'>
                <InputLabel id='user-name-label'>User Name</InputLabel>
                <Select
                  labelId='user-name-label'
                  id='user-name'
                  value={formValues.user_id}
                  onChange={(e) => handleInputChange('user_id', e.target.value)}
                  label='User Name'
                  required
                >
                  {get_empbasecompany.map((option) => (
                    <MenuItem
                      key={option.employee_id}
                      value={option.employee_id}
                    >
                      {option.first_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl> 
 
              <TextField
                label='No of Unpaid Leaves'
                variant='outlined'
                fullWidth
                onWheel={ (e) => e.target.blur()}
                type='number'
                value={formValues.leaveCount}
                onChange={(e) =>
                  handleInputChange('leaveCount', e.target.value)
                }
                margin='normal'
                required 
                
              />
              <FormControl fullWidth variant='outlined' margin='normal'>
                <InputLabel id='leave-frequency-label'>Frequency</InputLabel>
                <Select
                  labelId='leave-frequency-label'
                  id='leave-frequency'
                  value={formValues.leaveFrequency}
                  onChange={(e) =>
                    handleInputChange('leaveFrequency', e.target.value)
                  }
                  label='Frequency'
                  required
                >
                  <MenuItem value='monthly'>Monthly</MenuItem>
                  <MenuItem value='yearly'>Yearly</MenuItem>
                </Select>
              </FormControl>
              <Button
                type='submit'
                variant='contained'
                color='primary'
                fullWidth
                style={{marginTop: '20px'}}
              >
                Submit
              </Button>
              <Button
                onClick={() => onBack()}
                variant='outlined'
                color='secondary'
                fullWidth
                style={{marginTop: '10px'}}
              >
                Back
              </Button>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Card>
  );
};

export default PolicyForm; 
