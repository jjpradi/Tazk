import React, {useEffect, useMemo, useState} from 'react';
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
import { DatePicker, DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import {useSelector} from 'react-redux';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 350,
  bgcolor: 'background.paper',
  boxShadow: 25,
  p: 4,
  borderRadius: 5,
};

const button = {
  position: 'absolute',
  top: '89%',
  left: '37%',
};

function FilterProductList(props) {
  const {initial_product_list,setFilteredProductList} = props;


  const [formValue, setFormValue] = useState({});

  useEffect(() => {
    setFormValue(props.filter);
  }, []);

  useEffect(() => {
    setFormValue(props.filter);
  }, [props.filter]);


  const handleChange = (event) => {
    const {value, name} = event.target;
    setFormValue({...formValue, [name]: value});
  };

  const {
    PriceListReducer: {price_list, product_price_list, product_list},
  } = useSelector((state) => state);

  const clearButton = () => {
    
    setFormValue({
      max_price: '',
      min_price: '',
      brand: [],
      category: [],
    });
    
    setFilteredProductList(initial_product_list)
  };

  return (
    <>
      <Modal
        open={props.filtervalue}
        onClose={() => props.SetFiltervalue(false)}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
        align='right'
      >
        <Card sx={style} style={{overflow: 'auto', maxHeight: '38pc'}}>
          <div style={{marginLeft: '16pc'}}>
            <IconButton
              aria-label='close'
              onClick={() => props.handleChangeFilter(false)}
            >
              <CloseIcon />
            </IconButton>
          </div>

          <Grid container spacing={5} display='flex' flexDirection='row'>
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
                disablePortal ={false}
                name='brand'
                id='combo-box-demo'
                options={_.uniqBy(product_list, 'brand')}
                getOptionLabel={(option) => option.brand || ''}
                fullWidth='true'
                renderInput={(params) => (
                  <TextField {...params} label='Brand' variant='outlined' />
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
                onChange={(event, newValue) => {
                  setFormValue({
                    ...formValue,
                    category: newValue.length === 0 ? '' : newValue,
                  });
                }}
                disablePortal ={false}
                name='category'
                id='combo-box-demo'
                options={_.uniqBy(product_list, 'category')}
                getOptionLabel={(option) => option.category || ''}
                fullWidth
                renderInput={(params) => (
                  <TextField {...params} label='Category' variant='outlined' />
                )}
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
                    fullWidth
                    id='outlined-name'
                    label='Min Price'
                    value={formValue.min_price}
                    name='min_price'
                    InputProps={{ inputProps: { min: 0 } }}
                    type={'number'}
                    onChange={handleChange}
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
                    label='Max Price'
                    fullWidth
                    value={formValue.max_price}
                    name='max_price'
                    type={'number'}
                    InputProps={{ inputProps: { min: 0 } }}
                    onChange={handleChange}
                  />
                </Grid>
          </Grid>

          <Grid
            container
            spacing={7}
            display='flex'
            justifyContent='center'
            alignItems='center'
            p='20px 0px 5px 0px'
          >
            {/* <Box> */}
            <Grid>
              <Button
                onClick={() => clearButton()}
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
        </Card>
      </Modal>
    </>
  );
}

export default FilterProductList;