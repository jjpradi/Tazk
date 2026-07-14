import React, {useContext, useEffect, useState} from 'react';
import {
  Modal,
  Card,
  Button,
  TextField,
  Autocomplete,
  MenuItem,
  InputLabel,
  Select,
  FormControl,
  Box,
  Badge,
  Grid,
  Slider,
  Typography,
} from '@mui/material';
import {FilterAlt} from '@mui/icons-material';
import _, {countBy} from 'lodash';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from "@mui/material/IconButton";
import { useDispatch, useSelector } from 'react-redux';
import { listStockLocationAction } from 'redux/actions/stock_Location_actions';
import context from '../../../context/CreateNewButtonContext';
import { listProductAction } from 'redux/actions/product_actions';
import { filterOptions } from 'utils/searchFunc';
import { listVendorIdAndNameAction } from 'redux/actions/vendor_actions';



const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 330,
  bgcolor: 'background.paper',
  boxShadow: 25,
  p: 4,
  // height: 510,
  borderRadius: 5,
};

const button = {
  position: 'absolute',
  top: '86%',
  left: '37%',
};

function FilterInventory(props) {
  // useEffect(() => {
  //   setFormValue(props.filtedValue);

  
  // }, []);
  const [formValue, setFormValue] = useState({});
    const { stockLocationReducer: { stocklocation},productReducer:{product} , vendorReducer : {vendorIdAndName}, salesReducer: {getbillingcompanydetails},  } = useSelector(state => state)

  const { commoncookie, setModalTypeHandler, setLoaderStatusHandler, headerLocationId, } = useContext(context);
  const dispatch = useDispatch();


  useEffect(() => {
    setFormValue(props.filtedValue);
  }, [props.filtedValue]);




  const handleChange = (event) => {
    const {value, name} = event.target;
    if (name === 'name') {
      formValue.product_name = value;
    }
    setFormValue({...formValue, [name]: value});
    // props.filterHandler(name,value)
  };

  // const clearButton = () => {
  //   setFormValue({
  //     name: '',
  //     supplier_name:'',
  //     brand: '',
  //     category: '',
  //     location_id: 'null',
  //     max_price: '',
  //     min_price: '',
  //   });
  // };

  return (
    <>
      <Badge color='secondary' badgeContent={props.count}>
        <IconButton>
          <FilterAlt onClick={() => {
            props.handleClose(true)

             !product.length && dispatch(listProductAction(setModalTypeHandler, setLoaderStatusHandler))
             !stocklocation.length &&  dispatch(listStockLocationAction(commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler))
             !vendorIdAndName.length && dispatch(listVendorIdAndNameAction())
            

          }} />
        </IconButton>
      </Badge>
      <Modal
        open={props.open}
        onClose={() => props.handleClose(false)}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
        align='left'
      >
        <Card sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 330,
          bgColor: 'background.paper',
          boxShadow: 25,
          p: 4,
          borderRadius: 5,
          overflow: 'auto',
          // "&::-webkit-scrollbar": {
          //   width: 10,
          // },
      
          // "&::-webkit-scrollbar-track": {
          //   // boxShadow: "inset 0 0 5px black",
          //   borderRadius: 2,
          //   marginTop: '20px',
          //   marginBottom: '20px',
          // },
       
          // "&::-webkit-scrollbar-thumb": {
          //   background: "#B2B2B2",
          //   borderRadius: 2,
          // },
      
          // "&::-webkit-scrollbar-thumb:hover": {
          //   background: "#999",
          // }
        }}
        >
        <div style={{ marginLeft: "16pc" }}>
                <IconButton aria-label="close" onClick={() => props.handleClose(false)}>
                  <CloseIcon />
                 
                </IconButton>
              </div>

          <Grid container spacing={3} direction={'row'}>
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Autocomplete
                multiple
                value={formValue.name !== 'null' ? formValue.name || [] : []}
                onChange={(event, newValue) => {
                  setFormValue({
                    ...formValue,
                    name: newValue.length === 0 ? '' : newValue,
                  });
                }}
                disablePortal
                name='name'
                id='combo-box-demo'
                options={_.uniqBy(product, 'name')}
                filterOptions={filterOptions}
                getOptionLabel={(option) => option.name || ''}
                fullWidth
                ListboxProps={{
                  style: {
                    maxHeight: "170px",
                  },
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='Product name'
                    variant='filled'
                  />
                )}
              />

              {/* <Autocomplete
                          multiple
                          limitTags={2}
                          fullWidth={true}
                          id="multiple-limit-tags"
                          options={_.uniqBy(product,'name').map((f) => {return f})}
                          getOptionLabel={option => option.name || ""}
                          onChange={(e, v) => {
                              handleChange({target:{name:"name",value:v?.map(p =>  p.name )}})
                          }} 
                          
                          renderInput={(params) => (
                              <TextField {...params} variant="outlined"  required={true} label="product_name" placeholder="Select product_name" fullWidth={true}
                              // error={formErrors.paymentId !== null ? true : false} 
                              // helperText={formErrors.paymentId === null ? '' : formErrors.paymentId}
                              />
                          )}
                          
                /> */}
            </Grid>

            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Autocomplete
                multiple
                value={formValue.supplier_name !== 'null' ? formValue.supplier_name || [] : []}
                onChange={(event, newValue) => {
                  setFormValue({
                    ...formValue,
                    supplier_name: newValue.length === 0 ? '' : newValue,
                  });
                }}
                disablePortal
                name='Supplier Name'
                id='combo-box-demo'
                options={_.uniqBy(vendorIdAndName, 'company_name')}
                getOptionLabel={(option) => option.company_name || ''}
                fullWidth
                  ListboxProps={{
                  style: {
                    maxHeight: "170px",
                  },
                }}
                renderInput={(params) => (
                  <TextField {...params} label='Supplier Name' variant='filled' />
                )}
              />
            </Grid>
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Autocomplete
                multiple
                value={formValue.brand !== 'null' ? formValue.brand || [] : []}
                onChange={(event, newValue) => {
                  setFormValue({
                    ...formValue,
                    brand: newValue.length === 0 ? '' : newValue,
                  });
                }}
                // disablePortal
                name='brand'
                id='combo-box-demo'
                options={_.uniqBy(product, 'brand')}
                getOptionLabel={(option) => option.brand || ''}
                fullWidth
                  ListboxProps={{
                  style: {
                    maxHeight: "170px",
                  },
                }}
                renderInput={(params) => (
                  <TextField {...params} label='Brand' variant='filled' />
                )}
              />
            </Grid>

            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Autocomplete
                multiple
                value={
                  formValue.category !== 'null' ? formValue.category || [] : []
                }
                // value={
                //   Array.isArray(formValue.category)
                //     ? formValue.category
                //     : []
                // }
                onChange={(event, newValue) => {
                  setFormValue({
                    ...formValue,
                    category: newValue.length === 0 ? '' : newValue,
                  });
                }}
                // disablePortal
                name='category'
                id='combo-box-demo'
                options={_.uniqBy(product, 'category')}
                getOptionLabel={(option) => option.category || ''}
                fullWidth
                  ListboxProps={{
                  style: {
                    maxHeight: "170px",
                  },
                }}
                renderInput={(params) => (
                  <TextField {...params} label='Category' variant='filled' />
                )}
              />
            </Grid>
            {props.pageType !== '/sales/stockreceive' && <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Autocomplete
                multiple
                // value={
                //   formValue.location_id !== 'null'
                //     ? formValue.location_id || []
                //     : []
                // }
                value={
                  Array.isArray(formValue.location_id)
                    ? formValue.location_id
                    : []
                }
                onChange={(event, newValue) => {
                  setFormValue({
                    ...formValue,
                    location_id: newValue.length === 0 ? 'null' : newValue,
                  });
                }}
                // disablePortal
                name='location_id'
                id='combo-box-demo'
                options={_.uniqBy(stocklocation, 'location_name')}
                getOptionLabel={(option) => option.location_name || ''}
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='Location Name'
                    variant='filled'
                  />
                )}
              />
            </Grid>}
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Grid container spacing={2}>
                <Grid
                  size={{
                    lg: 6,
                    md: 6,
                    sm: 6,
                    xs: 3
                  }}>
                  <TextField
                    id='outlined-name'
                    fullWidth
                    label='Min Price'
                    value={formValue.min_price}
                    name='min_price'
                    type={'number'}
                    onChange={handleChange}
                    variant='filled'
                  />
                </Grid>

                <Grid
                  size={{
                    lg: 6,
                    md: 6,
                    sm: 6,
                    xs: 3
                  }}>
                  <TextField
                    id='outlined-name'
                    fullWidth
                    label='Max Price'
                    value={formValue.max_price}
                    name='max_price'
                    type={'number'}
                    onChange={handleChange}
                    variant='filled'
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
                <Autocomplete
                  disableClearable
                  options={getbillingcompanydetails || []}
                  getOptionLabel={(option) =>
                      option.tax_id ? `${option.company_name} - ${option.tax_id}` : ""
                  }
                  onChange={(e, value) => {
                      props.handleChange({
                          target: { name: "subcompanyId", value: value || "" }
                      })
                  }}
                  value={
                      getbillingcompanydetails?.find(
                          (d) => d.sub_company_id === props.subcompanyId
                      ) || null
                  }
                  renderInput={(params) => (
                      <TextField
                          {...params}
                          label="Sub Company"
                          variant="filled"
                      />
                  )}
                />
              </Grid>
          </Grid>

              <Grid container spacing={7} display= 'flex' justifyContent='center' alignItems='center' p='20px 0px 5px 0px'>
                {/* <Box> */}
                <Grid>
                  <Button
                    onClick={() => props.clearButton()}
                    // sx={button}
                    variant='contained'
                    color='secondary'
                  >
                    Clear
                  </Button>
                  {/* </Box> */}
                </Grid>

                <Grid>
                  <Button
                    onClick={() => props.ApplyButton(formValue)}
                    // sx={button}
                    variant='contained'
                  >
                    Apply
                  </Button>
                </Grid>
              </Grid>

          {/* <Button onClick={()=>props.ApplyButton()} sx={button} variant="contained">
        Apply
      </Button> */}
        </Card>
      </Modal>
      {/* </Grid> */}
      {/* </div>       */}
    </>
  );
}

export default FilterInventory;
