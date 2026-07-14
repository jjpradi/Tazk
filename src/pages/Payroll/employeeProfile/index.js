import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import {
  Box, Typography, Avatar, Chip, IconButton, TextField, InputAdornment,
  Grid, Card, CardContent, Tooltip, Fade, DialogTitle, Dialog, DialogContent,
  DialogActions, Button, FormControl,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import { FilterAlt } from '@mui/icons-material';

import { titleURL } from 'http-common';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import { searchEmployeesAction } from 'redux/actions/employeeProfile.actions';
import EmployeeProfileDetail from './EmployeeProfileDetail';
import { get_search_company_based_employee, getEmpbasecompanyFilterAction, set_search_company_based_employee } from '../../../redux/actions/attendance_actions';
import CommonUserAutoComplete from '../../../utils/commonAutoCompleteForUser';

const commonCardStyle = {
  cursor: 'pointer',
  transition: 'box-shadow 0.2s, transform 0.15s',
  '&:hover': {
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
    transform: 'translateY(-2px)',
  },
  borderRadius: 2,
  height: '100%',
};

export default function EmployeeProfileList() {
  const [searchVal, setSearchVal] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isApiFinished, setIsApiFinished] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchValEmployeeFilter, setSearchValEmployeeFilter] = useState('');
  const [value, setValue] = React.useState([]);
  const [userSelectError, setUserSelectError] = useState('');
  const [selectedAll, setSelectedAll] = useState(false);

  const dispatch = useDispatch();
  const { EmployeeProfileReducer: { employeeList }, attendanceReducer: { getCompanyBasedEmployeeFilter, searchCompanyBasedEmployeeFilter } } = useSelector((state) => state);
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  useEffect(() => {
    let data = { searchString: '' };
    let payload = { employee_ids: [] }; 
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(searchEmployeesAction(payload, setModalTypeHandler, setLoaderStatusHandler)),
      dispatch(getEmpbasecompanyFilterAction(data))
    ).finally(() => setIsApiFinished(true));
  }, []);

  const uniqueEmployees = [
    ...new Map((employeeList || []).map(emp => [emp.employee_id, emp])).values()
  ];

  const filteredEmployees = (uniqueEmployees || []).filter((emp) => {
    if (!searchVal) return true;
    const search = searchVal.toLowerCase();
    return (
      (emp.full_name || '').toLowerCase().includes(search) ||
      (emp.employee_code || '').toLowerCase().includes(search) ||
      (emp.designation || '').toLowerCase().includes(search) ||
      (emp.department_name || '').toLowerCase().includes(search) ||
      (emp.email || '').toLowerCase().includes(search)
    );
  });

  const handleFilterOpen = () => setIsFilterOpen(true);
  const handleFilterClose = () => setIsFilterOpen(false);

  const handleApplyFilter = () => {
    const employeeIds = value?.map(emp => emp.employee_id || emp.id) || [];
    const payload = { employee_ids: employeeIds };

    setIsApiFinished(false);
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(searchEmployeesAction(payload, setModalTypeHandler, setLoaderStatusHandler))
    ).finally(() => {
      setIsApiFinished(true);
      setIsFilterOpen(false);
    });
  };

  const handleClearFilter = () => {
    setValue([]);
    setSearchValEmployeeFilter('');
    const payload = { employee_ids: [] };

    setIsApiFinished(false);
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(searchEmployeesAction(payload, setModalTypeHandler, setLoaderStatusHandler))
    ).finally(() => {
      setIsApiFinished(true);
      setIsFilterOpen(false);
    });
  };

  const requestSearchEmployeeFilter = (val) => {
    setSearchValEmployeeFilter(val);
    dispatch(set_search_company_based_employee([]));
    if (!val) return;
    dispatch(get_search_company_based_employee({ searchString: val }, setModalTypeHandler, setLoaderStatusHandler));
  };

  const handleChangeEmployeeName = (val) => {
    setValue(val);
    if (val?.length > 0) {
      setUserSelectError('');
    }
  };

  if (selectedEmployee) {
    return (
      <div style={{
      padding: '0 10px',
      height: '90vh',
      overflowY: 'auto',
      msOverflowStyle: 'none',
      scrollbarWidth: 'none',  
    }}
    className="hide-scrollbar"
  >
    <style>
      {`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}
    </style>
        <Helmet>
          <title>{titleURL} | Employee Profile</title>
        </Helmet>
        <Box sx={{ mb: 2 }}>
          <IconButton onClick={() => setSelectedEmployee(null)} size='small' sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant='body1' component='span' sx={{ fontWeight: 600, fontSize: 15 }}>
            Back to Employee List
          </Typography>
        </Box>
        <EmployeeProfileDetail employeeId={selectedEmployee} />
      </div>
    );
  }

  return (
    <div style={{
      padding: '0 10px',
      height: '92vh',
      overflowY: 'auto',
      msOverflowStyle: 'none',
      scrollbarWidth: 'none',  
    }}
    className="hide-scrollbar"
  >
    <style>
      {`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}
    </style>
      <Helmet>
        <title>{titleURL} | Employee Profile</title>
      </Helmet>

      <Box sx={{ px: { xs: 2, md: 3 }, py: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant='h6' sx={{ fontWeight: 600, fontSize: 18 }}>Employee Profiles</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title='Filter' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement='left'>
              <IconButton 
                aria-label="Filter" 
                onClick={handleFilterOpen}
                color={value.length > 0 ? "primary" : "default"}
              >
                <FilterAlt />
              </IconButton>
            </Tooltip>
          <TextField
            size='small'
            placeholder='Search employees...'
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            sx={{ width: { xs: '100%', sm: 300 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon fontSize='small' />
                  </InputAdornment>
                ),
              },
            }}
          />
          </Box>
        </Box>

        {/* Employee Grid */}
        <Grid container spacing={3}>
          {filteredEmployees.map((emp) => (
            <Grid key={emp.employee_id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card
                sx={commonCardStyle}
                onClick={() => setSelectedEmployee(emp.employee_id)}
              >
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
                  <Avatar
                    src={emp.image || undefined}
                    sx={{ width: 64, height: 64, mb: 1.5, bgcolor: 'primary.light' }}
                  >
                    {!emp.image && <PersonIcon sx={{ fontSize: 32 }} />}
                  </Avatar>
                  <Typography sx={{ fontWeight: 600, fontSize: 14, textAlign: 'center' }}>
                    {emp.full_name || '-'}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 0.5 }}>
                    {emp.employee_code || '-'}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 1 }}>
                    {emp.designation || '-'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {emp.department_name && (
                      <Chip label={emp.department_name} size='small' variant='outlined' sx={{ fontSize: 10 }} />
                    )}
                    {emp.grade_name && (
                      <Chip label={emp.grade_name} size='small' color='primary' variant='outlined' sx={{ fontSize: 10 }} />
                    )}
                    {emp.employment_type && emp.employment_type !== 'permanent' && (
                      <Chip label={emp.employment_type} size='small' color='warning' sx={{ fontSize: 10 }} />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {isApiFinished && filteredEmployees.length === 0 && (
            <Grid size={12}>
              <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                <PersonIcon sx={{ fontSize: 48, mb: 1, opacity: 0.4 }} />
                <Typography>No employees found</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>

      <Dialog open={isFilterOpen} onClose={handleFilterClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Filter
          <IconButton aria-label="close" onClick={handleFilterClose} sx={{ color: (theme) => theme.palette.grey[500] }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth>
            <CommonUserAutoComplete
              fullWidth
              searchVal={searchValEmployeeFilter}
              requestSearch={requestSearchEmployeeFilter}
              value={value}
              setValue={handleChangeEmployeeName}
              type={getCompanyBasedEmployeeFilter}
              searchType={searchCompanyBasedEmployeeFilter}
              error={userSelectError}
              selectedAll={selectedAll}
              setSelectedAll={setSelectedAll}
              isMandatory={true}
            />
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClearFilter} variant="contained" color="secondary">Clear</Button>
          <Button onClick={handleApplyFilter} variant="contained" color="primary">Apply</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}