import React, {useEffect, useState, useRef, useContext} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Grid, IconButton, Tooltip, Typography, Button} from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Masonry from '@mui/lab/Masonry';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import OptionButton from '../erpDesign/actionButton';
import ProductTopCards from './productTopOrder';
import {getProductErpDetails} from '../../redux/actions/erpDetails_actions';
import PurchaseCard from '../purchaseDetails/purchaseCard';
import PurchaseTable from '../purchaseDetails/purchaseTable';
import SalesGraph from '../purchaseDetails/salesGraph';
import ProductBrand from './productBrand';
import ProductStockable from './productStockable';
// import primaryContact from './primaryContact'
import {base_url} from '../../http-common';
import CreateNewButtonContext from '../../context/CreateNewButtonContext';
import useMediaQuery from '@mui/material/useMediaQuery';
import TimeLine from './timeline';

export default function App({
  rowIndex,
  type,
  handleEdit,
  handleDelete,
  rowPopupClose,
  item_id,
}) {
  const ref1 = useRef(null);
  const {setModalTypeHandler, setLoaderStatusHandler} = useContext(
    CreateNewButtonContext,
  );
  const dispatch = useDispatch();
  const {
    generalLedgerReducer: {generalLedger},
    erpDetailsReducer: {product_erp_details},
  } = useSelector((state) => state);
  // const [formValues, setFormValues] = useState({name:''});

  const [index, setIndex] = useState(rowIndex);
  const [productData, setProduct] = useState('');
  const [product_id, setProduct_id] = useState('');
  const matches = useMediaQuery('(min-width:600px)');

  const func1 = () => {
    if (index !== '') {
      // const item_id = product[index].item_id
      // dispatch(getProductErpDetails(item_id, setModalTypeHandler, setLoaderStatusHandler))
      // setProduct_id(item_id)
      // setProduct(product[index])
    }
  };
  ref1.current = func1;
  useEffect(() => {
    ref1.current();
  }, [index]);

  const handleProductChange = (option) => {
    const indexData = generalLedger[option];

    if (option === 0) {
      handleEdit(indexData.id);
    } else if (option === 1) {
      handleDelete(indexData.id);
    }
  };

  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const checkIsValid = (val) => {
    if (typeof val === 'undefined') return '';
    if (val === null || val === 'null') return '';
    return val;
  };

  return (
    <div>
      <Grid container>
        <Grid
          display='flex'
          justifyContent='flex-end'
          mb='10px'
          size={{
            md: 12,
            lg: 12,
            sm: 12,
            xs: 12
          }}>
          <div style={{marginLeft: 'auto'}}>
            <Grid container spacing={2}>
              <Grid>
                <Button
                  variant='contained'
                  onClick={() => {
                    setLoaderStatusHandler(true);
                    rowPopupClose();
                    setLoaderStatusHandler(false);
                  }}
                  sx={{}}
                  color='inherit'
                >
                  Back
                </Button>
              </Grid>

              <Grid>
                <OptionButton
                  handleProductChange={handleProductChange}
                  type={type}
                />
              </Grid>
              <Grid>
                <Tooltip title='Previous'>
                  <IconButton
                    color='primary'
                    disabled={index === 0}
                    component='span'
                    onClick={() => setIndex(index - 1)}
                  >
                    <ArrowBackIosIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title='Next'>
                  <IconButton
                    color='primary'
                    // disabled={product.length - 1 === index}
                    component='span'
                    onClick={() => setIndex(index + 1)}
                  >
                    <ArrowForwardIosIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          </div>
        </Grid>
        <Card variant='outlined' style={{width: '100%'}}>
          <Grid container direction='row'>
            <Grid
              style={{
                borderRight: matches && '1px #d9dadc solid',
                padding: '6px',
              }}
              size={{
                md: 12,
                lg: 4,
                sm: 12,
                xs: 12
              }}>
              {/* <Card variant="outlined" sx={{ padding: "20px" }}> */}

              <div style={{minHeight: 10}}>
                <Box sx={{minHeight: 19}}>
                  <Card
                    variant='outlined'
                    sx={{padding: '10px', minHeight: '100px'}}
                  >
                    <Grid container spacing={2}>
                      <Grid
                        size={{
                          xs: 6,
                          md: 6,
                          lg: 6,
                          sm: 6
                        }}>
                        {/* <img
                        src={`${base_url}${productData?.pic_filename}`}
                        // srcSet={`${productData?.pic_filename}?w=162&auto=format&dpr=2 2x`}
                        alt={""}
                        loading="lazy"
                        style={{
                          borderBottomLeftRadius: 4,
                          borderBottomRightRadius: 4,
                          display: "block",
                          width: "100%",
                        }}
                      /> */}
                      </Grid>
                      <Grid
                        size={{
                          xs: 6,
                          md: 6,
                          lg: 6,
                          sm: 6
                        }}>
                        {/* <Typography variant="body1">Name : <span style={{fontWeight:'bold'}}>{checkIsValid(capitalize(productData?.name))}</span></Typography> */}
                        {/* <Typography variant="body1" style={{ fontWeight: 'bold' }}>{checkIsValid(capitalize(productData?.name))} </Typography> */}
                      </Grid>
                    </Grid>
                  </Card>
                </Box>
              </div>
              <div style={{marginTop: 10}}>
                <Box sx={{minWidth: 175, minHeight: 35}}>
                  <Card
                    variant='outlined'
                    sx={{padding: '10px', minHeight: '100px'}}
                  >
                    <Typography variant='body1'>
                      Product Score : <span style={{fontWeight: '500'}}></span>
                    </Typography>
                    <Typography variant='body1'>
                      Rank : <span style={{fontWeight: '500'}}></span>
                    </Typography>
                  </Card>
                </Box>
              </div>
              <div style={{marginTop: 10}}>
                {/* <ProductBrand brand={productData?.brand} category={productData?.category} cost_price={productData?.cost_price} unit_price={productData?.unit_price} max_price={productData?.max_price} /> */}
              </div>
              <div style={{marginTop: 10}}>
                {/* <ProductStockable reorder_level={productData?.reorder_level} automatic_reorder_level={productData?.automatic_reorder_level} is_serialized={productData?.is_serialized} unit_price={productData?.unit_price} /> */}
              </div>
              <div style={{marginTop: 10}}>
                {/* <Box sx={{ minWidth: 175 }}>
                <Card variant="outlined" sx={{ padding: "10px", minHeight:'250px'}}>
                  <Typography variant="body1">Tax Category : <span style={{ fontWeight: '500' }}>{checkIsValid(productData?.tax_category)}</span></Typography>
                  <Typography variant="body1">HSN : <span style={{ fontWeight: '500' }}>{checkIsValid(productData?.hsn_code)}</span></Typography>
                </Card>
              </Box> */}
              </div>

              {/* </Card> */}
            </Grid>
            <Grid
              style={{p: '0 10px', marginTop: '6px', padding: '6px'}}
              size={{
                md: 12,
                lg: 8,
                xs: 12,
                sm: 12
              }}>
              {/* <Card variant="outlined" sx={{ padding: "20px" }}> */}
              {/* <div style={{width:'100%'}}>
            <ProductTopCards product_erp_details={product_erp_details} />
            </div>

            <div style={{ marginTop: 20 }}>
              <PurchaseCard item_id={item_id} />
            </div>

            <div style={{ marginTop: 20 }}>
              <PurchaseTable item_id={item_id} />
            </div>

            <div>
              <SalesGraph item_id={item_id} />
            </div>

            <div style={{ minHeight: 200, marginTop: 20 }}>
              <TimeLine productData = {productData} />
              </div> */}

              {/* </Card> */}
            </Grid>
          </Grid>
        </Card>
      </Grid>
    </div>
  );
}
