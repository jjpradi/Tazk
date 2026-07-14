import React, { useEffect, useState } from 'react';
import { Autocomplete, TextField, Card, Typography, Button, Grid } from '@mui/material';
import { capitalize } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { getEmpbasecompanyAction } from 'redux/actions/attendance_actions';
import { CreateAssignAction } from 'redux/actions/asset_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import { OpenalertActions } from 'redux/actions/alert_actions';

const AssignedTo = (props) => {
    const { Code, Name, asset_id} = props.assetData

    const dispatch = useDispatch();

    const [isFormAssign, setIsFormAssign] = useState(false)

    const [formDatas, setFormDatas] = useState({
        assetCode: Code,
        assetName: Name,
        condition: null,
        assignTo: null
    });

    const [formErrors, setFormErrors] = useState({
        assetCode: null,
        assetName: null,
        condition: null,
        assignTo: null
    });

    const requiredFields = ['condition', 'assignTo'];

    const currentCondition = ['New', 'Used', 'Damaged', 'Missing', 'Expired'];

    const {attendanceReducer : {
        get_empbasecompany,
     }
    } = useSelector((state) => state)

    useEffect(() => {
        dispatch(getEmpbasecompanyAction())
    }, [])

    const setConditionChange = (name, val) => {
        if (val !== null) {
            setFormDatas({
                ...formDatas,
                [name]: val
            });
            setFormErrors({
                ...formErrors,
                [name]: null
            });
        } else {
            setFormDatas({
                ...formDatas,
                [name]: null
            });
            setFormErrors({
                ...formErrors,
                [name]: capitalize(name.replace(/_/g, ' '))+' is required'
            });
        }
    };


    const setStateHandler = async (name, value) => {
        let formObj = {
            ...formDatas,
            [name]: value === '' ? null : value
        }
        await setFormDatas(formObj)
 
        validationHandler(name, value)
    }

    const validationHandler = (name, value) => {
        if(!Object.keys(formErrors).includes(name)) return;
 
        if(requiredFields.includes(name) && (value === null || value === 'null' || value === ''  || Object.keys(value) && value.value === null)){
            setFormErrors({
                ...formErrors,
                [name]: capitalize(name.replace(/_/g, ' ')) + ' is Required'
            })
            return
        }
 
        setFormErrors({
            ...formErrors,
            [name]: null
        })
    }

    const handleAssignToSubmit = async (event) => {
        event.preventDefault();
        setIsFormAssign(true)
        let isValid = true;
        let formErrorsObj = { ...formErrors };

        Object.keys(formDatas).map((key, i) => {
            if(requiredFields.includes(key) && (formDatas[key] === null || formDatas[key] === '')){  
              isValid = false
                formErrorsObj[key] = capitalize(key) + ' is Required'
            }
            return null
        });

        setFormErrors(formErrorsObj);

        if(isValid) {
            const data = {
                asset_code : formDatas.assetCode,
                asset_name : formDatas.assetName,
                condition : formDatas.condition,
                assign_to : formDatas.assignTo.employee_id,
                asset_id : asset_id,  
                timeline_message: `Asssigned to ${formDatas.assignTo.last_name ==='' || formDatas.assignTo.last_name === null ? `${formDatas.assignTo.first_name} ` : `${formDatas.assignTo.first_name} ${formDatas.assignTo.last_name} `}`

            }
            
            await dispatch(CreateAssignAction(data))
            props.handleDetailClose()
        }
        else {
            dispatch(OpenalertActions({ msg : requiredFieldsAlertMessage, severity : 'warning' }))
        }
    };

    get_empbasecompany?.filter((e)=>{
       const c = props.assetData.assignedTo !== e.employee_id
    
    })
    return (
        <>
            <Card sx={{ p: '5%' }}>
                <Typography>Assign To</Typography>
                
                <Grid container rowGap={5} sx={{ mt: '2%' }}>
                    <Grid
                        size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                        }}>
                        <TextField
                            fullWidth
                            label="Asset Code"
                            name="assetCode"
                            variant='filled'
                            placeholder="Asset Code"
                            value={formDatas.assetCode}
                            onChange={(e) => e.preventDefault()}
                        />
                    </Grid>

                    <Grid
                        size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                        }}>
                        <TextField
                            fullWidth
                            label="Asset Name"
                            name="assetName"
                            variant='filled'
                            placeholder="Asset Name"
                            value={formDatas.assetName}
                            onChange={(e) => e.preventDefault()}
                        />
                    </Grid>

                    <Grid
                        size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                        }}>
                        <Autocomplete
                            options={currentCondition}
                            value={formDatas.condition}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    required
                                    label="Condition"
                                    variant='filled'
                                    error={formErrors.condition === null ? false : true}
                                    helperText={formErrors.condition === null ? '' : formErrors.condition}
                                />
                            )}
                            onChange={(event, value) => setConditionChange('condition', value)}
                        />
                    </Grid>

                    <Grid
                        size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                        }}>
                        <Autocomplete
                            options={ get_empbasecompany.filter((e)=>{
                               return  props.assetData.assignedTo !== e.employee_id
                             
                             })}
                            getOptionLabel={(option) => option.last_name ? option.first_name + " " + option.last_name : option.first_name || ''}
                            value={formDatas.assignTo}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    required
                                    label="Assign To"
                                    variant='filled'
                                    error={formErrors.assignTo === null ? false : true}
                                    helperText={formErrors.assignTo === null ? '' : 'Assign To is required'}
                                />
                            )}
                            onChange={(event, value) => setConditionChange('assignTo', value)}
                        />
                    </Grid>

                    <Grid
                        size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                        }}>
                        <Grid container gap={2} display="flex" justifyContent="end">
                            <Grid>
                                <Button variant="contained" color="error" onClick={() => props.closeDialog(false)}>
                                    Cancel
                                </Button>
                            </Grid>

                            <Grid>
                                <Button variant="contained" onClick={handleAssignToSubmit}>
                                    Assign
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Card>
        </>
    );
};

export default AssignedTo;
