import MaterialTable, { MTableToolbar } from "utils/SafeMaterialTable";
import { Button, Card, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormGroup, Grid, IconButton, Stack, Tooltip, Typography, TablePagination } from "@mui/material";
import CreateNewButtonContext from "context/CreateNewButtonContext";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFormDetailsAction, getRenewalsAction, getRenewalSearchAction, setRenewalSearchAction } from "redux/actions/renewals_actions";
import CommonSearch from "utils/commonSearch";
import { maxBodyHeight, headerStyle, cellStyle } from "utils/pageSize";
import VisibilityIcon from '@mui/icons-material/Visibility';
import RenewalDetails from "./RenewalDetails";
import AddIcon from "@mui/icons-material/Add";
import RenewalsNewForm from "./RenewalsNewForm";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";
import ServiceDueTable from "pages/assets/ServiceDue/ServiceDueTable";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteRenewalsAction } from "redux/actions/asset_actions";
import { getStickyTableOptions, stickyTableComponents } from "utils/stickyTableLayout";
import { getsessionStorage } from 'pages/common/login/cookies';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import apiCalls from 'utils/apiCalls';

function Renewals(props) {

    const dispatch = useDispatch()
    const location = useLocation();
    const storage = getsessionStorage();
    const selectedRole = storage?.role_name;
    const {
        RenewalsReducers: { renewals,getTotalDetails },
        rbacReducer: { menuAccess = {} },
    } = useSelector(state => state)
    const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext)

    const [rowData, setRowData] = useState([])
    const [editData, setEditData] = useState()
    const [deleteId, setDeleteId] = useState(null)
    const [dialogConfirm, setDialogConfirm] = useState(null)
    const [renewal,setRenewal] = useState([])

    const [show, setShow] = useState(null)
    const [formOpen, setFormOpen] = useState(false)
    const [edit, setEdit] = useState(false)
    const [pagination, setPagination] = useState({
        numPerPage: props.type === 'assetsRenewals' ? 5 : 20,
        pageCount: 0,
        searchString: '', 
    })

    useEffect(() => {
        if (!selectedRole) return;
        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler, dispatch(getMenuAccessAction(selectedRole)));
    }, [selectedRole, dispatch]);

    useEffect(() => {
        if(props?.type === 'assetsRenewals') {
            const payload = {
                searchString : pagination.searchString,
                pageCount : pagination.pageCount,
                numPerPage : pagination.numPerPage,
                asset_id : props?.id,
            }
            dispatch(getRenewalsAction(payload))

        }
        else {
            if(show === null && formOpen === false){
                let type = location.pathname === '/assets/insurance' ? 'Insurance' : location.pathname === '/assets/warranty' ? 'Warranty' : location.pathname === '/assets/subscription' ? 'Subscription' : 'null'
                 if(type !== 'null'){
                    dispatch(getRenewalsAction({...pagination,type : type}, setModalTypeHandler, setLoaderStatusHandler))
                }

                dispatch(getFormDetailsAction(type.toLowerCase()))
            }
        }
    }, [pagination.numPerPage, pagination.pageCount, show, formOpen, props?.index,location.pathname])

    const handlePageChange = (page) => {
        setPagination((prev) => ({ ...prev, pageCount: page }))
    }

    const handlePageSizeChange = (size) => {
        setPagination((prev) => ({
            ...prev,
            numPerPage: size,
            pageCount: 0
        }))
    }

    const handleDetailClick = (rowData) => {
        setRowData(rowData)
        setShow('detail')
    }

    useEffect(() => {
        setRenewal([])
        const row = renewals?.data        
        if(row?.length > 0){
            const finalData = row.map((row ,index) => ({
                index : index ,
                ...row ,
            }))
            setRenewal(finalData)
        }
    } ,[renewals])

    const handleClose = () => {
        setShow(null)
        setFormOpen(false)
        setEdit(false)
        setEditData(null)
        setRowData([])
    }

    const handleFormOpen = () => {
        setEdit(false)
        setEditData(null)
        setRowData([])
        setFormOpen(true)
    }

    const requestSearch = (event) => {
        const val = event.target.value
        setPagination((prev) => ({ ...prev, searchString: val }))

        dispatch(setRenewalSearchAction({ numRows: 0, data: [] }))

            let type = location.pathname === '/assets/insurance' ? 'Insurance' : location.pathname === '/assets/warranty' ? 'Warranty' : location.pathname === '/assets/subscription' ? 'Subscription' : 'null'

        const payload = {
            pageCount: 0,
            numPerPage: pagination.numPerPage,
            searchString: val,
            type : type
        }

        const asset_by_payload = {
            searchString : val,
            numPerPage : pagination.numPerPage,
            pageCount : 0,
            asset_id : props?.id,
            type : type
        }
        

        if(props?.type === 'assetsRenewals') {
            dispatch(getRenewalSearchAction(asset_by_payload, setModalTypeHandler, setLoaderStatusHandler))
        }
        else {
            dispatch(getRenewalSearchAction(payload, setModalTypeHandler, setLoaderStatusHandler))
        }
    }
    
            let path = location.pathname === '/assets/insurance' ? 'Insurance' : location.pathname === '/assets/warranty' ? 'Warranty' : location.pathname === '/assets/subscription' ? 'Subscription' : 'null'

    const cancelSearch = () => {

        let type = location.pathname === '/assets/insurance' ? 'Insurance' : location.pathname === '/assets/warranty' ? 'Warranty' : location.pathname === '/assets/subscription' ? 'Subscription' : 'null'

        setPagination((prev) => ({ ...prev, searchString: '' }))

        dispatch(setRenewalSearchAction({ numRows: 0, data: [] }))

        const payload = {
            pageCount: pagination.pageCount,
            numPerPage: pagination.numPerPage,
            searchString: '',
            type :type
        }

        const asset_by_payload = {
            searchString : '',
            numPerPage : pagination.numPerPage,
            pageCount : pagination.pageCount,
            asset_id : props?.id,
            type : type
        }
        if(type !== 'null'){

            if(props?.type === 'assetsRenewals') {
                dispatch(getRenewalSearchAction(asset_by_payload, setModalTypeHandler, setLoaderStatusHandler))
            }
            else {
                dispatch(getRenewalSearchAction(payload, setModalTypeHandler, setLoaderStatusHandler))
            }
        }
    }

    useEffect(()=>{
        setShow(null)
        setFormOpen(false)
        setEdit(false)
        setEditData(null)
        setRowData([])
        cancelSearch() 
    },[path])

    // useEffect(() => {
    //     dispatch(getMenuAccessAction());
    // }, [dispatch]);

    const handleDelete = async()=>{
        const payload = {
            type : path
        }

       await dispatch(deleteRenewalsAction(payload,deleteId))
        cancelSearch()
        
        setDialogConfirm(false)
    }

    const chips = [
        {id:1,label: location.pathname === '/assets/insurance' ? 'Asset Value' : location.pathname === '/assets/warranty' ? 'Total Warranty' : location.pathname === '/assets/subscription' ? 'Count' : ''
            ,value :  location.pathname === '/assets/insurance' ? getTotalDetails[0]?.total_asset_value : location.pathname === '/assets/warranty' ? getTotalDetails[0]?.total_count : location.pathname === '/assets/subscription' ? getTotalDetails[0]?.subscription_count : '0'  },
        {id:2,label: location.pathname === '/assets/insurance' ? 'Total Insured' : location.pathname === '/assets/warranty' ? 'Regular ' : location.pathname === '/assets/subscription' ? 'Auto Renewal' : '', value :  location.pathname === '/assets/insurance' ? getTotalDetails[0]?.total_insured_value : location.pathname === '/assets/warranty' ? getTotalDetails[0]?.regular_count : location.pathname === '/assets/subscription' ? getTotalDetails[0]?.auto_renew_count : '0' },
        {id:3,label: location.pathname === '/assets/insurance' ? 'Yearly Premium' : location.pathname === '/assets/warranty' ? 'Extended ' : location.pathname === '/assets/subscription' ? ' Due This Week' : '',value :  location.pathname === '/assets/insurance' ?getTotalDetails[0]?.total_yearly_premium : location.pathname === '/assets/warranty' ? getTotalDetails[0]?.extended_count : location.pathname === '/assets/subscription' ? getTotalDetails[0]?.due_this_week_count : '0'},
        {id:4,label:location.pathname === '/assets/insurance' ? 'Total Coverage' : location.pathname === '/assets/warranty' ? 'Total Warranty Amount' : location.pathname === '/assets/subscription' ? 'Total Subscription Amount' : '',value :  location.pathname === '/assets/insurance' ? getTotalDetails[0]?.coverage_percentage : location.pathname === '/assets/warranty' ? getTotalDetails[0]?.total_warranty_amount : location.pathname === '/assets/subscription' ? getTotalDetails[0]?.total_subscription_amount : '0'},
    ]
     const assetTitle =
        location.pathname === '/assets/subscription' ? 'Title' : 'Asset'
        
     const titleName =
        location.pathname === '/assets/subscription' ? 'subscription_name' : 'asset_name' 

    const renewalCreate =
        location.pathname === '/assets/insurance'
            ? UserRightsAuthorization(menuAccess[selectedRole], 'renewals__insurance', 'can_create')
            : location.pathname === '/assets/warranty'
            ? UserRightsAuthorization(menuAccess[selectedRole], 'renewals__warranty', 'can_create')
            : location.pathname === '/assets/subscription' ? UserRightsAuthorization(menuAccess[selectedRole], 'renewals__subscription', 'can_create')
            :   true;

    const renewalEdit =
        location.pathname === '/assets/insurance'
            ? UserRightsAuthorization(menuAccess[selectedRole], 'renewals__insurance', 'can_edit')
            : location.pathname === '/assets/warranty'
            ? UserRightsAuthorization(menuAccess[selectedRole], 'renewals__warranty', 'can_edit')
            : location.pathname === '/assets/subscription' ? UserRightsAuthorization(menuAccess[selectedRole], 'renewals__subscription', 'can_edit') : true;

    const renewalDelete =
        location.pathname === '/assets/insurance'
            ? UserRightsAuthorization(menuAccess[selectedRole], 'renewals__insurance', 'can_delete')
            : location.pathname === '/assets/warranty'
            ? UserRightsAuthorization(menuAccess[selectedRole], 'renewals__warranty', 'can_delete')
            : location.pathname === '/assets/subscription' ? UserRightsAuthorization(menuAccess[selectedRole], 'renewals__subscription', 'can_delete') : true;
    const columns = [
        {
            field: titleName,
            title: assetTitle
        },
        {
            field: 'type',
            title: 'Type'
        },
        {
            field: 'start_date',
            title: 'Start Date',
            render: (rowData) => {
                if(moment(rowData.start_date).format('DD/MM/YYYY') === 'Invalid date'){
                    return '-'
                }
                else{
                    return moment(rowData.start_date).format('DD/MM/YYYY')
                }
            }
        },
        {
            field: 'end_date',
            title: 'End Date',
            render: (rowData) => {
                if(moment(rowData.end_date).format('DD/MM/YYYY') === 'Invalid date'){
                    return '-'
                }
                else{
                    return moment(rowData.end_date).format('DD/MM/YYYY')
                }
            }
        },
        {
            field: 'image',
            title: 'Attachment',
            render: (rowData) => {
                const imageUrl = rowData?.image?.[0]?.imageUrl;

                return imageUrl ? (
                <img 
                    src={imageUrl}
                    alt="Attachment"
                    style={{ width: 60, height: 60, objectFit: 'cover' }}
                />
                ) : (
                '-'
                );
            }
            },
    //    ...( props?.type !== 'assetsRenewals' ? [
    //     {
    //         field: 'action',
    //         title: 'View',
    //         render: (rowData) => (
    //             <Tooltip title='View'>
    //                 <IconButton onClick={() => handleDetailClick(rowData)}>
    //                     <VisibilityIcon />
    //                 </IconButton>
    //             </Tooltip>
    //         )
    //     }] : [])

        {
            field: 'action',
            title: 'Actions',
            render: (rowData) => {
                return (
                    <div style={{ display: 'flex' }}>
                        {renewalEdit && (
                        <Tooltip title="Edit">
                            <IconButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEdit(true);
                                    setEditData(rowData);
                                    setFormOpen(true);
                                }}
                            >
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                        )}
                        {renewalDelete && (
                        <Tooltip title="Delete">
                            <IconButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    path === 'Insurance' ? setDeleteId(rowData.insurance_id) : setDeleteId(rowData.id)
                                    setDialogConfirm(true)
                                }}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                         )}
                    </div>
                )
            }
        },

    ]

    return (
        <>
            {
                show === null && formOpen === false &&
                <>
                <Grid container >
                {  props.type !== 'assetsRenewals' &&
                    chips.map((chip)=> (
                    <Grid
                        size={{
                            lg: 3,
                            md: 3,
                            xs: 6
                        }}>
                         <Stack
                            direction="row"
                            spacing={0}
                            justifyContent="flex-start" sx={{ p: "3px", flexWrap: "wrap", overflowX: "hidden" }}>

                <Chip
                    key={chip.id}
                    sx={{
                    cursor: "pointer",
                    fontWeight: "normal",
                    flex: `calc(${100 / 4}% - 8px)`,
                    height: "50px",
                    backgroundColor: 'white',
                    border: "1px solid #ddd", 
                    color: "#000000ff",
                    padding: "4px 8px",
                    // width : '400px',
                    boxShadow: "none", 
                    transform: "none", 
                    borderRadius: "7px",
                    position: "relative",
                    zIndex: 1,
                    transition: "none",
                    marginRight: "8px",
                    marginBottom: "8px",
                    }}
                    label={
                    <Stack spacing={0} alignItems="center">
                        <Typography
                        variant="body2"
                        sx={{ fontSize: "12px", fontWeight: "bold" }}
                        letterSpacing ='0.5px'
                        >
                        {chip.label}
                        </Typography>
                        <Typography
                        variant="caption"
                        sx={{
                            // fontSize: "11px",
                            lineHeight: "10px",
                            // fontWeight: "700",
                            marginTop: "6px",
                            color: "#000000ff",
                            letterSpacing :'0.5px'
                        }}
                        >
                        {
                            location.pathname === '/assets/insurance' && chip.label === 'Total Coverage'
                                ? `${(parseFloat(chip.value || 0) * 100).toFixed(0)}%`
                            
                            : location.pathname === '/assets/warranty' &&
                                (chip.label === 'Total Warranty' ||
                                chip.label === 'Regular ' ||
                                chip.label === 'Extended ')
                                ? parseInt(chip.value || 0)
                            
                            : location.pathname === '/assets/subscription' &&
                                (chip.label === 'Count' ||
                                chip.label === 'Auto Renewal' ||
                                chip.label === ' Due This Week')
                                ? parseInt(chip.value || 0)
                            
                            : parseFloat(chip.value || 0).toFixed(2)
                        }
                        </Typography>
                    </Stack>
                    }
                />

                </Stack>

                </Grid>

                    ))
                }

                </Grid>

                <MaterialTable
                    // style = { props.type === 'assetsRenewals' ? {margin : '22px'} : {height: 'calc(100vh - 100px)' , overflow:'hidden'} }
                    //  style={{margin:'12px'}} 
                    title = {location.pathname  === '/assets/insurance' ? 'Insurance' : location.pathname === '/assets/warranty' ? 'Warranty' : location.pathname === '/assets/subscription' ? 'Subscription' : '' }
                    data = {renewal}
                    columns = {columns}
                    totalCount = {renewals.numRows}
                    options = {getStickyTableOptions({

                        bodyOffset:280,
                        headerStyle,
                        options:{
                            cellStyle,
                            filtering: false,
                            actionsColumnIndex: -1,
                            paging: true,
                            pageSize: pagination.numPerPage,
                            pageSizeOptions: [20,50,100],
                            search: false,
                            toolbar:true
                            // maxBodyHeight: maxBodyHeight,
                            // minBodyHeight:maxBodyHeight,
                            // overflowY:'visible'
                        }
                    })}
                    page = {pagination.pageCount}
                    onPageChange = {(page) => handlePageChange(page)}
                    onRowsPerPageChange = {(size) => handlePageSizeChange(size)}
                    onRowClick = {props.type !== 'assetsRenewals' ? (event, rowData) => handleDetailClick(rowData) : null}
                    components = {{
                        ...stickyTableComponents,
                        Toolbar: (props) => (
                        <div>
                            <div style={{display: 'flex', width: '100%', alignItems: 'center'}}>
                            <div style={{width: '100%'}}>
                                <MTableToolbar {...props} />
                            </div>

                            <div>
                                <CommonSearch 
                                searchVal = {pagination.searchString}
                                cancelSearch = {cancelSearch}
                                requestSearch = {requestSearch}
                                />
                            </div>
                            </div>
                        </div>
                        ),
                        Pagination: (props) => (
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    alignItems: "center",
                                    padding: "8px 16px",
                                }}
                            >
                                <TablePagination
                                    component="div"
                                    count={renewals?.numRows || 0}
                                    page={pagination.pageCount}
                                    rowsPerPage={pagination.numPerPage}
                                    rowsPerPageOptions={[20, 50, 100]}
                                    onPageChange={(event, newPage) => handlePageChange(newPage)}
                                    onRowsPerPageChange={(event) =>
                                        handlePageSizeChange(parseInt(event.target.value, 10))
                                    }
                                    labelRowsPerPage="Rows per page:"
                                />
                            </div>
                        ),
                    }}
                    actions = {[
                         ...(props.type !== 'assetsRenewals' && renewalCreate
                            ? [
                        {
                            icon : () => <AddIcon />,
                            tooltip : 'Add',
                            isFreeAction : true,
                            onClick : handleFormOpen
                        },
                    ] : []),
                    ]}
                />

                </>
            }
            {
                show === 'detail' &&
                <RenewalDetails
                handleClose = {handleClose}
                data = {rowData}
                tableData = {renewal}
                />
            }
            {
                (location.pathname === '/assets/insurance' && formOpen) &&
                <RenewalsNewForm
                key={`insurance-${edit ? editData?.insurance_id : 'create'}`}
                form="Insurance"
                status = { edit ? 'edit' : 'create'}
                renewal = {true}
                handleClose = {handleClose}
                isActive = {true}
                data = {rowData}
                insurance_id = {editData?.insurance_id}
                />
            }
            {
                (location.pathname === '/assets/warranty' && formOpen) &&
                <RenewalsNewForm
                key={`warranty-${edit ? editData?.warranty_id : 'create'}`}
                form="Warranty"
                status = { edit ? 'edit' : 'create'}
                renewal = {true}
                handleClose = {handleClose}
                path =  'warranty'
                isActive  = {true}
                data = {rowData}
                warranty_id = {editData?.id}
                
                />
            }
            {
                (location.pathname === '/assets/subscription' && formOpen) &&
                <RenewalsNewForm
                key={`subscription-${edit ? editData?.id : 'create'}`}
                status = { edit ? 'edit' : 'create'}
                renewal = {true}
                form = 'Subscription'
                handleClose = {handleClose}
                isActive = {true}
                data = {editData || rowData}
                subscription_id = {editData?.id}
                />
            }
            {
                (location.pathname === '/assets/serviceDue' && formOpen) &&
                <ServiceDueTable/>
            }
            <Dialog
                   open={dialogConfirm}
                   onClose={!dialogConfirm}
                   aria-labelledby='alert-dialog-title'
                   aria-describedby='alert-dialog-description'
                 >
                   <DialogTitle id='alert-dialog-title'>{'Delete ?'}</DialogTitle>
                   <Grid container>
                     <Grid
                         size={{
                             lg: 6,
                             md: 6
                         }}>
                       <DialogContent style={{width: 500}}>
                         <DialogContentText
                           id='alert-dialog-description'
                           sx={{color: 'warning.main'}}
                         >
                           Are you sure you want to delete ?
                         </DialogContentText>
                       </DialogContent>
                     </Grid>
                   </Grid>
           
                   <DialogActions>
                     <Button onClick={() => setDialogConfirm(false)} color='secondary'>
                       Cancel
                     </Button>
                     <Button
                       onClick={handleDelete}
                       color='primary'
                       autoFocus
                     >
                       Delete
                     </Button>
                   </DialogActions>
                 </Dialog>
        </>
    );
}

Renewals.propTypes = {
    type : PropTypes.string,
    id : PropTypes.number,
    index : PropTypes.number
}

export default Renewals
