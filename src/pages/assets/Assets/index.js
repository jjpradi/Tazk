import { Helmet } from "react-helmet-async";
import { titleURL } from 'http-common';
import { useContext, useEffect, useState } from "react";
import { Box, Button, Card, Dialog, Fade, Grid, IconButton, Stack, Tooltip, Typography, TextField, InputAdornment, Modal, Chip, Autocomplete } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import ReorderIcon from '@mui/icons-material/Reorder';
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import { DataGrid } from "@mui/x-data-grid";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useDispatch, useSelector } from "react-redux";
import { ListAssets, getAssetGroupIdAction, getAssetTypeIdAction, getSearchAssetAction, setSearchAssetAction, updateAssetAction } from "redux/actions/asset_actions";
import Asset_Details from "./AssetDetails";
import CreateNewButtonContext from "context/CreateNewButtonContext";
import AssetManagement from "./AssetForm";
import NewDynamicProperties from "pages/assets/DynamicProperties/DynamicProp";
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import PrintIcon from "@mui/icons-material/LocalPrintshop";
import QRCodeForAssets from "components/assetManagement/QRCodeforAssets";
import AlertDialog from "pages/sales/purchases/PrintLabel";
import { listUserCreationAction } from "redux/actions/userCreation_actions";
import AssetTypeForm from "./AssetTypeForm";
import AssetNewForm from "./AssetNewForm";
import { restrictNewCreationBasedOnPlanAction } from "redux/actions/subscription_action";
import { Close } from "@mui/icons-material";
import Carousel from "react-material-ui-carousel";
import { maxBodyHeight } from "utils/pageSize";
import { FilterAlt} from '@mui/icons-material';
import { getsessionStorage } from 'pages/common/login/cookies';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

function Assets(){

    const{setModalTypeHandler, setLoaderStatusHandler} = useContext(CreateNewButtonContext)
    const [open,setOpen]=useState('list')
    const [data,setData]=useState()
    const dispatch = useDispatch()
    const storage = getsessionStorage();
    const selectedRole = storage?.role_name;
    const[dialogOpen, setDialogOpen] = useState(false)
    const[asstList, setAssetList] = useState([])
    const[images, setImages] = useState([])
    const[pagination, setPagination] = useState({
        searchString: "",
        pageCount: 0,
        numPerPage: 20
    })
    const[qrOpen, setQrOpen] = useState(false)
    const[qrData, setQrData] = useState()
    const[currentImageIndex, setCurrentImageIndex] = useState(0)
    const[showNavButtons, setShowNavButtons] = useState(false)
    const [chipData,setChipData] = useState('All')
    const [filterValues,setFilterValues]  = useState({
        open : false,
        group : null,
        type : null
    })
    const [errors,setErrors]  = useState({
        group : null,
        type : null
    })

    console.log(errors,'sdfhsdh')


    const{
        AssetReducers:{
            assetsList,
            assetsListCount,
            searchAssets,
            assignList,
            getAssetGroup, getAssetType
        },
        UserCreationReducer: {createUser},
        SubscriptionReducer: {restrictUserLocationCreation},
        rbacReducer: { menuAccess = {} }
    } = useSelector((state) => state)
    
    useEffect(()=>{
        let payLoad = {
            searchString: pagination.searchString,
            pageCount: pagination.pageCount,
            numPerPage: pagination.numPerPage,
            condiditon : chipData === 'null' ? undefined : chipData
        }
        if(open === 'list'){
            dispatch(
                ListAssets(payLoad)   
            )
            dispatch(listUserCreationAction())
            dispatch(restrictNewCreationBasedOnPlanAction())
        }

    }, [pagination.numPerPage, pagination.pageCount, open,chipData])

    useEffect(() => { (async () => {
        setAssetList([])
        const rows = await assetsList.data
        if(rows?.length > 0){
            const finalData = await rows.map((row, index) => ({
                id: index,
                ...row,
                Image: JSON.parse(row.Image)
            }))
            setAssetList((prev) => [...prev, ...finalData])
        }
    })();
}, [assetsList])
    useEffect(() => {
        if (selectedRole) {
        dispatch(getMenuAccessAction(selectedRole));
        }
    }, [dispatch, selectedRole]);

    const handleDialogClose = () => {
        setDialogOpen(false)
    }

    // const handleDialogOpen = (images) => {
    //     setImages(images)
    //     setDialogOpen(true)
    // }

    const handleDialogOpen = (images) => {
        // const imageUrls = images.map(image => image.imageUrl);
        setImages(images);
        setCurrentImageIndex(0)
        setDialogOpen(true);
    }
    
    const handleDetail = (data) => {
        setData(data)
        setOpen('detail')
    }

    const handleDetailClose=()=>{
        setOpen('list')
        // let payLoad = {
        //     searchString: pagination.searchString,
        //     pageCount: pagination.pageCount,
        //     numPerPage: pagination.numPerPage,
        // }
        // dispatch(
        //     ListAssets(payLoad)
        // )
    }
    
    const pageChangeHandler = async (page) => {
        setPagination((prev) => ({
            ...prev,
            pageCount: page
        }))
    }

    const pageSizeChangeHandler = async (size) => {
        setPagination((prev) => ({
            ...prev,
            numPerPage: size
        }))
    }

    const cancelSearch = () => {
        setPagination((prev) => ({
            ...prev,
            searchString: ""
        }))
        setSearchAssetAction({data: [], numRows: 0})
        let payLoad = {
            searchString: "",
            pageCount: pagination.pageCount,
            numPerPage: pagination.numPerPage,
        }
        dispatch(ListAssets(payLoad, setModalTypeHandler, setLoaderStatusHandler))
    }

    const requestSearch = (e) => {
        let val = e.target.value
        if(val !== ''){
            setPagination((prev) => ({
                ...prev,
                searchString: val
            }))
            setSearchAssetAction({data: [], numRows: 0})
            let payLoad = {
                searchString: val,
                pageCount: 0,
                numPerPage: pagination.numPerPage,
            }
            dispatch(getSearchAssetAction(payLoad, setModalTypeHandler, setLoaderStatusHandler))
        }
        else if(val === ''){
            cancelSearch()
        }
    }


    const handleopen=()=> {
      setOpen('form')
    }

    const handleFormClose=(val) => {
        if(val){
            let payLoad = {
                searchString: pagination.searchString,
                pageCount: pagination.pageCount,
                numPerPage: pagination.numPerPage,
            }
            // dispatch(
            //     ListAssets(payLoad, async (res) => {
            //         const finalRows = await res.data
            //         const finalData = finalRows?.map((row, index) => ({
            //             id: index,
            //             ...row,
            //             image: JSON.parse(row.image)
            //         }))
            //         setAssetList(finalData)
                
            //     })
                
            // )
            setOpen('list')
        }
        else{
            setOpen('list')
        }
        
    }
    const handlePropertyOpen = (type) => {
        setOpen(type)
    }

    const handlePrintQR = (rowData)  => {
        let fullName = ''
            if(rowData.asset_owner !== 0){
                let ownerDetails = createUser.find((e) => e.employee_id === rowData.asset_owner)
                fullName = ownerDetails?.last_name ? `${ownerDetails?.first_name} ${ownerDetails?.last_name}` : ownerDetails?.first_name
            }
            else{
                fullName =  ''
            }
        setQrData({...rowData})
        setQrOpen(true)
    }

    const handleQrClose = ()  => {
        setQrOpen(false)
        setQrData(null)
    }



    const columns = [
        {field: 'Code', headerName: 'Code', width: 110},
        {field: 'Asset Group', headerName: 'Group', width: 120, renderCell: (params) => params?.value?.toUpperCase()},
        {field: 'Asset Type', headerName: 'Type', width: 130, renderCell: (params) => params?.value?.toUpperCase()},
        {field: 'Name', headerName: 'Asset Name', width: 150},
        {   field: 'Asset Owner', 
            headerName: 'Asset Owner', 
            width: 150
        },
        {field: 'Location', headerName: 'Location', width: 130},
        {field: 'Assigned To', headerName: 'Assigned To', width: 150, renderCell: (params) => params.row[`Assigned To`] ? params.row[`Assigned To`] : '-'},
        {field: 'Status', headerName: 'Status', width: 110},
        {field: 'Condition', headerName: 'Condition', width: 110},
        {field: 'Cost', headerName: 'Cost', width: 90},
        { field: 'Image', headerName: 'Images', width: 150, 
                renderCell: (params) => {
                    if (params.value && Array.isArray(params.value) && params.value.length > 0) {
                        const firstImage = params.value[0].imageUrl
                        return (
                            <>
                                <img
                                    src={firstImage}
                                    alt={`Image 1`}
                                    style={{ width: "50%", height: "auto", cursor: "pointer" }}
                                    onClick={() => handleDialogOpen(params.value)}
                                />
                            
                            </>
                        );
                    } else {
                        return 'No Data';
                    }
                }
              
              
        }, 
        {field: 'action', headerName: 'Actions', width: 140, sortable: false,filterable: false,renderCell: (rowData) => {
            return(
                <>
                    <Tooltip
                        title='View'
                        TransitionComponent={Fade}
                        TransitionProps={{timeout: 600}}
                        placement='top'
                    >
                        <IconButton onClick={()=>handleDetail(rowData.row)}><VisibilityIcon/></IconButton>
                    </Tooltip>

                    <Tooltip
                        title='Print QR Code'
                        TransitionComponent={Fade}
                        TransitionProps={{timeout: 600}}
                        placement='top'
                    >
                        <IconButton onClick={() => handlePrintQR(rowData.row)}><PrintIcon /></IconButton>
                    </Tooltip>
                </>
            )
        }}
    ]

    const handleIndicatorClick = (index) => {
        setCurrentImageIndex(index)
    }

    const handleMouseEnterCarosel = () => {
        setShowNavButtons(true)
    }

    const handleMouseLeaveCarosel = () => {
        setShowNavButtons(false)
    }

    const handleMouseEnterIndicators = () => {
        setShowNavButtons(false)
    }

    const handleActive = (data)=>{
        setChipData(data)
    }

    const handleChange = (name, value) => {
        setFilterValues((prev) => ({
            ...prev,
            [name]: value
        }))

    };
        useEffect(()=>{
            const data = {
              groupId : filterValues?.group?.asset_group_id
            }
            dispatch(getAssetGroupIdAction())
            dispatch(getAssetTypeIdAction())
            if(filterValues.group !== null){
                dispatch(getAssetTypeIdAction(data))
            }
          },[filterValues.group,filterValues.open])


        const handleClear = ()=>{
            setFilterValues({...filterValues,group : null,type : null,open : false}) 
             setErrors({
                group:  null ,
                type:  null 
            })

            let payLoad = {
            searchString: pagination.searchString,
            pageCount: pagination.pageCount,
            numPerPage: pagination.numPerPage,
            condiditon : chipData === 'null' ? undefined : chipData
        }
        if(open === 'list'){
            dispatch(
                ListAssets(payLoad)   
            )
            dispatch(listUserCreationAction())
            dispatch(restrictNewCreationBasedOnPlanAction())
        }
        }

        const handleApply = ()=>{

            let payLoad = {
            searchString: pagination.searchString,
            pageCount: pagination.pageCount,
            numPerPage: pagination.numPerPage,
            condiditon : chipData === 'null' ? undefined : chipData,
            assetGroup : filterValues.group?.asset_group,
            assetType : filterValues.type?.asset_type
            }
        if(open === 'list'){
            dispatch(
                ListAssets(payLoad)   
            )
            dispatch(listUserCreationAction())
            dispatch(restrictNewCreationBasedOnPlanAction())
        }
        setFilterValues({...filterValues,open : false})
        }
    const assetCreate = UserRightsAuthorization(menuAccess[selectedRole], 'assets', 'can_create');
    return (
        <>
            <Helmet>
                <meta charSet="utf-8" />
                <title> {titleURL} | Assets </title>
            </Helmet>
            { open === 'list' && 
            <>
            <Card sx={{p: '20px', width: '100%', height: '100%'}}>
                <Grid 
                container
                display='flex'
                flexDirection='row'
                pb='15px'
                alignItems='center' 
                >
                    <Grid
                        size={{
                            lg: 5,
                            md: 5,
                            sm: 6,
                            xs: 8
                        }}>
                    <Typography variant='h5' align='left' p='0px 0px 15px 0px'>
                        {'Assets'}
                    </Typography>
                    </Grid>

                    <Grid
                        display='flex'
                        alignItems={'center'}
                        justifyContent='flex-end'
                        size={{
                            lg: 4,
                            md: 4,
                            sm: 4,
                            xs: 4
                        }}>
                                   <Stack direction='row' display='flex' alignItems='end' gap={1}>
                            {/* {restrictUserLocationCreation.create_assets === "enable" && */}
                             {assetCreate && (
                                <Tooltip
                                    title='Add'
                                    slots={{
                                        transition: Fade,
                                    }}
                                    slotProps={{
                                        transition: {
                                            timeout: 600,
                                        },
                                    }}
                                    placement='top'
                                >
                                    <IconButton onClick={handleopen}>
                                        <AddIcon />
                                    </IconButton>
                                </Tooltip>
                            )}
                            {/* } */}
                            <Tooltip
                                title='Add Custom Fields'
                                slots={{
                                    transition: Fade,
                                }}
                                slotProps={{
                                    transition: {
                                        timeout: 600,
                                    },
                                }}
                                placement='top'
                            >
                                <IconButton onClick={() => handlePropertyOpen('dynamicProp')}>
                                    <ReorderIcon />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                         <IconButton onClick={() => setFilterValues({...filterValues,open : true})} sx={{ paddingTop: '4px' }}>
                            <FilterAlt />
                        </IconButton>
                    <Chip 
                        label="All" 
                        color="primary" 
                        style={{marginRight:'20px'}}
                        variant={chipData === 'All' ? "filled" : "outlined"}
                        onClick={() => handleActive('All')} 
                    />
                    <Chip 
                        label="Active" 
                        color="primary" 
                        style={{marginRight:'20px'}}
                        variant={chipData === 'Active' ? "filled" : "outlined"}
                        onClick={() => handleActive('Active') }
                    />
                    <Chip 
                        label="Repair" 
                        color="primary" 
                        style={{marginRight:'20px'}}
                        variant={chipData === 'Repair' ? "filled" : "outlined"}
                        onClick={() => handleActive('Repair')} 
                    />
                    <Chip 
                        label="Due All This Week" 
                        color="primary" 
                        style={{marginRight:'20px'}}
                        variant={chipData === 'Due' ? "filled" : "outlined"}
                        onClick={() => handleActive('Due')} 
                    />
                    
                    
                 
                    </Grid>

                       <TextField
                        autoFocus={pagination.searchString ? true : false}
                        sx={{
                            borderRadius: 5,
                            backgroundColor: '#F4F7FE',
                            mr: '10px',
                            '& .MuiOutlinedInput-root': {
                                height: '42px',
                            },
                      '& fieldset': { border: 'none', borderRadius: 5 }
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position='start'>
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position='end'>
                                    <ClearIcon onClick={cancelSearch}
                                                sx={{cursor: 'pointer', visibility: pagination.searchString ? 'visible' : 'hidden'}}
                                    />
                                </InputAdornment>
                            )
                        }}
                        placeholder='Search'
                        value={pagination.searchString}
                        onChange={requestSearch}
                         />

                    

                </Grid>

                <Box sx={{width: '100%', height: '92%',}}>
                    <DataGrid
                    rows={asstList}
                    columns={columns}
                    hideScrollBar={true}
                    // checkboxSelection
                    pageSizeOptions={[20,50,100]}
                    rowCount={assetsList.numRows ?? 0}
                    
                    
                    
                    
                    sx={{
                        minHeight : maxBodyHeight,
                        maxHeight : maxBodyHeight,
                        '& .MuiDataGrid-root': {
                          overflowY: 'visible', // Applies visibility to the entire grid
                        },
                        '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb:hover': {
                          background: '#999',
                        },
                        '& .MuiDataGrid-virtualScroller::-webkit-scrollbar': {
                          width: '9px',   // 🔥 Change width here
                          height: '6px',
                           },
                      }}
                      paginationMode='server' paginationModel={{ page: pagination.pageCount, pageSize: pagination.numPerPage }} onPaginationModelChange={(model) => { if (model.page !== pagination.pageCount) { ((page) => pageChangeHandler(page))(model.page); } if (model.pageSize !== pagination.numPerPage) { ((size) => pageSizeChangeHandler(size))(model.pageSize); } }}
                    />
                </Box>                    
            </Card>

            <Modal 
                open = {dialogOpen}
                aria-labelledby = "image-modal-title"
                aria-describedby = "image-modal-description"
            >
                <Box
                    sx = {{
                        position : 'absolute',
                        top : '50%',
                        left : '50%',
                        transform : 'translate(-50%, -50%)',
                        bgcolor : 'background.paper',
                        boxShadow : 24,
                        alignContent : 'center',
                        p : 4,
                        maxWidth : '700px',
                        width : '90vw',
                        maxHeight : '700px',
                        height : '95vh'
                    }}
                >
                    <Tooltip title = 'Close'>
                        <IconButton
                            onClick = {handleDialogClose}
                            sx = {{ position : 'absolute', top : 8, right : 8, zIndex : 1}}
                        >
                            <Close />
                        </IconButton>
                    </Tooltip>
                
                    {
                        images.length > 0 && (                            
                            <Grid
                                sx = {{
                                    display : 'flex', 
                                    justifyContent : 'center',
                                    alignItems : 'center',
                                    overflow : 'hidden',
                                    width : '600px',
                                    height : '600px',
                                    margin : 'auto',
                                    padding : '0',
                                    flexDirection : 'column'
                                }}
                                onMouseEnter = {handleMouseEnterCarosel}
                                onMouseLeave = {handleMouseLeaveCarosel}
                                size={{
                                    lg: 12,
                                    md: 12,
                                    sm: 12,
                                    xs: 12
                                }}>
                                <Carousel
                                    index = {currentImageIndex}
                                    onChange = {(index) => setCurrentImageIndex(index)}
                                    indicators = {false}
                                    navButtonsAlwaysVisible
                                    autoPlay = {false}
                                    sx = {{
                                        width : '100%',
                                        height : '100%',
                                        display : 'flex',
                                        justifyContent : 'center',
                                        alignItems : 'center',
                                    }}
                                    navButtonsProps = {{
                                        style : {
                                            backgroundColor : 'rgba(255, 255, 255, 0.6)',
                                            color : '#000',
                                            visibility : showNavButtons ? 'visible' : 'hidden',
                                            opacity : showNavButtons ? 0.5 : 0,
                                            borderRadius : '50%',
                                        }
                                    }}
                                >
                                    {
                                        images.map((image) => (
                                            <img 
                                                src = {image.imageUrl} 
                                                style = {{
                                                    marginTop : '6px',
                                                    width : '600px', 
                                                    height : '600px',
                                                    objectFit : 'fit'
                                                }} 
                                            />
                                        ))
                                    }
                                </Carousel>

                                <Box 
                                    container 
                                    justifyContent = 'center' 
                                    sx={{
                                        position : 'absolute',
                                        top : '655px',
                                        left : '50%',
                                        transform : 'translateX(-50%)',
                                        width : 'auto',
                                    }}
                                    onMouseEnter = {handleMouseEnterIndicators}
                                    onMouseLeave = {handleMouseEnterCarosel}
                                >
                                    {
                                        images.map((image, index) => (
                                            <img 
                                                src = {image.imageUrl}
                                                onClick = {() => handleIndicatorClick(index)}
                                                style={{
                                                    width : '35px',
                                                    height : '35px',
                                                    objectFit : 'cover',
                                                    borderRadius : '50%',
                                                    border : index === currentImageIndex ? '2px solid blue' : '1px solid gray',
                                                    margin : '0 5px',
                                                    cursor : 'pointer',
                                                }}
                                            />
                                        ))
                                    }
                                </Box>
                            </Grid>
                        )
                    }
                </Box>
            </Modal>
            </>
            }
            {console.log(getAssetGroup,'getAsssdfddsfsetGroup',errors)}
            {open === 'detail' && <Asset_Details rowData={data} page={open} tableData={asstList} handleDetailClose={handleDetailClose} user_rights={menuAccess}/>}
            {open==='form' && 
                // <AssetManagement  rowData={data} handleFormClose={handleFormClose}   handleDetailClose={handleDetailClose} /> 
                <AssetNewForm status='new' handleFormClose={handleFormClose}/>
            }
            <Dialog open={open === 'dynamicProp'}>
                <NewDynamicProperties type='assets' formType='new' handleClose={handleFormClose}  />
            </Dialog>
            {/* <Dialog open={open === 'assetGrp'}>
                <AssetTypeForm handleClose={handleFormClose}/>
            </Dialog> */}
            {/* <QRCodeForAssets type='list' assetData={qrData} handleClose={handleQrClose}/> */}
            {qrOpen && qrData &&
            <AlertDialog
            labelType='qrCode' 
            list='asset'
            row_id={{data: {
                assetCode: qrData['Code'],
                ownerName: qrData['Asset Owner']
            }}}
            serialPopClose={handleQrClose}/>
            }
            <Dialog  style={{padding:'10px'}}  open={filterValues.open} onClose={!filterValues.open} maxWidth = 'xs' fullWidth >
                <Grid container flexDirection={'column'} gap={3} p={5}>
                    <Grid>
                <Autocomplete
    options={getAssetGroup.data}
    fullWidth
    getOptionLabel={(option) => option?.asset_group || ''}
    value={filterValues.group || null}     // FIXED
    onChange={(event, value) => handleChange('group', value)}  // value = selected object
    renderInput={(params) => (
        <TextField
            {...params}
            fullWidth
            label=' Asset Group'
            variant='filled'
            error={Boolean(errors.group)}
            helperText={errors.group || ""}
        />
    )}
/>

                </Grid> 
                <Grid> 
                <Autocomplete
                    options={getAssetType.data}
                    fullWidth
                    getOptionLabel={(option) => option?.asset_type || ''}
                    value={filterValues.type || null}
                    onChange={(event, value) => handleChange('type',value)}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            // required={}
                            fullWidth
                            label={'Asset Type'}
                            variant='filled'
                            error={Boolean(errors.type)}
                            helperText={errors.type || ""}
                        />
                    )}
                />
                </Grid>

                <Grid size={12}>
                                        <Grid container spacing={3} display='flex' justifyContent='center'>
                                            <Grid>
                                                <Button
                                                    variant = 'contained'
                                                    color = 'error'
                                                    onClick = {() => handleClear()}
                                                >
                                                    Clear
                                                </Button>
                                            </Grid>
                
                                            <Grid>
                                                <Button
                                                    variant = 'contained'
                                                    onClick = {() => handleApply()}
                                                >
                                                    Apply
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    </Grid>
            </Dialog>
        </>
    );
}



export default Assets