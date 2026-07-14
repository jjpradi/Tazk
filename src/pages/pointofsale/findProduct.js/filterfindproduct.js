import React, {useContext, useEffect, useState} from 'react';
import {
  Modal,
  Card,
  Button,
  TextField,
  Autocomplete,
  Grid
} from '@mui/material';
import {FilterAlt} from '@mui/icons-material';
import _, {countBy} from 'lodash';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from "@mui/material/IconButton";
import { useDispatch, useSelector } from 'react-redux';
import { InventoryProductAction, Salesproduct, inventorySalesAllProductAction } from 'redux/actions/product_actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext';


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

function FilterFindProduct(props) {

  const [formValue, setFormValue] = useState({item_id:'', sku:'', lotnumber : ''});
  const [productvalue, SetProductvalue] = useState([])

  const dispatch = useDispatch();

  const { productReducer: { inventory_product, sales_product, inventory_sales_product_list } } = useSelector((state) => state);
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  useEffect(() => {
    setFormValue({...props.filtedValue })
  }, []);

  // useEffect(() => {
  //   if(props.open){
  //     if(!inventory_product.length){
  //       dispatch(InventoryProductAction(setModalTypeHandler, setLoaderStatusHandler));
  //     }

  //     if(!sales_product.length){
  //       dispatch(Salesproduct(setModalTypeHandler, setLoaderStatusHandler))
  //     }
  //   }

  // }, [props.open]); 

  useEffect(() => {
    if(props.open){

      if(!inventory_sales_product_list.length){
        dispatch(inventorySalesAllProductAction(setModalTypeHandler, setLoaderStatusHandler));
      }
      
    }

  }, [props.open]);
  
  // useEffect(() => {
  //   const Data = [...inventory_product,...sales_product]
  //   SetProductvalue(Data)
  // }, [inventory_product,sales_product]);

  useEffect(() => {

    SetProductvalue(inventory_sales_product_list)
    
  }, [inventory_sales_product_list]);

  const handleChange = (event) => {
    const {value, name} = event.target;
    if (name === 'name') {
      formValue.product_name = value;
    }
    setFormValue({...formValue, [name]: value});
    // props.filterHandler(name,value)
  };

  const clearButton = () => {
    setFormValue({
      name: '',
      item_id:'',
      sku: '',
      lotnumber:'',
    });
    props.clearButton()
  };

  return (
    <>
      {/* <Badge color='secondary' badgeContent={props.count}> */}
      <FilterAlt onClick={() => props.SetFilterOpen(true)} />
      {/* </Badge> */}
      <Modal
        open={props.open}
        onClose={() => props.handleClose(false)}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
        align='left'
      >
        <Card sx={style} style={{overflow:'hidden ', maxHeight:"35pc"}}>
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
                    item_id: newValue.length === 0 ? '' : newValue.map((d)=>d.item_id)
                  });
                }}
                disablePortal
                name='name'
                id='combo-box-demo'
                // options={_.uniqBy(props.inventory_product, 'name')}
                options={_.uniqBy(productvalue, 'name')}
                getOptionLabel={(option) => option.name || ''}
                // fullWidth='true'
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='Product name'
                    variant='outlined'
                  />
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
            <TextField
                    fullWidth
                    id='outlined-name'
                    label='SKU'
                    value={formValue.sku}
                    name='sku'
                    type={'number'}
                    onChange={handleChange}
                  />
            </Grid>
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
            <TextField
                    fullWidth
                    id='outlined-name'
                    label='Lot Number'
                    value={formValue.lotnumber}
                    name='lotnumber'
                    type={'number'}
                    onChange={handleChange}
                  />
            </Grid>
          </Grid>

              <Grid container spacing={7} display= 'flex' justifyContent='center' alignItems='center' p='20px 0px 5px 0px'>
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

export default FilterFindProduct;
