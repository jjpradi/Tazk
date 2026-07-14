import {
  Button,
  Card,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import React, {useContext, useEffect, useState} from 'react';
import FindProduct from './findProduct';
import {useDispatch, useSelector} from 'react-redux';
import apiCalls from 'utils/apiCalls';
import {findProductAction} from 'redux/actions/product_actions';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {pageSize} from 'utils/pageSize';
import { Helmet } from 'react-helmet-async';
import { titleURL } from 'http-common';

export default function Index() {
  const dispatch = useDispatch();
  const {
    productReducer: {inventory_sales_product, inventory_sales_product_count},
  } = useSelector((s) => s);

  const {setModalTypeHandler, setLoaderStatusHandler, commoncookie,
    headerLocationId,} = useContext(
    CreateNewButtonContext,
  );

  const [paginationData, setPaginationData] = useState({
    currentPage: 0,
    page: 0,
    pageSizes: pageSize,
    searchVal: '',
  });

  const {currentPage, page, pageSizes, searchVal} = paginationData;

  const requestSearch = (e) => {
    let value = e.target.value;
    setPaginationData({...paginationData, searchVal: value});
  };

  const cancelSearch = () => {
    setPaginationData({...paginationData, searchVal: '', page: 0});
    let data = {
      search: '',
      numPerPage: pageSizes,
      pageCount: 0,
      location_Id: headerLocationId
    };

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(findProductAction(data)),
    );
  };
  useEffect(()=>{
    let data = {
      search: searchVal,
      numPerPage: pageSizes,
      pageCount: 0,
      location_Id : headerLocationId
    };
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(findProductAction(data)),
    )
  },[headerLocationId])


  const handleSearch = () => {
    let data = {
      search: searchVal,
      numPerPage: pageSizes,
      pageCount: 0,
      location_Id : headerLocationId
    };
    if (searchVal) {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(findProductAction(data)),
      )
    } else {
      alert("Type something to find a product...")
    }
  };

  const handleEnterPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  };

  const a = 10;
  return (
    <>
      <Helmet>
                 <meta charSet="utf-8" />
                 <title> {titleURL} | FindProduct </title>
       </Helmet>
      <Grid
        container
        display='flex'
        flexDirection='row'
        alignItems='center'
        spacing={5}
      >
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Card>
            <Grid
              container
              display='flex'
              flexDirection='row'
              alignItems='center'
              p='15px'
              spacing={7}
            >
              <Grid
                size={{
                  lg: 10,
                  md: 10,
                  sm: 8,
                  xs: 12
                }}>
                <TextField
                  fullWidth
                  autoFocus={searchVal ? true : false}
                  sx={{
                    borderRadius: 5,
                    backgroundColor: '#F4F7FE',
                    '& .MuiOutlinedInput-root': {
                      height: '42px',
                    },
                    '& fieldset': {
                      border: 'none',
                      borderRadius: 5,
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position='end'>
                        <ClearIcon
                          onClick={() => cancelSearch()}
                          fontSize='small'
                          sx={{
                            cursor: 'pointer',
                            visibility: searchVal ? 'visible' : 'hidden',
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  placeholder='Search here...'
                  value={searchVal}
                  onChange={(e) => requestSearch(e)}
                  onKeyPress={handleEnterPress}
                />
              </Grid>
              <Grid
                size={{
                  lg: 2,
                  md: 2,
                  sm: 4,
                  xs: 12
                }}>
                <Button fullWidth variant='outlined' onClick={handleSearch}>
                  <Typography>{'Search'}</Typography>
                </Button>
              </Grid>
            </Grid>
          </Card>
        </Grid>
        {!inventory_sales_product?.length ? (
          <Grid
            display='flex'
            justifyContent='center'
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            {/* <Typography
              sx={{
                fontSize: '16px',
                color: '#A6ABB4',
              }}
            >
              {'Search Above...'}
            </Typography> */}
          </Grid>
        ) : (
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Card>
              <FindProduct
                searchVal={searchVal}
      page={page}
      pageSizes={pageSizes}
      setPaginationData={setPaginationData}
      paginationData={paginationData}
      headerLocationId={headerLocationId}
      inventory_sales_product={inventory_sales_product}
      inventory_sales_product_count={inventory_sales_product_count}
              />
            </Card>
          </Grid>
        )}
      </Grid>
    </>
  );
}
