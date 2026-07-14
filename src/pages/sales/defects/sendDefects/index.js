import { useDispatch, useSelector } from "react-redux"
import SendDefectsForm from './sendDefectsForm'
import { useContext, useEffect, useState } from "react"
import CreateNewButtonContext from 'context/CreateNewButtonContext'
import { Box, Button, Card, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, IconButton, Typography } from "@mui/material"
import MaterialTable, { MTableToolbar } from "utils/SafeMaterialTable"
import { headerStyle, cellStyle, maxBodyHeight } from "utils/pageSize"
import CommonSearch from 'utils/commonSearch'
import { listDefectCollectionAction, setSearchCollectedDefectsAction, getSearchCollectedDefectsAction, resetSendDefectsByIdAction } from 'redux/actions/defects_actions'
import FilterAltIcon from "@mui/icons-material/FilterAlt"
import AddIcon from '@mui/icons-material/Add'
import moment from "moment"
import FilterDialog from '../filterDialog'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CloseIcon from '@mui/icons-material/Close';
import { ExportCsv, ExportPdf } from "@material-table/exporters"
import { deleteSendDefectsAction, getSendDefectsAction, setDefectCollectedSentProductAction } from "../../../../redux/actions/defects_actions"
import {useCustomFetch} from 'utils/useCustomFetch';
import { setInvoiceTempAction } from "redux/actions/vendor_actions"
import InvoiceDialog from '../../sales/InvoiceDialog';
import API_URLS from "../../../../utils/customFetchApiUrls"
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import ReplacementForm from "../replacements/ReplacementForm"
import ReplacementLandingPage from "../replacements/ReplacementLandingPage"
import { sendMail } from "redux/actions/sales_actions"
import apiCalls from "utils/apiCalls"
import { setSearchByCustomerSupplierDataAction } from "../../../../redux/actions/customer_actions"
import { getsessionStorage } from "pages/common/login/cookies"
import { getMenuAccessAction } from "redux/actions/rbac_actions"
import { UserRightsAuthorization } from "@crema/utility/helper/UserRightsHelper"

function SendDefects() {

    const { headerLocationId, setLoaderStatusHandler, setModalTypeHandler, commoncookie } = useContext(CreateNewButtonContext)
    const dispatch = useDispatch()
    const storage = getsessionStorage()
    const selectedRole = storage.role_name
    const {
        defectReducers: { getSendDefects },
        rbacReducer: { menuAccess }
    } = useSelector(state => state)

    const [view, setView] = useState('list')
    const [formStatus, setFormStatus] = useState('new')
     const [Open, setOpen] = useState(false);
    const [pagination, setPagination] = useState({
        page: 0,
        numPerPage: 20,
        searchString: ''
    })
    const [filter, setFilter] = useState({
        fromDate: null,
        toDate: null,
        min_price: '',
        max_price: '',
        brand: '',
        category: ''
    })
    const [filterOpen, setFilterOpen] = useState(false)
    const [rowData, setRowData] = useState(null)
    const [deleteConfirmation, setDeleteConfirmation] = useState(false)
    const [custType, setCustType] = useState('SENDDEFECT')
    const [custData, setCustData] = useState()
    const [invoice, setInvoice] = useState()
    const [collectionItem, setcollectionItem] = useState()
    const [Date, setDate] = useState()
    const [sale_id, setSaleid] = useState()
     const customFetch = useCustomFetch();

    const exportPayload = {
        page: 0,
        numPerPage: getSendDefects?.numRows,
        searchString: '',
        from: null,
        to: null,
        min_price: '',
        max_price: '',
        brand: '',
        category: '',
        location_id: headerLocationId,
    }

    const fetchSendDefects = () => {
        const payload = {
            page: pagination.page,
            numPerPage: pagination.numPerPage,
            searchString: pagination.searchString,
            from: filter.fromDate,
            to: filter.toDate,
            min_price: filter.min_price,
            max_price: filter.max_price,
            brand: filter.brand,
            category: filter.category,
            location_id: headerLocationId
        }

        dispatch(
            getSendDefectsAction(
                payload,
                commoncookie,
                headerLocationId,
                setModalTypeHandler,
                setLoaderStatusHandler
            )
        )
    }

    useEffect(() => {
        if (pagination.searchString === undefined) return;

        const timer = setTimeout(() => {
            const payload = {
                page: pagination.page,
                numPerPage: pagination.numPerPage,
                searchString: pagination.searchString,
                from: filter.fromDate,
                to: filter.toDate,
                min_price: filter.min_price,
                max_price: filter.max_price,
                brand: filter.brand,
                category: filter.category,
                location_id: headerLocationId,
            };

            dispatch(setSearchCollectedDefectsAction({ data: [], numRows: 0 }));
            dispatch(getSendDefectsAction(payload, commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler));
        }, 500);

        return () => clearTimeout(timer);
    }, [pagination.searchString, pagination.page, pagination.numPerPage, headerLocationId]);


    useEffect(() => {
        fetchSendDefects()
    }, [pagination.page, pagination.numPerPage, headerLocationId])

    useEffect(() => {
        dispatch(setSearchByCustomerSupplierDataAction([]))
        dispatch(setDefectCollectedSentProductAction([]))
        dispatch(getMenuAccessAction(selectedRole))
    }, [])


    const handleClose = (fromSubmit) => {
        setView('list')
        setRowData(null)
        dispatch(resetSendDefectsByIdAction([]))
        if (fromSubmit) {
            setFilter((prev) => ({ ...prev, fromDate: null, toDate: null }))
            setPagination((prev) => ({ ...prev, page: 0, searchString: '' }))
            const payload = {
                page: 0,
                numPerPage: pagination.numPerPage,
                searchString: '',
                from: null,
                to: null,
                min_price: '',
                max_price: '',
                brand: '',
                category: '',
                location_id: headerLocationId
            }

            dispatch(getSendDefectsAction(payload, commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler))
        }
    }

    const requestSearch = (event) => {
        const value = event.target.value;
        setPagination((prev) => ({ ...prev, searchString: value, page: 0 }));
    };

    const cancelSearch = () => {
        const value = ''
        setPagination((prev) => ({ ...prev, searchString: value }))

        const payload = {
            page: 0,
            numPerPage: pagination.numPerPage,
            searchString: '',
            from: filter.fromDate,
            to: filter.toDate,
            min_price: filter.min_price,
            max_price: filter.max_price,
            brand: filter.brand,
            category: filter.category,
            location_id: headerLocationId
        }
        dispatch(setSearchCollectedDefectsAction({ data: [], numRows: 0 }))
        dispatch(getSearchCollectedDefectsAction(payload, commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler))
    }

    const handleFormOpen = () => {
        setFormStatus('new')
        setView('form')
    }

    const handleFilterOpen = () => {
        setFilterOpen(true)
    }

    const handleClearFilter = () => {
        setFilter((prev) => ({ ...prev, fromDate: null, toDate: null, min_price: '', max_price: '', brand: '', category: '' }))
        setFilterOpen(false)

        const payload = {
            page: 0,
            numPerPage: pagination.numPerPage,
            searchString: pagination.searchString,
            from: null,
            to: null,
            location_id: headerLocationId,
            min_price: '',
            max_price: '',
            brand: '',
            category: ''
        }
        dispatch(getSendDefectsAction(payload, commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler))
    }

    const handleApplyFilter = () => {
        const payload = {
            page: 0,
            numPerPage: pagination.numPerPage,
            searchString: pagination.searchString,
            from: filter.fromDate,
            to: filter.toDate,
            min_price: filter.min_price,
            max_price: filter.max_price,
            brand: filter.brand,
            category: filter.category,
            location_id: headerLocationId
        }
        dispatch(getSendDefectsAction(payload, commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler))
        setFilterOpen(false)
    }

    const handleEdit = async(rowData) => {
        await setRowData(rowData)
        setView('form')
        setFormStatus('edit')
    }

    const handleDelete = (rowData) => {
        setRowData(rowData)
        setDeleteConfirmation(true)
    }

    const handleConfirmDelete = async(id) => {
        await dispatch(deleteSendDefectsAction(id))
        fetchSendDefects()
        setDeleteConfirmation(false)
    }

       const handleCloseDialog =()=>{
        setView('list')
        setOpen(false)
        const payload = {
            page: 0,
            numPerPage: pagination.numPerPage,
            searchString: pagination.searchString,
            from: filter.fromDate,
            to: filter.toDate,
            min_price: filter.min_price,
            max_price: filter.max_price,
            brand: filter.brand,
            category: filter.category,
            location_id: headerLocationId
        }
        dispatch(getSendDefectsAction(payload, commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler))
    }

    const invoiceFunction = async (event, data) => {
        event.stopPropagation()
        setCustType('SENDDEFECT')
        //const response = await this.customFetch(`/defects/senddefectsTemp/${data.supplier_id}`);
        const postBody = {
            // "receiving_id": data.receiving_id,
            "send_id": data.send_id
        }
        const response = await customFetch(
            API_URLS.SEND_DEFECTS_TEMPLATE(data.supplier_id),
            'POST',
            postBody
        );
       const getData = response.data || [];
        const finalData = getData.length > 0 ? getData[0] : {};
        dispatch(setInvoiceTempAction(getData))
        setOpen(true)
        setCustData({
            company_name: data?.company_name,
            first_name: data?.full_name,
            city: data?.city,
            email: data?.email,
            state: data?.state,
            area: data?.area,
            phone_number: data?.phone_number,
            zip: data?.zip
        })
        setInvoice(data?.send_defect_number)
        setDate(moment(data?.send_date).format('DD/MM/YYYY'))
        setcollectionItem(data?.send_defects_tems)
        setSaleid(data?.sale_id)
    };

    const handleReplacementClick = async(rowData) => {
        await setRowData(rowData)
        setView('replacementForm')
    }

    const handleReplacementOpen = async (rowData) => {
        const id = rowData.replacement_id
        const { data } = await customFetch(API_URLS.VENDOR_REPLACEMENT_TEMPLATE(id), 'GET')
        await apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(setInvoiceTempAction(data))
        )
        setCustType('VENDORREPLACEMENT')
        setOpen(true)
        setCustData({
            company_name: rowData?.company_name,
            first_name: rowData?.full_name,
            city: rowData?.city,
            email: rowData?.email,
            state: rowData?.state,
            area: rowData?.area,
            phone_number: rowData?.phone_number,
            zip: rowData?.zip
        })
        setInvoice(rowData?.invoice_number)
        setDate(moment(rowData?.replacement_date).format('DD/MM/YYYY'))
        setcollectionItem(rowData?.replacement_items)
        setSaleid(rowData?.sale_id)
    }

    const invoiceDialogSendMail =()=>{
        const data = {
            appConfigData: custData,
            custData,
            invoice_number: invoice,
            sales_items: collectionItem,
            email: custData?.email,
            no_sms: true,
            posSale: true,
            //sales_payments: this.state.sales_payments,
            soDate: Date,
            sale_id: sale_id,
        };
        dispatch(sendMail(data, setLoaderStatusHandler));
        handleCloseDialog()
    }

    const StyledChip = ({ label, count, color, isSelected, onClick }) => (
        <Box
            // onClick={onClick}
            sx={{
                backgroundColor: color,
                color: '#fff',
                borderRadius: '6px',
                px: 1.2, 
                py: 0.3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1px',
                fontWeight: 500,
                boxShadow: isSelected ? 3 : 1,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                border: isSelected ? '1.5px solid #000' : '1.5px solid transparent',
                transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                transition: 'all 0.2s ease-in-out',
                minWidth: 80,
                height: 36, 
            }}
        >
            <Typography
                variant="body2"
                sx={{
                fontSize: '0.62rem', 
                fontWeight: 600,
                lineHeight: 1.2,
                textAlign: 'center',
                }}
            >
                {label}
            </Typography>
    
            <Typography
                variant="body2"
                sx={{
                fontWeight: 500,
                fontSize: '0.65rem', 
                opacity: 0.9,
                textAlign: 'center',
                }}
            >
                {count}
            </Typography>
        </Box>
      )

    const sendDefectsCreate = UserRightsAuthorization(menuAccess[selectedRole], 'defects__send_defects', 'can_create')
    const sendDefectsEdit = UserRightsAuthorization(menuAccess[selectedRole], 'defects__send_defects', 'can_edit')
    const sendDefectsDelete = UserRightsAuthorization(menuAccess[selectedRole], 'defects__send_defects', 'can_delete')
    const sendDefectsExport = UserRightsAuthorization(menuAccess[selectedRole], 'defects__send_defects', 'can_export')
    const collectReplacementCreate = UserRightsAuthorization(menuAccess[selectedRole], 'defects__collect_replacement', 'can_create')

    const columns = [
        {
            field: 'send_date',
            title: 'Send Date',
            render: (rowData) => moment(rowData.send_date).format('DD/MM/YYYY')
        },
        {
            field: 'send_defect_number',
            title: 'Send Defect #',
             render: (rowData) => (<>
                     
                      <div
                      
                        style={{
                           textDecoration: 'none',
                            cursor: 'pointer',
                            color: '#03adfc',
                            display: 'inline-block',
                        }}
                        onClick={(event) => {
                           // alert('hiiiii')
                          invoiceFunction(event, rowData);
                        //   this.handleSmsMailConfiguration();
                        //   setTimeout(() => {
                        //     this.setState({
                        //       rowPopup: {...this.state.rowPopup, open: false,sale_status:rowData?.sale_status},
                        //     });
                        //   }, 0);
                          event.stopPropagation();
                        
                        }}
                      >{ rowData.send_defect_number }
                        {/* <Typography variant='h5' sx={{fontWeight: 'bold', fontSize: '11px'}}> { rowData.so_number } </Typography> */}
                      </div> 
                      
                      </>
                    ),
        },
        {
            field: 'courier_number',
            title: 'Courier Number'
        },
        {
            field: 'company_name',
            title: 'Vendor'
        },
        {
            field: 'send_defects_tems',
            title: 'Quantity',
            render: (rowData) => rowData.send_defects_tems.reduce((sum, item) => sum + item.actual_quantity, 0)
        },
        {
            field: 'total',
            title: 'Total',

        },
        {
            field: 'status',
            title: 'Status',
            render: (rowData) => {
                const textColor = rowData.status === 'Initiated' ? '#3B81B3' : '#285C1C'
                return(
                    <div
                        style={{
                            color: textColor,
                            fontWeight: cellStyle.fontWeight,
                            fontSize: cellStyle.fontSize,
                        }}
                        >
                        {rowData.status}
                    </div>
                )
            }
        },
        {
            field: 'delivery_status',
            title: 'Delivery Status',
            render: (rowData) => (
                <div
                    style={{
                        color: '#285C1C',
                        fontWeight: cellStyle.fontWeight,
                        fontSize: cellStyle.fontSize,
                    }}
                    >
                    {rowData.delivery_status}
                </div>
            )
        },
        (sendDefectsEdit || sendDefectsDelete || collectReplacementCreate) && {
            field: 'actions',
            title: 'Actions',
            render: (rowData) => (
                <>
                    {
                        sendDefectsEdit &&
                        <IconButton disabled={rowData.send_defects_tems.some(d => d.replacement_id !== null)} onClick={() => handleEdit(rowData)}>
                            <EditIcon />
                        </IconButton>
                    }

                    {
                        sendDefectsDelete &&
                        <IconButton 
                            disabled={rowData.send_defects_tems.some(d => d.replacement_id !== null)} 
                            onClick={(event) => {
                                event.stopPropagation()
                                handleDelete(rowData)
                            }}
                        >
                            <DeleteIcon />
                        </IconButton>
                    }

                    {
                        collectReplacementCreate &&
                        <IconButton disabled={rowData.status === 'Fully Replaced'} onClick={() => handleReplacementClick(rowData)}>
                            <PublishedWithChangesIcon />
                        </IconButton>
                    }
                </>
            )
        }
    ]

    return (
        <>
            <InvoiceDialog
             open={Open}
             handleClose={() =>handleCloseDialog()}
             tableHandleClose={() => {}}
             custType={custType}
             invoice={invoice}
             soDate={Date}
             createMail={()=>invoiceDialogSendMail()}
           />
            {
                view === 'list' &&
                <>
                    <MaterialTable
                        title='Send Defect'
                        columns={columns}
                        data={Array.isArray(getSendDefects?.data) ? getSendDefects.data : []}
                        totalCount={Number(getSendDefects?.numRows) || 0}
                        options={{
                            headerStyle,
                            cellStyle,
                            search: false,
                            paging: true,
                            exportButton: sendDefectsExport ? true : false,
                            filtering: false,
                            actionsColumnIndex: -1,
                            pageSizeOptions: [20, 50, 100],
                            pageSize: pagination.numPerPage,
                            minBodyHeight: maxBodyHeight,
                            maxBodyHeight: maxBodyHeight,
                            exportMenu: sendDefectsExport ? [
                                {
                                    label: 'Export PDF',
                                    exportFunc: (cols, data) => {
                                        dispatch(getSendDefectsAction(exportPayload, commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler, (exportData) => {
                                            const formattedData = exportData.data.map(row => ({
                                                ...row,
                                                send_date: moment(row.send_date).format('DD/MM/YYYY'),
                                                quantity: row.send_defects_tems.reduce((sum, item) => sum + item.actual_quantity, 0)
                                            }));

                                            const exportCols = [
                                                { field: "send_date", title: "Send Date" },
                                                { field: 'send_defect_number', title: 'Send Defect #'},
                                                { field: "courier_number", title: "Courier Number" },
                                                { field: "company_name", title: "Vendor" },
                                                { field: "quantity", title: "Quantity" },
                                                { field: "total", title: "Total" }
                                            ];

                                            ExportPdf(exportCols, formattedData, "Send Defects Report")
                                        }))
                                    }
                                },
                                {
                                    label: 'Export CSV',
                                    exportFunc: (cols, data) => {
                                        dispatch(getSendDefectsAction(exportPayload, commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler, (exportData) => {
                                            const formattedData = exportData.data.map(row => ({
                                                ...row,
                                                send_date: moment(row.send_date).format('DD/MM/YYYY'),
                                                quantity: row.send_defects_tems.reduce((sum, item) => sum + item.actual_quantity, 0)
                                            }));

                                            const exportCols = [
                                                { field: "send_date", title: "Send Date" },
                                                { field: 'send_defect_number', title: 'Send Defect #'},
                                                { field: "courier_number", title: "Courier Number" },
                                                { field: "company_name", title: "Vendor" },
                                                { field: "quantity", title: "Quantity" },
                                                { field: "total", title: "Total" }
                                            ];

                                            ExportCsv(exportCols, formattedData, "Send Defects Report")
                                        }))
                                    }
                                }
                            ] : []
                        }}
                        page={pagination.page}
                        onPageChange={(page) => setPagination((prev) => ({ ...prev, page: page }))}
                        onRowsPerPageChange={(size) => setPagination((prev) => ({ ...prev, numPerPage: size }))}
                        components={{
                            Toolbar: (props) => (
                                <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                                    <div style={{ width: '50%' }}>
                                        <MTableToolbar {...props} />
                                    </div>
                                    
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 16,
                                        }}
                                    >
                                        <StyledChip
                                            label='Total Quantity'
                                            count={getSendDefects?.consolidated?.[0]?.total_quantity ?? 0}
                                            color='#3B81B3'
                                            isSelected={false}
                                        />

                                        <StyledChip
                                            label='Total Replaced'
                                            count={getSendDefects?.consolidated?.[0]?.total_replaced ?? 0}
                                            color='#285C1C'
                                            isSelected={false}
                                        />

                                        <StyledChip
                                            label='Total Due'
                                            count={getSendDefects?.consolidated?.[0]?.total_due ?? 0}
                                            color='#D32F2F'
                                            isSelected={false}
                                        />
                                    </div>

                                    <div>
                                        <CommonSearch
                                            searchVal={pagination.searchString}
                                            requestSearch={requestSearch}
                                            cancelSearch={cancelSearch}
                                        />
                                    </div>
                                </div>
                            )
                        }}
                        actions={[
                            sendDefectsCreate ? {
                                icon: () => <AddIcon />,
                                tooltip: 'Add',
                                isFreeAction: true,
                                onClick: () => handleFormOpen()
                            } : null,
                            {
                                icon: () => <FilterAltIcon />,
                                tooltip: 'Filter',
                                isFreeAction: true,
                                onClick: () => handleFilterOpen()
                            }
                        ]}
                        onRowClick={(event, rowData) => {
                            setRowData(rowData)
                            setView('landingPage')
                        }}
                    />

                    <FilterDialog
                        open={filterOpen}
                        data={filter}
                        setFilter={setFilter}
                        handleClearFilter={handleClearFilter}
                        handleApplyFilter={handleApplyFilter}
                    />
                </>
            }
            <Dialog
                open={deleteConfirmation}
                onClose={() => {
                    setDeleteConfirmation(false);
                }}
            >
                <Grid container>
                    <Grid
                        size={{
                            lg: 6,
                            md: 6
                        }}>
                        <DialogContent style={{ width: 500 }}>
                            <DialogContentText
                                id='alert-dialog-description'
                                sx={{ color: 'warning.main' }}
                            >
                                Are you sure you want to Delete?
                            </DialogContentText>
                        </DialogContent>
                    </Grid>

                </Grid>

                <DialogActions>
                    <Grid container spacing={3} display='flex' justifyContent='flex-end'>
                        <Grid>
                            <Button color='error'
                                onClick={() => setDeleteConfirmation(false)}>
                                Cancel
                            </Button>
                        </Grid>

                        <Grid>
                            <Button
                                onClick={() =>
                                    handleConfirmDelete(rowData.send_id)
                                }
                                color='primary'
                                autoFocus
                            >
                                Delete
                            </Button>
                        </Grid>
                    </Grid>
                </DialogActions>
            </Dialog>
            {
                view === 'form' &&
                <SendDefectsForm
                    status={formStatus}
                    handleClose={handleClose}
                    fetchSendDefects={fetchSendDefects}
                    editData={rowData}
                    invoiceFunction={invoiceFunction}
                />
            }
            {
                view === 'replacementForm' &&
                <ReplacementForm
                    type='collectReplacement'
                    data={rowData}
                    handleClose={handleClose}
                    handleReplacementOpen={handleReplacementOpen}
                />
            }
            {
                view === 'landingPage' &&
                <ReplacementLandingPage
                    type='sendDefect'
                    data={rowData}
                    handleClose={handleClose}
                    setView={setView}
                    setFormStatus={setFormStatus}
                    handleDelete={handleDelete}
                />
            }
        </>
    );

}

export default SendDefects

