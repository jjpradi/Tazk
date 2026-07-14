import { Box, Button, Dialog, DialogContent, Grid, IconButton, Link, TextField, Typography } from '@mui/material'
import DataGridTemp from 'components/dataGridTemp'
import { titleURL } from 'http-common'
import React, { useContext, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import {FilterAlt} from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import { useDispatch, useSelector } from 'react-redux'
import {expiryDateReportAction, setExpiryDateReport} from 'redux/actions/sales_actions'
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import toMomentOrNull from '../../../utils/DateFixer'
import { UserRightsAuthorization } from "../../../@crema/utility/helper/UserRightsHelper"
import { getsessionStorage } from 'pages/common/login/cookies';



const ExpiryDatereport = () => {

    const {
        salesManReducer : {getStockGroupSummary},
        rbacReducer: {menuAccess = []}
    } = useSelector((state) => state)

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const storage = getsessionStorage();

    const [filter,setFilter] = useState(false)

      const currentMonth = moment().startOf('month');
      const firstDateOfMonth = currentMonth.format('YYYY-MM-DD');
      const lastDateOfMonth = currentMonth.endOf('month').format('YYYY-MM-DD');

      console.log(firstDateOfMonth,'firstDateOfMonth',lastDateOfMonth)
    

    const [formValues,setFormValues] = useState({
        fromDate : firstDateOfMonth,
        toDate : lastDateOfMonth
    })

    const [formErrors,setFormErrors] = useState({
        fromDate : null,
        toDate : null
    })

      const {
        setModalTypeHandler,
        setLoaderStatusHandler,
        commoncookie,
        headerLocationId,
      } = useContext(CreateNewButtonContext);

    const [paginateData,setPaginateData] = useState({
        searchVal : '',
        pageSize : 20,
        pageCount : 0
    })

    // const rows = getStockGroupSummary?.data?.length ? getStockGroupSummary.data.map((row,index)=> ({id : index,...row})) : []

    const rows = getStockGroupSummary?.data?.length 
    ? getStockGroupSummary.data.map((row, index) => ({ id: index, ...row })) 
    : [];


    const handlePageChange  = (page)=>{
        setPaginateData({...paginateData,pageCount:page})
    }

    const handleSizeChange = (size)=>{
        setPaginateData({...paginateData,pageSize:size})
    }

    const requestSearch = async(e)=>{
        const val = e.target.value;
        setPaginateData({...paginateData,searchVal:val})

        const payload = {
            searchString: val,
            numPerPage: paginateData.pageSize,
            pageCount: paginateData.pageCount,
            fromDate : formValues.fromDate,
            toDate : formValues.toDate
        }

       await dispatch(setExpiryDateReport(payload,setModalTypeHandler, setLoaderStatusHandler))

    }

    const cancelSearch = async()=>{
        setPaginateData({...paginateData,searchVal:''})

        const payload = {
            searchString: '',
            numPerPage: paginateData.pageSize,
            pageCount: paginateData.pageCount,
            fromDate : formValues.fromDate,
            toDate : formValues.toDate
        }

        await dispatch(setExpiryDateReport(payload,setModalTypeHandler, setLoaderStatusHandler))
    }

    const handleExport = async () => {
        const columnHeaders = columns.map((column) => column.headerName);
        const rows = getStockGroupSummary?.data?.map((row) =>
          columns.map((column) => row[column.field]),
        );
    
        let csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += columnHeaders.join(',') + '\n';
        csvContent += rows.map((row) => row.join(',')).join('\n');
    
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'Stock Group Summary Report' + '.csv');
        document.body.appendChild(link);
        link.click();
      };


      const columns = [
        { headerName: 'Buying Date', field: 'id',width: 250 },
        { headerName: 'Product', field: 'ic' ,width: 250},
        { headerName: 'Location', field: 'if',width: 250 },
        { headerName: 'Expiry Date', field: 'ij',width: 250 }
      ];

    useEffect(()=>{
        const payload = {
            searchString: paginateData.searchVal,
            numPerPage: paginateData.pageSize,
            pageCount: paginateData.pageCount,
            fromDate : formValues.fromDate,
            toDate : formValues.toDate
        }
        dispatch(expiryDateReportAction(payload))
    },[]) 
    
    const handleChange = (value, name) => {
      if (value) {
        setFormValues({
          ...formValues,
          [name]: moment(value).format('YYYY-MM-DD'),
        });
      }
    };

    const filterSubmit = async()=>{
      const payload = {
        searchString: paginateData.searchVal,
        numPerPage: paginateData.pageSize,
        pageCount: paginateData.pageCount,
        fromDate : formValues.fromDate,
        toDate : formValues.toDate
    }
      await dispatch(expiryDateReportAction(payload))
      setFilter(false)
    }

    const handleClear = ()=>{
      setFormValues({...formValues,fromDate : firstDateOfMonth,toDate : lastDateOfMonth})
      setFilter(false)
    }

   const selectedRole = storage?.role_name;
   const reportExport = UserRightsAuthorization(menuAccess[selectedRole], 'reports__inventory__expiry_date_report', 'can_export')

  return (
      <>
          <Helmet>
              <meta charSet='utf-8'/>
              <title>{titleURL} | Expiry Date Report</title>
          </Helmet>
          <DataGridTemp
              title={<Typography variant='h6' align='left' style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                    {/* <Link href='/report' underline="hover">Home</Link> / Expiry Date Report */}
                    <Box style={{ display: 'flex' }}>
                      <Box sx={{ color: '#0A8FDC', cursor: 'pointer', fontSize: '12px', fontWeight: 400, '&:hover': { textDecoration: 'underline' } }} onClick={() => navigate('/report')}>Home</Box>
                      &nbsp;/&nbsp;Expiry Date Report
                    </Box>
                    </Typography>}
              pageType= 'task'
              type2 = 'report'
              columns = {columns}
              data = {rows || []}
              rowPerPageOptions={[20,50,100]}
              rowsPerPage = {[10]}
              exportData = {reportExport}
              pageSize={paginateData.pageSize}
              page={paginateData.pageCount}
              onPageChange={(page)=>handlePageChange(page)}
              onPageSizeChange={(size)=>handleSizeChange(size)}
              rowCount={getStockGroupSummary?.numRows || 0}
              requestSearch={(e)=> requestSearch(e)}
              cancelSearch={cancelSearch}
              searchVal={paginateData.searchVal}
              type = {'latestPayrollReport'}
              handleExport={handleExport}
              filter={
                  <>
                      <IconButton onClick={()=> setFilter(true)}>
                          <FilterAlt/>
                      </IconButton>
                  </>
              }

          />
          <Dialog
              open={filter}
              aria-labelledby='alert-dialog-title'
              aria-describedby='alert-dialog-description'
          >
              <Grid
                  size={{
                      lg: 12,
                      md: 12,
                      xs: 12,
                      sm: 12
                  }}>
                  <DialogContent style={{width : '30vw'}} >
                      <Grid
                          container
                          display={'flex'}
                          alignItems={'center'}
                          spacing={5}
                      >
                          <Grid container display={'flex'} justifyContent={'flex-end'} pt={'10px'}>
                             <IconButton aria-label='close' onClick={()=> setFilter(false)}>
                                  <CloseIcon/>
                              </IconButton>
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
                    name='from'
                    label='From Date'
                    inputVariant='outlined'
                    value={toMomentOrNull(formValues.fromDate)}
                    format='DD/MM/YYYY'
                    onChange={(e) => handleChange(e,'fromDate')}
                    fullWidth
                    slotProps={{ textField: { fullWidth: true, variant: 'filled' } }}
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
                    name='to'
                    label='To Date'
                    inputVariant='outlined'
                    value={toMomentOrNull(formValues.toDate)}
                    onChange={(e) => handleChange(e,'toDate')}

                    fullWidth
                    slotProps={{ textField: { fullWidth: true, variant: 'filled' } }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid container spacing={5} display={'flex'} justifyContent={'center'} pt={'20px'}>

                    <Grid>
                      <Button color = 'secondary' variant='contained' onClick={handleClear}>
                        Clear
                      </Button>
                    </Grid>

                    <Grid> 
                      <Button variant='contained' onClick={filterSubmit}>
                          Submit
                      </Button>
                    </Grid>
              </Grid>

                      </Grid>
                  </DialogContent>
              </Grid>
          </Dialog>
      </>
  );
}

export default ExpiryDatereport