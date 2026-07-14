import MaterialTable, { MTableToolbar } from "utils/SafeMaterialTable";
import { Button, Dialog, IconButton, Tooltip,TablePagination } from "@mui/material";
import CreateNewButtonContext from "context/CreateNewButtonContext";
import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSearchWarranty, listwarrantyAction, setSearchWarrant } from "redux/actions/asset_actions";
import CommonSearch from "utils/commonSearch";
import AddModeratorIcon from '@mui/icons-material/AddModerator';
import AssetWarranty from "./AssetWarranty";
import AddIcon from '@mui/icons-material/Add';
import { formatTime12Hour, maxBodyHeight, headerStyle, cellStyle } from 'utils/pageSize';
import PropTypes from 'prop-types'
import moment from "moment";
import { getStickyTableOptions, stickyTableComponents } from "utils/stickyTableLayout";


const AssetWarrantyList =(props)=>{

    const dispatch = useDispatch()

    const { setModalTypeHandler, setLoaderStatusHandler } = useContext(
        CreateNewButtonContext,
      );
    
    const [paginateData,setPaginateData] =useState({
        searchString : '',
        pageCount:0,
        pageSize:props?.type === 'asset_id' ? 5 : 20
    })
    

    const [imgpreview,setImgpreview] = useState([]);
    const [openImg,setOpenImg] = useState()
    
    const [data,setData] = useState();
    const [extendType,setExtendType] = useState('list');

    const handleImageOpen = (rowData)=>{

        console.log(rowData,'rowData')
        
        setImgpreview(rowData)
        setOpenImg('previewImage')
    }

    const handleFormDialogOpen = (rowdata) =>{
        setData(rowdata)
        setExtendType('extend')
    }

    const handleOpen =()=>{
        setExtendType('add')
    }

    const handleImageClose = ()=>{
        setOpenImg('list')
    }

    const {
        AssetReducers : {
         getWarrantCount,getwarrantData
        }
    } = useSelector((state)=> state)

    const getWarrantyProviderValue = (rowData) => {
        const provider = rowData?.warranty_provider ?? rowData?.seller;
        return provider && provider !== 'null' ? provider : '-';
    }

    const warranty_column = [
        {field:'name',title:'Asset Name'},
        {field:'warranty_provider',title:'Warranty Provider',render: (rowData) => getWarrantyProviderValue(rowData)},
                {
            field:'fromDate_Time',
            title:'From Date',
            render : (rowData) => {
                return rowData.fromDate_Time ? moment(rowData.fromDate_Time).format('DD/MM/YY') : "-"
            }
        },
        {
            field:'toDate_Time',
            title:'To Date',
            render : (rowData) => {
                return rowData.toDate_Time ? moment(rowData.toDate_Time ).format('DD/MM/YYYY') : '-'
            }
        },

        // {
        //     field:'fromDate_Time',
        //     title:'From Date',
        //     render : (rowData) => {
        //         if(rowData.fromDate_Time !== null) {
        //             const dateTime = `${rowData.fromDate_Time}`.split(' ')
        //             if(dateTime.length === 2) {
        //                 const [date, time] = dateTime
        //                 const formattedDate = moment(date).format('DD/MM/YYYY')
        //                 const formattedTime = formatTime12Hour(time)
        //                 return `${formattedDate} ${formattedTime}`
        //             }
        //             else {
        //                 return rowData.fromDate_Time
        //             }
        //         }
        //         else {
        //             return '-'
        //         }
        //     }
        // },
        // {
        //     field:'toDate_Time',
        //     title:'To Time',
        //     render : (rowData) => {
        //         if(rowData.toDate_Time !== null) {
        //             const dateTime = `${rowData.toDate_Time}`.split(' ')
        //             if(dateTime.length === 2) {
        //                 const [date, time] = dateTime
        //                 const formattedDate = moment(date).format('DD/MM/YYYY')
        //                 const formattedTime = formatTime12Hour(time)
        //                 return `${formattedDate} ${formattedTime}`
        //             }
        //             else {
        //                 return rowData.toDate_Time
        //             }
        //         }
        //         else {
        //             return '-'
        //         }
        //     }
        // },
       
        {field:'image' ,title:'Warranty Image',render:(rowData)=>{
            if(rowData.image.length > 0){
                return (
                    <img style={{height:'auto',width:'50%',cursor:"pointer"}} src={rowData.image[0]?.imageUrl} onClick={()=>handleImageOpen(rowData.image)}/>
                )
            }
            else {
                return 'No Data'
            }
            } }
            // {
            //     field : 'action',
            //     title : 'Action',
            //     render : (rowData) => {
            //         return (
            //             <Tooltip title = 'Extend warranty'>
            //                 <IconButton 
            //                     onClick={() => handleFormDialogOpen(rowData)}
            //                 >
            //                     <AddModeratorIcon />
            //                 </IconButton>
            //             </Tooltip>
            //         )
            //     }
            // }
    ]


    const handlePageChange =(page)=>{
        setPaginateData({...paginateData,pageCount:page})
    }

    const handleSizeChange =(size)=>{
        setPaginateData({...paginateData,pageSize:size})
    }

    const handleClose = () =>{
        setExtendType('list')
        const payload ={
            searchString: paginateData.searchString,
            pageCount: paginateData.pageCount,
            numPerPage: paginateData.pageSize
        }
        const asset_payload ={
            searchString: paginateData.searchString,
            pageCount: paginateData.pageCount,
            numPerPage: paginateData.pageSize,
            asset_id:props?.id
            
        }
        if(props?.type ==='asset_id'){
            dispatch(listwarrantyAction(asset_payload)) 
        }
        else{
            dispatch(listwarrantyAction(payload))
        }
    }
    
    console.log(imgpreview,'imgpreview')

    const requestSearch = (e) => {
        const val = e.target.value;

        console.log(paginateData,'paginate', val)
        setPaginateData({...paginateData,searchString:val})

        dispatch(setSearchWarrant({
            data:[],
            numRows:0
        }))

        const payload ={
            searchString: val,
            pageCount: paginateData.pageCount,
            numPerPage: paginateData.pageSize
        }
        const assetpayload ={
            searchString: val,
            pageCount: paginateData.pageCount,
            numPerPage: paginateData.pageSize,
            asset_id: props?.id
        }

        if(props?.type ==='asset_id'){
            dispatch(getSearchWarranty(
                assetpayload,
                setModalTypeHandler,
                setLoaderStatusHandler
            ))
        }
        else{
            dispatch(getSearchWarranty(
                payload,
                setModalTypeHandler,
                setLoaderStatusHandler
            ))
        }
    }

    const cancelSearch = () => {
        setPaginateData({...paginateData,searchString:''})

        dispatch(setSearchWarrant({
            data:[],numRows:0
        }))

        const payload ={
            searchString: "",
            pageCount: paginateData.pageCount,
            numPerPage: paginateData.pageSize
        }
        const assetpayload ={
            searchString: "",
            pageCount: paginateData.pageCount,
            numPerPage: paginateData.pageSize,
            asset_id: props?.id
        }

        if(props?.type ==='asset_id'){
            dispatch(getSearchWarranty(
                assetpayload,
                setModalTypeHandler,
                setLoaderStatusHandler
            ))
        }
        else{
            dispatch(getSearchWarranty(
                payload,
                setModalTypeHandler,
                setLoaderStatusHandler
            ))
        }

    }

 

    useEffect(()=>{
        let payload = {}
        if(props?.type !=='asset_id') {
            payload ={
                searchString: paginateData.searchString,
                pageCount: paginateData.pageCount,
                numPerPage: paginateData.pageSize
            }
        }
        else {
            payload ={
                searchString: paginateData.searchString,
                pageCount: paginateData.pageCount,
                numPerPage: paginateData.pageSize,
                asset_id : props?.id
            }
        }
        dispatch(listwarrantyAction(payload))
     
    },[paginateData.pageCount,paginateData.pageSize, props?.index])

 
    return(
        <>
            {
                extendType === 'list' &&
                    <MaterialTable
                            style={props.type === 'asset_id' ? {margin : '12px'} : { }}
                            totalCount={getWarrantCount}
                            columns={warranty_column}
                            title={"Warranty"}
                            data={ getwarrantData}
                            options={getStickyTableOptions({
                                headerStyle,
                                bodyOffset: 200,
                                cellStyle,
                                options:{
                                filtering : false,
                                actionsColumnIndex : -1,
                                paging:true,
                                tableLayout: "auto",
                                toolbar: true,
                                pageSize : paginateData.pageSize,
                                pageSizeOptions: props?.type === 'asset_id' ? [5,10,20] : [20, 50, 100],
                                search:false,
                                maxBodyHeight: maxBodyHeight
                                },
                            })}
                            page={paginateData.pageCount}
                            onPageChange={(page)=>{
                                handlePageChange(page)
                            }}
                            onRowsPerPageChange={(size)=>{
                                handleSizeChange(size)
                            }}
                            components={{
                                ...stickyTableComponents,
                                 Pagination: (props) => (
                                    <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "flex-end",
                                      alignItems: "center",
                                       padding: "8px 16px",
                                       }}>
                                        <TablePagination
                                        {...props}
                                        count={getWarrantCount} 
                        page={paginateData.pageCount || 0}
                        rowsPerPage={paginateData.pageSize || 20}
                        rowsPerPageOptions={[20, 50, 100]}
                        onPageChange={(event, page) => handlePageChange(page)}
                        onRowsPerPageChange={(event) =>
                          handleSizeChange(parseInt(event.target.value, 10))
                        }
                        labelRowsPerPage="Rows per page:" />
                                        </div>),
                                Toolbar:(props)=>(
                                <div
                                style={{
                                    display: 'flex',
                                    width: '100%',
                                    alignItems: 'center',
                                }}
                                >
                                    <div style={{width: '100%'}}>
                                                    <MTableToolbar {...props} />
                                    </div>
                                    <div>
                                        <CommonSearch
                                            searchVal = {paginateData.searchString}
                                            cancelSearch={cancelSearch}
                                            requestSearch={requestSearch}  
                                            />
                                    </div>

                                    
                                </div>
                                )
                            }}
                            actions={[
                                
                                    props?.type ==='asset_id' ? '' : {
                                        
                                            icon: () => <AddIcon />,
                                            tooltip: 'Add',
                                            isFreeAction: true,
                                            onClick: () => handleOpen(),
                                        
                                    }
                                
                            ]}

                    />
            }
            {
                extendType === 'add' &&
                    <AssetWarranty
                        type='add'
                        handleClose={handleClose} 
                    />
            }

            {
                extendType === 'extend' &&
                    <AssetWarranty 
                        type='extend'
                        data={data}
                        handleClose={handleClose}
                    />
            }
                       
            <Dialog open={openImg === 'previewImage'}>
                <img src={imgpreview[0]?.imageUrl } alt="images"/>
                <Button sx={{borderRadius:'0'}} variant="contained" color="error" onClick={()=> handleImageClose() }>Close</Button>
            </Dialog>
           
        </>
    )
}

AssetWarrantyList.propTypes = {
    type : PropTypes.string,
    id : PropTypes.number,
    index : PropTypes.number
}

export default AssetWarrantyList;
