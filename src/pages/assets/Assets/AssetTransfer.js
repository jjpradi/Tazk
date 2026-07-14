import React, { useEffect, useState } from 'react';
import { Autocomplete, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { allListStockLocation } from 'redux/actions/stock_Location_actions';
import { useDispatch, useSelector } from 'react-redux';
import apiCalls from 'utils/apiCalls';
import { CreateMoveAction, ListAssetTimeline, getMoveAsset, } from 'redux/actions/asset_actions';
import { capitalize } from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types'
import { requiredFieldsAlertMessage } from 'utils/content';
import { OpenalertActions } from 'redux/actions/alert_actions';

const AssetTransfer = (props) => {

    const { Location, asset_id } = props.assetData;
    const transferredBy = props.assetData?.['Asset Owner'] || '-';
    const transferredOn = moment().format('DD/MM/YYYY hh:mm A');


    const [open, setOpen] = useState(false);

    const dispatch = useDispatch();

    const [newLocation, setNewLocation] = useState({
        currentLocation : Location,
        destinationLocation : null
    });

    const [newLocationError, setNewLocationError] = useState({
        currentLocation : null,
        destinationLocation : null
    });

    const requiredFields = [ 'destinationLocation'];

    const {
        stockLocationReducer: { allliststocklocation },
        AssetReducers:{
        getMove
    },
    
 } = useSelector((state) => state)


    useEffect(() => {
        dispatch(allListStockLocation())
        dispatch(getMoveAsset({asset_id: asset_id}))
    }, []);
   

    const handleChange = (name, val) => {
        if (val !== null) {
            setNewLocation({
                ...newLocation,
                [name]: val
            });
            setNewLocationError({
                ...newLocationError,
                [name]: null
            });
        } 

        else {
            setNewLocation({
                ...newLocation,
                [name]: null
            });
            setNewLocationError({
                ...newLocationError,
                [name]: capitalize(name.replace(/_/g, ' '))+' is required'
            });
        }
    };

    

    const handleSubmit =  (event) => {
        event.preventDefault();
        let isValid = true;
        let formErrorsObj = { ...newLocationError };

        Object.keys(newLocation).map((key, i) => {
            if(requiredFields.includes(key) && (newLocation[key] === null || newLocation[key] === '')){  
              isValid = false
                formErrorsObj[key] = capitalize(key) + ' is Required'
            }
            return null
        });
        
        setNewLocationError(formErrorsObj)

        if(isValid){
            setOpen(true)
        }
        else {
            dispatch(OpenalertActions({ msg : requiredFieldsAlertMessage, severity : 'warning' }))
        }
    };


    const handleConfirm = async () => {
    
        const data = {
            current_location : newLocation.currentLocation,
            destination_location : newLocation.destinationLocation.location_name,
            destination_location_id: newLocation.destinationLocation.location_id,
            asset_id: props.assetData.asset_id,
            timeline_message:`Transfered from ${newLocation.currentLocation} to ${ newLocation.destinationLocation.location_name} `,
            transferred_by_name: transferredBy, 
            transferred_on: new Date(),
        }

        const status = await dispatch(CreateMoveAction(data));

  if (status === 'API_FINISHED_SUCCESS') {
    await dispatch(ListAssetTimeline(props.assetData.asset_id));
    setOpen(false);
    props.handleDetailClose();
  }
    }

    const isDisabledOption = (option) => option.location_name === newLocation.currentLocation;
    
    return (
        <div style={{padding:'20px'}}>
            <Grid paddingBottom='20px'>
                <Typography>Asset Transfer</Typography>
            </Grid>
            <Box overflow='hidden'>
                <Grid
                    display='flex'
                    alignItems='center'
                    gap={2}
                    size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                    }}>
                    <TextField
                        variant='filled'
                        name='currentLocation'
                        value={newLocation.currentLocation}
                        onChange={(e) => e.preventDefault()}
                        label='Current Location'
                    />
                    <ArrowForwardIcon />


                    <Autocomplete sx={{width:'250px'}}
                        options={allliststocklocation.filter(option => !isDisabledOption(option))}
                        getOptionLabel={(option) => option.location_name || ''}
                        value={newLocation.destinationLocation}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                required
                                label='Destination Location '
                                variant='filled'
                                error={newLocationError.destinationLocation !== null}
                                helperText={newLocationError.destinationLocation === null ? '' : 'Destination Location is required'}
                            />
                        )}
                        onChange={(event, value) => handleChange('destinationLocation', value)}
                    />
                </Grid>
                
                <Grid width={'800px'}>
                    <Grid display={'flex'} alignItems={'center'} sx={{ paddingTop: '10px' }}>
                        <InputLabel style={{ marginRight: '10px' }}>
                            Transferred By 
                        </InputLabel> 
                        <InputLabel style={{ marginRight: '10px' }}>:
                        </InputLabel>
                        <InputLabel>{transferredBy}</InputLabel>

                    </Grid>

                    <Grid display={'flex'} alignItems={'center'} sx={{ paddingTop: '10px' }}>
                        <InputLabel style={{ marginRight: '10px' }}>
                            Transferred On 
                        </InputLabel>
                        <InputLabel style={{ marginRight: '10px' }}>:
                        </InputLabel>
                        <InputLabel>{transferredOn}</InputLabel>

                    </Grid>
                </Grid>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 5 }}>
                    <Grid container style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Grid
                            style={{ display: 'flex', width: '250px', justifyContent: 'space-around' }}>

                            <Button variant='contained' color='error' onClick={() => props.closeDialog(false)}>Cancel</Button>

                            <Button variant='contained' onClick={handleSubmit}>
                                Submit
                            </Button>
                        </Grid>
                    </Grid>

                </div>


                <Dialog
                    open={open}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="assettransfer-dialog-title" sx={{ width: '400px' }}>
                        Are you sure to transfer the asset?
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="assettransfer-dialog-description">
                            Are you sure to transfer the asset?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={handleConfirm} autoFocus>
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </div>
    );
}

AssetTransfer.propTypes = {
    assetData : PropTypes.object,
    handleDetailClose : PropTypes.func,
    closeDialog : PropTypes.func
}

export default AssetTransfer;
