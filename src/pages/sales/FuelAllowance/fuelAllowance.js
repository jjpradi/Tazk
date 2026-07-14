import React, { useState, useContext, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Grid,
    Autocomplete,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    Paper,
    Button,
    TablePagination,
    Box,
    Card
} from '@mui/material';
import { getsessionStorage } from 'pages/common/login/cookies';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { useDispatch, useSelector } from 'react-redux';
import apiCalls from 'utils/apiCalls';
import { createFuelPriceAction, getFuelPriceBasedOnTypeAction, getFuelPriceListAction, getFuelTypesAction, getSalesmanFuelDetailsAction, getSalesManListAction } from 'redux/actions/fuelAllowance_actions';
import { getAppConfigDataAction } from 'redux/actions/app_config_actions';


const FuelAllowanceForm = ({open,onClose}) => {
    const storage = getsessionStorage()
    const [ fdate, setFdate ] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[ 0 ];
    });
    const [ fuelType, setFuelType ] = useState('');
    const [ fuelPrice, setFuelPrice ] = useState('');
    const [ rows, setRows ] = useState([]);
    const [ submitted,  setSubmitted ] = useState(false);
    const { setModalTypeHandler, setLoaderStatusHandler } = useContext(
        CreateNewButtonContext,
    );

    const dispatch = useDispatch();
    const {
        fuelAllowanceReducer: { getFuelTypes, salesManList, getFuelPriceBasedOnType, fuelPriceList, getSalesmanFuelDetails },
        appConfigReducer: { app_config_data }
    } = useSelector((state) => state);

    useEffect(() => {
        const payload = {
            searchString: ''
        };
        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(getFuelTypesAction()),
            dispatch(getSalesManListAction(payload)),
            dispatch(getSalesmanFuelDetailsAction()),
            dispatch(getAppConfigDataAction())
        );
    }, []);

    console.log(getFuelPriceBasedOnType, "fuelType")

// const isManual = app_config_data?.find(item => item.key_name === 'fuelallowance.manual')?.value === 'true';
// const isAutomatic = app_config_data?.find(item => item.key_name === 'fuelallowance.automatic')?.value === 'true';

// const isManualMode = isManual || !isAutomatic;

// const isAutomatic = app_config_data?.find(cfg => cfg.key_name === 'fuelallowance.automatic')?.value === 'true';
// const isManual = app_config_data?.find(cfg => cfg.key_name === 'fuelallowance.manual')?.value === 'true';


    const isManualMode = app_config_data?.find(
        (item) => item.key_name === 'fuelallowance.automatic'
    )?.value === 'false';

    useEffect(() => {
        if (fuelType && fdate) {
            const data = {
                date: fdate,
                type: fuelType.fueltype,
            };

            console.log("Dispatching payload:", data);

            apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler,
                dispatch(getFuelPriceBasedOnTypeAction(data))
            );
        }
    }, [ fuelType, fdate ]);

    useEffect(() => {
        if (Array.isArray(getFuelPriceBasedOnType) && getFuelPriceBasedOnType.length > 0) {
            setFuelPrice(getFuelPriceBasedOnType[ 0 ].fuelPrice);
        } else {
            setFuelPrice('')
        }
    }, [ getFuelPriceBasedOnType ]);

    useEffect(() => {
        const sourceList = salesManList || [];

        if (sourceList.length > 0) {
            const formattedRows = sourceList.map(item => ({
                id: item.empId || item.employee_id,
                selected: false,
                salesmanId: item.empId || item.employee_id,
                first_name: item.first_name || item.name,
                kmTraveled: item.kmTraveled || '',
                mileage: item.mileage || ''
            }));
            setRows(formattedRows);
        }
    }, [ getSalesmanFuelDetails, salesManList, open ]);



    const handleGenerate = () => {
        setSubmitted(true)
        const selectedRows = rows.filter(row => row.selected);

        if (!selectedRows.length || !fuelType || !fuelPrice) {
            alert('Please select at least one salesman and ensure fuel type and price are selected.');
            return;
        }

            const hasError = selectedRows.some(row =>
                !row.kmTraveled || !row.mileage
            );

            if (hasError) {
                return; // ✅ stop submit if validation fails
            }

          const type = app_config_data?.find(cfg => cfg.key_name === 'fuelallowance.automatic')?.value === 'true' ? 0
                        : app_config_data?.find(cfg => cfg.key_name === 'fuelallowance.manual')?.value === 'true' ? 1
                        : null;

        const allowance = selectedRows.map(row => ({
            date: fdate,
            empId: row.salesmanId,
            bike: 'Bike',
            kmTraveled: Number(row.kmTraveled),
            mileage: Number(row.mileage),
            allowance: Number(((row.kmTraveled / row.mileage) * fuelPrice).toFixed(2)),
            attendanceIdList: [],
            type
        }));

        const payload = {
            allowance,
            fuelPrice: {
                date: fdate,
                fuelType: fuelType.fueltype,
                fuelPrice: Number(fuelPrice),
            },
        };
        dispatch(createFuelPriceAction(payload));
        setRows([]);
        setFuelPrice('');
        setFuelType('');
        onClose();
    };


    const handleCheckboxChange = (index) => {
        const newRows = [ ...rows ];
        const currentlySelected = newRows[index].selected;
        newRows[ index ].selected = !newRows[ index ].selected;
        newRows[index].required = !newRows[ index ].required

    if (currentlySelected === true) {
        newRows[index].kmTraveled = "";
        newRows[index].mileage = "";
    }
        setRows(newRows);
    };

    const handleInputChange = (index, field, value) => {
        const newRows = [ ...rows ];
        newRows[ index ][ field ] = value;
        setRows(newRows);
    };

    console.log('app_config_data',open)

    return (
        <Grid>
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <DialogTitle>Fuel Allowance Entry</DialogTitle>
                <DialogContent style={{ height: '80vh' }}>
                    <Grid container spacing={2} mb={2}>
                        <Grid style={{paddingTop:'15px'}} size={4}>
                            <TextField
                                label="Fuel Date"
                                type="date"
                                fullWidth
                                value={fdate}
                                onChange={(e) => setFdate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid style={{paddingTop:'15px'}} size={4}>
                            <Autocomplete
                                options={getFuelTypes || []}
                                getOptionLabel={(option) => option.fueltype || ''}
                                value={fuelType}
                                onChange={(e, newValue) => { setFuelType(newValue);}}
                                renderInput={(params) => (
                                    <TextField {...params} label="Fuel Type" fullWidth  variant="outlined" InputLabelProps={{ shrink: true }}/>
                                )}
                            />
                        </Grid>
                        <Grid style={{paddingTop:'15px'}} size={4}>
                            <TextField
                                label="Fuel Price"
                                type="number"
                                fullWidth
                                value={fuelPrice}
                                onChange={(e) => {
                                    setFuelPrice(e.target.value);
                                }}
                                variant="outlined"
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                    </Grid>

                    <TableContainer component={Paper}
                    style={{ height: '65vh', overflowY: 'auto' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell></TableCell>
                                    <TableCell>Salesman Name</TableCell>
                                    <TableCell>Km Traveled</TableCell>
                                    <TableCell>Mileage</TableCell>
                                    <TableCell>Allowance</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row, index) => {
                                    const salesman = getSalesmanFuelDetails.find(s => s.salesmanId === row.salesmanId);


                                    return (
                                        <TableRow key={row.id} style={{height : '50px'}}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={row.selected}
                                                    onChange={() => handleCheckboxChange(index)}
                                                />
                                            </TableCell>
                                            <TableCell>{row.first_name || '—'}</TableCell>
                                            <TableCell>
                                                <TextField
                                                    type="number"
                                                    value={row.kmTraveled}
                                                    onChange={(e) =>{
                                                        if (isManualMode) handleInputChange(index, 'kmTraveled', e.target.value)
                                                    }}
                                                    fullWidth
                                                    variant="standard"
                                                    error={
                                                            submitted &&
                                                            row.selected &&
                                                            (row.kmTraveled === null || row.kmTraveled === "")
                                                        }
                                                    helperText={
                                                            submitted &&
                                                            row.selected &&
                                                            (row.kmTraveled === null || row.kmTraveled === "")
                                                                ? 'required'
                                                                : ''
                                                        }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    type="number"
                                                    value={row.mileage}
                                                   onChange={(e) => { if (isManualMode) handleInputChange(index, 'mileage', e.target.value);}}
                                                    fullWidth
                                                    variant="standard"
                                                    error={
                                                            submitted &&
                                                            row.selected &&
                                                            (row.mileage === null || row.mileage === "")
                                                        }
                                                        helperText={
                                                            submitted &&
                                                            row.selected &&
                                                            (row.mileage === null || row.mileage === "")
                                                                ? 'required'
                                                                : ''
                                                        }
                                                    InputProps={{ readOnly: !isManualMode }}
                                                />

                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    type="number"
                                                    value={
                                                        row.kmTraveled && row.mileage
                                                            ? ((row.kmTraveled / row.mileage) * fuelPrice).toFixed(2)
                                                            : ''
                                                    }
                                                    fullWidth
                                                    variant="standard"
                                                    InputProps={{ readOnly: true }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Grid
                        style={{
                            marginTop: '20px',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '10px',
                        }}
                    >
                        <Button
                            onClick={() => {
                                setFuelType('');
                                setFuelPrice('');
                                onClose();
                                setRows([])
                            }}
                            variant='outlined'
                            color="primary"
                        >
                            Back
                        </Button>
                        <Button
                            variant='outlined'
                            color="primary"
                            onClick={handleGenerate}
                        >
                            Generate
                        </Button>
                    </Grid>
                </DialogContent>
            </Dialog>
        </Grid>
    );
};

export default FuelAllowanceForm;
