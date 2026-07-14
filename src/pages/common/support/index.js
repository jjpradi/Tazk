import React, { useState, useContext  } from 'react';
import { TextField, Button, Radio, RadioGroup, FormControlLabel, Typography, Box, Container, FormControl, FormLabel } from '@mui/material';
import { HelpCenter as HelpCenterIcon } from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { sendMailErrorsAction } from '../../../redux/actions/errorDashboard_actions';
import apiCalls from 'utils/apiCalls';
import { useDispatch, useSelector } from 'react-redux';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { maxBodyHeight, maxHeight } from 'utils/pageSize';



const Support = () => {
    const {
        commoncookie,
        setModalTypeHandler,
        setLoaderStatusHandler,
        headerLocationId,
    } = useContext(CreateNewButtonContext);
    const dispatch = useDispatch();
    const [issueType, setIssueType] = useState('');
    const [title, setTitle] = useState('');
    const [comments, setComment] = useState('');
    const [formErrors, setFormErrors] = useState({});
  
    const validateForm = () => {
        const errors = {};
        if (!issueType) errors.issueType = 'Please select either Complaint or Feedback';
        if (!title) errors.title = 'This field is required';
        if (!comments) errors.comments = 'This field is required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleFieldChange = (field, value) => {
        if (value.trim() !== '') {
            setFormErrors((prevErrors) => ({ ...prevErrors, [field]: '' }));
        }
    };
  
    const handleSubmit = async (event) => {
      event.preventDefault();
  
      if (validateForm()) {
          const body = {
          subject: issueType,
          content: `${title}:\n${comments}`, 
          type: 'Support',
        };
  
        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(sendMailErrorsAction(body)) 
          );
      }
    };

    const handleClear = () => {
        setIssueType('');
        setTitle('');
        setComment('');
        setFormErrors({});
    };
  
    return (
      <>
        <Helmet>
          <meta charSet='utf-8' />
          <title>Support</title>
        </Helmet>
        <Container
          maxWidth='xl'
          sx={{
            mt: 5,
            backgroundColor: '#ffffff',
            borderRadius: 2,
            boxShadow: 3,
            // height: '92vh',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            maxHeight:`calc(${maxHeight} - 45px)`,
            minHeight:`calc(${maxHeight} - 45px)`
          }}
        >
          <Box
            sx={{
              padding: 4,
              borderRadius: 2,
              boxShadow: 0,
              maxWidth: '100%',
              width: '100%',
              height: 'auto', 
              margin: 0,  
            }}
          >
            <Box display='flex' alignItems='center' mb={3}>
              <Typography variant='h5' ml={2} sx={{fontWeight: 'bold'}}>
                Support
              </Typography>
            </Box>
            <FormControl
              component='fieldset'
              fullWidth
              margin='normal'
            >
              {/* <FormLabel component='legend'>Complaint or Feedback</FormLabel> */}
              <RadioGroup
                row
                value={issueType}
                onChange={(e) => {
                    setIssueType(e.target.value);
                    handleFieldChange('issueType', e.target.value);
                }}
              >
                <FormControlLabel
                  value='Complaint'
                  control={<Radio />}
                  label='Complaint'
                />
                <FormControlLabel
                  value='Feedback'
                  control={<Radio />}
                  label='Feedback'
                />
              </RadioGroup>
              {formErrors.issueType && (
                <Typography color='error' variant='body2'>
                  {formErrors.issueType}
                </Typography>
              )}
            </FormControl>
            <TextField
              label='Title'
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                handleFieldChange('title', e.target.value);
            }}
              fullWidth
              margin='normal'
              variant='outlined'
              required
              error={!!formErrors.title}
              helperText={formErrors.title}
            />
            <TextField
              label='Comments'
              value={comments}
              onChange={(e) => {
                setComment(e.target.value);
                handleFieldChange('comments', e.target.value);
            }}
              fullWidth
              margin='normal'
              variant='outlined'
              multiline
              rows={10}
              required
              error={!!formErrors.comments}
              helperText={formErrors.comments}
            />
            <Box mt={3} textAlign='center'>
              <Button
                sx={{
                  backgroundColor: 'red',
                  color: 'white',
                  borderColor: 'red',
                  '&:hover': {
                    backgroundColor: '#d32f2f',
                    borderColor: '#d32f2f',
                  },
                  mr: 2, // Adds spacing between the Clear and Submit buttons
                }}
                color='secondary'
                variant='outlined'
                onClick={handleClear}
              >
                Clear
              </Button>
              <Button
                color='primary'
                variant='contained'
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </Box>
          </Box>
        </Container>
      </>
    );
};

export default Support;
