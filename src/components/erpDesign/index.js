import React, {useEffect, useState, useRef, useContext} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Grid, IconButton, Tooltip, Typography, Button, CardMedia} from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Masonry from '@mui/lab/Masonry';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import OptionButton from '../erpDesign/actionButton';
import ProductTopCards from './productTopOrder';
import {getProductErpDetails} from '../../redux/actions/erpDetails_actions';
import {getCheckProductAction, getProductDateAction, getProductTillAction, getProductTimelineAction, getTotalPurchasedQtyAction} from '../../redux/actions/product_actions';
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
import apiCalls from 'utils/apiCalls';
import { headerStyle } from 'utils/pageSize';
import blankprofile from '../../assets/icon/emptyimg.png'
import ImageGallaryCard from './ImageGallaryCard';
import Slider from 'react-slick';
import { listPosSalesPaymentsAction } from 'redux/actions/posSalesPayments_actions';
import { getbyidPurchaseTableAction } from 'redux/actions/purchaseTable_actions';
import PurchaseHistory from 'components/purchaseDetails/purchaseHistory';
import { getProductPurchaseHistoryAction } from 'redux/actions/purchase_actions';
import { getAllProductSalesHistoryAction } from 'redux/actions/sales_actions';

export default function App({
  rowIndex,
  type,
  handleEdit,
  handleDelete,
  rowPopupClose,
  item_id,
  searchData, 
  searchVal, 
  productByPagination,
  user_rights
}) {
  const ref1 = useRef(null);
  const {setModalTypeHandler, setLoaderStatusHandler} = useContext(
    CreateNewButtonContext,
  );
  const dispatch = useDispatch();
  const {
    productReducer: {product = [], check_product, productTimeline},
    erpDetailsReducer: {product_erp_details},
  } = useSelector((state) => state);
  // const [formValues, setFormValues] = useState({name:''});

  const [index, setIndex] = useState(rowIndex);
  const [productData, setProduct] = useState('');
  const [product_id, setProduct_id] = useState('');
  const matches = useMediaQuery('(min-width:600px)');
  
  const func1 = () => {
    if (index !== '') {
      const item_id = searchData[index].item_id
      const data = {
            item_id: searchData[index].item_id
        }
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(
          getProductErpDetails(
            item_id,
            setModalTypeHandler,
            setLoaderStatusHandler,
          ),
          
        ),
        dispatch(getCheckProductAction( item_id,
          setModalTypeHandler,
          setLoaderStatusHandler)),
        dispatch(getProductDateAction( item_id,
          setModalTypeHandler,
          setLoaderStatusHandler)),
        dispatch(listPosSalesPaymentsAction( item_id,
          setModalTypeHandler,
          setLoaderStatusHandler)),
        dispatch(getProductTillAction( item_id,
          setModalTypeHandler,
          setLoaderStatusHandler)),
        dispatch(getTotalPurchasedQtyAction( item_id,
          setModalTypeHandler,
          setLoaderStatusHandler)),
        dispatch(getbyidPurchaseTableAction( item_id,
          setModalTypeHandler,
          setLoaderStatusHandler)),
        dispatch(getProductPurchaseHistoryAction( item_id,
          setModalTypeHandler,
          setLoaderStatusHandler)),
        dispatch(getAllProductSalesHistoryAction( data,
          setModalTypeHandler,
          setLoaderStatusHandler)),
        dispatch(getProductTimelineAction(
          item_id,
          setModalTypeHandler,
          setLoaderStatusHandler
        ))

      );
      setProduct_id(item_id);
      setProduct(searchData[index])
    }
  };

  useEffect(() => {
    if (index !== '') {
      setProduct(product[index]);
    }
  }, [product,productData]);

  ref1.current = func1;
  useEffect(() => {
    ref1.current();
  }, [index]);

 
  const handleProductChange = (option) => {
    const indexData = searchData[index] 

    if (option === 0) {
      handleEdit(indexData.item_id, index);
    } else if (option === 1) {
      if(check_product[0]?.total === 0 ){
      handleDelete(indexData.item_id);
      } else {
        alert('Cannot Delete This Product Already Used')
      }
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

  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef(null);
  const totalSlides = productData ? productData?.imageUrl?.length : 1;
  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    beforeChange: (_, newIndex) => setActiveIndex(newIndex),
  };

  const handleBarClick = (index) => {
    if (sliderRef.current) {
      sliderRef.current.slickGoTo(index);
    }
  };

  console.log(productData, 'productData')

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
                  user_rights={user_rights}
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
                    disabled={
                       searchData.length - 1 === index
                        
                    }
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
                lg: 2.5,
                sm: 12,
                xs: 12
              }}>
              {/* <Card variant="outlined" sx={{ padding: "20px" }}> */}

              <div style={{minHeight: 10}}>
                <Box sx={{minHeight: 19}}>
                  <Card
                    variant='outlined'
                    sx = {{ minHeight: '500px',maxHeight : '550px' }}
                  >
                    <Grid container spacing={2} style={{ maxWidth : '330px', maxHeight : '300px' }}>
                      <Grid
                        size={{
                          xs: 12,
                          md: 12,
                          lg: 12,
                          sm: 12
                        }}>
                        {
                          productData?.imageUrl?.length > 0 ? (
                          <>
                            <Slider 
                              ref = {sliderRef} {...settings} 
                              style = {{ marginBottom: '10px' }}
                            >
                              {
                                productData?.imageUrl.map((img, index) => (
                                  <CardMedia
                                    key = {index}
                                    component = 'img'
                                    height = '350px'
                                    image = {img}
                                    alt = {`Product Image ${index + 1}`}
                                    sx = {{
                                      borderBottomLeftRadius : 4,
                                      borderBottomRightRadius : 4,
                                      objectFit : 'cover'
                                    }}
                                  />
                                ))
                              }
                            </Slider>

                            <Box
                              sx = {{
                                display : 'flex',
                                justifyContent : 'center',
                                gap : '10px',
                                marginTop : '5px',
                              }}
                            >
                              {
                                productData?.imageUrl.map((_, index) => (
                                  <Box
                                    key = {index}
                                    onClick = {() => handleBarClick(index)}
                                    sx = {{
                                      width : '20px',
                                      height : '6px',
                                      backgroundColor : activeIndex === index ? '#3ba5e3' : '#dbeefa',
                                      borderRadius : "7px",
                                      cursor : "pointer",
                                      transition : 'background-color 0.3s ease-in-out'
                                    }}
                                  />
                                ))
                              }
                            </Box>
                          </>
                          ) : (
                            <Grid container spacing={2} style={{ maxWidth : '330px', maxHeight : '300px' }}>
                              <CardMedia
                                component = 'img'
                                image = {blankprofile}
                                height = '300px'
                                style = {{
                                  borderBottomLeftRadius : 4,
                                  borderBottomRightRadius : 4,
                                  objectFit : 'cover'
                                }}
                              />
                            </Grid>
                          )
                        }
                      </Grid>
                      <Grid
                        size={{
                          xs: 12,
                          md: 12,
                          lg: 12,
                          sm: 12
                        }}>
                        <Grid container display='flex' alignItems='center' style={{ padding : '10px', paddingTop : '20px' }}>
                          <Grid
                            size={{
                              xs: 12,
                              md: 12,
                              lg: 12,
                              sm: 12
                            }}>
                            <Box display='flex' flexDirection='row'>
                              <Typography variant='body1'>
                                Name :{' '}
                                <span style={{fontWeight: '900'}}>
                                  {checkIsValid(productData?.name || '-')}
                                </span>
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid
                            size={{
                              xs: 12,
                              md: 12,
                              lg: 12,
                              sm: 12
                            }}>
                            <Box display='flex' flexDirection='row'>
                              <Typography variant='body1'>
                                Completed :{' '}
                                <span style={{fontWeight: '900'}}>
                                  {checkIsValid(productData?.sku || '-')}
                                </span>
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid
                            size={{
                              xs: 12,
                              md: 12,
                              lg: 12,
                              sm: 12
                            }}>
                            <Box display='flex' flexDirection='row'>
                              <Typography variant='body1'>
                                Description :{' '}
                                <span style={{fontWeight: '900'}}>
                                  {checkIsValid(productData?.description || '-')}
                                </span>
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Card>
                </Box>
              </div>
              <div style={{marginTop: 10}}>
                <Box sx={{minWidth: 175, minHeight: 35}}>
                  <Card
                    variant='outlined'
                    sx={{padding: '10px', minHeight: '80px'}}
                  >
                    <Typography variant='body1'>
                      Product Score :{' '}
                      <span style={{fontWeight: '500'}}>{'-'}</span>
                    </Typography>
                    <Typography variant='body1'>
                      Rank : <span style={{fontWeight: '500'}}>{'-'}</span>
                    </Typography>
                  </Card>
                </Box>
              </div>
              <div style={{marginTop: 10}}>
                <ProductBrand
                  brand={productData?.brand}
                  category={productData?.category}
                  cost_price={productData?.cost_price}
                  unit_price={productData?.unit_price}
                  max_price={productData?.max_price}
                  model={productData?.model}
                  variant={productData?.variant}
                />
              </div>
              <div style={{marginTop: 10}}>
                <ProductStockable
                  stock_type={productData?.stock_type}
                  reorder_level={productData?.reorder_level}
                  automatic_reorder_level={productData?.automatic_reorder_level}
                  is_serialized={productData?.is_serialized}
                />
              </div>
              <div style={{marginTop: 10}}>
                <Box sx={{minWidth: 175}}>
                  <Card
                    variant='outlined'
                    sx={{padding: '10px', minHeight: '80px'}}
                  >
                    <Typography variant='body1'>
                      Tax Category :{' '}
                      <span style={{fontWeight: '500'}}>
                        {checkIsValid(productData?.tax_category || '-')}
                      </span>
                    </Typography>
                    <Typography variant='body1'>
                      HSN :{' '}
                      <span style={{fontWeight: '500'}}>
                        {checkIsValid(productData?.hsn_code || '-')}
                      </span>
                    </Typography>
                  </Card>
                </Box>
              </div>

              {/* </Card> */}
            </Grid>
            <Grid
              style={{p: '0 10px', marginTop: '6px', padding: '6px'}}
              size={{
                md: 12,
                lg: 9.5,
                xs: 12,
                sm: 12
              }}>
              {/* <Card variant="outlined" sx={{ padding: "20px" }}> */}
              <div style={{width: '100%'}}>
                <ProductTopCards product_erp_details={product_erp_details} />
              </div>

              <div style={{marginTop: 20}}>
                <PurchaseCard item_id={item_id} />
              </div>

              {/* <div style={{ marginTop : 20 }}>
                <ImageGallaryCard imageData = {productData} />
              </div> */}

              <div style={{ marginTop : 20 }}>
                <SalesGraph item_id={item_id} />
              </div>

              <div style={{ marginTop : 20 }}>
                <PurchaseHistory item_id={item_id} />
              </div>

              <div style={{marginTop: 20}}>
                <PurchaseTable item_id={item_id} />
              </div>
              
              <div style={{minHeight: 200, marginTop: 20}}>
                <TimeLine productData={productTimeline} />
              </div>

              {/* </Card> */}
            </Grid>
          </Grid>
        </Card>
      </Grid>
    </div>
  );
}
