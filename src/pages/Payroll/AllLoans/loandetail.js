import React, {useEffect, useState, useRef, useContext} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {
  Grid,
  IconButton,
  Tooltip,
  Typography,
  Button,
  Select,
  InputLabel,
  MenuItem,
  FormControl, FormLabel, RadioGroup, FormControlLabel, Radio,
  Menu
} from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import context from '../../../context/CreateNewButtonContext';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import NewAllLoans from 'components/NewAllLoans';
import moment from 'moment';



export default function LoanDetail({
 handleclose,
 data,
 handleSubmit,
 rowIndex,
  type,
  handleEdit,
  handleDelete,
  sales_items,
  handleClose,
  rowPopupClose,
  allFunctionsReturn,
  invoiceFunction,
  responseType,
  salesByPagination, // from sales
  cancelInvoiceUpdate,
  searchSalesData,
  searchVal
}) {
  const ref1 = useRef(null);
  const dispatch = useDispatch();
  const {
    salesReducer: {sales, erp_sale_data},
  } = useSelector((state) => state);

  const [index, setIndex] = useState(rowIndex);
  const [salesData, setSalesData] = useState({});
  const [saleStatus, setSaleStatus] = useState('');
  const [sale_id, setSale_id] = useState('');
  const [formvalues, setFormValues] = useState({})
  const [actionType, setSetActionType] = useState("")
  const [menuAnchor, setMenuAnchor] = useState(null);
  const {
    setModalStatusHandler,
    setModalTypeHandler,
    selectData,
    setselectData,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(context);

useEffect(()=>{
    setFormValues(data)

},[data])

const handleMenuOpen = (event) => {
  console.log("event.currentTarget",event.currentTarget);
  
  setMenuAnchor(event.currentTarget);
};

const handleMenuClose = () => {
  setSetActionType('null');
  setMenuAnchor(null)
};

const handleEditClick = () => {
  console.log("dfkmsdfdls");
  
  setSetActionType("Edit");
};

console.log(menuAnchor,"actionType",actionType,actionType === 'Edit');


  return (
    <div>
      {actionType === 'Edit' && (
          <NewAllLoans
            status={actionType}
            handleClose={handleMenuClose}
            handleSubmit={handleSubmit}
            data={data}
            setModalStatusHandler={setModalStatusHandler}
            setModalTypeHandler={setModalTypeHandler}
          />
        )}
      { actionType !== 'Edit' &&( <Grid container>
          <Grid sx={{p: '0 10px'}} size={12}>
            <div style={{display: 'flex', marginBottom: 10}}>
              <div
                style={{
                  marginLeft: 'auto',
                  display: 'flex',
                  justifyContent: 'end',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid>
                      <Button
                        variant='contained'
                        onClick={handleclose}
                        color='inherit'
                        sx={{mb: '10px'}}
                      >
                        Back
                      </Button>
                      </Grid>
                      <Grid>
                    {/* <IconButton onClick={handleMenuOpen}>
                      <MoreVertIcon />
                    </IconButton> */}
                    {/* <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
                      <MenuItem> 
                        Edit
                      </MenuItem>
                      <MenuItem onClick={() => { handleDelete(rowIndex); handleMenuClose(); }}>
                        Delete
                      </MenuItem>
                    </Menu> */}
                  </Grid>
                    </Grid>
                </div>
              </div>
            </div>
          </Grid>
          <Grid container>
            <Card variant='outlined' style={{width: '100%'}}>
              <Grid container direction='row'>
                {/* <Grid size={{ md: 12, lg: 12 }}> */}
                <Grid
                  style={{
                    borderRight:  '1px #d9dadc solid',
                    padding: '6px',
                  }}
                  size={{
                    md: 12,
                    lg: 6,
                    sm: 12,
                    xs: 12
                  }}>
                  {/* <Card variant="outlined" sx={{ padding: "20px" }}> */}
                
                    <div style={{minHeight: 40}}>
                      <Box sx={{minHeight: 19}}>
                        <Card
                          variant='outlined'
                          style={{width: '100%', padding: '10px'}}
                        >
                          <Grid container spacing={2}>
                            <Grid
                              style={{minHeight: '70px'}}
                              size={{
                                xs: 6,
                                md: 2,
                                lg: 6,
                                sm: 2
                              }}>
                              <Typography variant='body1'>
                                Bank Name :
                              </Typography>
                            </Grid>
                            <Grid
                              style={{minHeight: '70px'}}
                              size={{
                                xs: 6,
                                md: 10,
                                lg: 6,
                                sm: 10
                              }}>
                              <Typography
                                variant='body1'
                                style={{fontWeight: 'bold'}}
                              >
                                  {formvalues.bank_name}
                                {/* {capitalize(customerData?.company_name)} */}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Card>
                      </Box>
                    </div>
                  <div style={{minHeight: 10, marginTop: '10px'}}>
                    <Box sx={{minWidth: 175, minHeight: '85px'}}>
                      <Card
                        variant='outlined'
                        sx={{padding: '10px', minHeight: '30px'}}
                      >
                        {/* <Typography variant='body1'>
                          Loan Name:{'sbi '}
                          <span style={{fontWeight: '500'}}></span>
                        </Typography> */}
                        <Typography variant='body1'>
                          EMI Amount : <span style={{fontWeight: '500'}}>{formvalues.EMI_amount}</span>
                        </Typography>
                        <Typography variant="body1">
    EMI Date : <span style={{ fontWeight: '500' }}>
      {moment(formvalues.EMI_date).format('DD/MM/YYYY')}
    </span>
  </Typography>
                      </Card>
                    </Box>
                  </div>
                  <div style={{minHeight: 10, marginTop: '10px'}}>
                    <Box sx={{minWidth: 175, minHeight: '85px'}}>
                      <Card
                        variant='outlined'
                        sx={{padding: '10px', minHeight: '30px'}}
                      >
                        <Typography variant='body1'>
                          Tenor of loan :  {formvalues.tenor_of_loan}
                          <span style={{fontWeight: '500'}}></span>
                        </Typography>
                        <Radio
                          checked={formvalues.type === 0}
                         // onChange={handleChange}
                          value= {0}
                          name="radio-buttons"
                          inputProps={{ 'aria-label': 'nbfc' }}
                        />NBFC
                         <Radio
                          checked={formvalues.type === 1}
                         // onChange={handleChange}
                          value= {1}
                          name="radio-buttons"
                          inputProps={{ 'aria-label': 'bank' }}
                        />Bank
                   
                        {/* <FormControl>
                  <FormLabel id="demo-row-radio-buttons-group-label">Type</FormLabel>
                  <RadioGroup
                    row
                    aria-labelledby="demo-row-radio-buttons-group-label"
                    name="type"
                    defaultValue = {formvalues.type || 0}
                  >
                    <FormControlLabel value={0} control={<Radio />} label="NBFC" />
                    <FormControlLabel value={1} control={<Radio />} label="Bank" />
                  </RadioGroup>
                </FormControl> */}
                    
                      </Card>
                    </Box>
                  </div>
                </Grid>

                <Grid
                  style={{p: '0 10px', marginTop: '6px', padding: '6px'}}
                  size={{
                    md: 12,
                    lg: 6,
                    xs: 12,
                    sm: 12
                  }}>
                   <div style={{minHeight: 10, marginTop: '10px'}}>
                    <Box sx={{minWidth: 175, minHeight: '85px'}}>
                      <Card
                        variant='outlined'
                        sx={{padding: '10px', minHeight: '30px'}}
                      >
                        <Typography variant='body1'>
                          Rate of interest :   {formvalues.ROI_amount}
                          <span style={{fontWeight: '500'}}></span>
                        </Typography>
                        <Typography variant='body1'>
                        <Radio
                          checked={formvalues.ROI_period === 0}
                         // onChange={handleChange}
                          value= {0}
                          name="radio-buttons"
                          inputProps={{ 'aria-label': 'monthly' }}
                        />Monthly
                         <Radio
                          checked={formvalues.ROI_period === 1}
                         // onChange={handleChange}
                          value= {1}
                          name="radio-buttons"
                          inputProps={{ 'aria-label': 'fixed' }}
                        />Fixed
                         <Radio
                          checked={formvalues.ROI_period === 2}
                         // onChange={handleChange}
                          value= {2}
                          name="radio-buttons"
                          inputProps={{ 'aria-label': 'annually' }}
                        />Annually
                         <Radio
                          checked={formvalues.ROI_period === 3}
                         // onChange={handleChange}
                          value= {3}
                          name="radio-buttons"
                          inputProps={{ 'aria-label': 'floating' }}
                        />Floating
                        {/* <FormControl>
                   <FormLabel id="demo-row-radio-buttons-group-label">Rate Of Interest</FormLabel> 
                  <RadioGroup
                    row
                    aria-labelledby="demo-row-radio-buttons-group-label"
                    name="row-radio-buttons-group"
                    value = {formvalues.ROI_period}
                  >
                    <FormControlLabel value={0} control={<Radio />} label="Monthly" />
                    <FormControlLabel value={1} control={<Radio />} label="Fixed" />
                    <FormControlLabel value={2} control={<Radio />} label="Annually" />
                    <FormControlLabel value={3} control={<Radio />} label="Floating"/>
                  </RadioGroup>
                        </FormControl> */}
                        </Typography>
                        <Typography variant='body1'>
                          Repayment Frequency :     
                         <span style={{fontWeight: '500'}}> {formvalues.RepaymentFrequencyPeriod}</span>
                        </Typography>
                      </Card>
                    </Box>   
                  </div>
                  <div style={{minHeight: 10, marginTop: '10px'}}>
                    <Box sx={{minWidth: 175, minHeight: '85px'}}>
                      <Card
                        variant='outlined'
                        sx={{padding: '10px', minHeight: '30px'}}
                      >
                        <Typography variant='body1'>
                          Processing Fees :   {formvalues.processing_fee}
                          <span style={{fontWeight: '500'}}></span>
                        </Typography>
                        <Typography variant='body1'>
                          Document Charges :     
                         <span style={{fontWeight: '500'}}> {formvalues.document_charges}</span>
                        </Typography>
                        <Typography variant='body1'>
                          Other Charges :     
                         <span style={{fontWeight: '500'}}> {formvalues.other_charges
  }</span>
                        </Typography>
                      </Card>
                    </Box>   
                  </div>
                </Grid>
              </Grid>
            </Card>
            {/* </Grid> */}
          </Grid>
        </Grid>)
  }
    </div>
  );
}
