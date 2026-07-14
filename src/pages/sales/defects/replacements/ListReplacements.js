import { useDispatch, useSelector } from "react-redux"
import ReplacementForm from './ReplacementForm'
import { useContext, useEffect, useState } from "react"
import CreateNewButtonContext from 'context/CreateNewButtonContext'
import { Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Typography } from "@mui/material"
import MaterialTable, { MTableToolbar } from "utils/SafeMaterialTable"
import { headerStyle, cellStyle, maxBodyHeight } from "utils/pageSize"
import CommonSearch from 'utils/commonSearch'
import { listReplacementAction, setSearchReplacementAction, getSearchReplacementAction, deleteDefectCollectionAction, setReplacementByIdAction } from 'redux/actions/defects_actions'
import FilterAltIcon from "@mui/icons-material/FilterAlt"
import AddIcon from '@mui/icons-material/Add'
import moment from "moment"
import FilterDialog from '../filterDialog'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { ExportCsv, ExportPdf } from "@material-table/exporters"
import CloseIcon from '@mui/icons-material/Close'
import { useCustomFetch } from "utils/useCustomFetch"
import API_URLS from "utils/customFetchApiUrls"
import apiCalls from "utils/apiCalls"
import { setInvoiceTempAction } from "redux/actions/vendor_actions"
import InvoiceDialog from '../../sales/InvoiceDialog'
import { sendMail } from "redux/actions/sales_actions"
import ReplacementLandingPage from "./ReplacementLandingPage"
import { deleteReplacementAction, setDefectCollectedSentProductAction } from "../../../../redux/actions/defects_actions"
import { useLocation } from "react-router-dom"
import { setSearchByCustomerSupplierDataAction } from "../../../../redux/actions/customer_actions"
import {
    getStickyTableOptions,
    stickyTableComponents,
  } from '../../../../utils/stickyTableLayout';
import { getMenuAccessAction } from "redux/actions/rbac_actions"
import { getsessionStorage } from "pages/common/login/cookies"
import { UserRightsAuthorization } from "@crema/utility/helper/UserRightsHelper"

function ListReplacements() {
    
    const { headerLocationId, setLoaderStatusHandler, setModalTypeHandler, commoncookie } = useContext(CreateNewButtonContext)
    const dispatch = useDispatch()
    const storage = getsessionStorage()
    const selectedRole = storage.role_name
    const customFetch = useCustomFetch()
    const location = useLocation()
    const {
        defectReducers: { listReplacement },
        rbacReducer: { menuAccess }
    } = useSelector(state => state)

    const [view, setView] = useState('list')
    const [formStatus, setFormStatus] = useState('new')
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
    const [invoiceOpen, setInvoiceOpen] = useState(false)
    const [custData, setCustData] = useState()
    const [invoice, setInvoice] = useState()
    const [replaceDate, setReplaceDate] = useState()
    const [saleId, setSaleId] = useState()
    const [collectionItem, setCollectionItem] = useState()
    const [replacementType, setReplacementType] = useState('')
    const [deleteConfirmationDialogOpen, setDeleteConfirmationDialogOpen] = useState(false)

    const exportPayload = {
        page: 0,
        numPerPage: listReplacement.numRows,
        searchString: pagination.searchString,
        from: filter.fromDate,
        to: filter.toDate,
        min_price: filter.min_price,
        max_price: filter.max_price,
        brand: filter.brand,
        category: filter.category,
        location_id: headerLocationId,
        type: location.pathname === '/sales/issueReplacement' ? 'issueReplacement' : 'collectReplacement'
    }

    useEffect(() => {
        dispatch(setSearchReplacementAction({ data: [], numRows: 0 }))
        setView('list')
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
            type: location.pathname === '/sales/issueReplacement' ? 'issueReplacement' : 'collectReplacement'
        }
        dispatch(listReplacementAction(payload, commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler))
    }, [pagination.page, pagination.numPerPage, headerLocationId, location])

    useEffect(() => {
        dispatch(setSearchByCustomerSupplierDataAction([]))
        dispatch(setDefectCollectedSentProductAction([]))
        dispatch(getMenuAccessAction(selectedRole))
    }, [])

    const handleClose = async(fromSubmit, fromLandingPage) => {
        setView('list')
        setFormStatus('new')
        await setRowData(null)
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
                location_id: headerLocationId,
                type: location.pathname === '/sales/issueReplacement' ? 'issueReplacement' : 'collectReplacement'
            }
            dispatch(listReplacementAction(payload, commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler))
        }
        if(fromLandingPage){
            dispatch(setReplacementByIdAction([]))
        }
    }

    const requestSearch = (event) => {
        const value = event.target.value
        setPagination((prev) => ({ ...prev, searchString: value }))

        const payload = {
            page: 0,
            numPerPage: pagination.numPerPage,
            searchString: value,
            from: filter.fromDate,
            to: filter.toDate,
            min_price: filter.min_price,
            max_price: filter.max_price,
            brand: filter.brand,
            category: filter.category,
            location_id: headerLocationId,
            type: location.pathname === '/sales/issueReplacement' ? 'issueReplacement' : 'collectReplacement'
        }
        if(value.length >= 3 || value.length === 0) {
            dispatch(setSearchReplacementAction({ data: [], numRows: 0 }))
        }
        dispatch(getSearchReplacementAction(payload, commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler))
    }

    const cancelSearch = () => {
        const value = ''
        setPagination((prev) => ({ ...prev, searchString: value }))

        const payload = {
            page: 0,
            numPerPage: pagination.numPerPage,
            searchString: value,
            from: filter.fromDate,
            to: filter.toDate,
            min_price: filter.min_price,
            max_price: filter.max_price,
            brand: filter.brand,
            category: filter.category,
            location_id: headerLocationId,
            type: location.pathname === '/sales/issueReplacement' ? 'issueReplacement' : 'collectReplacement'
        }
        dispatch(setSearchReplacementAction({ data: [], numRows: 0 }))
        dispatch(getSearchReplacementAction(payload, commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler))
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
            category: '',
            type: location.pathname === '/sales/issueReplacement' ? 'issueReplacement' : 'collectReplacement'
        }
        dispatch(listReplacementAction(payload, commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler))
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
            location_id: headerLocationId,
            type: location.pathname === '/sales/issueReplacement' ? 'issueReplacement' : 'collectReplacement'
        }
        dispatch(listReplacementAction(payload, commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler))
        setFilterOpen(false)
    }

    const handleEdit = async (rowData) => {
        await setRowData(rowData)
        setFormStatus('edit')
        setView('form')
    }

    const handleInvoiceClose = () => {
        setReplacementType('')
        setInvoiceOpen(false)
        setView('list')
    }
    
    const invoiceDialogSendMail = () => {
        const data = {
            appConfigData: custData,
            custData,
            invoice_number: invoice,
            sales_items: collectionItem,
            email: custData?.email,
            no_sms: true,
            posSale: true,
            soDate: replaceDate,
            sale_id: saleId,
        }
        dispatch(sendMail(data, setLoaderStatusHandler))
        setReplacementType('')
        setInvoiceOpen(false)
    }

    const handleInvoiceClick = async (rowData) => {
        const id = rowData.replacement_id
        const type = rowData.record_kind
        if(type === 'CUSTOMER') {
            const { data } = await customFetch(API_URLS.CUSTOMER_REPLACEMENT_TEMPLATE(id), 'GET')
            await apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler,
                dispatch(setInvoiceTempAction(data))
            )
        }
        else {
            const { data } = await customFetch(API_URLS.VENDOR_REPLACEMENT_TEMPLATE(id), 'GET')
            await apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler,
                dispatch(setInvoiceTempAction(data))
            )
        }
        setInvoiceOpen(true)
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
        setReplaceDate(moment(rowData?.replacement_date).format('DD/MM/YYYY'))
        setCollectionItem(rowData?.replacement_items)
        setSaleId(rowData?.sale_id)
        setReplacementType(type)
    }

    const handleDeleteDialogConfirmation = (event, rowData) => {
        event.stopPropagation()
        setRowData(rowData)
        setDeleteConfirmationDialogOpen(true)
    }

    const handleDeleteConfirmation = () => {
        dispatch(deleteReplacementAction(rowData.record_kind, rowData.replacement_id, async(response) => {
            if(response.status === 200){
                setDeleteConfirmationDialogOpen(false)
                setView('list')
                setRowData(null)
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
                    type: location.pathname === '/sales/issueReplacement' ? 'issueReplacement' : 'collectReplacement'
                }
                dispatch(listReplacementAction(payload, commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler))
            }
        }))
    }

    const issueReplacementCreate = UserRightsAuthorization(menuAccess[selectedRole], 'defects__issue_replacement', 'can_create')
    const issueReplacementEdit = UserRightsAuthorization(menuAccess[selectedRole], 'defects__issue_replacement', 'can_edit')
    const issueReplacementDelete = UserRightsAuthorization(menuAccess[selectedRole], 'defects__issue_replacement', 'can_delete')
    const issueReplacementExport = UserRightsAuthorization(menuAccess[selectedRole], 'defects__issue_replacement', 'can_export')

    const collectReplacementCreate = UserRightsAuthorization(menuAccess[selectedRole], 'defects__collect_replacement', 'can_create')
    const collectReplacementEdit = UserRightsAuthorization(menuAccess[selectedRole], 'defects__collect_replacement', 'can_edit')
    const collectReplacementDelete = UserRightsAuthorization(menuAccess[selectedRole], 'defects__collect_replacement', 'can_delete')
    const collectReplacementExport = UserRightsAuthorization(menuAccess[selectedRole], 'defects__collect_replacement', 'can_export')

    const createBtn = location.pathname === '/sales/issueReplacement' ? issueReplacementCreate : collectReplacementCreate
    const editBtn = location.pathname === '/sales/issueReplacement' ? issueReplacementEdit : collectReplacementEdit
    const deleteBtn = location.pathname === '/sales/issueReplacement' ? issueReplacementDelete : collectReplacementDelete
    const exportBtn = location.pathname === '/sales/issueReplacement' ? issueReplacementExport : collectReplacementExport

    const columns = [
        {
            field: 'replacement_date',
            title: 'Replacement Date',
            render: (rowData) => moment(rowData.replacement_date).format('DD/MM/YYYY')
        },
        {
            field: 'invoice_number',
            title: 'Replacement #',
            render: (rowData) => (
                <div
                    style={{
                        textDecoration: 'none',
                        cursor: 'pointer',
                        color: '#03adfc',
                        display: 'inline-block',
                        padding: '5px'
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleInvoiceClick(rowData);
                    }}
                >
                    {rowData.invoice_number}
                </div>
            )
        },
        {
            field: 'record_kind',
            title: 'Type'
        },
        {
            field: 'company_name',
            title: 'Customer / Vendor Name'
        },
        (editBtn || deleteBtn) && {
            field: 'actions',
            title: 'Action',
            render: (rowData) => (
                <>
                    {
                        editBtn &&
                        <IconButton onClick={() => handleEdit(rowData)}>
                            <EditIcon />
                        </IconButton>
                    }

                    {
                        deleteBtn &&
                        <IconButton onClick={(event) => handleDeleteDialogConfirmation(event, rowData)}>
                            <DeleteIcon />
                        </IconButton>
                    }
                </>
            )
        }
    ]

    return (
        <>
            {
                view === 'list' &&
                <>
                    <MaterialTable
                        title={location.pathname === '/sales/issueReplacement' ? 'Issue Replacement' : 'Collect Replacement'}
                        columns={columns}
                        data={listReplacement.data}
                        totalCount={listReplacement.numRows}
                        options={getStickyTableOptions({
                            headerStyle,
                            cellStyle,
                             bodyOffset: 200,
                            options:{
                                search: false,
                            paging: true,
                            exportButton: exportBtn ? true : false,
                            filtering: false,
                            actionsColumnIndex: -1,
                            tableLayout: "auto",
                            toolbar: true,
                            pageSizeOptions: [20, 50, 100],
                            pageSize: pagination.numPerPage,
                            // minBodyHeight: maxBodyHeight,
                            // maxBodyHeight: maxBodyHeight,
                            exportMenu: exportBtn ? [
                                {
                                    label: 'Export PDF',
                                    exportFunc: (cols, data) => {
                                        dispatch(listReplacementAction(exportPayload, null, null, setModalTypeHandler, setLoaderStatusHandler, (exportData) => {
                                            const finalData = exportData.data.map(d => ({ ...d, replacement_date: moment(d.replacement_date).format('DD/MM/YYYY') }))
                                            ExportPdf(cols, finalData, 'Replacements')
                                        }))
                                    }
                                },
                                {
                                    label: 'Export CSV',
                                    exportFunc: (cols, data) => {
                                        dispatch(listReplacementAction(exportPayload, null, null, setModalTypeHandler, setLoaderStatusHandler, (exportData) => {
                                            const finalData = exportData.data.map(d => ({ ...d, replacement_date: moment(d.replacement_date).format('DD/MM/YYYY') }))
                                            ExportCsv(cols, finalData, 'Replacements')
                                        }))
                                    }
                                }
                            ] : []
                            },
                        })}
                        onRowClick={(event, rowData) => {
                            setRowData(rowData)
                            setView('landingPage')
                        }}
                        page={pagination.page}
                        onPageChange={(page) => setPagination((prev) => ({ ...prev, page: page }))}
                        onRowsPerPageChange={(size) => setPagination((prev) => ({ ...prev, numPerPage: size }))}
                        components={{
                            ...stickyTableComponents,
                            Toolbar: (props) => (
                                <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                                    <div style={{ width: '100%' }}>
                                        <MTableToolbar { ...props } />
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
                            createBtn ? {
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
            {
                view === 'form' &&
                <ReplacementForm
                    status={formStatus}
                    handleClose={handleClose}
                    editData={rowData}
                    handleInvoiceClick={handleInvoiceClick}
                    pagination={pagination}
                />
            }
            <InvoiceDialog 
                open={invoiceOpen}
                handleClose={handleInvoiceClose}
                tableHandleClose={() => {}}
                custData={custData}
                setInvoice={invoice}
                soDate={replaceDate}
                createMail={()=> invoiceDialogSendMail()}
                custType={replacementType === 'CUSTOMER' ? 'CUSTOMERREPLACEMENT' : 'VENDORREPLACEMENT'}
            />
            {
                view === 'landingPage' &&
                <ReplacementLandingPage data={rowData} handleClose={handleClose} />
            }
            <Dialog open={deleteConfirmationDialogOpen}>
                <DialogTitle>
                    <Grid container spacing={3} display='flex' justifyContent='space-between' alignItems='center' textAlign='center'>
                        <Grid>
                            <Typography variant='h6'>Delete Confirmation</Typography>
                        </Grid>
    
                        <Grid>
                            <IconButton onClick={() => setDeleteConfirmationDialogOpen(false)}>
                                <CloseIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                </DialogTitle>
    
                <DialogContent>
                    <Typography variant='h6'>
                        {`Are you sure want to delete this replacement ${rowData?.record_kind === 'CUSTOMER' ? 'issued' :  rowData?.record_kind === 'VENDOR' ? 'collected' : ''} ?`}
                    </Typography>
                </DialogContent>
    
                <DialogActions>
                    <Grid container spacing={3} display='flex' justifyContent='flex-end'>
                        <Grid>
                            <Button variant='contained' color='error' onClick={() => setDeleteConfirmationDialogOpen(false)}>Cancel</Button>
                        </Grid>
    
                        <Grid>
                            <Button variant='contained' onClick={handleDeleteConfirmation}>Delete</Button>
                        </Grid>
                    </Grid>
                </DialogActions>
            </Dialog>
        </>
    );

}

export default ListReplacements
