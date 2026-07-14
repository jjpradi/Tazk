import React, { useEffect, useMemo, useState } from 'react'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Grid, IconButton, Paper, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import CommonToolTip from 'components/ToolTip';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import InputAdornment from '@mui/material/InputAdornment';
import { alpha, styled } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { getAllowanceType, getAppconfigPercentAction, getDeductionType, updateSalaryStructurePercentAction } from 'redux/actions/salary_actions';
import { getsessionStorage } from '../login/cookies';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

const RedditTextField = styled((props) => (
    <TextField slotProps={{ input: { disableUnderline: true, readOnly: true } }} {...props} />
))
(({ theme }) => ({
'& .MuiFilledInput-root': {
    border: '1px solid #e2e2e1',
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: theme.palette.mode === 'light' ? '#fcfcfb' : '#2b2b2b',
    transition: theme.transitions.create(['border-color', 'background-color', 'box-shadow']),
    '&:hover': { backgroundColor: 'transparent' },
    '&.Mui-focused': {
    backgroundColor: 'transparent',
    boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 2px`,
    borderColor: theme.palette.primary.main,
    },
},
}));

const SalaryPercent = () => {
    const dispatch = useDispatch()
    const storage = getsessionStorage()
    const [editOpen, setEditOpen] = useState(false)

    const {
        SalaryReducers: { salaryPercent, AllowanceType, deductionType },
        rbacReducer: { menuAccess }
    } = useSelector((state) => state)

    const [formValues, setFormValues] = useState({
        salaryPercent: '',
        allowancePercent: [],
        deductionPercent: [],
    })

    const [savedPercentValues, setSavedPercentValues] = useState({
        allowancePercent: [],
        deductionPercent: [],
    })

    const deductionPercentOptions = (deductionType || []).filter(
        (item) => !['EPF', 'ESI', 'PT'].includes(item?.deduction_code)
    )
    
    const [disableConfirmOpen, setDisableConfirmOpen] = useState(false)

    const salaryPercentList = useMemo(() => (
        Array.isArray(salaryPercent) ? salaryPercent : []
    ), [salaryPercent])

    const getSavedPercentageValue = (item) => {
        if (item?.percentage !== undefined && item?.percentage !== null && item?.percentage !== '' && String(item.percentage) !== '0') {
            return String(item.percentage)
        }

        if (item?.percent !== undefined && item?.percent !== null && item?.percent !== '' && String(item.percent) !== '0') {
            return String(item.percent)
        }

        if (item?.value !== undefined && item?.value !== null && item?.value !== '' && String(item.value) !== '0' && item?.allowance_code) {
            return String(item.value)
        }

        if (item?.value !== undefined && item?.value !== null && item?.value !== '' && String(item.value) !== '0' && item?.deduction_code) {
            return String(item.value)
        }

        return ''
    }

    const getSavedPercentRows = (typeList, codeField, nameField) => {
        return typeList.reduce((acc, typeItem) => {
            const directValue = getSavedPercentageValue(typeItem)

            if (directValue) {
                acc.push({
                    id: typeItem.id,
                    [nameField]: typeItem[nameField],
                    [codeField]: typeItem[codeField],
                    value: directValue,
                })

                return acc
            }

            const matchedItem = salaryPercentList.find((savedItem) =>
                String(savedItem?.[codeField] || '').toLowerCase() === String(typeItem?.[codeField] || '').toLowerCase()
            )

            const value = getSavedPercentageValue(matchedItem)

            if (!value) {
                return acc
            }

            acc.push({
                id: typeItem.id,
                [nameField]: typeItem[nameField],
                [codeField]: typeItem[codeField],
                value,
            })

            return acc
        }, [])
    }

    useEffect(() => {
        dispatch(getAllowanceType(storage.company_id))
        dispatch(getDeductionType(storage.company_id))
        dispatch(getAppconfigPercentAction())
    }, [])

    useEffect(() => {
        if (salaryPercentList.length > 0) {
            setFormValues((prev) => ({
                ...prev,
                salaryPercent: salaryPercentList[0]?.value === '0' ? 'Disabled' : 'Enabled',
            }))
        }
    }, [salaryPercentList])

    useEffect(() => {
        if (!editOpen) {
            return
        }

        const allowancePercent = getSavedPercentRows(AllowanceType || [], 'allowance_code', 'allowance_name')
        const deductionPercent = getSavedPercentRows(deductionPercentOptions, 'deduction_code', 'deduction_name')

        setSavedPercentValues({
            allowancePercent,
            deductionPercent,
        })

        setFormValues((prev) => ({
            ...prev,
            allowancePercent,
            deductionPercent,
        }))
    }, [editOpen, salaryPercentList, AllowanceType, deductionType])

    useEffect(() => {
        if (formValues.salaryPercent !== 'Enabled') {
            return
        }

        setSavedPercentValues({
            allowancePercent: formValues.allowancePercent,
            deductionPercent: formValues.deductionPercent,
        })
    }, [formValues.salaryPercent, formValues.allowancePercent, formValues.deductionPercent])

    const handleAllowancePercentChange = (value, item) => {
        if (value !== '' && Number(value) > 100) {
            return
        }

        setFormValues((prev) => {
            if (value === '') {
                return {
                    ...prev,
                    allowancePercent: prev.allowancePercent.filter((percentItem) => percentItem.id !== item.id),
                }
            }

            const isExisting = prev.allowancePercent.find((percentItem) => percentItem.id === item.id)

            if (isExisting) {
                return {
                    ...prev,
                    allowancePercent: prev.allowancePercent.map((percentItem) =>
                        percentItem.id === item.id
                            ? {
                                ...percentItem,
                                value,
                            }
                            : percentItem
                    ),
                }
            }

            return {
                ...prev,
                allowancePercent: [
                    ...prev.allowancePercent,
                    {
                        id: item.id,
                        allowance_name: item.allowance_name,
                        allowance_code: item.allowance_code,
                        value,
                    },
                ],
            }
        })
    }

    const handleDeductionPercentChange = (value, item) => {
        if (value !== '' && Number(value) > 100) {
            return
        }

        setFormValues((prev) => {
            if (value === '') {
                return {
                    ...prev,
                    deductionPercent: prev.deductionPercent.filter((percentItem) => percentItem.id !== item.id),
                }
            }

            const isExisting = prev.deductionPercent.find((percentItem) => percentItem.id === item.id)

            if (isExisting) {
                return {
                    ...prev,
                    deductionPercent: prev.deductionPercent.map((percentItem) =>
                        percentItem.id === item.id
                            ? {
                                ...percentItem,
                                value,
                            }
                            : percentItem
                    ),
                }
            }

            return {
                ...prev,
                deductionPercent: [
                    ...prev.deductionPercent,
                    {
                        id: item.id,
                        deduction_name: item.deduction_name,
                        deduction_code: item.deduction_code,
                        value,
                    },
                ],
            }
        })
    }

    const handleEditOpen = () => {
        dispatch(getAllowanceType(storage.company_id))
        dispatch(getDeductionType(storage.company_id))
        setEditOpen(true)
    }

    const handleSalaryPercentToggle = (event) => {
        const isEnabled = event.target.checked

        setFormValues((prev) => ({
            ...prev,
            salaryPercent: isEnabled ? 'Enabled' : 'Disabled',
            allowancePercent: isEnabled ? savedPercentValues.allowancePercent : [],
            deductionPercent: isEnabled ? savedPercentValues.deductionPercent : [],
        }))
    }

    const handleCancel = () => {
        setEditOpen(false)
        dispatch(getAppconfigPercentAction())
    }

    const buildPercentagePayload = (typeList, formPercentList, codeField, nameField) => {
        return (typeList || []).map((item) => {
            const matchedItem = (formPercentList || []).find((percentItem) => percentItem.id === item.id)

            return {
                id: item.id,
                [nameField]: item[nameField],
                [codeField]: item[codeField],
                value: matchedItem?.value ?? '',
            }
        })
    }

    const submitSalaryPercent = async () => {
        const data = {
            salaryPercent: formValues?.salaryPercent === 'Enabled' ? 1 : 0,
            allowancePercent: formValues?.salaryPercent === 'Enabled'
                ? buildPercentagePayload(
                    AllowanceType,
                    formValues?.allowancePercent,
                    'allowance_code',
                    'allowance_name',
                )
                : [],
            deductionPercent: formValues?.salaryPercent === 'Enabled'
                ? buildPercentagePayload(
                    deductionPercentOptions,
                    formValues?.deductionPercent,
                    'deduction_code',
                    'deduction_name',
                )
                : []
        }
        await dispatch(updateSalaryStructurePercentAction(data))
        setEditOpen(false)
        dispatch(getAppconfigPercentAction())
    }

    const handleSubmit = async () => {
        if (formValues.salaryPercent === 'Disabled') {
            setDisableConfirmOpen(true)
            return
        }

        await submitSalaryPercent()
    }

    const handleDisableConfirmClose = () => {
        setDisableConfirmOpen(false)
    }

    const handleDisableConfirmSubmit = async () => {
        setDisableConfirmOpen(false)
        await submitSalaryPercent()
    }

    const selectedRole = storage.role_name
    const salaryPercentEdit = UserRightsAuthorization(menuAccess[selectedRole], 'config__salary_structure_percentage', 'can_edit');

  return (
    <>
        <Grid sx={{ padding: '20px', bgcolor: !editOpen ? '#f6f8fb' : 'transparent', minHeight: 'calc(100vh - 110px)' }}>
            <Grid display="flex" justifyContent="space-between" size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
                <Typography className="page-title">
                    {editOpen ? 'Update Salary Structure Percent' : 'Salary Structure Percentage'}
                </Typography>

                {!editOpen ? (
                    salaryPercentEdit && <Box display="flex" gap={0.5}>
                        <CommonToolTip title="Edit">
                            <IconButton sx={{ height: '100%' }} onClick={handleEditOpen}>
                                <EditIcon />
                            </IconButton>
                        </CommonToolTip>
                    </Box>
                ) : (
                    <Box display="flex" gap={0.5}>
                        <CommonToolTip title="Close">
                            <IconButton sx={{ height: '100%' }} onClick={handleCancel}>
                                <CloseIcon />
                            </IconButton>
                        </CommonToolTip>
                    </Box>
                )}
            </Grid>

            <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
                {!editOpen && (
                    <Paper
                        elevation={0}
                        sx={{
                            mt: 2,
                            p: { xs: 2.5, md: 3 },
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: '#e7ebf0',
                            bgcolor: '#fff',
                            maxWidth: 780,
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                            Salary Percentage Settings
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                            Review whether salary structure percentage-based calculation is currently active before making changes.
                        </Typography>

                        <Grid container spacing={3}>
                            <Grid size={{ lg: 4, md: 5, sm: 6, xs: 12 }}>
                                <RedditTextField
                                    label='Percentage Status'
                                    value={formValues.salaryPercent}
                                    variant="filled"
                                    fullWidth
                                />
                            </Grid>

                            <Grid size={{ lg: 8, md: 7, sm: 6, xs: 12 }}>
                                <Box
                                    sx={{
                                        height: '100%',
                                        minHeight: 86,
                                        px: 2.5,
                                        py: 2,
                                        borderRadius: 3,
                                        border: '1px solid',
                                        borderColor: formValues.salaryPercent === 'Enabled' ? '#b9e2c3' : '#f1d2d2',
                                        bgcolor: formValues.salaryPercent === 'Enabled' ? '#f3fbf5' : '#fff6f6',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontWeight: 700,
                                            color: formValues.salaryPercent === 'Enabled' ? '#1f7a3d' : '#c0392b',
                                            mb: 0.25,
                                        }}
                                    >
                                        {formValues.salaryPercent === 'Enabled'
                                            ? 'Percentage calculation is active'
                                            : 'Percentage calculation is inactive'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {formValues.salaryPercent === 'Enabled'
                                            ? 'Gross-based percentage setup can be used in salary structure calculations.'
                                            : 'Salary structure calculations will work without percentage-based automation.'}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                )}

                {
                    editOpen && (
                        <Grid container spacing={3} sx={{mt: 0.5}}>
                            <Grid size={{ xs: 12 }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        borderRadius: 3,
                                        border: '1px solid',
                                        borderColor: '#e7ebf0',
                                    }}
                                >
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formValues.salaryPercent === 'Enabled'}
                                                onChange={handleSalaryPercentToggle}
                                                color="primary"
                                            />
                                        }
                                        label="Enable Salary Structure Percentage"
                                    />
                                </Paper>
                            </Grid>
                            {
                                formValues.salaryPercent === 'Enabled' && AllowanceType?.length > 0 && (
                                    <>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 0,
                                                    borderRadius: 4,
                                                    border: '1px solid',
                                                    borderColor: '#dbe4f0',
                                                    height: '100%',
                                                    overflow: 'hidden',
                                                    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)',
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        px: 2.5,
                                                        py: 2,
                                                        borderBottom: '1px solid #e9eef5',
                                                        bgcolor: '#fbfcfe',
                                                    }}
                                                >
                                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 0.25 }}>
                                                        Earnings
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Define percentage values for each earning component.
                                                    </Typography>
                                                </Box>

                                                <TableContainer sx={{ maxHeight: 560 }}>
                                                    <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
                                                        <TableHead>
                                                            <TableRow sx={{ bgcolor: '#f4f7fb' }}>
                                                                <TableCell sx={{ width: '38%', borderBottom: '1px solid #e7ebf0', fontWeight: 700, color: '#44546a' }}>Name</TableCell>
                                                                <TableCell sx={{ width: '18%', borderBottom: '1px solid #e7ebf0', fontWeight: 700, color: '#44546a' }}>Code</TableCell>
                                                                <TableCell align="right" sx={{ width: '44%', borderBottom: '1px solid #e7ebf0', fontWeight: 700, color: '#44546a' }}>Percentage</TableCell>
                                                            </TableRow>
                                                        </TableHead>

                                                        <TableBody>
                                                            {
                                                                AllowanceType?.map((item, index) => (
                                                                    <TableRow
                                                                        key={index}
                                                                        hover
                                                                        sx={{
                                                                            '&:nth-of-type(even)': {
                                                                                bgcolor: '#fcfdff',
                                                                            },
                                                                            '& td': {
                                                                                borderBottom: '1px solid #edf2f7',
                                                                            },
                                                                        }}
                                                                    >
                                                                        <TableCell>
                                                                            <Typography variant='body1' sx={{ fontWeight: 600 }}>
                                                                                {item.allowance_name}
                                                                            </Typography>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Box
                                                                                sx={{
                                                                                    display: 'inline-flex',
                                                                                    px: 1.25,
                                                                                    py: 0.5,
                                                                                    borderRadius: 5,
                                                                                    bgcolor: '#f1f5f9',
                                                                                    color: '#334155',
                                                                                    fontSize: 13,
                                                                                    fontWeight: 700,
                                                                                }}
                                                                            >
                                                                                {item.allowance_code}
                                                                            </Box>
                                                                        </TableCell>
                                                                        <TableCell align="right">
                                                                            <TextField
                                                                                type="number"
                                                                                variant="outlined"
                                                                                size="small"
                                                                                fullWidth
                                                                                placeholder="Enter %"
                                                                                slotProps={{
                                                                                    htmlInput: {
                                                                                        min: 0,
                                                                                        max: 100,
                                                                                    },
                                                                                    input: {
                                                                                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                                                                    },
                                                                                }}
                                                                                sx={{
                                                                                    maxWidth: 220,
                                                                                    ml: 'auto',
                                                                                    '& .MuiOutlinedInput-root': {
                                                                                        borderRadius: 2.5,
                                                                                        bgcolor: '#fff',
                                                                                    },
                                                                                }}
                                                                                value={formValues.allowancePercent.find((percentItem) => percentItem.id === item.id)?.value || ''}
                                                                                onChange={(event) => handleAllowancePercentChange(event.target.value, item)}
                                                                            />
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))
                                                            }
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </Paper>
                                        </Grid>
                                    </>
                                )
                            }
                            {
                                formValues.salaryPercent === 'Enabled' && deductionPercentOptions?.length > 0 && (
                                    <>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 0,
                                                    borderRadius: 4,
                                                    border: '1px solid',
                                                    borderColor: '#dbe4f0',
                                                    height: '100%',
                                                    overflow: 'hidden',
                                                    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)',
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        px: 2.5,
                                                        py: 2,
                                                        borderBottom: '1px solid #e9eef5',
                                                        bgcolor: '#fbfcfe',
                                                    }}
                                                >
                                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 0.25 }}>
                                                        Deductions
                                                                            </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Define percentage values for each deduction component.
                                                                            </Typography>
                                                </Box>
                                                <TableContainer sx={{ maxHeight: 560 }}>
                                                    <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
                                                        <TableHead>
                                                            <TableRow sx={{ bgcolor: '#f4f7fb' }}>
                                                                <TableCell sx={{ width: '38%', borderBottom: '1px solid #e7ebf0', fontWeight: 700, color: '#44546a' }}>Name</TableCell>
                                                                <TableCell sx={{ width: '18%', borderBottom: '1px solid #e7ebf0', fontWeight: 700, color: '#44546a' }}>Code</TableCell>
                                                                <TableCell align="right" sx={{ width: '44%', borderBottom: '1px solid #e7ebf0', fontWeight: 700, color: '#44546a' }}>Percentage</TableCell>
                                                            </TableRow>
                                                        </TableHead>

                                                        <TableBody>
                                                            {
                                                                deductionPercentOptions?.map((item, index) => (
                                                                    <TableRow
                                                                        key={index}
                                                                        hover
                                                                        sx={{
                                                                            '&:nth-of-type(even)': {
                                                                                bgcolor: '#fcfdff',
                                                                            },
                                                                            '& td': {
                                                                                borderBottom: '1px solid #edf2f7',
                                                                            },
                                                                        }}
                                                                    >
                                                                        <TableCell>
                                                                            <Typography variant='body1' sx={{ fontWeight: 600 }}>
                                                                                {item.deduction_name}
                                                                            </Typography>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Box
                                                                                sx={{
                                                                                    display: 'inline-flex',
                                                                                    px: 1.25,
                                                                                    py: 0.5,
                                                                                    borderRadius: 5,
                                                                                    bgcolor: '#f1f5f9',
                                                                                    color: '#334155',
                                                                                    fontSize: 13,
                                                                                    fontWeight: 700,
                                                                                }}
                                                                            >
                                                                                {item.deduction_code}
                                                                            </Box>
                                                                        </TableCell>
                                                                        <TableCell align="right">
                                                                            <TextField
                                                                                type="number"
                                                                                variant="outlined"
                                                                                size="small"
                                                                                fullWidth
                                                                                placeholder="Enter %"
                                                                                slotProps={{
                                                                                    htmlInput: {
                                                                                        min: 0,
                                                                                        max: 100,
                                                                                    },
                                                                                    input: {
                                                                                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                                                                    },
                                                                                }}
                                                                                sx={{
                                                                                    maxWidth: 220,
                                                                                    ml: 'auto',
                                                                                    '& .MuiOutlinedInput-root': {
                                                                                        borderRadius: 2.5,
                                                                                        bgcolor: '#fff',
                                                                                    },
                                                                                }}
                                                                                value={formValues.deductionPercent.find((percentItem) => percentItem.id === item.id)?.value || ''}
                                                                                onChange={(event) => handleDeductionPercentChange(event.target.value, item)}
                                                                            />
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))
                                                            }
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </Paper>
                                        </Grid>
                                    </>
                                )
                            }

                            <Grid size={{ xs: 12 }}>
                                <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 1 }}>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleSubmit}
                                    >
                                        Submit
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    )
                }
            </Grid>
        </Grid>
        <Dialog
            open={disableConfirmOpen}
            onClose={handleDisableConfirmClose}
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    width: 420,
                    maxWidth: 'calc(100% - 32px)',
                },
            }}
        >
            <DialogTitle sx={{ pb: 1, fontWeight: 700 }}>
                Disable Salary Percentage?
            </DialogTitle>
            <DialogContent sx={{ pt: '8px !important' }}>
                <Box
                    sx={{
                        p: 2,
                        borderRadius: 2.5,
                        bgcolor: '#fff7ed',
                        border: '1px solid #fed7aa',
                    }}
                >
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#9a3412', mb: 0.75 }}>
                        All allowance and deduction percentages will be cleared.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        If you continue, percentage-based entries will be removed from the active setup. You can enable it again later.
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleDisableConfirmClose}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleDisableConfirmSubmit}
                >
                    Yes, Disable
                </Button>
            </DialogActions>
        </Dialog>
    </>
  )
}

export default SalaryPercent
