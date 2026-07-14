import React, { useContext, useEffect } from 'react'
import { Box, Card, Grid, IconButton, Stack, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch, useSelector } from 'react-redux';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import { getExpensesByIdAction } from 'redux/actions/expense_actions';
import apiCalls from 'utils/apiCalls';
import CreateNewButtonContext from 'context/CreateNewButtonContext';

const ExpensesDetails = (props) => {
    const { setModalTypeHandler, setLoaderStatusHandler, headerLocationId } = useContext(
        CreateNewButtonContext,
    );
    console.log('expensesss', props)
    const {
        ExpenseReducer: { getExpenseById }
    } = useSelector(state => state)

    const dispatch = useDispatch()

    useEffect(() => {
        if (props.pageType === 'transaction') {
            const id = props.data.id
            apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler,
                dispatch(getExpensesByIdAction(id))
            )
        }
    }, [props.pageType])

    const expenses = getExpenseById?.expensesDetails?.length ? getExpenseById?.expensesDetails?.[0] : ''
    const vendor = getExpenseById?.vendor?.length ?  getExpenseById?.vendor?.[0] : ''

    const address = [vendor.address, vendor.area].filter(Boolean).join(', ')
    const address1 = [vendor.city, vendor.state, vendor.zip].filter(Boolean).join(', ')

    const numberToWords = (num) => {
        const a = [
            '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
            'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
            'Seventeen', 'Eighteen', 'Nineteen'
        ]
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

        const numToWords = (n) => {
            if (n < 20) return a[n]
            if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '')
            if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + numToWords(n % 100) : '')
            if (n < 100000) return numToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numToWords(n % 1000) : '')
            if (n < 10000000) return numToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numToWords(n % 100000) : '')
            return numToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + numToWords(n % 10000000) : '')
        }

        if (!num || isNaN(num)) return ''
        return numToWords(Number(num)) + ' Rupees Only'
    }

  return (
      <>
          <Card sx={{ p : 5, minHeight : 'calc(100vh - 80px)', maxHeight : 'calc(100vh - 80px)', overflow : 'auto' }}>
              <Grid container spacing={2}>
                    {props.pageType !== 'transaction' && <Grid
                        style={{ backgroundColor: '#e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                        size={12}>
                      <Typography variant='h6' textAlign='left'>
                          Invoice Number # {expenses?.invoice_number || ''}
                      </Typography>

                      <Stack direction='row' display='flex' justifyContent='flex-end' gap={3}>
                        {
                            props.expensePayment &&  <Tooltip title='Make Payment' placement='top'>
                              <IconButton
                                  onClick={props.handlePayment}
                              >
                                 {
                                      expenses?.status === 'Completed' ? (
                                          <AssignmentTurnedInIcon disable={true} color='disabled' />
                                      ) : (
                                          <AssignmentLateIcon color='warning' />
                                      )
                                 }
                              </IconButton>
                          </Tooltip>
                        }

                        {
                            props.expenseEdit && 
                             <Tooltip title='Edit' placement='top'>
                              <IconButton
                                  onClick={props.handleEdit}
                                  disabled={expenses?.status === 'Completed'}
                              >
                                  <EditIcon />
                              </IconButton>
                          </Tooltip>
                        }
                        
                        
                         {
                           props.expenseDelete &&
                             <Tooltip title='Delete' placement='top'>
                              <IconButton
                                  onClick={props.handleDelete}
                                  disabled={expenses?.status === 'Completed'}
                              >
                                  <DeleteIcon />
                              </IconButton>
                          </Tooltip>
                         }

                        
                      </Stack>
                    </Grid>}

                  <Grid sx={{ height: '120px' }} size={12}>
                      <Grid container>
                          <Grid size={8}>
                              <Typography variant='h6'>
                                  {(vendor?.company_name || '').toUpperCase()}
                              </Typography>
                          </Grid>

                          <Grid display='flex' justifyContent='flex-end' size={4}>
                              <Typography variant='h6'>
                                  Date : {expenses?.expenses_date || ''}
                              </Typography>
                          </Grid>
                      </Grid>

                      <br />

                      {
                          address &&
                          <Typography sx={{ fontSize: '12px' }}>
                              {address}
                          </Typography>
                      }
                      <Typography sx={{ fontSize: '12px' }}>
                          {address1}
                      </Typography>
                  </Grid>

                  <Grid size={12}>
                      <Grid container spacing={3}>
                          <Grid size={12}>
                              <Box sx={{ borderBottom: '1px solid', width: 'auto', mb: 2 }} />
                          </Grid>

                          <Grid size={12}>
                              <Grid container spacing={3}>
                                  <Grid size={8}>
                                      <Grid container spacing={2}>
                                          <Grid size={12}>
                                              <Grid container spacing={3}>
                                                  <Grid
                                                      size={{
                                                          lg: 4,
                                                          md: 6,
                                                          sm: 6,
                                                          xs: 6
                                                      }}>
                                                      <Typography variant='h6'>Payment Mode</Typography>
                                                  </Grid>

                                                  <Grid
                                                      size={{
                                                          lg: 1,
                                                          md: 1,
                                                          sm: 1,
                                                          xs: 1
                                                      }}>
                                                      <Typography variant='h6'> : </Typography>
                                                  </Grid>

                                                  <Grid
                                                      size={{
                                                          lg: 5,
                                                          md: 5,
                                                          sm: 5,
                                                          xs: 5
                                                      }}>
                                                      <Typography sx={{ fontSize : '12px' }}>{expenses?.payment_mode || ''}</Typography>
                                                  </Grid>
                                              </Grid>
                                          </Grid>

                                          <Grid size={12}>
                                              <Grid container spacing={3}>
                                                  <Grid
                                                      size={{
                                                          lg: 4,
                                                          md: 6,
                                                          sm: 6,
                                                          xs: 6
                                                      }}>
                                                      <Typography variant='h6'>Reference</Typography>
                                                  </Grid>

                                                  <Grid
                                                      size={{
                                                          lg: 1,
                                                          md: 1,
                                                          sm: 1,
                                                          xs: 1
                                                      }}>
                                                      <Typography variant='h6'> : </Typography>
                                                  </Grid>

                                                  <Grid
                                                      size={{
                                                          lg: 5,
                                                          md: 5,
                                                          sm: 5,
                                                          xs: 5
                                                      }}>
                                                      <Typography sx={{ fontSize : '12px' }}>{expenses?.reference || ''}</Typography>
                                                  </Grid>
                                              </Grid>
                                          </Grid>

                                          <Grid size={12}>
                                              <Grid container spacing={3}>
                                                  <Grid
                                                      size={{
                                                          lg: 4,
                                                          md: 6,
                                                          sm: 6,
                                                          xs: 6
                                                      }}>
                                                      <Typography variant='h6'>Note</Typography>
                                                  </Grid>

                                                  <Grid
                                                      size={{
                                                          lg: 1,
                                                          md: 1,
                                                          sm: 1,
                                                          xs: 1
                                                      }}>
                                                      <Typography variant='h6'> : </Typography>
                                                  </Grid>

                                                  <Grid
                                                      size={{
                                                          lg: 5,
                                                          md: 5,
                                                          sm: 5,
                                                          xs: 5
                                                      }}>
                                                      <Typography sx={{ fontSize : '12px' }}>{expenses?.note || ''}</Typography>
                                                  </Grid>
                                              </Grid>
                                          </Grid>

                                          <Grid size={12}>
                                              <Grid container spacing={3}>
                                                  <Grid
                                                      size={{
                                                          lg: 4,
                                                          md: 6,
                                                          sm: 6,
                                                          xs: 6
                                                      }}>
                                                      <Typography variant='h6'>Amount(In Words)</Typography>
                                                  </Grid>

                                                  <Grid
                                                      size={{
                                                          lg: 1,
                                                          md: 1,
                                                          sm: 1,
                                                          xs: 1
                                                      }}>
                                                      <Typography variant='h6'> : </Typography>
                                                  </Grid>

                                                  <Grid
                                                      size={{
                                                          lg: 5,
                                                          md: 5,
                                                          sm: 5,
                                                          xs: 5
                                                      }}>
                                                      <Typography sx={{ fontSize : '12px' }}>
                                                          {numberToWords(getExpenseById?.expensesDetails?.reduce((sum, list) => sum + Number(list?.amount || 0), 0))}
                                                      </Typography>
                                                  </Grid>
                                              </Grid>
                                          </Grid>

                                          <Grid size={12}>
                                              <Grid container spacing={3}>
                                                  <Grid
                                                      size={{
                                                          lg: 4,
                                                          md: 6,
                                                          sm: 6,
                                                          xs: 6
                                                      }}>
                                                      <Typography variant='h6'>Status</Typography>
                                                  </Grid>

                                                  <Grid
                                                      size={{
                                                          lg: 1,
                                                          md: 1,
                                                          sm: 1,
                                                          xs: 1
                                                      }}>
                                                      <Typography variant='h6'> : </Typography>
                                                  </Grid>

                                                  <Grid
                                                      size={{
                                                          lg: 5,
                                                          md: 5,
                                                          sm: 5,
                                                          xs: 5
                                                      }}>
                                                      <Typography sx={{ fontSize : '12px' }}>
                                                          {expenses?.status || ''}
                                                      </Typography>
                                                  </Grid>
                                              </Grid>
                                          </Grid>

                                          <Grid size={12}>
                                              <Grid container spacing={3}>
                                                  <Grid
                                                      size={{
                                                          lg: 4,
                                                          md: 6,
                                                          sm: 6,
                                                          xs: 6
                                                      }}>
                                                      <Typography variant='h6'>Entry Date</Typography>
                                                  </Grid>

                                                  <Grid
                                                      size={{
                                                          lg: 1,
                                                          md: 1,
                                                          sm: 1,
                                                          xs: 1
                                                      }}>
                                                      <Typography variant='h6'> : </Typography>
                                                  </Grid>

                                                  <Grid
                                                      size={{
                                                          lg: 5,
                                                          md: 5,
                                                          sm: 5,
                                                          xs: 5
                                                      }}>
                                                      <Typography sx={{ fontSize : '12px' }}>
                                                          {expenses?.entry_date || ''}
                                                      </Typography>
                                                  </Grid>
                                              </Grid>
                                          </Grid>
                                      </Grid>
                                  </Grid>

                                  <Grid display='flex' justifyContent='flex-end' size={4}>
                                      <Box
                                          width={180}
                                          height={70}
                                          bgcolor="green"
                                          display="flex"
                                          flexDirection="column"
                                          justifyContent="center"
                                          alignItems="center"
                                          borderRadius={1}
                                      >
                                          <Typography color="white" fontWeight="bold" fontSize={14}>Amount</Typography>
                                          <Typography color="white" fontWeight="bold" fontSize={18}>
                                              {`₹ ${getExpenseById?.expensesDetails?.reduce((sum, list) => sum + Number(list?.amount || 0), 0) ?? 0}`}
                                          </Typography>
                                      </Box>
                                  </Grid>
                              </Grid>
                          </Grid>
                      </Grid>
                  </Grid>

                  <Grid size={12}>
                      <Box sx={{ borderBottom: '1px solid', width: 'auto', mb: 5 }} />

                      <Table>
                          <TableHead style={{ backgroundColor : '#e8e8e8' }}>
                              <TableRow>
                                  <TableCell>Invoice Number</TableCell>
                                  <TableCell>Invoice Date</TableCell>
                                  <TableCell align='right'>Amount</TableCell>
                                  <TableCell align='right'>Due Amount</TableCell>
                                  <TableCell align='right'>Paid AMount</TableCell>
                              </TableRow>
                          </TableHead>

                          <TableBody>
                              {
                                  getExpenseById?.expensePayment?.length > 0 ? 
                                      getExpenseById?.expensePayment?.map((rowData, index) => {
                                          return (
                                              <TableRow key={index}>
                                                  <TableCell>{rowData?.invoice_number || ''}</TableCell>
                                                  <TableCell>{rowData?.invoice_date || ''}</TableCell>
                                                  <TableCell>{rowData?.amount || ''}</TableCell>
                                                  <TableCell>{rowData?.due_amount || ''}</TableCell>
                                                  <TableCell>{rowData?.paid_amount || ''}</TableCell>
                                              </TableRow>
                                          )
                                      }) : ''
                              }
                          </TableBody>
                      </Table>
                  </Grid>
              </Grid>
          </Card>
      </>
  );
}

export default ExpensesDetails