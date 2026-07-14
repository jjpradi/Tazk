import React, { useContext, useEffect, useState } from 'react'
import {
    Autocomplete,
    Box,
    Card,
    CardContent,
    CardHeader,
    Divider,
    FormControl,
    FormLabel,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from '@mui/material';
import QRCode from 'react-qr-code';
import { getsessionStorage } from 'pages/common/login/cookies';
import { useDispatch, useSelector } from 'react-redux';
import { getLocationAction } from 'redux/actions/loan_actions';
import context from '../../../src/context/CreateNewButtonContext';
import { allListStockLocation } from 'redux/actions/stock_Location_actions';
import { maxBodyHeight } from 'utils/pageSize';

function QrView(props) {
    const { stockLocation, handleQr, locationName, locationString, time, location, setLocation, qrAttendance } = props;
    const dispatch = useDispatch();
    let storage = getsessionStorage()
    const [filteredLocations, setFilteredLocations] = useState([]);

    const { setLoaderStatusHandler, setModalTypeHandler } = useContext(context);

    useEffect(() => {
        const role_name = storage.role_name;

        dispatch(allListStockLocation()).then(() => {
            dispatch(getLocationAction(setModalTypeHandler, setLoaderStatusHandler))
                .then((response) => {

                    if (role_name === "Front Desk" && response.length > 0) {
                        const assignedLocation = response[0]?.location_id || '';
                        setLocation(assignedLocation);
                    }
                })
        });
    }, [dispatch]);

    useEffect(() => {
        if (stockLocation.length > 0) {
            if (storage.role_name === "Front Desk" && location) {
                setFilteredLocations(stockLocation.filter(loc => loc.location_id === location));
            } else {
                setFilteredLocations(stockLocation);
            }
        }
    }, [stockLocation, location]);
        
    return (
        <Box  sx={{minHeight:maxBodyHeight,maxHeight:maxBodyHeight}}>
            <Grid
                container
                display='flex'
                flexDirection='row'
                alignItems='center'
                spacing={5}
                // style={{height:'82vh',overflow:'auto'}}
            >
                <Grid
                    size={{
                        md: 12,
                        xs: 12
                    }}>
                    <Typography
                        align='left'
                        sx={{
                            paddingTop: '15px',
                            paddingBottom:
                                '15px',
                                fontSize:'13px'

                        }}
                    >
                        {'Qr Attendance'}
                    </Typography>
                </Grid>

                {/* <Grid size={{ xs: 12, md: 4 }}>
                    <Autocomplete
                        fullWidth
                        required
                        value={location ? stockLocation.find((f) => f.location_id === location) : { location_name: '' }}
                        name='location'
                        onChange={(event, newValue) => handleQr(newValue)}
                        options={
                            stockLocation
                        }
                        getOptionLabel={(option) => option.location_name}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                required
                                label='Location'
                            />
                        )}
                    />
                </Grid> */}
                <Grid
                    size={{
                        md: 4,
                        lg: 3,
                        xs: 12
                    }}>
                     <FormControl variant="outlined" fullWidth>
                     {/* <InputLabel style={{marginBottom:"10px"}}>Select Location</InputLabel> */}
                     <FormLabel>Select Location</FormLabel>
                        <Select
                        labelId="demo-simple-select-filled-label"
                        id="demo-simple-select-filled"
                        value={location}
                        onChange={(event, newValue) => handleQr(newValue)}
                        fulwidth={true}
                        
                        >
                            {filteredLocations.map((m)=>(
                            <MenuItem
                            key={m.location_id}
                             value={m.location_id}
                            >
                             {m.location_name}
                            </MenuItem>
                            ))}
                        </Select>
                     </FormControl>
                </Grid>

                {location !== '' ? (
                    <Grid
                        display='flex'
                        justifyContent='center'
                        mt='15px'
                        mb='15px'
                        size={{
                            md: 12,
                            xs: 12
                        }}>
                        <Card
                            sx={{
                                p: '20px',
                                boxShadow: `0px 12px 23px #C4CDD5`
                            }}
                        >
                            <CardHeader
                                title={
                                    <Typography
                                        align='center'
                                        variant='h6'
                                    >
                                        {locationName}
                                    </Typography>
                                }
                                subheader={<Divider />}
                            />
                            <CardContent>
                                <Box
                                    height='150%'
                                    sx={{
                                        p: '20px',
                                    }}
                                >
                                    {qrAttendance.qr_id !== undefined && locationString !== "" ? (
                                        <QRCode
                                            style={{
                                                height: 'auto',
                                                maxWidth: '100%',
                                                width: '100%',
                                            }}
                                            value={
                                                locationString
                                            }
                                            viewBox={`0 0 256 256`}
                                        />

                                    ) : (
                                        <Typography
                                            align='center'
                                            variant='h2'
                                        >
                                            {qrAttendance.message ?? ""}
                                        </Typography>
                                    )}
                                </Box>
                            </CardContent>
                            <CardContent>
                                <Typography
                                    align='center'
                                    variant='h6'
                                >
                                    {time}
                                </Typography>

                            </CardContent>
                        </Card>
                    </Grid>
                ) : (
                    <Grid
                        display='flex'
                        justifyContent='center'
                        mt='15px'
                        mb='15px'
                        size={{
                            md: 12,
                            xs: 12
                        }}>
                        <Box
                            height='400px'
                            sx={{
                                p: '20px',
                            }}
                            display='flex'
                            alignItems='center'
                        >
                            <Typography
                                sx={{
                                    width: '100%',
                                    textAlign: 'center',
                                    fontSize: '16px',
                                    padding: '20px',
                                    color: 'gray',
                                }}
                            >
                                {'Select a Location..'}
                            </Typography>
                        </Box>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
}

export default QrView