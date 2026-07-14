import PropTypes from 'prop-types';
import {
  IconButton,
  TextField,
  Toolbar,
  Grid,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import {useCallback, useEffect, useRef, useState} from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import ClearIcon from '@mui/icons-material/Clear';
import {useDispatch, useSelector} from 'react-redux';
import { GetAllProductBrand, GetAllProductCategory } from 'redux/actions/product_actions';
import { SEARCH_PRODUCT_FILTER } from 'redux/actionTypes';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CancelIcon from '@mui/icons-material/Cancel';
import { setFrequentlyFilteredByPosId } from 'redux/actions/pos_session';

const headerHeight = 30;

const Header = ({
  text,
  handleSearch,
  filtereddata,
  allData,
  setFiltereddata,
  setQuery,
  query,
  handleApplyFilter,
  handleClearFilter,
  setFilter,
  posId
}) => {
  const {
    productReducer: {product_all_brand, product_all_category, frequentlyFiltered},

  } = useSelector((state) => state);
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [filteredFrequently, setFilteredFrequently] = useState(frequentlyFiltered?.[posId] || [])
  const [selectedFilter, setSelectedFilter] = useState(null)
  // const[close,setClose]=useState(false)
  const style = {
    // marginTop: '0px',
    // marginBottom: '0px',
    // marginTop:'2px',
    fontSize: '15px',
    backgroundColor: '#f4f7fe',
  };
  const dispatch = useDispatch();


  const [filterOpen, setFilterOpen] = useState(false)

  useEffect(() => {
    !product_all_category.length && dispatch(GetAllProductCategory())
    !product_all_brand.length && dispatch(GetAllProductBrand())
  },[])

  useEffect(() => {
    setFilteredFrequently(frequentlyFiltered?.[posId] || [])
  }, [frequentlyFiltered])

  // useEffect(() => {
  //   if( ['category', 'brand', 'search'].includes(query.searchType) ){
  //     dispatch({
  //       type: SEARCH_PRODUCT_FILTER,
  //       payload: [],
  //     });

  //   }
  // }, [query.searchString]);

  const categorySearch = (event) => {

    // setQuery({...query, searchType : 'category', searchString : event ? event.category : '', lastId : 'MAX_NUMBER'})
    // setBrand('');
    setSearch('');
    setCategory(event ? event.category : '');
    // let value = event?.category;
    // if (value) {
    //   const result = allData.filter((data) => {
    //     return data.category.includes(value);
    //   });

    //   setFiltereddata(result);
    // } else {
    //   setFiltereddata(allData);
    // }
  };
  const brandSearch = (event) => {
    // setCategory('');
    setSearch('');
    // setQuery({...query, searchType : 'brand', searchString : event ? event.brand : '', lastId : 'MAX_NUMBER'})
    setBrand( event ? event.brand : '');
    // let values = event?.brand;
    // if (values) {
    //   const result = allData.filter((data) => {
    //     return data.brand?.includes(values);
    //   });

    //   setFiltereddata(result);
    // } else {
    //   setFiltereddata(allData);
    // }
  };

  const handleSubmit = async() => {
        const searchType = category !== '' && brand !== null ? 'category'
                        : 'search'
    
    
    setFilterOpen(false)
    const data = {
      ...query, 
      searchType : `${brand}-brand`, 
      searchString :  searchType === 'category' ? `${category}-category` : searchType === 'search' ? search : '', 
      lastId : 'MAX_NUMBER',
      type : 'filter'
    }
    const name = brand !== '' && brand !== null && category !== '' && brand !== null ? `${brand} - ${category}` : brand !== '' && brand !== null ? brand : category
    // setFrequentlyFiltered((prev) => ([{searchType: searchType, searchString: name}, ...prev]))
    await dispatch(setFrequentlyFilteredByPosId([{searchType: searchType, searchString: name}, ...filteredFrequently], posId))
    setSelectedFilter({searchType: searchType, searchString: name})
    handleApplyFilter(data)
  }

  const handleSelectedFilter = (filter) => {
    console.log(filter,'brand')
    if(filter.searchType === 'brand'){
      setBrand(filter.searchString.split(' - ')[0])
    }
    else{
      setCategory(filter.searchString)
    }
    setSelectedFilter(filter)
    // const data = {
    //   ...query, 
    //   searchType : filter.searchType, 
    //   searchString : filter.searchString, 
    //   lastId : 'MAX_NUMBER',
    //   type : 'filter'
    // }
    
    const data = {
      ...query, 
      searchString :  `${filter.searchString?.split(' - ')[1] ||filter.searchString }-category`, 
      searchType :  `${filter.searchString?.split(' - ')[0]  || filter.searchString}-brand`, 
      lastId : 'MAX_NUMBER',
      type : 'filter'
    }

    handleApplyFilter(data)
  }

  const handleDeselectFilter = () => {
    setBrand('')
    setCategory('')
    setSelectedFilter(null)
    handleClearFilter()
    setFilter(false)
  }

  const searchRef = useRef(null);
  const searchDebounceTimer = useRef(null);

  const updateSearchQuery = useCallback((value) => {
    setQuery((prev) => ({
      ...prev,
      searchType: 'search',
      searchString: value,
      lastId: 'MAX_NUMBER'
    }));
  }, [setQuery]);

  const stopPendingSearchUpdate = useCallback(() => {
    if (searchDebounceTimer.current) {
      clearTimeout(searchDebounceTimer.current);
      searchDebounceTimer.current = null;
    }
  }, []);

  const scheduleSearchUpdate = useCallback((value) => {
    stopPendingSearchUpdate();
    searchDebounceTimer.current = setTimeout(() => {
      updateSearchQuery(value);
    }, 350);
  }, [stopPendingSearchUpdate, updateSearchQuery]);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    return () => {
      stopPendingSearchUpdate();
    };
  }, [stopPendingSearchUpdate]);

  const handleClear = () => {
    stopPendingSearchUpdate()
    setBrand('')
    setCategory('')
    setSearch('')
    setFilterOpen(false)
    setSelectedFilter(null)
    handleClearFilter()
    setFilter(false)
  }


  return (
    <>
      <header style={style}>
        <div style={{marginTop: '6px'}}>
          <Toolbar position='fixed' sx={{ minHeight: '55px !important' }}>
            <Grid container spacing={3} display = 'flex' justifyContent = 'space-between'>
              <Grid sx = {{ paddingTop: '3px !important' }}>
                {/* <Typography>Filtered Frequently</Typography> */}
                <Box sx={{ width: '100%', height: '40px', overflow: 'auto', display: 'flex', columnGap: '5px', scrollbarWidth: 'none' }}>
                    {
                      filteredFrequently.length > 0 ? filteredFrequently.map((filter, index) =>
                        <Box key = {index} >
                          <Chip
                            label = {filter.searchString}
                            onClick = {() => filter.searchString !== (selectedFilter?.searchString || '') ? handleSelectedFilter(filter) : null}
                            onDelete = {() => filter.searchString === (selectedFilter?.searchString || '') ? handleDeselectFilter() : null}
                            color = {filter.searchString === (selectedFilter?.searchString || '') ? 'warning' : 'primary'}
                            deleteIcon = {filter.searchString === (selectedFilter?.searchString || '') ? <CancelIcon /> : <></>}
                            sx={{ padding: '0 !important' }}
                          />
                        </Box>
                      )
                      : <></>
                    }
                </Box>
              </Grid>

              <Grid sx = {{ '& .MuiGrid-item': {paddingTop: '0px !important'} }}>
                <Grid container spacing = {2}>
                  <Grid sx = {{ '& .MuiGrid-item': {paddingTop: '0px !important'} }}>
                    <IconButton onClick={() => setFilterOpen(true)}>
                      <FilterAltIcon fontSize = '30px' />
                    </IconButton>
                  </Grid>

                  <Grid sx = {{ '& .MuiGrid-item': {paddingTop: '0px !important'} }}>
                    <TextField
                      fullWidth
                      inputRef={searchRef}
                      placeholder='Search…'
                      onBlur={() => {
                        stopPendingSearchUpdate();
                      }}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCategory('');
                        setBrand('');
                        setSearch(value);
                        scheduleSearchUpdate(value);
                      }}
                      value={search}
                      sx={{
                        '& .MuiOutlinedInput-root': { backgroundColor: '#E6E8EF', borderRadius: '30px !important', height: '42px' },
                        // '& input': { paddingTop: '15px !important', paddingBottom: '14px !important' },
                        '& fieldset': { border: 'none' }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position='start' sx={{ marginTop: '0px !important' }}>
                            <SearchIcon />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <IconButton
                            size='small'
                            style={{
                              visibility:
                                search && search.length > 0 ? 'visible' : 'hidden',
                            }}
                            onClick={(e) => {
                              handleClear()
                              // setSearch('');
                              // handleSearch({target: {value: ''}});
                              // setQuery({...query, searchType : 'search', searchString : '', lastId : 'MAX_NUMBER'})
                            }}
                          >
                            <ClearIcon sx={{cursor: 'pointer'}} />
                          </IconButton>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Toolbar>
        </div>
      </header>
      <Dialog open = {filterOpen} onClose = {() => setFilterOpen(false)} maxWidth = 'xs' fullWidth>
        <DialogTitle>
        <Grid container sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Grid sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant='h6'>
                Filter
              </Typography>
            </Grid>

            <Grid>
              <IconButton aria-label='close' onClick={() => setFilterOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Grid>
          </Grid>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing = {2}>
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Autocomplete
                fullWidth
                id='combo-box-demo'
                options={product_all_category}
                getOptionLabel={(option) => option.category}
                onChange={(e, newvalue) => {
                  categorySearch(newvalue);
                }}
                value={{ category: category }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant='filled'
                    label='Category'
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
              <Autocomplete
                fullWidth
                id='combo-box-demo'
                options={product_all_brand}
                getOptionLabel={(option) => option.brand}
                value={{brand: brand}}
                onChange={(e, newvalue) => brandSearch(newvalue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='Brand'
                    variant='filled'
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Grid container spacing = {2} sx = {{ display: 'flex', justifyContent: 'flex-end' }}>
            <Grid>
              <Button
                variant = 'contained'
                color = 'error'
                onClick = {handleClear}
              >
                Clear
              </Button>
            </Grid>
            
            <Grid>
              <Button
                variant = 'contained'
                onClick = {handleSubmit}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </DialogActions>
      </Dialog>
    </>
  );
};

Header.propTypes = {
  text: PropTypes.string,
};

export default Header;
