import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import { Button, Card, Chip, Dialog, DialogContent, Grid, TablePagination, Typography } from '@mui/material';
import {withStyles} from 'tss-react/mui';
import CommonToolTip from 'components/ToolTip';
import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getRegisterRequestAction, getRegisterRequestState, set_registerRequestAction, updateUserGrAction } from 'redux/actions/userCreation_actions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import apiCalls from 'utils/apiCalls';
import PanoramaIcon from '@mui/icons-material/Panorama';
import { websocketEvents} from '../../../http-common'
import EditIcon from '@mui/icons-material/Edit';
import context from '../../../context/CreateNewButtonContext'
import { maxBodyHeight, pageSize } from 'utils/pageSize';
import CommonSearch from 'utils/commonSearch';
import { commonDateFormat } from 'utils/getTimeFormat';
import { deletegrproductAction, getSearchProductAction, grProductListAction, setSearchProductListAction } from 'redux/actions/product_actions';

function Growretailproduct() {
    const value = 1
    const dispatch = useDispatch();
    const { UserCreationReducer: { RegisteredUserGR, RegisteredUserGRCount },productReducer:{grproducts, productListCount} } = useSelector(state => state)
    const [open,setOpen] = useState(false)
    const [rowData, setRowData] = useState({})
    const [openApprove, setOpenApprove] = useState(false)
    const [isApiFinished, setIsAiFinished] = useState(false);
    const [pageCount, setPageCount] = useState(0);
    const [pageSize, setPageSize] = useState(20)
    const [searchString, setSearchString] = useState('')
    const[images, setImages] = useState([])
    const[dialogOpen, setDialogOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [hovered, setHovered] = useState(null);

    const {
        setModalTypeHandler,
        setLoaderStatusHandler,
        commoncookie,
        headerLocationId,
    } = useContext(context);
    
    // console.log('showEmptyDataSourceMessage',isApiFinished);
    // const approveStatus = {
    //     '0': 'warning',
    //     'Approved': 'success',
    //     // 'Rejected': 'warning'
    // };
    // console.log('RegisteredUserGR',RegisteredUserGR);

    // useEffect(() => {
    //     // Add an event listener for 'retailshop' event
    //     websocketEvents.addListener({
    //         eventName: 'retailshop',
    //         callbackFun: newGRuserRegistered,
    //     });
    
    //     // Make API call and dispatch action to handle registration request

    //         let data = {
    //             value : value,
    //             pageCount : 0,
    //             numPerPage : pageSize
    //         }
        
    //         dispatch(getRegisterRequestAction(
    //             data,
    //             setModalTypeHandler,
    //             setLoaderStatusHandler))
    //             // .then(() => {
    //             //     if (RegisteredUserGR.length) {
    //             //         setIsAiFinished(false)
    //             //     } else {
    //             //         setIsAiFinished(true)
    //             //     }
    //             // });
    
    //     // Cleanup function to remove registration request data when component unmounts
    //     return () => {
    //         dispatch(set_registerRequestAction([]));
    //     };
    // }, []);


    useEffect(() => {
        const payload = {
            searchString : searchString,
            pageCount : pageCount,
            numPerPage : pageSize
        }           
            dispatch(grProductListAction(payload,setModalTypeHandler,
                setLoaderStatusHandler))
    }, [pageSize]);
    
    // console.log('isApiFinished',isApiFinished);
    // function newGRuserRegistered() {
    //     let data = {
    //         value : value,
    //         pageCount : 0,
    //         numPerPage : pageSize
    //     }
    //     dispatch(getRegisterRequestAction(data))
    // }

    // const handleApproval = (id,phone_number) => {
    //     dispatch(updateUserGrAction(id, { type: 'Approve',number: phone_number }))
    //     dispatch(getRegisterRequestAction(value))
    // }
//     const handleOpenApprove = (data) => {
//         console.log('FFFF', data);
//         setRowData(data);
//         setOpenApprove(true);
            
// }
   
//     const handleOpenEdit = (data) => {
//         setRowData(data);
//         setOpenApprove(true);
            
// }
   

    // const handleReject = (id,phone_number) => {
    //     dispatch(updateUserGrAction(id, { type: 'Reject',number: phone_number }))
    //     dispatch(getRegisterRequestAction(value))
    // }

    // const handleDialogOpen = (images) => {
    //     // const imageUrls = images.map(image => image.imageUrl);
    //     setImages(images);
    //     setDialogOpen(true);
    // }

    const handlePageChange = async (e,page) => {
        const payload = {
            searchString : searchString,
            pageCount : page,
            numPerPage : pageSize
        }           
        dispatch(grProductListAction(payload, () => {setPageCount(page)}))
    }

    const cancelSearch = () => {
        setSearchString('')

        dispatch(setSearchProductListAction({data:[], numRows:0}))
        const body = {
            value : value,
            searchString: '',
            pageCount: pageCount,
            numPerPage: pageSize
        }
        dispatch(grProductListAction(
            body,
            setModalTypeHandler,
            setLoaderStatusHandler,
        ))
    }

    const requestSearch = (e) => {
        let val = e.target.value;
        setSearchString(val)

        dispatch(setSearchProductListAction({ data: [], numRows: 0 }))
        
        const body = {
            value : value,
            searchString: val,
            pageCount: pageCount,
            numPerPage: pageSize
        }
        dispatch(getSearchProductAction(
            body,
            setModalTypeHandler,
            setLoaderStatusHandler,
        ))
    }
    
    const handlePageSizeChange = async (e) => {
        setPageSize(e.target.value);
    };
    // const deleteProduct =(id)=>{
    //     apiCalls(           
    //         dispatch(deletegrproductAction(
    //            id,
    //             setModalTypeHandler,
    //             setLoaderStatusHandler))
    //     )
    // }
    const handleOpen = (product) => {
        setSelectedProduct(product);
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
        setSelectedProduct(null);
    };
    
    const handleMouseEnter = (index) => {
        setHovered(index);
      };
    
      const handleMouseLeave = () => {
        setHovered(null);
      };

    return (
        <>
            <Card>
            {/* <Grid size={{ xs: 12, sm: 9, md: 9, lg: 9 }}> */}
            <Typography variant='h6' align='left' marginLeft='20px' marginTop='10px' >
                Product Details
            </Typography>
            
            <div style={{ marginLeft: '80%' }}>
                <CommonSearch
                    searchVal={searchString}
                    cancelSearch={cancelSearch}
                    requestSearch={requestSearch}
                />                          
            </div>
            {/* </Grid> */}
                <Grid container spacing={2} minHeight={550}>
                    {grproducts && grproducts.length > 0 ? (
                    grproducts.map((product, index) => (
                        <Grid
                            key={index}
                            style={{ margin: '10px' }}
                            size={{
                                lg: 1.3,
                                md: 2.1,
                                sm: 3.5,
                                xs: 5.2
                            }}>
                            <Card style={{ padding: '10px', textAlign: 'center' }}>
                                <img 
                                    src={product?.product_images?.length > 0 ? product?. product_images[0]?.img_url: " "}
                                    alt={product.name}
                                    style={{ width: '200px',height: '200px', cursor: 'pointer'}}
                                    // onClick={() => handleOpen(product)}
                                    // onMouseEnter={() => handleMouseEnter(index)}
                                    // onMouseLeave={handleMouseLeave}
                                />
                                <div style={{ padding: '10px 0' }}>
                                       <Typography variant="h6">Product Name: {product.name}</Typography>
                                        <Typography variant="body2">Dealer Price: {product.share_price}</Typography>
                                        <Typography variant="body2">Customer Price: {product.unit_price}</Typography>
                                        </div>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <Typography variant="body1" component="p">
                        No products available.
                    </Typography>
                )}
                </Grid>

                <TablePagination
                    component="div"
                    count={productListCount ?? 0}
                    page={pageCount}
                    onPageChange={handlePageChange}
                    rowsPerPage={pageSize}
                    onRowsPerPageChange={handlePageSizeChange}
                />

                {/* <Dialog open={open} onClose={handleClose}>
                    <DialogContent>
                        {selectedProduct && (
                            <>
                                <img 
                                    src={selectedProduct?.product_images?.length > 0 ? selectedProduct?. product_images[0]?.img_url: " "}
                                    alt={selectedProduct.name}
                                    style={{ width: '100%', height : '500px' }}
                                />
                                <Typography variant="h6">Product Name : {selectedProduct.name}</Typography>
                                <Typography variant="body2">Dealer Price : {selectedProduct.share_price}</Typography>
                                <Typography variant="body2">Customer Price : {selectedProduct.unit_price}</Typography>
                                <Typography variant="body2">Description : {selectedProduct.description}</Typography> 
                                </>
                        )}
                    </DialogContent>
                </Dialog> */}
                {/* {openApprove && (
                        <RequestEditAndApprove
                            rowData={rowData}
                            closeDialog={() => setOpenApprove(false)}
                            value={value}
                        />
                    )} */}
                </Card>
        </>
    );
}

export default Growretailproduct;
