import React, {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Check from '@mui/icons-material/Check';
import {useSelector} from 'react-redux';
import {AppAnimate} from '../../@crema';

const steps = [
  'Identity',
  'Address',
  'Employment',
  'Education',
  'Driving',
  'Social',
  'Criminal',
  'Drug',
  'Family',
  'Resistance',
  'Pass&Aadhar',
  'pan',
];

function CustomStepIcon(props) {
  const {active, completed} = props;
  const iconContainerStyle = {
    width: 24,
    height: 24,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '50%',
    backgroundColor: completed ? '#0A8FDC' : 'rgb(149, 156, 169)',
  };

  return (
    <div style={iconContainerStyle}>
      {completed ? <Check style={{color: '#fff'}} /> : active ? '' : ''}
    </div>
  );
}

export default function StepperDesign({userId}) {
  const [completed, setCompleted] = useState({});

  const completed_index_value = useSelector(
    (state) => state.UserCreationReducer.completed_index_value,
  );

  useEffect(() => {
    const newCompleted = {};
    completed_index_value.forEach((item) => {
      newCompleted[item.index_value] = true;
    });
    setCompleted(newCompleted);
  }, [completed_index_value, userId]);

  return (
    <AppAnimate animation='transition.slideRightIn' delay={1000}>
      <Box sx={{width: '100%'}}>
        <Stepper nonLinear alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label} completed={!!completed[index]}>
              <StepLabel StepIconComponent={CustomStepIcon}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
    </AppAnimate>
  );
}
