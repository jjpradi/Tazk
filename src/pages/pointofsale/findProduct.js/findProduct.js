import React, { useContext, useEffect, useState } from 'react';
import {
    Button,
    Grid,
    Autocomplete,
    TextField,
    Typography,
    Snackbar,
    SnackbarContent,
    Alert,
    ListItemText,
    List,
    ListItem,
    TablePagination,
    ListItemButton,
    IconButton,
} from '@mui/material';
import { connect, useDispatch, useSelector } from 'react-redux';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import MaterialTable from 'utils/SafeMaterialTable';
import moment from 'moment';
import _ from 'lodash';
import FilterFindProduct from './filterfindproduct';
import { FilterAlt } from '@mui/icons-material';
import {InventoryProductAction, FILTERInventoryProductAction, FilterSalesProductAction, Salesproduct, inventorySalesProductAction, findProductAction } from '../../../redux/actions/product_actions';
import {Helmet} from "react-helmet-async";
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle } from 'utils/pageSize';
import apiCalls from 'utils/apiCalls';
import { titleURL } from 'http-common';
import { options } from 'happy-dom/lib/PropertySymbol.js';
import {
  getStickyTableOptions,
  stickyTableComponents,
} from 'utils/stickyTableLayout';



export default function FindProduct(props) {
const {
  searchVal, setPaginationData, page, pageSizes, paginationData,
  inventory_sales_product, inventory_sales_product_count, headerLocationId,
} = props;

    const { setModalTypeHandler, setLoaderStatusHandler } = useContext(
        CreateNewButtonContext,
    );
    const [filteropen, SetFilterOpen] = useState(false)
    const [filtedValue, setFiltedValue] = useState({name:'', sku: '', item_id : '', lotnumber : ''})
    // const [productvalue, SetProductvalue] = useState([])
    const [filteredData, setFilteredData] = useState({ previousData: []})
    const [tableData, setTableData] = useState({ tabData : []})
    // const [inventorySalesProductData, setInventorySalesProductData] = useState([])
    // const [paginationData, setPaginationData] = useState({headerupdate: 'null',
    // currentPage:0,
    // page: 0,
    // pageSizes: pageSize
    // })
    const [preLength, setPreLength] = useState(0)
    // const {headerupdate, currentPage, page, pageSizes,
    // } = paginationData

    const handleClose = (value) => {
        SetFilterOpen(value)
    };

    const dispatch = useDispatch();
    
    // const {
    //     productReducer: { inventory_sales_product, inventory_sales_product_count }
    //   } = useSelector((state) => state);

    // const totalCount = filter_inventory_product_count + filter_sales_product_count

    // const totalDataLength = filter_inventory_product.length + filter_sales_product.length


    // useEffect(() => {
    //     setFilteredData({...filteredData, previousData : []})
    //     let data = {name : 'null',sku : 'null',lotnumber: 'null',pageCount: 0, numPerPage: pageSizes}//pageSize

    //     apiCalls(
    //         setModalTypeHandler,
    //         setLoaderStatusHandler,
    //         dispatch(inventorySalesProductAction(
    //             data,
    //             setModalTypeHandler,
    //             setLoaderStatusHandler,
    //         ))
    //     )
       
        // dispatch(FILTERInventoryProductAction(
        //     data, 
        //     setModalTypeHandler, 
        //     setLoaderStatusHandler,
        //     (response)=>{
        //         // if(response.length >= 0){
        //             // if(filter_inventory_product.length > 0){
        //                 let dataLength = response.length === 0 ? pageSizes : pageSizes - response.length
            
        //                 const data1 = {name : filtedValue.item_id || 'null',sku : filtedValue.sku || 'null',lotnumber: filtedValue.lotnumber || 'null',pageCount: page || 0, numPerPage:  dataLength}
            
        //                 dispatch(FilterSalesProductAction(
        //                     data1, 
        //                     setModalTypeHandler, 
        //                     setLoaderStatusHandler,
        //                     (res)=>{
        //                         setPreLength(res.length)
        //                     }
        //                 ))

        //             // }

        //         // }
    
        //     }
        // ))                
        

        // const data1 = {name : filtedValue.item_id || 'null',sku : filtedValue.sku || 'null',lotnumber: filtedValue.lotnumber || 'null',pageCount: page || 0, numPerPage:  pageSizes}

        // dispatch(FilterSalesProductAction(data1, setModalTypeHandler, setLoaderStatusHandler))

        //  dispatch(InventoryProductAction(setModalTypeHandler, setLoaderStatusHandler));
        //  dispatch(Salesproduct(setModalTypeHandler, setLoaderStatusHandler))
//    },[])

//    useEffect(() => {
//     const fIL = filter_inventory_product.length > 0 ? filter_inventory_product.map((f) => {return {...f,type:"In Stock"}}) : []
//     const fSP = filter_sales_product.length > 0 ? filter_sales_product.map((f) => {return {...f,type:"Ordered",product_name:f.productName}}) : []
//     const productData = fIL.concat(fSP)
//     const finalData = productData.concat(filteredData.previousData)
//     setFilteredData({...filteredData, previousData : finalData})

//     const pageData = filteredData.previousData.slice(0, 5).map((d) => d)
//         setTableData({...tableData, tabData : pageData})
        
//    },[filter_sales_product])
   

//----------------------------------------------------------------------------------------------- dfdfdf ---------------------------------------------------------------------------------------------------
//    useEffect(() => {

//     //    if (inventory_sales_product.length) {
//            const inventorySalesData = inventory_sales_product?.length > 0 ? inventory_sales_product?.map((f) => {return {...f, type: f.sale_id === null ? "In Stock" : "Ordered"}}) : []
//            setInventorySalesProductData(inventorySalesData)
//     //    }

//    }, [inventory_sales_product])
//------------------------------------------------------------------------------------------fffff-----------------------------------------------------------------------------------------------------

//    useEffect(() => {
    // const Data = [...inventory_product].concat(
    //   sales_product.map((b) => {
    //     return {...b, name: b.name, item_id: b.item_id};
    //   }),
    // );
//     const Data = [...inventory_product,...sales_product]
//     SetProductvalue(Data)
//   }, [inventory_product,sales_product]);

    
const handlePageChange = (newPage) => {
  setPaginationData({ ...paginationData, page: newPage });
  const data = {
    search: searchVal || '',
    numPerPage: parseInt(pageSizes, 10) || 20,
    pageCount: parseInt(newPage, 10) || 0,
    location_Id: headerLocationId,          // <-- was missing
  };
  apiCalls(
    setModalTypeHandler,
    setLoaderStatusHandler,
    dispatch(findProductAction(data)),
  );
};

const handlePageSizeChange = (size) => {
  const newSize = parseInt(size, 10) || 20;
  setPaginationData({ ...paginationData, pageSizes: newSize, page: 0 });
  const data = {
    search: searchVal || '',
    numPerPage: newSize,
    pageCount: 0,
    location_Id: headerLocationId,          // <-- was missing
  };
  apiCalls(
    setModalTypeHandler,
    setLoaderStatusHandler,
    dispatch(findProductAction(data)),
  );
};;


    const ApplyButton = (formValue) =>{
        let data = {
            name : formValue.item_id || 'null',
            sku : formValue.sku || 'null',
            lotnumber: formValue.lotnumber || 'null'
        }
   
        dispatch(inventorySalesProductAction(
            data, 
            setModalTypeHandler, 
            setLoaderStatusHandler,
        ))

        // dispatch(FILTERInventoryProductAction(data, setModalTypeHandler, setLoaderStatusHandler))
        // dispatch(FilterSalesProductAction(data, setModalTypeHandler, setLoaderStatusHandler))

        setFiltedValue({name : formValue.name, item_id : formValue.item_id, sku : formValue.sku, lotnumber: formValue.lotnumber})
        SetFilterOpen(false)

    }
    const clearButton = () =>{
        setFiltedValue({name : '', item_id : '', sku : '', lotnumber: ''})
    }

    // const fIL = filter_inventory_product.length > 0 ? filter_inventory_product.map((f) => {return {...f,type:"In Stock"}}) : []
    // const fSP = filter_sales_product.length > 0 ? filter_sales_product.map((f) => {return {...f,type:"Ordered"}}) : []
    // const productData = fIL.concat(fSP)

    return (
        <div
    style={{
        padding: '0 10px',
        height: 'calc(100vh - 120px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxSizing: 'border-box',
    }}
>
            <Helmet>
                   <meta charSet="utf-8" />
                   <title> {titleURL} | FindProduct </title>
         </Helmet>
            <Grid container spacing={3}>

                <Grid
                    xx={12}
                    size={{
                        lg: 12,
                        md: 12,
                        sm: 12
                    }}>
                    <MaterialTable
                        // totalCount= {filter_inventory_product_count + filter_sales_product_count}
                        totalCount = {inventory_sales_product_count}
                        // actions={[
                        //     {
                        //         icon: () => (
                        //             <div style={{display: 'flex'}}>
                        //                 <FilterFindProduct
                        //                     open={filteropen}
                        //                     handleClose={handleClose}
                        //                     // inventory_product={productvalue}
                        //                     ApplyButton={ApplyButton}
                        //                     filtedValue={filtedValue}
                        //                     clearButton={clearButton}
                        //                     SetFilterOpen={SetFilterOpen}
                        //                 />
                        //             </div>
                        //         ),
                        //         tooltip: 'Filter',
                        //         isFreeAction: true,
                        //     }]}
                        components={{
                            ...stickyTableComponents,
                            Pagination: (subProps) => (
  <div style={{ display: 'flex', justifyContent: 'flex-end',
                alignItems: 'center', padding: '8px 16px' }}>
    <TablePagination
      {...subProps}
      count={inventory_sales_product_count || 0}
      page={page}
      rowsPerPage={pageSizes}
      rowsPerPageOptions={[20, 50, 100]}
      onPageChange={(event, newPage) => handlePageChange(newPage)}
      onRowsPerPageChange={(event) => handlePageSizeChange(event.target.value)}
    />
  </div>
),
                        }}
                        options={{
    search: false,
    exportButton: true,
    filtering: false,
    tableLayout: 'auto',
    toolbar: true,
    actionsColumnIndex: -1,
    paging: true,
    pageSize: pageSizes,
    pageSizeOptions: [20, 50, 100],
    maxBodyHeight: 'calc(100vh - 300px)',
    minBodyHeight: 'calc(100vh - 300px)',
    headerStyle: {
        ...headerStyle,
        position: 'sticky',
        top: 0,
        zIndex: 2,
        backgroundColor: '#f5f5f5',
    },
    cellStyle,
}}


                        page={page}
                        onPageChange={(page) => handlePageChange(page)}
                        onRowsPerPageChange={(size) => handlePageSizeChange(size)}
                        
                        columns={[
                            {
                                title: 'Name',
                                field: 'product_name',
                            },
                            {
                                title: 'Lot Number',
                                field: 'lot_number',
                            },
                            {
                                title: 'Qty',
                                field: 'qty',
                                render: (rowData) => (
                                    rowData.lot_number === null ? rowData.qty : 1
                                )
                            },
                            {
                                title: 'Location ',
                                field: 'location_name',
                            },
                            {
                                title: 'Date',
                                field: 'p_date',
                                render: (rowData) => (
                                    rowData.p_date?.slice(0,10)
                                )
                            },
                            {
                                title: 'Type',
                                field: 'type',
                            },
                            {
                                title: 'Product Type',
                                field: 'is_serialized',
                                render: (rowData) => (
                                    rowData.is_serialized === 1 ? "Serialized" : "Non-Serialized"
                                )
                            },
                        ]}
                        title={
                            <Typography
                                variant='h6'
                                align='left'
                                style={{ paddingTop: '10px', paddingBottom: '10px' }}
                            >
                                Find Product
                            </Typography>
                        }
                        data={Array.isArray(inventory_sales_product) ? inventory_sales_product : []}
                        // data = {filteredData.previousData}
                    />

                </Grid>
                {/* <Grid size={{ sm: 12, md: 12, lg: 6 }} xx={12}>

                    <MaterialTable

                        options={{
                            search: false,
                            exportButton: true,
                            filtering: false,
                            actionsColumnIndex: -1,
                            maxBodyHeight: maxBodyHeight,
                            pageSizeOptions: [20, 50, 100],

                        }}
                        columns={[
                            {
                                title: 'Name',
                                field: 'productName',
                            },
                            {
                                title: 'Quantity',
                                field: 'qty',
                            },
                            {
                                title: 'Location',
                                field: 'location_name',
                            },
                            {
                                title: 'Ordered Date',
                                field: 'saledate',
                            },
                        ]}
                        title={
                            <Typography
                                variant='h6'
                                align='left'
                                style={{ paddingTop: '10px', paddingBottom: '10px' }}
                            >
                                Ordered
                            </Typography>
                        }
                        data={filter_sales_product}
                    />

                </Grid> */}
                {/* ) : ''} */}
            </Grid>
        </div>
    );
}

