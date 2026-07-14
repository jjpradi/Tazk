import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {Autocomplete, Button, Card, Grid, TextField} from '@mui/material';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import CommonUserAutoCompleteForSingleUser from 'utils/commonAutoCompleteForSingleUser';
import {useDispatch, useSelector} from 'react-redux';
import {useEffect} from 'react';
import {listCustomerAction} from 'redux/actions/customer_actions';
import { listSalesManAction } from 'redux/actions/sales_actions';
import { getsessionStorage } from 'pages/common/login/cookies';
import toMomentOrNull from '../../../utils/DateFixer';

function SalesApprovalFilter(props) {
  const {
    fromDate,
    toDate,
    selectedCustomer,
    selectedSalesman,
    handleDateChange,
    searchVal,
    setSearchValEmployeeFilter,
    requestSearch,
    value,
    setValue,
    getCompanyBasedEmployeeFilter,
    searchCompanyBasedEmployeeFilter,
    roleName,
    handleCancel,
    handleApply,
  } = props;

  const dispatch = useDispatch();
      const storage = getsessionStorage()
  
      
  const {
    customerReducer: {customer},
    salesReducer : {getSalesManList}
  } = useSelector((state) => state);

  useEffect(() => {
    dispatch(listCustomerAction());
    dispatch(listSalesManAction())
  }, []);

  console.log(customer, 'customer',getSalesManList);

  return (
    <Grid container rowGap={3}>
      <Grid
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
        <LocalizationProvider dateAdapter={DateAdapter}>
          <DatePicker
            label='From Date'
            value={toMomentOrNull(fromDate)}
            format='DD/MM/YYYY'
            onChange={(newDate) => handleDateChange('fromDate', newDate)}
            views={['year', 'month', 'day']}
            slotProps={{
              textField: {
                variant: 'filled',
                fullWidth: true,
                error: false,
              },
            }}
          />
        </LocalizationProvider>
      </Grid>
      <Grid
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
        <LocalizationProvider dateAdapter={DateAdapter}>
          <DatePicker
            label='To Date'
            value={toMomentOrNull(toDate)}
            onChange={(newDate) => handleDateChange('toDate', newDate)}
            views={['year', 'month', 'day']}
            slotProps={{
              textField: {
                variant: 'filled',
                fullWidth: true,
                error: false,
              },
            }}
          />
        </LocalizationProvider>
      </Grid>
      <Grid
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
        <Autocomplete
          disablePortal={false}
          options={customer.filter((e)=> e.company_name !== null && e.customer_type == 1)}
          getOptionLabel={(option) => option.company_name}
          value={
            customer.find((item) => item.customer_id === selectedCustomer) ||
            null
          } // Correctly display the selected company name
          onChange={(e, newValue) =>
            handleDateChange('customer', newValue ? newValue.customer_id : null)
          }
            ListboxProps={{
              style: {
                maxHeight: "170px",
              },
            }}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              label='Select Customer'
              variant='filled'
            />
          )}
        />
      </Grid>
      { storage.role_name !== 'Salesman' && 
        (
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
        <Autocomplete
          disablePortal={false}
          options={getSalesManList}
          getOptionLabel={(option) => option.full_name}
          value={
            getSalesManList?.find((item) => item.employee_id === selectedSalesman) ||
            null
          } // Correctly display the selected company name
          onChange={(e, newValue) =>
            handleDateChange('salesman', newValue ? newValue.employee_id : null)
          }
            ListboxProps={{
              style: {
                maxHeight: "170px",
              },
            }}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              label='Select SalesMan'
              variant='filled'
            />
          )}
        />
      </Grid>
        )
      }
      <Grid
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
        <Grid container spacing={5} display='flex' justifyContent='center'>
          <Grid>
            <Button
              variant='contained'
              color='error'
              onClick={() => handleCancel()}
            >
              Clear
            </Button>
          </Grid>

          <Grid>
            <Button
              variant='contained'
              onClick={() => handleApply()}
              disabled={
                fromDate === '' && toDate === '' 
              }
            >
              Apply
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default SalesApprovalFilter;
