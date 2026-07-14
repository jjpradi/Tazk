import { Autocomplete, Button, Card, FormControl, FormControlLabel, Grid, IconButton, Switch, TextField, Typography } from '@mui/material';
import React, { useEffect, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAppConfigDataAction, updateInventoryConfigAction } from 'redux/actions/app_config_actions';
import EditIcon from '@mui/icons-material/Edit';
import CreateNewButtonContext from "context/CreateNewButtonContext"
import {getsessionStorage} from "pages/common/login/cookies";
import { UserRightsAuthorization } from "@crema/utility/helper/UserRightsHelper";
import { alpha, styled } from '@mui/system';

const GeneralInventory = () => {
    const dispatch = useDispatch();
    const storage = getsessionStorage();
    const selectedRole = storage?.role_name;
    

    const {setModalTypeHandler, setLoaderStatusHandler} = useContext(CreateNewButtonContext)

    const {
        appConfigReducer: { app_config_data },
        rbacReducer: { menuAccess = {} }
    } = useSelector((state) => state);

    const options = [
        { name: 'Append', id: 1 },
        { name: 'Overwrite', id: 2 },
    ];

    const [formData, setFormData] = useState({
        inventory_type: null,
        applyRoundOff: "false"
    });

    const [open,setOpen]= useState(false)

    // useEffect(() => {
    //     await dispatch(getAppConfigDataAction(setModalTypeHandler, setLoaderStatusHandler));
    // }, [dispatch]);

    useEffect(() => {
        if (app_config_data?.length) {
            const data = app_config_data.find((e) => e.key_name === 'inventory.upload');
            const applyRoundOff = app_config_data.find((e) => e.key_name === 'company.applyRoundOff')
            console.log(applyRoundOff, 'fnbdsfb')
            if (data) {
                const selectedOption = options.find((opt) => opt.name.toUpperCase() === data.value.toUpperCase());
                setFormData((prev) => ({ ...prev, inventory_type: selectedOption || null, applyRoundOff: applyRoundOff.value }));
            }
        }
    }, [app_config_data]);     

    console.log(formData,'app_config_data')

    const handleChange = (_, value) => {
        setFormData({ inventory_type: value });
    };

    const handleCheck = (e) => {
        const { name, checked } = e.target;
        setFormData((prev) => ({ ...prev, [name]: checked ? 'true' : 'false' }));
    }

    const submit=async()=>{
        
        const payload = {
            data : formData.inventory_type,
            applyRoundOff: formData.applyRoundOff
        }

        await dispatch(updateInventoryConfigAction(payload))
        await dispatch(getAppConfigDataAction());
        setOpen(false)

    }
    const Company = storage?.company_type === 2;
    const generalEdit = Company ? UserRightsAuthorization(menuAccess[selectedRole], "info__general", "can_edit") : true;

    const RedditTextField = styled((props) => (
            <TextField slotProps={{ input: { disableUnderline: true, readOnly: true } }} {...props} />
        ))(({ theme }) => ({
            '& .MuiFilledInput-root': {
                border: '1px solid #e2e2e1',
                overflow: 'hidden',
                borderRadius: 4,
                backgroundColor: theme.palette.mode === 'light' ? '#fcfcfb' : '#2b2b2b',
                transition: theme.transitions.create([
                    'border-color',
                    'background-color',
                    'box-shadow',
                ]),
                '&:hover': {
                    backgroundColor: 'transparent',
                },
                '&.Mui-focused': {
                    backgroundColor: 'transparent',
                    boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 2px`,
                    borderColor: theme.palette.primary.main,
                },
            },
        }))
    return (
        <div>
            <Grid container p={5} spacing={2}>
               { !open && <Grid container justifyContent={'flex-end'} >
                    <Grid>
                        {generalEdit &&(
                            <IconButton onClick={()=> setOpen(true)}>
                                <EditIcon/>
                            </IconButton>
                        )}
                        </Grid>
               </Grid>}
                <Grid
                    size={{
                        lg: 4,
                        md: 4,
                        sm: 6,
                        xs: 12
                    }}>
                    <Autocomplete
                        // disablePortal
                        disabled={!open}
                        options={options}
                        getOptionLabel={(option) => option.name}
                        value={formData.inventory_type}
                        onChange={handleChange}
                        renderInput={(params) => (
                            <TextField {...params} label="Inventory Upload" variant="filled" />
                        )}
                    />
                </Grid>

                <Grid
                    size={{
                        lg: 3,
                        md: 4,
                        sm: 6,
                        xs: 12
                    }}>
                        {
                            open ?
                            <Card style={{ padding: '5px', height: '100px' }}>
                                <FormControl
                                    component='fieldset'
                                    fullWidth
                                    disabled={!open}
                                >
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                name='applyRoundOff'
                                                checked={formData.applyRoundOff === "true"}
                                                size='medium'
                                                color='primary'
                                                label='Apply Round Off (Rounds the total amount to the nearest ₹1)'
                                                // disabled={formValues.face_attendance === "true"}
                                                onChange={handleCheck}
                                            />
                                        }
                                        label='Apply Round Off'
                                        name='applyRoundOff'
                                    />
                                </FormControl>
                                <Typography sx={{ fontWeight: '500', fontSize: '11px' }}>Rounds the total amount to the nearest ₹1</Typography>
                            </Card>
                            : <RedditTextField
                                    label="Apply Round Off (Rounds the total amount to the nearest ₹1)"
                                    defaultValue={formData.applyRoundOff === 'true' ? 'Enabled' : 'Disabled'}
                                    id="apply-round-off-rounds-the-total-amount-to-the-nea-input"
                                    variant="filled"
                                    fullWidth
                                />
                        }
                </Grid>
              {
                open &&   <Grid container justifyContent="flex-end" spacing={3}>
                <Grid>
                    <Button variant="contained" color="error" onClick={()=> setOpen(false)}>
                        Cancel
                    </Button>
                </Grid>
                <Grid>
                    <Button variant="contained" color="primary" onClick={submit}>
                        Submit
                    </Button>
                </Grid>
            </Grid>
              }
            </Grid>
        </div>
    );
};

export default GeneralInventory;
