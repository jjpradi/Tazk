import { connect, useSelector } from 'react-redux';
import * as React from 'react';
import { useEffect, useState, useContext, useRef, useCallback } from 'react';
import ProductGridItem from '../ProductGridItem/ProductGridItem';
import {
  listProductAction,
  updateProductAction,
  getbyidProductAction,
  deleteProductAction,
  createProductAction,
  listProductByLocationAction,
  listSearchProductByLocationAction
} from '../../../../redux/actions/product_actions';
import Header from '../Header/Header';
import context from '../../../../context/CreateNewButtonContext';
import { useDispatch } from 'react-redux';
import {
  PushProductList,
  PreOrderConvertDataAction,
  PreOrderOutOFStock,
} from '../../../../redux/actions/pos_product_list';
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TablePagination,
  useMediaQuery,
  Grid,
} from '@mui/material';
import { ListPaymentModesAction } from '../../../../redux/actions/pos_session';
import PosContext from '../../../../context/PosContext';
import CreateNewButtonContext from '../../../../context/CreateNewButtonContext';
// import Pagination from './Pagination';
import apiCalls from 'utils/apiCalls';
import useInfiniteScroll from 'utils/useInfiniteScroll';
import { useInView } from 'react-intersection-observer';
import { SEARCH_PRODUCT_FILTER } from 'redux/actionTypes';
import { useTheme } from '@mui/material/styles';
import DetailedProductItem from '../ProductGridItem/DetailedProductItem'

let PAGE_LIMIT = 100


const ProductGrid = (props) => {
  // const [state, setstate] = useState({ search: "" })
  const theme = useTheme()
  const isTabSize = useMediaQuery(theme.breakpoints.between('sm', 'lg'))

  const templist = useRef(null);
  const preOrderRef = useRef(null);
  const preOrderDataRef = useRef(null);
  const { setModalTypeHandler, setLoaderStatusHandler, setModalStatusHandler } = useContext(context);
  const { activePosLocationId } = useContext(PosContext);
  const [allData, setAllData] = useState([]);
  const [productDisplay, setProductDisplay] = useState('simpleCard')
  const [filtereddata, setFiltereddata] = useState([]);
  const [query, setQuery] = useState({ searchType: 'initial', searchString: '', limit: PAGE_LIMIT, lastId: 'MAX_NUMBER' })

  const [paginationLastId, setPaginationLastId] = useState('MAX_NUMBER')

  const all = filtereddata;
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [filter, setFilter] = useState(false);
  const latestSearchStringRef = useRef('');
  const [visibleCount, setVisibleCount] = useState(100);
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const style = {
    boxSizing: 'initial',
    display: 'grid',
    // margin:'6px',
    gridTemplateColumns: `repeat(auto-fill, minmax(${isTabSize ? productDisplay === 'simpleCard' ? '125px' : '230px' : productDisplay === 'simpleCard' ? '135px' : '230px'}, 1fr))`,
    rowGap: productDisplay === 'simpleCard' ? '25px' : '15px',
    columnGap: productDisplay === 'simpleCard' ? '25px' : '15px',
    paddingRight: '15px',
    paddingLeft: '15px',
    // paddingBottom:'100px',
    // margin:'15px'
  };

  const dispatch = useDispatch();
  // const {
  //   productListReducer: { pre_order_status }
  // } = useSelector(state => state)
  const pre_order_status = useSelector(state => state.productListReducer.pre_order_status); // ✅ Only watches one value
  const lotSearch = (data, value) => {
    if (data.lots.length > 0) {
      let test = data.lots.filter((f) => f.lot_number === value);
      if (test.length > 0) {
        dispatch(PushProductList({ ...data, lot_number: value, lot_id: test[0]?.lot_id }, props.posId));
        return true;
      }
    }
    return false;
  };

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '100px', // Trigger 200px before reaching the bottom
  });

  useEffect(() => {
    latestSearchStringRef.current = query.searchString;
  }, [query.searchString]);


  const observer = useRef(null)

  const lastProductElementRef = useCallback(node => {
    if (loading) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setQuery({ ...query, lastId: node.getAttribute('data-lastitemid') })
      }
    })
    if (node) observer.current.observe(node)
  }, [loading, hasMore])



  // console.log(loading,"loading")
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(false);



      let timeoutId;

      if (!filter) {
        if (props.location_id !== 'null' && query.searchType === 'initial' || query.searchString.trim() !== '') {

          timeoutId = setTimeout(async () => {
            const requestSearchString = query.searchString;
            const oldData = query.searchType === 'initial' ? [...props.productScroll] : [...props.searchproductfilter]
            await apiCalls(
              setModalTypeHandler,
              setLoaderStatusHandler,
              props.listSearchProductByLocationAction(
                props.location_id,
                query,
                oldData,
                (response) => {
                  if (requestSearchString !== latestSearchStringRef.current) {
                    return;
                  }
                  setLoading(false)
                  setHasMore(response.length > 0)
                  const temp = query.lastId === 'MAX_NUMBER' ? [...response] : [...oldData, ...response];
                  setFiltereddata(temp)
                }
              )
            )
          }, ['category', 'brand', 'initial', 'brandCategory', 'search'].includes(query.searchType) ? 200 : 1500);
        } else {
          setFiltereddata([...props.productScroll])
          setLoading(false)
        }
      }
      return () => clearTimeout(timeoutId);

    })();
  }, [query.lastId]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(false);
      // console.log('loading yes')


      let timeoutId;

      if (props.location_id !== 'null' && query.searchString.trim() !== '') {
        timeoutId = setTimeout(async () => {
          const requestSearchString = query.searchString;
          const oldData = query.searchType === 'initial' ? [...props.productScroll] : [...props.searchproductfilter]
          await apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            props.listSearchProductByLocationAction(
              props.location_id,
              query,
              oldData,
              (response) => {
                if (requestSearchString !== latestSearchStringRef.current) {
                  return;
                }
                setLoading(false)
                setHasMore(response.length > 0)
                const temp = query.lastId === 'MAX_NUMBER' ? [...response] : [...oldData, ...response];
                const finalData = temp.flatMap(i => i.lots && i.lots.length > 0 ? i.lots.map((j, index) => ({ ...i, ...j, lot_id: i.lots[index].lot_id })) : [i])
                setFiltereddata(finalData)
                setProductDisplay('detailedCard')
                if (response.length > 0) {
                  response.some(data => {
                    lotSearch(data, requestSearchString)
                  })
                }
              }
            )
          )
        }, ['category', 'brand', 'initial', 'brandCategory', 'search'].includes(query.searchType) ? 200 : 1500);
      } else {
        setFiltereddata([...props.productScroll])
        setLoading(false)
        setProductDisplay('simpleCard')
      }

      return () => clearTimeout(timeoutId);

    })();
  }, [query.searchString]);

  useEffect(() => {
    if (productDisplay === 'detailedCard') {
      setVisibleCount(visibleCount)
    }
  }, [query.searchString, productDisplay])

  useEffect(() => {
    if (inView && filtereddata.length > visibleCount) {
      setVisibleCount(prev => prev + 100);
    }
  }, [inView, filtereddata.length]);

  const handleSearch = (event) => {
    let value = event.target.value.toLowerCase();
    setQuery((prev) => ({
      ...prev,
      searchType: 'search',
      searchString: value,
      limit: PAGE_LIMIT,
      lastId: 'MAX_NUMBER'
    }))

    // if (value !== '') {
    //   let searchString ={
    //         value
    //   }


    //   apiCalls(
    //     setModalTypeHandler,
    //     setLoaderStatusHandler,
    //     props.listSearchProductByLocationAction(
    //       activePosLocationId,
    //       searchString,
    //       setModalTypeHandler,
    //       setLoaderStatusHandler,
    //       (response) => {
    //        if(response.length > 0){
    //         setFiltereddata(props.searchproductfilter);
    //        }
    //       }
    //     )
    //   );
    //   const result = allData.filter((data) => {
    //     const lot = ()=>{
    //       let valid = false
    //       data.lots.forEach(d=>{
    //         if(d.lot_number.toLowerCase()?.includes(value)){
    //           valid = true
    //           dispatch(PushProductList({...data}, props.posId))
    //         }
    //         // if(d.lot_number.toLowerCase() === value){
    //         //   // if(d.lot_id )
    //         //   dispatch(PushProductList({...data}, props.posId))
    //         // }
    //       })
    //       return valid
    //     }

    //     return (
    //       (data.sku && data.sku.toLowerCase().includes(value)) ||
    //       (data.name && data.name.toLowerCase().includes(value)) ||
    //       lotSearch(data, value)
    //     );
    //   });


    // } else {
    //   setFiltereddata(allData);
    // }
  };

  // const Loders = (data)=>{
  //     setLoad(data)
  // }


  // const list = async () => {
  //   if (activePosLocationId !== 'null'  ) {

  //     apiCalls(
  //       setModalTypeHandler,
  //       setLoaderStatusHandler,
  //       props.listProductByLocationAction(
  //         activePosLocationId,
  //         setModalTypeHandler,
  //         setLoaderStatusHandler,
  //       )
  //     );

  //   }
  // };
  // templist.current = list;

  useEffect(() => {
    // templist.current();
  }, [activePosLocationId]);



  // useEffect(() => {

  //   if(query.searchType === 'initial'){
  //     setFiltereddata(
  //       props.searchproductfilter.filter((f) => Math.sign(f.received_quantity) === 1),
  //     );
  //     setAllData(
  //       props.searchproductfilter.filter((f) => Math.sign(f.received_quantity) === 1),
  //     );

  //   }else{
  //     setFiltereddata(
  //       props.productScroll.filter((f) => Math.sign(f.received_quantity) === 1),
  //     );
  //   }
  //   return () => {
  //     setAllData({});
  //     setFiltereddata({});
  //   };
  // }, [props.searchproductfilter]);

  const preOrderProductFilter = () => {
    setAllData(props.product.filter((p) => p.stock_type === 1));
    setFiltereddata(props.product.filter((p) => p.stock_type === 1));
  };
  preOrderRef.current = preOrderProductFilter;
  useEffect(() => {
    // if (pre_order_status === true) {
    //   preOrderRef.current();
    // } else {
    //   setAllData(
    //     props.product.filter((f) => Math.sign(f.received_quantity) === 1),
    //   );
    //   setFiltereddata(
    //     props.product.filter((f) => Math.sign(f.received_quantity) === 1),
    //   );
    // }
    setQuery((prev) => ({ ...prev, searchString: '' }))
    // return () => {
    //   setAllData({});
    //   setFiltereddata({});
    // };
  }, [pre_order_status]);

  const PreOrderDataPush = async () => {

    if (
      Object.keys(props.PreOrderConvertData).length > 0 &&
      props.PreOrderTabStatus === true
    ) {
      props.setNewTabStatusForPreOrder(false);
      dispatch(
        PreOrderConvertDataAction(props.PreOrderConvertData, props.posId),
      );
      const { order_items, order_status } = props.PreOrderConvertData;
      const OrderedItems = filtereddata.filter((p) =>
        order_items.some(
          (o) => o.item_id === p.item_id && (p.stock_type === 1 ? p.is_serialized === 1 ? p.lots.length >= o.quantity : p.lots[0].available_quantity >= o.quantity : true),
        ),
      );
      if (
        OrderedItems.length > 0 &&
        order_items.length === order_items.length &&
        order_status === 'Converted'
      ) {
        const PreOrderItems = OrderedItems.map((item) => {
          const filteredItem = order_items.find(order_item => order_item.item_id === item.item_id)
          return { ...item, unit_price: filteredItem.item_unit_price }
        })
        order_items.map((o, indx) => {
          for (let i = 1; i <= o.quantity; i++) {
            dispatch(
              PushProductList(
                { ...PreOrderItems[indx], pre_order: true },
                props.posId,
              ),
            );
          }
          //   return o
        });
      }
      else if ((OrderedItems.length === 0 ||
        order_items.length !== order_items.length) &&
        order_status === 'Converted') {
        let outOfStock = await filtereddata.filter((of) =>
          order_items.filter(
            (p) => of.item_id === p.item_id,
          ),
        );
        await dispatch(
          PreOrderOutOFStock({
            orderItems: order_items,
            productItems: outOfStock,
          }),
        );
        await setModalTypeHandler('outOfStock');
        await setModalStatusHandler(true);
      }
      else if (order_status === 'Canceled') {
        apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(
            ListPaymentModesAction(
              true,
              props.posId,
              true,
              setLoaderStatusHandler,
            ),
          )
        );
      }
    }
  };
  preOrderDataRef.current = PreOrderDataPush;


  useEffect(() => {
    preOrderDataRef.current();
  }, [props.PreOrderConvertData, props.PreOrderTabStatus]);

  const handleApplyFilter = (data) => {
    setLoading(true);
    setError(false);
    setFilter(true)
    let timeoutId;

    const payload = {
      searchType: data.searchType,
      searchString: data.searchString,
      limit: PAGE_LIMIT,
      lastId: data.lastId,
      type: data.type
    }

    if (props.location_id !== 'null') {
      timeoutId = setTimeout(async () => {

        await apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          props.listSearchProductByLocationAction(
            props.location_id,
            payload,
            [],
            (response) => {
              setLoading(false)
              setHasMore(response.length > 0)
              setFiltereddata([...response])

              if (response.length > 0) {
                response.some(data => {
                  lotSearch(data, query.searchString)
                })
              }
            }
          )
        )
      }, ['category', 'brand', 'initial'].includes(query.searchType) ? 200 : 1500);
    } else {
      setFiltereddata([...props.productScroll])
      setLoading(false)
    }

    return () => clearTimeout(timeoutId);
  }

  const handleClearFilter = async () => {
    setLoading(true);
    setError(false);
    await setQuery((prev) => ({ ...prev, searchType: 'initial', searchString: '', limit: PAGE_LIMIT, lastId: 'MAX_NUMBER' }))
    let timeoutId;

    const payload = {
      searchType: 'initial',
      searchString: '',
      limit: PAGE_LIMIT,
      lastId: 'MAX_NUMBER'
    }

    if (props.location_id !== 'null') {
      timeoutId = setTimeout(async () => {

        await apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          props.listSearchProductByLocationAction(
            props.location_id,
            payload,
            [],
            (response) => {
              setLoading(false)
              setHasMore(response.length > 0)
              setFiltereddata([...response])

              if (response.length > 0) {
                response.some(data => {
                  lotSearch(data, query.searchString)
                })
              }
            }
          )
        )
      }, ['category', 'brand', 'initial'].includes(query.searchType) ? 200 : 1500);
    } else {
      setFiltereddata([...props.productScroll])
      setLoading(false)
    }

    return () => clearTimeout(timeoutId);
  }


  return (
    <>
      <CreateNewButtonContext.Consumer>
        {({ loaderStatus }) => (
          <div>

            <Header
              handleSearch={handleSearch}
              filtereddata={filtereddata}
              setFiltereddata={setFiltereddata}
              allData={allData}
              setQuery={setQuery}
              query={query}
              handleApplyFilter={handleApplyFilter}
              handleClearFilter={handleClearFilter}
              posId={props.posId}
              setFilter={setFilter}
            />
            <div style={style}>
              {filtereddata.length > 0 ? (() => {
                // 1. Process the data into the final display list based on the card type
                let displayList = [];
                let finalFilteredData = []
                if (productDisplay === 'simpleCard') {
                  // For simpleCard, we only want one row per item_id
                  displayList = [...new Map(
                    filtereddata
                      .filter(i => pre_order_status || i.received_quantity >= 1 || i.stock_type === 0)
                      .map(product => [product.item_id, product])
                  ).values()];
                } else {
                  // For detailedCard, we show every lot (the data is already flattened in your useEffect)
                  finalFilteredData = filtereddata.filter(i =>
                    (pre_order_status || i.received_quantity >= 1 || i.stock_type === 0)
                  );
                  displayList = finalFilteredData.slice(0, visibleCount)
                }

                // 2. Map the calculated list to the components

                return (
                  <>
                    {displayList.map((product, i) => {
                      // Keep the old ref logic for API pagination if still needed
                      const isLastElement = displayList.length === i + 1;

                      return productDisplay === 'simpleCard' ? (
                        <ProductGridItem
                          key={`simple-${product.item_id}`}
                          data={product}
                          posId={props.posId}
                          id={product.item_id}
                          thumbnail={product.imageUrl}
                          price={product.cost_price}
                          stock_type={product.stock_type}
                          title={product.name}
                          receiving_quantity={product.received_quantity}
                          unit={product.unit_price}
                          max_price={product.max_price}
                          tab_count={props.product_list.tab_count}
                          category={product.category}
                          tax_category={product.tax_category}
                          brand={product.brand}
                          model={product.model}
                          variant={product.variant}
                          // Attach observer to trigger next page load
                          lastProductElementRef={isLastElement ? lastProductElementRef : ''}
                          lastProductItemID={isLastElement ? product.item_id : ''}
                          isQtyAvailable={product.received_quantity >= 1}
                          isTabSize={isTabSize}
                        />
                      ) : (
                        <DetailedProductItem
                          key={`detailed-${product.lot_id || product.item_id}-${i}`}
                          data={product}
                          posId={props.posId}
                          id={product.item_id}
                          thumbnail={product.imageUrl}
                          price={product.cost_price}
                          stock_type={product.stock_type}
                          title={product.name}
                          receiving_quantity={product.received_quantity}
                          unit={product.unit_price}
                          max_price={product.max_price}
                          tab_count={props.product_list.tab_count}
                          category={product.category}
                          tax_category={product.tax_category}
                          brand={product.brand}
                          model={product.model}
                          variant={product.variant}
                          // lastProductElementRef={isLastElement ? lastProductElementRef : ''}
                          // lastProductItemID={isLastElement ? product.lot_id : ''}
                          isQtyAvailable={product.received_quantity >= 1}
                          isTabSize={isTabSize}
                          lot_number={product?.lot_number ?? ''}
                          trans_date={product?.trans_date ?? ''}
                        />
                      );
                    })}

                    {/* 3. The Sentinel: This triggers the frontend 'Load More' */}
                    {finalFilteredData.length > visibleCount && productDisplay === 'detailedCard' && (
                      <div ref={loadMoreRef} style={{ height: '20px', gridColumn: '1/-1' }} />
                    )}
                  </>
                );
              })() : <></>}

              {loading && <Typography style={{ color: 'white', textAlign: 'right' }}>Loading ...</Typography>}

              {!filtereddata.length && loaderStatus === false && !loading && (
                <Grid container display='flex' justifyContent='center' alignContent='center'>
                  <Grid>
                    <Typography style={{ color: 'rgba(0,0,0,0.5)', textAlign: 'center' }}> Not Found</Typography>
                  </Grid>
                </Grid>
              )}
            </div>
          </div>
        )}
      </CreateNewButtonContext.Consumer>
      {/* <div style={{display:"flex",  justifyContent:"end"}}>
      <TablePagination
              rowsPerPageOptions={[10, 50, 150, { label: 'All', value: -1 }]}
              colSpan={3}
              count={allData.length}
              rowsPerPage={rowsPerPage}
              page={page}

              SelectProps={{
                inputProps: {
                  'aria-label': 'rows per page',
                },
                native: true,
              }}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              ActionsComponent={Pagination}

            />
      </div> */}
    </>
  );
};

// ProductGrid.propTypes = {
//   products: PropTypes.array.isRequired
// }
const mapStateToProps = (state) => {
  return {
    product: state.productReducer.product,
    product_id_data: state.productReducer.product_id_data,
    product_list: state.productListReducer,
    pre_order_status: state.productListReducer.pre_order_status,
    pos_session: state.posSessionReducer.pos_session,
    searchproductfilter: state.productReducer.searchproductfilter || [],
    productScroll: state.productReducer.productScroll || []
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listProductAction: (setModalTypeHandler, setLoaderStatusHandler) => {
      dispatch(listProductAction(setModalTypeHandler, setLoaderStatusHandler));
    },
    listProductByLocationAction: (
      id,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        listProductByLocationAction(
          id,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    createProductAction: (data, alertResponce) => {
      dispatch(createProductAction(data, alertResponce));
    },
    getbyidProductAction: (id, alertResponce) => {
      dispatch(getbyidProductAction(id, alertResponce));
    },
    updateProductAction: (id, data, alertResponce) => {
      dispatch(updateProductAction(id, data, alertResponce));
    },
    deleteProductAction: (id, alertResponce) => {
      dispatch(deleteProductAction(id, alertResponce));
    },
    listSearchProductByLocationAction: (id, data, oldData, response) => {
      return dispatch(listSearchProductByLocationAction(id, data, oldData, response))
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductGrid);
