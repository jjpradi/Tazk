import React, { useEffect, useState } from 'react';
import {
    Modal,
    Card,
    Button,
    TextField,
    Autocomplete,
    Grid,
    IconButton,
    Badge,
    Box
} from '@mui/material';
import { FilterAlt } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 4,
};

const AccountFilterModal = ({
    open,
    handleClose,
    filterValues,
    setFilterValues,
    accountTypes = [],
    accountGroups = [],
    parentLedgers = [],
    applyFilter,
    clearFilter,
    count
}) => {
    const [localFilter, setLocalFilter] = useState(filterValues || {});

    useEffect(() => {
        setLocalFilter(filterValues);
    }, [filterValues]);

    const handleChange = (name, value) => {
        setLocalFilter(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const isApplyDisabled = 
    (!localFilter.accountTypes || localFilter.accountTypes.length === 0) &&
    (!localFilter.accountGroups || localFilter.accountGroups.length === 0) &&
    (!localFilter.parentLedgers || localFilter.parentLedgers.length === 0);

    return (
        <>
            <Badge color="secondary" badgeContent={count || 0}>
                <FilterAlt onClick={() => handleClose(true)} style={{ cursor: 'pointer' }} />
            </Badge>
            <Modal
                open={open}
                onClose={() => handleClose(false)}
                aria-labelledby="account-filter-modal"
            >
                <Card sx={style}>
                    <div style={{ textAlign: 'right' }}>
                        <IconButton onClick={() => handleClose(false)}>
                            <CloseIcon />
                        </IconButton>
                    </div>

                    <Grid container spacing={2} direction="column">
                        <Grid>
                            <Autocomplete
                                multiple
                                options={accountTypes}
                                getOptionLabel={(option) => option.name || ''}
                                value={localFilter.accountTypes || []}
                                onChange={(e, value) => handleChange("accountTypes", value)}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                renderInput={(params) => (
                                    <TextField {...params} label="Account Type" variant="outlined" fullWidth />
                                )}
                            />

                        </Grid>

                        <Grid>
                            <Autocomplete
                                multiple
                                options={accountGroups}
                                getOptionLabel={(option) => option.name || ''}
                                value={localFilter.accountGroups || []}
                                onChange={(e, value) => handleChange("accountGroups", value)}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                renderInput={(params) => (
                                    <TextField {...params} label="Account Group" variant="outlined" fullWidth />
                                )}
                            />
                        </Grid>

                        <Grid>
                            <Autocomplete
                                multiple
                                options={parentLedgers}
                                getOptionLabel={(option) => option.name || ''}
                                value={localFilter.parentLedgers || []}
                                onChange={(e, value) => handleChange("parentLedgers", value)}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                renderInput={(params) => (
                                    <TextField {...params} label="Parent Ledger" variant="outlined" fullWidth />
                                )}
                            />
                        </Grid>
                    </Grid>

                    <Grid
                        container
                        spacing={2}
                        justifyContent="center"
                        alignItems="center"
                        mt={3}
                    >
                        <Grid>
                            <Button variant="contained" color="secondary" onClick={() => clearFilter()}>
                                Clear
                            </Button>
                        </Grid>
                        <Grid>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    setFilterValues(localFilter);
                                    applyFilter && applyFilter(localFilter);
                                    handleClose(false);
                                }}
                                disabled={isApplyDisabled}
                            >
                                Apply
                            </Button>
                        </Grid>
                    </Grid>
                </Card>
            </Modal>
        </>
    );
};

export default AccountFilterModal;
