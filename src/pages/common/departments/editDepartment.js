import React, { useContext, useEffect, useState } from 'react';
import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,

    Grid,

    TextField,
    Typography,

} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';

import context from '../../../../src/context/CreateNewButtonContext';

import apiCalls from 'utils/apiCalls';

import { CreateDepartment, department } from 'redux/actions/departmentHead';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';


export default function EditDepartmentConfig(props) {
    const dispatch = useDispatch();

    const { setModalTypeHandler, setLoaderStatusHandler } = useContext(context);
    const { open, handleClose, app_config_data } = props;
    const [formValues, setFormValues] = useState({
        department_name: ''
    });

    // console.log("formValues",formValues)
    const [formErrors, setFormErrors] = useState({
        department_name: ''
    });





    const handleChange = async (e) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });
        setFormErrors({ ...formErrors, [name]: '' });
    };



    const handleSubmit = async () => {

        let isValid = true;
        let formErrorsObj = { department_name: '' };

        if (!formValues.department_name) {
            isValid = false;
            formErrorsObj.department_name = 'Department name is required!';
        }

        setFormErrors(formErrorsObj);

        if (isValid) {
            apiCalls(
                setLoaderStatusHandler,
                setModalTypeHandler,
                dispatch(
                    CreateDepartment(
                        formValues,
                        (response) => {
                            if (response.affectedRows === 1) {

                                const data = {
                                    pageCount: 0,
                                    numPerPage: 20,
                                    searchString: ''
                                }
                                dispatch(
                                    department(
                                        setModalTypeHandler,
                                        setLoaderStatusHandler, data),
                                );


                            }
                        }
                    ),
                ),

            );
            handleClose();
        }
        else{
            dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
        }

    };



    return (
        <Dialog open={open} onClose={() => { }}  maxWidth='sm' fullWidth >
            <DialogContent>
                <DialogContentText> 
                     </DialogContentText>
                     <Typography variant='h5' align='left'  font-weight='bold' paddingBottom='10px'>
        {'Create Department'}
      </Typography>
                <TextField
                    margin='dense'
                    id='name'
                    label='Department'
                    type='text'
                    fullWidth={true}
                    variant='filled'
                    name='department_name'
                    value={formValues.department_name}
                    onChange={(e) => {

                        let val = e.target.value
                        handleChange({
                            target: {
                                name: e.target.name,
                                value: val
                            }
                        })
                    }}
                    required={true}
                    error={formErrors.department_name}
                    helperText={formErrors.department_name}
                    placeholder='Enter Department Name'
                />


            </DialogContent>
            <DialogActions>
                <Grid
                    spacing={4}
                    container={true}
                    direction='row'
                    gap='20px'
                    display='flex'
                    justifyContent='flex-end'
                    padding='15px 15px'
                >
                    <Grid>
                        <Button
                            onClick={handleClose}
                            style={{}}
                            name='Cancel'
                            variant='contained'
                            color='secondary'
                            size='medium'
                            text='button'
                            fullWidth={true}
                            type='cancel'
                        >
                            Cancel
                        </Button>
                    </Grid>
                    <Grid>
                        <Button
                            onClick={handleSubmit}
                            style={{}}
                            name='Submit'
                            variant='contained'
                            color='primary'
                            size='medium'
                            text='button'
                            fullWidth={true}
                            type='submit'
                        >
                            Submit
                        </Button>
                    </Grid>
                </Grid>
            </DialogActions>
        </Dialog>
    );

}
